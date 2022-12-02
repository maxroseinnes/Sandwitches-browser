
//// ---- MAIN SCRIPT ---- ////
console.log("starting script")
import modelStuff from "./modules/model-data.js"

var modelData = modelStuff.modelData
var fetchObj = modelStuff.fetchObj
var obj = modelStuff.obj

import webglStuff from "./modules/webgl.js"

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

// movement global variables //


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
var socket = io();
var otherPlayers = {};
var otherWeapons = []

function convertOtherPlayersToArray() {
    var array = []
    for (var id in otherPlayers) {
        array.push(otherPlayers[id])
    }
    return array
}

// Local global variables //
var platforms = [];

// html elements //
const menu = document.getElementById("menu")
const startButton = document.getElementById("startButton")
const info = document.getElementById("info")
const canvas = document.getElementById("canvas")
const effectsCanvas = document.getElementById("effectsCanvas")


// helpful functions //

function lerp(a, b, x) {
    return a + (b - a) * x
}


// INITIALIZE WEBGL //


webgl.initialize()


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
    pinetree: obj.parseWavefront(fetchObj("platforms/pinetree.obj"), false)
}

var ground = new Ground(obj.parseWavefront(fetchObj("grounds/plane.obj"), false))

var camera = new PhysicalObject(0, 0, 0, 0, 0, { mx: -.05, px: .05, my: -.05, py: .05, mz: -.05, pz: .05 }, [platforms, [ground]])

var player

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
        socket.emit("death", { type: "void", name: player.name });
    }
    let weaponData = []
    for (let i = 0; i < Weapon.allWeapons.length; i++) weaponData.push({
        position: Weapon.allWeapons[i].position,
        type: Weapon.allWeapons[i].type
    })
    console.log(weaponData)
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

    inventory = {
        loadOut: ["anchovy", "olive", "pickle", "sausage", "tomato"],
        currentSelection: 0,
        currentWeapon: new Weapon(weaponGeometry, "anchovy", [platforms, convertOtherPlayersToArray(), [ground]], player),
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
    platforms.push(
        new Platform(platformGeometry, "basic", 10, 1, 16, 1),
        new Platform(platformGeometry, "basic", 10, 1, 10, 1),
        new Platform(platformGeometry, "basic", 15, 3.5, 5, 1),
        new Platform(platformGeometry, "basic", 19, 6, -5, 1),
        new Platform(platformGeometry, "basic", 26, 8.5, -9, 1),
        new Platform(platformGeometry, "basic", 25, 10, -15, 1),
        new Platform(platformGeometry, "basic", 19, 11.5, -10, 1),
        new Platform(platformGeometry, "basic", 13, 13.5, -2, 1),
        new Platform(platformGeometry, "basic", 10, 16, 5, 1),
        new Platform(platformGeometry, "basic", 5, 18.5, 10, 1),
        new Platform(platformGeometry, "basic", 2, 21, 8, 1),
        new Platform(platformGeometry, "basic", -5, 23.5, 5, 1)
    )

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
    console.log(player.name + " spawned in at x: " + player.position.x + ", y: " + player.position.y + ", z: " + player.position.z);
    otherPlayers[player.id] = new Player(playerGeometry, player.position.x, player.position.y, player.position.z, player.position.yaw, player.position.lean, player.health, player.id, player.name);
})

socket.on("playerLeave", (id) => {
    console.log(otherPlayers[id].name + " left")
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
        for (let i = 0; i < playersData[id].weaponData.length; i++) {
            playersData[id].weaponData[i]
        }
        break;
    }
})

socket.on("chatMessage", (msg) => {
    console.log(msg)
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


// AUDIO //

const backgroundNoises = new Audio("./assets/wet_wriggling_noises/dripping-water-nature-sounds-8050.mp3")
backgroundNoises.volume = .5
backgroundNoises.loop = true

const splatNoise = new Audio("./assets/wet_wriggling_noises/cartoon-splat-6086.mp3")
const jumpNoise = new Audio("./assets/wet_wriggling_noises/smb_jump-super.wav")
const stepNoise = new Audio("./assets/wet_wriggling_noises/slime-squish-14539.mp3")


// MAP ORGANIZATION //

var otherWeapons = []

var updateHUD = () => {
    let width = effectsCanvas.width
    let height = effectsCanvas.height
    let slotSize = 75
    ctx.clearRect(width - (inventory.loadOut.length + 1) * slotSize - 10, height - slotSize * 2 - 10, (inventory.loadOut.length) * slotSize + 20, slotSize * 2 + 20)
    ctx.fillStyle = "white"
    ctx.fillRect(width - (inventory.loadOut.length + 1) * slotSize - 10, height - slotSize * 2 - 10, (inventory.loadOut.length) * slotSize + 20, slotSize + 20)

    for (let i = 0; i < inventory.loadOut.length; i++) {
        if (inventory.loadOut[i] == "tomato") ctx.fillStyle = "red"
        if (inventory.loadOut[i] == "olive") ctx.fillStyle = "green"
        if (inventory.loadOut[i] == "pickle") ctx.fillStyle = "lightgreen"
        if (inventory.loadOut[i] == "sausage") ctx.fillStyle = "brown"
        if (inventory.loadOut[i] == "anchovy") ctx.fillStyle = "blue"

        ctx.fillRect(width - (inventory.loadOut.length + 1) * slotSize + i * slotSize, height - slotSize * 2, slotSize, slotSize)
    }

    ctx.fillStyle = "yellow"
    for (let i = 0; i < 5; i += .1) ctx.strokeRect(width - (inventory.loadOut.length + 1) * slotSize - i + inventory.currentSelection * slotSize, height - slotSize * 2 - i, slotSize + i * 2, slotSize + i * 2)
}

var changeWeaponSelection = (selection) => {
    inventory.currentSelection = selection
    inventory.currentWeapon.remove()

    inventory.currentWeapon = new Weapon(weaponGeometry, inventory.loadOut[selection], [platforms, convertOtherPlayersToArray(), [ground]], player)
    updateHUD()
}

// 2D EFFECTS //
var ctx = effectsCanvas.getContext("2d")
ctx.fillStyle = "white"
var chOffset = 10
//ctx.fillRect(effectsCanvas.width / 2 - 1, effectsCanvas.height / 2 - 20, 2, 10)
//ctx.fillRect(effectsCanvas.width / 2 - 1, effectsCanvas.height / 2 + 10, 2, 10)
//ctx.fillRect(effectsCanvas.width / 2 - 20, effectsCanvas.height / 2 - 1, 10, 2)
//ctx.fillRect(effectsCanvas.width / 2 + 10, effectsCanvas.height / 2 + 1, 10, 2)



var inventory


// TESTING //


var testMatrix = mat4.create()
mat4.translate(testMatrix, testMatrix, [.5, .6, .7])

var testAngle = Math.PI

var matrix = [
    1, 0, 0,
    0, Math.cos(testAngle), -Math.sin(testAngle),
    0, Math.sin(testAngle), Math.cos(testAngle),
]

console.log(matrix)

console.log(testMatrix)





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
    for (let i = 0; i < otherWeapons.length; i++) otherWeapons[i].updateWorldPosition()


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
        /*
                if (player.animation.finished) {
                    if (player.onGround) {
                        stepNoise.currentTime = 0.25
                        stepNoise.volume = .05
                        stepNoise.playbackRate = 1
                        stepNoise.play()
                    }
                    if (player.animation.currentMeshName == "idle") player.startAnimation("idle", "stepRightFoot", .1, true)
                    else if (player.animation.currentMeshName == "stepRightFoot") player.startAnimation("stepRightFoot", "walkLeftFoot", walkAnimationSpeed, true)
                    else if (player.animation.currentMeshName == "walkLeftFoot") player.startAnimation("walkLeftFoot", "stepRightFoot", walkAnimationSpeed, true)
        
                }*/
    }
    if (a) {
        movementVector.x -= speed * Math.cos(lookAngleY) * deltaTime
        movementVector.z -= speed * Math.sin(lookAngleY) * deltaTime
    }
    if (s) {
        movementVector.x -= speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
        movementVector.z -= speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

        player.state.walkCycle -= walkAnimationSpeed
        /*
        if (player.animation.finished) {
            if (player.onGround) {
                stepNoise.currentTime = 0.2
                stepNoise.volume = .05
                stepNoise.playbackRate = 1.5
                stepNoise.play()
            }
            if (player.animation.currentMeshName == "idle") player.startAnimation("idle", "stepRightFoot", .1, true)
            else if (player.animation.currentMeshName == "stepRightFoot") player.startAnimation("stepRightFoot", "walkLeftFoot", walkAnimationSpeed, true)
            else if (player.animation.currentMeshName == "walkLeftFoot") player.startAnimation("walkLeftFoot", "stepRightFoot", walkAnimationSpeed, true)
            
        }*/
    }
    if (d) {
        movementVector.x += speed * Math.cos(lookAngleY) * deltaTime
        movementVector.z += speed * Math.sin(lookAngleY) * deltaTime
    }
    if ((!w && !s) || player.movementState == "sliding") {
        let r = player.state.walkCycle % Math.PI
        if (r < Math.PI / 2) player.state.walkCycle = (player.state.walkCycle - r) + (r / (1 + deltaTime / 100))
        else player.state.walkCycle = (player.state.walkCycle + r) - (r / (1 + deltaTime / 100))


        /*if (player.animation.finished) {
            if (player.animation.currentMeshName != "idle") player.startAnimation(player.animation.currentMeshName, "idle", .1, true)
        }*/
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

            player.cooldownTimer = player.currentCooldown
            otherWeapons.push(inventory.currentWeapon)


            inventory.currentWeapon = new Weapon(weaponGeometry, inventory.loadOut[inventory.currentSelection], [platforms, convertOtherPlayersToArray(), [ground]], player)
            //console.log()
            player.weapons.push(inventory.currentWeapon)
        }
    }


    // normalize movement vector //
    let hypotenuse = Math.sqrt(Math.pow(movementVector.x, 2) + Math.pow(movementVector.z, 2) + Math.pow(movementVector.z, 2))
    if (hypotenuse > 0) {
        player.velocity.x = movementVector.x / hypotenuse * speed * deltaTime
        player.velocity.z = movementVector.z / hypotenuse * speed * deltaTime
        player.position.x += player.velocity.x
        player.position.z += player.velocity.z
    } else {
        player.velocity.x = 0
        player.velocity.z = 0
    }


    player.calculatePosition(deltaTime)

    if (!player.lastOnGround && player.onGround && (player.position.y - player.lastPosition.y) < -.1) {
        splatNoise.currentTime = .1
        splatNoise.playbackRate = 1.5
        splatNoise.play()
    }


    player.lastPosition = { x: player.position.x, y: player.position.y, z: player.position.z }
    player.lastOnGround = player.onGround




    for (let i = otherWeapons.length - 1; i >= 0; i--) {
        if (otherWeapons[i].shooted) {
            otherWeapons[i].calculatePosition(deltaTime, socket)

            if (Math.abs(otherWeapons[i].position.x) > 50 || Math.abs(otherWeapons[i].position.z) > 50) {
                otherWeapons[i].remove()
                otherWeapons.splice(i, 1)
            }
        }
    }



    // ingredient jiggle //


    // combat updates //
    player.cooldownTimer -= deltaTime / 1000
    if (player.cooldownTimer < 0) player.cooldownTimer = 0

}



// -- key pressing -- //

document.addEventListener('keydown', function (event) {
    event.preventDefault();

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
        if (inventory.currentSelection + 1 < inventory.loadOut.length) changeWeaponSelection(inventory.currentSelection + 1)
    }
    if (event.code == "ArrowUp") up = true
    if (event.code == "ArrowDown") down = true

    if (event.code == "KeyW") {
        w = true
        if (Date.now() - lastWPress < 250) {
            player.movementState = "sprinting"
        }
        if (!event.repeat) lastWPress = Date.now()
    }
    if (event.code == "KeyS") s = true
    if (event.code == "KeyA") a = true
    if (event.code == "KeyD") d = true

    if (event.code == "ShiftLeft") {

        shift = true
    }
    if (event.code == "Space") space = true
});

document.addEventListener('keyup', function (event) {
    event.preventDefault();

    if (event.code == 37) left = false
    if (event.code == 39) right = false
    if (event.code == 38) up = false
    if (event.code == 40) down = false

    if (event.code == "KeyW") {
        w = false
        player.movementState = "walking"
    }
    if (event.code == "KeyS") s = false
    if (event.code == "KeyA") a = false
    if (event.code == "KeyD") d = false

    if (event.code == "ShiftLeft") shift = false
    if (event.code == "Space") space = false
});

// -- mouse -- //


var lastPointerLockExited = Date.now()
document.addEventListener("pointerlockchange", function () {
    lastPointerLockExited = Date.now()
    if (document.pointerLockElement === canvas) {
        pointerLocked = true
        if (!running) {
            running = true
            update()
            fixedUpdateInterval = setInterval(fixedUpdate, 10) // set fixedUpdate to run 100 times/second
        }
    } else {
        console.log("stopped")

        pointerLocked = false
        running = false

        fixedUpdateThen = Date.now();
        clearInterval(fixedUpdateInterval)

        menu.style.display = ""
    }
}, false)





document.addEventListener("mousemove", function (event) {
    if (pointerLocked) {
        let sensitivity = .1
        sensitivity = Math.PI / 1024;
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


    canvas.requestPointerLock()
}


document.addEventListener("mousedown", function (event) {
    if (running && event.which == 1) leftClicking = true
    if (running && event.which == 2) rightClicking = true

})

document.addEventListener("mouseup", function (event) {
    if (running && event.which == 1) leftClicking = false
    if (running && event.which == 2) rightClicking = false
})
