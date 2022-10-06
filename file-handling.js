
const fileSelector = document.getElementById("fileSelector")

var fileReader = new FileReader();


fileSelector.addEventListener("change", function(e) {
    readFile(e.target.files, 0)
})


function readFile(files, i) {
    console.log(files[i])

    fileReader.readAsText(files[i])
    fileReader.onload = () => {

        sprites.push(new Mesh(parseWavefront(fileReader.result)))

        //geometryInfo = parseCollada(fileReader.result)
        //sprites.push(new Mesh(geometryInfo.positions, geometryInfo.normals, geometryInfo.vertexIndices, geometryInfo.normalIndices, smooth))

        if (i+1 < files.length) readFile(files, i+1)
    }
}
