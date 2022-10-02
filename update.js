
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





    renderFrame();
    if (running) requestAnimationFrame(update)
}

var fixedUpdateInterval; // this is set in interactions -> pointer lock change
var fixedUpdateThen; // this should be updated in interactions -> pointer lock change

function fixedUpdate() {
    let deltaTime = Date.now() - fixedUpdateThen;
    if (deltaTime < 8 || isNaN(deltaTime)) deltaTime = 10;
    fixedUpdateThen = Date.now()


	let speed = .002;

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
	if (shift) {
		playerPosition.y -= speed * deltaTime
	}
	if (space) {
		playerPosition.y += speed * deltaTime
	}



    
}