require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configurar CORS para permitir cualquier origen
app.use(cors());
app.options('*', cors());  // Manejar solicitudes preflight

// Aumentar el tamaño máximo del payload permitido
app.use(express.json({ limit: '15mb' }));

// Ruta para generar el reporte de accesibilidad
app.post('/generate-accessibility-report', async (req, res) => {
  try {
    const { details, imageBase64 } = req.body;

    let analysisContent = `
    Revisa el siguiente contenido de un diseño de Figma y proporciona un análisis detallado de la accesibilidad. Incluye los siguientes aspectos:
    1. Identifica problemas de accesibilidad visual como contraste insuficiente, tamaño de fuente pequeño, y colores problemáticos. Ofrece sugerencias específicas para mejorarlos.
    2. Evalúa la estructura de los componentes y asegúrate de que los elementos interactivos sean fácilmente navegables. Proporciona recomendaciones sobre cómo mejorar la navegación y el enfoque de teclado.
    3. Sugiere mejoras para el uso adecuado de etiquetas ARIA y otros atributos que ayuden a los usuarios con discapacidades.
    4. Proporciona consejos para mejorar la experiencia del usuario en dispositivos móviles, como tamaños de objetivo táctil adecuados y mejoras en el diseño adaptable.
    5. Ofrece recomendaciones generales basadas en las pautas WCAG (Web Content Accessibility Guidelines) para garantizar que el diseño sea accesible para todos los usuarios, incluyendo aquellos con discapacidades visuales, auditivas y motoras.
    Contenido del diseño:

    ${details}
    `;

    if (imageBase64) {
      analysisContent += `Imagen del diseño (base64): ${imageBase64}`;
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { 
          role: 'user', 
          content: analysisContent
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    console.log('Respuesta de OpenAI recibida, estado:', response.status);
    res.json({ report: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).json({ message: 'Error al generar el reporte de accesibilidad' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
