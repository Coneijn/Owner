import { NextResponse } from 'next/server';

interface TourPayload {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  zipCode?: string;
  date: string;
  timeSlot: string;
  name: string;
  phone: string;
  email?: string;
  // ✍️ Consentimiento
  optIn?: boolean;
  optInAt?: string;
  optInText?: string;
  optInLang?: 'es' | 'en';
}

export async function POST(req: Request) {
  try {
    const body: TourPayload = await req.json();

    const {
      propertyId,
      propertyTitle,
      propertyAddress,
      zipCode,
      date,
      timeSlot,
      name,
      phone,
      email,
      optIn,
      optInAt,
      optInText,
      optInLang,
    } = body;

    // --- 1. Validaciones básicas ---
    if (!name || !phone || !date || !timeSlot || !propertyId || !propertyAddress) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // --- 2. Validación de consentimiento (obligatorio) ---
    if (optIn !== true) {
      return NextResponse.json(
        { error: 'Se requiere aceptar el aviso de privacidad para agendar la visita.' },
        { status: 400 }
      );
    }

    const optInTimestamp = optInAt ? new Date(optInAt) : new Date();
    if (isNaN(optInTimestamp.getTime())) {
      return NextResponse.json({ error: 'optInAt inválido' }, { status: 400 });
    }

    // --- 3. Credenciales ---
    const ghlApiKey = process.env.GHL_ACCESS_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    const ghlCalendarId = process.env.GHL_CALENDAR_ID;

    if (!ghlApiKey || !ghlLocationId) {
      console.warn('GHL credentials no configuradas en env.');
      return NextResponse.json({ success: true, mock: true });
    }

    // Dirección completa con zip code
    const fullAddress = zipCode
      ? `${propertyAddress}, ${zipCode}`
      : propertyAddress;

    // --- 4. Crear o actualizar contacto en GHL ---
    const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ghlApiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: ghlLocationId,
        name,
        phone,
        ...(email ? { email } : {}),
        tags: [
          'tour-presencial',
          'landing-lead',
          'opt-in-aceptado', // ✅ tag para segmentación legal
        ],
        customFields: [
          { key: 'propiedad_interes', field_value: propertyTitle },
          { key: 'direccion_propiedad', field_value: fullAddress },
          { key: 'zip_code', field_value: zipCode ?? '' },
          { key: 'opt_in', field_value: 'true' },
          { key: 'opt_in_at', field_value: optInTimestamp.toISOString() },
          { key: 'opt_in_text', field_value: optInText ?? '' },
          { key: 'opt_in_lang', field_value: optInLang ?? 'es' },
        ],
      }),
    });

    if (!contactRes.ok) {
      const errText = await contactRes.text();
      console.error('Error GHL contact upsert:', errText);
      return NextResponse.json(
        { error: 'No se pudo crear/actualizar el contacto en GHL' },
        { status: 502 }
      );
    }

    const contactData = await contactRes.json();
    const contactId = contactData?.contact?.id;

    if (!contactId) {
      return NextResponse.json({ error: 'GHL no devolvió contactId' }, { status: 502 });
    }

    // --- 5. Crear la cita (Appointment) en GHL ---
    let appointmentId: string | null = null;

    if (ghlCalendarId) {
      // Construye startTime de forma segura (asume hora local del servidor)
      const startDate = new Date(`${date}T${timeSlot}:00`);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json({ error: 'Fecha u hora inválida' }, { status: 400 });
      }
      const startTime = startDate.toISOString();

      const apptRes = await fetch(
        'https://services.leadconnectorhq.com/calendars/events/appointments',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghlApiKey}`,
            Version: '2021-07-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            calendarId: ghlCalendarId,
            locationId: ghlLocationId,
            contactId,
            startTime,
            title: `Visita Presencial: ${fullAddress}`,
            appointmentStatus: 'new',
            // Opcional: notes con evidencia del consentimiento
            notes: `Opt-in aceptado (${optInLang ?? 'es'}) el ${optInTimestamp.toISOString()}`,
          }),
        }
      );

      if (!apptRes.ok) {
        const errText = await apptRes.text();
        console.error('Error GHL appointment:', errText);
        // No bloqueamos la respuesta: el contacto ya se creó
        return NextResponse.json(
          { success: true, warning: 'contact_created_appointment_failed' },
          { status: 207 }
        );
      }

      const apptData = await apptRes.json();
      appointmentId = apptData?.id ?? null;
    }

    return NextResponse.json({
      success: true,
      contactId,
      appointmentId,
      optInAt: optInTimestamp.toISOString(),
    });
  } catch (error) {
    console.error('Error agendando en GHL:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}