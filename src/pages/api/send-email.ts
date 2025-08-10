import type { APIRoute } from 'astro';
import * as nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { to, responses, finalAnswer } = await request.json();
    
    const emailContent = generateEmailContent(responses, finalAnswer);
    
    // Configure transporter - you'll need to set these environment variables
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(import.meta.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: import.meta.env.SMTP_USER, // Your email
        pass: import.meta.env.SMTP_PASS  // Your app password
      }
    });

    const mailOptions = {
      from: import.meta.env.SMTP_USER,
      to: to,
      subject: finalAnswer === 'SI' ? '¡Dijiste que Sí! 💕' : 'Gracias por completar el cuestionario',
      html: emailContent
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully to:', to);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Correo enviado exitosamente' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error enviando correo:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Error al enviar correo: ' + (error instanceof Error ? error.message : 'Unknown error')
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

function generateEmailContent(responses: Record<string, string>, finalAnswer: string): string {
  const questions = [
    { id: '1', text: "¿Cuál es tu correo electrónico?" },
    { id: '2', text: "¿Qué tan seguido organizas tus tareas o actividades diarias?" },
    { id: '3', text: "¿Qué herramientas usas actualmente para organizarte?" },
    { id: '4', text: "¿Qué tan importante es para ti tener recordatorios de tus tareas?" },
    { id: '5', text: "¿Te gustaría que una aplicación te ayudara también a cuidar tu salud mental además de organizar tus tareas?" },
    { id: '6', text: "¿Qué función te resultaría más útil en una app de organización?" },
    { id: '7', text: "¿En qué área sientes que necesitas más apoyo para organizarte?" },
    { id: '8', text: "¿Con qué frecuencia revisarías la aplicación para gestionar tus actividades?" },
    { id: '9', text: "¿Te motivaría recibir mensajes o notificaciones con consejos de productividad y bienestar?" },
    { id: '10', text: "¿Te gustaría poder personalizar el diseño y modo de la aplicación según tu estilo o estado de ánimo?" },
    { id: '11', text: "Si esta aplicación existiera, ¿la recomendarías a otras personas?" },
    { id: '12', text: "Y finalmente... ¿Quieres salir conmigo?" }
  ];

  // No incluir el resumen de respuestas

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Dijiste que Sí</title>
    </head>
    <body style="margin: 0; padding: 0; background: #1e3a8a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-collapse: collapse; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: #059669; padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    ¡Qué emoción!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <!-- Main Message -->
                  <h2 style="color: #1f2937; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">
                    Este es mi plan
                  </h2>
                  <p style="color: #374151; font-size: 20px; margin: 0 0 40px 0; line-height: 1.5;">
                    ¿Quieres tener esta cita conmigo?
                  </p>
                  
                  <!-- Plan Image - Main Focus -->
                  <div style="margin: 40px 0;">
                    <img src="https://raw.githubusercontent.com/AEscarenoP/images/main/PlanCita.png" 
                         style="width: 100%; max-width: 500px; border-radius: 16px; box-shadow: 0 12px 24px rgba(0,0,0,0.15); border: 3px solid #059669;" 
                         alt="Plan de Cita">
                  </div>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #e5e7eb; padding: 30px; text-align: center; border-top: 1px solid #d1d5db;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Este correo fue enviado porque completaste nuestro cuestionario especial.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                    Generado automáticamente
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return content;
}