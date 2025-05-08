const fs = require("fs");

module.exports = {
  config: {
    name: "botname",
    aliases: ["botstatus"],
    version: "1.0",
    author: "rifat",
    countDown: 0,
    role: 2,
    shortDescription: {
      en: "Set bot name and turn bot on/off"
    },
    longDescription: {
      en: "Changes the bot's name to NOOB BOTV2 and can enable/disable the bot."
    },
    category: "system",
    guide: {
      en: ".botname on/off\n.botname name"
    }
  },

  onStart: async function ({ api, event, args }) {
    const statusFile = __dirname + "/../botStatus.json";

    if (!args[0]) return api.sendMessage("Please use `.botname on`, `.botname off`, or `.botname name`", event.threadID);

    const cmd = args[0].toLowerCase();

    if (cmd === "name") {
      try {
        await api.changeNickname("NOOB BOTV2", event.threadID, event.senderID);
        api.sendMessage("✅ Bot name changed to NOOB BOTV2!", event.threadID);
      } catch (e) {
        api.sendMessage("❌ Failed to change bot name.", event.threadID);
      }
    }

    else if (cmd === "off") {
      fs.writeFileSync(statusFile, JSON.stringify({ active: false }));
      api.sendMessage("🔴 NOOB BOTV2 has been turned OFF.", event.threadID);
    }

    else if (cmd === "on") {
      fs.writeFileSync(statusFile, JSON.stringify({ active: true }));
      api.sendMessage("🟢 NOOB BOTV2 is now ON.", event.threadID);
    }

    else {
      api.sendMessage("❌ Invalid option. Use `on`, `off`, or `name`.", event.threadID);
    }
  },

  onChat: function ({ message, api, event }) {
    const statusFile = __dirname + "/../botStatus.json";
    if (fs.existsSync(statusFile)) {
      const { active } = JSON.parse(fs.readFileSync(statusFile, "utf8"));
      if (active === false) return null; // bot is turned off
    }
  }
};
