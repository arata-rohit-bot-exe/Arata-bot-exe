const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show help menu or command details"
    },
    longDescription: {
      en: "Display all available commands or detailed information about a specific command"
    },
    category: "info",
    guide: {
      en: "{pn} [command name]"
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const threadData = await threadsData.get(threadID);

    const totalCommands = commands.size;

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `🎀 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐍𝐎𝐎𝐁 𝐁𝐎𝐓𝐕𝟐 𝐇𝐞𝐥𝐩 𝐌𝐞𝐧𝐮 🎀\n`;
      msg += `────────────────────────────\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category in categories) {
        msg += `📁 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${category.toUpperCase()}\n`;
        const cmds = categories[category].sort().map(cmd => `🔹 ${cmd}`).join("\n");
        msg += `${cmds}\n`;
        msg += `────────────────────────────\n`;
      }

      msg += `📌 𝐔𝐬𝐞: ${prefix}help [command name] 𝐭𝐨 𝐯𝐢𝐞𝐰 𝐝𝐞𝐭𝐚𝐢𝐥𝐬\n`;
      msg += `📊 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐢𝐧 𝐍𝐎𝐎𝐁 𝐁𝐎𝐓𝐕𝟐: ${totalCommands}\n`;
      msg += `🎀 𝐓𝐡𝐚𝐧𝐤 𝐘𝐨𝐮 𝐟𝐨𝐫 𝐔𝐬𝐢𝐧𝐠 𝐍𝐎𝐎𝐁 𝐁𝐎𝐓𝐕𝟐 🎀`;

      const helpListImages = [
        "https://i.postimg.cc/8cvDpt37/images-17.jpg",
        "https://i.postimg.cc/qq2VVghn/received-430815183006013.jpg",
        "https://i.postimg.cc/KzRxVZDr/received-455361183700405.jpg",
        "https://i.postimg.cc/MGZW70cL/received-435752262736007.jpg",
        "https://i.postimg.cc/Pq6d2LY5/received-3200033873462285.jpg"
      ];

      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];
      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage)
      });

    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) return message.reply(`⚠️ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 "${commandName}" 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.`);

      const config = command.config;
      const roleText = roleTextToString(config.role);
      const description = config.longDescription?.en || "No description available.";
      const aliasesList = config.aliases ? config.aliases.join(", ") : "None";
      const usage = (config.guide?.en || "No usage info").replace(/{p}/g, prefix).replace(/{n}/g, config.name);

      const detail = `
╭──────❖ │ 🎯 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: ${config.name} │ 📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${description} │ 🛠️ 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${aliasesList} │ 👤 𝐀𝐮𝐭𝐡𝐨𝐫: ${config.author || "Unknown"} │ 🧩 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${config.version || "1.0"} │ 🧷 𝐑𝐨𝐥𝐞: ${roleText} │ ⏱️ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${config.countDown || 1}s │ 💡 𝐔𝐬𝐚𝐠𝐞: ${usage} ╰───────────────────❖
`;

      return message.reply(detail);
    }
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0:
      return "0 - All Users";
    case 1:
      return "1 - Group Admins";
    case 2:
      return "2 - Bot Admins";
    default:
      return "Unknown Role";
  }
}
