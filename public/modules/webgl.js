

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
      url: "./assets/textures/PlayerBreadTex (1).png",
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
    tomato: {
      url: "data:image/jpeg;base64,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",
      index: 5
    },
    olive: {
      url: "data:image/jpeg;base64,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",
      index: 6
    },
    pickle: {
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAA1BMVEV9Js3dWPvwAAAASElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AcUIAAFkqh/QAAAAAElFTkSuQmCC",
      index: 7
    },


  },

  canvas: undefined,
  ctx: undefined,

  loadedImages: [],
  squareWidth: null,





  initialize: function () {

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

    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")
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
        let loadedAll = true
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

    webgl.canvas.width = webgl.squareWidth * 64
    webgl.canvas.height = webgl.squareWidth * 64
    //document.body.appendChild(webgl.canvas)
    webgl.canvas.style.imageRendering = "pixelated"
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

  renderFrame: function (playerPosition, camera) {





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
      for (let j in camera.collidableObjects[i]) {
        if (camera.collidableObjects[i][j] == null) continue
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
        dependY: function (y) { return ((x2 - x1) / (y2 - y1) * y + ((x2 - x1) / (y2 - y1) * -y1) + x1) },
        dependZ: function (z) { return ((x2 - x1) / (z2 - z1) * z + ((x2 - x1) / (z2 - z1) * -z1) + x1) }
      },
      y: {
        dependZ: function (z) { return ((y2 - y1) / (z2 - z1) * z + ((y2 - y1) / (z2 - z1) * -z1) + y1) },
        dependX: function (x) { return ((y2 - y1) / (x2 - x1) * x + ((y2 - y1) / (x2 - x1) * -x1) + y1) }
      },
      z: {
        dependX: function (x) { return ((z2 - z1) / (x2 - x1) * x + ((z2 - z1) / (x2 - x1) * -x1) + z1) },
        dependY: function (y) { return ((z2 - z1) / (y2 - y1) * y + ((z2 - z1) / (y2 - y1) * -y1) + z1) }
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

    this.name = name

    this.geometryInfo = {
      positions: [
        [-.75, 0, 0],
        [.75, 0, 0],
        [.75, .375, 0],
        [-.75, .375, 0]
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
        }
      ]
    }

    this.textureIndex = Object.keys(webgl.textures).length
    webgl.textures[this.name] = {
      index: this.textureIndex
    }
    let yLocation = parseInt(this.textureIndex / webgl.squareWidth, 10)
    let xLocation = this.textureIndex - yLocation * webgl.squareWidth
    webgl.ctx.fillStyle = "black"
    webgl.ctx.fillRect(xLocation * 64, yLocation * 64 + 51, 64, 13)
    webgl.ctx.fillStyle = "white"//"rgb(240, 215, 160)"
    webgl.ctx.fillRect(xLocation * 64 + 1, yLocation * 64 + 51, 62, 13)
    webgl.ctx.font = "100 15px sans-serif"

    let nameWidth = webgl.ctx.measureText(this.name).width
    webgl.ctx.fillStyle = "black"
    for (let i = 0; i < 3; i++) webgl.ctx.fillText(this.name, xLocation * 64 + ((nameWidth < 64) ? ((63 - nameWidth) / 2) : 1), yLocation * 64 + 63, 62)
    //webgl.ctx.fillStyle = "white"
    //for (let i = 0; i < 30; i++) webgl.ctx.strokeText(name, xLocation * 64 + ((nameWidth < 64) ? ((63 - nameWidth) / 2) : 1), yLocation * 64 + 63, 62)



    webgl.loadTexture(webgl.gl, webgl.textureMap)

    this.model = new Model(this.geometryInfo, 1, this.name, 0, 0, 0)
  }


  changeName(newName) {

    delete webgl.textures[this.name]
    this.name = newName
    webgl.textures[newName] = {
      index: this.textureIndex
    }
    this.model.texture = newName

    let yLocation = parseInt(this.textureIndex / webgl.squareWidth, 10)
    let xLocation = this.textureIndex - yLocation * webgl.squareWidth
    webgl.ctx.fillStyle = "black"
    webgl.ctx.fillRect(xLocation * 64, yLocation * 64 + 51, 64, 13)
    webgl.ctx.fillStyle = "white"//"rgb(240, 215, 160)"
    webgl.ctx.fillRect(xLocation * 64 + 1, yLocation * 64 + 51, 62, 13)
    webgl.ctx.font = "100 15px sans-serif"
    let nameWidth = webgl.ctx.measureText(this.name).width
    webgl.ctx.fillStyle = "black"
    for (let i = 0; i < 3; i++) webgl.ctx.fillText(this.name, xLocation * 64 + ((nameWidth < 64) ? ((63 - nameWidth) / 2) : 1), yLocation * 64 + 63, 62)

    webgl.loadTexture(webgl.gl, webgl.textureMap)
  }

}


class Particle extends PhysicalObject {
  constructor(texture, x, y, z, movementVector, lifeSpan, collidableObjects) {
    super(x, y, z, 0, 0, { mx: -.1, px: .1, my: -.1, py: .1, mz: -.1, pz: .1 }, collidableObjects)

    this.texture = texture

    this.startTime = Date.now()
    this.lifeSpan = lifeSpan

    this.movementVector = movementVector

    this.geometryInfo = {
      positions: [
        [(Math.random() - .5) / 3, (Math.random() - .5) / 5, (Math.random() - .5) / 2],
        [(Math.random() - .5) / 1, (Math.random() - .5) / 3, (Math.random() - .5) / 3],
        [(Math.random() - .5) / 1, (Math.random() - .5) / 2, (Math.random() - .5) / 1],
        [(Math.random() - .5) / 2, (Math.random() - .5) / 1, (Math.random() - .5) / 1]
      ],
      normals: [
        [Math.random(), Math.random(), Math.random()]
      ],
      texcoords: [
        [0.1, 0.1],
        [0.9, 0.1],
        [0.9, 0.9]
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

    this.models.main = new Model(this.geometryInfo, 1, this.texture, 0, 0, 0)

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
  static jumpForce = 0.015

  constructor(geometries, x, y, z, yaw, lean, health, id, name, collidableObjects) {
    super(x, y, z, yaw, lean, { mx: -.75, px: .75, my: 0, py: 2, mz: -.75, pz: .75 }, collidableObjects)

    this.gamerTag = new GamerTag(name)



    this.geometries = geometries

    this.models.frontSlice = new Model(geometries.frontSlice, 1, "bread", 0, 1, .15)
    this.models.backSlice = new Model(geometries.backSlice, 1, "bread", 0, 1, -.15)

    // Stores this player's currently active weapons
    this.weapons = []
    this.currentWeaponType
    this.inventory = {}

    this.cooldownTimer = 0
    this.currentCooldown = 1

    this.id = id
    this.name = name
    this.lastName = this.name

    this.health = health

    this.velocity = { x: 0, y: 0, z: 0 }
    this.lastVelocity = { x: 0, y: 0, z: 0 }
    this.onGround = true
    this.hittingHead = true
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
    this.lastVelocity = { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z}

    this.velocity.y -= Player.gravity * deltaTime // subtract by gravitational constant (units/frames^2)


    this.position.y += this.velocity.y * deltaTime


    this.onGround = false
    this.hittingHead = false

    if (this.movementState == "walking" || this.movementState == "sprinting") this.dimensions = {
      mx: -.75,
      px: .75,
      my: 0,
      py: 2,
      mz: -.75,
      pz: .75
    }
    else if (this.movementState == "crouching" || this.movementState == "sliding") this.dimensions = {
      mx: -.75,
      px: .75,
      my: 0,
      py: 2,
      mz: -.75,
      pz: .75
    }


    // calculate collisions
    let movement = this.calculateSlopes()
    for (let i = 0; i < this.collidableObjects.length; i++) {
      for (let j in this.collidableObjects[i]) {
        if (this.collidableObjects[i][j] == null) continue
        let collision = this.collidableObjects[i][j].collision(this.lastPosition, this.position, movement, this.dimensions)
        if (collision.py.intersects) {
          this.position.y = collision.py.y
          this.velocity.y = 0
          this.onGround = true
        }
        if (collision.my.intersects) {
          this.position.y = collision.my.y
          this.velocity.y = 0
          this.hittingHead = true
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

  updateCooldown(deltaTime) {
    if (isNaN(deltaTime)) deltaTime = 0
    this.cooldownTimer -= deltaTime / 1000
    if (this.cooldownTimer < 0) this.cooldownTimer = 0
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
    for (var i in this.weapons) {
      this.weapons[i].remove()
    }
    this.inventory.currentWeapon.remove()
    this.gamerTag.model.delete()
  }
}


class Weapon extends PhysicalObject {
  static allWeapons = []
  static gravity = 0.00001
  constructor(geometryInfos, type, collidableObjects, owner) {
    super(0, 0, 0, 0, 0, { mx: -.25, px: .25, my: -.25, py: .25, mz: -.25, pz: .25 }, collidableObjects)
    Weapon.allWeapons.push(this)

    this.shootSoundEffect = new Audio("./assets/wet_wriggling_noises/breeze-of-blood-122253.mp3")
    this.shootSoundEffect.currentTime = 0.25

    this.particles = []
    this.particleSpawnCounter = 0

    this.geometryInfos = geometryInfos
    this.type = type

    this.owner = owner

    // default settings
    this.class = "projectile"
    this.texture = "jerry"

    this.cooldown = 1 // seconds

    this.speed = .025 // units/millisecond
    this.manaCost = 20
    this.damage = 10 // this might be handled server

    this.chargeTime = 0 // seconds

    this.burstCount = 1
    this.burstInterval = .5 // time between shots of bursts, seconds

    this.scale = 1


    switch (type) {
      case "tomato":
        this.class = "projectile"
        this.texture = "tomato"

        this.cooldown = .5
        this.manaCost = 5
        this.damage = 5

        this.scale = .625
        this.models.main = new Model(geometryInfos.tomato, this.scale, this.texture)
        break
      case "olive":
        this.class = "projectile"
        this.texture = "olive"

        this.cooldown = .15
        this.manaCost = 5
        this.damage = 10

        this.scale = .5//.925
        this.models.main = new Model(geometryInfos.olive, this.scale, this.texture)
        break
      case "pickle":
        this.class = "projectile"
        this.texture = "olive"

        this.cooldown = .5
        this.manaCost = 5
        this.damage = 5

        this.scale = .625
        this.models.main = new Model(geometryInfos.pickle, this.scale, this.texture)
        break
      case "sausage":
        this.class = "melee"
        this.texture = "jerry"

        this.cooldown = .5
        this.manaCost = 5
        this.damage = 5

        this.scale = .625
        this.models.main = new Model(geometryInfos.sausage, this.scale, this.texture)
        break
      case "anchovy":
        this.class = "missile"
        this.texture = "jerry"

        this.cooldown = .5
        this.manaCost = 5
        this.damage = 25
        this.speed = .01

        this.scale = 1
        this.models.main = new Model(geometryInfos.anchovy, this.scale, this.texture)
        break
      case "pan":
        this.class = "melee"
        this.texture = "sub"

        this.cooldown = .5
        this.manaCost = 5
        this.damage = 5

        this.scale = 1
        this.models.main = new Model(geometryInfos.pan, this.scale, this.texture)
        break
    }



    this.shooted = false
    this.velocity = {
      x: 0,
      y: 0,
      z: 0
    }

  }

  calculatePosition(deltaTime, socket) {

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].updateWorldPosition(deltaTime)
      if (Date.now() - this.particles[i].startTime > this.particles[i].lifeSpan) {
        this.particles[i].remove()
        this.particles.splice(i, 1)
      }
      else continue
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

    this.lastPosition = { x: this.position.x, y: this.position.y, z: this.position.z }
    if (this.shooted) {
      this.position.x += this.velocity.x * deltaTime
      this.position.y += this.velocity.y * deltaTime
      this.position.z += this.velocity.z * deltaTime

      if (this.class == "projectile") this.velocity.y -= Weapon.gravity * deltaTime
    } else {
      return
    }

    for (let i = 0; i < this.collidableObjects.length; i++) {
      for (let j in this.collidableObjects[i]) {
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
    this.particleSpawnCounter++
    if (this.particleSpawnCounter % 4 == 0 && this.shooted) for (let i = 0; i < 5; i++) this.particles.push(
      new Particle(this.texture, this.position.x, this.position.y, this.position.z, { x: Math.random() - .5, y: Math.random() - .5, z: Math.random() - .5 }, 1500, [])
    )

    this.models.main.setPosition(this.position.yaw, 0, this.position.pitch, this.position.roll, this.position.x, this.position.y, this.position.z, this.geometryInfos[this.type]/*, this.geometryInfos[this.type], 1*/, 0)
  }

  /*shoot(angleX, yaw) {
    if (this.class == "projectile") angleX = -angleX + Math.PI / 8
    else angleX = -angleX + Math.PI / 64
    yaw = -yaw
    this.velocity.x = 0
    this.velocity.y = 0
    this.velocity.z = -this.speed

    let tempY = this.velocity.y
    let tempZ = this.velocity.z
    this.velocity.y = Math.cos(angleX) * tempY - Math.sin(angleX) * tempZ
    this.velocity.z = Math.sin(angleX) * tempY + Math.cos(angleX) * tempZ

    tempZ = this.velocity.z
    let tempX = this.velocity.x
    this.velocity.z = Math.cos(yaw) * tempZ - Math.sin(yaw) * tempX
    this.velocity.x = Math.sin(yaw) * tempZ + Math.cos(yaw) * tempX

    this.velocity.x += this.owner.velocity.x
    this.velocity.y += this.owner.velocity.y
    this.velocity.z += this.owner.velocity.z
 

    this.shooted = true

    return this.cooldown
  }*/

  getShootVelocity(angleX, yaw) {
    if (this.class == "projectile") angleX = -angleX + Math.PI / 8
    else angleX = -angleX + Math.PI / 64
    if (angleX > Math.PI / 2) angleX = Math.PI / 2
    yaw = -yaw
    this.velocity.x = 0
    this.velocity.y = 0
    this.velocity.z = -this.speed

    let tempY = this.velocity.y
    let tempZ = this.velocity.z
    this.velocity.y = Math.cos(angleX) * tempY - Math.sin(angleX) * tempZ
    this.velocity.z = Math.sin(angleX) * tempY + Math.cos(angleX) * tempZ

    tempZ = this.velocity.z
    let tempX = this.velocity.x
    this.velocity.z = Math.cos(yaw) * tempZ - Math.sin(yaw) * tempX
    this.velocity.x = Math.sin(yaw) * tempZ + Math.cos(yaw) * tempX

    this.velocity.x += this.owner.velocity.x
    this.velocity.y += this.owner.velocity.y
    this.velocity.z += this.owner.velocity.z


    return this.velocity
  }


  remove() {
    super.remove()
    let allWeaponIndex = Weapon.allWeapons.indexOf(this)
    if (allWeaponIndex != -1) Weapon.allWeapons.splice(allWeaponIndex, 1)
    for (let i = 0; i < this.particles.length; i++)// window.setTimeout(() => {
      this.particles[i].remove()
    //}, (this.particles[i].startTime + this.particles[i].lifeSpan) - Date.now())
  }


}



class Platform extends PhysicalObject {
  constructor(geometryInfo, type, x, y, z, scale) {
    super(x, y, z, 0, 0, { mx: 0, px: 0, my: 0, py: 0, mz: 0, pz: 0 })
    this.scale = scale || 1

    let positions = geometryInfo[type].positions
    for (let i = 0; i < positions.length; i++) {
      this.dimensions = {
        mx: (positions[i][0] * this.scale < this.dimensions.mx || i == 0) ? positions[i][0] * this.scale : this.dimensions.mx,
        px: (positions[i][0] * this.scale > this.dimensions.px || i == 0) ? positions[i][0] * this.scale : this.dimensions.px,
        my: (positions[i][1] * this.scale < this.dimensions.my || i == 0) ? positions[i][1] * this.scale : this.dimensions.my,
        py: (positions[i][1] * this.scale > this.dimensions.py || i == 0) ? positions[i][1] * this.scale : this.dimensions.py,
        mz: (positions[i][2] * this.scale < this.dimensions.mz || i == 0) ? positions[i][2] * this.scale : this.dimensions.mz,
        pz: (positions[i][2] * this.scale > this.dimensions.pz || i == 0) ? positions[i][2] * this.scale : this.dimensions.pz
      }
    }


    // SPLIT UP INTO CUBES //

    /*
    Steps:

    find edges

    cut off rectangular prisms as they are found

    repeat for model with found rectprism cut off


    */

    //this.dimensions = []




    this.texture = "olive" // default to jerry texture

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
      if (i == 0 || (positions[i][0] - positions[i - 1][0]) > .1) {
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

  hypotenuse(a, b) {
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
      let yMinX = this.lerp(this.heightMap[xIndex][zIndex], this.heightMap[xIndex][zIndex + 1], zPositionInSquare)
      let yPluX = this.lerp(this.heightMap[xIndex + 1][zIndex], this.heightMap[xIndex + 1][zIndex + 1], zPositionInSquare)

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

  remove() {
    this.model.delete()
  }


}






export default { webgl, Point, Model, PhysicalObject, Player, Weapon, Platform, Ground }
