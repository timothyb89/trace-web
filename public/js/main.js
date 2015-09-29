var scene = null;
var camera = null;
var cameraTarget = null;
var renderer = null;
var controls = null;

var radius = 5;

var model = function(line) {
	var tokens = line.split(' ', 3);
	var data = atob(tokens[2]);

	var old = scene.getObjectByName(tokens[1]);
	if (old) {
		scene.remove(old);
	}

	var loader = new THREE.PLYLoader();
	var geometry = loader.parse(data);
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	console.log("Loaded:", geometry);

	var material = new THREE.MeshPhongMaterial({
		color: 0x888888,
		specular: 0x111111,
		shininess: 200,
		shading: THREE.SmoothShading
	});

	var mesh = new THREE.Mesh( geometry, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.position.set(0, 0, 0);
	mesh.rotation.set(0, 0, 0);
	mesh.scale.set(1, 1, 1);
	mesh.name = tokens[1];

	scene.add(mesh);
};

var initThree = function() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000);

	camera.position.set(3, 0, 3);
	cameraTarget = new THREE.Vector3(0, 0, 0);

	var plane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 40, 40 ),
			new THREE.MeshPhongMaterial({
				color: 0xffffff,
				specular: 0xffffff,
			})
	);
	plane.rotation.x = -Math.PI/2;
	plane.position.y = -0.5;
	scene.add( plane );
	plane.receiveShadow = true;

	scene.add(new THREE.AmbientLight(0x404040, 0.25));

	var light = new THREE.PointLight(0xf0f0f0, 1, 10000);
	light.position.set(1, 1, 0);
	scene.add(light);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
};

function render() {
	requestAnimationFrame( render );

	controls.update();

	camera.lookAt(cameraTarget);
	renderer.render( scene, camera );
}

$(document).ready(function() {
	initThree();
	render();

	var socket = io();
	socket.on('command', function(line) {
		if (line.startsWith("model")) {
			model(line);
		}

		if (line.startsWith("clear")) {
			console.log("clearing...");
			scene.children.forEach(function(c) {
				if (c.name) {
					scene.remove(c);
				}
			});
		}
	});

	console.log("loaded, waiting for input");
});

