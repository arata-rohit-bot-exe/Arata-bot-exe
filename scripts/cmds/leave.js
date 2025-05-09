module.exports = {
  config: {
    name: "leave",
    version: "1.0",
    author: "rifat",
    role: 1, // Admin only
    shortDescription: { en: "Leave the group chat" },
    longDescription: { en: "Make the bot leave the current group chat" },
    category: "group",
    guide: { en: "/leave" }
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadID;

    try {
      await message.reply("Goodbye everyone! I'm leaving this group.");
      await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
    } catch (error) {
      return message.reply("❌ | Failed to leave the group. Make sure I have permission to remove myself.");
    }
  }
};
