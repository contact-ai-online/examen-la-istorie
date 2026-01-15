export async function onRequest(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") return new Response("OK", { headers: corsHeaders });

  try {
    const formData = await context.request.formData();
    const userMessage = formData.get('message');
    
    // CHEIA TA DIRECTĂ
    const apiKey = "AIzaSyClp9SGRprmLkXwWmm2oUEdSbRZ5u-Mr5c"; 

    // MODELUL LATEST (Cel mai sigur pentru 2026)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: userMessage }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    
    if (aiData.error) {
      return new Response(JSON.stringify({ 
        output: "Eroare: " + aiData.error.message 
      }), { headers: corsHeaders });
    }

    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Google nu a trimis text.";

    return new Response(JSON.stringify({ output: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ output: "Eroare sistem: " + error.message }), { headers: corsHeaders });
  }
}
