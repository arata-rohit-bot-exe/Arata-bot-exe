const axios = require("axios");
const fs = require("fs");
const path = require("path");

const configFile = path.join(__dirname, "ytad-config.json");

// Load or initialize on/off config
function getConfig() {
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({ enabled: true }, null, 2));
  }
  return JSON.parse(fs.readFileSync(configFile));
}

// Save config
function setConfig(newConfig) {
  fs.writeFileSync(configFile, JSON.stringify(newConfig, null, 2));
}

module.exports = {
  config: {
    name: "ytad",
    aliases: [],
    version: "1.1",
    author: "rifat",
    shortDescription: "Download YouTube video or audio",
    longDescription: "Downloads and sends YouTube video/audio via API with toggle system.",
    category: "media",
    guide: "{pn} video|audio <YouTube link>\n{pn} on/off"
  },

  onStart: async function ({ message, event, args, prefix }) {
    const config = getConfig();

    // Handle on/off toggle
    const arg0 = args[0]?.toLowerCase();
    if (arg0 === "on" || arg0 === "off") {
      const newState = arg0 === "on";
      config.enabled = newState;
      setConfig(config);
      return message.reply(`✅ ytad command is now ${newState ? "enabled" : "disabled"}.`);
    }

    if (!config.enabled) return message.reply("❌ This command is currently turned off by admin.");

    const input = args.join(" ");
    const match = input.match(/(video|audio)\s+(https?:\/\/[^\s]+)/i);
    if (!match) return message.reply(`Usage:\n${prefix}ytad video|audio <YouTube link>`);

    const [ , type, url ] = match;
    await downloadAndSend(url, type, message);
  },

  onChat: async function ({ event, message }) {
    const config = getConfig();
    if (!config.enabled) return;

    const body = event.body;
    if (!body) return;

    const ytLinkMatch = body.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/i);
    if (!ytLinkMatch) return;

    const url = ytLinkMatch[0];
    const type = "video"; // default to video
    await downloadAndSend(url, type, message);
  }
};

async function downloadAndSend(url, type, message) {
  try {
    message.reply("Downloading...");

    const response = await axios({
      method: "GET",
      url: `https://yt-api-bd40.onrender.com/download`,
      params: { url, type },
      responseType: "stream"
    });

    const ext = type === "audio" ? "mp3" : "mp4";
    const filename = `yt-${Date.now()}.${ext}`;
    const filepath = path.join(__dirname, "cache", filename);

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      message.reply({ body: `Here's your ${type}:`, attachment: fs.createReadStream(filepath) }, () => {
        fs.unlinkSync(filepath);
      });
    });

    writer.on("error", (err) => {
      console.error(err);
      message.reply("Error saving the file.");
    });
  } catch (err) {
    console.error(err);
    message.reply("Failed to download. Check the link or try again later.");
  }
}
