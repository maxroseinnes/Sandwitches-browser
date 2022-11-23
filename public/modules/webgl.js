

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

    this.squareWidth = Math.round(Math.sqrt(Object.keys(this.textures).length) + .499999)
    
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

  mergeImages: (gl, loadedImages, texture) => {



    let canvas = document.createElement("canvas")
    canvas.width = webgl.squareWidth * 64
    canvas.height = webgl.squareWidth * 64
    document.body.appendChild(canvas)
    canvas.style.imageRendering = "pixelated"
    let ctx = canvas.getContext("2d")
    //ctx.scale(-1, 1)

    for (let i = 0; i < loadedImages.length; i++) {
      if (loadedImages[i] != null) {
        let yLocation = parseInt(i / webgl.squareWidth, 10)
        let xLocation = i - yLocation * webgl.squareWidth

        ctx.drawImage(
          loadedImages[i], 
          xLocation * 64, yLocation * 64, 64, 64)
      }
      
    }
    ctx.restore()
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
    textures.src = canvas.toDataURL()


  },



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
  constructor(geometryInfo, scale, texture) {
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

        webgl.points.push(positions[indices[i].vertexes[j]][0] * scale, positions[indices[i].vertexes[j]][1] * scale, positions[indices[i].vertexes[j]][2] * scale)
        webgl.pointNormals.push(normals[indices[i].normals[j]][0], normals[indices[i].normals[j]][1], normals[indices[i].normals[j]][2])
        webgl.texCoords.push((texcoords[indices[i].texcoords[j]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[j]][1] + textureLocationY) / squareWidth)

        webgl.pointCount++
      }

      this.pointIndices.push(currentPointIndices)
    }
        



//heheheheheh goblin mdode


  }


  setPosition(yaw, lean, x, y, z, mesh, walkCycle, crouchValue, slideValue) {
    // lean is used only for player models leaning

    walkCycle = walkCycle || 0
    crouchValue = crouchValue || 0
    slideValue = slideValue || 0


    let geometryInfo = this.geometryInfo
    let indices = geometryInfo.indices

    for (let i = 0; i < this.pointIndices.length; i++) if (!isNaN(indices[i].vertexes[0]) && !isNaN(indices[i].vertexes[1]) && !isNaN(indices[i].vertexes[2]) && !isNaN(indices[i].normals[0]) && !isNaN(indices[i].normals[1]) && !isNaN(indices[i].normals[2]) && !isNaN(indices[i].texcoords[0]) && !isNaN(indices[i].texcoords[1])) {
        for (let j = 0; j < this.pointIndices[i].length; j++) {

          let modelX = /*this.lerp(*/mesh.positions[mesh.indices[i].vertexes[j]][0] * this.scale/*, mesh2.positions[mesh2.indices[i].vertexes[j]][0] * this.scale, stage)*/
          let modelY = /*this.lerp(*/mesh.positions[mesh.indices[i].vertexes[j]][1] * this.scale/*, mesh2.positions[mesh2.indices[i].vertexes[j]][1] * this.scale, stage)*/
          let modelZ = /*this.lerp(*/mesh.positions[mesh.indices[i].vertexes[j]][2] * this.scale/*, mesh2.positions[mesh2.indices[i].vertexes[j]][2] * this.scale, stage)*/

          let walk = Math.sin(walkCycle) * (2 - modelY) * Math.sin(modelX * 2)
          let walkX = modelX// + .25 * Math.sin(walkCycle) * (2 - modelY) * Math.sin(modelX)
          let walkY = modelY
          let walkZ = modelZ + .2 * walk

          let xRotatedZ = walkZ * this.scale * Math.cos(lean * walkY / 3) - walkY * this.scale * Math.sin(lean * walkY / 3)
          let xRotatedY = walkZ * this.scale * Math.sin(lean * walkY / 3) + walkY * this.scale * Math.cos(lean * walkY / 3)
          let xRotatedX = walkX * this.scale

          let rotatedX = xRotatedX * Math.cos(yaw) - xRotatedZ * Math.sin(yaw) + x
          let rotatedY = xRotatedY * (1 - (crouchValue / 2)) + y
          let rotatedZ = xRotatedX * Math.sin(yaw) + xRotatedZ * Math.cos(yaw) + z

          webgl.points.splice((this.pointIndices[i][j] + this.indexOffset) * 3, 3, 
            rotatedX, 
            rotatedY, 
            rotatedZ
          )

          

          let modelN1 = /*this.lerp(*/mesh.normals[mesh.indices[i].normals[j]][0]/*, mesh2.normals[mesh2.indices[i].normals[j]][0], stage)*/
          let modelN2 = /*this.lerp(*/mesh.normals[mesh.indices[i].normals[j]][1]/*, mesh2.normals[mesh2.indices[i].normals[j]][1], stage)*/
          let modelN3 = /*this.lerp(*/mesh.normals[mesh.indices[i].normals[j]][2]/*, mesh2.normals[mesh2.indices[i].normals[j]][2], stage)*/

          let xRotatedN3 = modelN3 * Math.cos(lean * modelY / 3) - modelN2 * Math.sin(lean * modelY / 3)
          let xRotatedN2 = modelN3 * Math.sin(lean * modelY / 3) + modelN2 * Math.cos(lean * modelY / 3)
          let xRotatedN1 = modelN1

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

    Model.allModels.splice(Model.allModels.indexOf(this), 1)

    let deletedPoints = this.pointIndices.length * 3

    webgl.points.splice((this.pointIndices[0][0] + this.indexOffset) * 3, deletedPoints * 3)
    webgl.pointNormals.splice((this.pointIndices[0][0] + this.indexOffset) * 3, deletedPoints * 3)
    webgl.texCoords.splice((this.pointIndices[0][0] + this.indexOffset) * 2, deletedPoints * 2)

    webgl.pointCount -= deletedPoints

    
    for (let i = 0; i < Model.allModels.length; i++) {
      if (Model.allModels[i].pointIndices[0][0] + Model.allModels[i].indexOffset >= this.pointIndices[0][0] + this.indexOffset){
        
        Model.allModels[i].indexOffset -= deletedPoints
      }
      
    }
    this.pointIndices = []
    console.log("deleted")
  }

}




class PhysicalObject {
  constructor(x, y, z, yaw, lean, dimensions, collidableObjects) {
    this.position = { // world position
      x: x,
      y: y,
      z: z,
      yaw: yaw,
      lean: lean
    }
    this.lastPosition = { // used for collision
      x: x,
      y: y,
      z: z,
      yaw: yaw,
      lean: lean
    }
    this.serverPosition = { // updated in tick function
      x: x,
      y: y,
      z: z,
      yaw: yaw,
      lean: lean
    }
    this.pastPositions = [ // optional use for smoothing
      {
        x: x,
        y: y,
        z: z,
        yaw: yaw,
        lean: lean
      }
    ]
    // dimensions used for collision
    this.dimensions = dimensions

    this.models = {}

    this.collidableObjects = collidableObjects || [] // ex. [platforms, players]






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



class Player extends PhysicalObject {
  constructor(geometries, x, y, z, yaw, lean, health, name, collidableObjects) {
    super(x, y, z, yaw, lean, {mx: -.75, px: .75, my: 0, py: 2, mz: -.75, pz: .75}, collidableObjects)

    this.geometries = geometries
    for (let ingredient in geometries.idle) {
      let scale = 1
      let texture = 0
      if (ingredient.indexOf("Slice") != -1) { texture = "bread"; }
      if (ingredient.indexOf("cheese") != -1) { texture = "jerry"; }
      if (ingredient.indexOf("meat") != -1) { texture = "sub"; }
      if (ingredient.indexOf("tomato") != -1) { scale = 1.05; texture = "jerry"; }
      this.models[ingredient] = new Model(geometries.idle[ingredient], scale, texture)
    }

    // Stores this player's currently active weapons
    this.weapons = []


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

    this.name = name

    this.health = health

    this.gravity = 0
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

    this.gravity -= .00003 * deltaTime // subtract by gravitational constant (units/frames^2)

    this.position.y += this.gravity * deltaTime


    this.onGround = false


    // calculate collisions
    let movement = this.calculateSlopes()
    for (let i = 0; i < this.collidableObjects.length; i++) {
      for (let j = 0; j < this.collidableObjects[i].length; j++) {
        let collision = this.collidableObjects[i][j].collision(this.lastPosition, this.position, movement, this.dimensions)
        if (collision.py.intersects) {
          this.position.y = collision.py.y
          this.gravity = 0
          this.onGround = true
        }
        if (collision.my.intersects) {
          this.position.y = collision.my.y
          this.gravity = 0
        }
        if (collision.mx.intersects) {
          this.position.x = collision.mx.x
        }
        if (collision.px.intersects) {
          this.position.x = collision.px.x
        }
        if (collision.mz.intersects) {
          this.position.z = collision.mz.z
        }
        if (collision.pz.intersects) {
          this.position.z = collision.pz.z
        }
      }
    }

  }

  updateWorldPosition() {
    for (let ingredient in this.models) {
      this.models[ingredient].setPosition(this.position.yaw, this.position.lean, this.position.x, this.position.y, this.position.z, this.geometries[/*this.animation.startMeshName*/"idle"][ingredient]/*, this.geometries[this.animation.endMeshName][ingredient], this.animation.stage*/, this.state.walkCycle, this.state.crouchValue, this.state.slideValue)
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




}


class Weapon extends PhysicalObject {
  constructor(geometryInfos, type, collidableObjects, owner) {
    super(0, 0, 0, 0, 0, {mx: -.25, px: .25, my: -.25, py: .25, mz: -.25, pz: .25}, collidableObjects)

    this.geometryInfos = geometryInfos
    this.type = type

    this.owner = owner

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
      this.models.main = new Model(geometryInfos.tomato, this.scale, "sub")
    }
    
    if (type == "olive") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .925
      this.models.main = new Model(geometryInfos.olive, this.scale, "sub")
    }

    if (type == "pickle") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.models.main = new Model(geometryInfos.pickle, this.scale, "sub")
    }

    if (type == "sausage") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.models.main = new Model(geometryInfos.sausage, this.scale, "jerry")
    }

    
    if (type == "anchovy") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.models.main = new Model(geometryInfos.anchovy, this.scale, "jerry")
    }


    if (type == "pan") {
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
        let movement = this.calculateSlopes()
        let collision = this.collidableObjects[i][j].collision(this.lastPosition, this.position, movement, this.dimensions)

        for (let side in collision) {
          if (collision[side].intersects) {
            this.shooted = false
            this.position.x = collision[side].x
            this.position.y = collision[side].y
            this.position.z = collision[side].z

            if (this.collidableObjects[i][j] instanceof Player) {

              console.log("hit " + this.collidableObjects[i][j].name)
              socket.emit("playerHit", {
                from: this.owner.name,
                target: this.collidableObjects[i][j].name,
                damage: this.damage
              })
            }
          }
        }

      }
    }
  }

  updateWorldPosition() {
    this.models.main.setPosition(this.position.yaw, 0, this.position.x, this.position.y, this.position.z, this.geometryInfos[this.type]/*, this.geometryInfos[this.type], 1*/, 0)
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



}



class Platform extends PhysicalObject {
  constructor(geometryInfo, type, x, y, z, scale) {
    super(x, y, z, 0, 0, {mx: 0, px: 0, my: 0, py: 0, mz: 0, pz: 0})
    this.scale = scale || 1

    if (type == "basic") {
      this.models.main = new Model(geometryInfo[type], this.scale, "sub")
      this.dimensions = {
        mx: -2.5 * this.scale * this.scale,
        px: 2.5 * this.scale * this.scale,
        my: 0,
        py: 1.5 * this.scale * this.scale,
        mz: -3 * this.scale * this.scale,
        pz: 3 * this.scale * this.scale
      }
      
      this.models.main.setPosition(0, 0, this.position.x, this.position.y, this.position.z, geometryInfo[type]/*, geometryInfo[type], 1*/, 0)
    }
    if (type == "crate") {
      this.models.main = new Model(geometryInfo[type], this.scale, "wood")
      this.dimensions = {
        mx: -1 * this.scale * this.scale,
        px: 1 * this.scale * this.scale,
        my: 0,
        py: 2 * this.scale * this.scale,
        mz: -1 * this.scale * this.scale,
        pz: 1 * this.scale * this.scale
      }

      this.models.main.setPosition(0, 0, this.position.x, this.position.y + this.dimensions.py / 2, this.position.z, geometryInfo[type]/*, geometryInfo[type], 1*/, 0)

    }
    if (type == "pinetree") {
      this.models.main = new Model(geometryInfo[type], this.scale, "jerry")
      this.dimensions = {
        mx: -.25 * this.scale * this.scale,
        px: .25 * this.scale * this.scale,
        my: 0,
        py: 5.8 * this.scale * this.scale,
        mz: -.25 * this.scale * this.scale,
        pz: .25 * this.scale * this.scale
      }

      //setInterval(() => {
      //  this.models.main.setPosition(0, Math.sin(Date.now() / 500) / 5, this.position.x, this.position.y - .1 * this.scale * this.scale, this.position.z, geometryInfo[type], geometryInfo[type], 1)
      //}, 20)

      this.models.main.setPosition(0, 0, this.position.x, this.position.y - .1 * this.scale * this.scale, this.position.z, geometryInfo[type]/*, geometryInfo[type], 1*/, 0)
    }
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
