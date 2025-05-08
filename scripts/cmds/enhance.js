const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

module.exports = {
  config: {
    name: "enhance",
    version: "1.0",
    author: "rifat",
    countDown: 10,
    role: 0,
    shortDescription: "Enhance image quality (4K)",
    longDescription: "Upload an image and enhance it to high quality using AI.",
    category: "tools",
    guide: "{pn} [reply to image]"
  },

  onStart: async function ({ message, event, api }) {
    const { messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
      return message.reply("Please reply to a photo to enhance.");
    }

    const url = messageReply.attachments[0].url;
    const tempPath = path.join(__dirname, "cache", `original_${event.senderID}.jpg`);
    const enhancedPath = path.join(__dirname, "cache", `enhanced_${event.senderID}.jpg`);

    try {
      // Download the original image
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(tempPath, res.data);

      // Prepare form data for upload
      const form = new FormData();
      form.append("image", fs.createReadStream(tempPath));

      // Upload to your enhance API
      const enhanceRes = await axios.post("https://enhance-api.onrender.com/enhance", form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      });

      // Save the enhanced image
      fs.writeFileSync(enhancedPath, enhanceRes.data);

      // Send the enhanced image
      await message.reply({ attachment: fs.createReadStream(enhancedPath) });

      // Clean up files
      fs.unlinkSync(tempPath);
      fs.unlinkSync(enhancedPath);

    } catch (err) {
      console.error(err);
      message.reply("Failed to enhance the image. Please try again.");
    }
  }
};
