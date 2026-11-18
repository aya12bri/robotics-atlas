// tel-fig.mjs — the static figures of the course "Teleoperation, cobotics, control architectures and safety".
// Colours come from the theme tokens (--f-*), so the figures follow the light and the dark mode.
// Labels are [en, fr] pairs (translated with the page) or plain strings (symbols, the same in both languages).
import { svgtx, SVGREG } from '../lib.mjs';
const t = (s) => { if (Array.isArray(s)) return svgtx(s[0], s[1]); if (!SVGREG.has(s)) svgtx(s); return s; };
const V = { ink: 'var(--f-ink)', axis: 'var(--f-axis)', grid: 'var(--f-grid)', box: 'var(--f-box)', b: 'var(--f-b)', o: 'var(--f-o)', g: 'var(--f-g)', r: 'var(--f-r)', y: 'var(--f-y)', p: 'var(--f-p)', mute: 'var(--f-dim)' };
const MK = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:${c}"/></marker>`;
const DEFS = `<defs>${MK('tA', V.axis)}${MK('tB', V.b)}${MK('tO', V.o)}${MK('tG', V.g)}${MK('tR', V.r)}${MK('tY', V.y)}</defs>`;
const mk = { [V.axis]: 'tA', [V.b]: 'tB', [V.o]: 'tO', [V.g]: 'tG', [V.r]: 'tR', [V.y]: 'tY' };
const box = (x, y, w, h, fill, label, sub, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" style="fill:${fill};fill-opacity:${o.op || 0.22};stroke:${fill};stroke-width:2"/>` +
  `<text x="${x + w / 2}" y="${y + h / 2 + (sub ? -4 : 5)}" text-anchor="middle" style="font-weight:700">${t(label)}</text>` + (sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 15}" text-anchor="middle" class="sm" style="fill:${V.axis}">${t(sub)}</text>` : '');
const arr = (x1, y1, x2, y2, c = V.axis, w = 2.2, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${c};stroke-width:${w}${dash ? ';stroke-dasharray:6 5' : ''}" marker-end="url(#${mk[c] || 'tA'})"/>`;
const lab = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}"${o.sm ? ' class="sm"' : ''} style="fill:${o.c || V.ink}${o.b ? ';font-weight:700' : ''}">${t(s)}</text>`;

// the chain of a teleoperation: operator, master, channel, slave, environment
export const chain = () => ({ vb: '0 0 720 230', svg: DEFS +
  box(10, 70, 110, 60, V.b, ['Operator', 'Opérateur']) + box(160, 70, 120, 60, V.b, ['Master', 'Maître'], ['haptic interface', 'interface haptique']) +
  `<rect x="315" y="60" width="110" height="80" rx="10" style="fill:${V.mute};fill-opacity:0.12;stroke:${V.axis};stroke-dasharray:6 5"/>` + lab(370, 52, ['Channel', 'Canal'], { b: 1 }) +
  lab(370, 92, ['delays', 'délais'], { sm: 1, c: V.r }) + lab(370, 110, ['noise', 'bruit'], { sm: 1, c: V.r }) + lab(370, 128, ['losses', 'pertes'], { sm: 1, c: V.r }) +
  box(460, 70, 120, 60, V.o, ['Slave', 'Esclave'], ['remote robot', 'robot distant']) + box(615, 70, 95, 60, V.g, ['Remote', 'Environnement'], ['environment', 'distant']) +
  arr(120, 88, 158, 88, V.b) + arr(158, 112, 122, 112, V.g) + arr(280, 88, 313, 88, V.b) + arr(313, 112, 282, 112, V.g) + arr(425, 88, 458, 88, V.b) + arr(458, 112, 427, 112, V.g) + arr(580, 88, 613, 88, V.b) + arr(613, 112, 582, 112, V.g) +
  lab(240, 175, ['blue: orders (position, speed, force) →', 'bleu : ordres (position, vitesse, force) →'], { sm: 1, c: V.b, a: 'start' }) + lab(240, 195, ['← green: feedback (force, image, sound)', '← vert : retour (force, image, son)'], { sm: 1, c: V.g, a: 'start' }) +
  lab(360, 222, ['Transparency: what the operator feels = what the slave touches (in practice: impossible to reach fully)', 'Transparence : ce que sent l\'opérateur = ce que touche l\'esclave (en pratique : impossible à atteindre totalement)'], { sm: 1, c: V.axis }) });

// unilateral and bilateral
export const unibi = () => ({ vb: '0 0 660 220', svg: DEFS +
  lab(160, 22, ['Unilateral', 'Unilatérale'], { b: 1 }) + box(30, 50, 100, 54, V.b, ['Master', 'Maître']) + box(190, 50, 100, 54, V.o, ['Slave', 'Esclave']) + arr(130, 77, 188, 77, V.b) + lab(160, 68, ['order', 'consigne'], { sm: 1 }) +
  lab(160, 140, ['the operator only sees (camera):', 'l\'opérateur voit seulement (caméra) :'], { sm: 1, c: V.axis }) + lab(160, 158, ['joystick, remote car, drone', 'joystick, voiture télécommandée, drone'], { sm: 1, c: V.axis }) +
  lab(500, 22, ['Bilateral', 'Bilatérale'], { b: 1 }) + box(370, 50, 100, 54, V.b, ['Master', 'Maître']) + box(530, 50, 100, 54, V.o, ['Slave', 'Esclave']) + arr(470, 68, 528, 68, V.b) + arr(528, 90, 472, 90, V.g) +
  lab(500, 60, ['order', 'consigne'], { sm: 1 }) + lab(500, 112, ['force feedback', 'retour d\'effort'], { sm: 1, c: V.g }) +
  lab(500, 140, ['the operator also FEELS the contact:', 'l\'opérateur SENT aussi le contact :'], { sm: 1, c: V.axis }) + lab(500, 158, ['surgery, nuclear, assembly at a distance', 'chirurgie, nucléaire, assemblage à distance'], { sm: 1, c: V.axis }) +
  lab(330, 200, ['Disturbances act on both sides (dashed in the course diagram): the loop must stay stable.', 'Des perturbations agissent des deux côtés : la boucle doit rester stable.'], { sm: 1, c: V.axis }) });

// mass-spring-damper
export const msd = () => ({ vb: '0 0 560 180', svg: DEFS +
  `<rect x="20" y="20" width="14" height="140" style="fill:${V.mute}"/>` +
  `<polyline points="34,60 60,60 72,46 96,74 120,46 144,74 168,46 192,74 204,60 250,60" style="fill:none;stroke:${V.g};stroke-width:2.5"/>` + lab(140, 38, ['spring k (elasticity)', 'ressort k (élasticité)'], { sm: 1, c: V.g }) +
  `<path d="M34,120 L120,120 M110,104 L150,104 L150,136 L110,136 M128,108 L128,132 M128,120 L250,120" style="fill:none;stroke:${V.p};stroke-width:2.5"/>` + lab(140, 158, ['damper b (viscosity)', 'amortisseur b (viscosité)'], { sm: 1, c: V.p }) +
  `<rect x="250" y="40" width="100" height="100" rx="6" style="fill:${V.b};fill-opacity:0.85"/>` + lab(300, 96, ['mass m (inertia)', 'masse m (inertie)'], { sm: 1, c: 'var(--fpanel)', b: 1 }) +
  arr(350, 90, 440, 90, V.o, 3) + lab(470, 86, 'F(t)', { c: V.o, b: 1 }) + arr(300, 168, 400, 168, V.axis, 1.6) + lab(420, 172, 'x', { c: V.axis }) +
  lab(470, 130, 'F = m ẍ + b ẋ + k x', { b: 1 }) });

// position-position: two springs
export const pp = () => ({ vb: '0 0 680 210', svg: DEFS +
  box(20, 70, 120, 60, V.b, ['Master', 'Maître'], 'm_m, d_m') + box(540, 70, 120, 60, V.o, ['Slave', 'Esclave'], 'm_s, d_s') +
  arr(30, 40, 30, 68, V.y) + lab(36, 34, 'F_h', { a: 'start', c: V.y }) +
  arr(140, 85, 538, 85, V.b) + lab(340, 76, ['x_m is sent →', 'x_m est envoyée →'], { sm: 1, c: V.b }) + arr(538, 118, 142, 118, V.o) + lab(340, 140, ['← x_s is sent back', '← x_s est renvoyée'], { sm: 1, c: V.o }) +
  lab(340, 175, 'F_slave = K_ps (x_m − x_s)      F_master = K_pm (x_s − x_m)', { b: 1 }) +
  lab(340, 200, ['two virtual springs pull each one towards the other', 'deux ressorts virtuels tirent chacun vers l\'autre'], { sm: 1, c: V.axis }) });

// the remote wall
export const wall = () => ({ vb: '0 0 640 220', svg: DEFS +
  `<line x1="40" y1="180" x2="600" y2="180" style="stroke:${V.axis};stroke-width:1.5"/>` +
  `<rect x="140" y="110" width="90" height="70" rx="6" style="fill:${V.o};fill-opacity:0.8"/>` + lab(185, 150, ['slave', 'esclave'], { sm: 1, b: 1, c: 'var(--fpanel)' }) +
  `<rect x="380" y="40" width="30" height="140" style="fill:${V.mute}"/>` + lab(395, 30, 'x_mur', { sm: 1 }) +
  `<polyline points="230,145 250,145 260,132 280,158 300,132 320,158 340,132 352,145 380,145" style="fill:none;stroke:${V.g};stroke-width:2.5"/>` + lab(305, 120, 'K_mur', { sm: 1, c: V.g }) +
  `<path d="M230,170 L290,170 M282,160 L310,160 L310,180 M296,163 L296,177" style="fill:none;stroke:${V.p};stroke-width:2.5"/>` + lab(330, 200, 'd_pen', { sm: 1, c: V.p }) +
  lab(520, 80, ['if x_s ≤ x_mur:', 'si x_s ≤ x_mur :'], { sm: 1 }) + lab(520, 98, 'F_env = 0', { b: 1 }) +
  lab(520, 130, ['if x_s > x_mur:', 'si x_s > x_mur :'], { sm: 1 }) + lab(520, 148, 'F_env = K_mur (x_s − x_mur) + d_pen ẋ_s', { b: 1, sm: 1 }) +
  lab(520, 172, ['(and never negative: a wall only pushes)', '(et jamais négative : un mur ne fait que pousser)'], { sm: 1, c: V.axis }) });

// the architectures: a small master-slave diagram for each
export const archs = () => {
  const one = (x, y, title, top, bottom, ok, ko) => box(x, y + 26, 54, 40, V.b, 'M', null, { op: 0.3 }) + box(x + 150, y + 26, 54, 40, V.o, 'E', null, { op: 0.3 }) +
    lab(x + 102, y + 14, title, { b: 1 }) + top.map((s, i) => arr(x + 56, y + 34 + i * 10, x + 148, y + 34 + i * 10, V.b, 1.8) + lab(x + 102, y + 30 + i * 10, s, { sm: 1, c: V.b })).join('') +
    bottom.map((s, i) => arr(x + 148, y + 58 + i * 10, x + 56, y + 58 + i * 10, V.g, 1.8) + lab(x + 102, y + 76 + i * 12, s, { sm: 1, c: V.g })).join('') +
    lab(x + 102, y + 108, ok, { sm: 1, c: V.g }) + lab(x + 102, y + 124, ko, { sm: 1, c: V.r });
  return { vb: '0 0 690 420', svg: DEFS +
    one(10, 10, ['Position – position', 'Position – position'], ['x'], ['x'], ['✓ simple, no drift', '✓ simple, sans dérive'], ['✗ little transparency', '✗ peu de transparence']) +
    one(240, 10, ['Position – speed', 'Position – vitesse'], ['x → v'], [], ['✓ long trajectories', '✓ grandes trajectoires'], ['(mobile robots)', '(robots mobiles)']) +
    one(470, 10, ['Force – position', 'Force – position'], ['x'], ['F'], ['✓ better feel, no drift', '✓ meilleur ressenti, sans dérive'], ['✗ unstable if α too big', '✗ instable si α trop grand']) +
    one(10, 215, ['Force – force', 'Force – force'], ['F'], ['F'], ['✓ stable, transparent', '✓ stable, transparent'], ['✗ drift, latency, cost', '✗ dérive, latence, coût']) +
    one(240, 215, ['4 channels (Lawrence)', '4 canaux (Lawrence)'], ['v', 'F'], ['v', 'F'], ['✓ excellent transparency', '✓ excellente transparence'], ['✗ drift, delays', '✗ dérive, retards']) +
    one(470, 215, ['4 channels pos.–force', '4 canaux pos.–force'], ['x', 'F'], ['x', 'F'], ['✓ transparent, no drift', '✓ transparent, sans dérive'], ['✗ delays', '✗ retards']) };
};

// wave variables
export const wave = () => ({ vb: '0 0 680 200', svg: DEFS +
  box(20, 60, 120, 70, V.b, ['Master', 'Maître'], 'ẋ_m, F_m') + box(540, 60, 120, 70, V.o, ['Slave', 'Esclave'], 'ẋ_s, F_s') +
  `<rect x="250" y="50" width="180" height="90" rx="10" style="fill:${V.mute};fill-opacity:0.12;stroke:${V.axis};stroke-dasharray:6 5"/>` + lab(340, 42, ['delay T each way', 'retard T dans chaque sens'], { sm: 1, c: V.r }) +
  arr(140, 78, 538, 78, V.b) + lab(195, 70, 'u_m', { c: V.b, b: 1 }) + lab(485, 70, 'u_s(t) = u_m(t − T)', { c: V.b, sm: 1 }) +
  arr(538, 112, 142, 112, V.g) + lab(485, 130, 'v_s', { c: V.g, b: 1 }) + lab(195, 130, 'v_m(t) = v_s(t − T)', { c: V.g, sm: 1 }) +
  lab(340, 172, 'u = (b ẋ + F) / √(2b)        v = (b ẋ − F) / √(2b)', { b: 1 }) +
  lab(340, 192, ['the power ½u² − ½v² that crosses the channel can never be created by the delay', 'la puissance ½u² − ½v² qui traverse le canal ne peut jamais être créée par le retard'], { sm: 1, c: V.axis }) });

// the three types of co-manipulation
export const coman = () => {
  const person = (x) => `<circle cx="${x}" cy="70" r="16" style="fill:none;stroke:${V.ink};stroke-width:2.5"/><path d="M${x},86 L${x},150 M${x},150 L${x - 18},200 M${x},150 L${x + 18},200 M${x},104 L${x + 40},92" style="fill:none;stroke:${V.ink};stroke-width:2.5"/>`;
  const dot = (x, y, c) => `<circle cx="${x}" cy="${y}" r="7" style="fill:${c}"/>`;
  return { vb: '0 0 690 260', svg: person(60) + `<path d="M180,205 L180,150 L150,110 L110,92" style="fill:none;stroke:${V.o};stroke-width:8;stroke-linecap:round"/>` + dot(110, 92, V.b) + dot(180, 205, V.g) +
    lab(120, 240, ['Parallel', 'Parallèle'], { b: 1 }) +
    person(320) + `<path d="M300,200 L310,160 M322,140 L330,112 L360,94" style="fill:none;stroke:${V.o};stroke-width:8;stroke-linecap:round"/>` + dot(360, 94, V.b) + dot(300, 200, V.g) +
    lab(330, 240, ['Orthotic (exoskeleton)', 'Orthétique (exosquelette)'], { b: 1 }) +
    person(530) + `<path d="M570,92 L600,60 L640,70 L670,50" style="fill:none;stroke:${V.o};stroke-width:8;stroke-linecap:round"/>` + dot(670, 50, V.b) + dot(570, 92, V.g) +
    lab(590, 240, ['Serial', 'Sérielle'], { b: 1 }) +
    dot(20, 20, V.b) + lab(32, 25, ['tool (end effector)', 'outil (effecteur)'], { sm: 1, a: 'start' }) + dot(200, 20, V.g) + lab(212, 25, ['base of the robot', 'base du robot'], { sm: 1, a: 'start' }) };
};

// history of control architectures
export const history = () => {
  const step = (x, y, w, c, title, sub) => box(x, y, w, 58, c, title, sub);
  return { vb: '0 0 700 330', svg: DEFS +
    step(10, 10, 200, V.b, ['Sequential', 'Séquentielle'], ['sense → model → plan → act', 'percevoir → modéliser → planifier → agir']) + arr(210, 39, 238, 39) +
    step(240, 10, 210, V.o, ['Reactive, parallel', 'Réactive, parallèle'], ['subsumption (Brooks, 1986)', 'subsomption (Brooks, 1986)']) + arr(450, 39, 478, 39) +
    step(480, 10, 210, V.g, ['Discrete events', 'Événements discrets'], ['state machines, Petri nets', 'machines à états, réseaux de Petri']) +
    arr(585, 68, 585, 108) +
    step(480, 110, 210, V.p, ['Distributed', 'Distribuée'], ['blackboard, data exchanges', 'tableau noir, échanges de données']) + arr(480, 139, 452, 139) +
    step(240, 110, 210, V.y, ['Multi-agents', 'Multi-agents'], ['agents that negotiate', 'des agents qui négocient']) + arr(240, 139, 212, 139) +
    step(10, 110, 200, V.b, ['Components', 'Composants'], ['inputs → algorithm → outputs', 'entrées → algorithme → sorties']) + arr(110, 168, 110, 208) +
    step(10, 210, 330, V.g, ['Hybrid, by levels (e.g. PAT, LAAS)', 'Hybride, par niveaux (ex. PAT, LAAS)'], ['reflexes at the bottom, deliberation at the top', 'réflexes en bas, délibération en haut']) + arr(340, 239, 368, 239) +
    step(370, 210, 320, V.o, ['Model-driven', 'Dirigée par les modèles'], ['formal model → generated code (RobotML)', 'modèle formel → code généré (RobotML)']) +
    lab(350, 310, ['Each step answers a weakness of the previous one: slowness, then lack of goals, then complexity.', 'Chaque étape répond à une faiblesse de la précédente : lenteur, puis absence de buts, puis complexité.'], { sm: 1, c: V.axis }) };
};

// a state machine of a pick-and-place robot
export const fsm = () => {
  const st = (x, y, s, c) => `<ellipse cx="${x}" cy="${y}" rx="72" ry="26" style="fill:${c};fill-opacity:0.22;stroke:${c};stroke-width:2"/>` + lab(x, y + 5, s, { b: 1 });
  return { vb: '0 0 680 230', svg: DEFS +
    st(90, 60, ['Wait', 'Attente'], V.b) + st(300, 60, ['Pick', 'Prise'], V.o) + st(510, 60, ['Place', 'Dépose'], V.g) + st(300, 180, ['Fault', 'Défaut'], V.r) +
    arr(162, 60, 226, 60) + lab(194, 48, ['part seen', 'pièce vue'], { sm: 1 }) + arr(372, 60, 436, 60) + lab(404, 48, ['grasped', 'saisie'], { sm: 1 }) +
    `<path d="M510,34 C510,0 90,0 90,34" style="fill:none;stroke:${V.axis};stroke-width:2.2" marker-end="url(#tA)"/>` + lab(300, 14, ['placed', 'posée'], { sm: 1 }) +
    arr(300, 86, 300, 152, V.r) + lab(352, 124, ['drop / E-stop', 'chute / arrêt d\'urgence'], { sm: 1, c: V.r }) +
    `<path d="M228,180 C120,180 90,140 90,88" style="fill:none;stroke:${V.axis};stroke-width:2.2" marker-end="url(#tA)"/>` + lab(120, 166, ['reset', 'réarmement'], { sm: 1 }) };
};

// the canvas of the PAT architecture
export const pat = () => {
  const L = [['Mission generator', 'Générateur de mission', 'General model', 'Modèle général'], ['Path planner', 'Planificateur', 'Global model', 'Modèle global'], ['Navigator', 'Navigateur', 'Local model', 'Modèle local'], ['Pilot', 'Pilote', 'Proximity model', 'Modèle de proximité'], ['Servoings', 'Asservissements', 'Sensors', 'Capteurs']];
  const flows = [['goal', 'but'], ['path', 'chemin'], ['trajectory', 'trajectoire'], ['setting points', 'consignes']];
  let s = DEFS + lab(70, 20, ['Teleoperation', 'Téléopération'], { b: 1, c: V.b }) + lab(330, 20, 'Action', { b: 1, c: V.y }) + lab(570, 20, 'Perception', { b: 1, c: V.g });
  L.forEach((r, i) => { const y = 32 + i * 62, lvl = 5 - i;
    s += box(20, y, 100, 42, V.b, 'T' + lvl) + box(220, y, 220, 42, V.y, [r[0], r[1]]) + box(480, y, 190, 42, V.g, [r[2], r[3]]) + lab(170, y + 26, ['level ', 'niveau '] .map((w) => w + lvl), { sm: 1, c: V.axis });
    s += arr(122, y + 21, 218, y + 21 + 31, V.b, 1.4, 1) + `<line x1="440" y1="${y + 21}" x2="478" y2="${y + 21}" style="stroke:${V.axis};stroke-width:1.6;stroke-dasharray:4 4"/>`;
    if (i < 4) s += arr(330, y + 42, 330, y + 60) + lab(338, y + 56, flows[i], { sm: 1, a: 'start', c: V.axis }) + arr(575, y + 60, 575, y + 44, V.g, 1.6);
  });
  s += `<rect x="250" y="346" width="200" height="34" rx="8" style="fill:${V.mute};fill-opacity:0.35"/>` + lab(350, 368, ['Level 0: the robot (A.M.S.)', 'Niveau 0 : le robot (A.M.S.)'], { b: 1, sm: 1 }) + arr(330, 322, 330, 344) + arr(575, 344, 575, 324, V.g, 1.6);
  return { vb: '0 0 690 390', svg: s };
};

// law and standards
export const lawnorm = () => ({ vb: '0 0 680 250', svg: DEFS +
  lab(170, 22, ['LAW: an obligation', 'LOI : une obligation'], { b: 1, c: V.r }) + lab(510, 22, ['STANDARD: a recommendation', 'NORME : une recommandation'], { b: 1, c: V.g }) +
  box(70, 40, 200, 40, V.r, ['European directive', 'Directive européenne']) + arr(170, 80, 170, 100, V.r) + box(70, 100, 200, 40, V.r, ['National law, decree', 'Loi nationale, décret']) + arr(170, 140, 170, 160, V.r) + box(70, 160, 200, 40, V.r, ['Order (arrêté)', 'Arrêté']) +
  box(410, 40, 200, 40, V.g, ['Standards (ISO, EN, NF)', 'Normes (ISO, EN, NF)']) + arr(510, 80, 510, 100, V.g) + box(410, 100, 200, 40, V.g, ['Harmonised standard', 'Norme harmonisée']) +
  arr(410, 120, 272, 120, V.y, 2.5) + lab(340, 112, ['presumption', 'présomption'], { sm: 1, c: V.y }) + lab(340, 140, ['of conformity', 'de conformité'], { sm: 1, c: V.y }) +
  lab(510, 180, ['type A: basic (ISO 12100)', 'type A : fondamentales (ISO 12100)'], { sm: 1 }) + lab(510, 198, ['type B: generic (ISO 13849, 13857…)', 'type B : génériques (ISO 13849, 13857…)'], { sm: 1 }) + lab(510, 216, ['type C: per machine (ISO 10218…)', 'type C : par machine (ISO 10218…)'], { sm: 1 }) +
  lab(340, 244, ['There is no “CE standard”: CE marking comes from the directives.', 'Il n\'existe pas de « norme CE » : le marquage CE vient des directives.'], { sm: 1, c: V.axis }) });

// the five elements of the certification of a machine
export const cert = () => ({ vb: '0 0 680 230', svg: DEFS +
  box(240, 10, 200, 56, V.r, ['1 · Risk assessment', '1 · Analyse des risques'], ['+ safety integrated (EHSR)', '+ sécurité intégrée (EESS)']) +
  arr(300, 66, 140, 108) + arr(340, 66, 340, 108) + arr(380, 66, 540, 108) +
  box(40, 110, 200, 52, V.b, ['2 · Instructions', '2 · Notice d\'instructions'], ['for the user', 'pour l\'utilisateur']) +
  box(260, 110, 160, 52, V.o, ['4 · Declaration', '4 · Déclaration'], ['of conformity', 'de conformité']) +
  box(440, 110, 200, 52, V.p, ['3 · Technical file', '3 · Dossier technique'], ['kept by the manufacturer', 'gardé par le fabricant']) +
  arr(340, 162, 340, 182) + box(270, 182, 140, 42, V.g, ['5 · CE marking', '5 · Marquage CE']) });
