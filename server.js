const express = require("express");
const app = express();

app.use(express.json());

// 👉 versão única (troque sempre que fizer deploy)
const VERSION = "v2.1 - ping debug";

app.get("/", (req, res) => {
  res.send(`Servidor ativo | ${VERSION}`);
});

app.get("/webhook", (req, res) => {
  res.send(`Webhook ativo | ${VERSION}`);
});

app.post("/webhook", (req, res) => {
  console.log("========== NOVA VERSÃO ==========");
  console.log("VERSÃO:", VERSION);
  console.log("CHEGOU REQUEST");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("VOU RESPONDER PONG");

  return res.status(200).json({
    text: `🏓 Pong! (${VERSION})`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando... ${VERSION}`));
