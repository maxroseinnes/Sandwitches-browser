const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const port = 3000;

const names = ["Steve", "Alex", "Emma", "Jeff", "Olivia"];

var players = [];

app.use(express.static("public"));

socketServer.on("connection", (socket) => {
  var otherPlayersInfo = [];
  for (var i = 0; i < players.length; i++) {
    otherPlayersInfo.push({ position: players[i].position, name: players[i].name });
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var name;
  for (var i = 0; i < names.length; i++) {
    var nameAvailable = true;
    for (var j = 0; j < players.length; j++) {
      if (names[i] == players[j].name) {
        nameAvailable = false;
        break;
      }
    }
    if (nameAvailable) {
      name = names[i];
      break;
    }
  }

  if (name != null) { 
    players.push({ position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5 }, name: name, socket: socket});
    console.log(name + " joined!")
    socket.emit("assignPlayer", { position: players[players.length - 1].position, name: players[players.length - 1].name});
    socket.broadcast.emit("newPlayer", { position: players[players.length - 1].position, name: players[players.length - 1].name });
  } else {
    socket.emit("tooManyPlayers");
  }


  socket.on("disconnect", () => {
    for (var i = 0; i < players.length; i++) {
      if (socket == players[i].socket) {
        socket.broadcast.emit("playerLeave", players[i].name);
        console.log(players[i].name + " left.");
        players.splice(i);
      }
    }
  })
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});