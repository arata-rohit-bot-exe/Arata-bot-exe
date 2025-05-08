const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.1.3",
    author: "rifat",
    role: 0,
    countDown: 25,
    shortDescription: {
      en: "Search Pinterest images"
    },
    longDescription: {
      en: "Search and download images from Pinterest based on a query"
    },
    category: "image",
    guide: {
      en: "{prefix}pinterest <search query> -<number of images>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const input = args.join(" ");
      if (!input.includes("-")) {
        return api.sendMessage(`Please use the format:\n${this.config.guide.en}`, event.threadID, event.messageID);
      }

      const searchText = input.substring(0, input.indexOf("-")).trim().replace(/\s+/g, "+");
      const count = parseInt(input.split("-").pop().trim()) || 6;

      const res = await axios.get(`https://www.x-noobs-apis.42web.io/pinterest?search=${searchText}&count=${count}`);
      const data = res.data.data;

      if (!Array.isArray(data) || data.length === 0) {
        return api.sendMessage(`No results found for "${searchText.replace(/\+/g, " ")}". Please try a different keyword.`, event.threadID, event.messageID);
      }

      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);

      const attachments = [];

      for (let i = 0; i < Math.min(count, data.length); i++) {
        const url = data[i];
        const imgPath = path.join(cachePath, `img_${i}.jpg`);
        try {
          const image = await axios.get(url, { responseType: "arraybuffer" });
          await fs.writeFile(imgPath, image.data);
          attachments.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.error(`Error downloading image ${i + 1}:`, err.message);
        }
      }

      if (attachments.length === 0) {
        return api.sendMessage(`Couldn't download any images.`, event.threadID, event.messageID);
      }

      await api.sendMessage({
        body: `Here are ${attachments.length} Pinterest images for "${searchText.replace(/\+/g, " ")}"`,
        attachment: attachments
      }, event.threadID, event.messageID);

      await fs.remove(cachePath);

    } catch (err) {
      console.error("Pinterest cmd error:", err.message);
      return api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};
