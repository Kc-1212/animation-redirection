import * as THREE from "three";

export class Grid {
  constructor(size , divisions, color ,clickable,scene) {
    this.size = size;
    this.divisions = divisions;
    this.color = color;

    this.gridHelper = new THREE.GridHelper(size, divisions, color);
    this.gridHelper.position.y = -1.2;
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0x111111, depthWrite: true }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.position.y-=1.2;
    mesh.receiveShadow = true;
    this.gridHelper.add(mesh);
    this.clickable = clickable; // add clickable property
    
    if (!clickable) {
      // if not clickable, set a userData property on the object
      this.gridHelper.userData.notClickable = true;
      mesh.userData.notClickable=true;
    }
  }

  getGrid() {
    return this.gridHelper;
  }
}
