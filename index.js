// "npm install" to install all dependencies (package.json)
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const socketServer = new socketio.Server(server);
const ipv4 = require("ip").address();
const fs = require("fs")
const localhost = false;
const port = 3000;

const DEFAULT_PLAYER_HEALTH = 100
const ROOM_CAP = 10 // the max amount of rooms

var obj
var generatePlatforms



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





async function getModelData(name, out, seperateObjects) {
  fs.readFile("./public/assets/models/" + name, (err, data) => {
    out.modelInfo = obj.parseWavefront(data.toString(), seperateObjects)
    
    for (let i in weaponGeometry) if (weaponGeometry[i].modelInfo == null) return

    for (let i in weaponGeometry) weaponGeometry[i] = weaponGeometry[i].modelInfo
    //console.log(weaponGeometry)
  })
}

var weaponGeometry = {
  tomato: {path: "weapons/tomato.obj"},
  olive: {path: "weapons/low_poly_olive.obj"},
  pickle: {path: "weapons/small_horizontal_cylinder.obj"},
  sausage: {path: "weapons/sausage.obj"},
  pan: {path: "weapons/lowpolyfryingpanwith_meat_.obj"},
  anchovy: {path: "weapons/anchovy_terrible.obj"},
  meatball: {path: "weapons/meatball.obj"}
}






const weaponSpecs = {
  default: {
    class: "projectile",
    radius: .5,
    cooldown: 1, // seconds
    speed: .0375, // units/millisecond
    manaCost: 20,
    damage: 10,
    chargeTime: 0, // seconds
    burstCount: 1,
    burstInterval: .5 // time between shots of bursts, seconds
  },
  tomato: {
    class: "projectile",
    radius: .75,
    cooldown: .5,
    speed: .0375,
    manaCost: 5,
    damage: 5,
    chargeTime: 0,
    burstCount: 1,
    burstInterval: .5
  },
  olive: {
    class: "projectile",
    radius: .375,
    cooldown: .15,
    speed: .0375,
    manaCost: 5,
    damage: 10,
    chargeTime: 0,
    burstCount: 1,
    burstInterval: .5
  },
  pickle: {
    class: "projectile",
    radius: .5,
    cooldown: .5,
    speed: .0375,
    manaCost: 5,
    damage: 5,
    chargeTime: 0,
    burstCount: 1,
    burstInterval: .5
  },
  anchovy: {
    class: "missile",
    radius: .5,
    cooldown: .5,
    speed: .01,
    manaCost: 20,
    damage: 25,
    chargeTime: 0,
    burstCount: 1,
    burstInterval: .5
  },
}

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

      { type: "basic", x: 10, y: 1, z: 16, scale: 1 },
      { type: "basic", x: 10, y: 1, z: 10, scale: 1 },
      { type: "basic", x: 15, y: 3.5, z: 5, scale: 1 },
      { type: "basic", x: 19, y: 6, z: -5, scale: 1 },
      { type: "basic", x: 26, y: 8.5, z: -9, scale: 1 },
      { type: "basic", x: 25, y: 10, z: -15, scale: 1 },
      { type: "basic", x: 19, y: 11.5, z: -10, scale: 1 },
      { type: "basic", x: 13, y: 13.5, z: -2, scale: 1 },
      { type: "basic", x: 10, y: 16, z: 5, scale: 1 },
      { type: "basic", x: 5, y: 18.5, z: 10, scale: 1 },
      { type: "basic", x: 2, y: 21, z: 8, scale: 1 },
      { type: "basic", x: -5, y: 23.5, z: 5, scale: 1 }



    ]

  },

  lobby2: {
    floorTexture: "sub",

    platforms: [
      /*{
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

      { type: "basic", x: 10, y: 1, z: 16, scale: 1 },
      { type: "basic", x: 10, y: 1, z: 10, scale: 1 },
      { type: "basic", x: 15, y: 3.5, z: 5, scale: 1 },
      { type: "basic", x: 19, y: 6, z: -5, scale: 1 },
      { type: "basic", x: 26, y: 8.5, z: -9, scale: 1 },
      { type: "basic", x: 25, y: 10, z: -15, scale: 1 },
      { type: "basic", x: 19, y: 11.5, z: -10, scale: 1 },
      { type: "basic", x: 13, y: 13.5, z: -2, scale: 1 },
      { type: "basic", x: 10, y: 16, z: 5, scale: 1 },
      { type: "basic", x: 5, y: 18.5, z: 10, scale: 1 },
      { type: "basic", x: 2, y: 21, z: 8, scale: 1 },
      { type: "basic", x: -5, y: 23.5, z: 5, scale: 1 }

*/

    ]

  },

  testMap: {
    floorTexture: "",
    platforms: [],
    mapFile: "full_starting_mapBIGMODE.obj"
  },

  testMap2: {
    floorTexture: "",
    platforms: [],
    mapFile: "collision_test_map.obj"
  },

  testMap3: {
    floorTexture: "",
    platforms: [],
    mapFile: "full_starting_map (3).obj"
  },

  testMap4: {
    floorTexture: "",
    platforms: [],
    mapFile: "full_starting_map.obj"
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
  leaderboard = []
  platforms = []

  constructor(mapData) {
    this.mapData = mapData

    if (mapData.mapFile) fs.readFile("./public/assets/models/" + mapData.mapFile, (err, data) => {
      this.platforms = generatePlatforms(obj.parseWavefront(data.toString(), false, false))
      
    })

    this.tickInterval = setInterval(() => { this.tick() }, 1000 / TPS)
  }

  addPlayer(socket, assignedId) { // this gets called when a player joins this room
    socket.emit("map", this.mapData);

    /* this.leaderboard.push({
      id: assignedId, 
      killCount: 0
    }) */

    let otherPlayersInfo = {}; // compile other players info into an object to send to the new player
    for (let id in this.players) {
      if (this.players[id] != null) otherPlayersInfo[id] = { 
        name: this.players[id].name, 
        position: this.players[id].position, 
        state: this.players[id].state, 
        currentWeaponType: this.players[id].currentWeaponType 
      };
    }
    socket.emit("otherPlayers", otherPlayersInfo);

    this.broadcast("weaponStatesRequest", assignedId, null)

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
      health: 0,
      state: state,
      killCount: 0,
      socket: socket
    }

    //this.sendLeaderboard()

    // Send the needed info for the new client to generate their player
    socket.emit("assignPlayer", {
      id: assignedId,
      name: name,
      position: position,
      health: 0,
      state: state
    });

    socket.emit("startTicking", TPS)


    // Send everyone else the new player info
    this.broadcast("newPlayer", {
      id: assignedId,
      name: name,
      position: position,
      health: 0,
      state: state
    }, assignedId);

    socket.on("nameChange", (data) => {
      if (this.players[data.id] != null) {
        this.players[data.id].name = data.newName
        this.broadcast("nameChange", { id: data.id, newName: data.newName }, null)
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

    socket.on("respawnMe", (data) => {
      if (this.players[data.id] && this.players[data.id].health <= 0) {
        this.respawnPlayer(data.id)
      }
    })

    // MAKING WEAPONS: 
    // client: send newWeapon message
    // server: brodcast message with weapon id and data

    socket.on("newWeapon", (data) => {
      let type = (Object.keys(weaponSpecs).indexOf(data.type) != -1) ? data.type : "default"
      let pitch = data.pitch
      let yaw = data.yaw
      if (weaponSpecs[type].class == "projectile") pitch = -pitch + Math.PI / 16
      else pitch = -pitch + Math.PI / 64
      if (pitch > Math.PI / 2) pitch = Math.PI / 2
      yaw = -yaw

      let velocity = [0, 0, -weaponSpecs[type].speed]

      rotateX(velocity, velocity, [0, 0, 0], pitch)
      rotateY(velocity, velocity, [0, 0, 0], yaw)
      
    
      this.weapons[nextWeaponId] = {
        type: data.type,
        damage: weaponSpecs[type].damage,
        class: weaponSpecs[type].class,
        radius: weaponSpecs[type].radius,
        ownerId: data.ownerId,
        position: data.position,
        velocity: {x: velocity[0], y: velocity[1], z: velocity[2]}
      }

      this.broadcast("newWeapon", {
        id: nextWeaponId,
        type: data.type,
        ownerId: data.ownerId,
        position: data.position,
        velocity: {x: velocity[0], y: velocity[1], z: velocity[2]}
      }, null)

      nextWeaponId++
    })

    socket.on("weaponStates", (data) => {
      let weaponInfo = {}
      for (let id in data.states) {
        if (weaponInfo[id] != null) {
          weaponInfo[id] = {
            type: this.weapons[id].type,
            position: {
              x: data.states[id].position.x,
              y: data.states[id].position.y,
              z: data.states[id].position.z,
              yaw: data.states[id].yaw,
              pitch: data.states[id].pitch
            },
            velocity: {
              x: data.states[id].velocity.x,
              y: data.states[id].velocity.y,
              z: data.states[id].velocity.z
            }
          }
        }
      }
      
      if (this.players[data.recipientId] != null) this.players[data.recipientId].socket.emit("weaponStates", {
        ownerId: data.ownerId, 
        weaponData: weaponInfo})
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
    this.broadcast("playerRespawned", {id: id}, id)
    this.players[id].position.x = Math.random() * 10 - 5;
    this.players[id].position.y = 2;
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
    let data = {}
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

  broadcast(eventName, data, except) {
    for (let id in this.players) {
      if (id != except) this.players[id].socket.emit(eventName, data)
    }
  }

  sendLeaderboard() {
    let ids = Object.keys(this.players)
    let killCounts = []

    for (let i = 0; i < ids.length; i++) {
      let id_ = ids[i]
      killCounts.push({
        id: id_,
        killCount: this.players[id_].killCount
      })
    }

    //console.log(killCounts)
  
    function quickSort(arr) {
      if (arr.length <= 1) { 
        return arr;
      } else {
        var left = [];
        var right = [];
        var newArr = [];
        var pivot = arr.pop();
    
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].killCount <= pivot.killCount) {
            left.push(arr[i]);
          } else {
            right.push(arr[i]);
          }
        }
    
        return newArr.concat(quickSort(left), pivot, quickSort(right));
      }
    }

    killCounts = quickSort(killCounts)
    //console.log(killCounts.length)
  
    this.broadcast("leaderboard", killCounts, null)
    let roomId
    for (let i in rooms) {
      if (rooms[i] == this) roomId = i
    }
    //console.log(roomId + "killcounts:", killCounts)
  }


  ticks = 0
  tick() {
    // Compile player data into an array
    let playersData = {}
    for (let id in this.players) if (this.players[id]) {
      if (this.players[id].position.y < -100) {
        this.players[id].health = 0
        this.players[id].socket.emit("youDied", {id: id, cause: "void"})

        let deathMessage = this.players[id].name + " fell into the void."
        console.log(deathMessage)
        this.broadcast("chatMessage", deathMessage, null)

      }
      playersData[id] = this.genPlayerPacket(id)
    }

    // Send array to each connected player
    this.broadcast("playerUpdate", playersData, null)
    if (this.ticks % TPS == 0) {
      this.sendLeaderboard()
    }

    if (this.timeOfLastTick != undefined) {
      //console.log("TPS: " + 1000 / (new Date().getTime() - timeOfLastTick));
    }

    this.timeOfLastTick = new Date().getTime();
    this.ticks++
  }

}

var rooms = {}
fs.readFile("./public/modules/model-data.js", (err, data) => {
  let string = data.toString()
  let objText = string.slice(string.indexOf("obj") + 6, string.indexOf("var generatePlatforms"))
  let objFunction = Function("return" + objText)
  obj = objFunction()

  for (let i in weaponGeometry) getModelData(weaponGeometry[i].path, weaponGeometry[i], false)
  
  let generatePlatformsText = string.slice(string.indexOf("var generatePlatforms"), string.indexOf("export"))
  let generatePlatformsFunction = Function(generatePlatformsText + "return generatePlatforms")
  generatePlatforms = generatePlatformsFunction()

  rooms = {
    1: new Room(maps.lobby1),
    2: new Room(maps.lobby2),
    3: new Room(maps.testMap),
    4: new Room(maps.testMap2),
    5: new Room(maps.testMap3),
    6: new Room(maps.testMap4)
  }
  
})

function rotateX(out, a, b, rad) {
  let p = [],
    r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  //perform rotation
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

function rotateY(out, a, b, rad) {
  let p = [],
    r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  //perform rotation
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

function rotateZ(out, a, b, rad) {
  let p = [],
    r = [];
  //Translate point to the origin
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  //perform rotation
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  //translate to correct position
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

function collision(weaponRadius, weaponPosition, colliderDimensions, colliderPosition) {

  let minDistance = colliderDimensions.radius + weaponRadius + 1
  if (
    Math.abs(colliderPosition.x - weaponPosition.x) > minDistance || 
    Math.abs(colliderPosition.y - weaponPosition.y) > minDistance || 
    Math.abs(colliderPosition.z - weaponPosition.z) > minDistance
  ) return false


  let boxDimensions = [[], []]

  // colliderDimensions should have: mx, px..., pitch, yaw, roll
  

  // sphere vs box collision

  let sphereCenter = [
    weaponPosition.x,
    weaponPosition.y,
    weaponPosition.z
  ]
  
  // rotate centerpoint about sphere center
  let centerPointPosition = [
    colliderPosition.x, 
    colliderPosition.y, 
    colliderPosition.z
  ]
  rotateZ(centerPointPosition, centerPointPosition, sphereCenter, colliderPosition.roll || colliderDimensions.roll || 0)
  rotateY(centerPointPosition, centerPointPosition, sphereCenter, colliderPosition.yaw || colliderDimensions.yaw || 0)
  rotateX(centerPointPosition, centerPointPosition, sphereCenter, colliderPosition.pitch || colliderDimensions.pitch || 0)


  boxDimensions[0][0] = centerPointPosition[0] + colliderDimensions.mx
  boxDimensions[1][0] = centerPointPosition[0] + colliderDimensions.px
  boxDimensions[0][1] = centerPointPosition[1] + colliderDimensions.my
  boxDimensions[1][1] = centerPointPosition[1] + colliderDimensions.py
  boxDimensions[0][2] = centerPointPosition[2] + colliderDimensions.mz
  boxDimensions[1][2] = centerPointPosition[2] + colliderDimensions.pz

  let closestPoint = [
    Math.max(boxDimensions[0][0], Math.min(sphereCenter[0], boxDimensions[1][0])),
    Math.max(boxDimensions[0][1], Math.min(sphereCenter[1], boxDimensions[1][1])),
    Math.max(boxDimensions[0][2], Math.min(sphereCenter[2], boxDimensions[1][2]))
  ]

  return Math.sqrt(
    Math.pow(closestPoint[0] - sphereCenter[0], 2) + 
    Math.pow(closestPoint[1] - sphereCenter[1], 2) + 
    Math.pow(closestPoint[2] - sphereCenter[2], 2)
  ) < weaponRadius


}

var collisionUpdateThen = Date.now()
var collisionUpdate = setInterval(() => {
  let now = Date.now()
  let deltaTime = now - collisionUpdateThen
  collisionUpdateThen = now

  for (let i in rooms) {
    for (let weaponId in rooms[i].weapons) if (rooms[i].weapons[weaponId] && rooms[i].weapons[weaponId].velocity) {
      // update weapon velocity and position
      let weapon = rooms[i].weapons[weaponId]
      if (weapon.class == "projectile") weapon.velocity.y -= 0.00001 * deltaTime

      weapon.position.x += weapon.velocity.x * deltaTime
      weapon.position.y += weapon.velocity.y * deltaTime
      weapon.position.z += weapon.velocity.z * deltaTime
      if (Math.abs(weapon.position.x) > 100 || Math.abs(weapon.position.z) > 100 || Math.abs(weapon.position.y) > 1000) {
        rooms[i].broadcast("weaponHit", {weaponId: weaponId}, null)
        rooms[i].weapons[weaponId] = null
        continue
      }
      
      // calculate collision with players
      let hit = false
      for (let j in rooms[i].platforms) {
        let platform = rooms[i].platforms[j]
        if (collision(weapon.radius, weapon.position, platform.dimensions, platform.position)) {
          rooms[i].broadcast("weaponHit", {weaponId: weaponId}, null)
          hit = true
          
        }
      }
      for (let playerId in rooms[i].players) if (rooms[i].players[playerId] && rooms[i].players[playerId].health > 0 && playerId != weapon.ownerId) {
        let player = rooms[i].players[playerId]
        if (collision(weapon.radius, weapon.position, {radius: 2.5, mx: -1, px: 1, my: 0, py: 2 - player.state.crouchValue, mz: -.25, pz: .25}, player.position)) {
          rooms[i].broadcast("weaponHit", {weaponId: weaponId}, null)
          hit = true
          let newHealth = player.health - weapon.damage
          player.health = newHealth
          if (newHealth > 0) {
            //console.log("health: " + newHealth)
          } else {
            if (rooms[i].players[weapon.ownerId]) {
              rooms[i].players[weapon.ownerId].killCount++
              let vowels = "aeiou"
              let deathMessage = player.name + " was killed by " + rooms[i].players[weapon.ownerId].name + " with a" + (vowels.includes(weapon.type[0]) ? "n " : " ") + weapon.type 
              rooms[i].broadcast("chatMessage", deathMessage, null)
            }
            player.socket.emit("youDied", {id: playerId, cause: "killed"})
          }
        }
      }
      if (hit) delete rooms[i].weapons[weaponId]
      
    }
  }

}, 10)

socketServer.on("connection", (socket) => {
  /*socket.emit("pingRequest")
  socket.on("ping", () => {
    socket.emit("ping")
  });

  socket.on("pingTestComplete", (ping) => {
    socket.emit("startTicking", TPS);
    setTimeout(() => { setInterval(tick, 1000 / TPS) }, ping / 2);
  })*/

  socket.emit("weaponGeometry", weaponGeometry)

  socket.on("joinRoom", (data) => {
    console.log(data, "JOIN ROOM")
    
    console.log(data.roomId)
    var joinNewRoom = true
    for (let i in rooms) {
      if (data.roomId == i) {
        joinNewRoom = false
        break
      }
    }

    // Create new room if this player is creating one
    //let newRoom
    if (joinNewRoom) {
      if (Object.keys(rooms).length >= ROOM_CAP) {
        socket.emit("roomCapReached")
        return
      }

      rooms[data.roomId] = new Room(maps.testMap)
    }

    socket.emit("roomJoinSuccess", data.roomId)


    if (data.playerId != null) { // if this player is joining from another room
      // delete this player from their room
      let playerSocket
      for (let i in rooms) {
        if (Object.keys(rooms[i].players).indexOf(String(data.playerId)) != -1) { // if joining player is in this room
          //playerSocket = rooms[i].players[data.playerId].socket
          //rooms[data.roomId].addPlayer(rooms[i].players[data.playerId].socket, data.playerId)
          rooms[i].broadcast("playerLeave", data.playerId, null);
          console.log(rooms[i].players[data.playerId].name + " left. 😭😭😭😭😭😭😭");

          let listeners = socket.eventNames()
          for (let j in listeners) {
            if (listeners[j] != "joinRoom") socket.removeAllListeners(listeners[j])
          }

          socket.emit("stopTicking")

          availableNames.push(rooms[i].players[data.playerId].name);
          delete rooms[i].players[data.playerId];
        }
      }

      // add this player to the new room
      rooms[data.roomId].addPlayer(socket, data.playerId)
    } else {
      rooms[data.roomId].addPlayer(socket, nextId)
      nextId++
    }
  })

});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 