

#include <string>
#include <map>
#include <fstream>
#include <sstream>
#include <type_traits>
#include <iterator>
#include <chrono>
#include <iostream>

using namespace std;



int now() {
    auto now_ms = chrono::time_point_cast<chrono::milliseconds>(chrono::system_clock::now());
    return now_ms.time_since_epoch().count();
}

float randFloat() {
    return static_cast<float>(rand()) / RAND_MAX;
}

char intToChar(int num) {
    if (num < 10) num += 48;
    else if (num < 36) num += 55;
    else num += 61;
    return static_cast<char>(num);
}

string genRandKey(int digits) {
    
    string code = "asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfadsfasdadfasdfasdasdf";
    for (int i = 0; i < digits; i++) {
        code[i] = intToChar(randFloat() * 62.0);
    }
    return code.substr(0, digits);
}

string getFileText(string filepath) {
    #ifdef _WIN32
        filepath = "C:/Users/swilliams4157/Desktop/Sandwitches-browser/" + filepath;
    #endif

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
    const char insteadOfColon = '&'; // just a random character that shouldn't be in messages
    const char insteadOfComma = '$'; // just a random character that shouldn't be in messages

    //cout << JSONString << endl;
    bool prelimInWord = false;
    for (int i = JSONString.length() - 1; i >=0; i--) {
        char thisChar = JSONString[i];
        bool inWordJustChanged = false;
        if (prelimInWord && thisChar == '"') {
            prelimInWord = false;
            inWordJustChanged = true;
        }
        //cout << prelimInWord << " " << thisChar << endl;
        if (!prelimInWord) {
            if (thisChar == ' ' || thisChar == '"' || thisChar == '\n') {
                JSONString.erase(i, 1);
            }
            if (thisChar == ':') JSONString[i] = insteadOfColon;
            if (thisChar == ',') JSONString[i] = insteadOfComma;
        }
        if (!inWordJustChanged && !prelimInWord && thisChar == '"') prelimInWord = true;
    }

    //cout << JSONString << endl;
    
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
            case insteadOfColon:
                if (nestLevel == 0) {
                    onName = false;
                    switchBroken = true;
                }
                break;
            case insteadOfComma:
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

bool includes(vector<string> names, map<string, string> data) {
    for (int i = 0; i < names.size(); i++) if (!data.count(names[i])) return false;
    return true;
}

array<float, 3> sub(array<float, 3>& out, array<float, 3> a, array<float, 3> b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

array<float, 2> normalize(array<float, 2>& out, array<float, 2> a) {
    float x = a[0];
    float y = a[1];
    float len = sqrt(x * x + y * y);
    if (len != 0) {
        out[0] = a[0] / len;
        out[1] = a[1] / len;
    }
    return out;
}

#ifdef _WIN32
float hypot(float x, float y, float z) {
    return sqrt(x * x + y * y + z * z);
}
#endif

float length(array<float, 3> a) {
    float x = a[0];
    float y = a[1];
    float z = a[2];
    return hypot(x, y, z);
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


