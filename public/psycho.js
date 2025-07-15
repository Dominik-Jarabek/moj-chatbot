// Základní ovládání okna
const fab = document.getElementById('chatbot-fab');
const win = document.getElementById('chatbot-window');
const closeBtn = document.getElementById('chatbot-close');
const messages = document.getElementById('chatbot-messages');
const input = document.getElementById('chatbot-input');
const sendBtn = document.getElementById('chatbot-send');

fab.onclick = () => { win.style.display = 'flex'; input.focus(); };
closeBtn.onclick = () => { win.style.display = 'none'; };
input.onkeydown = e => { if(e.key === 'Enter') sendBtn.click(); };
sendBtn.onclick = sendMessage;

function addMsg(text, sender) {
  const d = document.createElement('div');
  d.className = 'msg ' + sender;
  d.innerHTML = text;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

// FAQ data (můžeš později nahradit voláním API nebo větším polem)
const FAQ = [
  { q: "Jak tě mohu kontaktovat?", a: "Můžeš mi napsat sem nebo mě kontaktovat na e-mailu info@mojemail.cz." },
  { q: "Kde najdu tvé CV?", a: "Pro získání mého CV napiš /cv." },
  { q: "Na co se specializuješ?", a: "Specializuji se na webový vývoj, Python a AI nástroje." }
];

// === Uchovávání historie celé konverzace pro paměť bota ===
const systemPrompt = `
Jsi terapeut v anonymním chatu. Odpovídáš česky, velmi empaticky, klidně a nikdy nesoudíš.
Nedáváš diagnózy, nepřesvědčuješ, netvrdíš, že jsi doktor. Nikdy nehodnotíš uživatele. Povzbuzuješ, normalizuješ jeho emoce, doptáváš se na potřeby nebo pocity a doporučuješ v případě potřeby kontaktovat krizové linky nebo odborníka.
Odpovídáš v krátkých, srozumitelných větách. Jsi na straně uživatele, nabízíš podporu, ale nikdy neříkáš věty jako "jsem jen AI" nebo "jsem stroj". Vždy piš v první osobě jako skutečný člověk v roli terapeuta.
`;
// Základní pole pro historii konverzace (paměť)
let chatHistory = [
  {role: "system", content: systemPrompt}
];

// Vloží úvodní zprávu bota (jen vizuálně, do historie ji NEukládáme, AI ji nevidí)
if (messages.childElementCount === 0) {
  addMsg("Ahoj, jsem tu pro tebe. Můžeš mi anonymně napsat, co tě trápí, nebo jen popsat, jak se cítíš. Společně to zvládneme.", "bot");
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMsg(text, "user");
  input.value = "";

  // Přidej zprávu do historie
  chatHistory.push({role: "user", content: text});

  // "Nahrávám..." zpráva
  addMsg("...", "bot");

  // 1. Zpracuj speciální příkaz na CV
  if (text.toLowerCase().includes('/cv')) {
    messages.removeChild(messages.lastChild);
    addMsg('Tady najdeš mé aktuální CV: <a href="https://tvujweb.cz/path/k-tvemu-cv.pdf" target="_blank">Otevřít CV</a><br>Pokud chceš vědět víc, napiš třeba /faq nebo svou otázku.', "bot");
    // Přidej odpověď do historie pro kontext
    chatHistory.push({role: "assistant", content: 'Tady najdeš mé aktuální CV: https://tvujweb.cz/path/k-tvemu-cv.pdf'});
    return;
  }

  // 2. Zkus najít odpověď ve FAQ
  let foundFAQ = null;
  for (const faq of FAQ) {
    if (text.toLowerCase().includes(faq.q.toLowerCase())) {
      foundFAQ = faq.a;
      break;
    }
  }
  if (foundFAQ) {
    messages.removeChild(messages.lastChild);
    addMsg(foundFAQ, "bot");
    // Přidej odpověď do historie pro kontext
    chatHistory.push({role: "assistant", content: foundFAQ});
    return;
  }

  // 3. Pokud není ani FAQ, pošli celou historii do backendu (OpenAI / fallback)
  try {
    const res = await fetch('https://moj-chatbot.onrender.com/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        messages: chatHistory
      })
    });
    messages.removeChild(messages.lastChild);

    if (!res.ok) {
      addMsg("Omlouvám se, něco se pokazilo. Zkus to později nebo napiš na linku důvěry. ❤️", "bot");
      return;
    }
    const data = await res.json();
    let reply = data.reply
      || (data.choices && data.choices[0]?.message?.content)
      || "Teď se mi nedaří odpovědět, ale myslím na tebe. Zkus to za chvilku znovu.";

    addMsg(reply, "bot");
    // Ulož odpověď do historie pro kontext do příště
    chatHistory.push({role: "assistant", content: reply});
  } catch (err) {
    messages.removeChild(messages.lastChild);
    addMsg("Nepodařilo se spojit se serverem. Pokud potřebuješ okamžitou podporu, zavolej na linku 116 123.", "bot");
  }
}
// === SOS MINIAPLIKACE PRVNÍ POMOC + DECHOVÉ KOLEČKO ===
const sosBtn = document.getElementById('sos-btn');
const sosModal = document.getElementById('sos-modal');
const sosClose = document.getElementById('sos-close');
const step1 = document.getElementById('sos-step-1');
const step2 = document.getElementById('sos-step-2');

// Dechová miniapp
const breathApp = document.getElementById('breath-app');
const breathStart = document.getElementById('breath-start');
const breathStop = document.getElementById('breath-stop');
const breathExit = document.getElementById('breath-exit');

const HELP_CONTENT = {
  stres: {
    msg: "To, že se teď cítíš pod tlakem, je úplně v pořádku. Zkusme spolu krátké dechové cvičení, které tě na chvíli ukotví v přítomnosti.",
    actions: [
      { label: "Dýchací cvičení", action: "breath" },
      { label: "Grounding – 5 smyslů", action: "ground" }
    ]
  },
  uzkost: {
    msg: "Úzkost může být velmi nepříjemná, ale společně ji teď zvládneme. Důležité je, že v tom nejsi sám/sama.",
    actions: [
      { label: "Dýchací cvičení", action: "breath" },
      { label: "Uklidnit myšlenky", action: "soothe" }
    ]
  },
  smutek: {
    msg: "Smutek patří k životu, i když někdy bolí. Dovol si ho cítit – já jsem tu s tebou. Pokud chceš, můžeme spolu udělat malé povzbudivé cvičení.",
    actions: [
      { label: "Povzbuzení", action: "encourage" },
      { label: "Kontakt na krizovou linku", action: "hotline" }
    ]
  },
  nevim: {
    msg: "Někdy je těžké popsat, co přesně cítíš. I to je v pořádku. Zkusme najít společně chvilku klidu.",
    actions: [
      { label: "Rychlé dechové cvičení", action: "breath" },
      { label: "Grounding – 5 smyslů", action: "ground" }
    ]
  },
  krize: {
    msg: "Pokud máš pocit, že už nemůžeš, okamžitě volej Linku bezpečí 116 123 (zdarma, nonstop). Nejste na to sami – pomoc je na dosah.",
    actions: [
      { label: "Zobrazit kontakty", action: "hotline" }
    ]
  }
};

function showSOSStep2(feeling) {
  const data = HELP_CONTENT[feeling];
  let html = `<h2>${feeling === "krize" ? "🚨" : "🆘"} První pomoc</h2>
    <div class="sos-tip">${data.msg}</div>
    <div class="sos-actions">`;
  for (let a of data.actions) {
    html += `<button class="sos-action-btn" data-action="${a.action}">${a.label}</button>`;
  }
  html += `<button class="sos-action-btn" style="background:#f2f2f2;color:#1976d2;font-weight:600;margin-top:12px;" id="sos-back">← Zpět</button>`;
  html += `</div>
    <div class="sos-hotline">
      <div>Potřebujete akutní pomoc? Volejte <a href="tel:116123">116 123</a> (Linka důvěry) nebo <a href="tel:116111">116 111</a> (dětská linka).</div>
    </div>`;
  step2.innerHTML = html;
  step1.style.display = "none";
  step2.style.display = "block";
}

// Otevření, zavření modalu
sosBtn.onclick = () => { sosModal.classList.add('open'); step1.style.display="block"; step2.style.display="none"; }
sosClose.onclick = () => { sosModal.classList.remove('open'); }
window.onclick = e => { if(e.target === sosModal) sosModal.classList.remove('open'); }
document.querySelectorAll('.sos-choice').forEach(btn => {
  btn.onclick = e => showSOSStep2(btn.dataset.feeling);
});

// Delegace pro krok2 (cvičení)
step2.onclick = e => {
  if(e.target.classList.contains('sos-action-btn')) {
    const action = e.target.dataset.action;
    if(action === "breath") {
      sosModal.classList.remove('open');
      breathApp.style.display = "flex";
      setTimeout(() => breathApp.classList.add("active"), 10);
    } else if(action === "ground") {
      step2.innerHTML = `<h2>🌱 Grounding: 5 smyslů</h2>
      <div class="sos-tip">Rozhlédni se kolem sebe a pojmenuj:<br>
        <b>5</b> věcí, které vidíš.<br>
        <b>4</b> věci, kterých se můžeš dotknout.<br>
        <b>3</b> věci, které slyšíš.<br>
        <b>2</b> věci, které cítíš čichem.<br>
        <b>1</b> věc, kterou cítíš v ústech.<br><br>
        <button class="sos-action-btn" id="sos-back2">← Zpět</button>
      </div>`;
    } else if(action === "soothe") {
      step2.innerHTML = `<h2>🧘 Zklidnění mysli</h2>
      <div class="sos-tip">Zkuste si položit ruku na hrudník. Opakuj si: "Tohle zvládnu. Je to jen vlna, která přejde." Zkus se soustředit na svůj dech a pomalu ho prodlužuj.<br><br>
      <button class="sos-action-btn" id="sos-back2">← Zpět</button>
      </div>`;
    } else if(action === "encourage") {
      step2.innerHTML = `<h2>🌤 Povzbuzení</h2>
      <div class="sos-tip">Všechno jednou přejde. I tenhle těžký den skončí. Zasloužíš si pochvalu už jen za to, že tohle čteš a hledáš pomoc. <br><br>
      <button class="sos-action-btn" id="sos-back2">← Zpět</button>
      </div>`;
    } else if(action === "hotline") {
      step2.innerHTML = `<h2>📞 Kontakty na pomoc</h2>
      <div class="sos-tip">
      <b>Linka důvěry:</b> <a href="tel:116123">116 123</a> <br>
      <b>Linka bezpečí:</b> <a href="tel:116111">116 111</a> <br>
      <b>Chat linky:</b> <a href="https://www.modralinka.cz/chat/" target="_blank">modralinka.cz/chat</a>
      <br><br>
      <button class="sos-action-btn" id="sos-back2">← Zpět</button>
      </div>`;
    }
  }
  // Zpět v druhém kroku
  if(e.target.id === "sos-back" || e.target.id === "sos-back2") {
    step1.style.display = "block";
    step2.style.display = "none";
  }
}

// ==== Dechové kolečko – PROFI ANIMACE MINIAPP ====
const inhaleSec = 4, holdSec = 4, exhaleSec = 6;
let breathPhase = 0, breathInterval = null, isBreathing = false, cycleCount = 0;
const phaseText = document.getElementById('breath-phase');
const desc = document.getElementById('breath-desc');
const progressCircle = document.getElementById('progress');
const info = document.getElementById('breath-progress-info');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function setCircle(percent) {
  progressCircle.style.strokeDashoffset = 276 - 276 * percent;
}

async function runBreathing() {
  isBreathing = true; cycleCount = 0;
  desc.textContent = "Zhluboka dýchej podle animace…";
  breathStart.style.display = "none";
  breathStop.style.display = "";
  breathExit.style.display = "";
  info.textContent = "";

  while (isBreathing) {
    cycleCount++;
    info.textContent = `Cyklus ${cycleCount} • (doporučeno 3–5x)`;

    // Nádech
    phaseText.textContent = "Nádech…";
    phaseText.style.color = "#1976d2";
    for(let t=0; t<=inhaleSec*20 && isBreathing; t++) {
      setCircle(t/(inhaleSec*20));
      await sleep(50);
    }
    // Zadrž dech
    phaseText.textContent = "Zadrž…";
    phaseText.style.color = "#1b8f57";
    await sleep(holdSec*1000);

    // Výdech
    phaseText.textContent = "Výdech…";
    phaseText.style.color = "#0d47a1";
    for(let t=0; t<=exhaleSec*20 && isBreathing; t++) {
      setCircle(1 - t/(exhaleSec*20));
      await sleep(50);
    }
    if(!isBreathing) break;
    // Pauza (mezi cykly)
    phaseText.textContent = "Chvilku klidu…";
    phaseText.style.color = "#888";
    setCircle(0);
    await sleep(800);
  }
  // Reset, pokud už neběží
  if(!isBreathing) {
    phaseText.textContent = "Připraven?";
    phaseText.style.color = "#1976d2";
    desc.textContent = "Klikni na start!";
    info.textContent = "";
    setCircle(0);
    breathStart.style.display = "";
    breathStop.style.display = "none";
    breathExit.style.display = "none";
  }
}
breathStart.onclick = () => {
  if(!isBreathing) { isBreathing = true; runBreathing(); }
};
breathStop.onclick = () => {
  isBreathing = false;
};
breathExit.onclick = () => {
  isBreathing = false;
  breathApp.classList.remove("active");
  setTimeout(()=>{ breathApp.style.display = "none"; }, 300);
};
// Inicializace
setCircle(0);
breathStop.style.display = "none";
breathExit.style.display = "none";
phaseText.textContent = "Připraven?";
desc.textContent = "Klikni na start!";
const moodEmojis = {
  1: "😭",
  2: "😢",
  3: "😐",
  4: "🙂",
  5: "😃"
};

let currentMood = 1;
let moodProgress = 1;
let moodClicksToNext = 5; // kolik kliků je třeba pro posun
let moodClicks = 0;

// Výběr nálady
document.querySelectorAll('.bubble-mood').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.bubble-mood').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentMood = parseInt(btn.dataset.mood);
    moodProgress = currentMood;
    // aktualizuj i bubbleStart.disabled = false; pokud chceš, nebo schovej chybovou hlášku
  }
});

// === Klikací antistresová hra – fullscreen ===
const bubbleBtn = document.getElementById('bubble-game-btn');
const bubbleModal = document.getElementById('bubble-game-modal');
const bubbleClose = document.getElementById('bubble-close');
const bubbleStart = document.getElementById('bubble-start');
const bubbleScore = document.getElementById('bubble-score');
const bubbleTimer = document.getElementById('bubble-timer');
const bubbleEnd = document.getElementById('bubble-end-message');
const bubbleFinalScore = document.getElementById('bubble-final-score');
const bubbleGameOverlay = document.getElementById('bubble-game-overlay');
const bubbleMoodSelect = document.getElementById('bubble-mood-select');
const bubbleMusic = document.getElementById('bubble-music');

let bubbleInterval = null, timeLeft = 15, score = 0, playing = false;

bubbleBtn.onclick = () => {
  bubbleModal.classList.add('open');
  resetBubbleGame();
  document.body.style.overflow = "hidden";
  // Hudbu jen pauzni (pro případ, že by někdo zavřel modal před spuštěním hry)
  bubbleMusic.pause();
  bubbleMusic.currentTime = 0;
};

bubbleClose.onclick = () => { 
  bubbleModal.classList.remove('open');
  document.body.style.overflow = "";
  removeBubble();
  bubbleMusic.pause();
  bubbleMusic.currentTime = 0;
};

function resetBubbleGame() {
  removeBubble();
  bubbleScore.textContent = '0';
  bubbleTimer.textContent = '15';
  bubbleEnd.style.display = 'none';
  bubbleStart.style.display = 'inline-block';
  score = 0; timeLeft = 16; playing = false;
  clearInterval(bubbleInterval);
  // Reset nálady na výběr
  currentMood = 1; moodProgress = 1; moodClicks = 0;
  document.querySelectorAll('.bubble-mood').forEach(b => b.classList.remove('selected'));
  bubbleMoodSelect.style.display = "block";
}

bubbleStart.onclick = () => {
  if(!document.querySelector('.bubble-mood.selected')) {
    alert("Vyberte, jak se cítíte, ať může hra začít.");
    return;
  }
  startBubbleGame();
};

function startBubbleGame() {
  playing = true;
  bubbleStart.style.display = 'none';
  bubbleScore.textContent = '0';
  score = 0; timeLeft = 15;
  bubbleTimer.textContent = timeLeft;
  bubbleEnd.style.display = 'none';
  removeBubble();
  moodProgress = currentMood;
  moodClicks = 0;
  bubbleMoodSelect.style.display = "none";
  spawnBubble();
  bubbleMusic.play();
  

  bubbleInterval = setInterval(() => {
    timeLeft--;
    bubbleTimer.textContent = timeLeft;
    if (timeLeft <= 0) {
      endBubbleGame();
    }
  }, 1000);
}

function endBubbleGame() {
  playing = false;
  clearInterval(bubbleInterval);
  removeBubble();
  bubbleEnd.style.display = 'block';
  bubbleFinalScore.textContent = score;
  bubbleStart.style.display = 'inline-block';
  bubbleMusic.pause();
  bubbleMusic.currentTime = 0;

  // Zpráva o dosažené náladě
  let moodText = "Nezůstávej sám/sama, klidně si zahraj znovu!";
  if (moodProgress === 5) moodText = "Skvělé! Dosáhl/a jsi nejlepší možné nálady! 😃";
  else if (moodProgress > currentMood) moodText = `Posunul/a ses na lepší úroveň nálady (${moodEmojis[moodProgress]})!`;
  else moodText = `Zkus znovu zlepšit svou náladu (${moodEmojis[moodProgress]}).`;
  bubbleEnd.innerHTML += `<div style="margin-top:14px; font-size:1.13em; color:#1976d2;"><b>${moodText}</b></div>`;
}

function spawnBubble() {
  if (!playing) return;
  removeBubble();
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const overlayRect = bubbleGameOverlay.getBoundingClientRect();
  const bWidth = Math.min(60, overlayRect.width * 0.15); // adaptivní velikost
  const bHeight = Math.min(60, overlayRect.height * 0.15);
  const x = Math.random() * (overlayRect.width - bWidth - 20) + 10;
  const y = Math.random() * (overlayRect.height - bHeight - 20) + 10;
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.width = `${bWidth}px`;
  bubble.style.height = `${bHeight}px`;
  bubble.innerHTML = moodEmojis[moodProgress];
  bubble.addEventListener('click', () => {
    if (!playing) return;
    score++;
    bubbleScore.textContent = score;
    moodClicks++;
    if(moodProgress < 5 && moodClicks >= moodClicksToNext) {
      moodProgress++;
      moodClicks = 0;
      // Krátký efekt, že jsi postoupil
      bubbleGameOverlay.style.animation = 'flashGood 0.32s';
      setTimeout(()=>bubbleGameOverlay.style.animation='', 330);
    }
    spawnBubble();
  });
  bubbleGameOverlay.appendChild(bubble);
}

// Malý efekt pro posun úrovně
const style = document.createElement('style');
style.textContent = `
@keyframes flashGood {
  0% { background: #b9ffb3bb; }
  100% { background: none; }
}`;
document.head.appendChild(style);

function removeBubble() {
  bubbleGameOverlay.innerHTML = '';
}
