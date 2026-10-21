import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'world-';

export function partC() {
  return [
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Calibration, accuracy and testing', 'Étalonnage, exactitude et essais'],
  time: 12,
  goal: ['where robot errors come from, how they are measured, and how calibration reduces them.', 'd\'où viennent les erreurs d\'un robot, comment elles se mesurent, et comment l\'étalonnage les réduit.'],
  body: [
    H4('7.1 Sources of error', '7.1 Sources d\'erreur'),
    TABLE([['Type', 'Type'], ['Examples', 'Exemples'], ['Typical size', 'Ordre de grandeur']], [
      [['<strong>Geometric</strong>', '<strong>Géométriques</strong>'], ['Link lengths and joint offsets different from the model (manufacturing tolerances, assembly, a collision that bent a link), axes not exactly perpendicular.', 'Longueurs de corps et décalages d\'articulations différents du modèle (tolérances de fabrication, assemblage, une collision qui a plié un corps), axes pas exactement perpendiculaires.'], ['0.1 to 1 mm, the main cause', '0,1 à 1 mm, la cause principale']],
      [['<strong>Elastic</strong>', '<strong>Élastiques</strong>'], ['Deflection of links and gearboxes under the load and gravity (lesson 2).', 'Flexion des corps et des réducteurs sous la charge et la gravité (leçon 2).'], ['0.05 to 0.5 mm, depends on the pose and the payload', '0,05 à 0,5 mm, dépend de la pose et de la charge']],
      [['<strong>Backlash, friction</strong>', '<strong>Jeu, frottement</strong>'], ['Free play in gears, hysteresis, stick-slip.', 'Jeu des engrenages, hystérésis, stick-slip.'], ['0.01 to 0.1 mm', '0,01 à 0,1 mm']],
      [['<strong>Thermal</strong>', '<strong>Thermiques</strong>'], ['Expansion when the robot warms up (the first hour), room temperature.', 'Dilatation quand le robot chauffe (la première heure), température ambiante.'], ['0.05 to 0.3 mm', '0,05 à 0,3 mm']],
      [['<strong>Sensor and control</strong>', '<strong>Capteurs et commande</strong>'], ['Encoder quantisation and error, tracking error during motion, vibration.', 'Quantification et erreur des codeurs, erreur de suivi en mouvement, vibrations.'], ['0.01 to 0.2 mm']],
      [['<strong>Environment</strong>', '<strong>Environnement</strong>'], ['The workpiece position, the fixture, the tool wear, the calibration of the tool and base frames.', 'La position de la pièce, le montage, l\'usure de l\'outil, l\'étalonnage des repères outil et base.'], ['often the largest: 0.5 to several mm', 'souvent le plus grand : 0,5 à plusieurs mm']]
    ]),
    P('Joint errors reach the tool through the Jacobian (d<i>x</i> = <i>J</i> d<i>q</i>, singularities course): the longer the arm, the larger the effect. An error of 0.01° on the shoulder joint is 0.01 × π/180 = 1.75·10⁻⁴ rad; at 1 m this is <strong>0.17 mm</strong> at the tool. A well-conditioned pose keeps this amplification small.',
      'Les erreurs articulaires arrivent à l\'outil par la jacobienne (d<i>x</i> = <i>J</i> d<i>q</i>, cours sur les singularités) : plus le bras est long, plus l\'effet est grand. Une erreur de 0,01° sur l\'articulation de l\'épaule fait 0,01 × π/180 = 1,75·10⁻⁴ rad ; à 1 m cela fait <strong>0,17 mm</strong> à l\'outil. Une pose bien conditionnée garde cette amplification petite.'),
    H4('7.2 Kinds of calibration', '7.2 Types d\'étalonnage'),
    TABLE([['Calibration', 'Étalonnage'], ['What it finds', 'Ce qu\'il trouve'], ['How', 'Comment']], [
      [['<strong>Mastering / zeroing</strong>', '<strong>Calage / mise à zéro</strong>'], ['The encoder value at the reference pose of each joint.', 'La valeur du codeur à la pose de référence de chaque articulation.'], ['Put each axis on a mark or a pin, store the zero. Required after a motor or encoder change.', 'Mettre chaque axe sur un repère ou une goupille, mémoriser le zéro. Nécessaire après un changement de moteur ou de codeur.']],
      [['<strong>Kinematic calibration</strong>', '<strong>Étalonnage cinématique</strong>'], ['The true DH parameters (link lengths, offsets, twist angles).', 'Les vrais paramètres DH (longueurs, décalages, angles de torsion).'], ['Measure the tool position in many poses with a laser tracker or a touch probe; adjust the DH parameters by least squares until the model matches. Improves accuracy from about 1 mm to 0.2-0.3 mm.', 'Mesurer la position de l\'outil dans de nombreuses poses avec un laser de poursuite ou une sonde ; ajuster les paramètres DH par moindres carrés jusqu\'à ce que le modèle corresponde. Améliore l\'exactitude de 1 mm environ à 0,2-0,3 mm.']],
      [['<strong>Tool (TCP) and payload</strong>', '<strong>Outil (TCP) et charge</strong>'], ['The transform flange → tool and the mass data.', 'La transformation bride → outil et les données de masse.'], ['4-point method, load identification routine (lesson 3).', 'Méthode des 4 points, routine d\'identification de charge (leçon 3).']],
      [['<strong>Base / work object</strong>', '<strong>Base / repère pièce</strong>'], ['Where the table or the fixture is in the robot base frame.', 'Où se trouve la table ou le montage dans le repère de base du robot.'], ['Touch three points (origin, a point on <i>x</i>, a point in the <i>xy</i> plane) with the tool.', 'Toucher trois points (origine, un point sur <i>x</i>, un point dans le plan <i>xy</i>) avec l\'outil.']],
      [['<strong>Camera</strong>', '<strong>Caméra</strong>'], ['Intrinsics and hand-eye transform.', 'Intrinsèques et transformation œil-main.'], ['Checkerboard and marker views (perception course).', 'Vues d\'un damier et de repères (cours perception).']],
      [['<strong>Dynamic identification</strong>', '<strong>Identification dynamique</strong>'], ['Masses, centres of mass, friction.', 'Masses, centres de masse, frottements.'], ['Excitation trajectories and least squares (control course).', 'Trajectoires d\'excitation et moindres carrés (cours de commande).']]
    ]),
    BOX('keep', ['Accuracy versus repeatability, again', 'Exactitude contre répétabilité, encore'],
      P('<strong>Calibration improves accuracy, not repeatability.</strong> A robot that is repeatable to ±0.03 mm but 1 mm inaccurate can be taught points by hand and will return to them precisely (teach and repeat). It needs calibration when points come from a CAD model, a vision system, or when a robot is replaced: the program is then sent to a robot with different errors.',
        '<strong>L\'étalonnage améliore l\'exactitude, pas la répétabilité.</strong> Un robot répétable à ±0,03 mm mais inexact de 1 mm peut apprendre des points à la main et y reviendra précisément (apprentissage et répétition). Il a besoin d\'étalonnage quand les points viennent d\'un modèle CAO, d\'un système de vision, ou quand un robot est remplacé : le programme est alors envoyé à un robot qui a d\'autres erreurs.')),
    H4('7.3 Testing: ISO 9283', '7.3 Essais : ISO 9283'),
    P('The standard ISO 9283 defines how to measure a robot so that data sheets can be compared: the robot goes to the same pose many times (typically 30 cycles) from different directions, and a measuring instrument records where the tool really goes.',
      'La norme ISO 9283 définit comment mesurer un robot pour que les fiches techniques soient comparables : le robot va de nombreuses fois à la même pose (typiquement 30 cycles) depuis des directions différentes, et un instrument de mesure enregistre où va réellement l\'outil.'),
    TABLE([['Measure', 'Mesure'], ['What it says', 'Ce que cela dit']], [
      [['Pose accuracy (AP)', 'Exactitude de pose (AP)'], ['Distance between the commanded pose and the mean of the reached poses.', 'Distance entre la pose commandée et la moyenne des poses atteintes.']],
      [['Pose repeatability (RP)', 'Répétabilité de pose (RP)'], ['Spread of the reached poses around their mean (a sphere that contains them).', 'Dispersion des poses atteintes autour de leur moyenne (une sphère qui les contient).']],
      [['Path accuracy and repeatability (AT, RT)', 'Exactitude et répétabilité de trajectoire (AT, RT)'], ['The same along a programmed line or circle, at a given speed.', 'La même chose le long d\'une ligne ou d\'un cercle programmés, à une vitesse donnée.']],
      [['Settling time, overshoot', 'Temps d\'établissement, dépassement'], ['How long the tool takes to stabilise at the target.', 'Le temps que met l\'outil pour se stabiliser sur la cible.']]
    ]),
    BOX('example', ['Commissioning checklist', 'Liste de mise en service'],
      OL([
        ['Mount the robot rigidly; check the levelling and the fixings.', 'Fixer le robot rigidement ; vérifier la mise à niveau et les fixations.'],
        ['Check the mastering, the payload and the tool frame (TCP).', 'Vérifier le calage, la charge et le repère outil (TCP).'],
        ['Warm the robot up (one hour of motion) before accuracy-critical work.', 'Faire chauffer le robot (une heure de mouvement) avant un travail critique en exactitude.'],
        ['Run at low speed first, then increase; watch the motor currents.', 'Commencer à basse vitesse, puis augmenter ; surveiller les courants moteur.'],
        ['Test the safety functions (emergency stop, doors, scanners) and record the results.', 'Tester les fonctions de sécurité (arrêt d\'urgence, portes, scrutateurs) et noter les résultats.'],
        ['Back up the program and the parameters.', 'Sauvegarder le programme et les paramètres.']
      ]))
  ],
  terms: [['geometric error', 'erreur géométrique'], ['kinematic calibration', 'étalonnage cinématique'], ['mastering', 'calage'], ['laser tracker', 'laser de poursuite'], ['work object', 'repère pièce'], ['ISO 9283', 'ISO 9283'], ['warm-up', 'mise en température'], ['teach and repeat', 'apprentissage et répétition']],
  quiz: [
    ['The shoulder encoder is wrong by 0.02°. The tool is 1.2 m away. What is the error at the tool?', 'L\'encodeur de l\'épaule est faux de 0,02°. L\'outil est à 1,2 m. Quelle est l\'erreur à l\'outil ?', '0.02° = 3.5·10⁻⁴ rad; × 1.2 m = 0.42 mm.', '0,02° = 3,5·10⁻⁴ rad ; × 1,2 m = 0,42 mm.'],
    ['A robot has been taught its points by hand. Does it need kinematic calibration?', 'Un robot a appris ses points à la main. A-t-il besoin d\'un étalonnage cinématique ?', 'Not necessarily: repeatability is enough to return to taught points. Calibration matters when points come from CAD or vision, or the robot is replaced.', 'Pas forcément : la répétabilité suffit pour revenir aux points appris. L\'étalonnage compte quand les points viennent de la CAO ou de la vision, ou quand le robot est remplacé.'],
    ['Why warm a robot up before a precise task?', 'Pourquoi chauffer un robot avant une tâche précise ?', 'Thermal expansion of links and lubricant changes the geometry in the first hour; a warm robot is more stable.', 'La dilatation thermique des corps et la lubrification changent la géométrie la première heure ; un robot chaud est plus stable.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['Applications and choosing a robot for a job', 'Applications et choix d\'un robot pour un travail'],
  time: 13,
  goal: ['where robots are used and a method to choose the right robot, gripper and cell for a task.', 'où les robots sont utilisés et une méthode pour choisir le bon robot, la bonne pince et la bonne cellule pour une tâche.'],
  body: [
    TABLE([['Sector', 'Secteur'], ['Typical jobs', 'Travaux typiques'], ['Typical robots', 'Robots typiques']], [
      [['Automotive', 'Automobile'], ['Spot and arc welding, painting, sealing, handling heavy parts, assembly.', 'Soudage par points et à l\'arc, peinture, application de joints, manutention de pièces lourdes, assemblage.'], ['Large 6-axis robots (100-500 kg payload).', 'Grands robots 6 axes (100-500 kg de charge).']],
      [['Electronics', 'Électronique'], ['Fast placement, screwing, testing, wafer handling.', 'Placement rapide, vissage, test, manutention de tranches.'], ['SCARA, delta, small 6-axis, cleanroom robots.', 'SCARA, delta, petits 6 axes, robots de salle blanche.']],
      [['Logistics and warehouses', 'Logistique et entrepôts'], ['Palletising, picking, sorting, moving goods.', 'Palettisation, prélèvement, tri, déplacement de marchandises.'], ['Palletising arms, suction-gripper arms, AMR, shuttles.', 'Bras de palettisation, bras à ventouses, AMR, navettes.']],
      [['Food and packaging', 'Agroalimentaire et emballage'], ['Pick and place of products, packing, cutting, decorating.', 'Prise-dépose de produits, emballage, découpe, décoration.'], ['Delta robots, washdown arms, soft grippers.', 'Robots delta, bras lavables, pinces souples.']],
      [['Pharma and laboratories', 'Pharma et laboratoires'], ['Handling samples, pipetting, sterile filling.', 'Manipulation d\'échantillons, pipetage, remplissage stérile.'], ['Small arms, gantries, isolator robots.', 'Petits bras, portiques, robots d\'isolateur.']],
      [['Agriculture', 'Agriculture'], ['Harvesting, weeding, milking, spraying.', 'Récolte, désherbage, traite, pulvérisation.'], ['Mobile manipulators, field robots, drones.', 'Manipulateurs mobiles, robots de plein champ, drones.']],
      [['Construction and mining', 'Construction et mines'], ['Bricklaying, drilling, surveying, 3D printing of buildings, remote machines.', 'Briquetage, perçage, relevés, impression 3D de bâtiments, engins télécommandés.'], ['Large gantries, legged robots, excavators.', 'Grands portiques, robots à pattes, excavatrices.']],
      [['Health care', 'Santé'], ['Surgery, rehabilitation, hospital logistics, disinfection.', 'Chirurgie, rééducation, logistique hospitalière, désinfection.'], ['Surgical robots, exoskeletons, AMR, UV robots.', 'Robots chirurgicaux, exosquelettes, AMR, robots UV.']],
      [['Inspection, energy and space', 'Inspection, énergie et espace'], ['Pipes, tanks, wind turbines, nuclear sites, satellites, planets.', 'Tuyaux, cuves, éoliennes, sites nucléaires, satellites, planètes.'], ['Crawlers, drones, legged and underwater robots, rovers.', 'Rampants, drones, robots à pattes et sous-marins, rovers.']],
      [['Home, service and education', 'Maison, service et éducation'], ['Vacuuming, lawn mowing, reception, delivery, teaching programming.', 'Aspiration, tonte, accueil, livraison, enseignement de la programmation.'], ['Mobile robots, small arms, educational kits.', 'Robots mobiles, petits bras, kits éducatifs.']]
    ]),
    H4('8.1 A method to choose', '8.1 Une méthode pour choisir'),
    OL([
      ['<strong>Define the task</strong> in numbers: what is handled (mass, size, material, variety), how many per hour, what precision, what environment (dust, water, temperature, cleanroom, explosive atmosphere).', '<strong>Définir la tâche</strong> en chiffres : ce qui est manipulé (masse, taille, matériau, variété), combien par heure, quelle précision, quel environnement (poussière, eau, température, salle blanche, atmosphère explosive).'],
      ['<strong>Choose the kinematics</strong>: 4 DOF pick and place on a plane → SCARA or delta; a box-shaped workspace → Cartesian gantry; any pose in space → 6-axis arm; moving across a site → mobile robot or mobile manipulator.', '<strong>Choisir la cinématique</strong> : prise-dépose à 4 DDL sur un plan → SCARA ou delta ; espace de travail en forme de boîte → portique cartésien ; n\'importe quelle pose dans l\'espace → bras 6 axes ; déplacement sur un site → robot mobile ou manipulateur mobile.'],
      ['<strong>Check the numbers</strong>: payload (with gripper and a 30 % margin), reach (with the whole workspace inside it and away from singularities), repeatability (about one third of the tolerance), cycle time (estimate it; see below).', '<strong>Vérifier les chiffres</strong> : charge (avec la pince et 30 % de marge), portée (avec tout l\'espace de travail à l\'intérieur et loin des singularités), répétabilité (environ un tiers de la tolérance), temps de cycle (l\'estimer ; voir ci-dessous).'],
      ['<strong>Decide the safety concept</strong>: fenced, light curtain, scanner, or collaborative (lesson 6). A cobot is slower: check that the cycle time is still enough.', '<strong>Décider du concept de sécurité</strong> : clôturé, rideau lumineux, scrutateur, ou collaboratif (leçon 6). Un cobot est plus lent : vérifier que le temps de cycle suffit encore.'],
      ['<strong>Plan the whole cell</strong>: gripper, feeding of parts, fixtures, vision, PLC and software, safety, guarding, maintenance access.', '<strong>Planifier toute la cellule</strong> : pince, alimentation en pièces, montages, vision, automate et logiciel, sécurité, protections, accès de maintenance.'],
      ['<strong>Simulate</strong> the cell (reachability, collisions, cycle time) and <strong>test the risky step</strong> (the grasp, the vision) on a prototype before ordering.', '<strong>Simuler</strong> la cellule (accessibilité, collisions, temps de cycle) et <strong>tester l\'étape risquée</strong> (la prise, la vision) sur un prototype avant de commander.']
    ]),
    H4('8.2 Estimating the cycle time', '8.2 Estimer le temps de cycle'),
    P('Add the moves, the gripper actions and the waiting: a pick and place cycle is roughly 2 × (approach + grasp or release + retract) + transfer. A fast pick and place of 0.5 m with accelerations of 10 m/s²: time for a move with a triangle profile = 2 √(<i>d</i>/<i>a</i>) = 2 √(0.5/10) ≈ 0.45 s.',
      'Additionnez les mouvements, les actions de la pince et les attentes : un cycle de prise-dépose vaut à peu près 2 × (approche + saisie ou relâche + retrait) + transfert. Un prise-dépose rapide de 0,5 m avec des accélérations de 10 m/s² : temps d\'un mouvement avec un profil triangulaire = 2 √(<i>d</i>/<i>a</i>) = 2 √(0,5/10) ≈ 0,45 s.'),
    BOX('example', ['Worked example: payback of a robot cell', 'Exemple résolu : retour sur investissement d\'une cellule robotisée'],
      UL([
        ['A palletising cell must handle 600 boxes per hour: a cycle of 3600 / 600 = <strong>6 s</strong> per box (2 boxes at a time would give 12 s per gripper cycle).', 'Une cellule de palettisation doit traiter 600 cartons par heure : un cycle de 3600 / 600 = <strong>6 s</strong> par carton (2 cartons à la fois donneraient 12 s par cycle de pince).'],
        ['Cost: robot 40 000 €, gripper, safety, conveyors and integration 80 000 €, total <strong>120 000 €</strong>. Rule of thumb: the integration costs 1.5 to 3 times the robot.', 'Coût : robot 40 000 €, pince, sécurité, convoyeurs et intégration 80 000 €, total <strong>120 000 €</strong>. Règle empirique : l\'intégration coûte 1,5 à 3 fois le robot.'],
        ['Savings: two operators on two shifts replaced, 60 000 € per year, minus 6 000 € of maintenance: 54 000 € per year.', 'Économies : deux opérateurs sur deux postes remplacés, 60 000 € par an, moins 6 000 € de maintenance : 54 000 € par an.'],
        ['<strong>Payback</strong> = 120 000 / 54 000 ≈ <strong>2.2 years</strong>. Include the non-financial gains: fewer injuries, constant quality, availability.', '<strong>Retour sur investissement</strong> = 120 000 / 54 000 ≈ <strong>2,2 ans</strong>. Inclure les gains non financiers : moins de blessures, qualité constante, disponibilité.']
      ])),
    H4('8.3 Why robot projects fail', '8.3 Pourquoi les projets de robots échouent'),
    UL([
      ['The <strong>gripper or the feeding</strong> of parts was not tested with real, variable parts.', 'La <strong>pince ou l\'alimentation</strong> en pièces n\'a pas été testée avec de vraies pièces variables.'],
      ['The <strong>variety</strong> was underestimated: the robot is good at the same task a million times, bad at everything that changes.', 'La <strong>variété</strong> a été sous-estimée : le robot est bon pour la même tâche un million de fois, mauvais pour tout ce qui change.'],
      ['<strong>Integration and software</strong> cost more than the robot, and nobody planned the maintenance or the training.', 'L\'<strong>intégration et le logiciel</strong> coûtent plus que le robot, et personne n\'a prévu la maintenance ni la formation.'],
      ['The <strong>process</strong> was not ready for automation: a robot automates a good process, it does not repair a bad one.', 'Le <strong>procédé</strong> n\'était pas prêt pour l\'automatisation : un robot automatise un bon procédé, il ne répare pas un mauvais.'],
      ['The <strong>safety study</strong> was done too late, forcing a redesign.', 'L\'<strong>étude de sécurité</strong> a été faite trop tard, forçant une refonte.']
    ])
  ],
  terms: [['cycle time', 'temps de cycle'], ['palletising', 'palettisation'], ['systems integrator', 'intégrateur'], ['payback', 'retour sur investissement'], ['total cost of ownership', 'coût total de possession'], ['mobile manipulator', 'manipulateur mobile'], ['feeding', 'alimentation en pièces']],
  quiz: [
    ['A line needs 900 parts per hour. What cycle time per part?', 'Une ligne demande 900 pièces par heure. Quel temps de cycle par pièce ?', '3600 / 900 = 4 s.', '3600 / 900 = 4 s.'],
    ['A cell costs 90 000 € and saves 36 000 € per year. What is the payback time?', 'Une cellule coûte 90 000 € et économise 36 000 € par an. Quel est le temps de retour ?', '90 000 / 36 000 = 2.5 years.', '90 000 / 36 000 = 2,5 ans.'],
    ['Which robot kinematics would you choose for very fast 4-DOF pick and place of light products on a conveyor?', 'Quelle cinématique de robot choisiriez-vous pour du prise-dépose à 4 DDL très rapide de produits légers sur un convoyeur ?', 'A delta robot (or a SCARA): light, fast moving parts and a small dome-shaped workspace.', 'Un robot delta (ou un SCARA) : pièces mobiles légères et rapides, et un petit espace de travail en forme de dôme.']
  ],
  link: ['delta.html', 'Where a Delta robot is used →', 'Où un robot Delta est utilisé →']
}),
// ------------------------------------------------------------------------------------------------ 9
lesson(PRE, 9, {
  title: ['Your path: projects, tools, books and careers', 'Votre chemin : projets, outils, livres et métiers'],
  time: 12,
  goal: ['a roadmap from zero to hero: what to build, what to read, and which jobs it leads to.', 'une feuille de route de zéro à héros : quoi construire, quoi lire, et vers quels métiers cela mène.'],
  body: [
    H4('9.1 The map of the field', '9.1 La carte du domaine'),
    TABLE([['Level', 'Niveau'], ['What you can do', 'Ce que vous savez faire'], ['Where to learn it here', 'Où l\'apprendre ici']], [
      [['<strong>0 · Curious</strong>', '<strong>0 · Curieux</strong>'], ['Name the parts of a robot and what they do.', 'Nommer les parties d\'un robot et leur rôle.'], ['Foundations (12 lessons)', 'Les fondations (12 leçons)']],
      [['<strong>1 · Beginner</strong>', '<strong>1 · Débutant</strong>'], ['Compute where a 2-axis arm is and which angles reach a point.', 'Calculer où est un bras à 2 axes et quels angles atteignent un point.'], ['Maths and motion (8 lessons) + the robot pages', 'Maths et mouvement (8 leçons) + les pages des robots']],
      [['<strong>2 · Intermediate</strong>', '<strong>2 · Intermédiaire</strong>'], ['Model any serial robot (DH, MGD, MGI, Jacobian) and trajectories.', 'Modéliser n\'importe quel robot série (DH, MGD, MGI, jacobienne) et les trajectoires.'], ['Robot modelling (11 lessons)', 'Modélisation d\'un robot (11 leçons)']],
      [['<strong>3 · Advanced</strong>', '<strong>3 · Avancé</strong>'], ['Handle singularities, redundancy; model dynamics and tune control; choose motors.', 'Gérer les singularités, la redondance ; modéliser la dynamique et régler la commande ; choisir des moteurs.'], ['Singularities and the Jacobian; Dynamics, actuators and control', 'Singularités et jacobienne ; Dynamique, actionneurs et commande']],
      [['<strong>4 · Expert</strong>', '<strong>4 · Expert</strong>'], ['Build autonomy: perception, estimation, SLAM, planning, learning.', 'Construire de l\'autonomie : perception, estimation, SLAM, planification, apprentissage.'], ['Perception, planning and AI', 'Perception, planification et IA']],
      [['<strong>5 · Hero</strong>', '<strong>5 · Héros</strong>'], ['Deliver a real, safe, calibrated robot system for an application.', 'Livrer un système robotique réel, sûr et étalonné pour une application.'], ['Robots in the real world + your own projects', 'Les robots dans le monde réel + vos propres projets']]
    ]),
    H4('9.2 A ladder of projects', '9.2 Une échelle de projets'),
    OL([
      ['<strong>Servo arm</strong> (Arduino + 3 hobby servos): write the forward and inverse kinematics of a 2-3 axis arm and make it draw.', '<strong>Bras à servos</strong> (Arduino + 3 servos de loisir) : écrire la cinématique directe et inverse d\'un bras à 2-3 axes et le faire dessiner.'],
      ['<strong>Line follower</strong> or <strong>balancing robot</strong>: your first PID, sensors and motor drivers.', '<strong>Suiveur de ligne</strong> ou <strong>robot équilibriste</strong> : votre premier PID, capteurs et variateurs de moteurs.'],
      ['<strong>Differential-drive rover</strong> with encoders and an IMU: odometry, then a Kalman filter.', '<strong>Rover à entraînement différentiel</strong> avec codeurs et centrale inertielle : odométrie, puis filtre de Kalman.'],
      ['<strong>ROS 2 in simulation</strong>: a TurtleBot in Gazebo with SLAM Toolbox and Nav2; then the same on a real robot with a cheap lidar.', '<strong>ROS 2 en simulation</strong> : un TurtleBot dans Gazebo avec SLAM Toolbox et Nav2 ; puis la même chose sur un vrai robot avec un lidar bon marché.'],
      ['<strong>Pick and place</strong>: a 5-6 axis arm (or a simulated UR5) with MoveIt, a camera and ArUco markers, hand-eye calibration included.', '<strong>Prise-dépose</strong> : un bras 5-6 axes (ou un UR5 simulé) avec MoveIt, une caméra et des repères ArUco, étalonnage œil-main compris.'],
      ['<strong>Learning</strong>: train a policy in simulation (MuJoCo / Isaac Lab) and test it on a small real robot; or learn from demonstrations.', '<strong>Apprentissage</strong> : entraîner une politique en simulation (MuJoCo / Isaac Lab) et la tester sur un petit robot réel ; ou apprendre à partir de démonstrations.'],
      ['<strong>A complete system</strong>: a mobile manipulator or a dual-arm cell with a safety concept, a risk assessment and documentation. This is the “hero” project.', '<strong>Un système complet</strong> : un manipulateur mobile ou une cellule à deux bras avec un concept de sécurité, une analyse de risques et de la documentation. C\'est le projet « héros ».']
    ]),
    H4('9.3 Competitions and communities', '9.3 Compétitions et communautés'),
    UL([
      ['Student and youth: <strong>FIRST Robotics</strong>, <strong>RoboCup</strong> and RoboCup Junior, <strong>World Robot Olympiad</strong>, <strong>Eurobot</strong>, <strong>VEX</strong>.', 'Étudiants et jeunes : <strong>FIRST Robotics</strong>, <strong>RoboCup</strong> et RoboCup Junior, <strong>World Robot Olympiad</strong>, <strong>Eurobot</strong>, <strong>VEX</strong>.'],
      ['Research challenges: <strong>DARPA</strong> challenges, <strong>ICRA / IROS</strong> competitions, <strong>Amazon</strong> picking, <strong>RoboMaster</strong>, autonomous racing.', 'Défis de recherche : défis <strong>DARPA</strong>, compétitions <strong>ICRA / IROS</strong>, prélèvement <strong>Amazon</strong>, <strong>RoboMaster</strong>, courses autonomes.'],
      ['Communities: ROS Discourse, open-source robots, local makerspaces, university labs and clubs.', 'Communautés : ROS Discourse, robots open source, fablabs locaux, laboratoires et clubs universitaires.']
    ]),
    H4('9.4 Reading list', '9.4 Liste de lecture'),
    TABLE([['Book', 'Livre'], ['Why', 'Pourquoi']], [
      [['K. Lynch and F. Park, <em>Modern Robotics</em> (free online)', 'K. Lynch et F. Park, <em>Modern Robotics</em> (gratuit en ligne)'], ['Modern, geometric, with videos and code.', 'Moderne, géométrique, avec vidéos et code.']],
      [['B. Siciliano et al., <em>Robotics: Modelling, Planning and Control</em>', 'B. Siciliano et al., <em>Robotics: Modelling, Planning and Control</em>'], ['The standard graduate textbook.', 'Le manuel de référence de niveau master.']],
      [['J. Craig, <em>Introduction to Robotics: Mechanics and Control</em>', 'J. Craig, <em>Introduction to Robotics: Mechanics and Control</em>'], ['Classic and clear; origin of the standard DH convention used here.', 'Classique et clair ; origine de la convention DH standard utilisée ici.']],
      [['W. Khalil and E. Dombre, <em>Modeling, Identification and Control of Robots</em>', 'W. Khalil et E. Dombre, <em>Modeling, Identification and Control of Robots</em>'], ['The modified DH (DHm) and the French school used in the modelling course.', 'Le DH modifié (DHm) et l\'école française utilisée dans le cours de modélisation.']],
      [['P. Corke, <em>Robotics, Vision and Control</em>', 'P. Corke, <em>Robotics, Vision and Control</em>'], ['Code-driven, includes vision.', 'Orienté code, inclut la vision.']],
      [['S. Thrun et al., <em>Probabilistic Robotics</em>', 'S. Thrun et al., <em>Probabilistic Robotics</em>'], ['Filters, localisation, SLAM.', 'Filtres, localisation, SLAM.']],
      [['S. LaValle, <em>Planning Algorithms</em> (free online)', 'S. LaValle, <em>Planning Algorithms</em> (gratuit en ligne)'], ['Motion planning in depth.', 'La planification de mouvement en profondeur.']],
      [['R. Murray, Z. Li and S. Sastry, <em>A Mathematical Introduction to Robotic Manipulation</em>', 'R. Murray, Z. Li et S. Sastry, <em>A Mathematical Introduction to Robotic Manipulation</em>'], ['Screw theory and grasping, for the mathematically inclined.', 'Théorie des torseurs et préhension, pour les matheux.']]
    ]),
    H4('9.5 Careers', '9.5 Métiers'),
    TABLE([['Role', 'Métier'], ['What you do', 'Ce que vous faites'], ['Skills used', 'Compétences utilisées']], [
      [['Mechanical / mechatronics engineer', 'Ingénieur mécanique / mécatronique'], ['Design arms, grippers, gearboxes, structures.', 'Concevoir bras, pinces, réducteurs, structures.'], ['Lessons 2 and 3 of this course, CAD, materials, kinematics.', 'Leçons 2 et 3 de ce cours, CAO, matériaux, cinématique.']],
      [['Electronics / embedded engineer', 'Ingénieur électronique / systèmes embarqués'], ['Design drivers, boards, firmware, buses.', 'Concevoir variateurs, cartes, firmware, bus.'], ['Motors, control, real time, EMC.', 'Moteurs, commande, temps réel, CEM.']],
      [['Controls engineer', 'Ingénieur automatique / commande'], ['Tune and design the control laws, identify models.', 'Régler et concevoir les lois de commande, identifier des modèles.'], ['Dynamics, control and actuators course.', 'Cours dynamique, actionneurs et commande.']],
      [['Robotics software / perception / AI engineer', 'Ingénieur logiciel robotique / perception / IA'], ['Navigation, vision, planning, learning, ROS 2.', 'Navigation, vision, planification, apprentissage, ROS 2.'], ['Perception, planning and AI course; C++ and Python.', 'Cours perception, planification et IA ; C++ et Python.']],
      [['Systems integrator / application engineer', 'Intégrateur / ingénieur d\'application'], ['Design and commission robot cells for customers.', 'Concevoir et mettre en service des cellules robotisées pour des clients.'], ['The whole last course, safety, PLC, programming.', 'Tout le dernier cours, sécurité, automate, programmation.']],
      [['Safety engineer, field service, researcher, teacher, entrepreneur', 'Ingénieur sécurité, SAV terrain, chercheur, enseignant, entrepreneur'], ['Certify, maintain, invent, teach, create a company.', 'Certifier, maintenir, inventer, enseigner, créer une entreprise.'], ['All of the above, plus communication.', 'Tout ce qui précède, plus la communication.']]
    ]),
    BOX('keep', ['Final advice', 'Conseils pour finir'],
      UL([
        ['<strong>Build things.</strong> A robot that wobbles on your table teaches more than ten chapters.', '<strong>Construisez des choses.</strong> Un robot qui tremble sur votre table apprend plus que dix chapitres.'],
        ['<strong>Simulate first, then test early on hardware</strong>, and keep a log of what failed.', '<strong>Simulez d\'abord, puis testez tôt sur le matériel</strong>, et tenez un journal de ce qui a échoué.'],
        ['<strong>Learn the maths and the hardware.</strong> The best roboticists can move between the equation, the code and the screwdriver.', '<strong>Apprenez les maths et le matériel.</strong> Les meilleurs roboticiens passent sans mal de l\'équation au code et au tournevis.'],
        ['<strong>Respect safety.</strong> Every robot you build can hurt someone; think about it from the first sketch.', '<strong>Respectez la sécurité.</strong> Tout robot que vous construisez peut blesser quelqu\'un ; pensez-y dès le premier croquis.']
      ]))
  ],
  terms: [['project ladder', 'échelle de projets'], ['hero project', 'projet héros'], ['RoboCup', 'RoboCup'], ['open source', 'open source'], ['systems integrator', 'intégrateur'], ['mechatronics', 'mécatronique']],
  quiz: [
    ['Which project teaches you PID, sensors and motor drivers at the same time?', 'Quel projet vous apprend en même temps le PID, les capteurs et les variateurs de moteurs ?', 'A line-follower or a balancing robot.', 'Un suiveur de ligne ou un robot équilibriste.'],
    ['Which two courses of this site would you follow before building a pick and place with a camera?', 'Quels deux cours de ce site suivriez-vous avant de construire un prise-dépose avec caméra ?', 'Robot modelling (kinematics) and Perception, planning and AI (vision, hand-eye calibration, motion planning).', 'Modélisation d\'un robot (cinématique) et Perception, planification et IA (vision, étalonnage œil-main, planification de mouvement).'],
    ['Name three jobs in robotics that are not “software developer”.', 'Citez trois métiers de la robotique qui ne sont pas « développeur logiciel ».', 'For example mechatronics engineer, controls engineer, systems integrator, safety engineer, field service technician.', 'Par exemple ingénieur mécatronique, ingénieur automatique, intégrateur, ingénieur sécurité, technicien SAV terrain.']
  ]
})
  ];
}
