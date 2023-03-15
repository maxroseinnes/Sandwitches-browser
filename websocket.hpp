
#include <string>
#include <map>
#include <vector>
#include "utils.hpp"
#include "crow.h"

using namespace std;



class websocket {
    public: 
        crow::websocket::connection* webSocket;
        map<string, function<void(map<string, string>)>> websocketCallbacks;
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

/*
struct {
    vector<websocket*> sockets;
    vector<crow::websocket::connection*> connections;
    websocket* findSocket(crow::websocket::connection& connection) {
        for (int i = 0; i < connections.size(); i++) {
            //cout << connections[i] << " VERSUS " << connection << endl;
            if (connections[i] == &connection) {
                return sockets[i];
            }
        }
    }
    void add(websocket& newSocket) {
        //cout << "websocket added" << newSocket->webSocket << endl;

        //newSocket.websocketCallbacks({{"key", "testtest"}});

        sockets.push_back(&newSocket);
        connections.push_back(newSocket.webSocket);

        //sockets[0]->websocketCallbacks({{"key", "test2"}});
    }
    void removeByConnection(crow::websocket::connection& connection) {
        websocket* foundSocket = findSocket(connection);
        //if (foundSocket) {
        //    sockets.erase(foundSocket);
        //    return;
        //}
        //cerr << "no websocket connection found to remove" << endl;
        //return;
    }

    void runCallback(crow::websocket::connection& connection, string data) {
        cout << "callback pointer: " << sockets[0]->websocketCallbacks << endl;
        websocket* thisSocket = findSocket(connection);
        //cout << "running callback: " << thisSocket.webSocket << endl;
        map<string, string> dataMap = JSONStringToMap(data);
        cout << "type: " << dataMap["type"] << endl;

        //sockets[0]->websocketCallbacks({{"key", "test3"}});
        
    }
} allSockets;
*/


