/*jshint esnext: true */
//import 'static/lib/helvetiker_regular.typeface/index';

// Set up the THREE context

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 20;

//import THREE from 'static/lib/threejs/build/three';

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
	color: 0xFFFFFF
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var textGeometry = new THREE.TextGeometry("_castle_ experiment", {
	size: 1,
	height: 0.05,
	bevelThickness: 0.1,
	bevelSize: 0.1,
	bevelEnabled: false,
	material: 0,
	extrudeMaterial: 1
});
var textMaterial = new THREE.MeshBasicMaterial({
	color: 0xeecc88
});
var text = new THREE.Mesh(textGeometry, textMaterial);
scene.add(text);

function render() {
	requestAnimationFrame(render);

	cube.rotation.x += 0.005;
	cube.rotation.y += 0.001;

	renderer.render(scene, camera);
}
render();
