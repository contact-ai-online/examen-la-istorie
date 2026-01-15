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
    
    const apiKey = "AIzaSyClp9SGRprmLkXwWmm2oUEdSbRZ5u-Mr5c"; 

    // AM ACTUALIZAT URL-ul la versiunea v1 (stabila)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const aiData = await aiResponse.json();
    
    if (aiData.error) {
      return new Response(JSON.stringify({ output: "Eroare Google: " + aiData.error.message }), { headers: corsHeaders });
    }

    let responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Google nu a oferit un răspuns.";

    return new Response(JSON.stringify({ output: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ output: "Eroare Tehnică: " + error.message }), { headers: corsHeaders });
  }
}
