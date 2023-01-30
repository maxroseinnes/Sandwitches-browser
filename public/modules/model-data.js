

var fetchObj = (name) => {
    
    let xhr = new XMLHttpRequest()
    xhr.open("GET", "./assets/models/" + name, false)
    xhr.send()

    return xhr.response
}

var obj = {

  parseWords: function(string) {
    let words = []
    let currentWord = ""
    for (let i = 0; i < string.length; i++) {
        if (string[i] != " ") currentWord += string[i]
        else {
            words.push(currentWord)
            currentWord = ""
        }
    } words.push(currentWord)
    return words
  },

  parseLines: function(string) {
    let lines = []
    let currentLine = ""
    for (let i = 0; i < string.length; i++) {
        if (string[i] != "\n") currentLine += string[i]
        else {
            lines.push(currentLine)
            currentLine = ""
        }
    } lines.push(currentLine)
    return lines
  },

  parseFloats: function(words) {
    let floats = []
    for (let i = 0; i < words.length; i++) {
        floats.push(parseFloat(words[i]))
    }
    return floats
  },

  triangulate: function(indices) {
    let newIndices = []
    for (let i = 0; i < indices.length; i++) {
        let currentIndices = indices[i]

        for (let j = 0; j < currentIndices.vertexes.length - 2; j++) {
            newIndices.push({
                vertexes: [currentIndices.vertexes[0], currentIndices.vertexes[j+1], currentIndices.vertexes[j+2]],
                texcoords: [currentIndices.texcoords[0], currentIndices.texcoords[j+1], currentIndices.texcoords[j+2]],
                normals: [currentIndices.normals[0], currentIndices.normals[j+1], currentIndices.normals[j+2]]
            })
        }

    }
    return newIndices
  },





  parseWavefront: function(fileText, seperateObjects, triangulate) {
    let lines = this.parseLines(fileText)

    // find all objects
    let objectStartIndices = []
    if (seperateObjects) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].slice(0, lines[i].indexOf(" ")) == "o") {
                objectStartIndices.push(i)
            }
        } objectStartIndices.push(lines.length)
    }
    else objectStartIndices = [0, lines.length]

    let objects = {}
    let material // string
    for (let o = 0; o < objectStartIndices.length - 1; o++) {

        let totalBeforeVertices = 0
        for (let object in objects) totalBeforeVertices += objects[object].positions.length

        let totalBeforeTexcords = 0
        for (let object in objects) totalBeforeTexcords += objects[object].texcoords.length

        let totalBeforeNormals = 0
        for (let object in objects) totalBeforeNormals += objects[object].normals.length


        let name
        let smooth // boolean
        let positions = []
        let normals = []
        let texcoords = []
        let indices = []


        for (let i = objectStartIndices[o]; i < objectStartIndices[o+1]; i++) {

            // find first word in line
            let identifier = lines[i].slice(0, lines[i].indexOf(" "))

            // get line after identifier
            let currentLine = lines[i].slice(lines[i].indexOf(" ") + 1)

            if (identifier == "o") {
                if (currentLine.indexOf(String.fromCharCode([13])) == -1) name = currentLine
                else name = currentLine.slice(0, -1)
            }

            if (identifier == "v") positions.push(this.parseFloats(this.parseWords(currentLine)))

            if (identifier == "vn") normals.push(this.parseFloats(this.parseWords(currentLine)))

            if (identifier == "vt") texcoords.push(this.parseFloats(this.parseWords(currentLine)))

            if (identifier == "s") {
                if (Number(currentLine) == 0) smooth = false
                else smooth = true
            }

            if (identifier == "usemtl") material = currentLine

            if (identifier == "f") {
                let v = []
                let t = []
                let n = []

                let words = this.parseWords(currentLine)
                for (let j = 0; j < words.length; j++) {
                    v.push(parseInt(words[j].slice(0, words[j].indexOf("/")), 10) - 1 - totalBeforeVertices)
                    words[j] = words[j].slice(words[j].indexOf("/") + 1)

                    t.push(parseInt(words[j].slice(0, words[j].indexOf("/")), 10) - 1 - totalBeforeTexcords)
                    words[j] = words[j].slice(words[j].indexOf("/") + 1)

                    n.push(parseInt(words[j], 10) - 1 - totalBeforeNormals)
                }

                indices.push({
                    vertexes: v,
                    texcoords: t,
                    normals: n
                })
            }
        }

        objects[name] = {
            positions: positions,
            normals: normals,
            texcoords: texcoords,
            smooth: smooth,
            material: material,
            indices: (triangulate == null || triangulate) ? this.triangulate(indices) : indices
        }
    }

    for (let i in objects) if (objects[i].smooth) {
        // make a normal for every point
        let newNormals = []
        for (let j in objects[i].positions) {
            let connectedNormals = []
            for (let k in objects[i].indices) {
                for (let l in objects[i].indices[k].vertexes) {
                    if (objects[i].indices[k].vertexes[l] == j) {
                        connectedNormals.push(objects[i].normals[objects[i].indices[k].normals[l]])
                    }
                }
            }
            let averageNormal = [0, 0, 0]
            for (let k = 0; k < connectedNormals.length; k++) {
                for (let l in averageNormal) averageNormal[l] += connectedNormals[k][l] / connectedNormals.length
            }
            newNormals.push(averageNormal)
        }
        objects[i].normals = newNormals

        for (let j in objects[i].indices) {
            for (let k in objects[i].indices[j].vertexes) {
                objects[i].indices[j].normals[k] = objects[i].indices[j].vertexes[k]
            }
        }
    }

    if (seperateObjects) return objects
    else return Object.values(objects)[0]

  },

}

var generatePlatforms = (geometryInfo) => {
    let sub = (out, a, b) => {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    }

    let normalize = (out, a) => {
        var x = a[0],
        y = a[1];
        var len = Math.sqrt(x * x + y * y);
        if (len != 0) {
            out[0] = a[0] / len;
            out[1] = a[1] / len;
        }
        return out;
    }

    let length = (a) => {
        let x = a[0];
        let y = a[1];
        let z = a[2];
        return Math.hypot(x, y, z);
    }

    let rotateX = (out, a, b, rad) => {
        let p = [],
          r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];
        //perform rotation
        r[0] = p[0];
        r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
        r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
      }
      
      let rotateY = (out, a, b, rad) => {
        let p = [],
          r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];
        //perform rotation
        r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
        r[1] = p[1];
        r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
      }
      
      let rotateZ = (out, a, b, rad) => {
        let p = [],
          r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];
        //perform rotation
        r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
        r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
        r[2] = p[2];
        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
      }
      

    let platforms = []
    for (let i in geometryInfo.indices) {


        // new method: 1. rotate so that one side (vector) is [0, 0, 1] (normalized), 2. rotate other side so that it is flat (pitch)

        let points = []
        for (let j = 0; j < geometryInfo.indices[i].vertexes.length; j++) points.push([
            geometryInfo.positions[geometryInfo.indices[i].vertexes[j]][0], 
            geometryInfo.positions[geometryInfo.indices[i].vertexes[j]][1], 
            geometryInfo.positions[geometryInfo.indices[i].vertexes[j]][2]
        ])
        let getSideVector = (x, normalize, direction) => {
            let vector = []
            //console.log(x % points.length, points.length)
            sub(vector, points[(x + points.length * 3) % points.length], points[(x + points.length * 3 + direction) % points.length])
            if (normalize) {
                let length = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2))
                if (length != 0) {
                    vector[0] /= length
                    vector[1] /= length
                    vector[2] /= length
                }
            }
            return vector
        }

        let mostAxisAlignedVector = 0
        let mostAxisAlignedVectorValue = 0
        for (let j = 0; j < points.length; j++) {
            let vector = getSideVector(j, true, 1)
            for (let k = 0; k < 3; k++) {
                if (Math.abs(vector[k]) > mostAxisAlignedVectorValue) {
                    mostAxisAlignedVector = j
                    mostAxisAlignedVectorValue = Math.abs(vector[k])
                }
            }
            

        }


        let longestVector = 0
        let longestVectorLength = 0
        for (let j = 0; j < points.length; j++) if (length(getSideVector(j, false, 1)) > longestVectorLength) {longestVector = j; longestVectorLength = length(getSideVector(j, false, 1))}

        let shortestVectorLength = 9999999999999
        for (let j = 0; j < points.length; j++) if (length(getSideVector(j, false, 1)) < shortestVectorLength) shortestVectorLength = length(getSideVector(j, false, 1))


        let vecToAlign
        if (longestVectorLength / shortestVectorLength > 5) vecToAlign = getSideVector(longestVector, true, 1)
        else vecToAlign = getSideVector(mostAxisAlignedVector, true, 1)

        // roll only affects x and y
        let xy = [vecToAlign[0], vecToAlign[1]]
        normalize(xy, xy)
        let roll = (xy[0] > 0) ? Math.asin(xy[1]) : -Math.asin(xy[1])

        rotateZ(vecToAlign, vecToAlign, [0, 0, 0], -roll)


        let zx = [vecToAlign[2], vecToAlign[0]]
        normalize(zx, zx)
        let yaw = (zx[0] > 0) ? -Math.acos(zx[1]) : Math.acos(zx[1])

        rotateY(vecToAlign, vecToAlign, [0, 0, 0], -yaw)


        let otherVecToAlign = getSideVector(mostAxisAlignedVector, true, -1)
        rotateZ(otherVecToAlign, otherVecToAlign, [0, 0, 0], -roll)
        rotateY(otherVecToAlign, otherVecToAlign, [0, 0, 0], -yaw)

        // otherVecToAlign should be [0, y, z] -- rotate it's pitch to be [0, 0, 1]

        let yz = [otherVecToAlign[1], otherVecToAlign[2]]
        normalize(yz, yz)
        let pitch = (yz[0] < 0) ? Math.acos(yz[1]) : -Math.acos(yz[1])

        let center = [0, 0, 0]
        for (let i = 0; i < 3; i++) for (let j = 0; j < points.length; j++) center[i] += points[j][i] / points.length

        let layedFlatPoints = []
        for (let i = 0; i < points.length; i++) {
            layedFlatPoints[i] = []
            rotateZ(layedFlatPoints[i], points[i], center, -roll)
            rotateY(layedFlatPoints[i], layedFlatPoints[i], center, -yaw)
            rotateX(layedFlatPoints[i], layedFlatPoints[i], center, -pitch)
        }

        //console.log(layedFlatPoints)

        let dimensions = [[], []]
        for (let i = 0; i < 3; i++) {
            let mValue = 999999999
            let pValue = -999999999
            for (let k = 0; k < points.length; k++) {
                if (layedFlatPoints[k][i] - center[i] < mValue) {
                    dimensions[0][i] = layedFlatPoints[k][i] - center[i]
                    mValue = layedFlatPoints[k][i] - center[i]
                }
                if (layedFlatPoints[k][i] - center[i] > pValue) {
                    dimensions[1][i] = layedFlatPoints[k][i] - center[i]
                    pValue = layedFlatPoints[k][i] - center[i]
                }
            }
        }


        //console.log(dimensions)

        //if (Math.abs(dimensions[1][1] - dimensions[0][1]) > .01) continue

        let biggestDimension = 0
        for (let i in dimensions) for (let j in dimensions[i]) if (Math.abs(dimensions[i][j]) > biggestDimension) biggestDimension = Math.abs(dimensions[i][j])

        platforms.push({
            position: {
                x: center[0],
                y: center[1],
                z: center[2]
            },
            dimensions: {
                mx: dimensions[0][0],
                px: dimensions[1][0],
                my: dimensions[0][1],
                py: dimensions[1][1],
                mz: dimensions[0][2],
                pz: dimensions[1][2],
                pitch: -pitch,
                yaw: -yaw,
                roll: -roll,
                radius: biggestDimension,
            }
        })

    }

    return platforms
}



export default { fetchObj, obj, generatePlatforms }
