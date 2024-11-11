const express = require('express');
const fetch = require('node-fetch'); // Si es necesario, usa node-fetch para realizar solicitudes HTTP
require('dotenv').config(); // Carga las variables de entorno, incluida la API key
const app = express();
const PORT = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware para parsear JSON con un límite aumentado
app.use(express.json({ limit: '5mb' })); // Aumentar el límite del payload a 5MB, puedes ajustarlo según las necesidades

// Ruta para generar reporte de accesibilidad
app.post('/generate-accessibility-report', async (req, res) => {
  try {
    const { details } = req.body;

    // Llamada a la API de OpenAI para analizar los detalles del diseño de Figma
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'user', 
            content: `
            Revisa el siguiente contenido de un diseño de Figma y proporciona un análisis detallado de la accesibilidad. Incluye los siguientes aspectos:
            1. Identifica problemas de accesibilidad visual como contraste insuficiente, tamaño de fuente pequeño, y colores problemáticos. Ofrece sugerencias específicas para mejorarlos.
            2. Evalúa la estructura de los componentes y asegúrate de que los elementos interactivos sean fácilmente navegables. Proporciona recomendaciones sobre cómo mejorar la navegación y el enfoque de teclado.
            3. Sugiere mejoras para el uso adecuado de etiquetas ARIA y otros atributos que ayuden a los usuarios con discapacidades.
            4. Proporciona consejos para mejorar la experiencia del usuario en dispositivos móviles, como tamaños de objetivo táctil adecuados y mejoras en el diseño adaptable.
            5. Ofrece recomendaciones generales basadas en las pautas WCAG (Web Content Accessibility Guidelines) para garantizar que el diseño sea accesible para todos los usuarios, incluyendo aquellos con discapacidades visuales, auditivas y motoras.
            Contenido del diseño:
            
            ${details}
            
            Genera un reporte detallado con soluciones y consejos específicos para hacer el diseño más accesible.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    console.log('Respuesta de OpenAI recibida, estado:', response.status);
    if (!response.ok) {
      const errorResponse = await response.text();
      console.error('Error de OpenAI:', errorResponse);
      return res.status(response.status).json({ message: errorResponse });
    }

    const data = await response.json();
    res.json({ report: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error durante la solicitud a OpenAI:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
