const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = 'TU_API_KEY_DE_OPENAI';

app.use(cors());
app.use(express.json());

app.post('/generate-accessibility-report', async (req, res) => {
  try {
    const { details } = req.body;

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: `Revisa el siguiente contenido de un diseño de Figma y proporciona sugerencias de accesibilidad:\n\n${details}\n\nGenera sugerencias de mejora para hacerlo más accesible:`,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      return res.status(response.status).send(errorResponse);
    }

    const data = await response.json();
    res.send(data.choices[0].text.trim());
  } catch (error) {
    console.error('Error durante la solicitud a OpenAI:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy ejecutándose en el puerto ${PORT}`);
});
