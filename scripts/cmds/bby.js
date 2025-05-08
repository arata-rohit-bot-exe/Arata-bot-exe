const axios = require('axios');

const baseApiUrl = async () => {
	return "https://www.noobs-api.rf.gd/dipto";
};

module.exports.config = {
	name: "bby",
	aliases: ["baby", "bbe", "babe"],
	version: "6.9.0",
	author: "rifat",
	countDown: 0,
	role: 0,
	description: "Better than all sim simi",
	category: "chat",
	guide: {
		en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR\nall OR\nedit [YourMessage] - [NewMessage]"
	}
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
	const link = `${await baseApiUrl()}/baby`;
	const dipto = args.join(" ").toLowerCase();
	const uid = event.senderID;
	let command, comd, final;

	try {
		if (!args[0]) {
			const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
			return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
		}

		if (args[0] === 'remove') {
			const fina = dipto.replace("remove ", "");
			const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
			return api.sendMessage(dat, event.threadID, event.messageID);
		}

		if (args[0] === 'rm' && dipto.includes('-')) {
			const [fi, f] = dipto.replace("rm ", "").split(' - ');
			const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
			return api.sendMessage(da, event.threadID, event.messageID);
		}

		if (args[0] === 'list') {
			if (args[1] === 'all') {
				const data = (await axios.get(`${link}?list=all`)).data;
				const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
					const number = Object.keys(item)[0];
					const value = item[number];
					const name = (await usersData.get(number)).name;
					return { name, value };
				}));
				teachers.sort((a, b) => b.value - a.value);
				const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
				return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
			} else {
				const d = (await axios.get(`${link}?list=all`)).data.length;
				return api.sendMessage(`Total Teach = ${d}`, event.threadID, event.messageID);
			}
		}

		if (args[0] === 'msg') {
			const fuk = dipto.replace("msg ", "");
			const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
			return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
		}

		if (args[0] === 'edit') {
			const [_, newReply] = dipto.split(' - ');
			if (!newReply || newReply.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
			const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${newReply}&senderID=${uid}`)).data.message;
			return api.sendMessage(`Changed ${dA}`, event.threadID, event.messageID);
		}

		if (args[0] === 'teach' && args[1] === 'react') {
			[comd, command] = dipto.split(' - ');
			final = comd.replace("teach react ", "");
			if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
			const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
			return api.sendMessage(`✅ Reactions added: ${tex}`, event.threadID, event.messageID);
		}

		if (args[0] === 'teach' && args[1] === 'amar') {
			[comd, command] = dipto.split(' - ');
			final = comd.replace("teach ", "");
			if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
			const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
			return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
		}

		if (args[0] === 'teach') {
			[comd, command] = dipto.split(' - ');
			final = comd.replace("teach ", "");
			if (!command || command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
			const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
			const tex = re.data.message;
			const teacher = (await usersData.get(re.data.teacher)).name;
			return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
		}

		if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
			const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
			return api.sendMessage(data, event.threadID, event.messageID);
		}

		const d = (await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`)).data.reply;
		api.sendMessage(d, event.threadID, (error, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName: module.exports.config.name,
				type: "reply",
				messageID: info.messageID,
				author: event.senderID,
				d,
				apiUrl: link
			});
		}, event.messageID);

	} catch (e) {
		console.error(e);
		api.sendMessage("❌ | Error occurred, check console!", event.threadID, event.messageID);
	}
};

module.exports.onReply = async ({ api, event, Reply }) => {
	try {
		const msg = event.body?.toLowerCase() || "";
		const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(msg)}&senderID=${event.senderID}&font=1`)).data.reply;
		await api.sendMessage(a, event.threadID, (error, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName: module.exports.config.name,
				type: "reply",
				messageID: info.messageID,
				author: event.senderID,
				a
			});
		}, event.messageID);
	} catch (err) {
		api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
	}
};

module.exports.onChat = async ({ api, event, message }) => {
	try {
		const body = event.body?.toLowerCase() || "";
		if (["baby", "bby", "bot", "jan", "babu", "janu"].some(prefix => body.startsWith(prefix))) {
			const arr = body.replace(/^\S+\s*/, "");
			const randomReplies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];

			if (!arr) {
				const replyMsg = randomReplies[Math.floor(Math.random() * randomReplies.length)];
				return api.sendMessage(replyMsg, event.threadID, (error, info) => {
					global.GoatBot.onReply.set(info.messageID, {
						commandName: module.exports.config.name,
						type: "reply",
						messageID: info.messageID,
						author: event.senderID
					});
				}, event.messageID);
			}

			const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
			await api.sendMessage(a, event.threadID, (error, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					commandName: module.exports.config.name,
					type: "reply",
					messageID: info.messageID,
					author: event.senderID,
					a
				});
			}, event.messageID);
		}
	} catch (err) {
		api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
	}
};
