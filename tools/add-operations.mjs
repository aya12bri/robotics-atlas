// add-operations.mjs — adds the table "Industrial operations" to every hand-written robot page,
// with, for each common factory operation, how well THIS robot suits it, and its French text. Idempotent.
//   PLAYWRIGHT=... CHROME=... node tools/add-operations.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright-core');

// [name EN, name FR, explanation EN, explanation FR]
const OPS = {
  pal: ['Palletizing / depalletizing', 'Palettisation / dépalettisation', 'Stacking parcels on a pallet following a plan (or taking them off).', 'Empiler des colis sur une palette selon un plan (ou les en retirer).'],
  enc: ['Case packing', 'Encaissage', 'Putting products (bottles, trays, vials) into a carton.', 'Mettre des produits (bouteilles, barquettes, flacons) dans un carton.'],
  far: ['Bundling (shrink wrapping)', 'Fardelage', 'Grouping products and wrapping them in plastic film.', 'Regrouper des produits et les entourer d\'un film plastique.'],
  eti: ['Labelling / laser marking', 'Étiquetage / marquage laser', 'Sticking on a label or engraving information (batch, date, code) with a laser.', 'Coller une étiquette ou graver une information (lot, date, code) au laser.'],
  ser: ['Serialisation', 'Sérialisation', 'Giving each box a unique number (DataMatrix code) for traceability, especially in pharmacy.', 'Donner à chaque boîte un numéro unique (code DataMatrix) pour la traçabilité, surtout en pharmacie.'],
  vis: ['Quality control / vision', 'Contrôle qualité / vision', 'A camera checks the product instead of the human eye (presence, readability of a code, defect).', 'Une caméra vérifie le produit à la place de l\'œil humain (présence, lisibilité d\'un code, défaut).'],
  bin: ['Bin picking', 'Dévracage (bin picking)', 'A vision-guided robot picks parts lying loose in a bin.', 'Un robot guidé par vision prend des pièces en vrac dans un bac.'],
  deg: ['Separating joined products', 'Dégrappage', 'Separating products that are joined together.', 'Séparer des produits liés entre eux.'],
  con: ['Conveying', 'Convoyage', 'Moving products from one station to the next on belts or rollers.', 'Transporter les produits d\'un poste à l\'autre sur des tapis ou rouleaux.'],
  amr: ['Mobility with an AMR', 'Mobilité via AMR', 'An autonomous mobile robot carries loads around the factory with no rail and no guide on the floor.', 'Un robot mobile autonome transporte des charges dans l\'usine sans rail ni guidage au sol.'],
  ass: ['Screwing / unscrewing, assembly, filling', 'Vissage / dévissage, assemblage, remplissage', 'Repetitive gestures made automatic, often to relieve the operators.', 'Gestes répétitifs automatisés, souvent pour soulager les opérateurs.']
};
const FIT = { 3: ['Main use', 'Usage principal'], 2: ['Possible', 'Possible'], 1: ['Rarely', 'Rarement'] };
// how well each robot suits each operation: 3 main use, 2 possible, 1 rarely
const PAGES = {
  arm:         { pal: 2, enc: 2, far: 1, eti: 1, ser: 1, vis: 2, bin: 1, deg: 1, con: 1, amr: 1, ass: 1 },
  articulated: { pal: 3, enc: 3, far: 2, eti: 2, ser: 1, vis: 2, bin: 3, deg: 2, con: 1, amr: 2, ass: 3 },
  cobot:       { pal: 3, enc: 2, far: 1, eti: 2, ser: 1, vis: 2, bin: 2, deg: 2, con: 1, amr: 2, ass: 3 },
  delta:       { pal: 1, enc: 3, far: 2, eti: 1, ser: 1, vis: 3, bin: 1, deg: 3, con: 2, amr: 1, ass: 2 },
  gantry:      { pal: 3, enc: 3, far: 1, eti: 2, ser: 1, vis: 2, bin: 2, deg: 1, con: 2, amr: 1, ass: 3 },
  scara:       { pal: 1, enc: 2, far: 1, eti: 2, ser: 1, vis: 2, bin: 2, deg: 2, con: 1, amr: 1, ass: 3 },
  mobile:      { pal: 1, enc: 1, far: 1, eti: 1, ser: 1, vis: 1, bin: 1, deg: 1, con: 3, amr: 3, ass: 1 }
};
const H2 = ['Industrial operations', 'Opérations industrielles'];
const INTRO = ['The most common operations in a factory, explained simply, and how well this robot suits each one. Operations done mostly by dedicated machines (bundling, serialisation, conveying) are often only fed or unloaded by a robot.',
  'Les opérations les plus courantes en usine, expliquées simplement, et à quel point ce robot convient pour chacune. Les opérations faites surtout par des machines dédiées (fardelage, sérialisation, convoyage) sont souvent seulement alimentées ou déchargées par un robot.'];
const IN_H2 = ['Inside the robot: the real components', 'À l\'intérieur du robot : les vrais composants'];
const IN_P = ['Dive into one joint, step by step: the camera goes in, the cover comes off, every part comes out with its real name and role, then the joint runs so you can see how it works.', 'Plongez dans une articulation, étape par étape : la caméra entre, le capot s\'ouvre, chaque pièce sort avec son vrai nom et son rôle, puis l\'articulation tourne pour montrer comment elle marche.'];
const DEMO_H2 = ['Operations demo', 'Démo des opérations'];
const DEMO_P = ['Choose an operation: the robot performs it in a small 3D cell, step by step. Turn the view with the mouse or a finger, and use Pause to look closely.', 'Choisissez une opération : le robot la réalise dans une petite cellule 3D, étape par étape. Tournez la vue à la souris ou au doigt, et utilisez Pause pour regarder de près.'];
const TH = [['Operation', 'Opération'], ['Simple explanation', 'Explication simple'], ['For this robot', 'Pour ce robot']];

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await (await browser.newContext()).newPage();
for (const [file, fit] of Object.entries(PAGES)) {
  const f = path.join(root, file + '.html'); let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/\n    <!-- BEGIN operations -->[\s\S]*?<!-- END operations -->\n/, '\n');
  const keys = Object.keys(OPS).sort((a, b) => fit[b] - fit[a]);              // main uses first, keeps the list order otherwise
  const pairs = [IN_H2, IN_P, H2, INTRO, DEMO_H2, DEMO_P, ...TH];
  const rows = keys.map((k) => {
    const [n, nf, e, ef] = OPS[k], v = fit[k], badge = `<span class="opfit f${v}">${FIT[v][0]}</span>`;
    pairs.push([n, nf], [e, ef], [badge, `<span class="opfit f${v}">${FIT[v][1]}</span>`], [FIT[v][0], FIT[v][1]]);
    return `          <tr><td class="left"><strong>${n}</strong></td><td class="left">${e}</td><td>${badge}</td></tr>`;
  });
  pairs.push(...keys.map((k) => [`<strong>${OPS[k][0]}</strong>`, `<strong>${OPS[k][1]}</strong>`]));
  const block = `    <!-- BEGIN operations -->
    <h2>${IN_H2[0]}</h2>
    <p>${IN_P[0]}</p>
    <div class="insdemo" data-robot="${file}"></div>
    <script type="module" src="inside-demo.js"></script>
    <h2>${H2[0]}</h2>
    <p>${INTRO[0]}</p>
    <div class="cmp-wrap ops-wrap">
      <table class="dh ops">
        <thead><tr><th class="left">${TH[0][0]}</th><th class="left">${TH[1][0]}</th><th>${TH[2][0]}</th></tr></thead>
        <tbody>
${rows.join('\n')}
        </tbody>
      </table>
    </div>
    <h2>${DEMO_H2[0]}</h2>
    <p>${DEMO_P[0]}</p>
    <div class="opsdemo" data-robot="${file}"></div>
    <script type="module" src="ops-demo.js"></script>
    <!-- END operations -->
`;
  // after the last "robot" box of the page
  const i = h.lastIndexOf('<div class="robot">'); if (i < 0) throw new Error('no robot box in ' + file);
  const j = h.indexOf('\n    </div>\n', i); if (j < 0) throw new Error('robot box not closed in ' + file);
  const at = j + '\n    </div>\n'.length;
  h = h.slice(0, at) + '\n' + block + h.slice(at);
  fs.writeFileSync(f, h);

  await page.goto(pathToFileURL(f).href); await page.waitForFunction(() => window.RA && RA.hash);
  const hs = await page.evaluate((en) => en.map((s) => { const d = document.createElement('div'); d.innerHTML = s; return RA.hash(RA.norm(d.innerHTML)); }), pairs.map((p) => p[0]));
  const dict = {}; pairs.forEach((p, n) => { dict[hs[n]] = p[1]; });
  const fr = path.join(root, 'i18n', `fr-${file}.js`);
  const s = fs.readFileSync(fr, 'utf8').replace(/\n?\/\/ BEGIN operations[\s\S]*?\/\/ END operations\n?/, '\n');
  fs.writeFileSync(fr, s.trimEnd() + `\n// BEGIN operations (generated by tools/add-operations.mjs)\nRA.add(${JSON.stringify(dict, null, 1)});\n// END operations\n`);
  console.log(file, 'ok');
}
await browser.close();
