
//// ---- MAIN SCRIPT ---- ////
console.log("starting script")
import modelStuff from "../modules/model-data.js"

var modelData = modelStuff.modelData
var fetchObj = modelStuff.fetchObj
var obj = modelStuff.obj

import webglStuff from "../modules/webgl.js"

var webgl = webglStuff.webgl
var Point = webglStuff.Point
var Model = webglStuff.Model
var PhysicalObject = webglStuff.PhysicalObject
var Player = webglStuff.Player
var Weapon = webglStuff.Weapon
var Platform = webglStuff.Platform
var Ground = webglStuff.Ground







// GLOBAL VARIABLES //

var w = false
var a = false
var s = false
var d = false
var left = false
var right = false
var up = false
var down = false
var shift = false
var space = false
var leftClicking = false
var rightClicking = false

var pointerLocked = false

var lastWPress = Date.now()


var lookAngleX = 0.0
var lookAngleY = 0.0




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
var lobbyId = Number(document.getElementById("lobbyId").textContent)
var socket = io();
var otherPlayers = {};
var otherWeapons = {}


// Local global variables //
var platforms = [];

// html elements //
const menu = document.getElementById("menu")
const startButton = document.getElementById("startButton")
const info = document.getElementById("info")
const canvas = document.getElementById("canvas")
const effectsCanvas = document.getElementById("effectsCanvas")
const ctx = effectsCanvas.getContext("2d")

var myWeapons = [
    "anchovy",
    "olive",
    "pickle",
    "sausage",
    "tomato"
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

const backgroundNoises = new Audio("../assets/wet_wriggling_noises/dripping-water-nature-sounds-8050.mp3")
backgroundNoises.volume = .5
backgroundNoises.loop = true

const splatNoise = new Audio("../assets/wet_wriggling_noises/cartoon-splat-6086.mp3")
const jumpNoise = new Audio("../assets/wet_wriggling_noises/smb_jump-super.wav")
const pauseNoise = new Audio("../assets/wet_wriggling_noises/smb_pause.wav")
const stepNoise = new Audio("../assets/wet_wriggling_noises/slime-squish-14539.mp3")


// MAP ORGANIZATION //


var inventory

var updateHUD = () => {
    let width = effectsCanvas.width
    let height = effectsCanvas.height
    let slotSize = 75
    ctx.clearRect(width - (weaponSelectors.length + 1) * slotSize - 10, height - slotSize * 2 - 10, (weaponSelectors.length) * slotSize + 20, slotSize * 2 + 20)
    ctx.fillStyle = "white"
    ctx.fillRect(width - (weaponSelectors.length + 1) * slotSize - 10, height - slotSize * 2 - 10, (weaponSelectors.length) * slotSize + 20, slotSize + 20)

    for (let i = 0; i < weaponSelectors.length; i++) {
        if (weaponSelectors[i].value == "tomato") ctx.fillStyle = "red"
        if (weaponSelectors[i].value == "olive") ctx.fillStyle = "green"
        if (weaponSelectors[i].value == "pickle") ctx.fillStyle = "lightgreen"
        if (weaponSelectors[i].value == "sausage") ctx.fillStyle = "brown"
        if (weaponSelectors[i].value == "anchovy") ctx.fillStyle = "blue"

        ctx.fillRect(width - (weaponSelectors.length + 1) * slotSize + i * slotSize, height - slotSize * 2, slotSize, slotSize)
        ctx.fillStyle = "white"
        ctx.font = "100 15px sans-serif"
        ctx.fillText(weaponSelectors[i].value, width - (weaponSelectors.length + 1) * slotSize + i * slotSize, height - slotSize * 2 + 100, slotSize)
    }

    ctx.fillStyle = "yellow"
    for (let i = 0; i < 5; i += .1) ctx.strokeRect(width - (weaponSelectors.length + 1) * slotSize - i + inventory.currentSelection * slotSize, height - slotSize * 2 - i, slotSize + i * 2, slotSize + i * 2)
}

var changeWeaponSelection = (selection) => {
    inventory.currentSelection = selection
    inventory.currentWeapon.remove()

    inventory.currentWeapon = new Weapon(weaponGeometry, weaponSelectors[selection].value, [platforms, otherPlayers, [ground]], player)
    updateHUD()
}


var chatMessages = []

function displayChatMessage(msg) {

    let messageDiv = document.createElement("div")
    messageDiv.classList.add("chatMessage")
    messageDiv.textContent = msg
    chatbox.appendChild(messageDiv)

    chatMessages.push(messageDiv)

    if (msg.indexOf("fell") != -1 || msg.indexOf("killed") != -1) messageDiv.style.color = "red"
    if (msg.indexOf("spawned") != -1) messageDiv.style.color = "lightgreen"

    window.setTimeout(() => {
        messageDiv.style.opacity = 0.0
    }, 10000)
    
    let bottomValue = 10
    for (let i = chatMessages.length - 1; i >= 0; i--) {
        console.log(chatMessages[i].offsetHeight)
        chatMessages[i].style.bottom = bottomValue + "px"
        bottomValue += chatMessages[i].offsetHeight + 10
    }
}

var chatboxOpen = false
var chatboxInput = document.getElementById("chatboxInput")
chatboxInput.style.display = "none"
function openChatbox() {
    chatboxOpen = true
    document.exitPointerLock()

    chatboxInput.style.display = ""
}

function closeChatbox() {
    chatboxOpen = false
    startGame()
    window.setTimeout(() => {
        canvas.requestPointerLock()
    }, 200)

    chatboxInput.style.display = "none"
}



// INITIALIZE WEBGL //

webgl.initialize()

// MODEL DATA ORGANIZATION //

var playerIdleInfo = obj.parseWavefront(fetchObj("player/PlayerIdle.obj"), true)

var playerGeometry = {
    frontSlice: obj.parseWavefront(fetchObj("player/LowPolySliceOfBread.obj"), false),
    backSlice: obj.parseWavefront(fetchObj("player/LowPolySliceOfBread.obj"), false),
    cheese: playerIdleInfo["Cheese"],
    meat: playerIdleInfo["Meat"],
    tomato1: playerIdleInfo["Tomato"],
    tomato2: playerIdleInfo["Tomato.001"],
    tomato3: playerIdleInfo["Tomato.002"],
    tomato4: playerIdleInfo["Tomato.003"]
}

var weaponGeometry = {
    tomato: obj.parseWavefront(fetchObj("weapons/tomato.obj"), false),
    olive: obj.parseWavefront(fetchObj("weapons/olive.obj"), false),
    pickle: obj.parseWavefront(fetchObj("weapons/small_horizontal_cylinder.obj"), false),
    sausage: obj.parseWavefront(fetchObj("weapons/sausage.obj"), false),
    pan: obj.parseWavefront(fetchObj("weapons/fryingpan.obj"), false),
    anchovy: obj.parseWavefront(fetchObj("weapons/anchovy_terrible.obj"), false)
}

var platformGeometry = {
    basic: obj.parseWavefront(modelData.platforms.basic, false),
    crate: obj.parseWavefront(fetchObj("platforms/crate.obj"), false),
    pinetree: obj.parseWavefront(fetchObj("platforms/pinetree.obj"), false),
    doorTest: obj.parseWavefront(fetchObj("doorTest.obj"), false)
}

var ground = new Ground(obj.parseWavefront(fetchObj("grounds/plane.obj"), false))
var camera = new PhysicalObject(0, 0, 0, 0, 0, { mx: -.05, px: .05, my: -.05, py: .05, mz: -.05, pz: .05 }, [platforms, [ground]])
var player

// SERVER STUFF //

var ticks = 0;
function tick() {
    ticks++;
    if (player.position.y < -100) {
        /*var respawnPositionX = Math.random() * 10 - 5;
        var respawnPositionZ = Math.random() * 10 - 5;
        player.position.x = respawnPositionX;
        player.position.y = 0;
        player.position.z = respawnPositionZ;
        player.lastPosition.x = respawnPositionX;
        player.lastPosition.y = 0
        player.lastPosition.z = respawnPositionZ*/
        socket.emit("death", { type: "void", id: player.id, name: player.name });
    }
    let weaponData = []
    for (let i = 0; i < player.weapons.length; i++) {
        weaponData.push({
            id: player.weapons[i].id,
            type: player.weapons[i].type,
            position: player.weapons[i].position
        })
    }
    socket.emit("playerUpdate", { id: player.id, position: player.position, state: player.state, weaponData: weaponData });

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
        for (var i = 0; i < pingTests.length; i++) {
            sum += pingTests[i];
        }
        socket.emit("pingTestComplete", sum / pingTests.length)
    }
})*/

socket.on("startTicking", (TPS) => {
    setInterval(tick, 1000 / TPS);
    ticksPerSecond = TPS
})

socket.on("assignPlayer", (playerInfo) => {
    player = new Player(playerGeometry, playerInfo.position.x, playerInfo.position.y, playerInfo.position.z, 0, 0, playerInfo.health, playerInfo.id, playerInfo.name, [platforms, [ground]]);

    document.getElementById("nameField").value = player.name

    inventory = {
        currentSelection: 0,
        currentWeapon: new Weapon(weaponGeometry, "anchovy", [platforms, otherPlayers, [ground]], player),
    }
    updateHUD()
});

socket.on("map", (mapInfo) => {
    for (let i = 0; i < mapInfo.platforms.length; i++) {
        platforms.push(new Platform(platformGeometry,
            mapInfo.platforms[i].type,
            mapInfo.platforms[i].x,
            mapInfo.platforms[i].y,
            mapInfo.platforms[i].z,
            mapInfo.platforms[i].scale
        ))
    }

})

// receive necessary info about the other connected players upon joining
socket.on("otherPlayers", (otherPlayersInfo) => {
    for (var id in otherPlayersInfo) {
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
    }
})

socket.on("newPlayer", (player) => {
    displayChatMessage(player.name + " spawned in at x: " + player.position.x + ", y: " + player.position.y + ", z: " + player.position.z);
    otherPlayers[player.id] = new Player(playerGeometry, player.position.x, player.position.y, player.position.z, player.position.yaw, player.position.lean, player.health, player.id, player.name);
})

socket.on("newWeapon", (data) => {
    Weapon.nextId++
    console.log(data.id)
    /*otherWeapons[data.id] = new Weapon(weaponGeometry, data.type, [platforms, otherPlayers, [ground]], otherPlayers[data.ownerId])
    otherWeapons[data.id].shooted = true
    otherWeapons[data.id].position = data.position
    otherWeapons[data.id].velocity = data.velocity*/
})

socket.on("playerLeave", (id) => {
    displayChatMessage(otherPlayers[id].name + " left")
    otherPlayers[id].remove()
    otherPlayers[id] = null
})

socket.on("playerUpdate", (playersData) => {

    for (var id in playersData) {
        if (otherPlayers[id] == null) continue
        if (!playersData[id].respawnedThisTick) {
            otherPlayers[id].lastPosition = otherPlayers[id].serverPosition
            otherPlayers[id].lastState = otherPlayers[id].serverState
        } else {
            // if current player just respawned, set "last" variables to be equivalent to current
            otherPlayers[id].lastPosition = playersData[id].position
            otherPlayers[id].lastState = playersData[id].state
        }
        otherPlayers[id].serverPosition = playersData[id].position
        otherPlayers[id].serverState = playersData[id].state
        /*for (let i = 0; i < playersData[id].weaponData.length; i++) {
            playersData[id].weaponData[i]
        }*/
        break;
    }
})

var chatbox = document.getElementById("chatbox")
socket.on("chatMessage", (msg) => {
    console.log(msg)

    displayChatMessage(msg)
})

socket.on("nameChange", (data) => {
    if (otherPlayers[data.id] == undefined) return
    otherPlayers[data.id].name = data.newName
    otherPlayers[data.id].gamerTag.changeName(data.newName)

})

socket.on("respawn", (data) => {
    console.log("you respawn")
    player.lastPosition = data.position
    player.lastState = data.state
    player.position = data.position
    player.health = data.health
    player.state = data.state
})

socket.on("tooManyPlayers", () => {
    alert("Sorry, there are too many players connected.");
})

socket.emit("joinRoom", lobbyId)


// TESTING //

platforms.push(new Platform(platformGeometry, "doorTest", -10, 3, -20, 1))





// UPDATE LOOP //

function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;



    lastFramerates.splice(0, 0, 1000 / deltaTime)
    lastFramerates.splice(20)
    let rollingFramerate = 0
    for (let i = 0; i < lastFramerates.length; i++) rollingFramerate += lastFramerates[i] / lastFramerates.length
    info.innerHTML = Math.round(rollingFramerate) + "<br>polycount: " + webgl.points.length / 9 + "<br>client TPS: " + Math.round(1000 / averageClientTPS * 100) / 100




    player.updateAnimation()


    player.position.yaw = lookAngleY
    player.position.lean = lookAngleX
    player.updateWorldPosition(lookAngleY, lookAngleX) // this must go last


    // update other player positions

    let timeSinceLastTick = Date.now() - currentTickTime
    averageClientTPS = 0
    lastTickTimes.splice(10)
    for (let i = 0; i < lastTickTimes.length - 1; i++) averageClientTPS += (lastTickTimes[i] - lastTickTimes[i + 1]) / (lastTickTimes.length - 1)
    let currentTickStage = timeSinceLastTick / averageClientTPS / 1.15

    for (var id in otherPlayers) {
        if (otherPlayers[id] == null) continue
        otherPlayers[id].smoothPosition(currentTickStage)



        otherPlayers[id].updateWorldPosition(lookAngleY, lookAngleX);
    }



    if (inventory.currentWeapon != null) {
        inventory.currentWeapon.calculatePosition(deltaTime, socket) // weapon collision updates need to be sent to the server in calculatePosition method

        inventory.currentWeapon.updateWorldPosition()
    }
    for (var id in otherWeapons) if (otherWeapons[id] != null) otherWeapons[id].updateWorldPosition()


    camera.position.yaw = player.position.yaw
    camera.position.lean = player.position.lean

    webgl.renderFrame(player.position, camera);
    if (running) requestAnimationFrame(update)
}



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

    // -- Movement -- //

    if (!chatboxOpen) {
        let speed = 0;
        if (player.movementState == "walking") {
            speed = Player.walkingSpeed
            webgl.fov -= deltaTime * Player.fovShiftSpeed
            if (webgl.fov < Player.walkingFOV) webgl.fov = Player.walkingFOV
        }
        if (player.movementState == "crouching") {
            speed = Player.crouchingSpeed
            webgl.fov -= deltaTime * Player.fovShiftSpeed
            if (webgl.fov < Player.crouchingFOV) webgl.fov = Player.walkingFOV
        }
        if (player.movementState == "sprinting") {
            speed = Player.sprintingSpeed
            webgl.fov += deltaTime * Player.fovShiftSpeed
            if (webgl.fov > Player.sprintingFOV) webgl.fov = Player.sprintingFOV
        }
        if (player.movementState == "sliding") {
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

        if (w) {
            movementVector.x += speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
            movementVector.z += speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

            if (player.movementState != "sliding") player.state.walkCycle += walkAnimationSpeed
        }
        if (a) {
            movementVector.x -= speed * Math.cos(lookAngleY) * deltaTime
            movementVector.z -= speed * Math.sin(lookAngleY) * deltaTime
        }
        if (s) {
            movementVector.x -= speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
            movementVector.z -= speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

            player.state.walkCycle -= walkAnimationSpeed
        }
        if (d) {
            movementVector.x += speed * Math.cos(lookAngleY) * deltaTime
            movementVector.z += speed * Math.sin(lookAngleY) * deltaTime
        }
        if ((!w && !s) || player.movementState == "sliding") {
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
        if (shift && player.movementState == "walking") {
            player.movementState = "crouching"
            player.state.crouchValue += .015 * deltaTime
            if (player.state.crouchValue > 1) player.state.crouchValue = 1
        }
        else if (shift && (player.movementState == "crouching" || player.movementState == "sliding")) {
            player.state.crouchValue += .015 * deltaTime
            if (player.state.crouchValue > 1) player.state.crouchValue = 1
        }
        else if (!shift && player.movementState != "crouching") {
            player.state.crouchValue -= .015 * deltaTime
            if (player.state.crouchValue < 0) player.state.crouchValue = 0
        }
        else if (shift && player.movementState == "sprinting") {
            player.movementState = "sliding"
            player.slideCountdown = 1000
        }
        else if (!shift && (player.movementState == "crouching" || player.movementState == "sliding")) {
            player.movementState = "walking"
        }

        if (space) {
            //if (player.onGround) {
            player.velocity.y = Player.jumpForce
            jumpNoise.currentTime = 0.025
            jumpNoise.play()
            //}
        }

        if (leftClicking) {
            if (!inventory.currentWeapon.shooted && player.cooldownTimer <= 0) {
                player.currentCooldown = inventory.currentWeapon.shoot(lookAngleX, lookAngleY)
                socket.emit("newWeapon", {
                    id: inventory.currentWeapon.id,
                    ownerId: player.id,
                    type: inventory.currentWeapon.type,
                    position: inventory.currentWeapon.position,
                    velocity: inventory.currentWeapon.velocity
                })

                player.cooldownTimer = player.currentCooldown
                otherWeapons[inventory.currentWeapon.id] = inventory.currentWeapon


                inventory.currentWeapon = new Weapon(weaponGeometry, weaponSelectors[inventory.currentSelection].value, [platforms, otherPlayers, [ground]], player)
                //console.log()
                player.weapons.push(inventory.currentWeapon)
            }
        }


        // normalize movement vector //
        let hypotenuse = Math.sqrt(Math.pow(movementVector.x, 2) + Math.pow(movementVector.z, 2))
        if (hypotenuse > 0) {
            player.velocity.x = movementVector.x / hypotenuse * speed
            player.velocity.z = movementVector.z / hypotenuse * speed
            player.position.x += player.velocity.x * deltaTime
            player.position.z += player.velocity.z * deltaTime
        } else {
            player.velocity.x = 0
            player.velocity.z = 0
        }
            
    }


    player.calculatePosition(deltaTime)

    if (!player.lastOnGround && player.onGround && (player.position.y - player.lastPosition.y) < -.1) {
        splatNoise.currentTime = .1
        splatNoise.playbackRate = 1.5
        splatNoise.play()
    }


    player.lastPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
    player.lastOnGround = player.onGround




    for (var id in otherWeapons) {
        if (otherWeapons[id] == null) continue
        if (otherWeapons[id].shooted) {
            otherWeapons[id].calculatePosition(deltaTime, socket)

            if (Math.abs(otherWeapons[id].position.x) > 50 || Math.abs(otherWeapons[id].position.z) > 50) {
                otherWeapons[id].remove()
                otherWeapons[id] = null
            }
        }
    }



    // ingredient jiggle //


    // combat updates //
    player.cooldownTimer -= deltaTime / 1000
    if (player.cooldownTimer < 0) player.cooldownTimer = 0

}



// -- key pressing -- //

var keyBinds = {
    w: "KeyW",
    a: "KeyA",
    s: "KeyS",
    d: "KeyD",
    openChat: "KeyC"
}

var selectingWKey = false
var selectingAKey = false
var selectingSKey = false
var selectingDKey = false

function initKeyInput(preventDefault) {
    document.onkeydown = (event) => {
        if (preventDefault) event.preventDefault();

        
        if (selectingWKey) {
            keyBinds.w = event.code
            wKeyBind.value = event.code
        }
        if (selectingAKey) {
            keyBinds.a = event.code
            aKeyBind.value = event.code
        }
        if (selectingSKey) {
            keyBinds.s = event.code
            sKeyBind.value = event.code
        }
        if (selectingDKey) {
            keyBinds.d = event.code
            dKeyBind.value = event.code
        }

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
            left = true
            if (inventory.currentSelection - 1 >= 0) changeWeaponSelection(inventory.currentSelection - 1)
        }
        if (event.code == "ArrowRight") {
            right = true
            if (inventory.currentSelection + 1 < weaponSelectors.length) changeWeaponSelection(inventory.currentSelection + 1)
        }
        if (event.code == "ArrowUp") up = true
        if (event.code == "ArrowDown") down = true

        if (event.code == keyBinds.w) {
            w = true
            if (Date.now() - lastWPress < 250) {
                player.movementState = "sprinting"
            }
            if (!event.repeat) lastWPress = Date.now()
        }
        if (event.code == keyBinds.s) s = true
        if (event.code == keyBinds.a) a = true
        if (event.code == keyBinds.d) d = true

        if (event.code == "ShiftLeft") {

            shift = true
        }
        if (event.code == "Space") space = true

        if (chatboxOpen) {
            if (event.code == "Backspace") {
                chatboxInput.textContent = chatboxInput.textContent.slice(0, -1)
            }
            else if (event.code == "Enter") {
                socket.emit("sendChatMessage", player.name + ": " + chatboxInput.textContent)
                chatboxInput.textContent = ""
            }
            else if (event.code == "Escape") {
                closeChatbox()
            }
            else if (event.key.length == 1) chatboxInput.textContent += event.key
        }
        
        if (event.code == keyBinds.openChat) {
            openChatbox()
        }


    };

    document.onkeyup = (event) => {
        if (preventDefault) event.preventDefault();

        if (event.code == 37) left = false
        if (event.code == 39) right = false
        if (event.code == 38) up = false
        if (event.code == 40) down = false

        if (event.code == keyBinds.w) {
            w = false
            player.movementState = "walking"
        }
        if (event.code == keyBinds.s) s = false
        if (event.code == keyBinds.a) a = false
        if (event.code == keyBinds.d) d = false

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

    initKeyInput(false)
    running = false

    fixedUpdateThen = Date.now();
    clearInterval(fixedUpdateInterval)

    menu.style.display = ""
}


var lastPointerLockExited = Date.now()
document.addEventListener("pointerlockchange", function () {
    lastPointerLockExited = Date.now()
    if (document.pointerLockElement === canvas) {
        pointerLocked = true
    } else {
        pointerLocked = false
        if (!chatboxOpen) pauseGame()
    }

    
}, false)





var sensitivity = Math.PI / 1024;
document.addEventListener("mousemove", function (event) {
    if (pointerLocked) {
        lookAngleX += sensitivity * event.movementY
        lookAngleY += sensitivity * event.movementX

        if (lookAngleX < -Math.PI / 2) lookAngleX = -Math.PI / 2
        if (lookAngleX > Math.PI / 2) lookAngleX = Math.PI / 2

    }

}, false)


// -- menu -- //
startButton.onclick = () => {
    if ((Date.now() - lastPointerLockExited) < 1500) return

    console.log("starting")

    backgroundNoises.play()
    menu.style.display = "none"

    changeWeaponSelection(inventory.currentSelection)

    if (player.name != player.lastName) {
        player.gamerTag.changeName(player.name)
        player.lastName = player.name

        socket.emit("nameChange", {id: player.id, newName: player.name})
    }

    canvas.requestPointerLock()
    startGame()
}


document.getElementById("title").textContent = "Lobby " + lobbyId


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
}

var wKeyBind = document.getElementById("wSelector")
wKeyBind.value = keyBinds.w
wKeyBind.onmouseenter = () => {selectingWKey = true}
wKeyBind.onmouseleave = () => {selectingWKey = false}

var aKeyBind = document.getElementById("aSelector")
aKeyBind.value = keyBinds.a
aKeyBind.onmouseenter = () => {selectingAKey = true}
aKeyBind.onmouseleave = () => {selectingAKey = false}

var sKeyBind = document.getElementById("sSelector")
sKeyBind.value = keyBinds.s
sKeyBind.onmouseenter = () => {selectingSKey = true}
sKeyBind.onmouseleave = () => {selectingSKey = false}

var dKeyBind = document.getElementById("dSelector")
dKeyBind.value = keyBinds.d
dKeyBind.onmouseenter = () => {selectingDKey = true}
dKeyBind.onmouseleave = () => {selectingDKey = false}


document.addEventListener("mousedown", function (event) {
    if (running && event.which == 1) leftClicking = true
    if (running && event.which == 2) rightClicking = true

})

document.addEventListener("mouseup", function (event) {
    if (running && event.which == 1) leftClicking = false
    if (running && event.which == 2) rightClicking = false
})
