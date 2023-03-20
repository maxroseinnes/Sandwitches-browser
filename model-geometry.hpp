
#include <iostream>
#include <string>
#include <vector>
#include "utils.hpp"

using namespace std;


struct faceIndices {
    vector<int> vertices;
    vector<int> normals;
    vector<int> texcoords;
};

struct modelGeometry {
    vector<array<float, 3>> positions;
    vector<array<float, 3>> normals;
    vector<array<float, 2>> texcoords;
    bool smooth;
    vector<faceIndices> indices;
};



vector<string> parseWords(string input) {
    vector<string> output;
    string currentWord;
    for (int i = 0; i < input.size(); i++) {
        if (input[i] != ' ') currentWord += input[i];
        else {
            output.push_back(currentWord);
            currentWord = "";
        }
    } output.push_back(currentWord);
    return output;
}

vector<string> parseLines(string input) {
    vector<string> output;
    string currentLine;
    for (int i = 0; i < input.size(); i++) {
        if (input[i] != '\n') currentLine += input[i];
        else {
            output.push_back(currentLine);
            currentLine = "";
        }
    } output.push_back(currentLine);
    return output;
}

vector<float> parseFloats(vector<string> input) {
    vector<float> output;
    for (int i = 0; i < input.size(); i++) {
        output.push_back(stof(input[i]));
    }
    return output;
}


vector<faceIndices> triangulate(vector<faceIndices> indices) {
    vector<faceIndices> newIndices;
    for (int i = 0; i < indices.size(); i++) {
        faceIndices currentIndices = indices[i];
        
        for (int j = 0; j < currentIndices.vertices.size() - 2; j++) {
            faceIndices currentNewIndices;
            currentNewIndices.vertices = {currentIndices.vertices[0], currentIndices.vertices[j+1], currentIndices.vertices[j+2]};
            currentNewIndices.normals = {currentIndices.normals[0], currentIndices.normals[j+1], currentIndices.normals[j+2]};
            currentNewIndices.texcoords = {currentIndices.texcoords[0], currentIndices.texcoords[j+1], currentIndices.texcoords[j+2]};
            newIndices.push_back(currentNewIndices);
        }
    }
    return newIndices;
}


map<string, modelGeometry> parseWavefront(string fileText, bool triangulateThis) {
    vector<string> lines = parseLines(fileText);

    vector<int> objectStartIndices;
    for (int i = 0; i < lines.size(); i++) {
        if (lines[i].substr(0, lines[i].find(" ")) == "o") {
            //cout << "found start index" << endl;
            objectStartIndices.push_back(i);
        }
    } objectStartIndices.push_back(lines.size());

    map<string, modelGeometry> objects;
    for(int o = 0; o < objectStartIndices.size() - 1; o++) {
        int totalBeforeVertices = 0;
        int totalBeforeNormals = 0;
        int totalBeforeTexcoords = 0;
        for (auto i = objects.begin(); i != objects.end(); i++) {
            totalBeforeVertices += objects[i->first].positions.size();
            totalBeforeNormals += objects[i->first].normals.size();
            totalBeforeTexcoords += objects[i->first].texcoords.size();
        }

        string name;
        bool smooth;
        vector<array<float, 3>> positions;
        vector<array<float, 3>> normals;
        vector<array<float, 2>> texcoords;
        vector<faceIndices> indices;

        for (int i = objectStartIndices[o]; i < objectStartIndices[o+1]; i++) {
            string identifier = lines[i].substr(0, lines[i].find(" "));

            string currentLine = lines[i].substr(lines[i].find(" ") + 1);

            if (identifier == "o") name = currentLine.substr(0, -1);

            if (identifier == "v") {
                vector<float> currentPosition = parseFloats(parseWords(currentLine));
                positions.push_back({currentPosition[0], currentPosition[1], currentPosition[2]});
            }
            
            if (identifier == "vn") {
                vector<float> currentNormal = parseFloats(parseWords(currentLine));
                normals.push_back({currentNormal[0], currentNormal[1], currentNormal[2]});
            }

            if (identifier == "vt") {
                vector<float> currentTexcoord = parseFloats(parseWords(currentLine));
                texcoords.push_back({currentTexcoord[0], currentTexcoord[1]});
            }

            if (identifier == "s") smooth = stof(currentLine);

            if (identifier == "f") {
                faceIndices theseIndices;

                vector<string> words = parseWords(currentLine);
                for (int j = 0; j < words.size(); j++) {
                    theseIndices.vertices.push_back(stoi(words[j].substr(0, words[j].find("/"))) - 1 - totalBeforeVertices);
                    words[j] = words[j].substr(words[j].find("/") + 1);

                    theseIndices.texcoords.push_back(stoi(words[j].substr(0, words[j].find("/"))) - 1 - totalBeforeTexcoords);
                    words[j] = words[j].substr(words[j].find("/") + 1);
                    
                    theseIndices.normals.push_back(stoi(words[j].substr(0, words[j].find("/"))) - 1 - totalBeforeNormals);
                }

                indices.push_back(theseIndices);
            }
        }

        objects[name].positions = positions;
        objects[name].normals = normals;
        objects[name].texcoords = texcoords;
        objects[name].smooth = smooth;
        objects[name].indices = triangulateThis ? triangulate(indices) : indices;
    }


    return objects;

}





