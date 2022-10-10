
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

var pointerLocked = false

// movement global variables //
var gravity = 0
var crouching = false
var onGround = true

var playerPosition = {
    x: 0,
    y: 0,
    z: 0
}

var angleX = 0.0
var angleY = 0.0

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


let tomatoInfo = obj.parseWavefront(modelData.weapons.tomato)


var playerIdleInfo = obj.parseWavefront(modelData.player.idle)
var playerStepRightFootInfo = obj.parseWavefront(modelData.player.stepRightFoot)

console.log(playerIdleInfo)

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
	}
}

var frontSliceModel = new Model(playerGeometry.stepRightFoot.frontSlice, 1)
var backSliceModel = new Model(playerGeometry.stepRightFoot.backSlice, 1)
var cheeseModel = new Model(playerGeometry.stepRightFoot.cheese, 1)
var meatModel = new Model(playerGeometry.stepRightFoot.meat, 1)
var tomato1Model = new Model(playerGeometry.stepRightFoot.tomato1, 1)
var tomato2Model = new Model(playerGeometry.stepRightFoot.tomato2, 1)
var tomato3Model = new Model(playerGeometry.stepRightFoot.tomato3, 1)
var tomato4Model = new Model(playerGeometry.stepRightFoot.tomato4, 1)



let gridPointsMX = []
let gridPointsPX = []
let gridPointsMZ = []
let gridPointsPZ = []

let gridSize = 30;
let gridSpacing = 2;

for (let i = -gridSize; i < gridSize; i++) {
	gridPointsMX.push(new Point(i * gridSpacing, 0, -gridSpacing * gridSize, 1, 1, 1, 10, 10, 10))
	gridPointsPX.push(new Point(i * gridSpacing, 0,  gridSpacing * gridSize, 1, 1, 1, 10, 10, 10))
	gridPointsMZ.push(new Point(-gridSpacing * gridSize, 0, i * gridSpacing, 1, 1, 1, 10, 10, 10))
	gridPointsPZ.push(new Point( gridSpacing * gridSize, 0, i * gridSpacing, 1, 1, 1, 10, 10, 10))
}

let gridLinesX = []
let gridLinesZ = []

for (let i = 0; i < gridPointsMX.length; i++) {
	gridLinesX.push(new Line(gridPointsMX[i], gridPointsPX[i]))
	gridLinesZ.push(new Line(gridPointsMZ[i], gridPointsPZ[i]))
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






	frontSliceModel.setPosition(angleY, playerPosition.x, breadY, playerPosition.z)
	backSliceModel.setPosition(angleY, playerPosition.x, breadY, playerPosition.z)
	cheeseModel.setPosition(angleY, playerPosition.x, cheeseY, playerPosition.z)
	meatModel.setPosition(angleY, playerPosition.x, meatY, playerPosition.z)
	tomato1Model.setPosition(angleY, playerPosition.x, tomatoY, playerPosition.z)
	tomato2Model.setPosition(angleY, playerPosition.x, tomatoY, playerPosition.z)
	tomato3Model.setPosition(angleY, playerPosition.x, tomatoY, playerPosition.z)
	tomato4Model.setPosition(angleY, playerPosition.x, tomatoY, playerPosition.z)


	frontSliceModel.updateAnimation()
	backSliceModel.updateAnimation()
	cheeseModel.updateAnimation()
	meatModel.updateAnimation()
	tomato1Model.updateAnimation()
	tomato2Model.updateAnimation()
	tomato3Model.updateAnimation()
	tomato4Model.updateAnimation()





    webgl.renderFrame(playerPosition, angleX, angleY);
    if (running) requestAnimationFrame(update)
}



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

	//  -- Movement -- //

	let speed = .0025;
	let walkAnimationSpeed = .5

	if (w) {
		playerPosition.x += speed * Math.cos(angleY - (Math.PI / 2)) * deltaTime
		playerPosition.z += speed * Math.sin(angleY - (Math.PI / 2)) * deltaTime

	}
	if (a) {
		playerPosition.x -= speed * Math.cos(angleY) * deltaTime
		playerPosition.z -= speed * Math.sin(angleY) * deltaTime
	}
	if (s) {
		playerPosition.x -= speed * Math.cos(angleY - (Math.PI / 2)) * deltaTime
		playerPosition.z -= speed * Math.sin(angleY - (Math.PI / 2)) * deltaTime
	}
	if (d) {
		playerPosition.x += speed * Math.cos(angleY) * deltaTime
		playerPosition.z += speed * Math.sin(angleY) * deltaTime
	}

	if (shift) crouching = true
	else crouching = false

	if (space) {
		if (onGround) gravity = .01
	}


	// gravity //
	playerPosition.y += gravity * deltaTime


	onGround = (playerPosition.y <= 0)
	if (onGround) {
		playerPosition.y = 0
		gravity = 0
	}
	else {
		gravity -= .00003 * deltaTime // subtract by gravitational constant (units/frames^2)
	}

	// ingredient jiggle //
	lastYPositions.splice(0, 0, playerPosition.y)
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


