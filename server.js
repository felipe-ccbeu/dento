const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.json());

const VERSION = "v3.0 - comandos style";

const COMMANDS = {
  PING: 1,
  DENTO: 2,
  FEIJAO: 3
};

const CHAT_SPACE = process.env.CHAT_SPACE; // ex: spaces/AAAA...
const SCHEDULER_TOKEN = process.env.SCHEDULER_TOKEN;

async function sendAsDento(message) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/chat.bot"]
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token || tokenResponse;

  const response = await fetch(
    `https://chat.googleapis.com/v1/${CHAT_SPACE}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Erro ao enviar mensagem como Dento: ${response.status} ${JSON.stringify(data)}`
    );
  }

  return data;
}

app.post("/webhook", (req, res) => {
  try {
    console.log("========== NOVA VERSÃO ==========");
    console.log("VERSÃO:", VERSION);

    const chatEvent = req.body.chat || {};
    let message = { text: "Não entendi 😅" };

    const payload = chatEvent.appCommandPayload;

    if (payload) {
      const commandId = payload.appCommandMetadata?.appCommandId;
      console.log("commandId:", commandId);

      if (commandId === COMMANDS.PING) {
        message = { text: "Bot funcionando." };
      }

      if (commandId === COMMANDS.DENTO) {
        message = { text: "Ai dento 😎" };
      }

      if (commandId === COMMANDS.FEIJAO) {
        message = {
          cardsV2: [
            {
              cardId: "feijao-card",
              card: {
                sections: [
                  {
                    widgets: [
                      {
                        textParagraph: {
                          text: "<b>Feijão com farinha 🍛</b>"
                        }
                      },
                      {
                        image: {
                          imageUrl:
                            "https://media.tenor.com/IasXzJ3eW9MAAAAM/feijao-com-farinha.gif",
                          altText: "Feijão com farinha"
                        }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        };
      }
    }

    return res.status(200).json({
      hostAppDataAction: {
        chatDataAction: {
          createMessageAction: {
            message
          }
        }
      }
    });
  } catch (error) {
    console.error("ERRO:", error);

    return res.status(200).json({
      hostAppDataAction: {
        chatDataAction: {
          createMessageAction: {
            message: { text: "Erro interno 😥" }
          }
        }
      }
    });
  }
});

app.post("/scheduler/feijao", async (req, res) => {
  try {
    const token = req.headers["x-scheduler-token"];

    if (token !== SCHEDULER_TOKEN) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    await sendAsDento({
      text: "Hora de feijão com farinha... al mosso!"
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("ERRO SCHEDULER:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando... ${VERSION}`));
