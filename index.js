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

for (let i in weaponGeometry) getModelData(weaponGeometry[i].path, weaponGeometry[i], false)




var obj = {

parseWords: function(string) {
  let words = []
  let currentWord = ""
  for (let i = 0; i < string.length; i++) {
      if (string[i] != " ") currentWord += string[i]
      else {
          words.push(currentWord)
          currentWord = ""
      }
  } words.push(currentWord)
  return words
},

parseLines: function(string) {
  let lines = []
  let currentLine = ""
  for (let i = 0; i < string.length; i++) {
      if (string[i] != "\n") currentLine += string[i]
      else {
          lines.push(currentLine)
          currentLine = ""
      }
  } lines.push(currentLine)
  return lines
},

parseFloats: function(words) {
  let floats = []
  for (let i = 0; i < words.length; i++) {
      floats.push(parseFloat(words[i]))
  }
  return floats
},

triangulate: function(indices) {
  let newIndices = []
  for (let i = 0; i < indices.length; i++) {
      let currentIndices = indices[i]

      for (let j = 0; j < currentIndices.vertexes.length - 2; j++) {
          newIndices.push({
              vertexes: [currentIndices.vertexes[0], currentIndices.vertexes[j+1], currentIndices.vertexes[j+2]],
              texcoords: [currentIndices.texcoords[0], currentIndices.texcoords[j+1], currentIndices.texcoords[j+2]],
              normals: [currentIndices.normals[0], currentIndices.normals[j+1], currentIndices.normals[j+2]]
          })
      }

  }
  return newIndices
},





parseWavefront: function(fileText, seperateObjects) {
  let lines = this.parseLines(fileText)

  // find all objects
  let objectStartIndices = []
  if (seperateObjects) {
      for (let i = 0; i < lines.length; i++) {
          if (lines[i].slice(0, lines[i].indexOf(" ")) == "o") {
              objectStartIndices.push(i)
          }
      } objectStartIndices.push(lines.length)
  }
  else objectStartIndices = [0, lines.length]

  let objects = {}
  let material // string
  for (let o = 0; o < objectStartIndices.length - 1; o++) {

      let totalBeforeVertices = 0
      for (let object in objects) totalBeforeVertices += objects[object].positions.length

      let totalBeforeTexcords = 0
      for (let object in objects) totalBeforeTexcords += objects[object].texcoords.length

      let totalBeforeNormals = 0
      for (let object in objects) totalBeforeNormals += objects[object].normals.length


      let name
      let smooth // boolean
      let positions = []
      let normals = []
      let texcoords = []
      let indices = []


      for (let i = objectStartIndices[o]; i < objectStartIndices[o+1]; i++) {

          // find first word in line
          let identifier = lines[i].slice(0, lines[i].indexOf(" "))

          // get line after identifier
          let currentLine = lines[i].slice(lines[i].indexOf(" ") + 1)

          if (identifier == "o") {
              if (currentLine.indexOf(String.fromCharCode([13])) == -1) name = currentLine
              else name = currentLine.slice(0, -1)
          }

          if (identifier == "v") positions.push(this.parseFloats(this.parseWords(currentLine)))

          if (identifier == "vn") normals.push(this.parseFloats(this.parseWords(currentLine)))

          if (identifier == "vt") texcoords.push(this.parseFloats(this.parseWords(currentLine)))

          if (identifier == "s") {
              if (currentLine == "0") smooth = false
              else smooth = true
          }

          if (identifier == "usemtl") material = currentLine

          if (identifier == "f") {
              let v = []
              let t = []
              let n = []

              let words = this.parseWords(currentLine)
              for (let j = 0; j < words.length; j++) {
                  v.push(parseInt(words[j].slice(0, words[j].indexOf("/")), 10) - 1 - totalBeforeVertices)
                  words[j] = words[j].slice(words[j].indexOf("/") + 1)

                  t.push(parseInt(words[j].slice(0, words[j].indexOf("/")), 10) - 1 - totalBeforeTexcords)
                  words[j] = words[j].slice(words[j].indexOf("/") + 1)

                  n.push(parseInt(words[j], 10) - 1 - totalBeforeNormals)
              }

              indices.push({
                  vertexes: v,
                  texcoords: t,
                  normals: n
              })
          }
      }

      objects[name] = {
          positions: positions,
          normals: normals,
          texcoords: texcoords,
          smooth: smooth,
          material: material,
          indices: this.triangulate(indices)
      }
  }

  for (let i in objects) if (objects[i].smooth) {
      // make a normal for every point
      let newNormals = []
      for (let j in objects[i].positions) {
          let connectedNormals = []
          for (let k in objects[i].indices) {
              for (let l in objects[i].indices[k].vertexes) {
                  if (objects[i].indices[k].vertexes[l] == j) {
                      connectedNormals.push(objects[i].normals[objects[i].indices[k].normals[l]])
                  }
              }
          }
          let averageNormal = [0, 0, 0]
          for (let k = 0; k < connectedNormals.length; k++) {
              for (let l in averageNormal) averageNormal[l] += connectedNormals[k][l] / connectedNormals.length
          }
          newNormals.push(averageNormal)
      }
      objects[i].normals = newNormals

      for (let j in objects[i].indices) {
          for (let k in objects[i].indices[j].vertexes) {
              objects[i].indices[j].normals[k] = objects[i].indices[j].vertexes[k]
          }
      }
  }

  if (seperateObjects) return objects
  else return Object.values(objects)[0]

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
    mapFile: "full starting map extra cool version.obj"
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

  constructor(mapData) {
    this.mapData = mapData

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
      health: DEFAULT_PLAYER_HEALTH,
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

    socket.on("playerHit", (hitInfo) => {
      if (this.players[hitInfo.target] == undefined) return
      let newHealth = this.players[hitInfo.target].health - hitInfo.damage
      if (newHealth > 0) {
        this.players[hitInfo.target].health = newHealth
        //console.log("health: " + newHealth)
      } else {
        this.players[hitInfo.from].killCount++
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
        ownerId: data.ownerId/*,
        position: data.position,*/
      }

      this.broadcast("newWeapon", {
        id: nextWeaponId,
        type: data.type,
        ownerId: data.ownerId,
        position: data.position,
        velocity: data.velocity
      }, null)

      nextWeaponId++
    })

    socket.on("weaponStates", (data) => {
      let weaponInfo = {}
      for (let id in data.states) {
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
      
      if (this.players[data.recipientId] != null) this.players[data.recipientId].socket.emit("weaponStates", {
        ownerId: data.ownerId, 
        weaponData: weaponInfo})
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
      this.broadcast("chatMessage", deathMessage, null)
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

  broadcast(eventName, msg, except) {
    for (let id in this.players) {
      if (id != except) this.players[id].socket.emit(eventName, msg)
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
    
        for (var i = 0; i < arr.length; i++) {
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
  }


  ticks = 0
  tick() {
    // Compile player data into an array
    let playersData = {}
    for (let id in this.players) {
      if (this.players[id] != null) playersData[id] = this.genPlayerPacket(id)
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

var rooms = {
  1: new Room(maps.lobby1),
  2: new Room(maps.lobby2),
  3: new Room(maps.testMap),
  4: new Room(maps.testMap2),
  5: new Room(maps.testMap3),
  6: new Room(maps.testMap4)
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

  socket.emit("weaponGeometry", weaponGeometry)

  socket.on("joinRoom", (data) => {
    var joinNewRoom = true
    for (let i in rooms) {
      if (data.roomId == Object.keys(rooms)[i]) {
        joinNewRoom = false
        break
      }
    }


    console.log("JOIN ROOM:", data)
    // Create new room and add player to it
    let newRoom
    if (joinNewRoom) {
      rooms[data.roomId] = new Room(maps.testMap)
      newRoom = rooms[data.roomId]
      //rooms[data.roomId].addPlayer(this.players[data.playerId].socket, data.playerId)
    }

    if (data.playerId != null) { 
      // delete this player from their room
      for (let i in rooms) {
        if (Object.keys(rooms[i].players).indexOf(String(data.playerId)) != -1) { // if joining player is in this room
          rooms[data.roomId].addPlayer(rooms[i].players[data.playerId].socket, data.playerId)
          rooms[i].broadcast("playerLeave", data.playerId, null);
          console.log(rooms[i].players[data.playerId].name + " left. 😭😭😭😭😭😭😭");

          let listeners = socket.eventNames()
          for (let j in listeners) {
            if (listeners[j] == "joinRoom") continue
            socket.removeAllListeners(listeners[j])
          }

          socket.emit("stopTicking")

          availableNames.push(rooms[i].players[data.playerId].name);
          delete rooms[i].players[data.playerId];
        }
      }
    }





    
    rooms[data.roomId].addPlayer(socket, nextId)
    console.log("room: " + data.roomId)
    console.log("id: " + nextId)
    nextId++
  })

});

var ip = localhost ? "127.0.0.1" : ipv4;
server.listen(port, ip, () => {
  console.log("Running on " + ip + ":" + port);
}); 