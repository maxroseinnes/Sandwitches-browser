
#include <iostream>
#include <fstream>
#include <string>
#include <mutex>
#include <map>
#include "crow.h"

using namespace std;

int nextId = 0;



string getFileText(string filepath) {
    ifstream file(filepath);

    string fileText;
    string currentString;
    while(getline(file, currentString)) {
        fileText += currentString + "\n";
    }

    return fileText;
}


int main() {
    crow::SimpleApp app;
    mutex mtx;
    map<int, crow::websocket::connection*> users;

    CROW_WEBSOCKET_ROUTE(app, "/socket")
    .onopen([&](crow::websocket::connection& connection) {
        cout << "new connection: " << connection.get_remote_ip() << endl;
        users[nextId] = &connection;
        nextId++;

        connection.send_text("HELLO!!!!!!!");
        
    })
    .onmessage([&](crow::websocket::connection& connection, const string& data, bool inBinary) {
        cout << data << endl;
    })
    .onclose([&](crow::websocket::connection& connection, const string& reason) {
        cout << "connection closed: " << connection.get_remote_ip() << endl;
    });



    CROW_ROUTE(app, "/<string>")([](string filename) {
        cout << filename << endl;
        return getFileText(filename);
    });



    app.port(8080).multithreaded().run();
}


