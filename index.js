
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
  "Anthony",
  "Silas"
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
        scale: 4,
        x: 0,
        y: 0,
        z: 0
      },
      {
        type: "crate",
        scale: 1.5 * 1.5,
        x: -20,
        y: 0,
        z: -7
      },
      {
        type: "crate",
        scale: 1.75 * 1.75,
        x: -23,
        y: 0,
        z: -15
      },
      {
        type: "crate",
        scale: 4,
        x: -33,
        y: 0,
        z: -10
      }
      
  
  
    ]
    
  }




}



var players = {};
var nextId = 0

const TPS = 20;

app.use(express.static("public"));

function respawnPlayer(id) {
  players[id].position.x = Math.random() * 10 - 5;
  players[id].position.y = 0;
  players[id].position.z = Math.random() * 10 - 5;
  players[id].position.yaw = 0
  players[id].position.pitch = 0
  players[id].health = DEFAULT_PLAYER_HEALTH
  players[id].socket.emit("respawn", {
    position: {
      x: players[id].position.x, 
      y: players[id].position.y, 
      z: players[id].position.z, 
      yaw: players[id].position.yaw, 
      lean: players[id].position.lean
    },
    state: players[id].state,
    health: DEFAULT_PLAYER_HEALTH,
  })
}

// Generate JSON containing data to be sent over the network for a specified player
function genPlayerPacket(id) {
  var data = {}
  data.position = {
    x: players[id].position.x,
    y: players[id].position.y,
    z: players[id].position.z,
    yaw: players[id].position.yaw,
    lean: players[id].position.lean,
  }
  data.state = players[id].state
  data.health = players[id].health

  return data
}

// Broadcast to all connected players except for a specified one
function broadcast(eventName, msg, except) {
  for (var id in players) {
    if (id != except) players[id].socket.emit(eventName, msg)
  }
}

var timeOfLastTick;
function tick() {
  // Compile player data into an array
  var playersData = {}
  for (var id in players) {
    if (players[id] != null) playersData[id] = genPlayerPacket(id)
  }

  // Send array to each connected player
  broadcast("playerUpdate", playersData, null)

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

  var otherPlayersInfo = {};
  for (var id in players) {
    if (players[id] != null) otherPlayersInfo[id] = { name: players[id].name, position: players[id].position, state: players[id].state };
  }
  socket.emit("otherPlayers", otherPlayersInfo);

  var nameIndex = Math.floor(Math.random() * availableNames.length)
  var name = availableNames[nameIndex]
  availableNames.splice(nameIndex, 1);

  // temp variables about new player
  var id = nextId
  var position = { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5, yaw: 0, lean: 0 }
  state = { walkCycle: 0, crouchValue: 0, slideValue: 0 }

  players[nextId] = {
    name: name,
    position: position, 
    health: DEFAULT_PLAYER_HEALTH,
    state: state,
    socket: socket
  }
  nextId++

  // Send the needed info for the new client to generate their player
  socket.emit("assignPlayer", {
    id: id,
    name: name,
    position: position, 
    health: DEFAULT_PLAYER_HEALTH, 
    state: state
  });


  // Send everyone else the new player info
  socket.broadcast.emit("newPlayer", { 
    id: id,
    name: name, 
    position: position, 
    health: DEFAULT_PLAYER_HEALTH, 
    state: state
  });

  socket.on("playerUpdate", (data) => {
    if (players[data.id] != null) {
      players[data.id].position = data.position;
      players[data.id].state = data.state;
    }
  })

  socket.on("playerHit", (hitInfo) => {
    var newHealth = players[hitInfo.target].health - hitInfo.damage
    if (newHealth > 0) {
      players[hitInfo.target].health = newHealth
      console.log(newHealth)
    } else {
      var deathMessage = players[hitInfo.target].name + " was killed by " + players[hitInfo.from].name
      socket.broadcast.emit("chatMessage", deathMessage)
      respawnPlayer(hitInfo.target)
    }
  })

  socket.on("death", (deathInfo) => {
    respawnPlayer(deathInfo.id)

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
    for (var id in players) {
      // maybe using object takes a little too long to fully delete the name value pair?
      // adding if (players[name] != null) fixes problem
      if (players[id] != null && socket == players[id].socket) {
        socket.broadcast.emit("playerLeave", id);
        console.log(players[id].name + " left. 😭😭😭😭😭😭😭");
        availableNames.push(players[id].name);
        delete players[id];
      }
    }

  })
});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 