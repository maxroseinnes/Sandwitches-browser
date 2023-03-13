
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

#include "crow.h"
#include "types.hpp"

using namespace std;




unsigned int nextId = 0;
unsigned int nextWeaponId = 0;

const int TPS = 20;

class Room {
    private: 
    
    public: 
        string mapFile;
        map<unsigned int, player> players;
        map<unsigned int, weapon> weapons;

        Room() {}
        Room(string mapFileName) {
            mapFile = mapFileName;

            // generate platforms
        }

        void broadcast(string message, string data, unsigned int except) {

        }

        void addPlayer(websocket* socket) {
            player newPlayer;
            newPlayer.socket = socket;
            players[nextId] = newPlayer;
            nextId++;

            map<string, string> testData;
            testData["message"] = "hi";
            newPlayer.socket->emit("sup", testData);
            newPlayer.socket->on("answerMe", [](map<string, string> data) {
                cout << "the key is: " << data["key"] << endl;
            });

            //map<string, string> testMap = {
            //    {"key", "ehllldskjfl"}
            //};
            //newPlayer.socket.websocketCallbacks["answerMe"](testMap);
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


    printf("----------------------\nSTARTING SERVER\n");



    crow::SimpleApp app;
    mutex mtx;

    crow::logger::setLogLevel(crow::LogLevel::WARNING);

    CROW_WEBSOCKET_ROUTE(app, "/socket")
    .onopen([&](crow::websocket::connection& connection) {
        

        cout << "new connection: " << &connection << endl;

        lock_guard<mutex> _(mtx);

        websocket newSocket(&connection);

        rooms.privateRooms[1].addPlayer(&newSocket);
        allSockets.add(&newSocket);

        allSockets.sockets[0]->websocketCallbacks["answerMe"]({{"key", "test5"}});
        cout << &allSockets.sockets[0]->websocketCallbacks << endl;
        


        
    })
    .onmessage([&](crow::websocket::connection& connection, const string& data, bool inBinary) {
        cout << data << "from: " << &connection << endl;

        lock_guard<mutex> _(mtx);
        
        cout << &allSockets.sockets[0]->websocketCallbacks << endl;
        allSockets.sockets[0]->websocketCallbacks["answerMe"]({{"key", "test4"}});
        allSockets.runCallback(&connection, data);

        
    })
    .onclose([&](crow::websocket::connection& connection, const string& reason) {
        cout << "connection closed: " << &connection << endl;
        allSockets.removeByConnection(&connection);

    });



    CROW_ROUTE(app, "/<path>")([](string filename) {
        return getFileText("public/" + filename);
    });

    app.port(8080).multithreaded().run();


    

    
}




