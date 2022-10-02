


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext("webgl");

const vertexShaderText = `
precision mediump float;

attribute vec4 vertPosition;
attribute vec4 aVertColor;
attribute float aPointSize;

uniform mat4 pMatrix;
uniform mat4 tMatrix;

varying mediump vec4 vColor;

void main() {
  gl_Position = pMatrix * tMatrix * vertPosition;
	gl_PointSize = aPointSize;
  vColor = aVertColor;
}
`;


const fragmentShaderText = `
precision mediump float;

varying lowp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`;

// shaders //
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

// program //
var program = gl.createProgram();

// buffers //
var pointsBuffer = gl.createBuffer();
var colorsBuffer = gl.createBuffer();
var polysBuffer = gl.createBuffer();

var linePointsBuffer = gl.createBuffer();
var linePointColorsBuffer = gl.createBuffer();
var linesBuffer = gl.createBuffer();

var dotPointsBuffer = gl.createBuffer();
var dotColorsBuffer = gl.createBuffer();
var dotsBuffer = gl.createBuffer();
var pointSizesBuffer = gl.createBuffer();


//
// make program and add data to buffers
//

gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText);

gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);


gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.validateProgram(program);


const aspect = canvas.width / canvas.height;

function renderFrame() {

	// ---------- // Polys

  var cSize = 4;

  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glPointColors), gl.DYNAMIC_DRAW);

  var colorAttribLocation = gl.getAttribLocation(program, "aVertColor");
  gl.vertexAttribPointer(colorAttribLocation, cSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorAttribLocation);

	
	

	var vSize = 3;
	
  gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glPoints), gl.DYNAMIC_DRAW);

  var posAttribLocation = gl.getAttribLocation(program, "vertPosition");
  gl.vertexAttribPointer(posAttribLocation, vSize, gl.FLOAT, false, vSize * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(posAttribLocation);


	var psSize = 1;
	
  gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(glPointSizes), gl.DYNAMIC_DRAW);

  var pointSizeAttribLocation = gl.getAttribLocation(program, "aPointSize");
  gl.vertexAttribPointer(pointSizeAttribLocation, psSize, gl.FLOAT, false, psSize * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(pointSizeAttribLocation);

	
	
	var pSize = 3;
	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polysBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glPolys), gl.DYNAMIC_DRAW);
	
  gl.useProgram(program);


	// ---------- // Matrices

  var tMatrix = mat4.create();

	mat4.translate(tMatrix, tMatrix, [0, 0, -0]);
  mat4.rotateX(tMatrix, tMatrix, angleX);
  mat4.rotateY(tMatrix, tMatrix, angleY);
  mat4.translate(tMatrix, tMatrix, [-playerPosition.x, -playerPosition.y, -playerPosition.z]);

  var tMatrixLocation = gl.getUniformLocation(program, "tMatrix");
  gl.uniformMatrix4fv(tMatrixLocation, false, tMatrix);

  var pMatrix = mat4.create();

  //                        fov        , aspect, near, far
  mat4.perspective(pMatrix, Math.PI / 2, aspect, .1, 1000);
  

  var pMatrixLocation = gl.getUniformLocation(program, "pMatrix");
  gl.uniformMatrix4fv(pMatrixLocation, false, pMatrix);



  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, glPolys.length, gl.UNSIGNED_SHORT, 0);


	// ---------- // Lines

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, linesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glLines), gl.DYNAMIC_DRAW);
	
  gl.drawElements(gl.LINES, glLines.length, gl.UNSIGNED_SHORT, 0);

	// ---------- // Dots
	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dotsBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(glDots), gl.DYNAMIC_DRAW);
	
  gl.drawElements(gl.POINTS, glDots.length, gl.UNSIGNED_SHORT, 0);

}