const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// >>> ZDE přidáš servírování frontendu <<<
app.use(express.static('public'));

// ---- API endpoint pro OpenAI chat ----
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // nastav v .env!

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // nebo gpt-4o (dle kreditu)
        messages: messages,
        temperature: 0.8
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// ---- Start serveru ----
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Proxy běží na http://localhost:${PORT}`);
});
