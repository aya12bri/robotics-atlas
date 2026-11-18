// tr-fig.mjs — the static figures of the course "Mechanical transmissions and grippers".
import { PRIM } from './tel-fig.mjs';
const { DEFS, V, box, arr, lab } = PRIM;

// the actuation chain
export const chain = () => ({ vb: '0 0 700 200', svg: DEFS +
  box(5, 60, 120, 64, V.y, ['Power supply', 'Alimentation'], ['electric, hydraulic, air', 'électrique, hydraulique, air']) + arr(125, 92, 143, 92) +
  box(145, 60, 125, 64, V.p, ['Power amplifier', 'Amplificateur'], ['drive (variateur)', 'variateur']) + arr(270, 92, 288, 92) +
  box(290, 60, 120, 64, V.b, ['Servomotor', 'Servomoteur'], ['fast, low torque', 'rapide, faible couple']) + arr(410, 92, 428, 92) +
  box(430, 60, 125, 64, V.o, ['Transmission', 'Transmission'], ['reducer, belt, screw', 'réducteur, courroie, vis']) + arr(555, 92, 573, 92) +
  box(575, 60, 120, 64, V.g, ['Joint, tool', 'Articulation, outil'], ['slow, high torque', 'lente, fort couple']) +
  arr(205, 30, 205, 58, V.r) + lab(205, 22, ['control signal (low power)', 'signal de commande (faible puissance)'], { sm: 1, c: V.r }) +
  lab(350, 160, ['P = T ω is (almost) kept: what the speed loses, the torque gains', 'P = T ω est (presque) conservée : ce que la vitesse perd, le couple le gagne'], { sm: 1, c: V.axis }) + lab(350, 182, ['ω ÷ N  ⇒  T × N × η', 'ω ÷ N  ⇒  T × N × η'], { b: 1 }) });

// belts, chains, friction wheels: direction rules
export const drives = () => {
  const pul = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${V.box};stroke:${c};stroke-width:3"/><circle cx="${x}" cy="${y}" r="4" style="fill:${c}"/>`;
  const cw = (x, y, r, c, d) => `<path d="M${x + r * 0.7},${y - r * 0.7} A${r * 1.15},${r * 1.15} 0 0 ${d > 0 ? 1 : 0} ${x + r * 0.7},${y + r * 0.7}" style="fill:none;stroke:${c};stroke-width:2" marker-end="url(#${c === V.b ? 'tB' : 'tG'})"/>`;
  return { vb: '0 0 700 230', svg: DEFS +
    pul(60, 90, 30, V.b) + pul(170, 90, 45, V.g) + `<line x1="60" y1="60" x2="170" y2="45" style="stroke:${V.o};stroke-width:3"/><line x1="60" y1="120" x2="170" y2="135" style="stroke:${V.o};stroke-width:3"/>` + lab(115, 175, ['open belt: same direction', 'courroie ouverte : même sens'], { sm: 1 }) +
    pul(290, 90, 30, V.b) + pul(400, 90, 45, V.g) + `<line x1="290" y1="60" x2="400" y2="135" style="stroke:${V.o};stroke-width:3"/><line x1="290" y1="120" x2="400" y2="45" style="stroke:${V.o};stroke-width:3"/>` + lab(345, 175, ['crossed belt: opposite direction', 'courroie croisée : sens opposé'], { sm: 1 }) +
    pul(520, 90, 30, V.b) + pul(595, 90, 45, V.g) + lab(560, 175, ['friction wheels: each contact reverses', 'roues de friction : chaque contact inverse'], { sm: 1 }) +
    lab(350, 215, ['i = d₂ / d₁ = n₁ / n₂ for all: the rim speeds are equal (if nothing slips)', 'i = d₂ / d₁ = n₁ / n₂ pour tous : les vitesses au bord sont égales (si rien ne glisse)'], { sm: 1, c: V.axis }) };
};

// gear terminology
export const gearterm = () => {
  const cx = 220, cy = 150, rp = 100, ra = 112, rr = 85;
  let teeth = ''; for (let k = -3; k <= 3; k++) { const a = -Math.PI / 2 + k * 0.2, w = 0.05; const P = (ang, r) => [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]; const p = [P(a - 0.09, rr), P(a - w, ra), P(a + w, ra), P(a + 0.09, rr)]; teeth += `<polyline points="${p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}" style="fill:${V.b};fill-opacity:0.35;stroke:${V.b};stroke-width:2"/>`; }
  return { vb: '0 0 640 300', svg: DEFS + teeth +
    `<path d="M${cx - rp * 0.9},${cy - rp * 0.44} A${rp},${rp} 0 0 1 ${cx + rp * 0.9},${cy - rp * 0.44}" style="fill:none;stroke:${V.y};stroke-width:2;stroke-dasharray:6 4"/>` +
    `<path d="M${cx - ra * 0.86},${cy - ra * 0.5} A${ra},${ra} 0 0 1 ${cx + ra * 0.86},${cy - ra * 0.5}" style="fill:none;stroke:${V.axis};stroke-width:1"/>` +
    `<path d="M${cx - rr * 0.9},${cy - rr * 0.44} A${rr},${rr} 0 0 1 ${cx + rr * 0.9},${cy - rr * 0.44}" style="fill:none;stroke:${V.axis};stroke-width:1"/>` +
    lab(370, 40, ['addendum circle (tips): r + m', 'cercle de tête (sommets) : r + m'], { a: 'start', sm: 1 }) + lab(370, 62, ['pitch circle: d = m Z (dashed)', 'cercle primitif : d = m Z (tirets)'], { a: 'start', sm: 1, c: V.y }) + lab(370, 84, ['root circle: r − 1.25 m', 'cercle de pied : r − 1,25 m'], { a: 'start', sm: 1 }) +
    lab(370, 120, ['module m = circular pitch / π (mm)', 'module m = pas circulaire / π (mm)'], { a: 'start', sm: 1 }) + lab(370, 142, ['two gears mesh only with the same m', 'deux roues n\'engrènent qu\'avec le même m'], { a: 'start', sm: 1 }) +
    lab(370, 164, ['and the same pressure angle (often 20°)', 'et le même angle de pression (souvent 20°)'], { a: 'start', sm: 1 }) + lab(370, 196, ['centre distance a = m (Z₁ + Z₂) / 2', 'entraxe a = m (Z₁ + Z₂) / 2'], { a: 'start', b: 1 }) +
    lab(320, 285, ['GR = N_B / N_A = ω_A / ω_B  ·  T_B = T_A × GR × η  ·  each external mesh reverses the direction', 'GR = N_B / N_A = ω_A / ω_B  ·  T_B = T_A × GR × η  ·  chaque engrènement extérieur inverse le sens'], { sm: 1, c: V.axis }) };
};

// a compound gear train
export const train = () => {
  const g = (x, y, r, c, t) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${c};fill-opacity:0.2;stroke:${c};stroke-width:2.5"/>` + lab(x, y + 5, t, { sm: 1, b: 1 });
  return { vb: '0 0 640 220', svg: DEFS + g(70, 110, 30, V.b, 'A 12') + g(160, 110, 60, V.o, 'B 36') + g(160, 110, 22, V.p, 'C 15') + g(260, 110, 78, V.g, 'D 45') +
    `<line x1="160" y1="20" x2="160" y2="200" style="stroke:${V.axis};stroke-dasharray:5 4"/>` + lab(160, 214, ['B and C on the same shaft', 'B et C sur le même arbre'], { sm: 1, c: V.axis }) +
    lab(480, 70, 'GR = (36/12) × (45/15)', { b: 1 }) + lab(480, 96, '= 3 × 3 = 9', { b: 1 }) + lab(480, 130, ['2 external meshes:', '2 engrènements extérieurs :'], { sm: 1 }) + lab(480, 150, ['output in the same direction', 'sortie dans le même sens'], { sm: 1 }) };
};

// planetary gear schematic
export const planet = () => ({ vb: '0 0 620 250', svg: DEFS +
  `<circle cx="170" cy="125" r="110" style="fill:none;stroke:${V.axis};stroke-width:6"/>` + `<circle cx="170" cy="125" r="40" style="fill:${V.b};fill-opacity:0.35;stroke:${V.b};stroke-width:3"/>` +
  [0, 1, 2].map((k) => { const a = k * 2 * Math.PI / 3 - Math.PI / 2, x = 170 + Math.cos(a) * 75, y = 125 + Math.sin(a) * 75; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="33" style="fill:${V.mute};fill-opacity:0.3;stroke:${V.ink};stroke-width:2"/><line x1="170" y1="125" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" style="stroke:${V.o};stroke-width:5"/>`; }).join('') +
  lab(170, 129, ['sun', 'soleil'], { sm: 1, b: 1 }) + lab(170, 250, ['ring (internal teeth)', 'couronne (denture intérieure)'], { sm: 1 }) +
  lab(330, 50, ['Fixed ring, sun in, carrier out:', 'Couronne fixe, soleil en entrée, porte-satellites en sortie :'], { a: 'start', sm: 1 }) + lab(330, 74, 'GR = 1 + N_r / N_s', { a: 'start', b: 1 }) +
  lab(330, 110, ['Fixed sun, ring in, carrier out:', 'Soleil fixe, couronne en entrée, porte-satellites en sortie :'], { a: 'start', sm: 1 }) + lab(330, 134, 'GR = 1 + N_s / N_r', { a: 'start', b: 1 }) +
  lab(330, 170, ['Fixed carrier, sun in, ring out:', 'Porte-satellites fixe, soleil en entrée, couronne en sortie :'], { a: 'start', sm: 1 }) + lab(330, 194, 'GR = − N_r / N_s', { a: 'start', b: 1 }) +
  lab(330, 230, ['N_r = N_s + 2 N_p (the planets fit between)', 'N_r = N_s + 2 N_p (les satellites tiennent entre les deux)'], { a: 'start', sm: 1, c: V.axis }) });

// gripping principles
export const grips = () => {
  const part = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" style="fill:${c};fill-opacity:0.25;stroke:${c};stroke-width:2"/>`;
  const jaw = (x, y) => `<rect x="${x}" y="${y}" width="14" height="60" rx="3" style="fill:${V.o}"/>`;
  return { vb: '0 0 700 220', svg: DEFS +
    part(40, 60, 90, 60, V.b) + jaw(24, 60) + jaw(132, 60) + arr(10, 90, 22, 90, V.r) + arr(158, 90, 148, 90, V.r) + lab(85, 150, ['External grip', 'Prise extérieure'], { b: 1, sm: 1 }) +
    `<circle cx="300" cy="90" r="45" style="fill:${V.b};fill-opacity:0.25;stroke:${V.b};stroke-width:2"/><circle cx="300" cy="90" r="22" style="fill:var(--fpanel);stroke:${V.b};stroke-width:2"/>` + jaw(281, 60) + jaw(305, 60) + arr(288, 140, 270, 140, V.r) + arr(312, 140, 330, 140, V.r) + lab(300, 170, ['Internal grip (bore)', 'Prise intérieure (alésage)'], { b: 1, sm: 1 }) +
    `<path d="M470,60 L500,90 L470,120" style="fill:none;stroke:${V.o};stroke-width:8"/><path d="M590,60 L560,90 L590,120" style="fill:none;stroke:${V.o};stroke-width:8"/><circle cx="530" cy="90" r="26" style="fill:${V.g};fill-opacity:0.3;stroke:${V.g};stroke-width:2"/>` +
    lab(530, 150, ['V-jaws: 4 lines of contact, the part centres itself', 'Mors en V : 4 lignes de contact, la pièce se centre'], { b: 1, sm: 1 }) +
    lab(350, 205, ['Force-fit: friction μ N holds the part · Form-fit: the shape of the jaws holds it (no friction needed)', 'Par adhérence : le frottement μ N tient la pièce · Par obstacle : la forme des mors la tient (sans besoin de frottement)'], { sm: 1, c: V.axis }) };
};
