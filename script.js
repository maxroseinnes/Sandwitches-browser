
function lerp(a, b, x) {
    return a + (b - a) * x
}








// -- Model Organizaion -- //


// model information scaffolding //

class ModelInfo {
    constructor(positions, normals, indices) {
        this.positions = positions
        this.normals = normals

        this.indices = indices
    }

}

class Player {
    constructor(setup) {

    }
}

class Platform {

}

class Stairs {

}

class Ladder {

}




// scene //

var modelInfo = {
    player: {
        idle: {

        },

        stepRight: {

        },

        walkLeft: {

        },

        walkRight: {

        }


    },

    weapons: {
        tomato: parseWavefront(weaponData.tomato),
        olive: parseWavefront(weaponData.olive),
        sausage: parseWavefront(weaponData.sausage),
        pickle: parseWavefront(weaponData.pickle)
    }
}

var scene = {
    players: [],
    platforms: [],
    stairses: [],
    ladders: []

    

}

console.log(parseWavefront(weaponData.tomato))

new Model(parseWavefront(weaponData.tomato)[0], 1)
