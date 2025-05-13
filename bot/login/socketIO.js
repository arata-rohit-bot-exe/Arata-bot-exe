// This module will be called if enabled in the config (serverUptime.socket.enable = true)
/**
 * Example client connection:
 * See ./connectSocketIO.example.js
 */

const { Server } = require("socket.io");
const { log, getText } = global.utils;
const { config } = global.GoatBot;

module.exports = async (server) => {
	const { channelName, verifyToken } = config.serverUptime.socket;

	try {
		// Check required config
		if (!channelName) {
			throw new Error('"channelName" is not defined in config');
		}
		if (!verifyToken) {
			throw new Error('"verifyToken" is not defined in config');
		}

		// Create a new socket.io server
		const io = new Server(server, {
			cors: {
				origin: "*", // Change this to your frontend origin for security
				methods: ["GET", "POST"]
			}
		});

		log.info("SOCKET IO", getText("socketIO", "connected"));

		io.on("connection", (socket) => {
			const token = socket.handshake.query.verifyToken;

			// Verify token
			if (token !== verifyToken) {
				log.warn("SOCKET IO", `Invalid token from socket ${socket.id}`);
				io.to(socket.id).emit(channelName, {
					status: "error",
					message: "Token is invalid"
				});
				socket.disconnect();
				return;
			}

			log.info("SOCKET IO", `Client connected: ${socket.id}`);

			// Emit successful connection message
			io.to(socket.id).emit(channelName, {
				status: "success",
				message: "Connected to server successfully"
			});

			socket.on("disconnect", () => {
				log.info("SOCKET IO", `Client disconnected: ${socket.id}`);
			});
		});
	} catch (err) {
		log.err("SOCKET IO", getText("socketIO", "error"), err);
	}
};
