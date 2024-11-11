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
          model: 'gpt-4o',
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
          max_tokens: 1000,  // Reducir este valor para limitar el uso de tokens
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
