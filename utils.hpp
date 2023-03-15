

#include <string>
#include <map>
#include <fstream>

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


