const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const port = 3000;

const availableNames = ["Steve", "Alex", "Emma", "Jeff", "Olive"];

var players = [];

var TPS = 20;

app.use(express.static("public"));



function tick() {
  for (var i = 0; i < players.length; i++) {
    var data = [];
    for (var j = 0; j < players.length; j++) {
      if (i != j) {
        data.push(players[j]);
      }
    }
    players[i].socket.emit("playerUpdate", data);
  }
}

socketServer.on("connection", (socket) => {
  /*socket.emit("pingRequest")
  socket.on("ping", () => {
    socket.emit("ping")
  });

  socket.on("pingTestComplete", (ping) => {
    socket.emit("startTicking", TPS);
    setTimeout(() => { setInterval(tick, 1000 / TPS) }, ping / 2);
  })*/
  setInterval(tick, 1000 / TPS);
  socket.emit("startTicking", TPS)

  var otherPlayersInfo = [];
  for (var i = 0; i < players.length; i++) {
    otherPlayersInfo.push({ position: players[i].position, name: players[i].name });
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var nameIndex = Math.floor(Math.random() * availableNames.length)
  var name = availableNames[nameIndex]
  availableNames.splice(nameIndex, 1);

  if (name != null) { 
    players.push({ position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5 }, name: name, socket: socket});
    console.log(name + " joined!")
    socket.emit("assignPlayer", { position: players[players.length - 1].position, name: players[players.length - 1].name});
    socket.broadcast.emit("newPlayer", { position: players[players.length - 1].position, name: players[players.length - 1].name });
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("playerUpdate", (data) => {
    for (var i = 0; i < players.length; i++) {
      if (data.name == players[i].name) {
        players[i].position = data.position;
      }
    }
  })

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