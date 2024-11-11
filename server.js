const express = require('express');
const cors = require('cors');
const app = express();
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Habilitar CORS para aceptar solicitudes desde cualquier origen
app.use(cors());
app.use(express.json());

app.post('/generate-accessibility-report', async (req, res) => {
    try {
      const { details } = req.body;
  
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: `Revisa el siguiente contenido de un diseño de Figma y proporciona sugerencias de accesibilidad:\n\n${details}\n\nGenera sugerencias de mejora para hacerlo más accesible:` }
          ],
          max_tokens: 100,  // Reducir este valor para limitar el uso de tokens
          temperature: 0.7
        })
      });
  
      console.log('Respuesta de OpenAI recibida, estado:', response.status);
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Error de OpenAI:', errorResponse);
        return res.status(response.status).send(errorResponse);
      }
  
      const data = await response.json();
      res.send(data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error durante la solicitud a OpenAI:', error);
      res.status(500).send('Error interno del servidor');
    }
});  

app.listen(PORT, () => {
  console.log(`Servidor proxy ejecutándose en el puerto ${PORT}`);
});
