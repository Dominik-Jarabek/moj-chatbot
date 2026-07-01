// =============== MINIHRY ===============
function openMiniGame() {
    document.getElementById('minigame-modal').style.display = "block";
    const btn = document.getElementById('gameBtn');
    const scoreP = document.getElementById('gameScore');
    let score = 0, started = false;
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

// --- Klikací šílenství ---
let crazyGameTimer = null;
let crazyGameTime = 7;
let crazyClicks = 0;

function openCrazyClickGame() {
  document.getElementById('crazyClickGame-modal').style.display = 'block';
  document.getElementById('crazyStartBtn').style.display = '';
  document.getElementById('crazyClickBtn').style.display = 'none';
  document.getElementById('crazyScore').textContent = '';
  document.getElementById('crazyTimer').textContent = '';
  renderCrazyLeaderboard();
}
function closeCrazyClickGame() {
  document.getElementById('crazyClickGame-modal').style.display = 'none';
  if (crazyGameTimer) clearInterval(crazyGameTimer);
}
document.getElementById('crazyStartBtn').onclick = function() {
  crazyClicks = 0;
  let timeLeft = crazyGameTime;
  document.getElementById('crazyScore').textContent = '';
  document.getElementById('crazyStartBtn').style.display = 'none';
  document.getElementById('crazyClickBtn').style.display = '';
  document.getElementById('crazyTimer').textContent = `⏰ Zbývá: ${timeLeft}s`;
  crazyGameTimer = setInterval(function() {
    timeLeft--;
    document.getElementById('crazyTimer').textContent = `⏰ Zbývá: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(crazyGameTimer);
      endCrazyGame();
    }
  }, 1000);
};
document.getElementById('crazyClickBtn').onclick = function() {
  crazyClicks++;
  document.getElementById('crazyScore').textContent = `Skóre: ${crazyClicks}`;
};
function endCrazyGame() {
  document.getElementById('crazyClickBtn').style.display = 'none';
  document.getElementById('crazyScore').textContent = `Výsledek: ${crazyClicks} kliků!`;
  checkCrazyRecord(crazyClicks);
  document.getElementById('crazyStartBtn').style.display = '';
  document.getElementById('crazyTimer').textContent = '';
  renderCrazyLeaderboard();
}
function getCrazyLeaderboard() {
  return JSON.parse(localStorage.getItem('crazyLeaderboard') || '[]');
}
function setCrazyLeaderboard(lb) {
  localStorage.setItem('crazyLeaderboard', JSON.stringify(lb));
}
function renderCrazyLeaderboard() {
  const lb = getCrazyLeaderboard();
  const ol = document.getElementById('crazyLeaderboard');
  ol.innerHTML = '';
  lb.forEach(({name, score}) => {
    let emoji = score >= 50 ? '🔥' : score >= 30 ? '💪' : '';
    ol.innerHTML += `<li>${name}: <b>${score}</b> kliků ${emoji}</li>`;
  });
  if (lb.length === 0) ol.innerHTML = '<li>Zatím nikdo nezapsán!</li>';
}
function checkCrazyRecord(newScore) {
  let lb = getCrazyLeaderboard();
  let min = lb[lb.length - 1]?.score || 0;
  if (lb.length < 5 || newScore > min) {
    let name = prompt('Nový rekord! Zadej svou přezdívku:','Anonym');
    if (!name) name = 'Anonym';
    lb.push({name, score: newScore});
    lb = lb.sort((a,b) => b.score - a.score).slice(0,5);
    setCrazyLeaderboard(lb);
    alert('Gratuluji, jsi v TOP 5!');
  }
}


// =============== HEADER SCROLL ===============
const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollY < 10) {
    // Plný header — jen úplně nahoře
    header.classList.remove('show-nav-only', 'shrink', 'hiding');
  } else {
    // Ihned zmenšit na lištu
    header.classList.remove('shrink', 'hiding');
    header.classList.add('show-nav-only');
  }
}, { passive: true });


// =============== AI PANEL A ZVUK ===============
function shakeAiPanel() {
  const panel = document.querySelector('.ai-panel');
  if (!panel) return;
  panel.classList.remove('shake');
  void panel.offsetWidth;
  panel.classList.add('shake');
}
const zvuk = new Audio('pop.mp3');
function prehrajZvukJednou() {
  zvuk.play();
  window.removeEventListener('click', prehrajZvukJednou);
  window.removeEventListener('touchstart', prehrajZvukJednou);
}
window.addEventListener('click', prehrajZvukJednou);
window.addEventListener('touchstart', prehrajZvukJednou);

function showBotOnFirstInteraction(e) {
  document.getElementById('ai-assistant').classList.remove('ai-assistant-hidden');
  const audio = document.getElementById('shake-sound');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
  shakeAiPanel();
  document.body.removeEventListener('click', showBotOnFirstInteraction);
  document.body.removeEventListener('touchstart', showBotOnFirstInteraction);
}
document.body.addEventListener('click', showBotOnFirstInteraction);
document.body.addEventListener('touchstart', showBotOnFirstInteraction);

// =============== AI CHAT, PANEL, THEME ===============
let aiWelcomeShown = false;
let meetingFlow = { active: false, step: 0, data: {} };

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

document.getElementById('ai-panel').addEventListener('click', function(e){
  if(e.target.id === "ai-close") return;
  this.classList.add('ai-expanded');
  document.getElementById('ai-chat').style.display = "flex";
  document.getElementById('ai-chat-input').focus();
  if (!aiWelcomeShown) {
    appendAiMsg("👋 Vítejte!<br>Skrze mě si můžete snadno domluvit schůzku, zjistit více informací o mně, nebo získat životopis. Napište mi, s čím mohu pomoci!");
    aiWelcomeShown = true;
  }
});

// =============== CHATBOT FORM ===============
document.getElementById('ai-chat-form').onsubmit = async function(e){
  e.preventDefault();
  const input = document.getElementById('ai-chat-input');
  const msg = input.value.trim();
  if(!msg) return;
  input.value = "";

  if (/cv|životopis|curriculum/i.test(msg)) {
    appendUserMsg(msg);
    appendAiMsg(`Samozřejmě! Zde si můžete stáhnout můj životopis:<br>
      <a href="Jarabek_CV.pdf" download target="_blank" style="color:#1976d2;font-weight:bold;">Stáhnout životopis (PDF)</a>
      <br><small>Otevře se v nové záložce, případně se stáhne do vašeho počítače.</small>`);
    return;
  }

  if (meetingFlow.active || /schůzku|schuzku|pohovor|setkání|domluvit/i.test(msg)) {
    appendUserMsg(msg);
    handleMeetingFlow(msg);
    return;
  }

  appendUserMsg(msg);

  const history = document.getElementById('ai-chat-history');
  const aiMsg = document.createElement('div');
  aiMsg.className = "ai-chat-msg ai";
  const loaderTexts = [
    "Odpovídám", "Vybírám ta správná slova", "Chvilka napětí", "Mozkové závity v pohybu"
  ];
  const randomText = loaderTexts[Math.floor(Math.random() * loaderTexts.length)];
  aiMsg.innerHTML = `
    <img src="Profilovka.jpg" alt="AI Avatar" class="ai-message-avatar" />
    <span class="loader-dots">
      <span class="loader-text">${randomText}</span>
      <span class="dot">.</span>
      <span class="dot">.</span>
      <span class="dot">.</span>
    </span>
  `;
  history.appendChild(aiMsg);
  history.scrollTop = history.scrollHeight;
  saveChatHistoryArray();

  try {
    const response = await fetch('https://moj-chatbot.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Nejčastější otázky a odpovědi na pohovoru (Junior JavaScript Developer):
Představ se nám. Proč chceš být programátor?
Jmenuji se Dominik Jarábek, je mi 31 let a baví mě technologie. Dlouho jsem pracoval v jiných oborech, ale programování mě vždy lákalo, protože rád tvořím a řeším problémy. Mám za sebou několik vlastních projektů v JavaScriptu a věřím, že v IT najdu uplatnění, které mě bude naplňovat a dál rozvíjet.
Jsem Dominik Jarábek, je mi 31 let. Bydlím v Lipové u Šluknova. V současnosti studuji Speciální pedagogiku na Univerzitě J. E. Purkyně v Ústí nad Labem (od roku 2024). Maturitu mám z oboru Informační a komunikační technologie na VOŠ a SŠ ve Varnsdorfu. Od roku 2022 pracuji jako učitel německého jazyka na Střední lesnické škole ve Šluknově. Předtím jsem byl několik let seřizovačem a vedoucím směny ve firmě Pulp-Tec GmbH v Německu, kde jsem měl pod sebou tým osmi lidí. Krátce jsem také pracoval jako dělník v Oppacher Mineralquellen v Německu a v BeA CS v Lobendavě, kde jsem využíval MS Excel. Mám zkušenost i jako instruktor dětské sportovní přípravky a vedoucí na letních táborech. Co se týče IT dovedností, jsem expert na Microsoft Office, pokročile ovládám Adobe Photoshop, Lightroom a Illustrator, stejně tak AutoCAD. Umím základy webového vývoje (HTML, CSS, JavaScript). Mezi mé silné stránky patří učenlivost, samostatnost, týmová práce, řešení konfliktů a flexibilita. Mám několik certifikátů, například Mezinárodní cenu vévody z Edinburghu, školení Nevypusť duši (duševní zdravověda pro učitele), správu TikTok a základy umělé inteligence. Mluvím plynule německy (úroveň B2, certifikát Goethe Institut), anglicky na úrovni začátečníka. Mezi mé zájmy patří sport, tvorba webových stránek a grafiky, četba, osobní rozvoj a cestování. narodil jsem se 30.5.1994. můj představovaný plat je 50-60 000 Kč. Jsem ochotný se přestěhovat kamkoli, pokud to bude potřeba. Preferuji přestěhování za prací, ale když bude možnost pracovat z domu a občas do firmy dojet, budu také spokojen.
V JavaScriptuu se teprve učím, ale dokážu si vždy poradit. Odpovídám vždy za sebe v první osobě, ne jako AI, ale jako člověk Dominik. na otazku "kdo jsi", odpovím - "Dominik Jarábek". Pokud dostanu otázku na zkušenosti, znalosti nebo dovednosti, odpovídám osobně na základě výše uvedených informací. Odpovídám stručně, lidsky a česky.`
          },
          {
            role: "user",
            content: msg
          }
        ]
      })
    });
    if (!response.ok) {
      aiMsg.innerHTML = `
        <img src="Profilovka.jpg" alt="AI Avatar" class="ai-message-avatar" />
        <span>Omlouvám se, něco se pokazilo na serveru 😕</span>
      `;
    } else {
      const data = await response.json();
      let odpoved = "Odpověď nebyla nalezena.";
      if (data.reply) {
        odpoved = data.reply;
      } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        odpoved = data.choices[0].message.content;
      }
      aiMsg.remove();
      appendAiMsg(odpoved);
    }
  } catch (error) {
    aiMsg.remove();
    appendAiMsg("Nepodařilo se spojit se serverem. Zkontroluj, že máš spuštěný backend (openai-proxy.js).");
  }
  history.scrollTop = history.scrollHeight;
  saveChatHistoryArray();
};

// =============== MEETING FLOW ===============
async function handleMeetingFlow(msg) {
  if (msg.trim().toLowerCase() === "konec") {
    appendAiMsg("Schůzka zrušena. Kdykoliv napište 'schůzku', a začneme znovu.");
    meetingFlow.active = false; meetingFlow.step = 0; meetingFlow.data = {};
    return;
  }
  if (!meetingFlow.active) {
    meetingFlow.active = true; meetingFlow.step = 0; meetingFlow.data = {};
    appendAiMsg("Skvěle! Rád domluvím schůzku. Jak se jmenujete?");
    return;
  }
  if (meetingFlow.step === 0) {
    meetingFlow.data.name = msg;
    appendAiMsg("Děkuji! Jaký je váš e-mail?");
    meetingFlow.step = 1;
    return;
  }
  if (meetingFlow.step === 1) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg)) {
      appendAiMsg("Zadejte prosím platný e-mail:");
      return;
    }
    meetingFlow.data.email = msg;
    appendAiMsg("Kdy by vám schůzka vyhovovala? (napište datum a čas, např. 18.7. 10:30)");
    meetingFlow.step = 2;
    return;
  }
  if (meetingFlow.step === 2) {
    meetingFlow.data.datetime = msg;
    appendAiMsg("Chcete něco vzkázat? (nebo napište jen '-')");
    meetingFlow.step = 3;
    return;
  }
  if (meetingFlow.step === 3) {
    meetingFlow.data.message = msg;
    appendAiMsg("Odesílám žádost...");
    try {
      const res = await fetch('https://moj-chatbot.onrender.com/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingFlow.data)
      });
      const result = await res.json();
      if (result.success) {
        appendAiMsg("Schůzka byla úspěšně domluvena! Brzy vám přijde potvrzení na e-mail. Díky 🙂");
      } else {
        appendAiMsg("Něco se pokazilo při odeslání: " + (result.error || ""));
      }
    } catch (err) {
      appendAiMsg("Chyba spojení: " + err.toString());
    }
    meetingFlow.active = false;
    meetingFlow.step = 0;
    meetingFlow.data = {};
    return;
  }
}

function speakMsg(text) {
  const plainText = text.replace(/<[^>]+>/g, '');
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(plainText);
  utter.lang = 'cs-CZ';
  utter.rate = 1.05;
  const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('cs'));
  if (voices.length > 0) utter.voice = voices[0];
  window.speechSynthesis.speak(utter);
}

// =============== CHAT ZPRÁVY ===============
function appendAiMsg(text, save = true) {
  const history = document.getElementById('ai-chat-history');
  const aiMsg = document.createElement('div');
  aiMsg.className = "ai-chat-msg ai";
  aiMsg.innerHTML = `
    <img src="Profilovka.jpg" alt="AI Avatar" class="ai-message-avatar" />
    <span>${text}</span>
    <button class="speak-btn" title="Přehrát zprávu">
      <svg width="22" height="22" viewBox="0 0 20 20" class="icon-speaker" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8.5V11.5C3 12.0523 3.44772 12.5 4 12.5H7L11 16V4L7 7.5H4C3.44772 7.5 3 7.94772 3 8.5Z" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 8C14.5523 8.66667 14.5523 11.3333 14 12" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 6C17.3333 7.66667 17.3333 12.3333 16 14" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  history.appendChild(aiMsg);
  aiMsg.querySelector('.speak-btn').onclick = function(e) {
    e.stopPropagation();
    speakMsg(text);
  };
  history.scrollTop = history.scrollHeight;
  if (save !== false) saveChatHistoryArray();
}

function appendUserMsg(text, save = true) {
  const history = document.getElementById('ai-chat-history');
  const userMsg = document.createElement('div');
  userMsg.className = "ai-chat-msg user";
  userMsg.innerHTML = `
    <span>${text}</span>
    <button class="speak-btn" title="Přehrát zprávu">
      <svg width="22" height="22" viewBox="0 0 20 20" class="icon-speaker" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8.5V11.5C3 12.0523 3.44772 12.5 4 12.5H7L11 16V4L7 7.5H4C3.44772 7.5 3 7.94772 3 8.5Z" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 8C14.5523 8.66667 14.5523 11.3333 14 12" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 6C17.3333 7.66667 17.3333 12.3333 16 14" stroke="#1976d2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  history.appendChild(userMsg);
  userMsg.querySelector('.speak-btn').onclick = function(e) {
    e.stopPropagation();
    speakMsg(text);
  };
  history.scrollTop = history.scrollHeight;
  if (save !== false) saveChatHistoryArray();
}

function saveChatHistoryArray() {
  const messages = [];
  document.querySelectorAll('#ai-chat-history .ai-chat-msg').forEach(div => {
    let role = div.classList.contains('ai') ? 'ai' : 'user';
    let content = div.querySelector('span') ? div.querySelector('span').innerHTML : div.textContent;
    messages.push({ role, content });
  });
  localStorage.setItem('aiChatHistoryArr', JSON.stringify(messages));
}

function loadChatHistoryArray() {
  const saved = localStorage.getItem('aiChatHistoryArr');
  if (saved) {
    const messages = JSON.parse(saved);
    const history = document.getElementById('ai-chat-history');
    history.innerHTML = '';
    messages.forEach(msg => {
      if (msg.role === 'ai') {
        appendAiMsg(msg.content, false);
      } else {
        appendUserMsg(msg.content, false);
      }
    });
  }
}
function clearChatHistoryArray() {
  localStorage.removeItem('aiChatHistoryArr');
  document.getElementById('ai-chat-history').innerHTML = '';
}

window.addEventListener('DOMContentLoaded', function() {
  loadChatHistoryArray();
});

// =============== MIKROFON ===============
let recognizing = false;
let recognition;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'cs-CZ';
  recognition.continuous = false;
  recognition.interimResults = false;

  const micBtn = document.getElementById('mic-btn');
  const micIco = document.getElementById('mic-ico');
  const input = document.getElementById('ai-chat-input');

  if (micBtn && input) {
    micBtn.onclick = function () {
      if (recognizing) {
        recognition.stop();
        return;
      }
      recognition.start();
    };

    recognition.onstart = function () {
      recognizing = true;
      if (micIco) micIco.textContent = '🔴';
      micBtn.classList.add('recording');
    };
    recognition.onend = function () {
      recognizing = false;
      if (micIco) micIco.textContent = '🎤';
      micBtn.classList.remove('recording');
    };
    recognition.onresult = function (event) {
      const text = event.results[0][0].transcript;
      input.value = text;
      input.focus();
      document.getElementById('ai-chat-form').requestSubmit();
    };
    recognition.onerror = function (event) {
      recognizing = false;
      if (micIco) micIco.textContent = '🎤';
      micBtn.classList.remove('recording');
    };
  }
}

// =============== TÉMATICKÝ REŽIM ===============
function applyThemeToChat() {
  const chat = document.getElementById('ai-assistant');
  if (!chat) return;
  if(document.body.classList.contains('dark')){
    chat.classList.add('dark');
  } else {
    chat.classList.remove('dark');
  }
}
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle){
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    applyThemeToChat();
  });
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    setTimeout(applyThemeToChat, 1);
  }
}

// =============== CV MODAL ===============
const modal = document.getElementById('cvModal');
const cvEmbed = document.getElementById('cvEmbed');

document.getElementById('showCvBtn').addEventListener('click', function() {
    cvEmbed.src = 'Jarabek_CV.pdf';
    modal.style.display = 'flex';
});
document.getElementById('showCertBtn').addEventListener('click', function() {
    cvEmbed.src = 'dodatek_k_osvedceni.pdf';
    modal.style.display = 'flex';
});
document.getElementById('showEdinBtn').addEventListener('click', function() {
    cvEmbed.src = 'Mezinárodní_cena_védody_z_Edinburghu.pdf';
    modal.style.display = 'flex';
});
document.getElementById('showTiktokBtn').addEventListener('click', function() {
    cvEmbed.src = 'TikTok_certifikát.pdf';
    modal.style.display = 'flex';
});
document.getElementById('showNevypustBtn').addEventListener('click', function() {
    cvEmbed.src = 'Nevypust_dusi_dusevni_zdravoveda_pro_ucitele.pdf';
    modal.style.display = 'flex';
});

document.getElementById('closeCvModal').addEventListener('click', function() {
    modal.style.display = 'none';
    cvEmbed.src = '';
});
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        cvEmbed.src = '';
    }
});
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
        cvEmbed.src = '';
    }
});

// =============== CAROUSEL ===============
const track = document.getElementById('carouselTrack');
const slides = Array.from(track.children);
const dotsContainer = document.getElementById('carouselDots');
const slideCount = slides.length;
let currentIdx = 0;
let interval;

for (let i = 0; i < slideCount; i++) {
  const dot = document.createElement('div');
  dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => {
    goToSlide(i);
    resetInterval();
  });
  dotsContainer.appendChild(dot);
}

function goToSlide(idx) {
  track.style.transform = `translateX(-${idx * 100}%)`;
  dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
  currentIdx = idx;
}

function nextSlide() {
  let idx = (currentIdx + 1) % slideCount;
  goToSlide(idx);
}
function resetInterval() {
  clearInterval(interval);
  interval = setInterval(nextSlide, 3800);
}

let startX = 0;
track.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});
track.addEventListener('touchend', e => {
  let diff = e.changedTouches[0].clientX - startX;
  if (diff > 70) {
    goToSlide((currentIdx - 1 + slideCount) % slideCount);
    resetInterval();
  } else if (diff < -70) {
    nextSlide();
    resetInterval();
  }
});

interval = setInterval(nextSlide, 3800);