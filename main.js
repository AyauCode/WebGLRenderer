///////////////////////////////////////////////////////
//FileName: main.js
//Author: Ayau(AyauCode)
//Copyright 2023, Ayau(AyauCode), All rights reserved.
///////////////////////////////////////////////////////

//The OpenGL Context
var gl;
//The canvas element being drawn to
var canvas;

var currentMaterial;

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL!");
    }
}

function createGameObjectFromJSON(filename, modelTransform, modelColor){
    let request = new XMLHttpRequest();
    request.open("GET", filename);

    request.onreadystatechange = function (){
        if(request.readyState == 4){
            loadJSON(JSON.parse(request.responseText), modelTransform, modelColor);
        }
    }
    request.send();
}
function loadJSON(modelData, modelTransform, modelColor){
    var vertices = modelData.vertices;
    var faces = modelData.faces;
    var indices = [];
    //NOTE: Every model I looked at from: https://rigmodels.com/index.php has their JSON format made for Three.Javascript
    //This is fine for the vertices, HOWEVER the JSON format for Three.js uses faces, which, if it was like .obj, would be fine as there is plenty of documentation about the .obj format.
    //But no matter HOW HARD I looked I could not find any information on the Three.js JSON format. So I spent some time looking at the values in the faces attribute of the JSON
    //And it seems that the last 3 integers of each line are the indices I need. For every model I looked at each "line" in the array was 11 integers.
    //So to get all the indices we need, we loop skipping 11 spaces each time so we are always reading the last 3 integers in the line.
    //This retrieves the correct indices for every model I could fine. But, more than likely a length of 11 is not the default and this wont work for some models.
    for(let i = 8; i < faces.length; i+=11){
        indices.push(faces[i]);
        indices.push(faces[i+1]);
        indices.push(faces[i+2]);
    }

    var mesh = new Mesh();
    mesh.createNewBuffers(vertices, indices);
    mesh.calculateNormals(vertices, indices);
    var modelObject = new WorldObject(mesh, modelTransform, modelColor);
    return modelObject;
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

requestAnimationFrame(mainProgramLoop);
var then = 0;
var currentTime;
var deltaTime = 0;
var lastPointerLockElement;

var cam;

var normalMatrix;

var mainLightObject;

var heirarchicalObject;
var groundPlaneObject, terrainObject, waterObject;
var skyQuad;

var keyStates = {};

//===========================================================
function initScene() {
    normalMatrix = mat3.create();
    //Initialize noise with random seed (Math.random() returns value between [0,1) but gets scaled by 65536 in perlin.js)
    noise.seed(Math.random());

    //==========Initialize=Entity=Mesh=Primitives============
    initMeshPrimitives();
    //=======================================================
    skyQuad = new WorldObject(screenSizeQuadMesh, new Transform(null), [1.0,0.0,0.0], skyMat);

    //===============Camera/Lighting=Objects=================
    cam = new Camera(new Transform(null), 60, 1.0, 0.1, 500);

    mainLightObject = new Sphere(new Transform(null), [1.0, 1.0, 1.0], defaultSphereMeshResolution, 0.5, unlitMat);
    mainLightObject.getTransform().setLocalPosition([30,7.5,-22]);
    mainLightObject.getTransform().setLocalScale([0.5,0.5,0.5]);
    //=======================================================
    
    //==============HIERARCHICAL=WORLD=OBJECT================
    heirarchicalObject = new Cylinder(new Transform(null), [Math.random(), Math.random(), Math.random()], defaultCylinderMeshResolution, 0.5, 0.5);
    heirarchicalObject.getTransform().setLocalPosition([25,1,-25]);
    heirarchicalObject.getTransform().setLocalScale([1, 2, 1]);

    heirarchicalObjectSphere = new Sphere(new Transform(heirarchicalObject.getTransform()), [Math.random(), Math.random(), Math.random()], defaultSphereMeshResolution, 0.5);
    heirarchicalObjectSphere.getTransform().setLocalPosition([0,0.75,0]);
    heirarchicalObjectSphere.getTransform().setLocalScale([1.5,0.75,1.5]);

    heirarchicalObjectPyramid = new Pyramid(new Transform(heirarchicalObjectSphere.getTransform()), [Math.random(), Math.random(), Math.random()]);
    heirarchicalObjectPyramid.getTransform().setLocalRotationFromEulerAngles([degToRad(90),0,0]);
    heirarchicalObjectPyramid.getTransform().setLocalPosition([0,0,-0.5]);
    heirarchicalObjectPyramid.getTransform().setLocalScale([0.5,0.5,0.5]);

    heirarchicalObjectLeftCube = new Cube(new Transform(new Transform(heirarchicalObject.getTransform())), [Math.random(), Math.random(), Math.random()]);
    heirarchicalObjectLeftCube.getTransform().setLocalPosition([-0.75,0.25,0]);
    heirarchicalObjectLeftCube.getTransform().setLocalScale([0.8,0.15,0.25]);

    heirarchicalObjectRightCube = new Cube(new Transform(new Transform(heirarchicalObject.getTransform())), [Math.random(), Math.random(), Math.random()]);
    heirarchicalObjectRightCube.getTransform().setLocalPosition([0.75,0.25,0]);
    heirarchicalObjectRightCube.getTransform().setLocalScale([0.8,0.15,0.25]);

    topHat = new Cylinder(new Transform(heirarchicalObjectSphere.getTransform()), [0.35, 0.35, 0.35], defaultCylinderMeshResolution, 0.5, 0.5);
    topHat.getTransform().setLocalPosition([0,0.8,0]);
    topHat.getTransform().setLocalScale([0.8,0.8,0.8])
    topHatBrim = new Cylinder(new Transform(topHat.getTransform()), [0.35, 0.35, 0.35], defaultCylinderMeshResolution, 0.5, 0.5);
    topHatBrim.getTransform().setLocalPosition([0,-0.5,0]);
    topHatBrim.getTransform().setLocalScale([1.5, 0.15, 1.5]);
    //=======================================================

    //===============PRIMITIVE=WORLD=OBJECTS=================
    cubeObject = new Cube(new Transform(null), [0.25, 1, 0.25]);
    cubeObject.getTransform().setLocalPosition([20,0.5,-15]);

    cylinderObject = new Cylinder(new Transform(null), [Math.random(), Math.random(), Math.random()], defaultCylinderMeshResolution, 0.5, 0.5);
    cylinderObject.getTransform().setLocalPosition([20,0.5,-20]);

    sphereObject = new Sphere(new Transform(null), [Math.random(), Math.random(), Math.random()], defaultSphereMeshResolution, 0.5);
    sphereObject.getTransform().setLocalPosition([20,0.5,-25]);

    pyramidObject = new Pyramid(new Transform(null), [Math.random(), Math.random(), Math.random()]);
    pyramidObject.getTransform().setLocalPosition([20,0.5,-30]);
    //=======================================================

    //==============Ground=Plane=World=Object================
    groundPlaneObject = new WorldObject(generatePlaneMesh([50,50],80), new Transform(null), [Math.random(),Math.random(),Math.random()]);
    //=======================================================

    //=============Simplex=Terrain=World=Object==============
    terrainObject = new WorldObject(generateNoiseMesh([50,50], 80), new Transform(null), [Math.random(),Math.random(),Math.random()]);
    //=======================================================

    //==============Water=Mesh=World=Object==================
    waterObject = new WorldObject(generatePlaneMesh([50,50], 80), new Transform(null), [0.0,0.0,1.0], waterMat);
    //=======================================================

    cam.lookAt(camStartPos,heirarchicalObject.getTransform().getLocalPosition(),[0,1,0]);
}
///////////////////////////////////////////////////////////////
function mainProgramLoop(now) {
    //If OpenGL has not been initialized yet dont attempt to draw the scene
    if(!gl) {
        requestAnimationFrame(mainProgramLoop);
        return;
    }
    //=================Time=Calculation======================
    //Calculate current time(now) and convert to seconds
    now *= 0.001;
    currentTime = now;
    //Update FPS variable
    updateFPS(now);
    //Calculate the change in time between the current frame and the last (in seconds)
    //deltaTime used in ensuring framerate indepedent calculations
    deltaTime = now - then;

    //Set the previous time to the current time to be used next frame
    then = now;
    //=======================================================

    //=================Update=Pointer=Lock===================
    //Google Chrome puts a timer on how fast the cursor can be relocked after being previously locked (about 1 second).
    //If the user tries to lock the cursor before the timeout an error is thrown when the cursor lock is requested.
    //So if the user just went from being locked to unlocked start a timer (1.5 seconds just in case) so the request cannot be sent before the browser is ready.
    //This MUST be checked constantly as Google Chrome "eats" the Escape key event when the cursor is locked...
    //So there is no way to detect when the user has pressed Escape to unlock the cursor, therefore it must be constantly checked.
    if(lastPointerLockElement === canvas && document.pointerLockElement != lastPointerLockElement){
        startPointerLockTimeout(now);
    }
    if(!canPointerLock){
        updatePointerLockTimeout(now);
    }
    //=======================================================

    if(!freeCam && followObject){
        cam.lookAt(cam.getTransform().getLocalPosition(), heirarchicalObject.getTransform().getLocalPosition(), [0,1,0]);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //This loop might be bad, but I think it optimizes rendering
    //Each shader is used to create a material, objects are sorted in the map by their material.
    //The value of the material Map is another map, whose key is a mesh, and value is a list of game objects
    //So for each material bind the properties specific to that material, then for each mesh with that material bind the vertices/indices/normals specific to that mesh
    //Finally for each game object using that mesh bind the object specific properties (transformation, color, etc.)
    //This could be highly improved by using instancing instead (Which I plan to do in the future)
    //======================DRAW=OBJECTS=========================
    for(var material of materialList){
        if(swapToNewMaterial(material)){

            var worldObjectKeys = currentWorldObjectMap.keys();
            for(var key of worldObjectKeys){
                currentMaterial.bindMesh(key);
    
                currentMaterial.bindShaderOneOff(key);
    
                var worldObjectList = currentWorldObjectMap.get(key);
                for(let i = 0; i < worldObjectList.length; i++){
                    //Some options prevent certain objects from rendering, if the option is unselected dont render that object
                    //This creates a lot of conditional statements on each iteration so maybe just remove the object from the map?
                    if(!drawTerrain && worldObjectList[i] == terrainObject){
                        continue;
                    }
                    if(!drawGroundPlane && worldObjectList[i] == groundPlaneObject){
                        continue;
                    }
                    if(!drawWater && worldObjectList[i] == waterObject){
                        continue;
                    }
                    //The light game object is composed of 6 faces that create a sphere, the faces are children of the light game object and are what gets rendered
                    //So check if the object's parent is the light object, if so then this is a face of the light object so do not render
                    if(!drawLight && worldObjectList[i].getTransform().getParent() == mainLightObject.getTransform()){
                        continue;
                    }
                    if(!drawGradientSky && worldObjectList[i] == skyQuad){
                        continue;
                    }

                    currentMaterial.bindShaderObject(worldObjectList[i]);
                    key.draw();
                }
            }
        }
    }
    //=======================================================

    lastPointerLockElement = document.pointerLockElement;
    handleKeyPress();

    requestAnimationFrame(mainProgramLoop);
}
var fps = 0;
var lastUpdate = 0;
var frameCount = 0;
function updateFPS(now){
    frameCount++;
    if (now - lastUpdate > 1.0)
    {
        fps = frameCount;
        document.getElementById("fpsCounter").innerHTML = "FPS: " + fps;

        frameCount = 0;
        lastUpdate = now;
    }
}

var newPos = vec3.create();
var dir = vec3.create();
var moveSpeed = 5;
function handleKeyPress(){
    if(freeCam){
        freeCamMovement();
    }else{
        aircraftCameraRotation();
        heirarchicalObjectMovement();
    }
    lightObjectMovement();
}
function lightObjectMovement(){
    if(keyStates["arrowup"]){
        mainLightObject.getTransform().addVec3ToLocalPosition([0,0,-deltaTime * moveSpeed]);
    }
    if(keyStates["arrowdown"]){
        mainLightObject.getTransform().addVec3ToLocalPosition([0,0,deltaTime * moveSpeed]);
    }
    if(keyStates["arrowleft"]){
        mainLightObject.getTransform().addVec3ToLocalPosition([-deltaTime * moveSpeed,0,0]);
    }
    if(keyStates["arrowright"]){
        mainLightObject.getTransform().addVec3ToLocalPosition([deltaTime * moveSpeed,0,0]);
    }
    if(keyStates["pageup"]){
        mainLightObject.getTransform().addVec3ToLocalPosition([0,deltaTime * moveSpeed,0]);
    }
    if(keyStates["pagedown"]){
        mainLightObject.getTransform().addVec3ToLocalPosition([0,-deltaTime * moveSpeed,0]);
    }
}
var pitch = 0,yaw = 0,roll = 0;
var rotateSpeed = 20;
function aircraftCameraRotation(){
    if(keyStates["p"]){
        if(keyStates["shift"]){
            cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldRight(), degToRad(-deltaTime*rotateSpeed)));
        }else{
            cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldRight(), degToRad(deltaTime*rotateSpeed)));
        }
    }
    if(keyStates["y"]){
        if(keyStates["shift"]){
            cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldUp(), degToRad(-deltaTime*rotateSpeed)));
        }else{
            cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldUp(), degToRad(deltaTime*rotateSpeed)));
        }
    }
    if(keyStates["r"]){
        if(keyStates["shift"]){
            cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldForward(), degToRad(-deltaTime*rotateSpeed)));

        }else{
            cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldForward(), degToRad(deltaTime*rotateSpeed)));
        }
    }
}
function heirarchicalObjectMovement(){
    //FORWARD
    if(keyStates["w"]){
        var heirarchicalObjectForward = heirarchicalObject.getTransform().getWorldForward();
        heirarchicalObject.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*heirarchicalObjectForward[0], moveSpeed*deltaTime*heirarchicalObjectForward[1], moveSpeed*deltaTime*heirarchicalObjectForward[2]]);
    }
    //LEFT
    if(keyStates["a"]){
        var heirarchicalObjectLeft = vec3.negate(heirarchicalObject.getTransform().getWorldRight());
        heirarchicalObject.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*heirarchicalObjectLeft[0], moveSpeed*deltaTime*heirarchicalObjectLeft[1], moveSpeed*deltaTime*heirarchicalObjectLeft[2]]);
    }
    //BACK
    if(keyStates["s"]){
        var heirarchicalObjectBack = vec3.negate(heirarchicalObject.getTransform().getWorldForward());
        heirarchicalObject.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*heirarchicalObjectBack[0], moveSpeed*deltaTime*heirarchicalObjectBack[1], moveSpeed*deltaTime*heirarchicalObjectBack[2]]);
    }
    //RIGHT
    if(keyStates["d"]){
        var heirarchicalObjectRight = heirarchicalObject.getTransform().getWorldRight();
        heirarchicalObject.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*heirarchicalObjectRight[0], moveSpeed*deltaTime*heirarchicalObjectRight[1], moveSpeed*deltaTime*heirarchicalObjectRight[2]]);
    }
}

function freeCamMovement(){
    //FORWARD
    if(keyStates["w"]){
        var playerForward = cam.getTransform().getWorldForward();
        cam.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerForward[0], moveSpeed*deltaTime*playerForward[1], moveSpeed*deltaTime*playerForward[2]]);
    }
    //LEFT
    if(keyStates["a"]){
        var playerLeft = vec3.negate(cam.getTransform().getWorldRight());
        cam.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerLeft[0], moveSpeed*deltaTime*playerLeft[1], moveSpeed*deltaTime*playerLeft[2]]);
    }
    //BACK
    if(keyStates["s"]){
        var playerBack = vec3.negate(cam.getTransform().getWorldForward());
        cam.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerBack[0], moveSpeed*deltaTime*playerBack[1], moveSpeed*deltaTime*playerBack[2]]);
    }
    //RIGHT
    if(keyStates["d"]){
        var playerRight = cam.getTransform().getWorldRight();
        cam.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerRight[0], moveSpeed*deltaTime*playerRight[1], moveSpeed*deltaTime*playerRight[2]]);
    }
    //UP
    if(keyStates["e"]){
        var camUp = cam.getTransform().getWorldUp();
        cam.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*camUp[0], moveSpeed*deltaTime*camUp[1], moveSpeed*deltaTime*camUp[2]]);
    }
    //DOWN
    if(keyStates["q"]){
        var camDown = vec3.negate(cam.getTransform().getWorldUp());
        cam.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*camDown[0], moveSpeed*deltaTime*camDown[1], moveSpeed*deltaTime*camDown[2]]);
    }
    //ESCAPE
    //"esc" added for redundancy as allegedly older versions of Mozilla register the Escape key as "esc" instead of "escape"
    if(keyStates["escape"] || keyStates["esc"]){
        //NOTE: The following if statement is ONLY true in the event that the browser does not handle cursor unlocking itself and we are currently locked on the canvas element
        //If the browser DOES handle cursor unlocking the Escape key press event gets eaten by the browser itself, so the if statement is never reached
        //If the browser does NOT handle cursor unlocking itself, then document.pointerLockElement can never go from canvas to null...
        //and therefore the pointer lock timeout wont start, so we must do it programatically

        //So, if we reach this if statement, the browser does not handle pointer unlocking
        //and it is only true if we are currently locked on the canvas element
        if(document.pointerLockElement === canvas){
            document.exitPointerLock();
        }
    }
}


///////////////////////////////////////////////////////////////

var lastMouseX = -1, lastMouseY = -1;
var mouseSens = 25;

///////////////////////////////////////////////////////////////
function onCanvasMouseMove(event) {
    var target = event.target;
    if(target != canvas || !freeCam){
        return;
    }
    var rect = target.getBoundingClientRect();
    var mouseX,mouseY, mouseDeltaX, mouseDeltaY;
    if(document.pointerLockElement === canvas){
        mouseDeltaX = event.movementX;
        mouseDeltaY = event.movementY;

    }else{
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;

        //If lastMouseX/Y has not been set yet set them to the current mouse and return
        //This is to prevent the camera from jumping when the mouse is over the canvas for the first time
        if(lastMouseX < 0 || lastMouseY < 0){
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            return;
        }

        mouseDeltaX = mouseX - lastMouseX;
        mouseDeltaY = mouseY - lastMouseY;

        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
    cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis(cam.getTransform().getWorldRight(), degToRad(mouseDeltaY * mouseSens * deltaTime)))
    
    cam.getTransform().applyRotationToLocalRotation(quat4.createFromAngleAxis([0,1,0], degToRad(mouseDeltaX * mouseSens * deltaTime)))
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    canvas = document.getElementById("code03-canvas");

    initGL(canvas);
    gl.getExtension('OES_standard_derivatives');

    initShadersAndMaterials()
    //=======================================================
    initScene();

    //===================OPENGL=SETTINGS=====================

    //OpenGL by default will render both sides of a triangle, since our objects are meant to be enclosed the back faces should never be seen and thus not rendered
    //So cull (dont render) the back face (NOTE: A side effect of this is that the winding-order of the indices matters...
    //if they are not put in the correct order the triangle will render in the wrong direction)
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], 1.0);
    //=======================================================

    //=================MOUSE/KEY=EVENTS======================
    document.addEventListener('mousedown', requestCanvasPointerLock, false);
    document.addEventListener('mousemove', onCanvasMouseMove, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    //=======================================================


    var houseTransform = new Transform(null);
    houseTransform.setLocalPosition([40,4.75,-40]);
    houseTransform.setLocalScale([5,5,5]);
    houseTransform.setLocalRotationFromEulerAngles([0,degToRad(-90),0]);
    createGameObjectFromJSON("models/house.json", houseTransform, [1.0,1.0,1.0]);

    var carTransform = new Transform(null);
    carTransform.setLocalPosition([35,0.8,-32]);
    carTransform.setLocalScale([2,2,2]);
    carTransform.setLocalRotationFromEulerAngles([0,degToRad(235),0]);
    createGameObjectFromJSON("models/car.json", carTransform, [1.0,1.0,1.0]);
}
var testModel;
async function requestCanvasPointerLock(event){
    //If free cam is not enabled, the user is timed out from locking the cursor, any other button other than LMB is pressed...
    //the click didnt happen on the canvas, or the pointer is already locked on the canvas.
    //Then do not attempt to lock pointer
    if(!freeCam || !canPointerLock || event.which != 1 || event.target != canvas || document.pointerLockElement === canvas){
        return;
    }
    await canvas.requestPointerLock();
}
var lockTimer = 1.5;
var startTime = 0.0;
var canPointerLock = true;
function startPointerLockTimeout(now){
    canPointerLock = false;
    startTime = now;
}
function updatePointerLockTimeout(now){
    if(now - startTime > lockTimer){
        canPointerLock = true;
    }
}
function onDocumentKeyUp(event){
    keyStates[event.key.toLowerCase()] = false;
    event.preventDefault();
}
function onDocumentKeyDown(event) {
    keyStates[event.key.toLowerCase()] = true;
    event.preventDefault();
}