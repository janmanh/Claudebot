const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const MODEL = 'deepseek-v4-pro'; // usa 'deepseek-v4-flash' si prefieres más económico/rápido

const SYSTEM_PROMPT = `Eres un agente de ventas amable y eficiente por WhatsApp.
Tu trabajo es ayudar a los clientes a: resolver dudas sobre productos/servicios,
tomar pedidos, y agendar citas. Sé breve y natural, como en una conversación real
de WhatsApp (evita párrafos largos). Si el cliente quiere hacer un pedido o agendar
una cita, guíalo para obtener los datos necesarios.`;

async function generarRespuesta(historial) {
  // El SDK de OpenAI espera el system prompt como parte del array de mensajes
  const mensajes = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historial, // [{role: 'user'|'assistant', content: '...'}, ...]
  ];

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: mensajes,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
}

module.exports = { generarRespuesta };