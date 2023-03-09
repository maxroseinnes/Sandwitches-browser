
#include <iostream>
#include <stdio.h>
#include <math.h>
#include <string>
#include <sstream>
#include <chrono>
#include <map>

//#include <websocketpp/config/core.hpp>
//#include <websocketpp/config/asio_no_tls.hpp>
//#include <websocketpp/server.hpp>

#include "weaponInfo.hpp"

using namespace std;

//typedef websocketpp::server<websocketpp::config::asio> server;

//using websocketpp::lib::placeholders::_1;
//using websocketpp::lib::placeholders::_2;
//using websocketpp::lib::bind;

//typedef server::message_ptr messsage_ptr;


unsigned int nextId = 0;
unsigned int nextWeaponId = 0;

const int TPS = 20;

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
    // socket -- I'm not sure what type it is
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

class Room {
    private: 
        string mapFile;
        map<unsigned int, player> players;
        map<unsigned int, weapon> weapons;
    
    public: 

        Room(string mapFileName) {
            mapFile = mapFileName;

            // generate platforms
        }

        void broadcast(string message, string data, unsigned int except) {

        }

        void addPlayer(/*socket socket*/int socket, unsigned int assignedId) {

        }

        void respawnPlayer(unsigned int id) {
            //if (players.)
        }

        
};


struct {
    map<int, Room> privateRooms;
    map<int, Room> lobbyRooms;
    map<int, Room> ffaRooms;
} rooms;



int main() {
    initWeaponSpecs();

    rooms.privateRooms[1] = Room("full_starting_map (5).obj");

    printf("-\n-\n-\n-\nSTARTING SERVER\n");
    
}




