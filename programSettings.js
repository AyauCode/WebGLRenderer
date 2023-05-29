///////////////////////////////////////////////////////
//FileName: programSettings.js
//Author: Ayau(AyauCode)
//Copyright 2023, Ayau(AyauCode), All rights reserved.
///////////////////////////////////////////////////////

//Settings controlled by UI
var drawSolidBackground = false, drawGradientSky = false, drawSkyBox = true;
var drawLight = false, ambientLighting = true, diffuseLighting = true, specularLighting = true;
var freeCam = false, followObject = false;
var drawGroundPlane = true, drawTerrain = false, drawWater = false;
var rotateSceneGlobally = false;

var backgroundColor = [0.0,0.0,0.0];

var camStartPos = [25,5,0];

var ambientLightStrength = 0.25;
var diffuseLightStrength = 1.0;
var specularLightStrength = 0.5;
var specularLightFocus = 5;
var flatShadingStrength = 1.0;
var globalRotateSpeed = 2.5;

var skyColor1 = [0.0,0.83529411764,1.0];
var skyColor2 = [0.99607843137,0.93725490196,0.30196078431];
var skyColorOffset = 0.65*2.0-1.0;

//==============Functions=Called=By=UI=======================
function setShouldDrawSolidBackground(boolValue){
    drawSolidBackground = boolValue;
}
function getBackgroundColorAsHex(){
    return rgbToHex(backgroundColor);
}
function getInvertedBackgroundColorAsHex(){
    if(drawGradientSky){
        if(skyColorOffset >= 0.0){
            return rgbToHex(invertColor(skyColor1));
        }
        return rgbToHex(invertColor(skyColor2));
    }
    return rgbToHex(invertColor(backgroundColor));
}
function setShouldDrawGradientSky(boolValue){
    drawGradientSky = boolValue;
}
function getSkyColor1AsHex(){
    return rgbToHex(skyColor1);
}
function getSkyColor2AsHex(){
    return rgbToHex(skyColor2);
}
function setSkyColor1(hex){
    skyColor1 = hexToRGB(hex);
}
function setSkyColor2(hex){
    skyColor2 = hexToRGB(hex);
}
function setSkyColorOffset(val){
    skyColorOffset = val * 2.0 - 1.0;
}

function setBackgroundColor(hex){
    backgroundColor = hexToRGB(hex);
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], 1.0);
}

function setShouldDrawSkybox(boolValue){
    drawSkyBox = boolValue;
}

function setShouldDrawLight(boolValue){
    drawLight = boolValue;
}
function setLightColor(hex){
    mainLightObject.setColor(hexToRGB(hex));
}

function setAmbientLightActive(boolValue, value){
    ambientLighting = boolValue;
    ambientLightStrength = boolValue ? value : 0.0;
}
function setAmbientLightStrength(value){
    if(ambientLighting){
        ambientLightStrength = value;
    }
}

function setDiffuseLightActive(boolValue, value){
    diffuseLighting = boolValue;
    diffuseLightStrength = boolValue ? value : 0.0;
}
function setDiffuseLightStrength(value){
    if(diffuseLighting){
        diffuseLightStrength = value;
    }
}

function setSpecularLightActive(boolValue, strength, focus){
    specularLighting = boolValue;
    specularLightStrength = boolValue ? strength : 0.0;
    if(boolValue){
        specularLightFocus = focus;
    }
}
function setSpecularLightStrength(value){
    if(specularLighting){
        specularLightStrength = value;
    }
}
function setSpecularLightFocus(value){
    if(specularLighting){
        specularLightFocus = value;
    }
}

function setFreeCamActive(boolValue){
    freeCam = boolValue;
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

function setShouldRotateSceneGlobally(boolValue){
    rotateSceneGlobally = boolValue;
}
function setGlobalRotateSpeed(value){
    globalRotateSpeed = value;
}
