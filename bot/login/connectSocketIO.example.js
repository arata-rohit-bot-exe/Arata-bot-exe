const { io } = require('socket.io-client');

const socket = io('https://queenbotv2-1-1.onrender.com', {
	query: {
		verifyToken: "Fn96OxLwWEfENTPYPAiXqwdieaIsn4Y5OH2APP0O"
	},
	transports: ['websocket'], // Optional: force websocket
	reconnection: true,
	reconnectionAttempts: 10,
	reconnectionDelay: 3000,
	timeout: 10000
});

const channel = "uptime";

socket.on(channel, data => {
	console.log(`[uptime]`, data);
});

socket.on('connect', () => {
	console.log('Connected to socket successfully');
});

socket.on('disconnect', reason => {
	console.log('Disconnected:', reason);
});

socket.on('connect_error', error => {
	console.error('Connection error:', error.message || error);
});
