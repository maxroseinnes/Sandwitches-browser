
#include <string>
#include <map>
#include <vector>
#include "crow.h"

using namespace std;

string getFileText(string filepath) {
    ifstream file(filepath);

    string fileText;
    string currentString;
    while(getline(file, currentString)) {
        fileText += currentString + "\n";
    }

    return fileText;
}

string mapToJSONString(map<string, string> map) {
    string JSONString = "{";
    bool isFirstValue = true;
    for (auto nameValue = map.begin(); nameValue != map.end(); nameValue++) {
        if (!isFirstValue) JSONString += ",";
        else isFirstValue = false;
        JSONString += "\"" + nameValue->first + "\":\"" + nameValue->second + "\"";
    }
    JSONString += "}";
    return JSONString;
}

map<string, string> JSONStringToMap(string JSONString) {
    map<string, string> map;

    bool onName = true;
    bool inWord = false;
    string currentName;
    string currentValue;
    for (int i = 0; i < JSONString.length(); i++) {
        char currentChar = JSONString[i];
        switch (currentChar) {
            case '"':
                inWord = !inWord;
                break;
            case ':':
                onName = false;
                break;
            case ',':
                map[currentName] = currentValue;
                //cout << currentName << ": " << currentValue << endl;
                currentName = "";
                currentValue = "";
                onName = true;
                break;
            case '{': break;
            case '}': 
                map[currentName] = currentValue;
                //cout << currentName << ": " << currentValue << endl;
                currentName = "";
                currentValue = "";
                break;
            default:
                if (onName) currentName += currentChar;
                else currentValue += currentChar;
                break;
        }
        
    }


    return map;
}



class websocket {
    public: 
        crow::websocket::connection* webSocket;
        map<string, function<void(map<string, string>)>> websocketCallbacks;
        websocket(){};
        websocket(crow::websocket::connection* connection) {
            webSocket = connection;
            cout << "new websocket" << connection << endl;
        };

        void on(string event, function<void(map<string, string>)> callback) {
            websocketCallbacks[event] = callback;
            //map<string, string> testMap = {
            //    {"key", "ehllldskjfl"}
            //};
            //websocketCallbacks[event](testMap);
        };

        void emit(string event, map<string, string> data) {
            data["type"] = event;

            webSocket->send_text(mapToJSONString(data));
        };

};


struct {
    vector<websocket*> sockets;
    vector<crow::websocket::connection*> connections;
    websocket* findSocket(crow::websocket::connection* connection) {
        for (int i = 0; i < connections.size(); i++) {
            //cout << connections[i] << " VERSUS " << connection << endl;
            if (connections[i] == connection) {
                return sockets[i];
            }
        }
        return 0;
    }
    void add(websocket* newSocket) {
        cout << "websocket added" << newSocket->webSocket << endl;

        newSocket->websocketCallbacks["answerMe"]({{"key", "testtest"}});

        sockets.push_back(newSocket);
        connections.push_back(newSocket->webSocket);

        sockets[0]->websocketCallbacks["answerMe"]({{"key", "test2"}});
    }
    void removeByConnection(crow::websocket::connection* connection) {
        websocket* foundSocket = findSocket(connection);
        //if (foundSocket) {
        //    sockets.erase(foundSocket);
        //    return;
        //}
        //cerr << "no websocket connection found to remove" << endl;
        //return;
    }

    void runCallback(crow::websocket::connection* connection, string data) {
        websocket* thisSocket = findSocket(connection);
        cout << "run callback: " << thisSocket->webSocket << endl;
        map<string, string> dataMap = JSONStringToMap(data);
        cout << "type: " << dataMap["type"] << endl;

        sockets[0]->websocketCallbacks["answerMe"]({{"key", "test3"}});
        
    }
} allSockets;


