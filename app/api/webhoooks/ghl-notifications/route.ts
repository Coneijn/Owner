import { NextResponse } from 'next/server';

// Usamos una variable global para mantener las conexiones SSE activas
const globalForSSE = global as unknown as { sseClients?: Set<ReadableStreamDefaultController> };
const clients = globalForSSE.sseClients || new Set();
if (process.env.NODE_ENV !== 'production') globalForSSE.sseClients = clients;

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
    },
    cancel(controller) {
      clients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify({ type: 'new_message', data: body })}\n\n`;
    
    clients.forEach(client => {
      try {
        client.enqueue(encoder.encode(message));
      } catch (e) {
        clients.delete(client);
      }
    });

    return NextResponse.json({ success: true, listeners: clients.size });
  } catch (error) {
    console.error("Error procesando webhook GHL:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}