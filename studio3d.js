// studio3d.js — the shared "photo studio" of the 3D robot pages: soft reflections of a lit room on every part
// (RoomEnvironment, kept light so the colours stay true), and soft shadows of the robot on the floor.
//   import { studio } from './studio3d.js';  …build the scene…  studio(THREE, renderer, scene);
// Call it once the robot is built (the meshes that exist then cast shadows; the floor, a flat plane, only receives them).
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// finishing pass: plain boxes become rounded boxes, round cylinders get chamfered edges, matte paint becomes satin.
// A geometry is only replaced when it is still in its original place (not moved or turned after its creation).
export function polish(THREE, root) {
  const cache = new Map(), same = (a, b) => a.min.distanceTo(b.min) < 1e-6 && a.max.distanceTo(b.max) < 1e-6;
  const bb = (g) => { g.computeBoundingBox(); return g.boundingBox; };
  const better = (g) => {
    if (cache.has(g.uuid)) return cache.get(g.uuid);
    let out = null, P = g.parameters || {};
    if (g.type === 'BoxGeometry') {
      const m = Math.min(P.width, P.height, P.depth), r = Math.min(m * 0.2, 0.03);
      if (m > 0.004 && r > 0.0015) { const n = new RoundedBoxGeometry(P.width, P.height, P.depth, 3, r); if (same(bb(n), bb(g))) out = n; else n.dispose(); }
    } else if (g.type === 'CylinderGeometry' && P.radialSegments >= 12 && !P.openEnded && P.thetaLength > 6.28) {
      const rt = P.radiusTop, rb = P.radiusBottom, h = P.height, c = Math.min(Math.max(rt, rb), h) * 0.14;
      if (c > 0.0008 && Math.min(rt, rb) > c) {
        const pts = [[0, -h / 2], [rb - c, -h / 2], [rb, -h / 2 + c], [rt, h / 2 - c], [rt - c, h / 2], [0, h / 2]].map(([x, y]) => new THREE.Vector2(x, y));
        const n = new THREE.LatheGeometry(pts, Math.max(P.radialSegments, 24));
        if (same(bb(n), bb(g))) out = n; else n.dispose();
      }
    }
    cache.set(g.uuid, out); return out;
  };
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.noPolish) return;
    if (o.geometry && o.geometry.type === 'PlaneGeometry') return;     // the floor stays matte
    const n = better(o.geometry); if (n) o.geometry = n;
    [].concat(o.material || []).forEach((m) => { if (m && m.isMeshStandardMaterial && m.roughness === 1 && m.metalness === 0) { m.roughness = 0.42; m.metalness = 0.12; } });
  });
}

export function studio(THREE, renderer, scene, opt = {}) {
  if (opt.polish !== false) polish(THREE, scene);
  // no filmic tone mapping: it would wash out the site's orange; the reflections are only a light touch (envMapIntensity)
  const env = opt.env === undefined ? 0.55 : opt.env;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pm.dispose();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const box = new THREE.Box3();
  scene.traverse((o) => {
    if (o.isMesh && !o.isInstancedMesh) {
      const flat = o.geometry && o.geometry.type === 'PlaneGeometry';
      // the floor keeps its own colour (no reflection), so the tile lines of the grid stay visible on it
      [].concat(o.material || []).forEach((m) => { if (m && 'envMapIntensity' in m) m.envMapIntensity = flat ? 0 : env; });
      o.receiveShadow = true;
      o.castShadow = !flat && !o.userData.noShadow;
      if (!flat) box.expandByObject(o);
    }
  });
  // the sun casts the shadows; its shadow camera covers the robot and a little around it
  const size = box.isEmpty() ? 2 : Math.max(1.2, box.getSize(new THREE.Vector3()).length());
  const c = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
  scene.traverse((o) => {
    if (!o.isDirectionalLight) return;
    o.castShadow = true;
    o.shadow.mapSize.set(2048, 2048);
    const cam = o.shadow.camera; cam.left = -size; cam.right = size; cam.top = size; cam.bottom = -size; cam.near = 0.1; cam.far = 30; cam.updateProjectionMatrix();
    o.shadow.bias = -0.0004; o.shadow.normalBias = 0.02; o.shadow.radius = 4;
    o.target.position.copy(c); if (!o.target.parent) scene.add(o.target);
  });
  // a soft dark patch under the robot, so that it sits on the floor even where the sun's shadow is faint
  if (opt.contact !== false && !box.isEmpty()) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const g = cv.getContext('2d'), grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.42)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const s = box.getSize(new THREE.Vector3()), r = Math.max(s.x, s.z) * 0.75 + 0.15;
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    patch.position.set(c.x, 0.002, c.z); patch.renderOrder = -1; patch.userData.raKeep = true; scene.add(patch);
  }
}
