
var playerPosition = {
    x: 0,
    y: 0,
    z: 0
}

// -- animations -- //

var walkingAnimation


// misc global variables //
var lastFramerates = []
const info = document.getElementById("info")

var running = false;
var updateThen = 0;

function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;



	lastFramerates.splice(0, 0, 1000 / deltaTime)
	lastFramerates.splice(20)
	let totalFramerate = 0
	for (let i = 0; i < lastFramerates.length; i++) totalFramerate += lastFramerates[i]
	let rollingFramerate  = totalFramerate / lastFramerates.length
	info.innerHTML = Math.round(rollingFramerate)




	if (walkingAnimation != null) walkingAnimation.updateAnimation()


	if (player != null) player.setPosition(angleY, playerPosition.x, playerPosition.y, playerPosition.z)









    renderFrame();
    if (running) requestAnimationFrame(update)
}

var fixedUpdateInterval; // this is set in interactions -> pointer lock change
var fixedUpdateThen; // this should be updated in interactions -> pointer lock change


// movement global variables //
var gravity = 0
var crouching = false
var onGround = true


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

		if (walkingAnimation != null && !walkingAnimation.active()) {
			if (walkingAnimation.currentMesh == 3) walkingAnimation.startAnimation(3, 1, walkAnimationSpeed, true)
			else if (walkingAnimation.currentMesh == 1) walkingAnimation.startAnimation(1, 3, walkAnimationSpeed, true)
			else if (walkingAnimation.currentMesh == 0) walkingAnimation.startAnimation(0, 2, walkAnimationSpeed, true)
			else if (walkingAnimation.currentMesh == 2) walkingAnimation.startAnimation(2, 1, walkAnimationSpeed, true)
		}

	} else {
		if (walkingAnimation != null && !walkingAnimation.active()) {
			if (walkingAnimation.currentMesh == 3) walkingAnimation.startAnimation(3, 0, walkAnimationSpeed, true)
			else if (walkingAnimation.currentMesh == 1) walkingAnimation.startAnimation(1, 0, walkAnimationSpeed, true)
			else if (walkingAnimation.currentMesh == 2) walkingAnimation.startAnimation(2, 0, walkAnimationSpeed, true)
		}
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



    
}