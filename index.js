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

const emOrbitG = new THREE.Group(); //group for earth and moon for revolution around the sun
scene.add(emOrbitG); //add emOrbitG to the scene
const sunGeo = new THREE.SphereGeometry(2, 32, 32);
const sunMat = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/8k_sun.jpg"),
    emissive: 0xFFDD44
});
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(0, 0, 0)
scene.add(sunMesh);

// creating a earth group
const earth_g = new THREE.Group();
earth_g.rotation.z = THREE.MathUtils.degToRad(-23); //adding tilt to earth axis
emOrbitG.add(earth_g); //adding the group to the scene


// creating earth
const earth_geo = new THREE.SphereGeometry(1.0, 64, 64);
const earth_mat = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/earthmap1k.jpg"),
});
const earth_mesh = new THREE.Mesh(earth_geo, earth_mat);
earth_g.add(earth_mesh);

// adding the atmospheric glow.
const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(earth_geo, fresnelMat);
glowMesh.scale.setScalar(1.02);
earth_g.add(glowMesh);

earth_g.position.set(15, 1, 1);

const moonOrbitG = new THREE.Group();
earth_g.add(moonOrbitG);

// creating a moon
const moonGeo = new THREE.SphereGeometry(0.3, 32, 32);
const moonMat = new THREE.MeshPhongMaterial({
    map: loader.load("./textures/moonmap4k.jpg"),
    normalMap: loader.load("./textures/moonbump4k.jpg"),
});
const moonMesh = new THREE.Mesh(moonGeo, moonMat);
moonMesh.position.x = 3;

const moonDetails = createTextSprite("Moon\nRadius: 1,737 km\nOrbit: 27 days");
moonDetails.position.set(-0.5, 0.7, 0);
moonMesh.add(moonDetails);

moonOrbitG.add(moonMesh);

// const axesHelper = new THREE.AxesHelper(8);
// scene.add(axesHelper);

// adding directional light (color, intensity)
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(20, 2, 1);
scene.add(light); //adding light to scene

// const lightHelper = new THREE.DirectionalLightHelper(light, 2);
// scene.add(lightHelper);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5); //ambient light to reduce shadows
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

camera.position.set(20, 10, 10)

// initilizing orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

const clock = new THREE.Clock(); //init a clock
let prevTime = 0;

// emOrbitG.position.set(-10, 0, 0);
console.log(emOrbitG);

function createTextSprite(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // setting the canvas sixe and add styles

    canvas.width = 756;
    canvas.height = 528;

    context.fillStyle = "rgba(255, 255, 255, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = "50px Arial";
    context.fillStyle = "black";
    context.fillText(text, 10, 250); //positioning the text within the canvas
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture
    });
    const sprite = new THREE.Sprite(material);

    return sprite;

}


function animate() {
    window.requestAnimationFrame(animate); //get current frame

    //setting up animations independent of frame rate
    const currentTime = clock.getElapsedTime();
    const delta = currentTime - prevTime;
    prevTime = currentTime;

    // console.log(delta);

    earth_mesh.rotation.y += 0.001 * delta * 80;
    // lightMesh.rotation.y += 0.001 * delta * 80;
    // cloudMesh.rotation.y += 0.001;
    glowMesh.rotation.y += 0.001 * delta * 80;

    // animationg mooon
    // orbitGroup.rotation.y += 0.005;
    moonOrbitG.rotation.y += 0.005;
    emOrbitG.rotation.y += 0.003;

    controls.update();
    renderer.render(scene, camera)
}


animate();