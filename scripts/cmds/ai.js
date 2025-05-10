const axios = require('axios');

let prefixes = ['ai', 'noob', '.ai'];

const axiosInstance = axios.create();

module.exports = {
  config: {
    name: 'ai',
    version: '1.0.1',
    role: 0,
    category: 'AI',
    author: 'rifat',
    shortDescription: 'Ask Gemini AI anything',
    longDescription: 'NOOB BOTV2 can answer your questions using Gemini AI.',
  },

  onStart: async function () {},

  onChat: async function ({ message, event, args, api }) {
    const command = args[0]?.toLowerCase();

    // Help command
    if (command === 'help') {
      return message.reply(
        `[ NOOB BOTV2 AI HELP ]
• Prefixes: ${prefixes.join(', ')}
• Usage: ${prefixes[0]} <your question>
• Add new prefix: addprefix <prefix>
• Say hi: hi`
      );
    }

    // Add new prefix
    if (command === 'addprefix') {
      const newPrefix = args[1];
      if (newPrefix && !prefixes.includes(newPrefix)) {
        prefixes.push(newPrefix);
        return message.reply(`Prefix "${newPrefix}" added.`);
      } else {
        return message.reply('Invalid or duplicate prefix.');
      }
    }

    // Check prefix
    const matchPrefix = prefixes.find(p => event.body?.toLowerCase().startsWith(p));
    if (!matchPrefix) return;

    const userQuery = event.body.slice(matchPrefix.length).trim();
    if (!userQuery) return message.reply('NOOB BOTV2 is listening...');

    if (command === 'hi') {
      const replies = [
        'Hello!',
        'Hi there!',
        'How can I assist you today?',
        'I am here to help you.',
      ];
      return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }

    const cleanedQuery = userQuery.replace(/\b(ai|noob|\.ai)\b/gi, '').trim();
    const encodedQuery = encodeURIComponent(cleanedQuery);

    const waitMsg = await message.reply('NOOB BOTV2 is thinking...');

    try {
      const res = await axiosInstance.get(`https://priyansh-ai.onrender.com/gemini/ai?query=${encodedQuery}`);
      console.log('[AI DEBUG]', res.data); // Log to debug

      const result =
        typeof res.data === 'string'
          ? res.data
          : res.data.response || res.data.result || JSON.stringify(res.data);

      await api.editMessage(result, waitMsg.messageID);
    } catch (error) {
      console.error('AI ERROR:', error);
      await api.editMessage('Error fetching AI response.', waitMsg.messageID);
    }
  }
};
