import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { propertyId, propertyTitle, propertyAddress, date, timeSlot, name, phone, email } = await req.json();

    if (!name || !phone || !date || !timeSlot || !propertyId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const ghlApiKey = process.env.GHL_ACCESS_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    const ghlCalendarId = process.env.GHL_CALENDAR_ID; // Calendar ID específico para tours

    if (!ghlApiKey || !ghlLocationId) {
      console.warn('GHL credentials no configuradas en env.');
      return NextResponse.json({ success: true, mock: true });
    }

    // 1. Crear o actualizar contacto en GHL
    const contactRes = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: ghlLocationId,
        name,
        phone,
        email,
        tags: ['tour-presencial', 'landing-lead'],
        customFields: [
          { key: 'propiedad_interes', field_value: propertyTitle },
          { key: 'direccion_propiedad', field_value: propertyAddress },
        ],
      }),
    });

    const contactData = await contactRes.json();
    const contactId = contactData?.contact?.id;

    // 2. Crear la cita (Appointment) en GHL
    if (ghlCalendarId && contactId) {
      const startTime = new Date(`${date}T${timeSlot}:00`).toISOString();

      await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendarId: ghlCalendarId,
          locationId: ghlLocationId,
          contactId,
          startTime,
          title: `Visita Presencial: ${propertyAddress}`,
          appointmentStatus: 'new',
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error agendando en GHL:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}