const axios = require("axios");

module.exports = {
  config: {
    name: "movie",
    version: "1.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Suggest a movie by category",
      vi: "Gợi ý phim theo thể loại"
    },
    longDescription: {
      en: "Suggests a random movie from a given genre using OMDb API",
      vi: "Đề xuất một bộ phim ngẫu nhiên từ thể loại bạn yêu cầu (OMDb API)"
    },
    category: "fun",
    guide: {
      en: "{p}movie [category]",
      vi: "{p}movie [thể loại]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const genre = args.join(" ") || "action";
    const apiKey = "ec7115";

    try {
      // Step 1: Search by category
      const searchRes = await axios.get(`http://www.omdbapi.com/`, {
        params: {
          apikey: apiKey,
          s: genre,
          type: "movie"
        }
      });

      const results = searchRes.data.Search;
      if (!results || results.length === 0) {
        return api.sendMessage(`No movies found for category: ${genre}`, event.threadID, event.messageID);
      }

      // Step 2: Pick random result
      const chosen = results[Math.floor(Math.random() * results.length)];

      // Step 3: Fetch full details
      const detailRes = await axios.get(`http://www.omdbapi.com/`, {
        params: {
          apikey: apiKey,
          i: chosen.imdbID,
          plot: "full"
        }
      });

      const m = detailRes.data;
      const message = 
        `🎬 Title: ${m.Title}\n` +
        `📅 Year: ${m.Year}\n` +
        `🎭 Genre: ${m.Genre}\n` +
        `⭐ IMDb Rating: ${m.imdbRating}\n` +
        `📝 Plot: ${m.Plot}`;

      if (m.Poster && m.Poster !== "N/A") {
        const img = (await axios.get(m.Poster, { responseType: "stream" })).data;
        return api.sendMessage({ body: message, attachment: img }, event.threadID, event.messageID);
      } else {
        return api.sendMessage(message, event.threadID, event.messageID);
      }

    } catch (e) {
      return api.sendMessage("Error: " + e.message, event.threadID, event.messageID);
    }
  }
};
