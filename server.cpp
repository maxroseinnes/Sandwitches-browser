
#include <iostream>
#include <fstream>
#include <stdio.h>
#include <math.h>
#include <string>
#include <sstream>
#include <chrono>
#include <map>
#include <mutex>
#include <shared_mutex>
#include <unordered_set>
#include <functional>
#include <regex>
#include <cstdlib>
#include <thread>

#define CROW_ENFORCE_WS_SPEC

#include "crow.h"
#include "types.hpp"

using namespace std;


const float DEFAULT_PLAYER_HEALTH = 100;
const int ROOM_CAP = 10;


unsigned int nextId = 0;
unsigned int nextWeaponId = 0;

const int TPS = 20;

map<string, weaponInfo> weaponSpecs;

size_t getHash(crow::websocket::connection* connection) {
    hash<crow::websocket::connection*> hasher;
    return hasher(connection);
}

class Room {
    private: 
        //mutable mutex roomMtx;
    public: 
        string mapFilename;
        map<string, modelGeometry> mapGeometry;
        map<unsigned int, player> players;
        map<unsigned int, weapon> weapons;

        Room() {}
        Room(string mapFileName) {
            mapFilename = mapFileName;

            string mapFileText = getFileText("public/assets/models/" + mapFileName);
            mapGeometry = parseWavefront(mapFileText, true);

            map<string, string> mapGeometryAsStrings;
            for (auto i = mapGeometry.begin(); i != mapGeometry.end(); i++) {
                mapGeometryAsStrings[i->first] = mapToJSONString(toMap(i->second));
            }

            // generate platforms
        }

        void broadcast(string event, map<string, string> data, int except) {
            for (auto nameValue = players.begin(); nameValue != players.end(); nameValue++) {
                if (nameValue->first != except) {
                    nameValue->second.socket->emit(event, data);
                }
            }
        }

        void addPlayer(websocket* newSocket) {
            //lock_guard<mutex> lock(roomMtx);



            player newPlayer(newSocket);
            newPlayer.name = "unnamed sandwich";
            players[nextId] = newPlayer;
            unsigned int assignedId = nextId;
            nextId++;
            
            cout << newPlayer.name << " joined! 😃😃😃😃😃😃😃" << endl;

            websocket* socket = newPlayer.socket;

            // ------------ initial player communications ------------ // 

            socket->emit("map", {{"mapFile", mapFilename}});

            map<string, string> otherPlayersInfo;
            for (auto nameValue = players.begin(); nameValue != players.end(); nameValue++) {
                if (nameValue->first != assignedId) {
                    player thisPlayer = nameValue->second;
                    otherPlayersInfo[toString(nameValue->first)] = mapToJSONString(toMap(thisPlayer));
                }
            }

            socket->emit("otherPlayers", otherPlayersInfo);

            map<string, string> playerMap = toMap(newPlayer);
            playerMap["id"] = toString(assignedId);
            socket->emit("assignPlayer", playerMap);

            socket->emit("startTicking", {{"TPS", toString(TPS)}});

            broadcast("newPlayer", playerMap, assignedId);


            

            // ------------ put socket callbacks here ------------ // 


            socket->on("nameChange", [this](map<string, string> data) {
                players[stoi(data["id"])].name = data["newName"];
                broadcast("nameChange", {
                    {"id", toString(data["id"])},
                    {"newName", data["newName"]}
                }, -1);
            });

            socket->on("sendChatMessage", [this](map<string, string> data) {
                cout << "message: " << data["message"] << endl;
                broadcast("chatMessage", {{"message", data["message"]}}, -1);
            });

            socket->on("playerUpdate", [this](map<string, string> data) {
                int id = stoi(data["id"]);
                players[id].position = mapToPosition(JSONStringToMap(data["position"]));
                players[id].state = mapToState(JSONStringToMap(data["state"]));
                if (players[id].currentWeaponType != data["currentWeaponType"]) players[id].charging = false;
                players[id].currentWeaponType = data["currentWeaponType"];
            });
            
            socket->on("respawnMe", [this](map<string, string> data) {
                int id = stoi(data["id"]);
                if (players[id].health <= 0) {
                    respawnPlayer(id);
                }
            });

            socket->on("newWeapon", [this](map<string, string> data) {
                if (players.count(stoi(data["ownerId"])) != 1) return;
                shootWeapon(data);
            });
                
/*
            socket->on("startedCharging", [this, assignedId](map<string, string> data) {
                if (Date.now() - players[assignedId].lastShotTime < getWeaponSpecs(players[assignedId].lastShotWeapon).cooldown) return
                players[assignedId].startChargeTime = Date.now()
                players[assignedId].charging = true
            });

            socket->on("stoppedCharging", [this, assignedId](map<string, string> data) {
                players[assignedId].charging = false
            });

            socket->on("weaponStates", [this](map<string, string> data) {
                let weaponInfo = {}
                for (let id in data.states) {
                    if (this.weapons[id]) {
                        weaponInfo[id] = {
                            type: this.weapons[id].type,
                            position: {
                                x: data.states[id].position.x,
                                y: data.states[id].position.y,
                                z: data.states[id].position.z,
                                yaw: data.states[id].yaw,
                                pitch: data.states[id].pitch
                            },
                            velocity: {
                                x: data.states[id].velocity.x,
                                y: data.states[id].velocity.y,
                                z: data.states[id].velocity.z
                            }
                        }
                    }
                }
                
                if (players[data.recipientId] != null) players[data.recipientId].socket.emit("weaponStates", {
                    ownerId: data.ownerId, 
                    weaponData: weaponInfo})
            });

*/
            socket->on("disconnect", [this, assignedId](map<string, string> data) {
                broadcast("playerLeave", {{"id", toString(assignedId)}}, -1);
                cout << players[assignedId].name << " left. 😭😭😭😭😭😭😭" << endl;
                players.erase(assignedId);

            });

        }

        void respawnPlayer(unsigned int id) {
            broadcast("playerRespawned", {{"id", toString(id)}}, -1);
            players[id].position.x = randFloat() * 10.0 - 5.0;
            players[id].position.y = 2;
            players[id].position.z = randFloat() * 10.0 - 5.0;
            players[id].position.yaw = 0.0;
            players[id].position.pitch = 0.0;
            players[id].health = DEFAULT_PLAYER_HEALTH;
            players[id].socket->emit("respawn", genPlayerPacket(id));
        }

        map<string, string> genPlayerPacket(unsigned int id) {
            return {
                {"position", mapToJSONString(toMap(players[id].position))},
                {"state", mapToJSONString(toMap(players[id].state))},
                {"health", toString(players[id].health)},
                {"currentWeaponType", toString(players[id].currentWeaponType)},
                {"charging", toString(players[id].charging)},
                {"health", toString(players[id].health)}
            };
        }

        void shootWeapon(map<string, string> data) {
            int ownerId = stoi(data["ownerId"]);
            player& thisPlayer = players.at(ownerId);

            if (thisPlayer.health <= 0) return;

            weaponInfo weaponSpec = weaponSpecs[data["type"]];

            thisPlayer.lastShotTime = now();
            thisPlayer.lastShotWeapon = data["type"];

            vector<map<string, string>> newWeaponData;
            position weaponPosition = mapToPosition(JSONStringToMap(data["position"]));

            float pitch = -stof(data["pitch"]);
            float yaw = -stof(data["yaw"]);
            
            array<float, 3> velocity = {0, 0, -weaponSpec.speed};

            rotateX(velocity, velocity, {0, 0, 0}, pitch);
            rotateY(velocity, velocity, {0, 0, 0}, yaw);

            weapon newWeapon;
            newWeapon.type = data["type"];
            newWeapon.damage = weaponSpec.damage;
            newWeapon.variety = weaponSpec.variety;
            newWeapon.radius = weaponSpec.radius;
            newWeapon.ownerId = ownerId;
            newWeapon.position = weaponPosition;
            newWeapon.velocity.x = velocity[0];
            newWeapon.velocity.y = velocity[1];
            newWeapon.velocity.z = velocity[2];

            newWeaponData.push_back({
                {"id", toString(nextWeaponId)},
                {"type", data["type"]},
                {"ownerId", toString(ownerId)},
                {"cooldown", toString(weaponSpec.cooldown)},
                {"position", mapToJSONString(toMap(weaponPosition))},
                {"velocity", mapToJSONString(toMap(newWeapon.velocity))}
            });

            nextWeaponId++;
            
            vector<string> newWeaponDataAsStrings;
            for (int i = 0; i < newWeaponData.size(); i++) newWeaponDataAsStrings.push_back(mapToJSONString(newWeaponData[i]));


            broadcast("newWeapons", {{"weaponData", vectorToJSONString(newWeaponDataAsStrings)}}, -1);

        }

        void removeInvalidPlayers(vector<crow::websocket::connection*> socketHash) {
            for (auto nv = players.begin(); nv != players.end(); nv++) {
                bool valid = false;
                for (auto jv = socketHash.begin(); jv != socketHash.end(); jv++) {
                    //cout << nv->second.socket->webSocket << " vs " << *jv << endl;
                    if (nv->second.socket->webSocket == *jv) valid = true;
                }
                if (!valid) {
                    //cout << "removing player " << nv->first << endl;
                    players.erase(nv->first);
                    //cout << "succesfully removed" << endl;
                }
            }
        }

        void tick() {
            map<string, string> playersData;
            for (auto i = players.begin(); i != players.end(); i++) {
                player& thisPlayer = players[i->first];
                if (thisPlayer.position.y < -100.0) {
                    thisPlayer.health = 0;
                    thisPlayer.socket->emit("youDied", {{"id", toString(i->first)}, {"cause", "void"}});
                    string deathMessage = thisPlayer.name + " fell into the void.";
                    cout << deathMessage << endl;
                    
                    broadcast("chatMessage", {{"message", deathMessage}}, -1);
                }
                playersData[toString(i->first)] = mapToJSONString(genPlayerPacket(i->first));
            }
            broadcast("playerUpdate", playersData, -1);
        }


        
};

struct {
    map<int, Room> privateRooms;
    map<int, Room> lobbyRooms;
    map<int, Room> ffaRooms;
} rooms;


Room testRoom = Room("full_starting_map (5).obj");

mutex mtx;

int main() {
    string weaponInfoText = getFileText("public/weapon-specs.json");
    map<string, string> weaponInfoStringMap = JSONStringToMap(weaponInfoText);
    for (auto i = weaponInfoStringMap.begin(); i != weaponInfoStringMap.end(); i++) {
        map<string, string> currentWeaponInfoMap = JSONStringToMap(i->second);
        weaponInfo currentSpecs;
        currentSpecs.variety = currentWeaponInfoMap["variety"];
        currentSpecs.radius = stof(currentWeaponInfoMap["radius"]);
        currentSpecs.cooldown = stoi(currentWeaponInfoMap["cooldown"]);
        currentSpecs.speed = stof(currentWeaponInfoMap["speed"]);
        currentSpecs.damage = stof(currentWeaponInfoMap["damage"]);
        currentSpecs.chargeTime = stoi(currentWeaponInfoMap["chargeTime"]);
        currentSpecs.projectileCount = stoi(currentWeaponInfoMap["projectileCount"]);
    
        weaponSpecs.insert({toString(i->first), currentSpecs});
    }
    




    printf("----------------------\nSTARTING SERVER\n");

    thread tickThread([]() {
        int interval = 1000 / TPS;
        auto then = chrono::high_resolution_clock::now();
        while(true) {
            auto now = chrono::high_resolution_clock::now();
            auto deltaTime = chrono::duration_cast<chrono::milliseconds>(now - then).count();
            if (deltaTime > interval) {
                lock_guard<mutex> lock(mtx);
                testRoom.tick();
                then = now;
            }
            this_thread::sleep_for(chrono::milliseconds(1));
        }
    });

    map<size_t, websocket> websocketMap;


    crow::SimpleApp app;

#ifdef _WIN32
    crow::logger::setLogLevel(crow::LogLevel::Warning);
#else
    crow::logger::setLogLevel(crow::LogLevel::WARNING);
#endif


    CROW_WEBSOCKET_ROUTE(app, "/socket")
    .onopen([&](crow::websocket::connection& connection) {
        lock_guard<mutex> lock(mtx);

        cout << "new connection: " << &connection << endl;

        websocket newSocket(connection);

        size_t hashValue = getHash(&connection);

        //cout << "hash: " << hashValue << endl;

        newSocket.hashValue = hashValue;

        websocketMap[hashValue] = newSocket;
        websocket* currentSocket = &websocketMap[hashValue];


        currentSocket->on("joinRoom", [currentSocket](map<string, string> data) {
            cout << "JOIN ROOM: " << data["roomId"] << endl;

            currentSocket->emit("roomJoinSuccess", {{"roomId", "1"}});

            testRoom.addPlayer(currentSocket);
            
        });
        
    })
    .onmessage([&](crow::websocket::connection& connection, const string& data, bool inBinary) {
        lock_guard<mutex> lock(mtx);
        size_t hashValue = getHash(&connection);
        websocket* currentWebsocket = &websocketMap[hashValue];

        map<string, string> mapData = JSONStringToMap(data);


        //cout << data << " from " << &connection << endl;


        try { currentWebsocket->websocketCallbacks[mapData["messageType"]](mapData); }
        catch (const exception& exception) { cerr << "problem with socket->on " << mapData["messageType"] << ": " << exception.what() << endl; }

        
    })
    .onclose([&](crow::websocket::connection& connection, const string& reason) {
        lock_guard<mutex> lock(mtx);
        //cout << "connection closed: " << &connection << " because " << reason << endl;


        size_t hashValue = getHash(&connection);
        websocket currentWebsocket = websocketMap[hashValue];

        currentWebsocket.websocketCallbacks["disconnect"]({{}});
        websocketMap.erase(hashValue);
    });



    CROW_ROUTE(app, "/<path>")([](string filename) {
        //cout << "requesting " << filename << endl;






        bool noMoreSpaces = false;
        while(!noMoreSpaces) {
            int location = filename.find("%20");
            if (location != string::npos) {
                filename.replace(location, 3, " ");
            }
            else noMoreSpaces = true;
        }

        crow::response response;
        
        regex pattern(".js");
        smatch match;
        if (regex_search(filename, match, pattern)) {
            response.set_header("Content-Type", "application/javascript");
        }

        response.body = getFileText("public/" + filename);

        return response;
    });


    app.port(8080).multithreaded().run();


    
    
}




