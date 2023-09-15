import * as THREE from "three";
import { Vector3 } from "./build/three.module.js";
import { OrbitControls } from '/static/jsm/controls/OrbitControls.js';
import { TransformControls } from '/static/jsm/controls/TransformControls.js';

let world_pivot = new THREE.Vector3(); // save pivot point outside of class

export class CameraController {
  constructor(camera, window, domElement, renderer,scene) {
    this.camera = camera;
    this.domElement = domElement;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.addEventListener('change', renderer);
    this.controls.autoRotate = true
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.renderer=renderer;
    this.scene=scene;
    let transformControl = new TransformControls(camera, domElement);
    transformControl.addEventListener('change', renderer.render( scene, camera ));
    this.controls.enabled = true; // Enable the OrbitControls initially
    transformControl.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value;
    });
    // Bind any event listeners needed
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    transformControl.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;
    });
  }

  onWindowResize() {
    this.camera.aspect = this.domElement.clientWidth / this.domElement.clientHeight;
    this.camera.updateProjectionMatrix();
  }
  onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w key
        world_pivot.z += 1;
        break;
      case 83: // s key
        world_pivot.z -= 1;
        break;
      case 65: // a key
        world_pivot.x -= 1;
        break;
      case 68: // d key
        world_pivot.x += 1;
        break;
    }
    this.controls.target = world_pivot; // set the target to the new pivot point
    this.controls.update();
  }
  target_at(target)
  {
    
    //console.log(target);
    
    this.controls.target = target;
    this.controls.update();
  }
}

