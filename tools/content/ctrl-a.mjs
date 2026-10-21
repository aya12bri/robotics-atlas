import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'ctrl-';
const M2 = (a, b, c, d) => MX(2, [a, b, c, d]);

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Dynamics: forces, torques and the equation of a robot', 'Dynamique : forces, couples et équation d\'un robot'],
  time: 14,
  goal: ['why a robot needs torque to hold still and to accelerate, and how this is written in one equation.', 'pourquoi un robot a besoin de couple pour rester immobile et pour accélérer, et comment cela s\'écrit en une équation.'],
  body: [
    H4('1.1 Kinematics is not enough', '1.1 La cinématique ne suffit pas'),
    P('Kinematics ignores mass: it says “joint 2 must be at 40° at time 0.5 s”. But a motor does not produce an angle, it produces a <strong>torque</strong>. To know which torque is needed we need <strong>dynamics</strong>: the relation between torques and motions. Without it, a robot cannot be sized (which motor?), simulated, or controlled well at high speed.',
      'La cinématique ignore la masse : elle dit « l\'articulation 2 doit être à 40° à l\'instant 0,5 s ». Mais un moteur ne produit pas un angle, il produit un <strong>couple</strong>. Pour savoir quel couple il faut, on a besoin de la <strong>dynamique</strong> : la relation entre couples et mouvements. Sans elle, on ne peut ni dimensionner un robot (quel moteur ?), ni le simuler, ni bien le commander à grande vitesse.'),
    H4('1.2 One link, by hand', '1.2 Un seul corps, à la main'),
    P('A link of mass <i>m</i> whose centre of mass is at distance <i>l</i> from the joint, turning in a vertical plane (<i>θ</i> is measured from the horizontal). Newton for rotation: the torque of the motor, minus the torque of gravity, minus friction, equals inertia times angular acceleration.',
      'Un corps de masse <i>m</i> dont le centre de masse est à la distance <i>l</i> de l\'articulation, tournant dans un plan vertical (<i>θ</i> est mesuré depuis l\'horizontale). Newton en rotation : le couple du moteur, moins le couple de la gravité, moins le frottement, égale l\'inertie fois l\'accélération angulaire.'),
    EQ('<i>τ</i> = <i>I</i> <i>θ̈</i> + <i>b</i> <i>θ̇</i> + <i>m</i> <i>g</i> <i>l</i> cos <i>θ</i>'),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('A 2 kg point mass at the end of a weightless 0.5 m arm: <i>I</i> = <i>m</i>·<i>l</i>² = 2 × 0.25 = 0.5 kg·m². To <strong>hold</strong> it horizontally: <i>τ</i> = <i>m</i> <i>g</i> <i>l</i> = 2 × 9.81 × 0.5 = 9.81 N·m, with no motion at all. To also accelerate it at 10 rad/s²: add <i>I</i> <i>θ̈</i> = 0.5 × 10 = 5 N·m, so 14.8 N·m. Hold it vertical (<i>θ</i> = 90°): gravity needs 0.',
        'Une masse ponctuelle de 2 kg au bout d\'un bras sans masse de 0,5 m : <i>I</i> = <i>m</i>·<i>l</i>² = 2 × 0,25 = 0,5 kg·m². Pour la <strong>tenir</strong> à l\'horizontale : <i>τ</i> = <i>m</i> <i>g</i> <i>l</i> = 2 × 9,81 × 0,5 = 9,81 N·m, sans aucun mouvement. Pour l\'accélérer en plus à 10 rad/s² : ajouter <i>I</i> <i>θ̈</i> = 0,5 × 10 = 5 N·m, soit 14,8 N·m. La tenir à la verticale (<i>θ</i> = 90°) : la gravité demande 0.')),
    WIDGET('gravity'),
    H4('1.3 The equation of a robot', '1.3 L\'équation d\'un robot'),
    P('For a robot with <i>n</i> joints the same idea gives the <strong>dynamic model</strong>, found with the Lagrange method (energies) or the Newton–Euler method (forces, link by link):',
      'Pour un robot à <i>n</i> articulations la même idée donne le <strong>modèle dynamique</strong>, obtenu par la méthode de Lagrange (énergies) ou de Newton–Euler (forces, corps par corps) :'),
    EQ('<i>M</i>(<i>q</i>) <i>q̈</i> + <i>C</i>(<i>q</i>, <i>q̇</i>) <i>q̇</i> + <i>g</i>(<i>q</i>) + <i>f</i>(<i>q̇</i>) = <i>τ</i>'),
    TABLE([['Term', 'Terme'], ['Name', 'Nom'], ['Meaning', 'Sens']], [
      ['M(q) q̈', ['Inertia', 'Inertie'], ['Torque to accelerate. M depends on the pose: an arm stretched out is much harder to turn than a folded one.', 'Couple pour accélérer. M dépend de la pose : un bras tendu est bien plus dur à tourner qu\'un bras replié.']],
      ['C(q, q̇) q̇', ['Coriolis and centrifugal', 'Coriolis et centrifuge'], ['Torques caused by the velocities of the <em>other</em> joints. Small at low speed, large when fast.', 'Couples causés par les vitesses des <em>autres</em> articulations. Petits à basse vitesse, grands quand ça va vite.']],
      ['g(q)', ['Gravity', 'Gravité'], ['Torque to hold the robot still. Depends only on the pose and the payload.', 'Couple pour tenir le robot immobile. Dépend seulement de la pose et de la charge.']],
      ['f(q̇)', ['Friction', 'Frottement'], ['Viscous (proportional to speed), Coulomb (constant, opposite to the motion) and the Stribeck bump at very low speed.', 'Visqueux (proportionnel à la vitesse), de Coulomb (constant, opposé au mouvement) et la bosse de Stribeck à très basse vitesse.']]
    ]),
    BOX('example', ['The two-joint arm (point masses at the ends of the links)', 'Le bras à deux articulations (masses ponctuelles au bout des corps)'],
      EQ('<i>M</i><sub>11</sub> = (<i>m</i><sub>1</sub>+<i>m</i><sub>2</sub>)<i>L</i><sub>1</sub>² + <i>m</i><sub>2</sub><i>L</i><sub>2</sub>² + 2<i>m</i><sub>2</sub><i>L</i><sub>1</sub><i>L</i><sub>2</sub> cos <i>θ</i><sub>2</sub>,    <i>M</i><sub>12</sub> = <i>m</i><sub>2</sub><i>L</i><sub>2</sub>² + <i>m</i><sub>2</sub><i>L</i><sub>1</sub><i>L</i><sub>2</sub> cos <i>θ</i><sub>2</sub>,    <i>M</i><sub>22</sub> = <i>m</i><sub>2</sub><i>L</i><sub>2</sub>²'),
      EQ('<i>g</i><sub>1</sub> = (<i>m</i><sub>1</sub>+<i>m</i><sub>2</sub>) <i>g</i> <i>L</i><sub>1</sub> cos <i>θ</i><sub>1</sub> + <i>m</i><sub>2</sub> <i>g</i> <i>L</i><sub>2</sub> cos(<i>θ</i><sub>1</sub>+<i>θ</i><sub>2</sub>),    <i>g</i><sub>2</sub> = <i>m</i><sub>2</sub> <i>g</i> <i>L</i><sub>2</sub> cos(<i>θ</i><sub>1</sub>+<i>θ</i><sub>2</sub>)'),
      P('With <i>h</i> = <i>m</i><sub>2</sub><i>L</i><sub>1</sub><i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>, the Coriolis and centrifugal terms are −<i>h</i>(2<i>θ̇</i><sub>1</sub><i>θ̇</i><sub>2</sub> + <i>θ̇</i><sub>2</sub>²) on joint 1 and +<i>h</i> <i>θ̇</i><sub>1</sub>² on joint 2. Note the coupling: moving joint 2 produces a torque on joint 1.',
        'Avec <i>h</i> = <i>m</i><sub>2</sub><i>L</i><sub>1</sub><i>L</i><sub>2</sub> sin <i>θ</i><sub>2</sub>, les termes de Coriolis et centrifuge valent −<i>h</i>(2<i>θ̇</i><sub>1</sub><i>θ̇</i><sub>2</sub> + <i>θ̇</i><sub>2</sub>²) sur l\'articulation 1 et +<i>h</i> <i>θ̇</i><sub>1</sub>² sur l\'articulation 2. Notez le couplage : bouger l\'articulation 2 produit un couple sur l\'articulation 1.')),
    H4('1.4 Using the model', '1.4 À quoi sert le modèle'),
    UL([
      ['<strong>Sizing</strong>: find the peak and RMS torques of a task and choose motors and gearboxes (lesson 2).', '<strong>Dimensionnement</strong> : trouver les couples de pointe et efficace d\'une tâche et choisir moteurs et réducteurs (leçon 2).'],
      ['<strong>Simulation</strong>: integrate the equation to test a controller before touching the robot.', '<strong>Simulation</strong> : intégrer l\'équation pour tester une commande avant de toucher au robot.'],
      ['<strong>Control</strong>: compute feedforward torques (lesson 5).', '<strong>Commande</strong> : calculer des couples d\'anticipation (leçon 5).'],
      ['<strong>Identification</strong>: the masses, centres of mass and friction are rarely known exactly; they are measured by running test motions and fitting the equation (it is linear in the inertial parameters).', '<strong>Identification</strong> : les masses, centres de masse et frottements sont rarement connus exactement ; on les mesure en faisant des mouvements d\'essai et en ajustant l\'équation (elle est linéaire en les paramètres d\'inertie).'],
      ['<strong>Payload check</strong>: a heavier tool changes <i>M</i> and <i>g</i>; the controller must be told the payload data.', '<strong>Vérification de charge</strong> : un outil plus lourd change <i>M</i> et <i>g</i> ; le contrôleur doit connaître les données de charge.']
    ])
  ],
  terms: [['dynamics', 'dynamique'], ['torque', 'couple'], ['inertia', 'inertie'], ['Lagrange / Newton–Euler', 'Lagrange / Newton–Euler'], ['Coriolis', 'Coriolis'], ['gravity compensation', 'compensation de gravité'], ['friction', 'frottement'], ['payload', 'charge utile']],
  quiz: [
    ['A 4 kg point mass is at the end of a weightless 0.3 m arm, horizontal. What torque holds it?', 'Une masse ponctuelle de 4 kg est au bout d\'un bras sans masse de 0,3 m, à l\'horizontale. Quel couple la tient ?', 'τ = m g l = 4 × 9.81 × 0.3 ≈ 11.8 N·m.', 'τ = m g l = 4 × 9,81 × 0,3 ≈ 11,8 N·m.'],
    ['Why is a stretched arm harder to accelerate than a folded one?', 'Pourquoi un bras tendu est-il plus dur à accélérer qu\'un bras replié ?', 'The inertia grows with the square of the distance of the masses to the joint (I = m l²), so M(q) is largest when stretched.', 'L\'inertie croît avec le carré de la distance des masses à l\'articulation (I = m l²), donc M(q) est maximale quand le bras est tendu.'],
    ['What is the difference between the gravity term and the Coriolis term?', 'Quelle est la différence entre le terme de gravité et le terme de Coriolis ?', 'Gravity exists at rest and depends only on the pose. Coriolis exists only when joints move (velocity products).', 'La gravité existe à l\'arrêt et ne dépend que de la pose. Coriolis n\'existe que quand les articulations bougent (produits de vitesses).']
  ],
  link: ['learn-model.html#l10', 'Dynamics in the Master-level course →', 'La dynamique dans le cours niveau Master →']
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Actuators: motors, gearboxes and how to size them', 'Actionneurs : moteurs, réducteurs et dimensionnement'],
  time: 14,
  goal: ['the main kinds of actuators, why a gearbox is almost always needed, and how to choose a motor for a joint.', 'les principaux types d\'actionneurs, pourquoi un réducteur est presque toujours nécessaire, et comment choisir un moteur pour une articulation.'],
  body: [
    H4('2.1 The kinds of actuators', '2.1 Les types d\'actionneurs'),
    TABLE([['Actuator', 'Actionneur'], ['Strengths', 'Atouts'], ['Weaknesses', 'Faiblesses'], ['Typical use', 'Usage typique']], [
      [['<strong>Brushless motor</strong> (BLDC / PMSM)', '<strong>Moteur sans balais</strong> (BLDC / PMSM)'], ['High torque density, efficient, long life, precise with an encoder.', 'Forte densité de couple, rendement élevé, longue durée de vie, précis avec un codeur.'], ['Needs an electronic drive (commutation).', 'Demande un variateur électronique (commutation).'], ['Almost every modern robot joint.', 'Presque toutes les articulations de robots modernes.']],
      [['Brushed DC motor', 'Moteur à courant continu à balais'], ['Simple, cheap, easy to drive.', 'Simple, bon marché, facile à piloter.'], ['Brushes wear out, noise, lower power density.', 'Balais qui s\'usent, bruit, densité de puissance plus faible.'], ['Toys, small educational robots.', 'Jouets, petits robots pédagogiques.']],
      [['Stepper motor', 'Moteur pas à pas'], ['Position without a sensor (open loop), cheap, holds position.', 'Position sans capteur (boucle ouverte), bon marché, tient la position.'], ['Loses steps if overloaded, vibrates, low speed torque only, heats.', 'Perd des pas en cas de surcharge, vibre, couple seulement à basse vitesse, chauffe.'], ['3D printers, gantries, small arms.', 'Imprimantes 3D, robots cartésiens, petits bras.']],
      [['Hobby servo', 'Servomoteur de loisir'], ['Motor + gearbox + sensor + electronics in one box.', 'Moteur + réducteur + capteur + électronique dans un boîtier.'], ['Low precision and speed control, plastic gears.', 'Faible précision et contrôle de vitesse, pignons plastiques.'], ['Education, RC models.', 'Éducation, modèles radiocommandés.']],
      [['Hydraulic cylinder', 'Vérin hydraulique'], ['Huge force, compact, robust.', 'Force énorme, compact, robuste.'], ['Pump, oil, leaks, noise, hard to control precisely.', 'Pompe, huile, fuites, bruit, difficile à commander précisément.'], ['Excavators, heavy legged robots, forging.', 'Pelles, robots à pattes lourds, forge.']],
      [['Pneumatic cylinder', 'Vérin pneumatique'], ['Cheap, fast, clean, naturally compliant.', 'Bon marché, rapide, propre, naturellement souple.'], ['Air is compressible: poor position control.', 'L\'air est compressible : mauvais contrôle de position.'], ['Grippers, pick and place between two stops.', 'Pinces, prise-dépose entre deux butées.']],
      [['Series elastic actuator (SEA)', 'Actionneur élastique série (SEA)'], ['A spring between motor and load measures and softens the torque.', 'Un ressort entre moteur et charge mesure et adoucit le couple.'], ['Lower bandwidth, extra mechanics.', 'Bande passante plus faible, mécanique supplémentaire.'], ['Cobots, exoskeletons, legged robots.', 'Cobots, exosquelettes, robots à pattes.']],
      [['Artificial muscles, shape-memory alloys, piezo', 'Muscles artificiels, alliages à mémoire de forme, piézo'], ['Light, silent, bio-inspired, or nanometre precise.', 'Légers, silencieux, bio-inspirés, ou précis au nanomètre.'], ['Low force or stroke, hysteresis, special drives.', 'Faible force ou course, hystérésis, commandes spéciales.'], ['Soft robots, micro-positioning.', 'Robots souples, micro-positionnement.']]
    ]),
    H4('2.2 Why a gearbox?', '2.2 Pourquoi un réducteur ?'),
    P('An electric motor is fast and weak (for example 3000 rpm and 0.1 N·m); a robot joint is slow and strong (for example 30 rpm and 10 N·m). A gearbox with ratio <i>N</i> turns one into the other:',
      'Un moteur électrique est rapide et faible (par exemple 3000 tr/min et 0,1 N·m) ; une articulation de robot est lente et forte (par exemple 30 tr/min et 10 N·m). Un réducteur de rapport <i>N</i> transforme l\'un en l\'autre :'),
    EQ('<i>τ</i><sub>joint</sub> = <i>N</i> · <i>η</i> · <i>τ</i><sub>motor</sub>,        <i>ω</i><sub>joint</sub> = <i>ω</i><sub>motor</sub> / <i>N</i>,        <i>J</i><sub>reflected</sub> = <i>N</i>² · <i>J</i><sub>motor</sub>'),
    P('The efficiency <i>η</i> (0.6 to 0.95) accounts for the losses. The last relation matters a lot: the motor inertia seen from the joint is multiplied by <i>N</i>². With a high ratio, the motor inertia dominates the arm inertia, and the joints are almost <strong>independent</strong> of each other (lesson 5), but the robot is hard to back-drive (to push by hand) and forces cannot be felt through the gearbox.',
      'Le rendement <i>η</i> (0,6 à 0,95) tient compte des pertes. La dernière relation est très importante : l\'inertie du moteur vue depuis l\'articulation est multipliée par <i>N</i>². Avec un fort rapport, l\'inertie du moteur domine celle du bras, et les articulations sont presque <strong>indépendantes</strong> les unes des autres (leçon 5), mais le robot est difficile à entraîner à la main (non réversible) et les efforts ne se sentent pas à travers le réducteur.'),
    TABLE([['Gearbox', 'Réducteur'], ['Ratio', 'Rapport'], ['Backlash', 'Jeu'], ['Notes', 'Remarques']], [
      [['Spur / planetary', 'Droit / planétaire'], '3 – 100', ['small to medium', 'faible à moyen'], ['Robust, cheap, back-drivable at low ratio.', 'Robuste, bon marché, réversible à faible rapport.']],
      [['Harmonic drive (strain wave)', 'Réducteur harmonique (onde de déformation)'], '50 – 160', ['almost zero', 'quasi nul'], ['Compact and precise; flexible, so it adds elasticity. Very common in robot wrists and cobots.', 'Compact et précis ; flexible, donc il ajoute de l\'élasticité. Très courant dans les poignets de robots et les cobots.']],
      [['Cycloidal / RV', 'Cycloïdal / RV'], '30 – 200', ['very small', 'très faible'], ['Stiff and shock-resistant: base and shoulder of industrial robots.', 'Rigide et résistant aux chocs : base et épaule des robots industriels.']],
      [['Belt, cable, tendon', 'Courroie, câble, tendon'], '2 – 10', ['small', 'faible'], ['Light, allows the motor to sit near the base. Elastic.', 'Léger, permet de placer le moteur près de la base. Élastique.']],
      [['Direct drive (no gearbox)', 'Entraînement direct (sans réducteur)'], '1', ['none', 'aucun'], ['Very accurate and back-drivable, but large and heavy motors for the torque.', 'Très précis et réversible, mais moteurs gros et lourds pour le couple.']]
    ]),
    BOX('example', ['Worked example: choose a motor for a joint', 'Exemple résolu : choisir un moteur pour une articulation'],
      P('A joint must give <strong>10 N·m</strong> (peak) at <strong>2 rad/s</strong> (19 rpm). Gearbox: <i>N</i> = 100, <i>η</i> = 0.8.',
        'Une articulation doit fournir <strong>10 N·m</strong> (pointe) à <strong>2 rad/s</strong> (19 tr/min). Réducteur : <i>N</i> = 100, <i>η</i> = 0,8.'),
      UL([
        ['Motor speed: 2 × 100 = 200 rad/s ≈ 1910 rpm.', 'Vitesse moteur : 2 × 100 = 200 rad/s ≈ 1910 tr/min.'],
        ['Motor torque: 10 / (100 × 0.8) = 0.125 N·m.', 'Couple moteur : 10 / (100 × 0,8) = 0,125 N·m.'],
        ['Mechanical power at the joint: 10 × 2 = 20 W; at the motor: 0.125 × 200 = 25 W.', 'Puissance mécanique à l\'articulation : 10 × 2 = 20 W ; au moteur : 0,125 × 200 = 25 W.'],
        ['Check: the motor must give 0.125 N·m <em>continuously</em> (RMS) and about 2 to 3 times that at peak, at 1910 rpm, without overheating. A 50 to 100 W BLDC motor with margin is fine. Also check that the reflected inertia 100² × <i>J</i><sub>motor</sub> is not more than a few times the load inertia.', 'Vérification : le moteur doit donner 0,125 N·m <em>en continu</em> (efficace) et environ 2 à 3 fois plus en pointe, à 1910 tr/min, sans surchauffer. Un moteur BLDC de 50 à 100 W avec marge convient. Vérifiez aussi que l\'inertie réfléchie 100² × <i>J</i><sub>moteur</sub> ne dépasse pas quelques fois l\'inertie de la charge.']
      ])),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['The torque that matters for heating is the <strong>RMS</strong> torque over the whole cycle, not the peak.', 'Le couple qui compte pour l\'échauffement est le couple <strong>efficace</strong> sur tout le cycle, pas la pointe.'],
        ['Torque is proportional to current: <i>τ</i><sub>motor</sub> = <i>K</i><sub>t</sub> · <i>I</i>. The drive controls the current.', 'Le couple est proportionnel au courant : <i>τ</i><sub>moteur</sub> = <i>K</i><sub>t</sub> · <i>I</i>. Le variateur commande le courant.'],
        ['Brakes: a robot arm falling when power is cut is dangerous, so most joints that carry gravity have a spring-applied brake.', 'Freins : un bras robot qui tombe quand le courant est coupé est dangereux, donc la plupart des articulations qui portent la gravité ont un frein à manque de courant.']
      ]))
  ],
  terms: [['brushless motor', 'moteur sans balais'], ['stepper', 'moteur pas à pas'], ['gear ratio', 'rapport de réduction'], ['harmonic drive', 'réducteur harmonique'], ['backlash', 'jeu'], ['reflected inertia', 'inertie réfléchie'], ['RMS torque', 'couple efficace'], ['brake', 'frein']],
  quiz: [
    ['A motor gives 0.2 N·m at 3000 rpm. With a 50:1 gearbox of efficiency 0.8, what do you get at the output?', 'Un moteur donne 0,2 N·m à 3000 tr/min. Avec un réducteur 50:1 de rendement 0,8, que obtient-on en sortie ?', 'Torque: 0.2 × 50 × 0.8 = 8 N·m. Speed: 3000 / 50 = 60 rpm.', 'Couple : 0,2 × 50 × 0,8 = 8 N·m. Vitesse : 3000 / 50 = 60 tr/min.'],
    ['A gearbox of ratio 100 is used and the motor inertia is 2·10⁻⁵ kg·m². What inertia does the joint feel?', 'Un réducteur de rapport 100 est utilisé et l\'inertie du moteur est 2·10⁻⁵ kg·m². Quelle inertie l\'articulation ressent-elle ?', 'N² × J = 10 000 × 2·10⁻⁵ = 0.2 kg·m².', 'N² × J = 10 000 × 2·10⁻⁵ = 0,2 kg·m².'],
    ['Why do most robot arms use harmonic or cycloidal gearboxes rather than ordinary gears?', 'Pourquoi la plupart des bras robots utilisent-ils des réducteurs harmoniques ou cycloïdaux plutôt que des engrenages ordinaires ?', 'They combine a high ratio, compactness and almost no backlash, which is needed for precise positioning.', 'Ils combinent un fort rapport, la compacité et un jeu quasi nul, nécessaire pour un positionnement précis.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Joint sensors: how the robot knows what it is doing', 'Capteurs articulaires : comment le robot sait ce qu\'il fait'],
  time: 12,
  goal: ['the sensors inside a robot (proprioception) and what resolution, accuracy and noise really mean.', 'les capteurs à l\'intérieur d\'un robot (proprioception) et ce que signifient vraiment résolution, exactitude et bruit.'],
  body: [
    P('Sensors that measure the robot itself are <strong>proprioceptive</strong> (like your sense of where your limbs are with your eyes closed). Those that measure the world are <strong>exteroceptive</strong> (cameras, lidar…; see the “Perception” course).',
      'Les capteurs qui mesurent le robot lui-même sont <strong>proprioceptifs</strong> (comme votre sens de la position des membres les yeux fermés). Ceux qui mesurent le monde sont <strong>extéroceptifs</strong> (caméras, lidar…, voir le cours « Perception »).'),
    TABLE([['Sensor', 'Capteur'], ['Measures', 'Mesure'], ['How it works', 'Principe'], ['Notes', 'Remarques']], [
      [['Incremental encoder', 'Codeur incrémental'], ['Angle changes', 'Variations d\'angle'], ['A disc with slits and a light sensor: counts pulses (two channels A and B give the direction).', 'Un disque à fentes et un capteur de lumière : compte des impulsions (deux voies A et B donnent le sens).'], ['Cheap. Forgets the position when switched off: needs a <strong>homing</strong> move.', 'Bon marché. Oublie la position à l\'arrêt : demande une <strong>prise d\'origine</strong>.']],
      [['Absolute encoder', 'Codeur absolu'], ['Angle', 'Angle'], ['Each position has a unique code (optical or magnetic), often multi-turn with a small battery or gears.', 'Chaque position a un code unique (optique ou magnétique), souvent multitour avec une petite pile ou des engrenages.'], ['Robot knows its pose at power-on. Standard in modern arms.', 'Le robot connaît sa pose à la mise sous tension. Standard dans les bras modernes.']],
      [['Resolver', 'Résolveur'], ['Angle', 'Angle'], ['A small rotating transformer, analogue.', 'Un petit transformateur tournant, analogique.'], ['Very robust to heat, shock and dirt.', 'Très robuste à la chaleur, aux chocs et à la saleté.']],
      [['Potentiometer / Hall sensor', 'Potentiomètre / capteur à effet Hall'], ['Angle (coarse)', 'Angle (grossier)'], ['Variable resistance or magnetic field.', 'Résistance variable ou champ magnétique.'], ['Cheap; used in hobby servos.', 'Bon marché ; utilisés dans les servomoteurs de loisir.']],
      [['Motor current sensor', 'Capteur de courant moteur'], ['Torque (estimated)', 'Couple (estimé)'], ['The torque is proportional to the current (<i>K</i><sub>t</sub>).', 'Le couple est proportionnel au courant (<i>K</i><sub>t</sub>).'], ['Free, but friction in the gearbox blurs the estimate. Used to detect collisions.', 'Gratuit, mais le frottement du réducteur brouille l\'estimation. Utilisé pour détecter les collisions.']],
      [['Joint torque sensor', 'Capteur de couple articulaire'], ['Torque (measured)', 'Couple (mesuré)'], ['Strain gauges on a flexible part of the joint.', 'Jauges de contrainte sur une partie flexible de l\'articulation.'], ['Needed for precise force control and safe cobots.', 'Nécessaire pour une commande en effort précise et des cobots sûrs.']],
      [['6-axis force / torque sensor', 'Capteur d\'effort / couple 6 axes'], ['Force (3) and moment (3) at the wrist', 'Force (3) et moment (3) au poignet'], ['Strain gauges on a small elastic body.', 'Jauges de contrainte sur un petit corps élastique.'], ['Assembly, polishing, hand guiding (lesson 6).', 'Assemblage, polissage, guidage manuel (leçon 6).']],
      [['IMU (accelerometer + gyroscope)', 'Centrale inertielle (accéléromètre + gyroscope)'], ['Acceleration, angular rate', 'Accélération, vitesse angulaire'], ['MEMS sensors.', 'Capteurs MEMS.'], ['Mobile and legged robots, drones, vibration monitoring.', 'Robots mobiles et à pattes, drones, surveillance des vibrations.']],
      [['Limit switch, proximity sensor', 'Fin de course, capteur de proximité'], ['End of travel', 'Fin de course'], ['Mechanical or inductive contact.', 'Contact mécanique ou inductif.'], ['Homing and safety.', 'Prise d\'origine et sécurité.']]
    ]),
    H4('3.1 Resolution, accuracy, repeatability', '3.1 Résolution, exactitude, répétabilité'),
    UL([
      ['<strong>Resolution</strong>: the smallest change that the sensor can show. A 17-bit encoder gives 2<sup>17</sup> = 131 072 counts per turn, i.e. 0.0027° per count.', '<strong>Résolution</strong> : le plus petit changement que le capteur peut montrer. Un codeur 17 bits donne 2<sup>17</sup> = 131 072 points par tour, soit 0,0027° par point.'],
      ['<strong>Accuracy</strong>: how close the reading is to the true value. A good encoder can have a high resolution but a poor accuracy (eccentric disc, temperature).', '<strong>Exactitude</strong> : à quel point la lecture est proche de la vraie valeur. Un bon codeur peut avoir une grande résolution mais une mauvaise exactitude (disque excentré, température).'],
      ['<strong>Repeatability</strong>: how close the readings are when the same situation is repeated. Industrial robots are very repeatable (±0.02 mm) but less accurate (a fraction of a millimetre, until calibrated).', '<strong>Répétabilité</strong> : à quel point les lectures sont proches quand la même situation est répétée. Les robots industriels sont très répétables (±0,02 mm) mais moins exacts (une fraction de millimètre, tant qu\'ils ne sont pas étalonnés).'],
      ['<strong>Noise</strong> and <strong>quantisation</strong>: differentiating an encoder to get the speed amplifies both; speed is filtered (or estimated with an observer).', '<strong>Bruit</strong> et <strong>quantification</strong> : dériver un codeur pour obtenir la vitesse amplifie les deux ; la vitesse est filtrée (ou estimée avec un observateur).']
    ]),
    BOX('example', ['Worked example: resolution at the tool', 'Exemple résolu : résolution à l\'outil'],
      P('A 17-bit encoder on the motor, with a 100:1 gearbox: one count is 360° / (131 072 × 100) = 0.0000275° at the joint (0.48 µrad). At the end of a 1 m arm this is 0.48 µm: the sensor is far finer than the mechanics. In practice the limit is the elasticity and the backlash of the gearbox: that is why robots often add a <strong>second encoder on the output side</strong> (dual encoder) to measure the real joint angle.',
        'Un codeur 17 bits sur le moteur, avec un réducteur 100:1 : un point vaut 360° / (131 072 × 100) = 0,0000275° à l\'articulation (0,48 µrad). Au bout d\'un bras de 1 m cela fait 0,48 µm : le capteur est bien plus fin que la mécanique. En pratique la limite est l\'élasticité et le jeu du réducteur : c\'est pourquoi les robots ajoutent souvent un <strong>second codeur côté sortie</strong> (double codeur) pour mesurer le vrai angle de l\'articulation.')),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['Absolute encoders remove the homing step; incremental ones need it.', 'Les codeurs absolus évitent la prise d\'origine ; les incrémentaux la demandent.'],
        ['Motor-side measurement is precise but does not see the gearbox elasticity; output-side measurement does.', 'La mesure côté moteur est précise mais ne voit pas l\'élasticité du réducteur ; la mesure côté sortie la voit.'],
        ['Current is a free, rough torque sensor; strain gauges are a true torque sensor.', 'Le courant est un capteur de couple gratuit et approximatif ; les jauges sont un vrai capteur de couple.']
      ]))
  ],
  terms: [['proprioceptive', 'proprioceptif'], ['encoder', 'codeur'], ['homing', 'prise d\'origine'], ['resolution', 'résolution'], ['accuracy', 'exactitude'], ['repeatability', 'répétabilité'], ['force / torque sensor', 'capteur d\'effort / couple'], ['IMU', 'centrale inertielle']],
  quiz: [
    ['What is the angular resolution of a 12-bit absolute encoder?', 'Quelle est la résolution angulaire d\'un codeur absolu 12 bits ?', '360° / 4096 ≈ 0.088° per count.', '360° / 4096 ≈ 0,088° par point.'],
    ['A robot is switched on and does not know its pose until it makes a small calibration move. What sensor type does it have?', 'Un robot est allumé et ne connaît pas sa pose tant qu\'il n\'a pas fait un petit mouvement de calibration. Quel type de capteur a-t-il ?', 'Incremental encoders: they only count changes and need homing.', 'Des codeurs incrémentaux : ils ne comptent que les changements et demandent une prise d\'origine.'],
    ['An industrial robot is repeatable to ±0.02 mm but 0.5 mm off the programmed point. Which word describes each fact?', 'Un robot industriel est répétable à ±0,02 mm mais à 0,5 mm du point programmé. Quel mot décrit chaque fait ?', 'Repeatability ±0.02 mm; accuracy 0.5 mm. Calibration improves accuracy, not repeatability.', 'Répétabilité ±0,02 mm ; exactitude 0,5 mm. L\'étalonnage améliore l\'exactitude, pas la répétabilité.']
  ]
})
  ];
}
