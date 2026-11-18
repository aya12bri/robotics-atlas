// par-fig.mjs — the static figures of the course "Workspaces, motion modes and parallel robots".
import { PRIM } from './tel-fig.mjs';
const { DEFS, V, box, arr, lab } = PRIM;

const seg = (x1, y1, x2, y2, c, w = 7) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${c};stroke-width:${w};stroke-linecap:round"/>`;
const pin = (x, y, c = V.ink, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${V.box};stroke:${c};stroke-width:2.5"/>`;
const motor = (x, y) => `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="5" style="fill:${V.b};fill-opacity:0.55;stroke:${V.b};stroke-width:2"/>`;
const ground = (x, y, w) => `<line x1="${x - w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y}" style="stroke:${V.axis};stroke-width:2"/>` + Array.from({ length: Math.floor(w / 12) }, (_, i) => `<line x1="${x - w / 2 + i * 12 + 4}" y1="${y}" x2="${x - w / 2 + i * 12 - 4}" y2="${y + 9}" style="stroke:${V.axis};stroke-width:1.5"/>`).join('');

// joint space ⇄ operational space
export const maps = () => ({ vb: '0 0 700 230', svg: DEFS +
  box(10, 40, 210, 120, V.b, ['Joint space', 'Espace articulaire'], ['q = (q₁ … qₙ): motors', 'q = (q₁ … qₙ) : moteurs']) +
  box(480, 40, 210, 120, V.g, ['Operational space', 'Espace opérationnel'], ['X = (x, y, z, angles): task', 'X = (x, y, z, angles) : tâche']) +
  arr(225, 78, 475, 78, V.o) + lab(350, 68, ['direct model (DGM): X = f(q)', 'modèle direct (MGD) : X = f(q)'], { sm: 1, c: V.o }) +
  arr(475, 122, 225, 122, V.p) + lab(350, 142, ['inverse model (IGM): q = g(X)', 'modèle inverse (MGI) : q = g(X)'], { sm: 1, c: V.p }) +
  lab(350, 190, ['serial robot: DGM easy, one answer · IGM hard: 0, 1, several (aspects) or ∞ answers (redundant)', 'robot série : MGD facile, une réponse · MGI difficile : 0, 1, plusieurs (aspects) ou ∞ réponses (redondant)'], { sm: 1, c: V.axis }) +
  lab(350, 212, ['parallel robot: exactly the opposite', 'robot parallèle : exactement l\'inverse'], { sm: 1, b: 1 }) });

// serial versus parallel architecture
export const serpar = () => ({ vb: '0 0 700 280', svg: DEFS +
  ground(150, 230, 140) + motor(110, 215) + seg(110, 215, 160, 140, V.o) + motor(160, 140) + seg(160, 140, 240, 105, V.o) + motor(240, 105) + seg(240, 105, 270, 50, V.o) + `<circle cx="270" cy="50" r="9" style="fill:${V.y}"/>` +
  lab(160, 268, ['serial: one open chain', 'série : une chaîne ouverte'], { sm: 1, b: 1 }) +
  lab(60, 120, ['each motor carries', 'chaque moteur porte'], { sm: 1, c: V.axis }) + lab(60, 138, ['the next ones', 'les suivants'], { sm: 1, c: V.axis }) +
  ground(530, 230, 220) + motor(460, 215) + motor(600, 215) + seg(460, 215, 440, 135, V.o) + seg(600, 215, 620, 135, V.o) + seg(440, 135, 530, 70, V.axis, 6) + seg(620, 135, 530, 70, V.axis, 6) + pin(440, 135) + pin(620, 135) + `<circle cx="530" cy="70" r="11" style="fill:${V.y}"/>` +
  lab(530, 268, ['parallel: closed chains, motors on the base', 'parallèle : chaînes fermées, moteurs sur la base'], { sm: 1, b: 1 }) +
  lab(530, 30, ['effector carried by several chains', 'effecteur porté par plusieurs chaînes'], { sm: 1, c: V.axis }) +
  lab(350, 120, ['vs', 'vs'], { b: 1, c: V.axis }) });

// notation of the five-bar (DexTAR)
export const fivebar = () => {
  const O11 = [250, 230], O12 = [450, 230], C1 = [195, 120], C2 = [505, 120], O3 = [350, 60];
  return { vb: '0 0 700 280', svg: DEFS + ground(350, 245, 340) +
    seg(...O11, ...C1, V.o) + seg(...O12, ...C2, V.o) + seg(...C1, ...O3, V.axis, 6) + seg(...C2, ...O3, V.axis, 6) + motor(...O11) + motor(...O12) + pin(...C1) + pin(...C2) + `<circle cx="${O3[0]}" cy="${O3[1]}" r="11" style="fill:${V.y}"/>` +
    `<path d="M${O11[0] + 45},${O11[1]} A45,45 0 0 0 ${O11[0] - 22},${O11[1] - 40}" style="fill:none;stroke:${V.b};stroke-width:2" marker-end="url(#tB)"/>` + lab(O11[0] + 40, O11[1] - 30, 'θ₁₁', { c: V.b, b: 1 }) +
    `<path d="M${O12[0] + 45},${O12[1]} A45,45 0 0 0 ${O12[0] + 22},${O12[1] - 40}" style="fill:none;stroke:${V.b};stroke-width:2" marker-end="url(#tB)"/>` + lab(O12[0] + 58, O12[1] - 26, 'θ₁₂', { c: V.b, b: 1 }) +
    lab(O11[0], O11[1] + 32, 'O₁₁', { sm: 1 }) + lab(O12[0], O12[1] + 32, 'O₁₂', { sm: 1 }) + lab(C1[0] - 30, C1[1], 'C₁₁', { sm: 1 }) + lab(C2[0] + 32, C2[1], 'C₁₂', { sm: 1 }) + lab(O3[0], O3[1] - 22, ['O₃ = effector (x, y)', 'O₃ = effecteur (x, y)'], { sm: 1, b: 1 }) +
    lab(120, 190, ['proximal arms (motorised)', 'bras proximaux (motorisés)'], { sm: 1, c: V.o }) + lab(350, 125, ['distal arms (passive pivots)', 'bras distaux (pivots passifs)'], { sm: 1, c: V.axis }) +
    lab(575, 40, ['IGM: two circle intersections', 'MGI : deux intersections de cercles'], { sm: 1, c: V.p }) + lab(575, 60, ['(one per chain, like a serial 2R)', '(une par chaîne, comme un 2R série)'], { sm: 1, c: V.p }) };
};

// the two kinds of singularity
export const sings = () => ({ vb: '0 0 700 275', svg: DEFS +
  ground(170, 220, 260) + motor(110, 205) + motor(230, 205) + seg(110, 205, 60, 120, V.o) + seg(60, 120, 10 + 15, 60, V.r, 4) + seg(230, 205, 220, 120, V.o) + seg(220, 120, 25, 60, V.axis, 6) + `<circle cx="25" cy="60" r="10" style="fill:${V.y}"/>` +
  lab(170, 30, ['serial singularity: det A = 0', 'singularité série : det A = 0'], { b: 1, c: V.r }) + lab(170, 245, ['a chain is stretched or folded:', 'une chaîne est tendue ou repliée :'], { sm: 1 }) + lab(170, 263, ['the effector loses a direction', 'l\'effecteur perd une direction'], { sm: 1 }) +
  ground(530, 220, 260) + motor(470, 205) + motor(590, 205) + seg(470, 205, 440, 120, V.o) + seg(590, 205, 620, 120, V.o) + seg(440, 120, 530, 120, V.axis, 6) + seg(620, 120, 530, 120, V.axis, 6) + `<circle cx="530" cy="120" r="10" style="fill:${V.y}"/>` +
  arr(530, 110, 530, 72, V.r) + arr(530, 130, 530, 168, V.r) +
  lab(530, 30, ['parallel singularity: det B = 0', 'singularité parallèle : det B = 0'], { b: 1, c: V.r }) + lab(530, 245, ['distal arms aligned: motors locked,', 'bras distaux alignés : moteurs bloqués,'], { sm: 1 }) + lab(530, 263, ['the effector can still move', 'l\'effecteur peut encore bouger'], { sm: 1 }) });

// design principle: speeds = intersection, efforts = union
export const design = () => ({ vb: '0 0 700 212', svg: DEFS +
  `<ellipse cx="170" cy="100" rx="95" ry="62" style="fill:${V.b};fill-opacity:0.18;stroke:${V.b};stroke-width:2"/><ellipse cx="250" cy="100" rx="95" ry="62" style="fill:${V.g};fill-opacity:0.18;stroke:${V.g};stroke-width:2"/>` +
  lab(120, 100, ['chain 1', 'chaîne 1'], { sm: 1, c: V.b }) + lab(300, 100, ['chain 2', 'chaîne 2'], { sm: 1, c: V.g }) + lab(210, 104, ['effector', 'effecteur'], { sm: 1, b: 1 }) +
  lab(210, 182, ['possible SPEEDS of the effector', 'VITESSES possibles de l\'effecteur'], { sm: 1, b: 1 }) + lab(210, 200, ['= intersection', '= intersection'], { sm: 1, b: 1 }) +
  `<ellipse cx="480" cy="100" rx="95" ry="62" style="fill:${V.o};fill-opacity:0.25;stroke:${V.o};stroke-width:2"/><ellipse cx="560" cy="100" rx="95" ry="62" style="fill:${V.o};fill-opacity:0.25;stroke:${V.o};stroke-width:2"/>` +
  lab(520, 104, ['all of it', 'le tout'], { sm: 1, b: 1 }) +
  lab(520, 182, ['EFFORTS it can apply or resist', 'EFFORTS qu\'il peut appliquer ou encaisser'], { sm: 1, b: 1 }) + lab(520, 200, ['= union', '= union'], { sm: 1, b: 1 }) });
