// ROS 2 course, lessons 1 to 3: what ROS 2 is, nodes and topics, the first nodes in Python.
import { tx, P, H4, UL, OL, BOX, TABLE, FIG, CODE, lesson } from '../lib.mjs';
import { ARR, node, box, arrow, lab } from './ros-fig.mjs';
const PRE = 'ros-';

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['What ROS 2 is, and why robots use it', 'Ce qu\'est ROS 2, et pourquoi les robots l\'utilisent'],
  time: 10,
  goal: ['what ROS 2 does for you, what it does not do, and how to install it and run your first two programs.', 'ce que ROS 2 fait pour vous, ce qu\'il ne fait pas, et comment l\'installer et lancer vos deux premiers programmes.'],
  body: [
    H4('1.1 The problem ROS 2 solves', '1.1 Le problème que ROS 2 résout'),
    P('A robot runs many programs at the same time: one reads the camera, one reads the laser, one computes where the robot is, one plans the path, one drives the motors. They are written by different people, in different languages, and often run on different computers. <strong>They must talk to each other.</strong>',
      'Un robot fait tourner beaucoup de programmes en même temps : un lit la caméra, un lit le laser, un calcule où est le robot, un planifie le chemin, un pilote les moteurs. Ils sont écrits par des personnes différentes, dans des langages différents, et tournent souvent sur des ordinateurs différents. <strong>Ils doivent se parler.</strong>'),
    P('<strong>ROS 2</strong> (Robot Operating System 2) is the free, open-source software that makes them talk. Despite its name it is <strong>not an operating system</strong>: it is installed on top of Linux (or Windows, macOS). It gives you three things:',
      '<strong>ROS 2</strong> (Robot Operating System 2) est le logiciel libre et gratuit qui les fait se parler. Malgré son nom, ce <strong>n\'est pas un système d\'exploitation</strong> : il s\'installe par-dessus Linux (ou Windows, macOS). Il vous donne trois choses :'),
    TABLE([['What', 'Quoi'], ['In simple words', 'En mots simples'], ['Examples', 'Exemples']], [
      [['<strong>The plumbing</strong>', '<strong>La tuyauterie</strong>'], ['Programs send each other messages without knowing where the other one runs.', 'Les programmes s\'envoient des messages sans savoir où tourne l\'autre.'], ['topics, services, actions', 'topics, services, actions']],
      [['<strong>The tools</strong>', '<strong>Les outils</strong>'], ['See, record, replay and debug what happens inside the robot.', 'Voir, enregistrer, rejouer et déboguer ce qui se passe dans le robot.'], ['<code>ros2</code> commands, RViz, rosbag, Gazebo', 'commandes <code>ros2</code>, RViz, rosbag, Gazebo']],
      [['<strong>The libraries</strong>', '<strong>Les bibliothèques</strong>'], ['Ready-made, tested solutions to the hard problems.', 'Des solutions toutes prêtes et testées aux problèmes difficiles.'], ['Nav2 (navigation), MoveIt 2 (arms), slam_toolbox (maps)', 'Nav2 (navigation), MoveIt 2 (bras), slam_toolbox (cartes)']]
    ]),
    BOX('idea', ['The key idea', 'L\'idée clé'],
      P('With ROS 2 you do not write one big program. You write <strong>small programs that each do one job</strong>, and you connect them. You can then replace one of them (a real camera by a simulated one, your planner by a better one) without touching the others.',
        'Avec ROS 2, on n\'écrit pas un gros programme. On écrit de <strong>petits programmes qui font chacun un seul travail</strong>, et on les relie. On peut alors en remplacer un (une vraie caméra par une caméra simulée, votre planificateur par un meilleur) sans toucher aux autres.')),
    FIG('0 0 720 170', `${ARR}
      ${node(80, 45, 140, ['camera driver', 'pilote caméra'])}${node(80, 125, 140, ['laser driver', 'pilote laser'])}
      ${node(340, 45, 180, ['object detector', 'détecteur d\'objets'])}${node(340, 125, 180, ['localisation', 'localisation'])}
      ${node(620, 85, 180, ['motor controller', 'contrôleur moteurs'])}
      ${arrow(150, 45, 248, 45)}${arrow(150, 125, 248, 125)}${arrow(428, 52, 532, 76)}${arrow(428, 118, 532, 94)}
      ${lab(199, 36, '/image', 'c-l')}${lab(199, 116, '/scan', 'c-l')}${lab(492, 50, '/objects', 'c-l')}${lab(492, 128, '/pose', 'c-l')}`),
    H4('1.2 What ROS 2 is not', '1.2 Ce que ROS 2 n\'est pas'),
    UL([
      ['It is <strong>not</strong> a programming language: you write your nodes in <strong>Python</strong> or <strong>C++</strong>.', 'Ce n\'est <strong>pas</strong> un langage de programmation : on écrit ses nœuds en <strong>Python</strong> ou en <strong>C++</strong>.'],
      ['It does <strong>not</strong> replace the maths: the kinematics, the PID and the Kalman filter of the other courses are still there, inside the nodes.', 'Il ne <strong>remplace pas</strong> les maths : la cinématique, le PID et le filtre de Kalman des autres cours sont toujours là, à l\'intérieur des nœuds.'],
      ['It is <strong>not</strong> the safety system: an emergency stop never depends on ROS 2.', 'Ce n\'est <strong>pas</strong> le système de sécurité : un arrêt d\'urgence ne dépend jamais de ROS 2.']
    ]),
    H4('1.3 Versions (distributions)', '1.3 Les versions (distributions)'),
    P('ROS 2 is released once a year under a name. Some releases are supported for five years (LTS): choose one of these to learn. This course uses <strong>Jazzy Jalisco</strong> (2024, LTS, on Ubuntu 24.04); everything here also works on <strong>Humble</strong> (2022, LTS, Ubuntu 22.04) by replacing <code>jazzy</code> with <code>humble</code>. For a newer release, check <strong>docs.ros.org</strong>: the ideas of this course do not change.',
      'ROS 2 sort une fois par an sous un nom. Certaines versions sont maintenues cinq ans (LTS) : choisissez-en une pour apprendre. Ce cours utilise <strong>Jazzy Jalisco</strong> (2024, LTS, sur Ubuntu 24.04) ; tout fonctionne aussi sur <strong>Humble</strong> (2022, LTS, Ubuntu 22.04) en remplaçant <code>jazzy</code> par <code>humble</code>. Pour une version plus récente, consultez <strong>docs.ros.org</strong> : les idées de ce cours ne changent pas.'),
    BOX('warn', ['ROS 1 is finished', 'ROS 1 est terminé'],
      P('The first ROS (ROS 1, last version “Noetic”) reached its end of life in 2025. Many old tutorials still use it: if you see <code>roscore</code>, <code>rosrun</code> or <code>catkin_make</code>, it is ROS 1. In ROS 2 the commands start with <code>ros2</code> and the build tool is <code>colcon</code>.',
        'Le premier ROS (ROS 1, dernière version « Noetic ») est arrivé en fin de vie en 2025. Beaucoup d\'anciens tutoriels l\'utilisent encore : si vous voyez <code>roscore</code>, <code>rosrun</code> ou <code>catkin_make</code>, c\'est du ROS 1. En ROS 2, les commandes commencent par <code>ros2</code> et l\'outil de compilation est <code>colcon</code>.')),
    H4('1.4 Install it and say hello', '1.4 L\'installer et dire bonjour'),
    P('The simplest way is a computer (or a virtual machine) with Ubuntu. The official guide on docs.ros.org gives the exact steps to add the ROS 2 package source; then:',
      'Le plus simple est un ordinateur (ou une machine virtuelle) sous Ubuntu. Le guide officiel sur docs.ros.org donne les étapes exactes pour ajouter la source de paquets ROS 2 ; ensuite :'),
    CODE('ros_install.sh'),
    P('The talker and the listener are two separate programs. They found each other alone, with no address to configure: this is the plumbing of ROS 2 at work.',
      'Le « talker » et le « listener » sont deux programmes séparés. Ils se sont trouvés tout seuls, sans adresse à configurer : c\'est la tuyauterie de ROS 2 au travail.'),
    BOX('keep', ['The most common beginner error', 'L\'erreur de débutant la plus fréquente'],
      P('<code>ros2: command not found</code> means you forgot <code>source /opt/ros/jazzy/setup.bash</code> in this terminal. Every new terminal needs it.',
        '<code>ros2: command not found</code> veut dire que vous avez oublié <code>source /opt/ros/jazzy/setup.bash</code> dans ce terminal. Chaque nouveau terminal en a besoin.'))
  ],
  terms: [['middleware', 'intergiciel'], ['node', 'nœud'], ['distribution', 'distribution'], ['LTS', 'LTS'], ['colcon', 'colcon']],
  quiz: [
    ['Is ROS 2 an operating system?', 'ROS 2 est-il un système d\'exploitation ?', 'No. It is a middleware and a set of tools and libraries, installed on top of an operating system such as Ubuntu.', 'Non. C\'est un intergiciel et un ensemble d\'outils et de bibliothèques, installé par-dessus un système d\'exploitation comme Ubuntu.'],
    ['Why split a robot program into many small nodes?', 'Pourquoi découper le programme d\'un robot en beaucoup de petits nœuds ?', 'Each node does one job, can be tested alone, reused on another robot and replaced (for example by a simulated version) without changing the others.', 'Chaque nœud fait un seul travail, peut être testé seul, réutilisé sur un autre robot et remplacé (par exemple par une version simulée) sans changer les autres.'],
    ['A tutorial tells you to type <code>roscore</code>. What does it tell you?', 'Un tutoriel vous dit de taper <code>roscore</code>. Qu\'est-ce que cela vous apprend ?', 'It is a ROS 1 tutorial. ROS 2 has no roscore: the nodes discover each other.', 'C\'est un tutoriel ROS 1. ROS 2 n\'a pas de roscore : les nœuds se découvrent entre eux.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Nodes, topics and messages', 'Nœuds, topics et messages'],
  time: 12,
  goal: ['how nodes exchange data with topics, what a message is, and the commands to look inside a running robot.', 'comment les nœuds échangent des données avec les topics, ce qu\'est un message, et les commandes pour regarder à l\'intérieur d\'un robot en marche.'],
  body: [
    H4('2.1 Publish and subscribe', '2.1 Publier et s\'abonner'),
    P('A <strong>node</strong> is one running program. A <strong>topic</strong> is a named channel, like a radio station. A node that has data <strong>publishes</strong> it on a topic; every node that wants this data <strong>subscribes</strong> to the topic. The publisher does not know who listens, and it does not wait for an answer.',
      'Un <strong>nœud</strong> est un programme en cours d\'exécution. Un <strong>topic</strong> est un canal qui porte un nom, comme une station de radio. Un nœud qui a une donnée la <strong>publie</strong> sur un topic ; chaque nœud qui veut cette donnée <strong>s\'abonne</strong> au topic. Celui qui publie ne sait pas qui écoute, et il n\'attend pas de réponse.'),
    FIG('0 0 720 150', `${ARR}
      ${node(80, 75, 140, ['laser driver', 'pilote laser'])}${box(270, 75, 80, '/scan')}
      ${node(590, 28, 220, ['obstacle detector', 'détecteur d\'obstacles'])}${node(590, 75, 220, ['map builder', 'constructeur de carte'])}${node(590, 122, 220, ['RViz (display)', 'RViz (affichage)'])}
      ${arrow(150, 75, 228, 75)}${arrow(310, 68, 478, 32)}${arrow(310, 75, 478, 75)}${arrow(310, 82, 478, 118)}
      ${lab(189, 66, ['publishes', 'publie'])}${lab(380, 34, ['subscribe', 's\'abonnent'])}`),
    UL([
      ['One topic can have <strong>several publishers</strong> and <strong>several subscribers</strong>.', 'Un topic peut avoir <strong>plusieurs éditeurs</strong> et <strong>plusieurs abonnés</strong>.'],
      ['Topics are for data that <strong>flows all the time</strong>: sensor readings, positions, speed commands.', 'Les topics servent aux données qui <strong>coulent en continu</strong> : mesures de capteurs, positions, commandes de vitesse.'],
      ['Names look like paths: <code>/scan</code>, <code>/cmd_vel</code>, <code>/camera/image_raw</code>.', 'Les noms ressemblent à des chemins : <code>/scan</code>, <code>/cmd_vel</code>, <code>/camera/image_raw</code>.']
    ]),
    H4('2.2 Messages have a type', '2.2 Les messages ont un type'),
    P('Every topic carries messages of <strong>one type</strong>, known in advance. A type is a list of named fields. The most used ones:',
      'Chaque topic transporte des messages d\'<strong>un seul type</strong>, connu à l\'avance. Un type est une liste de champs nommés. Les plus utilisés :'),
    TABLE([['Type', 'Type'], ['Contains', 'Contient'], ['Typical topic', 'Topic typique']], [
      ['<code>std_msgs/msg/String</code>', ['a text', 'un texte'], '<code>/chatter</code>'],
      ['<code>geometry_msgs/msg/Twist</code>', ['a speed command: <code>linear.x</code> (m/s, forward) and <code>angular.z</code> (rad/s, turning)', 'une commande de vitesse : <code>linear.x</code> (m/s, vers l\'avant) et <code>angular.z</code> (rad/s, rotation)'], '<code>/cmd_vel</code>'],
      ['<code>sensor_msgs/msg/LaserScan</code>', ['one turn of a laser scanner: a list of distances <code>ranges</code>, the first angle and the angle step', 'un tour de scanner laser : une liste de distances <code>ranges</code>, le premier angle et le pas d\'angle'], '<code>/scan</code>'],
      ['<code>sensor_msgs/msg/Image</code>', ['a camera image', 'une image de caméra'], '<code>/camera/image_raw</code>'],
      ['<code>nav_msgs/msg/Odometry</code>', ['the position and speed of the robot, from its wheels', 'la position et la vitesse du robot, d\'après ses roues'], '<code>/odom</code>'],
      ['<code>sensor_msgs/msg/JointState</code>', ['the angle and speed of every joint of an arm', 'l\'angle et la vitesse de chaque articulation d\'un bras'], '<code>/joint_states</code>']
    ]),
    BOX('keep', ['Units: always the same', 'Unités : toujours les mêmes'],
      P('ROS uses SI units everywhere: <strong>metres, seconds, radians, kilograms</strong>. Never degrees, never millimetres. The x axis of a robot points <strong>forward</strong>, y to the <strong>left</strong>, z <strong>up</strong>.',
        'ROS utilise partout les unités SI : <strong>mètres, secondes, radians, kilogrammes</strong>. Jamais de degrés, jamais de millimètres. L\'axe x d\'un robot pointe vers l\'<strong>avant</strong>, y vers la <strong>gauche</strong>, z vers le <strong>haut</strong>.')),
    H4('2.3 Look inside a running robot', '2.3 Regarder à l\'intérieur d\'un robot en marche'),
    P('Keep the talker and the listener of lesson 1 running, open a third terminal, and try:', 'Laissez tourner le « talker » et le « listener » de la leçon 1, ouvrez un troisième terminal, et essayez :'),
    CODE('ros_cli.sh'),
    P('These few commands are how you debug 90 % of ROS 2 problems: is the node running, is the topic there, does data flow, at which rate, with the right type?',
      'Ces quelques commandes permettent de résoudre 90 % des problèmes ROS 2 : le nœud tourne-t-il, le topic existe-t-il, les données passent-elles, à quelle fréquence, avec le bon type ?'),
    H4('2.4 Quality of service (QoS), in short', '2.4 La qualité de service (QoS), en bref'),
    P('Each publisher and subscriber chooses how messages are delivered. Two settings matter at the beginning:',
      'Chaque éditeur et chaque abonné choisit comment les messages sont livrés. Deux réglages comptent au début :'),
    TABLE([['Setting', 'Réglage'], ['Choice', 'Choix'], ['Use it for', 'À utiliser pour']], [
      [['Reliability', 'Fiabilité'], ['<strong>reliable</strong>: lost messages are sent again', '<strong>reliable</strong> : les messages perdus sont renvoyés'], ['commands, states, maps', 'commandes, états, cartes']],
      [['Reliability', 'Fiabilité'], ['<strong>best effort</strong>: a lost message is forgotten, the next one comes soon', '<strong>best effort</strong> : un message perdu est oublié, le suivant arrive vite'], ['fast sensors: laser, camera, IMU', 'capteurs rapides : laser, caméra, centrale inertielle']],
      [['History depth', 'Profondeur de file'], ['how many messages wait if the subscriber is slow (often 10)', 'combien de messages attendent si l\'abonné est lent (souvent 10)'], ['every topic', 'tous les topics']]
    ]),
    BOX('warn', ['A topic with no data? Check the QoS', 'Un topic sans données ? Vérifiez la QoS'],
      P('A <strong>reliable</strong> subscriber does not receive anything from a <strong>best effort</strong> publisher: the two are not compatible, and there is no error message. If <code>ros2 topic echo</code> shows data but your node receives nothing, compare the QoS with <code>ros2 topic info -v</code>.',
        'Un abonné <strong>reliable</strong> ne reçoit rien d\'un éditeur <strong>best effort</strong> : les deux ne sont pas compatibles, et il n\'y a pas de message d\'erreur. Si <code>ros2 topic echo</code> affiche des données mais que votre nœud ne reçoit rien, comparez les QoS avec <code>ros2 topic info -v</code>.'))
  ],
  terms: [['node', 'nœud'], ['topic', 'topic'], ['publisher', 'éditeur'], ['subscriber', 'abonné'], ['message type', 'type de message'], ['quality of service (QoS)', 'qualité de service (QoS)']],
  quiz: [
    ['Does a publisher know which nodes receive its messages?', 'Un éditeur sait-il quels nœuds reçoivent ses messages ?', 'No. It publishes on the topic; any number of nodes (zero, one, many) can subscribe.', 'Non. Il publie sur le topic ; n\'importe quel nombre de nœuds (zéro, un, plusieurs) peut s\'abonner.'],
    ['In a <code>Twist</code> message, which fields drive a wheeled robot forward and make it turn?', 'Dans un message <code>Twist</code>, quels champs font avancer un robot à roues et le font tourner ?', '<code>linear.x</code> in m/s (forward) and <code>angular.z</code> in rad/s (turn, positive to the left).', '<code>linear.x</code> en m/s (avancer) et <code>angular.z</code> en rad/s (tourner, positif vers la gauche).'],
    ['Which command shows how many messages per second a topic carries?', 'Quelle commande montre combien de messages par seconde transporte un topic ?', '<code>ros2 topic hz /name</code>.', '<code>ros2 topic hz /nom</code>.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Your first nodes in Python', 'Vos premiers nœuds en Python'],
  time: 14,
  goal: ['to create a workspace and a package, write a publisher and a subscriber with rclpy, build them and run them.', 'à créer un espace de travail et un paquet, écrire un éditeur et un abonné avec rclpy, les compiler et les lancer.'],
  body: [
    H4('3.1 Workspace and package', '3.1 Espace de travail et paquet'),
    UL([
      ['A <strong>package</strong> is a folder with your nodes and two description files (<code>package.xml</code>, <code>setup.py</code>). It is the unit you share and install.', 'Un <strong>paquet</strong> est un dossier avec vos nœuds et deux fichiers de description (<code>package.xml</code>, <code>setup.py</code>). C\'est l\'unité que l\'on partage et que l\'on installe.'],
      ['A <strong>workspace</strong> is a folder that holds your packages in <code>src/</code>. The tool <code>colcon</code> builds them all.', 'Un <strong>espace de travail</strong> (workspace) est un dossier qui contient vos paquets dans <code>src/</code>. L\'outil <code>colcon</code> les compile tous.']
    ]),
    CODE('ros_ws.sh'),
    H4('3.2 A publisher', '3.2 Un éditeur'),
    P('File <code>my_robot/my_robot/talker.py</code>. Read it from top to bottom: a node is a class; it creates a publisher and a timer; the timer calls <code>tick()</code>, which publishes one message.',
      'Fichier <code>my_robot/my_robot/talker.py</code>. Lisez-le de haut en bas : un nœud est une classe ; il crée un éditeur et une minuterie ; la minuterie appelle <code>tick()</code>, qui publie un message.'),
    CODE('ros_talker.py'),
    H4('3.3 A subscriber', '3.3 Un abonné'),
    P('File <code>my_robot/my_robot/listener.py</code>. The subscriber gives ROS 2 a function, called a <strong>callback</strong>: ROS 2 calls it each time a message arrives.',
      'Fichier <code>my_robot/my_robot/listener.py</code>. L\'abonné donne à ROS 2 une fonction, appelée <strong>callback</strong> (fonction de rappel) : ROS 2 l\'appelle chaque fois qu\'un message arrive.'),
    CODE('ros_listener.py'),
    BOX('idea', ['How a node really works', 'Comment un nœud fonctionne vraiment'],
      P('<code>rclpy.spin(node)</code> is a loop that waits. When a timer fires or a message arrives, it runs the matching callback, then waits again. So <strong>a callback must be short</strong>: while it runs, the node does nothing else. Never put <code>time.sleep(5)</code> or a long <code>while</code> loop inside a callback.',
        '<code>rclpy.spin(node)</code> est une boucle qui attend. Quand une minuterie sonne ou qu\'un message arrive, elle exécute le callback correspondant, puis attend de nouveau. Donc <strong>un callback doit être court</strong> : pendant qu\'il tourne, le nœud ne fait rien d\'autre. Ne mettez jamais <code>time.sleep(5)</code> ni une longue boucle <code>while</code> dans un callback.')),
    H4('3.4 The pattern of every robot node', '3.4 Le schéma de tous les nœuds de robot'),
    OL([
      ['<strong>Subscribe</strong> to the sensors: each callback only stores the last value.', '<strong>S\'abonner</strong> aux capteurs : chaque callback ne fait que mémoriser la dernière valeur.'],
      ['<strong>A timer</strong> at a fixed rate (10 to 100 Hz) reads these values, computes, and <strong>publishes</strong> the command.', '<strong>Une minuterie</strong> à fréquence fixe (10 à 100 Hz) lit ces valeurs, calcule, et <strong>publie</strong> la commande.'],
      ['This is the loop “sense, think, act” of the first course, written with ROS 2. You will use it in lesson 9.', 'C\'est la boucle « percevoir, réfléchir, agir » du premier cours, écrite avec ROS 2. Vous l\'utiliserez à la leçon 9.']
    ]),
    BOX('warn', ['Three classic mistakes', 'Trois erreurs classiques'],
      UL([
        ['You changed the code but nothing changes: you forgot <code>colcon build</code> (or use <code>--symlink-install</code> once, so Python files are linked, not copied).', 'Vous avez changé le code mais rien ne change : vous avez oublié <code>colcon build</code> (ou utilisez une fois <code>--symlink-install</code>, pour que les fichiers Python soient liés, pas copiés).'],
        ['<code>Package \'my_robot\' not found</code>: you forgot <code>source install/setup.bash</code> in this terminal.', '<code>Package \'my_robot\' not found</code> : vous avez oublié <code>source install/setup.bash</code> dans ce terminal.'],
        ['<code>No executable found</code>: the node is missing in <code>entry_points</code> of <code>setup.py</code>.', '<code>No executable found</code> : le nœud manque dans <code>entry_points</code> de <code>setup.py</code>.']
      ])),
    P('Python (<code>rclpy</code>) is perfect to learn and for most nodes. C++ (<code>rclcpp</code>) has the same ideas and the same names; it is used when speed matters (drivers, control loops, image processing).',
      'Python (<code>rclpy</code>) est parfait pour apprendre et pour la plupart des nœuds. Le C++ (<code>rclcpp</code>) a les mêmes idées et les mêmes noms ; on l\'utilise quand la vitesse compte (pilotes, boucles de commande, traitement d\'images).')
  ],
  terms: [['workspace', 'espace de travail'], ['package', 'paquet'], ['rclpy', 'rclpy'], ['callback', 'callback (fonction de rappel)'], ['timer', 'minuterie'], ['spin', 'spin']],
  quiz: [
    ['What does <code>rclpy.spin(node)</code> do?', 'Que fait <code>rclpy.spin(node)</code> ?', 'It waits, and runs the callbacks of the node (timers, messages) each time one is due, until the program is stopped.', 'Il attend, et exécute les callbacks du nœud (minuteries, messages) chaque fois que l\'un est dû, jusqu\'à l\'arrêt du programme.'],
    ['Why must a callback be short?', 'Pourquoi un callback doit-il être court ?', 'While one callback runs, the node cannot run the others: messages wait and timers are late.', 'Pendant qu\'un callback tourne, le nœud ne peut pas exécuter les autres : les messages attendent et les minuteries sont en retard.'],
    ['After <code>colcon build</code>, which command makes your package visible in a terminal?', 'Après <code>colcon build</code>, quelle commande rend votre paquet visible dans un terminal ?', '<code>source install/setup.bash</code>, from the workspace folder.', '<code>source install/setup.bash</code>, depuis le dossier de l\'espace de travail.']
  ]
})
  ];
}
