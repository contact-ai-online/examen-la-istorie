/**
 * RuslanOS v6.0 - Sistem de Chat Serverless
 * Proiect: Examen la Istorie AI
 */

// 1. ADRESA WORKER-ULUI (Verificată de noi)
const WORKER_URL = "https://creier-istorie-ai.ruslan-1f0.workers.dev"; 

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Adăugăm mesajul utilizatorului
    appendMessage('user', text);
    chatInput.value = '';

    // Mesaj de așteptare
    const botMsgId = appendMessage('bot', 'Profesorul se gândește...');

    try {
        // ⚠️ AICI ERA EROAREA: Trebuie să folosim WORKER_URL, nu "/api/chat"
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Eroare de server');
        }

        const data = await response.json();

        // Afișăm răspunsul de la AI
        updateMessage(botMsgId, data.output);

    } catch (error) {
        console.error("Eroare Detaliată:", error);
        updateMessage(botMsgId, "⚠️ Eroare de conexiune. Profesorul este momentan offline.");
    }
}

function appendMessage(role, text) {
    const id = 'msg-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `message ${role}-message`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function updateMessage(id, text) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
        msgDiv.innerText = text;
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
