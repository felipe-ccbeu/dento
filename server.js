const express = require("express");
const app = express();

app.use(express.json());

const VERSION = "v2.2 - add-on response fix";
const PING_COMMAND_ID = 1;

app.get("/", (req, res) => {
  res.send(`Servidor ativo | ${VERSION}`);
});

app.get("/webhook", (req, res) => {
  res.send(`Webhook ativo | ${VERSION} | use POST`);
});

app.post("/webhook", (req, res) => {
  try {
    console.log("========== NOVA VERSÃO ==========");
    console.log("VERSÃO:", VERSION);
    console.log("CHEGOU REQUEST");
    console.log(JSON.stringify(req.body, null, 2));

    const chatEvent = req.body.chat || {};
    let message = { text: "Não entendi 😅" };

    if (chatEvent.appCommandPayload) {
      const commandId =
        chatEvent.appCommandPayload.appCommandMetadata?.appCommandId;

      console.log("commandId:", commandId);

      if (commandId === PING_COMMAND_ID) {
        message = { text: `🏓 Pong! (${VERSION})` };
      }
    } else {
      const text = chatEvent.messagePayload?.message?.text || "";
      console.log("text:", text);

      if (text.trim() === "/ping") {
        message = { text: `🏓 Pong! (${VERSION})` };
      }
    }

    const responseBody = {
      hostAppDataAction: {
        chatDataAction: {
          createMessageAction: {
            message
          }
        }
      }
    };

    console.log("RESPONSE BODY:", JSON.stringify(responseBody, null, 2));

    return res.status(200).json(responseBody);
  } catch (error) {
    console.error("ERRO:", error);

    return res.status(200).json({
      hostAppDataAction: {
        chatDataAction: {
          createMessageAction: {
            message: {
              text: "Erro interno 😥"
            }
          }
        }
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando... ${VERSION}`));
