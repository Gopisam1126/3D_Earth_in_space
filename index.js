// Imports
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import getStarfield from "./src/starField.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

// defining the aspect retio
const w = window.innerWidth;
const h = window.innerHeight;
const aspect = w / h;

// initializing the scene
const scene = new THREE.Scene();

// initilizing the WebGLRenderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'), //defining the canvas for rendering the 3D object
    antialias: true, //reduce edges
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);

// initilizing the TextureLoader
const loader = new THREE.TextureLoader();

// creating a new group
const earth_g = new THREE.Group();
earth_g.rotation.z = THREE.MathUtils.degToRad(-23); //adding tilt to earth axis
scene.add(earth_g); //adding the group to the scene


// creating earth
const earth_geo = new THREE.SphereGeometry(1.0, 64, 64);
const earth_mat = new THREE.MeshPhongMaterial({
    map: loader.load("./textures/earthmap1k.jpg"),
});
const earth_mesh = new THREE.Mesh(earth_geo, earth_mat);
earth_g.add(earth_mesh);

// adding night light
const lightMat = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.5,
    map: loader.load("./textures/earthlights1k.jpg"),
    blending: THREE.AdditiveBlending,
});
const lightMesh = new THREE.Mesh(earth_geo, lightMat);
earth_g.add(lightMesh);

// const cloudMat = new THREE.MeshPhongMaterial({
//     transparent: true,
//     opacity: 0.5,
//     map: loader.load("./textures/earthcloudmaptrans.jpg"),
// });
// const cloudMesh = new THREE.Mesh(earth_geo, cloudMat);
// cloudMesh.scale.setScalar(1.003)
// earth_g.add(cloudMesh);


// adding the atmospheric glow.
const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(earth_geo, fresnelMat);
glowMesh.scale.setScalar(1.01);
earth_g.add(glowMesh);


// creating a moon
const moonGeo = new THREE.SphereGeometry(0.3, 32, 32);
const moonMat = new THREE.MeshPhongMaterial({
    map: loader.load("./textures/moonmap4k.jpg"),
    normalMap: loader.load("./textures/moonbump4k.jpg"),
    // blending: THREE.AdditiveBlending
});
const moonMesh = new THREE.Mesh(moonGeo, moonMat);
moonMesh.position.x = 3;
scene.add(moonMesh);

// creating a group for revolution of the moon around the earth
const orbitGroup = new THREE.Group();
orbitGroup.add(moonMesh);
scene.add(orbitGroup);

// adding directional light (color, intensity)
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(2, 0.5, 1);
scene.add(light); //adding light to scene

const ambientLight = new THREE.AmbientLight(0x404040, 0.5); //ambient light to reduce shadows
scene.add(ambientLight);


// adding stars in the background
const stars = getStarfield({numStars: 2000});
scene.add(stars);


// initilizing a camera to the scene
const camera = new THREE.PerspectiveCamera(
    75, //fov
    aspect, //aspect ratio
    0.1, //near
    100 //far
);

camera.position.z = 5;
camera.position.y = 2;

// initilizing orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// window.addEventListener('resize', () => {
//     camera.aspect = aspectRatio;
//     camera.updateProjectionMatrix();
//     renderer.setSize(w, h);
// });

const clock = new THREE.Clock(); //init a clock
let prevTime = 0;

function animate() {
    window.requestAnimationFrame(animate); //get current frame

    //setting up animations independent of frame rate
    const currentTime = clock.getElapsedTime();
    const delta = currentTime - prevTime;
    prevTime = currentTime;

    // console.log(delta);

    earth_mesh.rotation.y += 0.001 * delta * 80;
    lightMesh.rotation.y += 0.001 * delta * 80;
    // cloudMesh.rotation.y += 0.001;
    glowMesh.rotation.y += 0.001 * delta * 80;

    // animationg mooon
    orbitGroup.rotation.y += 0.01

    controls.update();
    renderer.render(scene, camera)
}


animate();