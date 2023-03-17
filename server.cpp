
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

#include "crow.h"
#include "types.hpp"

using namespace std;




unsigned int nextId = 0;
unsigned int nextWeaponId = 0;

const int TPS = 20;

size_t getHash(crow::websocket::connection* connection) {
    hash<crow::websocket::connection*> hasher;
    return hasher(connection);
}

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

        void broadcast(string event, map<string, string>* data, int except) {
            for (auto nameValue = players.begin(); nameValue != players.end(); nameValue++) {
                if (nameValue->first != except) {
                cout << nameValue->first << endl;
                    //websocket socket = *nameValue->second->socket;
                    //socket.emit(event, *data);
                }
            }
        }

        void addPlayer(websocket* newSocket) {
            player newPlayer(newSocket);
            players[nextId] = &newPlayer;
            unsigned int assignedId = nextId;
            nextId++;

            websocket* socket = newPlayer.socket;

            // ------------ put socket callbacks here ------------ // 

            socket->on("answerMe", [socket](map<string, string> data) {
                cout << "I will answer: " << data["key"] << endl;

                socket->emit("answer", {{"answer", data["key"]}});
            });
            map<string, string> otherPlayersInfo;
            for (auto nv = players.begin(); nv != players.end(); nv++) {
                player thisPlayer = *nv->second;
                map<string, string> thisPlayerInfo;
                thisPlayerInfo["name"] = thisPlayer.name;
                thisPlayerInfo["position"] = mapToJSONString(toMap(thisPlayer.position));
                thisPlayerInfo["state"] = mapToJSONString(toMap(thisPlayer.state));
                thisPlayerInfo["currentWeaponType"] = thisPlayer.currentWeaponType;
            }

            socket->emit("otherPlayers", otherPlayersInfo);
/*
*/

            cout << "broadcasting" << endl;

            map<string, string> testMap;
            testMap["playerId"] = toString(assignedId);
            broadcast("weaponStatesRequest", &testMap, -1);
            //respawnPlayer(assignedId);

        }

        void respawnPlayer(unsigned int id) {
            //if (players.)
        }

        void removePlayerBySocket(size_t socketHash) {
            for (auto nv = players.begin(); nv != players.end(); nv++) {
                cout << "first: " << socketHash << " second: " << nv->second->socket->hashValue << endl;
                if (socketHash == nv->second->socket->hashValue) {
                    players.erase(nv->first);
                }
            }
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

        cout << "hash: " << hashValue << endl;

        newSocket.hashValue = hashValue;

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

        size_t hashValue = getHash(&connection);
        websocket* currentWebsocket = &websocketMap[hashValue];

        rooms.privateRooms[1].removePlayerBySocket(hashValue);
        
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




