const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const dbPath = path.join(__dirname, "cache", "tempmail_users.json");

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["mail"],
    version: "1.0.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate temp email and view inbox"
    },
    longDescription: {
      en: "Use 'tempmail create' to generate a temp email, and 'tempmail inbox' to check messages"
    },
    category: "utility",
    guide: {
      en: "{prefix}tempmail create\n{prefix}tempmail inbox"
    }
  },

  onStart: async function ({ event, api, args }) {
    const subCmd = args[0];

    if (!subCmd) {
      return api.sendMessage("Please use either 'create' or 'inbox' after the command.", event.threadID, event.messageID);
    }

    await fs.ensureFile(dbPath);
    let db = await fs.readJson(dbPath).catch(() => ({}));
    const userID = event.senderID;

    if (subCmd === "create") {
      try {
        const res = await axios.get("https://www.x-noobs-apis.42web.io/tempmail/gen");
        const email = res.data.email;

        db[userID] = email;
        await fs.writeJson(dbPath, db);

        return api.sendMessage(`✅ Your temporary email:\n${email}\n\nUse '{prefix}tempmail inbox' to check inbox.`, event.threadID, event.messageID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("Failed to create temp email. Try again later.", event.threadID, event.messageID);
      }
    }

    if (subCmd === "inbox") {
      const email = db[userID];
      if (!email) {
        return api.sendMessage("No temp email found. Use '{prefix}tempmail create' first.", event.threadID, event.messageID);
      }

      try {
        const res = await axios.get(`https://www.x-noobs-apis.42web.io/tempmail/message?email=${encodeURIComponent(email)}`);
        const inbox = res.data;

        if (!Array.isArray(inbox) || inbox.length === 0) {
          return api.sendMessage(`📭 Inbox for ${email} is empty.`, event.threadID, event.messageID);
        }

        const messages = inbox.map((msg, i) =>
          `${i + 1}. From: ${msg.from}\nSubject: ${msg.subject}\nDate: ${msg.date}\n\n${msg.body}`
        ).join("\n\n====================\n\n");

        // Send the inbox messages
        await api.sendMessage(`📥 Inbox for ${email}:\n\n${messages}`, event.threadID, event.messageID);

        // Delete the email record after sending
        delete db[userID];
        await fs.writeJson(dbPath, db);

        return; // End function after sending and deleting
      } catch (err) {
        console.error(err);
        return api.sendMessage("Failed to fetch inbox. Try again later.", event.threadID, event.messageID);
      }
    }

    return api.sendMessage("Invalid subcommand. Use 'create' or 'inbox'.", event.threadID, event.messageID);
  }
};
