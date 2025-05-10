module.exports = {
  config: {
    name: "prefixmode",
    aliases: ["noprefix", "prefixless"],
    version: "1.0",
    author: "rifat",
    countDown: 5,
    role: 1,
    shortDescription: "Toggle no-prefix mode for this thread",
    longDescription: "Turn on or off no-prefix mode for this thread",
    category: "config",
    guide: "{p}prefixmode"
  },

  onStart: async function ({ message, event, threadsData }) {
    const threadID = event.threadID;

    // Try to get threadData
    let threadData = await threadsData.get(threadID);

    // If threadData doesn't exist, initialize it
    if (!threadData) {
      await threadsData.set(threadID, {});
      threadData = await threadsData.get(threadID);
    }

    // Toggle the noPrefixMode setting
    const currentStatus = threadData.data?.noPrefixMode === true;
    const newStatus = !currentStatus;

    await threadsData.set(threadID, {
      data: {
        ...threadData.data,
        noPrefixMode: newStatus
      }
    });

    message.reply(`✅ No prefix mode is now ${newStatus ? "ON" : "OFF"} for this thread.`);
  }
};
