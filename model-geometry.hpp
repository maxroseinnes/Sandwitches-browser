
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


modelGeometry parseWavefront(string fileText, bool seperateObjects, bool triangulateThis) {
    vector<string> lines = parseLines(fileText);
    modelGeometry object;

    string name;
    bool smooth;
    vector<array<float, 3>> positions;
    vector<array<float, 3>> normals;
    vector<array<float, 2>> texcoords;
    vector<faceIndices> indices;

    for (int i = 0; i < lines.size(); i++) {
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
                theseIndices.vertices.push_back(stoi(words[j].substr(0, words[j].find("/"))) - 1);
                words[j] = words[j].substr(words[j].find("/") + 1);

                theseIndices.texcoords.push_back(stoi(words[j].substr(0, words[j].find("/"))) - 1);
                words[j] = words[j].substr(words[j].find("/") + 1);
                
                theseIndices.normals.push_back(stoi(words[j].substr(0, words[j].find("/"))) - 1);
            }

            indices.push_back(theseIndices);
        }
    }

    object.positions = positions;
    object.normals = normals;
    object.texcoords = texcoords;
    object.smooth = smooth;
    object.indices = triangulateThis ? triangulate(indices) : indices;


    return object;

}



struct platform {
    struct{
        float x;
        float y;
        float z;
    } position;
    struct {
        float mx;
        float px;
        float my;
        float py;
        float mz;
        float pz;
        float pitch;
        float yaw;
        float roll;
        float radius;
    } dimensions;
};

array<float, 3> getSideVector(vector<array<float, 3>> points, int x, bool normalize, int direction) {
    array<float, 3> vector;
    sub(vector, points[(x + points.size() * 3) % points.size()], points[(x + points.size() * 3 + direction) % points.size()]);
    if (normalize) {
        float length = sqrt(pow(vector[0], 2) + pow(vector[1], 2) + pow(vector[2], 2));
        if (length != 0) {
            vector[0] /= length;
            vector[1] /= length;
            vector[2] /= length;
        }
    }
    return vector;
}

vector<platform> generatePlatforms(modelGeometry geometryInfo) {
    vector<platform> platforms;

    for (int i = 0; i < geometryInfo.indices.size(); i++) {
        vector<array<float, 3>> points;
        for (int j = 0; j < geometryInfo.indices[i].vertices.size(); j++) {
            points.push_back({
                geometryInfo.positions[geometryInfo.indices[i].vertices[j]][0], 
                geometryInfo.positions[geometryInfo.indices[i].vertices[j]][1], 
                geometryInfo.positions[geometryInfo.indices[i].vertices[j]][2]
            });
        }
        
        int mostAxisAlignedVector = 0;
        float mostAxisAlignedVectorValue = 0;
        for (int j = 0; j < points.size(); j++) {
            array<float, 3> vector = getSideVector(points, j, true, 1);
            for (int k = 0; k < 3; k++) {
                if (abs(vector[k]) > mostAxisAlignedVectorValue) {
                    mostAxisAlignedVector = j;
                    mostAxisAlignedVectorValue = abs(vector[k]);
                }
            }
        }

        int longestVector = 0;
        float longestVectorLength = 0;
        for (int j = 0; j < points.size(); j++) if (length(getSideVector(points, j, false, 1)) > longestVectorLength) {longestVector = j; longestVectorLength = length(getSideVector(points, j, false, 1));}
        
        float shortestVectorLength = 9999999999999;
        for (int j = 0; j < points.size(); j++) if (length(getSideVector(points, j, false, 1)) < shortestVectorLength) shortestVectorLength = length(getSideVector(points, j, false, 1));


        array<float, 3> vecToAlign;
        if (longestVectorLength / shortestVectorLength > 5) vecToAlign = getSideVector(points, longestVector, true, 1);
        else vecToAlign = getSideVector(points, mostAxisAlignedVector, true, 1);


        array<float, 2> zx = {vecToAlign[2], vecToAlign[0]};
        normalize(zx, zx);
        float yaw = (zx[0] > 0) ? asin(zx[1]) : -asin(zx[1]);
        rotateY(vecToAlign, vecToAlign, {0, 0, 0}, -yaw);

        array<float, 2> yz = {vecToAlign[1], vecToAlign[2]};
        normalize(yz, yz);
        float pitch = (yz[0] < 0) ? acos(yz[1]) : -acos(yz[1]);
        rotateX(vecToAlign, vecToAlign, {0, 0, 0}, -pitch);

        //console.log(vecToAlign)

        array<float, 3> otherVecToAlign = getSideVector(points, mostAxisAlignedVector, true, -1);
        rotateY(otherVecToAlign, otherVecToAlign, {0, 0, 0}, -yaw);
        rotateX(otherVecToAlign, otherVecToAlign, {0, 0, 0}, -pitch);

        // otherVecToAlign should be [0, y, z] -- rotate it's pitch to be [0, 0, 1]

        // roll only affects x and y
        array<float, 2> xy = {otherVecToAlign[0], otherVecToAlign[1]};
        normalize(xy, xy);
        float roll = (xy[0] > 0) ? asin(xy[1]) : -asin(xy[1]);

        array<float, 3> center = {0, 0, 0};
        for (int i = 0; i < 3; i++) for (int j = 0; j < points.size(); j++) center[i] += points[j][i] / points.size();

        //console.log(round(yaw * 180 / PI), round(pitch * 180 / PI), round(roll * 180 / PI))

        vector<array<float, 3>> layedFlatPoints;
        for (int i = 0; i < points.size(); i++) {
            layedFlatPoints.push_back({0, 0, 0});
            rotateY(layedFlatPoints[i], points[i], center, -yaw);
            rotateX(layedFlatPoints[i], layedFlatPoints[i], center, -pitch);
            rotateZ(layedFlatPoints[i], layedFlatPoints[i], center, -roll);
        }

        //console.log(layedFlatPoints)

        array<array<float, 3>, 2> dimensions;
        for (int i = 0; i < 3; i++) {
            float mValue = 999999999;
            float pValue = -999999999;
            for (int k = 0; k < points.size(); k++) {
                if (layedFlatPoints[k][i] - center[i] < mValue) {
                    dimensions[0][i] = layedFlatPoints[k][i] - center[i];
                    mValue = layedFlatPoints[k][i] - center[i];
                }
                if (layedFlatPoints[k][i] - center[i] > pValue) {
                    dimensions[1][i] = layedFlatPoints[k][i] - center[i];
                    pValue = layedFlatPoints[k][i] - center[i];
                }
            }
        }


        //console.log(dimensions)

        //if (abs(dimensions[1][1] - dimensions[0][1]) > .01) continue

        float biggestDimension = 0;
        for (int i = 0; i < dimensions.size(); i++) for (int j = 0; j < dimensions[i].size(); j++) if (abs(dimensions[i][j]) > biggestDimension) biggestDimension = abs(dimensions[i][j]);

        platform newPlatform;

        newPlatform.position.x = center[0];
        newPlatform.position.y = center[1];
        newPlatform.position.z = center[2];
        
        newPlatform.dimensions.mx = dimensions[0][0];
        newPlatform.dimensions.px = dimensions[1][0];
        newPlatform.dimensions.my = dimensions[0][1];
        newPlatform.dimensions.py = dimensions[1][1];
        newPlatform.dimensions.mz = dimensions[0][2];
        newPlatform.dimensions.pz = dimensions[1][2];
        newPlatform.dimensions.pitch = -pitch;
        newPlatform.dimensions.yaw = -yaw;
        newPlatform.dimensions.roll = -roll;
        newPlatform.dimensions.radius = biggestDimension;


        platforms.push_back(newPlatform);

        //cout << newPlatform.position.x << ", " << newPlatform.position.y << ", " << newPlatform.position.z << endl;
        //cout << newPlatform.dimensions.mx << ", " << newPlatform.dimensions.px << ", " << newPlatform.dimensions.my << ", " << newPlatform.dimensions.py << ", " << newPlatform.dimensions.mz << ", " << newPlatform.dimensions.pz << endl;
        //cout << newPlatform.dimensions.pitch << ", " << newPlatform.dimensions.yaw << ", " << newPlatform.dimensions.roll << endl;



    }

    return platforms;
}


bool collision(float weaponRadius, array<float, 3> weaponPosition, platform platformInfo) {
    auto colliderDimensions = platformInfo.dimensions;
    auto colliderPosition = platformInfo.position;

    //cout << weaponPosition[0] << ", " << weaponPosition[1] << ", " << weaponPosition[2] << endl;

    float minDistance = colliderDimensions.radius + weaponRadius + 1;
    if (
        abs(colliderPosition.x - weaponPosition[0]) > minDistance || 
        abs(colliderPosition.y - weaponPosition[1]) > minDistance || 
        abs(colliderPosition.z - weaponPosition[2]) > minDistance
    ) return false;


    array<array<float, 3>, 2> boxDimensions;

    // colliderDimensions should have: mx, px..., pitch, yaw, roll
    

    // sphere vs box collision

    array<float, 3> sphereCenter = weaponPosition;
    
    // rotate centerpoint about sphere center
    array<float, 3> centerPointPosition = {
        colliderPosition.x, 
        colliderPosition.y, 
        colliderPosition.z
    };
    rotateY(centerPointPosition, centerPointPosition, sphereCenter, colliderDimensions.yaw);
    rotateX(centerPointPosition, centerPointPosition, sphereCenter, colliderDimensions.pitch);
    rotateZ(centerPointPosition, centerPointPosition, sphereCenter, colliderDimensions.roll);


    boxDimensions[0][0] = centerPointPosition[0] + colliderDimensions.mx;
    boxDimensions[1][0] = centerPointPosition[0] + colliderDimensions.px;
    boxDimensions[0][1] = centerPointPosition[1] + colliderDimensions.my;
    boxDimensions[1][1] = centerPointPosition[1] + colliderDimensions.py;
    boxDimensions[0][2] = centerPointPosition[2] + colliderDimensions.mz;
    boxDimensions[1][2] = centerPointPosition[2] + colliderDimensions.pz;

    array<float, 3> closestPoint = {
        max(boxDimensions[0][0], min(sphereCenter[0], boxDimensions[1][0])),
        max(boxDimensions[0][1], min(sphereCenter[1], boxDimensions[1][1])),
        max(boxDimensions[0][2], min(sphereCenter[2], boxDimensions[1][2]))
    };

    return sqrt(
        pow(closestPoint[0] - sphereCenter[0], 2) + 
        pow(closestPoint[1] - sphereCenter[1], 2) + 
        pow(closestPoint[2] - sphereCenter[2], 2)
    ) < weaponRadius;


}





