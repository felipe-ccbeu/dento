const express = require("express");
const { GoogleAuth } = require("google-auth-library");
const cron = require("node-cron");

// 👇 garante fetch (caso Node antigo no Render)
const fetch = global.fetch || require("node-fetch");

const app = express();
app.use(express.json());

const VERSION = "v3.1 - debug auth";

const COMMANDS = {
  PING: 1,
  DENTO: 2,
  FEIJAO: 3
};

const CHAT_SPACE = process.env.CHAT_SPACE;
const GOOGLE_CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// =========================
// 🔍 LOG INICIAL (CRUCIAL)
// =========================
console.log("========== INIT ==========");
console.log("VERSION:", VERSION);
console.log("CHAT_SPACE:", CHAT_SPACE);
console.log("GOOGLE_APPLICATION_CREDENTIALS:", GOOGLE_CREDENTIALS_PATH);
console.log("==========================");

// =========================
// 🔥 SEND MESSAGE (DENTO)
// =========================
async function sendAsDento(message) {
  try {
    if (!CHAT_SPACE) {
      throw new Error("CHAT_SPACE não definido");
    }

    if (!GOOGLE_CREDENTIALS_PATH) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS não definido");
    }

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/chat.bot"]
    });

    const client = await auth.getClient();

    console.log("🔐 Auth client criado");

    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token || tokenResponse;

    console.log("🔑 Token obtido");

    const url = `https://chat.googleapis.com/v1/${CHAT_SPACE}/messages`;

    console.log("📡 Enviando para:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();

    console.log("📥 Response status:", response.status);
    console.log("📥 Response body:", data);

    if (!response.ok) {
      throw new Error(
        `Erro API Google: ${response.status} - ${JSON.stringify(data)}`
      );
    }

    return data;
  } catch (error) {
    console.error("🔥 ERRO sendAsDento:", error.message);
    throw error;
  }
}

// =========================
// ⏰ CRON
// =========================
cron.schedule(
  "* * * * *", // 👈 TESTE (1 min)
  async () => {
    console.log("⏰ Hora do feijão!");

    try {
      await sendAsDento({
        text: "Hora de feijão com farinha... al mosso!"
      });

      console.log("✅ Mensagem enviada pelo Dento");
    } catch (err) {
      console.error("❌ Erro no cron:", err.message);
    }
  },
  {
    timezone: "America/Sao_Paulo"
  }
);

// =========================
// WEBHOOK
// =========================
app.post("/webhook", (req, res) => {
  try {
    console.log("========== WEBHOOK ==========");

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
    console.error("ERRO WEBHOOK:", error);

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

// =========================
// START
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Rodando... ${VERSION}`));
