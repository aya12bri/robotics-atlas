// links.mjs — the links between the lessons of the different courses, read by tools/build-search.mjs (→ links-data.js → nav.js).
// Each edge is [A, B, why]: lesson A prepares lesson B ("revise A first" in B, "go further with B" in A).
// A lesson is 'course key:number' (the keys of tools/courses.mjs). "why" says, in both languages, what A brings to B.
export const EDGES = [
  // ---------------------------------------------------------------- Data fusion and the Kalman filter
  ['mk:10', 'kf:2', ['mean, variance and the Gaussian bell, the basis of covariance', 'moyenne, variance et cloche de Gauss, la base de la covariance']],
  ['mk:3', 'kf:3', ['the matrix products and inverses used by the estimator', 'les produits et inverses de matrices utilisés par l\'estimateur']],
  ['ai:1', 'kf:1', ['the sensors of a robot and what each one measures', 'les capteurs d\'un robot et ce que mesure chacun']],
  ['ai:3', 'kf:4', ['a first, intuitive Kalman filter in one dimension', 'un premier filtre de Kalman intuitif, en une dimension']],
  ['kf:6', 'ai:4', ['the EKF that runs inside localisation and SLAM', 'l\'EKF qui tourne au cœur de la localisation et du SLAM']],
  ['kf:6', 'wmr:15', ['the EKF theory, applied here to a wheeled robot', 'la théorie de l\'EKF, appliquée ici à un robot à roues']],
  ['wmr:14', 'kf:8', ['odometry, the prediction step of most fusions', 'l\'odométrie, l\'étape de prédiction de la plupart des fusions']],
  ['mk:9', 'kf:6', ['partial derivatives, to linearise the models', 'les dérivées partielles, pour linéariser les modèles']],
  ['kf:7', 'adv:5', ['position estimation for drones', 'l\'estimation de position pour les drones']],
  // ---------------------------------------------------------------- Mechanical transmissions and grippers
  ['learn:10', 'tr:1', ['actuators, sensors and control in a few words', 'actionneurs, capteurs et commande en quelques mots']],
  ['tr:7', 'ctrl:2', ['the same sizing, with the motor curves and the control', 'le même dimensionnement, avec les courbes des moteurs et la commande']],
  ['tr:4', 'ctrl:9', ['backlash, seen from the control side: limit cycles, friction', 'le jeu, vu du côté de la commande : cycles limites, frottement']],
  ['tr:6', 'world:2', ['the reducers inside the joints of a real robot', 'les réducteurs dans les articulations d\'un vrai robot']],
  ['tr:8', 'world:3', ['every family of end effectors and tools', 'toutes les familles d\'effecteurs et d\'outils']],
  ['tr:8', 'adv:8', ['choosing and testing a gripper in practice', 'choisir et tester une pince en pratique']],
  ['ctrl:1', 'tr:7', ['torque, inertia and the equation of motion', 'couple, inertie et équation du mouvement']],
  ['learn:5', 'tr:8', ['what an end effector is', 'ce qu\'est un effecteur']],
  // ---------------------------------------------------------------- Workspaces, motion modes and parallel robots
  ['mk:11', 'par:1', ['Euler angles and roll-pitch-yaw in detail', 'les angles d\'Euler et le roulis-tangage-lacet en détail']],
  ['model:2', 'par:1', ['the orientation with three angles, step by step', 'l\'orientation avec trois angles, pas à pas']],
  ['maths:4', 'par:1', ['the two-joint arm, its direct and inverse models', 'le bras à deux articulations, ses modèles direct et inverse']],
  ['par:1', 'model:7', ['the same two spaces, in the full modelling course', 'les mêmes deux espaces, dans le cours complet de modélisation']],
  ['learn:9', 'par:2', ['the workspace explained simply', 'l\'espace de travail expliqué simplement']],
  ['par:2', 'sing:2', ['why the border between two aspects is a singularity', 'pourquoi la frontière entre deux aspects est une singularité']],
  ['par:3', 'ctrl:7', ['PTP, linear, circular and spline trajectories in detail', 'les trajectoires PTP, linéaires, circulaires et splines en détail']],
  ['model:9', 'par:3', ['the speed laws behind each motion', 'les lois de vitesse derrière chaque déplacement']],
  ['model:6', 'par:4', ['how the inverse model is solved', 'comment le modèle inverse se résout']],
  ['par:4', 'sing:7', ['redundancy at the level of speeds: the null space', 'la redondance au niveau des vitesses : le noyau']],
  ['learn:4', 'par:5', ['degrees of freedom, the base of mobility', 'les degrés de liberté, la base de la mobilité']],
  ['par:5', 'adv:1', ['the Delta and the Stewart platform in detail', 'le Delta et la plateforme de Stewart en détail']],
  ['model:8', 'par:6', ['the Jacobian of a serial robot', 'la jacobienne d\'un robot série']],
  ['sing:2', 'par:6', ['what a singularity is, for a serial robot', 'ce qu\'est une singularité, pour un robot série']],
  ['par:6', 'sing:8', ['how to detect and avoid singularities', 'comment détecter et éviter les singularités']],
  ['armlab:4', 'par:6', ['Newton’s method in code, for a serial arm', 'la méthode de Newton en code, pour un bras série']],
  // ---------------------------------------------------------------- Teleoperation, cobotics, safety
  ['ctrl:6', 'tel:2', ['impedance and compliance control', 'la commande en impédance et en compliance']],
  ['ctrl:11', 'tel:6', ['poles and stability, before adding a delay', 'pôles et stabilité, avant d\'ajouter un retard']],
  ['tel:11', 'world:6', ['the standards seen from the factory floor', 'les normes vues depuis l\'atelier']],
  ['tel:9', 'ros:1', ['a real software architecture for robots', 'une vraie architecture logicielle pour robots']],
  // ---------------------------------------------------------------- the older courses, between themselves
  ['mk:4', 'model:1', ['rotation matrices from zero', 'les matrices de rotation depuis zéro']],
  ['mk:7', 'model:4', ['the modified DH method, alone', 'la méthode DH modifiée, seule']],
  ['model:8', 'sing:1', ['the Jacobian, before its singularities', 'la jacobienne, avant ses singularités']],
  ['model:6', 'armlab:3', ['the inverse model, now in Python', 'le modèle inverse, maintenant en Python']],
  ['ctrl:4', 'adv:2', ['PID first, optimal control next', 'le PID d\'abord, la commande optimale ensuite']],
  ['wmr:5', 'wmr:11', ['the kinematics that the controller inverts', 'la cinématique que le contrôleur inverse']],
  ['ai:5', 'wmr:13', ['A* and Dijkstra before nonholonomic planning', 'A* et Dijkstra avant la planification non holonome']],
  ['ros:8', 'wmr:17', ['Nav2 and ros2_control in general', 'Nav2 et ros2_control en général']]
];
