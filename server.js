const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor rodando.");
});

app.get("/webhook", (req, res) => {
  res.send("Webhook ativo. Use POST.");
});

app.post("/webhook", (req, res) => {
  try {
    console.log("BODY:", JSON.stringify(req.body, null, 2));

    const event = req.body;
    const chat = event.chat || {};
    const payload = chat.appCommandPayload || {};
    const message = payload.message || {};
    const metadata = payload.appCommandMetadata || {};

    const text = message.text || "";
    const commandId = metadata.appCommandId;
    const commandName =
      message.annotations?.find(a => a.type === "SLASH_COMMAND")?.slashCommand?.commandName;

    let resposta = "Não entendi 😅";

    if (commandId === 1 || commandName === "/ping" || text.trim() === "/ping") {
      resposta = "🏓 Pong!";
    }

    return res.status(200).json({
      text: resposta
    });

  } catch (error) {
    console.error("ERRO:", error);

    return res.status(200).json({
      text: "Erro interno 😥"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando na porta " + PORT));
