///////////////////////////////////////////////////////
//FileName: entities.js
//Author: Ayau(AyauCode)
//Copyright 2023, Ayau(AyauCode), All rights reserved.
///////////////////////////////////////////////////////

/**
 * A Map where each key is a mesh and each value is a list of objects to draw with that mesh
 */
var currentWorldObjectMap;

var unitCubeMesh, unitCylinderMesh, unitSphereUpFaceMesh, unitPyramidMesh, screenSizeQuadMesh, quadMesh;
const defaultSphereMeshResolution = 20, defaultCylinderMeshResolution = 20;

/**
 * A map where each key is a material and each value is a list of objects using that material
 */
var materialObjectMap = new Map();

/**
 * Initialize primitive meshes that may be frequently used. This includes: screen space quad, world space quad, cube, cylinder, sphere, and pyramid meshes.
 */
function initMeshPrimitives(){

    //================Screen=Size=Quad=Mesh==================
    var quadVertices = [
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
    ];
    var quadVerticesHalf = [
        -0.5, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, 0.5, 0.0,
        0.5, -0.5, 0.0,
    ];

    var quadNormals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];

    var quadIndices = [
        0,1,2, 2,1,3
    ];

    var quadUV = [
        0.0,1.0, 0.0,0.0, 1.0,1.0, 1.0,0.0
    ];

    screenSizeQuadMesh = new Mesh();
    screenSizeQuadMesh.createNewBuffers(quadVertices, quadIndices);

    quadMesh = new Mesh();
    quadMesh.createNewBuffers(quadVerticesHalf, quadIndices, quadNormals);
    quadMesh.createUVBuffer(quadUV);
    //=======================================================

    //==================Unit=Cube=Mesh=======================
    var cubeVertices = [
        // Forward face
        -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

        // Back face
        -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,

        // Top face
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,

        // Bottom face
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,

        // Right face
        0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,

        // Left face
        -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
    ];
    var cubeVertices = [
        -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

        // Back face
        -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,

        // Top face
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,

        // Bottom face
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,

        // Right face
        0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,

        // Left face
        -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
    ];

    var cubeNormals = [
         // Front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        // Back
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        // Top
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        // Bottom
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        // Right
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        // Left
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    var cubeIndices = [0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23];

    unitCubeMesh = new Mesh();
    unitCubeMesh.createNewBuffers(cubeVertices, cubeIndices, cubeNormals);

    //=======================================================

    //=================Unit=Cylinder=Mesh====================
    unitCylinderMesh = generateCylinderMesh(defaultCylinderMeshResolution, 0.5, 0.5);
    //=======================================================

    //===============Unit=Sphere=Up=Face=Mesh================
    unitSphereUpFaceMesh = generateCubeSphereFace([0,1,0], defaultSphereMeshResolution, 0.5);
    //=======================================================
    
    //=================Unit=Pyramid=Mesh=====================
    var pyramidVertices = [
        //Forward face
        //Right-Bottom-Front / Left-Bottom-Front / Top
        0.5,-0.5,-0.5, -0.5,-0.5,-0.5, 0.0,0.5,0.0,
        //Back face
        //Right-Bottom-Back / Left-Bottom-Back / Top
        0.5,-0.5,0.5, -0.5,-0.5,0.5, 0.0,0.5,0.0,
        //Left face
        //Left-Bottom-Back / Left-Bottom-Front / Top
        -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.0,0.5,0.0,
        //Right face
        //Right-Bottom-Back / Right-Bottom-Front / Top
        0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.0,0.5,0.0,

        //Bottom face (Triangle 1)
        //Right-Bottom-Back / Right-Bottom-Front / Left-Bottom-Back
        0.5,-0.5,0.5, 0.5,-0.5,-0.5, -0.5,-0.5,0.5,
        //Bottom face (Triangle 2)
        //Left-Bottom-Back / Left-Bottom-Front / Right-Bottom-Front
        -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
    ];
    var pyramidIndices = [1,2,0, 3,5,4, 6,8,7, 10,11,9, 12,14,13, 15,16,17];
    unitPyramidMesh = new Mesh();
    unitPyramidMesh.createNewBuffers(pyramidVertices, pyramidIndices);
    unitPyramidMesh.calculateNormals(pyramidVertices, pyramidIndices);
    //=======================================================
}
/**
 * Adds a worldObject to the worldObject list corresponding to the material of the mesh and the mesh itself
 * @param {*} worldObject The worldObject to add to the scene
 */
function addObject(worldObject){
    if(materialObjectMap.has(worldObject.getMesh().getMaterial()))
    {
        let worldObjectMap = materialObjectMap.get(worldObject.getMesh().getMaterial());
        if(worldObjectMap.has(worldObject.getMesh())){
            worldObjectMap.get(worldObject.getMesh()).push(worldObject);
        }
        else{
            var newObjectList = [];
            newObjectList.push(worldObject);
            worldObjectMap.set(worldObject.getMesh(), newObjectList);
        }
    }else{
        var newMap = new Map();

        var newObjectList = [];
        newObjectList.push(worldObject);
        newMap.set(worldObject.getMesh(), newObjectList);

        materialObjectMap.set(worldObject.getMesh().getMaterial(), newMap);
    }
}
class Material{
    /**
     * @param {*} shader -The shader to use when rendering an object that has this material
     * @param {*} bindMeshShaderFunc -A function thats called once for each mesh before all entities with this material and mesh are rendered
     * @param {*} applyShaderFuncOneOff -A function that only needs to be called one time before all entities with this material and mesh are rendered
     * @param {*} applyShaderFunc -A function thats called for each entity with this mesh and material
     * @param {*} enableShaderFunc -A function that enables the shader for this material
     * @param {*} disableShaderFunc -A function that disables the shader for this material
     */
    constructor(shader, bindMeshShaderFunc, applyShaderFuncOneOff, applyShaderFunc, enableShaderFunc, disableShaderFunc){
        this.shader = shader;
        this.bindMeshShaderFunc = bindMeshShaderFunc;
        this.applyShaderFuncOneOff = applyShaderFuncOneOff;
        this.applyShaderFunc = applyShaderFunc;
        this.enableShaderFunc = enableShaderFunc;
        this.disableShaderFunc = disableShaderFunc;

        materialList.push(this);
    }
    bindMesh(objectMesh){
        this.bindMeshShaderFunc(objectMesh);
    }
    bindShaderOneOff(objectToRender){
        this.applyShaderFuncOneOff(this.shader, objectToRender);
    }
    bindShaderObject(objectToRender){
        this.applyShaderFunc(this.shader, objectToRender);
    }
    enableShader(){
        this.enableShaderFunc(this.shader);
    }
    disableShader(){
        this.disableShaderFunc(this.shader);
    }
    getShader(){
        return this.shader;
    }
}
class Transform{
    constructor(parent){
        this.parent = parent;
        if(this.parent != null){
            this.parent.addChild(this);
        }
        this.children = null;
        this.localPosition = vec3.create();
        this.localRotation = quat4.create();
        this.localRotation = quat4.identity(this.localRotation);
        this.localScale = vec3.create([1,1,1]);

        this.worldMat = mat4.create();
        this.localTransformationMatrix = mat4.create();

        this.workingQuaternion = quat4.create();
    }
    getWorldForward(){
        mat4.toRotationMat(this.getWorldTransformationMatrix(), workingMat4);
        return mat4.multiplyVec3(workingMat4, [0,0,-1], workingVec3);
    }
    getWorldRight(){
        mat4.toRotationMat(this.getWorldTransformationMatrix(), workingMat4);
        return mat4.multiplyVec3(workingMat4, [1,0,0], workingVec3);
    }
    getWorldUp(){
        mat4.toRotationMat(this.getWorldTransformationMatrix(), workingMat4);
        return mat4.multiplyVec3(workingMat4, [0,1,0], workingVec3);
    }

    getLocalForward(){
        mat4.toRotationMat(this.getLocalTransformationMatrix(), workingMat4);
        return mat4.multiplyVec3(workingMat4, [0,0,-1], workingVec3);
    }
    getLocalRight(){
        mat4.toRotationMat(this.getLocalTransformationMatrix(), workingMat4);
        return mat4.multiplyVec3(workingMat4, [1,0,0], workingVec3);
    }
    getLocalUp(){
        mat4.toRotationMat(this.getLocalTransformationMatrix(), workingMat4);
        return mat4.multiplyVec3(workingMat4, [0,1,0], workingVec3);
    }
    getLocalTransformationMatrix(){
        this.localTransformationMatrix = mat4.identity(this.localTransformationMatrix);
        mat4.translate(this.localTransformationMatrix, this.localPosition);

        quat4.toMat4(this.localRotation, workingMat4);
        mat4.multiply(this.localTransformationMatrix, workingMat4, this.localTransformationMatrix);

        mat4.scale(this.localTransformationMatrix, this.localScale);
        return this.localTransformationMatrix;
    }
    getWorldTransformationMatrix(){
        if(this.parent == null){
            return this.getLocalTransformationMatrix();
        }
        return mat4.multiply(this.parent.getWorldTransformationMatrix(), this.getLocalTransformationMatrix(), this.worldMat);
    }

    /**
     * Sets the local position of this transform
     * @param {*} v A length 3 array containing the new local position
     */
    setLocalPosition(v){
        this.localPosition = vec3.set(v, this.localPosition);
    }
    setLocalPositionX(x){
        this.localPosition[0] = x;
    }
    setLocalPositionY(y){
        this.localPosition[1] = y;
    }
    setLocalPositionZ(z){
        this.localPosition[2] = z;
    }
    /**
     * Adds the given vec3 to the local position of this transform
     * @param {*} v A length 3 array to add to this transforms local position
     */
    addVec3ToLocalPosition(v){
        this.localPosition[0] += v[0];
        this.localPosition[1] += v[1];
        this.localPosition[2] += v[2];
    }
    /**
     * Sets the local rotation of this transform
     * @param {*} q A quaternion representing the new rotation
     */
    setLocalRotation(q){
        this.localRotation = q;
    }
    /**
     * Sets the local rotation of this transform to the euler angles given. NOTE: ANGLES MUST BE GIVEN IN RADIANS
     * @param {*} r A length 3 array of angles IN RADIANS to set this transforms rotation to
     */
    setLocalRotationFromEulerAngles(r){
        this.localRotation = quat4.euler(this.localRotation, r);
    }
    /**
     * Applies the given rotation to this transforms rotation
     * @param {*} q A quaternion representing the rotation to apply
     */
    applyRotationToLocalRotation(q){
        this.localRotation = quat4.multiply(this.localRotation, q, this.workingQuaternion);
    }
    /**
     * Applies a rotation to this transforms rotation by the euler angles given. NOTE: ANGLES MUST BE GIVEN IN RADIANS
     * @param {*} r A length 3 array of angles IN RADIANS to apply to this transforms rotation to
     */
    applyEulerAnglesToLocalRotation(r){
        this.localRotation = quat4.multiply(this.localRotation, quat4.euler(this.workingQuaternion, r));
    }
    /**
     * Sets the local scale of this transform
     * @param {*} s A length 3 array of new scale values for the Transform
     */
    setLocalScale(s){
        this.localScale = vec3.set(s, this.localScale);
    }
    setLocalScaleX(s){
        this.localScale[0] = s;
    }
    setLocalScaleY(s){
        this.localScale[1] = s;
    }
    setLocalScaleZ(s){
        this.localScale[2] = s;
    }

    getLocalPosition(){
        return this.localPosition;
    }
    getLocalRotation(){
        return this.localRotation;
    }
    getLocalScale(){
        return this.localScale;
    }
    getParent(){
        return this.parent;
    }
    getChildren(){
        return this.children;
    }
    addChild(child){
        if(this.children == null){
            this.children = [];
        }
        this.children.push(child);
    }
    /**
     * @param {*} child The child Transform object to remove
     */
    removeChild(child){
        var index = this.children.indexOf(child);
        if(index > -1){
            this.children.splice(index, 1);
        }
    }
    /**
     * @param {*} parent The Transform object to set as this Transforms parent
     */
    setParent(parent){
        if(this.parent != null){
            this.parent.removeChild(this);
        }
        this.parent = parent;
        this.parent.addChild(this);
    }
}

class Mesh{
    constructor(material = defaultMaterial){ 
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        this.uvBuffer = null;
        this.material = material;
    }
    setMaterial(material){
        this.material = material;
    }
    getMaterial(){
        return this.material;
    }
    setBuffers(vertexBuffer, indexBuffer){
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
    }
    setBuffersWithNormals(vertexBuffer, indexBuffer, normalBuffer){
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
        this.normalBuffer = normalBuffer;
    }
    createNewBuffers(vertices, indices, normals = null){
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = vertices.length / 3;

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
        this.indexBuffer.itemSize = 1;
        this.indexBuffer.numItems = indices.length;

        if(normals != null){
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
            this.normalBuffer.itemSize = 3;
            this.normalBuffer.numItems = normals.length / 3;
        }
    }
    createUVBuffer(uvs){
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
        this.uvBuffer.itemSize = 2;
        this.uvBuffer.numItmes = uvs.length / 2;
    }
    getVertexBuffer(){
        return this.vertexBuffer;
    }
    getIndexBuffer(){
        return this.indexBuffer;
    }
    getNormalBuffer(){
        return this.normalBuffer;
    }
    getUVBuffer(){
        return this.uvBuffer;
    }
    bindVertexBuffer(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.material.getShader().vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }
    bindIndexBuffer(){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
    bindNormalBuffer(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.material.getShader().normalAttribute, 3, gl.FLOAT, false, 0, 0);
    }
    bindUVBuffer(){
        gl.enableVertexAttribArray(this.material.getShader().texCoordAttribute);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.material.getShader().texCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    }
    draw(){
        gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    /**
     * Calculates the normals of a given list of vertices and triangles. Then creates a new buffer of those normals for the mesh this is called on.
     * Pseudocode obtained from: https://schemingdeveloper.com/2014/10/17/better-method-recalculate-normals-unity/
     * @param {*} vertices A list of vertices to calculate normals for
     * @param {*} triangles A list of indices to calculate normals for
     */
    calculateNormals(vertices, triangles){
        var normals = [];
        for(let i = 0; i < vertices.length; i++){
            normals.push(0);
        }
        for(let i = 0; i < triangles.length; i+=3){
            var index0 = triangles[i] * 3;
            var vertex0 = [vertices[index0], vertices[index0 + 1], vertices[index0 + 2]];

            var index1 = triangles[i+1] * 3;
            var vertex1 = [vertices[index1], vertices[index1 + 1], vertices[index1 + 2]];

            var index2 = triangles[i+2] * 3;
            var vertex2 = [vertices[index2], vertices[index2 + 1], vertices[index2 + 2]];

            var normal = calculateSurfaceNormal(vertex0, vertex1, vertex2);
            normals[index0] += normal[0];
            normals[index0 + 1] += normal[1];
            normals[index0 + 2] += normal[2];

            normals[index1] += normal[0];
            normals[index1 + 1] += normal[1];
            normals[index1 + 2] += normal[2];

            normals[index2] += normal[0];
            normals[index2 + 1] += normal[1];
            normals[index2 + 2] += normal[2];
        }
        for(let i = 0; i < normals.length; i+=3){
            var mag = Math.sqrt(normals[i]*normals[i] + normals[i+1]*normals[i+1] + normals[i+2]*normals[i+2]);
            if(mag != 0){
                normals[i] /= mag;
                normals[i+1] /= mag;
                normals[i+2] /= mag;
            }
        }
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    }
}

class WorldObject{
    constructor(mesh, transform, color, material = defaultMaterial, useTexture = false, texture = null){
        this.mesh = mesh;
        this.transform = transform;
        this.color = color;
        this.material = material;
        this.useTex = useTexture;
        this.texture = texture;

        if(this.mesh != null)
        {
            this.mesh.setMaterial(this.material);
            addObject(this);
        }
    }
    batch(){
        addObject(this);
    }
    setMesh(mesh){
        this.mesh = mesh;
        this.mesh.setMaterial(this.material);
    }
    getMesh(){
        return this.mesh;
    }
    getTransform(){
        return this.transform;
    }
    setColor(rgb){
        this.color = rgb;
    }
    getColor(){
        return this.color;
    }
    useTexture(){
        return this.useTex;
    }
    getTexture(){
        return this.texture;
    }
    setTexture(tex){
        this.texture = tex;
    }
}
class Cube extends WorldObject{
    constructor(transform, color, material = defaultMaterial){
        super(unitCubeMesh, transform, color, material);
    }
}
class Sphere extends WorldObject{
    constructor(transform, color, resolution, radius, material = defaultMaterial){
        super(null, transform, color, material);
        var upFaceMesh;
        if(resolution == defaultSphereMeshResolution && Math.abs(radius-0.5) < 0.0001){
            upFaceMesh = unitSphereUpFaceMesh;
        }else{
            upFaceMesh = generateCubeSphereFace([0,1,0], resolution, radius);
        }
        this.topPlane = new WorldObject(upFaceMesh, new Transform(transform), color, material);
        this.bottomPlane = new WorldObject(upFaceMesh, new Transform(transform), color, material);
        this.bottomPlane.getTransform().setLocalRotationFromEulerAngles([0, 0, degToRad(180)]);

        this.rightPlane = new WorldObject(upFaceMesh, new Transform(transform), color, material);
        this.rightPlane.getTransform().setLocalRotationFromEulerAngles([0, 0, degToRad(-90)]);
        this.leftPlane = new WorldObject(upFaceMesh, new Transform(transform), color, material);
        this.leftPlane.getTransform().setLocalRotationFromEulerAngles([0, 0, degToRad(90)]);

        this.frontPlane = new WorldObject(upFaceMesh, new Transform(transform), color, material);
        this.frontPlane.getTransform().setLocalRotationFromEulerAngles([degToRad(90),0,0]);
        this.backPlane = new WorldObject(upFaceMesh, new Transform(transform), color, material);
        this.backPlane.getTransform().setLocalRotationFromEulerAngles([degToRad(-90),0,0]);

        this.faces = [this.topPlane, this.bottomPlane, this.rightPlane, this.leftPlane, this.frontPlane, this.backPlane];
    }
    getMesh(){
        return this.topPlane.getMesh();
    }
    getFaces(){
        return this.faces;
    }
    setColor(rgb){
        this.color = rgb;
        for(let i = 0; i < this.faces.length; i++){
            this.faces[i].setColor(this.color);
        }
    }
}
class Cylinder extends WorldObject{
    constructor(transform, color, resolution, bottomRadius, topRadius, material = defaultMaterial){
        super(unitCylinderMesh, transform, color, material);
        if(!(resolution == defaultCylinderMeshResolution && Math.abs(bottomRadius-0.5) < 0.0001 && Math.abs(topRadius-0.5) < 0.0001)){
            this.setMesh(generateCylinderMesh(resolution, bottomRadius, topRadius));
        }
        addObject(this);
    }
}
class Pyramid extends WorldObject{
    constructor(transform, color, material = defaultMaterial){
        super(unitPyramidMesh, transform, color, material);
    }
}
class Camera{
    constructor(transform, FOV, aspectRatio, nearPlane, farPlane){
        this.projectionMatrix = mat4.create();
        this.projectionMatrix = mat4.perspective(FOV,aspectRatio, nearPlane, farPlane, this.projectionMatrix);

        this.transform = transform;
        this.viewMatrix = mat4.create();
    }
    getViewMatrix(){
        return mat4.inverse(this.getTransform().getWorldTransformationMatrix(), this.viewMatrix);
    }
    lookAt(eyePos, interestPoint, up){
        var forward = [interestPoint[0] - eyePos[0], interestPoint[1] - eyePos[1], eyePos[2] - interestPoint[2]];
        this.getTransform().setLocalPosition(eyePos);
        var rot = quat4.createFromLookRotation(forward, up);
        this.getTransform().setLocalRotation(rot);
    }
    getTransform(){
        return this.transform;
    }
    getProjectionMatrix(){
        return this.projectionMatrix;
    }
}