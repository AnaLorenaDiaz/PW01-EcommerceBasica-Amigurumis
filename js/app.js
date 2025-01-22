// Inicializa EmailJS con tu Public Key
emailjs.init("8Gn7ZPsb7GbOCFtZC");

// Función para enviar correo usando EmailJS
function sendEmail(name, email, message, sentiment) {
    // Ajusta la urgencia según el sentimiento
    let urgency;
    if (sentiment === "negative") {
        urgency = "Alta"; // Alta urgencia para sentimientos negativos
    } else if (sentiment === "neutral") {
        urgency = "Moderada"; // Moderada urgencia para sentimientos neutrales
    } else {
        urgency = "Baja"; // Baja urgencia para sentimientos positivos
    }

    // Enviar correo usando EmailJS
    return emailjs.send("service_vjqetb7", "template_lv2i4yc", {
        user_name: name,
        user_email: email,
        user_message: message,
        user_sentiment: sentiment, // Sentimiento devuelto por Azure (positive, neutral, negative)
        urgency: urgency, // Urgencia basada en el sentimiento
    });
}

// Función para analizar el sentimiento usando Azure Text Analytics
async function analyzeSentimentAzure(message) {
    const endpoint = "https://textanalyticsbot.cognitiveservices.azure.com/";
    const apiKey = "4pILb24UejwkIXp2ZIajcB0GyNdUGnOGiWzhWhv4QXPAsxd16lBcJQQJ99BAACLArgHXJ3w3AAAaACOGw1Xl";

    // Realizar la solicitud a Azure
    const response = await fetch(`${endpoint}text/analytics/v3.1/sentiment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": apiKey,
        },
        body: JSON.stringify({
            documents: [
                {
                    language: "es", // Idioma del texto
                    id: "1", // Identificador del mensaje
                    text: message, // Mensaje del usuario
                },
            ],
        }),
    });

    // Procesar la respuesta de Azure
    const data = await response.json();

    // Verificar si hay errores
    if (data.errors && data.errors.length > 0) {
        throw new Error(`Error en Azure: ${data.errors[0].message}`);
    }

    // Devolver el sentimiento principal ('positive', 'neutral', 'negative')
    return data.documents[0].sentiment;
}

// Función principal para manejar la informacion del formulario
async function submitFeedback() {
    // Capturar los datos del formulario
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const message = document.getElementById("userMessage").value;

    // Validación de campos vacíos
    if (!name || !email || !message) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        // Analizar el sentimiento del mensaje con Azure
        const sentiment = await analyzeSentimentAzure(message);

        // Crear la respuesta del bot basada en el sentimiento
        let responseMessage;
        if (sentiment === "negative") {
            responseMessage = "Gracias por tu mensaje. Lamentamos tu experiencia y nos pondremos en contacto contigo para resolver tus inquietudes.";
        } else if (sentiment === "neutral") {
            responseMessage = "Gracias por tu mensaje. Apreciamos tus comentarios y los utilizaremos para mejorar.";
        } else {
            responseMessage = "Gracias por tu mensaje. Estamos felices de saber que tu experiencia fue positiva.";
        }

        // Enviar el correo con la clasificación del sentimiento
        await sendEmail(name, email, message, sentiment);

        // Mostrar la respuesta del bot en el modal
        document.getElementById("formContainer").style.display = "none";
        document.getElementById("responseContainer").style.display = "block";
        document.getElementById("botResponse").innerText = responseMessage;
    } catch (error) {
        console.error("Error al enviar el correo o analizar el sentimiento:", error);
        alert("Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.");
    }
}



// Mostrar el modal de feedback
document.getElementById("feedbackButton").addEventListener("click", () => {
    document.getElementById("feedbackModal").style.display = "block";
    document.getElementById("formContainer").style.display = "block";
    document.getElementById("responseContainer").style.display = "none";
});

// Cerrar el modal
function closeModal() {
    document.getElementById("feedbackModal").style.display = "none";
}
