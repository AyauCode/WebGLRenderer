
var worldObjectMap = new Map();
var unitCubeMesh, unitCylinderMesh, unitSphereUpFaceMesh, unitPyramidMesh;
const defaultSphereMeshResolution = 20, defaultCylinderMeshResolution = 20;
function initMeshPrimitives(){
     //==================Unit=Cube=Mesh=======================
     var cubeVertices = [
        0.5,  0.5,  -0.5, //Right-Top-Front 0
        -0.5,  0.5,  -0.5, //Left-Top-Front 1
        - 0.5, -0.5,  -0.5, //Left-Bottom-Front 2
        0.5, -0.5,  -0.5, //Right-Bottom-Front 3
        0.5,  0.5,  0.5,  //Right-Top-Back 4
        -0.5,  0.5,  0.5, //Left-Top-Back 5
        -0.5, -0.5,  0.5, //Left-Bottom-Back 6
        0.5, -0.5,  0.5 //Right-Bottom-Back 7
    ];

    var cubeIndices = [0,2,1,0,3,2, 0,7,3,0,4,7, 6,2,3,6,3,7, 5,1,2,5,2,6, 5,0,1,5,4,0, 5,6,7,5,7,4];

    unitCubeMesh = new Mesh();
    unitCubeMesh.createNewBuffers(cubeVertices, cubeIndices);
    //=======================================================

    //=================Unit=Cylinder=Mesh====================
    unitCylinderMesh = generateCylinderMesh(defaultCylinderMeshResolution, 0.5, 0.5);
    //=======================================================

    //===============Unit=Sphere=Up=Face=Mesh================
    unitSphereUpFaceMesh = generateCubeSphereFace([0,1,0], defaultSphereMeshResolution, 0.5);
    //=======================================================
    
    //=================Unit=Pyramid=Mesh=====================
    var pyramidVertices = [
        0.5,-0.5,-0.5,  //Right-Bottom-Front 0
        -0.5,-0.5,-0.5, //Left-Bottom-Front 1
        -0.5,-0.5,0.5,  //Left-Bottom-Back 2
        0.5,-0.5,0.5,   //Right-Bottom-Back 3
        0.0,0.5,0.0     //Top-Middle (Pyramid peak) 4
    ];
    var pyramidIndices = [0,2,1,0,3,2, 0,4,3, 1,4,0, 2,4,1, 3,4,2]

    unitPyramidMesh = new Mesh();
    unitPyramidMesh.createNewBuffers(pyramidVertices, pyramidIndices);
    //=======================================================
}
function addWorldObject(worldObject){
    if(worldObjectMap.has(worldObject.getMesh())){
        worldObjectMap.get(worldObject.getMesh()).push(worldObject);
    }else{
        var newObjectList = [];
        newObjectList.push(worldObject);
        worldObjectMap.set(worldObject.getMesh(), newObjectList);
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
        
        this.localForward = vec3.create();
        this.localRight = vec3.create();
        this.localUp = vec3.create();

        this.worldForward = vec3.create();
        this.worldRight = vec3.create();
        this.worldUp = vec3.create();

        this.workingMatrix = mat4.create();
        this.rotationMatrix = mat4.create();
    }
    getWorldForward(){
        mat4.toRotationMat(this.getWorldTransformationMatrix(), this.workingMatrix);
        return mat4.multiplyVec3(this.workingMatrix, [0,0,-1], this.worldForward);
    }
    getWorldRight(){
        mat4.toRotationMat(this.getWorldTransformationMatrix(), this.workingMatrix);
        return mat4.multiplyVec3(this.workingMatrix, [1,0,0], this.worldRight);
    }
    getWorldUp(){
        mat4.toRotationMat(this.getWorldTransformationMatrix(), this.workingMatrix);
        return mat4.multiplyVec3(this.workingMatrix, [0,1,0], this.worldUp);
    }

    getLocalForward(){
        mat4.toRotationMat(this.getLocalTransformationMatrix(), this.workingMatrix);
        return mat4.multiplyVec3(this.workingMatrix, [0,0,-1], this.localForward);
    }
    getLocalRight(){
        mat4.toRotationMat(this.getLocalTransformationMatrix(), this.workingMatrix);
        return mat4.multiplyVec3(this.workingMatrix, [1,0,0], this.localRight);
    }
    getLocalUp(){
        mat4.toRotationMat(this.getLocalTransformationMatrix(), this.workingMatrix);
        return mat4.multiplyVec3(this.workingMatrix, [0,1,0], this.localUp);
    }
    getLocalTransformationMatrix(){
        this.localTransformationMatrix = mat4.identity(this.localTransformationMatrix);

        mat4.translate(this.localTransformationMatrix, this.localPosition);

        quat4.toMat4(this.localRotation, this.workingMatrix);
        mat4.multiply(this.localTransformationMatrix, this.workingMatrix, this.localTransformationMatrix);

        mat4.scale(this.localTransformationMatrix, this.localScale);

        return this.localTransformationMatrix;
    }
    getWorldTransformationMatrix(){
        if(this.parent != null){
            return mat4.multiply(this.parent.getWorldTransformationMatrix(), this.getLocalTransformationMatrix(), this.worldMat);
        }else{
            return this.getLocalTransformationMatrix();
        }
    }
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
    addVec3ToLocalPosition(v){
        this.localPosition[0] += v[0];
        this.localPosition[1] += v[1];
        this.localPosition[2] += v[2];
    }

    setLocalRotation(q){
        this.localRotation = q;
    }
    setLocalRotationFromEulerAngles(r){
        this.localRotation = quat4.euler(this.localRotation, r);
    }

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
    removeChild(child){
        var index = this.children.indexOf(child);
        if(index > -1){
            this.children.splice(index, 1);
        }
    }
    setParent(parent){
        if(this.parent != null){
            this.parent.removeChild(this);
        }
        this.parent = parent;
        this.parent.addChild(this);
    }
}

class Mesh{
    constructor(){
        this.vertexBuffer = null;
        this.indexBuffer = null;
    }
    setBuffers(vertexBuffer, indexBuffer){
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
    }
    createNewBuffers(vertices, indices){
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer.vertexSize = 3;
        this.vertexBuffer.numVertices = vertices.length / 3;

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer); 
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
        this.indexBuffer.itemsize = 1;
        this.indexBuffer.numItems = indices.length;
    }
    getVertexBuffer(){
        return this.vertexBuffer;
    }
    getIndexBuffer(){
        return this.indexBuffer;
    }
    bindVertexBuffer(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.vertexSize, gl.FLOAT, false, 0, 0);
    }
    bindIndexBuffer(){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
    draw(){
        gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}

class WorldObject{
    constructor(mesh, transform, color, shouldBatch = true){
        this.mesh = mesh;
        this.transform = transform;
        this.color = color;

        if(this.mesh != null && shouldBatch)
        {
            addWorldObject(this);
        }
    }
    setMesh(mesh){
        this.mesh = mesh;
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
}
class Cube extends WorldObject{
    constructor(transform, color){
        super(unitCubeMesh, transform, color);
    }
}
class Sphere extends WorldObject{
    constructor(transform, color, resolution, radius){
        super(null, transform, color, false);
        var upFaceMesh;
        if(resolution == defaultSphereMeshResolution && Math.abs(radius-0.5) < 0.0001){
            upFaceMesh = unitSphereUpFaceMesh;
        }else{
            upFaceMesh = generateCubeSphereFace([0,1,0], resolution, radius);
        }
        this.topPlane = new WorldObject(upFaceMesh, new Transform(transform), color);
        this.bottomPlane = new WorldObject(upFaceMesh, new Transform(transform), color);
        this.bottomPlane.getTransform().setLocalRotationFromEulerAngles([0, 0, degToRad(180)]);

        this.rightPlane = new WorldObject(upFaceMesh, new Transform(transform), color);
        this.rightPlane.getTransform().setLocalRotationFromEulerAngles([0, 0, degToRad(-90)]);
        this.leftPlane = new WorldObject(upFaceMesh, new Transform(transform), color);
        this.leftPlane.getTransform().setLocalRotationFromEulerAngles([0, 0, degToRad(90)]);

        this.frontPlane = new WorldObject(upFaceMesh, new Transform(transform), color);
        this.frontPlane.getTransform().setLocalRotationFromEulerAngles([degToRad(90),0,0]);
        this.backPlane = new WorldObject(upFaceMesh, new Transform(transform), color);
        this.backPlane.getTransform().setLocalRotationFromEulerAngles([degToRad(-90),0,0]);
    }
}
class Cylinder extends WorldObject{
    constructor(transform, color, resolution, bottomRadius, topRadius){
        super(unitCylinderMesh, transform, color, false);
        if(!(resolution == defaultCylinderMeshResolution && Math.abs(bottomRadius-0.5) < 0.0001 && Math.abs(topRadius-0.5) < 0.0001)){
            this.setMesh(generateCylinderMesh(resolution, bottomRadius, topRadius));
        }
        addWorldObject(this);
    }
}
class Pyramid extends WorldObject{
    constructor(transform, color){
        super(unitPyramidMesh, transform, color);
    }
}
class Camera{
    constructor(transform, FOV, aspectRatio, nearPlane, farPlane){
        this.projectionMatrix = mat4.create();
        this.projectionMatrix = mat4.perspective(FOV,aspectRatio, nearPlane, farPlane, this.projectionMatrix);

        this.transform = transform;
        this.viewMatrix = mat4.create();
        
        this.rotationMatrix = mat4.create();
        this.workingMatrix = mat4.create();
        this.localRight = vec3.create();
        this.eyePos = vec3.create();
    }
    getViewMatrix(){
        return mat4.inverse(this.getTransform().getWorldTransformationMatrix(), this.viewMatrix);
    }
    lookAt(eyePos, interestPoint, up){
        var forward = [interestPoint[0] - eyePos[0], interestPoint[1] - eyePos[1], eyePos[2] - interestPoint[2]];

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