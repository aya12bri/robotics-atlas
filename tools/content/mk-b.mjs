// The maths of robotics, lessons 4 and 5: rotation matrices; frames and homogeneous transformations.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, TRY, lesson } from '../lib.mjs';
const PRE = 'mk-';
export const AXM = '<defs><marker id="mkax" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
const RED = '#ff6b6b', GREEN = '#4ed17f';
// a small frame: origin (x, y), angle of its x axis (deg, counter-clockwise), axis length, names of the axes
export const frame = (x, y, deg, len, nx, ny) => {
  const a = deg * Math.PI / 180, cx = Math.cos(a), sy = Math.sin(a), f = (v) => v.toFixed(1);
  const x1 = x + len * cx, y1 = y - len * sy, x2 = x - len * sy, y2 = y - len * cx;
  return `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x1)}" y2="${f(y1)}" stroke="${RED}" stroke-width="2.5" marker-end="url(#mkax)"/><line x1="${f(x)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${GREEN}" stroke-width="2.5" marker-end="url(#mkax)"/>` +
    (nx ? `<text x="${f(x1 + 10 * cx - 4)}" y="${f(y1 - 10 * sy + 4)}" fill="${RED}">${nx}</text>` : '') + (ny ? `<text x="${f(x2 - 10 * sy - 4)}" y="${f(y2 - 10 * cx + 4)}" fill="${GREEN}">${ny}</text>` : '');
};

// lesson 5.1: frame A (fixed, with its grid and graduations) and frame B (at (3, 1), turned by 90°, with its own graduations)
function frameFig() {
  const U = 40, OX = 70, OY = 260, X = (u) => OX + u * U, Y = (v) => OY - v * U, sub = (n, s) => `${n}<tspan dy="4" font-size="11">${s}</tspan>`;
  let s = AXM;
  for (let u = 0; u <= 6; u++) s += `<line x1="${X(u)}" y1="${Y(0)}" x2="${X(u)}" y2="${Y(5)}" stroke="currentColor" stroke-opacity="0.09"/>`;
  for (let v = 0; v <= 5; v++) s += `<line x1="${X(0)}" y1="${Y(v)}" x2="${X(6)}" y2="${Y(v)}" stroke="currentColor" stroke-opacity="0.09"/>`;
  // frame A, graduated
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(6.4)}" y2="${Y(0)}" stroke="${RED}" stroke-width="2.5" marker-end="url(#mkax)"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(5.4)}" stroke="${GREEN}" stroke-width="2.5" marker-end="url(#mkax)"/>`;
  for (let u = 1; u <= 6; u++) s += `<line x1="${X(u)}" y1="${Y(0) - 4}" x2="${X(u)}" y2="${Y(0) + 4}" stroke="${RED}" stroke-width="2"/><text x="${X(u)}" y="${Y(0) + 18}" text-anchor="middle" font-size="14" fill="${RED}">${u}</text>`;
  for (let v = 1; v <= 5; v++) s += `<line x1="${X(0) - 4}" y1="${Y(v)}" x2="${X(0) + 4}" y2="${Y(v)}" stroke="${GREEN}" stroke-width="2"/><text x="${X(0) - 10}" y="${Y(v) + 4}" text-anchor="end" font-size="14" fill="${GREEN}">${v}</text>`;
  s += `<text x="${X(6.5)}" y="${Y(0) + 5}" fill="${RED}" font-weight="700">${sub('x', 'A')}</text><text x="${X(0) - 6}" y="${Y(5.5)}" text-anchor="end" fill="${GREEN}" font-weight="700">${sub('y', 'A')}</text>`;
  s += `<text x="${X(0) - 8}" y="${Y(0) + 18}" text-anchor="end" font-size="14">${sub('O', 'A')}</text>`;
  // t: from O_A to O_B
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(3) - 5}" y2="${Y(1) + 2}" stroke="#9aa5b4" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#mkax)"/><text x="${X(1.9)}" y="${Y(0.18)}" font-size="15" fill="#8a94a3" font-weight="700">t = (3, 1)</text>`;
  // frame B at (3, 1), turned by 90°: x_B up, y_B to the left, graduated
  const bx = X(3), by = Y(1);
  s += `<line x1="${bx}" y1="${by}" x2="${bx}" y2="${by - 2.7 * U}" stroke="${RED}" stroke-width="3" marker-end="url(#mkax)"/><line x1="${bx}" y1="${by}" x2="${bx - 1.7 * U}" y2="${by}" stroke="${GREEN}" stroke-width="3" marker-end="url(#mkax)"/>`;
  for (let k = 1; k <= 2; k++) s += `<line x1="${bx - 5}" y1="${by - k * U}" x2="${bx + 5}" y2="${by - k * U}" stroke="${RED}" stroke-width="2"/><text x="${bx + 10}" y="${by - k * U + 4}" font-size="14" fill="${RED}">${k}</text>`;
  s += `<line x1="${bx - U}" y1="${by - 5}" x2="${bx - U}" y2="${by + 5}" stroke="${GREEN}" stroke-width="2"/><text x="${bx - U}" y="${by - 10}" text-anchor="middle" font-size="14" fill="${GREEN}">1</text>`;
  s += `<text x="${bx + 8}" y="${by - 2.75 * U}" fill="${RED}" font-weight="700">${sub('x', 'B')}</text><text x="${bx - 1.85 * U}" y="${by + 5}" text-anchor="end" fill="${GREEN}" font-weight="700">${sub('y', 'B')}</text>`;
  s += `<circle cx="${bx}" cy="${by}" r="3.5" fill="currentColor"/><text x="${bx + 8}" y="${by + 16}" font-size="14">${sub('O', 'B')}</text>`;
  // the path to P in B: 2 along x_B (up), then 1 along y_B (left)
  const px = X(2), py = Y(3);
  s += `<line x1="${bx + 30}" y1="${by - 4}" x2="${bx + 30}" y2="${py + 6}" stroke="${RED}" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#mkax)"/><text x="${bx + 38}" y="${(by + py) / 2 + 4}" font-size="14" fill="${RED}">+2</text>`;
  s += `<line x1="${bx - 4}" y1="${py - 12}" x2="${px + 8}" y2="${py - 12}" stroke="${GREEN}" stroke-width="1.6" stroke-dasharray="4 3" marker-end="url(#mkax)"/><text x="${(bx + px) / 2}" y="${py - 20}" text-anchor="middle" font-size="14" fill="${GREEN}">+1</text>`;
  // P, with its projections on the axes of A
  s += `<line x1="${px}" y1="${py}" x2="${px}" y2="${Y(0)}" stroke="#9aa5b4" stroke-dasharray="2 4"/><line x1="${px}" y1="${py}" x2="${X(0)}" y2="${py}" stroke="#9aa5b4" stroke-dasharray="2 4"/>`;
  s += `<circle class="pt" cx="${px}" cy="${py}" r="6"/><text x="${px - 10}" y="${py - 10}" text-anchor="end" class="c-pt" font-weight="700">P</text>`;
  // what the reader should find
  s += `<text x="${X(6.9)}" y="${Y(4.6)}" font-size="15" font-weight="700">${svgtx('Frame A: fixed', 'Repère A : fixe')}</text><text x="${X(6.9)}" y="${Y(4.15)}" font-size="15" font-weight="700">${svgtx('Frame B: at (3, 1),', 'Repère B : en (3, 1),')}</text><text x="${X(6.9)}" y="${Y(3.7)}" font-size="15" font-weight="700">${svgtx('turned by 90°', 'tourné de 90°')}</text>`;
  s += `<text x="${X(6.9)}" y="${Y(2.9)}" font-size="16">${svgtx('P in A: (2, 3)', 'P dans A : (2, 3)')}</text><text x="${X(6.9)}" y="${Y(2.35)}" font-size="16">${svgtx('P in B: (2, 1)', 'P dans B : (2, 1)')}</text>`;
  s += `<text x="${X(6.9)}" y="${Y(1.6)}" font-size="14" fill="#9aa5b4">${svgtx('1 square = 1 unit', '1 carreau = 1 unité')}</text>`;
  return FIG('0 0 610 300', s);
}

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Rotation matrices', 'Les matrices de rotation'],
  time: 12,
  goal: ['to build the matrix that turns a vector by an angle, its properties, and the three rotations of 3D space.', 'à construire la matrice qui fait tourner un vecteur d\'un angle, ses propriétés, et les trois rotations de l\'espace 3D.'],
  body: [
    H4('4.1 Build it from its columns', '4.1 La construire à partir de ses colonnes'),
    P('We want the matrix that turns every vector by an angle <i>θ</i> (counter-clockwise). Use the idea of lesson 3: <strong>where do the axes go?</strong>',
      'On veut la matrice qui fait tourner tout vecteur d\'un angle <i>θ</i> (sens inverse des aiguilles d\'une montre). Utilisons l\'idée de la leçon 3 : <strong>où vont les axes ?</strong>'),
    FIG('-40 0 380 200', `${AXM}
      <line class="ax" x1="40" y1="165" x2="310" y2="165"/><line class="ax" x1="150" y1="190" x2="150" y2="15"/>
      <text x="316" y="169">x</text><text x="146" y="12" text-anchor="end">y</text>
      ${frame(150, 165, 30, 120, "x'", "y'")}
      <path class="arc" d="M200,165 A50,50 0 0 0 193.3,140"/><text x="206" y="152">θ</text>
      <line class="dash" x1="253.9" y1="105" x2="253.9" y2="165"/><line class="dash" x1="90" y1="61.1" x2="150" y2="61.1"/>
      <text x="160" y="92" fill="${RED}">${svgtx('(cos θ, sin θ)')}</text><text x="72" y="42" text-anchor="end" fill="${GREEN}">${svgtx('(−sin θ, cos θ)')}</text>`),
    UL([
      [`The x axis ${MX(1, ['1', '0'])} turns to ${MX(1, ['cos <i>θ</i>', 'sin <i>θ</i>'])} (lesson 1). This is the first column.`, `L'axe x ${MX(1, ['1', '0'])} tourne vers ${MX(1, ['cos <i>θ</i>', 'sin <i>θ</i>'])} (leçon 1). C'est la première colonne.`],
      [`The y axis ${MX(1, ['0', '1'])} turns to ${MX(1, ['−sin <i>θ</i>', 'cos <i>θ</i>'])}. This is the second column.`, `L'axe y ${MX(1, ['0', '1'])} tourne vers ${MX(1, ['−sin <i>θ</i>', 'cos <i>θ</i>'])}. C'est la deuxième colonne.`]
    ]),
    BOX('keep', ['The rotation matrix in the plane', 'La matrice de rotation dans le plan'],
      EQ(`<i>R</i>(<i>θ</i>) = ${MX(2, ['cos <i>θ</i>', '−sin <i>θ</i>', 'sin <i>θ</i>', 'cos <i>θ</i>'])}`)),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P(`Turn the vector ${MX(1, ['2', '1'])} by 30° (cos = 0.866, sin = 0.5): ${MX(2, ['0.866', '−0.5', '0.5', '0.866'])} ${MX(1, ['2', '1'])} = ${MX(1, ['0.866×2 − 0.5×1', '0.5×2 + 0.866×1'])} = ${MX(1, ['<strong>1.232</strong>', '<strong>1.866</strong>'])}. The length did not change: √(2² + 1²) = √(1.232² + 1.866²) = 2.236.`,
        `Tournons le vecteur ${MX(1, ['2', '1'])} de 30° (cos = 0,866, sin = 0,5) : ${MX(2, ['0,866', '−0,5', '0,5', '0,866'])} ${MX(1, ['2', '1'])} = ${MX(1, ['0,866×2 − 0,5×1', '0,5×2 + 0,866×1'])} = ${MX(1, ['<strong>1,232</strong>', '<strong>1,866</strong>'])}. La longueur n'a pas changé : √(2² + 1²) = √(1,232² + 1,866²) = 2,236.`)),
    H4('4.2 Four properties to remember', '4.2 Quatre propriétés à retenir'),
    TABLE([['Property', 'Propriété'], ['Why', 'Pourquoi'], ['What it gives you', 'Ce que ça vous apporte']], [
      [['The columns have length 1 and are perpendicular.', 'Les colonnes sont de longueur 1 et perpendiculaires.'], ['They are the axes of a frame.', 'Ce sont les axes d\'un repère.'], ['A quick check of any rotation matrix.', 'Une vérification rapide de toute matrice de rotation.']],
      [['det <i>R</i> = 1', 'dét <i>R</i> = 1'], ['cos² <i>θ</i> + sin² <i>θ</i> = 1: a rotation does not change sizes.', 'cos² <i>θ</i> + sin² <i>θ</i> = 1 : une rotation ne change pas les tailles.'], ['A rotation can always be undone.', 'Une rotation peut toujours se défaire.']],
      [['<i>R</i><sup>−1</sup> = <i>R</i><sup>T</sup> = <i>R</i>(−<i>θ</i>)', '<i>R</i><sup>−1</sup> = <i>R</i><sup>T</sup> = <i>R</i>(−<i>θ</i>)'], ['To undo a rotation, turn back by the same angle.', 'Pour défaire une rotation, on tourne du même angle dans l\'autre sens.'], ['The inverse costs nothing: swap rows and columns.', 'L\'inverse ne coûte rien : on échange lignes et colonnes.']],
      [['<i>R</i>(<i>a</i>) <i>R</i>(<i>b</i>) = <i>R</i>(<i>a</i> + <i>b</i>)', '<i>R</i>(<i>a</i>) <i>R</i>(<i>b</i>) = <i>R</i>(<i>a</i> + <i>b</i>)'], ['Turning by <i>b</i> then by <i>a</i> is turning by <i>a</i> + <i>b</i>.', 'Tourner de <i>b</i> puis de <i>a</i>, c\'est tourner de <i>a</i> + <i>b</i>.'], ['In a planar arm the angles add: <i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>.', 'Dans un bras plan, les angles s\'ajoutent : <i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>.']]
    ]),
    H4('4.3 Rotations in space', '4.3 Les rotations dans l\'espace'),
    P('In 3D a rotation turns <strong>around an axis</strong>. The positive direction is given by the right hand: thumb along the axis, the fingers show the positive rotation. The three basic rotations keep one axis fixed (its row and column are 0, 0, 1):',
      'En 3D, une rotation tourne <strong>autour d\'un axe</strong>. Le sens positif est donné par la main droite : pouce selon l\'axe, les doigts montrent la rotation positive. Les trois rotations de base gardent un axe fixe (sa ligne et sa colonne valent 0, 0, 1) :'),
    EQ(`<i>R</i><sub>z</sub>(<i>θ</i>) = ${MX(3, ['c', '−s', '0', 's', 'c', '0', '0', '0', '1'])}    <i>R</i><sub>y</sub>(<i>θ</i>) = ${MX(3, ['c', '0', 's', '0', '1', '0', '−s', '0', 'c'])}    <i>R</i><sub>x</sub>(<i>θ</i>) = ${MX(3, ['1', '0', '0', '0', 'c', '−s', '0', 's', 'c'])}`),
    P('with c = cos <i>θ</i> and s = sin <i>θ</i>. <i>R</i><sub>z</sub> is the plane rotation of 4.1 with a third axis that does not move: it is the rotation of a revolute joint around its own z axis, the one you will meet in every DH table.',
      'avec c = cos <i>θ</i> et s = sin <i>θ</i>. <i>R</i><sub>z</sub> est la rotation plane du 4.1 avec un troisième axe qui ne bouge pas : c\'est la rotation d\'une liaison rotoïde autour de son propre axe z, celle que vous retrouverez dans tous les tableaux DH.'),
    BOX('warn', ['In 3D the order of rotations matters', 'En 3D, l\'ordre des rotations compte'],
      P('Take the x axis (1, 0, 0). Turn it by 90° around x (nothing happens), then by 90° around z: it becomes (0, 1, 0). In the other order, 90° around z gives (0, 1, 0), then 90° around x gives <strong>(0, 0, 1)</strong>. Two different results. In the plane the order did not matter; in space it does. Try it with a book in your hands.',
        'Prenez l\'axe x (1, 0, 0). Tournez-le de 90° autour de x (rien ne se passe), puis de 90° autour de z : il devient (0, 1, 0). Dans l\'autre ordre, 90° autour de z donne (0, 1, 0), puis 90° autour de x donne <strong>(0, 0, 1)</strong>. Deux résultats différents. Dans le plan l\'ordre ne comptait pas ; dans l\'espace, si. Essayez avec un livre dans les mains.'))
  ],
  terms: [['rotation matrix', 'matrice de rotation'], ['right-hand rule', 'règle de la main droite'], ['orthogonal matrix', 'matrice orthogonale']],
  quiz: [
    ['What is the first column of R(θ)?', 'Quelle est la première colonne de R(θ) ?', '(cos θ, sin θ): where the x axis goes.', '(cos θ, sin θ) : là où va l\'axe x.'],
    ['How do you invert a rotation matrix?', 'Comment inverse-t-on une matrice de rotation ?', 'Take its transpose: R⁻¹ = Rᵀ.', 'On prend sa transposée : R⁻¹ = Rᵀ.'],
    ['Does the order of two rotations matter?', 'L\'ordre de deux rotations compte-t-il ?', 'Not in the plane (the angles add). In 3D yes, when the axes differ.', 'Pas dans le plan (les angles s\'ajoutent). En 3D oui, quand les axes sont différents.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Frames and transformations', 'Repères et transformations'],
  time: 14,
  goal: ['to go from one frame to another with a rotation and a translation, and to pack both in one homogeneous matrix that you can chain.', 'à passer d\'un repère à un autre avec une rotation et une translation, et à ranger les deux dans une seule matrice homogène que l\'on peut enchaîner.'],
  body: [
    H4('5.1 The same point, seen from two frames', '5.1 Le même point, vu depuis deux repères'),
    P('A <strong>frame</strong> is an origin and axes: a place from which you measure. A robot has many: one on the floor, one on each link, one on the tool, one on the camera. The same point has <strong>different coordinates in each frame</strong>.',
      'Un <strong>repère</strong> est une origine et des axes : un endroit d\'où l\'on mesure. Un robot en a beaucoup : un au sol, un sur chaque segment, un sur l\'outil, un sur la caméra. Le même point a des <strong>coordonnées différentes dans chaque repère</strong>.'),
    frameFig(),
    UL([
      ['<strong>How to name a frame.</strong> A frame is an origin O and two perpendicular axes x and y (z in 3D). The small letter under each name says which frame it belongs to: O<sub>A</sub>, x<sub>A</sub>, y<sub>A</sub> are the axes of frame A; O<sub>B</sub>, x<sub>B</sub>, y<sub>B</sub> those of frame B. Red is always x, green is always y.',
       '<strong>Comment nommer un repère.</strong> Un repère, c\'est une origine O et deux axes perpendiculaires x et y (z en 3D). La petite lettre sous chaque nom dit à quel repère il appartient : O<sub>A</sub>, x<sub>A</sub>, y<sub>A</sub> sont les axes du repère A ; O<sub>B</sub>, x<sub>B</sub>, y<sub>B</sub> ceux du repère B. Le rouge est toujours x, le vert toujours y.'],
      ['<strong>How to read the coordinates.</strong> Each axis is graduated in units (here 1 square = 1). For frame A, start at O<sub>A</sub>: P is 2 graduations along x<sub>A</sub> (to the right) and 3 along y<sub>A</sub> (up), so P = (2, 3) in A.',
       '<strong>Comment lire les coordonnées.</strong> Chaque axe est gradué en unités (ici 1 carreau = 1). Pour le repère A, partez de O<sub>A</sub> : P est à 2 graduations selon x<sub>A</sub> (vers la droite) et 3 selon y<sub>A</sub> (vers le haut), donc P = (2, 3) dans A.'],
      ['<strong>The same point for B.</strong> Frame B is turned by 90°: its x<sub>B</sub> axis points up and its y<sub>B</sub> axis points to the left. Start at O<sub>B</sub>: go 2 graduations along x<sub>B</sub> (up), then 1 along y<sub>B</sub> (to the left): you reach P. So P = (2, 1) in B.',
       '<strong>Le même point pour B.</strong> Le repère B est tourné de 90° : son axe x<sub>B</sub> va vers le haut et son axe y<sub>B</sub> vers la gauche. Partez de O<sub>B</sub> : avancez de 2 graduations selon x<sub>B</sub> (vers le haut), puis de 1 selon y<sub>B</sub> (vers la gauche) : vous arrivez sur P. Donc P = (2, 1) dans B.']
    ]),
    P('Frame B sits at <strong>t</strong> = (3, 1) in frame A, and is turned by 90°. The point P is at (2, 1) for B. Where is it for A? Two steps: <strong>turn</strong> the coordinates with the rotation of B, then <strong>add</strong> the position of B.',
      'Le repère B est en <strong>t</strong> = (3, 1) dans le repère A, et il est tourné de 90°. Le point P est en (2, 1) pour B. Où est-il pour A ? Deux étapes : <strong>tourner</strong> les coordonnées avec la rotation de B, puis <strong>ajouter</strong> la position de B.'),
    BOX('keep', ['Change of frame', 'Changement de repère'],
      EQ('<strong>p</strong><sub>A</sub> = <i>R</i> <strong>p</strong><sub>B</sub> + <strong>t</strong>'),
      P('<i>R</i> = the orientation of B seen from A (its columns are the axes of B, written in A). <strong>t</strong> = the origin of B, written in A.',
        '<i>R</i> = l\'orientation de B vue depuis A (ses colonnes sont les axes de B, écrits dans A). <strong>t</strong> = l\'origine de B, écrite dans A.')),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P(`<i>R</i>(90°) = ${MX(2, ['0', '−1', '1', '0'])}. <strong>p</strong><sub>A</sub> = ${MX(2, ['0', '−1', '1', '0'])} ${MX(1, ['2', '1'])} + ${MX(1, ['3', '1'])} = ${MX(1, ['−1', '2'])} + ${MX(1, ['3', '1'])} = ${MX(1, ['<strong>2</strong>', '<strong>3</strong>'])}. Check on the picture: from B, go 2 along x<sub>B</sub> (up) and 1 along y<sub>B</sub> (left).`,
        `<i>R</i>(90°) = ${MX(2, ['0', '−1', '1', '0'])}. <strong>p</strong><sub>A</sub> = ${MX(2, ['0', '−1', '1', '0'])} ${MX(1, ['2', '1'])} + ${MX(1, ['3', '1'])} = ${MX(1, ['−1', '2'])} + ${MX(1, ['3', '1'])} = ${MX(1, ['<strong>2</strong>', '<strong>3</strong>'])}. Vérifiez sur le dessin : depuis B, on avance de 2 selon x<sub>B</sub> (vers le haut) et de 1 selon y<sub>B</sub> (vers la gauche).`)),
    H4('5.2 One matrix for both: the homogeneous matrix', '5.2 Une seule matrice pour les deux : la matrice homogène'),
    P('“Multiply, then add” is not practical to chain ten frames. The trick: add a <strong>1</strong> under every point, and put <i>R</i> and <strong>t</strong> in one bigger matrix. One product now does the rotation and the translation:',
      '« Multiplier, puis ajouter » n\'est pas pratique pour enchaîner dix repères. L\'astuce : ajouter un <strong>1</strong> sous chaque point, et ranger <i>R</i> et <strong>t</strong> dans une seule matrice plus grande. Un seul produit fait alors la rotation et la translation :'),
    EQ(`${MX(1, ['<strong>p</strong><sub>A</sub>', '1'])} = ${MX(2, ['<i>R</i>', '<strong>t</strong>', '0', '1'])} ${MX(1, ['<strong>p</strong><sub>B</sub>', '1'])} &emsp;&emsp; <sup>A</sup><i>T</i><sub>B</sub> = ${MX(2, ['<i>R</i>', '<strong>t</strong>', '0', '1'])}`),
    P(`In the plane it is a 3×3 matrix; in space a <strong>4×4</strong> matrix (<i>R</i> is 3×3, <strong>t</strong> has 3 numbers, the last row is always 0 0 0 1). With our example: ${MX(3, ['0', '−1', '3', '1', '0', '1', '0', '0', '1'])} ${MX(1, ['2', '1', '1'])} = ${MX(1, ['0×2 − 1×1 + 3×1', '1×2 + 0×1 + 1×1', '1'])} = ${MX(1, ['2', '3', '1'])}.`,
      `Dans le plan, c'est une matrice 3×3 ; dans l'espace, une matrice <strong>4×4</strong> (<i>R</i> est 3×3, <strong>t</strong> a 3 nombres, la dernière ligne vaut toujours 0 0 0 1). Avec notre exemple : ${MX(3, ['0', '−1', '3', '1', '0', '1', '0', '0', '1'])} ${MX(1, ['2', '1', '1'])} = ${MX(1, ['0×2 − 1×1 + 3×1', '1×2 + 0×1 + 1×1', '1'])} = ${MX(1, ['2', '3', '1'])}.`),
    BOX('idea', ['How to read a homogeneous matrix', 'Comment lire une matrice homogène'],
      UL([
        ['The <strong>last column</strong> is the position of the frame: where it is.', 'La <strong>dernière colonne</strong> est la position du repère : où il est.'],
        ['The <strong>other columns</strong> are its axes: how it is turned.', 'Les <strong>autres colonnes</strong> sont ses axes : comment il est tourné.'],
        ['A <strong>point</strong> ends with 1 (the translation applies); a <strong>direction</strong> ends with 0 (it is only turned).', 'Un <strong>point</strong> se termine par 1 (la translation s\'applique) ; une <strong>direction</strong> se termine par 0 (elle est seulement tournée).']
      ])),
    H4('5.3 Chaining frames: this is forward kinematics', '5.3 Enchaîner les repères : c\'est la cinématique directe'),
    EQ('<sup>0</sup><i>T</i><sub>2</sub> = <sup>0</sup><i>T</i><sub>1</sub> <sup>1</sup><i>T</i><sub>2</sub>'),
    P('To go from frame 2 to frame 0, go through frame 1: multiply the matrices. Reading trick: the indices that touch “cancel” (the 1 below and the 1 above). For a robot with <i>n</i> joints: <sup>0</sup><i>T</i><sub>n</sub> = <sup>0</sup><i>T</i><sub>1</sub> <sup>1</sup><i>T</i><sub>2</sub> … <sup>n−1</sup><i>T</i><sub>n</sub>, and the last column of the result is the position of the tool.',
      'Pour aller du repère 2 au repère 0, on passe par le repère 1 : on multiplie les matrices. Astuce de lecture : les indices qui se touchent « s\'annulent » (le 1 du bas et le 1 du haut). Pour un robot à <i>n</i> liaisons : <sup>0</sup><i>T</i><sub>n</sub> = <sup>0</sup><i>T</i><sub>1</sub> <sup>1</sup><i>T</i><sub>2</sub> … <sup>n−1</sup><i>T</i><sub>n</sub>, et la dernière colonne du résultat est la position de l\'outil.'),
    BOX('example', ['Worked example: a 2-axis arm', 'Exemple résolu : un bras à 2 axes'],
      P(`<i>L</i><sub>1</sub> = 0.5 m, <i>L</i><sub>2</sub> = 0.4 m, <i>θ</i><sub>1</sub> = 30°, <i>θ</i><sub>2</sub> = 45°. Each matrix says “turn by <i>θ</i>, then move forward by <i>L</i> along the new x”: its last column is (<i>L</i> cos <i>θ</i>, <i>L</i> sin <i>θ</i>).`,
        `<i>L</i><sub>1</sub> = 0,5 m, <i>L</i><sub>2</sub> = 0,4 m, <i>θ</i><sub>1</sub> = 30°, <i>θ</i><sub>2</sub> = 45°. Chaque matrice dit « tourner de <i>θ</i>, puis avancer de <i>L</i> selon le nouvel x » : sa dernière colonne vaut (<i>L</i> cos <i>θ</i>, <i>L</i> sin <i>θ</i>).`),
      EQ(`<sup>0</sup><i>T</i><sub>1</sub> = ${MX(3, ['0.866', '−0.5', '0.433', '0.5', '0.866', '0.25', '0', '0', '1'])}   <sup>1</sup><i>T</i><sub>2</sub> = ${MX(3, ['0.707', '−0.707', '0.283', '0.707', '0.707', '0.283', '0', '0', '1'])}   <sup>0</sup><i>T</i><sub>2</sub> = ${MX(3, ['0.259', '−0.966', '<strong>0.537</strong>', '0.966', '0.259', '<strong>0.636</strong>', '0', '0', '1'])}`,
        `<sup>0</sup><i>T</i><sub>1</sub> = ${MX(3, ['0,866', '−0,5', '0,433', '0,5', '0,866', '0,25', '0', '0', '1'])}   <sup>1</sup><i>T</i><sub>2</sub> = ${MX(3, ['0,707', '−0,707', '0,283', '0,707', '0,707', '0,283', '0', '0', '1'])}   <sup>0</sup><i>T</i><sub>2</sub> = ${MX(3, ['0,259', '−0,966', '<strong>0,537</strong>', '0,966', '0,259', '<strong>0,636</strong>', '0', '0', '1'])}`),
      P('The tool is at <i>x</i> = 0.537 m, <i>y</i> = 0.636 m. The same as the sum of arrows of lesson 2: 0.5 cos 30° + 0.4 cos 75° = 0.537 and 0.5 sin 30° + 0.4 sin 75° = 0.636. And the top-left block is a rotation of 75° = 30° + 45°: the orientation of the tool.',
        'L\'outil est en <i>x</i> = 0,537 m, <i>y</i> = 0,636 m. Comme la somme de flèches de la leçon 2 : 0,5 cos 30° + 0,4 cos 75° = 0,537 et 0,5 sin 30° + 0,4 sin 75° = 0,636. Et le bloc en haut à gauche est une rotation de 75° = 30° + 45° : l\'orientation de l\'outil.')),
    H4('5.4 Going back: the inverse', '5.4 Revenir en arrière : l\'inverse'),
    EQ(`(<sup>A</sup><i>T</i><sub>B</sub>)<sup>−1</sup> = <sup>B</sup><i>T</i><sub>A</sub> = ${MX(2, ['<i>R</i><sup>T</sup>', '−<i>R</i><sup>T</sup> <strong>t</strong>', '0', '1'])}`),
    P('No heavy computation: transpose the rotation, and turn the translation back. It answers the opposite question: “where is A, seen from B?”',
      'Pas de gros calcul : on transpose la rotation, et on ramène la translation. Elle répond à la question inverse : « où est A, vu depuis B ? »')
  ],
  terms: [['frame', 'repère'], ['translation', 'translation'], ['homogeneous matrix', 'matrice homogène'], ['homogeneous coordinates', 'coordonnées homogènes'], ['chain of transformations', 'chaîne de transformations']],
  quiz: [
    ['In a homogeneous matrix, where do you read the position of the frame?', 'Dans une matrice homogène, où lit-on la position du repère ?', 'In the last column (above the final 1).', 'Dans la dernière colonne (au-dessus du 1 final).'],
    ['Why do we add a 1 under the coordinates of a point?', 'Pourquoi ajoute-t-on un 1 sous les coordonnées d\'un point ?', 'So that one matrix product does both the rotation and the translation, and transformations can be chained by multiplying.', 'Pour qu\'un seul produit de matrices fasse à la fois la rotation et la translation, et que l\'on puisse enchaîner les transformations en multipliant.'],
    ['How do you get the transformation from frame 3 to frame 0?', 'Comment obtient-on la transformation du repère 3 au repère 0 ?', 'Multiply in order: ⁰T₃ = ⁰T₁ ¹T₂ ²T₃.', 'On multiplie dans l\'ordre : ⁰T₃ = ⁰T₁ ¹T₂ ²T₃.']
  ]
})
  ];
}
