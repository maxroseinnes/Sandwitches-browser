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


var maps = {

  lobby: {
    floorTexture: "sub",
  
    platforms: [
      {
        type: "crate",
        scale: 1,
        x: -15,
        y: 0,
        z: -5
      },
      {
        type: "pinetree",
        scale: 2,
        x: 0,
        y: 0,
        z: 0
      },
      {
        type: "crate",
        scale: 1.5,
        x: -20,
        y: 0,
        z: -7
      },
      {
        type: "crate",
        scale: 1.75,
        x: -23,
        y: 0,
        z: -15
      },
      {
        type: "crate",
        scale: 2,
        x: -33,
        y: 0,
        z: -10
      }
      
  
  
    ]
    
  }




}



var players = [];

var TPS = 20;

app.use(express.static("public"));


var timeOfLastTick;
function tick() {
  var data = []
  for (var name in players) {
    if (players[name] != null) data.push({name: name, position: players[name].position, state: players[name].state})
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
  
  socket.emit("map", maps.lobby);

  var otherPlayersInfo = [];
  for (var name in players) {
    if (players[name] != null) otherPlayersInfo.push({ name: name, position: players[name].position, state: players[name].state });
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var nameIndex = Math.floor(Math.random() * availableNames.length)
  var name = availableNames[nameIndex]
  availableNames.splice(nameIndex, 1);

  if (name != null) { 
    var newPlayer = { position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5, yaw: 0, lean: 0 }, state: { walkCycle: 0, crouchValue: 0, slideValue: 0 }, socket: socket };
    players[name] = newPlayer;
    console.log(name + " joined! 😃😃😃😃😃😃😃")
    socket.emit("assignPlayer", { name: name, position: newPlayer.position, state: newPlayer.state});
    socket.broadcast.emit("newPlayer", { name: name, position: newPlayer.position, state: newPlayer.state});
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("playerUpdate", (data) => {
    if (players[data.name] != null) {
      players[data.name].position = data.position;
      players[data.name].state = data.state;
    }
  })

  socket.on("death", (deathInfo) => {
    console.log("death")
    var deathMessage = deathInfo.name;
    if (deathInfo.type = "void") {
      deathMessage += " fell into the void."
    } else {
      deathMessage += " died from an unknown cause."
    }
    console.log(deathMessage)
    socket.broadcast.emit("death", deathMessage)
  })

  socket.on("disconnect", () => {
    for (var name in players) {
      // maybe using object takes a little too long to fully delete the name value pair?
      // adding if (players[name] != null) fixes problem
      if (players[name] != null && socket == players[name].socket) {
        socket.broadcast.emit("playerLeave", name);
        console.log(name + " left. 😭😭😭😭😭😭😭");
        availableNames.push(name);
        delete players[name];
      }
    }
  })
});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 