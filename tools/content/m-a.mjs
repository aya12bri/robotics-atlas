import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'wmr-';

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: [`What is a wheeled mobile robot? Locomotion, kinematics and dynamics`, `Qu'est-ce qu'un robot mobile à roues ? Locomotion, cinématique et dynamique`],
  time: 10,
  goal: [`to say what makes a machine a robot, to name the five subsystems of a wheeled mobile robot, and to know what “kinematics” means for a robot that moves around.`, `dire ce qui fait d'une machine un robot, nommer les cinq sous-systèmes d'un robot mobile à roues, et savoir ce que la « cinématique » veut dire pour un robot qui se déplace.`],
  body: [
    H4(`1.1 What is a robot?`, `1.1 Qu'est-ce qu'un robot ?`),
    P(`There is no precise definition, but by general agreement a <strong>robot</strong> is a machine with <strong>sensing, intelligence and mobility</strong>. To qualify, a machine has to be able to:`,
      `Il n'y a pas de définition précise, mais on s'accorde à dire qu'un <strong>robot</strong> est une machine dotée de <strong>perception, d'intelligence et de mobilité</strong>. Pour mériter ce nom, une machine doit pouvoir :`),
    OL([
      [`<strong>sense and perceive</strong>: get information from its surroundings;`, `<strong>sentir et percevoir</strong> : obtenir des informations sur son environnement ;`],
      [`<strong>carry out physical tasks</strong>: move itself (locomotion) or move objects (manipulation);`, `<strong>effectuer des tâches physiques</strong> : se déplacer (locomotion) ou déplacer des objets (manipulation) ;`],
      [`be <strong>re-programmable</strong>: do different things when the program changes;`, `être <strong>reprogrammable</strong> : faire autre chose quand le programme change ;`],
      [`<strong>work autonomously</strong> and interact with human beings.`, `<strong>travailler de façon autonome</strong> et interagir avec les humains.`]
    ]),
    H4(`1.2 Families of robots`, `1.2 Les familles de robots`),
    P(`Robot arms (manipulators) are fixed to the ground; a <strong>mobile manipulator</strong> is an arm carried by a mobile base. Mobile robots themselves come in several families: <strong>wheeled</strong>, legged, aerial, underwater and humanoid. This course is about the first family, the <strong>wheeled mobile robots (WMR)</strong>: vacuum robots, warehouse AGV/AMR, planetary rovers, robot cars. They are the simplest mobile robots to build and to control, and they are the most common in factories and homes.`,
      `Les bras robots (manipulateurs) sont fixés au sol ; un <strong>manipulateur mobile</strong> est un bras porté par une base mobile. Les robots mobiles forment eux-mêmes plusieurs familles : <strong>à roues</strong>, à pattes, aériens, sous-marins et humanoïdes. Ce cours traite de la première, les <strong>robots mobiles à roues (WMR)</strong> : robots aspirateurs, AGV/AMR d'entrepôt, rovers planétaires, voitures robots. Ce sont les robots mobiles les plus simples à construire et à commander, et les plus répandus dans les usines et les maisons.`),
    H4(`1.3 The five subsystems`, `1.3 Les cinq sous-systèmes`),
    P(`A wheeled mobile robot combines hardware and software. It is a collection of subsystems:`, `Un robot mobile à roues combine du matériel et du logiciel. C'est un ensemble de sous-systèmes :`),
    TABLE([[`Subsystem`, `Sous-système`], [`Question it answers`, `Question à laquelle il répond`], [`Examples`, `Exemples`]], [
      [[`<strong>Locomotion</strong>`, `<strong>Locomotion</strong>`], [`How does the robot move through its environment?`, `Comment le robot se déplace-t-il dans son environnement ?`], [`wheels, motors, gearboxes, chassis`, `roues, moteurs, réducteurs, châssis`]],
      [[`<strong>Sensing</strong>`, `<strong>Perception</strong>`], [`How does it measure itself and its surroundings?`, `Comment mesure-t-il son état et ce qui l'entoure ?`], [`encoders, gyroscope, lidar, camera`, `codeurs, gyroscope, lidar, caméra`]],
      [[`<strong>Control</strong>`, `<strong>Commande</strong>`], [`How does it generate physical actions?`, `Comment génère-t-il des actions physiques ?`], [`speed loops, position control`, `boucles de vitesse, commande en position`]],
      [[`<strong>Reasoning</strong>`, `<strong>Raisonnement</strong>`], [`How does it map measurements to actions?`, `Comment transforme-t-il les mesures en actions ?`], [`localisation, path planning`, `localisation, planification de chemin`]],
      [[`<strong>Communication</strong>`, `<strong>Communication</strong>`], [`How does it talk to other robots or to an operator?`, `Comment parle-t-il aux autres robots ou à un opérateur ?`], [`Wi-Fi, radio, ROS messages`, `Wi-Fi, radio, messages ROS`]]
    ]),
    P(`In the navigation loop of a mobile robot, <em>perception</em> feeds <em>localisation</em> (“where am I?”) and <em>cognition</em> (“where do I go?”); cognition gives a path to <em>motion control</em>, which acts on the real world. This course is the <strong>locomotion and motion-control</strong> part of that loop.`,
      `Dans la boucle de navigation d'un robot mobile, la <em>perception</em> alimente la <em>localisation</em> (« où suis-je ? ») et la <em>cognition</em> (« où dois-je aller ? ») ; la cognition donne un chemin à la <em>commande du mouvement</em>, qui agit sur le monde réel. Ce cours est la partie <strong>locomotion et commande du mouvement</strong> de cette boucle.`),
    H4(`1.4 Locomotion, dynamics and kinematics`, `1.4 Locomotion, dynamique et cinématique`),
    UL([
      [`<strong>Locomotion</strong> is the process of causing a robot to move. To produce motion, forces must be applied: motor output, payload, friction.`, `La <strong>locomotion</strong> est le processus qui fait avancer un robot. Pour produire un mouvement, il faut appliquer des forces : couple moteur, charge, frottement.`],
      [`<strong>Dynamics</strong> studies motion with the forces that cause it: the relation between force and motion.`, `La <strong>dynamique</strong> étudie le mouvement avec les forces qui le causent : la relation entre force et mouvement.`],
      [`<strong>Kinematics</strong> studies the mathematics of motion <em>without</em> the forces: the geometric relations between the control parameters (wheel speeds, steering angles) and the behaviour of the robot.`, `La <strong>cinématique</strong> étudie les mathématiques du mouvement <em>sans</em> les forces : les relations géométriques entre les paramètres de commande (vitesses des roues, angles de braquage) et le comportement du robot.`]
    ]),
    P(`Most mobile-robot controllers work at the kinematic level and ignore the dynamics, as long as the robot moves slowly enough. That is what we do here.`,
      `La plupart des commandes de robots mobiles travaillent au niveau cinématique et ignorent la dynamique, tant que le robot va assez lentement. C'est ce que nous faisons ici.`),
    BOX(`idea`, [`Why it is different from a robot arm`, `Pourquoi c'est différent d'un bras robot`],
      P(`Kinematics of a mobile robot looks like that of an arm, but there is one big difference: an arm is fixed to the ground, so the position of its tool follows directly from the joint angles. A mobile robot moves <strong>without bound</strong> in its environment. There is no direct way to measure its position: it must be <strong>integrated over time</strong> from the wheel motions, and every small error is added to the next. This drift of the position estimate is the number 1 challenge of mobile robotics.`,
        `La cinématique d'un robot mobile ressemble à celle d'un bras, mais avec une grande différence : un bras est fixé au sol, donc la position de son outil découle directement des angles articulaires. Un robot mobile se déplace <strong>sans limite</strong> dans son environnement. Il n'y a pas de moyen direct de mesurer sa position : il faut l'<strong>intégrer dans le temps</strong> à partir des mouvements des roues, et chaque petite erreur s'ajoute à la suivante. Cette dérive de l'estimation de position est le défi numéro 1 de la robotique mobile.`)),
    H4(`1.5 Three simple wheeled bases`, `1.5 Trois bases à roues simples`),
    TABLE([[`Base`, `Base`], [`Good`, `Avantages`], [`Not so good`, `Inconvénients`]], [
      [[`<strong>Two-wheel</strong> (bi-wheel) robot`, `Robot <strong>à deux roues</strong>`], [`Smooth motion; simple.`, `Mouvement doux ; simple.`], [`Risk of slipping; often needs a ball or castor to stay balanced.`, `Risque de glissement ; il faut souvent une bille ou une roue folle pour tenir debout.`]],
      [[`<strong>Caterpillar</strong> (tracked) robot`, `Robot <strong>à chenilles</strong>`], [`Exact straight motion; robust to slipping.`, `Trajectoire rectiligne exacte ; robuste au glissement.`], [`Turning is hard to model exactly.`, `Le virage est difficile à modéliser exactement.`]],
      [[`<strong>Omnidirectional</strong> robot`, `Robot <strong>omnidirectionnel</strong>`], [`Free motion in any direction.`, `Mouvement libre dans toutes les directions.`], [`Complex structure; weak frame; special wheels.`, `Structure complexe ; châssis fragile ; roues spéciales.`]]
    ])
  ],
  terms: [[`wheeled mobile robot (WMR)`, `robot mobile à roues (WMR)`], [`locomotion`, `locomotion`], [`kinematics`, `cinématique`], [`dynamics`, `dynamique`], [`odometry`, `odométrie`], [`mobile manipulator`, `manipulateur mobile`]],
  quiz: [
    [`Name the five subsystems of a wheeled mobile robot.`, `Citez les cinq sous-systèmes d'un robot mobile à roues.`, `Locomotion, sensing, control, reasoning and communication.`, `Locomotion, perception, commande, raisonnement et communication.`],
    [`What is the difference between kinematics and dynamics?`, `Quelle est la différence entre cinématique et dynamique ?`, `Kinematics relates positions and velocities geometrically, without forces. Dynamics also includes the forces and torques that produce the motion.`, `La cinématique relie positions et vitesses géométriquement, sans forces. La dynamique inclut aussi les forces et couples qui produisent le mouvement.`],
    [`Why can a mobile robot not simply read its position from a sensor like an arm does?`, `Pourquoi un robot mobile ne peut-il pas simplement lire sa position sur un capteur comme le fait un bras ?`, `Because it is not attached to the ground: its position has to be integrated from the motion of its wheels (odometry), and the errors accumulate.`, `Parce qu'il n'est pas fixé au sol : sa position doit être intégrée à partir du mouvement de ses roues (odométrie), et les erreurs s'accumulent.`]
  ],
  link: [`mobile.html`, `Try the 3D mobile robot →`, `Essayer le robot mobile en 3D →`]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: [`Where is the robot? Pose, frames and the rotation matrix`, `Où est le robot ? Pose, repères et matrice de rotation`],
  time: 11,
  goal: [`to describe the position and orientation of a robot on the floor with three numbers, and to convert a velocity between the global frame and the frame attached to the robot.`, `décrire la position et l'orientation d'un robot sur le sol avec trois nombres, et convertir une vitesse entre le repère global et le repère lié au robot.`],
  body: [
    H4(`2.1 Three numbers: the pose`, `2.1 Trois nombres : la pose`),
    P(`On a plane, the robot chassis has <strong>three</strong> dimensions: two for its position in the plane and one for its orientation around the vertical axis. The <strong>posture</strong> (or <strong>pose</strong>) is therefore:`,
      `Dans un plan, le châssis du robot a <strong>trois</strong> dimensions : deux pour sa position dans le plan et une pour son orientation autour de l'axe vertical. La <strong>posture</strong> (ou <strong>pose</strong>) est donc :`),
    EQ(`<i>ξ</i><sub>I</sub> = ( <i>x</i> , <i>y</i> , <i>θ</i> )<sup>T</sup> &nbsp;&nbsp; and its velocity &nbsp;&nbsp; <i>ξ̇</i><sub>I</sub> = ( <i>ẋ</i> , <i>ẏ</i> , <i>θ̇</i> )<sup>T</sup>`, `<i>ξ</i><sub>I</sub> = ( <i>x</i> , <i>y</i> , <i>θ</i> )<sup>T</sup> &nbsp;&nbsp; et sa vitesse &nbsp;&nbsp; <i>ξ̇</i><sub>I</sub> = ( <i>ẋ</i> , <i>ẏ</i> , <i>θ̇</i> )<sup>T</sup>`),
    FIG(`0 0 460 280`, `
      <line x1="40" y1="250" x2="440" y2="250" class="ax"/><line x1="40" y1="250" x2="40" y2="20" class="ax"/>
      <text x="436" y="268" text-anchor="end">X<tspan dy="3" font-size="10">I</tspan></text><text x="26" y="30" text-anchor="end">Y<tspan dy="3" font-size="10">I</tspan></text>
      <line x1="40" y1="170" x2="250" y2="170" class="dash"/><line x1="250" y1="170" x2="250" y2="250" class="dash"/>
      <text x="250" y="268" text-anchor="middle">x</text><text x="30" y="174" text-anchor="end">y</text>
      <g transform="translate(250 170) rotate(-30)">
        <rect x="-45" y="-26" width="90" height="52" rx="6" fill="rgba(91,143,214,.22)" stroke="#5b8fd6" stroke-width="2"/>
        <rect x="-26" y="-34" width="30" height="9" rx="2" fill="#6b7686"/><rect x="-26" y="25" width="30" height="9" rx="2" fill="#6b7686"/>
        <circle cx="36" cy="0" r="6" fill="#6b7686"/>
        <line x1="0" y1="0" x2="95" y2="0" stroke="#ff9f43" stroke-width="2.5"/><line x1="0" y1="0" x2="0" y2="-80" stroke="#4ed17f" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="4" class="pt"/>
      </g>
      <text x="338" y="106" fill="#ff9f43" class="c-x">X<tspan dy="3" font-size="10">R</tspan></text><text x="225" y="95" class="c-y" fill="#4ed17f">Y<tspan dy="3" font-size="10">R</tspan></text>
      <path d="M 320 170 A 70 70 0 0 0 310 135" class="arc"/><text x="326" y="156" fill="#ff9f43">θ</text>
      <text x="262" y="188">P</text>`),
    P(`The global frame {<i>X</i><sub>I</sub>, <i>Y</i><sub>I</sub>} is fixed to the floor. The robot frame {<i>X</i><sub>R</sub>, <i>Y</i><sub>R</sub>} is fixed to the chassis, with its origin at the reference point <i>P</i>, and <i>X</i><sub>R</sub> pointing forward. The pose is the position of <i>P</i> in the global frame and the angle <i>θ</i> between the two frames.`,
      `Le repère global {<i>X</i><sub>I</sub>, <i>Y</i><sub>I</sub>} est fixé au sol. Le repère robot {<i>X</i><sub>R</sub>, <i>Y</i><sub>R</sub>} est fixé au châssis, avec son origine au point de référence <i>P</i>, et <i>X</i><sub>R</sub> pointant vers l'avant. La pose est la position de <i>P</i> dans le repère global et l'angle <i>θ</i> entre les deux repères.`),
    H4(`2.2 From the global frame to the robot frame`, `2.2 Du repère global au repère robot`),
    P(`The wheels act in the robot frame (“go forward, do not slide sideways”), but we want to know the motion in the global frame. The orthogonal <strong>rotation matrix</strong> converts one into the other:`,
      `Les roues agissent dans le repère robot (« avancer, ne pas glisser de côté »), mais on veut connaître le mouvement dans le repère global. La <strong>matrice de rotation</strong> orthogonale convertit l'un en l'autre :`),
    EQ(`<i>R</i>(<i>θ</i>) = ${MX(3, ['cos θ', 'sin θ', '0', '− sin θ', 'cos θ', '0', '0', '0', '1'])} &nbsp;&nbsp;&nbsp; <i>ξ̇</i><sub>R</sub> = <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> &nbsp;&nbsp;&nbsp; <i>ξ̇</i><sub>I</sub> = <i>R</i>(<i>θ</i>)<sup>−1</sup> <i>ξ̇</i><sub>R</sub> = <i>R</i>(<i>θ</i>)<sup>T</sup> <i>ξ̇</i><sub>R</sub>`),
    P(`Because <i>R</i> is a rotation matrix, its inverse is simply its transpose. The same matrix will appear in every kinematic model of this course.`,
      `Comme <i>R</i> est une matrice de rotation, son inverse est simplement sa transposée. La même matrice apparaîtra dans tous les modèles cinématiques de ce cours.`),
    BOX(`example`, [`Worked example`, `Exemple résolu`],
      P(`The robot is rotated by <i>θ</i> = 90° (it points along <i>Y</i><sub>I</sub>). Then <i>R</i>(π/2) gives <i>ξ̇</i><sub>R</sub> = ( <i>ẏ</i> , −<i>ẋ</i> , <i>θ̇</i> ). A global velocity of ( 1 , 0 , 0 ) m/s along <i>X</i><sub>I</sub> becomes ( 0 , −1 , 0 ) in the robot frame: the robot sees the world moving to its right, which is a sideways motion. This is the motion a standard wheel forbids.`,
        `Le robot est tourné de <i>θ</i> = 90° (il pointe selon <i>Y</i><sub>I</sub>). Alors <i>R</i>(π/2) donne <i>ξ̇</i><sub>R</sub> = ( <i>ẏ</i> , −<i>ẋ</i> , <i>θ̇</i> ). Une vitesse globale de ( 1 , 0 , 0 ) m/s selon <i>X</i><sub>I</sub> devient ( 0 , −1 , 0 ) dans le repère robot : le robot voit le monde se déplacer vers sa droite, c'est un mouvement latéral. C'est le mouvement qu'une roue standard interdit.`),
      P(`With <i>θ</i> = 30° the same global velocity ( 1 , 0 , 0 ) gives ( cos 30° , −sin 30° , 0 ) = ( 0.87 , −0.5 , 0 ) in the robot frame.`,
        `Avec <i>θ</i> = 30°, la même vitesse globale ( 1 , 0 , 0 ) donne ( cos 30° , −sin 30° , 0 ) = ( 0,87 ; −0,5 ; 0 ) dans le repère robot.`)),
    H4(`2.3 Forward and inverse kinematics of a mobile robot`, `2.3 Cinématique directe et inverse d'un robot mobile`),
    P(`The goal is to write the speed of the robot as a function of the wheel speeds <i>φ̇</i><sub>i</sub>, the steering angles <i>β</i><sub>j</sub> and the geometry of the robot (the <em>configuration coordinates</em>):`,
      `Le but est d'écrire la vitesse du robot en fonction des vitesses des roues <i>φ̇</i><sub>i</sub>, des angles de braquage <i>β</i><sub>j</sub> et de la géométrie du robot (les <em>coordonnées de configuration</em>) :`),
    UL([
      [`<strong>forward kinematics</strong>: wheel speeds and steering → robot velocity <i>ξ̇</i>;`, `<strong>cinématique directe</strong> : vitesses des roues et braquage → vitesse du robot <i>ξ̇</i> ;`],
      [`<strong>inverse kinematics</strong>: wanted velocity <i>ξ̇</i> → wheel speeds and steering angles.`, `<strong>cinématique inverse</strong> : vitesse voulue <i>ξ̇</i> → vitesses des roues et angles de braquage.`]
    ]),
    P(`Be careful: we can write <i>ξ̇</i> = <i>f</i>(wheel speeds), but not simply <i>ξ</i> = <i>f</i>(wheel angles). The pose depends on <em>how</em> the wheels were turned over time, not only on how far. We will see the exact reason in lesson 8 (nonholonomic systems).`,
      `Attention : on peut écrire <i>ξ̇</i> = <i>f</i>(vitesses des roues), mais pas simplement <i>ξ</i> = <i>f</i>(angles des roues). La pose dépend de <em>la manière</em> dont les roues ont tourné au cours du temps, pas seulement de combien. Nous verrons la raison exacte à la leçon 8 (systèmes non holonomes).`)
  ],
  terms: [[`pose / posture`, `pose / posture`], [`global (inertial) frame`, `repère global (inertiel)`], [`robot frame`, `repère robot`], [`rotation matrix`, `matrice de rotation`], [`forward / inverse kinematics`, `cinématique directe / inverse`]],
  quiz: [
    [`How many numbers describe the pose of a robot on a flat floor?`, `Combien de nombres décrivent la pose d'un robot sur un sol plat ?`, `Three: x, y and the orientation θ.`, `Trois : x, y et l'orientation θ.`],
    [`What is the inverse of R(θ)?`, `Quelle est l'inverse de R(θ) ?`, `Its transpose, which is also R(−θ).`, `Sa transposée, qui est aussi R(−θ).`],
    [`The robot has θ = 90° and moves at ẋ = 0, ẏ = 2 m/s in the global frame. What is its velocity in the robot frame?`, `Le robot a θ = 90° et se déplace à ẋ = 0, ẏ = 2 m/s dans le repère global. Quelle est sa vitesse dans le repère robot ?`, `ξ̇_R = (ẏ, −ẋ, θ̇) = (2, 0, 0): it goes straight ahead at 2 m/s.`, `ξ̇_R = (ẏ, −ẋ, θ̇) = (2, 0, 0) : il avance tout droit à 2 m/s.`]
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: [`Wheels and their constraints: rolling and sliding`, `Les roues et leurs contraintes : roulement et glissement`],
  time: 15,
  goal: [`to know the five wheel types, and to write the two constraints (rolling and no sliding) that each standard wheel imposes on the robot.`, `connaître les cinq types de roues et écrire les deux contraintes (roulement et non-glissement) que chaque roue standard impose au robot.`],
  body: [
    H4(`3.1 Five wheel types`, `3.1 Cinq types de roues`),
    TABLE([[`Wheel`, `Roue`], [`How it works`, `Principe`], [`Effect on the robot`, `Effet sur le robot`]], [
      [[`<strong>Fixed standard wheel</strong>`, `<strong>Roue standard fixe</strong>`], [`Fixed to the chassis at an angle; rolls forward and backward; can pivot around its contact point.`, `Fixée au châssis avec un angle ; roule en avant et en arrière ; peut pivoter autour de son point de contact.`], [`<strong>Constrains</strong> the motion: no sideways sliding.`, `<strong>Contraint</strong> le mouvement : pas de glissement latéral.`]],
      [[`<strong>Steered standard wheel</strong> (centred orientable)`, `<strong>Roue standard orientable</strong> (orientable centrée)`], [`Same, plus a vertical steering axis through the contact point: angle <i>β</i>(<i>t</i>).`, `Pareil, avec en plus un axe de direction vertical passant par le point de contact : angle <i>β</i>(<i>t</i>).`], [`<strong>Constrains</strong> the motion; steering changes the constraint over time.`, `<strong>Contraint</strong> le mouvement ; le braquage change la contrainte au cours du temps.`]],
      [[`<strong>Castor wheel</strong> (off-centred orientable)`, `<strong>Roue folle</strong> (orientable décentrée)`], [`Steering axis offset by a distance <i>d</i> from the contact point, like a shopping-trolley wheel.`, `Axe de direction décalé d'une distance <i>d</i> du point de contact, comme une roue de caddie.`], [`<strong>No constraint</strong> on the chassis (the offset lets it follow any motion).`, `<strong>Aucune contrainte</strong> sur le châssis (le décalage lui permet de suivre n'importe quel mouvement).`]],
      [[`<strong>Swedish wheel</strong> (Mecanum, omni)`, `<strong>Roue suédoise</strong> (Mecanum, omni)`], [`A wheel with small rollers on its rim; the roller axis makes an angle <i>γ</i> with the wheel axis.`, `Une roue avec de petits rouleaux sur sa jante ; l'axe des rouleaux fait un angle <i>γ</i> avec l'axe de la roue.`], [`<strong>No constraint</strong>: it can also move along the rollers.`, `<strong>Aucune contrainte</strong> : elle peut aussi glisser le long des rouleaux.`]],
      [[`<strong>Spherical wheel</strong> (ball)`, `<strong>Roue sphérique</strong> (bille)`], [`A ball that rolls in any direction.`, `Une bille qui roule dans toutes les directions.`], [`<strong>No constraint</strong>.`, `<strong>Aucune contrainte</strong>.`]]
    ]),
    TRY(`wheels.html`, `See and spin every wheel type in 3D →`, `Voir et faire tourner chaque type de roue en 3D →`),
    H4(`3.2 The assumptions`, `3.2 Les hypothèses`),
    P(`To get simple equations we model an <strong>idealised wheel</strong>:`, `Pour obtenir des équations simples, on modélise une <strong>roue idéale</strong> :`),
    UL([
      [`the robot moves on a <strong>horizontal plane</strong>, and the wheel plane stays vertical;`, `le robot se déplace sur un <strong>plan horizontal</strong> et le plan de la roue reste vertical ;`],
      [`the wheel touches the ground at <strong>one point</strong> and does not deform;`, `la roue touche le sol en <strong>un seul point</strong> et ne se déforme pas ;`],
      [`<strong>pure rolling</strong>: the velocity of the contact point is zero;`, `<strong>roulement pur</strong> : la vitesse du point de contact est nulle ;`],
      [`<strong>no slipping, skidding or sliding</strong> sideways, and no friction against rotation about the contact point;`, `<strong>ni patinage, ni dérapage, ni glissement</strong> latéral, et aucun frottement à la rotation autour du point de contact ;`],
      [`the steering axes are perpendicular to the floor, and the wheels are connected by a <strong>rigid chassis</strong>.`, `les axes de direction sont perpendiculaires au sol, et les roues sont reliées par un <strong>châssis rigide</strong>.`]
    ]),
    P(`Under these assumptions each standard wheel gives <strong>two constraints</strong>: <em>rolling contact</em> (the wheel must roll when the robot moves along its plane) and <em>no lateral slip</em> (the wheel must not slide across its plane).`,
      `Sous ces hypothèses, chaque roue standard donne <strong>deux contraintes</strong> : le <em>contact roulant</em> (la roue doit rouler quand le robot avance dans son plan) et le <em>non-glissement latéral</em> (la roue ne doit pas glisser en travers de son plan).`),
    H4(`3.3 The fixed standard wheel`, `3.3 La roue standard fixe`),
    P(`The wheel is attached at a point <i>A</i>, given in polar coordinates by the distance <i>l</i> and the angle <i>α</i> from the reference point <i>P</i>. The angle of the wheel plane with respect to the chassis is <i>β</i> (constant for a fixed wheel). The wheel has radius <i>r</i> and turns at the speed <i>φ̇</i>.`,
      `La roue est attachée en un point <i>A</i>, donné en coordonnées polaires par la distance <i>l</i> et l'angle <i>α</i> depuis le point de référence <i>P</i>. L'angle du plan de la roue par rapport au châssis est <i>β</i> (constant pour une roue fixe). La roue a un rayon <i>r</i> et tourne à la vitesse <i>φ̇</i>.`),
    EQ(`<strong>Rolling:</strong> &nbsp; [ sin(<i>α</i>+<i>β</i>) &nbsp; −cos(<i>α</i>+<i>β</i>) &nbsp; −<i>l</i> cos <i>β</i> ] &nbsp; <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> − <i>r</i> <i>φ̇</i> = 0`, `<strong>Roulement :</strong> &nbsp; [ sin(<i>α</i>+<i>β</i>) &nbsp; −cos(<i>α</i>+<i>β</i>) &nbsp; −<i>l</i> cos <i>β</i> ] &nbsp; <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> − <i>r</i> <i>φ̇</i> = 0`),
    EQ(`<strong>Sliding:</strong> &nbsp; [ cos(<i>α</i>+<i>β</i>) &nbsp; sin(<i>α</i>+<i>β</i>) &nbsp; <i>l</i> sin <i>β</i> ] &nbsp; <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> = 0`, `<strong>Glissement :</strong> &nbsp; [ cos(<i>α</i>+<i>β</i>) &nbsp; sin(<i>α</i>+<i>β</i>) &nbsp; <i>l</i> sin <i>β</i> ] &nbsp; <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> = 0`),
    P(`The first line says: the speed of the contact point <em>along</em> the wheel plane equals <i>r</i> <i>φ̇</i> (the wheel really rolls). The second says: the speed <em>across</em> the wheel plane is zero (it does not slide). Each row projects the robot velocity on one direction of the wheel.`,
      `La première ligne dit : la vitesse du point de contact <em>dans</em> le plan de la roue vaut <i>r</i> <i>φ̇</i> (la roue roule vraiment). La seconde dit : la vitesse <em>en travers</em> du plan de la roue est nulle (elle ne glisse pas). Chaque ligne projette la vitesse du robot sur une direction de la roue.`),
    BOX(`example`, [`Worked example`, `Exemple résolu`],
      P(`A wheel is placed at <i>α</i> = 0, <i>β</i> = 0 (on the axis <i>X</i><sub>R</sub>, its plane along <i>Y</i><sub>R</sub>), and the robot has <i>θ</i> = 0. The sliding constraint becomes [ 1 0 0 ] ( <i>ẋ</i> , <i>ẏ</i> , <i>θ̇</i> )<sup>T</sup> = 0, that is <strong><i>ẋ</i> = 0</strong>: the robot cannot move along <i>X</i>, which is across the wheel. It can still move along <i>Y</i> (rolling) and turn.`,
        `Une roue est placée en <i>α</i> = 0, <i>β</i> = 0 (sur l'axe <i>X</i><sub>R</sub>, son plan selon <i>Y</i><sub>R</sub>), et le robot a <i>θ</i> = 0. La contrainte de glissement devient [ 1 0 0 ] ( <i>ẋ</i> , <i>ẏ</i> , <i>θ̇</i> )<sup>T</sup> = 0, c'est-à-dire <strong><i>ẋ</i> = 0</strong> : le robot ne peut pas se déplacer selon <i>X</i>, qui est en travers de la roue. Il peut toujours avancer selon <i>Y</i> (roulement) et tourner.`)),
    H4(`3.4 The other wheels`, `3.4 Les autres roues`),
    UL([
      [`<strong>Steered wheel.</strong> Same two equations, but <i>β</i> = <i>β</i>(<i>t</i>) changes. The steering speed <i>β̇</i> has no <em>instantaneous</em> effect on the constraints: only by integrating over time does a new steering angle change what the robot can do. Steering alone does not move the chassis.`, `<strong>Roue orientable.</strong> Mêmes deux équations, mais <i>β</i> = <i>β</i>(<i>t</i>) change. La vitesse de braquage <i>β̇</i> n'a pas d'effet <em>instantané</em> sur les contraintes : c'est seulement en intégrant dans le temps qu'un nouvel angle de braquage change ce que le robot peut faire. Braquer seul ne déplace pas le châssis.`],
      [`<strong>Castor wheel.</strong> The rolling equation is the same, but the sliding equation gets two extra terms because of the offset <i>d</i>: [ cos(<i>α</i>+<i>β</i>) &nbsp; sin(<i>α</i>+<i>β</i>) &nbsp; <i>d</i> + <i>l</i> sin <i>β</i> ] <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> + <i>d</i> <i>β̇</i> = 0. Any sideways motion can be absorbed by the right steering speed <i>β̇</i>, so the castor wheel imposes <strong>no constraint</strong>. Here the steering <em>does</em> move the chassis, because of the offset. A five-castor office chair rolls in any direction without sliding.`, `<strong>Roue folle.</strong> L'équation de roulement est la même, mais celle de glissement a deux termes de plus à cause du décalage <i>d</i> : [ cos(<i>α</i>+<i>β</i>) &nbsp; sin(<i>α</i>+<i>β</i>) &nbsp; <i>d</i> + <i>l</i> sin <i>β</i> ] <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> + <i>d</i> <i>β̇</i> = 0. Tout mouvement latéral peut être absorbé par la bonne vitesse de braquage <i>β̇</i>, donc la roue folle n'impose <strong>aucune contrainte</strong>. Ici le braquage <em>déplace</em> le châssis, à cause du décalage. Une chaise de bureau à cinq roulettes roule dans toutes les directions sans glisser.`],
      [`<strong>Swedish wheel.</strong> Add the roller angle <i>γ</i>: the zero-velocity direction is along the roller axis. Rolling: [ sin(<i>α</i>+<i>β</i>+<i>γ</i>) &nbsp; −cos(<i>α</i>+<i>β</i>+<i>γ</i>) &nbsp; −<i>l</i> cos(<i>β</i>+<i>γ</i>) ] <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> − <i>r</i> <i>φ̇</i> cos <i>γ</i> = 0. The rollers turn freely, so the motion along the rollers is not constrained. For <i>γ</i> = 0 (the <strong>90° Swedish wheel</strong>) the rollers are perpendicular to the wheel and the robot can slide sideways freely: this is the omni wheel. For <i>γ</i> = 90° the rollers are parallel to the wheel and the wheel behaves like a fixed standard wheel.`, `<strong>Roue suédoise.</strong> On ajoute l'angle des rouleaux <i>γ</i> : la direction de vitesse nulle est selon l'axe des rouleaux. Roulement : [ sin(<i>α</i>+<i>β</i>+<i>γ</i>) &nbsp; −cos(<i>α</i>+<i>β</i>+<i>γ</i>) &nbsp; −<i>l</i> cos(<i>β</i>+<i>γ</i>) ] <i>R</i>(<i>θ</i>) <i>ξ̇</i><sub>I</sub> − <i>r</i> <i>φ̇</i> cos <i>γ</i> = 0. Les rouleaux tournent librement, donc le mouvement le long des rouleaux n'est pas contraint. Pour <i>γ</i> = 0 (la <strong>roue suédoise à 90°</strong>) les rouleaux sont perpendiculaires à la roue et le robot peut glisser latéralement librement : c'est la roue omnidirectionnelle. Pour <i>γ</i> = 90° les rouleaux sont parallèles à la roue et la roue se comporte comme une roue standard fixe.`],
      [`<strong>Spherical wheel.</strong> Its equations are those of the fixed standard wheel, but the angle <i>β</i> is a free variable instead of a constant: no constraint remains.`, `<strong>Roue sphérique.</strong> Ses équations sont celles de la roue standard fixe, mais l'angle <i>β</i> est une variable libre au lieu d'une constante : plus aucune contrainte ne subsiste.`]
    ]),
    BOX(`idea`, [`The key result`, `Le résultat clé`],
      P(`Castor, Swedish and spherical wheels put <strong>no</strong> kinematic constraint on the chassis: the robot velocity can take any value because of the internal degrees of freedom of these wheels. <strong>Only fixed and steered standard wheels constrain the chassis</strong>, so only they matter when we compute how a robot can move (lessons 7 and 8).`,
        `Les roues folles, suédoises et sphériques n'imposent <strong>aucune</strong> contrainte cinématique au châssis : la vitesse du robot peut prendre n'importe quelle valeur grâce aux degrés de liberté internes de ces roues. <strong>Seules les roues standard fixes et orientables contraignent le châssis</strong>, donc seules elles comptent quand on calcule comment un robot peut se déplacer (leçons 7 et 8).`))
  ],
  terms: [[`rolling constraint`, `contrainte de roulement`], [`sliding constraint`, `contrainte de glissement`], [`fixed / steered standard wheel`, `roue standard fixe / orientable`], [`castor wheel`, `roue folle`], [`Swedish (Mecanum) wheel`, `roue suédoise (Mecanum)`], [`spherical wheel`, `roue sphérique`]],
  quiz: [
    [`Which wheel types constrain the motion of the chassis?`, `Quels types de roues contraignent le mouvement du châssis ?`, `Only the fixed and the steered standard wheels.`, `Seulement les roues standard fixes et orientables.`],
    [`What do the two constraints of a standard wheel mean?`, `Que signifient les deux contraintes d'une roue standard ?`, `Rolling: along its plane the wheel contact moves at r·φ̇. Sliding: across its plane the speed of the contact point is zero.`, `Roulement : dans son plan, le contact avance à r·φ̇. Glissement : en travers de son plan, la vitesse du point de contact est nulle.`],
    [`Why does a castor wheel not constrain the robot, although it has a vertical axis like a steered wheel?`, `Pourquoi la roue folle ne contraint-elle pas le robot, bien qu'elle ait un axe vertical comme une roue orientable ?`, `Because its axis is offset by d from the contact point: a sideways motion is absorbed by a rotation of the steering axis (the term d·β̇).`, `Parce que son axe est décalé de d par rapport au point de contact : un mouvement latéral est absorbé par une rotation de l'axe de direction (le terme d·β̇).`]
  ],
  link: [`anatomy-wheels.html`, `Look inside seven wheel types in 3D →`, `Regarder à l'intérieur de sept types de roues en 3D →`]
}),
  ];
}
