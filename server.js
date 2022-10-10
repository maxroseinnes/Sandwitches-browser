const ws = require("ws");
const server = new ws.Server({
    port: 3000
})

server.on("connection", () => {
    console.log("New client connected!");
    server.on("message", (data) => {
        console.log("Received \"", data, "\" from client.");
    })
    server.on("close", () => {
        console.log("Client disconnected.");
    })
})