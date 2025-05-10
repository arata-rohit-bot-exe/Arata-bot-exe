const os = require("os");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const axios = require("axios");

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["upt2"],
    version: "2.0",
    author: "Rifat",
    role: 0,
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, usersData, threadsData }) {
    const loading = await message.reply("🧩 Gathering system info...");
    
    const uptime = formatMilliseconds(process.uptime() * 1000);
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - os.freemem();
    const disk = await getDiskUsage();
    const cpu = os.cpus()[0];
    const pingStart = Date.now();

    const pingTest = await axios.get("https://api.ipify.org");
    const ping = Date.now() - pingStart;
    const publicIP = pingTest.data;

    // Extra bot-related info (users, threads)
    const allThreads = await threadsData.getAll();
    const allUsers = await usersData.getAll();

    // System Info Box
    const systemInfo = box("𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒", [
      `⚙️ 𝗢𝗦: ${os.type()} ${os.release()}`,
      `🧬 𝗔𝗿𝗰𝗵: ${os.arch()}`,
      `🧠 𝗖𝗣𝗨: ${cpu.model} (${os.cpus().length} cores)`,
      `📈 𝗟𝗼𝗮𝗱 𝗔𝘃𝗴: ${os.loadavg()[0].toFixed(2)}`
    ].join("\n"));

    // Memory Info Box
    const memoryInfo = box("𝗠𝗲𝗺𝗼𝗿𝘆 𝗨𝘀𝗲", [
      `🧾 𝗠𝗲𝗺𝗼𝗿𝘆 𝗨𝘀𝗲: ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)}`,
      `    ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ (31%)`
    ].join("\n"));

    // Disk Info Box
    const diskInfo = box("𝗗𝗶𝘀𝗸 𝗨𝘀𝗲", [
      `💽 𝗗𝗶𝘀𝗸 𝗨𝘀𝗲: ${prettyBytes(disk.used)} / ${prettyBytes(disk.total)}`,
      `    ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ (46%)`
    ].join("\n"));

    // Uptime Info Box
    const uptimeInfo = box("𝗨𝗽𝘁𝗶𝗺𝗲", [
      `⏱️ 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}`,
      `🖥️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽𝘁𝗶𝗺𝗲: ${formatUptime(os.uptime())}`,
      `📊 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 𝗠𝗲𝗺𝗼𝗿𝘆: ${prettyBytes(process.memoryUsage().rss)}`
    ].join("\n"));

    // Network Info Box
    const networkInfo = box("𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗦𝘁𝗮𝘁𝗨𝘀", [
      `🌍 𝗣𝘂𝗯𝗹𝗶𝗰 𝗜𝗣: ${publicIP}`,
      `📶 𝗣𝗶𝗻𝗴 𝗧𝗶𝗺𝗲: ${ping} ms`
    ].join("\n"));

    // Bot Stats Box
    const botStats = box("𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘂𝘀", [
      `👥 𝗨𝘀𝗲𝗿𝘀: ${allUsers.length}`,
      `🗣️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${allThreads.length}`,
      `👑 𝗔𝗱𝗺𝗶𝗻: [Rifat](https://facebook.com/rifat.gmer.69)`
    ].join("\n"));

    // Final Output
    const finalOutput = [
      "╭━━━[ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒 ]━━━╮",
      systemInfo,
      "┣━━━━━━━━━━━━━━━━━━",
      memoryInfo,
      "┣━━━━━━━━━━━━━━━━━━",
      diskInfo,
      "┣━━━━━━━━━━━━━━━━━━",
      uptimeInfo,
      "╰━━━━━━━━━━━━━━━━━━╯",
      networkInfo,
      botStats,
      "💥 **End of Status Report** 💥"
    ].join("\n");

    message.reply(finalOutput);
  }
};

async function getDiskUsage() {
  const { stdout } = await exec("df -k /");
  const [_, total, used] = stdout.split("\n")[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemaining = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}

function formatMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function prettyBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    ++i;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function box(title, content) {
  return `╭━━━[ ${title} ]━━━╮\n${content}\n╰━━━━━━━━━━━━━━━━━━╯`;
}
