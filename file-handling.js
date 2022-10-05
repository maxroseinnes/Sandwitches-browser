
const fileSelector = document.getElementById("fileSelector")

var fileReader = new FileReader();


fileSelector.addEventListener("change", function(e) {
    readFile(e.target.files[0])
})


function readFile(file) {
    console.log(file)

    fileReader.readAsText(file)
    fileReader.onload = () => {

        let geometryInfo = parseWavefront(fileReader.result)

        let vertexIndices = []
        let normalIndices = []
        for (let i = 0; i < geometryInfo.indices.length; i++) {
            vertexIndices.push(geometryInfo.indices[i].vertexes)
            normalIndices.push(geometryInfo.indices[i].normals)
        }

        console.log(vertexIndices)
        console.log(normalIndices)

        sprites.push(new Mesh(geometryInfo.positions, geometryInfo.normals, vertexIndices, normalIndices, geometryInfo.smooth))

        //geometryInfo = parseCollada(fileReader.result)
        //sprites.push(new Mesh(geometryInfo.positions, geometryInfo.normals, geometryInfo.vertexIndices, geometryInfo.normalIndices, smooth))
    }
}
