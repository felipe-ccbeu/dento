// =========================
// ⏰ CRONS
// =========================

// 🕛 ALMOÇO
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

// 🕒 15h
cron.schedule(
  "0 15 * * *",
  async () => {
    console.log("🏃‍♂️ Felipe indo embora!");

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

// 🕔 17h
cron.schedule(
  "0 17 * * *",
  async () => {
    console.log("🏠 Hora de ir embora!");

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