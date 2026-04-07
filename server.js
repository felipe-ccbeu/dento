const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  const text = req.body.message?.text || "";

  let resposta = "Comando não reconhecido 😅";

  if (text === "/ping") {
    resposta = "🏓 Pong!";
  }

  if (text === "/hora") {
    resposta = `Agora são: ${new Date().toLocaleString()}`;
  }

  if (text.startsWith("/eco")) {
    resposta = text.replace("/eco ", "");
  }

  res.json({ text: resposta });
});

app.listen(3000, () => console.log("Rodando..."));
