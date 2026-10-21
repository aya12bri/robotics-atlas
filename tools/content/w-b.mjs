import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'world-';

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Electronics and embedded systems: power, drivers, controllers, buses', 'Électronique et systèmes embarqués : énergie, variateurs, contrôleurs, bus'],
  time: 13,
  goal: ['what electronics a robot contains, how to size the power supply, and which controller and bus to choose.', 'quelle électronique contient un robot, comment dimensionner l\'alimentation, et quel contrôleur et quel bus choisir.'],
  body: [
    FIG('0 0 580 230', `
      <g font-size="12">
      <rect class="pn" x="10" y="10" width="110" height="46" rx="6"/><text x="65" y="38" text-anchor="middle">${svgtx('Battery / mains', 'Batterie / secteur')}</text>
      <rect class="pn" x="170" y="10" width="120" height="46" rx="6"/><text x="230" y="38" text-anchor="middle">${svgtx('Power distribution', 'Distribution d\'énergie')}</text>
      <rect class="pn" x="340" y="10" width="110" height="46" rx="6"/><text x="395" y="38" text-anchor="middle">${svgtx('Motor drivers', 'Variateurs moteurs')}</text>
      <rect class="pn" x="480" y="10" width="90" height="46" rx="6"/><text x="525" y="38" text-anchor="middle">${svgtx('Motors', 'Moteurs')}</text>
      <rect class="pn" x="170" y="100" width="120" height="46" rx="6"/><text x="230" y="128" text-anchor="middle">${svgtx('Main computer', 'Calculateur principal')}</text>
      <rect class="pn" x="340" y="100" width="110" height="46" rx="6"/><text x="395" y="128" text-anchor="middle">${svgtx('Real-time MCU', 'MCU temps réel')}</text>
      <rect class="pn" x="480" y="100" width="90" height="46" rx="6"/><text x="525" y="128" text-anchor="middle">${svgtx('Sensors', 'Capteurs')}</text>
      <rect class="pn" x="10" y="180" width="560" height="38" rx="6"/><text x="290" y="204" text-anchor="middle">${svgtx('Safety circuit: emergency stop, contactors, safe torque off', 'Circuit de sécurité : arrêt d\'urgence, contacteurs, arrêt de couple sûr')}</text>
      <line class="ax" x1="120" y1="33" x2="170" y2="33"/><line class="ax" x1="290" y1="33" x2="340" y2="33"/><line class="ax" x1="450" y1="33" x2="480" y2="33"/>
      <line class="ax" x1="230" y1="56" x2="230" y2="100"/><line class="ax" x1="290" y1="123" x2="340" y2="123"/><line class="ax" x1="450" y1="123" x2="480" y2="123"/><line class="ax" x1="395" y1="100" x2="395" y2="56"/>
      </g>`),
    H4('4.1 Power: batteries and supplies', '4.1 Énergie : batteries et alimentations'),
    UL([
      ['<strong>Battery energy</strong> = voltage × capacity: a 24 V, 10 Ah pack stores 240 Wh. The runtime is the energy divided by the average power: 240 Wh / 60 W = <strong>4 h</strong>. Keep 20 % in reserve.', '<strong>Énergie d\'une batterie</strong> = tension × capacité : un pack 24 V, 10 Ah stocke 240 Wh. L\'autonomie est l\'énergie divisée par la puissance moyenne : 240 Wh / 60 W = <strong>4 h</strong>. Gardez 20 % de réserve.'],
      ['<strong>Chemistries</strong>: Li-ion / LiPo (high energy density, needs a battery management system, BMS), LiFePO₄ (safer, longer life), lead-acid (cheap, heavy), NiMH.', '<strong>Chimies</strong> : Li-ion / LiPo (forte densité d\'énergie, demande un système de gestion de batterie, BMS), LiFePO₄ (plus sûr, plus durable), plomb (bon marché, lourd), NiMH.'],
      ['<strong>Current</strong>: <i>I</i> = <i>P</i> / <i>V</i>. A 100 W motor at 24 V draws 4.2 A; at 12 V it draws 8.3 A, so thicker wires and bigger connectors. Higher voltage means less current and less loss (<i>P</i><sub>loss</sub> = <i>R</i> <i>I</i>²).', '<strong>Courant</strong> : <i>I</i> = <i>P</i> / <i>V</i>. Un moteur de 100 W sous 24 V consomme 4,2 A ; sous 12 V il consomme 8,3 A, donc des fils plus gros et des connecteurs plus grands. Une tension plus haute donne moins de courant et moins de pertes (<i>P</i><sub>pertes</sub> = <i>R</i> <i>I</i>²).'],
      ['<strong>Peaks</strong>: motors draw several times their average current when accelerating; the supply and the wires must tolerate it, and braking can push energy back (use a brake resistor or a regenerative supply).', '<strong>Pointes</strong> : les moteurs consomment plusieurs fois leur courant moyen à l\'accélération ; l\'alimentation et les fils doivent le tolérer, et le freinage peut renvoyer de l\'énergie (résistance de freinage ou alimentation régénérative).']
    ]),
    H4('4.2 Drivers, controllers and buses', '4.2 Variateurs, contrôleurs et bus'),
    TABLE([['Layer', 'Couche'], ['Options', 'Options'], ['Choose when', 'À choisir quand']], [
      [['Motor driver', 'Variateur moteur'], ['H-bridge (brushed), FOC driver (brushless, with current sensing and encoder input), stepper driver (microstepping), industrial servo drive.', 'Pont en H (à balais), variateur FOC (sans balais, avec mesure de courant et entrée codeur), variateur pas à pas (micropas), servo-variateur industriel.'], ['Match the motor type, voltage and current; add protections.', 'Adapter au type de moteur, à la tension et au courant ; ajouter des protections.']],
      [['Microcontroller (MCU)', 'Microcontrôleur (MCU)'], ['Arduino, STM32, ESP32, Teensy.', 'Arduino, STM32, ESP32, Teensy.'], ['Hard real time, low cost and power: fast loops, sensors, motor control.', 'Temps réel dur, faible coût et consommation : boucles rapides, capteurs, commande moteur.']],
      [['Single-board computer', 'Calculateur monocarte'], ['Raspberry Pi, Jetson (GPU), industrial PC.', 'Raspberry Pi, Jetson (GPU), PC industriel.'], ['Vision, planning, ROS 2, AI: high layers, with Linux.', 'Vision, planification, ROS 2, IA : couches hautes, avec Linux.']],
      [['PLC', 'automate (API)'], ['Siemens, Beckhoff, Rockwell, Mitsubishi.', 'Siemens, Beckhoff, Rockwell, Mitsubishi.'], ['A robot in a production line: sequencing, safety, I/O, reliability.', 'Un robot dans une ligne de production : séquencement, sécurité, E/S, fiabilité.']],
      [['Bus / network', 'Bus / réseau'], ['I²C, SPI, UART (on a board); CAN / CAN-FD (robust, shared cable, 1 Mbit/s); EtherCAT (fast, synchronous, industrial); USB, Ethernet, Wi-Fi.', 'I²C, SPI, UART (sur une carte) ; CAN / CAN-FD (robuste, câble partagé, 1 Mbit/s) ; EtherCAT (rapide, synchrone, industriel) ; USB, Ethernet, Wi-Fi.'], ['CAN for a few joints on a small robot; EtherCAT for many axes with tight timing.', 'CAN pour quelques articulations d\'un petit robot ; EtherCAT pour de nombreux axes avec un timing strict.']]
    ]),
    H4('4.3 Signals and noise', '4.3 Signaux et bruit'),
    UL([
      ['<strong>ADC resolution</strong>: a 12-bit converter with a 3.3 V range has a step of 3.3 / 4096 ≈ 0.8 mV. A sensor of 10 mV per unit then has a resolution of 0.08 unit.', '<strong>Résolution du CAN</strong> : un convertisseur 12 bits sur 3,3 V a un pas de 3,3 / 4096 ≈ 0,8 mV. Un capteur de 10 mV par unité a alors une résolution de 0,08 unité.'],
      ['<strong>PWM</strong>: a motor is driven by switching the voltage at 10 to 20 kHz (above hearing); the duty cycle sets the average voltage.', '<strong>MLI (PWM)</strong> : un moteur est piloté en commutant la tension à 10 à 20 kHz (au-dessus de l\'audible) ; le rapport cyclique fixe la tension moyenne.'],
      ['<strong>EMC</strong>: motor drivers create electrical noise that corrupts encoder and sensor signals. Use shielded twisted-pair cables, a single ground point, separate power and signal cables, filters, and differential signalling (RS-422, CAN).', '<strong>CEM</strong> : les variateurs créent du bruit électrique qui perturbe les signaux de codeurs et de capteurs. Utilisez des câbles blindés en paires torsadées, un seul point de masse, des câbles de puissance et de signal séparés, des filtres, et une signalisation différentielle (RS-422, CAN).'],
      ['<strong>Protections</strong>: fuses or breakers, reverse-polarity and over-current protection, limit switches, temperature sensors on the motors and drivers.', '<strong>Protections</strong> : fusibles ou disjoncteurs, protection contre l\'inversion de polarité et la surintensité, fins de course, capteurs de température sur les moteurs et variateurs.']
    ]),
    BOX('warn', ['Never forget the safety circuit', 'N\'oubliez jamais le circuit de sécurité'],
      P('An emergency stop must not depend on the software. It cuts the power to the drives through certified relays or safe-torque-off inputs (see lesson 6). Test it every time you modify the robot.',
        'Un arrêt d\'urgence ne doit pas dépendre du logiciel. Il coupe l\'énergie des variateurs par des relais certifiés ou des entrées d\'arrêt de couple sûr (voir leçon 6). Testez-le à chaque modification du robot.'))
  ],
  terms: [['battery management system', 'système de gestion de batterie'], ['motor driver', 'variateur moteur'], ['MCU', 'MCU'], ['PLC', 'automate (API)'], ['CAN bus', 'bus CAN'], ['EtherCAT', 'EtherCAT'], ['EMC', 'CEM'], ['PWM', 'MLI (PWM)']],
  quiz: [
    ['A 12 V, 5 Ah battery powers a robot that draws 30 W on average. How long does it run, keeping 20 % in reserve?', 'Une batterie 12 V, 5 Ah alimente un robot qui consomme 30 W en moyenne. Combien de temps tient-il, en gardant 20 % de réserve ?', 'Energy 60 Wh × 0.8 = 48 Wh; 48 / 30 = 1.6 h.', 'Énergie 60 Wh × 0,8 = 48 Wh ; 48 / 30 = 1,6 h.'],
    ['Why is a higher supply voltage often chosen for powerful motors?', 'Pourquoi choisit-on souvent une tension d\'alimentation plus élevée pour des moteurs puissants ?', 'For the same power the current is lower, so thinner wires and less loss (R I²).', 'Pour la même puissance le courant est plus faible, donc des fils plus fins et moins de pertes (R I²).'],
    ['Which bus would you pick to link 12 synchronised servo drives?', 'Quel bus choisiriez-vous pour relier 12 servo-variateurs synchronisés ?', 'EtherCAT: fast, deterministic and synchronous.', 'EtherCAT : rapide, déterministe et synchrone.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Software and programming: ROS 2, simulators, robot languages', 'Logiciel et programmation : ROS 2, simulateurs, langages robots'],
  time: 14,
  goal: ['the software stack of a robot and how robots are programmed, from the teach pendant to ROS 2.', 'la pile logicielle d\'un robot et comment on programme les robots, de la console d\'apprentissage à ROS 2.'],
  body: [
    H4('5.1 Three worlds of programming', '5.1 Trois mondes de programmation'),
    TABLE([['World', 'Monde'], ['How', 'Comment'], ['Who', 'Qui'], ['Strength', 'Atout']], [
      [['<strong>Industrial robots</strong>', '<strong>Robots industriels</strong>'], ['Teach pendant (move the robot, record points) and the manufacturer\'s language; offline programming in a simulator.', 'Console d\'apprentissage (bouger le robot, enregistrer des points) et langage du constructeur ; programmation hors ligne dans un simulateur.'], ['Technicians, integrators.', 'Techniciens, intégrateurs.'], ['Robust, certified, fast to deploy for repeated tasks.', 'Robuste, certifié, rapide à déployer pour des tâches répétées.']],
      [['<strong>Cobots</strong>', '<strong>Cobots</strong>'], ['Hand-guiding, graphical blocks on a tablet, plus scripting.', 'Guidage manuel, blocs graphiques sur tablette, plus script.'], ['Operators, small companies.', 'Opérateurs, petites entreprises.'], ['No programmer needed for simple tasks.', 'Pas besoin de programmeur pour des tâches simples.']],
      [['<strong>Research and service robots</strong>', '<strong>Robots de recherche et de service</strong>'], ['ROS 2 with C++ and Python; open libraries.', 'ROS 2 avec C++ et Python ; bibliothèques ouvertes.'], ['Engineers, researchers.', 'Ingénieurs, chercheurs.'], ['Flexible, huge ecosystem (navigation, vision, MoveIt).', 'Flexible, énorme écosystème (navigation, vision, MoveIt).']]
    ]),
    P('The same joint move in the languages of four manufacturers (simplified syntax). The idea is the same: a target, a speed, a blending zone.',
      'Le même mouvement articulaire dans les langages de quatre constructeurs (syntaxe simplifiée). L\'idée est la même : une cible, une vitesse, une zone d\'arrondi.'),
    '<pre class="matrix">' + tx('Universal Robots (URScript)   movej(q1, a=1.4, v=1.05, r=0.02)\nABB (RAPID)                   MoveJ p1, v1000, z20, tool0;\nKUKA (KRL)                    PTP P1 C_PTP\nFANUC (TP)                    J P[1] 100% CNT20') + '</pre>',
    H4('5.2 ROS 2 in one page', '5.2 ROS 2 en une page'),
    P('<strong>ROS 2</strong> (Robot Operating System) is not an operating system but a <strong>middleware</strong> and a large set of libraries. A robot application is a graph of small programs called <strong>nodes</strong> that exchange data:',
      '<strong>ROS 2</strong> (Robot Operating System) n\'est pas un système d\'exploitation mais un <strong>intergiciel</strong> et un grand ensemble de bibliothèques. Une application robot est un graphe de petits programmes appelés <strong>nœuds</strong> qui échangent des données :'),
    TABLE([['Concept', 'Concept'], ['What it is', 'Ce que c\'est'], ['Example', 'Exemple']], [
      [['<strong>Topic</strong>', '<strong>Topic</strong>'], ['A named stream of messages, publish / subscribe.', 'Un flux nommé de messages, publication / abonnement.'], ['<code>/scan</code> (lidar), <code>/cmd_vel</code> (velocity command).', '<code>/scan</code> (lidar), <code>/cmd_vel</code> (commande de vitesse).']],
      [['<strong>Service</strong>', '<strong>Service</strong>'], ['A request and a reply (quick call).', 'Une requête et une réponse (appel rapide).'], ['“Reset the map”, “compute IK”.', '« Réinitialiser la carte », « calculer la CI ».']],
      [['<strong>Action</strong>', '<strong>Action</strong>'], ['A long task with feedback and cancellation.', 'Une tâche longue avec retour d\'état et annulation.'], ['“Navigate to this pose”, “execute this trajectory”.', '« Naviguer vers cette pose », « exécuter cette trajectoire ».']],
      [['<strong>tf2</strong>', '<strong>tf2</strong>'], ['The tree of coordinate frames over time (the frames of the modelling course).', 'L\'arbre des repères dans le temps (les repères du cours de modélisation).'], ['<code>map → odom → base_link → camera</code>.', '<code>map → odom → base_link → camera</code>.']],
      [['<strong>URDF / Xacro</strong>', '<strong>URDF / Xacro</strong>'], ['XML description of links, joints, masses and meshes.', 'Description XML des corps, articulations, masses et maillages.'], ['The model that RViz, the simulator and MoveIt read.', 'Le modèle que lisent RViz, le simulateur et MoveIt.']],
      [['<strong>ros2_control</strong>', '<strong>ros2_control</strong>'], ['Common interface between controllers and hardware drivers.', 'Interface commune entre contrôleurs et pilotes matériels.'], ['A joint trajectory controller on any arm.', 'Un contrôleur de trajectoire articulaire sur n\'importe quel bras.']],
      [['<strong>Launch files, parameters, bags</strong>', '<strong>Fichiers launch, paramètres, bags</strong>'], ['Start many nodes together; configure them; record and replay all topics.', 'Démarrer de nombreux nœuds ensemble ; les configurer ; enregistrer et rejouer tous les topics.'], ['<code>rosbag</code> for debugging and datasets.', '<code>rosbag</code> pour le débogage et les jeux de données.']]
    ]),
    P('Ready-made packages cover most of the previous courses: <strong>Nav2</strong> (navigation: costmaps, A*, controllers), <strong>SLAM Toolbox</strong> and Cartographer (mapping), <strong>MoveIt 2</strong> (motion planning for arms), <strong>OpenCV / PCL</strong> (vision, point clouds), <strong>robot_localization</strong> (Kalman fusion).',
      'Des paquets prêts à l\'emploi couvrent la plupart des cours précédents : <strong>Nav2</strong> (navigation : cartes de coûts, A*, contrôleurs), <strong>SLAM Toolbox</strong> et Cartographer (cartographie), <strong>MoveIt 2</strong> (planification de mouvement des bras), <strong>OpenCV / PCL</strong> (vision, nuages de points), <strong>robot_localization</strong> (fusion de Kalman).'),
    H4('5.3 Simulators and digital twins', '5.3 Simulateurs et jumeaux numériques'),
    TABLE([['Simulator', 'Simulateur'], ['Strength', 'Atout']], [
      [['Gazebo', 'Gazebo'], ['The classic ROS simulator; sensors, wheels, world files.', 'Le simulateur ROS classique ; capteurs, roues, fichiers de monde.']],
      [['MuJoCo, PyBullet, Isaac Sim / Isaac Lab', 'MuJoCo, PyBullet, Isaac Sim / Isaac Lab'], ['Fast and accurate contact physics; GPU-parallel training for reinforcement learning (see the AI course).', 'Physique de contact rapide et précise ; entraînement parallèle sur GPU pour l\'apprentissage par renforcement (voir le cours IA).']],
      [['Webots, CoppeliaSim', 'Webots, CoppeliaSim'], ['Easy to start; education and prototyping.', 'Faciles à démarrer ; enseignement et prototypage.']],
      [['RoboDK, Process Simulate, manufacturer tools', 'RoboDK, Process Simulate, outils des constructeurs'], ['Offline programming of industrial cells with real robot models and collision checking.', 'Programmation hors ligne de cellules industrielles avec de vrais modèles de robots et détection de collisions.']]
    ]),
    P('A <strong>digital twin</strong> keeps such a model in line with the real cell (same program, same layout) to test changes, estimate cycle times and train operators without stopping production. Remember the <strong>reality gap</strong>: a simulator always lacks some friction, flexibility or sensor noise; test on the real robot early.',
      'Un <strong>jumeau numérique</strong> maintient un tel modèle en cohérence avec la vraie cellule (même programme, même implantation) pour tester des changements, estimer des temps de cycle et former des opérateurs sans arrêter la production. N\'oubliez pas l\'<strong>écart avec la réalité</strong> : un simulateur manque toujours d\'un peu de frottement, de flexibilité ou de bruit de capteur ; testez tôt sur le vrai robot.'),
    H4('5.4 Good engineering habits', '5.4 Bonnes habitudes d\'ingénieur'),
    UL([
      ['<strong>Version control</strong> (git) for code, parameters and robot programs; <strong>backups</strong> of the controller.', '<strong>Gestion de versions</strong> (git) pour le code, les paramètres et les programmes robot ; <strong>sauvegardes</strong> du contrôleur.'],
      ['<strong>Test in layers</strong>: unit tests, simulation, hardware in the loop, then the real robot at low speed.', '<strong>Tester par couches</strong> : tests unitaires, simulation, matériel dans la boucle, puis le vrai robot à basse vitesse.'],
      ['<strong>Logs and monitoring</strong>: record everything; failures are rare and hard to reproduce.', '<strong>Journaux et supervision</strong> : tout enregistrer ; les pannes sont rares et difficiles à reproduire.'],
      ['<strong>Error handling</strong>: every action can fail; define what the robot does then (retry, stop safely, call for help).', '<strong>Gestion des erreurs</strong> : toute action peut échouer ; définir ce que fait le robot alors (réessayer, s\'arrêter en sécurité, appeler à l\'aide).'],
      ['<strong>Security</strong>: a networked robot is a computer: passwords, updates, closed ports (IEC 62443).', '<strong>Cybersécurité</strong> : un robot en réseau est un ordinateur : mots de passe, mises à jour, ports fermés (IEC 62443).']
    ])
  ],
  terms: [['teach pendant', 'console d\'apprentissage'], ['offline programming', 'programmation hors ligne'], ['ROS 2', 'ROS 2'], ['node / topic', 'nœud / topic'], ['tf2', 'tf2'], ['URDF', 'URDF'], ['digital twin', 'jumeau numérique'], ['reality gap', 'écart avec la réalité']],
  quiz: [
    ['In ROS 2, which mechanism fits “navigate to this pose, with progress and the option to cancel”?', 'Dans ROS 2, quel mécanisme convient à « naviguer vers cette pose, avec progression et possibilité d\'annuler » ?', 'An action.', 'Une action.'],
    ['What is a URDF file?', 'Qu\'est-ce qu\'un fichier URDF ?', 'An XML description of the links, joints, masses and shapes of a robot.', 'Une description XML des corps, articulations, masses et formes d\'un robot.'],
    ['Why test on the real robot early even if the simulation works?', 'Pourquoi tester tôt sur le vrai robot même si la simulation marche ?', 'Because of the reality gap: friction, flexibility, delays and noise are never perfectly simulated.', 'À cause de l\'écart avec la réalité : frottement, flexibilité, retards et bruit ne sont jamais parfaitement simulés.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['Safety and standards: working next to robots', 'Sécurité et normes : travailler à côté des robots'],
  time: 13,
  goal: ['the hazards of robots, the main standards, and the four ways of letting people and robots share a space.', 'les dangers des robots, les principales normes, et les quatre façons de faire partager un espace aux personnes et aux robots.'],
  body: [
    BOX('warn', ['Important', 'Important'],
      P('This lesson explains the ideas. A real installation needs a <strong>risk assessment</strong> by a competent person and compliance with the standards and laws of the country. Never rely on a course alone for safety decisions.',
        'Cette leçon explique les idées. Une vraie installation demande une <strong>analyse de risques</strong> par une personne compétente et la conformité aux normes et lois du pays. Ne vous fiez jamais à un cours seul pour des décisions de sécurité.')),
    H4('6.1 Where the danger comes from', '6.1 D\'où vient le danger'),
    UL([
      ['<strong>Impact</strong>: a 100 kg arm moving at 1.5 m/s has a kinetic energy ½ <i>m</i> <i>v</i>² of 112 J, enough to injure seriously.', '<strong>Choc</strong> : un bras de 100 kg qui se déplace à 1,5 m/s a une énergie cinétique ½ <i>m</i> <i>v</i>² de 112 J, assez pour blesser gravement.'],
      ['<strong>Crushing and trapping</strong> between the robot and a fixed object (quasi-static contact): the force does not stop at the first touch.', '<strong>Écrasement et coincement</strong> entre le robot et un objet fixe (contact quasi statique) : la force ne s\'arrête pas au premier contact.'],
      ['<strong>Tool hazards</strong>: sharp parts, hot welding torches, lasers, a gripper that releases its load, ejected parts.', '<strong>Dangers de l\'outil</strong> : pièces coupantes, torches de soudage brûlantes, lasers, pince qui lâche sa charge, pièces projetées.'],
      ['<strong>Unexpected motion</strong>: a software error, a restart, a singularity (!), a person entering during a maintenance step.', '<strong>Mouvement inattendu</strong> : une erreur logicielle, un redémarrage, une singularité (!), une personne qui entre pendant une étape de maintenance.'],
      ['<strong>Other</strong>: electrical, pneumatic and hydraulic energy, noise, cybersecurity.', '<strong>Autres</strong> : énergie électrique, pneumatique et hydraulique, bruit, cybersécurité.']
    ]),
    H4('6.2 The standards', '6.2 Les normes'),
    TABLE([['Standard', 'Norme'], ['Topic', 'Sujet']], [
      [['ISO 12100', 'ISO 12100'], ['General principles of risk assessment and risk reduction for machines.', 'Principes généraux d\'analyse et de réduction des risques pour les machines.']],
      [['ISO 10218-1 / -2', 'ISO 10218-1 / -2'], ['Safety of industrial robots: the robot itself (-1) and the robot system, integration and cell (-2).', 'Sécurité des robots industriels : le robot lui-même (-1) et le système robot, l\'intégration et la cellule (-2).']],
      [['ISO/TS 15066', 'ISO/TS 15066'], ['Collaborative robots: the four collaboration modes and the allowed contact forces and pressures.', 'Robots collaboratifs : les quatre modes de collaboration et les forces et pressions de contact admises.']],
      [['ISO 13849-1 / IEC 62061', 'ISO 13849-1 / IEC 62061'], ['Safety-related control systems: performance levels (PL a to e) and categories; SIL.', 'Systèmes de commande relatifs à la sécurité : niveaux de performance (PL a à e) et catégories ; SIL.']],
      [['ISO 13855 / 13857', 'ISO 13855 / 13857'], ['Positioning of safeguards according to approach speed; safety distances to prevent reaching.', 'Positionnement des protecteurs selon la vitesse d\'approche ; distances de sécurité pour empêcher d\'atteindre.']],
      [['ISO 3691-4, ISO 13482, IEC 61508, IEC 62443', 'ISO 3691-4, ISO 13482, IEC 61508, IEC 62443'], ['Driverless industrial trucks (AGV/AMR); personal care robots; functional safety; industrial cybersecurity.', 'Chariots industriels sans conducteur (AGV/AMR) ; robots de soins personnels ; sécurité fonctionnelle ; cybersécurité industrielle.']],
      [['EU Machinery rules, CE marking', 'Règles européennes sur les machines, marquage CE'], ['A robot cell sold or used in the EU must be CE-marked under the Machinery Directive (replaced by the Machinery Regulation from 2027); other regions have equivalents (ANSI/RIA R15.06 in the USA).', 'Une cellule robotisée vendue ou utilisée dans l\'UE doit porter le marquage CE selon la directive Machines (remplacée par le règlement Machines à partir de 2027) ; d\'autres régions ont des équivalents (ANSI/RIA R15.06 aux États-Unis).']]
    ]),
    H4('6.3 Four ways to share a space', '6.3 Quatre façons de partager un espace'),
    TABLE([['Mode (ISO/TS 15066)', 'Mode (ISO/TS 15066)'], ['How it works', 'Comment cela marche'], ['Example', 'Exemple']], [
      [['<strong>1. Safety-rated monitored stop</strong>', '<strong>1. Arrêt de sécurité contrôlé</strong>'], ['The robot stops when a person enters the zone and restarts when they leave; the power stays on.', 'Le robot s\'arrête quand une personne entre dans la zone et repart quand elle sort ; l\'énergie reste présente.'], ['An operator loads a part into a cell with a light curtain.', 'Un opérateur charge une pièce dans une cellule avec un rideau lumineux.']],
      [['<strong>2. Hand guiding</strong>', '<strong>2. Guidage manuel</strong>'], ['The person moves the robot with a handle and an enabling device, at a safe limited speed.', 'La personne déplace le robot avec une poignée et un dispositif de validation, à une vitesse limitée sûre.'], ['Teaching a path by hand.', 'Apprendre un chemin à la main.']],
      [['<strong>3. Speed and separation monitoring (SSM)</strong>', '<strong>3. Surveillance de vitesse et de distance (SSM)</strong>'], ['The robot slows down as a person comes closer and stops before contact; zones by a laser scanner or camera.', 'Le robot ralentit quand une personne s\'approche et s\'arrête avant le contact ; zones par scanner laser ou caméra.'], ['A fast robot in an open cell.', 'Un robot rapide dans une cellule ouverte.']],
      [['<strong>4. Power and force limiting (PFL)</strong>', '<strong>4. Limitation de puissance et de force (PFL)</strong>'], ['Contact is allowed: force, pressure and speed are limited to values that do not hurt, per body part.', 'Le contact est permis : force, pression et vitesse sont limitées à des valeurs qui ne blessent pas, par partie du corps.'], ['A cobot working next to people without a fence.', 'Un cobot qui travaille à côté de personnes sans clôture.']]
    ]),
    BOX('example', ['Worked example: the separation distance (mode 3)', 'Exemple résolu : la distance de séparation (mode 3)'],
      P('The robot must stop before a person reaches it. The minimum protective distance is the sum of: the distance a person walks while the system detects and stops (<i>S</i><sub>h</sub> = <i>K</i><sub>h</sub> · (<i>T</i><sub>r</sub> + <i>T</i><sub>s</sub>), with the human speed <i>K</i><sub>h</sub> = 1.6 m/s in ISO/TS 15066), the distance the robot travels while stopping, the detection uncertainty and a margin. With a total reaction and stopping time of 0.5 s, the person covers 1.6 × 0.5 = <strong>0.8 m</strong> before the robot stops: the scanner must trigger more than 0.8 m plus the robot stopping distance and margins away. A slower or faster-stopping robot allows a smaller separation.',
        'Le robot doit s\'arrêter avant qu\'une personne ne l\'atteigne. La distance de protection minimale est la somme de : la distance parcourue par une personne pendant que le système détecte et arrête (<i>S</i><sub>h</sub> = <i>K</i><sub>h</sub> · (<i>T</i><sub>r</sub> + <i>T</i><sub>s</sub>), avec la vitesse humaine <i>K</i><sub>h</sub> = 1,6 m/s dans l\'ISO/TS 15066), la distance parcourue par le robot pendant son arrêt, l\'incertitude de détection et une marge. Avec un temps total de réaction et d\'arrêt de 0,5 s, la personne parcourt 1,6 × 0,5 = <strong>0,8 m</strong> avant l\'arrêt du robot : le scanner doit se déclencher à plus de 0,8 m plus la distance d\'arrêt du robot et les marges. Un robot plus lent ou qui s\'arrête plus vite permet une séparation plus petite.')),
    H4('6.4 The protective devices', '6.4 Les dispositifs de protection'),
    UL([
      ['<strong>Fences and interlocked doors</strong>, <strong>light curtains</strong>, <strong>laser scanners</strong>, <strong>pressure mats</strong>, <strong>safety cameras</strong>.', '<strong>Clôtures et portes verrouillées</strong>, <strong>rideaux lumineux</strong>, <strong>scrutateurs laser</strong>, <strong>tapis sensibles</strong>, <strong>caméras de sécurité</strong>.'],
      ['<strong>Emergency stop</strong> (red mushroom button, yellow background): stop categories 0 (immediate power removal), 1 (controlled stop then power removal), 2 (controlled stop, power kept). <strong>Enabling switch</strong> (three-position) on the pendant.', '<strong>Arrêt d\'urgence</strong> (bouton coup-de-poing rouge sur fond jaune) : catégories d\'arrêt 0 (coupure immédiate de l\'énergie), 1 (arrêt contrôlé puis coupure), 2 (arrêt contrôlé, énergie maintenue). <strong>Bouton de validation</strong> (trois positions) sur la console.'],
      ['<strong>Safe functions in the drives</strong>: safe torque off (STO), safely limited speed (SLS), safe limited position, safe brake control. They are certified and independent of the standard software.', '<strong>Fonctions sûres dans les variateurs</strong> : arrêt de couple sûr (STO), vitesse limitée sûre (SLS), position limitée sûre, commande de frein sûre. Elles sont certifiées et indépendantes du logiciel standard.'],
      ['<strong>Operating modes</strong>: automatic, and manual reduced speed for teaching (limited to 250 mm/s at the tool in the “T1” mode).', '<strong>Modes de fonctionnement</strong> : automatique, et manuel à vitesse réduite pour l\'apprentissage (limité à 250 mm/s à l\'outil en mode « T1 »).']
    ])
  ],
  terms: [['risk assessment', 'analyse de risques'], ['ISO 10218', 'ISO 10218'], ['ISO/TS 15066', 'ISO/TS 15066'], ['performance level', 'niveau de performance'], ['speed and separation monitoring', 'surveillance de vitesse et de distance'], ['power and force limiting', 'limitation de puissance et de force'], ['safe torque off', 'arrêt de couple sûr'], ['emergency stop', 'arrêt d\'urgence']],
  quiz: [
    ['A person walks at 1.6 m/s. The system needs 0.7 s to detect and stop. How far does the person travel?', 'Une personne marche à 1,6 m/s. Le système a besoin de 0,7 s pour détecter et arrêter. Quelle distance la personne parcourt-elle ?', '1.6 × 0.7 = 1.12 m.', '1,6 × 0,7 = 1,12 m.'],
    ['Which collaboration mode allows contact with limited force and speed?', 'Quel mode de collaboration permet le contact avec une force et une vitesse limitées ?', 'Power and force limiting (PFL).', 'La limitation de puissance et de force (PFL).'],
    ['Why must an emergency stop not depend on the robot software?', 'Pourquoi un arrêt d\'urgence ne doit-il pas dépendre du logiciel du robot ?', 'Software can crash or be wrong exactly when the stop is needed; the stop must work through independent, certified hardware.', 'Le logiciel peut planter ou se tromper précisément quand l\'arrêt est nécessaire ; l\'arrêt doit fonctionner par un matériel indépendant et certifié.']
  ],
  link: ['cobot.html', 'How a cobot stays safe →', 'Comment un cobot reste sûr →']
})
  ];
}
