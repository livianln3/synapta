const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 1. Servir os arquivos do Cordova (pasta www)
app.use(express.static(path.join(__dirname, "www")));

// 🔹 2. Endpoint para a API Groq
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Mensagem do usuário não enviada" });
  }

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente que só responde com rotinas organizadas de domingo a domingo. Sempre devolva a resposta estruturada como uma lista clara, separando cada dia da semana.",
          },
          {
            role: "user",
            content: `Baseado no seguinte pedido: "${userMessage}". Responda APENAS sugerindo rotinas de domingo a domingo.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("Resposta da API Groq:", data);

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "Resposta inesperada da API Groq" });
    }

    const reply = data.choices[0].message?.content;

    if (!reply) {
      return res.status(500).json({ error: "Resposta sem conteúdo da API Groq" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Erro ao acessar API da Groq:", err);
    res.status(500).json({ error: "Erro ao acessar API da Groq" });
  }
});

// 🔹 3. Rota fallback segura (Express 4 ou 5)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "www", "index.html"));
});

// 🔹 4. Porta única para tudo
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Servido rodando em http://localhost:${PORT}`);
});
