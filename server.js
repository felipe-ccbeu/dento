const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  try {
    console.log("BODY:", JSON.stringify(req.body, null, 2));

    const message = req.body.message || {};
    
    const text = message.text || "";
    const slashCommand = message.slashCommand?.commandName;

    let resposta = "Não entendi 😅";

    if (text.includes("/ping") || slashCommand === "/ping") {
      resposta = "🏓 Pong!";
    }

    return res.status(200).json({
      text: resposta
    });

  } catch (error) {
    console.error(error);

    return res.status(200).json({
      text: "Erro interno 😥"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando..."));
