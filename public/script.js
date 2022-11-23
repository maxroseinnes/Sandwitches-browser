
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

var lastWRelease = Date.now()

// movement global variables //


var lookAngleX = 0.0
var lookAngleY = 0.0

// combat global variables //
var cooldownTimer = 0
var currentCooldown = 1



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
var otherPlayers = [];

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
var playerStepRightFootInfo = obj.parseWavefront(fetchObj("player/PlayerRightNubForward.obj"), true)
var playerWalkLeftFootInfo = obj.parseWavefront(fetchObj("player/PlayerLeftNubForwardRightNubBack.obj"), true)
var playerWalkRightFootInfo = obj.parseWavefront(fetchObj("player/PlayerRightNubForwardLeftNubBack.obj"), true)

var playerGeometry = {
	idle: {
		frontSlice: obj.parseWavefront(fetchObj("player/LowPolySliceOfBread.obj"), false),
		backSlice: obj.parseWavefront(fetchObj("player/LowPolySliceOfBread.obj"), false),
		cheese: playerIdleInfo["Cheese"],
		meat: playerIdleInfo["Meat"],
		tomato1: playerIdleInfo["Tomato"],
		tomato2: playerIdleInfo["Tomato.001"],
		tomato3: playerIdleInfo["Tomato.002"],
		tomato4: playerIdleInfo["Tomato.003"],
	},
	stepRightFoot: {
		frontSlice: playerStepRightFootInfo["Bread"],
		backSlice: playerStepRightFootInfo["Bread.001"],
		cheese: playerStepRightFootInfo["Cheese"],
		meat: playerStepRightFootInfo["Meat"],
		tomato1: playerStepRightFootInfo["Tomato"],
		tomato2: playerStepRightFootInfo["Tomato.001"],
		tomato3: playerStepRightFootInfo["Tomato.002"],
		tomato4: playerStepRightFootInfo["Tomato.003"],
	},
	walkLeftFoot: {
		frontSlice: playerWalkLeftFootInfo["Bread"],
		backSlice: playerWalkLeftFootInfo["Bread.001"],
		cheese: playerWalkLeftFootInfo["Cheese"],
		meat: playerWalkLeftFootInfo["Meat"],
		tomato1: playerWalkLeftFootInfo["Tomato"],
		tomato2: playerWalkLeftFootInfo["Tomato.001"],
		tomato3: playerWalkLeftFootInfo["Tomato.002"],
		tomato4: playerWalkLeftFootInfo["Tomato.003"],
	},
	walkRightFoot: {
		frontSlice: playerWalkRightFootInfo["Bread"],
		backSlice: playerWalkRightFootInfo["Bread.001"],
		cheese: playerWalkRightFootInfo["Cheese"],
		meat: playerWalkRightFootInfo["Meat"],
		tomato1: playerWalkRightFootInfo["Tomato"],
		tomato2: playerWalkRightFootInfo["Tomato.001"],
		tomato3: playerWalkRightFootInfo["Tomato.002"],
		tomato4: playerWalkRightFootInfo["Tomato.003"],
	}
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

var camera = new PhysicalObject(0, 0, 0, 0, 0, {mx: -.05, px: .05, my: -.05, py: .05, mz: -.05, pz: .05}, [platforms, [ground]])

var player

var ticks = 0;
function tick() {
    ticks++;
    console.log(player.position.y)
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
    socket.emit("playerUpdate", { position: player.position, name: player.name, state: player.state } );
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
    player = new Player(playerGeometry, playerInfo.position.x, playerInfo.position.y, playerInfo.position.z, 0, 0, playerInfo.health, playerInfo.name, [platforms, [ground]]);
    inventory = {
        loadOut: ["anchovy", "olive", "pickle", "sausage"],
        weaponModels: [],
        currentSelection: 0,
        currentWeapon: null,
        
    
    
        initialize: function() {
            for (let i = 0; i < this.loadOut.length; i++) {
                //this.weaponModels.push(new Weapon(weaponGeometry, this.loadOut[i]))
            }
    
            //this.currentWeapon = this.weaponModels[this.currentSelection]
            this.currentWeapon = new Weapon(weaponGeometry, this.loadOut[0], [platforms, otherPlayers, [ground]], player)
        },
    
        updateHUD: function() {
            let width = effectsCanvas.width
            let height = effectsCanvas.height
            ctx.clearRect(width - 400, height - 200, 400, 200)
            ctx.fillRect(width - 400, height - 200, 400, 100)
            
            for (let i = 0; i < this.loadOut.length; i++) {
                if (this.loadOut[i] == "tomato") ctx.fillStyle = "red"
                if (this.loadOut[i] == "olive") ctx.fillStyle = "green"
                if (this.loadOut[i] == "pickle") ctx.fillStyle = "lightgreen"
                if (this.loadOut[i] == "sausage") ctx.fillStyle = "brown"
    
                ctx.fillRect(width - 400 + i * 100, height - 200, 100, 100)
            }
        }
    }
    inventory.initialize()
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
        new Platform(platformGeometry, "basic", 10, 1,    16,  1),
        new Platform(platformGeometry, "basic", 10, 1,    10,  1),
        new Platform(platformGeometry, "basic", 15, 3.5,  5,   1),
        new Platform(platformGeometry, "basic", 19, 6,    -5,  1),
        new Platform(platformGeometry, "basic", 26, 8.5,  -9,  1),
        new Platform(platformGeometry, "basic", 25, 10,   -15, 1),
        new Platform(platformGeometry, "basic", 19, 11.5, -10, 1),
        new Platform(platformGeometry, "basic", 13, 13.5, -2,  1),
        new Platform(platformGeometry, "basic", 10, 16,   5,   1),
        new Platform(platformGeometry, "basic", 5,  18.5, 10,  1),
        new Platform(platformGeometry, "basic", 2,  21,   8,   1),
        new Platform(platformGeometry, "basic", -5, 23.5, 5,   1)
    )

})

// receive necessary info about the other connected players upon joining
socket.on("otherPlayers", (otherPlayersInfo) => {
    for (var i = 0; i < otherPlayersInfo.length; i++) {
        otherPlayers.push(new Player(
            playerGeometry, 
            otherPlayersInfo[i].position.x, 
            otherPlayersInfo[i].position.y, 
            otherPlayersInfo[i].position.z, 
            otherPlayersInfo[i].position.yaw, 
            otherPlayersInfo[i].position.lean, 
            otherPlayersInfo[i].health, 
            otherPlayersInfo[i].name))
    }
})

socket.on("newPlayer", (player) => {
    console.log(player.name + " spawned in at x: " + player.position.x + ", y: " + player.position.y + ", z: " + player.position.z);
    otherPlayers.push(new Player(playerGeometry, player.position.x, player.position.y, player.position.z, player.position.yaw, player.position.lean, player.health, player.name));
})

socket.on("playerLeave", (name) => {

    console.log(name + " left")
    for (var i = 0; i < otherPlayers.length; i++) {
        if (otherPlayers[i].name == name) {
            otherPlayers[i].remove();
            otherPlayers.splice(i, 1);
        }
    }
})

socket.on("playerUpdate", (playersData) => {
    for (var i = 0; i < playersData.length; i++) {
        if (playersData[i].name != player.name) {
            for (var j = 0; j < otherPlayers.length; j++) {
                if (playersData[i].name == otherPlayers[j].name) {
                    if (!playersData[i].respawnedThisTick) {
                        otherPlayers[j].lastPosition = otherPlayers[j].serverPosition
                        otherPlayers[j].lastState = otherPlayers[j].serverState
                    } else {
                        // if current player just respawned, set "last" variables to be equivalent to current
                        otherPlayers[j].lastPosition = playersData[j].position
                        otherPlayers[j].lastState = playersData[i].state
                    }
                    otherPlayers[j].serverPosition = playersData[i].position
                    otherPlayers[j].serverState = playersData[i].state
                    //otherPlayers[j].updateWorldPosition(); ** Moved this to update loop **
                    break;
                }
            }
        }
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
    players.health = data.health
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

{/*
    let groundPoint1 = new Point(50, -.01, 50, 0, 1, 0, 1, 1, 1, 0.0, 0.0)
    let groundPoint2 = new Point(-50, -.01, 50, 0, 1, 0, 1, 1, 1, 1.0, 0.0)
    let groundPoint3 = new Point(-50, -.01, -50, 0, 1, 0, 1, 1, 1, 1.0, 1.0)
    let groundPoint4 = new Point(-50, -.01, -50, 0, 1, 0, 1, 1, 1, 1.0, 1.0)
    let groundPoint5 = new Point(50, -.01, -50, 0, 1, 0, 1, 1, 1, 0.0, 1.0)
    let groundPoint6 = new Point(50, -.01, 50, 0, 1, 0, 1, 1, 1, 0.0, 0.0)
    
*/
}

// 2D EFFECTS //
var ctx = effectsCanvas.getContext("2d")
ctx.fillStyle = "white"
var chOffset = 10
//ctx.fillRect(effectsCanvas.width / 2 - 1, effectsCanvas.height / 2 - 20, 2, 10)
//ctx.fillRect(effectsCanvas.width / 2 - 1, effectsCanvas.height / 2 + 10, 2, 10)
//ctx.fillRect(effectsCanvas.width / 2 - 20, effectsCanvas.height / 2 - 1, 10, 2)
//ctx.fillRect(effectsCanvas.width / 2 + 10, effectsCanvas.height / 2 + 1, 10, 2)



var inventory /*= {
    loadOut: ["anchovy", "olive", "pickle", "sausage"],
    weaponModels: [],
    currentSelection: 0,
    currentWeapon: null,
    


    initialize: function() {
        for (let i = 0; i < this.loadOut.length; i++) {
            //this.weaponModels.push(new Weapon(weaponGeometry, this.loadOut[i]))
        }

        //this.currentWeapon = this.weaponModels[this.currentSelection]
        this.currentWeapon = new Weapon(weaponGeometry, this.loadOut[0], [platforms, otherPlayers, [ground]], undefined)
    },

    updateHUD: function() {
        let width = effectsCanvas.width
        let height = effectsCanvas.height
        ctx.clearRect(width - 400, height - 200, 400, 200)
        ctx.fillRect(width - 400, height - 200, 400, 100)
        
        for (let i = 0; i < this.loadOut.length; i++) {
            if (this.loadOut[i] == "tomato") ctx.fillStyle = "red"
            if (this.loadOut[i] == "olive") ctx.fillStyle = "green"
            if (this.loadOut[i] == "pickle") ctx.fillStyle = "lightgreen"
            if (this.loadOut[i] == "sausage") ctx.fillStyle = "brown"

            ctx.fillRect(width - 400 + i * 100, height - 200, 100, 100)
        }
    }
}*/

//inventory.initialize()
//inventory.updateHUD()


// TESTING //

/*
console.log(playerGeometry.idle.cheese)

//let testPositions = obj.parseWavefront(fetchObj("pinetree.obj")).positions
let testPositions = platformGeometry.crate.positions
let duplicates = []
for (let i = 0; i < testPositions.length; i++) {
    duplicates.push(0)
    for (let j = 0; j < testPositions.length; j++) {
        let isDuplicate = true
        for (let k = 0; k < testPositions[i].length; k++) if (i == j || testPositions[i][k] != testPositions[j][k]) isDuplicate = false
        if (isDuplicate) duplicates[i] = testPositions[i]
    }
    console.log(duplicates[i])
}
console.log(duplicates)
*/

console.log(weaponGeometry.tomato.indices.length)






// UPDATE LOOP //

function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;



	lastFramerates.splice(0, 0, 1000 / deltaTime)
	lastFramerates.splice(20)
	let rollingFramerate = 0
	for (let i = 0; i < lastFramerates.length; i++) rollingFramerate += lastFramerates[i] / lastFramerates.length
	info.innerHTML = Math.round(rollingFramerate) + "<br>polycount: " + webgl.points.length / 9 + "<br>client TPS: " + Math.round(1000/averageClientTPS * 100) / 100




	player.updateAnimation()


	player.position.yaw = lookAngleY
	player.position.lean = lookAngleX
	player.updateWorldPosition(lookAngleY) // this must go last


    // update other player positions

    let timeSinceLastTick = Date.now() - currentTickTime
    averageClientTPS = 0
    lastTickTimes.splice(10)
    for (let i = 0; i < lastTickTimes.length - 1; i++) averageClientTPS += (lastTickTimes[i] - lastTickTimes[i+1]) / (lastTickTimes.length - 1)
    let currentTickStage = timeSinceLastTick / averageClientTPS / 1.15

    for (var i = 0; i < otherPlayers.length; i++) {

        otherPlayers[i].position = {
            x: otherPlayers[i].serverPosition.x + (otherPlayers[i].serverPosition.x - otherPlayers[i].lastPosition.x) * currentTickStage,
            y: otherPlayers[i].serverPosition.y + (otherPlayers[i].serverPosition.y - otherPlayers[i].lastPosition.y) * currentTickStage,
            z: otherPlayers[i].serverPosition.z + (otherPlayers[i].serverPosition.z - otherPlayers[i].lastPosition.z) * currentTickStage,
            yaw: otherPlayers[i].serverPosition.yaw + (otherPlayers[i].serverPosition.yaw - otherPlayers[i].lastPosition.yaw) * currentTickStage,
            lean: otherPlayers[i].serverPosition.lean + (otherPlayers[i].serverPosition.lean - otherPlayers[i].lastPosition.lean) * currentTickStage
        }

        otherPlayers[i].state = {
            walkCycle: otherPlayers[i].serverState.walkCycle + (otherPlayers[i].serverState.walkCycle - otherPlayers[i].lastState.walkCycle) * currentTickStage,
            crouchValue: otherPlayers[i].serverState.crouchValue + (otherPlayers[i].serverState.crouchValue - otherPlayers[i].lastState.crouchValue) * currentTickStage,
            slideValue: otherPlayers[i].serverState.slideValue + (otherPlayers[i].serverState.slideValue - otherPlayers[i].lastState.slideValue) * currentTickStage
        }
        
        otherPlayers[i].pastPositions.splice(0, 0, otherPlayers[i].position)
        otherPlayers[i].pastPositions.splice(100)

        otherPlayers[i].pastStates.splice(0, 0, otherPlayers[i].state)
        otherPlayers[i].pastStates.splice(100)

        let smoothing = 5
        if (smoothing > otherPlayers[i].pastPositions.length) smoothing = otherPlayers[i].pastPositions.length

        //console.log(smoothing)
        let smoothedPosition = {
            x: 0,
            y: 0,
            z: 0,
            yaw: 0,
            lean: 0
        }
        let smoothedState = {
            walkCycle: 0,
            crouchValue: 0,
            slideValue: 0
        }
        for (let j = 0; j < smoothing; j++) {
            smoothedPosition.x += otherPlayers[i].pastPositions[j].x / smoothing,
            smoothedPosition.y += otherPlayers[i].pastPositions[j].y / smoothing,
            smoothedPosition.z += otherPlayers[i].pastPositions[j].z / smoothing,
            smoothedPosition.yaw += otherPlayers[i].pastPositions[j].yaw / smoothing,
            smoothedPosition.lean += otherPlayers[i].pastPositions[j].lean / smoothing

            smoothedState.walkCycle += otherPlayers[i].pastStates[j].walkCycle / smoothing
            smoothedState.crouchValue += otherPlayers[i].pastStates[j].crouchValue / smoothing
            smoothedState.slideValue += otherPlayers[i].pastStates[j].slideValue / smoothing
        }

        if (smoothing > 0) {
            otherPlayers[i].position = smoothedPosition
            otherPlayers[i].state = smoothedState
        }



        otherPlayers[i].updateWorldPosition(lookAngleY);
    }


    let distanceFromPlayer = 2 * (Math.cos(Math.PI * ((currentCooldown - cooldownTimer) / currentCooldown - 1)) + 1) / 2
    //let distanceFromPlayer = 2

    if (inventory.currentWeapon != null) {
        inventory.currentWeapon.models.main.scale = inventory.currentWeapon.scale * distanceFromPlayer / 2
    
        inventory.currentWeapon.position.x = player.position.x + Math.cos(player.position.yaw) * 2//distanceFromPlayer
        inventory.currentWeapon.position.y = player.position.y + 1.5
        inventory.currentWeapon.position.z = player.position.z + Math.sin(player.position.yaw) * 2//distanceFromPlayer
        inventory.currentWeapon.position.yaw = Date.now() / 1000 + player.position.yaw
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

	let speed = .0075;
    if (player.movementState == "walking") speed = .0075
    if (player.movementState == "crouching") speed = .0025
    if (player.movementState == "sprinting") speed = .015
    if (player.movementState == "sliding") speed = .01
	let walkAnimationSpeed = 2.25 * deltaTime * speed

	if (w) {
		player.position.x += speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
		player.position.z += speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

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
		player.position.x -= speed * Math.cos(lookAngleY) * deltaTime
		player.position.z -= speed * Math.sin(lookAngleY) * deltaTime
	}
	if (s) {
		player.position.x -= speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
		player.position.z -= speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

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
		player.position.x += speed * Math.cos(lookAngleY) * deltaTime
		player.position.z += speed * Math.sin(lookAngleY) * deltaTime
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
	else if (!shift && (player.movementState == "crouching" || player.movementState == "sliding")) player.movementState = "walking"

	if (space) {
		if (player.onGround) {
            player.gravity = .015
            jumpNoise.currentTime = 0.025
            jumpNoise.play()
        }
	}

    if (leftClicking) {
        if (!inventory.currentWeapon.shooted && cooldownTimer <= 0) {
              currentCooldown = inventory.currentWeapon.shoot(lookAngleX, lookAngleY)
              cooldownTimer = currentCooldown
              console.log(inventory.currentWeapon)
              otherWeapons.push(inventory.currentWeapon)
              inventory.currentWeapon = new Weapon(weaponGeometry, "tomato", [platforms, otherPlayers, [ground]], player)
              //console.log()
              player.weapons.push(inventory.currentWeapon)
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




    for (let i = otherWeapons.length - 1; i >= 0; i--) {
        if (otherWeapons[i].shooted) {
            otherWeapons[i].position.yaw += deltaTime / 1000
            otherWeapons[i].calculatePosition(deltaTime, socket)

            if (Math.abs(otherWeapons[i].position.x) > 50 || Math.abs(otherWeapons[i].position.z) > 50) {
                otherWeapons[i].remove()
                otherWeapons.splice(i, 1)
            }
        }
    }



	// ingredient jiggle //


    // combat updates //
    cooldownTimer -= deltaTime / 1000
    if (cooldownTimer < 0) cooldownTimer = 0

}



// -- key pressing -- //

document.addEventListener('keydown', function(event) {
event.preventDefault();

if (event.code == 37) left = true
if (event.code == 39) right = true
if (event.code == 38) up = true
if (event.code == 40) down = true

if (event.code == "KeyW") {
    w = true
    if (Date.now() - lastWRelease < 125) {
        player.movementState = "sprinting"
    }
}
if (event.code == "KeyS") s = true
if (event.code == "KeyA") a = true
if (event.code == "KeyD") d = true

if (event.code == "ShiftLeft") {
    inventory.currentWeapon.remove()

	shift = true
}
if (event.code == "Space") space = true
});

document.addEventListener('keyup', function(event) {
event.preventDefault();

if (event.code == 37) left = false
if (event.code == 39) right = false
if (event.code == 38) up = false
if (event.code == 40) down = false

if (event.code == "KeyW") {
    w = false
    player.movementState = "walking"
    lastWRelease = Date.now()
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
		sensitivity = Math.PI / 512;
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


document.addEventListener("mousedown", function(event) {
    if (running && event.which == 1) leftClicking = true
    if (running && event.which == 2) rightClicking = true

})

document.addEventListener("mouseup", function(event) {
    if (running && event.which == 1) leftClicking = false
    if (running && event.which == 2) rightClicking = false
})
