
var sprites = []

class Mesh {
    constructor(positions, normals, vertexIndices, normalIndices, smooth) {



		this.x = Math.random() * 10
		this.y = 0
		this.z = Math.random() * 10


        this.polys = []

        if (!smooth) {
            // for each triangle: make three new points and a poly
    
    
    
            for (let i = 0; i < vertexIndices.length; i++) {
                let r = .5
                let g = .5
                let b = .5
                let point1 = new Point(positions[vertexIndices[i][0]][0] + this.x, positions[vertexIndices[i][0]][1] + this.y, positions[vertexIndices[i][0]][2] + this.z, normals[normalIndices[i][0]][0], normals[normalIndices[i][0]][1], normals[normalIndices[i][0]][2], r, g, b)
                let point2 = new Point(positions[vertexIndices[i][1]][0] + this.x, positions[vertexIndices[i][1]][1] + this.y, positions[vertexIndices[i][1]][2] + this.z, normals[normalIndices[i][1]][0], normals[normalIndices[i][1]][1], normals[normalIndices[i][1]][2], r, g, b)
                let point3 = new Point(positions[vertexIndices[i][2]][0] + this.x, positions[vertexIndices[i][2]][1] + this.y, positions[vertexIndices[i][2]][2] + this.z, normals[normalIndices[i][2]][0], normals[normalIndices[i][2]][1], normals[normalIndices[i][2]][2], r, g, b)
    
                this.polys.push(new Poly(point1, point2, point3))
            }

        }

        else {
            let points = []
            for (let i = 0; i < positions.length; i++) {
                let connectedPolys = []
                for (let j = 0; j < vertexIndices.length; j++) {
                    for (let k = 0; k < vertexIndices[i].length; k++) {
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


                points.push(new Point(positions[i][0] + this.x, positions[i][1] + this.y, positions[i][2] + this.z, averageNormalX, averageNormalY, averageNormalZ, .5, .5, .5))
            }
            
            for (let i = 0; i < vertexIndices.length; i++) {
                this.polys.push(new Poly(points[vertexIndices[i][0]], points[vertexIndices[i][1]], points[vertexIndices[i][2]]))
            }
        }


    }
}



function parseCollada(fileText) {
    let positionsStart = fileText.indexOf("<float_array")
    let positionsEnd   = fileText.indexOf("</float_array")

    let positionsText = fileText.slice(positionsStart, positionsEnd)
    fileText = fileText.slice(positionsEnd + 16)

    let positionsCount = parseInt(fileText.slice(fileText.indexOf("count") + 7, fileText.indexOf(" stride") - 1), 10)
    let positionsStride = parseInt(fileText.slice(fileText.indexOf("stride") + 8, fileText.indexOf('">')), 10)



    let normalsStart = fileText.indexOf("<float_array")
    let normalsEnd   = fileText.indexOf("</float_array")

    let normalsText = fileText.slice(normalsStart, normalsEnd)
    fileText = fileText.slice(normalsEnd + 16)

    let normalsCount = parseInt(fileText.slice(fileText.indexOf("count") + 7, fileText.indexOf(" stride") - 1), 10)
    let normalsStride = parseInt(fileText.slice(fileText.indexOf("stride") + 8, fileText.indexOf('">')), 10)


    let trianglesStart = fileText.indexOf("<triangles")
    let trianglesEnd   = fileText.indexOf("</p>")

    let trianglesText = fileText.slice(trianglesStart, trianglesEnd)

    // find triangle data types
    let triangleDataTypes = []
    {
        let findingInputs = true
        let i = 0
        while(findingInputs && i < 10) {
            let inputStart = trianglesText.indexOf("semantic") + 10
            if (trianglesText.indexOf("semantic") != -1) {
                trianglesText = trianglesText.slice(inputStart)
                let inputEnd = trianglesText.indexOf('"')
                triangleDataTypes.push(trianglesText.slice(0, inputEnd))
            }
            else findingInputs = false

            i++

        }
    }
    

    fileText = fileText.slice(trianglesEnd)

    // -- get data -- //

    let positions = []
    {
        let data = positionsText.slice(positionsText.indexOf(">") + 1)

        let currentValue = ""
        for (let i = 0; i < data.length; i++) {
            if (data[i] != " ") {
                currentValue += data[i]
            }
            else {
                positions.push(parseFloat(currentValue))
                currentValue = ""
            }
        } positions.push(parseFloat(currentValue))



    }


    let normals = []
    {

        let data = normalsText.slice(normalsText.indexOf(">") + 1)

        let currentValue = ""
        for (let i = 0; i < data.length; i++) {
            if (data[i] != " ") {
                currentValue += data[i]
            }
            else {
                normals.push(parseFloat(currentValue))
                currentValue = ""
            }
        } normals.push(parseFloat(currentValue))

    }


    let triangles = []
    let trianglesGroups = {}
    {

        let data = trianglesText.slice(trianglesText.indexOf("<p>") + 3)

        let currentValue = ""
        for (let i = 0; i < data.length; i++) {
            if (data[i] != " ") {
                currentValue += data[i]
            }
            else {
                triangles.push(parseFloat(currentValue))
                currentValue = ""
            }
        } triangles.push(parseFloat(currentValue))


        // split up triangles into groups

        for (let i = 0; i < triangleDataTypes.length; i++) {
            trianglesGroups[triangleDataTypes[i]] = []
        }


        for (let i = 0; i < triangles.length; i += triangleDataTypes.length) {
            for (let j = 0; j < triangleDataTypes.length; j++) {
                trianglesGroups[triangleDataTypes[j]].push(triangles[i+j])
            }
        }



    }


    // -- organize data -- //

    let organizedPositions = []
    for (let i = 0; i < positions.length; i += positionsStride) {
        organizedPositions.push([])
        for (let j = 0; j < positionsStride; j++) {
            organizedPositions[organizedPositions.length - 1].push(positions[i+j])
        }
    }

    console.log(`count: ${positionsCount}`)
    console.log(organizedPositions)


    let organizedNormals = []
    for (let i = 0; i < normals.length; i += normalsStride) {
        organizedNormals.push([])
        for (let j = 0; j < normalsStride; j++) {
            organizedNormals[organizedNormals.length - 1].push(normals[i+j])
        }
    }

    console.log(`count: ${normalsCount}`)
    console.log(organizedNormals)



    let organizedTriangleVertices = []
    for (let i = 0; i < trianglesGroups.VERTEX.length; i += 3) {
        organizedTriangleVertices.push([])
        for (let j = 0; j < 3; j++) {
            organizedTriangleVertices[organizedTriangleVertices.length - 1].push(trianglesGroups.VERTEX[i+j])
        }
    }

    console.log(organizedTriangleVertices)


    let organizedTriangleNormals = []
    for (let i = 0; i < trianglesGroups.NORMAL.length; i += 3) {
        organizedTriangleNormals.push([])
        for (let j = 0; j < 3; j++) {
            organizedTriangleNormals[organizedTriangleNormals.length - 1].push(trianglesGroups.NORMAL[i+j])
        }
    }

    console.log(organizedTriangleNormals)

    return {
        positions: organizedPositions,
        normals: organizedNormals,
        vertexIndices: organizedTriangleVertices,
        normalIndices: organizedTriangleNormals
    }

}




function parseWavefront(fileText) {
    let lines = parseLines(fileText)

    let name
    let positions = []
    let normals = []
    let texcoords = []
    let smooth // boolean
    let material // string
    let indices = []


    for (let i = 0; i < lines.length; i++) {

        // find first word in line
        let identifier = lines[i].slice(0, lines[i].indexOf(" "))

        // get line after identifier
        let currentLine = lines[i].slice(lines[i].indexOf(" ") + 1)
        
        if (identifier == "o") name = currentLine
        
        if (identifier == "v") positions.push(parseFloats(parseWords(currentLine)))

        if (identifier == "vn") normals.push(parseFloats(parseWords(currentLine)))
        
        if (identifier == "vn") texcoords.push(parseFloats(parseWords(currentLine)))

        if (identifier == "s") {
            if (currentLine = "0") smooth = false
            else smooth = true
        }

        if (identifier == "usemtl") material = currentLine

        if (identifier == "f") {
            let v = []
            let t = []
            let n = []

            let words = parseWords(currentLine)
            for (let j = 0; j < words.length; j++) {
                v.push(parseInt(words[j].slice(0, words[j].indexOf("/")), 10) - 1)
                words[j] = words[j].slice(words[j].indexOf("/") + 1)

                t.push(parseInt(words[j].slice(0, words[j].indexOf("/")), 10) - 1)
                words[j] = words[j].slice(words[j].indexOf("/") + 1)

                n.push(parseInt(words[j], 10) - 1)
            }

            indices.push({
                vertexes: v,
                texcoords: t,
                normals: n
            })
        }
    }

    return {
        name: name,
        positions: positions,
        normals: normals,
        texcoords: texcoords,
        smooth: smooth,
        material: material,
        indices: triangulate(indices)
    }
}



function triangulate(indices) {
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
}




function parseFloats(words) {
    let floats = []
    for (let i = 0; i < words.length; i++) {
        floats.push(parseFloat(words[i]))
    }
    return floats
}

function parseLines(string) {
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
}

function parseWords(string) {
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
}