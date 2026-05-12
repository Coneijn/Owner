import { NextRequest } from 'next/server';
import { chatEmitter } from '@/lib/chat-events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return new Response('Falta el userId', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Enviamos un comentario inicial para abrir y mantener la conexión
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Función que "empuja" el mensaje al navegador cuando hay una novedad
      const listener = (message: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
      };

      // Escuchamos solo los eventos destinados a este usuario
      const eventName = `message-${userId}`;
      chatEmitter.on(eventName, listener);

      // Si el usuario cierra el navegador o cambia de página, limpiamos la conexión
      req.signal.addEventListener('abort', () => {
        chatEmitter.off(eventName, listener);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}