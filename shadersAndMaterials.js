///////////////////////////////////////////////////////
//FileName: shadersAndMaterials.js
//Author: Ayau(AyauCode)
//Copyright 2023, Ayau(AyauCode), All rights reserved.
///////////////////////////////////////////////////////

/**
 * The phong shader program for all default world objects
 */
var phongShaderProgram;
/**
 * The environment mapping shader program for objects that reflect the skybox
 */
var envMapShaderProgram;
/**
 * The shader program for animated, transparent water
 */ 
var waterShaderProgram;
/**
 * The shader program for unlit objects
 */
var unlitShaderProgram;
/**
 * The shader program for the quad with color gradient representing the sky
 */
var skyShaderProgram;
/**
 * The default shader program to use
 */
var defaultMaterial;
/**
 * A list containing the Material objects to use in the scene
 * NOTE: The order you add the materials to this list determines the render order, so transparent objects must always be last
 */
var materialList = [];

var skyMat;
var envMapMat;
var phongMat;
var unlitMat;
var waterMat;

var cubemapTexture;

/**
 * Swaps the material the program is currently using
 * @param {*} material The material to swap to
 * @returns True if the material exists in the materialObjectMap, otherwise False
 */
function swapToNewMaterial(material){
    currentMaterial.disableShader();

    gl.useProgram(material.getShader());
    material.enableShader();

    currentMaterial = material;

    if(materialObjectMap.has(material)){
        currentWorldObjectMap = materialObjectMap.get(material);
        return true;
    }else{
        return false;
    }
}

function initShadersAndMaterials(){
    createAllShaders();
    createAllMaterials();
}

function createAllMaterials(){
    currentMaterial = new Material(null, function(objectMesh){}, function(shader, objectToRender){}, function(shader, objectToRender){}, function(shader){},function(shader){});

    //NOTE: Material objects are added to the materialList in the constructor of Material, so the order they are created here determines the order they are added to materialList
    //SKY MATERIAL
    skyMat = new Material(skyShaderProgram, 
        function(objectMesh){
            objectMesh.bindVertexBuffer();
            objectMesh.bindIndexBuffer();
        },
        function(shader, objectToRender) {
            gl.uniformMatrix4fv(shader.vMatrixUniform, false, cam.getTransform().getWorldTransformationMatrix());
            gl.uniform3fv(shader.skyColor1, skyColor1);
            gl.uniform3fv(shader.skyColor2, skyColor2);
            gl.uniform1f(shader.skyColorOffset, skyColorOffset);
        }, 
        function(shader, objectToRender) {
            //Nothing to do per object
        },
        function(shader){
            gl.disable(gl.DEPTH_TEST);
            gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        },
        function(shader){
            gl.disableVertexAttribArray(shader.vertexPositionAttribute);
        }
    );

    //ENVIRONMENT MAPPING MATERIAL
    envMapMat = new Material(envMapShaderProgram,
        function(objectMesh){
            objectMesh.bindVertexBuffer();
            objectMesh.bindIndexBuffer();
            objectMesh.bindNormalBuffer();
        },
        function(shader, objectToRender) {
            gl.uniformMatrix4fv(shader.camModelMatrixUniform, false, cam.getTransform().getWorldTransformationMatrix());

            gl.uniformMatrix4fv(shader.vMatrixUniform, false, cam.getViewMatrix());
            gl.uniformMatrix4fv(shader.pMatrixUniform, false, cam.getProjectionMatrix());

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
            
            gl.uniform1i(shader.skyboxUniform, 1);
        },
        function(shader, objectToRender){
            var modelMatrix = objectToRender.getTransform().getWorldTransformationMatrix();
            mat4.toInverseMat3(modelMatrix, workingMat3);
            mat3.transpose(workingMat3);

            gl.uniformMatrix3fv(shader.normalMatrixUniform, false, workingMat3);
            gl.uniformMatrix4fv(shader.mMatrixUniform, false, modelMatrix);
        },
        function(shader){
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);

            gl.enableVertexAttribArray(shader.vertexPositionAttribute);
            gl.enableVertexAttribArray(shader.normalAttribute);
        },
        function(shader){
            gl.disableVertexAttribArray(shader.vertexPositionAttribute);
            gl.disableVertexAttribArray(shader.normalAttribute);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
    );

    //PHONG MATERIAL
    phongMat = new Material(phongShaderProgram,
        function(objectMesh){
            objectMesh.bindVertexBuffer();
            objectMesh.bindIndexBuffer();
            objectMesh.bindNormalBuffer();
            if(objectMesh.getUVBuffer() != null){
                objectMesh.bindUVBuffer();
            }
        },
        function(shader, objectToRender) {
            gl.uniform1f(shader.ambientStrengthUniform, ambientLightStrength);
            gl.uniform1f(shader.diffuseStrengthUniform, diffuseLightStrength);
            gl.uniform1f(shader.specularStrengthUniform, specularLightStrength);
            gl.uniform1f(shader.specularFocusUniform, specularLightFocus);
            gl.uniform3fv(shader.lightColorUniform, mainLightObject.getColor());

            gl.uniformMatrix4fv(shader.lightModelMatrixUniform, false, mainLightObject.getTransform().getWorldTransformationMatrix());
            gl.uniformMatrix4fv(shader.camModelMatrixUniform, false, cam.getTransform().getWorldTransformationMatrix());

            gl.uniformMatrix4fv(shader.vMatrixUniform, false, cam.getViewMatrix());
            gl.uniformMatrix4fv(shader.pMatrixUniform, false, cam.getProjectionMatrix());
        },
        function(shader, objectToRender){
            if(objectToRender.useTexture()){
                gl.uniform1i(shader.useTextureUniform, 1);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, objectToRender.getTexture());
                
                gl.uniform1i(shader.mainTexUniform, 0);
            }else{
                gl.uniform1i(shader.useTextureUniform, 0);
            }

            var modelMatrix = objectToRender.getTransform().getWorldTransformationMatrix();
            mat4.toInverseMat3(modelMatrix, workingMat3);
            mat3.transpose(workingMat3);

            gl.uniformMatrix3fv(shader.normalMatrixUniform, false, workingMat3);
            gl.uniformMatrix4fv(shader.mMatrixUniform, false, modelMatrix);
            gl.uniform3fv(shader.colorUniform, objectToRender.getColor());
        },
        function(shader){
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);

            gl.enableVertexAttribArray(shader.vertexPositionAttribute);
            gl.enableVertexAttribArray(shader.normalAttribute);
        },
        function(shader){
            gl.disableVertexAttribArray(shader.vertexPositionAttribute);
            gl.disableVertexAttribArray(shader.normalAttribute);
        }
    );

    //UNLIT MAT
    unlitMat = new Material(unlitShaderProgram,
        function(objectMesh){
            objectMesh.bindVertexBuffer();
            objectMesh.bindIndexBuffer();
            if(objectMesh.getUVBuffer() != null){
                objectMesh.bindUVBuffer();
            }
        },
        function(shader, objectToRender){
            gl.uniformMatrix4fv(shader.vMatrixUniform, false, cam.getViewMatrix());
            gl.uniformMatrix4fv(shader.pMatrixUniform, false, cam.getProjectionMatrix());
        },
        function(shader, objectToRender){
            if(objectToRender.useTexture()){
                gl.uniform1i(shader.useTextureUniform, 1);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, objectToRender.getTexture());
                
                gl.uniform1i(shader.mainTexUniform, 0);
            }else{
                gl.uniform1i(shader.useTextureUniform, 0);
            }

            gl.uniformMatrix4fv(shader.mMatrixUniform, false, objectToRender.getTransform().getWorldTransformationMatrix());
            gl.uniform3fv(shader.colorUniform, objectToRender.getColor());
        },
        function(shader){
            gl.enable(gl.DEPTH_TEST);
            gl.disable(gl.BLEND);
            gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        },
        function(shader){
            gl.disableVertexAttribArray(shader.vertexPositionAttribute);
        }
    );

    //WATER MAT
    waterMat = new Material(waterShaderProgram,
        function(objectMesh){
            objectMesh.bindVertexBuffer();
            objectMesh.bindIndexBuffer();
        },
        function(shader, objectToRender){
            gl.uniform1f(shader.timeUniform, currentTime);
            gl.uniform1f(shader.ambientUniform, ambientLightStrength);
            gl.uniform1f(shader.flatShadingStrengthUniform, flatShadingStrength);
            gl.uniformMatrix4fv(shader.lightMatrixUniform, false, mainLightObject.getTransform().getWorldTransformationMatrix());
            gl.uniformMatrix4fv(shader.vMatrixUniform, false, cam.getViewMatrix());
            gl.uniformMatrix4fv(shader.pMatrixUniform, false, cam.getProjectionMatrix());
        },
        function(shader, objectToRender){
            gl.uniformMatrix4fv(shader.mMatrixUniform, false, objectToRender.getTransform().getWorldTransformationMatrix());
            gl.uniform3fv(shader.colorUniform, objectToRender.getColor());
        },
        function(shader){
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        },
        function(shader){
            gl.disableVertexAttribArray(shader.vertexPositionAttribute);
        }
    );
    
    defaultMaterial = phongMat;
}
function createAllShaders(){
    phongShaderProgram = initShader("shader-vs", "shader-fs");
    waterShaderProgram = initShader("water-shader-vs", "water-shader-fs")
    unlitShaderProgram = initShader("unlit-shader-vs", "unlit-shader-fs");
    skyShaderProgram = initShader("sky-shader-vs", "sky-shader-fs");
    envMapShaderProgram = initShader("env-map-shader-vs", "env-map-shader-fs");

    //============GRADIENT=SKY=SHADER=VARIABLES==============
    skyShaderProgram.vertexPositionAttribute = gl.getAttribLocation(skyShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(skyShaderProgram.vertexPositionAttribute);
    skyShaderProgram.vMatrixUniform = gl.getUniformLocation(skyShaderProgram, "uVMatrix");
    skyShaderProgram.skyColor1 = gl.getUniformLocation(skyShaderProgram, "color1");
    skyShaderProgram.skyColor2 = gl.getUniformLocation(skyShaderProgram, "color2");
    skyShaderProgram.skyColorOffset = gl.getUniformLocation(skyShaderProgram, "offset");
    //=======================================================

    //==============ENV=MAP=SHADER=VARIABLES=================
    envMapShaderProgram.vertexPositionAttribute = gl.getAttribLocation(envMapShaderProgram, "aVertexPosition");
    envMapShaderProgram.normalAttribute = gl.getAttribLocation(envMapShaderProgram, "aNormal");

    envMapShaderProgram.mMatrixUniform = gl.getUniformLocation(envMapShaderProgram, "uMMatrix");
    envMapShaderProgram.vMatrixUniform = gl.getUniformLocation(envMapShaderProgram, "uVMatrix");
    envMapShaderProgram.pMatrixUniform = gl.getUniformLocation(envMapShaderProgram, "uPMatrix");
    
    envMapShaderProgram.camModelMatrixUniform = gl.getUniformLocation(envMapShaderProgram, "uCamModelMatrix");
    envMapShaderProgram.normalMatrixUniform = gl.getUniformLocation(envMapShaderProgram, "uNormalMatrix");

    envMapShaderProgram.skyboxUniform = gl.getUniformLocation(envMapShaderProgram, "uSkybox");
    //=======================================================

    //===============UNLIT=SHADER=VARIABLES==================
    unlitShaderProgram.vertexPositionAttribute = gl.getAttribLocation(unlitShaderProgram, "aVertexPosition");
    unlitShaderProgram.texCoordAttribute = gl.getAttribLocation(unlitShaderProgram, "aTexCoord");

    unlitShaderProgram.colorUniform = gl.getUniformLocation(unlitShaderProgram, "uColor");
    unlitShaderProgram.mMatrixUniform = gl.getUniformLocation(unlitShaderProgram, "uMMatrix");
    unlitShaderProgram.vMatrixUniform = gl.getUniformLocation(unlitShaderProgram, "uVMatrix");
    unlitShaderProgram.pMatrixUniform = gl.getUniformLocation(unlitShaderProgram, "uPMatrix");

    unlitShaderProgram.useTextureUniform = gl.getUniformLocation(unlitShaderProgram, "useTexture");
    unlitShaderProgram.mainTexUniform = gl.getUniformLocation(unlitShaderProgram, "uMainTex");
    //=======================================================

    //==============DEFAULT=SHADER=VARIABLES=================
    phongShaderProgram.vertexPositionAttribute = gl.getAttribLocation(phongShaderProgram, "aVertexPosition");
    phongShaderProgram.normalAttribute = gl.getAttribLocation(phongShaderProgram, "aNormal");
    phongShaderProgram.texCoordAttribute = gl.getAttribLocation(phongShaderProgram, "aTexCoord");

    phongShaderProgram.colorUniform = gl.getUniformLocation(phongShaderProgram, "uColor");
    phongShaderProgram.ambientStrengthUniform = gl.getUniformLocation(phongShaderProgram, "uAmbientStrength");
    phongShaderProgram.diffuseStrengthUniform = gl.getUniformLocation(phongShaderProgram, "uDiffuseStrength");
    phongShaderProgram.specularStrengthUniform = gl.getUniformLocation(phongShaderProgram, "uSpecularStrength");
    phongShaderProgram.specularFocusUniform = gl.getUniformLocation(phongShaderProgram, "uSpecularFocus");
    phongShaderProgram.lightColorUniform = gl.getUniformLocation(phongShaderProgram, "uLightColor");

    phongShaderProgram.lightModelMatrixUniform = gl.getUniformLocation(phongShaderProgram, "uLightModelMatrix");
    phongShaderProgram.camModelMatrixUniform = gl.getUniformLocation(phongShaderProgram, "uCamModelMatrix");

    phongShaderProgram.normalMatrixUniform = gl.getUniformLocation(phongShaderProgram, "uNormalMatrix");
    phongShaderProgram.mMatrixUniform = gl.getUniformLocation(phongShaderProgram, "uMMatrix");
    phongShaderProgram.vMatrixUniform = gl.getUniformLocation(phongShaderProgram, "uVMatrix");
    phongShaderProgram.pMatrixUniform = gl.getUniformLocation(phongShaderProgram, "uPMatrix");

    phongShaderProgram.useTextureUniform = gl.getUniformLocation(phongShaderProgram, "useTexture");
    phongShaderProgram.mainTexUniform = gl.getUniformLocation(phongShaderProgram, "uMainTex");
    //=======================================================
    
    //===============WATER=SHADER=VARIABLES==================
    waterShaderProgram.vertexPositionAttribute = gl.getAttribLocation(waterShaderProgram, "aVertexPosition");

    waterShaderProgram.timeUniform = gl.getUniformLocation(waterShaderProgram, "uTime");
    waterShaderProgram.lightMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uLightMatrix");
    waterShaderProgram.ambientUniform = gl.getUniformLocation(waterShaderProgram, "uAmbient");
    waterShaderProgram.flatShadingStrengthUniform = gl.getUniformLocation(waterShaderProgram, "uFlatShadingStrength");
    waterShaderProgram.mMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uMMatrix");
    waterShaderProgram.vMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uVMatrix");
    waterShaderProgram.pMatrixUniform = gl.getUniformLocation(waterShaderProgram, "uPMatrix");
    waterShaderProgram.colorUniform = gl.getUniformLocation(waterShaderProgram, "uColor");
    //=======================================================
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(vertexShaderName, fragmentShaderName) {

    var prog = gl.createProgram();

    var fragmentShader = getShader(gl, fragmentShaderName);
    var vertexShader = getShader(gl, vertexShaderName);

    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    return prog;
}