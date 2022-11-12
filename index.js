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
  "Olive"/*, 
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
  "Anthony"*/
];

var players = [];

var TPS = 20;

app.use(express.static("public"));


var timeOfLastTick;
function tick() {
  var data = []
  for (var name in players) {
    if (players[name] != null) data.push({name: name, position: players[name].position, yaw: players[name].yaw, pitch: players[name].pitch})
  }
  //console.log(data)
  for (var name in players) {
    if (players[name] != null) players[name].socket.emit("playerUpdate", data);
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
    if (players[name] != null) otherPlayersInfo.push({ name: name, position: players[name].position, yaw: players[name].yaw, pitch: players[name].pitch});
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var nameIndex = Math.floor(Math.random() * availableNames.length)
  var name = availableNames[nameIndex]
  availableNames.splice(nameIndex, 1);

  if (name != null) { 
    var newPlayer = { position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5 }, yaw: 0, pitch: 0, socket: socket };
    players[name] = newPlayer;
    console.log(name + " joined! 😃😃😃😃😃😃😃")
    socket.emit("assignPlayer", { name: name, position: newPlayer.position, yaw: newPlayer.yaw, pitch: newPlayer.pitch});
    socket.broadcast.emit("newPlayer", { name: name, position: newPlayer.position, yaw: newPlayer.yaw, pitch: newPlayer.pitch});
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("playerUpdate", (data) => {
    if (players[data.name] != null) {
      players[data.name].position = data.position;
      players[data.name].yaw = data.yaw;
      players[data.name].pitch = data.pitch;
    }
  })

  socket.on("disconnect", () => {
    for (var name in players) {
      // maybe using object takes a little too long to fully delete the object?
      // adding if (players[name] != null) fixes problem
      if (players[name] != null && socket == players[name].socket) {
        socket.broadcast.emit("playerLeave", name);
        console.log(name + " left. 😭😭😭😭😭😭😭");
        availableNames.push(name);
        players[name] = undefined;
      }
    }
  })
});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 