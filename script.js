
//// ---- MAIN SCRIPT ---- ////

console.log("starting script")
import modelStuff from "./modules/model-data.js"

var modelData = modelStuff.modelData
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


var angleX = 0.0
var angleY = 0.0

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


// html elements //
const menu = document.getElementById("menu")
const startButton = document.getElementById("startButton")
const info = document.getElementById("info")
const canvas = document.getElementById("canvas")


// INITIALIZE WEBGL //


webgl.initialize()


var playerIdleInfo = obj.parseWavefront(modelData.player.idle, true)
var playerStepRightFootInfo = obj.parseWavefront(modelData.player.stepRightFoot, true)
var playerWalkLeftFootInfo = obj.parseWavefront(modelData.player.walkLeftFoot, true)
var playerWalkRightFootInfo = obj.parseWavefront(modelData.player.walkRightFoot, true)

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
    tomato: obj.parseWavefront(modelData.weapons.tomato, false)
}

var player = new Player(playerGeometry, 0, 0, 0, angleY, "steve")
//var enemy = new Player(playerGeometry, 10, 0, 0, angleY, "jeff")

var currentWeapon = new Weapon(weaponGeometry, "tomato")
var otherWeapons = []


let gridPointsMX = []
let gridPointsPX = []
let gridPointsMZ = []
let gridPointsPZ = []

let gridSize = 30;
let gridSpacing = 2;

for (let i = -gridSize; i < gridSize; i++) {
	gridPointsMX.push(new Point(i * gridSpacing, 0, -gridSpacing * gridSize, 0, 1, 0, .5, .5, .5))
	gridPointsPX.push(new Point(i * gridSpacing, 0,  gridSpacing * gridSize, 0, 1, 0, .5, .5, .5))
	gridPointsMZ.push(new Point(-gridSpacing * gridSize, 0, i * gridSpacing, 0, 1, 0, .5, .5, .5))
	gridPointsPZ.push(new Point( gridSpacing * gridSize, 0, i * gridSpacing, 0, 1, 0, .5, .5, .5))
}

let gridLinesX = []
let gridLinesZ = []

for (let i = 0; i < gridPointsMX.length; i++) {
	gridLinesX.push(new Line(gridPointsMX[i], gridPointsPX[i]))
	gridLinesZ.push(new Line(gridPointsMZ[i], gridPointsPZ[i]))
}

let squareRadius = gridSize * gridSpacing // not really radius but whatever
let groundR = .2
let groundG = .2
let groundB = .2
var groundPoly1 = new Poly(
    new Point(squareRadius, -.01, squareRadius, 0, 1, 0, groundR, groundG, groundB),
    new Point(-squareRadius, -.01, squareRadius, 0, 1, 0, groundR, groundG, groundB),
    new Point(-squareRadius, -.01, -squareRadius, 0, 1, 0, groundR, groundG, groundB)
)
var groundPoly2 = new Poly(
    new Point(-squareRadius, -.01, -squareRadius, 0, 1, 0, groundR, groundG, groundB),
    new Point(squareRadius, -.01, -squareRadius, 0, 1, 0, groundR, groundG, groundB),
    new Point(squareRadius, -.01, squareRadius, 0, 1, 0, groundR, groundG, groundB)
)

// TESTING //

var arr1 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
    [13, 14, 15]
]

var arr2 = []
arr2.push(arr1[0], arr1[3])
arr1.splice(1, 1)

console.log(getIndices(arr1, arr2))

function getIndices(arr1, arr2) {
    let indices = []
    
    for (let i = 0; i < arr2.length; i++) {
        indices.push(arr1.findIndex(element => element == arr2[i]))
    }

    return indices
}





function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;



	lastFramerates.splice(0, 0, 1000 / deltaTime)
	lastFramerates.splice(20)
	let totalFramerate = 0
	for (let i = 0; i < lastFramerates.length; i++) totalFramerate += lastFramerates[i]
	let rollingFramerate  = totalFramerate / lastFramerates.length
	info.innerHTML = Math.round(rollingFramerate)




	player.updateAnimation()



	player.angleY = angleY
	player.updatePosition() // this must go last

    let distanceFromPlayer = 2 * (Math.cos(Math.PI * ((currentCooldown - cooldownTimer) / currentCooldown - 1)) + 1) / 2
    currentWeapon.model.scale = currentWeapon.scale * distanceFromPlayer / 2
    
    currentWeapon.position.x = player.position.x + Math.cos(player.angleY) * distanceFromPlayer
    currentWeapon.position.y = player.position.y + 1
    currentWeapon.position.z = player.position.z + Math.sin(player.angleY) * distanceFromPlayer
    currentWeapon.angleY = Date.now() / 1000 + player.angleY
    currentWeapon.updatePosition(deltaTime)

    for (let i = 0; i < otherWeapons.length; i++) {
        if (otherWeapons[i].shooted) {
            otherWeapons[i].angleY += deltaTime / 1000
            otherWeapons[i].updatePosition(deltaTime)
        }
    }



    webgl.renderFrame(player.position, angleX, angleY);
    if (running) requestAnimationFrame(update)
}



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

	// -- Movement -- //

	let speed = .005;
	let walkAnimationSpeed = .001 / speed

	if (w) {
		player.position.x += speed * Math.cos(angleY - (Math.PI / 2)) * deltaTime
		player.position.z += speed * Math.sin(angleY - (Math.PI / 2)) * deltaTime

        if (player.animation.finished) {
            if (player.animation.currentMeshName == "idle") player.startAnimation("idle", "stepRightFoot", .1, true)
            else if (player.animation.currentMeshName == "stepRightFoot") player.startAnimation("stepRightFoot", "walkLeftFoot", walkAnimationSpeed, true)
            else if (player.animation.currentMeshName == "walkLeftFoot") player.startAnimation("walkLeftFoot", "stepRightFoot", walkAnimationSpeed, true)

        }
	}
	if (a) {
		player.position.x -= speed * Math.cos(angleY) * deltaTime
		player.position.z -= speed * Math.sin(angleY) * deltaTime
	}
	if (s) {
		player.position.x -= speed * Math.cos(angleY - (Math.PI / 2)) * deltaTime
		player.position.z -= speed * Math.sin(angleY - (Math.PI / 2)) * deltaTime
        
        if (player.animation.finished) {
            if (player.animation.currentMeshName == "idle") player.startAnimation("idle", "stepRightFoot", .1, true)
            else if (player.animation.currentMeshName == "stepRightFoot") player.startAnimation("stepRightFoot", "walkLeftFoot", walkAnimationSpeed, true)
            else if (player.animation.currentMeshName == "walkLeftFoot") player.startAnimation("walkLeftFoot", "stepRightFoot", walkAnimationSpeed, true)
            
        }
	}
	if (d) {
		player.position.x += speed * Math.cos(angleY) * deltaTime
		player.position.z += speed * Math.sin(angleY) * deltaTime
	}
    if (!w && !s) {
        if (player.animation.finished) {
            if (player.animation.currentMeshName != "idle") player.startAnimation(player.animation.currentMeshName, "idle", .1, true)
        }
    }

	if (shift) crouching = true
	else crouching = false

	if (space) {
		if (onGround) gravity = .01
	}

    if (leftClicking) {
        if (!currentWeapon.shooted && cooldownTimer <= 0) {
              currentCooldown = currentWeapon.shoot(angleX, angleY)
              cooldownTimer = currentCooldown
              otherWeapons.push(currentWeapon)
              currentWeapon = new Weapon(weaponGeometry, "tomato")
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
    currentWeapon.model.delete()
    console.log("deleted")

    let deletedPointIndices = []
    for (let i = 0; i < webgl.points.length/3; i++) {
        if (webgl.points[i*3] == null) deletedPointIndices.push(i)
    }

    deletedPointIndices.push(webgl.points.length)
    deletedPointIndices.sort()

    let deletedPointObjects = []

    for (let i = 0; i < deletedPointIndices.length; i++) {
        for (let j = 0; j < Point.allPoints.length; j++) {
            if (Point.allPoints[i].pointIndex == deletedPointIndices[i]) deletedPointObjects.push(i)
            if (deletedPointIndices[i] < Point.allPoints[i].pointIndex && Point.allPoints[i].pointIndex < deletedPointIndices[i+1]) {
                Point.allPoints[i].pointIndex -= i + 1
            }
        }
    }

    deletedPointIndices.reverse()
    for (let i = 0; i < deletedPointIndices.length; i++) {
        //webgl.points.splice(deletedPointIndices[i] * 3, 3)
    }

    let deletedPolyObjects = []

    for (let i = 0; i < Poly.allPolys.length; i++) {
        if (webgl.polys[Poly.allPolys[i].polyIndex * 3] == null) deletedPolyObjects.push(i)
        //else webgl.polys.splice(Poly.allPolys[i].polyIndex * 3, 3, Poly.allPolys[i].point1.pointIndex, Poly.allPolys[i].point2.pointIndex, Poly.allPolys[i].point3.pointIndex)
    }

    console.log(deletedPolyObjects)
    deletedPolyObjects.sort()
    deletedPolyObjects.reverse()
    for (let i = 0; i < deletedPolyObjects.length; i++) webgl.polys.splice(Poly.allPolys[i].pointIndex * 3, 3)
    for (let i = 0; i < deletedPolyObjects.length; i++) Poly.allPolys.splice(i, 1)


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
		angleX += sensitivity * event.movementY
		angleY += sensitivity * event.movementX

		if (angleX < -Math.PI / 2) angleX = -Math.PI / 2
		if (angleX > Math.PI / 2) angleX = Math.PI / 2

	}

}, false)


// -- menu -- //
startButton.onclick = () => {
	console.log("starting")

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
