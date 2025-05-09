const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "couple",
    aliases: [],
    version: "1.0",
    author: "rifat",
    role: 0,
    shortDescription: "Match you with someone",
    longDescription: "Check love compatibility between you and another member",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, senderID, messageID } = event;

    const threadInfo = await api.getThreadInfo(threadID);
    const others = threadInfo.participantIDs.filter(id => id !== senderID);

    if (!others.length)
      return api.sendMessage("No one to match with!", threadID, messageID);

    const targetID = others[Math.floor(Math.random() * others.length)];
    const senderInfo = await usersData.get(senderID);
    const targetInfo = await usersData.get(targetID);

    const name1 = senderInfo.name || "Unknown";
    const name2 = targetInfo.name || "Unknown";
    const compatibility = Math.floor(Math.random() * 101);

    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffc0cb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "red";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Compatibility: ${compatibility}%`, 350, 50);

    // Load avatars (using the new getAvatar method)
    const avatar1 = await getAvatar(senderID);
    const avatar2 = await getAvatar(targetID);
    ctx.drawImage(avatar1, 100, 100, 200, 200);
    ctx.drawImage(avatar2, 400, 100, 200, 200);

    // Names
    ctx.fillStyle = "red";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`${name1} & ${name2}`, 350, 350);

    // Output
    const outputPath = path.join(__dirname, "cache", `couple_${senderID}.png`);
    fs.writeFileSync(outputPath, canvas.toBuffer());

    api.sendMessage({
      body: `${name1} matched with ${name2}!\nLove compatibility: ${compatibility}%`,
      attachment: fs.createReadStream(outputPath)
    }, threadID, () => fs.unlinkSync(outputPath), messageID);
  }
};

async function getAvatar(uid) {
  const url = `https://graph.facebook.com/${uid}/picture?height=512&width=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return await loadImage(Buffer.from(res.data, "binary"));
  } catch (error) {
    return await loadImage(path.join(__dirname, "cache", "noavatar.png"));
  }
    }
