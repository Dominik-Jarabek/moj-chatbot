// === Minihra ===
function openMiniGame() {
    document.getElementById('minigame-modal').style.display = "block";
    const btn = document.getElementById('gameBtn');
    const scoreP = document.getElementById('gameScore');
    let score = 0;
    let started = false;
    btn.textContent = "Start";
    scoreP.textContent = "";

    btn.onclick = function () {
        if (!started) {
            started = true;
            score = 0;
            btn.textContent = "Klikni!";
            scoreP.textContent = "Body: 0";
            let left = 5;
            btn.disabled = false;
            let interval = setInterval(() => {
                left--;
                if (left <= 0) {
                    btn.textContent = "Konec";
                    btn.disabled = true;
                    scoreP.textContent = "Tvůj výsledek: " + score;
                    clearInterval(interval);
                }
            }, 1000);
            btn.onclick = function () {
                if (!btn.disabled) {
                    score++;
                    scoreP.textContent = "Body: " + score;
                }
            };
        }
    }
}
function closeMiniGame() {
    document.getElementById('minigame-modal').style.display = "none";
}

// === AI ASISTENT ===
document.getElementById('ai-close').onclick = function(e) {
    e.stopPropagation();
    document.getElementById('ai-assistant').classList.add('ai-assistant-hidden');
    document.getElementById('ai-open-btn').style.display = "flex";
    document.getElementById('ai-panel').classList.remove('ai-expanded');
    document.getElementById('ai-chat').style.display = "none";
};
document.getElementById('ai-open-btn').onclick = function() {
    document.getElementById('ai-assistant').classList.remove('ai-assistant-hidden');
    document.getElementById('ai-open-btn').style.display = "none";
};
window.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        document.getElementById('ai-assistant').classList.remove('ai-assistant-hidden');
    }, 1200);
});
document.getElementById('ai-panel').addEventListener('click', function(e){
    if(e.target.id === "ai-close") return;
    this.classList.add('ai-expanded');
    document.getElementById('ai-chat').style.display = "flex";
    document.getElementById('ai-chat-input').focus();
});

// === CHATBOT ===
document.getElementById('ai-chat-form').onsubmit = async function(e){
    e.preventDefault();
    const input = document.getElementById('ai-chat-input');
    const history = document.getElementById('ai-chat-history');
    const msg = input.value.trim();
    if(!msg) return;

    // Uživatelská zpráva
    const userMsg = document.createElement('div');
    userMsg.className = "ai-chat-msg user";
    userMsg.textContent = msg;
    history.appendChild(userMsg);
    input.value = "";

    // "Přemýšlím..." loading
    const aiMsg = document.createElement('div');
    aiMsg.className = "ai-chat-msg ai";
    aiMsg.textContent = "Přemýšlím...";
    history.appendChild(aiMsg);
    history.scrollTop = history.scrollHeight;

    try {
        const response = await fetch('http://localhost:3333/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `
Jsem Dominik Jarábek, je mi 31 let. Bydlím v Lipové u Šluknova.

V současnosti studuji Speciální pedagogiku na Univerzitě J. E. Purkyně v Ústí nad Labem (od roku 2024). Maturitu mám z oboru Informační a komunikační technologie na VOŠ a SŠ ve Varnsdorfu.

Od roku 2022 pracuji jako učitel německého jazyka na Střední lesnické škole ve Šluknově. Předtím jsem byl několik let seřizovačem a vedoucím směny ve firmě Pulp-Tec GmbH v Německu, kde jsem měl pod sebou tým osmi lidí. Krátce jsem také pracoval jako dělník v Oppacher Mineralquellen v Německu a v BeA CS v Lobendavě, kde jsem využíval MS Excel. Mám zkušenost i jako instruktor dětské sportovní přípravky a vedoucí na letních táborech.

Co se týče IT dovedností, jsem expert na Microsoft Office, pokročile ovládám Adobe Photoshop, Lightroom a Illustrator, stejně tak AutoCAD. Umím základy webového vývoje (HTML, CSS, JavaScript).

Mezi mé silné stránky patří učenlivost, samostatnost, týmová práce, řešení konfliktů a flexibilita. Mám několik certifikátů, například Mezinárodní cenu vévody z Edinburghu, školení Nevypusť duši (duševní zdravověda pro učitele), správu TikTok a základy umělé inteligence.

Mluvím plynule německy (úroveň B2, certifikát Goethe Institut), anglicky na úrovni začátečníka.

Mezi mé zájmy patří sport, tvorba webových stránek a grafiky, četba, osobní rozvoj a cestování.

Odpovídám vždy za sebe v první osobě, ne jako AI, ale jako člověk Dominik. Pokud dostanu otázku na zkušenosti, znalosti nebo dovednosti, odpovídám osobně na základě výše uvedených informací. Odpovídám stručně, lidsky a česky.
                        `
                    },
                    {
                        role: "user",
                        content: msg
                    }
                ]
            })
        });

        if (!response.ok) {
            aiMsg.textContent = "Omlouvám se, něco se pokazilo na serveru 😕";
        } else {
            const data = await response.json();
            // Pro { reply: "..."} nebo OpenAI strukturu
            if (data.reply) {
                aiMsg.textContent = data.reply;
            } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                aiMsg.textContent = data.choices[0].message.content;
            } else {
                aiMsg.textContent = "Odpověď nebyla nalezena.";
            }
        }
    } catch (error) {
        aiMsg.textContent = "Nepodařilo se spojit se serverem. Zkontroluj, že máš spuštěný backend (openai-proxy.js).";
    }
    history.scrollTop = history.scrollHeight;
};

// === SCROLL header ===
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if(window.scrollY > 70) {
        header.classList.add('shrink');
    } else {
        header.classList.remove('shrink');
    }
});

// === CV Modal ===
document.getElementById('showCvBtn').addEventListener('click', function() {
    document.querySelector('.CvModal').style.display = 'flex';
});
document.getElementById('closeCvModal').addEventListener('click', function() {
    document.querySelector('.CvModal').style.display = 'none';
});
const modal = document.querySelector('.CvModal');
document.getElementById('showCvBtn').addEventListener('click', function() {
    modal.style.display = 'flex';
});
document.getElementById('closeCvModal').addEventListener('click', function() {
    modal.style.display = 'none';
});
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
    }
});
