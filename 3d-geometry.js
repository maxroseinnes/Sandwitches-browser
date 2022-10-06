var glPolys = []

class Poly {
	
	constructor(point1, point2, point3) {
		this.point1 = point1;
		this.point2 = point2;
		this.point3 = point3;
		this.polyIndex = glPolys.length;
		glPolys.push(point1.pointIndex, point2.pointIndex, point3.pointIndex);
		this.existant = true;
/*
		this.linePoint1 = new Point(this.point1.x, this.point1.y, this.point1.z, 0, 0, 0)
		this.linePoint2 = new Point(this.point2.x, this.point2.y, this.point2.z, 0, 0, 0)
		this.linePoint3 = new Point(this.point3.x, this.point3.y, this.point3.z, 0, 0, 0)
		this.line1 = new Line(this.linePoint1, this.linePoint2)
		this.line2 = new Line(this.linePoint2, this.linePoint3)
		this.line3 = new Line(this.linePoint3, this.linePoint1)
		*/
	}

	delete() {
		glPolys.splice(this.polyIndex * 3, 3);
		this.existant = false;
	}
}

var glPoints = [];
var glPointColors = [];
var glPointNormals = [];
var glPointSizes = [];

class Point {

	constructor(x, y, z, n1, n2, n3, r, g, b) {
		this.x = x;
		this.y = y;
		this.z = z;
		
		//this.n1 = n1;
		//this.n2 = n2;
		//this.n3 = n3;

		this.r = r;
		this.g = g;
		this.b = b;

		this.pointIndex = glPoints.length / 3;
		this.pointColorIndex = glPointColors.length / 4;
		this.pointNormalIndex = glPointNormals.length / 3;
		this.pointSizeIndex = glPointSizes.length;
		
		glPoints.push(x, y, z);
		glPointColors.push(this.r, this.g, this.b, 1)
		glPointNormals.push(n1, n2, n3)
		glPointSizes.push(1.0);
	}

	setPosition(x, y, z) {
		//this.x = x;
		//this.y = y;
		//this.z = z;

		glPoints.splice(this.pointIndex * 3, 3, this.x + x, this.y + y, this.z + z);
	}

	
	changeColor(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;

		glPointColors.splice(this.pointColorIndex * 4, 3, this.r, this.g, this.b);
	}

	calculateLighting(pointX, pointY, pointZ) {
		let distance = Math.sqrt(Math.pow(pointX - this.x, 2) + Math.pow(pointY - this.y, 2) + Math.pow(pointZ - this.z, 2));
		let brightness = 20 / Math.pow(distance, .95) + .1;
		if (distance = 0) brightness = 10000

		let litR = this.r * brightness;
		let litG = this.g * brightness;
		let litB = this.b * brightness;

		if (litR > 1) litR = 1;
		if (litG > 1) litG = 1;
		if (litB > 1) litB = 1;

		glPointColors.splice(this.pointColorIndex * 4, 3, litR, litG, litB);
	}

	delete() {
		glPoints.splice(this.pointIndex * 3, 3)
		glPointColors.splice(this.pointColorIndex * 4, 4)
	}
	
}

var glLines = [];

class Line {
	constructor(point1, point2) {
		this.point1 = point1;
		this.point2 = point2;
		this.lineIndex = glLines.length / 2;
		glLines.push(point1.pointIndex, point2.pointIndex)

		this.existant = true;
	}

	delete() {
		glLines.splice(this.lineIndex * 2, 2)
		this.existant = false;
	}
}

var glDots = [];

class Dot {
	constructor(point, size) {
		this.point = point;
		this.dotIndex = glDots.length
		glDots.push(point.pointIndex)

		this.pointSize = size;
		glPointSizes.splice(point.pointSizeIndex, 1, size)
	}
}


let originPoint = new Point(0, 0, 0, 1, 1, 1, 1, 1, 1)
let origin = new Dot(originPoint, 10)

/*
var testPoint1 = new Point(10, 10, 10, 1, 0, .5)
var testPoint2 = new Point(10, -10, 10, 0, 1, .9)
var testPoint3 = new Point(10, -10, -10,  1, 1, 1)
var testPoint4 = new Point(10, 10, -10,  1, 1, 1)
var testPoint5 = new Point(-10, 10, 10, 1, 0, .5)
var testPoint6 = new Point(-10, -10, 10, 0, 1, .9)
var testPoint7 = new Point(-10, -10, -10,  1, 1, 1)
var testPoint8 = new Point(-10, 10, -10,  1, 1, 1)

var testPoly1 = new Poly(testPoint1, testPoint2, testPoint3)
var testPoly2 = new Poly(testPoint3, testPoint4, testPoint1)
var testPoly3 = new Poly(testPoint5, testPoint6, testPoint7)
var testPoly4 = new Poly(testPoint7, testPoint8, testPoint5)
var testPoly5 = new Poly(testPoint2, testPoint1, testPoint5)
var testPoly6 = new Poly(testPoint5, testPoint6, testPoint2)
var testPoly7 = new Poly(testPoint4, testPoint3, testPoint8)
var testPoly8 = new Poly(testPoint8, testPoint7, testPoint3)
*/


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

