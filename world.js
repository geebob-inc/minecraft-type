import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise";

const CHUNK_SIZE = 20;
const blocks = [];

const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0x55aa55 });

const noise = createNoise2D();

/* =======================
   HEIGHT FUNCTION
======================= */
function height(x, z) {
  return Math.floor(noise(x * 0.1, z * 0.1) * 6 + 6);
}

/* =======================
   CREATE WORLD
======================= */
export function createWorld(scene) {
  for (let x = -CHUNK_SIZE; x < CHUNK_SIZE; x++) {
    for (let z = -CHUNK_SIZE; z < CHUNK_SIZE; z++) {
      const h = height(x, z);

      for (let y = 0; y < h; y++) {
        const block = new THREE.Mesh(geo, mat);
        block.position.set(x, y, z);

        scene.add(block);
        blocks.push(block);
      }
    }
  }
}

/* =======================
   REMOVE BLOCK
======================= */
export function removeBlock(raycaster, scene) {
  const hits = raycaster.intersectObjects(blocks);

  if (hits.length > 0) {
    const obj = hits[0].object;

    scene.remove(obj);

    const i = blocks.indexOf(obj);
    if (i !== -1) blocks.splice(i, 1);
  }
}

/* =======================
   PLACE BLOCK
======================= */
export function placeBlock(raycaster, scene) {
  const hits = raycaster.intersectObjects(blocks);

  if (hits.length > 0) {
    const hit = hits[0];

    const block = new THREE.Mesh(geo, mat);

    block.position.copy(hit.object.position).add(hit.face.normal);

    scene.add(block);
    blocks.push(block);
  }
}

/* =======================
   ACCESSOR (optional)
======================= */
export function getBlocks() {
  return blocks;
}
