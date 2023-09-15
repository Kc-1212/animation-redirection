import * as THREE from "three";
import { clearTimeouts, setTimeout } from './TimeoutManager.js';

export class CustomRaycaster {
  constructor(camera, scene,cameraController, guiLoader,modelHelper) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickedObject = null;
    this.hoveredObject = null;
    this.guiLoader = guiLoader;
    this.modelHelper=modelHelper;
    this.cameraController = cameraController;
    this.canvas = document.querySelector('canvas');

    this.canvas.addEventListener("mousedown", this.onMouseClick.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this))
  }

  onMouseClick(event) {
    this.mouse.x = (event.offsetX / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    for (let i = 0; i < intersects.length; i++) {
      const object = intersects[i].object;

      // Check if the object is clickable
      if (object.userData.notClickable) {
        continue;
      }
      console.log(object)
      if (object.name != "null") {
        const material = object.material;

        if (material) {
          //reset timer and model
          clearTimeouts();
          this.modelHelper.setAllVertexColorsToWhite();

          material.color.set(0xd4a017);
          this.clickedObject = object;
          this.cameraController.target_at(object.getWorldPosition(new THREE.Vector3()));
          
          // display segment info and colour segment
          if(object.userData.type=="Segments")
          {
            this.modelHelper.colorSegment(object.name);
            this.guiLoader.showSegmentInfo(object.name);  
          }
          //display joint info
          else {
            let coordinate = object.getWorldPosition(new THREE.Vector3())
            this.guiLoader.showJointInfo(object.name, coordinate.x, coordinate.y, coordinate.z);  
          }
           
          //CALCULATE TRAJECTORY 
          // Create an array to store the Euclidean Distances
          let euclideanDistances = [];
          let rootCoordinate;

          const calculateTrajectory = () => {
            //get root world coordinate
            parent = object.parent;
            while (parent.name != "root") {
              parent = parent.parent;
              rootCoordinate = parent.getWorldPosition(new THREE.Vector3());
            }

            // get joint world coordinate
            let jointCoordinate = object.getWorldPosition(new THREE.Vector3());

            // Calculate Euclidean Distance
            let euclideanDist = Math.sqrt(
              Math.pow(jointCoordinate.x - rootCoordinate.x, 2) +
                Math.pow(jointCoordinate.y - rootCoordinate.y, 2) +
                Math.pow(jointCoordinate.z - rootCoordinate.z, 2)
            );

            // store into array and display
            euclideanDistances.push(euclideanDist);
            this.guiLoader.showTrajectory(object.name, euclideanDistances);

            // Continue calculating the trajectory every 0.25 seconds until a new click happens
            this.timeoutId = setTimeout(calculateTrajectory, 250);
          };

          // Start calculating the trajectory
          calculateTrajectory();
        
        }
      }
    }
  }

  onMouseUp(event ) {
    if (this.clickedObject) {
      const material = this.clickedObject.material;
      if (material) {
        material.color.set(0xd4a017);

      }
      this.clickedObject = null;
    }
  }

  onMouseMove(event) {
    this.mouse.x = (event.offsetX / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = -(event.offsetY / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    let objectHovered = false;

    for (let i = 0; i < intersects.length; i++) {
      const object = intersects[i].object;

      // Check if the object is clickable
      if (object.userData.notClickable) {
        continue;
      }

      //object hovered
      if (object !== this.clickedObject) {
        const material = object.material;
        if (material) {
          material.color.set(0xca3433);
          this.hoveredObject = object;
          objectHovered = true;

        }
      }
    }

    //object not hovereed
    if (!objectHovered && this.hoveredObject) {
      const material = this.hoveredObject.material;
      if (material) {
        material.color.set(0x541914); 
      }
      this.hoveredObject = null;
    }
  }
}
