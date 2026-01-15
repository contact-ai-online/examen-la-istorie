export async function onRequest(context) {
  // Handle CORS preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse FormData from the request
    const formData = await context.request.formData();
    const message = formData.get('message');
    const language = formData.get('language');
    const level = formData.get('level');

    // Validate required fields
    if (!message || !language || !level) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get Gemini API key from environment variables
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build dynamic system prompt based on language
    let systemPrompt;
    if (language === 'ro') {
      systemPrompt = `Ești un profesor expert de Istoria Românilor și Universală. Nivel elev: ${level}. Răspunde scurt și clar.`;
    } else if (language === 'ru') {
      systemPrompt = `Ты экспертный учитель истории. Класс: ${level}. Отвечай кратко.`;
    } else {
      systemPrompt = `You are an expert history teacher. Student level: ${level}. Respond concisely and clearly.`;
    }

    // Prepare request to Google Gemini API
    const geminiRequest = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: message }
          ]
        }
      ]
    };

    // Send request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(geminiRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const responseData = await response.json();
    const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    // Return response in the format expected by frontend
    const result = {
      output: generatedText
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
