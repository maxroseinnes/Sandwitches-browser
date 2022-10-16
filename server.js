const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const port = 3000;

app.use(express.static("public"));

socketServer.on("connection", (socket) => {
  console.log("New client connected!");e
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});