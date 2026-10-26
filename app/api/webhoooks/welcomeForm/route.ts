import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Recibe los datos enviados desde WelcomeModal.tsx
    const body = await request.json();

    // Asegúrate de definir WEBHOOK_URL en tu archivo .env
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Configuración de webhook faltante' },
        { status: 500 }
      );
    }

    // Reenvía la información a la URL de destino final
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Error al procesar la salida hacia el webhook externo');
    }

    return NextResponse.json({ success: true, message: 'Datos enviados' });
  } catch (error) {
    console.error('Error en el endpoint del webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}