

#include <string>
#include <map>
#include <fstream>
#include <sstream>
#include <type_traits>
#include <iterator>
#include <chrono>

using namespace std;



int now() {
    auto now_ms = chrono::time_point_cast<chrono::milliseconds>(chrono::system_clock::now());
    return now_ms.time_since_epoch().count();
}

float randFloat() {
    return static_cast<float>(rand()) / RAND_MAX;
}

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
        JSONString += "\"" + nameValue->first + "\":";
        if (nameValue->second[0] != '{' && nameValue->second[0] != '[') {
            JSONString += "\"" + nameValue->second + "\"";
        }
        else {
            JSONString += nameValue->second;
        }
    }
    JSONString += "}";
    return JSONString;
}


template<typename T>
string vectorToJSONString(vector<T> vector) {
    string JSONString = "[";
    for (int i = 0; i < vector.size(); i++) {
        if (i > 0) JSONString += ",";
        string value = vector[i];
        if (value[0] != '{'&& value[0] != '[') {
            JSONString += "\"" + value + "\"";
        }
        else {
            JSONString += value;
        }
    }
    JSONString += "]";
    return JSONString;
}

map<string, string> JSONStringToMap(string JSONString) {
    for (int i = JSONString.length() - 1; i >=0; i--) {
        char thisChar = JSONString[i];
        if (thisChar == ' ' || thisChar == '"' || thisChar == '\n') {
            JSONString.erase(i, 1);
        }
    }
    
    map<string, string> map;

    bool onName = true;
    bool inWord = false;
    string currentName;
    string currentValue;
    int nestLevel = 0;
    for (int i = 1; i < JSONString.length() - 1; i++) {
        char currentChar = JSONString[i];
        bool switchBroken = false;
        switch (currentChar) {
            case '"': case ' ': case '\n': 
                if (nestLevel == 0) {
                    switchBroken = true;
                }
                break;
            case ':':
                if (nestLevel == 0) {
                    onName = false;
                    switchBroken = true;
                }
                break;
            case ',':
                if (nestLevel == 0) {
                    map[currentName] = currentValue;
                    //cout << currentName << ": " << currentValue << endl;
                    currentName = "";
                    currentValue = "";
                    onName = true;
                    switchBroken = true;
                }
                break;
            case '{': 
                nestLevel++;
                break;
            case '}': 
                nestLevel--;
                break;
        }
        if (!switchBroken) {
            if (onName) currentName += currentChar;
            else currentValue += currentChar;
        }
    }
    map[currentName] = currentValue;


    return map;
}


array<float, 3> rotateX(array<float, 3>& out, array<float, 3> a, array<float, 3> b, float rad) {
    array<float, 3> p;
    array<float, 3> r;
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    //perform rotation
    r[0] = p[0];
    r[1] = p[1] * cos(rad) - p[2] * sin(rad);
    r[2] = p[1] * sin(rad) + p[2] * cos(rad);
    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
}

array<float, 3> rotateY(array<float, 3>& out, array<float, 3> a, array<float, 3> b, float rad) {
    array<float, 3> p;
    array<float, 3> r;
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    //perform rotation
    r[0] = p[2] * sin(rad) + p[0] * cos(rad);
    r[1] = p[1];
    r[2] = p[2] * cos(rad) - p[0] * sin(rad);
    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
}

array<float, 3> rotateZ(array<float, 3>& out, array<float, 3> a, array<float, 3> b, float rad) {
    array<float, 3> p;
    array<float, 3> r;
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    //perform rotation
    r[0] = p[0] * cos(rad) - p[1] * sin(rad);
    r[1] = p[0] * sin(rad) + p[1] * cos(rad);
    r[2] = p[2];
    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
}


