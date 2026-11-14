// ROS 2 course, lessons 7 to 9: simulation and tools; the big stacks (Nav2, MoveIt 2, ros2_control); a first project.
import { tx, P, H4, UL, OL, BOX, TABLE, FIG, CODE, lesson } from '../lib.mjs';
import { ARR, node, box, arrow, lab } from './ros-fig.mjs';
const PRE = 'ros-';

export function partC() {
  return [
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Simulation and tools: Gazebo, RViz, rosbag', 'Simulation et outils : Gazebo, RViz, rosbag'],
  time: 12,
  goal: ['to drive a simulated robot, read its sensors, and record a test to replay it later.', 'à conduire un robot simulé, lire ses capteurs, et enregistrer un essai pour le rejouer plus tard.'],
  body: [
    H4('7.1 Simulate first', '7.1 Simuler d\'abord'),
    P('A simulator replaces the real robot and its world. It publishes the <strong>same topics</strong> as the real robot (<code>/scan</code>, <code>/odom</code>, <code>/tf</code>) and listens to the same commands (<code>/cmd_vel</code>). Your nodes do not know the difference: you test at your desk, without breaking anything, then move to the real robot.',
      'Un simulateur remplace le vrai robot et son monde. Il publie les <strong>mêmes topics</strong> que le vrai robot (<code>/scan</code>, <code>/odom</code>, <code>/tf</code>) et écoute les mêmes commandes (<code>/cmd_vel</code>). Vos nœuds ne voient pas la différence : on teste à son bureau, sans rien casser, puis on passe au vrai robot.'),
    FIG('0 0 720 150', `${ARR}
      ${box(120, 40, 220, ['Gazebo (simulator)', 'Gazebo (simulateur)'], ['physics, sensors, world', 'physique, capteurs, monde'])}${box(120, 112, 220, ['real robot', 'vrai robot'], ['drivers of motors and sensors', 'pilotes des moteurs et capteurs'])}
      ${box(420, 76, 140, ['your nodes', 'vos nœuds'], ['the same code', 'le même code'])}${box(630, 76, 150, 'RViz', ['shows the data', 'montre les données'])}
      ${arrow(232, 46, 348, 68)}${arrow(232, 106, 348, 84)}${arrow(492, 76, 553, 76)}
      ${lab(296, 34, '/scan /odom', 'c-l')}${lab(296, 122, '/cmd_vel', 'c-l')}${lab(120, 80, ['one or the other', 'l\'un ou l\'autre'], 'sm')}`),
    TABLE([['Tool', 'Outil'], ['What it does', 'Ce qu\'il fait']], [
      [['<strong>Gazebo</strong>', '<strong>Gazebo</strong>'], ['Simulates physics, sensors and a 3D world. The standard free simulator with ROS 2.', 'Simule la physique, les capteurs et un monde 3D. Le simulateur libre standard avec ROS 2.']],
      [['<strong>RViz</strong>', '<strong>RViz</strong>'], ['Displays the data of the robot, simulated or real (lesson 6).', 'Affiche les données du robot, simulé ou réel (leçon 6).']],
      [['<strong>rosbag</strong>', '<strong>rosbag</strong>'], ['Records topics in a file and replays them later, like a flight recorder.', 'Enregistre des topics dans un fichier et les rejoue plus tard, comme une boîte noire.']],
      [['<strong>rqt</strong>', '<strong>rqt</strong>'], ['Small windows: the node graph, live plots, the list of parameters.', 'De petites fenêtres : le graphe des nœuds, des courbes en direct, la liste des paramètres.']],
      [['<strong>ros2 doctor</strong>', '<strong>ros2 doctor</strong>'], ['Checks the installation and the network.', 'Vérifie l\'installation et le réseau.']]
    ]),
    H4('7.2 Drive a simulated robot', '7.2 Conduire un robot simulé'),
    P('The TurtleBot 3 is a small two-wheel robot with a laser scanner, used everywhere for learning. Its simulation is free:',
      'Le TurtleBot 3 est un petit robot à deux roues avec un scanner laser, utilisé partout pour apprendre. Sa simulation est gratuite :'),
    CODE('ros_sim_cli.sh'),
    BOX('warn', ['If these packages are not available for your version', 'Si ces paquets n\'existent pas pour votre version'],
      P('The names of the simulation packages change from one distribution to the next. If <code>apt</code> does not find them, follow the TurtleBot 3 manual (emanual.robotis.com) for your distribution: the topics and the commands of this lesson stay the same.',
        'Les noms des paquets de simulation changent d\'une distribution à l\'autre. Si <code>apt</code> ne les trouve pas, suivez le manuel du TurtleBot 3 (emanual.robotis.com) pour votre distribution : les topics et les commandes de cette leçon restent les mêmes.')),
    H4('7.3 The three topics of a mobile robot', '7.3 Les trois topics d\'un robot mobile'),
    TABLE([['Topic', 'Topic'], ['Direction', 'Sens'], ['Content', 'Contenu']], [
      ['<code>/cmd_vel</code>', ['you → robot', 'vous → robot'], ['the speed you ask: <code>linear.x</code> (m/s) and <code>angular.z</code> (rad/s). The robot converts it into wheel speeds (mobile robot course).', 'la vitesse demandée : <code>linear.x</code> (m/s) et <code>angular.z</code> (rad/s). Le robot la convertit en vitesses de roues (cours robots mobiles).']],
      ['<code>/odom</code>', ['robot → you', 'robot → vous'], ['where the robot thinks it is, by counting wheel turns', 'où le robot pense être, en comptant les tours de roues']],
      ['<code>/scan</code>', ['robot → you', 'robot → vous'], ['the distances measured by the laser, one per angle', 'les distances mesurées par le laser, une par angle']]
    ]),
    BOX('example', ['Read a laser scan', 'Lire un scan laser'],
      P('A scan has <code>angle_min</code> = 0, <code>angle_increment</code> = 0.0175 rad (1°) and 360 values in <code>ranges</code>. The beam number <i>i</i> points at the angle <code>angle_min + i × angle_increment</code>: <code>ranges[0]</code> is straight ahead, <code>ranges[90]</code> is to the left, <code>ranges[180]</code> is behind. A value of <code>inf</code> means “nothing seen”.',
        'Un scan a <code>angle_min</code> = 0, <code>angle_increment</code> = 0,0175 rad (1°) et 360 valeurs dans <code>ranges</code>. Le faisceau numéro <i>i</i> pointe à l\'angle <code>angle_min + i × angle_increment</code> : <code>ranges[0]</code> est droit devant, <code>ranges[90]</code> est à gauche, <code>ranges[180]</code> est derrière. Une valeur <code>inf</code> veut dire « rien vu ».')),
    H4('7.4 Simulated time', '7.4 Le temps simulé'),
    P('A simulator can run slower or faster than a real clock. It publishes its own time on the topic <code>/clock</code>. Every node that works with a simulation must use it: set the parameter <code>use_sim_time:=true</code>. Forgetting it gives strange tf errors.',
      'Un simulateur peut tourner plus lentement ou plus vite qu\'une vraie horloge. Il publie son propre temps sur le topic <code>/clock</code>. Chaque nœud qui travaille avec une simulation doit l\'utiliser : réglez le paramètre <code>use_sim_time:=true</code>. L\'oublier donne d\'étranges erreurs de tf.'),
    BOX('idea', ['Why rosbag is precious', 'Pourquoi rosbag est précieux'],
      P('A bug that happens once an hour on the real robot is very hard to study. Record a bag during the tests: when the bug happens, you replay the exact same sensor data at your desk, as many times as you want, and you test your fix on it.',
        'Un bug qui arrive une fois par heure sur le vrai robot est très difficile à étudier. Enregistrez un « bag » pendant les essais : quand le bug arrive, vous rejouez exactement les mêmes données de capteurs à votre bureau, autant de fois que vous voulez, et vous y testez votre correction.'))
  ],
  terms: [['simulator', 'simulateur'], ['Gazebo', 'Gazebo'], ['rosbag', 'rosbag'], ['teleoperation', 'téléopération'], ['simulated time', 'temps simulé'], ['LaserScan', 'LaserScan']],
  quiz: [
    ['Why can the same node drive the simulated robot and the real one?', 'Pourquoi le même nœud peut-il piloter le robot simulé et le vrai ?', 'Both offer the same topics with the same message types; the node only knows the topics.', 'Les deux offrent les mêmes topics avec les mêmes types de messages ; le nœud ne connaît que les topics.'],
    ['Does RViz simulate the robot?', 'RViz simule-t-il le robot ?', 'No. RViz only displays the data that is published. Gazebo simulates.', 'Non. RViz ne fait qu\'afficher les données publiées. C\'est Gazebo qui simule.'],
    ['What is a rosbag used for?', 'À quoi sert un rosbag ?', 'To record topics during a test and replay them later, to analyse a problem or test a fix without the robot.', 'À enregistrer des topics pendant un essai et à les rejouer plus tard, pour analyser un problème ou tester une correction sans le robot.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['The big stacks: Nav2, MoveIt 2 and ros2_control', 'Les grandes piles logicielles : Nav2, MoveIt 2 et ros2_control'],
  time: 14,
  goal: ['what the main ready-made systems of ROS 2 do, how they fit together, and how to build a map and navigate in it.', 'ce que font les principaux systèmes tout prêts de ROS 2, comment ils s\'emboîtent, et comment construire une carte et y naviguer.'],
  body: [
    P('You now know the bricks. The strength of ROS 2 is that the hard problems of the other courses are already solved in open-source <strong>stacks</strong>: sets of nodes that you configure and launch.',
      'Vous connaissez maintenant les briques. La force de ROS 2 est que les problèmes difficiles des autres cours sont déjà résolus dans des <strong>piles logicielles</strong> libres : des ensembles de nœuds que l\'on configure et que l\'on lance.'),
    TABLE([['Stack', 'Pile'], ['Job', 'Travail'], ['Course of this site', 'Cours de ce site']], [
      [['<strong>slam_toolbox</strong>', '<strong>slam_toolbox</strong>'], ['Builds a map from the laser while the robot drives (SLAM).', 'Construit une carte avec le laser pendant que le robot roule (SLAM).'], ['Perception, planning and AI, lesson 4', 'Perception, planification et IA, leçon 4']],
      [['<strong>Nav2</strong>', '<strong>Nav2</strong>'], ['Takes a mobile robot from A to B in a map, avoiding obstacles.', 'Amène un robot mobile de A à B dans une carte, en évitant les obstacles.'], ['Perception, planning and AI, lessons 4, 5 and 7', 'Perception, planification et IA, leçons 4, 5 et 7']],
      [['<strong>MoveIt 2</strong>', '<strong>MoveIt 2</strong>'], ['Plans the motion of an arm without collision: inverse kinematics, path planning, trajectory.', 'Planifie le mouvement d\'un bras sans collision : cinématique inverse, planification de chemin, trajectoire.'], ['Robot modelling; Perception, planning and AI, lesson 6', 'Modélisation ; Perception, planification et IA, leçon 6']],
      [['<strong>ros2_control</strong>', '<strong>ros2_control</strong>'], ['The link between the controllers and the motors, in real time.', 'Le lien entre les contrôleurs et les moteurs, en temps réel.'], ['Dynamics and control', 'Dynamique et commande']],
      [['<strong>micro-ROS</strong>', '<strong>micro-ROS</strong>'], ['Puts a small ROS 2 node on a microcontroller (ESP32, STM32).', 'Met un petit nœud ROS 2 sur un microcontrôleur (ESP32, STM32).'], ['Robots in the real world, lesson 4', 'Les robots dans le monde réel, leçon 4']]
    ]),
    H4('8.1 Nav2: from A to B', '8.1 Nav2 : de A à B'),
    FIG('0 0 720 215', `${ARR}
      ${box(75, 45, 130, ['Map', 'Carte'], 'map_server')}${box(75, 115, 130, ['Localisation', 'Localisation'], 'AMCL')}${box(75, 185, 130, ['Laser', 'Laser'], '/scan')}
      ${box(290, 45, 180, ['Global planner', 'Planificateur global'], ['the whole path (A*)', 'tout le chemin (A*)'])}${box(290, 115, 180, ['Controller', 'Contrôleur'], ['follows the path', 'suit le chemin'])}${box(290, 185, 180, ['Costmaps', 'Cartes de coût'], ['where it is dangerous', 'où c\'est dangereux'])}
      ${box(545, 85, 200, ['Behaviour tree', 'Arbre de comportement'], ['decides, recovers', 'décide, récupère'])}${box(650, 180, 100, ['Robot', 'Robot'], '/cmd_vel')}
      ${arrow(142, 45, 198, 45)}${arrow(142, 115, 198, 115)}${arrow(142, 185, 198, 185)}${arrow(290, 66, 290, 93)}${arrow(290, 164, 290, 137)}${arrow(382, 124, 598, 170)}${arrow(443, 76, 382, 52)}${arrow(443, 94, 382, 110)}
      ${lab(545, 28, ['goal: NavigateToPose (action)', 'but : NavigateToPose (action)'])}${arrow(545, 36, 545, 63)}`),
    UL([
      ['<strong>Localisation</strong> (AMCL) compares the laser with the map to find where the robot is: it publishes <code>map → odom</code>.', 'La <strong>localisation</strong> (AMCL) compare le laser à la carte pour trouver où est le robot : elle publie <code>map → odom</code>.'],
      ['The <strong>costmaps</strong> are grids that mark the walls and the obstacles seen right now, enlarged by the size of the robot.', 'Les <strong>cartes de coût</strong> (costmaps) sont des grilles qui marquent les murs et les obstacles vus à l\'instant, agrandis de la taille du robot.'],
      ['The <strong>global planner</strong> finds the whole path in the map; the <strong>controller</strong> follows it and publishes <code>/cmd_vel</code> 20 times per second.', 'Le <strong>planificateur global</strong> trouve tout le chemin dans la carte ; le <strong>contrôleur</strong> le suit et publie <code>/cmd_vel</code> 20 fois par seconde.'],
      ['A <strong>behaviour tree</strong> runs the whole: plan, follow, and if the robot is stuck, clear the map, turn, back up, try again.', 'Un <strong>arbre de comportement</strong> orchestre le tout : planifier, suivre, et si le robot est bloqué, effacer la carte, tourner, reculer, réessayer.']
    ]),
    P('Build a map with slam_toolbox, save it, then navigate in it:', 'Construisez une carte avec slam_toolbox, enregistrez-la, puis naviguez dedans :'),
    CODE('ros_nav_cli.sh'),
    H4('8.2 MoveIt 2: move an arm without collision', '8.2 MoveIt 2 : bouger un bras sans collision'),
    OL([
      ['It reads the <strong>URDF</strong> of the arm and a description of the obstacles.', 'Il lit l\'<strong>URDF</strong> du bras et une description des obstacles.'],
      ['You give a target for the tool. MoveIt solves the <strong>inverse kinematics</strong>.', 'Vous donnez une cible pour l\'outil. MoveIt résout la <strong>cinématique inverse</strong>.'],
      ['It <strong>plans a path</strong> in the joint space that touches nothing (RRT and its cousins).', 'Il <strong>planifie un chemin</strong> dans l\'espace articulaire qui ne touche rien (RRT et ses cousins).'],
      ['It turns the path into a <strong>trajectory</strong> with speeds and accelerations inside the limits.', 'Il transforme le chemin en <strong>trajectoire</strong> avec des vitesses et accélérations dans les limites.'],
      ['It sends it to the arm with the action <code>FollowJointTrajectory</code>.', 'Il l\'envoie au bras avec l\'action <code>FollowJointTrajectory</code>.']
    ]),
    H4('8.3 ros2_control: the last metre before the motors', '8.3 ros2_control : le dernier mètre avant les moteurs'),
    P('<strong>ros2_control</strong> separates two things. A <strong>hardware interface</strong> talks to the real motors (or to the simulator): it reads positions and writes commands. <strong>Controllers</strong> are plugged on top: <code>diff_drive_controller</code> turns <code>/cmd_vel</code> into wheel speeds and computes the odometry; <code>joint_trajectory_controller</code> follows the trajectories of MoveIt. To change the robot you only change the hardware interface.',
      '<strong>ros2_control</strong> sépare deux choses. Une <strong>interface matérielle</strong> parle aux vrais moteurs (ou au simulateur) : elle lit les positions et écrit les commandes. Des <strong>contrôleurs</strong> se branchent dessus : <code>diff_drive_controller</code> transforme <code>/cmd_vel</code> en vitesses de roues et calcule l\'odométrie ; <code>joint_trajectory_controller</code> suit les trajectoires de MoveIt. Pour changer de robot, on ne change que l\'interface matérielle.'),
    BOX('warn', ['ROS 2 and safety', 'ROS 2 et la sécurité'],
      P('These stacks are powerful but they are <strong>not certified safety systems</strong>. A node can crash, a message can be late. The emergency stop, the safety laser scanner and the speed limits of a real robot stay in certified hardware, outside ROS 2 (see the lesson on safety in “Robots in the real world”).',
        'Ces piles sont puissantes mais ce ne sont <strong>pas des systèmes de sécurité certifiés</strong>. Un nœud peut planter, un message peut arriver en retard. L\'arrêt d\'urgence, le scanner laser de sécurité et les limites de vitesse d\'un vrai robot restent dans du matériel certifié, hors de ROS 2 (voir la leçon sur la sécurité dans « Les robots dans le monde réel »).'))
  ],
  terms: [['SLAM', 'SLAM'], ['Nav2', 'Nav2'], ['AMCL', 'AMCL'], ['costmap', 'carte de coût'], ['MoveIt 2', 'MoveIt 2'], ['ros2_control', 'ros2_control'], ['hardware interface', 'interface matérielle']],
  quiz: [
    ['In Nav2, which part publishes <code>/cmd_vel</code>?', 'Dans Nav2, quelle partie publie <code>/cmd_vel</code> ?', 'The controller (local planner): it follows the global path and avoids the obstacles seen right now.', 'Le contrôleur (planificateur local) : il suit le chemin global et évite les obstacles vus à l\'instant.'],
    ['What does MoveIt 2 need to know about the arm?', 'Que doit savoir MoveIt 2 sur le bras ?', 'Its URDF (links, joints, limits, shapes for collisions) and how to send it a trajectory.', 'Son URDF (segments, liaisons, limites, formes pour les collisions) et comment lui envoyer une trajectoire.'],
    ['Why is the emergency stop not a ROS 2 node?', 'Pourquoi l\'arrêt d\'urgence n\'est-il pas un nœud ROS 2 ?', 'Safety must not depend on software that can crash or be late: it uses certified hardware that cuts the power.', 'La sécurité ne doit pas dépendre d\'un logiciel qui peut planter ou être en retard : elle utilise du matériel certifié qui coupe l\'énergie.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 9
lesson(PRE, 9, {
  title: ['Project: a robot that drives and avoids obstacles', 'Projet : un robot qui roule et évite les obstacles'],
  time: 15,
  goal: ['to write a complete node that reads the laser and drives the robot, test it in simulation, and know what to learn next.', 'à écrire un nœud complet qui lit le laser et conduit le robot, le tester en simulation, et savoir quoi apprendre ensuite.'],
  body: [
    H4('9.1 The plan', '9.1 Le plan'),
    P('The robot drives straight ahead. When the laser sees an obstacle closer than 40 cm in front, the robot turns on the spot until the way is free. It is the loop <strong>sense → think → act</strong>:',
      'Le robot roule droit devant. Quand le laser voit un obstacle à moins de 40 cm devant, le robot tourne sur place jusqu\'à ce que la voie soit libre. C\'est la boucle <strong>percevoir → réfléchir → agir</strong> :'),
    FIG('0 0 720 110', `${ARR}
      ${box(80, 55, 130, ['Laser', 'Laser'], ['sense', 'percevoir'])}${box(360, 55, 220, 'safe_driver', ['think: free or blocked?', 'réfléchir : libre ou bloqué ?'])}${box(640, 55, 130, ['Wheels', 'Roues'], ['act', 'agir'])}
      ${arrow(147, 55, 248, 55)}${arrow(472, 55, 573, 55)}
      ${lab(197, 45, '/scan', 'c-l')}${lab(522, 45, '/cmd_vel', 'c-l')}`),
    H4('9.2 The node', '9.2 Le nœud'),
    P('File <code>my_robot/my_robot/safe_driver.py</code> (declare it in <code>setup.py</code>, and add <code>geometry_msgs</code> and <code>sensor_msgs</code> to <code>package.xml</code>). It follows the pattern of lesson 3: the laser callback only stores the nearest distance in front; a 10 Hz timer decides and publishes.',
      'Fichier <code>my_robot/my_robot/safe_driver.py</code> (déclarez-le dans <code>setup.py</code>, et ajoutez <code>geometry_msgs</code> et <code>sensor_msgs</code> à <code>package.xml</code>). Il suit le schéma de la leçon 3 : le callback du laser ne fait que mémoriser la distance la plus proche devant ; une minuterie à 10 Hz décide et publie.'),
    CODE('ros_stop.py'),
    UL([
      ['<code>qos_profile_sensor_data</code> is the <strong>best effort</strong> QoS of lesson 2: it matches what laser drivers publish.', '<code>qos_profile_sensor_data</code> est la QoS <strong>best effort</strong> de la leçon 2 : elle correspond à ce que publient les pilotes de laser.'],
      ['The two parameters let you tune the robot without editing the code.', 'Les deux paramètres permettent de régler le robot sans modifier le code.'],
      ['When the node stops, it publishes a zero speed: never leave a robot with its last command.', 'Quand le nœud s\'arrête, il publie une vitesse nulle : ne laissez jamais un robot avec sa dernière commande.']
    ]),
    H4('9.3 Test it', '9.3 Le tester'),
    '<pre class="code"><code>ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py          # terminal 1\nros2 run my_robot safe_driver --ros-args -p use_sim_time:=true    # terminal 2\nros2 param set /safe_driver speed 0.25                            # terminal 3: go faster\nros2 topic echo /cmd_vel                                          #             see the commands</code></pre>',
    BOX('warn', ['If the robot does not move', 'Si le robot ne bouge pas'],
      P('Type <code>ros2 topic info /cmd_vel</code>. On recent distributions some robots, the TurtleBot 3 among them, expect the type <code>geometry_msgs/msg/TwistStamped</code> (a Twist with a time stamp) instead of <code>Twist</code>. In that case publish a <code>TwistStamped</code>: fill <code>msg.header.stamp = self.get_clock().now().to_msg()</code> and put the speeds in <code>msg.twist</code>. The two types on the same topic do not connect, and there is no error message.',
        'Tapez <code>ros2 topic info /cmd_vel</code>. Sur les distributions récentes, certains robots, dont le TurtleBot 3, attendent le type <code>geometry_msgs/msg/TwistStamped</code> (un Twist avec une date) au lieu de <code>Twist</code>. Dans ce cas, publiez un <code>TwistStamped</code> : remplissez <code>msg.header.stamp = self.get_clock().now().to_msg()</code> et mettez les vitesses dans <code>msg.twist</code>. Les deux types sur le même topic ne se connectent pas, et il n\'y a pas de message d\'erreur.')),
    BOX('lab', ['Make it better', 'Améliorez-le'],
      OL([
        ['Turn to the side where there is more free space (compare the beams on the left and on the right).', 'Tournez du côté où il y a le plus d\'espace libre (comparez les faisceaux de gauche et de droite).'],
        ['Slow down when the obstacle gets close: speed proportional to the distance (a P controller, like in the control course).', 'Ralentissez quand l\'obstacle approche : vitesse proportionnelle à la distance (un correcteur P, comme dans le cours de commande).'],
        ['Write a launch file that starts the simulation and your node with a YAML file of parameters.', 'Écrivez un fichier de lancement qui démarre la simulation et votre nœud avec un fichier YAML de paramètres.'],
        ['Record a bag of <code>/scan</code> and <code>/cmd_vel</code>, and replay it to check your logic without the simulator.', 'Enregistrez un bag de <code>/scan</code> et <code>/cmd_vel</code>, et rejouez-le pour vérifier votre logique sans le simulateur.']
      ])),
    H4('9.4 Where to go next', '9.4 Et ensuite ?'),
    TABLE([['If you want to…', 'Si vous voulez…'], ['Learn', 'Apprenez'], ['On this site', 'Sur ce site']], [
      [['make a mobile robot navigate', 'faire naviguer un robot mobile'], ['Nav2, slam_toolbox, robot_localization (Kalman filter)', 'Nav2, slam_toolbox, robot_localization (filtre de Kalman)'], ['Wheeled mobile robots', 'Robots mobiles à roues']],
      [['control a robot arm', 'piloter un bras robot'], ['MoveIt 2, ros2_control', 'MoveIt 2, ros2_control'], ['Robot modelling; Dynamics and control', 'Modélisation ; Dynamique et commande']],
      [['use a camera', 'utiliser une caméra'], ['image_transport, cv_bridge with OpenCV', 'image_transport, cv_bridge avec OpenCV'], ['Perception, planning and AI', 'Perception, planification et IA']],
      [['build a real robot', 'construire un vrai robot'], ['micro-ROS, a URDF of your robot, a hardware interface', 'micro-ROS, un URDF de votre robot, une interface matérielle'], ['Robots in the real world', 'Les robots dans le monde réel']]
    ]),
    P('The official tutorials on <strong>docs.ros.org</strong> follow the same order as this course and go further on every point. Do them with the simulator open.',
      'Les tutoriels officiels sur <strong>docs.ros.org</strong> suivent le même ordre que ce cours et vont plus loin sur chaque point. Faites-les avec le simulateur ouvert.')
  ],
  terms: [['control loop', 'boucle de commande'], ['sensor QoS', 'QoS capteur'], ['TwistStamped', 'TwistStamped'], ['teleoperation', 'téléopération']],
  quiz: [
    ['Why does the laser callback only store a value instead of driving the robot?', 'Pourquoi le callback du laser ne fait-il que mémoriser une valeur au lieu de conduire le robot ?', 'Callbacks must stay short, and the command must be sent at a regular rate by the timer, even if a scan is late.', 'Les callbacks doivent rester courts, et la commande doit être envoyée à un rythme régulier par la minuterie, même si un scan est en retard.'],
    ['Why publish a zero speed when the node stops?', 'Pourquoi publier une vitesse nulle quand le nœud s\'arrête ?', 'Otherwise the robot may keep executing the last command it received.', 'Sinon le robot peut continuer à exécuter la dernière commande reçue.'],
    ['The node publishes <code>Twist</code> but the robot expects <code>TwistStamped</code>. What happens?', 'Le nœud publie <code>Twist</code> mais le robot attend <code>TwistStamped</code>. Que se passe-t-il ?', 'Nothing: the types differ, so the publisher and the subscriber do not connect, and the robot does not move.', 'Rien : les types diffèrent, l\'éditeur et l\'abonné ne se connectent donc pas, et le robot ne bouge pas.']
  ]
})
  ];
}
