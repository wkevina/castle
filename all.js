System.register('all', [], function (_export) {
    _export('main', main);

    ///<reference path="../typings/tsd.d.ts"/>
    /*jshint esnext: true */
    //import 'static/lib/helvetiker_regular.typeface/index';

    function main() {

        var PANSPEED = 0.01;
        var ZOOMSPEED = 0.05;

        var zoom = 1;

        function throttle(callback, delay) {
            var timerId;
            return function () {
                if (timerId !== null) {
                    window.clearTimeout(timerId);
                }
                timerId = window.setTimeout(callback, delay);
            };
        }

        window.addEventListener('resize', throttle(render, 100));

        // Set up the THREE context

        var canvas = document.getElementsByTagName('canvas')[0];

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 20;

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

        var center = { x: 0, y: 0 };

        var viewUniform = {
            type: 'm4',
            value: null
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

        var renderer = new THREE.WebGLRenderer({
            canvas: canvas
        });

        renderer.setPixelRatio(window.devicePixelRatio);

        var oldw = canvas.clientWidth; //window.innerWidth;//
        var oldh = canvas.clientHeight; //window.innerHeight;

        renderer.setSize(Math.floor(oldw), Math.floor(oldh), false);
        canvas.width = renderer.context.drawingBufferWidth;
        canvas.height = renderer.context.drawingBufferHeight;

        function render() {

            renderer.setPixelRatio(window.devicePixelRatio);

            var oldw = canvas.clientWidth; //window.innerWidth;//
            var oldh = canvas.clientHeight; //window.innerHeight;

            renderer.setSize(Math.floor(oldw), Math.floor(oldh), false);

            canvas.width = renderer.context.drawingBufferWidth;
            canvas.height = renderer.context.drawingBufferHeight;

            viewUniform.value = getViewMatrix({
                width: renderer.context.drawingBufferWidth,
                height: renderer.context.drawingBufferHeight
            }, area);

            renderer.render(scene, camera);
        }

        requestAnimationFrame(render);
        //requestAnimationFrame(render);

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

            var width2 = canvas.width / 2;

            var height2 = canvas.height / 2;

            var translateIt = translate(-width2, -height2);
            var scaleIt = getScale(canvas, view);

            var offsetX = view.x1 + (view.x2 - view.x1) / 2;

            var offsetY = view.y1 + (view.y2 - view.y1) / 2;

            var shiftIt = translate(offsetX, offsetY);

            var zoomIt = getZoom(zoom);

            var temp = new THREE.Matrix4().multiply(scaleIt).multiply(translate(center.x, center.y));
            var offsetShift = translate(temp.elements[12], temp.elements[13]);
            console.log('offsetShift=' + JSON.stringify(offsetShift));
            //console.log(temp.elements.slice(12));

            //var final = shiftIt.multiply(scaleIt).multiply(translateIt);

            //var final = shiftIt.multiply(zoomIt).multiply(scaleIt).multiply(translateIt);
            var final = new THREE.Matrix4().multiply(offsetShift).multiply(zoomIt).multiply(shiftIt).multiply(scaleIt).multiply(translateIt);

            return final;

            //.multiply();
        }

        function translate(x, y) {
            return new THREE.Matrix4().makeTranslation(x, y, 0);
        }

        // Returns a matrix that will scale canvas coordinates to lie in [-1,1] in x or y
        function getScale(canvas, view) {
            var viewWidth = view.x2 - view.x1;
            var viewHeight = view.y2 - view.y1;

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

        function getZoom(zoom) {
            //zoom = 1 + Math.log(zoom);
            return new THREE.Matrix4().makeScale(zoom, zoom, 1);
        }

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            setupTouchEvents();
        } else {
            setupMouseEvents();
        }

        function setupTouchEvents() {
            var hammer = new Hammer(document.getElementById('canvas'));
            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            hammer.get('pinch').set({ enable: true });
            hammer.get('tap').set({ enable: true });
            hammer.on('panstart panmove panend', function (ev) {
                var json = JSON.stringify;
                console.log('type=' + ev.type + 'dx=' + ev.deltaX + ' dy=' + ev.deltaY + ' center=' + json(ev.center) + ' direction=' + ev.direction + ' offsetDirection=' + ev.offsetDirection);
                pan(ev);
            });
            hammer.on('tap', function (ev) {
                animate.stop = true;
            });
            hammer.on('pinchstart pinch', function (ev) {
                pinch(ev);
            });
        }

        function setupMouseEvents() {
            var throttle = function throttle(type, name, obj) {
                obj = obj || window;
                var running = false;
                var func = function func(event) {
                    if (running) {
                        return;
                    }
                    running = true;
                    requestAnimationFrame(function () {
                        obj.dispatchEvent(new CustomEvent(name, { detail: event }));
                        running = false;
                    });
                    //event.preventDefault();
                };
                obj.addEventListener(type, func);
            };

            /* init - you can init any event */
            throttle('wheel', 'optimizedScroll');
        }

        var vel_x = 0;
        var vel_y = 0;

        function animate(time) {

            if (animate.stop) return;

            var diff;

            if (animate.start) {
                animate.time = time;
                diff = 1 / 60;
            } else {
                diff = time - animate.time;
                animate.time = time;
            }

            center.x += vel_x * zoom * diff;
            center.y -= vel_y * zoom * diff;
            vel_x *= 0.9;
            vel_y *= 0.9;

            if (vel_y * vel_y + vel_x * vel_x > 0.1) {
                requestAnimationFrame(render);
                requestAnimationFrame(animate);
            }
        }
        animate.start = true;

        function pan(ev) {
            if (ev.type == 'panstart') {
                pan.centerCopy = { x: center.x, y: center.y };
                animate.stop = true;
            }

            if (ev.type == 'panend') {
                animate.start = true;
                animate.stop = false;
                requestAnimationFrame(animate);
                return;
            }

            center.x = pan.centerCopy.x - ev.deltaX * zoom;
            center.y = pan.centerCopy.y + ev.deltaY * zoom;
            requestAnimationFrame(render);

            vel_x = ev.velocityX * 1000;
            vel_y = ev.velocityY * 1000;
        }

        function pinch(ev) {
            if (ev.type == 'pinchstart') {
                pinch.zoom = zoom; // copy current state
                pinch.scale = ev.scale;
            }
            zoom = pinch.zoom / ev.scale;
            requestAnimationFrame(render);
        }

        //(function() {
        //	var throttle = function(type, name, obj) {
        //		obj = obj || window;
        //		var running = false;
        //		var func = function(event) {
        //			if (running) {
        //				return;
        //			}
        //			running = true;
        //			requestAnimationFrame(function() {
        //				obj.dispatchEvent(new CustomEvent(name, {detail:event}));
        //				running = false;
        //			});
        //			//event.preventDefault();
        //		};
        //		obj.addEventListener(type, func);
        //	};
        //
        //	/* init - you can init any event */
        //	throttle("wheel", "optimizedScroll");
        //})();

        // handle event
        window.addEventListener('optimizedScroll', function (event) {

            var wheel = event.detail;

            if (!wheel.shiftKey) {
                // PAN

                var deltaX = wheel.deltaX;
                var deltaY = wheel.deltaY;

                center.x += deltaX * zoom;
                center.y -= deltaY * zoom;
            } else {
                // ZOOM
                if (wheel.deltaY > 0) zoom *= 1 + ZOOMSPEED;else zoom *= 1 - ZOOMSPEED;
            }

            requestAnimationFrame(render);
        });
    }

    return {
        setters: [],
        execute: function () {
            'use strict';
        }
    };
});
//# sourceMappingURL=/all.js.map