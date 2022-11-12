
//// ---- MAIN SCRIPT ---- ////
console.log("starting script")
import modelStuff from "./modules/model-data.js"

var modelData = modelStuff.modelData
var fetchObj = modelStuff.fetchObj
var obj = modelStuff.obj

import webglStuff from "./modules/webgl.js"

var webgl = webglStuff.webgl
var Poly = webglStuff.Poly
var Point = webglStuff.Point
var Line = webglStuff.Line
var Dot = webglStuff.Dot
var Model = webglStuff.Model
var Player = webglStuff.Player
var Weapon = webglStuff.Weapon
var Platform = webglStuff.Platform







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

// movement global variables //
var gravity = 0
var crouching = false
var onGround = true
var lastOnGround = true


var lookAngleX = 0.0
var lookAngleY = 0.0

// combat global variables //
var cooldownTimer = 0
var currentCooldown = 1



// misc global variables //
var lastFramerates = []
var lastYPositions = []
for (let i = 0; i < 200; i++) lastYPositions.push(0)
var breadY = 0
var cheeseY = 0
var meatY = 0
var tomatoY = 0

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
		frontSlice: playerIdleInfo["Bread"],
		backSlice: playerIdleInfo["Bread.001"],
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
    crate: obj.parseWavefront(fetchObj("platforms/crate.obj"), false)
}

var player;
//var enemy = new Player(playerGeometry, 10, 0, 0, angleY, angleX, "jeff")
var platform = new Platform(platformGeometry, "crate", 5, 0, -8)

var ticks = 0;
function tick() {
    ticks++;
    socket.emit("playerUpdate", { position: player.position, yaw: player.yaw, pitch: player.pitch, name: player.name } );
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

socket.on("assignPlayer", (player_) => {
    player = new Player(playerGeometry, player_.position.x, player_.position.y, player_.position.z, 0, 0, player_.name);
});

socket.on("otherPlayers", (otherPlayersInfo) => {
    for (var i = 0; i < otherPlayersInfo.length; i++) {
        otherPlayers.push(new Player(playerGeometry, otherPlayersInfo[i].position.x, otherPlayersInfo[i].position.y, otherPlayersInfo[i].position.z, otherPlayersInfo[i].yaw, otherPlayersInfo[i].pitch, otherPlayersInfo[i].name))
    }
})

socket.on("newPlayer", (player) => {
    console.log(player.name + " spawned in at x: " + player.position.x + ", y: " + player.position.y + ", z: " + player.position.z);
    otherPlayers.push(new Player(playerGeometry, player.position.x, player.position.y, player.position.z, player.yaw, player.pitch, player.name));
})

socket.on("playerLeave", (name) => {
    console.log("someone left")
    for (var i = 0; i < otherPlayers.length; i++) {
        if (otherPlayers[i].name == name) {
            otherPlayers[i].remove();
            otherPlayers.splice(i, 1);
        }
    }
})

socket.on("playerUpdate", (data) => {
    for (var i = 0; i < data.length; i++) {
        if (data[i].name != player.name) {
            for (var j = 0; j < otherPlayers.length; j++) {
                if (data[i].name == otherPlayers[j].name) {
                    otherPlayers[j].lastPosition = otherPlayers[j].serverPosition
                    otherPlayers[j].lastYaw = otherPlayers[j].serverYaw
                    otherPlayers[j].lastPitch = otherPlayers[j].serverPitch
                    otherPlayers[j].serverPosition = data[i].position;
                    otherPlayers[j].serverYaw = data[i].yaw;
                    otherPlayers[j].serverPitch = data[i].pitch;
                    //otherPlayers[j].updatePosition(); ** Moved this to update loop **
                    break;
                }
            }
        }
    }
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

{
    let groundPoint1 = new Point(50, -.01, 50, 0, 1, 0, 1, 1, 1, 0.0, 0.0)
    let groundPoint2 = new Point(-50, -.01, 50, 0, 1, 0, 1, 1, 1, 1.0, 0.0)
    let groundPoint3 = new Point(-50, -.01, -50, 0, 1, 0, 1, 1, 1, 1.0, 1.0)
    let groundPoint4 = new Point(-50, -.01, -50, 0, 1, 0, 1, 1, 1, 1.0, 1.0)
    let groundPoint5 = new Point(50, -.01, -50, 0, 1, 0, 1, 1, 1, 0.0, 1.0)
    let groundPoint6 = new Point(50, -.01, 50, 0, 1, 0, 1, 1, 1, 0.0, 0.0)
    

}

// 2D EFFECTS //
var ctx = effectsCanvas.getContext("2d")
ctx.fillStyle = "white"
var chOffset = 10
//ctx.fillRect(effectsCanvas.width / 2 - 1, effectsCanvas.height / 2 - 20, 2, 10)
//ctx.fillRect(effectsCanvas.width / 2 - 1, effectsCanvas.height / 2 + 10, 2, 10)
//ctx.fillRect(effectsCanvas.width / 2 - 20, effectsCanvas.height / 2 - 1, 10, 2)
//ctx.fillRect(effectsCanvas.width / 2 + 10, effectsCanvas.height / 2 + 1, 10, 2)



var inventory = {
    loadOut: ["anchovy", "olive", "pickle", "sausage"],
    weaponModels: [],
    currentSelection: 0,
    currentWeapon: null,
    


    initialize: function() {
        for (let i = 0; i < this.loadOut.length; i++) {
            //this.weaponModels.push(new Weapon(weaponGeometry, this.loadOut[i]))
        }

        //this.currentWeapon = this.weaponModels[this.currentSelection]
        this.currentWeapon = new Weapon(weaponGeometry, this.loadOut[0])
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


	player.yaw = lookAngleY
	player.pitch = lookAngleX
	player.updatePosition() // this must go last


    // update other player positions

    let timeSinceLastTick = Date.now() - currentTickTime
    averageClientTPS = 0
    lastTickTimes.splice(10)
    for (let i = 0; i < lastTickTimes.length - 1; i++) averageClientTPS += (lastTickTimes[i] - lastTickTimes[i+1]) / (lastTickTimes.length - 1)
    let currentTickStage = timeSinceLastTick / averageClientTPS / 1.15

    for (var i = 0; i < otherPlayers.length; i++) {

        let positionInterpolation = true

        if (positionInterpolation) {



            otherPlayers[i].position = {
                x: otherPlayers[i].serverPosition.x + (otherPlayers[i].serverPosition.x - otherPlayers[i].lastPosition.x) * currentTickStage,
                y: otherPlayers[i].serverPosition.y + (otherPlayers[i].serverPosition.y - otherPlayers[i].lastPosition.y) * currentTickStage,
                z: otherPlayers[i].serverPosition.z + (otherPlayers[i].serverPosition.z - otherPlayers[i].lastPosition.z) * currentTickStage
            }
    
            otherPlayers[i].yaw = otherPlayers[i].serverYaw + (otherPlayers[i].serverYaw - otherPlayers[i].lastYaw) * currentTickStage
            otherPlayers[i].pitch = otherPlayers[i].serverPitch + (otherPlayers[i].serverPitch - otherPlayers[i].lastPitch) * currentTickStage
            
            otherPlayers[i].pastPositions.splice(0, 0, otherPlayers[i].position)
            otherPlayers[i].pastPositions.splice(100)


            let smoothing = Math.round(50 + 50 * Math.pow(
                Math.pow(otherPlayers[i].pastPositions[0].x - otherPlayers[i].pastPositions[1].x, 2) + 
                Math.pow(otherPlayers[i].pastPositions[0].y - otherPlayers[i].pastPositions[1].y, 2) + 
                Math.pow(otherPlayers[i].pastPositions[0].z - otherPlayers[i].pastPositions[1].z, 2), .1
            ))

            smoothing = 10
            if (smoothing > otherPlayers[i].pastPositions.length) smoothing = otherPlayers[i].pastPositions.length

            //console.log(smoothing)
            let smoothedPosition = {
                x: 0,
                y: 0,
                z: 0
            }
            for (let j = 0; j < smoothing; j++) smoothedPosition = {
                x: smoothedPosition.x + otherPlayers[i].pastPositions[j].x / smoothing,
                y: smoothedPosition.y + otherPlayers[i].pastPositions[j].y / smoothing,
                z: smoothedPosition.z + otherPlayers[i].pastPositions[j].z / smoothing
            }

            if (smoothing > 0) otherPlayers[i].position = smoothedPosition


        }

        else {
            otherPlayers[i].position = {
                x: otherPlayers[i].serverPosition.x,
                y: otherPlayers[i].serverPosition.y,
                z: otherPlayers[i].serverPosition.z
            }
    
            otherPlayers[i].yaw = otherPlayers[i].serverYaw
            otherPlayers[i].pitch = otherPlayers[i].serverPitch

        }

        otherPlayers[i].updatePosition();
    }



    let distanceFromPlayer = 2 * (Math.cos(Math.PI * ((currentCooldown - cooldownTimer) / currentCooldown - 1)) + 1) / 2
    inventory.currentWeapon.model.scale = inventory.currentWeapon.scale * distanceFromPlayer / 2
    
    inventory.currentWeapon.position.x = player.position.x + Math.cos(player.yaw) * distanceFromPlayer
    inventory.currentWeapon.position.y = player.position.y + 1.5
    inventory.currentWeapon.position.z = player.position.z + Math.sin(player.yaw) * distanceFromPlayer
    inventory.currentWeapon.yaw = Date.now() / 1000 + player.yaw
    inventory.currentWeapon.updatePosition(deltaTime)

    for (let i = 0; i < otherWeapons.length; i++) {
        if (otherWeapons[i].shooted) {
            otherWeapons[i].yaw += deltaTime / 1000
            otherWeapons[i].updatePosition(deltaTime)
        }
    }

    webgl.renderFrame(player.position, lookAngleX, lookAngleY);
    if (running) requestAnimationFrame(update)
}



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

	// -- Movement -- //

    player.lastPosition = { x: player.position.x, y: player.position.y, z: player.position.z }

	let speed = .005;
	let walkAnimationSpeed = .001 / speed

	if (w) {
		player.position.x += speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
		player.position.z += speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

        if (player.animation.finished) {
            stepNoise.currentTime = 0.25
            stepNoise.volume = .05
            stepNoise.playbackRate = 1
            stepNoise.play()
            if (player.animation.currentMeshName == "idle") player.startAnimation("idle", "stepRightFoot", .1, true)
            else if (player.animation.currentMeshName == "stepRightFoot") player.startAnimation("stepRightFoot", "walkLeftFoot", walkAnimationSpeed, true)
            else if (player.animation.currentMeshName == "walkLeftFoot") player.startAnimation("walkLeftFoot", "stepRightFoot", walkAnimationSpeed, true)

        }
	}
	if (a) {
		player.position.x -= speed * Math.cos(lookAngleY) * deltaTime
		player.position.z -= speed * Math.sin(lookAngleY) * deltaTime
	}
	if (s) {
		player.position.x -= speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
		player.position.z -= speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime
        
        if (player.animation.finished) {
            stepNoise.currentTime = 0.2
            stepNoise.volume = .05
            stepNoise.playbackRate = 1.5
            stepNoise.play()
            if (player.animation.currentMeshName == "idle") player.startAnimation("idle", "stepRightFoot", .1, true)
            else if (player.animation.currentMeshName == "stepRightFoot") player.startAnimation("stepRightFoot", "walkLeftFoot", walkAnimationSpeed, true)
            else if (player.animation.currentMeshName == "walkLeftFoot") player.startAnimation("walkLeftFoot", "stepRightFoot", walkAnimationSpeed, true)
            
        }
	}
	if (d) {
		player.position.x += speed * Math.cos(lookAngleY) * deltaTime
		player.position.z += speed * Math.sin(lookAngleY) * deltaTime
	}
    if (!w && !s) {
        if (player.animation.finished) {
            if (player.animation.currentMeshName != "idle") player.startAnimation(player.animation.currentMeshName, "idle", .1, true)
        }
    }

	if (shift) crouching = true
	else crouching = false

	if (space) {
		if (onGround) {
            gravity = .0125
            jumpNoise.currentTime = 0.025
            jumpNoise.play()
        }
	}

    if (leftClicking) {
        if (!inventory.currentWeapon.shooted && cooldownTimer <= 0) {
              currentCooldown = inventory.currentWeapon.shoot(lookAngleX, lookAngleY)
              cooldownTimer = currentCooldown
              otherWeapons.push(inventory.currentWeapon)
              inventory.currentWeapon = new Weapon(weaponGeometry, "tomato")
        }
    }


	// gravity //
    
	player.position.y += gravity * deltaTime


	onGround = (player.position.y <= 0)
	if (onGround) {
		player.position.y = 0
		gravity = 0
	}
	else {
		gravity -= .00003 * deltaTime // subtract by gravitational constant (units/frames^2)
	}


    // collision //

    let movementFunctions = Platform.calculateSlopes(player.lastPosition, player.position)
    let collision = platform.calculateCollision(player.lastPosition, player.position, movementFunctions, gravity)

    player.position = collision.correctedPosition
    gravity = collision.gravity
    if (collision.onPlatform) onGround = true


    lastOnGround = onGround


	// ingredient jiggle //
	lastYPositions.splice(0, 0, player.position.y)
	lastYPositions.splice(200)

	let weight = .925

	breadY += gravity * deltaTime * .2
	breadY = (breadY * weight + Math.pow(lastYPositions[0], 1.2) * (1 - weight))

	tomatoY += gravity * deltaTime * .2
	tomatoY = (tomatoY * weight + Math.pow(lastYPositions[4], 1.2) * (1 - weight))

	cheeseY += gravity * deltaTime * .5
	cheeseY = (cheeseY * weight + Math.pow(lastYPositions[8], 1.2) * (1 - weight))

	meatY += gravity * deltaTime * .7
	meatY = (meatY * weight + Math.pow(lastYPositions[14], 1.2) * (1 - weight))


    // combat updates //
    cooldownTimer -= deltaTime / 1000
    if (cooldownTimer < 0) cooldownTimer = 0

}



// -- key pressing -- //

document.addEventListener('keydown', function(event) {
event.preventDefault();

if (event.keyCode == 37) left = true
if (event.keyCode == 39) right = true
if (event.keyCode == 38) up = true
if (event.keyCode == 40) down = true

if (event.keyCode == 87) w = true
if (event.keyCode == 83) s = true
if (event.keyCode == 65) a = true
if (event.keyCode == 68) d = true

if (event.keyCode == 16) {
    inventory.currentWeapon.model.delete()
    console.log("deleted")

	shift = true
}
if (event.keyCode == 32) space = true
});

document.addEventListener('keyup', function(event) {
event.preventDefault();

if (event.keyCode == 37) left = false
if (event.keyCode == 39) right = false
if (event.keyCode == 38) up = false
if (event.keyCode == 40) down = false

if (event.keyCode == 87) w = false
if (event.keyCode == 83) s = false
if (event.keyCode == 65) a = false
if (event.keyCode == 68) d = false

if (event.keyCode == 16) shift = false
if (event.keyCode == 32) space = false
});

// -- mouse -- //



document.addEventListener("pointerlockchange", function () {
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
