// dharm.js — builds a 3D serial arm straight from its DH table, plus a numerical inverse kinematics solver.
// It is a normal script (not a module), so it also works when you double-click a page.
// Because the 3D model is generated from the same table that is shown on the page,
// the picture and the equations can never disagree.
//
// It needs helpers.js first (for RB.stdChain). All joints are revolute, angles are in degrees.

const DHArm = (function () {
  const D2R = Math.PI / 180;
  const cell = (c, q) => (typeof c[1] === 'function' ? c[1](q) : c[1]);   // a DH cell is [ "symbol", number | f(q) ]

  // ---------------------------------------------------------------------------------------------
  // The 3D arm. rows = the standard DH table (th, d, a, al). look = colours and sizes.
  // Frame {0} is the base. The robot is built in its own Z-up frame, then turned to the Y-up scene.
  // ---------------------------------------------------------------------------------------------
  function build(THREE, rows, look) {
    // painted metal: satin links, glossier joint covers, dark machined caps and base
    const mat = (color, rough, metal) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    const matLink = mat(look.link, 0.38, 0.15);
    const matJoint = mat(look.joint, 0.3, 0.2);
    const matCap = mat(look.cap, 0.45, 0.5);
    const matBase = mat('#4a4a4a', 0.5, 0.45); matBase.userData.raKeep = true;   // the base keeps its dark grey in dark mode (nav.js, RA.darkParts)
    const matSteel = mat('#b9c0c8', 0.25, 0.85);

    const root = new THREE.Group();                       // Y-up wrapper: this is what you add to the scene
    const zup = new THREE.Group();
    zup.rotation.x = -Math.PI / 2;                        // robot z -> scene y, robot y -> scene -z
    root.add(zup);
    const g0 = new THREE.Group();                         // frame {0}
    zup.add(g0);

    // a solid of revolution around z, from a profile [radius, height] (LatheGeometry turns around y)
    const lathe = (pts, seg) => { const g = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg || 40); g.rotateX(Math.PI / 2); return g; };
    // the base: a stepped, chamfered plinth with six bolts
    const R = look.baseR;
    g0.add(new THREE.Mesh(lathe([[0, 0], [R * 1.18, 0], [R * 1.18, 0.012], [R * 1.1, 0.024], [R * 0.98, 0.03], [R * 0.95, 0.05], [R * 0.82, 0.058], [0, 0.058]], 56), matBase));
    for (let k = 0; k < 6; k++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.06, R * 0.06, 0.008, 12), matSteel);
      b.rotation.x = Math.PI / 2; b.position.set(R * 1.04 * Math.cos(k * Math.PI / 3), R * 1.04 * Math.sin(k * Math.PI / 3), 0.026); g0.add(b);
    }

    const frames = [g0], Rg_ = [], D = [], dBars = [], aBars = [];
    rows.forEach((row, i) => {
      const parent = frames[i];
      const Rg = new THREE.Group(); parent.add(Rg);       // turns by theta, around the z axis of the previous frame
      const Dg = new THREE.Group(); Rg.add(Dg);           // moves by d along z
      const Gi = new THREE.Group(); Dg.add(Gi);           // moves by a along x, turns by alpha around x: this is frame {i+1}

      // the joint housing: a drum with chamfered edges, a dark cap at each end and a thin band that shows the angle
      const s = look.sizes[i], r = s.r, l = s.l, c = Math.min(r, l) * 0.16;
      Rg.add(new THREE.Mesh(lathe([[0, -l / 2], [r - c, -l / 2], [r, -l / 2 + c], [r, l / 2 - c], [r - c, l / 2], [0, l / 2]]), matJoint));
      for (const e of [-1, 1]) {
        const cap = new THREE.Mesh(lathe([[0, 0], [r * 0.78, 0], [r * 0.72, e * 0.012], [0, e * 0.012]].map(([a, b]) => [a, b + e * l / 2])), matCap);
        Rg.add(cap);
      }
      const band = new THREE.Mesh(new THREE.BoxGeometry(r * 0.32, r * 0.16, l * 0.9), matCap);   // shows the angle
      band.position.x = r * 0.97;
      Rg.add(band);

      // the links: slightly tapered tubes, thicker at the joint they leave, with a collar at each end
      const lr = look.lr;
      const tube = (axis) => {
        const g = new THREE.Group();
        const tg = new THREE.CylinderGeometry(lr * 0.86, lr, 1, 28);    // y from -0.5 (thick) to 0.5 (thin)
        tg.translate(0, 0.5, 0);
        if (axis === 'z') tg.rotateX(Math.PI / 2); else tg.rotateZ(-Math.PI / 2);
        g.add(new THREE.Mesh(tg, matLink));
        return g;
      };
      const dBar = tube('z'); parent.add(dBar);
      const aBar = tube('x'); Dg.add(aBar);

      Rg_.push(Rg); D.push(Dg); dBars.push(dBar); aBars.push(aBar); frames.push(Gi);
    });
    // the tool flange: a small steel disc on the last frame
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(look.lr * 1.15, look.lr * 1.15, 0.012, 28), matSteel);
    fl.rotation.x = Math.PI / 2; fl.position.z = -0.006; frames[rows.length].add(fl);

    function setPose(q) {
      rows.forEach((row, i) => {
        const d = cell(row.d, q), a = cell(row.a, q);
        Rg_[i].rotation.z = cell(row.th, q) * D2R;
        D[i].position.z = d;
        frames[i + 1].position.x = a;
        frames[i + 1].rotation.x = cell(row.al, q) * D2R;
        dBars[i].scale.z = Math.abs(d) < 1e-5 ? 1e-5 : d;
        aBars[i].scale.x = Math.abs(a) < 1e-5 ? 1e-5 : a;
      });
      root.updateMatrixWorld(true);
    }
    return { root, frames, rot: Rg_, setPose, materials: { link: matLink, joint: matJoint, cap: matCap } };
  }

  // ---------------------------------------------------------------------------------------------
  // Numerical inverse kinematics: damped least squares (Levenberg-Marquardt) on the Jacobian.
  // target = { p:[x,y,z], z:[..] (where the tool z axis must point), x:[..] (where the tool x axis must point) }
  // z and x are optional. Everything is expressed in the base frame {0}.
  // ---------------------------------------------------------------------------------------------
  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      const piv = M[c][c] || 1e-12;
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / piv;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let s = M[r][n];
      for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
      x[r] = s / (M[r][r] || 1e-12);
    }
    return x;
  }

  function solveIK(rows, q0, target, opt = {}) {
    const w = opt.wOri === undefined ? 0.3 : opt.wOri;
    const iters = opt.iters || 500;
    const lim = opt.limits;                               // [[min, max], ...] in degrees
    const toDeg = (s) => s.map((v) => v / D2R);
    const feature = (s) => {
      const T = RB.stdChain(rows, toDeg(s));
      const L = T[T.length - 1];
      const f = [L[0][3], L[1][3], L[2][3]];
      if (target.z) f.push(w * L[0][2], w * L[1][2], w * L[2][2]);
      if (target.x) f.push(w * L[0][0], w * L[1][0], w * L[2][0]);
      return f;
    };
    const goal = [...target.p];
    if (target.z) goal.push(...target.z.map((v) => w * v));
    if (target.x) goal.push(...target.x.map((v) => w * v));
    const m = goal.length, n = q0.length;
    let s = q0.map((v) => v * D2R);
    let err = new Array(m).fill(1);
    for (let it = 0; it < iters; it++) {
      const f0 = feature(s);
      err = goal.map((g, i) => g - f0[i]);
      const pe = Math.hypot(err[0], err[1], err[2]);
      const oe = Math.hypot(...err.slice(3));
      if (pe < 1e-5 && oe < 1e-4) break;
      const J = Array.from({ length: m }, () => new Array(n).fill(0));
      const h = 1e-6;
      for (let j = 0; j < n; j++) {
        const sp = s.slice(); sp[j] += h;
        const f1 = feature(sp);
        for (let i = 0; i < m; i++) J[i][j] = (f1[i] - f0[i]) / h;
      }
      const JJt = Array.from({ length: m }, (_, i) =>
        Array.from({ length: m }, (_, k) => J[i].reduce((acc, v, j) => acc + v * J[k][j], 0) + (i === k ? 0.0004 : 0)));
      const y = solveLinear(JJt, err);
      for (let j = 0; j < n; j++) {
        let dq = 0;
        for (let i = 0; i < m; i++) dq += J[i][j] * y[i];
        s[j] += Math.max(-0.15, Math.min(0.15, dq));
        if (lim) s[j] = Math.max(lim[j][0] * D2R, Math.min(lim[j][1] * D2R, s[j]));
      }
    }
    const f = feature(s);
    return { q: toDeg(s), posErr: Math.hypot(goal[0] - f[0], goal[1] - f[1], goal[2] - f[2]),
             oriErr: Math.hypot(...goal.slice(3).map((g, i) => g - f[3 + i])) };
  }

  return { build, solveIK };
})();
window.DHArm = DHArm;