module.exports = {
  config: {
    name: "sing",
    version: "1.1",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Play YouTube audio",
    longDescription: "Search YouTube and play audio using your Render API",
    category: "media",
    guide: "{pn} [song name or YouTube URL]"
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    const query = args.join(" ");
    if (!query) return api.sendMessage("Please provide a song name or YouTube URL.", event.threadID);

    const isUrl = query.startsWith("http");
    let videoUrl;

    try {
      if (isUrl) {
        videoUrl = query;
      } else {
        const apiKey = "AIzaSyDYFu-jPat_hxdssXEK4y2QmCOkefEGnso"; // Your YouTube Data API key
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: "snippet",
            q: query,
            key: apiKey,
            maxResults: 1,
            type: "video"
          }
        });

        const video = res.data.items[0];
        if (!video) return api.sendMessage("No results found on YouTube.", event.threadID);
        videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      }

      const downloadUrl = `https://yt-api-bd40.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;
      const audioPath = path.join(__dirname, "cache", `${event.senderID}_sing.mp3`);

      const downloadingMsg = await api.sendMessage("Downloading audio, please wait...", event.threadID);

      const response = await axios.get(downloadUrl, { responseType: "stream" });

      const writer = fs.createWriteStream(audioPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `Here's your audio:\n${videoUrl}`,
          attachment: fs.createReadStream(audioPath)
        }, event.threadID, () => {
          fs.unlinkSync(audioPath);
        });
      });

      writer.on("error", () => {
        api.sendMessage("Error writing the file.", event.threadID);
      });
    } catch (err) {
      console.error(err);
      return api.sendMessage("Failed to download. Check the link or try again later.", event.threadID);
    }
  }
};
