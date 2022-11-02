const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const ipv4 = require("ip").address();
const localhost = false;
const port = 3000;

const availableNames = [
  "Steve", 
  "Alex", 
  "Emma", 
  "Jeff", 
  "Olive", 
  "James", 
  "Mary", 
  "Robert",
  "Patricia", 
  "John", 
  "Jennifer", 
  "Michael", 
  "Linda", 
  "David", 
  "Elizabeth", 
  "William", 
  "Barbara", 
  "Richard", 
  "Susan", 
  "Joseph", 
  "Jessica", 
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Lisa",
  "Daniel",
  "Nancy",
  "Matthew",
  "Betty",
  "Anthony"
];

var players = [];

var TPS = 20;

app.use(express.static("public"));



function tick() {
  for (var i = 0; i < players.length; i++) {
    var data = [];
    for (var j = 0; j < players.length; j++) {
      if (i != j) {
        data.push({ position: players[j].position, yaw: players[j].yaw, name: players[j].name });
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
    otherPlayersInfo.push({ position: players[i].position, yaw: players[i].yaw, name: players[i].name });
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var nameIndex = Math.floor(Math.random() * availableNames.length)
  var name = availableNames[nameIndex]
  availableNames.splice(nameIndex, 1);

  if (name != null) { 
    var newPlayer = { position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5 }, yaw: 0, name: name, socket: socket };
    players.push(newPlayer);
    console.log(name + " joined! 😃😃😃😃😃😃😃")
    socket.emit("assignPlayer", { position: newPlayer.position, yaw: newPlayer.yaw, name: name});
    socket.broadcast.emit("newPlayer", { position: newPlayer.position, yaw: newPlayer.yaw, name: name });
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("playerUpdate", (data) => {
    for (var i = 0; i < players.length; i++) {
      if (data.name == players[i].name) {
        players[i].position = data.position;
        players[i].yaw = data.yaw;
      }
    }
  })

  socket.on("disconnect", () => {
    for (var i = 0; i < players.length; i++) {
      if (socket == players[i].socket) {
        socket.broadcast.emit("playerLeave", players[i].name);
        console.log(players[i].name + " left. 😭😭😭😭😭😭😭");
        availableNames.push(players[i].name);
        players.splice(i, 1);
      }
    }
  })
});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
});