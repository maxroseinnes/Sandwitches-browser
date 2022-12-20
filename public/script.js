
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
var Particle = webglStuff.Particle
var Player = webglStuff.Player
var Weapon = webglStuff.Weapon
var Platform = webglStuff.Platform
var Ground = webglStuff.Ground




webgl.initialize()


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



// Local global variables //
var platforms = [];

// html elements //
const menu = document.getElementById("menu")
const startButton = document.getElementById("startButton")
const info = document.getElementById("info")
const canvas = document.getElementById("canvas")
const effectsCanvas = document.getElementById("effectsCanvas")
const ctx = effectsCanvas.getContext("2d")


// AUDIO //


// MAP ORGANIZATION //


var ground
var camera = new PhysicalObject(0, 0, 0, 0, 0, { mx: -.05, px: .05, my: -.05, py: .05, mz: -.05, pz: .05 }, [])


// TESTING //


let model = new Model(obj.parseWavefront(fetchObj("maps/full_starting_map.obj"), false), 1, "olive", 0, 0, 0)

let selector = new Model({
    positions: [
      [-.075, -.075, -.075],
      [ .075, -.075, -.075],
      [ .075,  .075, -.075],
      [-.075,  .075, -.075],
      [-.075, -.075,  .075],
      [ .075, -.075,  .075],
      [ .075,  .075,  .075],
      [-.075,  .075,  .075]
    ],

    normals: [
      [-0, -0, 1]
    ],

    texcoords: [
      [0, 0],
      [1, 0],
      [1, .2],
      [0, .2]
    ],

    smooth: false,
    material: undefined,

    indices: [
      {
        vertexes: [0, 1, 2],
        texcoords: [0, 1, 2],
        normals: [0, 0, 0]
      },
      {
        vertexes: [2, 3, 0],
        texcoords: [2, 3, 0],
        normals: [0, 0, 0]
      },
      {
        vertexes: [4, 5, 6],
        texcoords: [0, 1, 2],
        normals: [0, 0, 0]
      },
      {
        vertexes: [6, 7, 4],
        texcoords: [2, 3, 0],
        normals: [0, 0, 0]
      },
      {
        vertexes: [0, 1, 4],
        texcoords: [0, 1, 2],
        normals: [0, 0, 0]
      },
      {
        vertexes: [4, 5, 1],
        texcoords: [2, 3, 0],
        normals: [0, 0, 0]
      },
      {
        vertexes: [2, 3, 6],
        texcoords: [0, 1, 2],
        normals: [0, 0, 0]
      },
      {
        vertexes: [6, 7, 3],
        texcoords: [2, 3, 0],
        normals: [0, 0, 0]
      },
      {
        vertexes: [4, 3, 7],
        texcoords: [0, 1, 2],
        normals: [0, 0, 0]
      },
      {
        vertexes: [3, 4, 0],
        texcoords: [2, 3, 0],
        normals: [0, 0, 0]
      },
      {
        vertexes: [1, 2, 6],
        texcoords: [0, 1, 2],
        normals: [0, 0, 0]
      },
      {
        vertexes: [6, 1, 5],
        texcoords: [2, 3, 0],
        normals: [0, 0, 0]
      }
    ]
  }, 1, "jerry", 0, 0, 0)


var points = model.geometryInfo.positions

var selectedPoint = [0, 0, 0]
var currentPoint = 0
var firstPoint = [0, 0, 0]
var secondPoint = [0, 0, 0]

var lastLeftClicking = false

var currentHitBox
var hitBoxes = []
var hitBoxData = []

document.getElementById("joinRoomButton").onclick = () => {

    let blob = new Blob([JSON.stringify(hitBoxData, "\t")], {type: "application/json"})
    let url = URL.createObjectURL(blob)

    let a = document.createElement("a")
    a.href = url
    a.download = "collision-data.json"
    a.click()
    window.setTimeout(() => {URL.revokeObjectURL(url)}, 0)

}


// UPDATE LOOP //

function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;

    let selectorPosition = [camera.position.x, camera.position.y, camera.position.z]

    for (let i in points) {
        let distance = Math.sqrt(Math.pow(points[i][0] - camera.position.x, 2) + Math.pow(points[i][1] - camera.position.y, 2) + Math.pow(points[i][2] - camera.position.z, 2))
        if (distance < .5) {
            selectedPoint = i
            selectorPosition = [
                points[i][0],
                points[i][1],
                points[i][2]
            ]
        }
    }

    selector.setPosition(0, 0, 0, 0, selectorPosition[0], selectorPosition[1], selectorPosition[2])


    
    if (currentPoint == 0) {
        if (leftClicking && !lastLeftClicking) {
            firstPoint = [selectorPosition[0], selectorPosition[1], selectorPosition[2]]
            secondPoint = [selectorPosition[0], selectorPosition[1], selectorPosition[2]]

            
            currentHitBox = new Model({
                positions: [
                  [firstPoint[0], firstPoint[1], firstPoint[2]],
                  [secondPoint[0], firstPoint[1], firstPoint[2]],
                  [secondPoint[0], secondPoint[1], firstPoint[2]],
                  [firstPoint[0], secondPoint[1], firstPoint[2]],
                  [firstPoint[0], firstPoint[1], secondPoint[2]],
                  [secondPoint[0], firstPoint[1], secondPoint[2]],
                  [secondPoint[0], secondPoint[1], secondPoint[2]],
                  [firstPoint[0], secondPoint[1], secondPoint[2]]
                ],
            
                normals: [
                  [-0, -0, 1]
                ],
            
                texcoords: [
                  [0, 0],
                  [1, 0],
                  [1, .2],
                  [0, .2]
                ],
            
                smooth: false,
                material: undefined,
            
                indices: [
                    {
                      vertexes: [0, 1, 2],
                      texcoords: [0, 1, 2],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [2, 3, 0],
                      texcoords: [2, 3, 0],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [4, 5, 6],
                      texcoords: [0, 1, 2],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [6, 7, 4],
                      texcoords: [2, 3, 0],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [0, 1, 4],
                      texcoords: [0, 1, 2],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [4, 5, 1],
                      texcoords: [2, 3, 0],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [2, 3, 6],
                      texcoords: [0, 1, 2],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [6, 7, 3],
                      texcoords: [2, 3, 0],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [4, 3, 7],
                      texcoords: [0, 1, 2],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [3, 4, 0],
                      texcoords: [2, 3, 0],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [1, 2, 6],
                      texcoords: [0, 1, 2],
                      normals: [0, 0, 0]
                    },
                    {
                      vertexes: [6, 1, 5],
                      texcoords: [2, 3, 0],
                      normals: [0, 0, 0]
                    }
                ]
            }, 1, "tomato", 0, 0, 0)
            hitBoxes.push(currentHitBox)

        }
    }
    else if (currentPoint == 1) { // change x and z
        secondPoint[0] = selectorPosition[0]
        secondPoint[2] = selectorPosition[2]

    }
    else if (currentPoint == 2) { // change y
        secondPoint[1] = selectorPosition[1]
    }

    if (currentPoint != 0) {
        let currentPoints = [
            [firstPoint[0], firstPoint[1], firstPoint[2]],
            [secondPoint[0], firstPoint[1], firstPoint[2]],
            [secondPoint[0], secondPoint[1], firstPoint[2]],
            [firstPoint[0], secondPoint[1], firstPoint[2]],
            [firstPoint[0], firstPoint[1], secondPoint[2]],
            [secondPoint[0], firstPoint[1], secondPoint[2]],
            [secondPoint[0], secondPoint[1], secondPoint[2]],
            [firstPoint[0], secondPoint[1], secondPoint[2]]
        ]

        let indices = [
            [0, 1, 2],
            [2, 3, 0],
            [4, 5, 6],
            [6, 7, 4],
            [0, 1, 4],
            [4, 5, 1],
            [2, 3, 6],
            [6, 7, 3],
            [4, 3, 7],
            [3, 4, 0],
            [1, 2, 6],
            [6, 1, 5]
        ]

        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 3; j++) {
                webgl.points.splice(currentHitBox.pointIndices[i][j] * 3, 3, currentPoints[indices[i][j]][0], currentPoints[indices[i][j]][1], currentPoints[indices[i][j]][2])
            }
        }
    }


    
    if (leftClicking && !lastLeftClicking) {
        if (currentPoint == 2) {
            currentPoint = 0
        
            hitBoxData.push({
                mx: (firstPoint[0] < secondPoint[0]) ? firstPoint[0] : secondPoint[0],
                px: (firstPoint[0] > secondPoint[0]) ? firstPoint[0] : secondPoint[0],
                my: (firstPoint[1] < secondPoint[1]) ? firstPoint[1] : secondPoint[1],
                py: (firstPoint[1] > secondPoint[1]) ? firstPoint[1] : secondPoint[1],
                mz: (firstPoint[2] < secondPoint[2]) ? firstPoint[2] : secondPoint[2],
                pz: (firstPoint[2] > secondPoint[2]) ? firstPoint[2] : secondPoint[2],
            })
        }
        else currentPoint++
    }

    lastLeftClicking = leftClicking

    camera.position.yaw = lookAngleY
    camera.position.lean = lookAngleX
    webgl.renderFrame(camera.position, camera);
    if (running) requestAnimationFrame(update)
}



function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()

    // -- Movement -- //

    let speed = .001

    if (w) {
        camera.velocity.x += speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
        camera.velocity.z += speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime
    }
    if (a) {
        camera.velocity.x -= speed * Math.cos(lookAngleY) * deltaTime
        camera.velocity.z -= speed * Math.sin(lookAngleY) * deltaTime
    }
    if (s) {
        camera.velocity.x -= speed * Math.cos(lookAngleY - (Math.PI / 2)) * deltaTime
        camera.velocity.z -= speed * Math.sin(lookAngleY - (Math.PI / 2)) * deltaTime
    }
    if (d) {
        camera.velocity.x += speed * Math.cos(lookAngleY) * deltaTime
        camera.velocity.z += speed * Math.sin(lookAngleY) * deltaTime
    }
    if (space) {
        camera.velocity.y += speed * deltaTime
    }
    if (shift) {
        camera.velocity.y -= speed * deltaTime
    }

    camera.velocity.x /= 1.15
    camera.velocity.y /= 1.15
    camera.velocity.z /= 1.15


    camera.position.x += camera.velocity.x
    camera.position.y += camera.velocity.y
    camera.position.z += camera.velocity.z
    



}



// -- key pressing -- //

var keyBinds = {
    w: {
        code: "KeyW",
        selecting: false
    },
    a: {
        code: "KeyA",
        selecting: false
    },
    s: {
        code: "KeyS",
        selecting: false
    },
    d: {
        code: "KeyD",
        selecting: false
    },
    openChat: {
        code: "KeyC",
        selecting: false
    }
}


function initKeyInput(preventDefault) {
    document.onkeydown = (event) => {
        if (preventDefault) event.preventDefault();



        if (event.code == keyBinds.w.code) w = true
        if (event.code == keyBinds.s.code) s = true
        if (event.code == keyBinds.a.code) a = true
        if (event.code == keyBinds.d.code) d = true
        if (event.code == "Space") space = true
        if (event.code == "ShiftLeft") shift = true

        if (event.code == "Backspace") {
            if (currentHitBox) currentHitBox.delete()
            currentHitBox = null
            currentPoint = 0
        }


    };

    document.onkeyup = (event) => {
        if (preventDefault) event.preventDefault();

        
        if (event.code == keyBinds.w.code) w = false
        if (event.code == keyBinds.s.code) s = false
        if (event.code == keyBinds.a.code) a = false
        if (event.code == keyBinds.d.code) d = false
        if (event.code == "Space") space = false
        if (event.code == "ShiftLeft") shift = false
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
        pauseGame()
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

    menu.style.display = "none"

    canvas.requestPointerLock()
    startGame()
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

var keyBindSelectors = document.getElementsByClassName("keyBindInput")
for (let i = 0; i < keyBindSelectors.length; i++) {
    let keyBind = keyBindSelectors[i].id
    keyBinds[keyBind].selector = keyBindSelectors[i]
    keyBindSelectors[i].value = keyBinds[keyBind].code
    keyBindSelectors[i].onmouseenter = () => { keyBinds[keyBind].selecting = true }
    keyBindSelectors[i].onmouseleave = () => { keyBinds[keyBind].selecting = false }
}


document.addEventListener("mousedown", function (event) {
    if (running && event.which == 1) leftClicking = true
    if (running && event.which == 2) rightClicking = true

})

document.addEventListener("mouseup", function (event) {
    if (running && event.which == 1) leftClicking = false
    if (running && event.which == 2) rightClicking = false
})
