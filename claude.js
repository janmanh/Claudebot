const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres un agente de ventas amable y eficiente por WhatsApp.
Tu trabajo es ayudar a los clientes a: resolver dudas sobre productos/servicios,
tomar pedidos, y agendar citas. Sé breve y natural, como en una conversación real
de WhatsApp (evita párrafos largos). Si el cliente quiere hacer un pedido o agendar
una cita, guíalo para obtener los datos necesarios.`;

async function generarRespuesta(historial) {
  const mensaje = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: historial, // [{role: 'user'|'assistant', content: '...'}, ...]
  });

  return mensaje.content[0].text;
}

module.exports = { generarRespuesta };