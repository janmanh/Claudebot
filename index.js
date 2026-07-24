const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const { guardarMensaje, obtenerHistorial } = require('./db.js');
const { generarRespuesta } = require('./deepseek.js');

// ----- 1. Verificación del Webhook (Meta lo llama con GET) -----
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado correctamente ✅');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    console.log('Ocurrio un error en la verificación del webhook');
    res.sendStatus(400);
  }
});
//-----------------------------------------------------------------

// ----- 3. Envío de mensajes -------------------------------------
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_VERSION = process.env.API_VERSION;


// Función para enviar un mensaje de texto usando fetch nativo
async function sendMessage(to, text) 
{
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error al enviar mensaje:', data);
  } else {
    console.log('Mensaje enviado ✅:', data);
  }
  return data;
}
//-----------------------------------------------------------------

//const response = await chat(ctx.body, systemPrompt);

//--------- Normalización de números de teléfono para México ----------------
function normalizarNumeroMX(numero) 
{
  // Detecta patrón 52 1 XXXXXXXXXX (13 dígitos) y remueve el "1"
  if (numero.startsWith('521') && numero.length === 13) {
    return '52' + numero.slice(3);
  }
  return numero;
}
//-----------------------------------------------------------------------------

// ----- 2. Recepción de mensajes (Meta lo llama con POST) -----
app.post('/webhook', async (req, res) => 
{
  const body = req.body;

  // Respondemos rápido a Meta con 200 para que no reintente el envío
  res.sendStatus(200);

  try 
  {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message && message.type === 'text') 
      {
        const from = normalizarNumeroMX(message.from);
        const texto = message.text.body;

        console.log(`Mensaje de ${from}: ${texto}`);

        guardarMensaje(from, 'user', texto);
        const historial = obtenerHistorial(from);
        const respuesta = await generarRespuesta(historial);
        guardarMensaje(from, 'assistant', respuesta);

        await sendMessage(from, respuesta);
      }
  } catch (error) 
    {
      console.error('Error procesando el mensaje:', error);
    }
});

// Iniciamos el servidor --------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
//-------------------------------------------------------------------------