const axios = require("axios");
const availableCmdsUrl = "https://raw.githubusercontent.com/Rifat1haker/catxcommandstore/refs/heads/main/cmds.json";
const cmdUrlsJson = "https://raw.githubusercontent.com/Rifat1haker/catxcommandstore/refs/heads/main/cmdsurl.json";
const ITEMS_PER_PAGE = 10;

module.exports.config = {
  name: "cmdstorex",
  aliases: ["csx", "cmdsx"],
  author: "Mueid Mursalin Rifat",
  role: 0,
  version: "1.0",
  description: {
    en: "🔍 Commands Store by Mueid Mursalin Rifat - Explore powerful commands!",
  },
  countDown: 3,
  category: "commandstore",
  guide: {
    en: "{pn} [command name | single character | page number]",
  },
};

module.exports.onStart = async function ({ api, event, args }) {
  const query = args.join(" ").trim().toLowerCase();
  try {
    const response = await axios.get(availableCmdsUrl);
    let cmds = response.data.cmdName;
    let finalArray = cmds;
    let page = 1;

    if (query) {
      if (!isNaN(query)) {
        page = parseInt(query);
      } else if (query.length === 1) {
        finalArray = cmds.filter(cmd => cmd.cmd.startsWith(query));
        if (finalArray.length === 0) {
          return api.sendMessage(`🔍 | No commands found starting with "${query}". Try another letter or browse the store!`, event.threadID, event.messageID);
        }
      } else {
        finalArray = cmds.filter(cmd => cmd.cmd.includes(query));
        if (finalArray.length === 0) {
          return api.sendMessage(`🔍 | Command "${query}" not found. Maybe it's not added yet? Check back later!`, event.threadID, event.messageID);
        }
      }
    }

    const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) {
      return api.sendMessage(
        `⚠️ | Invalid page number. Please enter a number between 1 and ${totalPages}.`,
        event.threadID,
        event.messageID
      );
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const cmdsToShow = finalArray.slice(startIndex, endIndex);
    
    let msg = `✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗦𝗧𝗢𝗥𝗘 ✨\n\n`;
    msg += `📑 𝗣𝗮𝗴𝗲 ${page} of ${totalPages}\n`;
    msg += `📊 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${finalArray.length}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    
    cmdsToShow.forEach((cmd, index) => {
      msg += `🔹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: ${cmd.cmd}\n`;
      msg += `👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${cmd.author}\n`;
      msg += `📅 𝗨𝗽𝗱𝗮𝘁𝗲: ${cmd.update || "N/A"}\n`;
      msg += `🔢 𝗜𝗗: ${startIndex + index + 1}\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n`;
    });

    msg += `\n💡 𝗧𝗶𝗽: Reply with the command ID to get its URL!`;
    
    if (page < totalPages) {
      msg += `\n🔜 Type "${this.config.name} ${page + 1}" to view next page.`;
    }

    api.sendMessage(
      msg,
      event.threadID,
      (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          cmdName: finalArray,
          page: page
        });
      },
      event.messageID
    );
  } catch (error) {
    api.sendMessage(
      "⚠️ | Failed to retrieve commands. The store might be temporarily unavailable. Please try again later!",
      event.threadID,
      event.messageID
    );
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author != event.senderID) {
    return api.sendMessage("🔒 | Oops! This command is private. Use your own instance!", event.threadID, event.messageID);
  }

  const reply = parseInt(event.body);
  const startIndex = (Reply.page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  if (isNaN(reply) || reply < startIndex + 1 || reply > endIndex) {
    return api.sendMessage(
      `⚠️ | Please reply with a number between ${startIndex + 1} and ${Math.min(endIndex, Reply.cmdName.length)} to select a command.`,
      event.threadID,
      event.messageID
    );
  }

  try {
    const cmdName = Reply.cmdName[reply - 1].cmd;
    const { status } = Reply.cmdName[reply - 1];
    const response = await axios.get(cmdUrlsJson);
    const selectedCmdUrl = response.data[cmdName];
    
    if (!selectedCmdUrl) {
      return api.sendMessage(
        "⚠️ | Command URL not found. The command might be under maintenance.",
        event.threadID,
        event.messageID
      );
    }
    
    api.unsendMessage(Reply.messageID);
    
    const msg = `🔗𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦😺\n\n` +
               `📛 𝗡𝗮𝗺𝗲: ${cmdName}\n` +
               `📊 𝗦𝘁𝗮𝘁𝘂𝘀: ${status || "Available"}\n` +
               `🔗 𝗨𝗥𝗟: ${selectedCmdUrl}\n\n` +
               `💡 𝗧𝗶𝗽: Copy this URL to use the command in your bot!`;
               
    api.sendMessage(msg, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(
      "⚠️ | Failed to retrieve the command URL. Please try again later or contact support!",
      event.threadID,
      event.messageID
    );
  }
};
