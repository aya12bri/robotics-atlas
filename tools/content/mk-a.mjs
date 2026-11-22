// The maths of robotics, lessons 1 to 3: angles and trigonometry, vectors, matrices.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, TRY, lesson } from '../lib.mjs';
const PRE = 'mk-';
import { grid } from './mk-grid.mjs';
// lesson 2.2: a + b on a graduated grid (1 square = 1), each arrow with its steps right and up
function vecFig() {
  const G = grid({ OX: 60, OY: 250, U: 50, x1: 5, y1: 4 }), { X, Y } = G;
  const arr = (u0, v0, u1, v1, c, w) => `<line x1="${X(u0)}" y1="${Y(v0)}" x2="${X(u1)}" y2="${Y(v1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" marker-end="url(#mkg2)"/>`;
  let s = G.s + '<defs><marker id="mkg2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(4)}" y2="${Y(3)}" stroke="#8a94a3" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#mkg)"/>`;
  s += arr(0, 0, 3, 1, '#2f6bff', 5) + arr(3, 1, 4, 3, '#e07b00', 5);
  // the steps of each arrow: right, then up
  s += `<line x1="${X(0)}" y1="${Y(0) + 0}" x2="${X(3)}" y2="${Y(0)}" stroke="#2f6bff" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/><line x1="${X(3)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(1)}" stroke="#2f6bff" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/>`;
  s += `<line x1="${X(3)}" y1="${Y(1)}" x2="${X(4)}" y2="${Y(1)}" stroke="#e07b00" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/><line x1="${X(4)}" y1="${Y(1)}" x2="${X(4)}" y2="${Y(3)}" stroke="#e07b00" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/>`;
  s += `<circle cx="${X(0)}" cy="${Y(0)}" r="5" fill="currentColor"/><circle cx="${X(3)}" cy="${Y(1)}" r="5" fill="currentColor"/><circle cx="${X(4)}" cy="${Y(3)}" r="6" fill="#e5484d"/>`;
  s += `<text x="${X(1.55)}" y="${Y(0.14)}" font-size="16" font-weight="700" fill="#2f6bff">a = (3, 1)</text>`;
  s += `<text x="${X(4.15)}" y="${Y(2)}" font-size="16" font-weight="700" fill="#e07b00">b = (1, 2)</text>`;
  s += `<text x="${X(1.2)}" y="${Y(2.4)}" font-size="16" font-weight="700" fill="#5d6878">a + b = (4, 3)</text>`;
  s += `<text x="${X(6.4)}" y="${Y(3.6)}" font-size="14" fill="currentColor">${svgtx('a: 3 right, 1 up', 'a : 3 à droite, 1 en haut')}</text><text x="${X(6.4)}" y="${Y(3.1)}" font-size="14" fill="currentColor">${svgtx('b: 1 right, 2 up', 'b : 1 à droite, 2 en haut')}</text>`;
  s += `<text x="${X(6.4)}" y="${Y(2.4)}" font-size="14" font-weight="700" fill="currentColor">${svgtx('a + b: 3 + 1 = 4 right,', 'a + b : 3 + 1 = 4 à droite,')}</text><text x="${X(6.4)}" y="${Y(1.95)}" font-size="14" font-weight="700" fill="currentColor">${svgtx('1 + 2 = 3 up', '1 + 2 = 3 en haut')}</text>`;
  s += `<text x="${X(6.4)}" y="${Y(1.2)}" font-size="13" fill="#8a94a3">${svgtx('1 square = 1 unit', '1 carreau = 1 unité')}</text>`;
  return `<figure class="figure wide"><svg viewBox="0 0 640 290" class="fig" role="img" aria-hidden="true">${s}</svg></figure>`;
}
const n = (s) => [s, s.replace(/(\d)\.(\d)/g, '$1,$2')];          // decimal point in English, comma in French

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Angles and trigonometry', 'Angles et trigonométrie'],
  time: 10,
  goal: ['to measure an angle in degrees and radians, to use sine and cosine to find a point, and atan2 to find an angle.', 'à mesurer un angle en degrés et en radians, à utiliser sinus et cosinus pour trouver un point, et atan2 pour trouver un angle.'],
  body: [
    H4('1.1 Degrees and radians', '1.1 Degrés et radians'),
    P('A robot joint turns by an <strong>angle</strong>. We know degrees: a full turn is 360°. Computers and formulas use <strong>radians</strong>: a full turn is 2π ≈ 6.28 rad. So:',
      'Une articulation de robot tourne d\'un <strong>angle</strong>. On connaît les degrés : un tour complet fait 360°. Les ordinateurs et les formules utilisent les <strong>radians</strong> : un tour complet fait 2π ≈ 6,28 rad. Donc :'),
    EQ('radians = degrees × π / 180 &emsp;&emsp; degrees = radians × 180 / π', 'radians = degrés × π / 180 &emsp;&emsp; degrés = radians × 180 / π'),
    TABLE([['Degrees', 'Degrés'], '0°', '30°', '45°', '90°', '180°', '360°'], [[['Radians', 'Radians'], '0', n('π/6 ≈ 0.52'), n('π/4 ≈ 0.79'), n('π/2 ≈ 1.57'), n('π ≈ 3.14'), n('2π ≈ 6.28')]]),
    BOX('idea', ['Why radians?', 'Pourquoi les radians ?'],
      P('With radians, the length of an arc is simply <strong>radius × angle</strong>. A wheel of radius 0.1 m that turns by 2 rad rolls 0.1 × 2 = 0.2 m. No factor to remember.',
        'Avec les radians, la longueur d\'un arc est simplement <strong>rayon × angle</strong>. Une roue de rayon 0,1 m qui tourne de 2 rad roule de 0,1 × 2 = 0,2 m. Aucun facteur à retenir.')),
    H4('1.2 Sine and cosine: where is the end of the arm?', '1.2 Sinus et cosinus : où est le bout du bras ?'),
    P('Take an arm of length <i>L</i>, fixed at the origin, tilted by an angle <i>θ</i> from the x axis. Its end is at:',
      'Prenez un bras de longueur <i>L</i>, fixé à l\'origine, incliné d\'un angle <i>θ</i> par rapport à l\'axe x. Son extrémité est en :'),
    EQ('<i>x</i> = <i>L</i> cos <i>θ</i> &emsp;&emsp; <i>y</i> = <i>L</i> sin <i>θ</i>'),
    FIG('0 0 340 190', `
      <line class="ax" x1="40" y1="160" x2="300" y2="160"/><line class="ax" x1="80" y1="180" x2="80" y2="20"/>
      <text x="308" y="164">x</text><text x="76" y="14" text-anchor="end">y</text>
      <line class="link1" x1="80" y1="160" x2="219.4" y2="62.4"/><circle class="jt" cx="80" cy="160" r="5"/><circle class="pt" cx="219.4" cy="62.4" r="5"/>
      <line class="dash" x1="219.4" y1="62.4" x2="219.4" y2="160"/><line class="dash" x1="219.4" y1="62.4" x2="80" y2="62.4"/>
      <path class="arc" d="M120,160 A40,40 0 0 0 112.8,137.1"/><text x="128" y="148">θ</text>
      <text x="140" y="100" class="c-l">L</text>
      <text x="150" y="178" text-anchor="middle" class="c-x">${svgtx('x = L cos θ')}</text><text x="90" y="54" class="c-y">${svgtx('y = L sin θ')}</text>`),
    P('The cosine gives the part of the arm <strong>along x</strong>, the sine the part <strong>along y</strong>. Values to know by heart:',
      'Le cosinus donne la part du bras <strong>selon x</strong>, le sinus la part <strong>selon y</strong>. Valeurs à connaître par cœur :'),
    TABLE(['θ', '0°', '30°', '45°', '60°', '90°', '180°'], [['cos θ', '1', n('0.866'), n('0.707'), n('0.5'), '0', '−1'], ['sin θ', '0', n('0.5'), n('0.707'), n('0.866'), '1', '0']]),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('An arm of 0.8 m at 30°: <i>x</i> = 0.8 × 0.866 = <strong>0.693 m</strong>, <i>y</i> = 0.8 × 0.5 = <strong>0.4 m</strong>. Check with Pythagoras: √(0.693² + 0.4²) = 0.8 m, the length of the arm.',
        'Un bras de 0,8 m à 30° : <i>x</i> = 0,8 × 0,866 = <strong>0,693 m</strong>, <i>y</i> = 0,8 × 0,5 = <strong>0,4 m</strong>. Vérification avec Pythagore : √(0,693² + 0,4²) = 0,8 m, la longueur du bras.')),
    H4('1.3 Two formulas you will meet everywhere', '1.3 Deux formules que vous croiserez partout'),
    UL([
      ['<strong>Pythagoras</strong>: cos² <i>θ</i> + sin² <i>θ</i> = 1. The distance from the origin to the point (<i>x</i>, <i>y</i>) is √(<i>x</i>² + <i>y</i>²).', '<strong>Pythagore</strong> : cos² <i>θ</i> + sin² <i>θ</i> = 1. La distance de l\'origine au point (<i>x</i>, <i>y</i>) vaut √(<i>x</i>² + <i>y</i>²).'],
      ['<strong>Sum of angles</strong>: cos(<i>a</i> + <i>b</i>) = cos <i>a</i> cos <i>b</i> − sin <i>a</i> sin <i>b</i>, and sin(<i>a</i> + <i>b</i>) = sin <i>a</i> cos <i>b</i> + cos <i>a</i> sin <i>b</i>. This is why a 2-axis arm has terms in cos(<i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>).', '<strong>Somme d\'angles</strong> : cos(<i>a</i> + <i>b</i>) = cos <i>a</i> cos <i>b</i> − sin <i>a</i> sin <i>b</i>, et sin(<i>a</i> + <i>b</i>) = sin <i>a</i> cos <i>b</i> + cos <i>a</i> sin <i>b</i>. C\'est pour cela qu\'un bras à 2 axes a des termes en cos(<i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>).']
    ]),
    H4('1.4 The other way: from a point to an angle (atan2)', '1.4 Dans l\'autre sens : d\'un point à un angle (atan2)'),
    P('You know the point (<i>x</i>, <i>y</i>) and want the angle. Use <strong><i>θ</i> = atan2(<i>y</i>, <i>x</i>)</strong>, found in every programming language. Note the order: <i>y</i> first.',
      'Vous connaissez le point (<i>x</i>, <i>y</i>) et voulez l\'angle. Utilisez <strong><i>θ</i> = atan2(<i>y</i>, <i>x</i>)</strong>, présent dans tous les langages de programmation. Attention à l\'ordre : <i>y</i> d\'abord.'),
    BOX('warn', ['Never use arctan(y / x) alone', 'N\'utilisez jamais arctan(y / x) tout seul'],
      P('The points (1, 1) and (−1, −1) have the same ratio <i>y</i>/<i>x</i> = 1, so arctan gives 45° for both. But the second one is at −135°. atan2 looks at the signs of <i>x</i> and <i>y</i> and gives the right angle over the full turn, even when <i>x</i> = 0.',
        'Les points (1, 1) et (−1, −1) ont le même rapport <i>y</i>/<i>x</i> = 1, donc arctan donne 45° pour les deux. Or le second est à −135°. atan2 regarde les signes de <i>x</i> et <i>y</i> et donne le bon angle sur le tour complet, même quand <i>x</i> = 0.'))
  ],
  terms: [['radian', 'radian'], ['sine / cosine', 'sinus / cosinus'], ['Pythagoras', 'Pythagore'], ['atan2', 'atan2']],
  quiz: [
    ['How many radians is 90°?', 'Combien de radians font 90° ?', 'π/2 ≈ 1.57 rad.', 'π/2 ≈ 1,57 rad.'],
    ['An arm of 2 m is at 60°. Where is its end?', 'Un bras de 2 m est à 60°. Où est son extrémité ?', '<i>x</i> = 2 × 0.5 = 1 m, <i>y</i> = 2 × 0.866 = 1.73 m.', '<i>x</i> = 2 × 0,5 = 1 m, <i>y</i> = 2 × 0,866 = 1,73 m.'],
    ['Why use atan2(y, x) and not arctan(y/x)?', 'Pourquoi utiliser atan2(y, x) et pas arctan(y/x) ?', 'atan2 uses the signs of x and y, so it gives the right angle in all four quadrants, and it works when x = 0.', 'atan2 utilise les signes de x et de y, il donne donc le bon angle dans les quatre quadrants, et il fonctionne quand x = 0.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Vectors', 'Les vecteurs'],
  time: 11,
  goal: ['what a vector is, how to add vectors, measure their length, and use the dot and cross products.', 'ce qu\'est un vecteur, comment additionner des vecteurs, mesurer leur longueur, et utiliser les produits scalaire et vectoriel.'],
  body: [
    H4('2.1 An arrow with numbers', '2.1 Une flèche avec des nombres'),
    P(`A <strong>vector</strong> is an arrow: it has a direction and a length. We write it as a column of numbers, its <strong>components</strong>: ${MX(1, ['3', '1'])} means “3 to the right, 1 up”. In space there is a third number for the height: ${MX(1, ['<i>x</i>', '<i>y</i>', '<i>z</i>'])}.`,
      `Un <strong>vecteur</strong> est une flèche : il a une direction et une longueur. On l'écrit comme une colonne de nombres, ses <strong>composantes</strong> : ${MX(1, ['3', '1'])} veut dire « 3 vers la droite, 1 vers le haut ». Dans l'espace il y a un troisième nombre pour la hauteur : ${MX(1, ['<i>x</i>', '<i>y</i>', '<i>z</i>'])}.`),
    P('In robotics vectors describe <strong>positions</strong> (where the tool is), <strong>speeds</strong> (how it moves), <strong>forces</strong> (how it pushes) and <strong>axes</strong> (around what a joint turns).',
      'En robotique, les vecteurs décrivent des <strong>positions</strong> (où est l\'outil), des <strong>vitesses</strong> (comment il bouge), des <strong>forces</strong> (comment il pousse) et des <strong>axes</strong> (autour de quoi tourne une liaison).'),
    H4('2.2 Adding vectors: one arrow after the other', '2.2 Additionner des vecteurs : une flèche après l\'autre'),
    P(`To chain two moves, add the components one by one: ${MX(1, ['3', '1'])} + ${MX(1, ['1', '2'])} = ${MX(1, ['4', '3'])}.`,
      `Pour enchaîner deux déplacements, on additionne les composantes une à une : ${MX(1, ['3', '1'])} + ${MX(1, ['1', '2'])} = ${MX(1, ['4', '3'])}.`),
    vecFig(),
    BOX('idea', ['This is a robot arm', 'C\'est un bras de robot'],
      P('Look at the picture again: the blue arrow is link 1, the orange arrow is link 2, and the dashed arrow goes from the base to the tool. <strong>The position of the tool is the sum of the arrows of the links.</strong> All of forward kinematics is in this sentence.',
        'Regardez de nouveau le dessin : la flèche bleue est le segment 1, la flèche orange le segment 2, et la flèche en pointillés va de la base à l\'outil. <strong>La position de l\'outil est la somme des flèches des segments.</strong> Toute la cinématique directe est dans cette phrase.')),
    H4('2.3 Length, scaling, unit vector', '2.3 Longueur, mise à l\'échelle, vecteur unitaire'),
    UL([
      ['<strong>Length</strong> (norm): ‖<strong>v</strong>‖ = √(<i>x</i>² + <i>y</i>² + <i>z</i>²). For (4, 3): √(16 + 9) = 5.', '<strong>Longueur</strong> (norme) : ‖<strong>v</strong>‖ = √(<i>x</i>² + <i>y</i>² + <i>z</i>²). Pour (4, 3) : √(16 + 9) = 5.'],
      ['<strong>Multiply by a number</strong>: every component is multiplied. 2 × (4, 3) = (8, 6): same direction, twice as long.', '<strong>Multiplier par un nombre</strong> : chaque composante est multipliée. 2 × (4, 3) = (8, 6) : même direction, deux fois plus long.'],
      ['<strong>Unit vector</strong>: a vector of length 1, used to give a direction only. Divide a vector by its length: (4, 3) / 5 = (0.8, 0.6).', '<strong>Vecteur unitaire</strong> : un vecteur de longueur 1, utilisé pour donner seulement une direction. On divise un vecteur par sa longueur : (4, 3) / 5 = (0,8 ; 0,6).']
    ]),
    H4('2.4 The dot product: how much two arrows agree', '2.4 Le produit scalaire : à quel point deux flèches vont dans le même sens'),
    EQ('<strong>a</strong> · <strong>b</strong> = <i>a</i><sub>x</sub><i>b</i><sub>x</sub> + <i>a</i><sub>y</sub><i>b</i><sub>y</sub> + <i>a</i><sub>z</sub><i>b</i><sub>z</sub> = ‖<strong>a</strong>‖ ‖<strong>b</strong>‖ cos <i>φ</i>'),
    P('The result is a <strong>number</strong>. <i>φ</i> is the angle between the two arrows. Three cases to remember:',
      'Le résultat est un <strong>nombre</strong>. <i>φ</i> est l\'angle entre les deux flèches. Trois cas à retenir :'),
    TABLE([['The arrows are…', 'Les flèches sont…'], ['Dot product', 'Produit scalaire'], ['Example', 'Exemple']], [
      [['in the same direction', 'dans le même sens'], ['positive, maximum', 'positif, maximal'], '(1, 0) · (2, 0) = 2'],
      [['perpendicular', 'perpendiculaires'], ['<strong>zero</strong>', '<strong>nul</strong>'], '(1, 0) · (0, 3) = 0'],
      [['opposite', 'opposées'], ['negative', 'négatif'], '(1, 0) · (−2, 0) = −2']
    ]),
    P('Use: the dot product with a unit vector gives the <strong>part of a vector along that direction</strong> (the speed of a robot along its forward axis, the force along a joint axis).',
      'Usage : le produit scalaire avec un vecteur unitaire donne la <strong>part d\'un vecteur dans cette direction</strong> (la vitesse d\'un robot selon son axe avant, la force selon l\'axe d\'une liaison).'),
    H4('2.5 The cross product: a vector perpendicular to two others', '2.5 Le produit vectoriel : un vecteur perpendiculaire à deux autres'),
    P('In 3D, <strong>a</strong> × <strong>b</strong> is a new <strong>vector</strong>, perpendicular to both <strong>a</strong> and <strong>b</strong>. Its direction is given by the right hand: index along <strong>a</strong>, middle finger along <strong>b</strong>, the thumb shows <strong>a</strong> × <strong>b</strong>.',
      'En 3D, <strong>a</strong> × <strong>b</strong> est un nouveau <strong>vecteur</strong>, perpendiculaire à la fois à <strong>a</strong> et à <strong>b</strong>. Son sens est donné par la main droite : index selon <strong>a</strong>, majeur selon <strong>b</strong>, le pouce montre <strong>a</strong> × <strong>b</strong>.'),
    EQ('<strong>x</strong> × <strong>y</strong> = <strong>z</strong> &emsp;&emsp; <strong>y</strong> × <strong>z</strong> = <strong>x</strong> &emsp;&emsp; <strong>z</strong> × <strong>x</strong> = <strong>y</strong>'),
    UL([
      ['It builds the third axis of a frame from the two others (lessons 5 and 6).', 'Il construit le troisième axe d\'un repère à partir des deux autres (leçons 5 et 6).'],
      ['It gives the speed of a point that turns: <strong>v</strong> = <strong>ω</strong> × <strong>r</strong>, and the torque of a force: <strong>τ</strong> = <strong>r</strong> × <strong>F</strong>.', 'Il donne la vitesse d\'un point qui tourne : <strong>v</strong> = <strong>ω</strong> × <strong>r</strong>, et le couple d\'une force : <strong>τ</strong> = <strong>r</strong> × <strong>F</strong>.']
    ])
  ],
  terms: [['vector', 'vecteur'], ['component', 'composante'], ['norm', 'norme'], ['unit vector', 'vecteur unitaire'], ['dot product', 'produit scalaire'], ['cross product', 'produit vectoriel']],
  quiz: [
    ['What is (2, 5) + (1, −3)?', 'Que vaut (2, 5) + (1, −3) ?', '(3, 2): add the components one by one.', '(3, 2) : on additionne les composantes une à une.'],
    ['Two vectors have a dot product of 0. What does it mean?', 'Deux vecteurs ont un produit scalaire nul. Qu\'est-ce que cela veut dire ?', 'They are perpendicular (or one of them is zero).', 'Ils sont perpendiculaires (ou l\'un des deux est nul).'],
    ['What is the direction of x × y?', 'Quelle est la direction de x × y ?', 'The z axis: the cross product is perpendicular to both vectors (right-hand rule).', 'L\'axe z : le produit vectoriel est perpendiculaire aux deux vecteurs (règle de la main droite).']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Matrices', 'Les matrices'],
  time: 12,
  goal: ['to multiply a matrix by a vector and by another matrix, and what the identity, the transpose, the inverse and the determinant are.', 'à multiplier une matrice par un vecteur et par une autre matrice, et ce que sont l\'identité, la transposée, l\'inverse et le déterminant.'],
  body: [
    H4('3.1 A table that transforms a vector', '3.1 Un tableau qui transforme un vecteur'),
    P('A <strong>matrix</strong> is a table of numbers. Its job: take a vector and give back another vector (turned, stretched, moved). The rule is “<strong>row times column</strong>”: multiply the numbers of a row by the numbers of the column, one by one, and add.',
      'Une <strong>matrice</strong> est un tableau de nombres. Son travail : prendre un vecteur et rendre un autre vecteur (tourné, étiré, déplacé). La règle est « <strong>ligne fois colonne</strong> » : on multiplie les nombres d\'une ligne par ceux de la colonne, un à un, et on additionne.'),
    EQ(`${MX(2, ['<i>a</i>', '<i>b</i>', '<i>c</i>', '<i>d</i>'])} ${MX(1, ['<i>x</i>', '<i>y</i>'])} = ${MX(1, ['<i>a</i><i>x</i> + <i>b</i><i>y</i>', '<i>c</i><i>x</i> + <i>d</i><i>y</i>'])}`),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P(`${MX(2, ['1', '2', '3', '4'])} ${MX(1, ['5', '6'])} = ${MX(1, ['1×5 + 2×6', '3×5 + 4×6'])} = ${MX(1, ['17', '39'])}`)),
    BOX('idea', ['What the columns mean', 'Ce que veulent dire les colonnes'],
      P(`The first column of a matrix is where the vector ${MX(1, ['1', '0'])} (the x axis) goes; the second column is where ${MX(1, ['0', '1'])} (the y axis) goes. To build a matrix that does what you want, ask: “where do the axes go?” and write the answers as columns. Lesson 4 uses this to build the rotation matrix.`,
        `La première colonne d'une matrice est l'endroit où va le vecteur ${MX(1, ['1', '0'])} (l'axe x) ; la deuxième colonne est l'endroit où va ${MX(1, ['0', '1'])} (l'axe y). Pour construire une matrice qui fait ce que vous voulez, demandez-vous : « où vont les axes ? » et écrivez les réponses en colonnes. La leçon 4 s'en sert pour construire la matrice de rotation.`)),
    H4('3.2 Matrix times matrix: two transformations in a row', '3.2 Matrice fois matrice : deux transformations à la suite'),
    P('The product <i>A</i> <i>B</i> is the matrix that does <i>B</i> first, then <i>A</i>. Same rule: the element in row <i>i</i>, column <i>j</i> of the result is row <i>i</i> of <i>A</i> “times” column <i>j</i> of <i>B</i>.',
      'Le produit <i>A</i> <i>B</i> est la matrice qui fait d\'abord <i>B</i>, puis <i>A</i>. Même règle : l\'élément en ligne <i>i</i>, colonne <i>j</i> du résultat est la ligne <i>i</i> de <i>A</i> « fois » la colonne <i>j</i> de <i>B</i>.'),
    EQ(`${MX(2, ['1', '2', '3', '4'])} ${MX(2, ['0', '1', '1', '0'])} = ${MX(2, ['1×0 + 2×1', '1×1 + 2×0', '3×0 + 4×1', '3×1 + 4×0'])} = ${MX(2, ['2', '1', '4', '3'])}`),
    BOX('warn', ['The order matters', 'L\'ordre compte'],
      P(`In general <i>A</i> <i>B</i> ≠ <i>B</i> <i>A</i>. With the same two matrices in the other order: ${MX(2, ['0', '1', '1', '0'])} ${MX(2, ['1', '2', '3', '4'])} = ${MX(2, ['3', '4', '1', '2'])}. It is normal: “turn then move forward” does not lead to the same place as “move forward then turn”.`,
        `En général <i>A</i> <i>B</i> ≠ <i>B</i> <i>A</i>. Avec les deux mêmes matrices dans l'autre ordre : ${MX(2, ['0', '1', '1', '0'])} ${MX(2, ['1', '2', '3', '4'])} = ${MX(2, ['3', '4', '1', '2'])}. C'est normal : « tourner puis avancer » ne mène pas au même endroit que « avancer puis tourner ».`)),
    H4('3.3 Four words to know', '3.3 Quatre mots à connaître'),
    TABLE([['Word', 'Mot'], ['What it is', 'Ce que c\'est'], ['For a 2×2 matrix', 'Pour une matrice 2×2'], ['Use in robotics', 'Usage en robotique']], [
      [['<strong>Identity</strong> <i>I</i>', '<strong>Identité</strong> <i>I</i>'], ['The matrix that changes nothing: <i>I</i> <strong>v</strong> = <strong>v</strong>.', 'La matrice qui ne change rien : <i>I</i> <strong>v</strong> = <strong>v</strong>.'], MX(2, ['1', '0', '0', '1']), ['“No rotation, no move”.', '« Pas de rotation, pas de déplacement ».']],
      [['<strong>Transpose</strong> <i>A</i><sup>T</sup>', '<strong>Transposée</strong> <i>A</i><sup>T</sup>'], ['Rows become columns.', 'Les lignes deviennent les colonnes.'], `${MX(2, ['<i>a</i>', '<i>b</i>', '<i>c</i>', '<i>d</i>'])}<sup>T</sup> = ${MX(2, ['<i>a</i>', '<i>c</i>', '<i>b</i>', '<i>d</i>'])}`, ['The inverse of a rotation; forces from torques (<i>J</i><sup>T</sup>).', 'L\'inverse d\'une rotation ; les forces à partir des couples (<i>J</i><sup>T</sup>).']],
      [['<strong>Determinant</strong> det <i>A</i>', '<strong>Déterminant</strong> det <i>A</i>'], ['One number: how much the matrix scales areas.', 'Un nombre : de combien la matrice agrandit les surfaces.'], ['<i>a</i><i>d</i> − <i>b</i><i>c</i>', '<i>a</i><i>d</i> − <i>b</i><i>c</i>'], ['det = 0: the matrix flattens space. For a Jacobian it is a <strong>singularity</strong>.', 'dét = 0 : la matrice aplatit l\'espace. Pour une jacobienne, c\'est une <strong>singularité</strong>.']],
      [['<strong>Inverse</strong> <i>A</i><sup>−1</sup>', '<strong>Inverse</strong> <i>A</i><sup>−1</sup>'], ['The matrix that undoes <i>A</i>: <i>A</i><sup>−1</sup> <i>A</i> = <i>I</i>. It exists only if det <i>A</i> ≠ 0.', 'La matrice qui défait <i>A</i> : <i>A</i><sup>−1</sup> <i>A</i> = <i>I</i>. Elle n\'existe que si dét <i>A</i> ≠ 0.'], `<sup>1</sup>⁄<sub><i>ad</i>−<i>bc</i></sub> ${MX(2, ['<i>d</i>', '−<i>b</i>', '−<i>c</i>', '<i>a</i>'])}`, ['Go back from the tool to the joints.', 'Revenir de l\'outil vers les liaisons.']]
    ]),
    BOX('example', ['Worked example: determinant and inverse', 'Exemple résolu : déterminant et inverse'],
      P(`<i>A</i> = ${MX(2, ['2', '1', '1', '1'])}: det <i>A</i> = 2×1 − 1×1 = <strong>1</strong>, so <i>A</i><sup>−1</sup> = ${MX(2, ['1', '−1', '−1', '2'])}. Check: <i>A</i><sup>−1</sup> <i>A</i> = ${MX(2, ['1×2 − 1×1', '1×1 − 1×1', '−1×2 + 2×1', '−1×1 + 2×1'])} = ${MX(2, ['1', '0', '0', '1'])}.`)),
    P('You will almost never invert a big matrix by hand: a computer does it. What you must know is <strong>what the inverse means</strong> and <strong>when it does not exist</strong>.',
      'Vous n\'inverserez presque jamais une grosse matrice à la main : un ordinateur le fait. Ce qu\'il faut savoir, c\'est <strong>ce que l\'inverse veut dire</strong> et <strong>quand elle n\'existe pas</strong>.')
  ],
  terms: [['matrix', 'matrice'], ['identity', 'identité'], ['transpose', 'transposée'], ['determinant', 'déterminant'], ['inverse', 'inverse']],
  quiz: [
    ['What do the columns of a matrix tell you?', 'Que vous disent les colonnes d\'une matrice ?', 'Where the axes go: column 1 is the image of (1, 0), column 2 the image of (0, 1).', 'Où vont les axes : la colonne 1 est l\'image de (1, 0), la colonne 2 l\'image de (0, 1).'],
    ['In the product A B applied to a vector, which matrix acts first?', 'Dans le produit A B appliqué à un vecteur, quelle matrice agit en premier ?', 'B, the one closest to the vector. Then A.', 'B, celle qui est la plus proche du vecteur. Puis A.'],
    ['A matrix has a determinant of 0. Can you invert it?', 'Une matrice a un déterminant nul. Peut-on l\'inverser ?', 'No. It flattens space onto a line or a point, and this cannot be undone.', 'Non. Elle aplatit l\'espace sur une droite ou un point, et cela ne peut pas se défaire.']
  ]
})
  ];
}
