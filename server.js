const express = require("express");
const app = express();

app.use(express.json());

const VERSION = "v3.0 - comandos style";

const COMMANDS = {
  PING: 1,
  DENTO: 2,
  FEIJAO: 3
};

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

      // 🏓 ping
      if (commandId === COMMANDS.PING) {
        message = { text: "🏓 Pong!" };
      }

      // 😎 dento
      if (commandId === COMMANDS.DENTO) {
        message = { text: "Ai dento 😎" };
      }

      // 🍛 feijao (COM IMAGEM 🔥)
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
                            "https://us-tuna-sounds-images.voicemod.net/fe163b3d-09c8-4ebb-b825-29a3547ec7e7-1753581040063.webp",
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
