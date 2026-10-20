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
    const mat = (color, rough, metal) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    const matLink = mat(look.link, 0.45, 0.2);
    const matJoint = mat(look.joint, 0.35, 0.35);
    const matCap = mat(look.cap, 0.5, 0.1);
    const matBase = mat('#4a4a4a', 0.6, 0.3);

    const root = new THREE.Group();                       // Y-up wrapper: this is what you add to the scene
    const zup = new THREE.Group();
    zup.rotation.x = -Math.PI / 2;                        // robot z -> scene y, robot y -> scene -z
    root.add(zup);
    const g0 = new THREE.Group();                         // frame {0}
    zup.add(g0);

    const ped = new THREE.CylinderGeometry(look.baseR, look.baseR * 1.1, 0.04, 40);
    ped.rotateX(Math.PI / 2);
    ped.translate(0, 0, 0.02);
    g0.add(new THREE.Mesh(ped, matBase));

    const frames = [g0], R = [], D = [], dBars = [], aBars = [];
    rows.forEach((row, i) => {
      const parent = frames[i];
      const Rg = new THREE.Group(); parent.add(Rg);       // turns by theta, around the z axis of the previous frame
      const Dg = new THREE.Group(); Rg.add(Dg);           // moves by d along z
      const Gi = new THREE.Group(); Dg.add(Gi);           // moves by a along x, turns by alpha around x: this is frame {i+1}

      const s = look.sizes[i];                            // joint housing: a cylinder along the joint axis
      const jg = new THREE.CylinderGeometry(s.r, s.r, s.l, 28);
      jg.rotateX(Math.PI / 2);
      Rg.add(new THREE.Mesh(jg, matJoint));
      const cap = new THREE.Mesh(new THREE.BoxGeometry(s.r * 0.5, s.r * 0.5, s.l * 1.08), matCap);   // shows the angle
      cap.position.x = s.r * 0.95;
      Rg.add(cap);

      const dg = new THREE.CylinderGeometry(look.lr, look.lr, 1, 20);   // link along z (length d)
      dg.rotateX(Math.PI / 2);
      dg.translate(0, 0, 0.5);
      const dBar = new THREE.Group(); dBar.add(new THREE.Mesh(dg, matLink)); parent.add(dBar);

      const ag = new THREE.CylinderGeometry(look.lr, look.lr, 1, 20);   // link along x (length a)
      ag.rotateZ(Math.PI / 2);
      ag.translate(0.5, 0, 0);
      const aBar = new THREE.Group(); aBar.add(new THREE.Mesh(ag, matLink)); Dg.add(aBar);

      R.push(Rg); D.push(Dg); dBars.push(dBar); aBars.push(aBar); frames.push(Gi);
    });

    function setPose(q) {
      rows.forEach((row, i) => {
        const d = cell(row.d, q), a = cell(row.a, q);
        R[i].rotation.z = cell(row.th, q) * D2R;
        D[i].position.z = d;
        frames[i + 1].position.x = a;
        frames[i + 1].rotation.x = cell(row.al, q) * D2R;
        dBars[i].scale.z = Math.abs(d) < 1e-5 ? 1e-5 : d;
        aBars[i].scale.x = Math.abs(a) < 1e-5 ? 1e-5 : a;
      });
      root.updateMatrixWorld(true);
    }
    return { root, frames, rot: R, setPose, materials: { link: matLink, joint: matJoint, cap: matCap } };
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