
var playerPosition = {
    x: 0,
    y: 0,
    z: 0
}


const info = document.getElementById("info")

var running = false;
var updateThen = 0;

function update(now) {
    let deltaTime = now - updateThen;
    updateThen = now;



	info.innerHTML = Math.round(1000 / deltaTime)




	for (let i = 0; i < sandwichIngredients.length; i++) {
		sandwichIngredients[i].setPosition(angleY - Math.PI, playerPosition.x, playerPosition.y, playerPosition.z)
	}












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

	let speed = .006;

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
	onGround = (playerPosition.y <= 1)
	if (onGround) {
		playerPosition.y = 1
		gravity = 0
	}
	else {
		gravity -= .00003 * deltaTime // subtract by gravitational constant (units/frames^2)
	}



    
}