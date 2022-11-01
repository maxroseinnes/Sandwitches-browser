

var webgl = {


  polys: [],
  points: [],
  pointColors: [],
  pointNormals: [],
  texCoords: [],
  pointsizes: [],
  lines: [],
  dots: [],

  textureMap: null,


  textures: {
    jerry: {
      url: "https://i.kym-cdn.com/photos/images/original/001/875/618/2a8.png",
      index: 0
    },
    sub: {
      url: "https://hl-grocery-prod-master.imgix.net/products/166a271a70f56dd7bc071d47f7c8fedd10bda460?fill=solid&fit=fill&fm=jpg&h=256&pad=7&q=92&trim=auto&trim-md=0&w=256",
      index: 1
    },
    bread: {
      url: "./assets/download.jfif",
      index: 2
    },
    wood: {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTvQrFPAcP14DaOSKKum5YSaAsmgthQIMksQ&usqp=CAU",
      index: 3
    },


  },


  loadedImages: [],
  squareWidth: null,





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
    attribute vec2 aTexCoord;
  
    uniform mat4 pMatrix;
    uniform mat4 tMatrix;
    uniform mat4 nMatrix;
  
    varying lowp vec2 vTextureCoord;
    varying lowp vec3 vLighting;
  
    void main() {
      gl_Position = pMatrix * tMatrix * vertPosition;
      gl_PointSize = aPointSize;
  
      highp vec3 ambientLight = vec3(0.7, 0.7, 0.7);
      highp vec3 directionalLightColor = vec3(.35, .35, .35);
      highp vec3 directionalVector = normalize(vec3(0.0, 0.5, 1.0));
  
      highp vec4 transformedNormal = nMatrix * vec4(aVertNormal, 1.0);
  
      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      highp vec3 lighting = ambientLight + (directionalLightColor * directional);
  
      vTextureCoord = aTexCoord;
      vLighting = lighting;
    }
    `
  
    this.fragmentShaderText = `
    precision mediump float;
  
    varying lowp vec2 vTextureCoord;
    varying lowp vec3 vLighting;

    uniform sampler2D uSampler;
  
    void main() {
      lowp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
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
    this.texCoordsBuffer = this.gl.createBuffer()
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

    // load textures //

    this.textureMap = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureMap)

    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)

    this.squareWidth = Math.round(Math.sqrt(Object.keys(this.textures).length) + .499999)
    
    for (let name in this.textures) {
      let image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => {
          this.loadedImages[this.textures[name].index] = image
          if (this.loadedImages.length < Object.keys(this.textures).length) return
          let loadedAll =  true
          for (let j = 0; j < this.loadedImages.length; j++) if (this.loadedImages[j] == null) loadedAll = false
          if (loadedAll) this.mergeImages(this.gl, this.loadedImages, this.textureMap)
      }
      image.src = this.textures[name].url
    }


    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) console.log(`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(this.program)}`)
  },

  mergeImages: (gl, loadedImages, texture) => {



    let canvas = document.createElement("canvas")
    canvas.width = webgl.squareWidth * 256
    canvas.height = webgl.squareWidth * 256
    document.body.appendChild(canvas)
    let ctx = canvas.getContext("2d")

    for (let i = 0; i < loadedImages.length; i++) {
      if (loadedImages[i] != null) {
        let yLocation = parseInt(i / webgl.squareWidth, 10)
        let xLocation = i - yLocation * webgl.squareWidth

        ctx.drawImage(
          loadedImages[i], 
          0, 
          0, 
          loadedImages[i].width, 
          loadedImages[i].height, 
          xLocation * 256, yLocation * 256, 256, 256)
      }
      
    }
    let textures = new Image()
    textures.onload = () => {

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures)

      if (textures.width & (textures.width - 1) === 0 && textures.height & (textures.height - 1) === 0) {
        console.log("using mipmap")
        gl.generateMipmap(gl.TEXTURE_2D)
      }
      else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }


    }
    textures.src = canvas.toDataURL()


  },



  renderFrame: function(playerPosition, angleX, angleY) {





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
    this.gl.vertexAttribPointer(pointNormalAttribLocation, nSize, this.gl.FLOAT, false, nSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(pointNormalAttribLocation);


    let txSize = 2;
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.texCoords), this.gl.DYNAMIC_DRAW);

    let texCoordAttribLocation = this.gl.getAttribLocation(this.program, "aTexCoord");
    this.gl.vertexAttribPointer(texCoordAttribLocation, txSize, this.gl.FLOAT, false, txSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(texCoordAttribLocation);


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

  	mat4.translate(tMatrix, tMatrix, [-2, -1, -8]);
    mat4.rotateX(tMatrix, tMatrix, angleX);
    mat4.rotateY(tMatrix, tMatrix, angleY);
    mat4.translate(tMatrix, tMatrix, [-playerPosition.x, -playerPosition.y, -playerPosition.z]);

    let tMatrixLocation = this.gl.getUniformLocation(this.program, "tMatrix");
    this.gl.uniformMatrix4fv(tMatrixLocation, false, tMatrix);

    let pMatrix = mat4.create();

    //                        fov        , aspect, near, far
    mat4.perspective(pMatrix, Math.PI / 3, this.aspect, .1, 1000);


    let pMatrixLocation = this.gl.getUniformLocation(this.program, "pMatrix");
    this.gl.uniformMatrix4fv(pMatrixLocation, false, pMatrix);



    let nMatrix = mat4.create();

    mat4.invert(nMatrix, tMatrix);
    mat4.transpose(nMatrix, nMatrix);

    let nMatrixLocation = this.gl.getUniformLocation(this.program, "nMatrix");
    this.gl.uniformMatrix4fv(nMatrixLocation, false, nMatrix);


    this.gl.clearColor(0.75, 0.8, 1, 1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureMap)
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "uSampler"), 0)

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
  constructor(x, y, z, n1, n2, n3, r, g, b, tx1, tx2) {
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
    webgl.texCoords.push(tx1, tx2)
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
  constructor(geometryInfo, scale, r, g, b, texture) {
// 1 2 3

// 1 2 3   1
// 4 5 6   2
// 7 8 9   3

    let squareWidth = webgl.squareWidth

    if (texture == null) this.texture = 0

    this.texture = webgl.textures[texture]

    let textureLocationY = (squareWidth - 1) - (parseInt(this.texture.index / webgl.squareWidth, 10))
    let textureLocationX = (this.texture.index - (parseInt(this.texture.index / webgl.squareWidth, 10)) * webgl.squareWidth)
    

    this.scale = scale

    this.x = 0
    this.y = 0
    this.z = 0

    let positions = geometryInfo.positions
    let normals = geometryInfo.normals
    let texcoords = geometryInfo.texcoords
    let smooth = geometryInfo.smooth
    let indices = geometryInfo.indices

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

      for (let i = 0; i < vertexIndices.length; i++) if (!isNaN(indices[i].vertexes[0]) && !isNaN(indices[i].vertexes[1]) && !isNaN(indices[i].vertexes[2]) && !isNaN(indices[i].normals[0]) && !isNaN(indices[i].normals[1]) && !isNaN(indices[i].normals[2]) && !isNaN(indices[i].texcoords[0]) && !isNaN(indices[i].texcoords[1])) {
        let point1 = new Point(positions[indices[i].vertexes[0]][0] * scale + this.x, positions[indices[i].vertexes[0]][1] * scale + this.y, positions[indices[i].vertexes[0]][2] * scale + this.z, normals[indices[i].normals[0]][0], normals[indices[i].normals[0]][1], normals[indices[i].normals[0]][2], r, g, b, (texcoords[indices[i].texcoords[0]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[0]][1] + textureLocationY) / squareWidth)
        let point2 = new Point(positions[indices[i].vertexes[1]][0] * scale + this.x, positions[indices[i].vertexes[1]][1] * scale + this.y, positions[indices[i].vertexes[1]][2] * scale + this.z, normals[indices[i].normals[1]][0], normals[indices[i].normals[1]][1], normals[indices[i].normals[1]][2], r, g, b, (texcoords[indices[i].texcoords[1]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[1]][1] + textureLocationY) / squareWidth)
        let point3 = new Point(positions[indices[i].vertexes[2]][0] * scale + this.x, positions[indices[i].vertexes[2]][1] * scale + this.y, positions[indices[i].vertexes[2]][2] * scale + this.z, normals[indices[i].normals[2]][0], normals[indices[i].normals[2]][1], normals[indices[i].normals[2]][2], r, g, b, (texcoords[indices[i].texcoords[2]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[2]][1] + textureLocationY) / squareWidth)

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
//heheheheheh goblin mdode
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
  constructor(geometries, x, y, z, angleY, name) {
    this.geometries = geometries
    this.ingredientModels = {}
    for (let ingredient in geometries.idle) {
      let r = .5
      let g = .5
      let b = .5
      let scale = 1
      let texture = 0
      if (ingredient.indexOf("Slice") != -1) { r = .25; g = .15; b = .05; texture = "bread"; }
      if (ingredient.indexOf("cheese") != -1) { r = .6; g = .4; b = .1; texture = "jerry"; }
      if (ingredient.indexOf("meat") != -1) { r = .6; g = .4; b = .4; texture = "sub"; }
      if (ingredient.indexOf("tomato") != -1) { r = .9; g = .2; b = .1; scale = 1.05; texture = "jerry"; }
      this.ingredientModels[ingredient] = new Model(geometries.idle[ingredient], scale, r, g, b, texture)
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

    this.lastPosition = {
      x: x,
      y: y,
      z: z
    }

    this.angleY = angleY

    this.name = name
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
    this.speed = .05 // units/millisecond
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
      this.model = new Model(geometryInfos.tomato, this.scale, .6, .1, .1, "sub")
    }
    
    if (type == "olive") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .925
      this.model = new Model(geometryInfos.olive, this.scale, .2, .3, .2, "sub")
    }

    if (type == "pickle") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.model = new Model(geometryInfos.pickle, this.scale, .1, .4, .1, "sub")
    }

    if (type == "sausage") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.model = new Model(geometryInfos.sausage, this.scale, .6, .1, .1, "jerry")
    }

    
    if (type == "anchovy") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.model = new Model(geometryInfos.anchovy, this.scale, .6, .1, .1, "jerry")
    }


    if (type == "pan") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.model = new Model(geometryInfos.pan, this.scale, .6, .1, .1, "sub")
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
    angleX = -angleX + Math.PI / 64
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
/*
    this.position.z += -Math.sin(angleY)
    this.position.x += Math.cos(angleY)
    this.position.y += Math.cos(angleX)
    //this.position.z += Math.sin(angleX)
*/

    this.shooted = true

    return this.cooldown
  }



}



class Platform {
  constructor(geometryInfo, type, x, y, z) {
    console.log(geometryInfo[type])
    this.x = x
    this.y = y
    this.z = z

    if (type == "basic") {
      this.model = new Model(geometryInfo[type], 1, Math.random() / 2, Math.random() / 2, Math.random() / 2, "sub")
      this.model.setPosition(0, this.x, this.y, this.z)
      this.width = 7
      this.height = 1.5
      this.length = 7
    }
    if (type == "crate") {
      this.model = new Model(geometryInfo[type], 1, .5, .1, .1, "jerry")
      this.model.setPosition(0, this.x, this.y + 1, this.z)
      this.width = 4
      this.height = 2
      this.length = 4

    }
    this.mx = this.x - this.width / 2
    this.px = this.x + this.width / 2
    this.my = this.y
    this.py = this.y + this.height
    this.mz = this.z - this.length / 2
    this.pz = this.z + this.length / 2
  }


  static calculateSlopes(lastPosition, currentPosition) {
    // calculate 6 slopes

    let x1 = lastPosition.x
    let x2 = currentPosition.x
    let y1 = lastPosition.y
    let y2 = currentPosition.y
    let z1 = lastPosition.z
    let z2 = currentPosition.z


    let functions = {
      x: {
        dependY: function(y){ return ((x2 - x1) / (y2 - y1) * y + ((x2 - x1) / (y2 - y1) * -y1) + x1) },
        dependZ: function(z){ return ((x2 - x1) / (z2 - z1) * z + ((x2 - x1) / (z2 - z1) * -z1) + x1) }
      },
      y: {
        dependZ: function(z){ return ((y2 - y1) / (z2 - z1) * z + ((y2 - y1) / (z2 - z1) * -z1) + y1) },
        dependX: function(x){ return ((y2 - y1) / (x2 - x1) * x + ((y2 - y1) / (x2 - x1) * -x1) + y1) }
      },
      z: {
        dependX: function(x){ return ((z2 - z1) / (x2 - x1) * x + ((z2 - z1) / (x2 - x1) * -x1) + z1) },
        dependY: function(y){ return ((z2 - z1) / (y2 - y1) * y + ((z2 - z1) / (y2 - y1) * -y1) + z1) }
      }
    }



    return functions
  }


  inRange(x, a, b) {
    if (a > b) return (a <= x <= b)
    else return (b <= x <= a)
  }

  calculateCollision(lastPosition, position, movement, gravity) {
    let correctedPosition = { x: position.x, y: position.y, z: position.z }
    let onPlatform = false

    // calculate if intersection is within bounds of face and that the point has passed the face in the dependent direction
    if (lastPosition.x <= this.mx && this.mx <= position.x) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let yIntersect = movement.y.dependX(this.mx)
      let zIntersect = movement.z.dependX(this.mx)

      if (this.my <= yIntersect && yIntersect <= this.py && this.mz <= zIntersect && zIntersect <= this.pz) {
        correctedPosition.x = this.mx
      }
    }

    if (lastPosition.x >= this.px && this.px >= position.x) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let yIntersect = movement.y.dependX(this.px)
      let zIntersect = movement.z.dependX(this.px)

      if (this.my <= yIntersect && yIntersect <= this.py && this.mz <= zIntersect && zIntersect <= this.pz) {
        correctedPosition.x = this.px
      }
    }

    if (lastPosition.z <= this.mz && this.mz <= position.z) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let xIntersect = movement.x.dependZ(this.mz)
      let yIntersect = movement.y.dependZ(this.mz)

      if (this.mx <= xIntersect && xIntersect <= this.px && this.my <= yIntersect && yIntersect <= this.py) {
        correctedPosition.z = this.mz
      }
    }

    
    if (lastPosition.z >= this.pz && this.pz >= position.z) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let xIntersect = movement.x.dependZ(this.pz)
      let yIntersect = movement.y.dependZ(this.pz)

      if (this.mx <= xIntersect && xIntersect <= this.px && this.my <= yIntersect && yIntersect <= this.py) {
        correctedPosition.z = this.pz
      }
    }

      
    if (lastPosition.y >= this.py && this.py >= position.y) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let zIntersect = movement.z.dependY(this.py)
      let xIntersect = movement.x.dependY(this.py)

      if (this.mz <= zIntersect && zIntersect <= this.pz && this.mx <= xIntersect && xIntersect <= this.px) {
        correctedPosition.y = this.py
        onPlatform = true
        gravity = 0
      }

    }


    return {
      correctedPosition: correctedPosition,
      onPlatform: onPlatform,
      gravity: gravity
    }
  }


}






export default { webgl, Poly, Point, Line, Dot, Model, Player, Weapon, Platform }
