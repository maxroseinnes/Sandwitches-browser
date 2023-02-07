
//// ---- MAIN SCRIPT ---- ////
console.log("starting script")
import modelStuff from "./modules/model-data.js"

var modelData = modelStuff.modelData
var fetchObj = modelStuff.fetchObj
var obj = modelStuff.obj
var generatePlatforms = modelStuff.generatePlatforms

import webglStuff from "./modules/webgl.js"

var webgl = webglStuff.webgl
var Point = webglStuff.Point
var Model = webglStuff.Model
var PhysicalObject = webglStuff.PhysicalObject
var Particle = webglStuff.Particle
var Player = webglStuff.Player
var Weapon = webglStuff.Weapon
var Platform = webglStuff.Platform
var Ground = webglStuff.Ground







// GLOBAL VARIABLES //

var forward = false
var left = false
var backward = false
var right = false
var arrowLeft = false
var arrowRight = false
var shift = false
var space = false
var leftClicking = false
var rightClicking = false

var pointerLocked = false

var lastWPress = Date.now()


var lookAngleX = 0.0
var lookAngleY = 0.0
var aimState = 0.0




// misc global variables //
var lastFramerates = []
var lastYPositions = []
for (let i = 0; i < 200; i++) lastYPositions.push(0)

var running = false;
var updateThen = 0;

var fixedUpdateInterval;
var fixedUpdateThen;

var ticksPerSecond = 20
var currentTickTime = Date.now()
var lastTickTimes = []
var averageClientTPS = ticksPerSecond

// Multiplayer global variables //
var lobbyId
var socket = io();
var otherPlayers = {};
var otherWeapons = {}
var leaderboard = {}


// Local global variables //
var platforms = [];
var cameraColliders = [];

// html elements //
const menu = document.getElementById("menu")
const startButton = document.getElementById("startButton")
const info = document.getElementById("info")
const canvas = document.getElementById("canvas")
const effectsCanvas = document.getElementById("effectsCanvas")
const ctx = effectsCanvas.getContext("2d")
const roomKeyInput = document.getElementById("roomKeyInput")
const joinRoomButton = document.getElementById("joinRoomButton")

joinRoomButton.onclick = () => {
    if (roomKeyInput.value == lobbyId) return
    //lobbyId = roomKeyInput.value
    joinRoom(roomKeyInput.value)
    
}
//lobbyId = 4
//joinRoom() // go to room 4 first

var myWeapons = [
    "olive",
    "pickle",
    "tomato",
    "sausage",
    "anchovy",
    "pan",
    "meatball"
]
var weaponSelectors = []
for (let i = 0; i < 3; i++) {
    let weaponSelector = document.createElement("select")
    for (let j in myWeapons) {
        let option = document.createElement("option")
        option.value = myWeapons[j]
        option.textContent = myWeapons[j]
        weaponSelector.appendChild(option)
    }
    document.getElementById("loadout").appendChild(document.createElement("br"))
    let label = document.createElement("span")
    label.textContent = "Weapon " + (i + 1) + ": "
    document.getElementById("loadout").appendChild(label)
    document.getElementById("loadout").appendChild(weaponSelector)
    weaponSelectors.push(weaponSelector)
}

weaponSelectors[0].onchange = () => {
    console.log("wow")
}


// AUDIO //

var volume = 1
const backgroundNoises = new Audio("./assets/wet_wriggling_noises/dripping-water-nature-sounds-8050.mp3")
backgroundNoises.loop = true

const splatNoise = new Audio("./assets/wet_wriggling_noises/cartoon-splat-6086.mp3")
const jumpNoise = new Audio("./assets/wet_wriggling_noises/smb_jump-super.wav")
const pauseNoise = new Audio("./assets/wet_wriggling_noises/smb_pause.wav")
const stepNoise = new Audio("./assets/wet_wriggling_noises/slime-squish-14539.mp3")
const headBumpNoise = new Audio("./assets/wet_wriggling_noises/head_bump.wav")
const oofNoise = new Audio("./assets/wet_wriggling_noises/roblox_oof.mp3")

var setVolume = () => {
    backgroundNoises.volume = .5 * volume
    splatNoise.volume = volume
    jumpNoise.volume = volume
    pauseNoise.volume = volume
    stepNoise.volume = volume
}

setVolume()

document.getElementById("volumeSlider").onchange = () => {
    volume = document.getElementById("volumeSlider").value / 100
    setVolume()
}


// MAP ORGANIZATION //


//var inventory

var updateCrosshair = () => {
    let width = effectsCanvas.width
    let height = effectsCanvas.height

    ctx.clearRect(width / 2 - 11, height / 2 - 11, 22, 22)
    ctx.fillStyle = "rgba(255, 255, 255, " + (aimState * 2 - 1) + ")"
    ctx.fillRect(width / 2 - 10, height / 2 - 1, 20, 2)
    ctx.fillRect(width / 2 - 1, height / 2 - 10, 2, 20)
    
}

var weaponsContainer = document.getElementById("weaponsContainer")
var updateHUD = () => {
    weaponsContainer.innerHTML = ""

    for (let i = 0; i < weaponSelectors.length; i++) {
        let color = "gray"

        if (weaponSelectors[i].value == "tomato") color = "red"
        if (weaponSelectors[i].value == "olive") color = "green"
        if (weaponSelectors[i].value == "pickle") color = "lightgreen"
        if (weaponSelectors[i].value == "sausage") color = "brown"
        if (weaponSelectors[i].value == "anchovy") color = "blue"

        let weaponSlot = document.createElement("td")
        weaponSlot.style.padding = "1vmin"
        weaponSlot.style.height = "8vmin"
        weaponSlot.style.width = "8vmin"
        weaponSlot.style.color = "white"
        weaponSlot.style.textAlign = "center"
        weaponSlot.style.boxShadow = "0 0 1vmin 1vmin rgba(0, 0, 0, .05)"
        weaponSlot.style.borderRadius = "1vmin"
        weaponSlot.style.borderStyle = "solid"
        weaponSlot.style.borderWidth = ".3vmin"
        weaponSlot.style.borderColor = (player.inventory.currentSelection == i) ? "white" : color
        weaponSlot.classList.add("weaponSlot")
        weaponSlot.style.backgroundColor = color
        weaponSlot.textContent = weaponSelectors[i].value
        weaponSlot.id = i

        weaponsContainer.appendChild(weaponSlot)
    }

    //ctx.fillStyle = "yellow"
    //for (let i = 0; i < 5; i += .1) ctx.strokeRect(width - (weaponSelectors.length + 1) * slotSize - i + player.inventory.currentSelection * slotSize, height - slotSize * 2 - i, slotSize + i * 2, slotSize + i * 2)
}

var changeWeaponSelection = (selection) => {
    player.inventory.currentSelection = selection
    player.inventory.currentWeapon.remove()

    player.inventory.currentWeapon = new Weapon(weaponGeometry, weaponSelectors[selection].value, [platforms, otherPlayers, [ground]], player)
    updateHUD()
}


var chatbox = document.getElementById("chatbox")
var chatMessages = []
var chatLifespan = 10000
var chatMessageTransition = "opacity 1s"

function displayChatMessage(msg) {
    let message = {
        element: document.createElement("div"),
        createdTime: Date.now()
    }
    message.element.classList.add("chatMessage")
    message.element.style.transition = chatMessageTransition
    message.element.textContent = msg
    chatbox.appendChild(message.element)

    chatMessages.push(message)

    if (msg.indexOf("fell") != -1 || msg.indexOf("killed") != -1) message.element.style.color = "red"
    if (msg.indexOf("spawned") != -1) message.element.style.color = "lightgreen"
    if (msg.indexOf("left") != -1) message.element.style.color = "orange"

    window.setTimeout(() => {
        if (!chatboxOpen) message.element.style.opacity = 0.0
    }, chatLifespan)

    let bottomValue = 20
    for (let i = chatMessages.length - 1; i >= 0; i--) {
        chatMessages[i].element.style.bottom = bottomValue + "px"
        bottomValue += chatMessages[i].element.offsetHeight + 10
    }
}

var chatboxOpen = false
var chatboxLastCloseTime = Date.now()
var chatboxInput = document.getElementById("chatboxInput")
chatboxInput.style.display = "none"
function openChatbox() {
    chatboxOpen = true

    leftClicking = false
    rightClicking = false
    forward = false
    left = false
    backward = false
    right = false
    arrowLeft = false
    arrowRight = false
    shift = false
    space = false

    var blinkCursor = (lastInput) => {
        if (!chatboxOpen) return
        if (Date.now() < chatboxLastCloseTime + 500) return
        if (chatboxInput.textContent.slice(-1) == " " || lastInput != chatboxInput.textContent.slice(0, -1)) {
            chatboxInput.textContent = chatboxInput.textContent.slice(0, -1) + "|"
            window.setTimeout(blinkCursor, 500, chatboxInput.textContent.slice(0, -1))
        }
        else {
            chatboxInput.textContent = chatboxInput.textContent.slice(0, -1) + " "
            window.setTimeout(blinkCursor, 500, chatboxInput.textContent.slice(0, -1))
        }

    }
    blinkCursor(chatboxInput.textContent.slice(0, -1))


    chatboxInput.style.display = ""
    chatbox.style.backgroundColor = "rgba(0, 0, 0, .1)"

    for (let i in chatMessages) {
        if (Date.now() > chatMessages[i].createdTime + chatLifespan) chatMessages[i].element.style.transition = ""
        chatMessages[i].element.style.opacity = 1.0
    }
}

function closeChatbox() {
    chatboxOpen = false
    chatboxLastCloseTime = Date.now()
    startGame()

    chatboxInput.style.display = "none"
    chatbox.style.backgroundColor = "transparent"

    for (let i in chatMessages) {
        if (Date.now() > chatMessages[i].createdTime + chatLifespan) chatMessages[i].element.style.opacity = 0.0
    }
}



var leaderboardList = document.getElementById("leaderboard")
//var playerInfos = {}

function addPlayerToHUD(id, name) {
    leaderboard[id] = document.createElement("li")

    leaderboard[id].textContent = name
    leaderboardList.appendChild(leaderboard[id])
}

function changePlayerNameInHUD(id, string) {
    leaderboard[id].textContent = string
}

function removePlayerFromHUD(id) {
    leaderboard[id].remove()
    delete leaderboard[id]
}



// INITIALIZE WEBGL //

webgl.initialize()

// MODEL DATA ORGANIZATION //

var playerIdleInfo = obj.parseWavefront(fetchObj("player/PlayerIdle.obj"), true)

var playerGeometry = {
    frontSlice: obj.parseWavefront(fetchObj("player/LowPolySliceOfBread.obj"), false),
    backSlice: obj.parseWavefront(fetchObj("player/LowPolySliceOfBread.obj"), false),
    cheese: playerIdleInfo["Cheese"],
    meat: obj.parseWavefront(fetchObj("player/playerMeat.obj"), false),
    tomato: obj.parseWavefront(fetchObj("player/playerTomato.obj"), false),
    lettuce: obj.parseWavefront(fetchObj("player/playerLettuceWithFlippedNormals.obj"), false),
}

var weaponGeometry = {}

var platformGeometry = {
    basic: obj.parseWavefront(fetchObj("platforms/basic.obj"), false),
    crate: obj.parseWavefront(fetchObj("platforms/crate.obj"), false),
    pinetree: obj.parseWavefront(fetchObj("platforms/pinetree.obj"), false),
    doorTest: obj.parseWavefront(fetchObj("doorTest.obj"), false)
}

var ground
var mapModels = []
var camera = new PhysicalObject(0, 0, 0, 0, 0, { mx: -.05, px: .05, my: -.05, py: .05, mz: -.05, pz: .05 }, [platforms, [ground]])
var player

// SERVER STUFF //

var ticks = 0;
function tick() {
    ticks++;
    if (player != null) {
        socket.emit("playerUpdate", { id: player.id, position: player.position, state: player.state, currentWeaponType: player.inventory.currentWeapon.type });
    }
    //console.log("wet wriggling noises" + (ticks % 2 == 0 ? "" : " "))
    lastTickTimes.splice(0, 0, currentTickTime)
    currentTickTime = Date.now()
}

// Socket events //
/*var time;
var pingTests = [];
socket.on("pingRequest", () => {
    socket.emit("ping");
    time = new Date().getTime();
})

socket.on("ping", () => {
    if (pingTests.length < 5) {
        pingTests.push(new Date().getTime() - time);
        time = new Date().getTime();
        socket.emit("ping");
    } else {
        var sum = 0
        for (let i = 0; i < pingTests.length; i++) {
            sum += pingTests[i];
        }
        socket.emit("pingTestComplete", sum / pingTests.length)
    }
})*/

var tickInterval
socket.on("startTicking", (TPS) => {
    tickInterval = setInterval(tick, 1000 / TPS);
    ticksPerSecond = TPS
})

socket.on("stopTicking", () => {
    clearInterval(tickInterval)
})

socket.on("assignPlayer", (playerInfo) => {
    player = new Player(playerGeometry, playerInfo.position.x, playerInfo.position.y, playerInfo.position.z, 0, 0, playerInfo.health, playerInfo.id, playerInfo.name, [platforms, otherPlayers, [ground]]);
    startButton.disabled = false

    document.getElementById("nameField").value = player.name

    addPlayerToHUD(player.id, player.name)

    player.inventory = {
        currentSelection: 0,
        currentWeapon: new Weapon(weaponGeometry, "anchovy", [platforms, otherPlayers, [ground]], player),
    }
    updateHUD()
});

socket.on("weaponGeometry", (data) => {
    weaponGeometry = data
    console.log(weaponGeometry)
})

function distanceFromAxisAligned(angle) {
    let remainder = (angle % (Math.PI / 2)) / (Math.PI / 2)
    return Math.abs(Math.round(remainder) - remainder) * (Math.PI / 2)
}

socket.on("map", (mapInfo) => {
    for (let i = 0; i < mapInfo.platforms.length; i++) {
        let platform = new Platform(platformGeometry,
            mapInfo.platforms[i].type,
            mapInfo.platforms[i].x,
            mapInfo.platforms[i].y,
            mapInfo.platforms[i].z,
            mapInfo.platforms[i].scale
        )
        platforms.push(platform)
    }

    if (mapInfo.mapFile != undefined) {
        let mapObj = fetchObj(mapInfo.mapFile)
        let faceGeometry = obj.parseWavefront(mapObj, false, false)
        let colliders = generatePlatforms(faceGeometry)
        for (let i in colliders) {
            let platform = new Platform(null, null, colliders[i].position.x, colliders[i].position.y, colliders[i].position.z, 1)
            platform.dimensions = colliders[i].dimensions
            platforms.push(platform)
        }
        for (let i in faceGeometry.indices) {
            if (distanceFromAxisAligned(colliders[i].dimensions.pitch) + distanceFromAxisAligned(colliders[i].dimensions.roll) > .1) continue
            let dimensions = [[Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY], [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]]
            for (let j in faceGeometry.indices[i].vertexes) {
                let vertex = faceGeometry.indices[i].vertexes[j]
                for (let k = 0; k < 3; k++) {
                    if (faceGeometry.positions[vertex][k] < dimensions[0][k]) dimensions[0][k] = faceGeometry.positions[vertex][k]
                    if (faceGeometry.positions[vertex][k] > dimensions[1][k]) dimensions[1][k] = faceGeometry.positions[vertex][k]
                }
            }
            let allowed = false
            for (let j = 0; j < 3; j++) if (Math.abs(dimensions[0][j] - dimensions[1][j]) < .1) allowed = true
            if (!allowed) continue
            let platform = new Platform(null, null, 0, 0, 0, 1)
            platform.dimensions = {
                mx: dimensions[0][0],
                px: dimensions[1][0],
                my: dimensions[0][1],
                py: dimensions[1][1],
                mz: dimensions[0][2],
                pz: dimensions[1][2]
            }
            cameraColliders.push(platform)
        }

        let mapModelGeometry = obj.parseWavefront(mapObj, true, true)
        for (let name in mapModelGeometry) {
            let texture = "wood"
            if (name.indexOf("Tree") != -1) texture = "tree"
            if (name.indexOf("Plane") != -1) texture = "grass"
            if (name.indexOf("Road") != -1) texture = "asphalt"
            if (name.indexOf("Barn") != -1) texture = "barnWood"
            if (name.indexOf("Fence") != -1) texture = "whiteWood"
            if (name.indexOf("Building") != -1) texture = "houseWood"
            if (name.indexOf("Cube") != -1) texture = "barnWood"
            if (name.indexOf("Ladder") != -1) texture = "whiteWood"
            if (name.indexOf("Loft") != -1) texture = "barnWood"
            if (name.indexOf("BigBuilding") != -1) texture = "barnWood"
            mapModels.push(new Model({}, mapModelGeometry[name], 1, texture, 0, 0, 0))
            
        }

        console.log(mapModelGeometry)
        

        
    }

    if (mapInfo.floorTexture != "") {
        ground = new Ground(obj.parseWavefront(fetchObj("grounds/plane.obj"), false, true))
        let colliders = generatePlatforms(obj.parseWavefront(fetchObj("grounds/plane.obj"), false, false))
        for (let i in colliders) {
            let platform = new Platform(null, null, colliders[i].position.x, colliders[i].position.y, colliders[i].position.z, 1)
            platform.dimensions = colliders[i].dimensions
            platforms.push(platform)
        }
    }

})

// receive necessary info about the other connected players upon joining
socket.on("otherPlayers", (otherPlayersInfo) => {
    for (let id in otherPlayersInfo) {
        otherPlayers[id] = new Player(
            playerGeometry,
            otherPlayersInfo[id].position.x,
            otherPlayersInfo[id].position.y,
            otherPlayersInfo[id].position.z,
            otherPlayersInfo[id].position.yaw,
            otherPlayersInfo[id].position.lean,
            otherPlayersInfo[id].health,
            id,
            otherPlayersInfo[id].name)

        addPlayerToHUD(id, otherPlayersInfo[id].name)
    }
})



socket.on("leaderboard", (leaderboardInfo) => {
    var leaderboardList = document.getElementById("leaderboard")
    leaderboardList.innerHTML = ""
   
    //console.log(leaderboardInfo)
    // Need to make the list order itself every time
    /*for (let i = 0; i < leaderboardInfo.length; i++) {
        let playerInfo = leaderboardInfo[i]
        
        if (otherPlayers[playerInfo.id] || !leaderboard[playerInfo.id]) continue

        console.log(otherPlayers[playerInfo.id]  ? true : false)
        let name
        if (playerInfo.id == player.id) {
            name = player.name
        } else if (!otherPlayers[playerInfo.id] || !leaderboard[playerInfo.id]) {
            continue
        } else {
            console.log("test")
            name = otherPlayers[playerInfo.id].name
        }

        changePlayerStringInHUD(playerInfo.id, name + ": " + playerInfo.killCount + " 💀")
    }*/
    for (let i = leaderboardInfo.length - 1; i >= 0; i--) {
        let playerInfo = leaderboardInfo[i]
        let listItem = document.createElement("li")
        let name
        //console.log(playerInfo.id == player.id)
        if (playerInfo.id == player.id) {
            name = player.name
        } else if (otherPlayers[playerInfo.id] != null) {
            name = otherPlayers[playerInfo.id].name
        }

        let skulls = ""
        for (let i = 0; i < playerInfo.killCount; i++) {
            skulls += "💀"
        }
        listItem.textContent = name + ": " + playerInfo.killCount + " kills " + skulls
        leaderboardList.appendChild(listItem)
    }
})

socket.on("weaponStatesRequest", (recipientId) => {
    var weaponStates = {}
    for (let id in player.weapons) {
        if (player.weapons[id].shooted) {
            console.log(player.weapons[id].position)
            weaponStates[id] = {
                position: {
                    x: player.weapons[id].position.x,
                    y: player.weapons[id].position.y,
                    z: player.weapons[id].position.z,
                    yaw: player.weapons[id].yaw,
                    pitch: player.weapons[id].pitch
                },
                velocity: {
                    x: player.weapons[id].velocity.x,
                    y: player.weapons[id].velocity.y,
                    z: player.weapons[id].velocity.z
                }
            }

        }
    }
    
    socket.emit("weaponStates", {
        recipientId: recipientId, // so server doesn't forget who needs the weapon info
        ownerId: player.id,
        states: weaponStates
    })
})

socket.on("weaponStates", (data) => {
    console.log("test")
    for (let id in data.weaponData) {
        console.log(weaponGeometry)
        otherWeapons[id] = new Weapon(weaponGeometry, data.weaponData[id].type, [platforms, otherPlayers, [player], [ground]], otherPlayers[data.ownerId])
        otherWeapons[id].position = data.weaponData[id].position
        otherWeapons[id].velocity = data.weaponData[id].velocity
        otherWeapons[id].shooted = true
        otherWeapons[id].shootSoundEffect.play()
        otherPlayers[data.ownerId].weapons.push(otherWeapons[id])
        otherPlayers[data.ownerId].cooldownTimer = otherPlayers[data.ownerId].currentCooldown
    }
})

socket.on("weaponHit", (data) => {
    if (otherWeapons[data.weaponId]) {
        otherWeapons[data.weaponId].shooted = false
        otherWeapons[data.weaponId].remove()
    }
})

socket.on("newPlayer", (newPlayer) => {
    displayChatMessage(newPlayer.name + " spawned in at x: " + newPlayer.position.x + ", y: " + newPlayer.position.y + ", z: " + newPlayer.position.z);
    otherPlayers[newPlayer.id] = new Player(playerGeometry, newPlayer.position.x, newPlayer.position.y, newPlayer.position.z, newPlayer.position.yaw, newPlayer.position.lean, newPlayer.health, newPlayer.id, newPlayer.name);
    console.log(otherPlayers[newPlayer.id])
    addPlayerToHUD(newPlayer.id, newPlayer.name)
})

socket.on("newWeapon", (data) => {
    let owner
    if (data.ownerId == player.id) owner = player
    else owner = otherPlayers[data.ownerId]

    otherWeapons[data.id] = new Weapon(weaponGeometry, data.type, [platforms, otherPlayers, [player], [ground]], owner)
    otherWeapons[data.id].position = data.position
    otherWeapons[data.id].velocity = data.velocity
    otherWeapons[data.id].shooted = true
    otherWeapons[data.id].shootSoundEffect.play()

    owner.weapons.push(otherWeapons[data.id])

    owner.currentCooldown = data.cooldown / 1000
    owner.cooldownTimer = owner.currentCooldown
})

socket.on("playerLeave", (id) => {
    if (otherPlayers[id] == null) return
    displayChatMessage(otherPlayers[id].name + " left")
    otherPlayers[id].remove()
    otherPlayers[id] = null
    removePlayerFromHUD(id)
})

socket.on("playerUpdate", (playersData) => {

    for (let id in playersData) {
        // update player health and healthbar
        if (player && id == player.id) {
            if (playersData[id].health != player.health) {
                player.health = playersData[id].health
                document.getElementById("healthBar").style.width = playersData[id].health + "%"
                document.getElementById("healthBar").style.backgroundColor = "rgb(" + (2.55 * (100 - player.health)) + ", " + (2.55 * player.health * .75) + ", 0)"
            }
            player.alive = playersData[id].health > 0
        }
        
        if (otherPlayers[id] != null) {
            otherPlayers[id].health = playersData[id].health
            otherPlayers[id].alive = playersData[id].health > 0
            if (!playersData[id].respawnedThisTick) {
                otherPlayers[id].lastPosition = otherPlayers[id].serverPosition
                otherPlayers[id].lastState = otherPlayers[id].serverState
            } else {
                // if current player just respawned, set "last" variables to be equivalent to current
                otherPlayers[id].lastPosition = playersData[id].position
                otherPlayers[id].lastState = playersData[id].state
                otherPlayers[id].clearSmoothing()
            }
            for (let i in playersData[id].position) otherPlayers[id].serverPosition[i] = playersData[id].position[i]
            for (let i in playersData[id].state) otherPlayers[id].serverState[i] = playersData[id].state[i]
            if (otherPlayers[id].currentWeaponType != playersData[id].currentWeaponType && playersData[id].currentWeaponType != undefined) {
                otherPlayers[id].currentWeaponType = playersData[id].currentWeaponType
                if (otherPlayers[id].inventory.currentWeapon != null) otherPlayers[id].inventory.currentWeapon.remove()
                otherPlayers[id].inventory.currentWeapon = new Weapon(weaponGeometry, otherPlayers[id].currentWeaponType, [otherPlayers, platforms, [ground]], otherPlayers[id])
            }
        }
    }
})

socket.on("chatMessage", (msg) => {
    console.log(msg)

    displayChatMessage(msg)
})

socket.on("nameChange", (data) => {
    if (otherPlayers[data.id] == undefined) return
    otherPlayers[data.id].name = data.newName
    otherPlayers[data.id].gamerTag.changeName(data.newName)

    changePlayerNameInHUD(data.id, data.newName)

})

socket.on("respawn", (data) => {
    console.log("you respawn")
    player.lastPosition = data.position
    player.lastState = data.state
    player.position = data.position
    player.state = data.state
    console.log(player)



})

socket.on("youDied", (data) => {
    if (player && data.id == player.id) {
        if (data.cause == "void") {
            player.position.x = 0
            player.position.y = 2
            player.position.z = 0
        }

        startRespawnCountdown()
        pauseGame()
        document.exitPointerLock()

    }
})

socket.on("playerRespawned", (data) => {
    if (!otherPlayers[data.id]) return
    otherPlayers[data.id].pastPositions = []
    otherPlayers[data.id].pastStates = []
})

socket.on("tooManyPlayers", () => {
    if (player) startButton.disabled = false
    alert("Sorry, there are too many players connected.");
})

socket.on("roomCapReached", () => {
    if (player) startButton.disabled = false
    alert("Server has reached room limit. Cannot join room.")
})

function joinRoom(id) {
    console.log("join room")
    startButton.disabled = true
    socket.emit("joinRoom", {
        roomId: id, 
        playerId: (player != null) ? player.id : null
    })

}

// Receives this from the server when the player joins the room successfully
socket.on("roomJoinSuccess", (roomId) => {
    lobbyId = roomId
    document.getElementById("title").textContent = "Room " + lobbyId
    startButton.textContent = "Play"

    if (player != null) removePlayerFromHUD(player.id, player.name)

    // delete all map geometry
    for (let i in mapModels) mapModels[i].delete()

    for (let i = 0; i < platforms.length; i++) {
        platforms[i].remove()
    }
    platforms.splice(0, platforms.length)
    cameraColliders.splice(0, cameraColliders.length)
    if (player != undefined) {
        player.remove()
        player = undefined
    }

    if (ground != null) {
        ground.remove()
        ground = null
    }

    for (let i in otherPlayers) if (otherPlayers[i] != null) otherPlayers[i].remove()

    document.getElementById("title").textContent = "Room " + lobbyId
    console.log(lobbyId)
})


// TESTING //

platforms.push(new Platform(platformGeometry, "doorTest", -10, 3, -20, 1))
/*
new Model({
    positions: [[0, 0, -10], [0, 20, -10], [0, 20, 10], [0, 0, 10]],
    normals: [[0, 1, 0]],
    texcoords: [[0, 0], [0, 1], [1, 1], [1, 0]],
    smooth: false,
    indices: [
        {vertexes: [0, 1, 2], normals: [0, 0, 0], texcoords: [0, 1, 2]},
        {vertexes: [2, 3, 0], normals: [0, 0, 0], texcoords: [2, 3, 0]},
    ]
}, 1, null, 0, 0,)
*/







// UPDATE LOOP //

function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;



    lastFramerates.splice(0, 0, 1000 / deltaTime)
    lastFramerates.splice(20)
    let rollingFramerate = 0
    let recentFrameCount = Math.round(333 / deltaTime)
    recentFrameCount = recentFrameCount < 1 ? 1 : recentFrameCount
    recentFrameCount = recentFrameCount > lastFramerates.length ? lastFramerates.length : recentFrameCount
    for (let i = 0; i < recentFrameCount; i++) rollingFramerate += lastFramerates[i] / recentFrameCount
    info.innerHTML = Math.round(rollingFramerate) + "<br>polycount: " + webgl.points.length / 9 + "<br>client TPS: " + Math.round(1000 / averageClientTPS)


    Particle.updateParticles(deltaTime)


    if (player) {
        player.position.yaw = lookAngleY
        player.position.lean = lookAngleX
        player.dimensions.yaw = lookAngleY
        player.dimensions.pitch = lookAngleX
        player.gamerTag.position = {
          x: player.position.x,
          y: player.position.y + 2.75,
          z: player.position.z,
          yaw: lookAngleY,
          lean: 0,
          pitch: lookAngleX,
          roll: 0
        }
        player.gamerTag.alive = player.alive
        if (player.inventory.currentWeapon) player.inventory.currentWeapon.alive = player.alive

    }

    // update other player positions

    let timeSinceLastTick = Date.now() - currentTickTime
    averageClientTPS = 0
    lastTickTimes.splice(10)
    for (let i = 0; i < lastTickTimes.length - 1; i++) averageClientTPS += (lastTickTimes[i] - lastTickTimes[i + 1]) / (lastTickTimes.length - 1)
    let currentTickStage = timeSinceLastTick / averageClientTPS / 1.15

    for (let id in otherPlayers) {
        if (otherPlayers[id] != null) {

            otherPlayers[id].smoothPosition(currentTickStage)
            otherPlayers[id].gamerTag.position = {
            x: otherPlayers[id].position.x,
            y: otherPlayers[id].position.y + 2.75,
            z: otherPlayers[id].position.z,
            yaw: lookAngleY,
            lean: 0,
            pitch: lookAngleX,
            roll: 0
            }
            otherPlayers[id].gamerTag.alive = otherPlayers[id].alive
            if (otherPlayers[id].inventory.currentWeapon) otherPlayers[id].inventory.currentWeapon.alive = otherPlayers[id].alive

            if (otherPlayers[id].inventory.currentWeapon != null) {
                if (otherPlayers[id].alive) otherPlayers[id].inventory.currentWeapon.calculatePosition(deltaTime)
                otherPlayers[id].updateCooldown(deltaTime)
            }
        }



    }




    if (player && player.inventory.currentWeapon != null) {
        player.inventory.currentWeapon.calculatePosition(deltaTime, socket) // weapon collision updates need to be sent to the server in calculatePosition method

    }


    camera.position.yaw = player ? player.position.yaw : 0
    camera.position.lean = player ? player.position.lean : 0

    webgl.renderFrame(player ? player.position : {x: 0, y: 0, z: 0}, camera, cameraColliders, aimState, deltaTime);
    if (running) requestAnimationFrame(update)
}
update()



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

    // -- Movement -- //

    let speed = 0;
    if (player.movementState == "walking" || aimState > 0) {
        speed = Player.walkingSpeed
        webgl.fov -= deltaTime * Player.fovShiftSpeed
        if (webgl.fov < Player.walkingFOV) webgl.fov = Player.walkingFOV
    }
    if (player.movementState == "crouching") {
        speed = Player.crouchingSpeed
        webgl.fov -= deltaTime * Player.fovShiftSpeed
        if (webgl.fov < Player.crouchingFOV) webgl.fov = Player.walkingFOV
    }
    if (player.movementState == "sprinting" && aimState <= 0) {
        speed = Player.sprintingSpeed
        webgl.fov += deltaTime * Player.fovShiftSpeed
        if (webgl.fov > Player.sprintingFOV) webgl.fov = Player.sprintingFOV
    }
    if (player.movementState == "sliding" && aimState <= 0) {
        speed = Player.slidingSpeed
        webgl.fov += deltaTime * Player.fovShiftSpeed
        if (webgl.fov > Player.slidingFOV) webgl.fov = Player.slidingFOV
    }
    let walkAnimationSpeed = 2.25 * deltaTime * speed

    let movementVector = {
        x: 0,
        y: 0,
        z: 0
    }

    if (forward && !chatboxOpen) {
        movementVector.x += speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
        movementVector.z += speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

        if (player.movementState != "sliding") player.state.walkCycle += walkAnimationSpeed
    }
    if (left && !chatboxOpen) {
        movementVector.x -= speed * Math.cos(lookAngleY) * deltaTime
        movementVector.z -= speed * Math.sin(lookAngleY) * deltaTime
    }
    if (backward && !chatboxOpen) {
        movementVector.x -= speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
        movementVector.z -= speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

        player.state.walkCycle -= walkAnimationSpeed
    }
    if (right && !chatboxOpen) {
        movementVector.x += speed * Math.cos(lookAngleY) * deltaTime
        movementVector.z += speed * Math.sin(lookAngleY) * deltaTime
    }
    if ((!forward && !backward) || player.movementState == "sliding") {
        let r = player.state.walkCycle % Math.PI
        if (r < Math.PI / 2) player.state.walkCycle = (player.state.walkCycle - r) + (r / (1 + deltaTime / 100))
        else player.state.walkCycle = (player.state.walkCycle + r) - (r / (1 + deltaTime / 100))
    }

    if (player.movementState == "sliding") {
        player.slideCountdown -= deltaTime
        if (player.slideCountdown != null && player.slideCountdown <= 0) {
            player.movementState = "crouching"
            player.slideCountdown = 1000
        }
    }
    if (shift && !chatboxOpen && player.movementState == "walking") {
        player.movementState = "crouching"
        player.state.crouchValue += .015 * deltaTime
        if (player.state.crouchValue > 1) player.state.crouchValue = 1
    }
    else if (shift && !chatboxOpen && (player.movementState == "crouching" || player.movementState == "sliding")) {
        player.state.crouchValue += .015 * deltaTime
        if (player.state.crouchValue > 1) player.state.crouchValue = 1
    }
    else if (!shift && player.movementState != "crouching") {
        player.state.crouchValue -= .015 * deltaTime
        if (player.state.crouchValue < 0) player.state.crouchValue = 0
    }
    else if (shift && !chatboxOpen && player.movementState == "sprinting") {
        player.movementState = "sliding"
        player.slideCountdown = 1000
    }
    else if (!shift && (player.movementState == "crouching" || player.movementState == "sliding")) {
        player.movementState = "walking"
    }

    if (space && !chatboxOpen) {
        if (player.onGround) {
        player.velocity.y = Player.jumpForce
        }
    }

    if (leftClicking) {
        if (player.cooldownTimer <= 0) {
            socket.emit("newWeapon", {
                ownerId: player.id,
                type: player.inventory.currentWeapon.type,
                position: player.inventory.currentWeapon.position,
                pitch: lookAngleX,
                yaw: lookAngleY
            })
        }
    }
    if (rightClicking) aimState = Math.min(1, aimState + .005 * deltaTime)
    else aimState = Math.max(0, aimState - .005 * deltaTime)
    updateCrosshair()


    // normalize movement vector //
    let hypotenuse = Math.sqrt(Math.pow(movementVector.x, 2) + Math.pow(movementVector.z, 2))
    if (hypotenuse > 0) {
        player.velocity.x = movementVector.x / hypotenuse * speed
        player.velocity.z = movementVector.z / hypotenuse * speed
    } else {
        player.velocity.x = 0
        player.velocity.z = 0
    }



    if (player.alive) player.calculatePosition(deltaTime, headBumpNoise)

    if (!player.lastOnGround && player.onGround) {
        let splatVolume = Math.abs(player.lastVelocity.y) * 50 - .75
        splatVolume = splatVolume > 0 ? splatVolume : 0
        splatNoise.volume = (splatVolume < 1 ? splatVolume : 1) * volume
        splatNoise.currentTime = .1
        splatNoise.playbackRate = 1.5
        splatNoise.play()
    }


    player.lastPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
    player.lastOnGround = player.onGround




    for (let id in otherWeapons) {
        if (otherWeapons[id] != null) {
            
            if (otherWeapons[id].shooted) {
                otherWeapons[id].calculatePosition(deltaTime, socket, otherWeapons[id].owner == player)

            }
        }
    }



    // ingredient jiggle //


    // combat updates //
    player.updateCooldown(deltaTime)

}



// -- key pressing -- //

var keyBinds = {
    forward: {
        code: "KeyW",
        selecting: false
    },
    left: {
        code: "KeyA",
        selecting: false
    },
    backward: {
        code: "KeyS",
        selecting: false
    },
    right: {
        code: "KeyD",
        selecting: false
    },
    openChat: {
        code: "Enter",
        selecting: false
    }
}


function initKeyInput(preventDefault) {
    document.onkeydown = (event) => {
        if (preventDefault) event.preventDefault();


        for (let i in keyBinds) {
            if (keyBinds[i].selecting) {
                keyBinds[i].code = event.code
                keyBinds[i].selector.value = event.code
            }
        }

        if (player != undefined) {
            if (event.code == "Digit1") {
                changeWeaponSelection(0)
            }
            if (event.code == "Digit2") {
                changeWeaponSelection(1)
            }
            if (event.code == "Digit3") {
                changeWeaponSelection(2)
            }
            if (event.code == "Digit4") {
                changeWeaponSelection(3)
            }
            if (event.code == "Digit5") {
                changeWeaponSelection(4)
            }


            if (event.code == "ArrowLeft") {
                arrowLeft = true
                if (player.inventory.currentSelection - 1 >= 0) changeWeaponSelection(player.inventory.currentSelection - 1)
            }
            if (event.code == "ArrowRight") {
                arrowRight = true
                if (player.inventory.currentSelection + 1 < weaponSelectors.length) changeWeaponSelection(player.inventory.currentSelection + 1)
            }
        }

        if (event.code == keyBinds.forward.code) {
            forward = true
            if (Date.now() - lastWPress < 250) {
                player.movementState = "sprinting"
            }
            if (!event.repeat) lastWPress = Date.now()
        }
        if (event.code == keyBinds.backward.code) backward = true
        if (event.code == keyBinds.left.code) left = true
        if (event.code == keyBinds.right.code) right = true

        if (event.code == "ShiftLeft") {

            shift = true
        }
        if (event.code == "Space") {
            space = true
            if (!event.repeat) {
                jumpNoise.currentTime = 0.025
                jumpNoise.play()
            }
        }

        if (chatboxOpen) {
            if (event.code == "Backspace") {
                chatboxInput.textContent = chatboxInput.textContent.slice(0, -2) + "|"
            }
            else if (event.code == "Enter") {
                if (chatboxInput.textContent.length > 1) socket.emit("sendChatMessage", player.name + ": " + chatboxInput.textContent.slice(0, -1))
                chatboxInput.innerHTML = ""
                closeChatbox()
            }
            else if (event.code == "Escape") {
                closeChatbox()
            }
            else if (event.key.length == 1) {
                chatboxInput.textContent = chatboxInput.textContent.slice(0, -1) + event.key + "|"
                chatboxInput.textContent.slice(0, -1) + "|"
            }
        }

        else if (event.code == keyBinds.openChat.code && running) {
            openChatbox()
        }


    };

    document.onkeyup = (event) => {
        if (preventDefault) event.preventDefault();

        if (event.code == 37) arrowLeft = false
        if (event.code == 39) arrowRight = false

        if (event.code == keyBinds.forward.code) {
            forward = false
            player.movementState = "walking"
        }
        if (event.code == keyBinds.backward.code) backward = false
        if (event.code == keyBinds.left.code) left = false
        if (event.code == keyBinds.right.code) right = false

        if (event.code == "ShiftLeft") shift = false
        if (event.code == "Space") space = false
    };

}
initKeyInput(false)

// -- mouse -- //

function startGame() {
    if (!running) {
        initKeyInput(true)
        running = true
        update()
        fixedUpdateInterval = setInterval(fixedUpdate, 10) // set fixedUpdate to run 100 times/second
    }
}

function pauseGame() {
    pauseNoise.play()
    console.log("stopped")

    leftClicking = false
    rightClicking = false
    forward = false
    left = false
    backward = false
    right = false
    arrowLeft = false
    arrowRight = false
    shift = false
    space = false

    initKeyInput(false)
    //running = false

    //fixedUpdateThen = Date.now();
    //clearInterval(fixedUpdateInterval)
    if (chatboxOpen) closeChatbox()

    menu.style.zIndex = "30"
    window.setTimeout(() => {menu.style.zIndex = "30"}, 100)
    window.setTimeout(() => {menu.style.zIndex = "30"}, 300)
    window.setTimeout(() => {
        menu.style.opacity = "1.0"
        document.getElementById("lobby").style.left = "7%"
        document.getElementById("main").style.top = "30%"
        document.getElementById("loadout").style.right = "7%" 
    }, 0)
}

function startRespawnCountdown() {
    startButton.disabled = true
    for (let i = 0; i < 5; i++) window.setTimeout(() => {
        startButton.textContent = 5 - i
    }, i * 1000)

    window.setTimeout(() => {
        startButton.disabled = false
        startButton.textContent = "Respawn"
    }, 5000)

}


var lastPointerLockExited = Date.now()
document.addEventListener("pointerlockchange", function () {
    lastPointerLockExited = Date.now()
    if (document.pointerLockElement === canvas) {
        pointerLocked = true
        startButton.textContent = "Resume"
    } else {
        pointerLocked = false
        pauseGame()
    }


}, false)


let viewPort = document.querySelector("meta[name='viewport']")
viewPort.content = "initial-scale=1.25, maximum-scale=1.25"

window.onorientationchange = () => {
    console.log(window.orientation)
    let viewPort = document.querySelector("meta[name='viewport']")
    viewPort.content = "initial-scale=1.25, maximum-scale=1.25"
    console.log(viewPort)
    document.body.scrollTo(0, 0)
}

window.onresize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    
    webgl.gl.useProgram(webgl.program)
    webgl.gl.uniform1f(webgl.gl.getUniformLocation(webgl.program, "uCanvasWidth"), webgl.gl.canvas.width)
    webgl.gl.uniform1f(webgl.gl.getUniformLocation(webgl.program, "uCanvasHeight"), webgl.gl.canvas.height)
    
    webgl.gl.useProgram(webgl.skyboxProgram)
    webgl.gl.uniform1f(webgl.gl.getUniformLocation(webgl.skyboxProgram, "uCanvasWidth"), webgl.gl.canvas.width)
    webgl.gl.uniform1f(webgl.gl.getUniformLocation(webgl.skyboxProgram, "uCanvasHeight"), webgl.gl.canvas.height)

    webgl.gl.bindTexture(webgl.gl.TEXTURE_2D, webgl.normalRenderMap)
    webgl.gl.texImage2D(webgl.gl.TEXTURE_2D, 0, webgl.gl.RGBA, webgl.gl.canvas.width, webgl.gl.canvas.height, 0, webgl.gl.RGBA, webgl.gl.UNSIGNED_BYTE, null)

    webgl.gl.bindRenderbuffer(webgl.gl.RENDERBUFFER, webgl.normalRenderMapDepthBuffer)

    webgl.gl.renderbufferStorage(webgl.gl.RENDERBUFFER, webgl.gl.DEPTH_COMPONENT16, webgl.gl.canvas.width, webgl.gl.canvas.height)


    webgl.aspect = canvas.width / canvas.height

    effectsCanvas.width = window.innerWidth
    effectsCanvas.height = window.innerHeight
}




var sensitivity = Math.PI / 1024;
document.addEventListener("mousemove", function (event) {
    if (pointerLocked) {
        lookAngleX += sensitivity * event.movementY
        lookAngleY += sensitivity * event.movementX

        if (lookAngleX < -Math.PI / 2) lookAngleX = -Math.PI / 2
        if (lookAngleX > Math.PI / 2) lookAngleX = Math.PI / 2

    }

}, false)


var touchX = 0
var touchY = 0
var lastTouchX = 0
var lastTouchY = 0
var cameraMoveTouchIdentifier
var touchMoveTouchIdentifier
var jumpTouchIdentifier
var shootTouchIdentifier

const touchMovement = document.getElementById("touchMovement")
const jump = document.getElementById("jump")
const shoot = document.getElementById("shoot")



function setMovement(x, y, touchStart) {
    if (y > .67) {backward = true; forward = false;}
    if (y < .33) {backward = false; forward = true; if (touchStart) {if (Date.now() - lastWPress < 250) player.movementState = "sprinting"; lastWPress = Date.now()}}
    else {player.movementState = "walking"; lastWPress = 0}
    if (.33 < y && y < .67) {backward = false; forward = false;}
    if (x > .67) {right = true; left = false}
    if (x < .67) {right = false; left = true}
    if (.33 < x && x < .67) {right = false; left = false;}
}

function getTouchByIdentifier(touches, identifier) {
    for (let i = 0; i < touches.length; i++) if (touches[i].identifier == identifier) return touches[i]
}

document.getElementById("hud").addEventListener('touchstart', (event) => {
    event.preventDefault()

    for (let i = 0; i < event.touches.length; i++) {
        if (event.touches[i].target.classList.contains("weaponSlot")) changeWeaponSelection(event.touches[i].target.id)
    }

    cameraMoveTouchIdentifier = undefined
    for (let i = 0; i < event.touches.length; i++) if (event.touches[i].target != touchMovement && event.touches[i].target != jump && event.touches[i].target != shoot) cameraMoveTouchIdentifier = event.touches[i].identifier
    
    if (cameraMoveTouchIdentifier != undefined) {
        let cameraTouch = getTouchByIdentifier(event.touches, cameraMoveTouchIdentifier)
        touchX = cameraTouch.pageX
        touchY = cameraTouch.pageY

        lastTouchX = touchX
        lastTouchY = touchY
    }

    touchMoveTouchIdentifier = undefined
    for (let i = 0; i < event.touches.length; i++) if (event.touches[i].target == touchMovement) touchMoveTouchIdentifier = event.touches[i].identifier
    
    if (touchMoveTouchIdentifier != undefined) {
        let moveTouch = getTouchByIdentifier(event.touches, touchMoveTouchIdentifier)
        setMovement((moveTouch.pageX - touchMovement.offsetLeft) / touchMovement.clientWidth, (moveTouch.clientY - touchMovement.offsetTop) / touchMovement.clientHeight, true)
    }
    
    jumpTouchIdentifier = undefined
    for (let i = 0; i < event.touches.length; i++) if (event.touches[i].target == jump) jumpTouchIdentifier = event.touches[i].identifier

    if (jumpTouchIdentifier != undefined) space = true
    
    
    shootTouchIdentifier = undefined
    for (let i = 0; i < event.touches.length; i++) if (event.touches[i].target == shoot) shootTouchIdentifier = event.touches[i].identifier
    
    if (shootTouchIdentifier != undefined) leftClicking = true
    


}, false)

document.getElementById("hud").addEventListener('touchend', (event) => {
    event.preventDefault()

    for (let i = 0; i < event.changedTouches.length; i++) {
        if (event.changedTouches[i].identifier == cameraMoveTouchIdentifier) cameraMoveTouchIdentifier = undefined
        if (event.changedTouches[i].identifier == touchMoveTouchIdentifier) { forward = false; left = false; backward = false; right = false; player.movementState = "walking"; touchMoveTouchIdentifier = undefined }
        if (event.changedTouches[i].identifier == jumpTouchIdentifier) { space = false; jumpTouchIdentifier = undefined }
        if (event.changedTouches[i].identifier == shootTouchIdentifier) { leftClicking = false; shootTouchIdentifier = undefined }
    }

}, false)

document.getElementById("hud").addEventListener('touchmove', (event) => {
    event.preventDefault()
    if (cameraMoveTouchIdentifier != undefined) {
        let cameraTouch = getTouchByIdentifier(event.touches, cameraMoveTouchIdentifier)
        touchX = cameraTouch.pageX
        touchY = cameraTouch.pageY
            
        lookAngleY += sensitivity * 2 * (touchX - lastTouchX)
        lookAngleX += sensitivity * 2 * (touchY - lastTouchY)

        if (lookAngleX < -Math.PI / 2) lookAngleX = -Math.PI / 2
        if (lookAngleX > Math.PI / 2) lookAngleX = Math.PI / 2

        lastTouchX = touchX
        lastTouchY = touchY
    }

    if (touchMoveTouchIdentifier != undefined) {
        let moveTouch = getTouchByIdentifier(event.touches, touchMoveTouchIdentifier)
        setMovement((moveTouch.pageX - touchMovement.offsetLeft) / touchMovement.clientWidth, (moveTouch.clientY - touchMovement.offsetTop) / touchMovement.clientHeight)
    }
    
}, false)



// -- menu -- //
startButton.onclick = () => {
    if (!player) {
        //alert("join a room first")
        return
    }
    if ((Date.now() - lastPointerLockExited) < 750) return

    if (!player.alive) socket.emit("respawnMe", {id: player.id})

    console.log("starting")

    //backgroundNoises.play()
    window.setTimeout(() => {menu.style.zIndex = "10"}, 250)
    window.setTimeout(() => {menu.style.opacity = "0.0"}, 10)
    document.getElementById("lobby").style.left = "-3%"
    document.getElementById("main").style.top = "20%"
    document.getElementById("loadout").style.right = "-3%"

    changeWeaponSelection(player.inventory.currentSelection)

    if (player.name != player.lastName) {
        player.gamerTag.changeName(player.name)
        player.lastName = player.name

        changePlayerNameInHUD(player.id, player.name)

        socket.emit("nameChange", { id: player.id, newName: player.name })
    }

    let timeToWait = Math.max(1500 - (Date.now() - lastPointerLockExited), 0)

    if (canvas.requestPointerLock) window.setTimeout(() => {canvas.requestPointerLock()}, timeToWait)
    startGame()
}



var nameField = document.getElementById("nameField")
nameField.oninput = () => {
    player.name = nameField.value
}


// -- settings -- //
var settingsDiv = document.getElementById("settings")
document.getElementById("settingsButton").onclick = () => {
    if (settingsDiv.style.display == "") settingsDiv.style.display = "block"
    else settingsDiv.style.display = ""
}

var sensitivitySlider = document.getElementById("sensitivitySlider")
sensitivitySlider.onchange = () => {
    sensitivity = Math.PI / 4096 * Number(sensitivitySlider.value)
    console.log(sensitivity)
}

var keyBindSelectors = document.getElementsByClassName("keyBindInput")
for (let i = 0; i < keyBindSelectors.length; i++) {
    let keyBind = keyBindSelectors[i].id
    keyBinds[keyBind].selector = keyBindSelectors[i]
    keyBindSelectors[i].value = keyBinds[keyBind].code
    keyBindSelectors[i].onmouseenter = () => { keyBinds[keyBind].selecting = true }
    keyBindSelectors[i].onmouseleave = () => { keyBinds[keyBind].selecting = false }
}

var settingsCheckboxes = document.getElementsByClassName("settingsCheckbox")
var overallGraphicsSelector = document.getElementById("overallGraphics")

for (let i = 0; i < settingsCheckboxes.length; i++) {
    settingsCheckboxes[i].onchange = () => {
        webgl.settings[settingsCheckboxes[i].id] = settingsCheckboxes[i].checked
        webgl.initializeShaders()
        overallGraphicsSelector.value = "custom"
    }
}

overallGraphicsSelector.onchange = () => {
    switch (overallGraphicsSelector.value) {
        case "low":
            webgl.settings.skybox = true
            webgl.settings.specularLighting = false
            webgl.settings.shadows = false
            webgl.settings.particles = false
            webgl.settings.volumetricLighting = false
            break
        case "medium":
            webgl.settings.skybox = true
            webgl.settings.specularLighting = true
            webgl.settings.shadows = true
            webgl.settings.particles = false
            webgl.settings.volumetricLighting = false
            break
        case "high":
            webgl.settings.skybox = true
            webgl.settings.specularLighting = true
            webgl.settings.shadows = true
            webgl.settings.particles = false
            webgl.settings.volumetricLighting = true
            break
    }

    for(let i = 0; i < settingsCheckboxes.length; i++) {
        for (let setting in webgl.settings) {
            if (settingsCheckboxes[i].id == setting) settingsCheckboxes[i].checked = webgl.settings[setting]
        }
    }

    webgl.initializeShaders()
}

function updateSavedSettings() {
    localStorage.savedSettings = JSON.stringify({
        "mouse": {
            "sensitivity": document.getElementById("sensitivitySlider").value
        },
        "keybinds": {
            "forward": document.getElementById("forward").value,
            "left": document.getElementById("left").value,
            "backward": document.getElementById("backward").value,
            "right": document.getElementById("right").value,
            "openChat": document.getElementById("openChat").value
        },
        "audio": {
            "volume": document.getElementById("volumeSlider").value
        },
        "graphics": {
            "overall": document.getElementById("overallGraphics").value,
            "skybox": document.getElementById("skybox").value,
            "specularLighting": document.getElementById("specularLighting"),
            "shadows": document.getElementById("shadows").value,
            "particles": document.getElementById("particles").value,
            "voumetricLighting": document.getElementById("volumetricLighting").value,
            "heaven": document.getElementById("heaven").value
        }
    })   
}

function readSavedSettings() {
    let savedSettings = JSON.parse(localStorage.savedSettings)
    document.getElementById("sensitivitySlider").value = savedSettings.mouse.sensitivity
    document.getElementById("forward").value = savedSettings.keybinds.forward
    document.getElementById("left").value = savedSettings.keybinds.left
    document.getElementById("backward").value = savedSettings.keybinds.backward
    document.getElementById("right").value = savedSettings.keybinds.right
    document.getElementById("volumeSlider").value = savedSettings.audio.volume
    document.getElementById("overallGraphics").value = savedSettings.graphics.overall.value
    document.getElementById("skybox").value = savedSettings.graphics.skybox
    document.getElementById("specularLighting").value = savedSettings.graphics.specularLighting
    document.getElementById("shadows").value = savedSettings.graphics.shadows
    document.getElementById("particles").value = savedSettings.graphics.particles
    document.getElementById("volumetricLighting").value = savedSettings.graphics.volumetricLighting
    document.getElementById("heaven").value = savedSettings.graphics.heaven

    keybinds.forward = savedSettings.keybinds.forward
    keybinds.left = savedSettings.keybinds.left
    keybinds.backward = savedSettings.keybinds.backward
    keybinds.right = savedSettings.keybinds.right

    overallGraphicsSelector.onchange()
    
}


document.addEventListener("mousedown", function (event) {
    if (running && event.which == 1 && menu.style.opacity == 0) leftClicking = true
    if (running && event.which == 3 && menu.style.opacity == 0) rightClicking = true

})

document.addEventListener("mouseup", function (event) {
    if (running && event.which == 1) leftClicking = false
    if (running && event.which == 3) rightClicking = false
})
