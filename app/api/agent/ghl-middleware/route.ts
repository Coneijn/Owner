import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Usa tu import de prisma habitual[cite: 2]

// 1. Diccionario de Permisos: Mapeamos qué agente puede acceder a qué Pipeline
const AGENT_PIPELINES: Record<string, string> = {
  // Asegúrate de pegar aquí el ID exacto que sacaste de la URL
  'lucy': 'b4oTDMo50e30xAPQnSSQ',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 2. Extraemos todos los campos, incluyendo el location_id y la operation
    const { 
      api_key, 
      agent_name, 
      location_id, 
      contact_id, 
      pipeline_id, 
      operation, 
      ghl_payload 
    } = body;

    // 3. Validación de credenciales base
    if (api_key !== process.env.OPENCLAW_API_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!agent_name || !contact_id || !operation) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (agent_name, contact_id u operation)' }, 
        { status: 400 }
      );
    }

    // 4. Validación de seguridad del Pipeline
    const allowedPipeline = AGENT_PIPELINES[agent_name.toLowerCase()];

    if (allowedPipeline !== pipeline_id) {
      // Bloqueo y registro en AuditLog[cite: 1]
      await prisma.auditLog.create({
        data: {
          action: 'AGENT_BLOCKED',
          entityType: 'GHL_MIDDLEWARE',
          entityId: contact_id,
          contactName: agent_name,
          details: `Bloqueo: El agente '${agent_name}' intentó hacer un '${operation}' en el pipeline '${pipeline_id}' sin autorización.`
        }
      });

      return NextResponse.json(
        { error: 'Acceso denegado a este pipeline para este agente.' },
        { status: 403 }
      );
    }

    // 5. Enrutamiento según el tipo de Operación solicitada
    let ghlResponse;

    if (operation === 'update') {
      // --- LÓGICA DE MODIFICACIÓN (ESCRITURA) ---
      
      // Inyectamos el locationId al payload antes de enviarlo a GHL
      const finalPayload = {
        ...ghl_payload,
        locationId: location_id
      };

      ghlResponse = await fetch(`https://services.leadconnectorhq.com/contacts/${contact_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalPayload)
      });

      // Registro de éxito
      await prisma.auditLog.create({
        data: {
          action: 'AGENT_UPDATED_CONTACT',
          entityType: 'GHL_MIDDLEWARE',
          entityId: contact_id,
          contactName: agent_name,
          details: `Modificación exitosa por el agente '${agent_name}'.`
        }
      });

    } else if (operation === 'query') {
      // --- LÓGICA DE CONSULTA (LECTURA) ---
      
      ghlResponse = await fetch(`https://services.leadconnectorhq.com/contacts/${contact_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      });

      // Registro de éxito
      await prisma.auditLog.create({
        data: {
          action: 'AGENT_QUERIED_CONTACT',
          entityType: 'GHL_MIDDLEWARE',
          entityId: contact_id,
          contactName: agent_name,
          details: `Consulta de datos exitosa por el agente '${agent_name}'.`
        }
      });

    } else {
      // --- SI MANDAN ALGO RARO ---
      return NextResponse.json(
        { error: 'Tipo de operación no válida. Usa "query" o "update".' }, 
        { status: 400 }
      );
    }

    // 6. Retornar la respuesta final
    const ghlData = await ghlResponse.json();
    
    // Si GHL rechaza la petición (por ejemplo, el token es inválido o el contacto no existe)
    if (!ghlResponse.ok) {
       return NextResponse.json(
         { error: 'Error en la respuesta de GoHighLevel', details: ghlData }, 
         { status: ghlResponse.status }
       );
    }

    return NextResponse.json({ success: true, data: ghlData });

  } catch (error: any) {
    console.error("Error en Middleware GHL:", error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}