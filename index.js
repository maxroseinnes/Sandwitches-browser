
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const ipv4 = require("ip").address();
const localhost = false;
const port = 3000;

const DEFAULT_PLAYER_HEALTH = 100 

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



var players = {};

var TPS = 20;

app.use(express.static("public"));

function respawnPlayer(name) {
  console.log("test")

  players[name].position.x = Math.random() * 10 - 5;
  players[name].position.z = Math.random() * 10 - 5;
  players[name].position.yaw = 0
  players[name].position.pitch = 0
  players[name].respawnedThisTick = true
  players[name].socket.emit("respawn", {
    position: {
      x: players[name].position.x, 
      y: players[name].position.y, 
      z: players[name].position.z, 
      yaw: players[name].position.yaw, 
      lean: players[name].position.lean
    },
    state: players[name].state,
    health: DEFAULT_PLAYER_HEALTH,
  })
}

var timeOfLastTick;
function tick() {
  var playersData = []
  for (var name in players) {
    if (players[name] != null) playersData.push({
      name: name, 
      position: players[name].position, 
      health: players[name].health, 
      respawnedThisTick: players[name].respawnedThisTick,
      state: players[name].state})
  }
  for (var name in players) {
    if (players[name] != null) players[name].socket.emit("playerUpdate", playersData);
  }
  for (var name in players) {
    players[name].respawnedThisTick = false
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
    var newPlayer = { 
      position: { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5, yaw: 0, lean: 0 }, 
      health: DEFAULT_PLAYER_HEALTH,
      state: { walkCycle: 0, crouchValue: 0, slideValue: 0 }, 
      socket: socket};
    players[name] = newPlayer;
    console.log(name + " joined! 😃😃😃😃😃😃😃")
    socket.emit("assignPlayer", { 
      name: name, 
      position: newPlayer.position, 
      health: newPlayer.health, 
      state: newPlayer.state});
    socket.broadcast.emit("newPlayer", { 
      name: name, 
      position: newPlayer.position, 
      health: newPlayer.health, 
      state: newPlayer.state});
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("playerUpdate", (data) => {
    if (players[data.name] != null) {
      players[data.name].position = data.position;
      players[data.name].state = data.state;
    }
  })

  socket.on("playerHit", (hitInfo) => {
    var newHealth = players[hitInfo.target].health - hitInfo.damage
    if (newHealth > 0) {
      players[hitInfo.target].health = newHealth
      console.log(newHealth)
    } else {
      var deathMessage = hitInfo.target + " was killed by " + hitInfo.from
      socket.broadcast.emit("chatMessage", deathMessage)
      respawnPlayer(hitInfo.target)
    }
  })

  socket.on("death", (deathInfo) => {
    respawnPlayer(deathInfo.name)

    var deathMessage;
    if (deathInfo.type == "void") {
      deathMessage = deathInfo.name + " fell into the void."
    } else {
      deathMessage = deathInfo.name + " died."
    }
    console.log(deathMessage)
    socket.broadcast.emit("chatMessage", deathMessage)
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