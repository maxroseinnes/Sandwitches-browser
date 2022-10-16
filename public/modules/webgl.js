

var webgl = {


  polys: [],
  points: [],
  pointColors: [],
  pointNormals: [],
  pointsizes: [],
  lines: [],
  dots: [],





  initialize: function() {

    this.canvas = document.getElementById("canvas"),
    this.canvas.width = window.innerWidth // THESE HAVE TO BE SET BEFORE GL IS MADE
    this.canvas.height = window.innerHeight
    document.getElementById("effectsCanvas").width = window.innerWidth
    document.getElementById("effectsCanvas").height = window.innerHeight
    this.aspect = canvas.width / canvas.height
    this.gl = this.canvas.getContext("webgl"),

    this.vertexShaderText = `
    precision mediump float;
  
    attribute vec4 vertPosition;
    attribute vec4 aVertColor;
    attribute float aPointSize;
    attribute vec3 aVertNormal;
  
    uniform mat4 pMatrix;
    uniform mat4 tMatrix;
    uniform mat4 nMatrix;
  
    varying mediump vec4 vColor;
  
    void main() {
      gl_Position = pMatrix * tMatrix * vertPosition;
      gl_PointSize = aPointSize;
  
      highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.0, 0.5, 1.0));
  
      highp vec4 transformedNormal = nMatrix * vec4(aVertNormal, 1.0);
  
      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      highp vec3 lighting = ambientLight + (directionalLightColor * directional);
  
      vColor = aVertColor * vec4(lighting, 1.0);
    }
    `
  
    this.fragmentShaderText = `
    precision mediump float;
  
    varying lowp vec4 vColor;
  
    void main() {
      gl_FragColor = vColor;
    }
    `
  
    // shaders //
    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)
    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
  
    // program //
    this.program = this.gl.createProgram()
  
    // buffers //
    this.pointsBuffer = this.gl.createBuffer()
    this.colorsBuffer = this.gl.createBuffer()
    this.normalsBuffer = this.gl.createBuffer()
    this.polysBuffer = this.gl.createBuffer()
  
    this.linePointsBuffer = this.gl.createBuffer()
    this.linePointColorsBuffer = this.gl.createBuffer()
    this.linesBuffer = this.gl.createBuffer()
  
    this.dotPointsBuffer = this.gl.createBuffer()
    this.dotColorsBuffer = this.gl.createBuffer()
    this.dotsBuffer = this.gl.createBuffer()
    this.pointSizesBuffer = this.gl.createBuffer()






    this.gl.shaderSource(this.vertexShader, this.vertexShaderText)
    this.gl.shaderSource(this.fragmentShader, this.fragmentShaderText)

    this.gl.compileShader(this.vertexShader)
    this.gl.compileShader(this.fragmentShader)

    this.gl.attachShader(this.program, this.vertexShader)
    this.gl.attachShader(this.program, this.fragmentShader)
    this.gl.linkProgram(this.program)
    this.gl.validateProgram(this.program)

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) console.log(`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(this.program)}`)
  },


  renderFrame: function(playerPosition, angleX, angleY) {

    let cSize = 4

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorsBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.pointColors), this.gl.DYNAMIC_DRAW)

    let colorAttribLocation = this.gl.getAttribLocation(this.program, "aVertColor");
    this.gl.vertexAttribPointer(colorAttribLocation, cSize, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(colorAttribLocation);




  	let vSize = 3;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.points), this.gl.DYNAMIC_DRAW);

    let posAttribLocation = this.gl.getAttribLocation(this.program, "vertPosition");
    this.gl.vertexAttribPointer(posAttribLocation, vSize, this.gl.FLOAT, false, vSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(posAttribLocation);


  	let nSize = 3;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.pointNormals), this.gl.DYNAMIC_DRAW);

    let pointNormalAttribLocation = this.gl.getAttribLocation(this.program, "aVertNormal");
    this.gl.vertexAttribPointer(3, nSize, this.gl.FLOAT, false, nSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(3);



  	let psSize = 1;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointSizesBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.pointsizes), this.gl.DYNAMIC_DRAW);

    let pointSizeAttribLocation = this.gl.getAttribLocation(this.program, "aPointSize");
    this.gl.vertexAttribPointer(pointSizeAttribLocation, psSize, this.gl.FLOAT, false, psSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(pointSizeAttribLocation);






  	let pSize = 3;

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.polysBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.polys), this.gl.DYNAMIC_DRAW);

    this.gl.useProgram(this.program);


  	// ---------- // Matrices

    let tMatrix = mat4.create();

  	mat4.translate(tMatrix, tMatrix, [-3, -2, -4]);
    mat4.rotateX(tMatrix, tMatrix, angleX);
    mat4.rotateY(tMatrix, tMatrix, angleY);
    mat4.translate(tMatrix, tMatrix, [-playerPosition.x, -playerPosition.y, -playerPosition.z]);

    let tMatrixLocation = this.gl.getUniformLocation(this.program, "tMatrix");
    this.gl.uniformMatrix4fv(tMatrixLocation, false, tMatrix);

    let pMatrix = mat4.create();

    //                        fov        , aspect, near, far
    mat4.perspective(pMatrix, Math.PI / 2, this.aspect, .1, 1000);


    let pMatrixLocation = this.gl.getUniformLocation(this.program, "pMatrix");
    this.gl.uniformMatrix4fv(pMatrixLocation, false, pMatrix);



    let nMatrix = mat4.create();

    mat4.invert(nMatrix, tMatrix);
    mat4.transpose(nMatrix, nMatrix);

    let nMatrixLocation = this.gl.getUniformLocation(this.program, "nMatrix");
    this.gl.uniformMatrix4fv(nMatrixLocation, false, nMatrix);


    this.gl.clearColor(0.75, 0.9, 1, 1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.drawElements(this.gl.TRIANGLES, this.polys.length, this.gl.UNSIGNED_SHORT, 0);


  	// ---------- // Lines

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.linesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lines), this.gl.DYNAMIC_DRAW);

    this.gl.drawElements(this.gl.LINES, this.lines.length, this.gl.UNSIGNED_SHORT, 0);

  	// ---------- // Dots

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.dotsBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.dots), this.gl.DYNAMIC_DRAW);

    this.gl.drawElements(this.gl.POINTS, this.dots.length, this.gl.UNSIGNED_SHORT, 0);








  }




}



var points = []
var pointColors = []
var pointNormals = []
var polys = []
var pointSizes = []
var dots = []
var lines = []





class Poly{
  static allPolys = []
  constructor(point1, point2, point3) {
    Poly.allPolys.push(this)
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
    this.polyIndex = webgl.polys.length / 3;
    webgl.polys.push(point1.pointIndex, point2.pointIndex, point3.pointIndex);
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
    webgl.polys.splice(this.polyIndex * 3, 3, null, null, null);
    this.existant = false;
  }

}


class Point {
  static allPoints = []
  constructor(x, y, z, n1, n2, n3, r, g, b) {
    Point.allPoints.push(this)
    this.x = x;
    this.y = y;
    this.z = z;

    this.n1 = n1;
    this.n2 = n2;
    this.n3 = n3;

    this.r = r;
    this.g = g;
    this.b = b;


    this.pointIndex = webgl.points.length / 3;
    this.pointSizeIndex = webgl.pointsizes.length;

    webgl.points.push(x, y, z);
    webgl.pointColors.push(this.r, this.g, this.b, 1)
    webgl.pointNormals.push(n1, n2, n3)
    webgl.pointsizes.push(1.0);
  }

  setPosition(angle, x, y, z, scale) {
    webgl.points.splice(this.pointIndex * 3, 3, 	  this.x * scale  * Math.cos(angle) - this.z * scale  * Math.sin(angle) + x, this.y * scale + y, this.x * scale  * Math.sin(angle) + this.z * scale  * Math.cos(angle) + z);
    webgl.pointNormals.splice(this.pointIndex * 3, 3, this.n1 * Math.cos(angle) - this.n3 * Math.sin(angle)    , this.n2,    this.n1 * Math.sin(angle) + this.n3 * Math.cos(angle))
  }

  overridePosition(x, y, z) {

    this.x = x;
    this.y = y;
    this.z = z;

    webgl.points.splice(this.pointIndex * 3, 3, x, y, z)
  }

  overrideNormal(n1, n2, n3) {

    this.n1 = n1;
    this.n2 = n2;
    this.n3 = n3;

    webgl.pointNormals.splice(this.pointIndex * 3, 3, n1, n2, n3)
  }



  changeColor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;

    webgl.pointColors.splice(this.pointIndex * 4, 3, this.r, this.g, this.b);
  }


  delete() {
    webgl.points.splice(this.pointIndex * 3, 3, null, null, null)
    webgl.pointColors.splice(this.pointIndex * 4, 4, null, null, null, null)
    webgl.pointNormals.splice(this.pointIndex * 3, 3, null, null, null)
  }


}


class Line{
  constructor(point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
    this.lineIndex = webgl.lines.length / 2;
    webgl.lines.push(point1.pointIndex, point2.pointIndex)

    this.existant = true;
  }

  delete() {
    webgl.lines.splice(this.lineIndex * 2, 2)
    this.existant = false;
  }
}


class Dot{
  constructor(point, size) {
    this.point = point;
    this.dotIndex = webgl.dots.length
    webgl.dots.push(point.pointIndex)

    this.pointSize = size;
    webgl.pointsizes.splice(point.pointSizeIndex, 1, size)
  }
}





class Model {
  constructor(geometryInfo, scale, r, g, b) {


    this.scale = scale

    this.x = 0
    this.y = 0
    this.z = 0

    let positions = geometryInfo.positions
    let normals = geometryInfo.normals
    let smooth = geometryInfo.smooth

    this.positions = positions
    this.normals = normals
    this.smooth = smooth
    //smooth = true

    let vertexIndices = []
    let normalIndices = []
    for (let i = 0; i < geometryInfo.indices.length; i++) {
        vertexIndices.push(geometryInfo.indices[i].vertexes)
        normalIndices.push(geometryInfo.indices[i].normals)
    }

    this.vertexIndices = vertexIndices
    this.normalIndices = normalIndices

    this.points = []
    this.polys = []

    if (!smooth) {
      // for each triangle: make three new points and a poly



      for (let i = 0; i < vertexIndices.length; i++) {
        let point1 = new Point(positions[vertexIndices[i][0]][0] * scale + this.x, positions[vertexIndices[i][0]][1] * scale + this.y, positions[vertexIndices[i][0]][2] * scale + this.z, normals[normalIndices[i][0]][0], normals[normalIndices[i][0]][1], normals[normalIndices[i][0]][2], r, g, b)
        let point2 = new Point(positions[vertexIndices[i][1]][0] * scale + this.x, positions[vertexIndices[i][1]][1] * scale + this.y, positions[vertexIndices[i][1]][2] * scale + this.z, normals[normalIndices[i][1]][0], normals[normalIndices[i][1]][1], normals[normalIndices[i][1]][2], r, g, b)
        let point3 = new Point(positions[vertexIndices[i][2]][0] * scale + this.x, positions[vertexIndices[i][2]][1] * scale + this.y, positions[vertexIndices[i][2]][2] * scale + this.z, normals[normalIndices[i][2]][0], normals[normalIndices[i][2]][1], normals[normalIndices[i][2]][2], r, g, b)

        this.points.push(point1, point2, point3)
        this.polys.push(new Poly(point1, point2, point3))
      }

  }

  else {
      let points = []
      for (let i = 0; i < positions.length; i++) {
        let connectedPolys = []
        for (let j = 0; j < vertexIndices.length; j++) {
          for (let k = 0; k < vertexIndices[j].length; k++) {
            if (vertexIndices[j][k] == i) connectedPolys.push({ index: j, vertex: k })
          }
        }

        let averageNormalX = 0
        let averageNormalY = 0
        let averageNormalZ = 0

        for (let j = 0; j < connectedPolys.length; j++) {
          averageNormalX += normals[normalIndices[connectedPolys[j].index][connectedPolys[j].vertex]][0]
          averageNormalY += normals[normalIndices[connectedPolys[j].index][connectedPolys[j].vertex]][1]
          averageNormalZ += normals[normalIndices[connectedPolys[j].index][connectedPolys[j].vertex]][2]
        }

        averageNormalX /= connectedPolys.length
        averageNormalY /= connectedPolys.length
        averageNormalZ /= connectedPolys.length


        points.push(new Point(positions[i][0] * scale + this.x, positions[i][1] * scale + this.y, positions[i][2] * scale + this.z, averageNormalX, averageNormalY, averageNormalZ, r, g, b))
      }

      for (let i = 0; i < vertexIndices.length; i++) {
        this.polys.push(new Poly(points[vertexIndices[i][0]], points[vertexIndices[i][1]], points[vertexIndices[i][2]]))
      }

      this.points = points
    }


  }


  setPosition(angle, x, y, z) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].setPosition(angle, x, y, z, this.scale)
    }
  }

  lerp(a, b, x) {
    return a + (b - a) * x
  }



  interpolatePoints(mesh1, mesh2, stage) {
    if (this.smooth) {
      if (mesh1.positions.length != mesh2.positions.length) {
        console.log(`meshes ${mesh1.name} and ${mesh2.name} have different numbers of points`)
        return
      }
      for (let i = 0; i < mesh1.positions.length; i++) {
        this.points[i].overridePosition(
          this.lerp(mesh1.positions[i][0] * this.scale, mesh2.positions[i][0] * this.scale, stage),
          this.lerp(mesh1.positions[i][1] * this.scale, mesh2.positions[i][1] * this.scale, stage),
          this.lerp(mesh1.positions[i][2] * this.scale, mesh2.positions[i][2] * this.scale, stage),
        )
      }
/*
      for (let i = 0; i < mesh1.normals.length; i++) {
        this.points[i].overrideNormal(
        this.lerp(mesh1.normals[i][0] * this.scale, mesh2.normals[i][0] * this.scale, stage),
        this.lerp(mesh1.normals[i][1] * this.scale, mesh2.normals[i][1] * this.scale, stage),
        this.lerp(mesh1.normals[i][2] * this.scale, mesh2.normals[i][2] * this.scale, stage),
        )
      }*/
    }
    else {
      if (mesh1.indices.length != mesh2.indices.length) {
        throw("different triangle count in" + mesh1.indices.length + ", " + mesh2.indices.length)
      }
      for (let i = 0; i < mesh1.indices.length; i++) {
        this.polys[i].point1.overridePosition(
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[0]][0] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[0]][0] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[0]][1] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[0]][1] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[0]][2] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[0]][2] * this.scale, stage)
        )
        this.polys[i].point2.overridePosition(
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[1]][0] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[1]][0] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[1]][1] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[1]][1] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[1]][2] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[1]][2] * this.scale, stage)
        )
        this.polys[i].point3.overridePosition(
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[2]][0] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[2]][0] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[2]][1] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[2]][1] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[2]][2] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[2]][2] * this.scale, stage)
        )


        this.polys[i].point1.overrideNormal(
          this.lerp(mesh1.normals[mesh1.indices[i].normals[0]][0], mesh2.normals[mesh2.indices[i].normals[0]][0], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[0]][1], mesh2.normals[mesh2.indices[i].normals[0]][1], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[0]][2], mesh2.normals[mesh2.indices[i].normals[0]][2], stage)
        )
        this.polys[i].point2.overrideNormal(
          this.lerp(mesh1.normals[mesh1.indices[i].normals[1]][0], mesh2.normals[mesh2.indices[i].normals[1]][0], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[1]][1], mesh2.normals[mesh2.indices[i].normals[1]][1], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[1]][2], mesh2.normals[mesh2.indices[i].normals[1]][2], stage)
        )
        this.polys[i].point3.overrideNormal(
          this.lerp(mesh1.normals[mesh1.indices[i].normals[2]][0], mesh2.normals[mesh2.indices[i].normals[2]][0], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[2]][1], mesh2.normals[mesh2.indices[i].normals[2]][1], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[2]][2], mesh2.normals[mesh2.indices[i].normals[2]][2], stage)
        )
        

      }
    }
  }

  delete() {
    for (let i = 0; i < this.polys.length; i++) {
      this.polys[i].delete()
    }
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].delete()
    }
  }

}



class Player {
  constructor(geometries, x, y, z, angleY, userInfo) {
    this.geometries = geometries
    this.ingredientModels = {}
    for (let ingredient in geometries.idle) {
      let r = .5
      let g = .5
      let b = .5
      let scale = 1
      if (ingredient.indexOf("Slice") != -1) { r = .25; g = .15; b = .05; }
      if (ingredient.indexOf("cheese") != -1) { r = .6; g = .4; b = .1; }
      if (ingredient.indexOf("meat") != -1) { r = .6; g = .4; b = .4; }
      if (ingredient.indexOf("tomato") != -1) { r = .9; g = .2; b = .1; scale = 1.05; }
      this.ingredientModels[ingredient] = new Model(geometries.idle[ingredient], scale, r, g, b)
    }


    this.animation = {
      startMeshName: "idle",
      endMeshName: "idle",
      currentMeshName: "idle",
      speed: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      smooth: true,
      finished: true
    }

    this.position = {
      x: x,
      y: y,
      z: z
    }
    this.angleY = angleY

    this.userInfo = userInfo
  }

  updatePosition() {
    for (let ingredient in this.ingredientModels) {
      this.ingredientModels[ingredient].setPosition(this.angleY, this.position.x, this.position.y, this.position.z)
    }
  }


  startAnimation(startMeshName, endMeshName, speed, smooth) {
    this.animation = {
      startMeshName: startMeshName,
      endMeshName: endMeshName,
      currentMeshName: endMeshName,
      speed: speed,
      startTime: Date.now(),
      endTime: Date.now() + speed * 1000,
      smooth: smooth,
      finished: false
    }

  }


  updateAnimation() {
    if (this.animation == null) return
    let stage
    if (!this.animation.smooth) stage = (Date.now() - this.animation.startTime) / (this.animation.endTime - this.animation.startTime)
    else stage = (Math.cos(Math.PI * ((Date.now() - this.animation.startTime) / (this.animation.endTime - this.animation.startTime) - 1)) + 1) / 2
    if (Date.now() >= this.animation.endTime) {
      this.animation.finished = true
      stage = 1
    }

    for (let ingredient in this.ingredientModels) {
      if (ingredient != "tomato4") this.ingredientModels[ingredient].interpolatePoints(this.geometries[this.animation.startMeshName][ingredient], this.geometries[this.animation.endMeshName][ingredient], stage)
    }
  }



}


class Weapon {
  constructor(geometryInfos, type) {

    // default settings
    this.cooldown = 1 // seconds
    this.automatic = false
    this.speed = .01 // units/millisecond
    this.manaCost = 20
    this.damage = 10 // this might be handled server
    this.chargeTime = 0 // seconds
    this.burstCount = 1
    this.burstInterval = .5 // time between shots of bursts, seconds
    this.scale = 1

    if (type == "tomato") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.model = new Model(geometryInfos.tomato, this.scale, .6, .1, .1)
    }



    this.position = {
      x: 0,
      y: 0, 
      z: 0
    }
    this.angleY = 0


    this.shooted = false
    this.shootMovementVector = {
      x: 0,
      y: 0,
      z: 0      
    }

  }

  updatePosition(deltaTime) {
    if (this.shooted) {
      this.position.x += this.shootMovementVector.x * deltaTime
      this.position.y += this.shootMovementVector.y * deltaTime
      this.position.z += this.shootMovementVector.z * deltaTime
    }
    this.model.setPosition(this.angleY, this.position.x, this.position.y, this.position.z)
  }

  shoot(angleX, angleY) {
    angleX = -angleX
    angleY = -angleY
    this.shootMovementVector.x = 0
    this.shootMovementVector.y = 0
    this.shootMovementVector.z = -this.speed

    let tempY = this.shootMovementVector.y
    let tempZ = this.shootMovementVector.z
    this.shootMovementVector.y = Math.cos(angleX) * tempY - Math.sin(angleX) * tempZ
    this.shootMovementVector.z = Math.sin(angleX) * tempY + Math.cos(angleX) * tempZ

    tempZ = this.shootMovementVector.z
    let tempX = this.shootMovementVector.x
    this.shootMovementVector.z = Math.cos(angleY) * tempZ - Math.sin(angleY) * tempX
    this.shootMovementVector.x = Math.sin(angleY) * tempZ + Math.cos(angleY) * tempX

    this.position.z += -Math.sin(angleY)
    this.position.x += Math.cos(angleY)
    this.position.y += Math.cos(angleX)
    //this.position.z += Math.sin(angleX)


    this.shooted = true

    return this.cooldown
  }



}



export default { webgl, Poly, Point, Line, Dot, Model, Player, Weapon }
