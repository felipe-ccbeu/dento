const express = require("express");
const { GoogleAuth } = require("google-auth-library");
const cron = require("node-cron");
const fs = require("fs");

const fetch = global.fetch || require("node-fetch");

const app = express();
app.use(express.json());

const VERSION = "v3.4 - cron fix";

const COMMANDS = {
  PING: 1,
  DENTO: 2,
  FEIJAO: 3
};

const CHAT_SPACE = process.env.CHAT_SPACE;
const GOOGLE_CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

console.log("========== INIT ==========");
console.log("VERSION:", VERSION);
console.log("CHAT_SPACE:", CHAT_SPACE || "(não definido)");
console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  GOOGLE_CREDENTIALS_PATH || "(não definido)"
);
console.log(
  "GOOGLE_SERVICE_ACCOUNT_JSON:",
  GOOGLE_SERVICE_ACCOUNT_JSON ? "(definido)" : "(não definido)"
);

if (GOOGLE_CREDENTIALS_PATH) {
  console.log(
    "Arquivo existe?",
    fs.existsSync(GOOGLE_CREDENTIALS_PATH) ? "sim" : "não"
  );
}
console.log("==========================");

function createGoogleAuth() {
  if (GOOGLE_SERVICE_ACCOUNT_JSON) {
    let credentials;

    try {
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON inválido");
    }

    return new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/chat.bot"]
    });
  }

  if (GOOGLE_CREDENTIALS_PATH) {
    if (!fs.existsSync(GOOGLE_CREDENTIALS_PATH)) {
      throw new Error(`O arquivo em ${GOOGLE_CREDENTIALS_PATH} não existe`);
    }

    return new GoogleAuth({
      keyFilename: GOOGLE_CREDENTIALS_PATH,
      scopes: ["https://www.googleapis.com/auth/chat.bot"]
    });
  }

  throw new Error(
    "Nenhuma credencial configurada. Use GOOGLE_APPLICATION_CREDENTIALS ou GOOGLE_SERVICE_ACCOUNT_JSON"
  );
}

async function sendAsDento(message) {
  if (!CHAT_SPACE) {
    throw new Error("CHAT_SPACE não definido");
  }

  const auth = createGoogleAuth();
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

// =========================
// ⏰ CRONS
// =========================

// 12h
cron.schedule(
  "0 12 * * *",
  async () => {
    console.log("🍛 Hora do almoço!");

    try {
      await sendAsDento({
        text: "Hora de feijão com farinha... al mosso!"
      });
      console.log("✅ Mensagem almoço enviada");
    } catch (err) {
      console.error("❌ Erro almoço:", err.message);
    }
  },
  { timezone: "America/Sao_Paulo" }
);

// 15h
cron.schedule(
  "0 15 * * *",
  async () => {
    console.log("🏃 Felipe indo embora!");

    try {
      await sendAsDento({
        text: "Felipe Fadel está indo embora, se divirtam probres"
      });
      console.log("✅ Mensagem 15h enviada");
    } catch (err) {
      console.error("❌ Erro 15h:", err.message);
    }
  },
  { timezone: "America/Sao_Paulo" }
);

// 17h
cron.schedule(
  "0 17 * * *",
  async () => {
    console.log("🏠 Bo pa casa!");

    try {
      await sendAsDento({
        text: "Bo pa casa"
      });
      console.log("✅ Mensagem 17h enviada");
    } catch (err) {
      console.error("❌ Erro 17h:", err.message);
    }
  },
  { timezone: "America/Sao_Paulo" }
);

app.post("/webhook", (req, res) => {
  try {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Rodando... ${VERSION}`));