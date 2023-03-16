
#include <iostream>
#include <fstream>
#include <stdio.h>
#include <math.h>
#include <string>
#include <sstream>
#include <chrono>
#include <map>
#include <mutex>
#include <unordered_set>
#include <functional>
#include <regex>
#include <cstdlib>

#include "crow.h"
#include "types.hpp"

using namespace std;



const float DEFAULT_PLAYER_HEALTH = 100;
const int ROOM_CAP = 10;


unsigned int nextId = 0;
unsigned int nextWeaponId = 0;

const int TPS = 20;

class Room {
    private: 
    
    public: 
        string mapFile;
        map<unsigned int, player*> players;
        map<unsigned int, weapon*> weapons;

        Room() {}
        Room(string mapFileName) {
            mapFile = mapFileName;

            // generate platforms
        }

        void broadcast(string message, string data, unsigned int except) {
            for (auto nameValue = players.begin(); nameValue != players.end(); nameValue++) {
            if (nameValue->first != except) {
                
            }
            }
        }

        void addPlayer(websocket* newSocket) {
            player newPlayer(newSocket);
            players[nextId] = &newPlayer;
            unsigned int assignedId = nextId;
            nextId++;

            websocket* socket = newPlayer.socket;

            // ------------ initial player communications ------------ // 

            map<string, string> otherPlayersInfo;
            for (auto player = players.begin(); player != players.end(); player++) {
                player thisPlayer = *player->second;
                otherPlayersInfo[toString(player->first)] = mapToJSONString(toMap(thisPlayer));
            }

            socket->emit("otherPlayers", otherPlayersInfo);

            socket->emit("assignPlayer", toMap(newPlayer));

            socket->emit("startTicking", {{"TPS", toString(TPS)}});

            broadcast("newPlayer", toMap(newPlayer), assignedId);

            

            // ------------ put socket callbacks here ------------ // 

            socket->on("answerMe", [socket](map<string, string> data) {
                cout << "I will answer: " << data["key"] << endl;

                socket->emit("answer", {{"answer", data["key"]}});
            });




        }

        void respawnPlayer(unsigned int id) {
            broadcast("playerRespawned", {{"id", toString(id)}}, -1);
            players[id]->position.x = rand() * 10.0 - 5.0;
            players[id]->position.y = 2;
            players[id]->position.z = rand() * 10.0 - 5.0;
            players[id]->position.yaw = 0.0;
            players[id]->position.pitch = 0.0;
            players[id]->health = DEFAULT_PLAYER_HEALTH;
            players[id]->socket->emit("respawn", genPlayerPacket(id));
        }

        map<string, string> genPlayerPacket(unsigned int id) {
            return {
                {"position", mapToJSONString(toMap(players[id]->position))},
                {"state", mapJSONString(toMap(players[id]->state))},
                {"health", toString(players[id]->health)},
                {"currentWeaponType", toString(players[id]->currentWeaponType)},
                {"charging", toString(players[id]->charging)},
                {"health", toString(players[id]->health)}
            };
        }


        
};


struct {
    map<int, Room> privateRooms;
    map<int, Room> lobbyRooms;
    map<int, Room> ffaRooms;
} rooms;


size_t getHash(crow::websocket::connection* connection) {
    hash<crow::websocket::connection*> hasher;
    return hasher(connection);
}

int main() {
    initWeaponSpecs();

    rooms.privateRooms[1] = Room("full_starting_map (5).obj");


    printf("----------------------\nSTARTING SERVER\n");

    map<size_t, websocket> websocketMap;



    crow::SimpleApp app;
    mutex mtx;

    crow::logger::setLogLevel(crow::LogLevel::WARNING);

    CROW_WEBSOCKET_ROUTE(app, "/socket")
    .onopen([&](crow::websocket::connection& connection) {
        lock_guard<mutex> lock(mtx);

        cout << "new connection: " << &connection << endl;

        websocket newSocket(connection);

        size_t hashValue = getHash(&connection);
        websocketMap[hashValue] = newSocket;
        websocket* currentSocket = &websocketMap[hashValue];

        
        rooms.privateRooms[1].addPlayer(currentSocket);

        currentSocket->on("joinRoom", [currentSocket](map<string, string> data) {
            cout << "JOIN ROOM: " << data["roomId"] << endl;

            currentSocket->emit("roomJoinSuccess", {{"roomId", "1"}});

            rooms.privateRooms[1].addPlayer(currentSocket);
            
        });
        


        
    })
    .onmessage([&](crow::websocket::connection& connection, const string& data, bool inBinary) {
        lock_guard<mutex> lock(mtx);
        //cout << data << " from " << &connection << endl;

        size_t hashValue = getHash(&connection);
        websocket* currentWebsocket = &websocketMap[hashValue];

        map<string, string> mapData = JSONStringToMap(data);
        try { currentWebsocket->websocketCallbacks[mapData["type"]](mapData); }
        catch (exception exception) { cerr << "problem with socket.on " << mapData["type"] << ": " << exception.what() << endl; }

        
    })
    .onclose([&](crow::websocket::connection& connection, const string& reason) {
        lock_guard<mutex> lock(mtx);
        cout << "connection closed: " << &connection << " because " << reason << endl;
        
        //size_t hashValue = getHash(&connection);
        //delete &websocketMap[hashValue];

    });



    CROW_ROUTE(app, "/<path>")([](string filename) {
        //cout << "requesting " << filename << endl;

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




