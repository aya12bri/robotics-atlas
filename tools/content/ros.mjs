// Course 9 — ROS 2 from zero
import { tx, P, BOX, TABLE } from '../lib.mjs';
import { partA } from './ros-a.mjs';
import { partB } from './ros-b.mjs';
import { partC } from './ros-c.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  const head = {
    title: tx('ROS 2 from zero', 'ROS 2 depuis zéro'),
    lead: tx('ROS 2 is the software that most research, service and mobile robots run on. This course starts from nothing: what ROS 2 is, nodes and topics, your first nodes in Python, services and actions, launch files, frames and the robot model, simulation, the big navigation and arm stacks, and a first complete project. You only need basic Python and a computer with Ubuntu.',
      'ROS 2 est le logiciel sur lequel tournent la plupart des robots de recherche, de service et mobiles. Ce cours part de rien : ce qu\'est ROS 2, les nœuds et les topics, vos premiers nœuds en Python, les services et les actions, les fichiers de lancement, les repères et le modèle du robot, la simulation, les grandes piles de navigation et de bras, et un premier projet complet. Il vous faut seulement des bases de Python et un ordinateur sous Ubuntu.'),
    intro: BOX('idea', ['How to follow this course', 'Comment suivre ce cours'],
      P('ROS 2 is learned <strong>with the keyboard</strong>. Each lesson gives commands and short programs: type them, run them, change a value and see what happens. Lessons 1 to 5 need only ROS 2; lessons 6 to 9 use a free simulator, so you do not need a real robot.',
        'ROS 2 s\'apprend <strong>au clavier</strong>. Chaque leçon donne des commandes et de courts programmes : tapez-les, lancez-les, changez une valeur et regardez ce qui se passe. Les leçons 1 à 5 ne demandent que ROS 2 ; les leçons 6 à 9 utilisent un simulateur gratuit, vous n\'avez donc pas besoin d\'un vrai robot.'),
      P('The programs of this course follow the official ROS 2 interfaces (Jazzy). The logic of the final project was checked by running it on simulated laser data; the commands depend on your installation, so read the error messages: the “classic mistakes” boxes cover the most frequent ones.',
        'Les programmes de ce cours suivent les interfaces officielles de ROS 2 (Jazzy). La logique du projet final a été vérifiée en l\'exécutant sur des données laser simulées ; les commandes dépendent de votre installation, lisez donc les messages d\'erreur : les encadrés « erreurs classiques » couvrent les plus fréquentes.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Node', 'Nœud'], ['One running program that does one job.', 'Un programme en cours d\'exécution qui fait un seul travail.']],
      [['Topic', 'Topic'], ['A named channel where nodes publish and receive messages.', 'Un canal nommé où les nœuds publient et reçoivent des messages.']],
      [['Message', 'Message'], ['One piece of data with a fixed type (fields with names).', 'Une donnée avec un type fixe (des champs nommés).']],
      [['Service', 'Service'], ['A request and its answer between two nodes.', 'Une requête et sa réponse entre deux nœuds.']],
      [['Action', 'Action'], ['A long task with a goal, feedback and a result, that can be cancelled.', 'Une tâche longue avec un but, un retour d\'avancement et un résultat, que l\'on peut annuler.']],
      [['Parameter', 'Paramètre'], ['A named setting of a node.', 'Un réglage nommé d\'un nœud.']],
      [['QoS', 'QoS'], ['Quality of service: how messages are delivered (reliable or best effort, queue size).', 'Qualité de service : comment les messages sont livrés (reliable ou best effort, taille de file).']],
      [['Package', 'Paquet'], ['A folder with nodes, launch files and description files; the unit that is built and shared.', 'Un dossier avec des nœuds, des fichiers de lancement et des fichiers de description ; l\'unité que l\'on compile et partage.']],
      [['Workspace', 'Espace de travail'], ['The folder that holds your packages and where colcon builds them.', 'Le dossier qui contient vos paquets et où colcon les compile.']],
      [['colcon', 'colcon'], ['The build tool of ROS 2.', 'L\'outil de compilation de ROS 2.']],
      [['Launch file', 'Fichier de lancement'], ['A file that starts several nodes with their settings.', 'Un fichier qui démarre plusieurs nœuds avec leurs réglages.']],
      [['Namespace', 'Espace de noms'], ['A prefix added to the names of a node, to separate robots.', 'Un préfixe ajouté aux noms d\'un nœud, pour séparer des robots.']],
      [['tf2', 'tf2'], ['The library that keeps the tree of frames and computes the transform between any two of them.', 'La bibliothèque qui tient l\'arbre des repères et calcule la transformation entre deux d\'entre eux.']],
      [['URDF', 'URDF'], ['An XML file that describes the links and joints of a robot.', 'Un fichier XML qui décrit les segments et les liaisons d\'un robot.']],
      [['RViz', 'RViz'], ['The 3D viewer that displays the data of the robot.', 'Le visualiseur 3D qui affiche les données du robot.']],
      [['Gazebo', 'Gazebo'], ['The simulator: physics, sensors and a 3D world.', 'Le simulateur : physique, capteurs et monde 3D.']],
      [['rosbag', 'rosbag'], ['A recording of topics that can be replayed.', 'Un enregistrement de topics que l\'on peut rejouer.']],
      [['Nav2', 'Nav2'], ['The navigation stack for mobile robots.', 'La pile de navigation pour robots mobiles.']],
      [['MoveIt 2', 'MoveIt 2'], ['The motion planning stack for arms.', 'La pile de planification de mouvement pour les bras.']],
      [['ros2_control', 'ros2_control'], ['The layer between controllers and motors.', 'La couche entre les contrôleurs et les moteurs.']]
    ]),
    finish: {
      h: tx('You can now read and write ROS 2!', 'Vous savez maintenant lire et écrire du ROS 2 !'),
      p: tx('Install it, redo the project of lesson 9 in the simulator, then pick a stack: Nav2 for a mobile robot, MoveIt 2 for an arm.', 'Installez-le, refaites le projet de la leçon 9 dans le simulateur, puis choisissez une pile : Nav2 pour un robot mobile, MoveIt 2 pour un bras.'),
      next: ['learn-mobile.html', tx('Go to the wheeled mobile robots course →', 'Aller au cours sur les robots mobiles à roues →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}
