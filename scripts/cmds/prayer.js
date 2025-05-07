const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");
const moment = require("moment-timezone");

const configPath = path.join(__dirname, "cache", "prayer_config.json");

if (!fs.existsSync(configPath)) {
  fs.writeJsonSync(configPath, { active: false });
}

let sentTimes = [];

module.exports = {
  config: {
    name: "prayer",
    version: "1.2",
    hasPermssion: 1,
    credits: "rifat",
    description: "বাংলাদেশ সময় অনুযায়ী নামাজের রিমাইন্ডার",
    commandCategory: "utility",
    usages: "[on/off/status/time list]",
    cooldowns: 5,
  },

  onStart: async function ({ message, args }) {
    const arg = args.join(" ")?.toLowerCase();
    const config = fs.readJsonSync(configPath);

    if (!arg || !["on", "off", "status", "time list"].includes(arg)) {
      return message.reply("ব্যবহার:\n• prayer on\n• prayer off\n• prayer status\n• prayer time list");
    }

    if (arg === "on") {
      if (config.active) return message.reply("ইতোমধ্যেই চালু আছে।");
      config.active = true;
      fs.writeJsonSync(configPath, config);
      return message.reply("✅ নামাজের রিমাইন্ডার চালু করা হয়েছে।");
    }

    if (arg === "off") {
      if (!config.active) return message.reply("ইতোমধ্যেই বন্ধ আছে।");
      config.active = false;
      fs.writeJsonSync(configPath, config);
      return message.reply("❌ নামাজের রিমাইন্ডার বন্ধ করা হয়েছে।");
    }

    if (arg === "status") {
      return message.reply(`নামাজের রিমাইন্ডার: ${config.active ? "✅ চালু" : "❌ বন্ধ"}`);
    }

    if (arg === "time list") {
      try {
        const { data } = await axios.get("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=3");
        const prayerTimes = data.data.timings;
        const banglaNames = {
          Fajr: "ফজর",
          Sunrise: "সূর্যোদয়",
          Dhuhr: "জোহর",
          Asr: "আসর",
          Maghrib: "মাগরিব",
          Isha: "এশা"
        };

        let msg = "আজকের নামাজের সময়সূচী (ঢাকা):\n";
        for (let key of ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
          const time = moment.tz(prayerTimes[key], ["HH:mm", "h:mm A"], "Asia/Dhaka").format("hh:mm A");
          msg += `• ${banglaNames[key]}: ${time}\n`;
        }

        return message.reply(msg.trim());
      } catch (e) {
        console.error("Prayer Time API Error:", e.message);
        return message.reply("নামাজের সময়সূচী আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
      }
    }
  },

  onLoad: async function ({ api }) {
    cron.schedule("* * * * *", async () => {
      const config = fs.readJsonSync(configPath);
      if (!config.active) return;

      try {
        const { data } = await axios.get("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=3");
        const prayerTimes = data.data.timings;

        const now = moment().tz("Asia/Dhaka").format("HH:mm");

        const names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const banglaNames = {
          Fajr: "ফজর",
          Dhuhr: "জোহর",
          Asr: "আসর",
          Maghrib: "মাগরিব",
          Isha: "এশা"
        };

        for (const prayer of names) {
          const time = moment.tz(prayerTimes[prayer], ["HH:mm", "h:mm A"], "Asia/Dhaka").format("HH:mm");
          if (time === now && !sentTimes.includes(time + prayer)) {
            const groups = await api.getThreadList(20, null, ["INBOX"]);
            for (const group of groups) {
              if (group.isGroup) {
                api.sendMessage(`নামাজের নাম (${banglaNames[prayer]}) সময় হয়েছে। সবাই নামাজ আদায় করুন।`, group.threadID);
              }
            }
            sentTimes.push(time + prayer);
            if (sentTimes.length > 30) sentTimes.shift();
          }
        }
      } catch (e) {
        console.error("[PRAYER CMD] API error:", e.message);
      }
    });
  }
};
