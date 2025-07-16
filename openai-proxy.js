// openai-proxy.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servíruj frontend (psycho.html apod.) ze složky "public"
app.use(express.static('public'));

// TEST endpoint pro ověření API klíče (volitelně smaž později)
app.get('/test', async (req, res) => {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString(), detail: error.response?.data });
  }
});

// API endpoint pro OpenAI chat
app.post('/api/chat', async (req, res) => {
  try {
    let { messages, systemPrompt, botType } = req.body;

    // Kontrola API klíče
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Chybí OPENAI_API_KEY v .env souboru!" });
    }

    // Dynamický system prompt
    if (systemPrompt) {
      if (messages.length && messages[0].role === "system") {
        messages[0].content = systemPrompt;
      } else {
        messages = [{ role: "system", content: systemPrompt }, ...messages];
      }
    } else if (botType) {
      let prompt = "Jsi nápomocný asistent.";
      if (botType === "therapist") {
        prompt = "Jsi laskavý terapeutický asistent. Pomáháš uživateli zvládat úzkosti, panické ataky, špatné myšlenky nebo stres. Odpovídej česky, přívětivě, povzbudivě a krátce. Nikdy nekritizuj, nedáváš diagnózy, dáváš jednoduché tipy na uklidnění a nadhled.";
      } else if (botType === "motivator") {
        prompt = "Jsi energický motivátor, dodáváš odvahu, naději a pozitivní náhled na věci.";
      }
      if (messages.length && messages[0].role === "system") {
        messages[0].content = prompt;
      } else {
        messages = [{ role: "system", content: prompt }, ...messages];
      }
    }

    // LOGUJ CO ODESÍLÁŠ
    console.log("Posílám na OpenAI:", {
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.8
    });

    // volání OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.8
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Chyba při volání OpenAI API:", error.response?.data || error.toString());
    res.status(500).json({ error: error.toString(), detail: error.response?.data });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Proxy běží na http://localhost:${PORT}`);
});

//Domluva schuzky

const nodemailer = require('nodemailer');

// ... existující kód (Express, axios atd.)

// Endpoint pro domluvení schůzky
app.post('/api/meeting', async (req, res) => {
  try {
    const { name, email, datetime, message } = req.body;

    // Nodemailer transporter (Gmail, bezpečnější je použít heslo aplikace)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jarabek.do@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // nastav do .env!
      },
    });

    const mailOptions = {
      from: 'jarabek.do@gmail.com',
      to: 'jarabek.do@gmail.com', // přijde na tebe
      subject: `Nová žádost o schůzku od ${name}`,
      text: `
Jméno: ${name}
E-mail: ${email}
Termín: ${datetime}
Vzkaz: ${message}
      `.trim()
    };

    await transporter.sendMail(mailOptions);

     // Druhý e-mail přijde uživateli (potvrzení pro něj)
    const userMail = {
      from: 'jarabek.do@gmail.com',
      to: email, // POZOR: jeho e-mail!
      subject: 'Potvrzení odeslání žádosti o schůzku',
      text: `
Dobrý den ${name},

potvrzuji, že jsme obdrželi vaši žádost o schůzku.

Termín: ${datetime}
Vzkaz: ${message}

Ozvu se vám co nejdříve.

S pozdravem,
Dominik Jarábek
      `.trim()
    };

    await transporter.sendMail(userMail); // ← TADY JE TO NAVÍC!

    res.json({ success: true, message: "Schůzka byla domluvena! Očekávej potvrzení v e-mailu." });
  } catch (err) {
    console.error("Chyba při odesílání e-mailu:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});
