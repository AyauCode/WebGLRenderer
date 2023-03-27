
//The OpenGL Context
var gl;
//The default shader program
var shaderProgram;
//The shader program for animated, transparent water
var waterShaderProgram;
//The canvas element being drawn to
var canvas;

//Settings controlled by UI
var flatShading = true, ambientLighting = true, freeCam = false, followObject = false, drawGroundPlane = true, drawTerrain = false, drawWater = false;

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

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

requestAnimationFrame(mainProgramLoop);
var then = 0;
var deltaTime = 0;
var lastPointerLockElement;

var camParent;
var cam;
var cameraRotX = 0, playerRotY = 0;
var camStartPos = [10,5,-40];

var mainLightObject;
var ambientLightStrength = 0.25;
var flatShadingStrength = 1.0;

var heirarchicalObject;
var groundPlaneObject, terrainObject, waterObject;

var keyStates = {};

//==============Functions=Called=By=UI=======================
function setFlatShadingActive(boolValue){
    flatShading = boolValue;
    flatShadingStrength = boolValue ? 1.0 : 0.0;
}
function setAmbientLightActive(boolValue, value){
    ambientLighting = boolValue;
    ambientLightStrength = boolValue ? value : 1.0;
}
function setAmbientLightStrength(value){
    if(ambientLighting){
        ambientLightStrength = value;
    }
}
function setFreeCamActive(boolValue){
    freeCam = boolValue;
    if(!boolValue){
        camParent.getTransform().setLocalRotationFromEulerAngles([0,0,0]);
        cam.lookAt(camParent.getTransform().getLocalPosition(), heirarchicalObject.getTransform().getLocalPosition(), [0,1,0]);
    }
}
function setFollowObjectActive(boolValue){
    followObject = boolValue;
}

function setShouldDrawGroundPlane(boolValue){
    drawGroundPlane = boolValue;
}
function setGroundPlaneColor(hex){
    groundPlaneObject.setColor(hexToRGB(hex));
}
function getGroundPlaneColorAsHex(){
    return rgbToHex(groundPlaneObject.getColor());
}

function setShouldDrawTerrain(boolValue){
    drawTerrain = boolValue;
}
function setTerrainColor(hex){
    terrainObject.setColor(hexToRGB(hex));
}
function getTerrainColorAsHex(){
    return rgbToHex(terrainObject.getColor());
}

function setShouldDrawWater(boolValue){
    drawWater = boolValue;
}
function setWaterColor(hex){
    waterObject.setColor(hexToRGB(hex));
}
function getWaterColorAsHex(){
    return rgbToHex(waterObject.getColor());
}

//===========================================================

function initScene() {
    //Initialize noise with random seed (Math.random() returns value between [0,1) but gets scaled by 65536 in perlin.js)
    noise.seed(Math.random());

    //==========Initialize=Entity=Mesh=Primitives============
    initMeshPrimitives();
    //=======================================================

    //===============Camera/Lighting=Objects=================
    camParent = new WorldObject(null, new Transform(null), null);
    cam = new Camera(new Transform(camParent.getTransform()), 75, 1.0, 0.1, 100);
    camParent.getTransform().setLocalPosition(camStartPos);

    mainLightObject = new WorldObject(null, new Transform(null), null);
    mainLightObject.getTransform().setLocalPosition([-25,15,25]);
    //=======================================================
    
    //==============HIERARCHICAL=WORLD=OBJECT================
    heirarchicalObject = new Cylinder(new Transform(null), [Math.random(), Math.random(), Math.random()], defaultCylinderMeshResolution, 0.5, 0.25);
    heirarchicalObject.getTransform().setLocalPosition([25,1,-25]);
    heirarchicalObject.getTransform().setLocalScale([1,2,1]);

    var sphereObject = new Sphere(new Transform(heirarchicalObject.getTransform()), [Math.random(), Math.random(), Math.random()], defaultSphereMeshResolution, 0.5);
    sphereObject.getTransform().setLocalPosition([0,0.5,0]);
    sphereObject.getTransform().setLocalScale([1,0.5,1]);

    var leftArm = new Cube(new Transform(sphereObject.getTransform()), [Math.random(),Math.random(),Math.random()]);
    var rightArm = new Cube(new Transform(sphereObject.getTransform()), [Math.random(),Math.random(),Math.random()]);
    leftArm.getTransform().setLocalPosition([-0.75,0,0]);
    rightArm.getTransform().setLocalPosition([0.75,0,0]);
    leftArm.getTransform().setLocalScale([0.75,0.25,0.25]);
    rightArm.getTransform().setLocalScale([0.75,0.25,0.25]);

    var pyramidObject = new Pyramid(new Transform(sphereObject.getTransform()), [Math.random(), Math.random(), Math.random()]);
    pyramidObject.getTransform().setLocalPosition([0,0,-0.5]);
    pyramidObject.getTransform().setLocalRotationFromEulerAngles([degToRad(90),0,0]);
    pyramidObject.getTransform().setLocalScale([0.5,0.5,0.5]);

    //=======================================================

    var cubeTest = new Cube(new Transform(null), [1,0,0]);
    cubeTest.getTransform().setLocalScale(1,2,1);

    //==============Ground=Plane=World=Object================
    groundPlaneObject = new WorldObject(generatePlaneMesh([50,50],80), new Transform(null), [Math.random(),Math.random(),Math.random()]);
    //=======================================================

    //=============Simplex=Terrain=World=Object==============
    terrainObject = new WorldObject(generateNoiseMesh([50,50], 80), new Transform(null), [Math.random(),Math.random(),Math.random()]);
    //=======================================================

    //==============Water=Mesh=World=Object==================
    waterObject = new WorldObject(generatePlaneMesh([50,50], 80), new Transform(null), [0.0,0.0,1.0], false);
    //=======================================================

    cam.lookAt(camParent.getTransform().getLocalPosition(),heirarchicalObject.getTransform().getLocalPosition(),[0,1,0]);
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
        cam.lookAt(camParent.getTransform().getLocalPosition(), heirarchicalObject.getTransform().getLocalPosition(), [0,1,0]);
    }

    //================DRAW=WORLD=OBJECTS=====================
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);
    
    gl.useProgram(shaderProgram);
    var worldObjectKeys = worldObjectMap.keys();
    for(var key of worldObjectKeys){
        key.bindVertexBuffer();
        key.bindIndexBuffer();

        gl.uniform1f(shaderProgram.ambientUniform, ambientLightStrength);
        gl.uniform1f(shaderProgram.flatShadingStrengthUniform, flatShadingStrength);
        gl.uniformMatrix4fv(shaderProgram.lightMatrixUniform, false, mainLightObject.getTransform().getWorldTransformationMatrix());
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, cam.getViewMatrix());
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, cam.getProjectionMatrix());

        var worldObjectList = worldObjectMap.get(key);
        for(let i = 0; i < worldObjectList.length; i++){
            if(!drawTerrain && worldObjectList[i] == terrainObject){
                continue;
            }
            if(!drawGroundPlane && worldObjectList[i] == groundPlaneObject){
                continue;
            }
            gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, worldObjectList[i].getTransform().getWorldTransformationMatrix());
            gl.uniform3fv(shaderProgram.colorUniform, worldObjectList[i].getColor());
            key.draw();
        }
    }
    //=======================================================
    
    //====================DRAW=WATER=========================
    if(drawWater){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(waterShaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, waterObject.getMesh().getVertexBuffer());
        gl.vertexAttribPointer(waterShaderProgram.vertexPositionAttribute, waterObject.getMesh().getVertexBuffer().vertexSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, waterObject.getMesh().getIndexBuffer());
        gl.uniform1f(waterShaderProgram.timeUniform, now);
        gl.uniform1f(waterShaderProgram.ambientUniform, ambientLightStrength);
        gl.uniform1f(waterShaderProgram.flatShadingStrengthUniform, flatShadingStrength);
        gl.uniformMatrix4fv(waterShaderProgram.lightMatrixUniform, false, mainLightObject.getTransform().getWorldTransformationMatrix());
        gl.uniformMatrix4fv(waterShaderProgram.vMatrixUniform, false, cam.getViewMatrix());
        gl.uniformMatrix4fv(waterShaderProgram.pMatrixUniform, false, cam.getProjectionMatrix());

        gl.uniformMatrix4fv(waterShaderProgram.mMatrixUniform, false, waterObject.getTransform().getWorldTransformationMatrix());
        gl.uniform3fv(waterShaderProgram.colorUniform, waterObject.getColor());

        waterObject.getMesh().draw();
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
}
var pitch = 0,yaw = 0,roll = 0;
var rotateSpeed = 20;
function aircraftCameraRotation(){
    if(keyStates["p"]){
        if(keyStates["shift"]){
            pitch -= deltaTime * rotateSpeed;
            cam.getTransform().setLocalRotationFromEulerAngles([degToRad(pitch),0,0]);
        }else{
            pitch += deltaTime * rotateSpeed;
            cam.getTransform().setLocalRotationFromEulerAngles([degToRad(pitch),0,0]);
        }
    }
    if(keyStates["y"]){
        if(keyStates["shift"]){
            yaw -= deltaTime * rotateSpeed;
            cam.getTransform().setLocalRotationFromEulerAngles([0,degToRad(yaw),0]);
        }else{
            yaw += deltaTime * rotateSpeed;
            cam.getTransform().setLocalRotationFromEulerAngles([0,degToRad(yaw),0]);
        }
    }
    if(keyStates["r"]){
        if(keyStates["shift"]){
            roll -= deltaTime * rotateSpeed;
            cam.getTransform().setLocalRotationFromEulerAngles([0,0,degToRad(roll)]);
        }else{
            roll += deltaTime * rotateSpeed;
            cam.getTransform().setLocalRotationFromEulerAngles([0,0,degToRad(roll)]);
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
        var playerForward = camParent.getTransform().getWorldForward();
        camParent.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerForward[0], moveSpeed*deltaTime*playerForward[1], moveSpeed*deltaTime*playerForward[2]]);
    }
    //LEFT
    if(keyStates["a"]){
        var playerLeft = vec3.negate(camParent.getTransform().getWorldRight());
        camParent.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerLeft[0], moveSpeed*deltaTime*playerLeft[1], moveSpeed*deltaTime*playerLeft[2]]);
    }
    //BACK
    if(keyStates["s"]){
        var playerBack = vec3.negate(camParent.getTransform().getWorldForward());
        camParent.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerBack[0], moveSpeed*deltaTime*playerBack[1], moveSpeed*deltaTime*playerBack[2]]);
    }
    //RIGHT
    if(keyStates["d"]){
        var playerRight = camParent.getTransform().getWorldRight();
        camParent.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*playerRight[0], moveSpeed*deltaTime*playerRight[1], moveSpeed*deltaTime*playerRight[2]]);
    }
    //UP
    if(keyStates["e"]){
        var camUp = cam.getTransform().getWorldUp();
        camParent.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*camUp[0], moveSpeed*deltaTime*camUp[1], moveSpeed*deltaTime*camUp[2]]);
    }
    //DOWN
    if(keyStates["q"]){
        var camDown = vec3.negate(cam.getTransform().getWorldUp());
        camParent.getTransform().addVec3ToLocalPosition([moveSpeed*deltaTime*camDown[0], moveSpeed*deltaTime*camDown[1], moveSpeed*deltaTime*camDown[2]]);
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

    cameraRotX += mouseDeltaY * deltaTime * mouseSens;
    cameraRotX = clamp(cameraRotX, -90, 90);
    cam.getTransform().setLocalRotationFromEulerAngles([degToRad(cameraRotX), 0, 0]);
    
    playerRotY += mouseDeltaX * deltaTime * mouseSens;
    camParent.getTransform().setLocalRotationFromEulerAngles([0,degToRad(playerRotY),0]);
}

///////////////////////////////////////////////////////////////

function webGLStart() {
    canvas = document.getElementById("code03-canvas");

    initGL(canvas);
    gl.getExtension('OES_standard_derivatives');
    initShaders();
    waterShaderProgram = initShader("water-shader-vs", "water-shader-fs")

    //==============DEFAULT=SHADER=VARIABLES=================
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.lightMatrixUniform = gl.getUniformLocation(shaderProgram, "uLightMatrix");
    shaderProgram.ambientUniform = gl.getUniformLocation(shaderProgram, "uAmbient");
    shaderProgram.flatShadingStrengthUniform = gl.getUniformLocation(shaderProgram, "uFlatShadingStrength");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
    //=======================================================
    
    //===============WATER=SHADER=VARIABLES==================
    waterShaderProgram.vertexPositionAttribute = gl.getAttribLocation(waterShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(waterShaderProgram.vertexPositionAttribute);

    waterShaderProgram.timeUniform = gl.getUniformLocation(waterShaderProgram, "uTime");
    waterShaderProgram.lightMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uLightMatrix");
    waterShaderProgram.ambientUniform = gl.getUniformLocation(waterShaderProgram, "uAmbient");
    waterShaderProgram.flatShadingStrengthUniform = gl.getUniformLocation(waterShaderProgram, "uFlatShadingStrength");
    waterShaderProgram.mMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uMMatrix");
    waterShaderProgram.vMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uVMatrix");
    waterShaderProgram.pMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uPMatrix");
    waterShaderProgram.colorUniform = gl.getUniformLocation(waterShaderProgram, "uColor");
    //=======================================================

    //=======================================================
    initScene();

    //===================OPENGL=SETTINGS=====================

    //Ensures triangles are rendered in correct order so triangles that are hidden behind other triangles are not rendered in front of them.
    gl.enable(gl.DEPTH_TEST);
    //OpenGL by default will render both sides of a triangle, since our objects are meant to be enclosed the back faces should never be seen and thus not rendered
    //So cull (dont render) the back face (NOTE: A side effect of this is that the winding-order of the indices matters...
    //if they are not put in the correct order the triangle will render in the wrong direction)
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    //=======================================================

    //=================MOUSE/KEY=EVENTS======================
    document.addEventListener('mousedown', requestCanvasPointerLock, false);
    document.addEventListener('mousemove', onCanvasMouseMove, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    //=======================================================
}
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