export async function onRequest(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    const formData = await context.request.formData();
    const userMessage = formData.get('message');
    const level = formData.get('level') || '9';
    const lang = formData.get('language') || 'ro';

    const apiKey = context.env.GEMINI_API_KEY; 
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = lang === 'ro' 
      ? `Ești un profesor de istorie din Moldova. Nivel clasa ${level}. Răspunde scurt și clar.` 
      : `Ты учитель истории в Молдове. Класс ${level}. Отвечай кратко и понятно.`;

    const geminiPayload = {
      contents: [{
        role: "user",
        parts: [{ text: systemInstruction + "\n\nÎntrebare: " + userMessage }]
      }]
    };

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload)
    });

    const aiData = await aiResponse.json();
    let responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Nu am primit răspuns.";

    return new Response(JSON.stringify({ output: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ output: "Eroare: " + error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
