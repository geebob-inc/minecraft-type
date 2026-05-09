import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { createNoise2D } from "https://cdn.skypack.dev/simplex-noise";
import { Mob } from "./mobs.js";

const noise = createNoise2D();

/* =======================
   MATERIALS (FORCED VISIBILITY FIX)
======================= */
const geo = new THREE.BoxGeometry(1, 1, 1);

const materials = {
  dirt: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7a4b2a, roughness: 1 })
};

export class World {
  constructor(scene) {
    this.scene = scene;

    this.chunkSize = 16;
    this.renderDistance = 2;

    this.chunks = new Map();
    this.mobs = [];

    this.player = {
      inventory: {
        dirt: 64,
        stone: 64,
        wood: 64
      },
      selected: "dirt",
      health: 100
    };
  }

  /* =======================
     INIT WORLD
======================= */
  init() {
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        this.loadChunk(x, z);
      }
    }
  }

  /* =======================
     TERRAIN
======================= */
  height(x, z) {
    return Math.floor(noise(x * 0.08, z * 0.08) * 6 + 6);
  }

  /* =======================
     CHUNKS (FIXED VISIBILITY)
======================= */
  loadChunk(cx, cz) {
    const key = `${cx},${cz}`;
    if (this.chunks.has(key)) return;

    const group = new THREE.Group();
    const blocks = [];

    for (let x = 0; x < this.chunkSize; x++) {
      for (let z = 0; z < this.chunkSize; z++) {

        const wx = cx * this.chunkSize + x;
        const wz = cz * this.chunkSize + z;

        const h = this.height(wx, wz);

        for (let y = 0; y < h; y++) {
          const block = new THREE.Mesh(
            geo,
            materials.dirt
          );

          block.position.set(wx, y, wz);

          group.add(block);
          blocks.push(block);
        }
      }
    }

    this.scene.add(group);

    this.chunks.set(key, { group, blocks });
  }

  /* =======================
     BREAK BLOCK
======================= */
  breakBlock(raycaster) {
    for (let chunk of this.chunks.values()) {
      const hits = raycaster.intersectObjects(chunk.blocks);

      if (hits.length) {
        const obj = hits[0].object;

        chunk.group.remove(obj);
        chunk.blocks = chunk.blocks.filter(b => b !== obj);
        break;
      }
    }
  }

  /* =======================
     PLACE BLOCK
======================= */
  placeBlock(raycaster) {
    for (let chunk of this.chunks.values()) {
      const hits = raycaster.intersectObjects(chunk.blocks);

      if (hits.length) {
        const hit = hits[0];

        const type = this.player.selected;

        if (this.player.inventory[type] <= 0) return;

        const block = new THREE.Mesh(geo, materials[type]);

        block.position.copy(hit.object.position).add(hit.face.normal);

        chunk.group.add(block);
        chunk.blocks.push(block);

        this.player.inventory[type]--;
        break;
      }
    }
  }

  /* =======================
     MOB SPAWN
======================= */
  spawnMob(x, y, z) {
    const mob = new Mob(this.scene, x, y, z);
    this.mobs.push(mob);
  }

  getGround(x, z) {
    for (let chunk of this.chunks.values()) {
      for (let b of chunk.blocks) {
        if (
          Math.floor(b.position.x) === x &&
          Math.floor(b.position.z) === z
        ) {
          return b.position.y;
        }
      }
    }
    return null;
  }

  /* =======================
     UPDATE
======================= */
  update(playerPos) {
    const px = Math.floor(playerPos.x / this.chunkSize);
    const pz = Math.floor(playerPos.z / this.chunkSize);

    for (let x = px - this.renderDistance; x <= px + this.renderDistance; x++) {
      for (let z = pz - this.renderDistance; z <= pz + this.renderDistance; z++) {
        this.loadChunk(x, z);
      }
    }

    for (let mob of this.mobs) {
      mob.update({ position: playerPos, health: this.player.health });
    }
  }
}
