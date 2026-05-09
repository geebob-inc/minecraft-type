import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";
import { createWorld, removeBlock, placeBlock, getBlocks } from "./world.js";

let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

init();
animate();

/* =======================
   INIT
======================= */
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);
  document.body.addEventListener("click", () => controls.lock());
  scene.add(controls.getObject());

  camera.position.y = 2;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444));

  createWorld(scene);

  /* movement */
  const keys = {};
  document.addEventListener("keydown", e => keys[e.code] = true);
  document.addEventListener("keyup", e => keys[e.code] = false);

  function move() {
    const speed = 0.12;
    if (keys["KeyW"]) controls.moveForward(speed);
    if (keys["KeyS"]) controls.moveForward(-speed);
    if (keys["KeyA"]) controls.moveRight(-speed);
    if (keys["KeyD"]) controls.moveRight(speed);
  }

  function loopMove() {
    move();
    requestAnimationFrame(loopMove);
  }
  loopMove();

  /* mouse */
  window.addEventListener("click", () => {
    raycaster.setFromCamera(mouse, camera);
    removeBlock(raycaster, scene);
  });

  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    placeBlock(raycaster, scene);
  });
}

/* =======================
   RENDER LOOP
======================= */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
