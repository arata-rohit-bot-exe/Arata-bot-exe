const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair",
    aliases: [],
    version: "1.6",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Pair two people in heart",
      vi: "Ghép đôi hai người trong trái tim"
    },
    longDescription: {
      en: "Places both avatars in each side heart of the background",
      vi: "Đặt hai avatar vào hai trái tim ở hai bên hình nền"
    },
    category: "fun",
    guide: {
      en: "{pn} @mention",
      vi: "{pn} @tag"
    }
  },

  onStart: async function ({ event, api }) {
    const { threadID, senderID, messageID, mentions } = event;
    if (!Object.keys(mentions).length)
      return api.sendMessage("Please mention someone to pair with.", threadID, messageID);

    const mentionID = Object.keys(mentions)[0];

    const bgUrl = "https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png";

    try {
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      const bg = await loadImage(Buffer.from(bgRes.data, "binary"));

      const avatar1 = await getAvatar(senderID);
      const avatar2 = await getAvatar(mentionID);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0);

      const avatarSize = 200;

      // Adjusted avatar positions
      ctx.drawImage(avatar2, 90, 280, avatarSize, avatarSize);   // Mentioned user (x - 20)
      ctx.drawImage(avatar1, 910, 280, avatarSize, avatarSize);  // Sender

      const outPath = path.join(__dirname, "pair.png");
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        api.sendMessage({
          body: "Pairing successful!",
          attachment: fs.createReadStream(outPath)
        }, threadID, () => fs.unlinkSync(outPath), messageID);
      });

    } catch (error) {
      console.error("Error occurred during pairing:", error);
      api.sendMessage("An error occurred while pairing. Please try again later.", threadID, messageID);
    }
  }
};

async function getAvatar(uid) {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${uid}/picture?height=512&width=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`,
      { responseType: "arraybuffer" }
    );
    return await loadImage(Buffer.from(res.data, "binary"));
  } catch (error) {
    throw new Error("Error fetching avatar image.");
  }
}
