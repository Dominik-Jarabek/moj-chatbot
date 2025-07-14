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
