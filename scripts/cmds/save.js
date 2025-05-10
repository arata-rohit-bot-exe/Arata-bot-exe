const fs = require('fs');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');

// Pastebin API Key Only
const API_DEV_KEY = 'Aj6W2tMHNBKD0wmmHfq8BnnYpvDqBf7v';

module.exports = {
  config: {
    name: "save",
    version: "4.1",
    author: "rifat",
    role: 2,
    category: "admin",
    shortDescription: "Upload command file to Pastebin",
    guide: "{pn} <command name>"
  },

  onStart: async function ({ message, event, args }) {
    try {
      if (!this.isAuthorizedAdmin(event.senderID)) {
        return message.reply("⛔ Owner verification failed");
      }

      const cmdName = args[0]?.toLowerCase().trim();
      if (!cmdName) return message.reply("❌ Missing command name");

      const cmdPath = path.join(__dirname, `${cmdName}.js`);
      if (!fs.existsSync(cmdPath)) {
        return message.reply(`❌ Command "${cmdName}" not found`);
      }

      const pasteUrl = await this.createPaste(cmdName, cmdPath);
      message.reply(`✅ Anonymous Paste:\n${pasteUrl}`);

    } catch (error) {
      console.error("ERROR:", error);
      message.reply(`🚨 Error: ${this.sanitize(error)}`);
    }
  },

  // Helper methods
  isAuthorizedAdmin: function(senderID) {
    const admins = global.GoatBot?.config?.adminBot || [];
    return admins.includes(senderID);
  },

  sanitize: function(error) {
    const msg = error.response?.data || error.message;
    return msg.replace(API_DEV_KEY, '***');
  },

  createPaste: async function(cmdName, cmdPath) {
    const cmdContent = fs.readFileSync(cmdPath, 'utf-8');

    const pasteData = querystring.stringify({
      api_dev_key: API_DEV_KEY,
      api_option: 'paste',
      api_paste_code: cmdContent,
      api_paste_name: `${cmdName}.js`,
      api_paste_format: 'javascript',
      api_paste_private: '1', // Unlisted
      api_paste_expire_date: '1M'
    });

    const response = await axios.post(
      'https://pastebin.com/api/api_post.php',
      pasteData,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    if (response.data.includes('Bad API request')) {
      throw new Error(`API Error: ${response.data}`);
    }

    return response.data;
  }
};
