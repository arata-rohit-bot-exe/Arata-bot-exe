/cmd install const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "ytb",
    aliases: ["ytbdl", "yt-dl"],
    version: "1.0",
    author: "RIFAT",
    shortDescription: {
      en: "Download YouTube video/audio",
      vi: "Tải video/audio YouTube"
    },
    longDescription: {
      en: "Download video or audio from YouTube using name or link",
      vi: "Tải video hoặc audio từ YouTube bằng tên hoặc link"
    },
    category: "media",
    guide: {
      en: "{prefix}ytb video/audio <video name or link>",
      vi: "{prefix}ytb video/audio <tên video hoặc liên kết>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const type = args[0];
    const query = args.slice(1).join(" ");

    if (!["video", "audio"].includes(type) || !query)
      return message.reply("Usage:\n.ytb video/audio <video name or link>");

    if (query.startsWith("http")) {
      return handleDownload(api, event, type, query, message);
    }

    const apiKey = "AIzaSyD4RQJmE--tYQlEfanIxEV5p9sWD54EMOQ";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=6&type=video`;

    try {
      const res = await axios.get(searchUrl);
      const results = res.data.items;

      if (!results.length) return message.reply("No videos found.");

      const list = results.map((v, i) =>
        `${i + 1}. ${v.snippet.title} (${v.snippet.channelTitle})`
      ).join("\n");

      message.reply("Reply with a number:\n" + list, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ytb",
          author: event.senderID,
          type,
          results
        });
      });

    } catch (err) {
      console.error(err);
      return message.reply("Error while searching.");
    }
  },

  onReply: async function ({ event, Reply, message, api }) {
    const { author, results, type } = Reply;
    if (event.senderID !== author) return;

    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > results.length)
      return message.reply("Invalid choice.");

    const videoId = results[index - 1].id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return handleDownload(api, event, type, videoUrl, message);
  }
};

async function handleDownload(api, event, type, videoUrl, message) {
  try {
    const response = await axios({
      method: "GET",
      url: `https://yt-api-bd40.onrender.com/download`,
      params: {
        url: videoUrl,
        type
      },
      responseType: "stream"
    });

    const ext = type === "audio" ? "mp3" : "mp4";
    const fileName = `ytb_${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, "cache", fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      message.reply({
        body: `✅ Here is your ${type}`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));
    });

    writer.on("error", err => {
      console.error(err);
      message.reply("Failed to save file.");
    });

  } catch (e) {
    console.error(e.message);
    message.reply("❌ Failed to get download link or stream the file.");
  }
} ytb.js
