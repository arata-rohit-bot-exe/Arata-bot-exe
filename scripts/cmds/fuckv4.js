const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "fuckv4",
    aliases: [],
    version: "1.1",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fit someone's avatar on the girl's face",
      vi: "Đặt avatar của ai đó lên khuôn mặt của cô gái"
    },
    longDescription: {
      en: "Places the mentioned person's avatar on the girl's face in the background",
      vi: "Đặt avatar của người được đề cập lên khuôn mặt của cô gái trong hình nền"
    },
    category: "fun",
    guide: {
      en: "{pn} @mention",
      vi: "{pn} @tag"
    }
  },

  onStart: async function ({ event, api }) {
    const { threadID, messageID, mentions } = event;
    if (!Object.keys(mentions).length)
      return api.sendMessage("Please mention someone to place their avatar on the girl's face.", threadID, messageID);

    const mentionID = Object.keys(mentions)[0];
    const bgUrl = "https://i.ibb.co/VJHCjCb/images-2022-08-14-T183802-542.jpg";

    try {
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      const bg = await loadImage(Buffer.from(bgRes.data, "binary"));
      const avatar = await getAvatar(mentionID);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0);

      // === Updated values ===
      const avatarSize = 150;
      const faceX = 450;
      const faceY = 30;

      ctx.save();
      ctx.beginPath();
      ctx.arc(faceX + avatarSize / 2, faceY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, faceX, faceY, avatarSize, avatarSize);
      ctx.restore();

      const outPath = path.join(__dirname, "fuckv4_output.png");
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        api.sendMessage({
          body: "Here's the updated image with avatar.",
          attachment: fs.createReadStream(outPath)
        }, threadID, () => fs.unlinkSync(outPath), messageID);
      });

    } catch (error) {
      console.error("Error occurred during the process:", error);
      api.sendMessage("An error occurred while processing the image.", threadID, messageID);
    }
  }
};

async function getAvatar(uid) {
  const url = `https://graph.facebook.com/${uid}/picture?height=512&width=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return await loadImage(Buffer.from(res.data, "binary"));
  } catch (error) {
    throw new Error("Error fetching avatar image.");
  }
}
