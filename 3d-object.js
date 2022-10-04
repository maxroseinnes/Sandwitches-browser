
var sprites = []

class Mesh {
    constructor(positions, normals, vertexIndices, normalIndices) {



		this.x = Math.random() * 10
		this.y = 0
		this.z = Math.random() * 10


        let smooth = true
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
