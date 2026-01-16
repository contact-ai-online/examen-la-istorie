/**
 * RuslanOS v6.0 - Sistem de Chat Serverless
 * Proiect: Examen la Istorie AI
 */

// ⚠️ IMPORTANT: Înlocuiește acest URL cu link-ul pe care îl vei primi de la Worker-ul tău!
const WORKER_URL = "https://creier-istorie-ai.ruslan-1f0.workers.dev"; 

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Adăugăm mesajul utilizatorului în interfață
    appendMessage('user', text);
    chatInput.value = '';

    // 2. Creăm un mesaj temporar pentru "Profesorul scrie..."
    const botMsgId = appendMessage('bot', 'Se gândește...');

    try {
        // 3. Trimitem întrebarea către Worker-ul din Cloudflare
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) throw new Error('Eroare de conexiune la server.');

        const data = await response.json();

        // 4. Actualizăm mesajul cu răspunsul real de la AI
        updateMessage(botMsgId, data.output);

    } catch (error) {
        console.error("Eroare:", error);
        updateMessage(botMsgId, "Ne pare rău, profesorul este momentan offline. Încearcă din nou în câteva secunde.");
    }
}

// Funcție pentru a adăuga mesaje în fereastra de chat
function appendMessage(role, text) {
    const id = 'msg-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `message ${role}-message`; // user-message sau bot-message
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

// Funcție pentru a actualiza un mesaj existent
function updateMessage(id, text) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
        msgDiv.innerText = text;
    }
}

// Ascultăm click-ul pe buton
sendBtn.addEventListener('click', sendMessage);

// Ascultăm tasta Enter
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
