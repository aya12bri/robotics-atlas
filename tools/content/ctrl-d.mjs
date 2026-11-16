// Dynamics, actuators and control — lesson 10: deriving the dynamic model step by step with Lagrange.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, lesson } from '../lib.mjs';
const PRE = 'ctrl-';
const I = (s, i) => `<i>${s}</i><sub>${i}</sub>`;
const t1 = I('θ', '1'), t2 = I('θ', '2'), d1 = I('θ̇', '1'), d2 = I('θ̇', '2'), a1 = I('θ̈', '1'), a2 = I('θ̈', '2'), L1 = I('L', '1'), L2 = I('L', '2'), m1 = I('m', '1'), m2 = I('m', '2');
const SP = ' &emsp;&emsp; ';

export function partD() {
  return [
// ------------------------------------------------------------------------------------------------ 10
lesson(PRE, 10, {
  title: ['Deriving the dynamic model step by step: the Lagrange method', 'Calculer le modèle dynamique pas à pas : la méthode de Lagrange'],
  time: 22,
  goal: ['to find the equation of motion of a robot yourself, from its energies, first for one link and then for the two-joint arm, and to use it to compute torques and to simulate.', 'à trouver vous-même l\'équation du mouvement d\'un robot, à partir de ses énergies, d\'abord pour un corps puis pour le bras à deux articulations, et à l\'utiliser pour calculer des couples et simuler.'],
  body: [
    P('Lesson 1 gave the dynamic model of the two-joint arm. This lesson shows <strong>where it comes from</strong>. You need the derivatives and partial derivatives of the maths course (lesson 9) and nothing else.',
      'La leçon 1 a donné le modèle dynamique du bras à deux articulations. Cette leçon montre <strong>d\'où il vient</strong>. Il vous faut les dérivées et dérivées partielles du cours de maths (leçon 9), et rien d\'autre.'),
    H4('10.1 The idea: work with energies, not forces', '10.1 L\'idée : travailler avec les énergies, pas avec les forces'),
    P('Writing Newton\'s law for every link means drawing every force, including the forces that the links exert on each other. Lagrange found a shortcut: describe the robot by <strong>two numbers only</strong>, its kinetic energy and its potential energy, and a fixed recipe gives the torques. The internal forces never appear.',
      'Écrire la loi de Newton pour chaque corps oblige à dessiner toutes les forces, y compris celles que les corps exercent les uns sur les autres. Lagrange a trouvé un raccourci : décrire le robot par <strong>deux nombres seulement</strong>, son énergie cinétique et son énergie potentielle, et une recette fixe donne les couples. Les forces intérieures n\'apparaissent jamais.'),
    TABLE([['Energy', 'Énergie'], ['Formula', 'Formule'], ['In words', 'En mots']], [
      [['<strong>Kinetic</strong> <i>T</i>', '<strong>Cinétique</strong> <i>T</i>'], ['½ <i>m</i> <i>v</i>²  (+ ½ <i>I</i> <i>ω</i>² for a body that turns)', '½ <i>m</i> <i>v</i>²  (+ ½ <i>I</i> <i>ω</i>² pour un corps qui tourne)'], ['the energy of motion', 'l\'énergie du mouvement']],
      [['<strong>Potential</strong> <i>V</i>', '<strong>Potentielle</strong> <i>V</i>'], '<i>m</i> <i>g</i> <i>h</i>', ['the energy of height (<i>h</i> = height of the centre of mass)', 'l\'énergie de hauteur (<i>h</i> = hauteur du centre de masse)']]
    ]),
    BOX('method', ['The Lagrange recipe, in five steps', 'La recette de Lagrange, en cinq étapes'],
      OL([
        ['Choose the joint variables <i>q</i><sub>1</sub>, …, <i>q</i><sub>n</sub> (the angles of the joints).', 'Choisir les variables articulaires <i>q</i><sub>1</sub>, …, <i>q</i><sub>n</sub> (les angles des liaisons).'],
        ['Write the <strong>kinetic energy</strong> <i>T</i> of all the masses, using the speeds (forward kinematics, then derive).', 'Écrire l\'<strong>énergie cinétique</strong> <i>T</i> de toutes les masses, à l\'aide des vitesses (modèle direct, puis dériver).'],
        ['Write the <strong>potential energy</strong> <i>V</i> of all the masses.', 'Écrire l\'<strong>énergie potentielle</strong> <i>V</i> de toutes les masses.'],
        ['Form the <strong>Lagrangian</strong> <i>ℒ</i> = <i>T</i> − <i>V</i>.', 'Former le <strong>lagrangien</strong> <i>ℒ</i> = <i>T</i> − <i>V</i>.'],
        ['For each joint <i>i</i>, the torque is:', 'Pour chaque liaison <i>i</i>, le couple vaut :']
      ]),
      EQ('<i>τ</i><sub>i</sub> = d/d<i>t</i> ( ∂<i>ℒ</i> / ∂<i>q̇</i><sub>i</sub> ) − ∂<i>ℒ</i> / ∂<i>q</i><sub>i</sub>')),
    P('Read the last formula as: “the change in time of the momentum, minus the force that comes from the energies”. The first part gives the inertia and Coriolis terms; the second part gives the gravity term.',
      'Lisez la dernière formule ainsi : « la variation dans le temps de la quantité de mouvement, moins la force qui vient des énergies ». La première partie donne les termes d\'inertie et de Coriolis ; la seconde donne le terme de gravité.'),
    H4('10.2 Warm-up: one link', '10.2 Échauffement : un seul corps'),
    P('A point mass <i>m</i> at distance <i>l</i> from a joint, angle <i>θ</i> measured from the horizontal (the case of lesson 1).', 'Une masse ponctuelle <i>m</i> à la distance <i>l</i> d\'une articulation, angle <i>θ</i> mesuré depuis l\'horizontale (le cas de la leçon 1).'),
    OL([
      ['Position: <i>x</i> = <i>l</i> cos <i>θ</i>, <i>y</i> = <i>l</i> sin <i>θ</i>. Speed: the mass turns on a circle, so <i>v</i> = <i>l</i> <i>θ̇</i>.', 'Position : <i>x</i> = <i>l</i> cos <i>θ</i>, <i>y</i> = <i>l</i> sin <i>θ</i>. Vitesse : la masse tourne sur un cercle, donc <i>v</i> = <i>l</i> <i>θ̇</i>.'],
      ['<i>T</i> = ½ <i>m</i> <i>l</i>² <i>θ̇</i>²', '<i>T</i> = ½ <i>m</i> <i>l</i>² <i>θ̇</i>²'],
      ['<i>V</i> = <i>m</i> <i>g</i> <i>l</i> sin <i>θ</i> (height = <i>y</i>)', '<i>V</i> = <i>m</i> <i>g</i> <i>l</i> sin <i>θ</i> (hauteur = <i>y</i>)'],
      ['<i>ℒ</i> = ½ <i>m</i> <i>l</i>² <i>θ̇</i>² − <i>m</i> <i>g</i> <i>l</i> sin <i>θ</i>', '<i>ℒ</i> = ½ <i>m</i> <i>l</i>² <i>θ̇</i>² − <i>m</i> <i>g</i> <i>l</i> sin <i>θ</i>'],
      ['∂<i>ℒ</i>/∂<i>θ̇</i> = <i>m</i> <i>l</i>² <i>θ̇</i>, whose derivative in time is <i>m</i> <i>l</i>² <i>θ̈</i>. And ∂<i>ℒ</i>/∂<i>θ</i> = −<i>m</i> <i>g</i> <i>l</i> cos <i>θ</i>. So:', '∂<i>ℒ</i>/∂<i>θ̇</i> = <i>m</i> <i>l</i>² <i>θ̇</i>, dont la dérivée dans le temps vaut <i>m</i> <i>l</i>² <i>θ̈</i>. Et ∂<i>ℒ</i>/∂<i>θ</i> = −<i>m</i> <i>g</i> <i>l</i> cos <i>θ</i>. Donc :']
    ]),
    EQ('<i>τ</i> = <i>m</i> <i>l</i>² <i>θ̈</i> + <i>m</i> <i>g</i> <i>l</i> cos <i>θ</i>'),
    P('Exactly the equation of lesson 1 (without friction, which is added afterwards). Example: <i>m</i> = 2 kg, <i>l</i> = 0.5 m, <i>θ</i> = 30°, <i>θ̈</i> = 4 rad/s²: <i>τ</i> = 2 × 0.25 × 4 + 2 × 9.81 × 0.5 × 0.866 = 2 + 8.50 = <strong>10.5 N·m</strong>.',
      'Exactement l\'équation de la leçon 1 (sans le frottement, qu\'on ajoute ensuite). Exemple : <i>m</i> = 2 kg, <i>l</i> = 0,5 m, <i>θ</i> = 30°, <i>θ̈</i> = 4 rad/s² : <i>τ</i> = 2 × 0,25 × 4 + 2 × 9,81 × 0,5 × 0,866 = 2 + 8,50 = <strong>10,5 N·m</strong>.'),
    H4('10.3 The two-joint arm, step by step', '10.3 Le bras à deux articulations, pas à pas'),
    FIG('0 0 340 200', `
      <line class="dash" x1="20" y1="170" x2="320" y2="170"/>
      <line class="link1" x1="60" y1="170" x2="172.6" y2="105"/><line class="link2" x1="172.6" y1="105" x2="206.8" y2="11"/>
      <circle class="jt" cx="60" cy="170" r="5"/><circle cx="172.6" cy="105" r="9" fill="#ff9f43"/><circle cx="206.8" cy="11" r="7" fill="#ff6b6b"/>
      <path class="arc" d="M100,170 A40,40 0 0 0 94.6,150"/><text x="106" y="160">θ₁</text>
      <line class="dash" x1="172.6" y1="105" x2="207.2" y2="85"/><path class="arc" d="M199,90 A30,30 0 0 0 182.9,77.8"/><text x="204" y="76">θ₂</text>
      <text x="108" y="125" class="c-l">L₁</text><text x="176" y="58" class="c-l2">L₂</text>
      <text x="186" y="122" class="c-x">${svgtx('m₁')}</text><text x="220" y="16" class="c-pt">${svgtx('m₂')}</text>
      <line class="ax" x1="300" y1="40" x2="300" y2="90" marker-end="url(#mkax2)"/><text x="306" y="70">g</text>
      <defs><marker id="mkax2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#9aa7b6"/></marker></defs>`),
    P(`Point mass ${m1} at the end of link 1 (the elbow motor, for example), point mass ${m2} at the end of link 2 (the tool and its load). The arm turns in a vertical plane.`,
      `Masse ponctuelle ${m1} au bout du segment 1 (le moteur du coude, par exemple), masse ponctuelle ${m2} au bout du segment 2 (l'outil et sa charge). Le bras tourne dans un plan vertical.`),
    P('<strong>Step 1 — positions</strong> (forward kinematics):', '<strong>Étape 1 — positions</strong> (modèle direct) :'),
    EQ(`<i>x</i><sub>1</sub> = ${L1} cos ${t1},  <i>y</i><sub>1</sub> = ${L1} sin ${t1}${SP}<i>x</i><sub>2</sub> = <i>x</i><sub>1</sub> + ${L2} cos(${t1} + ${t2}),  <i>y</i><sub>2</sub> = <i>y</i><sub>1</sub> + ${L2} sin(${t1} + ${t2})`),
    P('<strong>Step 2 — speeds squared.</strong> Derive the positions in time (chain rule), then add the squares. Mass 1 turns on a circle: <i>v</i><sub>1</sub>² = <i>L</i><sub>1</sub>² <i>θ̇</i><sub>1</sub>². For mass 2, after expanding and using cos² + sin² = 1:',
      '<strong>Étape 2 — vitesses au carré.</strong> On dérive les positions dans le temps (dérivée composée), puis on ajoute les carrés. La masse 1 tourne sur un cercle : <i>v</i><sub>1</sub>² = <i>L</i><sub>1</sub>² <i>θ̇</i><sub>1</sub>². Pour la masse 2, après développement et avec cos² + sin² = 1 :'),
    EQ(`<i>v</i><sub>2</sub>² = ${L1}² ${d1}² + ${L2}² (${d1} + ${d2})² + 2 ${L1} ${L2} cos ${t2} · ${d1} (${d1} + ${d2})`),
    P(`The last term is the only place where the two links “talk to each other”. It depends on ${t2} only: how the arm is bent, not where it points.`,
      `Le dernier terme est le seul endroit où les deux segments « se parlent ». Il dépend seulement de ${t2} : de la façon dont le bras est plié, pas de la direction où il pointe.`),
    P('<strong>Step 3 — the energies:</strong>', '<strong>Étape 3 — les énergies :</strong>'),
    EQ(`<i>T</i> = ½ ${m1} <i>v</i><sub>1</sub>² + ½ ${m2} <i>v</i><sub>2</sub>²${SP}<i>V</i> = ${m1} <i>g</i> ${L1} sin ${t1} + ${m2} <i>g</i> ( ${L1} sin ${t1} + ${L2} sin(${t1} + ${t2}) )`),
    P('<strong>Step 4 — the recipe, joint 2</strong> (the shorter one). Only the terms of <i>ℒ</i> that contain <i>θ̇</i><sub>2</sub> or <i>θ</i><sub>2</sub> matter:',
      '<strong>Étape 4 — la recette, liaison 2</strong> (la plus courte). Seuls les termes de <i>ℒ</i> qui contiennent <i>θ̇</i><sub>2</sub> ou <i>θ</i><sub>2</sub> comptent :'),
    UL([
      [`∂<i>ℒ</i>/∂${d2} = ${m2} ${L2}² (${d1} + ${d2}) + ${m2} ${L1} ${L2} cos ${t2} · ${d1}`, `∂<i>ℒ</i>/∂${d2} = ${m2} ${L2}² (${d1} + ${d2}) + ${m2} ${L1} ${L2} cos ${t2} · ${d1}`],
      [`Its derivative in time: ${m2} ${L2}² (${a1} + ${a2}) + ${m2} ${L1} ${L2} cos ${t2} · ${a1} − ${m2} ${L1} ${L2} sin ${t2} · ${d1} ${d2}`, `Sa dérivée dans le temps : ${m2} ${L2}² (${a1} + ${a2}) + ${m2} ${L1} ${L2} cos ${t2} · ${a1} − ${m2} ${L1} ${L2} sin ${t2} · ${d1} ${d2}`],
      [`∂<i>ℒ</i>/∂${t2} = −${m2} ${L1} ${L2} sin ${t2} · ${d1} (${d1} + ${d2}) − ${m2} <i>g</i> ${L2} cos(${t1} + ${t2})`, `∂<i>ℒ</i>/∂${t2} = −${m2} ${L1} ${L2} sin ${t2} · ${d1} (${d1} + ${d2}) − ${m2} <i>g</i> ${L2} cos(${t1} + ${t2})`]
    ]),
    P(`Subtract: the terms in ${d1} ${d2} cancel, and what remains is:`, `On soustrait : les termes en ${d1} ${d2} s'annulent, et il reste :`),
    EQ(`<i>τ</i><sub>2</sub> = ( ${m2} ${L2}² + ${m2} ${L1} ${L2} cos ${t2} ) ${a1} + ${m2} ${L2}² ${a2} + ${m2} ${L1} ${L2} sin ${t2} · ${d1}² + ${m2} <i>g</i> ${L2} cos(${t1} + ${t2})`),
    P('<strong>Step 5 — joint 1</strong>, the same way (longer, but nothing new):', '<strong>Étape 5 — liaison 1</strong>, de la même façon (plus long, mais rien de nouveau) :'),
    EQ(`<i>τ</i><sub>1</sub> = ( (${m1} + ${m2}) ${L1}² + ${m2} ${L2}² + 2 ${m2} ${L1} ${L2} cos ${t2} ) ${a1} + ( ${m2} ${L2}² + ${m2} ${L1} ${L2} cos ${t2} ) ${a2}`),
    EQ(`− ${m2} ${L1} ${L2} sin ${t2} ( 2 ${d1} ${d2} + ${d2}² ) + (${m1} + ${m2}) <i>g</i> ${L1} cos ${t1} + ${m2} <i>g</i> ${L2} cos(${t1} + ${t2})`),
    H4('10.4 Sort the terms: M, C and g', '10.4 Ranger les termes : M, C et g'),
    P('Group what multiplies the accelerations, what contains products of speeds, and what contains <i>g</i>. You find the form of lesson 1:', 'Regroupez ce qui multiplie les accélérations, ce qui contient des produits de vitesses, et ce qui contient <i>g</i>. Vous retrouvez la forme de la leçon 1 :'),
    EQ('<i>τ</i> = <i>M</i>(<i>q</i>) <i>q̈</i> + <i>C</i>(<i>q</i>, <i>q̇</i>) <i>q̇</i> + <i>g</i>(<i>q</i>)'),
    TABLE([['Part', 'Partie'], ['Joint 1', 'Liaison 1'], ['Joint 2', 'Liaison 2'], ['Where it came from', 'D\'où ça vient']], [
      [['inertia <i>M</i> <i>q̈</i>', 'inertie <i>M</i> <i>q̈</i>'], `<i>M</i><sub>11</sub> ${a1} + <i>M</i><sub>12</sub> ${a2}`, `<i>M</i><sub>12</sub> ${a1} + <i>M</i><sub>22</sub> ${a2}`, ['d/dt of ∂ℒ/∂q̇: the kinetic energy', 'd/dt de ∂ℒ/∂q̇ : l\'énergie cinétique']],
      [['Coriolis and centrifugal', 'Coriolis et centrifuge'], `−<i>h</i> (2 ${d1} ${d2} + ${d2}²)`, `+<i>h</i> ${d1}²`, ['the cos θ₂ term of v₂², derived', 'le terme en cos θ₂ de v₂², dérivé']],
      [['gravity <i>g</i>(<i>q</i>)', 'gravité <i>g</i>(<i>q</i>)'], `(${m1} + ${m2}) <i>g</i> ${L1} cos ${t1} + ${m2} <i>g</i> ${L2} cos(${t1} + ${t2})`, `${m2} <i>g</i> ${L2} cos(${t1} + ${t2})`, ['∂ℒ/∂q: the potential energy', '∂ℒ/∂q : l\'énergie potentielle']]
    ]),
    P(`with <i>h</i> = ${m2} ${L1} ${L2} sin ${t2}, <i>M</i><sub>11</sub> = (${m1} + ${m2}) ${L1}² + ${m2} ${L2}² + 2 ${m2} ${L1} ${L2} cos ${t2}, <i>M</i><sub>12</sub> = ${m2} ${L2}² + ${m2} ${L1} ${L2} cos ${t2}, <i>M</i><sub>22</sub> = ${m2} ${L2}².`,
      `avec <i>h</i> = ${m2} ${L1} ${L2} sin ${t2}, <i>M</i><sub>11</sub> = (${m1} + ${m2}) ${L1}² + ${m2} ${L2}² + 2 ${m2} ${L1} ${L2} cos ${t2}, <i>M</i><sub>12</sub> = ${m2} ${L2}² + ${m2} ${L1} ${L2} cos ${t2}, <i>M</i><sub>22</sub> = ${m2} ${L2}².`),
    BOX('keep', ['Three checks to trust your result', 'Trois vérifications pour avoir confiance dans votre résultat'],
      UL([
        ['<strong>M is symmetric</strong>: the term in front of <i>θ̈</i><sub>2</sub> on joint 1 equals the term in front of <i>θ̈</i><sub>1</sub> on joint 2 (both <i>M</i><sub>12</sub>). Always true.', '<strong>M est symétrique</strong> : le terme devant <i>θ̈</i><sub>2</sub> sur la liaison 1 est égal au terme devant <i>θ̈</i><sub>1</sub> sur la liaison 2 (les deux valent <i>M</i><sub>12</sub>). Toujours vrai.'],
        ['<strong>M depends only on θ₂</strong>: turning the whole arm around the base does not change its shape, so it does not change its inertia.', '<strong>M ne dépend que de θ₂</strong> : faire tourner tout le bras autour de la base ne change pas sa forme, donc pas son inertie.'],
        ['<strong>Units</strong>: every term must be in N·m (kg·m²·rad/s² or kg·m/s²·m).', '<strong>Unités</strong> : chaque terme doit être en N·m (kg·m²·rad/s² ou kg·m/s²·m).']
      ])),
    H4('10.5 With numbers', '10.5 Avec des nombres'),
    P(`${m1} = 2 kg, ${m2} = 1 kg, ${L1} = 0.5 m, ${L2} = 0.4 m, ${t1} = 30°, ${t2} = 45°.`, `${m1} = 2 kg, ${m2} = 1 kg, ${L1} = 0,5 m, ${L2} = 0,4 m, ${t1} = 30°, ${t2} = 45°.`),
    TABLE([['Situation', 'Situation'], ['τ₁ (N·m)', 'τ₁ (N·m)'], ['τ₂ (N·m)', 'τ₂ (N·m)'], ['What it shows', 'Ce que ça montre']], [
      [['at rest (gravity only)', 'à l\'arrêt (gravité seule)'], ['13.76', '13,76'], ['1.02', '1,02'], ['holding the arm already costs 13.76 N·m on the shoulder', 'tenir le bras coûte déjà 13,76 N·m à l\'épaule']],
      [['+ <i>θ̈</i><sub>1</sub> = 2 rad/s²', '+ <i>θ̈</i><sub>1</sub> = 2 rad/s²'], ['16.15', '16,15'], ['1.62', '1,62'], ['accelerating joint 1 also needs torque on joint 2 (<i>M</i><sub>12</sub> = 0.301)', 'accélérer la liaison 1 demande aussi du couple à la liaison 2 (<i>M</i><sub>12</sub> = 0,301)']],
      [['constant speed: <i>θ̇</i> = (1, 2) rad/s, <i>θ̈</i> = 0', 'à vitesse constante : <i>θ̇</i> = (1, 2) rad/s, <i>θ̈</i> = 0'], ['12.63', '12,63'], ['1.16', '1,16'], ['Coriolis: −1.13 N·m on joint 1, +0.14 N·m on joint 2, with no acceleration at all', 'Coriolis : −1,13 N·m sur la liaison 1, +0,14 N·m sur la liaison 2, sans aucune accélération']]
    ]),
    P(`Here <i>M</i> = ${MX(2, ['1.193', '0.301', '0.301', '0.160'])} kg·m² and <i>h</i> = 1 × 0.5 × 0.4 × sin 45° = 0.141.`, `Ici <i>M</i> = ${MX(2, ['1,193', '0,301', '0,301', '0,160'])} kg·m² et <i>h</i> = 1 × 0,5 × 0,4 × sin 45° = 0,141.`),
    H4('10.6 The other way: simulating the robot', '10.6 Dans l\'autre sens : simuler le robot'),
    P('The model gives the torque for a wanted motion (<strong>inverse dynamics</strong>). Turned around, it gives the motion for given torques (<strong>forward dynamics</strong>): this is what a simulator computes, step after step.',
      'Le modèle donne le couple pour un mouvement voulu (<strong>dynamique inverse</strong>). Retourné, il donne le mouvement pour des couples donnés (<strong>dynamique directe</strong>) : c\'est ce que calcule un simulateur, pas après pas.'),
    EQ(`<i>q̈</i> = <i>M</i>(<i>q</i>)<sup>−1</sup> ( <i>τ</i> − <i>C</i> <i>q̇</i> − <i>g</i>(<i>q</i>) )${SP}<i>q̇</i> ← <i>q̇</i> + <i>q̈</i> Δ<i>t</i>${SP}<i>q</i> ← <i>q</i> + <i>q̇</i> Δ<i>t</i>`),
    BOX('example', ['What happens if the motors switch off?', 'Que se passe-t-il si les moteurs se coupent ?'],
      P(`Same arm at rest, <i>τ</i> = 0: <i>q̈</i> = −<i>M</i><sup>−1</sup> <i>g</i> = (<strong>−18.9</strong>, <strong>+29.4</strong>) rad/s². The shoulder falls, as expected. But the elbow accelerates in the <em>positive</em> direction: as link 1 falls, it drags the forearm, which swings up relative to it. This coupling is invisible without the full model, and it is why a robot needs brakes on every joint.`,
        `Même bras à l'arrêt, <i>τ</i> = 0 : <i>q̈</i> = −<i>M</i><sup>−1</sup> <i>g</i> = (<strong>−18,9</strong> ; <strong>+29,4</strong>) rad/s². L'épaule tombe, comme prévu. Mais le coude accélère dans le sens <em>positif</em> : en tombant, le segment 1 entraîne l'avant-bras, qui pivote vers le haut par rapport à lui. Ce couplage est invisible sans le modèle complet, et c'est pour cela qu'un robot a besoin de freins sur chaque liaison.`)),
    H4('10.7 Lagrange or Newton–Euler?', '10.7 Lagrange ou Newton–Euler ?'),
    TABLE([['', ''], ['Lagrange', 'Lagrange'], ['Newton–Euler', 'Newton–Euler']], [
      [['Starts from', 'Part de'], ['the energies of the whole robot', 'les énergies de tout le robot'], ['the forces and torques on each link', 'les forces et couples sur chaque corps']],
      [['Best for', 'Idéal pour'], ['deriving the equations by hand, understanding the terms', 'calculer les équations à la main, comprendre les termes'], ['a computer: a loop from the base to the tool and back, fast for 6 or 7 joints', 'un ordinateur : une boucle de la base à l\'outil et retour, rapide pour 6 ou 7 liaisons']],
      [['Result', 'Résultat'], ['the same equation', 'la même équation'], ['the same equation', 'la même équation']]
    ]),
    P('For real links (not point masses) each link also has an inertia around its centre of mass, which adds ½ <i>I</i> <i>ω</i>² to <i>T</i>. The method does not change. Software such as Pinocchio, the Robotics Toolbox or the controllers of industrial robots compute it from the URDF or the DH table.',
      'Pour de vrais segments (pas des masses ponctuelles), chaque segment a aussi une inertie autour de son centre de masse, qui ajoute ½ <i>I</i> <i>ω</i>² à <i>T</i>. La méthode ne change pas. Des logiciels comme Pinocchio, la Robotics Toolbox ou les contrôleurs des robots industriels le calculent à partir de l\'URDF ou du tableau DH.')
  ],
  terms: [['Lagrangian', 'lagrangien'], ['kinetic energy', 'énergie cinétique'], ['potential energy', 'énergie potentielle'], ['inverse dynamics', 'dynamique inverse'], ['forward dynamics', 'dynamique directe'], ['inertia matrix', 'matrice d\'inertie'], ['Newton–Euler', 'Newton–Euler']],
  quiz: [
    ['What are the two quantities the Lagrange method starts from?', 'De quelles deux grandeurs part la méthode de Lagrange ?', 'The kinetic energy T and the potential energy V of the robot (ℒ = T − V).', 'L\'énergie cinétique T et l\'énergie potentielle V du robot (ℒ = T − V).'],
    ['In the formula τᵢ = d/dt(∂ℒ/∂q̇ᵢ) − ∂ℒ/∂qᵢ, which part gives the gravity term?', 'Dans la formule τᵢ = d/dt(∂ℒ/∂q̇ᵢ) − ∂ℒ/∂qᵢ, quelle partie donne le terme de gravité ?', 'The second part, −∂ℒ/∂qᵢ, through the potential energy.', 'La seconde partie, −∂ℒ/∂qᵢ, au travers de l\'énergie potentielle.'],
    ['Why does the inertia matrix of the two-joint arm depend on θ₂ but not on θ₁?', 'Pourquoi la matrice d\'inertie du bras à deux articulations dépend-elle de θ₂ mais pas de θ₁ ?', 'θ₂ changes the shape of the arm (how far the masses are from the base); θ₁ only turns the whole arm without changing its shape.', 'θ₂ change la forme du bras (la distance des masses à la base) ; θ₁ ne fait que tourner tout le bras sans changer sa forme.']
  ],
  link: ['learn-mathkit.html#l9', 'Review derivatives and partial derivatives →', 'Revoir les dérivées et dérivées partielles →']
})
  ];
}
