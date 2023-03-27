
const directions = [[0,1,0],[0,-1,0],[-1,0,0],[1,0,0],[0,0,1],[0,0,-1]];

/**
 * Returns the given degrees in radians
 * @param {*} degrees 
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180.0;
}
/**
 * Returns the given radians in degrees
 * @param {*} radians
 */
function radToDeg(radians) {
    return radians * (180.0 / Math.PI);
}
/**
 * Returns the given value clamped between the provided min and max
 * @param {*} val The value to clamp
 * @param {*} min The minimum the value can be
 * @param {*} max The maximum the value can be
 * @returns The given value clamped to be in range [min,max]
 */
function clamp(val, min, max){
    return Math.min(Math.max(val, min), max);
}
/**
 * Returns the hexadecimal representation of a given color
 * @param {*} color An array representing an rgb color value ([r,g,b] with r,g,b in range [0,1])
 * @returns A string containing the hexadecimal representation of the given rgb value
 */
function rgbToHex(color){
    r = parseInt(color[0]*255).toString(16);
    g = parseInt(color[1]*255).toString(16);
    b = parseInt(color[2]*255).toString(16);

    if (r.length == 1)
    {
        r = "0" + r;
    }
    if (g.length == 1)
    {
        g = "0" + g;
    }
    if (b.length == 1)
    {
        b = "0" + b;
    }

    return "#" + r + g + b;
}
/**
 * Returns an array representing an rgb color
 * @param {*} hex 
 * @returns 
 */
function hexToRGB(hex){
    var r = 0, g = 0, b = 0;

    if (hex.length == 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } 
    else if (hex.length == 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    r = +r/255.0;
    g = +g/255.0;
    b = +b/255.0;
    return [r,g,b];
}
function wave2(x,y){
    return Math.sin(y) * Math.cos(x);
}
function generateCubeSphereFace(normal, resolution, radius){
    var vertices = [];
    var indices = [];

    var axisA = vec3.create();
    vec3.set([normal[1],normal[2],normal[0]], axisA);

    var axisB = vec3.create();
    vec3.cross(normal, axisA, axisB);
    for(let y = 0; y < resolution; y++){
        for(let x = 0; x < resolution; x++){
            var index = x + y * resolution;

            var percent = [x / parseFloat(resolution-1), y / parseFloat(resolution-1)];
            var cubeVertex = vec3.create();
            var toAdd0 = [axisA[0] * 2 * (percent[0] - 0.5), axisA[1] * 2 * (percent[0] - 0.5), axisA[2] * 2 * (percent[0] - 0.5)];
            var toAdd1 = [axisB[0] * 2 * (percent[1] - 0.5), axisB[1] * 2 * (percent[1] - 0.5), axisB[2] * 2 * (percent[1] - 0.5)];
            vec3.add(toAdd0, toAdd1, toAdd0);
            vec3.add(normal, toAdd0, cubeVertex);
            cubeVertex = vec3.normalize(cubeVertex);

            sphereVertex = [cubeVertex[0] * radius, cubeVertex[1] * radius, cubeVertex[2] * radius];
            vertices.push(sphereVertex[0]);
            vertices.push(sphereVertex[1]);
            vertices.push(sphereVertex[2]);

            if(x != resolution - 1 && y != resolution - 1){
                indices.push(index);
                indices.push(index + resolution + 1);
                indices.push(index + resolution);

                indices.push(index);
                indices.push(index + 1);
                indices.push(index + resolution + 1);
            }
        }
    }

    var cubeSphereMesh = new Mesh();
    cubeSphereMesh.createNewBuffers(vertices, indices);
    return cubeSphereMesh;
}
function generatePlaneMesh(size, resolution){
    var vertices = [];
    var indices = [];

    var xStep = size[0] / parseFloat(resolution);
    var yStep = size[1] / parseFloat(resolution);
    for(let y = 0; y < resolution + 1; y++){
        for(let x = 0; x < resolution + 1; x++){
            vertices.push(x*xStep);
            vertices.push(0);
            vertices.push(-y*yStep);
        }
    }

    for(let r = 0; r < resolution; r++){
        for(let c = 0; c < resolution; c++){
            var index = (r*resolution) + r + c;
            indices.push(index);
            indices.push(index + resolution + 2);
            indices.push(index + resolution + 1);

            indices.push(index);
            indices.push(index + 1);
            indices.push(index + resolution + 2);
        }
    }

    var planeMesh = new Mesh();
    planeMesh.createNewBuffers(vertices, indices);
    return planeMesh;
}

var featureSize = 10.0;
var noiseStrength = 2.0;
function generateNoiseMesh(size, resolution){
    var vertices = [];
    var indices = [];

    var xStep = size[0] / parseFloat(resolution);
    var yStep = size[1] / parseFloat(resolution);
    for(let y = 0; y < resolution + 1; y++){
        for(let x = 0; x < resolution + 1; x++){
            vertices.push(x*xStep);
            vertices.push(noiseStrength * noise.simplex2(x*xStep / featureSize, -y*yStep / featureSize));
            vertices.push(-y*yStep);
        }
    }

    for(let r = 0; r < resolution; r++){
        for(let c = 0; c < resolution; c++){
            var index = (r*resolution) + r + c;
            indices.push(index);
            indices.push(index + resolution + 2);
            indices.push(index + resolution + 1);

            indices.push(index);
            indices.push(index + 1);
            indices.push(index + resolution + 2);
        }
    }

    var planeMesh = new Mesh();
    planeMesh.createNewBuffers(vertices, indices);
    return planeMesh;
}
/**
 * Generates a mesh representing a cylinder of the given resolution, with given bottom and top circle radii
 * @param {*} resolution The resolution of the cylinder. NOTE: Resolution must evenly divide 360 (otherwise it will be DECREASED to the next closest divisor and clamped between 1 and 360)
 * @param {*} bottomRadius The radius of the bottom circle of the cylinder
 * @param {*} topRadius The radius of the top circle of the cylinder
 * @returns A Mesh object representing a cylinder
 */
function generateCylinderMesh(resolution, bottomRadius, topRadius){
    //I tried for a long time to find any information on generating cylinders programatically online.
    //But could not find any good information, so I decided to just do the vertex and index math myself on paper.
    //Its not that impressive as the math wasn't that hard but I'm still kinda proud of it :D
    vertices = [];
    indices = [];

    //Clamp resolution first then verify it evenly divides 360
    resolution = clamp(resolution, 1, 360);

    //If the resolution does not evenly divide 360 decrease it until it does or reaches 1
    while(360 % resolution != 0 && resolution > 1){
        console.log("CYLINDER RESOLUTION ERROR: 360 % " + resolution + " != 0 DECREASING RESOLUTION TO: " + (resolution-1));
        resolution--;
    }

    //Get the angle to move each step (in degrees)
    var angle = 360/resolution;

    //Add the vertices lying on the edge of the bottom circle
    //Each iteration moves to the next point that is 'angle' degrees away (in the counter clockwise direction)
    //NOTE: Cylinder is constructed with height = 1.0, aligned with Y-axis
    //      So the vertex x position is calculated with cosine, and z position with sin
    //      If the cylinder needs to be scaled or rotated it can be be done using the WorldObject Transform
    for(let i = 0; i < resolution; i++){
        vertices.push(bottomRadius*Math.cos(degToRad(i*angle)), -0.5, -bottomRadius*Math.sin(degToRad(i*angle)));
    }
    //Add the vertices lying on the edge of the top circle
    for(let i = 0; i < resolution; i++){
        vertices.push(topRadius*Math.cos(degToRad(i*angle)), 0.5, -topRadius*Math.sin(degToRad(i*angle)));
    }

    //Push the triangles connecting the bottom vertices to the top vertices
    //These values are DIRECTLY related to how the vertices are pushed in the previous two loops
    for(let i = 0; i < resolution; i++){
        var modVal = (i+1) % resolution;

        indices.push(i);
        indices.push(modVal + resolution);
        indices.push(i+resolution);

        indices.push(modVal);
        indices.push(modVal + resolution);
        indices.push(i);
    }

    //Push the vertex at the center of the bottom circle
    vertices.push(0.0, -0.5, 0.0);
    //Push the vertex at the center of the top circle
    vertices.push(0.0, 0.5, 0.0);

    //These values are DIRECTLY related to how the egdge vertices are pushed in the previous loops AND how the circle center vertices are pushed
    //Push the triangles connecting the bottom vertices to the bottom circle edge vertices (i.e. construct the bottom circle)
    for(let i = 0; i < resolution; i++){
        indices.push(i);
        indices.push(resolution*2);
        indices.push((i+1)%resolution);
    }
    //Push the triangles connecting the top vertices to the top circle edge vertices (i.e. construct the top circle)
    for(let i = 0; i < resolution; i++){
        indices.push(i+resolution);
        indices.push((i+1)%resolution+resolution);
        indices.push(resolution*2+1);
    }

    var cylinderMesh = new Mesh();
    cylinderMesh.createNewBuffers(vertices, indices);
    return cylinderMesh;
}

function eulerAnglesFromRotationMat4(rotMat){
    var theta1, v1, phi1, theta2, v2, phi2;
    if(Math.abs(rotMat[8]-1) > 0.0001 && Math.abs(rotMat[8]+1) > 0.0001){
        theta1 = -Math.asin(rotMat[8]);
        theta2 = Math.PI - theta1;

        v1 = Math.atan2(rotMat[9] / Math.cos(theta1), rotMat[10] / Math.cos(theta1));
        v2 = Math.atan2(rotMat[9] / Math.cos(theta2), rotMat[10] / Math.cos(theta2));

        phi1 = Math.atan2(rotMat[4] / Math.cos(theta1), rotMat[0] / Math.cos(theta1));
        phi2 = Math.atan2(rotMat[4] / Math.cos(theta2), rotMat[0] / Math.cos(theta2));
    }else{
        phi1 = 0;
        if(Math.abs(rotMat[8]+1) < 0.0001){
            theta1 = Math.PI/2.0;
            v1 = phi1 + Math.atan2(rotMat[1],rotMat[2]);
        }else{
            theta1 = -Math.PI/2.0;
            v1 = -phi1 + Math.atan2(-rotMat[1],-rotMat[2]);
        }
        theta2 = theta1;
        v2 = v1;
        phi2 = phi1;
    }
    return [[v1, theta1, phi1], [v2, theta2, phi2]];
}