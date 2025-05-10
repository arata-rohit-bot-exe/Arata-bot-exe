const { commands } = global.GoatBot;

module.exports = {
  config: {
    name: "category",
    version: "1.0",
    author: "Rifat",
    role: 2, // Admin role only
    shortDescription: {
      en: "Set, edit, or remove categories for a command",
    },
    longDescription: {
      en: "Set, edit, or remove categories for a command by specifying the command name and desired category",
    },
    category: "admin",
    guide: {
      en: "{pn} /category [add|edit|remove] [cmdName] [category]",
    },
    priority: 2,
  },

  onStart: async function ({ message, args, event, role }) {
    const { threadID } = event;
    const prefix = global.utils.getPrefix(threadID);

    if (role < 2) {
      return message.reply("You don't have permission to use this command.");
    }

    if (args.length < 3) {
      return message.reply(`Usage: ${prefix}category [add|edit|remove] [cmdName] [category]`);
    }

    const action = args[0].toLowerCase();
    const cmdName = args[1].toLowerCase();
    const category = args.slice(2).join(" ");

    const command = commands.get(cmdName);

    if (!command) {
      return message.reply(`Command "${cmdName}" not found.`);
    }

    switch (action) {
      case "add":
        command.config.category = category;
        await message.reply(`Category for command "${cmdName}" has been set to "${category}"`);
        break;
      case "edit":
        command.config.category = category;
        await message.reply(`Category for command "${cmdName}" has been edited to "${category}"`);
        break;
      case "remove":
        delete command.config.category;
        await message.reply(`Category for command "${cmdName}" has been removed.`);
        break;
      default:
        return message.reply(`Invalid action. Use "add", "edit", or "remove".`);
    }
  },
};
