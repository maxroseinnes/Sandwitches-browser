

var webgl = {


  points: [],
  pointNormals: [],
  texCoords: [],
  pointCount: 0,
  deletedPoints: [],

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
      url: "./assets/textures/PlayerBreadTex.png",
      index: 2
    },
    wood: {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTvQrFPAcP14DaOSKKum5YSaAsmgthQIMksQ&usqp=CAU",
      index: 3
    },
    purple: {
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAA1BMVEV9Js3dWPvwAAAASElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AcUIAAFkqh/QAAAAAElFTkSuQmCC",
      index: 4
    },


  },

  canvas: undefined,
  ctx: undefined,

  loadedImages: [],
  squareWidth: null,





  initialize: function() {

    this.canvas = document.getElementById("canvas"),
    this.canvas.width = window.innerWidth // THESE HAVE TO BE SET BEFORE GL IS MADE
    this.canvas.height = window.innerHeight
    document.getElementById("effectsCanvas").width = window.innerWidth
    document.getElementById("effectsCanvas").height = window.innerHeight
    this.aspect = canvas.width / canvas.height
    this.gl = this.canvas.getContext("webgl")

    this.vertexShaderText = `
    precision mediump float;
  
    attribute vec4 vertPosition;
    attribute vec3 aVertNormal;
    attribute vec2 aTexCoord;
  
    uniform mat4 pMatrix;
    uniform mat4 tMatrix;
    uniform mat4 nMatrix;
  
    varying lowp vec2 vTextureCoord;
    varying lowp vec3 vLighting;
  
    void main() {
      gl_Position = pMatrix * tMatrix * vertPosition;
  
      highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
      highp vec3 directionalLightColor = vec3(.5, .5, .5);
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
    this.normalsBuffer = this.gl.createBuffer()
    this.texCoordsBuffer = this.gl.createBuffer()






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

    this.squareWidth = 20//Math.round(Math.sqrt(Object.keys(this.textures).length) + .499999)
    
    for (let name in this.textures) {
      let image = new Image()
      image.width = 64
      image.height = 64
      //document.body.appendChild(image)
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

  loadTexture: (gl, texture) => {
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
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)


    }
    textures.src = webgl.canvas.toDataURL()
  },
  
  mergeImages: (gl, loadedImages, texture) => {

    webgl.canvas = document.createElement("canvas")
    webgl.canvas.width = webgl.squareWidth * 64
    webgl.canvas.height = webgl.squareWidth * 64
    //document.body.appendChild(webgl.canvas)
    webgl.canvas.style.imageRendering = "pixelated"
    webgl.ctx = webgl.canvas.getContext("2d")
    //ctx.scale(-1, 1)

    for (let i = 0; i < loadedImages.length; i++) {
      if (loadedImages[i] != null) {
        let yLocation = parseInt(i / webgl.squareWidth, 10)
        let xLocation = i - yLocation * webgl.squareWidth

        webgl.ctx.drawImage(
          loadedImages[i], 
          xLocation * 64, yLocation * 64, 64, 64)
      }
      
    }
    webgl.ctx.restore()

    webgl.loadTexture(gl, texture)


  },

  fov: Math.PI / 3,

  renderFrame: function(playerPosition, camera) {





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



    this.gl.useProgram(this.program);


  	// ---------- // Matrices

    let tMatrix = mat4.create();

    //angleX += Math.PI / 12

    //let cameraDistance = 8
    //let cameraPositionY = (playerPosition.y + 1) - Math.sin(angleX) * -cameraDistance
    //let ratio = 1
    //if (cameraPositionY < 0) ratio = Math.pow((playerPosition.y + 1) / (Math.sin(angleX) * -cameraDistance), 1.5)


    camera.lastPosition.x = playerPosition.x
    camera.lastPosition.y = playerPosition.y + 1
    camera.lastPosition.z = playerPosition.z

    let cameraX = 2
    let cameraY = 1
    let cameraZ = 8

    let cameraRY = Math.cos(-camera.position.lean) * cameraY - Math.sin(-camera.position.lean) * cameraZ
    let cameraRZ = Math.sin(-camera.position.lean) * cameraY + Math.cos(-camera.position.lean) * cameraZ
    let cameraRX = cameraX

    camera.position.z = Math.cos(-camera.position.yaw) * cameraRZ - Math.sin(-camera.position.yaw) * cameraRX + playerPosition.z
    camera.position.x = Math.sin(-camera.position.yaw) * cameraRZ + Math.cos(-camera.position.yaw) * cameraRX + playerPosition.x
    camera.position.y = cameraRY + playerPosition.y


    for (let i = 0; i < camera.collidableObjects.length; i++) {
      for (let j = 0; j < camera.collidableObjects[i].length; j++) {
        let movement = camera.calculateSlopes()
        let collision = camera.collidableObjects[i][j].collision(camera.lastPosition, camera.position, movement, camera.dimensions)

        if (collision.mx.intersects) {
          camera.position.x = collision.mx.x
          camera.position.y = collision.mx.y
          camera.position.z = collision.mx.z
        }
        if (collision.px.intersects) {
          camera.position.x = collision.px.x
          camera.position.y = collision.px.y
          camera.position.z = collision.px.z
        }

        if (collision.my.intersects) {
          camera.position.x = collision.my.x
          camera.position.y = collision.my.y
          camera.position.z = collision.my.z
        }
        if (collision.py.intersects) {
          camera.position.x = collision.py.x
          camera.position.y = collision.py.y
          camera.position.z = collision.py.z
        }

        if (collision.mz.intersects) {
          camera.position.x = collision.mz.x
          camera.position.y = collision.mz.y
          camera.position.z = collision.mz.z
        }
        if (collision.pz.intersects) {
          camera.position.x = collision.pz.x
          camera.position.y = collision.pz.y
          camera.position.z = collision.pz.z
        }

      }
    }



  	//mat4.translate(tMatrix, tMatrix, [-2, -1, -cameraDistance * ratio]);
    mat4.rotateX(tMatrix, tMatrix, camera.position.lean);
    mat4.rotateY(tMatrix, tMatrix, camera.position.yaw);
    mat4.translate(tMatrix, tMatrix, [-camera.position.x, -camera.position.y, -camera.position.z]);

    let tMatrixLocation = this.gl.getUniformLocation(this.program, "tMatrix");
    this.gl.uniformMatrix4fv(tMatrixLocation, false, tMatrix);

    let pMatrix = mat4.create();

    //                        fov        , aspect, near, far
    mat4.perspective(pMatrix, this.fov, this.aspect, .1, 1000);


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

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.pointCount)








  }




}







class Point {
  static allPoints = []
  constructor(x, y, z, n1, n2, n3, r, g, b, tx1, tx2) {

    this.pointIndex = webgl.points.length / 3;

    webgl.points.push(x, y, z);
    webgl.pointNormals.push(n1, n2, n3)
    webgl.texCoords.push(tx1, tx2)

    webgl.pointCount++
  }


  delete() {
    webgl.points.splice(this.pointIndex * 3, 3, null, null, null)
    webgl.pointColors.splice(this.pointIndex * 4, 4, null, null, null, null)
    webgl.pointNormals.splice(this.pointIndex * 3, 3, null, null, null)
  }


}






class Model {
  static allModels = []
  constructor(geometryInfo, scale, texture, offsetX, offsetY, offsetZ) {
    Model.allModels.push(this)
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

    this.offsetX = offsetX || 0
    this.offsetY = offsetY || 0
    this.offsetZ = offsetZ || 0

    let positions = geometryInfo.positions
    let normals = geometryInfo.normals
    let texcoords = geometryInfo.texcoords
    let smooth = geometryInfo.smooth
    let indices = geometryInfo.indices

    this.geometryInfo = geometryInfo

    // for each triangle: make three new points and a poly

    this.indexOffset = 0

    this.pointIndices = []

    for (let i = 0; i < this.geometryInfo.indices.length; i++) if (!isNaN(indices[i].vertexes[0]) && !isNaN(indices[i].vertexes[1]) && !isNaN(indices[i].vertexes[2]) && !isNaN(indices[i].normals[0]) && !isNaN(indices[i].normals[1]) && !isNaN(indices[i].normals[2]) && !isNaN(indices[i].texcoords[0]) && !isNaN(indices[i].texcoords[1])) {

      let currentPointIndices = []
      for (let j = 0; j < 3; j++) {

        currentPointIndices.push(webgl.points.length / 3)

        webgl.points.push(positions[indices[i].vertexes[j]][0] * scale + this.offsetX, positions[indices[i].vertexes[j]][1] * scale + this.offsetY, positions[indices[i].vertexes[j]][2] * scale + this.offsetZ)
        webgl.pointNormals.push(normals[indices[i].normals[j]][0], normals[indices[i].normals[j]][1], normals[indices[i].normals[j]][2])
        webgl.texCoords.push((texcoords[indices[i].texcoords[j]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[j]][1] + textureLocationY) / squareWidth)

        webgl.pointCount++
      }

      this.pointIndices.push(currentPointIndices)
    }
        



//heheheheheh goblin mdode


  }


  setPosition(yaw, lean, pitch, roll, x, y, z, mesh, walkCycle, crouchValue, slideValue) {
    // lean is used only for player models leaning

    walkCycle = walkCycle || 0
    crouchValue = crouchValue || 0
    slideValue = slideValue || 0


    let geometryInfo = this.geometryInfo
    let indices = geometryInfo.indices

    let matrix = mat4.create()
    mat4.translate(matrix, matrix, [x, y, z])
    mat4.rotateY(matrix, matrix, -yaw)
    mat4.rotateX(matrix, matrix, -pitch)
    mat4.rotateZ(matrix, matrix, roll)
    //mat4.translate(matrix, matrix, [this.offsetX, this.offsetY, this.offsetZ])

    // ** save walk in w slot? **


    
    let testVec4 = vec4.fromValues(0, 0, 1, 1)
    vec4.transformMat4(testVec4, [0, 0, 1, 1], matrix)
    

    for (let i = 0; i < this.pointIndices.length; i++) if (!isNaN(indices[i].vertexes[0]) && !isNaN(indices[i].vertexes[1]) && !isNaN(indices[i].vertexes[2]) && !isNaN(indices[i].normals[0]) && !isNaN(indices[i].normals[1]) && !isNaN(indices[i].normals[2]) && !isNaN(indices[i].texcoords[0]) && !isNaN(indices[i].texcoords[1])) {
        for (let j = 0; j < this.pointIndices[i].length; j++) {

          let modelX = /*this.lerp(*/mesh.positions[mesh.indices[i].vertexes[j]][0] * this.scale/*, mesh2.positions[mesh2.indices[i].vertexes[j]][0] * this.scale, stage)*/ + this.offsetX
          let modelY = /*this.lerp(*/mesh.positions[mesh.indices[i].vertexes[j]][1] * this.scale/*, mesh2.positions[mesh2.indices[i].vertexes[j]][1] * this.scale, stage)*/ + this.offsetY
          let modelZ = /*this.lerp(*/mesh.positions[mesh.indices[i].vertexes[j]][2] * this.scale/*, mesh2.positions[mesh2.indices[i].vertexes[j]][2] * this.scale, stage)*/ + this.offsetZ

          let walk = Math.sin(walkCycle) * (2 - modelY) * Math.sin(modelX * 2)
          let walkX = modelX// + .25 * Math.sin(walkCycle) * (2 - modelY) * Math.sin(modelX)
          let walkY = modelY * (1 - (crouchValue / 2)) + modelY * Math.sin(modelX * 2) * Math.sin(walkCycle) * .025
          let walkZ = modelZ + .2 * walk

          //let zRotatedX = walkX * Math.cos(roll) - walkY * Math.sin(roll)
          //let zRotatedY = walkX * Math.sin(roll) + walkY * Math.cos(roll)
          //let zRotatedZ = walkZ

          //let xRotatedZ = zRotatedZ * Math.cos(pitch) - zRotatedY * Math.sin(pitch)
          //let xRotatedY = zRotatedZ * Math.sin(pitch) + zRotatedY * Math.cos(pitch)
          //let xRotatedX = zRotatedX

          let lRotatedZ = walkZ * Math.cos(lean * modelY / 3) - walkY * Math.sin(lean * modelY / 3)
          let lRotatedY = walkZ * Math.sin(lean * modelY / 3) + walkY * Math.cos(lean * modelY / 3)
          let lRotatedX = walkX

          //let rotatedX = lRotatedX * Math.cos(yaw) - lRotatedZ * Math.sin(yaw) + x
          //let rotatedY = lRotatedY * (1 - (crouchValue / 2)) + y
          //let rotatedZ = lRotatedX * Math.sin(yaw) + lRotatedZ * Math.cos(yaw) + z

          let transformedPosition = vec4.create()
          vec4.transformMat4(transformedPosition, [
            lRotatedX,
            lRotatedY,
            lRotatedZ,
            1
          ], matrix)

          webgl.points.splice((this.pointIndices[i][j] + this.indexOffset) * 3, 3, 
            transformedPosition[0], 
            transformedPosition[1], 
            transformedPosition[2]
          )

          

          let modelN1 = /*this.lerp(*/mesh.normals[mesh.indices[i].normals[j]][0]/*, mesh2.normals[mesh2.indices[i].normals[j]][0], stage)*/
          let modelN2 = /*this.lerp(*/mesh.normals[mesh.indices[i].normals[j]][1]/*, mesh2.normals[mesh2.indices[i].normals[j]][1], stage)*/
          let modelN3 = /*this.lerp(*/mesh.normals[mesh.indices[i].normals[j]][2]/*, mesh2.normals[mesh2.indices[i].normals[j]][2], stage)*/

          let walkN3 = modelN3 * Math.cos(lean * modelY / 3) - modelN2 * Math.sin(lean * modelY / 3)
          let walkN2 = modelN3 * Math.sin(lean * modelY / 3) + modelN2 * Math.cos(lean * modelY / 3)
          let walkN1 = modelN1

          let zRotatedN1 = walkN1 * Math.cos(roll) - walkN2 * Math.sin(roll)
          let zRotatedN2 = walkN1 * Math.sin(roll) + walkN2 * Math.cos(roll)
          let zRotatedN3 = walkN3

          let xRotatedN3 = zRotatedN3 * Math.cos(pitch) - zRotatedN2 * Math.sin(pitch)
          let xRotatedN2 = zRotatedN3 * Math.sin(pitch) + zRotatedN2 * Math.cos(pitch)
          let xRotatedN1 = zRotatedN1

          let wRotatedN3 = xRotatedN3 * Math.cos(.2 * walk) - xRotatedN2 * Math.sin(.2 * walk)
          let wRotatedN2 = xRotatedN3 * Math.sin(.2 * walk) + xRotatedN2 * Math.cos(.2 * walk)
          let wRotatedN1 = xRotatedN1

          let rotatedN1 = wRotatedN1 * Math.cos(yaw) - wRotatedN3 * Math.sin(yaw)
          let rotatedN2 = wRotatedN2
          let rotatedN3 = wRotatedN1 * Math.sin(yaw) + wRotatedN3 * Math.cos(yaw)

          webgl.pointNormals.splice((this.pointIndices[i][j] + this.indexOffset) * 3, 3, 
            rotatedN1, 
            rotatedN2, 
            rotatedN3
          )
        }

    }


  }

  lerp(a, b, x) {
    return a + (b - a) * x
  }

  delete() {
    let allModelsLocation = Model.allModels.indexOf(this)

    if (allModelsLocation == -1) {
      console.log("this model has already been deleted")
      return
    }

    let deletedPoints = this.pointIndices.length * 3

    webgl.points.splice((this.pointIndices[0][0] + this.indexOffset) * 3, deletedPoints * 3)
    webgl.pointNormals.splice((this.pointIndices[0][0] + this.indexOffset) * 3, deletedPoints * 3)
    webgl.texCoords.splice((this.pointIndices[0][0] + this.indexOffset) * 2, deletedPoints * 2)

    webgl.pointCount -= deletedPoints

    
    for (let i = Model.allModels.indexOf(this); i < Model.allModels.length; i++) {
      Model.allModels[i].indexOffset -= deletedPoints
    }
    Model.allModels.splice(Model.allModels.indexOf(this), 1)

    this.pointIndices = []
  }

}




class PhysicalObject {
  constructor(x, y, z, yaw, lean, dimensions, collidableObjects) {
    this.position = { // world position
      x: x,
      y: y,
      z: z,
      yaw: yaw,
      lean: lean,
      pitch: 0,
      roll: 0
    }
    this.lastPosition = { // used for collision
      x: x,
      y: y,
      z: z,
      yaw: yaw,
      lean: lean,
      pitch: 0,
      roll: 0
    }
    this.serverPosition = { // updated in tick function
      x: x,
      y: y,
      z: z,
      yaw: yaw,
      lean: lean,
      pitch: 0,
      roll: 0
    }
    this.pastPositions = [ // optional use for smoothing
      {
        x: x,
        y: y,
        z: z,
        yaw: yaw,
        lean: lean,
        pitch: 0,
        roll: 0
      }
    ]
    // dimensions used for collision
    this.dimensions = dimensions

    this.models = {}

    this.collidableObjects = collidableObjects || [] // ex. [platforms, players]






  }

  smoothPosition(currentTickStage) {
    this.position = {
      x: this.serverPosition.x + (this.serverPosition.x - this.lastPosition.x) * currentTickStage,
      y: this.serverPosition.y + (this.serverPosition.y - this.lastPosition.y) * currentTickStage,
      z: this.serverPosition.z + (this.serverPosition.z - this.lastPosition.z) * currentTickStage,
      yaw: this.serverPosition.yaw + (this.serverPosition.yaw - this.lastPosition.yaw) * currentTickStage,
      lean: this.serverPosition.lean + (this.serverPosition.lean - this.lastPosition.lean) * currentTickStage
    }

    this.state = {
      walkCycle: this.serverState.walkCycle + (this.serverState.walkCycle - this.lastState.walkCycle) * currentTickStage,
      crouchValue: this.serverState.crouchValue + (this.serverState.crouchValue - this.lastState.crouchValue) * currentTickStage,
      slideValue: this.serverState.slideValue + (this.serverState.slideValue - this.lastState.slideValue) * currentTickStage
    }
    
    this.pastPositions.splice(0, 0, this.position)
    this.pastPositions.splice(100)

    this.pastStates.splice(0, 0, this.state)
    this.pastStates.splice(100)

    let smoothing = 5
    if (smoothing > this.pastPositions.length) smoothing = this.pastPositions.length
    if (smoothing == 0) return

    let smoothedPosition = {
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
      lean: 0
    }
    let smoothedState = {
      walkCycle: 0,
      crouchValue: 0,
      slideValue: 0
    }
    for (let j = 0; j < smoothing; j++) {
      smoothedPosition.x += this.pastPositions[j].x / smoothing,
      smoothedPosition.y += this.pastPositions[j].y / smoothing,
      smoothedPosition.z += this.pastPositions[j].z / smoothing,
      smoothedPosition.yaw += this.pastPositions[j].yaw / smoothing,
      smoothedPosition.lean += this.pastPositions[j].lean / smoothing

      smoothedState.walkCycle += this.pastStates[j].walkCycle / smoothing
      smoothedState.crouchValue += this.pastStates[j].crouchValue / smoothing
      smoothedState.slideValue += this.pastStates[j].slideValue / smoothing
    }

    this.position = smoothedPosition
    this.state = smoothedState

  }

  clearSmoothing() {
    this.pastPositions.splice(1)
  }

  calculateSlopes() {
    // calculate 6 slopes

    let x1 = this.lastPosition.x
    let x2 = this.position.x
    let y1 = this.lastPosition.y
    let y2 = this.position.y
    let z1 = this.lastPosition.z
    let z2 = this.position.z


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

  collision(lastPosition, position, movement, dimensions) {
    if (dimensions == null) dimensions = {
      mx: 0,
      px: 0,
      my: 0,
      py: 0,
      mz: 0,
      pz: 0
    }
    
    let mx = this.position.x + this.dimensions.mx - dimensions.px
    let px = this.position.x + this.dimensions.px - dimensions.mx
    let my = this.position.y + this.dimensions.my - dimensions.py
    let py = this.position.y + this.dimensions.py - dimensions.my
    let mz = this.position.z + this.dimensions.mz - dimensions.pz
    let pz = this.position.z + this.dimensions.pz - dimensions.mz

    let collision = {
      mx: {
        intersects: false,
        y: movement.y.dependX(mx),
        z: movement.z.dependX(mx),
        x: mx
      },
      my: {
        intersects: false,
        z: movement.z.dependY(my),
        x: movement.x.dependY(my),
        y: my
      },
      mz: {
        intersects: false,
        x: movement.x.dependZ(mz),
        y: movement.y.dependZ(mz),
        z: mz
      },
      px: {
        intersects: false,
        y: movement.y.dependX(px),
        z: movement.z.dependX(px),
        x: px
      },
      py: {
        intersects: false,
        z: movement.z.dependY(py),
        x: movement.x.dependY(py),
        y: py
      },
      pz: {
        intersects: false,
        x: movement.x.dependZ(pz),
        y: movement.y.dependZ(pz),
        z: pz
      }
    }

    // calculate if intersection is within bounds of face and that the point has passed the face in the dependent direction
    if (lastPosition.x <= mx && mx <= position.x) {
      if (my < collision.mx.y && collision.mx.y < py && mz < collision.mx.z && collision.mx.z < pz) {
        collision.mx.intersects = true
      }
    }

    if (lastPosition.x >= px && px >= position.x) {
      if (my < collision.px.y && collision.px.y < py && mz < collision.px.z && collision.px.z < pz) {
        collision.px.intersects = true
      }
    }

    if (lastPosition.y <= my && my <= position.y) {
      if (mz < collision.my.z && collision.my.z < pz && mx < collision.my.x && collision.my.x < px) {
        collision.my.intersects = true
      }
    }

    if (lastPosition.y >= py && py >= position.y) {
      if (mz < collision.py.z && collision.py.z < pz && mx < collision.py.x && collision.py.x < px) {
        collision.py.intersects = true
      }
    }

    if (lastPosition.z <= mz && mz <= position.z) {
      if (mx < collision.mz.x && collision.mz.x < px && my < collision.mz.y && collision.mz.y < py) {
        collision.mz.intersects = true
      }
    }
    
    if (lastPosition.z >= pz && pz >= position.z) {
      if (mx < collision.pz.x && collision.pz.x < px && my < collision.pz.y && collision.pz.y < py) {
        collision.pz.intersects = true
      }
    }

      

    return collision
  }

  remove() {
    for (let modelName in this.models) {
      this.models[modelName].delete()
    }
  }

}



class GamerTag {
  static allGamerTags = []
  constructor(name) {
    GamerTag.allGamerTags.push(this)

    this.geometryInfo = {
      positions: [
        [-.75,   0 , 0],
        [ .75,   0 , 0],
        [ .75,  .375, 0],
        [-.75,  .375, 0]
      ],

      normals: [
        [-0, -0,  1]
      ],

      texcoords: [
        [0,  0],
        [1,  0],
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
        }
      ]
    }

    let textureIndex = Object.keys(webgl.textures).length
    webgl.textures[name] = {
      index: textureIndex
    }
    let yLocation = parseInt(textureIndex / webgl.squareWidth, 10)
    let xLocation = textureIndex - yLocation * webgl.squareWidth
    webgl.ctx.fillStyle = "black"
    webgl.ctx.fillRect(xLocation * 64, yLocation * 64 + 51, 64, 13)
    webgl.ctx.fillStyle = "white"//"rgb(240, 215, 160)"
    webgl.ctx.fillRect(xLocation * 64 + 1, yLocation * 64 + 51, 62, 13)
    webgl.ctx.font = "100 15px sans-serif"
    let nameWidth = webgl.ctx.measureText(name).width
    webgl.ctx.fillStyle = "black"
    for (let i = 0; i < 3; i++) webgl.ctx.fillText(name, xLocation * 64 + ((nameWidth < 64) ? ((63 - nameWidth) / 2) : 1), yLocation * 64 + 63, 62)
    //webgl.ctx.fillStyle = "white"
    //for (let i = 0; i < 30; i++) webgl.ctx.strokeText(name, xLocation * 64 + ((nameWidth < 64) ? ((63 - nameWidth) / 2) : 1), yLocation * 64 + 63, 62)


    webgl.loadTexture(webgl.gl, webgl.textureMap)

    this.model = new Model(this.geometryInfo, 1, name, 0, 0, 0)
  }
}


class Particle extends PhysicalObject {
  constructor(x, y, z, movementVector, lifeSpan, collidableObjects) {
    super(x, y, z, 0, 0, {mx: -.1, px: .1, my: -.1, py: .1, mz: -.1, pz: .1}, collidableObjects)

    this.startTime = Date.now()
    this.lifeSpan = lifeSpan

    this.movementVector = movementVector

    this.geometryInfo = {
      positions: [
        [(Math.random() - .5)/3, (Math.random() - .5)/5, (Math.random() - .5)/2],
        [(Math.random() - .5)/1, (Math.random() - .5)/3, (Math.random() - .5)/3],
        [(Math.random() - .5)/1, (Math.random() - .5)/2, (Math.random() - .5)/1],
        [(Math.random() - .5)/2, (Math.random() - .5)/1, (Math.random() - .5)/1]
      ],
      normals: [
        [Math.random(), Math.random(), Math.random()]
      ],
      texcoords: [
        [0, 0],
        [0, 0],
        [0, 0]
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
          vertexes: [3, 0, 1],
          texcoords: [0, 1, 2],
          normals: [0, 0, 0]
        },
        {
          vertexes: [3, 2, 1],
          texcoords: [0, 1, 2],
          normals: [0, 0, 0]
        }
      ]
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        this.geometryInfo.positions[i][j] /= 1.5
      }
    }

    this.models.main = new Model(this.geometryInfo, 1, "purple", 0, 0, 0)

  }

  updateWorldPosition(deltaTime) {
    this.position.x += this.movementVector.x * deltaTime * .0035
    this.position.y += this.movementVector.y * deltaTime * .0035
    this.position.z += this.movementVector.z * deltaTime * .0035
    //this.position.yaw += deltaTime * .001

    this.models.main.scale = Math.sin(Math.sqrt((Date.now() - this.startTime) / this.lifeSpan) * Math.PI)
    this.models.main.setPosition(this.position.yaw, 0, 0, 0, this.position.x, this.position.y, this.position.z, this.geometryInfo)
  }

}


class Player extends PhysicalObject {
  static walkingSpeed = .0075
  static crouchingSpeed = .0025
  static sprintingSpeed = .015
  static slidingSpeed = .01
  static crouchingFOV = Math.PI * 0.33333
  static walkingFOV = Math.PI * 0.33333
  static sprintingFOV = Math.PI * 0.4
  static slidingFOV = Math.PI * 0.4
  static fovShiftSpeed = .0025
  static gravity = .00003
  static jumpForce = 0.05

  constructor(geometries, x, y, z, yaw, lean, health, id, name, collidableObjects) {
    super(x, y, z, yaw, lean, {mx: -.75, px: .75, my: 0, py: 2, mz: -.75, pz: .75}, collidableObjects)

    this.gamerTag = new GamerTag(name)



    this.geometries = geometries

    this.models.frontSlice = new Model(geometries.frontSlice, 1, "bread", 0, 1, .15)
    this.models.backSlice = new Model(geometries.backSlice, 1, "bread", 0, 1, -.15)

    // Stores this player's currently active weapons
    this.weapons = []

    this.cooldownTimer = 0
    this.currentCooldown = 1


    this.animation = {
      startMeshName: "idle",
      endMeshName: "idle",
      currentMeshName: "idle",
      speed: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      smooth: true,
      finished: true,
      stage: 1
    }

    this.id = id
    this.name = name

    this.health = health

    this.velocity = {x: 0, y: 0, z: 0}
    this.onGround = true
    this.movementState = "walking"

    this.slideCountown = 0
    this.state = {
      walkCycle: 0,
      crouchValue: 0,
      slideValue: 0
    }
    this.lastState = {
      walkCycle: 0,
      crouchValue: 0,
      slideValue: 0
    }
    this.serverState = {
      walkCycle: 0,
      crouchValue: 0,
      slideValue: 0
    }
    this.pastStates = [
      {
        walkCycle: 0,
        crouchValue: 0,
        slideValue: 0
      }
    ]


  }

  calculatePosition(deltaTime) {

    this.velocity.y -= Player.gravity * deltaTime // subtract by gravitational constant (units/frames^2)


    this.position.y += this.velocity.y * deltaTime


    this.onGround = false


    // calculate collisions
    let movement = this.calculateSlopes()
    for (let i = 0; i < this.collidableObjects.length; i++) {
      for (let j = 0; j < this.collidableObjects[i].length; j++) {
        let collision = this.collidableObjects[i][j].collision(this.lastPosition, this.position, movement, this.dimensions)
        if (collision.py.intersects) {
          this.position.y = collision.py.y
          this.velocity.y = 0
          this.onGround = true
        }
        if (collision.my.intersects) {
          this.position.y = collision.my.y
          this.velocity.y = 0
        }
        if (collision.mx.intersects) {
          this.position.x = collision.mx.x
          if (this.movementState == "sprinting" || this.movementState == "sliding") this.movementState = "walking"
        }
        if (collision.px.intersects) {
          this.position.x = collision.px.x
          if (this.movementState == "sprinting" || this.movementState == "sliding") this.movementState = "walking"
        }
        if (collision.mz.intersects) {
          this.position.z = collision.mz.z
          if (this.movementState == "sprinting" || this.movementState == "sliding") this.movementState = "walking"
        }
        if (collision.pz.intersects) {
          this.position.z = collision.pz.z
          if (this.movementState == "sprinting" || this.movementState == "sliding") this.movementState = "walking"
        }
      }
    }

  }

  updateWorldPosition(gamerTagAngleY, gamerTagAngleX) {
    this.gamerTag.model.setPosition(gamerTagAngleY, 0, gamerTagAngleX, 0, this.position.x, this.position.y + 2.75, this.position.z, this.gamerTag.geometryInfo)
    for (let ingredient in this.models) {
      this.models[ingredient].setPosition(this.position.yaw, this.position.lean, 0, 0, this.position.x, this.position.y, this.position.z, this.geometries[ingredient]/*, this.geometries[this.animation.endMeshName][ingredient], this.animation.stage*/, this.state.walkCycle, this.state.crouchValue, this.state.slideValue)
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
      finished: false,
      stage: 0
    }

  }


  updateAnimation() {
    if (this.animation == null) return
    if (!this.animation.smooth) stage = (Date.now() - this.animation.startTime) / (this.animation.endTime - this.animation.startTime)
    else this.animation.stage = (Math.cos(Math.PI * ((Date.now() - this.animation.startTime) / (this.animation.endTime - this.animation.startTime) - 1)) + 1) / 2
    if (Date.now() >= this.animation.endTime) {
      this.animation.finished = true
      this.animation.stage = 1
    }
  }


  remove() {
    super.remove()
    for (var weapon in this.weapons) {
      weapon.remove()
    }
    this.gamerTag.model.delete()
  }


}


class Weapon extends PhysicalObject {
  static allWeapons = []
  constructor(geometryInfos, type, collidableObjects, owner) {
    super(0, 0, 0, 0, 0, {mx: -.25, px: .25, my: -.25, py: .25, mz: -.25, pz: .25}, collidableObjects)
    Weapon.allWeapons.push(this)

    this.particles = []

    this.geometryInfos = geometryInfos
    this.type = type

    this.owner = owner

    // default settings
    this.class = "projectile"

    this.cooldown = 1 // seconds

    this.speed = .025 // units/millisecond
    this.manaCost = 20
    this.damage = 10 // this might be handled server

    this.chargeTime = 0 // seconds

    this.burstCount = 1
    this.burstInterval = .5 // time between shots of bursts, seconds

    this.scale = 1

    if (type == "tomato") {
      this.class = "projectile"

      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.models.main = new Model(geometryInfos.tomato, this.scale, "sub")
    }
    
    if (type == "olive") {
      this.class = "projectile"

      this.cooldown = .15
      this.manaCost = 5
      this.damage = 5

      this.scale = .925
      this.models.main = new Model(geometryInfos.olive, this.scale, "sub")
    }

    if (type == "pickle") {
      this.class = "projectile"

      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.models.main = new Model(geometryInfos.pickle, this.scale, "sub")
    }

    if (type == "sausage") {
      this.class = "melee"
    
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.models.main = new Model(geometryInfos.sausage, this.scale, "jerry")
    }

    
    if (type == "anchovy") {
      this.class = "missile"

      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.models.main = new Model(geometryInfos.anchovy, this.scale, "jerry")
    }


    if (type == "pan") {
      this.class = "melee"
    
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.models.main = new Model(geometryInfos.pan, this.scale, "sub")
    }



    this.shooted = false
    this.shootMovementVector = {
      x: 0,
      y: 0,
      z: 0      
    }

  }

  calculatePosition(deltaTime, socket) {

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].updateWorldPosition(deltaTime)
      if (Date.now() - this.particles[i].startTime > this.particles[i].lifeSpan) {
        this.particles[i].remove()
        this.particles.splice(i, 1)
      }
    }

    let distanceFromPlayer = 2 * (Math.cos(Math.PI * ((this.owner.currentCooldown - this.owner.cooldownTimer) / this.owner.currentCooldown - 1)) + 1) / 2
    if (!this.shooted) {
      this.models.main.scale = this.scale * distanceFromPlayer / 2
      
      this.position.x = this.owner.position.x + Math.cos(this.owner.position.yaw) * distanceFromPlayer
      this.position.y = this.owner.position.y + 1.5
      this.position.z = this.owner.position.z + Math.sin(this.owner.position.yaw) * distanceFromPlayer

    }
    if (!this.shooted) this.position.yaw = this.owner.position.yaw + ((this.class == "projectile") ? Date.now() / 1000 : 0)
    this.position.yaw += ((this.class == "projectile") ? deltaTime / 1000 : 0)

    if (!this.shooted) this.position.pitch = (this.class == "missile") ? this.owner.position.lean : 0
    //this.position.roll += ((this.class == "missile") ? deltaTime / 1000 : 0)

    this.lastPosition = {x: this.position.x, y: this.position.y, z: this.position.z}
    if (this.shooted) {
      this.position.x += this.shootMovementVector.x * deltaTime
      this.position.y += this.shootMovementVector.y * deltaTime
      this.position.z += this.shootMovementVector.z * deltaTime
    } else {
      return
    }

    for (let i = 0; i < this.collidableObjects.length; i++) {
      for (let j = 0; j < this.collidableObjects[i].length; j++) {
        if (this.collidableObjects[i][j] == null) continue
        let movement = this.calculateSlopes()
        let collision = this.collidableObjects[i][j].collision(this.lastPosition, this.position, movement, this.dimensions)

        for (let side in collision) {
          if (collision[side].intersects) {
            this.shooted = false
            this.position.x = collision[side].x
            this.position.y = collision[side].y
            this.position.z = collision[side].z

            if (this.collidableObjects[i][j] instanceof Player) {
              socket.emit("playerHit", {
                from: this.owner.id,
                target: this.collidableObjects[i][j].id,
                damage: this.damage
              })
            }

            this.remove()
          }
        }

      }
    }
  }

  updateWorldPosition() {
    if (Math.random() < 1 && this.shooted) for (let i = 0; i < 2; i++) this.particles.push(
      new Particle(this.position.x, this.position.y, this.position.z, {x: Math.random() - .5, y: Math.random() - .5, z: Math.random() - .5}, 1500, [])
    )

    this.models.main.setPosition(this.position.yaw, 0, this.position.pitch, this.position.roll, this.position.x, this.position.y, this.position.z, this.geometryInfos[this.type]/*, this.geometryInfos[this.type], 1*/, 0)
  }

  shoot(angleX, yaw) {
    angleX = -angleX + Math.PI / 64
    yaw = -yaw
    this.shootMovementVector.x = 0
    this.shootMovementVector.y = 0
    this.shootMovementVector.z = -this.speed

    let tempY = this.shootMovementVector.y
    let tempZ = this.shootMovementVector.z
    this.shootMovementVector.y = Math.cos(angleX) * tempY - Math.sin(angleX) * tempZ
    this.shootMovementVector.z = Math.sin(angleX) * tempY + Math.cos(angleX) * tempZ

    tempZ = this.shootMovementVector.z
    let tempX = this.shootMovementVector.x
    this.shootMovementVector.z = Math.cos(yaw) * tempZ - Math.sin(yaw) * tempX
    this.shootMovementVector.x = Math.sin(yaw) * tempZ + Math.cos(yaw) * tempX
/*
    this.position.z += -Math.sin(yaw)
    this.position.x += Math.cos(yaw)
    this.position.y += Math.cos(angleX)
    //this.position.z += Math.sin(angleX)
*/

    this.shooted = true

    return this.cooldown
  }


  remove() {
    super.remove()
    let allWeaponIndex = Weapon.allWeapons.indexOf(this)
    if (allWeaponIndex != -1) Weapon.allWeapons.splice(allWeaponIndex, 1)
    for (let i = 0; i < this.particles.length; i++) this.particles[i].remove()
  }
  

}



class Platform extends PhysicalObject {
  constructor(geometryInfo, type, x, y, z, scale) {
    super(x, y, z, 0, 0, {mx: 0, px: 0, my: 0, py: 0, mz: 0, pz: 0})
    this.scale = scale || 1

    let positions = geometryInfo[type].positions
    for (let i = 0; i < positions.length; i++) {
      this.dimensions = {
        mx: (positions[i][0] * this.scale < this.dimensions.mx) ? positions[i][0] * this.scale : this.dimensions.mx,
        px: (positions[i][0] * this.scale > this.dimensions.px) ? positions[i][0] * this.scale : this.dimensions.px,
        my: (positions[i][1] * this.scale < this.dimensions.my) ? positions[i][1] * this.scale : this.dimensions.my,
        py: (positions[i][1] * this.scale > this.dimensions.py) ? positions[i][1] * this.scale : this.dimensions.py,
        mz: (positions[i][2] * this.scale < this.dimensions.mz) ? positions[i][2] * this.scale : this.dimensions.mz,
        pz: (positions[i][2] * this.scale > this.dimensions.pz) ? positions[i][2] * this.scale : this.dimensions.pz
      }
    }

    this.texture = "jerry"

    if (type == "basic") {
      this.texture = "sub"
    }
    if (type == "crate") {
      this.texture = "wood"
    }
    if (type == "pinetree") {
      this.texture = "jerry"
      
      this.dimensions.mx = -.25 * this.scale
      this.dimensions.px = .25 * this.scale
      this.dimensions.mz = -.25 * this.scale
      this.dimensions.pz = .25 * this.scale

      //setInterval(() => {
      //  this.models.main.setPosition(0, Math.sin(Date.now() / 500) / 5, 0, 0, this.position.x, this.position.y - .1 * this.scale, this.position.z, geometryInfo[type], geometryInfo[type], 1)
      //}, 20)
    }

    this.models.main = new Model(geometryInfo[type], this.scale, this.texture)
    this.models.main.setPosition(0, 0, 0, 0, this.position.x, this.position.y, this.position.z, geometryInfo[type], 0)
  }


}


class Ground {
  constructor(geometryInfo) {
    console.log(geometryInfo)

    this.model = new Model(geometryInfo, 1, "jerry")

    let xValues = []
    let positions = geometryInfo.positions
    for (let i = 0; i < positions.length; i++) xValues.push(positions[i][0])

    xValues.sort((a, b) => { return a - b })
    this.xMin = xValues[0]

    //let xDifferenceTotal = 0
    let xDifferenceCount = 0
    for (let i = 0; i < xValues.length - 1; i++) {
      let difference = xValues[i + 1] - xValues[i]
      if (Math.abs(difference) > 0.1) {
        //xDifferenceTotal += difference
        xDifferenceCount++
      }
    }
    this.xWidth = (xValues[xValues.length - 1] - xValues[0]) / xDifferenceCount


    positions.sort((a, b) => { return a[0] - b[0] })
    let positionsMap = []
    let index = -1
    for (let i = 0; i < positions.length; i++) {
      if (i == 0 || (positions[i][0] - positions[i-1][0]) > .1) {
        positionsMap.push([])
        index++
      }
      positionsMap[index].push(positions[i])
    }
    for (let i = 0; i < positionsMap.length; i++) positionsMap[i].sort((a, b) => { return a[2] - b[2] })
    this.zMin = positionsMap[0][0][2]
    
    this.heightMap = []
    for (let i = 0; i < positionsMap.length; i++) {
      this.heightMap.push([])
      for (let j = 0; j < positionsMap[i].length; j++) {
        this.heightMap[i].push(positionsMap[i][j][1])
      }
    }


  }

  lerp(a, b, x) {
    return a + (b - a) * x
  }

  hypotenuse (a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
  }
  
  collision(lastPosition, position, movement, dimensions) {
    
    let xIndex = parseInt((position.x - this.xMin) / this.xWidth, 10)
    let zIndex = parseInt((position.z - this.zMin) / this.xWidth, 10)

    //console.log(xIndex + ", " + zIndex)

    let xPositionInSquare = ((position.x - this.xMin) % this.xWidth) / this.xWidth
    let zPositionInSquare = ((position.z - this.zMin) % this.xWidth) / this.xWidth

    //let yPositionX = this.lerp(this.heightMap[xIndex][zIndex], this.heightMap[xIndex+1][zIndex], xPositionInSquare)

    //console.log(xIndex / this.heightMap.length)

    let yPosition = -1000000

    if (0 <= xIndex && xIndex + 1 < this.heightMap.length && 0 <= zIndex && zIndex + 1 < this.heightMap[0].length) {
      let yMinX = this.lerp(this.heightMap[xIndex][zIndex], this.heightMap[xIndex][zIndex+1], zPositionInSquare)
      let yPluX = this.lerp(this.heightMap[xIndex+1][zIndex], this.heightMap[xIndex+1][zIndex+1], zPositionInSquare)

      yPosition = this.lerp(yMinX, yPluX, xPositionInSquare)
    }



    return {
      mx: {
        intersects: false,
        y: 0,
        z: 0,
        x: 0
      },
      my: {
        intersects: false,
        z: 0,
        x: 0,
        y: 0
      },
      mz: {
        intersects: false,
        x: 0,
        y: 0,
        z: 0
      },
      px: {
        intersects: false,
        y: 0,
        z: 0,
        x: 0
      },
      py: {
        intersects: (position.y < yPosition - dimensions.my),
        z: position.z,
        x: position.x,
        y: yPosition - dimensions.my
      },
      pz: {
        intersects: false,
        x: 0,
        y: 0,
        z: 0
      }
    }
  }




}






export default { webgl, Point, Model, PhysicalObject, Player, Weapon, Platform, Ground }
