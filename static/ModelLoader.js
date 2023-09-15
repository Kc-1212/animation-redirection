import * as THREE from 'three';
import { GLTFLoader } from '/static/jsm/loaders/GLTFLoader.js';
import { STLExporter } from '/static/jsm/exporters/STLExporter.js';


export class GLTFLoaderHelper {
  constructor() {
    this.model = null;
    this.skeleton = null;
    this.skin = null; //var for assign to geometry
    this.clone = null;
    this.Head = [];
    this.Torso=[];
    this.LeftArm = [];
    this.LeftForearm = [];
    this.LeftTigh=[];
    this.LeftCalf=[];
    this.RightArm = [];
    this.RightForearm = [];
    this.RightTigh=[];
    this.RightCalf=[];
  }
  
  loadGLTFModelWithSkeleton(path, scene, camera,json_pose) {
    const loader = new GLTFLoader();
    let checkModel = false;
    const that = this;
    loader.load(path, function (gltf) {
      // Store the mesh in the model variable
      that.model = gltf.scene;
      that.model.children[0].children[1].userData.notClickable=true;
     
      // Store the skeleton
      that.skeleton = new THREE.SkeletonHelper(that.model);
      let skel = new THREE.Skeleton(that.skeleton.bones);
      
       // check human model
      const humanArray=["lefthand", "righthand", "leftleg", "rightleg"];
      const threeDArray=["lhand", "rhand", "lfoot", "rfoot"];
      if(compareSkeletonBonesRev(humanArray,skel)==true)
        checkModel=true;
      else if(compareSkeletonBonesRev(threeDArray,skel)==true)
        checkModel=true;
      else
        checkModel=false;
      if(checkModel==true){
        that.skeleton.material.linewidth = 1000;
        that.skeleton.visible = false;
        that.skeleton.userData.notClickable=true;
        scene.add(that.skeleton);
        // Add the model to the scene
        scene.add(that.model);
        that.skin=that.model.children[0].children[1].geometry;
        that.model.traverse(function (node) {
          if (node.isBone) {
            const bone = node;
            if(bone.name != "root"){
              const jointGeometry = new THREE.SphereGeometry(0.02);
              const boneMaterial = new THREE.MeshBasicMaterial({ color: 0x541914, depthWrite: false, depthTest: false  });
              const boneMesh = new THREE.Mesh(jointGeometry, boneMaterial);
              
              boneMesh.name = bone.name; // set the name of the box
              boneMesh.userData.type = "Joints";
              bone.add(boneMesh);
            }
            else{
              
              var segmentMesh=that.CreateSegmentMesh("Torso",0,0,0)
              bone.add (segmentMesh);
            
            }
            
            if(bone.name=="Head")
            {
              var segmentMesh=that.CreateSegmentMesh("Head",0,0,0)
              bone.add (segmentMesh);
            }
            if(bone.name.includes("Shoulder")||bone.name.includes("Elbow"))
            {
              let Seg_name=""
              let location=bone.getWorldPosition(new THREE.Vector3()).x-bone.children[0].getWorldPosition(new THREE.Vector3()).x;
              if(bone.name.includes("Shoulder"))
              {
                Seg_name="Arm"
              }
              if(bone.name.includes("Elbow"))
              {
                Seg_name="ForeArm"
              }
              location= location/2;

              
              if(location>=0)
              {
                Seg_name="Right"+Seg_name;
              }
              else{
                Seg_name="Left"+Seg_name;
              }
              var segmentMesh=that.CreateSegmentMesh(Seg_name,location,0,0);
              bone.add (segmentMesh);
            }
            if(bone.name.includes("Hip")||bone.name.includes("Knee"))
            {
              let Seg_name=""
              let x=bone.position.x;
              let location=bone.getWorldPosition(new THREE.Vector3()).y-bone.children[0].getWorldPosition(new THREE.Vector3()).y;
              if(bone.name.includes("Hip"))
              {
                Seg_name="Tigh"
              }
              if(bone.name.includes("Knee"))
              {
                Seg_name="Calf"
              }
              location= location/2;
              if(x<=0)
              {
                Seg_name="Right"+Seg_name;
              }
              else{
                Seg_name="Left"+Seg_name;
              }
              var segmentMesh=that.CreateSegmentMesh(Seg_name,0,location,0);
              bone.add (segmentMesh);
            }

          }
          that.setJointVisible(false);
          that.setSegmentVisible(false);
        });
        
        var path=that.model.children[0].children[1].geometry;
        that.setAllVertexColorsToWhite();
        enableVertexColor(that.model);
        that.defineSegment();
        json_pose[json_pose.length - 1] = json_pose[json_pose.length - 1].replace("3d", "pose")
        fetch("/static/user_data" + json_pose.join("/") + ".json")
        .then(response => {return response.json();})
        .then(jsondata => {
            for (let key in jsondata) {
              if (key == 'L_Wrist' || key == 'R_Wrist') continue;
                let q_rot = jsondata[key].replace('[', '').replace(']', '').split(',')
                let local_bone = skel.getBoneByName(key)
                local_bone.quaternion.w = parseFloat(q_rot[0])
                local_bone.quaternion.x = parseFloat(q_rot[1])
                local_bone.quaternion.y = parseFloat(q_rot[2])
                local_bone.quaternion.z = parseFloat(q_rot[3])
            }
            //TEMP: SHOULDER ANIMATION
             // Find the left shoulder bone and store its initial rotation
            let shoulder_bone = skel.getBoneByName('L_Shoulder');
            let shoulder_quaternion_start = shoulder_bone.quaternion.clone();

            // Define the animation parameters
            let animation_start_time = 0;
            let animation_duration = 5; // seconds
            let animation_delay = 0; // seconds
            let max_rotation_angle = Math.PI / 4; // 45 degrees

            // Define the animation function
            let animate_arm = function (timestamp) {
              // Calculate the progress of the animation
              let animation_progress = ((timestamp - animation_start_time) / 1000) / animation_duration;

              // Stop the animation if it's done
              if (animation_progress >= 1) {
                animation_start_time = timestamp;
                shoulder_bone.quaternion.copy(shoulder_quaternion_start);
              }

               // Calculate the rotation angle based on the animation progress and the sine function
              let sine_progress = Math.sin(Math.PI * animation_progress);
              let rotation_angle = max_rotation_angle * sine_progress;

              // Update the rotation of the shoulder bone
              let rotation_quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotation_angle);
              shoulder_bone.quaternion.multiplyQuaternions(rotation_quaternion, shoulder_quaternion_start);

              // Request the next frame of the animation
              requestAnimationFrame(animate_arm);
            }

            // Start the animation after a delay
            setTimeout(function () {
                animation_start_time = performance.now();
                requestAnimationFrame(animate_arm);
            }, animation_delay * 1000);
        });
      }
      else{
        alert("Not a human model from mixarmo")
      }    
     }, 
     undefined, function (error) {
       console.error(error);
     });
  }
  defineSegment()
  {

    var model_path=this.model.children[0].children[1];
    
    this.Head=getHeadVertices(model_path,this.skeleton.bones[13].children[1].getWorldPosition(new THREE.Vector3()).y);
    console.log(this.skeleton)
    this.LeftArm=getVertexBetweenPostitionX(model_path,this.skeleton.bones[16].children[1].getWorldPosition(new THREE.Vector3()).x, this.skeleton.bones[17].children[1].getWorldPosition(new THREE.Vector3()).x)
    this.RightArm=getVertexBetweenPostitionX(model_path,this.skeleton.bones[21].children[1].getWorldPosition(new THREE.Vector3()).x, this.skeleton.bones[22].children[1].getWorldPosition(new THREE.Vector3()).x)
    this.LeftForearm=getVertexBetweenPostitionX(model_path,this.skeleton.bones[17].children[1].getWorldPosition(new THREE.Vector3()).x, this.skeleton.bones[18].children[1].getWorldPosition(new THREE.Vector3()).x)
    this.RightForearm=getVertexBetweenPostitionX(model_path,this.skeleton.bones[22].children[1].getWorldPosition(new THREE.Vector3()).x, this.skeleton.bones[23].children[1].getWorldPosition(new THREE.Vector3()).x)

    getVertexBetweenPostitionY (model_path,this.skeleton.bones[2].children[1].getWorldPosition(new THREE.Vector3()).y,this.skeleton.bones[3].children[1].getWorldPosition(new THREE.Vector3()).y,this.skeleton.bones[1].children[3].getWorldPosition(new THREE.Vector3()).x,this.LeftTigh,this.RightTigh);
    getVertexBetweenPostitionY (model_path,this.skeleton.bones[3].children[1].getWorldPosition(new THREE.Vector3()).y,this.skeleton.bones[4].children[1].getWorldPosition(new THREE.Vector3()).y,this.skeleton.bones[1].children[3].getWorldPosition(new THREE.Vector3()).x,this.LeftCalf,this.RightCalf);
    console.log(this.RightCalf)
    this.Torso=getTorsoVertex(model_path,this.skeleton.bones[1].children[3].getWorldPosition(new THREE.Vector3()).y,this.skeleton.bones[13].children[1].getWorldPosition(new THREE.Vector3()).y,this.skeleton.bones[16].children[1].getWorldPosition(new THREE.Vector3()).x,this.skeleton.bones[21].children[1].getWorldPosition(new THREE.Vector3()).x)
    
  }
  CreateSegmentMesh(name, coordinateX, coordinateY, coordinateZ)
  {
    const jointGeometry = new THREE.SphereGeometry(0.02);
    const boneMaterial = new THREE.MeshBasicMaterial({ color: 0x541914, depthWrite: false, depthTest: false  });
    const segment = new THREE.Mesh(jointGeometry, boneMaterial);
    
    segment.name = name; // set the name of the box
    segment.position.x=-coordinateX;
    segment.position.y=-coordinateY;
    segment.position.z=-coordinateZ;
    segment.userData.type = "Segments";
    return segment;
  }
  colorSegment(segmentName)
  {
    console.log(segmentName)
    if(segmentName=="Torso")
    {
      this.setVertexColorsToRed(this.Torso);
    }
    else if(segmentName=="RightArm")
    {
      this.setVertexColorsToRed(this.RightArm);
    }
    else if(segmentName=="RightForeArm")
    {
      this.setVertexColorsToRed(this.RightForearm);
    }
    else if(segmentName=="LeftArm")
    {
      this.setVertexColorsToRed(this.LeftArm);
    }
    else if(segmentName=="LeftForeArm")
    {
      this.setVertexColorsToRed(this.LeftForearm);
    }
    else if(segmentName=="RightTigh")
    {
      this.setVertexColorsToRed(this.RightTigh);
    }
    else if(segmentName=="LeftTigh")
    {
      this.setVertexColorsToRed(this.LeftTigh);
    }
    else if(segmentName=="RightCalf")
    {
      this.setVertexColorsToRed(this.RightCalf);
    }
    else if(segmentName=="LeftCalf")
    {
      this.setVertexColorsToRed(this.LeftCalf);
    }
    else if(segmentName=="Head")
    {
      this.setVertexColorsToRed(this.Head);
    }
  }
  getModel() {
    return this.model;
  }
  getSkeleton() {
    return this.skeleton;
  }
  setModelVisible(Model_value) {
    let ModelMesh=this.model.children[0].children[1];
    ModelMesh.visible= Model_value;
  }
  setSkeletonVisible(Skeleton_value) {
    if (this.skeleton) {
      this.skeleton.visible = Skeleton_value;
    }
  }
  setJointVisible(Joint_Value) {
    // Traverse the model's nodes and hide the skin mesh
    this.model.traverse(function (node) {
      if (node.isMesh && node.userData.type=="Joints") {
        node.userData.notClickable=!Joint_Value;
        node.visible = Joint_Value;
      }
    });
  }

  setSegmentVisible(Seg_Value) {
      // Traverse the model's nodes and hide the skin mesh
      this.model.traverse(function (node) {
        if (node.isMesh && node.userData.type=="Segments") {
          node.userData.notClickable=!Seg_Value;
          node.visible = Seg_Value;
          
         }
    });
  }
  
  exportTrigger(){
    exportModelAsSTL(this.model,"model.stl");
    
    function exportModelAsSTL(model) {
      const exporter = new STLExporter();
      let stlData;
      stlData = exporter.parse(model.children[0].children[1]);
      save(new Blob([stlData], {type:'text/plain'}), "model.stl");
    }
    
    function save(blob, filename){
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  }

  setVertexColorsToRed(indexes) {
    let geometry= this.model.children[0].children[1].geometry;
    const colors = new Float32Array(geometry.attributes.position.count * 3).fill(1);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    let j=0;
    for (let i = 0; i < colorAttribute.count; i++) {
      
      let check_index=indexes[j];
      if(check_index==i)
      {
        colorAttribute.setXYZ(i, 0.09, 0.63, 0.83); // set red color for all vertices
        j++
      }
    }
    geometry.setAttribute('color', colorAttribute);
    geometry.attributes.color.needsUpdate = true; // tell Three.js to update the mesh with the new colors
    geometry.computeVertexNormals(); // update vertex normals to ensure proper shading
    geometry.computeBoundingBox(); // update bounding box for the mesh
  }

  setAllVertexColorsToWhite() {
    let geometry= this.model.children[0].children[1].geometry;
    const colors = new Float32Array(geometry.attributes.position.count * 3).fill(1);
    const colorAttribute = new THREE.BufferAttribute(colors, 3);
    for (let i = 0; i < colorAttribute.count; i++) {
      colorAttribute.setXYZ(i, 1, 1, 1); // set red color for all vertices
    }
    geometry.setAttribute('color', colorAttribute);
    geometry.attributes.color.needsUpdate = true; // tell Three.js to update the mesh with the new colors
    geometry.computeVertexNormals(); // update vertex normals to ensure proper shading
    geometry.computeBoundingBox(); // update bounding box for the mesh
  }

  compareSkeletonBones(json,parameter) {
    // Set the predefined bones array
    const bones = json;
  
    // Set a boolean variable to true
    let isEqual = true;
  
    // Loop through each bone in the array
    for (let i = 0; i < parameter.bones.length; i++) {
      // Get the name of the bone
      
  
      // Check if the bone name is present in the parameter array
      let found = true;
      for (let j = 0; j <bones.length ; j++) {
        const boneName = bones[j].name.toLowerCase;
        const modelBone=parameter.bones[i].name.toLowerCase;
        if (modelBone.includes(boneName)) {
          found=true;
          break;
        }
        else{
          found=false;
        }
      }
  
      // If the bone name is not present in the parameter array, set isEqual to false and break the loop
      if (!found) {
        isEqual = false;
        break;
      }
    }
  
    return isEqual;
  }
  
}

function getTorsoVertex(mesh, y1,y2,x1,x2)
{
  let minY = Math.min(y1, y2);
  let maxY = Math.max(y1, y2);
  let minX = Math.min(x1, x2);
  let maxX = Math.max(x1, x2);
  let index=0;
  maxY=Math.ceil(maxY * 10) / 10;

  const geometry = mesh.geometry;
  const positions = geometry.attributes.position.array;
  const vertices = [];
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    vertex.applyMatrix4(mesh.matrixWorld);
    if (vertex.y >= minY && vertex.y <= maxY && vertex.x >= minX && vertex.x <= maxX) {
        vertices.push(index);
    }
    index+=1;
  }
  return vertices;

}


function getVertexBetweenPostitionY(mesh, a, b, middlepoint,vertices_Left,vertices_Right) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  let index=0;
  const geometry = mesh.geometry;
  const positions = geometry.attributes.position.array;
  // const vertices_Left = [];
  // const vertices_Right = [];
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    vertex.applyMatrix4(mesh.matrixWorld);
    if (vertex.y >= min && vertex.y <= max) {
      if(vertex.x<=middlepoint)
      {
        vertices_Right.push(index);
      }
      if(vertex.x>=middlepoint)
      {
        vertices_Left.push(index);
    
      }
    }
    index+=1;
  }
  return null;
}

function getVertexBetweenPostitionX(mesh, a, b) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  let index=0;
  const geometry = mesh.geometry;
  const positions = geometry.attributes.position.array;
  const vertices = [];
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    vertex.applyMatrix4(mesh.matrixWorld);
    if (vertex.x >= min && vertex.x <= max) {
      vertices.push(index);
    }
    index+=1;
  }
  return vertices;
}

function getHeadVertices(mesh, y) {
  const geometry = mesh.geometry;
  const positions = geometry.attributes.position.array;
  const indexarr = [];
  let index=0;
  // Apply the world transformation matrix to each vertex before adding it to the array
  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    vertex.applyMatrix4(mesh.matrixWorld);
    if(vertex.y>= y)
    {
      indexarr.push(index);
    }
    index+=1;
  }
  
  return indexarr;
}




function enableVertexColor(model)
{
  model.children[0].children[1].material.vertexColors=true;
}

function compareSkeletonBonesRev(minReq,modelBoneArray) {
  let isEqual = true;
  if(modelBoneArray.bones.length<1){
    isEqual=false;
  }
  // Set the predefined bones array
  const bones = minReq;

  // Set a boolean variable to true
  

  // Loop through each bone in the array
  for (let i = 0; i <bones.length ; i++) {
    // Get the name of the bone
    

    // Check if the bone name is present in the parameter array
    let found = true;
    for (let j = 0; j <modelBoneArray.bones.length ; j++) {
      const boneName = bones[i];
      const boneN=String(boneName).toLowerCase();
      const modelBone=modelBoneArray.bones[j].name;
      const modelB=String(modelBone).toLowerCase();
      const remove=modelB.replace(/[\s-_]/g, '');
      if (remove.includes(boneName)) {
        found=true;
        break;
      }
      else{
        found=false;
      }
    }

    // If the bone name is not present in the parameter array, set isEqual to false and break the loop
    if (!found) {
      isEqual = false;
      break;
    }
  }

  return isEqual;
}