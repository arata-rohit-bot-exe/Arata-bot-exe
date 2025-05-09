const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anime",
    aliases: [],
    version: "2.0.1",
    author: "rifat",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get a random anime video"
    },
    longDescription: {
      en: "Fetches a random anime video from x-noobs-apis and sends it to the chat."
    },
    category: "anime",
    guide: {
      en: "{prefix}anime"
    }
  },

  onStart: async function ({ api, event }) {
    const apiUrl = "https://www.x-noobs-apis.42web.io/video/anime";

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(apiUrl);
      const fileUrl = res.data.data;

      if (!fileUrl || !fileUrl.includes("drive.google.com")) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("Invalid or missing video URL from API.", event.threadID, event.messageID);
      }

      // Convert Google Drive link to direct download link
      const fileId = fileUrl.split("id=")[1];
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      const videoPath = path.join(__dirname, "cache", "anime.mp4");
      const videoStream = await axios.get(directUrl, { responseType: "arraybuffer" });
      await fs.outputFile(videoPath, videoStream.data);

      api.setMessageReaction("🎞️", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          body: "Here's your anime video!",
          attachment: fs.createReadStream(videoPath)
        },
        event.threadID,
        () => fs.remove(videoPath) // Clean up after sending
      );
    } catch (err) {
      console.error("Anime command error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("Failed to fetch the anime video. Please try again later.", event.threadID, event.messageID);
    }
  }
};
