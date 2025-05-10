// Require the MongoClient from the native MongoDB driver
const { MongoClient } = require('mongodb');

module.exports = {
  config: {
    name: "ping",
    version: "1.2",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Check bot and MongoDB ping",
    longDescription: {
      en: "Displays the response time of the bot and MongoDB connection."
    },
    category: "system",
    guide: {
      en: "{p}ping"
    }
  },

  onStart: async function ({ message }) {
    const start = Date.now();
    let mongoPing;

    // MongoDB URI
    const uri = "mongodb+srv://rifatbot:rifatbot321@cluster0.kj0bl26.mongodb.net/";

    try {
      // Create a new MongoClient instance
      const client = new MongoClient(uri, { useUnifiedTopology: true });

      // Connect to MongoDB
      const mongoStart = Date.now();
      await client.connect();

      // Ping the database
      await client.db().admin().ping();
      mongoPing = `${Date.now() - mongoStart}ms ✅`;

      // Close the connection after ping
      await client.close();
    } catch (err) {
      mongoPing = `❌ ${err.message}`;
    }

    const botPing = `${Date.now() - start}ms ✅`;

    message.reply(
      `🏓 Bot Ping: ${botPing}\n` +
      `🛢️ MongoDB Ping: ${mongoPing}`
    );
  }
};
