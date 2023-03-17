
#include <string>
#include <map>
#include <vector>
#include "utils.hpp"
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
            data["type"] = event;

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
};

struct weapon {
    string type;
    float damage;
    weaponVariety variety;
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
    map["name"] = toString(object.name);
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


