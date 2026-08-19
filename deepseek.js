const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const MODEL = 'deepseek-v4-pro'; // usa 'deepseek-v4-flash' si prefieres más económico/rápido

const SYSTEM_PROMPT = `Eres un agente de ventas amable y eficiente por WhatsApp. El producto que vendes es un bot de whatsapp que ayuda a los negocios a atender clientes de manera automatizada, el precio es de $3000 por la implementación y $400 al mes por mantenimiento. 
Tu trabajo es ayudar a los clientes a: resolver dudas sobre productos/servicios, cerrar la venta,
tomar pedidos, y agendar citas para implementar el bot en su negocio. Sé breve y natural, como en una conversación real
de WhatsApp (evita párrafos largos). Si el cliente quiere hacer un pedido o agendar
una cita, guíalo para obtener los datos necesarios.`;

const tools = [
  {
    type: 'function',
    function: {
      name: 'crear_pedido',
      description: 'Crea un nuevo pedido cuando el cliente confirma qué productos quiere comprar.',
      parameters: {
        type: 'object',
        properties: {
          telefono: { type: 'string', description: 'Número de teléfono del cliente' },
          productos: {
            type: 'string',
            description: 'Descripción de los productos/servicios pedidos, con cantidades'
          },
          total_estimado: { type: 'string', description: 'Monto total estimado, si se conoce' },
          notas: { type: 'string', description: 'Notas adicionales del pedido, si las hay' }
        },
        required: ['telefono', 'productos'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'agendar_cita',
      description: 'Agenda una cita cuando el cliente confirma día y hora deseados.',
      parameters: {
        type: 'object',
        properties: {
          telefono: { type: 'string', description: 'Número de teléfono del cliente' },
          fecha: { type: 'string', description: 'Fecha de la cita en formato YYYY-MM-DD' },
          hora: { type: 'string', description: 'Hora de la cita en formato HH:MM (24h)' },
          motivo: { type: 'string', description: 'Motivo o servicio de la cita' }
        },
        required: ['telefono', 'fecha', 'hora'],
        additionalProperties: false
      }
    }
  }
];


const { crearPedido, agendarCita } = require('./acciones.js');

async function generarRespuesta(historial) {
  const mensajes = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historial,
  ];

  let completion = await client.chat.completions.create({
    model: MODEL,
    messages: mensajes,
    tools: tools,
    max_tokens: 500,
  });

  let respuesta = completion.choices[0].message;

  // Si el modelo pidió ejecutar una o más herramientas...
  while (respuesta.tool_calls && respuesta.tool_calls.length > 0) {
    mensajes.push(respuesta); // el mensaje del asistente con el tool_call

    for (const toolCall of respuesta.tool_calls) 
    {
      const args = JSON.parse(toolCall.function.arguments);
      let resultado;

      if (toolCall.function.name === 'crear_pedido') {
        resultado = await crearPedido(args);
      } else if (toolCall.function.name === 'agendar_cita') {
        resultado = await agendarCita(args);
      } else {
        resultado = { error: 'función no reconocida' };
      }

      // Le regresamos el resultado de la ejecución al modelo
      mensajes.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(resultado),
      });
    }

    // Volvemos a llamar al modelo para que redacte la respuesta final al cliente
    completion = await client.chat.completions.create({
      model: MODEL,
      messages: mensajes,
      tools: tools,
      max_tokens: 500,
    });

    respuesta = completion.choices[0].message;
  }

  return respuesta.content;
}

module.exports = { generarRespuesta };