const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: [],
    version: "1.0.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get Facebook profile picture"
    },
    longDescription: {
      en: "Shows the profile picture of the user whose message is replied to, or the sender if not replying."
    },
    category: "tools",
    guide: {
      en: "{prefix}pp (reply to someone's message to get their profile picture)"
    }
  },

  onStart: async function ({ api, event }) {
    const uid = event.type === "message_reply"
      ? event.messageReply.senderID
      : event.senderID;

    const imgPath = path.join(__dirname, "cache", `${uid}.jpg`);
    const url = `https://graph.facebook.com/${uid}/picture?width=1000&height=1000&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    try {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      await fs.outputFile(imgPath, res.data);

      await api.sendMessage(
        {
          body: `🖼️ Profile picture of ${uid}`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath)
      );
    } catch (err) {
      console.error("Error fetching profile picture:", err);
      api.sendMessage("Failed to fetch the profile picture.", event.threadID, event.messageID);
    }
  }
};
