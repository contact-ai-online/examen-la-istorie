/**
 * RuslanOS v6.0 - Sistem Integrat (Chat + UI)
 * Conectat la Cloudflare Worker
 */

// 1. CONFIGURARE WORKER (MOTORUL AI)
const WORKER_URL = "https://creier-istorie-ai.ruslan-1f0.workers.dev"; 

// Variabile Globale
let currentLang = localStorage.getItem('app_lang') || 'ro';
let currentLevel = '9';
let isLiveMode = false;

// Meniurile pentru examene
const menus = {
    '9': {
        'ro': [ {t:'Subiectul I - Surse', d:'Analiza documentelor'}, {t:'Subiectul II - Personalități', d:'Rolul personalităților'}, {t:'Subiectul III - Harta', d:'Analiza hărților 1940'}, {t:'Subiectul IV - Argument', d:'Text argumentativ'} ],
        'ru': [ {t:'Субъект I - Источники', d:'Анализ документов'}, {t:'Субъект II - Личности', d:'Роль личностей'}, {t:'Субъект III - Карта', d:'Карты 1940 года'}, {t:'Субъект IV - Аргумент', d:'Аргументированный текст'} ]
    },
    '12': {
        'ro': [ {t:'Subiectul I - Tratate', d:'Relații internaționale'}, {t:'Subiectul II - Personalitate', d:'Fisă de evaluare'}, {t:'Subiectul III - Cronologie', d:'Sincronizare evenimente'}, {t:'Subiectul IV - Eseu', d:'Democrație vs Totalitarism'} ],
        'ru': [ {t:'Субъект I - Договоры', d:'Международные отношения'}, {t:'Субъект II - Личность', d:'Оценка личности'}, {t:'Субъект III - Хронология', d:'Синхронизация событий'}, {t:'Субъект IV - Эссе', d:'Демократия vs Тоталитаризм'} ]
    },
    'olimp': {
        'ro': [ {t:'Analiză Comparativă', d:'Surse antice/medievale'}, {t:'Demografie Istorică', d:'Grafice populație'}, {t:'Etnogeneza', d:'Teorii și izvoare'} ],
        'ru': [ {t:'Сравнительный Анализ', d:'Древние источники'}, {t:'Демография', d:'Графики населения'}, {t:'Этногенез', d:'Теории и источники'} ]
    }
};

// --- FUNCȚII PRINCIPALE CHAT ---

async function sendMessage(manualText) {
    const inputField = document.getElementById('userInput');
    const text = manualText || inputField.value.trim();
    
    if (!text) return;

    // Afișăm mesajul userului
    addMsg(text, 'user');
    if (!manualText) inputField.value = '';

    // Spinner de așteptare
    const loadId = 'load-' + Date.now();
    const history = document.getElementById('chatHistory');
    history.innerHTML += `<div id="${loadId}" class="flex gap-3 fade-in mt-4"><div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div></div></div>`;
    history.scrollTop = history.scrollHeight;

    try {
        // CONEXIUNEA CU WORKER-UL (Aici era problema înainte)
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        // Eliminăm spinner-ul și afișăm răspunsul
        const spinner = document.getElementById(loadId);
        if(spinner) spinner.remove();
        
        addMsg(data.output, 'ai');

    } catch (e) {
        console.error("Eroare:", e);
        const spinner = document.getElementById(loadId);
        if(spinner) spinner.remove();
        addMsg("⚠️ Eroare de conexiune. Verifică internetul sau Worker-ul.", 'ai');
    }
}

function addMsg(text, role) {
    const history = document.getElementById('chatHistory');
    const isUser = role === 'user';
    let html = '';
    
    if (isUser) {
        html = `<div class="flex justify-end fade-in"><div class="bg-[#001F3F] text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] text-sm shadow-md leading-relaxed">${text.replace(/\n/g, '<br>')}</div></div>`;
    } else {
        html = `<div class="flex gap-3 fade-in mt-4"><div class="w-10 h-10 rounded-full bg-[#001F3F] flex-none flex items-center justify-center text-[#D4AF37] shadow-md border-2 border-[#D4AF37]"><i class="fas fa-robot"></i></div><div class="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 text-sm text-gray-800 max-w-[90%] leading-relaxed">${formatMarkdown(text)}</div></div>`;
    }
    
    history.innerHTML += html;
    history.scrollTop = history.scrollHeight;
}

function formatMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// --- FUNCȚII UI (Limbă, Meniuri) ---

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    
    // Ascundem/Afișăm elementele în funcție de limbă
    document.querySelectorAll('.lang-ro').forEach(el => el.classList.toggle('hidden-lang', lang !== 'ro'));
    document.querySelectorAll('.lang-ru').forEach(el => el.classList.toggle('hidden-lang', lang !== 'ru'));
    
    // Butoane active
    document.getElementById('btn-ro').className = `lang-btn px-2 py-1 text-[10px] rounded transition-all cursor-pointer ${lang === 'ro' ? 'active' : ''}`;
    document.getElementById('btn-ru').className = `lang-btn px-2 py-1 text-[10px] rounded transition-all cursor-pointer ${lang === 'ru' ? 'active' : ''}`;
    
    // Placeholder
    document.getElementById('userInput').placeholder = lang === 'ro' ? 'Întreabă despre Ștefan cel Mare...' : 'Спроси про Штефана чел Маре...';
    
    switchLevel(currentLevel);
}

function switchLevel(lvl) {
    currentLevel = lvl;
    ['9','12','olimp'].forEach(id => {
        const btn = document.getElementById(`tab-${id}`);
        if(btn) btn.className = `flex-1 py-2 rounded text-[10px] font-bold transition-all shadow-sm cursor-pointer ${id === lvl ? 'tab-active' : 'tab-inactive'}`;
    });
    
    const titles = { '9': {'ro': 'Examen Gimnazial (Clasa 9)', 'ru': 'Гимназический Экзамен (9 Класс)'}, '12': {'ro': 'Examen BAC (Clasa 12)', 'ru': 'Экзамен БАК (12 Класс)'}, 'olimp': {'ro': 'Pregătire Olimpiadă', 'ru': 'Подготовка к Олимпиаде'} };
    const titleEl = document.getElementById('current-level-title');
    if(titleEl) titleEl.innerText = titles[lvl][currentLang];
    
    renderMenu();
}

function renderMenu() {
    const menuContainer = document.getElementById('exam-menu');
    if(!menuContainer) return;
    
    menuContainer.innerHTML = '';
    const currentMenu = menus[currentLevel][currentLang];
    
    if(currentMenu) {
        currentMenu.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-3 hover:bg-blue-50 rounded-xl cursor-pointer mb-2 border border-transparent hover:border-blue-100 transition-all bg-white shadow-sm';
            itemDiv.onclick = function() { trigger(item.t); };
            itemDiv.innerHTML = `<h4 class="text-xs font-bold text-[#001F3F]">${item.t}</h4><p class="text-[9px] text-gray-400 mt-0.5">${item.d}</p>`;
            menuContainer.appendChild(itemDiv);
        });
    }
}

function trigger(topic) {
    const prompt = currentLang === 'ro' ? "Explică: " + topic : "Объясни: " + topic;
    sendMessage(prompt);
}

function handleUserAction(e) { 
    e.preventDefault(); 
    sendMessage(); 
}

// Inițializare la încărcarea paginii
window.onload = function() {
    setWallpaper();
    setLang(currentLang);
};

function setWallpaper() {
    var p1 = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E";
    var p2 = "%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E";
    var p3 = "%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
    document.body.style.backgroundImage = 'url("' + p1 + p2 + p3 + '")';
}

// Funcții auxiliare UI (Modale, Upload)
function openLegal(id) { document.getElementById('modal-'+id).classList.remove('hidden'); }
function closeLegal(id) { document.getElementById('modal-'+id).classList.add('hidden'); }
function openFeedback() { document.getElementById('modal-feedback').classList.remove('hidden'); }
function handleFile(input) { if(input.files[0]) { document.getElementById('uploadPreview').classList.remove('hidden'); document.getElementById('uploadPreview').classList.add('flex'); document.getElementById('fileName').innerText = input.files[0].name; } }
function clearUpload() { document.getElementById('fileInput').value = ''; document.getElementById('uploadPreview').classList.add('hidden'); document.getElementById('uploadPreview').classList.remove('flex'); }
