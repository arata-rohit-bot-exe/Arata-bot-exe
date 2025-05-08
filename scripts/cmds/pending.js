module.exports = {
  config: {
    name: "pending",
    version: "2.5.0",
    author: "Rifat",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "Phê duyệt nhóm chờ",
      en: "Approve pending threads"
    },
    longDescription: {
      vi: "Phê duyệt hoặc từ chối các nhóm đang chờ bot tham gia",
      en: "Approve or reject threads pending bot approval"
    },
    category: "admin"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "Rejected %1 thread(s)!",
      approveSuccess: "Approved successfully %1 thread(s)!",
      cantGetPendingList: "Can't get the pending list!",
      returnListPending: "»『PENDING』«❮ Total threads awaiting approval: %1 ❯\n\n%2",
      returnListClean: "『PENDING』There are no threads in the pending list.",
      welcome: "QueenBot is now connected 🫂🤍:\n\n• Join our support group:\nhttps://facebook.com/groups/7067206133407080/\n\n• Type %1enter to join messenger group\n• Type %1help1 for command list"
    },
    vi: {
      invaildNumber: "%1 không phải là số hợp lệ",
      cancelSuccess: "Đã từ chối %1 nhóm!",
      approveSuccess: "Đã phê duyệt thành công %1 nhóm!",
      cantGetPendingList: "Không thể lấy danh sách nhóm chờ!",
      returnListPending: "»『CHỜ DUYỆT』«❮ Tổng số nhóm đang chờ duyệt: %1 ❯\n\n%2",
      returnListClean: "『CHỜ DUYỆT』Không có nhóm nào đang chờ duyệt.",
      welcome: "QueenBot đã kết nối thành công 🫂🤍:\n\n• Tham gia nhóm hỗ trợ:\nhttps://facebook.com/groups/7067206133407080/\n\n• Gõ %1enter để vào nhóm chat\n• Gõ %1help1 để xem lệnh bot"
    }
  },

  onReply: async function({ api, event, Reply, getLang, prefix }) {
    if (event.senderID !== Reply.author) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    if (body.toLowerCase().startsWith("c")) {
      const index = body.slice(1).split(/\s+/).map(num => parseInt(num)).filter(num => !isNaN(num) && num > 0 && num <= Reply.pending.length);
      for (const i of index) {
        await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[i - 1].threadID);
        count++;
      }
      return api.editMessage(getLang("cancelSuccess", count), messageID);
    }

    const index = body.split(/\s+/).map(num => parseInt(num)).filter(num => !isNaN(num) && num > 0 && num <= Reply.pending.length);
    for (const i of index) {
      api.sendMessage(getLang("welcome", prefix), Reply.pending[i - 1].threadID);
      count++;
    }
    return api.editMessage(getLang("approveSuccess", count), messageID);
  },

  onStart: async function({ api, event, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(t => t.isSubscribed && t.isGroup);

      if (list.length === 0)
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);

      const msg = list.map((group, i) => `${i + 1}/ ${group.name} (${group.threadID})`).join('\n');
      return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: senderID,
          pending: list
        });
      }, messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
