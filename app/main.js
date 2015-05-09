///<reference path="../typings/tsd.d.ts"/>
/*jshint esnext: true */
//import 'static/lib/helvetiker_regular.typeface/index';

export function main() {

	function throttle(callback, delay) {
		var timerId;
		return function() {
			if (timerId !== null) {
				window.clearTimeout(timerId);
			}
			timerId = window.setTimeout(callback, delay);
		};
	}

	window.addEventListener("resize", throttle(render, 100));

	// Set up the THREE context

	var canvas = document.getElementsByTagName('canvas')[0];


	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 20;

	var renderer = new THREE.WebGLRenderer({canvas: canvas});

	//document.body.appendChild(renderer.domElement);


	//var geometry = new THREE.BoxGeometry(1, 1, 1);
	//var material = new THREE.MeshBasicMaterial({
	//	color: 0xFFFFFF
	//});
	//var cube = new THREE.Mesh(geometry, material);
	//scene.add(cube);
	//
	//var textGeometry = new THREE.TextGeometry("_castle_ experiment", {
	//	size: 1,
	//	height: 0.05,
	//	bevelThickness: 0.1,
	//	bevelSize: 0.1,
	//	bevelEnabled: false,
	//	material: 0,
	//	extrudeMaterial: 1
	//});
	//var textMaterial = new THREE.MeshBasicMaterial({
	//	color: 0xeecc88
	//});
	//var text = new THREE.Mesh(textGeometry, textMaterial);
	//scene.add(text);
	//

	// get canvas so we can see our resolution

	var geometry = new THREE.PlaneGeometry(2, 2);


	var area = {
		x1: -2,
		y1: -1,
		x2: 1,
		y2: 1
	};

	var viewUniform = {
		type: 'm4',
		value: getViewMatrix(canvas, area)
	};



	var material = new THREE.ShaderMaterial({

		vertexShader: document.getElementById('vertexShader').textContent,

		fragmentShader: document.getElementById('fragmentShader').textContent,

		uniforms: {
			view: viewUniform
		}

	});

	var plane = new THREE.Mesh(geometry, material);
	scene.add(plane);

	function render() {
		console.log("Render");

		//requestAnimationFrame(render);
		//
		// renderer.setPixelRatio(window.devicePixelRatio);
		// renderer.setSize(window.innerWidth, window.innerHeight, false);

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

		viewUniform.value = getViewMatrix(canvas, area);

		//
		//	cube.rotation.x += 0.005;
		//	cube.rotation.y += 0.001;

		renderer.render(scene, camera);
	}
	render();

	// aspect
	// view = {x,y,w,h}
	//
	// test if aspect is larger than view's aspect
	//
	// if (aspect > view.h/view.w) # window is taller than view, scale depends on width only
	// 	return

	// Matrix that will translate canvas coordinates to the
	// interval[-width / 2, width / 2] and [-height / 2, height / 2]

	// x' = x - w/2
	// y' = y - h/2

	// [ 1 - w/2 , -w/2   ]
	// [ -h/2   , 1 - h/2 ]

	function getViewMatrix(canvas, view) {

		var translateIt = translate(-canvas.width / 2, -canvas.height / 2);
		var scaleIt = getScale(canvas, view);

		var offsetX = view.x1 + (view.x2 - view.x1) / 2;

		var offsetY = view.y1 + (view.y2 - view.y1) / 2;

		var shiftIt = translate(offsetX, offsetY);

		//var final = shiftIt.multiply(scaleIt).multiply(translateIt);

		var final = shiftIt.multiply(scaleIt).multiply(translateIt);

		return final;

		//.multiply();
	}



	function translate(x, y) {
		return new THREE.Matrix4().makeTranslation(x, y, 0);

	}

	// Returns a matrix that will scale canvas coordinates to lie in [-1,1] in x or y
	function getScale(canvas, view) {
		var viewWidth = (view.x2 - view.x1);
		var viewHeight = (view.y2 - view.y1);

		var viewAspect = viewHeight / viewWidth;

		var scale;

		if (canvas.height / canvas.width > viewAspect) {
			scale = viewWidth / canvas.width;
			//scale /= viewWidth;
		} else {
			scale = viewHeight / canvas.height;
			//scale /= viewHeight;
		}

		return new THREE.Matrix4().makeScale(scale, scale, 1);
	}

}
