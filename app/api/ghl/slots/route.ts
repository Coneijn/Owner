import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD
  const timezone = searchParams.get('timezone') || 'America/Chicago'; // Ajusta a la zona horaria del negocio

  if (!dateStr) {
    return NextResponse.json({ error: 'Parámetro date es requerido' }, { status: 400 });
  }

  const ghlApiKey = process.env.GHL_ACCESS_TOKEN;
  const calendarId = process.env.GHL_CALENDAR_ID;

  // Fallback / Entorno local si no están configuradas las llaves
  if (!ghlApiKey || !calendarId) {
    return NextResponse.json({
      slots: ['10:00', '11:00', '13:30', '15:00', '16:30']
    });
  }

  try {
    // Calculamos el inicio y fin del día en milisegundos
    const startOfDay = new Date(`${dateStr}T00:00:00Z`).getTime();
    const endOfDay = new Date(`${dateStr}T23:59:59Z`).getTime();

    const ghlRes = await fetch(
      `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startOfDay}&endDate=${endOfDay}&timezone=${encodeURIComponent(timezone)}`,
      {
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          Version: '2021-07-28',
        },
        cache: 'no-store',
      }
    );

    if (!ghlRes.ok) {
      throw new Error(`GHL slots API error: ${ghlRes.statusText}`);
    }

    const data = await ghlRes.json();
    
    // GHL responde con un objeto cuyas llaves son las fechas y dentro un arreglo 'slots' en ISO
    // Ej: { "2026-09-07": { slots: ["2026-09-07T10:00:00-05:00", ...] } }
    let rawSlots: string[] = [];
    if (data[dateStr]?.slots) {
      rawSlots = data[dateStr].slots;
    } else {
      // Si la respuesta viene plana en data.slots
      rawSlots = data.slots || [];
    }

    // Convertimos cada ISO slot al formato de visualización "HH:MM" (o "10:00 AM")
    const formattedSlots = rawSlots.map((isoStr: string) => {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    return NextResponse.json({ slots: formattedSlots });
  } catch (err: any) {
    console.error('Error fetching GHL slots:', err);
    return NextResponse.json({ error: 'Error al consultar disponibilidad' }, { status: 500 });
  }
}