
// -- key pressing -- //

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

  if (event.keyCode == 16) shift = true
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

var pointerLocked = false


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




var angleX = 0.0;
var angleY = 0.0

document.addEventListener("mousemove", function (event) {
	if (pointerLocked) {
		sensitivity = Math.PI / 512;
		angleX += sensitivity * event.movementY
		angleY += sensitivity * event.movementX

		if (angleX < -Math.PI / 2) angleX = -Math.PI / 2
		if (angleX > Math.PI / 2) angleX = Math.PI / 2
		
	}
	
}, false)


// -- menu -- //


const menu = document.getElementById("menu")
const startButton = document.getElementById("startButton")

startButton.onclick = () => {
    console.log("starting")

    menu.style.display = "none"

    canvas.requestPointerLock()
}
