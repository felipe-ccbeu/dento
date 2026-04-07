const express = require("express");
const app = express();

app.use(express.json());

const PING_COMMAND_ID = 1; // coloque aqui o mesmo ID cadastrado no Google Chat

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

    // Quando o app é adicionado
    if (event.type === "ADDED_TO_SPACE") {
      return res.status(200).json({
        text: "Olá! Estou online 🙌"
      });
    }

    // Comando do Google Chat configurado no Console
    const commandId = event.appCommandPayload?.appCommandMetadata?.appCommandId;

    if (event.type === "APP_COMMAND" && commandId === PING_COMMAND_ID) {
      return res.status(200).json({
        text: "🏓 Pong!"
      });
    }

    // Mensagem comum
    const text = event.message?.text || "";

    if (event.type === "MESSAGE" && text.includes("/ping")) {
      return res.status(200).json({
        text: "🏓 Pong!"
      });
    }

    return res.status(200).json({
      text: "Não entendi 😅"
    });

  } catch (error) {
    console.error(error);
    return res.status(200).json({
      text: "Erro interno 😥"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando na porta " + PORT));
