
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
        modelGeometry mapGeometry;
        vector<platform> platforms;
        array<float, 2> sunPosition;
        map<unsigned int, player> players;
        map<unsigned int, weapon> weapons;

        Room() {}
        Room(string mapFileName) {
            mapFilename = mapFileName;

            cout << mapFileName << endl;

            string mapFileText = getFileText("public/assets/models/" + mapFileName);
            mapGeometry = parseWavefront(mapFileText, false, false);

            platforms = generatePlatforms(mapGeometry);

            if (mapFileName.find("starting") != string::npos) {
                sunPosition[0] = M_PI * (1.0/5.0);
                sunPosition[1] = M_PI * (1.0/3.0);
            }
            else if (mapFileName.find("kitchen") != string::npos) {
                sunPosition[0] = M_PI * (1.0/7.0);
                sunPosition[1] = M_PI * (1.1/2.0);
            }
            else {
                sunPosition[0] = M_PI * (1.0/5.0);
                sunPosition[1] = M_PI * (1.0/3.0);
            }



            cout << "NEW ROOM CREATED" << endl;

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

            socket->emit("map", {
                {"mapFile", mapFilename}, 
                {"sunPitch", toString(sunPosition[0])},
                {"sunYaw", toString(sunPosition[1])}
            });

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
                players.at(stoi(data["id"])).name = data["newName"];
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
                if (!players.count(id)) return;
                players.at(id).position = mapToPosition(JSONStringToMap(data["position"]));
                players.at(id).state = mapToState(JSONStringToMap(data["state"]));
                if (players.at(id).currentWeaponType != data["currentWeaponType"]) players.at(id).charging = false;
                players.at(id).currentWeaponType = data["currentWeaponType"];
            });
            
            socket->on("respawnMe", [this](map<string, string> data) {
                int id = stoi(data["id"]);
                if (players.count(id) && players.at(id).health <= 0) {
                    respawnPlayer(id);
                }
            });

            socket->on("newWeapon", [this](map<string, string> data) {
                if (players.count(stoi(data["ownerId"])) != 1) return;
                shootWeapon(data);
            });
                
            socket->on("startedCharging", [this, assignedId](map<string, string> data) {
                if (now() - players.at(assignedId).lastShotTime < weaponSpecs[players.at(assignedId).lastShotWeapon].cooldown) return;
                players.at(assignedId).startChargeTime = now();
                players.at(assignedId).charging = true;
            });

            socket->on("stoppedCharging", [this, assignedId](map<string, string> data) {
                players.at(assignedId).charging = false;
            });

            socket->on("weaponStates", [this](map<string, string> data) {
                vector<string> weaponInfo;
                map<string, string> states = JSONStringToMap(data["states"]);
                for (auto i = states.begin(); i != states.end(); i++) {
                    int id = stoi(i->first);
                    if (weapons.count(id) > 0) {
                        map<string, string> currentState = JSONStringToMap(i->second);
                        map<string, string> currentVelocity = JSONStringToMap(currentState["velocity"]);
                        weaponInfo[id] = mapToJSONString({
                            {"type", weapons[id].type},
                            {"position", mapToJSONString({
                                {"x", currentState["position.x"]},
                                {"y", currentState["position.y"]},
                                {"z", currentState["position.z"]},
                                {"yaw", currentState["yaw"]},
                                {"pitch", currentState["pitch"]}
                            })},
                            {"velocity", mapToJSONString({
                                {"x", currentVelocity["x"]},
                                {"y", currentVelocity["y"]},
                                {"z", currentVelocity["z"]}
                            })}
                        });
                    }
                }
                
                int recipientId = stoi(data["recipientId"]);
                if (players.count(recipientId) > 0) players.at(recipientId).socket->emit("weaponStates", {
                    {"ownerId", data["ownerId"]}, 
                    {"weaponData", vectorToJSONString(weaponInfo)}});
            });

/*
*/
            socket->on("disconnect", [this, assignedId, socket](map<string, string> data) {
                broadcast("playerLeave", {{"id", toString(assignedId)}}, -1);
                cout << players.at(assignedId).name << " left. 😭😭😭😭😭😭😭" << endl;
                players.erase(assignedId);
                cout << "players left: " << players.size() << endl;


                for (auto i = socket->websocketCallbacks.begin(); i != socket->websocketCallbacks.end(); i++) {
                    if (i->first != "joinRoom" && i->first != "joinFFAQueue") {
                        socket->removeListener(i->first);
                        i--;
                    }
                }

                socket->emit("stopTicking", {{}});


            });

        }

        void respawnPlayer(unsigned int id) {
            broadcast("playerRespawned", {{"id", toString(id)}}, -1);
            players.at(id).position.x = randFloat() * 10.0 - 5.0;
            players.at(id).position.y = 2;
            players.at(id).position.z = randFloat() * 10.0 - 5.0;
            players.at(id).position.yaw = 0.0;
            players.at(id).position.pitch = 0.0;
            players.at(id).health = DEFAULT_PLAYER_HEALTH;
            players.at(id).socket->emit("respawn", genPlayerPacket(id));
        }

        map<string, string> genPlayerPacket(unsigned int id) {
            return {
                {"position", mapToJSONString(toMap(players.at(id).position))},
                {"state", mapToJSONString(toMap(players.at(id).state))},
                {"health", toString(players.at(id).health)},
                {"currentWeaponType", toString(players.at(id).currentWeaponType)},
                {"startChargeTime", toString(players.at(id).startChargeTime)},
                {"charging", toString(players.at(id).charging)},
                {"health", toString(players.at(id).health)}
            };
        }

        void shootWeapon(map<string, string> data) {
            int ownerId = stoi(data["ownerId"]);
            player& thisPlayer = players.at(ownerId);

            if (thisPlayer.health <= 0) return;

            if (!weaponSpecs.count(data["type"])) return;
            weaponInfo weaponSpec = weaponSpecs[data["type"]];

            if (weaponSpec.chargeTime > 0) {
                if (!thisPlayer.charging) return;
                thisPlayer.charging = false;
                if (now() - thisPlayer.startChargeTime < weaponSpec.chargeTime) return;
            }
            thisPlayer.charging = false;

            if (thisPlayer.lastShotTime + weaponSpecs[data["type"]].cooldown >= now()) return;

            thisPlayer.lastShotTime = now();
            thisPlayer.lastShotWeapon = data["type"];

            vector<map<string, string>> newWeaponData;
            position weaponPosition = mapToPosition(JSONStringToMap(data["position"]));
            velocity shooterVelocity = mapToVelocity(JSONStringToMap(data["shooterVelocity"]));
            weaponPosition.x += shooterVelocity.x * thisPlayer.socket->lagTime * 1;
            weaponPosition.y += shooterVelocity.y * thisPlayer.socket->lagTime * 1;
            weaponPosition.z += shooterVelocity.z * thisPlayer.socket->lagTime * 1;

            for (int i = 0; i < weaponSpec.projectileCount; i++) {

                float pitch = -stof(data["pitch"]);
                float yaw = -stof(data["yaw"]);
                if (weaponSpec.projectileCount > 1) {
                    float randAngle = (randFloat() - .5) * M_PI * 4;
                    float randRadius = sqrt(randFloat()) * M_PI / 32;
                    pitch += cos(randAngle) * randRadius;
                    yaw += sin(randAngle) * randRadius;
                }
                if (weaponSpec.variety == "projectile") pitch += M_PI / 16;
                
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

                weapons[nextWeaponId] = newWeapon;

                newWeaponData.push_back({
                    {"id", toString(nextWeaponId)},
                    {"type", data["type"]},
                    {"ownerId", toString(ownerId)},
                    {"cooldown", toString(weaponSpec.cooldown)},
                    {"position", mapToJSONString(toMap(weaponPosition))},
                    {"velocity", mapToJSONString(toMap(newWeapon.velocity))}
                });

                nextWeaponId++;
            }
            
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
                player& thisPlayer = players.at(i->first);
                if (thisPlayer.position.y < -10.0) {
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

        void calculateCollision(int deltaTime) {
            vector<int> deletedWeapons;
            for (auto i = weapons.begin(); i != weapons.end(); i++) {

                weapon& thisWeapon = weapons[i->first];
                if (thisWeapon.variety == "projectile") thisWeapon.velocity.y -= 0.00001 * deltaTime;
                
                float velocityMagnitude = hypot(thisWeapon.velocity.x, thisWeapon.velocity.y, thisWeapon.velocity.z);
                int intermediateSteps = ceil(velocityMagnitude / 0.1);

                bool hit = false;
                for (int step = 0; step < intermediateSteps; step++) if (!hit) {
                    thisWeapon.position.x += thisWeapon.velocity.x * deltaTime / intermediateSteps;
                    thisWeapon.position.y += thisWeapon.velocity.y * deltaTime / intermediateSteps;
                    thisWeapon.position.z += thisWeapon.velocity.z * deltaTime / intermediateSteps;
                    if (abs(thisWeapon.position.x) > 100 || abs(thisWeapon.position.z) > 100 || abs(thisWeapon.position.y) > 1000) {
                        broadcast("weaponHit", {{"weaponId", toString(i->first)}}, -1);
                        deletedWeapons.push_back(i->first);
                        hit = true;
                        continue;
                    }

                    for (int j = 0; j < platforms.size(); j++) {
                        platform& currentPlatform = platforms[j];
                        if (collision(thisWeapon.radius, {thisWeapon.position.x, thisWeapon.position.y, thisWeapon.position.z}, currentPlatform)) {
                            broadcast("weaponHit", {{"weaponId", toString(i->first)}}, -1);
                            deletedWeapons.push_back(i->first);
                            hit = true;
                            continue;
                        }
                    }

                    for (auto i = players.begin(); i != players.end(); i++) if (i->second.health > 0 && i->first != thisWeapon.ownerId) {
                    player& thisPlayer = i->second;
                    platform playerInfo;
                    playerInfo.position.x = thisPlayer.position.x;
                    playerInfo.position.y = thisPlayer.position.y;
                    playerInfo.position.z = thisPlayer.position.z;
                    playerInfo.dimensions.radius = 2.5;
                    playerInfo.dimensions.mx = -1;
                    playerInfo.dimensions.px = 1;
                    playerInfo.dimensions.my = 0;
                    playerInfo.dimensions.py = 2 - thisPlayer.state.crouchValue;
                    playerInfo.dimensions.mz = -.25;
                    playerInfo.dimensions.pz = .25;
                    if (collision(thisWeapon.radius, {thisWeapon.position.x, thisWeapon.position.y, thisWeapon.position.z}, playerInfo)) {
                        cout << "player hit" << endl;
                        broadcast("weaponHit", {{"weaponId", toString(i->first)}}, -1);
                        deletedWeapons.push_back(i->first);
                        hit = true;
                        float newHealth = thisPlayer.health - thisWeapon.damage;
                        thisPlayer.health = newHealth;
                        if (newHealth > 0) {
                        //console.log("health: " + newHealth)
                        } else {
                        if (players.count(thisWeapon.ownerId)) {
                            players.at(thisWeapon.ownerId).killCount++;
                            string deathMessage = thisPlayer.name + " was killed by " + players.at(thisWeapon.ownerId).name;
                            broadcast("chatMessage", {{"message", deathMessage}}, -1);
                        }
                        thisPlayer.socket->emit("youDied", {{"id", toString(i->first)}, {"cause", "killed"}});
                        }
                        continue;
                    }
                }
            }
        }
        for (int i = 0; i < deletedWeapons.size(); i++) weapons.erase(deletedWeapons[i]);
    }



        
};

class PrivateRoom : public Room {
    public:





};

struct {
    map<int, Room> privateRooms;
    map<int, Room> lobbyRooms;
    map<int, Room> ffaRooms;
} rooms;

void tickRooms(map<int, Room>& rooms) {
    for (auto i = rooms.begin(); i != rooms.end(); i++) {
        i->second.tick();
    }
}

void collisionRooms(map<int, Room>& rooms, int deltaTime) {
    for (auto i = rooms.begin(); i != rooms.end(); i++) {
        i->second.calculateCollision(deltaTime);
    }
}

void callDisconnect(websocket* socket) {
    try { if (socket->websocketCallbacks.count("disconnect") > 0) socket->websocketCallbacks["disconnect"]({{}}); }
    catch (const exception& exception) { cerr << "problem with socket->on disconnect (switching): " << exception.what() << endl; }
}


struct queueSpot {
    int id;
    websocket* socket;
};

vector<queueSpot> lobbyQueue;
vector<queueSpot> ffaQueue;


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

    int lobbyRoomsCount = 2;
    for (int i = 0; i < lobbyRoomsCount; i++) {
        rooms.lobbyRooms[i] = Room("full_starting_map (3).obj");
    }

    int ffaRoomsCount = 2;
    for (int i = 0; i < ffaRoomsCount; i++) {
        rooms.ffaRooms[i] = Room("full_starting_map (5).obj");
    }
    




    printf("----------------------\nSTARTING SERVER\n");

    thread tickThread([]() {
        int tickInterval = 1000 / TPS;
        auto tickThen = chrono::high_resolution_clock::now();
        int collisionInterval = 10;
        auto collisionThen = chrono::high_resolution_clock::now();
        int ffaInterval = 1000;
        auto ffaThen = chrono::high_resolution_clock::now();

        const int maxFFAPlayers = 2; // max players per ffa room
        const int maxLobbyPlayers = 3; // max players per ffa lobby

        while(true) {
            auto now = chrono::high_resolution_clock::now();
            {
                auto deltaTime = chrono::duration_cast<chrono::milliseconds>(now - tickThen).count();
                if (deltaTime > tickInterval) {
                    lock_guard<mutex> lock(mtx);
                    tickRooms(rooms.privateRooms);
                    tickRooms(rooms.lobbyRooms);
                    tickRooms(rooms.ffaRooms);
                    tickThen = now;
                }
            }
            {
                auto deltaTime = chrono::duration_cast<chrono::milliseconds>(now - collisionThen).count();
                if (deltaTime > collisionInterval) {
                    lock_guard<mutex> lock(mtx);
                    
                    collisionRooms(rooms.privateRooms, deltaTime);
                    collisionRooms(rooms.lobbyRooms, deltaTime);
                    collisionRooms(rooms.ffaRooms, deltaTime);
                    collisionThen = now;
                }
            }
            {
                auto deltaTime = chrono::duration_cast<chrono::milliseconds>(now - ffaThen).count();
                if (deltaTime > ffaInterval) {
                    lock_guard<mutex> lock(mtx);
                    for (auto i = rooms.lobbyRooms.begin(); i != rooms.lobbyRooms.end(); i++) {
                        Room* room = &i->second;
                        if (room->players.size() < maxLobbyPlayers) {
                            int openPlayerSlots = min(maxLobbyPlayers - room->players.size(), lobbyQueue.size());
                            for (int j = 0; j < openPlayerSlots; j++) {
                                callDisconnect(lobbyQueue[j].socket);
                                lobbyQueue[j].socket->emit("roomJoinSuccess", {{"roomId", toString(i->first)}});
                                room->addPlayer(lobbyQueue[j].socket);
                                queueSpot newSpot;
                                newSpot.id = lobbyQueue[j].id;
                                newSpot.socket = lobbyQueue[j].socket;
                                ffaQueue.push_back(newSpot);
                            }
                            lobbyQueue.erase(lobbyQueue.begin(), lobbyQueue.begin() + openPlayerSlots);
                        }
                    }
                    
                    for (auto i = rooms.ffaRooms.begin(); i != rooms.ffaRooms.end(); i++) {
                        Room* room = &i->second;
                        if (room->players.size() < maxFFAPlayers) {
                            int openPlayerSlots = min(maxFFAPlayers - room->players.size(), ffaQueue.size());
                            for (int j = 0; j < openPlayerSlots; j++) {
                                callDisconnect(ffaQueue[j].socket);
                                ffaQueue[j].socket->emit("roomJoinSuccess", {{"roomId", toString(i->first)}});
                                room->addPlayer(ffaQueue[j].socket);
                            }
                            ffaQueue.erase(ffaQueue.begin(), ffaQueue.begin() + openPlayerSlots);
                        }
                    }


                    //for (auto i = rooms.ffaRooms.begin(); i != rooms.ffaRooms.end(); i++) i->second.sendLeaderboard();
                    //for (auto i = rooms.privateRooms.begin(); i != rooms.privateRooms.end(); i++) i->second.sendLeaderboard();

                    ffaThen = now;
                }
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

        currentSocket->on("lagTest", [currentSocket](map<string, string> data) {
            currentSocket->emit("lagTest", {{"serverNow", toString(now())}});
        });

        currentSocket->on("lagTime", [currentSocket](map<string, string> data) {
            currentSocket->lagTime = stof(data["lagTime"]);
            cout << "lag time: " << currentSocket->lagTime << endl;
        });

        currentSocket->on("joinRoom", [currentSocket](map<string, string> data) {
            callDisconnect(currentSocket);

            int roomId = stoi(data["roomId"]);
            currentSocket->emit("roomJoinSuccess", {{"roomId", toString(roomId)}});

            if (!rooms.privateRooms.count(roomId)) {
                string filename = "full_starting_map (" + toString(roomId) + ").obj";
                if (roomId == 6) filename = "kitchenmap1.obj";
                if (roomId == 7) filename = "collision_test_map.obj";
                if (roomId == 8) filename = "collision_test_map_2.obj";
                Room newRoom(filename);
                rooms.privateRooms[roomId] = newRoom;

            }
            rooms.privateRooms.at(roomId).addPlayer(currentSocket);
            
            cout << "JOIN ROOM: " << data["roomId"] << endl;


        });

        
        currentSocket->on("joinFFAQueue", [currentSocket](map<string, string> data) {
            cout << "JOINING FFA" << endl;

            callDisconnect(currentSocket);

            int newId = nextId;
            nextId++;

            queueSpot newSpot;
            newSpot.id = newId;
            newSpot.socket = currentSocket;
            lobbyQueue.push_back(newSpot);

            currentSocket->emit("addedToFFAQueue", {{"id", toString(newId)}});
            
        });
        
    })
    .onmessage([&](crow::websocket::connection& connection, const string& data, bool inBinary) {
        lock_guard<mutex> lock(mtx);
        size_t hashValue = getHash(&connection);
        websocket* currentWebsocket = &websocketMap[hashValue];

        map<string, string> mapData = JSONStringToMap(data);


        //cout << data << " from " << &connection << endl;

        try {
            if (currentWebsocket->websocketCallbacks.count(mapData["messageType"])) {
                //cout << currentWebsocket->websocketCallbacks.count(mapData["messageType"]) << endl;
                currentWebsocket->websocketCallbacks[mapData["messageType"]](mapData);
            }
        }
        catch (const exception& exception) { cerr << "problem with socket->on " << mapData["messageType"] << ": " << exception.what() << endl; }

        //cout << "did " << mapData["messageType"] << endl;
        
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


    app.bindaddr("0.0.0.0").port(8080).multithreaded().run();


    
    
}




