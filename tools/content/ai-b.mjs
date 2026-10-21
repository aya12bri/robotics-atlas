import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'ai-';

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Localisation and mapping: odometry and SLAM', 'Localisation et cartographie : odométrie et SLAM'],
  time: 13,
  goal: ['how a mobile robot tracks its position, builds a map, and corrects drift by recognising places.', 'comment un robot mobile suit sa position, construit une carte, et corrige la dérive en reconnaissant des lieux.'],
  body: [
    H4('4.1 Odometry and its drift', '4.1 Odométrie et dérive'),
    P('A differential-drive robot (see the mobile robot page) integrates the wheel increments to update its pose (<i>x</i>, <i>y</i>, <i>θ</i>). Every small error accumulates and never goes away:',
      'Un robot à entraînement différentiel (voir la page du robot mobile) intègre les incréments des roues pour mettre à jour sa pose (<i>x</i>, <i>y</i>, <i>θ</i>). Chaque petite erreur s\'accumule et ne disparaît jamais :'),
    UL([
      ['A <strong>distance</strong> error of 1 % means 1 m of error after 100 m.', 'Une erreur de <strong>distance</strong> de 1 % donne 1 m d\'erreur après 100 m.'],
      ['A <strong>heading</strong> error of 1° gives a sideways error of 50 m × tan 1° ≈ 0.87 m after 50 m. Heading errors are the worst, because they rotate the whole future path.', 'Une erreur de <strong>cap</strong> de 1° donne une erreur latérale de 50 m × tan 1° ≈ 0,87 m après 50 m. Les erreurs de cap sont les pires, car elles font tourner tout le chemin futur.'],
      ['Wheel slip, uneven floors and wheel-diameter errors cause these errors. See the wheels page.', 'Le glissement des roues, les sols irréguliers et les erreurs de diamètre des roues causent ces erreurs. Voir la page des roues.']
    ]),
    H4('4.2 Maps', '4.2 Les cartes'),
    TABLE([['Map', 'Carte'], ['What it stores', 'Ce qu\'elle contient'], ['Use', 'Usage']], [
      [['Occupancy grid', 'Grille d\'occupation'], ['A 2D (or 3D) grid, each cell free, occupied or unknown, with a probability.', 'Une grille 2D (ou 3D), chaque cellule libre, occupée ou inconnue, avec une probabilité.'], ['Navigation of mobile robots (the usual 2D map).', 'Navigation des robots mobiles (la carte 2D habituelle).']],
      [['Landmark / feature map', 'Carte de repères / de points d\'intérêt'], ['Positions of a few distinctive points (corners, markers, visual features).', 'Positions de quelques points distinctifs (coins, repères, points visuels).'], ['EKF-SLAM, visual SLAM.', 'EKF-SLAM, SLAM visuel.']],
      [['Point cloud / mesh', 'Nuage de points / maillage'], ['Dense 3D geometry.', 'Géométrie 3D dense.'], ['3D navigation, inspection, digital twins.', 'Navigation 3D, inspection, jumeaux numériques.']],
      [['Topological map', 'Carte topologique'], ['A graph of places and the routes between them.', 'Un graphe de lieux et des routes entre eux.'], ['Large-scale route planning, fleets.', 'Planification de routes à grande échelle, flottes.']],
      [['Semantic map', 'Carte sémantique'], ['Objects and room names (“kitchen”, “door”, “chair”).', 'Objets et noms de pièces (« cuisine », « porte », « chaise »).'], ['Service robots, language commands.', 'Robots de service, commandes en langage.']]
    ]),
    P('<strong>Occupancy grid update</strong>: each laser beam says “free” for the cells it crosses and “occupied” for the cell where it stops. The probabilities are combined in the log-odds form, where an observation is simply <em>added</em>: <i>l</i> ← <i>l</i> + <i>l</i><sub>obs</sub>. Repeated observations make a cell confidently free or occupied, and noise averages out.',
      '<strong>Mise à jour de la grille d\'occupation</strong> : chaque faisceau laser dit « libre » pour les cellules qu\'il traverse et « occupé » pour la cellule où il s\'arrête. Les probabilités sont combinées sous la forme log-odds, où une observation s\'<em>ajoute</em> simplement : <i>l</i> ← <i>l</i> + <i>l</i><sub>obs</sub>. Des observations répétées rendent une cellule sûrement libre ou occupée, et le bruit se moyenne.'),
    H4('4.3 SLAM: both at once', '4.3 SLAM : les deux à la fois'),
    P('To localise, the robot needs a map; to build a map, it needs to know where it is. <strong>SLAM</strong> (Simultaneous Localisation And Mapping) solves both together:',
      'Pour se localiser, le robot a besoin d\'une carte ; pour construire une carte, il doit savoir où il est. Le <strong>SLAM</strong> (localisation et cartographie simultanées) résout les deux ensemble :'),
    OL([
      ['<strong>Move</strong> and predict the new pose with the odometry (which drifts).', '<strong>Bouger</strong> et prédire la nouvelle pose avec l\'odométrie (qui dérive).'],
      ['<strong>Scan matching</strong>: align the new lidar scan on the map (ICP or correlation) to correct the pose.', '<strong>Recalage de scan</strong> : aligner le nouveau scan lidar sur la carte (ICP ou corrélation) pour corriger la pose.'],
      ['<strong>Add</strong> the scan to the map.', '<strong>Ajouter</strong> le scan à la carte.'],
      ['<strong>Loop closure</strong>: when the robot recognises a place seen before, add a constraint between the two poses and optimise the whole trajectory (<strong>pose-graph optimisation</strong>): the map snaps into shape and the drift disappears.', '<strong>Fermeture de boucle</strong> : quand le robot reconnaît un lieu déjà vu, ajouter une contrainte entre les deux poses et optimiser toute la trajectoire (<strong>optimisation de graphe de poses</strong>) : la carte se recale et la dérive disparaît.']
    ]),
    TABLE([['Family', 'Famille'], ['Examples', 'Exemples'], ['Sensor', 'Capteur']], [
      [['Filter-based', 'À base de filtres'], ['EKF-SLAM, FastSLAM (particles), GMapping', 'EKF-SLAM, FastSLAM (particules), GMapping'], ['2D lidar, landmarks', 'Lidar 2D, repères']],
      [['Graph-based', 'À base de graphes'], ['Cartographer, SLAM Toolbox, g2o, GTSAM', 'Cartographer, SLAM Toolbox, g2o, GTSAM'], ['2D / 3D lidar', 'Lidar 2D / 3D']],
      [['Visual / visual-inertial', 'Visuel / visuo-inertiel'], ['ORB-SLAM, VINS, RTAB-Map', 'ORB-SLAM, VINS, RTAB-Map'], ['Cameras (+ IMU)', 'Caméras (+ centrale inertielle)']]
    ]),
    BOX('keep', ['Localisation on a known map', 'Localisation sur une carte connue'],
      P('Once a map exists, the robot only needs to <strong>localise</strong>: Monte-Carlo localisation (AMCL, a particle filter) compares each scan with the map. If the robot is “kidnapped” (moved without knowing), the particles spread and re-converge: global localisation. Industrial AMRs often combine a lidar map with floor markers or reflectors for centimetre repeatability.',
        'Une fois la carte disponible, le robot n\'a plus qu\'à se <strong>localiser</strong> : la localisation de Monte-Carlo (AMCL, un filtre à particules) compare chaque scan avec la carte. Si le robot est « kidnappé » (déplacé sans le savoir), les particules s\'étalent et reconvergent : localisation globale. Les AMR industriels combinent souvent une carte lidar avec des repères au sol ou des réflecteurs pour une répétabilité centimétrique.')),
    BOX('example', ['Frames in practice', 'Les repères en pratique'],
      P('In ROS the chain of frames is <code>map → odom → base_link → sensor</code>. <code>odom → base_link</code> is smooth but drifts (odometry); <code>map → odom</code> is the correction given by the localisation, which can jump. A controller follows the smooth one, the planner uses the map one.',
        'Dans ROS la chaîne de repères est <code>map → odom → base_link → capteur</code>. <code>odom → base_link</code> est continu mais dérive (odométrie) ; <code>map → odom</code> est la correction donnée par la localisation, qui peut sauter. Un contrôleur suit le repère continu, le planificateur utilise celui de la carte.'))
  ],
  terms: [['odometry', 'odométrie'], ['occupancy grid', 'grille d\'occupation'], ['SLAM', 'SLAM'], ['scan matching', 'recalage de scan'], ['loop closure', 'fermeture de boucle'], ['pose graph', 'graphe de poses'], ['AMCL', 'AMCL'], ['kidnapped robot', 'robot kidnappé']],
  quiz: [
    ['A robot heading is off by 2°. How far sideways is it after 30 m?', 'Le cap d\'un robot est faux de 2°. De combien est-il décalé latéralement après 30 m ?', '30 × tan 2° ≈ 1.05 m.', '30 × tan 2° ≈ 1,05 m.'],
    ['What does a loop closure do for the map?', 'Que fait une fermeture de boucle pour la carte ?', 'It adds a constraint between two poses at the same place and the optimisation removes the accumulated drift.', 'Elle ajoute une contrainte entre deux poses au même endroit et l\'optimisation supprime la dérive accumulée.'],
    ['Why are heading errors worse than distance errors?', 'Pourquoi les erreurs de cap sont-elles pires que les erreurs de distance ?', 'They rotate the whole future trajectory, so the position error grows with the distance travelled.', 'Elles font tourner toute la trajectoire future, donc l\'erreur de position croît avec la distance parcourue.']
  ],
  link: ['mobile.html', 'Odometry on the mobile robot page →', 'L\'odométrie sur la page du robot mobile →']
}),
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Path planning: Dijkstra, A* and following the path', 'Planification de chemin : Dijkstra, A* et suivi du chemin'],
  time: 13,
  goal: ['how a robot finds the shortest path on a map, and how it follows it while avoiding new obstacles.', 'comment un robot trouve le plus court chemin sur une carte, et comment il le suit en évitant de nouveaux obstacles.'],
  body: [
    H4('5.1 Planning as graph search', '5.1 La planification comme recherche dans un graphe'),
    P('Cut the map into cells: each free cell is a <strong>node</strong>, each move to a neighbour is an <strong>edge</strong> with a cost (1 for a straight move, 1.41 for a diagonal one). Finding a path becomes finding the cheapest route in a graph.',
      'Découpez la carte en cellules : chaque cellule libre est un <strong>nœud</strong>, chaque déplacement vers une voisine est une <strong>arête</strong> avec un coût (1 en ligne droite, 1,41 en diagonale). Trouver un chemin devient trouver la route la moins chère dans un graphe.'),
    UL([
      ['<strong>Dijkstra</strong>: expands the nodes in order of their cost from the start <i>g</i>. It always finds the shortest path, but explores in all directions, like a circle of water spreading.', '<strong>Dijkstra</strong> : développe les nœuds dans l\'ordre de leur coût depuis le départ <i>g</i>. Il trouve toujours le plus court chemin, mais explore dans toutes les directions, comme un cercle d\'eau qui s\'étend.'],
      ['<strong>A*</strong>: expands the nodes in order of <i>f</i> = <i>g</i> + <i>h</i>, where <i>h</i> is a <strong>heuristic</strong> estimate of the remaining cost to the goal (for example the straight-line distance). If <i>h</i> never over-estimates (it is <em>admissible</em>), A* still finds the shortest path, but explores far fewer nodes: it is drawn towards the goal.', '<strong>A*</strong> : développe les nœuds dans l\'ordre de <i>f</i> = <i>g</i> + <i>h</i>, où <i>h</i> est une estimation <strong>heuristique</strong> du coût restant jusqu\'au but (par exemple la distance en ligne droite). Si <i>h</i> ne surestime jamais (elle est <em>admissible</em>), A* trouve quand même le plus court chemin, mais explore beaucoup moins de nœuds : il est attiré vers le but.'],
      ['<strong>Greedy best-first</strong> (<i>f</i> = <i>h</i> only): very fast, but not optimal.', '<strong>Meilleur d\'abord glouton</strong> (<i>f</i> = <i>h</i> seulement) : très rapide, mais pas optimal.']
    ]),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('Start S at (0, 0), goal G at (4, 3), 8-connected grid, no obstacle. The Euclidean heuristic at S is <i>h</i> = √(4² + 3²) = 5. The best path goes 3 diagonal moves and 1 straight move: cost 3 × 1.41 + 1 = 5.24. A* with this <i>h</i> expands almost only the cells along this line; Dijkstra would expand every cell within distance 5.24 of S (about 80 cells).',
        'Départ S en (0, 0), but G en (4, 3), grille à 8 voisins, sans obstacle. L\'heuristique euclidienne en S vaut <i>h</i> = √(4² + 3²) = 5. Le meilleur chemin fait 3 mouvements diagonaux et 1 droit : coût 3 × 1,41 + 1 = 5,24. A* avec cette <i>h</i> ne développe presque que les cellules le long de cette ligne ; Dijkstra développerait toutes les cellules à moins de 5,24 de S (environ 80 cellules).')),
    WIDGET('astar'),
    H4('5.2 Costmaps and real maps', '5.2 Cartes de coûts et vraies cartes'),
    UL([
      ['<strong>Costmap</strong>: instead of free/occupied, each cell has a cost that rises close to obstacles (an “inflation” layer of one robot radius plus a margin). The planner then keeps a safe distance without special code.', '<strong>Carte de coûts</strong> : au lieu de libre/occupé, chaque cellule a un coût qui monte près des obstacles (une couche de « gonflement » d\'un rayon de robot plus une marge). Le planificateur garde alors une distance de sécurité sans code spécial.'],
      ['<strong>Replanning</strong>: D* Lite and similar algorithms repair the path when a new obstacle is seen, without starting over.', '<strong>Replanification</strong> : D* Lite et les algorithmes similaires réparent le chemin quand un nouvel obstacle apparaît, sans repartir de zéro.'],
      ['<strong>Smoothing</strong>: a grid path has staircase corners; it is smoothed (splines, shortcuts) and the kinematics of the robot are respected (a car cannot turn on the spot: lattice planners, Hybrid A*, Dubins curves).', '<strong>Lissage</strong> : un chemin sur grille a des coins en escalier ; il est lissé (splines, raccourcis) et la cinématique du robot est respectée (une voiture ne peut pas tourner sur place : planificateurs à treillis, A* hybride, courbes de Dubins).'],
      ['<strong>Road maps</strong>: for fleets, the map is a graph of lanes and intersections; A* runs on this much smaller graph.', '<strong>Réseaux routiers</strong> : pour les flottes, la carte est un graphe de voies et d\'intersections ; A* tourne sur ce graphe bien plus petit.']
    ]),
    H4('5.3 Global and local planners', '5.3 Planificateur global et local'),
    TABLE([['', ''], ['Global planner', 'Planificateur global'], ['Local planner / controller', 'Planificateur local / contrôleur']], [
      [['Question', 'Question'], ['“What route from A to B on the whole map?”', '« Quelle route de A à B sur toute la carte ? »'], ['“What speed command now, to follow the route and dodge people?”', '« Quelle commande de vitesse maintenant, pour suivre la route et esquiver les personnes ? »']],
      [['Rate', 'Cadence'], ['Once, or about 1 Hz', 'Une fois, ou environ 1 Hz'], ['10 – 50 Hz', '10 – 50 Hz']],
      [['Methods', 'Méthodes'], ['A*, Dijkstra, lattice, RRT*', 'A*, Dijkstra, treillis, RRT*'], ['Pure pursuit, DWA (dynamic window), TEB, MPC, potential fields', 'Poursuite pure, DWA (fenêtre dynamique), TEB, MPC, champs de potentiel']]
    ]),
    P('<strong>Pure pursuit</strong>: aim at a point of the path at a “look-ahead” distance <i>l</i> in front of the robot; with the angle <i>α</i> to this point, drive on a circle of curvature <i>κ</i> = 2 sin <i>α</i> / <i>l</i>. <strong>DWA</strong> tries many pairs (speed, turn rate) reachable within the next fraction of a second, simulates each, and chooses the best one that avoids obstacles and progresses to the goal.',
      '<strong>Poursuite pure</strong> : viser un point du chemin à une distance « d\'anticipation » <i>l</i> devant le robot ; avec l\'angle <i>α</i> vers ce point, rouler sur un cercle de courbure <i>κ</i> = 2 sin <i>α</i> / <i>l</i>. Le <strong>DWA</strong> essaie de nombreux couples (vitesse, taux de rotation) atteignables dans la prochaine fraction de seconde, simule chacun, et choisit le meilleur qui évite les obstacles et progresse vers le but.')
  ],
  terms: [['graph search', 'recherche dans un graphe'], ['Dijkstra', 'Dijkstra'], ['A*', 'A*'], ['heuristic', 'heuristique'], ['admissible', 'admissible'], ['costmap', 'carte de coûts'], ['pure pursuit', 'poursuite pure'], ['DWA', 'DWA']],
  quiz: [
    ['What happens to A* if the heuristic is h = 0 everywhere?', 'Que devient A* si l\'heuristique vaut h = 0 partout ?', 'It becomes Dijkstra: correct, but it explores in all directions.', 'Il devient Dijkstra : correct, mais il explore dans toutes les directions.'],
    ['Why must the heuristic never over-estimate the remaining cost?', 'Pourquoi l\'heuristique ne doit-elle jamais surestimer le coût restant ?', 'Otherwise A* may skip a node that is on the best path and return a longer path.', 'Sinon A* peut ignorer un nœud situé sur le meilleur chemin et renvoyer un chemin plus long.'],
    ['Why have both a global and a local planner?', 'Pourquoi avoir à la fois un planificateur global et un local ?', 'The global one finds the route on the whole (slow-changing) map; the local one reacts quickly to moving obstacles and respects the robot dynamics.', 'Le global trouve la route sur toute la carte (qui change lentement) ; le local réagit vite aux obstacles mobiles et respecte la dynamique du robot.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['Motion planning for arms: configuration space, RRT, optimisation', 'Planification de mouvement pour bras : espace des configurations, RRT, optimisation'],
  time: 14,
  goal: ['how to plan a collision-free motion for a robot with many joints, where a grid is hopeless.', 'comment planifier un mouvement sans collision pour un robot à nombreuses articulations, là où une grille est inutilisable.'],
  body: [
    H4('6.1 Configuration space', '6.1 L\'espace des configurations'),
    P('A mobile robot is a point on a 2D map. An arm is a point in a space with one axis <strong>per joint</strong>: the <strong>configuration space</strong> (C-space, see the joint space of the modelling course). In C-space the arm is a single point <i>q</i>, and every obstacle of the workspace becomes a forbidden region that is hard to draw: the set of all <i>q</i> where the arm touches something. Planning a motion = finding a continuous curve of free points from <i>q</i><sub>start</sub> to <i>q</i><sub>goal</sub>.',
      'Un robot mobile est un point sur une carte 2D. Un bras est un point d\'un espace à un axe <strong>par articulation</strong> : l\'<strong>espace des configurations</strong> (espace C, voir l\'espace articulaire du cours de modélisation). Dans l\'espace C le bras est un seul point <i>q</i>, et chaque obstacle de l\'espace de travail devient une région interdite difficile à dessiner : l\'ensemble de tous les <i>q</i> où le bras touche quelque chose. Planifier un mouvement = trouver une courbe continue de points libres de <i>q</i><sub>départ</sub> à <i>q</i><sub>but</sub>.'),
    BOX('warn', ['The curse of dimension', 'La malédiction de la dimension'],
      P('A grid with 100 values per joint has 100² = 10⁴ cells for 2 joints but 100⁶ = <strong>10¹²</strong> cells for 6 joints: impossible to store or search. That is why arms use <strong>sampling</strong> methods instead of grids.',
        'Une grille de 100 valeurs par articulation a 100² = 10⁴ cellules pour 2 articulations mais 100⁶ = <strong>10¹²</strong> cellules pour 6 : impossible à stocker ou à parcourir. C\'est pourquoi les bras utilisent des méthodes d\'<strong>échantillonnage</strong> plutôt que des grilles.')),
    H4('6.2 Checking a collision', '6.2 Tester une collision'),
    P('A planner needs thousands of collision checks per second. The robot and the scene are approximated by simple shapes (spheres, capsules, boxes, convex hulls) and arranged in trees so that most pairs are rejected quickly (libraries: FCL, Bullet, Coal). Distances (signed distance fields) are also used by optimisation methods. A motion between two free configurations is checked by testing several points in between; the margin must cover the gaps.',
      'Un planificateur a besoin de milliers de tests de collision par seconde. Le robot et la scène sont approchés par des formes simples (sphères, capsules, boîtes, enveloppes convexes) et organisés en arbres pour que la plupart des paires soient écartées rapidement (bibliothèques : FCL, Bullet, Coal). Les distances (champs de distance signée) servent aussi aux méthodes d\'optimisation. Un mouvement entre deux configurations libres est vérifié en testant plusieurs points intermédiaires ; la marge doit couvrir les écarts.'),
    H4('6.3 Sampling-based planners', '6.3 Planificateurs par échantillonnage'),
    TABLE([['Planner', 'Planificateur'], ['How it works', 'Principe'], ['Good for', 'Adapté à']], [
      [['<strong>PRM</strong> (probabilistic roadmap)', '<strong>PRM</strong> (feuille de route probabiliste)'], ['Sample many random free configurations, connect close ones with free straight segments to form a graph, then run A* on it.', 'Échantillonner de nombreuses configurations libres, relier les proches par des segments libres pour former un graphe, puis lancer A* dessus.'], ['Many queries in the same static scene (build once, use often).', 'Nombreuses requêtes dans la même scène statique (construire une fois, utiliser souvent).']],
      [['<strong>RRT</strong> (rapidly-exploring random tree)', '<strong>RRT</strong> (arbre aléatoire à exploration rapide)'], ['Grow a tree from the start: pick a random configuration, find the nearest tree node, move a small step towards it if free, add the new node. Stop when the goal is reached.', 'Faire pousser un arbre depuis le départ : tirer une configuration aléatoire, trouver le nœud le plus proche, avancer d\'un petit pas vers elle si libre, ajouter le nouveau nœud. S\'arrêter quand le but est atteint.'], ['One query in a changing scene: the default of many planners.', 'Une requête dans une scène changeante : le choix par défaut de nombreux planificateurs.']],
      [['<strong>RRT-Connect</strong>', '<strong>RRT-Connect</strong>'], ['Grow two trees (from start and goal) until they meet.', 'Faire pousser deux arbres (du départ et du but) jusqu\'à ce qu\'ils se rejoignent.'], ['Very fast for arms: often the first choice.', 'Très rapide pour les bras : souvent le premier choix.']],
      [['<strong>RRT*</strong>, PRM*', '<strong>RRT*</strong>, PRM*'], ['Same, but rewire the tree to improve the path as time passes: converge towards the optimal path.', 'Pareil, mais remanier l\'arbre pour améliorer le chemin au fil du temps : converge vers le chemin optimal.'], ['When the path quality matters and you can wait.', 'Quand la qualité du chemin compte et qu\'on peut attendre.']]
    ]),
    P('These planners are <strong>probabilistically complete</strong>: if a path exists, the probability of finding it tends to 1 with time. Their weaknesses: <em>narrow passages</em> (a random sample rarely falls in them), jagged paths that need smoothing, and variable time.',
      'Ces planificateurs sont <strong>probabilistiquement complets</strong> : si un chemin existe, la probabilité de le trouver tend vers 1 avec le temps. Leurs faiblesses : les <em>passages étroits</em> (un échantillon aléatoire y tombe rarement), des chemins en dents de scie à lisser, et un temps variable.'),
    WIDGET('rrt'),
    H4('6.4 Optimisation and the full pipeline', '6.4 Optimisation et chaîne complète'),
    UL([
      ['<strong>Trajectory optimisation</strong> (CHOMP, TrajOpt, STOMP, MPC): start from a rough path and minimise a cost (length, smoothness, distance to obstacles, torque) by gradient steps. Gives smooth, short paths, but may get stuck in a local minimum: it is often initialised with an RRT solution.', '<strong>Optimisation de trajectoire</strong> (CHOMP, TrajOpt, STOMP, MPC) : partir d\'un chemin grossier et minimiser un coût (longueur, douceur, distance aux obstacles, couple) par pas de gradient. Donne des chemins doux et courts, mais peut rester coincé dans un minimum local : on l\'initialise souvent avec une solution RRT.'],
      ['<strong>Potential fields</strong>: the goal attracts, obstacles repel. Simple and reactive, but local minima trap the robot (a U-shaped obstacle).', '<strong>Champs de potentiel</strong> : le but attire, les obstacles repoussent. Simple et réactif, mais les minima locaux piègent le robot (un obstacle en U).'],
      ['<strong>Inverse kinematics for the goal</strong>: the goal is usually a tool pose, so the planner first needs the joint solutions (the several aspects of lesson 6 of the modelling course) and may try several.', '<strong>Cinématique inverse pour le but</strong> : le but est généralement une pose d\'outil, donc le planificateur a d\'abord besoin des solutions articulaires (les différents aspects de la leçon 6 du cours de modélisation) et peut en essayer plusieurs.'],
      ['<strong>Time parameterisation</strong>: the geometric path then receives a speed profile that respects the joint limits (see the trajectory lesson of the control course).', '<strong>Paramétrage temporel</strong> : le chemin géométrique reçoit ensuite un profil de vitesse qui respecte les limites des articulations (voir la leçon sur les trajectoires du cours de commande).']
    ]),
    BOX('example', ['In practice: MoveIt', 'En pratique : MoveIt'],
      P('MoveIt (ROS) puts the whole pipeline in one tool: a <em>planning scene</em> (the robot model + obstacles, from a depth camera), the planners of the OMPL library (RRT-Connect by default), inverse kinematics solvers, trajectory smoothing and execution. You ask “go to this pose”, it returns a collision-free, time-parameterised trajectory.',
        'MoveIt (ROS) met toute la chaîne dans un seul outil : une <em>scène de planification</em> (le modèle du robot + les obstacles, issus d\'une caméra de profondeur), les planificateurs de la bibliothèque OMPL (RRT-Connect par défaut), des solveurs de cinématique inverse, le lissage de trajectoire et l\'exécution. On demande « aller à cette pose », il renvoie une trajectoire sans collision et paramétrée en temps.'))
  ],
  terms: [['configuration space', 'espace des configurations'], ['collision checking', 'test de collision'], ['PRM', 'PRM'], ['RRT', 'RRT'], ['probabilistically complete', 'probabilistiquement complet'], ['narrow passage', 'passage étroit'], ['trajectory optimisation', 'optimisation de trajectoire'], ['potential field', 'champ de potentiel']],
  quiz: [
    ['How many cells has a grid with 50 values per joint for a 7-joint arm?', 'Combien de cellules a une grille de 50 valeurs par articulation pour un bras à 7 articulations ?', '50⁷ ≈ 7.8 × 10¹¹, too many to store: use sampling.', '50⁷ ≈ 7,8 × 10¹¹, trop pour être stocké : utiliser l\'échantillonnage.'],
    ['What does RRT do at each iteration?', 'Que fait RRT à chaque itération ?', 'It samples a random configuration, finds the nearest node of the tree, takes a small step towards it, and adds the new node if the step is collision-free.', 'Il tire une configuration aléatoire, trouve le nœud le plus proche de l\'arbre, fait un petit pas vers elle, et ajoute le nouveau nœud si le pas est sans collision.'],
    ['Why is the path of an RRT usually smoothed afterwards?', 'Pourquoi le chemin d\'un RRT est-il généralement lissé après coup ?', 'Random sampling gives a jagged path with unnecessary detours; shortcuts and smoothing make it short and gentle for the motors.', 'L\'échantillonnage aléatoire donne un chemin en dents de scie avec des détours inutiles ; raccourcis et lissage le rendent court et doux pour les moteurs.']
  ]
})
  ];
}
