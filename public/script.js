
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
var platforms = [];
var camera = new PhysicalObject(0, 0, 0, 0, 0, {mx: -.05, px: .05, my: -.05, py: .05, mz: -.05, pz: .05}, [platforms])

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
    crate: obj.parseWavefront(fetchObj("platforms/crate.obj"), false),
    pinetree: obj.parseWavefront(fetchObj("platforms/pinetree.obj"), false)
}

var player;
//var enemy = new Player(playerGeometry, 10, 0, 0, angleY, angleX, "jeff")

var ticks = 0;
function tick() {
    ticks++;
    socket.emit("playerUpdate", { position: player.position, name: player.name } );
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
    player = new Player(playerGeometry, player_.position.x, player_.position.y, player_.position.z, 0, 0, player_.name, [platforms]);
});

socket.on("map", (mapInfo) => {
    platforms.push(
        new Platform(platformGeometry, "crate", 0, -128, 0, 8)
    )

})

socket.on("otherPlayers", (otherPlayersInfo) => {
    for (var i = 0; i < otherPlayersInfo.length; i++) {
        otherPlayers.push(new Player(playerGeometry, otherPlayersInfo[i].position.x, otherPlayersInfo[i].position.y, otherPlayersInfo[i].position.z, otherPlayersInfo[i].position.yaw, otherPlayersInfo[i].position.pitch, otherPlayersInfo[i].name))
    }
})

socket.on("newPlayer", (player) => {
    console.log(player.name + " spawned in at x: " + player.position.x + ", y: " + player.position.y + ", z: " + player.position.z);
    otherPlayers.push(new Player(playerGeometry, player.position.x, player.position.y, player.position.z, player.position.yaw, player.position.pitch, player.name));
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
                    otherPlayers[j].serverPosition = data[i].position;
                    //otherPlayers[j].updateWorldPosition(); ** Moved this to update loop **
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
        this.currentWeapon = new Weapon(weaponGeometry, this.loadOut[0], [platforms, otherPlayers])
        this.currentWeapon.remove()
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


// MAP EDITOR STUFF //

var editorInterface = document.createElement("div")
editorInterface.style = `
    position: fixed;
    right: 0px;
    top: 0px;
    height: 100%;
    width: 300px;

    z-index: 500;

    background-color: rgb(25, 25, 25);

    overflow-y: auto;


`


document.body.appendChild(editorInterface)

var mapObjects = []

var addMapObjectButton = document.createElement("button")
addMapObjectButton.style = `
    margin: 10px;
    padding: 10px;
    font-size: 15px;
`
addMapObjectButton.textContent = "Add Thing"

editorInterface.appendChild(addMapObjectButton)

addMapObjectButton.onclick = () => {
    mapObjects.push(new MapObject(0, 0, 0, 0, 0, "crate", 1))
}


var mapObjectsWrapper = document.createElement("div")
editorInterface.appendChild(mapObjectsWrapper)

var exportWrapper = document.createElement("div")
exportWrapper.style.margin = "10px"
editorInterface.appendChild(exportWrapper)

var mapNameInputLabel = document.createElement("span")
mapNameInputLabel.style.color = "white"
mapNameInputLabel.innerHTML = "<br>Map Name: "
exportWrapper.appendChild(mapNameInputLabel)


var mapNameInput = document.createElement("input")
mapNameInput.type = "text"
exportWrapper.appendChild(mapNameInput)

var downloadFileButton = document.createElement("button")
downloadFileButton.style = `
    margin-top: 10px;
    padding: 10px;
    font-size: 15px;
`
downloadFileButton.textContent = "Download JSON"
exportWrapper.appendChild(downloadFileButton)
downloadFileButton.onclick = () => {
    let mapData = {
        platforms: []
    }

    for (let i = 0; i < mapObjects.length; i++) {
        mapData.platforms.push({
            type: mapObjects[i].type,
            x: mapObjects[i].x,
            y: mapObjects[i].y,
            z: mapObjects[i].z,
            yaw: mapObjects[i].yaw,
            pitch: mapObjects[i].pitch,
            scale: mapObjects[i].scale
        })
    }

    let blob = new Blob([JSON.stringify(mapData, "\t")], {type: "application/json"})
    let url = URL.createObjectURL(blob)

    let a = document.createElement("a")
    a.href = url
    a.download = mapNameInput.value + ".json"
    a.click()
    window.setTimeout(() => {URL.revokeObjectURL(url)}, 0)

}



class MapObject {
    constructor(x, y, z, yaw, pitch, type, scale) {
        this.x = x
        this.y = y
        this.z = z
        this.yaw = yaw
        this.pitch = pitch
        this.type = type
        this.scale = scale

        this.wrapper = document.createElement("div")
        this.wrapper.style.padding = "15px"
        this.wrapper.style.margin = "10px"
        this.wrapper.style.backgroundColor = "rgba(255, 255, 255, .75)"
        this.wrapper.style.borderRadius = "10px"
        this.wrapper.style.overflowY = "hidden"
        this.wrapper.style.height = "200px"
        this.wrapper.style.transition = "height .25s"
        
        mapObjectsWrapper.appendChild(this.wrapper)

        this.collapseButton = document.createElement("button")
        this.collapseButton.style.float = "right"
        this.collapseButton.style.backgroundColor = "transparent"
        this.collapseButton.style.fontSize = "20px"
        this.collapseButton.style.borderStyle = "none"
        this.collapseButton.style.cursor = "pointer"
        this.collapseButton.style.transition = "transform .25s"
        this.collapseButton.innerHTML = "&#8964;"
        this.wrapper.appendChild(this.collapseButton)
        this.collapsed = false
        this.collapseButton.onclick = () => {
            if (!this.collapsed) {
                this.wrapper.style.height = "25px"
                this.collapseButton.style.transform = "rotate(-90deg)"
                this.collapsed = true
            }
            else {
                this.wrapper.style.height = "200px"
                this.collapseButton.style.transform = "rotate(0deg)"
                this.collapsed = false
            }
        }

        this.typeSelector = document.createElement("select")
        this.typeSelector.style.padding = "5px"
        this.typeSelector.style.marginBottom = "5px"
        this.typeSelector.style.backgroundColor = "rgba(255, 255, 255, .5)"
        this.typeSelector.style.borderRadius = "5px"
        this.typeSelector.style.borderStyle = "none"
        this.typeSelector.innerHTML = `
            <option value = "crate">crate</option>
            <option value = "basic">basic</option>
            <option value = "pinetree">tree</option>
        `
        this.wrapper.appendChild(this.typeSelector)
        this.typeSelector.onchange = () => {
            this.type = this.typeSelector.value
            this.setType()
        }
        

        this.xLabel = document.createElement("span")
        this.xLabel.innerHTML = "<br>x: "
        this.wrapper.appendChild(this.xLabel)
        this.xInput = document.createElement("input")
        this.xInput.style.padding = "5px"
        this.xInput.style.margin = "5px"
        this.xInput.style.backgroundColor = "rgba(255, 255, 255, .5)"
        this.xInput.style.borderRadius = "5px"
        this.xInput.style.borderStyle = "none"
        this.xInput.type = "number"
        this.xInput.value = "0"
        this.xInput.step = ".1"
        this.wrapper.appendChild(this.xInput)
        this.xInput.onchange = () => {
            this.x = Number(this.xInput.value)
            this.setPosition()
        }

        this.yLabel = document.createElement("span")
        this.yLabel.innerHTML = "<br>y: "
        this.wrapper.appendChild(this.yLabel)
        this.yInput = document.createElement("input")
        this.yInput.style.padding = "5px"
        this.yInput.style.margin = "5px"
        this.yInput.style.backgroundColor = "rgba(255, 255, 255, .5)"
        this.yInput.style.borderRadius = "5px"
        this.yInput.style.borderStyle = "none"
        this.yInput.type = "number"
        this.yInput.value = "0"
        this.yInput.step = ".1"
        this.wrapper.appendChild(this.yInput)
        this.yInput.onchange = () => {
            this.y = Number(this.yInput.value)
            this.setType()
        }

        this.zLabel = document.createElement("span")
        this.zLabel.innerHTML = "<br>z: "
        this.wrapper.appendChild(this.zLabel)
        this.zInput = document.createElement("input")
        this.zInput.style.padding = "5px"
        this.zInput.style.margin = "5px"
        this.zInput.style.backgroundColor = "rgba(255, 255, 255, .5)"
        this.zInput.style.borderRadius = "5px"
        this.zInput.style.borderStyle = "none"
        this.zInput.type = "number"
        this.zInput.value = "0"
        this.zInput.step = ".1"
        this.wrapper.appendChild(this.zInput)
        this.zInput.onchange = () => {
            this.z = Number(this.zInput.value)
            this.setType()
        }

        this.scaleLabel = document.createElement("span")
        this.scaleLabel.innerHTML = "<br>scale: "
        this.wrapper.appendChild(this.scaleLabel)
        this.scaleInput = document.createElement("input")
        this.scaleInput.style.padding = "5px"
        this.scaleInput.style.margin = "5px"
        this.scaleInput.style.backgroundColor = "rgba(255, 255, 255, .5)"
        this.scaleInput.style.borderRadius = "5px"
        this.scaleInput.style.borderStyle = "none"
        this.scaleInput.type = "number"
        this.scaleInput.value = "1"
        this.scaleInput.step = ".1"
        this.wrapper.appendChild(this.scaleInput)
        this.scaleInput.onchange = () => {
            this.scale = Number(this.scaleInput.value)
            this.setType()
        }

        this.setType()


    }

    setType() {
        if (this.object != null) {
            this.object.remove()
            platforms.splice(platforms.indexOf(this.object), 1)
            delete this.object
        }
        
        this.object = new Platform(platformGeometry, this.type, this.x, this.y, this.z, this.scale)
        platforms.push(this.object)

        //this.object.models.main.setPosition(0, 0, 1, 0 + this.object.dimensions.py / 2, 2, platformGeometry[this.type], platformGeometry[this.type], 1)
    }

    setPosition() {
        this.object.position = {
            x: this.x,
            y: this.y,
            z: this.z,
            yaw: this.yaw,
            pitch: this.pitch
        }

        this.object.models.main.scale = this.scale
        this.object.models.main.setPosition(this.yaw, this.pitch, this.x, this.y + this.object.dimensions.py / 2, this.z, platformGeometry[this.type], platformGeometry[this.type], 1)
    }

    delete() {
        if (this.object != null) this.object.remove()
    }


}






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
	player.position.pitch = lookAngleX
	player.updateWorldPosition() // this must go last


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
    
            otherPlayers[i].position.yaw = otherPlayers[i].serverPosition.yaw + (otherPlayers[i].serverPosition.yaw - otherPlayers[i].lastPosition.yaw) * currentTickStage
            otherPlayers[i].position.pitch = otherPlayers[i].serverPosition.pitch + (otherPlayers[i].serverPosition.pitch - otherPlayers[i].lastPosition.pitch) * currentTickStage
            
            otherPlayers[i].pastPositions.splice(0, 0, otherPlayers[i].position)
            otherPlayers[i].pastPositions.splice(100)


            let smoothing = Math.round(50 + 50 * Math.pow(
                Math.pow(otherPlayers[i].pastPositions[0].x - otherPlayers[i].pastPositions[1].x, 2) + 
                Math.pow(otherPlayers[i].pastPositions[0].y - otherPlayers[i].pastPositions[1].y, 2) + 
                Math.pow(otherPlayers[i].pastPositions[0].z - otherPlayers[i].pastPositions[1].z, 2), .1
            ))

            smoothing = 5
            if (smoothing > otherPlayers[i].pastPositions.length) smoothing = otherPlayers[i].pastPositions.length

            //console.log(smoothing)
            let smoothedPosition = {
                x: 0,
                y: 0,
                z: 0,
                yaw: 0,
                pitch: 0
            }
            for (let j = 0; j < smoothing; j++) smoothedPosition = {
                x: smoothedPosition.x + otherPlayers[i].pastPositions[j].x / smoothing,
                y: smoothedPosition.y + otherPlayers[i].pastPositions[j].y / smoothing,
                z: smoothedPosition.z + otherPlayers[i].pastPositions[j].z / smoothing,
                yaw: smoothedPosition.yaw + otherPlayers[i].pastPositions[j].yaw / smoothing,
                pitch: smoothedPosition.pitch + otherPlayers[i].pastPositions[j].pitch / smoothing
            }

            if (smoothing > 0) otherPlayers[i].position = smoothedPosition


        }

        else {
            otherPlayers[i].position = {
                x: otherPlayers[i].serverPosition.x,
                y: otherPlayers[i].serverPosition.y,
                z: otherPlayers[i].serverPosition.z
            }
    
            otherPlayers[i].position.yaw = otherPlayers[i].serverPosition.yaw
            otherPlayers[i].position.pitch = otherPlayers[i].serverPosition.pitch

        }

        otherPlayers[i].updateWorldPosition();
    }


    let distanceFromPlayer = 2 * (Math.cos(Math.PI * ((currentCooldown - cooldownTimer) / currentCooldown - 1)) + 1) / 2
    //let distanceFromPlayer = 2

    inventory.currentWeapon.models.main.scale = inventory.currentWeapon.scale * distanceFromPlayer / 2
    
    inventory.currentWeapon.position.x = player.position.x + Math.cos(player.position.yaw) * 2//distanceFromPlayer
    inventory.currentWeapon.position.y = player.position.y + 1.5
    inventory.currentWeapon.position.z = player.position.z + Math.sin(player.position.yaw) * 2//distanceFromPlayer
    inventory.currentWeapon.position.yaw = Date.now() / 1000 + player.position.yaw
    inventory.currentWeapon.calculatePosition(deltaTime)

    inventory.currentWeapon.updateWorldPosition()
    for (let i = 0; i < otherWeapons.length; i++) otherWeapons[i].updateWorldPosition()


    camera.position.yaw = player.position.yaw
    camera.position.pitch = player.position.pitch

    webgl.renderFrame(player.position, camera);
    if (running) requestAnimationFrame(update)
}



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

	// -- Movement -- //

	let speed = .0075;
	let walkAnimationSpeed = .001 / speed

	if (w) {
		player.position.x += speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
		player.position.z += speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime

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
            if (player.onGround) {
                stepNoise.currentTime = 0.2
                stepNoise.volume = .05
                stepNoise.playbackRate = 1.5
                stepNoise.play()
            }
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
		if (player.onGround) {
            player.gravity = .015
            jumpNoise.currentTime = 0.025
            jumpNoise.play()
        }
	}

    if (leftClicking) {/*
        if (!inventory.currentWeapon.shooted && cooldownTimer <= 0) {
              currentCooldown = inventory.currentWeapon.shoot(lookAngleX, lookAngleY)
              cooldownTimer = currentCooldown
              otherWeapons.push(inventory.currentWeapon)
              inventory.currentWeapon = new Weapon(weaponGeometry, "tomato", [platforms, otherPlayers])
        }*/
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
            otherWeapons[i].calculatePosition(deltaTime)

            if (otherWeapons[i].position.x < -50 || otherWeapons[i].position.x > 50 || otherWeapons[i].position.z < -50 || otherWeapons[i].position.z > 50) {
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
//event.preventDefault();

if (event.keyCode == 37) left = true
if (event.keyCode == 39) right = true
if (event.keyCode == 38) up = true
if (event.keyCode == 40) down = true

if (event.keyCode == 87) w = true
if (event.keyCode == 83) s = true
if (event.keyCode == 65) a = true
if (event.keyCode == 68) d = true

if (event.keyCode == 16) {
    inventory.currentWeapon.remove()

	shift = true
}
if (event.keyCode == 32) space = true
});

document.addEventListener('keyup', function(event) {
//event.preventDefault();

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







document.addEventListener("mousemove", function (event) {
	if (leftClicking) {
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

    if (!running) {
        running = true
        update()
        fixedUpdateInterval = setInterval(fixedUpdate, 10) // set fixedUpdate to run 100 times/second
    }
}


document.addEventListener("mousedown", function(event) {
    if (running && event.which == 1) leftClicking = true
    if (running && event.which == 2) rightClicking = true

})

document.addEventListener("mouseup", function(event) {
    if (running && event.which == 1) leftClicking = false
    if (running && event.which == 2) rightClicking = false
})
