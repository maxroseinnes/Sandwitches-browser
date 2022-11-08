const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const ipv4 = require("ip").address();
const localhost = true;
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

var players = {};
var projectiles = {};

var TPS = 20;

app.use(express.static("public"));


var timeOfLastTick;
function tick() {
  var data = {}
  for (var name in players) {
    data[name] = {position: players[name].position, yaw: players[name].position}
  }
  for (var name in players) {
    data[name].socket.emit("playerUpdate", data);
  }

  if (timeOfLastTick != undefined) {
    //console.log("TPS: " + 1000 / (new Date().getTime() - timeOfLastTick));
  }

  timeOfLastTick = new Date().getTime();
}


setInterval(tick, 1000 / TPS);

socketServer.on("connection", (socket) => {
  /*socket.emit("pingRequest")
  socket.on("ping", () => {
    socket.emit("ping")
  });

  socket.on("pingTestComplete", (ping) => {
    socket.emit("startTicking", TPS);
    setTimeout(() => { setInterval(tick, 1000 / TPS) }, ping / 2);
  })*/
  
  socket.emit("startTicking", TPS)

  var otherPlayersInfo = [];
  for (var name in players) {
    otherPlayersInfo.push({ name: name, position: players[name].position, yaw: players[name].yaw});
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var nameIndex = Math.floor(Math.random() * availableNames.length)
  var name = availableNames[nameIndex]
  availableNames.splice(nameIndex, 1);

  if (name != null) { 
    var newPlayer = {name: name, position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5 }, yaw: 0 };
    players[name] = {position: newPlayer.position, yaw: newPlayer.yaw, socket}
    console.log(name + " joined! 😃😃😃😃😃😃😃 ", Object.keys(players).length)
    socket.emit("assignPlayer", { name: name, position: newPlayer.position, yaw: newPlayer.yaw});
    socket.broadcast.emit("newPlayer", {name: name, position: newPlayer.position, yaw: newPlayer.yaw});
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("playerUpdate", (data) => {
    players[data.name].position = data.position;
    players[data.name].yaw = data.yaw;
  })

  socket.on("shootProjectile", (data) => {

  })

  socket.on("disconnect", () => {
    var name
    for (name in players) {
      if (players[name].socket == socket) {
        socket.broadcast.emit("playerLeave", name)
        break
      }
    }
    console.log(name + " left. 😭😭😭😭😭😭😭");
    availableNames.push(name);
    players[name] = undefined
  })
});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 