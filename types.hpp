
#include <string>
#include "weaponInfo.hpp"
#include "websocket.hpp"

using namespace std;

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

struct player {
    string name;
    position position;
    float health = 0;
    int lastShotTime = 0;
    string lastShotWeapon;
    int startChargeTime = 0;
    bool charging = false;
    state state;
    unsigned int killCount = 0;
    websocket* socket;
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


