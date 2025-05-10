const os = require("os");
const fs = require("fs-extra");
const process = require("process");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "stats", "info"],
    author: "rifat",
    countDown: 0,
    role: 0,
    category: "system",
    longDescription: {
      en: "Displays detailed system information.",
    },
    guide: {
      en: "Use .uptime or uptime to get system metrics.",
    },
  },

  onStart: async function ({ api, event, threadsData, usersData, args }) {
    try {
      const userCommand = event.body?.toLowerCase().trim();
      const allAliases = ["uptime", "up", "upt", "stats", "info"];
      const prefix = global.GoatBot.config.prefix || ".";

      // Check if command is called without prefix
      if (
        !userCommand?.startsWith(prefix) &&
        !allAliases.includes(userCommand)
      ) return;

      const checkingMessage = await api.sendMessage("⏳ Gathering system information...", event.threadID);

      const uptimeSec = process.uptime();
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = Math.floor(uptimeSec % 60);
      const uptimeFormatted = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsedPercent = ((usedMem / totalMem) * 100).toFixed(2);

      const allUsers = await usersData.getAll() || [];
      const allThreads = await threadsData.getAll() || [];
      const userCount = allUsers.length;
      const threadCount = allThreads.length;

      const cpuModel = os.cpus()[0].model;
      const cpuCores = os.cpus().length;
      const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(", ");

      const interfaces = os.networkInterfaces();
      const ifaceNames = Object.keys(interfaces).join(", ");
      let addresses = [];
      for (const name in interfaces) {
        for (const net of interfaces[name]) {
          if (!net.internal) {
            addresses.push(`${net.family}: ${net.address}`);
          }
        }
      }

      const formatBytes = (bytes) => {
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
      };

      const ping = Date.now() - checkingMessage.timestamp;

      const systemInfo = `⏰ Bot Uptime: ${uptimeFormatted}
🖥 Host Server: ${os.type()} ${os.release()}
💾 Host Architecture: ${os.arch()}
🖥 Host CPU: ${cpuModel} (${cpuCores} cores)
⌨ CPU Usage: ${loadAvg}
📀 Total Ram: ${formatBytes(totalMem)}
💽 Ram Usage: ${formatBytes(usedMem)} (${memUsedPercent}%)
💽 Free Ram: ${formatBytes(freeMem)}

👤 Total Users: ${userCount}
👥 Total Groups: ${threadCount}
🌐 Network Interfaces: ${ifaceNames}
📎 Network Addresses:
${addresses.join('\n')}`.trim();

      await api.editMessage(systemInfo, checkingMessage.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ Failed to fetch system info: " + err.message, event.threadID);
    }
  }
};
