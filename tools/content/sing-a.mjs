import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'sing-';
const J = (a, b, c, d) => MX(2, [a, b, c, d]);
const V2 = (a, b) => MX(1, [a, b]);

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['From joint speeds to tool speed: the Jacobian', 'Des vitesses articulaires à la vitesse de l\'outil : la jacobienne'],
  time: 12,
  goal: ['how the Jacobian is built, column by column, and what it tells you about a robot.', 'comment la jacobienne se construit, colonne par colonne, et ce qu\'elle dit d\'un robot.'],
  body: [
    H4('1.1 Speeds are simpler than positions', '1.1 Les vitesses sont plus simples que les positions'),
    P('The position of the tool depends on the joint angles in a complicated way: sines, cosines, products. But the <em>speed</em> of the tool depends on the joint speeds in a very simple way: <strong>linearly</strong>. If you double all the joint speeds, the tool goes twice as fast. This linear link is a matrix, the <strong>Jacobian</strong> <i>J</i>.',
      'La position de l\'outil dépend des angles articulaires de façon compliquée : sinus, cosinus, produits. Mais la <em>vitesse</em> de l\'outil dépend des vitesses articulaires de façon très simple : <strong>linéairement</strong>. Si vous doublez toutes les vitesses articulaires, l\'outil va deux fois plus vite. Ce lien linéaire est une matrice, la <strong>jacobienne</strong> <i>J</i>.'),
    BOX('idea', ['The idea in one sentence', 'L\'idée en une phrase'],
      P('Each joint, turning alone at 1 rad/s, makes the tool move with some velocity: an arrow. That arrow is one <strong>column</strong> of <i>J</i>. When several joints move, the tool velocity is the <strong>sum of the arrows</strong>, each one multiplied by the speed of its joint.',
        'Chaque articulation, tournant seule à 1 rad/s, fait bouger l\'outil avec une certaine vitesse : une flèche. Cette flèche est une <strong>colonne</strong> de <i>J</i>. Quand plusieurs articulations bougent, la vitesse de l\'outil est la <strong>somme des flèches</strong>, chacune multipliée par la vitesse de son articulation.')),
    H4('1.2 One single joint', '1.2 Une seule articulation'),
    P('Take one link of length <i>L</i> turned by the angle <i>θ</i>: the end is at <i>x</i> = <i>L</i> cos <i>θ</i>, <i>y</i> = <i>L</i> sin <i>θ</i>. Differentiate with respect to time:',
      'Prenez un corps de longueur <i>L</i> tourné de l\'angle <i>θ</i> : l\'extrémité est en <i>x</i> = <i>L</i> cos <i>θ</i>, <i>y</i> = <i>L</i> sin <i>θ</i>. Dérivez par rapport au temps :'),
    EQ('<i>ẋ</i> = −<i>L</i> sin <i>θ</i> · <i>θ̇</i>,        <i>ẏ</i> = <i>L</i> cos <i>θ</i> · <i>θ̇</i>'),
    P('The column (−<i>L</i> sin <i>θ</i>, <i>L</i> cos <i>θ</i>) is perpendicular to the link and has length <i>L</i>: the end moves on a circle, so its velocity is tangent to it. Longer link, faster tool: <i>v</i> = <i>L</i> · <i>ω</i>.',
      'La colonne (−<i>L</i> sin <i>θ</i>, <i>L</i> cos <i>θ</i>) est perpendiculaire au corps et de longueur <i>L</i> : l\'extrémité décrit un cercle, donc sa vitesse est tangente. Corps plus long, outil plus rapide : <i>v</i> = <i>L</i> · <i>ω</i>.'),
    H4('1.3 The two-joint arm', '1.3 Le bras à deux articulations'),
    P('For the arm of the “Maths and motion” course, <i>x</i> = <i>L</i><sub>1</sub> cos <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> cos(<i>θ</i><sub>1</sub>+<i>θ</i><sub>2</sub>) and <i>y</i> = <i>L</i><sub>1</sub> sin <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> sin(<i>θ</i><sub>1</sub>+<i>θ</i><sub>2</sub>). Differentiating gives:',
      'Pour le bras du cours « Maths et mouvement », <i>x</i> = <i>L</i><sub>1</sub> cos <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> cos(<i>θ</i><sub>1</sub>+<i>θ</i><sub>2</sub>) et <i>y</i> = <i>L</i><sub>1</sub> sin <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> sin(<i>θ</i><sub>1</sub>+<i>θ</i><sub>2</sub>). En dérivant on obtient :'),
    EQ(`${V2('<i>ẋ</i>', '<i>ẏ</i>')} = ${J('−<i>L</i><sub>1</sub> sin <i>θ</i><sub>1</sub> − <i>L</i><sub>2</sub> sin <i>θ</i><sub>12</sub>', '−<i>L</i><sub>2</sub> sin <i>θ</i><sub>12</sub>', '<i>L</i><sub>1</sub> cos <i>θ</i><sub>1</sub> + <i>L</i><sub>2</sub> cos <i>θ</i><sub>12</sub>', '<i>L</i><sub>2</sub> cos <i>θ</i><sub>12</sub>')} ${V2('<i>θ̇</i><sub>1</sub>', '<i>θ̇</i><sub>2</sub>')}        (<i>θ</i><sub>12</sub> = <i>θ</i><sub>1</sub> + <i>θ</i><sub>2</sub>)`),
    P('Read it geometrically: <strong>column 1</strong> is the tool velocity when only joint 1 turns (1 rad/s). It is perpendicular to the line “joint 1 → tool” and its length is the distance joint 1 – tool. <strong>Column 2</strong> is the same for joint 2: perpendicular to the line “joint 2 → tool”, length <i>L</i><sub>2</sub>.',
      'Lisez-la géométriquement : la <strong>colonne 1</strong> est la vitesse de l\'outil quand seule l\'articulation 1 tourne (1 rad/s). Elle est perpendiculaire à la droite « articulation 1 → outil » et sa longueur est la distance articulation 1 – outil. La <strong>colonne 2</strong> est la même pour l\'articulation 2 : perpendiculaire à « articulation 2 → outil », de longueur <i>L</i><sub>2</sub>.'),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('<i>L</i><sub>1</sub> = 0.5 m, <i>L</i><sub>2</sub> = 0.3 m, <i>θ</i><sub>1</sub> = 0°, <i>θ</i><sub>2</sub> = 90°. Then sin <i>θ</i><sub>1</sub> = 0, cos <i>θ</i><sub>1</sub> = 1, sin <i>θ</i><sub>12</sub> = 1, cos <i>θ</i><sub>12</sub> = 0:',
        '<i>L</i><sub>1</sub> = 0,5 m, <i>L</i><sub>2</sub> = 0,3 m, <i>θ</i><sub>1</sub> = 0°, <i>θ</i><sub>2</sub> = 90°. Alors sin <i>θ</i><sub>1</sub> = 0, cos <i>θ</i><sub>1</sub> = 1, sin <i>θ</i><sub>12</sub> = 1, cos <i>θ</i><sub>12</sub> = 0 :'),
      EQ(`<i>J</i> = ${J('−0.3', '−0.3', '0.5', '0')}`, `<i>J</i> = ${J('−0,3', '−0,3', '0,5', '0')}`),
      P('If <i>θ̇</i><sub>1</sub> = 1 rad/s and <i>θ̇</i><sub>2</sub> = 0.5 rad/s: <i>ẋ</i> = −0.3·1 − 0.3·0.5 = −0.45 m/s and <i>ẏ</i> = 0.5·1 + 0·0.5 = 0.5 m/s. The tool moves at √(0.45² + 0.5²) ≈ 0.67 m/s.',
        'Si <i>θ̇</i><sub>1</sub> = 1 rad/s et <i>θ̇</i><sub>2</sub> = 0,5 rad/s : <i>ẋ</i> = −0,3·1 − 0,3·0,5 = −0,45 m/s et <i>ẏ</i> = 0,5·1 + 0·0,5 = 0,5 m/s. L\'outil se déplace à √(0,45² + 0,5²) ≈ 0,67 m/s.')),
    BOX('method', ['Method: the Jacobian of any robot, column by column', 'Méthode : la jacobienne de n\'importe quel robot, colonne par colonne'],
      OL([
        ['For each joint <i>i</i>, find its axis (a unit vector <i>z</i><sub><i>i</i></sub>) and a point <i>O</i><sub><i>i</i></sub> on that axis.', 'Pour chaque articulation <i>i</i>, trouvez son axe (un vecteur unitaire <i>z</i><sub><i>i</i></sub>) et un point <i>O</i><sub><i>i</i></sub> de cet axe.'],
        ['<strong>Revolute joint:</strong> the linear part of the column is <i>z</i><sub><i>i</i></sub> × (<i>P</i><sub>tool</sub> − <i>O</i><sub><i>i</i></sub>) and the angular part is <i>z</i><sub><i>i</i></sub>.', '<strong>Liaison rotoïde :</strong> la partie linéaire de la colonne est <i>z</i><sub><i>i</i></sub> × (<i>P</i><sub>outil</sub> − <i>O</i><sub><i>i</i></sub>) et la partie angulaire est <i>z</i><sub><i>i</i></sub>.'],
        ['<strong>Prismatic joint:</strong> the linear part is <i>z</i><sub><i>i</i></sub> and the angular part is zero.', '<strong>Liaison prismatique :</strong> la partie linéaire est <i>z</i><sub><i>i</i></sub> et la partie angulaire est nulle.'],
        ['Stack the columns side by side. In 3D, <i>J</i> has 6 rows (3 for the linear velocity <i>v</i>, 3 for the angular velocity <i>ω</i>) and <i>n</i> columns (one per joint).', 'Rangez les colonnes côte à côte. En 3D, <i>J</i> a 6 lignes (3 pour la vitesse linéaire <i>v</i>, 3 pour la vitesse angulaire <i>ω</i>) et <i>n</i> colonnes (une par articulation).']
      ])),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['<strong>Velocity model:</strong> <i>ẋ</i> = <i>J</i>(<i>q</i>) <i>q̇</i>. The tool velocity is a linear combination of the columns of <i>J</i>.', '<strong>Modèle cinématique :</strong> <i>ẋ</i> = <i>J</i>(<i>q</i>) <i>q̇</i>. La vitesse de l\'outil est une combinaison linéaire des colonnes de <i>J</i>.'],
        ['<i>J</i> depends on the pose <i>q</i>: it changes as the robot moves. For small moves, d<i>x</i> ≈ <i>J</i> d<i>q</i>.', '<i>J</i> dépend de la pose <i>q</i> : elle change quand le robot bouge. Pour de petits mouvements, d<i>x</i> ≈ <i>J</i> d<i>q</i>.'],
        ['<strong>Inverse:</strong> if the tool must move at <i>ẋ</i>, the joints must move at <i>q̇</i> = <i>J</i><sup>−1</sup> <i>ẋ</i>. That is only possible if <i>J</i> can be inverted… and this is where the whole course begins.', '<strong>Inverse :</strong> si l\'outil doit bouger à <i>ẋ</i>, les articulations doivent bouger à <i>q̇</i> = <i>J</i><sup>−1</sup> <i>ẋ</i>. Ce n\'est possible que si <i>J</i> est inversible… et c\'est là que tout le cours commence.']
      ]))
  ],
  terms: [['Jacobian matrix', 'matrice jacobienne'], ['joint speed', 'vitesse articulaire'], ['tool velocity', 'vitesse de l\'outil'], ['column of J', 'colonne de J'], ['linear / angular velocity', 'vitesse linéaire / angulaire']],
  quiz: [
    ['A link of 0.4 m turns at 2 rad/s. How fast does its end move?', 'Un corps de 0,4 m tourne à 2 rad/s. À quelle vitesse son extrémité se déplace-t-elle ?', '<i>v</i> = <i>L</i> · <i>ω</i> = 0.4 × 2 = 0.8 m/s, tangent to the circle described by the end.', '<i>v</i> = <i>L</i> · <i>ω</i> = 0,4 × 2 = 0,8 m/s, tangente au cercle décrit par l\'extrémité.'],
    ['With the Jacobian of the worked example, what is the tool velocity if only joint 2 turns at 1 rad/s?', 'Avec la jacobienne de l\'exemple résolu, quelle est la vitesse de l\'outil si seule l\'articulation 2 tourne à 1 rad/s ?', 'The second column: (−0.3 ; 0) m/s. The tool, 0.3 m above joint 2, is carried to the left at 0.3 m/s.', 'La deuxième colonne : (−0,3 ; 0) m/s. L\'outil, 0,3 m au-dessus de l\'articulation 2, est emporté vers la gauche à 0,3 m/s.']
  ],
  link: ['learn-model.html#l8', 'The Jacobian in the Master-level course →', 'La jacobienne dans le cours niveau Master →']
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['What is a singularity?', 'Qu\'est-ce qu\'une singularité ?'],
  time: 10,
  goal: ['to recognise a singularity in a drawing, and to name it with the Jacobian.', 'reconnaître une singularité sur un dessin, et la nommer avec la jacobienne.'],
  body: [
    H4('2.1 The stretched arm', '2.1 Le bras tendu'),
    P('Put the two-joint arm with <i>θ</i><sub>2</sub> = 0: the arm is perfectly stretched. Replace in the Jacobian of lesson 1 (cos <i>θ</i><sub>12</sub> = cos <i>θ</i><sub>1</sub>, sin <i>θ</i><sub>12</sub> = sin <i>θ</i><sub>1</sub>):',
      'Mettez le bras à deux articulations avec <i>θ</i><sub>2</sub> = 0 : le bras est parfaitement tendu. Remplacez dans la jacobienne de la leçon 1 (cos <i>θ</i><sub>12</sub> = cos <i>θ</i><sub>1</sub>, sin <i>θ</i><sub>12</sub> = sin <i>θ</i><sub>1</sub>) :'),
    EQ(`<i>J</i> = ${J('−(<i>L</i><sub>1</sub>+<i>L</i><sub>2</sub>) sin <i>θ</i><sub>1</sub>', '−<i>L</i><sub>2</sub> sin <i>θ</i><sub>1</sub>', '(<i>L</i><sub>1</sub>+<i>L</i><sub>2</sub>) cos <i>θ</i><sub>1</sub>', '<i>L</i><sub>2</sub> cos <i>θ</i><sub>1</sub>')}`),
    P('Look at the two columns: both are proportional to the same vector (−sin <i>θ</i><sub>1</sub>, cos <i>θ</i><sub>1</sub>), which is <strong>perpendicular to the arm</strong>. Whatever the joint speeds, the tool can only move sideways. <strong>Along the arm, nothing is possible.</strong>',
      'Regardez les deux colonnes : toutes deux sont proportionnelles au même vecteur (−sin <i>θ</i><sub>1</sub>, cos <i>θ</i><sub>1</sub>), qui est <strong>perpendiculaire au bras</strong>. Quelles que soient les vitesses articulaires, l\'outil ne peut bouger que de côté. <strong>Le long du bras, rien n\'est possible.</strong>'),
    FIG('0 0 460 190', `
      <line class="ax" x1="20" y1="150" x2="440" y2="150"/>
      <rect class="base" x="30" y="146" width="36" height="14" rx="3"/>
      <line class="link1" x1="60" y1="140" x2="200" y2="140"/><line class="link2" x1="200" y1="140" x2="320" y2="140"/>
      <circle class="jt" cx="60" cy="140" r="6"/><circle class="jt" cx="200" cy="140" r="6"/><circle class="pt" cx="320" cy="140" r="6"/>
      <line x1="334" y1="140" x2="420" y2="140" stroke="#ff6b6b" stroke-width="3" marker-end="url(#ah2)" stroke-dasharray="6 5"/>
      <text x="335" y="165" class="c-pt">${svgtx('impossible', 'impossible')}</text>
      <line x1="320" y1="124" x2="320" y2="48" stroke="#4ed17f" stroke-width="3" marker-end="url(#ah3)"/>
      <text x="332" y="68" class="c-y" fill="#4ed17f">${svgtx('possible', 'possible')}</text>
      <text x="130" y="122" text-anchor="middle">L₁</text><text x="260" y="122" text-anchor="middle">L₂</text>
      <text x="200" y="176" text-anchor="middle">${svgtx('θ₂ = 0: the arm is stretched', 'θ₂ = 0 : le bras est tendu')}</text>
      <defs><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff6b6b"/></marker><marker id="ah3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#4ed17f"/></marker></defs>`),
    BOX('word', ['New word', 'Mot nouveau'],
      P('<strong>Singularity.</strong> A pose <i>q</i> where the Jacobian <strong>loses rank</strong>: its columns are no longer independent, so there is at least one direction in which the tool cannot move, whatever the joint speeds. For a square <i>J</i> this is written det <i>J</i>(<i>q</i>) = 0.',
        '<strong>Singularité.</strong> Une pose <i>q</i> où la jacobienne <strong>perd du rang</strong> : ses colonnes ne sont plus indépendantes, donc il existe au moins une direction dans laquelle l\'outil ne peut pas bouger, quelles que soient les vitesses articulaires. Pour une <i>J</i> carrée, cela s\'écrit det <i>J</i>(<i>q</i>) = 0.')),
    H4('2.2 The test: the determinant', '2.2 Le test : le déterminant'),
    P('For the two-joint arm, a short calculation (lesson 5 of this course shows it again) gives:',
      'Pour le bras à deux articulations, un court calcul (la leçon 5 de ce cours le montre encore) donne :'),
    EQ('det <i>J</i> = <i>L</i><sub>1</sub> <i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>'),
    TABLE([['Elbow angle', 'Angle du coude'], ['det J', 'det J'], ['Meaning', 'Sens']], [
      ['θ₂ = 0°', 'L₁L₂ · 0 = 0', ['Singular: arm stretched (the tool is at the edge of its workspace).', 'Singulier : bras tendu (l\'outil est au bord de son espace de travail).']],
      ['θ₂ = ±180°', 'L₁L₂ · 0 = 0', ['Singular: arm folded back on itself.', 'Singulier : bras replié sur lui-même.']],
      ['θ₂ = ±90°', '±L₁L₂', ['Best case: the largest determinant.', 'Meilleur cas : le plus grand déterminant.']],
      ['θ₂ = 10°', '0.17 · L₁L₂', ['Regular on paper, but already close to a singularity (lesson 4).', 'Régulier sur le papier, mais déjà proche d\'une singularité (leçon 4).']]
    ]),
    BOX('warn', ['Watch out', 'Attention'],
      P('A singularity is a property of the <strong>pose</strong> (the joint values), not of the speed, the program or the motors. A better motor does not remove it.',
        'Une singularité est une propriété de la <strong>pose</strong> (les valeurs des articulations), pas de la vitesse, du programme ou des moteurs. Un meilleur moteur ne la supprime pas.')),
    WIDGET('jac2r'),
    H4('2.3 Two families', '2.3 Deux familles'),
    UL([
      ['<strong>Boundary singularities</strong> sit at the edge of the workspace: arm stretched or folded. They are easy to avoid, simply do not ask the tool to go there.', 'Les <strong>singularités de frontière</strong> sont au bord de l\'espace de travail : bras tendu ou replié. Elles sont faciles à éviter, il suffit de ne pas demander à l\'outil d\'y aller.'],
      ['<strong>Internal singularities</strong> sit inside the workspace (shoulder and wrist of a 6-axis robot, lesson 3). They are the dangerous ones: the tool can pass through them while doing a perfectly normal task.', 'Les <strong>singularités internes</strong> sont à l\'intérieur de l\'espace de travail (épaule et poignet d\'un robot 6 axes, leçon 3). Ce sont les dangereuses : l\'outil peut passer par elles pendant une tâche tout à fait normale.']
    ]),
    P('The first reflex of an engineer facing a new robot: <strong>find its singular poses</strong> and keep the useful workspace away from them.',
      'Le premier réflexe d\'un ingénieur devant un nouveau robot : <strong>trouver ses poses singulières</strong> et garder l\'espace de travail utile loin d\'elles.')
  ],
  terms: [['singularity', 'singularité'], ['rank', 'rang'], ['determinant', 'déterminant'], ['boundary singularity', 'singularité de frontière'], ['internal singularity', 'singularité interne']],
  quiz: [
    ['The arm has L₁ = L₂ and is folded back on itself. What is θ₂, and is the pose singular?', 'Le bras a L₁ = L₂ et est replié sur lui-même. Quel est θ₂, et la pose est-elle singulière ?', 'θ₂ = ±180°. sin θ₂ = 0, so det J = 0: it is singular (the tool is back at the shoulder).', 'θ₂ = ±180°. sin θ₂ = 0, donc det J = 0 : elle est singulière (l\'outil est revenu à l\'épaule).'],
    ['The arm is stretched along the x axis (θ₁ = 0, θ₂ = 0). In which direction can the tool still move?', 'Le bras est tendu le long de l\'axe x (θ₁ = 0, θ₂ = 0). Dans quelle direction l\'outil peut-il encore bouger ?', 'Only along y, perpendicular to the arm. Movement along x is lost.', 'Seulement selon y, perpendiculairement au bras. Le mouvement selon x est perdu.'],
    ['Why is an internal singularity more dangerous than a boundary one?', 'Pourquoi une singularité interne est-elle plus dangereuse qu\'une singularité de frontière ?', 'Because a normal task inside the workspace can reach it without warning; the edge of the workspace is a limit you already respect.', 'Parce qu\'une tâche normale à l\'intérieur de l\'espace de travail peut l\'atteindre sans prévenir ; le bord de l\'espace de travail est une limite que l\'on respecte déjà.']
  ],
  link: ['scara.html', 'Watch the stretched and folded poses on the SCARA page →', 'Voir les poses tendue et repliée sur la page SCARA →']
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['The singularities of a 6-axis robot', 'Les singularités d\'un robot 6 axes'],
  time: 14,
  goal: ['the three classical singularities (elbow, shoulder, wrist), where they are and how to recognise them on a real robot.', 'les trois singularités classiques (coude, épaule, poignet), où elles sont et comment les reconnaître sur un vrai robot.'],
  body: [
    P('Most industrial robots have six axes and a <strong>spherical wrist</strong> (axes 4, 5 and 6 meet at one point, the wrist centre; see the 6-axis robot page). This shape splits the problem in two: joints 1-3 place the wrist centre, joints 4-6 orient the tool. The Jacobian then also splits, and its determinant becomes a product of simple factors. For the Stäubli RX-90 of the Master course:',
      'La plupart des robots industriels ont six axes et un <strong>poignet sphérique</strong> (les axes 4, 5 et 6 se coupent en un point, le centre du poignet ; voir la page du robot 6 axes). Cette forme coupe le problème en deux : les articulations 1-3 placent le centre du poignet, les articulations 4-6 orientent l\'outil. La jacobienne se coupe alors aussi, et son déterminant devient un produit de facteurs simples. Pour le Stäubli RX-90 du cours Master :'),
    EQ('det <i>J</i> = −<i>C</i><sub>3</sub> <i>D</i><sub>3</sub> <i>RL</i><sub>4</sub> <i>S</i><sub>5</sub> (<i>S</i><sub>23</sub> <i>RL</i><sub>4</sub> − <i>C</i><sub>2</sub> <i>D</i><sub>3</sub>)'),
    P('A product is zero when <strong>one factor</strong> is zero. Each zero factor is a family of singular poses:',
      'Un produit est nul quand <strong>un facteur</strong> est nul. Chaque facteur nul est une famille de poses singulières :'),
    FIG('0 0 620 218', `
      <g transform="translate(0,0)">
        <line class="ax" x1="10" y1="170" x2="190" y2="170"/>
        <rect class="base" x="30" y="160" width="40" height="12" rx="3"/>
        <line class="link1" x1="50" y1="160" x2="50" y2="118"/>
        <line class="link1" x1="50" y1="118" x2="105" y2="78"/><line class="link2" x1="105" y1="78" x2="160" y2="38"/>
        <circle class="jt" cx="50" cy="118" r="5"/><circle class="jt" cx="105" cy="78" r="5"/><circle class="pt" cx="160" cy="38" r="5"/>
        <line class="dash" x1="50" y1="118" x2="175" y2="27"/>
        <text x="100" y="190" text-anchor="middle">${svgtx('1. Elbow', '1. Coude')}</text><text x="100" y="208" text-anchor="middle">${svgtx('arm stretched', 'bras tendu')}</text>
      </g>
      <g transform="translate(210,0)">
        <line class="ax" x1="10" y1="170" x2="190" y2="170"/>
        <rect class="base" x="30" y="160" width="40" height="12" rx="3"/>
        <line class="dash" x1="50" y1="165" x2="50" y2="14"/>
        <line class="link1" x1="50" y1="160" x2="50" y2="125"/>
        <line class="link1" x1="50" y1="125" x2="115" y2="80"/><line class="link2" x1="115" y1="80" x2="50" y2="38"/>
        <circle class="jt" cx="50" cy="125" r="5"/><circle class="jt" cx="115" cy="80" r="5"/><circle class="pt" cx="50" cy="38" r="5"/>
        <text x="100" y="190" text-anchor="middle">${svgtx('2. Shoulder', '2. Épaule')}</text><text x="100" y="208" text-anchor="middle">${svgtx('wrist centre on axis 1', 'centre du poignet sur l\'axe 1')}</text>
      </g>
      <g transform="translate(420,0)">
        <line class="ax" x1="10" y1="170" x2="190" y2="170"/>
        <rect class="base" x="30" y="160" width="40" height="12" rx="3"/>
        <line class="link1" x1="50" y1="160" x2="50" y2="125"/>
        <line class="link1" x1="50" y1="125" x2="110" y2="125"/>
        <line class="link2" x1="110" y1="125" x2="170" y2="125"/>
        <line class="dash" x1="110" y1="125" x2="165" y2="95"/>
        <circle class="jt" cx="50" cy="125" r="5"/><circle class="jt" cx="110" cy="125" r="6"/><circle class="pt" cx="170" cy="125" r="5"/>
        <text x="75" y="112" text-anchor="middle">z₄</text><text x="150" y="112" text-anchor="middle">z₆</text>
        <text x="100" y="190" text-anchor="middle">${svgtx('3. Wrist', '3. Poignet')}</text><text x="100" y="208" text-anchor="middle">${svgtx('axes 4 and 6 aligned', 'axes 4 et 6 alignés')}</text>
      </g>`),
    TABLE([['Name', 'Nom'], ['Condition', 'Condition'], ['What is lost', 'Ce qui est perdu'], ['How to recognise it', 'Comment le reconnaître']], [
      [['<strong>Elbow</strong> (or reach)', '<strong>Coude</strong> (ou portée)'], ['Joints 1-3 stretched or folded: the wrist centre is at the edge of what joints 1-3 can reach.', 'Articulations 1-3 tendues ou repliées : le centre du poignet est au bord de ce que les articulations 1-3 peuvent atteindre.'], ['Movement of the wrist centre along the arm (towards or away from the base).', 'Mouvement du centre du poignet le long du bras (vers la base ou à l\'opposé).'], ['The arm looks like a straight stick. Typical when the tool is placed at maximum reach.', 'Le bras ressemble à un bâton droit. Typique quand l\'outil est placé à portée maximale.']],
      [['<strong>Shoulder</strong>', '<strong>Épaule</strong>'], ['The wrist centre lies on the axis of joint 1 (arm folded up above the base).', 'Le centre du poignet est sur l\'axe de l\'articulation 1 (bras replié au-dessus de la base).'], ['Sideways movement of the wrist centre: turning joint 1 does not move it any more.', 'Mouvement latéral du centre du poignet : tourner l\'articulation 1 ne le déplace plus.'], ['The tool passes just above or just in front of the base. A path crossing the base column is a trap.', 'L\'outil passe juste au-dessus ou juste devant la base. Un chemin qui traverse la colonne de la base est un piège.']],
      [['<strong>Wrist</strong>', '<strong>Poignet</strong>'], ['Joint 5 = 0 (or 180°): axes 4 and 6 are on the same line.', 'Articulation 5 = 0 (ou 180°) : les axes 4 et 6 sont sur la même droite.'], ['One rotation of the tool: only the sum or the difference of q4 and q6 matters.', 'Une rotation de l\'outil : seule la somme ou la différence de q4 et q6 compte.'], ['The tool points straight along the forearm. Typical for welding or painting straight ahead.', 'L\'outil pointe droit dans l\'axe de l\'avant-bras. Typique en soudure ou en peinture droit devant.']]
    ]),
    H4('3.1 Why the wrist singularity is the one you meet most', '3.1 Pourquoi la singularité du poignet est la plus fréquente'),
    P('The three wrist axes give the tool angular speeds along <i>z</i><sub>4</sub>, <i>z</i><sub>5</sub> and <i>z</i><sub>6</sub>. When <i>q</i><sub>5</sub> = 0, <i>z</i><sub>6</sub> = <i>z</i><sub>4</sub>: two joints now turn the tool about the <strong>same</strong> axis. The tool can no longer turn about the axis perpendicular to both <i>z</i><sub>4</sub> and <i>z</i><sub>5</sub>. Worse, an infinity of pairs (<i>q</i><sub>4</sub>, <i>q</i><sub>6</sub>) give the same tool orientation.',
      'Les trois axes du poignet donnent à l\'outil des vitesses angulaires selon <i>z</i><sub>4</sub>, <i>z</i><sub>5</sub> et <i>z</i><sub>6</sub>. Quand <i>q</i><sub>5</sub> = 0, <i>z</i><sub>6</sub> = <i>z</i><sub>4</sub> : deux articulations font maintenant tourner l\'outil autour du <strong>même</strong> axe. L\'outil ne peut plus tourner autour de l\'axe perpendiculaire à <i>z</i><sub>4</sub> et <i>z</i><sub>5</sub>. Pire, une infinité de couples (<i>q</i><sub>4</sub>, <i>q</i><sub>6</sub>) donnent la même orientation de l\'outil.'),
    BOX('example', ['What you see on a real robot', 'Ce que l\'on voit sur un vrai robot'],
      P('Program a straight line with the tool pointing along the forearm. Near the singularity, <i>q</i><sub>4</sub> spins one way and <i>q</i><sub>6</sub> the opposite way, very fast, while the tool hardly moves. The controller slows down, shakes, or stops with an error such as “singularity” or “joint speed limit”.',
        'Programmez une ligne droite avec l\'outil pointé dans l\'axe de l\'avant-bras. Près de la singularité, <i>q</i><sub>4</sub> tourne dans un sens et <i>q</i><sub>6</sub> dans l\'autre, très vite, alors que l\'outil bouge à peine. Le contrôleur ralentit, vibre ou s\'arrête avec une erreur du type « singularité » ou « limite de vitesse articulaire ».')),
    H4('3.2 Robots with an offset wrist (UR, cobots)', '3.2 Robots à poignet décalé (UR, cobots)'),
    P('On a UR5 the wrist axes do not meet at one point, yet the same three families exist: wrist (<i>q</i><sub>5</sub> = 0 or 180°), elbow (<i>q</i><sub>3</sub> = 0 or 180°) and shoulder (the wrist centre above axis 1, inside the small cylinder made by the shoulder offset). Only the formulas change. Try the three of them on the 6-axis robot page and on the cobot page.',
      'Sur un UR5 les axes du poignet ne se coupent pas en un point, mais les trois mêmes familles existent : poignet (<i>q</i><sub>5</sub> = 0 ou 180°), coude (<i>q</i><sub>3</sub> = 0 ou 180°) et épaule (le centre du poignet au-dessus de l\'axe 1, dans le petit cylindre dû au décalage de l\'épaule). Seules les formules changent. Essayez les trois sur la page du robot 6 axes et sur celle du cobot.'),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['A 6-axis robot has <strong>three</strong> families of singular poses: elbow, shoulder, wrist.', 'Un robot 6 axes a <strong>trois</strong> familles de poses singulières : coude, épaule, poignet.'],
        ['In the joint space they are thin surfaces (for example <i>q</i><sub>5</sub> = 0). But the zone where the robot is <em>badly conditioned</em> around them is thick: you feel the problem well before the exact pose.', 'Dans l\'espace articulaire ce sont des surfaces fines (par exemple <i>q</i><sub>5</sub> = 0). Mais la zone où le robot est <em>mal conditionné</em> autour d\'elles est épaisse : on ressent le problème bien avant la pose exacte.'],
        ['Elbow = edge of the workspace; shoulder and wrist = inside it.', 'Coude = bord de l\'espace de travail ; épaule et poignet = à l\'intérieur.']
      ]))
  ],
  terms: [['elbow singularity', 'singularité de coude'], ['shoulder singularity', 'singularité d\'épaule'], ['wrist singularity', 'singularité de poignet'], ['spherical wrist', 'poignet sphérique'], ['wrist centre', 'centre du poignet']],
  quiz: [
    ['Which joint angle is 0 (or 180°) at a wrist singularity of a 6-axis robot?', 'Quel angle articulaire vaut 0 (ou 180°) à une singularité de poignet d\'un robot 6 axes ?', 'q5, the middle joint of the wrist. Then axes 4 and 6 are aligned.', 'q5, l\'articulation du milieu du poignet. Alors les axes 4 et 6 sont alignés.'],
    ['A path makes the tool pass exactly above the base column of the robot. Which singularity is close?', 'Un chemin fait passer l\'outil exactement au-dessus de la colonne de la base du robot. Quelle singularité est proche ?', 'The shoulder singularity: the wrist centre is close to axis 1.', 'La singularité d\'épaule : le centre du poignet est proche de l\'axe 1.'],
    ['Which of the three is a boundary singularity, and why?', 'Laquelle des trois est une singularité de frontière, et pourquoi ?', 'The elbow: the arm is stretched, so the wrist centre is at the edge of the reachable zone.', 'Le coude : le bras est tendu, donc le centre du poignet est au bord de la zone atteignable.']
  ],
  link: ['articulated.html', 'Create a wrist singularity on the 6-axis robot page →', 'Créer une singularité de poignet sur la page du robot 6 axes →']
}),
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['How close am I? Manipulability and conditioning', 'À quel point suis-je proche ? Manipulabilité et conditionnement'],
  time: 12,
  goal: ['to measure the distance to a singularity with a number, and to draw it as an ellipse.', 'mesurer la distance à une singularité avec un nombre, et la dessiner sous forme d\'ellipse.'],
  body: [
    P('A singularity is not a cliff: it is the bottom of a valley. The robot already behaves badly on the slopes. We need a number that says <em>how far</em> we are.',
      'Une singularité n\'est pas une falaise : c\'est le fond d\'une vallée. Le robot se comporte déjà mal sur les pentes. Il faut un nombre qui dise <em>à quelle distance</em> on en est.'),
    H4('4.1 The manipulability ellipse', '4.1 L\'ellipse de manipulabilité'),
    BOX('idea', ['The idea in one picture', 'L\'idée en une image'],
      P('Imagine all the joint speed combinations of “size 1” (a circle of radius 1 in joint-speed space). Send them through the Jacobian: they come out as an <strong>ellipse</strong> in tool-speed space. It shows in which directions the tool is fast (long axis) and in which it is slow (short axis). At a singularity, the short axis becomes zero and the ellipse is <strong>flat</strong>: it is a segment, one direction is lost.',
        'Imaginez toutes les combinaisons de vitesses articulaires de « taille 1 » (un cercle de rayon 1 dans l\'espace des vitesses articulaires). Faites-les passer par la jacobienne : elles ressortent en une <strong>ellipse</strong> dans l\'espace des vitesses de l\'outil. Elle montre dans quelles directions l\'outil est rapide (grand axe) et lent (petit axe). À une singularité, le petit axe devient nul et l\'ellipse est <strong>aplatie</strong> : c\'est un segment, une direction est perdue.')),
    FIG('0 0 560 150', `
      <g transform="translate(0,0)"><ellipse cx="90" cy="70" rx="64" ry="36" fill="rgba(91,143,214,.25)" stroke="#5b8fd6" stroke-width="2"/><line class="ax" x1="10" y1="70" x2="170" y2="70"/><line class="ax" x1="90" y1="14" x2="90" y2="126"/><text x="90" y="144" text-anchor="middle">${svgtx('Regular: round, good in every direction', 'Régulier : arrondie, bon dans toutes les directions')}</text></g>
      <g transform="translate(190,0)"><ellipse cx="90" cy="70" rx="72" ry="11" fill="rgba(255,159,67,.25)" stroke="#ff9f43" stroke-width="2"/><line class="ax" x1="10" y1="70" x2="170" y2="70"/><line class="ax" x1="90" y1="14" x2="90" y2="126"/><text x="90" y="144" text-anchor="middle">${svgtx('Near a singularity: thin', 'Près d\'une singularité : fine')}</text></g>
      <g transform="translate(380,0)"><line x1="18" y1="70" x2="162" y2="70" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/><line class="ax" x1="10" y1="70" x2="170" y2="70"/><line class="ax" x1="90" y1="14" x2="90" y2="126"/><text x="90" y="144" text-anchor="middle">${svgtx('Singular: flat, one direction lost', 'Singulier : plate, une direction perdue')}</text></g>`),
    P('Mathematically, if <i>J</i> = <i>U</i> Σ <i>V</i><sup>T</sup> (singular value decomposition), the semi-axes of the ellipse are the <strong>singular values</strong> <i>σ</i><sub>1</sub> ≥ <i>σ</i><sub>2</sub> ≥ … of <i>J</i>, in the directions of the columns of <i>U</i>. The tool is fast along the first, slow along the last.',
      'Mathématiquement, si <i>J</i> = <i>U</i> Σ <i>V</i><sup>T</sup> (décomposition en valeurs singulières), les demi-axes de l\'ellipse sont les <strong>valeurs singulières</strong> <i>σ</i><sub>1</sub> ≥ <i>σ</i><sub>2</sub> ≥ … de <i>J</i>, dans les directions des colonnes de <i>U</i>. L\'outil est rapide selon la première, lent selon la dernière.'),
    H4('4.2 Two numbers', '4.2 Deux nombres'),
    UL([
      ['<strong>Manipulability</strong> (Yoshikawa): <i>w</i> = √det(<i>J</i> <i>J</i><sup>T</sup>) = <i>σ</i><sub>1</sub> <i>σ</i><sub>2</sub> … It is the “area” of the ellipse. It is zero at a singularity. For a square <i>J</i>, <i>w</i> = |det <i>J</i>|; for the two-joint arm, <i>w</i> = <i>L</i><sub>1</sub> <i>L</i><sub>2</sub> |sin <i>θ</i><sub>2</sub>|.', '<strong>Manipulabilité</strong> (Yoshikawa) : <i>w</i> = √det(<i>J</i> <i>J</i><sup>T</sup>) = <i>σ</i><sub>1</sub> <i>σ</i><sub>2</sub> … C\'est l\'« aire » de l\'ellipse. Elle est nulle à une singularité. Pour une <i>J</i> carrée, <i>w</i> = |det <i>J</i>| ; pour le bras à deux articulations, <i>w</i> = <i>L</i><sub>1</sub> <i>L</i><sub>2</sub> |sin <i>θ</i><sub>2</sub>|.'],
      ['<strong>Condition number</strong>: <i>κ</i> = <i>σ</i><sub>max</sub> / <i>σ</i><sub>min</sub>. It is 1 for a circle (the tool is equally good in all directions) and tends to infinity at a singularity. It is the number that says how much errors are amplified.', '<strong>Conditionnement</strong> : <i>κ</i> = <i>σ</i><sub>max</sub> / <i>σ</i><sub>min</sub>. Il vaut 1 pour un cercle (l\'outil est aussi bon dans toutes les directions) et tend vers l\'infini à une singularité. C\'est le nombre qui dit de combien les erreurs sont amplifiées.']
    ]),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('Two-joint arm with <i>L</i><sub>1</sub> = 0.5 m and <i>L</i><sub>2</sub> = 0.3 m (<i>w</i><sub>max</sub> = 0.15 m²):', 'Bras à deux articulations avec <i>L</i><sub>1</sub> = 0,5 m et <i>L</i><sub>2</sub> = 0,3 m (<i>w</i><sub>max</sub> = 0,15 m²) :'),
      TABLE([['θ₂', 'θ₂'], ['w (m²)', 'w (m²)'], ['σ₁', 'σ₁'], ['σ₂', 'σ₂'], ['κ = σ₁/σ₂', 'κ = σ₁/σ₂']], [
        ['90°', ['0.150', '0,150'], ['0.61', '0,61'], ['0.25', '0,25'], ['2.5', '2,5']],
        ['30°', ['0.075', '0,075'], ['0.83', '0,83'], ['0.091', '0,091'], ['9.1', '9,1']],
        ['10°', ['0.026', '0,026'], ['0.85', '0,85'], ['0.031', '0,031'], ['28', '28']],
        ['2°', ['0.0052', '0,0052'], ['0.85', '0,85'], ['0.0061', '0,0061'], ['139', '139']]
      ], 'center'),
      P('Between 90° and 2° the long axis does not change, but the short axis collapses: the robot is still fast in one direction and almost helpless in the other.',
        'Entre 90° et 2° le grand axe ne change pas, mais le petit axe s\'effondre : le robot reste rapide dans une direction et presque impuissant dans l\'autre.')),
    H4('4.3 The force ellipse: the mirror image', '4.3 L\'ellipse d\'effort : l\'image dans le miroir'),
    P('The same matrix describes forces (see lesson 5): the <strong>force ellipse</strong> has the same axes but the <em>inverse</em> lengths 1/<i>σ</i><sub><i>i</i></sub>. Where the tool is slow it is strong, and where it is fast it is weak. A stretched arm is slow along its length but it can push very hard along it, because the bones carry the load. You choose the pose according to the task: <strong>speed</strong> (go to the fast direction) or <strong>force</strong> (go to the strong one). A hammer-like task wants a stretched arm, a fast pick and place wants a well-conditioned pose.',
      'La même matrice décrit les efforts (voir leçon 5) : l\'<strong>ellipse d\'effort</strong> a les mêmes axes mais des longueurs <em>inverses</em> 1/<i>σ</i><sub><i>i</i></sub>. Là où l\'outil est lent, il est fort ; là où il est rapide, il est faible. Un bras tendu est lent dans sa longueur mais il peut y pousser très fort, car les os portent la charge. On choisit la pose selon la tâche : <strong>vitesse</strong> (aller vers la direction rapide) ou <strong>effort</strong> (aller vers la direction forte). Une tâche de type marteau veut un bras tendu, un pick and place rapide veut une pose bien conditionnée.'),
    BOX('warn', ['Watch out', 'Attention'],
      P('For a full 6-axis robot, <i>J</i> mixes metres per second (linear part) and radians per second (angular part), so its singular values mix units. Engineers look at the two 3×3 blocks separately, or scale them with a characteristic length, before computing <i>w</i> or <i>κ</i>.',
        'Pour un robot 6 axes complet, <i>J</i> mélange des mètres par seconde (partie linéaire) et des radians par seconde (partie angulaire), donc ses valeurs singulières mélangent les unités. Les ingénieurs regardent les deux blocs 3×3 séparément, ou les mettent à l\'échelle avec une longueur caractéristique, avant de calculer <i>w</i> ou <i>κ</i>.')),
    WIDGET('jac2r-ellipse')
  ],
  terms: [['manipulability', 'manipulabilité'], ['manipulability ellipse', 'ellipse de manipulabilité'], ['singular value', 'valeur singulière'], ['SVD', 'SVD'], ['condition number', 'conditionnement'], ['isotropic', 'isotrope']],
  quiz: [
    ['A two-joint arm has L₁ = L₂ = 0.4 m. For which θ₂ is the manipulability maximal, and what is its value?', 'Un bras à deux articulations a L₁ = L₂ = 0,4 m. Pour quel θ₂ la manipulabilité est-elle maximale, et quelle est sa valeur ?', 'w = L₁L₂ |sin θ₂| is maximal for θ₂ = ±90°: w = 0.4 × 0.4 = 0.16 m².', 'w = L₁L₂ |sin θ₂| est maximale pour θ₂ = ±90° : w = 0,4 × 0,4 = 0,16 m².'],
    ['What does κ = 1 mean for the ellipse?', 'Que signifie κ = 1 pour l\'ellipse ?', 'The ellipse is a circle: the robot can move equally well in every direction (isotropic).', 'L\'ellipse est un cercle : le robot peut bouger aussi bien dans toutes les directions (isotrope).'],
    ['A task needs to push very hard along one direction. Do you want a high or a low σ in that direction?', 'Une tâche demande de pousser très fort dans une direction. Voulez-vous un σ grand ou petit dans cette direction ?', 'A low σ: the force ellipse has inverse lengths, so a direction where the tool is slow is a direction where it is strong.', 'Un σ petit : l\'ellipse d\'effort a des longueurs inverses, donc une direction où l\'outil est lent est une direction où il est fort.']
  ]
})
  ];
}
