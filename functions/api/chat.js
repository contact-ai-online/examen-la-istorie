/**
 * RuslanOS v6.0 - Sincronizat cu HTML
 */

const WORKER_URL = "https://creier-istorie-ai.ruslan-1f0.workers.dev"; 

// Folosim ID-urile exacte din HTML-ul tău
const chatMessages = document.getElementById('chat-messages'); 
const chatInput = document.getElementById('userInput'); // <--- Sincronizat cu HTML-ul tău

async function sendMessage(manualText) {
    const text = manualText || chatInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    if (!manualText) chatInput.value = '';

    const botMsgId = appendMessage('bot', 'Profesorul analizează întrebarea...');

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        updateMessage(botMsgId, data.output);

    } catch (error) {
        console.error("Eroare:", error);
        updateMessage(botMsgId, "⚠️ Eroare de conexiune. Profesorul este momentan offline.");
    }
}

function appendMessage(role, text) {
    const id = 'msg-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `message ${role}-message p-2 rounded my-1 ${role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function updateMessage(id, text) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) msgDiv.innerText = text;
}

// Funcția de inițializare
function init() {
    console.log("Sistemul RuslanOS a pornit!");
}
