const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const gTTS = require("gtts");

module.exports = {
  config: {
    name: "say",
    version: "1.0",
    author: "rifat",
    shortDescription: "Say something",
    longDescription: "Convert text to speech using gTTS and send audio.",
    category: "media",
    guide: "{pn} [text]"
  },

  onStart: async function ({ message, args }) {
    const text = args.join(" ");
    if (!text) return message.reply("Please provide text to speak.");

    const filePath = path.join(__dirname, "cache", `say-${Date.now()}.mp3`);
    const gtts = new gTTS(text, "en"); // Change 'en' to 'bn' for Bangla or others

    try {
      await new Promise((resolve, reject) => {
        gtts.save(filePath, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      message.reply(
        { body: "Here's the spoken version:", attachment: fs.createReadStream(filePath) },
        () => fs.unlinkSync(filePath)
      );
    } catch (err) {
      console.error(err);
      message.reply("❌ | Failed to generate speech.");
    }
  }
};
