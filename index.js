
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

  lobby1: {
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
      },

      {type: "basic", x: 10,  y: 1,    z: 16,  scale: 1},
      {type: "basic", x: 10,  y: 1,    z: 10,  scale: 1},
      {type: "basic", x: 15,  y: 3.5,  z: 5,   scale: 1},
      {type: "basic", x: 19,  y: 6,    z: -5,  scale: 1},
      {type: "basic", x: 26,  y: 8.5,  z: -9,  scale: 1},
      {type: "basic", x: 25,  y: 10,   z: -15, scale: 1},
      {type: "basic", x: 19,  y: 11.5, z: -10, scale: 1},
      {type: "basic", x: 13,  y: 13.5, z: -2,  scale: 1},
      {type: "basic", x: 10,  y: 16,   z: 5,   scale: 1},
      {type: "basic", x: 5,   y: 18.5, z: 10,  scale: 1},
      {type: "basic", x: 2,   y: 21,   z: 8,   scale: 1},
      {type: "basic", x: -5,  y: 23.5, z: 5,   scale: 1}
      
  
  
    ]
    
  },

  lobby2: {
    floorTexture: "sub",
  
    platforms: [
    ]
    
  }




}



var nextId = 0
var nextWeaponId = 0

const TPS = 20;

app.use(express.static("public"));


class Room {
  mapData = {}
  players = {}
  weapons = {}
  constructor(mapData) {
    this.mapData = mapData

    this.tickInterval = setInterval(this.tick, 1000 / TPS, this)
  }

  addPlayer(socket, assignedId) {
    socket.emit("map", this.mapData);
  
    let otherPlayersInfo = {};
    for (let id in this.players) {
      if (this.players[id] != null) otherPlayersInfo[id] = { name: this.players[id].name, position: this.players[id].position, state: this.players[id].state, currentWeaponType: this.players[id].currentWeaponType };
    }
    socket.emit("otherPlayers", otherPlayersInfo);
  
    let nameIndex = Math.floor(Math.random() * availableNames.length)
    let name = availableNames[nameIndex]
    console.log(name + " joined! 😃😃😃😃😃😃😃")
    availableNames.splice(nameIndex, 1);
  
    // temp variables about new player
    let position = { x: 10 * Math.random() - 5, y: 0, z: 10 * Math.random() - 5, yaw: 0, lean: 0 }
    let state = { walkCycle: 0, crouchValue: 0, slideValue: 0 }
  
    this.players[assignedId] = {
      name: name,
      position: position, 
      health: DEFAULT_PLAYER_HEALTH,
      state: state,
      socket: socket
    }
  
    // Send the needed info for the new client to generate their player
    socket.emit("assignPlayer", {
      id: assignedId,
      name: name,
      position: position, 
      health: DEFAULT_PLAYER_HEALTH, 
      state: state
    });
  
    socket.emit("startTicking", TPS)
    
  
    // Send everyone else the new player info
    this.broadcast("newPlayer", { 
      id: assignedId,
      name: name, 
      position: position, 
      health: DEFAULT_PLAYER_HEALTH, 
      state: state
    }, assignedId);

    socket.on("nameChange", (data) => {
      if (this.players[data.id] != null) {
        this.players[data.id].name = data.newName
        this.broadcast("nameChange", {id: data.id, newName: data.newName}, null)
      }
    })

    socket.on("sendChatMessage", (msg) => {
      this.broadcast("chatMessage", msg, null)
    })
  
    socket.on("playerUpdate", (data) => {
      if (this.players[data.id] != null) {
        this.players[data.id].position = data.position;
        this.players[data.id].state = data.state;
        this.players[data.id].currentWeaponType = data.currentWeaponType;
      }
    })
  
    socket.on("playerHit", (hitInfo) => {
      if (this.players[hitInfo.target] == undefined) return
      let newHealth = this.players[hitInfo.target].health - hitInfo.damage
      if (newHealth > 0) {
        this.players[hitInfo.target].health = newHealth
        console.log(newHealth)
      } else {
        let deathMessage = this.players[hitInfo.target].name + " was killed by " + this.players[hitInfo.from].name
        this.broadcast("chatMessage", deathMessage, null)
        this.respawnPlayer(hitInfo.target)
      }
    })

    // MAKING WEAPONS: 
    // client: send newWeapon message
    // server: brodcast message with weapon id and data

    socket.on("newWeapon", (data) => {
      this.weapons[nextWeaponId] = {
        type: data.type,
        ownerId: data.ownerId,
        position: data.position,
      }

      this.broadcast("newWeapon", {
        id: nextWeaponId,
        type: data.type,
        ownerId: this.weapons[nextWeaponId].ownerId,
        position: this.weapons[nextWeaponId].position,
        velocity: data.velocity
      }, null)

      nextWeaponId++
    })
  
    socket.on("death", (deathInfo) => {
      this.respawnPlayer(deathInfo.id)
  
      let deathMessage;
      if (deathInfo.type == "void") {
        deathMessage = deathInfo.name + " fell into the void."
      } else {
        deathMessage = deathInfo.name + " died."
      }
      console.log(deathMessage)
      this.broadcast("chatMessage", deathMessage, false)
    })
  
    socket.on("disconnect", () => {
      for (let id in this.players) {
        // maybe using object takes a little too long to fully delete the name value pair?
        // adding if (this.players[name] != null) fixes problem
        if (this.players[id] != null && socket == this.players[id].socket) {
          this.broadcast("playerLeave", id, null);
          console.log(this.players[id].name + " left. 😭😭😭😭😭😭😭");
          availableNames.push(this.players[id].name);
          delete this.players[id];
        }
      }
  
    })
  }

  respawnPlayer(id) {
    this.players[id].position.x = Math.random() * 10 - 5;
    this.players[id].position.y = 0;
    this.players[id].position.z = Math.random() * 10 - 5;
    this.players[id].position.yaw = 0
    this.players[id].position.pitch = 0
    this.players[id].health = DEFAULT_PLAYER_HEALTH
    this.players[id].socket.emit("respawn", {
      position: {
        x: this.players[id].position.x, 
        y: this.players[id].position.y, 
        z: this.players[id].position.z, 
        yaw: this.players[id].position.yaw, 
        lean: this.players[id].position.lean
      },
      state: this.players[id].state,
      health: DEFAULT_PLAYER_HEALTH,
    })
  }

  genPlayerPacket(id) {
    var data = {}
    data.position = {
      x: this.players[id].position.x,
      y: this.players[id].position.y,
      z: this.players[id].position.z,
      yaw: this.players[id].position.yaw,
      lean: this.players[id].position.lean,
    }
    data.state = this.players[id].state
    data.currentWeaponType = this.players[id].currentWeaponType
    data.health = this.players[id].health
  
    return data
  }

  broadcast(eventName, msg, except) {
    for (var id in this.players) {
      if (id != except) this.players[id].socket.emit(eventName, msg)
    }
  }

  timeOfLastTick
  tick(room) {
    // Compile player data into an array
    var playersData = {}
    for (var id in room.players) {
      if (room.players[id] != null) playersData[id] = room.genPlayerPacket(id)
    }
  
    // Send array to each connected player
    room.broadcast("playerUpdate", playersData, null)
  
    if (room.timeOfLastTick != undefined) {
      //console.log("TPS: " + 1000 / (new Date().getTime() - timeOfLastTick));
    }
  
    room.timeOfLastTick = new Date().getTime();
  }
  
}

var rooms = {
  1: new Room(maps.lobby1),
  2: new Room(maps.lobby2)
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
  
  socket.on("joinRoom", (roomId) => {
    for (let i in rooms) {
      if (Object.keys(rooms[i].players).indexOf(String(nextId)) != -1) { // if joining player is in this room
        rooms[i].broadcast("playerLeave", nextId, null);
        console.log(rooms[i].players[nextId].name + " left. 😭😭😭😭😭😭😭");

        let listeners = socket.eventNames()
        for (let j in listeners) {
          if (listeners[j] == "joinRoom") continue
          socket.removeAllListeners(listeners[j])
        }

        socket.emit("stopTicking")

        availableNames.push(rooms[i].players[nextId].name);
        delete rooms[i].players[nextId];
      }
    }
    rooms[roomId].addPlayer(socket, nextId)
    console.log("room: " + roomId)
    console.log("id: " + nextId)
  })
  nextId++
  
});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 