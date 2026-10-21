// Course 7 — Robots in the real world
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
import { partA } from './w-a.mjs';
import { partB } from './w-b.mjs';
import { partC } from './w-c.mjs';

export const meta = {};
export function build() {
  const head = {
    title: tx('Robots in the real world', 'Les robots dans le monde réel'),
    lead: tx('Everything around the maths: every family of robots (from arms to drones, legs and soft robots), the mechanical design, the grippers, the electronics, the software and ROS, safety and standards, calibration, how to choose a robot for a job, and how to build your own career or project. This is the course that turns a student into an engineer.',
      'Tout ce qu\'il y a autour des maths : toutes les familles de robots (des bras aux drones, pattes et robots souples), la conception mécanique, les pinces, l\'électronique, le logiciel et ROS, la sécurité et les normes, l\'étalonnage, comment choisir un robot pour un travail, et comment construire sa propre carrière ou son projet. C\'est le cours qui transforme un étudiant en ingénieur.'),
    intro: BOX('idea', ['A robot is a system', 'Un robot est un système'],
      P('A real robot is never only kinematics. It is a <strong>system</strong> where mechanics, electronics, software, safety and the application must work together. Most failures of robot projects do not come from a wrong inverse kinematics, but from a gripper that does not grip, a cable that breaks, a missing safety study or a badly chosen robot.',
        'Un vrai robot n\'est jamais seulement de la cinématique. C\'est un <strong>système</strong> où mécanique, électronique, logiciel, sécurité et application doivent fonctionner ensemble. La plupart des échecs de projets de robots ne viennent pas d\'une mauvaise cinématique inverse, mais d\'une pince qui ne serre pas, d\'un câble qui casse, d\'une étude de sécurité manquante ou d\'un robot mal choisi.'),
      P('This last course follows the life of a robot project: <strong>choose</strong> the family (1), <strong>design</strong> the body (2, 3), <strong>power and wire</strong> it (4), <strong>program</strong> it (5), make it <strong>safe</strong> (6), <strong>calibrate and test</strong> it (7), <strong>deploy</strong> it for an application (8) and <strong>grow</strong> your skills (9).',
        'Ce dernier cours suit la vie d\'un projet de robot : <strong>choisir</strong> la famille (1), <strong>concevoir</strong> le corps (2, 3), l\'<strong>alimenter et le câbler</strong> (4), le <strong>programmer</strong> (5), le rendre <strong>sûr</strong> (6), l\'<strong>étalonner et le tester</strong> (7), le <strong>déployer</strong> pour une application (8) et <strong>progresser</strong> (9).')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: glossary(),
    finish: {
      h: tx('You have the whole map of robotics!', 'Vous avez toute la carte de la robotique !'),
      p: tx('Go back to the roadmap, pick the pages you skipped, and start your own robot. The best way to know a robot is to build one.', 'Retournez au parcours, choisissez les pages que vous avez sautées, et lancez votre propre robot. La meilleure façon de connaître un robot est d\'en construire un.'),
      next: ['index.html#start', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}

function glossary() {
  return TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
    [['Support polygon', 'Polygone de sustentation'], ['The area between the feet of a legged robot; it is stable if the centre of mass is above it.', 'La surface entre les pieds d\'un robot à pattes ; il est stable si le centre de masse est au-dessus.']],
    [['Underactuated', 'Sous-actionné'], ['Fewer actuators than degrees of freedom (a quadrotor: 4 inputs, 6 DOF).', 'Moins d\'actionneurs que de degrés de liberté (un quadrirotor : 4 entrées, 6 DDL).']],
    [['Payload', 'Charge utile'], ['The maximum mass the robot can carry at its flange, including the gripper in most data sheets.', 'La masse maximale que le robot peut porter à sa bride, avec la pince dans la plupart des fiches techniques.']],
    [['TCP', 'TCP'], ['Tool centre point: the working point of the tool, defined by a frame.', 'Point central de l\'outil : le point de travail de l\'outil, défini par un repère.']],
    [['Force closure', 'Fermeture de forme/force'], ['A grasp that can resist any external force and torque.', 'Une prise qui peut résister à toute force et tout couple extérieurs.']],
    [['Friction cone', 'Cône de frottement'], ['The set of contact forces that do not slip: its half-angle is arctan μ.', 'L\'ensemble des forces de contact qui ne glissent pas : son demi-angle est arctan μ.']],
    [['FOC', 'FOC'], ['Field-oriented control, the standard way of driving a brushless motor.', 'Commande vectorielle, la façon standard de piloter un moteur sans balais.']],
    [['CAN / EtherCAT', 'CAN / EtherCAT'], ['Industrial communication buses between controllers, drives and sensors.', 'Bus de communication industriels entre contrôleurs, variateurs et capteurs.']],
    [['ROS 2', 'ROS 2'], ['The open-source robotics middleware: nodes exchanging messages by topics, services and actions.', 'L\'intergiciel robotique open source : des nœuds échangeant des messages par topics, services et actions.']],
    [['URDF', 'URDF'], ['An XML file that describes the links, joints and shapes of a robot.', 'Un fichier XML qui décrit les corps, articulations et formes d\'un robot.']],
    [['Digital twin', 'Jumeau numérique'], ['A simulation model kept in line with the real robot or cell.', 'Un modèle de simulation tenu en cohérence avec le vrai robot ou la cellule.']],
    [['Risk assessment', 'Analyse de risques'], ['The structured study of hazards, their severity and probability, and the measures to reduce them.', 'L\'étude structurée des dangers, de leur gravité et probabilité, et des mesures pour les réduire.']],
    [['Collaborative modes', 'Modes collaboratifs'], ['The four ways of ISO/TS 15066: safety-rated monitored stop, hand guiding, speed and separation monitoring, power and force limiting.', 'Les quatre modes de l\'ISO/TS 15066 : arrêt de sécurité contrôlé, guidage manuel, surveillance de vitesse et de distance, limitation de puissance et de force.']],
    [['Performance level (PL)', 'Niveau de performance (PL)'], ['A rating (a to e) of the reliability of a safety function (ISO 13849).', 'Une note (a à e) de la fiabilité d\'une fonction de sécurité (ISO 13849).']],
    [['Repeatability / accuracy', 'Répétabilité / exactitude'], ['How well the robot returns to the same point / how close it is to the commanded point.', 'À quel point le robot revient au même point / à quel point il est proche du point commandé.']],
    [['ISO 9283', 'ISO 9283'], ['The standard that defines how to measure the performance of industrial robots.', 'La norme qui définit comment mesurer les performances des robots industriels.']],
    [['ROI / payback', 'ROI / retour sur investissement'], ['The time needed for the savings to pay for the robot cell.', 'Le temps nécessaire pour que les économies paient la cellule robotisée.']],
    [['Systems integrator', 'Intégrateur'], ['A company that designs and installs a complete robotic cell around a robot.', 'Une entreprise qui conçoit et installe une cellule robotisée complète autour d\'un robot.']]
  ]);
}
