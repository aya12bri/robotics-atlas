import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'sing-';
const M2 = (a, b, c, d) => MX(2, [a, b, c, d]);
const M3 = (...c) => MX(3, c);
const V2 = (a, b) => MX(1, [a, b]);

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Why singularities hurt: speeds, forces and accuracy', 'Pourquoi les singularités gênent : vitesses, efforts et précision'],
  time: 12,
  goal: ['what really happens to the motors, the forces and the precision of a robot near a singularity.', 'ce qui se passe vraiment pour les moteurs, les efforts et la précision d\'un robot près d\'une singularité.'],
  body: [
    H4('5.1 The joint speeds explode', '5.1 Les vitesses articulaires explosent'),
    P('To make the tool follow a Cartesian path at speed <i>ẋ</i>, the controller computes the joint speeds with the inverse Jacobian. For the two-joint arm:',
      'Pour que l\'outil suive un chemin cartésien à la vitesse <i>ẋ</i>, le contrôleur calcule les vitesses articulaires avec la jacobienne inverse. Pour le bras à deux articulations :'),
    EQ(`<i>J</i><sup>−1</sup> = (1 / (<i>L</i><sub>1</sub><i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>)) ${M2('<i>L</i><sub>2</sub> cos <i>θ</i><sub>12</sub>', '<i>L</i><sub>2</sub> sin <i>θ</i><sub>12</sub>', '−<i>L</i><sub>1</sub> cos <i>θ</i><sub>1</sub> − <i>L</i><sub>2</sub> cos <i>θ</i><sub>12</sub>', '−<i>L</i><sub>1</sub> sin <i>θ</i><sub>1</sub> − <i>L</i><sub>2</sub> sin <i>θ</i><sub>12</sub>')}`),
    P('Every term is divided by det <i>J</i> = <i>L</i><sub>1</sub><i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>. When it tends to zero, the joint speeds tend to infinity.',
      'Chaque terme est divisé par det <i>J</i> = <i>L</i><sub>1</sub><i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>. Quand il tend vers zéro, les vitesses articulaires tendent vers l\'infini.'),
    BOX('example', ['Worked example: 0.1 m/s along the arm', 'Exemple résolu : 0,1 m/s le long du bras'],
      P('<i>L</i><sub>1</sub> = 0.5 m, <i>L</i><sub>2</sub> = 0.3 m, <i>θ</i><sub>1</sub> = 0. The tool must move at only <i>ẋ</i> = 0.1 m/s (6 m/min, a slow walk) along the arm. We lower the elbow angle <i>θ</i><sub>2</sub> towards 0:',
        '<i>L</i><sub>1</sub> = 0,5 m, <i>L</i><sub>2</sub> = 0,3 m, <i>θ</i><sub>1</sub> = 0. L\'outil doit seulement avancer à <i>ẋ</i> = 0,1 m/s (6 m/min, une marche lente) le long du bras. On fait tendre l\'angle du coude <i>θ</i><sub>2</sub> vers 0 :'),
      TABLE([['θ₂', 'θ₂'], ['|θ̇₁| (rad/s)', '|θ̇₁| (rad/s)'], ['|θ̇₂| (rad/s)', '|θ̇₂| (rad/s)'], ['elbow motor', 'moteur du coude']], [
        ['90°', ['0', '0'], ['0.33', '0,33'], ['3 rpm', '3 tr/min']],
        ['20°', ['0.55', '0,55'], ['1.5', '1,5'], ['15 rpm', '15 tr/min']],
        ['5°', ['2.3', '2,3'], ['6.1', '6,1'], ['58 rpm', '58 tr/min']],
        ['1°', ['11', '11'], ['31', '31'], ['290 rpm', '290 tr/min']]
      ], 'center'),
      P('Same slow tool speed, but a hundred times more motor speed. A real joint has a speed limit (a few rad/s): the controller must slow the tool down, or the robot stops.',
        'Même vitesse lente de l\'outil, mais cent fois plus de vitesse moteur. Une vraie articulation a une limite de vitesse (quelques rad/s) : le contrôleur doit ralentir l\'outil, sinon le robot s\'arrête.')),
    H4('5.2 Forces: the same matrix, transposed', '5.2 Les efforts : la même matrice, transposée'),
    P('The power given by the motors, <i>τ</i><sup>T</sup> <i>q̇</i>, equals the power received by the tool, <i>F</i><sup>T</sup> <i>ẋ</i> = <i>F</i><sup>T</sup> <i>J</i> <i>q̇</i>. Hence the <strong>static model</strong>:',
      'La puissance fournie par les moteurs, <i>τ</i><sup>T</sup> <i>q̇</i>, est égale à la puissance reçue par l\'outil, <i>F</i><sup>T</sup> <i>ẋ</i> = <i>F</i><sup>T</sup> <i>J</i> <i>q̇</i>. D\'où le <strong>modèle statique</strong> :'),
    EQ('<i>τ</i> = <i>J</i><sup>T</sup> <i>F</i>'),
    P('To push on the world with a force <i>F</i> at the tool, the motors must supply the torques <i>τ</i>. Now take the arm stretched along <i>x</i> (<i>θ</i><sub>1</sub> = <i>θ</i><sub>2</sub> = 0, <i>L</i><sub>1</sub> = 0.5, <i>L</i><sub>2</sub> = 0.3):',
      'Pour pousser sur le monde avec un effort <i>F</i> à l\'outil, les moteurs doivent fournir les couples <i>τ</i>. Prenez maintenant le bras tendu selon <i>x</i> (<i>θ</i><sub>1</sub> = <i>θ</i><sub>2</sub> = 0, <i>L</i><sub>1</sub> = 0,5, <i>L</i><sub>2</sub> = 0,3) :'),
    EQ(`${V2('<i>τ</i><sub>1</sub>', '<i>τ</i><sub>2</sub>')} = ${M2('0', '0.8', '0', '0.3')} ${V2('<i>F</i><sub><i>x</i></sub>', '<i>F</i><sub><i>y</i></sub>')} = ${V2('0.8 <i>F</i><sub><i>y</i></sub>', '0.3 <i>F</i><sub><i>y</i></sub>')}`, `${V2('<i>τ</i><sub>1</sub>', '<i>τ</i><sub>2</sub>')} = ${M2('0', '0,8', '0', '0,3')} ${V2('<i>F</i><sub><i>x</i></sub>', '<i>F</i><sub><i>y</i></sub>')} = ${V2('0,8 <i>F</i><sub><i>y</i></sub>', '0,3 <i>F</i><sub><i>y</i></sub>')}`),
    P('<i>F</i><sub><i>x</i></sub> does not appear: a load of 1000 N pulling on the tool <strong>along the arm</strong> needs <strong>zero motor torque</strong>. The structure carries it. But a force of 10 N sideways needs 8 N·m and 3 N·m.',
      '<i>F</i><sub><i>x</i></sub> n\'apparaît pas : une charge de 1000 N qui tire sur l\'outil <strong>le long du bras</strong> demande <strong>zéro couple moteur</strong>. C\'est la structure qui la porte. Mais un effort de 10 N latéral demande 8 N·m et 3 N·m.'),
    BOX('keep', ['Remember: the duality', 'À retenir : la dualité'],
      UL([
        ['The directions where the tool <strong>cannot move</strong> (lost by <i>J</i>) are the directions where the robot <strong>can carry any load without motor torque</strong> (null space of <i>J</i><sup>T</sup>).', 'Les directions où l\'outil <strong>ne peut pas bouger</strong> (perdues par <i>J</i>) sont les directions où le robot <strong>peut porter n\'importe quelle charge sans couple moteur</strong> (noyau de <i>J</i><sup>T</sup>).'],
        ['It looks like a bonus (a strong, light robot), but the motors cannot <em>control</em> the force in that direction: no force control, no way to push gently, and the structure may be overloaded without any motor feeling it.', 'Cela ressemble à un bonus (un robot fort et léger), mais les moteurs ne peuvent pas <em>contrôler</em> l\'effort dans cette direction : pas de commande en effort, pas de poussée douce, et la structure peut être surchargée sans qu\'aucun moteur ne le sente.']
      ])),
    H4('5.3 Accuracy and noise', '5.3 Précision et bruit'),
    P('Going from the joints to the tool (forward) is benign: d<i>x</i> = <i>J</i> d<i>q</i>, the error of the encoders is passed on without amplification. Going from the tool to the joints is the problem: a tool error of d<i>x</i> asks for up to d<i>x</i>/<i>σ</i><sub>min</sub> of joint motion. With the arm of lesson 4, a tool step of 0.1 mm needs about 0.02° at θ₂ = 90° (<i>σ</i><sub>min</sub> = 0.25) but about 0.9° at θ₂ = 2° (<i>σ</i><sub>min</sub> = 0.0061): 40 times more, which can be below the resolution of the gearbox and the encoder. A small calibration error becomes a visible error.',
      'Aller des articulations vers l\'outil (direct) est bénin : d<i>x</i> = <i>J</i> d<i>q</i>, l\'erreur des codeurs est transmise sans amplification. Aller de l\'outil vers les articulations est le problème : une erreur d\'outil d<i>x</i> demande jusqu\'à d<i>x</i>/<i>σ</i><sub>min</sub> de mouvement articulaire. Avec le bras de la leçon 4, un pas d\'outil de 0,1 mm demande environ 0,02° à θ₂ = 90° (<i>σ</i><sub>min</sub> = 0,25) mais environ 0,9° à θ₂ = 2° (<i>σ</i><sub>min</sub> = 0,0061) : 40 fois plus, ce qui peut être en dessous de la résolution du réducteur et du codeur. Une petite erreur d\'étalonnage devient une erreur visible.'),
    H4('5.4 What you see in a real program', '5.4 Ce que l\'on voit dans un vrai programme'),
    TABLE([['Symptom', 'Symptôme'], ['Cause', 'Cause']], [
      [['An alarm “singularity” or “joint speed limit exceeded”', 'Une alarme « singularité » ou « vitesse articulaire dépassée »'], ['The inverse Jacobian asks for more than the motors can give.', 'La jacobienne inverse demande plus que ce que les moteurs peuvent donner.']],
      [['The robot slows down for no apparent reason', 'Le robot ralentit sans raison apparente'], ['The controller scales the path speed to keep the joints within their limits.', 'Le contrôleur réduit la vitesse sur le chemin pour garder les articulations dans leurs limites.']],
      [['A linear move fails but the same target in joint mode works', 'Un mouvement linéaire échoue mais la même cible en mode articulaire fonctionne'], ['The straight line crosses a singularity; joint interpolation does not invert anything.', 'La ligne droite traverse une singularité ; l\'interpolation articulaire n\'inverse rien.']],
      [['Axes 4 and 6 spin fast in opposite directions', 'Les axes 4 et 6 tournent vite en sens opposés'], ['Wrist singularity: the two axes cancel each other.', 'Singularité de poignet : les deux axes s\'annulent.']],
      [['Vibration, noise, hot motors', 'Vibrations, bruit, moteurs chauds'], ['Large high-frequency joint corrections to hold a tiny tool error.', 'De grandes corrections articulaires à haute fréquence pour tenir une toute petite erreur d\'outil.']]
    ])
  ],
  terms: [['inverse Jacobian', 'jacobienne inverse'], ['static model', 'modèle statique'], ['joint torque', 'couple articulaire'], ['duality', 'dualité'], ['speed limit', 'limite de vitesse']],
  quiz: [
    ['A 500 N load pulls along the axis of the stretched arm of the example. What torques do the motors supply?', 'Une charge de 500 N tire dans l\'axe du bras tendu de l\'exemple. Quels couples fournissent les moteurs ?', 'Zero: τ = Jᵀ F, and Fx is multiplied by 0. The bones carry the load.', 'Zéro : τ = Jᵀ F, et Fx est multiplié par 0. Les os portent la charge.'],
    ['In the example table, why does the elbow motor need 290 rpm at θ₂ = 1° for a tool moving at 0.1 m/s?', 'Dans le tableau de l\'exemple, pourquoi le moteur du coude demande-t-il 290 tr/min à θ₂ = 1° pour un outil à 0,1 m/s ?', 'Because to move the tool along an almost stretched arm, the elbow has to bend, and bending moves the tool along the arm only very slowly (by a second-order effect). The inverse Jacobian is divided by sin θ₂.', 'Parce que pour avancer le long d\'un bras presque tendu, le coude doit se plier, et plier ne déplace l\'outil le long du bras que très lentement (effet du second ordre). La jacobienne inverse est divisée par sin θ₂.'],
    ['Why is a MoveJ (joint interpolation) able to cross a singularity that stops a MoveL?', 'Pourquoi un MoveJ (interpolation articulaire) peut-il traverser une singularité qui arrête un MoveL ?', 'It interpolates the joint values directly and never computes the inverse Jacobian.', 'Il interpole directement les valeurs des articulations et ne calcule jamais la jacobienne inverse.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['Orientation singularities: gimbal lock', 'Singularités d\'orientation : le blocage de cardan'],
  time: 12,
  goal: ['why Euler and Cardan angles have a singularity, how it differs from a robot singularity, and what to use instead.', 'pourquoi les angles d\'Euler et de Cardan ont une singularité, en quoi elle diffère d\'une singularité du robot, et quoi utiliser à la place.'],
  body: [
    P('So far the singularity was in the <em>robot</em>. There is another one in the <em>maths</em> we use to write an orientation with three angles. It has the same bad effects on the controller, so it is worth knowing both.',
      'Jusqu\'ici la singularité était dans le <em>robot</em>. Il en existe une autre dans les <em>maths</em> que l\'on utilise pour écrire une orientation avec trois angles. Elle a les mêmes mauvais effets sur le contrôleur, il faut donc connaître les deux.'),
    H4('6.1 Three angles, one lost', '6.1 Trois angles, un de perdu'),
    P('Cardan angles (roll-pitch-yaw): rotate by <i>α</i> about <i>z</i>, then <i>β</i> about <i>y</i>, then <i>γ</i> about <i>x</i> (all in the fixed frame): <i>R</i> = <i>R</i><sub>z</sub>(<i>α</i>) <i>R</i><sub>y</sub>(<i>β</i>) <i>R</i><sub>x</sub>(<i>γ</i>). Take the pitch <i>β</i> = 90° and compute the product:',
      'Angles de Cardan (roulis-tangage-lacet) : rotation de <i>α</i> autour de <i>z</i>, puis de <i>β</i> autour de <i>y</i>, puis de <i>γ</i> autour de <i>x</i> (tous dans le repère fixe) : <i>R</i> = <i>R</i><sub>z</sub>(<i>α</i>) <i>R</i><sub>y</sub>(<i>β</i>) <i>R</i><sub>x</sub>(<i>γ</i>). Prenez le tangage <i>β</i> = 90° et calculez le produit :'),
    EQ(`<i>R</i> = ${M3('0', 'sin(<i>γ</i> − <i>α</i>)', 'cos(<i>γ</i> − <i>α</i>)', '0', 'cos(<i>γ</i> − <i>α</i>)', '−sin(<i>γ</i> − <i>α</i>)', '−1', '0', '0')}`),
    P('The matrix depends only on <i>γ</i> − <i>α</i>. Whatever <i>α</i> and <i>γ</i> are, if their difference is the same, the orientation is the <strong>same</strong>. We have three angles but only two numbers matter: a degree of freedom has disappeared. This is <strong>gimbal lock</strong>.',
      'La matrice ne dépend que de <i>γ</i> − <i>α</i>. Quels que soient <i>α</i> et <i>γ</i>, si leur différence est la même, l\'orientation est la <strong>même</strong>. On a trois angles mais seuls deux nombres comptent : un degré de liberté a disparu. C\'est le <strong>blocage de cardan</strong> (gimbal lock).'),
    WIDGET('gimbal'),
    BOX('example', ['The Apollo story', 'L\'histoire d\'Apollo'],
      P('The inertial platform of the Apollo spacecraft was a real set of three gimbals. When the middle gimbal approached 90° the outer and inner axes lined up and the platform lost a direction: the crew had to avoid that zone and received a warning before reaching it. It is exactly the same maths as the matrix above.',
        'La plateforme inertielle du vaisseau Apollo était un vrai ensemble de trois cardans. Quand le cardan du milieu approchait 90°, les axes extérieur et intérieur s\'alignaient et la plateforme perdait une direction : l\'équipage devait éviter cette zone et recevait une alerte avant de l\'atteindre. C\'est exactement les mêmes maths que la matrice ci-dessus.')),
    H4('6.2 Representation singularity versus robot singularity', '6.2 Singularité de représentation ou singularité du robot'),
    P('The angular velocity <i>ω</i> of the tool is related to the rates of the three angles by a matrix <i>E</i>:',
      'La vitesse angulaire <i>ω</i> de l\'outil est reliée aux vitesses des trois angles par une matrice <i>E</i> :'),
    EQ(`${MX(1, ['<i>ω</i><sub>x</sub>', '<i>ω</i><sub>y</sub>', '<i>ω</i><sub>z</sub>'])} = ${M3('0', '−sin <i>α</i>', 'cos <i>α</i> cos <i>β</i>', '0', 'cos <i>α</i>', 'sin <i>α</i> cos <i>β</i>', '1', '0', '−sin <i>β</i>')} ${MX(1, ['<i>α̇</i>', '<i>β̇</i>', '<i>γ̇</i>'])}        det <i>E</i> = −cos <i>β</i>`),
    P('When <i>β</i> = ±90°, det <i>E</i> = 0: some angular velocities <i>ω</i> would need infinite rates <i>α̇</i> and <i>γ̇</i>. The tool itself is perfectly fine; it is the <strong>way of writing</strong> its orientation that breaks. Engineers therefore distinguish two Jacobians: the <strong>geometric</strong> one (about <i>ω</i>, singular only when the robot is) and the <strong>analytical</strong> one (about the angle rates, which also inherits the singularity of <i>E</i>).',
      'Quand <i>β</i> = ±90°, det <i>E</i> = 0 : certaines vitesses angulaires <i>ω</i> demanderaient des vitesses <i>α̇</i> et <i>γ̇</i> infinies. L\'outil lui-même va très bien ; c\'est la <strong>façon d\'écrire</strong> son orientation qui casse. Les ingénieurs distinguent donc deux jacobiennes : la <strong>géométrique</strong> (sur <i>ω</i>, singulière seulement quand le robot l\'est) et l\'<strong>analytique</strong> (sur les vitesses des angles, qui hérite aussi de la singularité de <i>E</i>).'),
    TABLE([['', ''], ['Robot singularity', 'Singularité du robot'], ['Representation singularity (gimbal lock)', 'Singularité de représentation (blocage de cardan)']], [
      [['Where?', 'Où ?'], ['In the mechanism: depends on the joint values <i>q</i>.', 'Dans le mécanisme : dépend des valeurs articulaires <i>q</i>.'], ['In the maths: depends on the chosen angles.', 'Dans les maths : dépend des angles choisis.']],
      [['Is it physical?', 'Est-elle physique ?'], ['Yes: the tool really cannot move in some direction.', 'Oui : l\'outil ne peut vraiment pas bouger dans une direction.'], ['No: the tool can turn freely, only the three numbers are ambiguous.', 'Non : l\'outil peut tourner librement, seuls les trois nombres sont ambigus.']],
      [['Cure', 'Remède'], ['Move away, replan, redundancy (lessons 7-8).', 'S\'éloigner, replanifier, redondance (leçons 7-8).'], ['Change the representation: matrix or quaternion.', 'Changer de représentation : matrice ou quaternion.']]
    ]),
    H4('6.3 What to use instead', '6.3 Que prendre à la place'),
    TABLE([['Representation', 'Représentation'], ['Numbers', 'Nombres'], ['Singular?', 'Singulière ?'], ['Comment', 'Remarque']], [
      [['Euler / Cardan angles', 'Angles d\'Euler / de Cardan'], '3', ['Yes (±90° for Cardan)', 'Oui (±90° pour Cardan)'], ['Human friendly. Fine for display, bad for computing and interpolating.', 'Lisible pour un humain. Bien pour l\'affichage, mauvais pour calculer et interpoler.']],
      [['Rotation matrix', 'Matrice de rotation'], '9', ['No', 'Non'], ['Everything works; 9 numbers with 6 constraints.', 'Tout fonctionne ; 9 nombres avec 6 contraintes.']],
      [['Axis and angle / rotation vector', 'Axe et angle / vecteur rotation'], '3-4', ['At 0° and 180° it is ambiguous', 'Ambiguë à 0° et 180°'], ['Intuitive; used for small rotations and errors.', 'Intuitive ; utilisée pour les petites rotations et les erreurs.']],
      [['Unit quaternion', 'Quaternion unitaire'], '4', ['No', 'Non'], ['<i>q</i> = (cos(<i>θ</i>/2), <i>n</i> sin(<i>θ</i>/2)). <i>q</i> and −<i>q</i> are the same rotation. Smooth interpolation (SLERP).', '<i>q</i> = (cos(<i>θ</i>/2), <i>n</i> sin(<i>θ</i>/2)). <i>q</i> et −<i>q</i> sont la même rotation. Interpolation douce (SLERP).']]
    ]),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['No set of <strong>three</strong> numbers can describe every orientation without a singularity (a mathematical fact about the rotation group). Four numbers (quaternion) or nine (matrix) can.', 'Aucun jeu de <strong>trois</strong> nombres ne peut décrire toutes les orientations sans singularité (un fait mathématique sur le groupe des rotations). Quatre nombres (quaternion) ou neuf (matrice) le peuvent.'],
        ['Controllers store orientations as quaternions or matrices and only convert to angles (ABC, RPY, WPR…) for the display and for the operator.', 'Les contrôleurs stockent les orientations en quaternions ou en matrices et ne convertissent en angles (ABC, RPY, WPR…) que pour l\'affichage et pour l\'opérateur.'],
        ['Never interpolate two orientations by interpolating their Euler angles.', 'N\'interpolez jamais deux orientations en interpolant leurs angles d\'Euler.']
      ]))
  ],
  terms: [['gimbal lock', 'blocage de cardan'], ['Cardan / Euler angles', 'angles de Cardan / d\'Euler'], ['quaternion', 'quaternion'], ['geometric Jacobian', 'jacobienne géométrique'], ['analytical Jacobian', 'jacobienne analytique'], ['SLERP', 'SLERP']],
  quiz: [
    ['For which value of the pitch β do the Cardan angles (rotations z, y, x) have a singularity?', 'Pour quelle valeur du tangage β les angles de Cardan (rotations z, y, x) ont-ils une singularité ?', 'β = ±90° (cos β = 0). Then only γ − α (or γ + α) is defined.', 'β = ±90° (cos β = 0). Alors seul γ − α (ou γ + α) est défini.'],
    ['Is gimbal lock a defect of the robot?', 'Le blocage de cardan est-il un défaut du robot ?', 'No. It is a defect of the three-angle description. The same tool orientation can be written with a quaternion without any problem.', 'Non. C\'est un défaut de la description par trois angles. La même orientation de l\'outil peut s\'écrire avec un quaternion sans aucun problème.'],
    ['Why can a drone or a camera “flip” when it looks straight up if its attitude is stored as Euler angles?', 'Pourquoi un drone ou une caméra peuvent-ils « basculer » quand ils regardent droit vers le haut si leur attitude est stockée en angles d\'Euler ?', 'Looking straight up is the pitch = 90° singularity: yaw and roll become the same rotation and the angles jump.', 'Regarder droit vers le haut est la singularité tangage = 90° : lacet et roulis deviennent la même rotation et les angles sautent.']
  ],
  link: ['learn-model.html#l2', 'Euler and Cardan angles in the Master-level course →', 'Angles d\'Euler et de Cardan dans le cours niveau Master →']
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Redundancy and the null space', 'Redondance et espace nul'],
  time: 12,
  goal: ['why robots with extra joints are good at avoiding singularities, and how to use the extra freedom.', 'pourquoi les robots avec des articulations en plus évitent bien les singularités, et comment utiliser cette liberté supplémentaire.'],
  body: [
    H4('7.1 More joints than needed', '7.1 Plus d\'articulations que nécessaire'),
    P('A robot is <strong>redundant</strong> when it has more joints (<i>n</i>) than the task needs (<i>m</i>). Examples: a planar arm with 3 joints positioning a point in the plane (<i>n</i> = 3, <i>m</i> = 2); a 7-axis arm (KUKA iiwa, Franka Panda) for a 6-DOF task; your own arm (7 joints from the shoulder to the wrist) holding a glass: you can move the elbow freely while the glass stays still.',
      'Un robot est <strong>redondant</strong> quand il a plus d\'articulations (<i>n</i>) que la tâche n\'en demande (<i>m</i>). Exemples : un bras plan à 3 articulations qui positionne un point dans le plan (<i>n</i> = 3, <i>m</i> = 2) ; un bras à 7 axes (KUKA iiwa, Franka Panda) pour une tâche à 6 DDL ; votre propre bras (7 articulations de l\'épaule au poignet) qui tient un verre : vous pouvez bouger le coude librement pendant que le verre reste immobile.'),
    P('The Jacobian is no longer square: it has <i>m</i> rows and <i>n</i> &gt; <i>m</i> columns. The system <i>ẋ</i> = <i>J</i> <i>q̇</i> has <strong>infinitely many solutions</strong>.',
      'La jacobienne n\'est plus carrée : elle a <i>m</i> lignes et <i>n</i> &gt; <i>m</i> colonnes. Le système <i>ẋ</i> = <i>J</i> <i>q̇</i> a une <strong>infinité de solutions</strong>.'),
    H4('7.2 The null space', '7.2 L\'espace nul'),
    BOX('word', ['New word', 'Mot nouveau'],
      P('<strong>Null space</strong> of <i>J</i>: all the joint velocities <i>q̇</i> such that <i>J</i> <i>q̇</i> = 0. They move the joints but not the tool. Also called <em>self-motion</em>: the elbow of a 7-axis arm turning around the line shoulder–wrist is the textbook example.',
        '<strong>Espace nul</strong> (noyau) de <i>J</i> : toutes les vitesses articulaires <i>q̇</i> telles que <i>J</i> <i>q̇</i> = 0. Elles déplacent les articulations mais pas l\'outil. On parle aussi d\'<em>auto-mouvement</em> : le coude d\'un bras à 7 axes qui tourne autour de la droite épaule–poignet est l\'exemple classique.')),
    BOX('example', ['Worked example: 3 joints, 2 tasks', 'Exemple résolu : 3 articulations, 2 tâches'],
      P('Suppose that at some pose the Jacobian is:', 'Supposons qu\'à une certaine pose la jacobienne soit :'),
      EQ(`<i>J</i> = ${MX(3, ['1', '0', '1', '0', '1', '1'])}`),
      P('The vector (1, 1, −1) is in the null space: <i>J</i>·(1, 1, −1) = (1 + 0 − 1 ; 0 + 1 − 1) = (0 ; 0). To obtain the tool velocity <i>ẋ</i> = (1 ; 0), the pseudo-inverse <i>J</i><sup>+</sup> = <i>J</i><sup>T</sup>(<i>J</i> <i>J</i><sup>T</sup>)<sup>−1</sup> gives <i>q̇</i> = (2/3 ; −1/3 ; 1/3): check <i>J</i> <i>q̇</i> = (2/3 + 1/3 ; −1/3 + 1/3) = (1 ; 0). It is the solution with the <strong>smallest norm</strong>. All the other solutions are <i>q̇</i> = (2/3 ; −1/3 ; 1/3) + <i>k</i>·(1 ; 1 ; −1), for any number <i>k</i>.',
        'Le vecteur (1, 1, −1) est dans l\'espace nul : <i>J</i>·(1, 1, −1) = (1 + 0 − 1 ; 0 + 1 − 1) = (0 ; 0). Pour obtenir la vitesse d\'outil <i>ẋ</i> = (1 ; 0), la pseudo-inverse <i>J</i><sup>+</sup> = <i>J</i><sup>T</sup>(<i>J</i> <i>J</i><sup>T</sup>)<sup>−1</sup> donne <i>q̇</i> = (2/3 ; −1/3 ; 1/3) : vérification <i>J</i> <i>q̇</i> = (2/3 + 1/3 ; −1/3 + 1/3) = (1 ; 0). C\'est la solution de <strong>plus petite norme</strong>. Toutes les autres solutions sont <i>q̇</i> = (2/3 ; −1/3 ; 1/3) + <i>k</i>·(1 ; 1 ; −1), pour tout nombre <i>k</i>.')),
    H4('7.3 Using the freedom', '7.3 Utiliser la liberté'),
    EQ('<i>q̇</i> = <i>J</i><sup>+</sup> <i>ẋ</i> + (<i>I</i> − <i>J</i><sup>+</sup><i>J</i>) <i>z</i>'),
    P('The first term does the main task (the tool). The matrix (<i>I</i> − <i>J</i><sup>+</sup><i>J</i>) projects any vector <i>z</i> into the null space, so the second term can only move the joints, never the tool. Choose <i>z</i> to optimise a <strong>secondary criterion</strong>:',
      'Le premier terme fait la tâche principale (l\'outil). La matrice (<i>I</i> − <i>J</i><sup>+</sup><i>J</i>) projette tout vecteur <i>z</i> dans l\'espace nul, donc le second terme ne peut déplacer que les articulations, jamais l\'outil. Choisissez <i>z</i> pour optimiser un <strong>critère secondaire</strong> :'),
    UL([
      ['move away from the <strong>singularities</strong> (increase the manipulability <i>w</i>: <i>z</i> = <i>k</i>·∇<i>w</i>);', 's\'éloigner des <strong>singularités</strong> (augmenter la manipulabilité <i>w</i> : <i>z</i> = <i>k</i>·∇<i>w</i>) ;'],
      ['stay away from the <strong>joint limits</strong> (keep each joint near the middle of its range);', 'rester loin des <strong>butées articulaires</strong> (garder chaque articulation près du milieu de sa plage) ;'],
      ['avoid <strong>obstacles</strong> with the elbow while the hand keeps working;', 'éviter des <strong>obstacles</strong> avec le coude pendant que la main continue de travailler ;'],
      ['minimise <strong>energy</strong>, or share the load between joints.', 'minimiser l\'<strong>énergie</strong>, ou répartir la charge entre les articulations.']
    ]),
    H4('7.4 Redundancy and singularities', '7.4 Redondance et singularités'),
    P('A redundant robot is singular when rank <i>J</i> &lt; <i>m</i>, that is det(<i>J</i> <i>J</i><sup>T</sup>) = 0. This is a rarer event: the robot has many ways to reach the same tool pose, and if one of them is singular it can <strong>change the arm shape through the null space</strong> without disturbing the tool. A 7-axis arm can rotate its elbow to escape a shoulder or an elbow singularity. Only the singularities that lose a tool direction whatever the arm shape (typically a fully stretched arm) cannot be fixed.',
      'Un robot redondant est singulier quand rang <i>J</i> &lt; <i>m</i>, c\'est-à-dire det(<i>J</i> <i>J</i><sup>T</sup>) = 0. C\'est un événement plus rare : le robot a de nombreuses façons d\'atteindre la même pose d\'outil, et si l\'une est singulière il peut <strong>changer la forme du bras par l\'espace nul</strong> sans gêner l\'outil. Un bras à 7 axes peut tourner son coude pour échapper à une singularité d\'épaule ou de coude. Seules les singularités qui perdent une direction d\'outil quelle que soit la forme du bras (typiquement un bras complètement tendu) ne se corrigent pas.'),
    TABLE([['Advantages', 'Avantages'], ['Drawbacks', 'Inconvénients']], [
      [['Escapes singularities, avoids obstacles and joint limits', 'Échappe aux singularités, évite les obstacles et les butées'], ['One more joint: more cost, mass and cabling', 'Une articulation de plus : plus de coût, de masse et de câblage']],
      [['Tolerates a locked or failed joint (fault tolerance)', 'Tolère une articulation bloquée ou en panne (tolérance aux pannes)'], ['Inverse kinematics needs an optimisation (no simple closed form)', 'La cinématique inverse demande une optimisation (pas de formule fermée simple)']],
      [['Natural for human-like tasks (hand guiding, dual-arm)', 'Naturel pour les tâches « humaines » (guidage manuel, double bras)'], ['The extra motion must be controlled (the elbow can drift)', 'Le mouvement en plus doit être commandé (le coude peut dériver)']]
    ]),
    BOX('keep', ['Task redundancy', 'Redondance de tâche'],
      P('A robot can also be redundant for <em>one task</em> without having extra joints. A welding torch or a drill is symmetric about its own axis, so its rotation about that axis does not matter: the task has only 5 DOF and a 6-axis robot has one free degree. That free degree is precisely how programmers move the tool away from a wrist singularity.',
        'Un robot peut aussi être redondant pour <em>une tâche</em> sans avoir d\'articulation en plus. Une torche de soudage ou un foret sont symétriques autour de leur axe, donc leur rotation autour de cet axe n\'a pas d\'importance : la tâche n\'a que 5 DDL et un robot 6 axes a un degré libre. Ce degré libre est précisément ce qui permet aux programmeurs d\'éloigner l\'outil d\'une singularité de poignet.'))
  ],
  terms: [['redundant robot', 'robot redondant'], ['null space', 'espace nul'], ['self-motion', 'auto-mouvement'], ['pseudo-inverse', 'pseudo-inverse'], ['secondary task', 'tâche secondaire'], ['task redundancy', 'redondance de tâche']],
  quiz: [
    ['How many redundant degrees of freedom does a 7-axis arm have for a task that fixes the position and orientation of the tool?', 'Combien de degrés de liberté redondants a un bras à 7 axes pour une tâche qui fixe la position et l\'orientation de l\'outil ?', 'One: 7 − 6 = 1. It is the rotation of the elbow around the line shoulder–wrist.', 'Un : 7 − 6 = 1. C\'est la rotation du coude autour de la droite épaule–poignet.'],
    ['A Jacobian has 2 rows, 3 columns and rank 2. What is the dimension of its null space?', 'Une jacobienne a 2 lignes, 3 colonnes et un rang 2. Quelle est la dimension de son espace nul ?', '3 − 2 = 1: there is a one-dimensional family of self-motions.', '3 − 2 = 1 : il existe une famille à une dimension d\'auto-mouvements.'],
    ['Why is a welding torch (rotation about its axis is free) helpful to avoid a wrist singularity?', 'Pourquoi une torche de soudage (rotation libre autour de son axe) aide-t-elle à éviter une singularité de poignet ?', 'Because the programmer can choose the rotation about the torch axis, and with it choose a wrist posture whose q5 is far from 0.', 'Parce que le programmeur peut choisir la rotation autour de l\'axe de la torche, et donc une posture de poignet dont q5 est loin de 0.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['Living with singularities: detect, avoid, tame', 'Vivre avec les singularités : détecter, éviter, apprivoiser'],
  time: 14,
  goal: ['the toolbox of professionals, from the design of the cell to the damped inverse, and the singularities of parallel robots.', 'la boîte à outils des professionnels, de la conception de la cellule à l\'inverse amortie, et les singularités des robots parallèles.'],
  body: [
    P('You cannot remove singularities of a given robot, but you can <strong>detect</strong> them, <strong>avoid</strong> them, or <strong>tame</strong> them. Professionals use all three, in this order.',
      'On ne peut pas supprimer les singularités d\'un robot donné, mais on peut les <strong>détecter</strong>, les <strong>éviter</strong> ou les <strong>apprivoiser</strong>. Les professionnels utilisent les trois, dans cet ordre.'),
    H4('8.1 Detect', '8.1 Détecter'),
    P('Compute at each control step a distance measure (lesson 4): the manipulability <i>w</i>, the smallest singular value <i>σ</i><sub>min</sub>, or simply the key joint angles (<i>q</i><sub>5</sub> for a wrist, <i>q</i><sub>3</sub> for an elbow). Set a threshold, for example “warn when <i>w</i> falls under 10 % of its maximum” and “slow down under 3 %”. Simulation tools draw this as a colour map of the workspace: green far from singularities, red close.',
      'Calculez à chaque pas de commande une mesure de distance (leçon 4) : la manipulabilité <i>w</i>, la plus petite valeur singulière <i>σ</i><sub>min</sub>, ou simplement les angles clés (<i>q</i><sub>5</sub> pour un poignet, <i>q</i><sub>3</sub> pour un coude). Fixez un seuil, par exemple « avertir quand <i>w</i> tombe sous 10 % de son maximum » et « ralentir sous 3 % ». Les outils de simulation dessinent cela comme une carte de couleurs de l\'espace de travail : vert loin des singularités, rouge près.'),
    H4('8.2 Avoid: by design and by programming', '8.2 Éviter : par la conception et par la programmation'),
    TABLE([['When', 'Quand'], ['What to do', 'Que faire']], [
      [['Designing the cell', 'Concevoir la cellule'], ['Place the robot and the workpiece so that the work zone is in the well-conditioned middle of the workspace: not at full reach, not above the base, not with the tool in line with the forearm. Simulate the paths before building.', 'Placer le robot et la pièce pour que la zone de travail soit au milieu bien conditionné de l\'espace de travail : pas à pleine portée, pas au-dessus de la base, pas avec l\'outil dans l\'axe de l\'avant-bras. Simuler les chemins avant de construire.']],
      [['Choosing tool and mount', 'Choisir l\'outil et la fixation'], ['Tilt the tool by 10-20° with respect to the forearm axis so that <i>q</i><sub>5</sub> never reaches 0. For a symmetric tool (torch, drill) this costs nothing.', 'Incliner l\'outil de 10-20° par rapport à l\'axe de l\'avant-bras pour que <i>q</i><sub>5</sub> n\'atteigne jamais 0. Pour un outil symétrique (torche, foret) cela ne coûte rien.']],
      [['Choosing the robot', 'Choisir le robot'], ['Pick a 7-axis robot if the task cannot avoid the problem; or a robot whose workspace singularities fall outside the useful volume.', 'Prendre un robot à 7 axes si la tâche ne peut pas éviter le problème ; ou un robot dont les singularités tombent hors du volume utile.']],
      [['Programming', 'Programmer'], ['Cross the dangerous zone with a <strong>joint move</strong> (MoveJ, PTP): no inversion, so no explosion. Use via points to change the arm configuration before a long linear move. Split a path that crosses a singularity in two.', 'Traverser la zone dangereuse avec un <strong>mouvement articulaire</strong> (MoveJ, PTP) : pas d\'inversion, donc pas d\'explosion. Utiliser des points de passage pour changer la configuration du bras avant un long déplacement linéaire. Couper en deux un chemin qui traverse une singularité.']],
      [['Controller options', 'Options du contrôleur'], ['Many controllers can accept a small deviation of the tool orientation to pass a wrist singularity (for example ABB <code>SingArea \\Wrist</code>, FANUC wrist-joint motion option). The tool position stays on the path.', 'Beaucoup de contrôleurs acceptent un petit écart d\'orientation de l\'outil pour passer une singularité de poignet (par exemple <code>SingArea \\Wrist</code> chez ABB, l\'option de mouvement articulaire de poignet chez FANUC). La position de l\'outil reste sur le chemin.']]
    ]),
    H4('8.3 Tame: the damped inverse', '8.3 Apprivoiser : l\'inverse amortie'),
    P('If the robot must go through a poorly conditioned zone, replace the exact inverse by the <strong>damped least squares</strong> (Wampler, Nakamura and Hanafusa):',
      'Si le robot doit traverser une zone mal conditionnée, remplacez l\'inverse exacte par les <strong>moindres carrés amortis</strong> (Wampler, Nakamura et Hanafusa) :'),
    EQ('<i>q̇</i> = <i>J</i><sup>T</sup> (<i>J</i> <i>J</i><sup>T</sup> + <i>λ</i><sup>2</sup> <i>I</i>)<sup>−1</sup> <i>ẋ</i>'),
    P('It solves a compromise: <em>make the tool error small</em> <strong>and</strong> <em>keep the joint speeds small</em>, with <i>λ</i> setting the balance. Far from a singularity (<i>σ</i> ≫ <i>λ</i>) it gives the same answer as the exact inverse. Near it the joint speeds stay finite, at the price of a small tool error in the lost direction: the robot slows down instead of racing. A common refinement raises <i>λ</i> only when needed: <i>λ</i><sup>2</sup> = <i>λ</i><sub>0</sub><sup>2</sup>(1 − (<i>w</i>/<i>w</i><sub>0</sub>)<sup>2</sup>) for <i>w</i> &lt; <i>w</i><sub>0</sub>, and 0 otherwise.',
      'Elle résout un compromis : <em>garder petite l\'erreur d\'outil</em> <strong>et</strong> <em>garder petites les vitesses articulaires</em>, <i>λ</i> réglant l\'équilibre. Loin d\'une singularité (<i>σ</i> ≫ <i>λ</i>) elle donne la même réponse que l\'inverse exacte. Près d\'elle les vitesses articulaires restent finies, au prix d\'une petite erreur d\'outil dans la direction perdue : le robot ralentit au lieu de s\'emballer. Un raffinement courant n\'augmente <i>λ</i> que si nécessaire : <i>λ</i><sup>2</sup> = <i>λ</i><sub>0</sub><sup>2</sup>(1 − (<i>w</i>/<i>w</i><sub>0</sub>)<sup>2</sup>) pour <i>w</i> &lt; <i>w</i><sub>0</sub>, et 0 sinon.'),
    WIDGET('dls'),
    P('Two other taming tools: <strong>speed scaling</strong> (slow the whole path down so that no joint exceeds its limit; the path is kept, only the time changes) and <strong>task prioritisation</strong> (the position keeps the priority, the orientation is allowed to drift a little).',
      'Deux autres outils pour apprivoiser : le <strong>réglage de la vitesse</strong> (ralentir tout le chemin pour qu\'aucune articulation ne dépasse sa limite ; le chemin est gardé, seul le temps change) et la <strong>hiérarchie des tâches</strong> (la position garde la priorité, l\'orientation peut un peu dériver).'),
    H4('8.4 Parallel robots: three kinds of singularity', '8.4 Robots parallèles : trois sortes de singularités'),
    P('For a parallel robot (Delta, Stewart platform) the velocity relation is written <i>A</i> <i>ẋ</i> = <i>B</i> <i>q̇</i>, with <i>x</i> the platform and <i>q</i> the motors. Gosselin and Angeles named three cases:',
      'Pour un robot parallèle (Delta, plateforme de Stewart) la relation de vitesse s\'écrit <i>A</i> <i>ẋ</i> = <i>B</i> <i>q̇</i>, avec <i>x</i> la plateforme et <i>q</i> les moteurs. Gosselin et Angeles ont nommé trois cas :'),
    TABLE([['Type', 'Type'], ['Condition', 'Condition'], ['Consequence', 'Conséquence'], ['Where?', 'Où ?']], [
      [['<strong>Inverse kinematic</strong> (type 1)', '<strong>Cinématique inverse</strong> (type 1)'], 'det B = 0', ['The motors can no longer move the platform in some direction (like a stretched serial arm).', 'Les moteurs ne peuvent plus déplacer la plateforme dans une direction (comme un bras série tendu).'], ['Edge of the workspace.', 'Bord de l\'espace de travail.']],
      [['<strong>Direct kinematic</strong> (type 2)', '<strong>Cinématique directe</strong> (type 2)'], 'det A = 0', ['The platform can move <strong>with all motors locked</strong>: it gains an uncontrolled freedom and loses stiffness. Dangerous.', 'La plateforme peut bouger <strong>alors que tous les moteurs sont bloqués</strong> : elle gagne une liberté non contrôlée et perd en rigidité. Dangereux.'], ['Inside the workspace.', 'À l\'intérieur de l\'espace de travail.']],
      [['<strong>Combined</strong> (type 3)', '<strong>Combinée</strong> (type 3)'], 'det A = det B = 0', ['Both at once: only in special architectures.', 'Les deux à la fois : seulement dans des architectures particulières.'], ['Special geometries.', 'Géométries particulières.']]
    ]),
    P('This is a mirror of the serial case: for a serial robot the singular pose loses a tool direction (type 1); a parallel robot has this problem <em>and</em> the opposite one. That is why a parallel robot is always designed together with a map of its singularity-free workspace, and why the useful volume of a Delta robot is a small dome compared with the size of its frame.',
      'C\'est un miroir du cas série : pour un robot série, la pose singulière perd une direction d\'outil (type 1) ; un robot parallèle a ce problème <em>et</em> le problème inverse. C\'est pourquoi un robot parallèle est toujours conçu avec une carte de son espace de travail sans singularités, et pourquoi le volume utile d\'un robot Delta est un petit dôme par rapport à la taille de son bâti.'),
    H4('8.5 The cheat sheet', '8.5 L\'aide-mémoire'),
    TABLE([['Symptom', 'Symptôme'], ['Probable cause', 'Cause probable'], ['First fix', 'Premier remède']], [
      [['Joint speed alarm in a straight line', 'Alarme de vitesse articulaire sur une ligne droite'], ['Arm almost stretched or tool over the base', 'Bras presque tendu ou outil au-dessus de la base'], ['Move the work zone closer; add a via point', 'Rapprocher la zone de travail ; ajouter un point de passage']],
      [['Axes 4 and 6 spin opposite', 'Axes 4 et 6 en sens opposés'], ['Wrist singularity (q5 ≈ 0)', 'Singularité de poignet (q5 ≈ 0)'], ['Tilt the tool; use the wrist option of the controller', 'Incliner l\'outil ; utiliser l\'option poignet du contrôleur']],
      [['Orientation angles jump', 'Les angles d\'orientation sautent'], ['Gimbal lock of the representation', 'Blocage de cardan de la représentation'], ['Use quaternions / matrices inside', 'Utiliser quaternions / matrices en interne']],
      [['Platform wobbles with motors locked', 'La plateforme oscille moteurs bloqués'], ['Direct singularity of a parallel robot', 'Singularité directe d\'un robot parallèle'], ['Stay inside the singularity-free workspace', 'Rester dans l\'espace de travail sans singularités']],
      [['Elbow-shaped solutions flip', 'Les solutions « coude » basculent'], ['Crossing the boundary between two aspects', 'Franchissement de la frontière entre deux aspects'], ['Choose the aspect before the move; do not cross', 'Choisir l\'aspect avant le mouvement ; ne pas traverser']]
    ])
  ],
  terms: [['damped least squares', 'moindres carrés amortis'], ['speed scaling', 'réglage de la vitesse'], ['MoveJ / MoveL', 'MoveJ / MoveL'], ['direct kinematic singularity', 'singularité cinématique directe'], ['inverse kinematic singularity', 'singularité cinématique inverse'], ['singularity-free workspace', 'espace de travail sans singularités']],
  quiz: [
    ['Which kind of move can cross a singularity without trouble: a joint move (MoveJ) or a linear move (MoveL)?', 'Quel type de mouvement peut traverser une singularité sans problème : articulaire (MoveJ) ou linéaire (MoveL) ?', 'The joint move: it interpolates the joint values and never inverts the Jacobian.', 'Le mouvement articulaire : il interpole les valeurs des articulations et n\'inverse jamais la jacobienne.'],
    ['What does a larger λ do in the damped inverse?', 'Que fait un λ plus grand dans l\'inverse amortie ?', 'It reduces the joint speeds (safer) but increases the tool error in the poorly conditioned direction.', 'Il réduit les vitesses articulaires (plus sûr) mais augmente l\'erreur d\'outil dans la direction mal conditionnée.'],
    ['The platform of a Stewart robot moves although all six actuators are locked. Which singularity is it?', 'La plateforme d\'un robot de Stewart bouge alors que les six actionneurs sont bloqués. De quelle singularité s\'agit-il ?', 'A direct kinematic singularity (type 2, det A = 0). It is inside the workspace and loses stiffness.', 'Une singularité cinématique directe (type 2, det A = 0). Elle est à l\'intérieur de l\'espace de travail et fait perdre de la rigidité.']
  ],
  link: ['delta.html', 'Singularities and workspace of the Delta robot →', 'Singularités et espace de travail du robot Delta →']
})
  ];
}
