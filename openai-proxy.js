console.log("✅ SPUŠTĚNA AKTUÁLNÍ VERZE SERVERU");

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb', type: 'application/json' }));

// Servíruj frontend ze složky "public"
app.use(express.static('public'));

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

app.post('/api/chat', async (req, res) => {
  try {
    let { messages, systemPrompt, botType } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Chybí OPENAI_API_KEY v .env souboru!" });
    }

    if (systemPrompt) {
      if (messages.length && messages[0].role === "system") {
        messages[0].content = systemPrompt;
      } else {
        messages = [{ role: "system", content: systemPrompt }, ...messages];
      }
    } else if (botType) {
      let prompt = "Jsi nápomocný asistent.";
      if (botType === "therapist") {
        prompt = "Jsi laskavý terapeutický asistent. Pomáháš uživateli zvládat úzkosti, panické ataky, špatné myšlenky nebo stres.";
      } else if (botType === "motivator") {
        prompt = "Jsi energický motivátor.";
      }
      if (messages.length && messages[0].role === "system") {
        messages[0].content = prompt;
      } else {
        messages = [{ role: "system", content: prompt }, ...messages];
      }
    }

    console.log("Posílám na OpenAI:", messages);

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

app.post('/api/meeting', async (req, res) => {
  try {
    const { name, email, datetime, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jarabek.do@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: 'jarabek.do@gmail.com',
      to: 'jarabek.do@gmail.com',
      subject: `Nová žádost o schůzku od ${name}`,
      text: `Jméno: ${name}
E-mail: ${email}
Termín: ${datetime}
Vzkaz: ${message}`
    };

    await transporter.sendMail(mailOptions);

    const userMail = {
      from: 'jarabek.do@gmail.com',
      to: email,
      subject: 'Potvrzení odeslání žádosti o schůzku',
      text: `Dobrý den ${name},

potvrzuji, že jsme obdrželi vaši žádost o schůzku.

Termín: ${datetime}
Vzkaz: ${message}

Ozvu se vám co nejdříve.

S pozdravem,
Dominik Jarábek`
    };

    await transporter.sendMail(userMail);

    res.json({ success: true, message: "Schůzka byla domluvena!" });
  } catch (err) {
    console.error("Chyba při odesílání e-mailu:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

app.post('/api/places', async (req, res) => {
  console.log("🔍 ZACHYCENO tělo požadavku:", req.body);
  const { city, lat, lng } = req.body;

  let location;
  if (lat && lng) {
    location = { lat, lng };
    console.log("📍 Používám aktuální polohu:", location);
  } else if (city) {
    const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: city, key: process.env.GOOGLE_API_KEY }
    });
    location = geoRes.data.results[0]?.geometry?.location;
    if (!location) return res.status(404).json({ error: 'Město nebylo nalezeno.' });
  } else {
    return res.status(400).json({ error: 'Zadej město nebo polohu.' });
  }

  const placesRes = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
    params: {
      location: `${location.lat},${location.lng}`,
      radius: 5000,
      keyword: 'museum OR castle OR church OR monument OR park',
      key: process.env.GOOGLE_API_KEY
    }
  });

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const toRad = deg => deg * Math.PI / 180;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const results = placesRes.data.results.map(place => {
    const placeLoc = place.geometry?.location;
    if (placeLoc) {
      place.distance = haversine(location.lat, location.lng, placeLoc.lat, placeLoc.lng);
    }
    return place;
  });

  res.json(results);
});

app.post('/debug-body', (req, res) => {
  console.log("✅ TEST: Tělo požadavku je:", req.body);
  res.json({ received: req.body });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`✅ Proxy běží na http://localhost:${PORT}`);
});
