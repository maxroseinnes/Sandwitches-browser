
#include <string>
#include <map>
#include <vector>
#include "model-geometry.hpp"
#include "crow.h"
#include "weaponInfo.hpp"

using namespace std;


class websocket {
    public: 
        crow::websocket::connection* webSocket;
        map<string, function<void(map<string, string>)>> websocketCallbacks;
        size_t hashValue;
        websocket() {};
        websocket(crow::websocket::connection& connection) : webSocket(&connection) {
            //cout << "new websocket" << connection << endl;
        };

        void on(string event, function<void(map<string, string>)> callback) {
            websocketCallbacks[event] = callback;
        };

        void emit(string event, map<string, string> data) {
            data["messageType"] = event;
            webSocket->send_text(mapToJSONString(data));
        };

};


struct position {
    float x = 0;
    float y = 0;
    float z = 0;
    float pitch = 0;
    float yaw = 0;
    float roll = 0;
    float lean = 0;
};

struct velocity {
    float x = 0;
    float y = 0;
    float z = 0;
};

struct state {
    float walkCycle = 0;
    float crouchValue = 0;
    float slideValue = 0;
};

class player {
    public: 
        string name;
        position position;
        float health = 0;
        string currentWeaponType;
        int lastShotTime = 0;
        string lastShotWeapon;
        int startChargeTime = 0;
        bool charging = false;
        state state;
        unsigned int killCount = 0;
        websocket* socket;

        player(websocket* s) : socket(s) {};
        player() {};
};

struct weaponInfo {
    string variety;
    float radius;
    int cooldown; // milliseconds
    float speed;
    float damage;
    int chargeTime; // milliseconds
    int projectileCount;
};

struct weapon {
    string type;
    float damage;
    string variety;
    float radius;
    unsigned int ownerId;
    position position;
    velocity velocity;
};


template<typename T>
string toString(T value) {
    ostringstream os;
    os << value;
    return os.str();
}
/*
string toString(float values[3]) {
    return "[" + toString(values[0]) + ", " + toString(values[1]) + ", " + toString(values[2]) + "]";
}

string toString(float values[2]) {
    return "[" + toString(values[0]) + ", " + toString(values[1]) + "]";
}
*/



map<string, string> toMap(position object) {
    map<string, string> map;
    map["x"] = toString(object.x);
    map["y"] = toString(object.y);
    map["z"] = toString(object.z);
    map["pitch"] = toString(object.pitch);
    map["yaw"] = toString(object.yaw);
    map["roll"] = toString(object.roll);
    map["lean"] = toString(object.lean);
    return map;
}

map<string, string> toMap(velocity object) {
    map<string, string> map;
    map["x"] = toString(object.x);
    map["y"] = toString(object.y);
    map["z"] = toString(object.z);
    return map;
}

map<string, string> toMap(state object) {
    map<string, string> map;
    map["walkCycle"] = toString(object.walkCycle);
    map["crouchValue"] = toString(object.crouchValue);
    map["slideValue"] = toString(object.slideValue);
    return map;
}

map<string, string> toMap(player object) {
    map<string, string> map;
    map["name"] = object.name;
    map["position"] = mapToJSONString(toMap(object.position));
    map["health"] = toString(object.health);
    map["currentWeaponType"] = toString(object.currentWeaponType);
    map["lastShotTime"] = toString(object.lastShotTime);
    map["lastShotWeapon"] = toString(object.lastShotWeapon);
    map["startChargeTime"] = toString(object.startChargeTime);
    map["charging"] = toString(object.charging);
    map["state"] = mapToJSONString(toMap(object.state));
    map["killCount"] = toString(object.killCount);
    return map;
}

map<string, string> toMap(modelGeometry object) {
    map<string, string> geometryMap;
    vector<string> positionsAsStrings;
    for (int i = 0; i < object.positions.size(); i++) {
        string array[3] = {toString(object.positions[i][0]), toString(object.positions[i][1]), toString(object.positions[i][2])};
        vector<string> vecPosition(array, array+3);
        positionsAsStrings.push_back(vectorToJSONString(vecPosition));
    }
    geometryMap["positions"] = vectorToJSONString(positionsAsStrings);

    vector<string> normalsAsStrings;
    for (int i = 0; i < object.normals.size(); i++) {
        string array[3] = {toString(object.normals[i][0]), toString(object.normals[i][1]), toString(object.normals[i][2])};
        vector<string> vecNormal(array, array+3);
        normalsAsStrings.push_back(vectorToJSONString(vecNormal));
    }
    geometryMap["normals"] = vectorToJSONString(normalsAsStrings);

    vector<string> texcoordsAsStrings;
    for (int i = 0; i < object.texcoords.size(); i++) {
        string array[3] = {toString(object.texcoords[i][0]), toString(object.texcoords[i][1]), toString(object.texcoords[i][2])};
        vector<string> vecTexcoord(array, array+3);
        texcoordsAsStrings.push_back(vectorToJSONString(vecTexcoord));
    }
    geometryMap["texcoords"] = vectorToJSONString(texcoordsAsStrings);

    geometryMap["smooth"] = toString(object.smooth);

    vector<string> indicesAsStrings;
    for (int i = 0; i < object.indices.size(); i++) {
        faceIndices currentIndices = object.indices[i];

        map<string, string> mapOfCurrentIndices;

        vector<string> vertexStrings;
        for (int j = 0; j < currentIndices.vertices.size(); j++) vertexStrings.push_back(toString(currentIndices.vertices[j]));
        mapOfCurrentIndices["vertexes"] = vectorToJSONString(vertexStrings);
        
        vector<string> normalStrings;
        for (int j = 0; j < currentIndices.normals.size(); j++) normalStrings.push_back(toString(currentIndices.normals[j]));
        mapOfCurrentIndices["normals"] = vectorToJSONString(normalStrings);
        
        vector<string> texcoordStrings;
        for (int j = 0; j < currentIndices.texcoords.size(); j++) texcoordStrings.push_back(toString(currentIndices.texcoords[j]));
        mapOfCurrentIndices["texcoords"] = vectorToJSONString(texcoordStrings);


        indicesAsStrings.push_back(mapToJSONString(mapOfCurrentIndices));
    }
    geometryMap["indices"] = vectorToJSONString(indicesAsStrings);

    return geometryMap;
}



position mapToPosition(map<string, string> JSONMap) {
    position newPosition;

    if (JSONMap.count("x") != 0) newPosition.x = stof(JSONMap["x"]);
    if (JSONMap.count("y") != 0) newPosition.y = stof(JSONMap["y"]);
    if (JSONMap.count("z") != 0) newPosition.z = stof(JSONMap["z"]);
    if (JSONMap.count("pitch") != 0) newPosition.pitch = stof(JSONMap["pitch"]);
    if (JSONMap.count("yaw") != 0) newPosition.yaw = stof(JSONMap["yaw"]);
    if (JSONMap.count("roll") != 0) newPosition.roll = stof(JSONMap["roll"]);
    if (JSONMap.count("lean") != 0) newPosition.lean = stof(JSONMap["lean"]);

    return newPosition;
    
}

state mapToState(map<string, string> JSONMap) {
    state newState;

    if (JSONMap.count("walkCycle") != 0) newState.walkCycle = stof(JSONMap["walkCycle"]);
    if (JSONMap.count("crouchValue") != 0) newState.crouchValue = stof(JSONMap["crouchValue"]);
    if (JSONMap.count("slideValue") != 0) newState.slideValue = stof(JSONMap["slideValue"]);

    return newState;
    
}


