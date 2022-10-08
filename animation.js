

class ModelAnimation {
    constructor(meshes, model) {
        this.meshes = meshes
        this.model = model // model to apply animation to

        this.currentMesh = 0

        this.fromMesh = 0
        this.toMesh = 1

        this.startTime = 0
        this.endTime = 0
        this.smooth = false

        for (let i = 0; i < meshes.length; i++) {


            this.meshes[i].vertexIndices = []
            this.meshes[i].normalIndices = []
            for (let j = 0; j < this.meshes[0].indices.length; j++) {
                this.meshes[i].vertexIndices.push(this.meshes[i].indices[j].vertexes)
                this.meshes[i].normalIndices.push(this.meshes[i].indices[j].normals)
            }
        }
    }

    startAnimation(mesh1Index, mesh2Index, seconds, smooth) {
        this.fromMesh = mesh1Index
        this.toMesh = mesh2Index

        this.smooth = smooth

        this.currentMesh = mesh2Index


        this.startTime = Date.now()
        this.endTime = this.startTime + seconds * 1000
    }

    updateAnimation() {
        if (Date.now() < this.endTime) {
            let stage
            if (!this.smooth) stage = (Date.now() - this.startTime) / (this.endTime - this.startTime)
            else stage = (Math.cos(Math.PI * ((Date.now() - this.startTime) / (this.endTime - this.startTime) - 1)) + 1) / 2
    
            if (stage > .98) stage = 1
            if (stage < .02) stage = 0

            this.model.interpolatePoints(
                this.meshes[this.fromMesh],
                this.meshes[this.toMesh],
                stage
            )
        }

    }



    active() {
        if (Date.now() < this.endTime) return true
        else return false
    }



    
}



