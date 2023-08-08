import * as THREE from 'three';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { SSAOPass } from './jsm/postprocessing/SSAOPass.js';

let composer;

let scene, camera, renderer;
let torus;
let torusRings = [];
let torusMeshes = [];
let torusSegments = 46;
let torusSides = 6;

let mouseXRaw = 0
let mouseYRaw = 0;
let clientX = -100;
let clientY = -100;

function init()
{
	scene = new THREE.Scene();

	// Camera
	camera =  new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	camera.position.z = 20;
	camera.position.y = 9;
	camera.position.x = 0;

	camera.rotation.z = 0.4;
	camera.rotation.x = -0.6;

	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	// Lights
	let light = new THREE.PointLight(0xffffff, 0.6, 50);
	light.position.set(30, 0, 20);
	scene.add(light);

	let light2 = new THREE.PointLight(0xffffff, 0.8, 50);
	light2.position.set(-20, 10, 0);
	scene.add(light2);

	const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
	const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	const sphere = new THREE.Mesh(sphereGeometry, material);
	sphere.position.x = -20;
	sphere.position.y = 10;
	sphere.position.z = 0;
	scene.add( sphere );

	const sphere2 = new THREE.Mesh(sphereGeometry, material);
	sphere2.position.x = 30;
	sphere2.position.y = 0;
	sphere2.position.z = 20;
	scene.add( sphere2 );



	let ambient = new THREE.AmbientLight(0xeac9f0);
	scene.add( ambient );

	const geometry = new THREE.IcosahedronBufferGeometry(0.9, 0);

	torus = new THREE.Group();
	for (let i = 0; i < torusSegments; i++)
	{
		let ring = new THREE.Group();
		ring.position.x = Math.sin(Math.PI * 2 * i / torusSegments) * 10;
		ring.position.z = Math.cos(Math.PI * 2 * i / torusSegments) * 10;
		ring.rotation.y = (Math.PI * 2 * i / torusSegments) % (Math.PI * 2) - Math.PI / 2;

		for (let j = 0; j < torusSides; j++)
		{
			let colors = [0xeb6f00, 0xffffff, 0x8b43a6];
			let random = Math.floor(Math.random() * colors.length);

			let material = new THREE.MeshPhongMaterial({ color: colors[random], specular: colors[random] });
			let object = new THREE.Mesh(geometry, material);
			ring.add(object);

			object.position.x = Math.sin(Math.PI * 2 * j / torusSides) * 1.5;
			object.position.y = Math.cos(Math.PI * 2 * j / torusSides) * 1.5;

			object.rotation.x = Math.PI * Math.random();
			object.rotation.y = Math.PI * Math.random();
			object.rotation.z = Math.PI * Math.random();

			torusMeshes.push(object);
		}

		torus.add(ring);
		torusRings.push(ring);
	}

	scene.add(torus);

	scene.background = new THREE.Color(0xeac9f0);

	composer = new EffectComposer(renderer);

	const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
	ssaoPass.kernelRadius = 0.8;
	ssaoPass.minDistance = 0.0001;
	ssaoPass.maxDistance = 0.03;
	composer.addPass(ssaoPass);

	document.getElementById('canvas').appendChild(renderer.domElement);
}

function render()
{
	let time = Date.now() / 4000;

	torus.rotation.y = time;
	for (let i = 0; i < torusSegments; i++) {
		torusRings[i].rotation.z = (Math.PI * 4 * i / torusSegments + time * 2) % (Math.PI * 2) + Math.PI / 12 * i;
	}

	composer.render();
}

function animate()
{
	requestAnimationFrame(animate);
	render();
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('resize', onWindowResize, false);

	document.addEventListener("mousemove", e => {
		mouseXRaw = e.pageX;
		mouseYRaw = e.pageY - document.documentElement.scrollTop;

		clientX = e.clientX;
		clientY = e.clientY;
	})

	init();
	onWindowResize();
	animate();
})