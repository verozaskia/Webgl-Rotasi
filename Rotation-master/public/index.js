import * as THREE from "/node_modules/three/build/three.module.js";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";

//global declaration
let scene;
let camera;
let renderer;
const canvas = document.getElementsByTagName("canvas")[0];
scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

//camera
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 4;
camera.position.x = 0;
scene.add(camera);

//default renderer
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setClearColor(0x000000, 0.0);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//bloom renderer
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 2; //intensity of glow
bloomPass.radius = 0;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//sun object
const color = new THREE.Color("#FFA500");
const geometry = new THREE.IcosahedronGeometry(3, 15);
const material = new THREE.MeshBasicMaterial({ color: color });
const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(-50, 20, -60);
sphere.layers.set(1);
scene.add(sphere);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64);

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture("texture/galaxy1.png"),
  side: THREE.BackSide,
  transparent: true,
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
starMesh.layers.set(1);
scene.add(starMesh);

//earth geometry
const earthgeometry = new THREE.SphereGeometry(0.98, 32, 32);

//earth material
const earthMaterial = new THREE.MeshPhongMaterial({
  roughness: 1,
  metalness: 0,
  map: THREE.ImageUtils.loadTexture("texture/earthmap1.jpg"),
  bumpMap: THREE.ImageUtils.loadTexture("texture/bump.jpg"),
  bumpScale: 0.3,
});

//earthMesh
const earthMesh = new THREE.Mesh(earthgeometry, earthMaterial);
earthMesh.receiveShadow = true;
earthMesh.castShadow = true;
earthMesh.layers.set(0);
scene.add(earthMesh);


//cloud geometry
const cloudgeometry = new THREE.SphereGeometry(1, 32, 32);

//cloud material
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture("texture/earthCloud.png"),
  transparent: true,
});

//cloudMesh
const cloud = new THREE.Mesh(cloudgeometry, cloudMaterial);
earthMesh.layers.set(0);
scene.add(cloud);

//moon geometry
const moongeometry = new THREE.SphereGeometry(0.2, 32, 32);

//moon material
const moonMaterial = new THREE.MeshPhongMaterial({
  roughness: 5,
  metalness: 0,
  map: THREE.ImageUtils.loadTexture("texture/moonmap4k.jpg"),
  bumpMap: THREE.ImageUtils.loadTexture("texture/moonbump4k.jpg"),
  bumpScale: 0.02,
});

//moonMesh
const moonMesh = new THREE.Mesh(moongeometry, moonMaterial);
moonMesh.receiveShadow = true;
moonMesh.castShadow = true;
moonMesh.position.x = 2;
moonMesh.layers.set(0);
scene.add(moonMesh);

var moonPivot = new THREE.Object3D();
earthMesh.add(moonPivot);
moonPivot.add(moonMesh);

var cameraPivot = new THREE.Object3D();
earthMesh.add(cameraPivot);
cameraPivot.add(camera);

//ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientlight);

//point Light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.castShadow = true;
pointLight.shadowCameraVisible = true;
pointLight.shadowBias = 0.00001;
pointLight.shadowDarkness = 0.2;
pointLight.shadowMapWidth = 2048;
pointLight.shadowMapHeight = 2048;
pointLight.position.set(-50, 20, -60);
scene.add(pointLight);

//resize listner
window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

//animation loop
const animate = () => {
  requestAnimationFrame(animate);
  cloud.rotation.y-=0.0002;
  moonPivot.rotation.y -= 0.005;
  moonPivot.rotation.x = 0.5;
  cameraPivot.rotation.y += 0.001;
  starMesh.rotation.y += 0.0002;
  camera.layers.set(1);
  bloomComposer.render();
  renderer.clearDepth();
  camera.layers.set(0);
  renderer.render(scene, camera);
};

// Event listener untuk klik objek bumi
earthMesh.addEventListener("click", () => {
  // Tindakan yang ingin Anda lakukan ketika objek bumi diklik
  console.log("Objek bumi diklik");
});

// Event listener untuk mousedown (tahan mouse)
document.addEventListener("mousedown", (event) => {
  if (event.target === canvas) {
    canvas.requestPointerLock();
  }
});

// Event listener saat pointer dikunci
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) {
    // Pointer dikunci, aktifkan kontrol mouse
    isRotating = true;
  } else {
    // Pointer dilepas, nonaktifkan kontrol mouse
    isRotating = false;
  }
});

// Event listener untuk mousemove
document.addEventListener("mousemove", (event) => {
  if (isRotating) {
    // Rotasi kamera berdasarkan pergerakan mouse
    cameraPivot.rotation.y += event.movementX * 0.01;
    cameraPivot.rotation.x += event.movementY * 0.01;
  }
});

// Event listener untuk keydown (tombol keyboard ditekan)
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      // Geser kamera ke depan
      cameraPivot.position.z -= 0.1;
      break;
    case "s":
      // Geser kamera ke belakang
      cameraPivot.position.z += 0.1;
      break;
    case "a":
      // Geser kamera ke kiri
      cameraPivot.position.x -= 0.1;
      break;
    case "d":
      // Geser kamera ke kanan
      cameraPivot.position.x += 0.1;
      break;
    case "q":
      // Putar kamera ke kiri
      cameraPivot.rotation.y += 0.1;
      break;
    case "e":
      // Putar kamera ke kanan
      cameraPivot.rotation.y -= 0.1;
      break;
    case "+":
      // Zoom in (geser kamera lebih dekat)
      cameraPivot.position.y -= 0.1;
      break;
    case "-":
      // Zoom out (geser kamera lebih jauh)
      cameraPivot.position.y += 0.1;
      break;
    // Tambahkan kontrol keyboard lainnya sesuai kebutuhan
  }
});

animate();