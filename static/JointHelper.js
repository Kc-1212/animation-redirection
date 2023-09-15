import { Object3D } from 'three';
import { Matrix4 } from 'three';
import { Color } from 'three';
import { Vector3 } from 'three';
import { Vector2 } from 'three';
import { BufferGeometry } from 'three';
import { Float32BufferAttribute } from 'three';
import { Points } from 'three';
import { PointsMaterial } from 'three';
import { Raycaster } from 'three';


const _vector = new Vector3();
const _matrixWorldInv = new Matrix4();
let camera;
let points;
let canvas=null;
class JointHelper extends Object3D {

	constructor( object,cam ) {

		super();
		canvas = document.querySelector('canvas');
		this.root = object;
		this.bones = getBoneList( object );

		camera=cam;

		const geometry = new BufferGeometry();
		const vertices = [];
		const colors = [];

		const color1 = new Color( 0, 0, 1 );
		const color2 = new Color( 0, 1, 0 );

		for ( let i = 0; i < this.bones.length; i ++ ) {

			const bone = this.bones[ i ];

			if ( bone.parent && bone.parent.isBone ) {

				vertices.push( 0, 0, 0 );
				colors.push( color1.r, color1.g, color1.b );

				vertices.push( 0, 0, 0 );
				colors.push( color2.r, color2.g, color2.b );

			} else {

				vertices.push( 0, 0, 0 );
				colors.push( 1, 0, 0 );

			}

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new PointsMaterial( { size: 0.1, vertexColors: true, depthTest: false, depthWrite: false, toneMapped: false, transparent: true, layers: [0] } );
		points = new Points( geometry, material );

		this.add( points );

		this.isSkeletonHelper = true;
		this.type = 'SkeletonHelper';

		this.raycaster = new Raycaster();
		this.mouse = new Vector2();
		console.log(points)
		// Add event listener to canvas element
		canvas.addEventListener('click', this.onClick.bind(this));
  	}
	onClick(event) {
		this.mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
		this.raycaster.setFromCamera(this.mouse, camera);
		const intersects = this.raycaster.intersectObject(this.points);
		if (intersects.length > 0) {
			console.log('clicked');
		}
	}

	getPositionAtIndex(index) {
		const position = new Vector3();
		if (points && points.geometry) {
		const positionAttribute = this.children[0].geometry.getAttribute('position');
		position.fromBufferAttribute(positionAttribute, index);
		this.root.localToWorld(position);
		}
		return position;
	}
	updateMatrixWorld( force ) {
		const bones = this.bones;
		const position = this.children[ 0 ].geometry.getAttribute( 'position' );

		_matrixWorldInv.copy( this.root.matrixWorld ).invert();

		for ( let i = 0, j = 0; i < bones.length; i ++ ) {

			const bone = bones[ i ];

			_vector.setFromMatrixPosition( bone.matrixWorld ).applyMatrix4( _matrixWorldInv );
			position.setXYZ( j, _vector.x, _vector.y, _vector.z );
			j ++;

		}
		position.needsUpdate = true;
	}
	dispose() {

		this.children[ 0 ].geometry.dispose();
		this.children[ 0 ].material.dispose();
		super.dispose();

	}
}
function getBoneList( object ) {

	const boneList = [];

	if ( object.isBone === true ) {

		boneList.push( object );

	}

	for ( let i = 0; i < object.children.length; i ++ ) {

		boneList.push.apply( boneList, getBoneList( object.children[ i ] ) );

	}

	return boneList;

}

export { JointHelper };