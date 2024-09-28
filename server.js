// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map(); // Store clients with their usernames

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const msgString = Buffer.isBuffer(message) ? message.toString() : message;
        console.log(`Received: ${msgString}`);

        // Broadcast the message to all clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msgString);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        broadcastUserList();
    });

    ws.on('username', (username) => {
        clients.set(ws, username); // Store the username for the client
        broadcastUserList();
    });
});

// Function to broadcast the list of connected users
function broadcastUserList() {
    const usernames = Array.from(clients.values()).join(',');
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`USER_LIST:${usernames}`);
        }
    });
}

console.log('WebSocket server started on ws://localhost:8080');
