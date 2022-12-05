
var modelData = {



  platforms: {

    basic: `
# Blender 3.3.0
# www.blender.org
mtllib untitled.mtl
o Cube
v 2.445886 1.455015 -2.627166
v 2.445886 -0.035772 -2.627166
v 2.445886 1.455015 2.628288
v 2.445886 -0.035772 2.628288
v -2.423902 1.455015 -2.627166
v -2.423902 -0.035772 -2.627166
v -2.423902 1.455015 2.628288
v -2.423902 -0.035772 2.628288
vn -0.0000 1.0000 -0.0000
vn -0.0000 -0.0000 1.0000
vn -1.0000 -0.0000 -0.0000
vn -0.0000 -1.0000 -0.0000
vn 1.0000 -0.0000 -0.0000
vn -0.0000 -0.0000 -1.0000
vt 0.625000 0.500000
vt 0.375000 0.500000
vt 0.625000 0.750000
vt 0.375000 0.750000
vt 0.875000 0.500000
vt 0.625000 0.250000
vt 0.125000 0.500000
vt 0.375000 0.250000
vt 0.875000 0.750000
vt 0.625000 1.000000
vt 0.625000 0.000000
vt 0.375000 1.000000
vt 0.375000 0.000000
vt 0.125000 0.750000
s 0
usemtl Material
f 1/1/1 5/5/1 7/9/1 3/3/1
f 4/4/2 3/3/2 7/10/2 8/12/2
f 8/13/3 7/11/3 5/6/3 6/8/3
f 6/7/4 2/2/4 4/4/4 8/14/4
f 2/2/5 1/1/5 3/3/5 4/4/5
f 6/8/6 5/6/6 1/1/6 2/2/6
`


  },


}


var fetchObj = (name) => {
    
    let xhr = new XMLHttpRequest()
    xhr.open("GET", "../assets/models/" + name, false)
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





  parseWavefront: function(fileText, seperateObjects) {
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
                if (currentLine = "0") smooth = false
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
            indices: this.triangulate(indices)
        }
    }

    if (seperateObjects) return objects
    else return Object.values(objects)[0]

  },

}



export default { modelData, fetchObj, obj }
