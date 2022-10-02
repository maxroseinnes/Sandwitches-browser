
const fileSelector = document.getElementById("fileSelector")

var fileReader = new FileReader();


fileSelector.addEventListener("change", function(e) {
    readFile(e.target.files[0])
})


function readFile(file) {
    console.log(file)

    fileReader.readAsText(file)
    fileReader.onload = () => {

        geometryInfo = parseCollada(fileReader.result)
        sprites.push(new Mesh(geometryInfo.positions, geometryInfo.normals, geometryInfo.vertexIndices, geometryInfo.normalIndices))
    }
}
