// ROS 2 course, lessons 4 to 6: services, actions and parameters; launch files; tf2 and URDF.
import { tx, P, H4, UL, OL, BOX, TABLE, FIG, CODE, lesson } from '../lib.mjs';
import { ARR, node, box, arrow, lab } from './ros-fig.mjs';
const PRE = 'ros-';

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Services, actions and parameters', 'Services, actions et paramètres'],
  time: 13,
  goal: ['the three other ways nodes communicate, and how to choose between a topic, a service and an action.', 'les trois autres façons dont les nœuds communiquent, et comment choisir entre un topic, un service et une action.'],
  body: [
    H4('4.1 Four tools, four jobs', '4.1 Quatre outils, quatre travaux'),
    TABLE([['Tool', 'Outil'], ['Like…', 'Comme…'], ['How it works', 'Fonctionnement'], ['Use it for', 'À utiliser pour']], [
      [['<strong>Topic</strong>', '<strong>Topic</strong>'], ['a radio station', 'une station de radio'], ['one way, all the time, nobody answers', 'dans un seul sens, en continu, personne ne répond'], ['sensor data, speed commands', 'données de capteurs, commandes de vitesse']],
      [['<strong>Service</strong>', '<strong>Service</strong>'], ['a phone call with a quick question', 'un appel téléphonique avec une question rapide'], ['one request, one answer, right away', 'une requête, une réponse, tout de suite'], ['“switch the light on”, “save the map”, “compute this”', '« allume la lampe », « enregistre la carte », « calcule ceci »']],
      [['<strong>Action</strong>', '<strong>Action</strong>'], ['ordering a pizza: you follow the delivery and can cancel', 'commander une pizza : on suit la livraison et on peut annuler'], ['a goal, then progress reports, then a result', 'un but, puis des rapports d\'avancement, puis un résultat'], ['“go to the kitchen”, “move the arm along this path”', '« va à la cuisine », « déplace le bras sur ce trajet »']],
      [['<strong>Parameter</strong>', '<strong>Paramètre</strong>'], ['a setting of the node', 'un réglage du nœud'], ['a named value, read at start or changed while running', 'une valeur nommée, lue au démarrage ou changée en marche'], ['maximum speed, gains, name of a file', 'vitesse maximale, gains, nom d\'un fichier']]
    ]),
    BOX('keep', ['How to choose', 'Comment choisir'],
      UL([
        ['Data that flows without being asked → <strong>topic</strong>.', 'Des données qui coulent sans qu\'on les demande → <strong>topic</strong>.'],
        ['A question with a quick answer (less than a second) → <strong>service</strong>.', 'Une question avec une réponse rapide (moins d\'une seconde) → <strong>service</strong>.'],
        ['A task that takes time, that you want to follow or cancel → <strong>action</strong>.', 'Une tâche qui prend du temps, que l\'on veut suivre ou annuler → <strong>action</strong>.']
      ])),
    H4('4.2 A service and a parameter in Python', '4.2 Un service et un paramètre en Python'),
    P('This node offers the service <code>add_two_ints</code>: it receives two numbers and answers with their sum. It also has a parameter <code>offset</code>. (Add <code>example_interfaces</code> to the dependencies in <code>package.xml</code>, and the node to <code>setup.py</code>.)',
      'Ce nœud offre le service <code>add_two_ints</code> : il reçoit deux nombres et répond par leur somme. Il a aussi un paramètre <code>offset</code>. (Ajoutez <code>example_interfaces</code> aux dépendances dans <code>package.xml</code>, et le nœud dans <code>setup.py</code>.)'),
    CODE('ros_service.py'),
    P('Call it from the terminal, then change the parameter while the node runs:', 'Appelez-le depuis le terminal, puis changez le paramètre pendant que le nœud tourne :'),
    CODE('ros_service_cli.sh'),
    H4('4.3 Actions: goal, feedback, result', '4.3 Les actions : but, retour, résultat'),
    FIG('0 0 720 165', `${ARR}
      ${box(80, 82, 150, ['action client', 'client d\'action'], ['your program', 'votre programme'])}${box(640, 82, 150, ['action server', 'serveur d\'action'], ['navigation, arm…', 'navigation, bras…'])}
      ${arrow(165, 42, 555, 42)}${lab(360, 33, ['1. goal: “go to (2.0, 1.5)”', '1. but : « va en (2,0 ; 1,5) »'])}
      ${arrow(555, 82, 165, 82)}${lab(360, 73, ['2. feedback: “1.2 m left”, again and again', '2. retour : « encore 1,2 m », encore et encore'])}
      ${arrow(555, 122, 165, 122)}${lab(360, 113, ['3. result: “arrived” (or “failed”)', '3. résultat : « arrivé » (ou « échec »)'])}
      ${lab(360, 152, ['the client can cancel at any time', 'le client peut annuler à tout moment'])}`),
    P('You will rarely write an action server at the beginning, but you will <strong>call</strong> them all the time: the navigation stack offers <code>NavigateToPose</code>, the arm stack offers <code>FollowJointTrajectory</code>. From the terminal: <code>ros2 action send_goal /name type "{…}" --feedback</code>.',
      'Au début, vous écrirez rarement un serveur d\'action, mais vous en <strong>appellerez</strong> tout le temps : la pile de navigation offre <code>NavigateToPose</code>, la pile des bras offre <code>FollowJointTrajectory</code>. Depuis le terminal : <code>ros2 action send_goal /nom type "{…}" --feedback</code>.'),
    H4('4.4 Interfaces: the three kinds of files', '4.4 Les interfaces : les trois sortes de fichiers'),
    TABLE([['File', 'Fichier'], ['Describes', 'Décrit'], ['Parts', 'Parties']], [
      ['<code>.msg</code>', ['a topic message', 'un message de topic'], ['the fields', 'les champs']],
      ['<code>.srv</code>', ['a service', 'un service'], ['request <code>---</code> response', 'requête <code>---</code> réponse']],
      ['<code>.action</code>', ['an action', 'une action'], ['goal <code>---</code> result <code>---</code> feedback', 'but <code>---</code> résultat <code>---</code> retour']]
    ]),
    P('<code>ros2 interface show</code> prints any of them. Use the standard interfaces whenever one fits: your node then works with every existing tool.',
      '<code>ros2 interface show</code> affiche n\'importe laquelle. Utilisez les interfaces standards dès qu\'une convient : votre nœud fonctionne alors avec tous les outils existants.')
  ],
  terms: [['service', 'service'], ['request / response', 'requête / réponse'], ['action', 'action'], ['goal / feedback / result', 'but / retour / résultat'], ['parameter', 'paramètre'], ['interface', 'interface']],
  quiz: [
    ['“Navigate to the charging station” takes 40 s and must be cancellable. Topic, service or action?', '« Navigue jusqu\'à la station de recharge » dure 40 s et doit pouvoir être annulé. Topic, service ou action ?', 'An action: a long task with feedback and cancellation.', 'Une action : une tâche longue avec retour d\'avancement et annulation.'],
    ['Why not use a service to read a laser scanner 10 times per second?', 'Pourquoi ne pas utiliser un service pour lire un scanner laser 10 fois par seconde ?', 'Data that flows all the time belongs on a topic: the driver publishes, and every node that needs it subscribes.', 'Des données qui coulent en continu vont sur un topic : le pilote publie, et chaque nœud qui en a besoin s\'abonne.'],
    ['What is a parameter?', 'Qu\'est-ce qu\'un paramètre ?', 'A named setting of a node (a number, a text, a boolean), given at start or changed while the node runs.', 'Un réglage nommé d\'un nœud (un nombre, un texte, un booléen), donné au démarrage ou changé pendant que le nœud tourne.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Launch files: start a whole robot with one command', 'Fichiers de lancement : démarrer tout un robot en une commande'],
  time: 10,
  goal: ['to start many nodes at once with their parameters, and to rename topics and group robots without changing the code.', 'à démarrer beaucoup de nœuds d\'un coup avec leurs paramètres, et à renommer des topics et regrouper des robots sans changer le code.'],
  body: [
    H4('5.1 Why launch files', '5.1 Pourquoi des fichiers de lancement'),
    P('A real robot runs 20 to 50 nodes. Nobody opens 50 terminals. A <strong>launch file</strong> is a list of the nodes to start, with their settings. One command starts everything, and Ctrl+C stops everything.',
      'Un vrai robot fait tourner 20 à 50 nœuds. Personne n\'ouvre 50 terminaux. Un <strong>fichier de lancement</strong> (launch file) est la liste des nœuds à démarrer, avec leurs réglages. Une commande démarre tout, et Ctrl+C arrête tout.'),
    CODE('ros_launch.py'),
    CODE('ros_launch_cli.sh'),
    H4('5.2 Three ways to adapt a node without touching its code', '5.2 Trois façons d\'adapter un nœud sans toucher à son code'),
    TABLE([['Tool', 'Outil'], ['What it changes', 'Ce que ça change'], ['Example', 'Exemple']], [
      [['<strong>Parameters</strong>', '<strong>Paramètres</strong>'], ['the settings of the node', 'les réglages du nœud'], ['<code>parameters=[{\'speed\': 0.3}]</code>, or a YAML file', '<code>parameters=[{\'speed\': 0.3}]</code>, ou un fichier YAML']],
      [['<strong>Remapping</strong>', '<strong>Renommage (remapping)</strong>'], ['the name of a topic', 'le nom d\'un topic'], ['the node publishes <code>scan</code>, the robot expects <code>front_laser/scan</code>', 'le nœud publie <code>scan</code>, le robot attend <code>front_laser/scan</code>']],
      [['<strong>Namespace</strong>', '<strong>Espace de noms</strong>'], ['a prefix on every name of the node', 'un préfixe sur tous les noms du nœud'], ['two robots: <code>/r1/cmd_vel</code> and <code>/r2/cmd_vel</code>', 'deux robots : <code>/r1/cmd_vel</code> et <code>/r2/cmd_vel</code>']]
    ]),
    BOX('idea', ['Why node code uses names without a slash', 'Pourquoi le code des nœuds utilise des noms sans barre oblique'],
      P('In lesson 3 the topic was <code>\'chatter\'</code>, not <code>\'/chatter\'</code>. A name without a leading slash is <strong>relative</strong>: it takes the namespace of the node. The same code then works for robot 1 and robot 2. A name that starts with <code>/</code> is absolute and ignores the namespace.',
        'À la leçon 3, le topic était <code>\'chatter\'</code>, pas <code>\'/chatter\'</code>. Un nom sans barre oblique au début est <strong>relatif</strong> : il prend l\'espace de noms du nœud. Le même code fonctionne alors pour le robot 1 et le robot 2. Un nom qui commence par <code>/</code> est absolu et ignore l\'espace de noms.')),
    H4('5.3 Parameters in a YAML file', '5.3 Les paramètres dans un fichier YAML'),
    P('When a node has many parameters, put them in a file <code>config/params.yaml</code> and give its path in <code>parameters=[…]</code>:',
      'Quand un nœud a beaucoup de paramètres, mettez-les dans un fichier <code>config/params.yaml</code> et donnez son chemin dans <code>parameters=[…]</code> :'),
    '<pre class="code"><code>safe_driver:                 # the name of the node\n  ros__parameters:\n    speed: 0.15\n    stop_distance: 0.40</code></pre>',
    P('Launch files can also <strong>include</strong> other launch files: this is how the big stacks start. One line includes the whole navigation system.',
      'Les fichiers de lancement peuvent aussi <strong>inclure</strong> d\'autres fichiers de lancement : c\'est ainsi que démarrent les grosses piles logicielles. Une ligne inclut tout le système de navigation.'),
    BOX('keep', ['The layout of a tidy package', 'L\'organisation d\'un paquet bien rangé'],
      '<pre class="code"><code>my_robot/\n  package.xml          dependencies\n  setup.py             nodes and installed files\n  my_robot/            the Python nodes\n  launch/              *.launch.py\n  config/              *.yaml (parameters)\n  urdf/                the model of the robot (lesson 6)</code></pre>')
  ],
  terms: [['launch file', 'fichier de lancement'], ['launch argument', 'argument de lancement'], ['remapping', 'renommage (remapping)'], ['namespace', 'espace de noms'], ['YAML', 'YAML']],
  quiz: [
    ['Two identical robots must run the same nodes without mixing their topics. What do you use?', 'Deux robots identiques doivent faire tourner les mêmes nœuds sans mélanger leurs topics. Qu\'utilisez-vous ?', 'A namespace for each robot (for example r1 and r2), given in the launch file.', 'Un espace de noms par robot (par exemple r1 et r2), donné dans le fichier de lancement.'],
    ['A driver publishes on <code>scan</code> but your node listens to <code>laser</code>. How do you connect them without editing the code?', 'Un pilote publie sur <code>scan</code> mais votre nœud écoute <code>laser</code>. Comment les relier sans modifier le code ?', 'With a remapping in the launch file: (\'laser\', \'scan\') on your node.', 'Avec un renommage dans le fichier de lancement : (\'laser\', \'scan\') sur votre nœud.'],
    ['In a node running in the namespace <code>r1</code>, which topic does the name <code>/cmd_vel</code> give?', 'Dans un nœud qui tourne dans l\'espace de noms <code>r1</code>, quel topic donne le nom <code>/cmd_vel</code> ?', '<code>/cmd_vel</code>: a name starting with a slash is absolute. The relative name <code>cmd_vel</code> would give <code>/r1/cmd_vel</code>.', '<code>/cmd_vel</code> : un nom qui commence par une barre oblique est absolu. Le nom relatif <code>cmd_vel</code> donnerait <code>/r1/cmd_vel</code>.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['Frames and the robot model: tf2 and URDF', 'Les repères et le modèle du robot : tf2 et URDF'],
  time: 14,
  goal: ['how ROS 2 keeps track of every frame of the robot, and how to describe a robot in a URDF file.', 'comment ROS 2 suit tous les repères du robot, et comment décrire un robot dans un fichier URDF.'],
  body: [
    H4('6.1 The question tf2 answers', '6.1 La question à laquelle tf2 répond'),
    P('The camera sees a cup at 0.6 m in front of <em>it</em>. Where is the cup for the gripper? For the map? You know the answer from the modelling course: multiply the homogeneous matrices from one frame to the other. <strong>tf2</strong> is the ROS 2 library that does it for you, for all the frames, all the time.',
      'La caméra voit une tasse à 0,6 m devant <em>elle</em>. Où est la tasse pour la pince ? Pour la carte ? Vous connaissez la réponse depuis le cours de modélisation : multiplier les matrices homogènes d\'un repère à l\'autre. <strong>tf2</strong> est la bibliothèque ROS 2 qui le fait pour vous, pour tous les repères, tout le temps.'),
    P('Every frame has a name and exactly <strong>one parent</strong>: the frames form a <strong>tree</strong>. Each link of the tree is a transform (a translation and a rotation) published on the topics <code>/tf</code> and <code>/tf_static</code>.',
      'Chaque repère a un nom et exactement <strong>un parent</strong> : les repères forment un <strong>arbre</strong>. Chaque lien de l\'arbre est une transformation (une translation et une rotation) publiée sur les topics <code>/tf</code> et <code>/tf_static</code>.'),
    FIG('0 0 720 200', `${ARR}
      ${box(60, 32, 90, 'map')}${box(215, 32, 90, 'odom')}${box(385, 32, 120, 'base_link')}
      ${box(590, 32, 130, 'laser_link')}${box(590, 92, 130, 'camera_link')}${box(385, 160, 120, 'wheel_left')}${box(590, 160, 130, 'wheel_right')}
      ${arrow(105, 32, 168, 32)}${arrow(260, 32, 323, 32)}${arrow(445, 32, 523, 32)}${arrow(430, 52, 523, 84)}${arrow(385, 52, 385, 138)}${arrow(410, 52, 530, 142)}
      ${lab(137, 22, ['localisation', 'localisation'], 'sm')}${lab(292, 22, ['odometry', 'odométrie'], 'sm')}
      ${lab(165, 120, ['moving links: published by nodes', 'liens mobiles : publiés par des nœuds'])}${lab(165, 140, ['fixed links: written in the URDF', 'liens fixes : écrits dans l\'URDF'])}`),
    TABLE([['Frame', 'Repère'], ['What it is', 'Ce que c\'est']], [
      ['<code>base_link</code>', ['the body of the robot: x forward, y left, z up', 'le corps du robot : x vers l\'avant, y à gauche, z vers le haut']],
      ['<code>odom</code>', ['where the robot started. <code>odom → base_link</code> comes from the wheels: smooth, but it drifts.', 'l\'endroit où le robot a démarré. <code>odom → base_link</code> vient des roues : lisse, mais il dérive.']],
      ['<code>map</code>', ['the fixed frame of the map. <code>map → odom</code> comes from the localisation: it corrects the drift, with small jumps.', 'le repère fixe de la carte. <code>map → odom</code> vient de la localisation : il corrige la dérive, avec de petits sauts.']],
      ['<code>laser_link</code>, <code>camera_link</code>…', ['one frame per sensor, fixed on the body', 'un repère par capteur, fixé sur le corps']]
    ]),
    H4('6.2 URDF: the robot in a file', '6.2 URDF : le robot dans un fichier'),
    P('A <strong>URDF</strong> file describes the robot as <strong>links</strong> (rigid parts) joined by <strong>joints</strong>, exactly the chain of the first course. Each joint says: its parent link, its child link, where it is (<code>origin</code>), around which axis it moves, and its type (<code>revolute</code>, <code>prismatic</code>, <code>continuous</code>, <code>fixed</code>). Here is the 2-axis arm of the maths course:',
      'Un fichier <strong>URDF</strong> décrit le robot comme des <strong>segments</strong> (links, pièces rigides) reliés par des <strong>liaisons</strong> (joints), exactement la chaîne du premier cours. Chaque liaison indique : son segment parent, son segment enfant, où elle se trouve (<code>origin</code>), autour de quel axe elle bouge, et son type (<code>revolute</code>, <code>prismatic</code>, <code>continuous</code>, <code>fixed</code>). Voici le bras à 2 axes du cours de maths :'),
    CODE('robot.urdf'),
    P('The node <strong>robot_state_publisher</strong> reads the URDF and the joint angles (topic <code>/joint_states</code>) and publishes all the frames of the robot on tf: it computes the forward kinematics for you.',
      'Le nœud <strong>robot_state_publisher</strong> lit l\'URDF et les angles des liaisons (topic <code>/joint_states</code>) et publie tous les repères du robot sur tf : il calcule la cinématique directe pour vous.'),
    CODE('ros_tf_cli.sh'),
    BOX('example', ['Check the forward kinematics yourself', 'Vérifiez vous-même la cinématique directe'],
      P('Set joint1 = 0.5 rad and joint2 = 0.8 rad with the sliders. The origin of <code>link2</code> is at the end of link 1: x = 0.5 cos 0.5 = <strong>0.439 m</strong>, y = 0.5 sin 0.5 = <strong>0.240 m</strong>, z = 0.05 m. <code>tf2_echo base_link link2</code> must print the same translation. It is the formula x = L₁ cos θ₁ of the maths course, computed by ROS 2.',
        'Réglez joint1 = 0,5 rad et joint2 = 0,8 rad avec les curseurs. L\'origine de <code>link2</code> est au bout du segment 1 : x = 0,5 cos 0,5 = <strong>0,439 m</strong>, y = 0,5 sin 0,5 = <strong>0,240 m</strong>, z = 0,05 m. <code>tf2_echo base_link link2</code> doit afficher la même translation. C\'est la formule x = L₁ cos θ₁ du cours de maths, calculée par ROS 2.')),
    H4('6.3 RViz: see what the robot thinks', '6.3 RViz : voir ce que pense le robot'),
    P('<strong>RViz</strong> is the 3D viewer of ROS 2. It does not simulate anything: it <strong>draws the data</strong> that the nodes publish (the robot model, the frames, the laser points, the map, the planned path). Choose the <em>Fixed Frame</em> at the top left (<code>base_link</code>, <code>odom</code> or <code>map</code>), then add displays.',
      '<strong>RViz</strong> est le visualiseur 3D de ROS 2. Il ne simule rien : il <strong>dessine les données</strong> que les nœuds publient (le modèle du robot, les repères, les points du laser, la carte, le chemin planifié). Choisissez le <em>Fixed Frame</em> en haut à gauche (<code>base_link</code>, <code>odom</code> ou <code>map</code>), puis ajoutez des affichages.'),
    BOX('warn', ['Typical tf problems', 'Problèmes typiques de tf'],
      UL([
        ['“<em>frame does not exist</em>” or two separate trees: a link of the tree is missing. Look at the PDF of <code>view_frames</code>.', '« <em>frame does not exist</em> » ou deux arbres séparés : il manque un lien de l\'arbre. Regardez le PDF de <code>view_frames</code>.'],
        ['The sensor data appears at the wrong place: the <code>origin</code> of the sensor in the URDF is wrong (measure it on the real robot).', 'Les données d\'un capteur apparaissent au mauvais endroit : l\'<code>origin</code> du capteur dans l\'URDF est faux (mesurez-le sur le vrai robot).'],
        ['“<em>extrapolation into the future</em>”: the clocks of two computers differ, or simulated time is not enabled (<code>use_sim_time</code>).', '« <em>extrapolation into the future</em> » : les horloges de deux ordinateurs diffèrent, ou le temps simulé n\'est pas activé (<code>use_sim_time</code>).']
      ]))
  ],
  terms: [['tf2', 'tf2'], ['frame', 'repère'], ['transform', 'transformation'], ['URDF', 'URDF'], ['link / joint', 'segment / liaison'], ['robot_state_publisher', 'robot_state_publisher'], ['RViz', 'RViz']],
  quiz: [
    ['Why do the frames of a robot form a tree and not a free network?', 'Pourquoi les repères d\'un robot forment-ils un arbre et pas un réseau libre ?', 'Each frame has exactly one parent, so there is exactly one path between two frames, and one single transform.', 'Chaque repère a exactement un parent, il y a donc exactement un chemin entre deux repères, et une seule transformation.'],
    ['What is the difference between the frames <code>odom</code> and <code>map</code>?', 'Quelle est la différence entre les repères <code>odom</code> et <code>map</code> ?', 'odom → base_link comes from the wheels: smooth but drifting. map → odom comes from the localisation: it corrects the drift.', 'odom → base_link vient des roues : lisse mais avec dérive. map → odom vient de la localisation : il corrige la dérive.'],
    ['Which node turns the URDF and the joint angles into frames on tf?', 'Quel nœud transforme l\'URDF et les angles des liaisons en repères sur tf ?', 'robot_state_publisher.', 'robot_state_publisher.']
  ]
})
  ];
}
