
const fileSelector = document.getElementById("fileSelector")

var fileReader = new FileReader();


fileSelector.addEventListener("change", function(e) {
    readFile(e.target.files, 0)
})


function readFile(files, i) {
    console.log(files[i])

    fileReader.readAsText(files[i])
    fileReader.onload = () => {
        console.log(fileReader.result)

        //geometryInfos = []

        sandwichIngredients.push(new Model(parseWavefront(fileReader.result), 1))
        modelInfos.push(parseWavefront(fileReader.result))
        player = sandwichIngredients[0]

        if (i == 3) walkingAnimation = new ModelAnimation(modelInfos, player)

        //geometryInfo = parseCollada(fileReader.result)
        //sprites.push(new Mesh(geometryInfo.positions, geometryInfo.normals, geometryInfo.vertexIndices, geometryInfo.normalIndices, smooth))

        if (i+1 < files.length) readFile(files, i+1)
    }
}





