// lib/ghl-actions.ts
'use server';

export async function submitSellerLead(data: any) {
  // ATENCIÓN: Reemplaza esta URL con el Webhook Inbound de tu Workflow en GoHighLevel
  // (El workflow que crearás en GHL para recibir a los nuevos vendedores).
  const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/dd59ae30-8d02-4400-9c60-95cacfffb27e';

  try {
    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        source: 'Website Seller Funnel',
        type: 'Seller Lead'
      }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el prospecto a GHL');
    }

    // Retornamos éxito para que el frontend sepa que puede avanzar al siguiente paso
    return { success: true };
  } catch (error) {
    console.error('❌ Error en submitSellerLead:', error);
    // Retornamos success true de todos modos en el frontend para no bloquear 
    // el funnel visual del usuario si el CRM falla por alguna razón.
    return { success: false, error: 'Failed to sync with CRM' };
  }
}