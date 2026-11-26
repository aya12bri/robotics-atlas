// courses.mjs — the list of courses (cards shown at the top of every course page) and the new course builders.
import { tx } from './lib.mjs';

export const CARDS = [
  { page: 'learn.html', key: 'learn', prefix: 'lesson-', total: 12, t: ['Foundations', 'Les fondations'], d: ['12 short lessons: the ideas behind every robot', '12 leçons courtes : les idées derrière tous les robots'] },
  { page: 'learn-python.html', key: 'py', prefix: 'py-', total: 8, t: ['Python for robotics', 'Python pour la robotique'], d: ['From zero: variables, angles, loops, functions, lists, NumPy, plots, classes and a first controller', 'Depuis zéro : variables, angles, boucles, fonctions, listes, NumPy, graphiques, classes et un premier correcteur'] },
  { page: 'learn-electronics.html', key: 'el', prefix: 'el-', total: 8, t: ['Electronics and Arduino', 'Électronique et Arduino'], d: ['From zero: Ohm\'s law, batteries, Arduino, sensors, PWM, H-bridge and encoder, servos, steppers and a first robot', 'Depuis zéro : loi d\'Ohm, batteries, Arduino, capteurs, PWM, pont en H et codeur, servos, pas à pas et un premier robot'] },
  { page: 'learn-mathkit.html', key: 'mk', prefix: 'mk-', total: 11, t: ['The maths of robotics', 'Les maths de la robotique'], d: ['One tool per lesson: trigonometry, vectors, matrices, rotations, transformations, DH, DHM, derivatives, probability, quaternions', 'Un outil par leçon : trigonométrie, vecteurs, matrices, rotations, transformations, DH, DHM, dérivées, probabilités, quaternions'] },
  { page: 'learn-maths.html', key: 'maths', prefix: 'maths-', total: 8, t: ['Maths and motion, step by step', 'Maths et mouvement, pas à pas'], d: ['Applied: the 2-axis arm from A to Z, its direct and inverse models, its motion laws', 'Appliqué : le bras à 2 axes de A à Z, ses modèles direct et inverse, ses lois de mouvement'] },
  { page: 'learn-model.html', key: 'model', prefix: 'model-', total: 11, t: ['Robot modelling, full course', "Modélisation d'un robot, cours complet"], d: ['Master level: rotations, DHm, MGD, MGI, Jacobian, dynamics', 'Niveau Master : rotations, DHm, MGD, MGI, jacobienne, dynamique'] },
  { page: 'learn-singularities.html', key: 'sing', prefix: 'sing-', total: 8, t: ['Singularities and the Jacobian', 'Singularités et jacobienne'], d: ['Speeds, forces, lost directions, gimbal lock, redundancy', 'Vitesses, forces, directions perdues, blocage de cardan, redondance'] },
  { page: 'learn-control.html', key: 'ctrl', prefix: 'ctrl-', total: 12, t: ['Dynamics, actuators and control', 'Dynamique, actionneurs et commande'], d: ['Motors, sensors, PID, computed torque, force control, trajectories', 'Moteurs, capteurs, PID, couple calculé, commande en effort, trajectoires'] },
  { page: 'learn-intelligence.html', key: 'ai', prefix: 'ai-', total: 9, t: ['Perception, planning and AI', 'Perception, planification et IA'], d: ['Vision, Kalman, SLAM, A*, RRT, learning, multi-robot', 'Vision, Kalman, SLAM, A*, RRT, apprentissage, multi-robots'] },
  { page: 'learn-world.html', key: 'world', prefix: 'world-', total: 9, t: ['Robots in the real world', 'Les robots dans le monde réel'], d: ['Every robot family, grippers, electronics, ROS, safety, careers', 'Toutes les familles de robots, pinces, électronique, ROS, sécurité, métiers'] },
  { page: 'learn-armlab.html', key: 'armlab', prefix: 'lab-', total: 6, t: ['Code a robot arm in Python', 'Coder un bras robot en Python'], d: ['FK, a DH engine, exact and numerical IK, trajectories, a real servo arm, exam and labs', 'MGD, moteur DH, MGI exact et numérique, trajectoires, un vrai bras à servos, examen et TP'] },
  { page: 'learn-advanced.html', key: 'adv', prefix: 'adv-', total: 8, t: ['Advanced robotics (Master)', 'Robotique avancée (Master)'], d: ['Parallel robots, LQR, MPC, legged and aerial robots, vision in practice, reinforcement learning, grasping in practice', 'Robots parallèles, LQR, MPC, robots à pattes et aériens, vision en pratique, apprentissage par renforcement, préhension en pratique'] },
  { page: 'learn-ros.html', key: 'ros', prefix: 'ros-', total: 9, t: ['ROS 2 from zero', 'ROS 2 depuis zéro'], d: ['Nodes, topics, Python, launch files, tf2, URDF, simulation, Nav2, MoveIt 2 and a first project', 'Nœuds, topics, Python, fichiers de lancement, tf2, URDF, simulation, Nav2, MoveIt 2 et un premier projet'] },
  { page: 'learn-mobile.html', key: 'wmr', prefix: 'wmr-', total: 10, t: ['Wheeled mobile robots, part 1', 'Robots mobiles à roues, partie 1'], d: ['How a robot rolls: maths from zero, every wheel and drive, constraints, ICR, maneuverability, holonomy', 'Comment un robot roule : maths depuis zéro, chaque roue et motorisation, contraintes, CIR, manœuvrabilité, holonomie'] },
  { page: 'learn-mobile-pro.html', key: 'wmrpro', prefix: 'wmr-', start: 11, total: 10, t: ['Wheeled mobile robots, part 2', 'Robots mobiles à roues, partie 2'], d: ['Professional level: control, planning, calibration, EKF, sizing, ROS 2, safety, exam and labs', 'Niveau professionnel : commande, planification, étalonnage, EKF, dimensionnement, ROS 2, sécurité, examen et TP'] },
  { page: 'learn-teleop.html', key: 'tel', prefix: 'tel-', total: 12, t: ['Teleoperation, cobotics, architectures, safety', 'Téléopération, cobotique, architectures, sécurité'], d: ['Master-slave in 3D (TD1, TD2), wave variables, co-manipulation, PAT architecture, CE marking', 'Maître-esclave en 3D (TD1, TD2), variables d\'onde, comanipulation, architecture PAT, marquage CE'] },
  { page: 'learn-kalman.html', key: 'kf', prefix: 'kf-', total: 8, t: ['Data fusion and the Kalman filter', 'Fusion de données et filtre de Kalman'], d: ['Sensors, covariance, best linear estimator, Kalman and EKF in 3D, UWB beacons, multi-sensor fusion', 'Capteurs, covariance, meilleur estimateur linéaire, Kalman et EKF en 3D, balises UWB, fusion multicapteur'] },
  { page: 'learn-transmission.html', key: 'tr', prefix: 'tr-', total: 8, t: ['Mechanical transmissions and grippers', 'Transmissions mécaniques et préhenseurs'], d: ['Belts, gears, screws, planetary and harmonic drives in 3D, sizing a joint, grippers', 'Courroies, engrenages, vis, trains planétaires et harmonic drives en 3D, dimensionner une articulation, préhenseurs'] },
  { page: 'learn-medical.html', key: 'med', prefix: 'med-', total: 8, t: ['Medical robotics', 'Robotique médicale'], d: ['Master: history, the doctor in the loop, trocar and RCM, co-manipulation, safety and sterility, hospital robots, tele-ultrasound, a project', 'Master : histoire, le médecin dans la boucle, trocart et RCM, comanipulation, sécurité et stérilité, robots à l\'hôpital, télé-échographie, un projet'] },
  { page: 'learn-parallel.html', key: 'par', prefix: 'par-', total: 6, t: ['Workspaces, motion modes and parallel robots', 'Espaces de travail, modes de déplacement et robots parallèles'], d: ['Joint and operational spaces, workspace, MoveL / MoveJ, aspects, redundancy, five-bar, 3-RPR, singularities', 'Espaces articulaire et opérationnel, espace de travail, MoveL / MoveJ, aspects, redondance, cinq barres, 3-RPR, singularités'] }
];

// the six levels of the roadmap (index.html), the time each course takes and what to know before it
export const LEVELS = [
  [['Level 1 · Discover robotics', 'Niveau 1 · Découvrir la robotique'], ['learn', 'py', 'el']],
  [['Level 2 · Mathematics for robotics', 'Niveau 2 · Mathématiques pour la robotique'], ['mk', 'maths']],
  [['Level 3 · Robot kinematics', 'Niveau 3 · Cinématique des robots'], ['model', 'armlab', 'sing', 'par']],
  [['Level 4 · Dynamics and control', 'Niveau 4 · Dynamique et commande'], ['ctrl', 'tr']],
  [['Level 5 · Mobile robots', 'Niveau 5 · Robots mobiles'], ['wmr', 'wmrpro']],
  [['Level 6 · Intelligent robotics and Master', 'Niveau 6 · Robotique intelligente et Master'], ['ros', 'ai', 'world', 'kf', 'adv', 'tel', 'med']]
];
const META = {
  learn: [45, []], py: [200, []], el: [225, []], mk: [145, []], maths: [65, ['mk']], model: [200, ['learn', 'mk']], armlab: [150, ['learn', 'maths']], sing: [100, ['model']], par: [135, ['model']],
  ctrl: [175, ['model']], tr: [170, ['learn']], wmr: [160, ['learn', 'mk']], wmrpro: [290, ['wmr']], ros: [115, ['learn']], ai: [115, ['mk']], world: [115, ['learn']],
  kf: [180, ['mk']], adv: [150, ['model', 'ctrl']], tel: [240, ['ctrl']], med: [220, ['model', 'tel']]
};
const dur = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`);
const byKey = (k) => CARDS.find((c) => c.key === k);
// the line under each card: its time and what to know before it, in English and in French
export const metaLine = (c) => {
  const [m, pre] = META[c.key] || [0, []];
  return [`≈ ${dur(m)} · ${pre.length ? 'Before: ' + pre.map((k) => byKey(k).t[0]).join(', ') : 'No prerequisite'}`, `≈ ${dur(m)} · ${pre.length ? 'Avant : ' + pre.map((k) => byKey(k).t[1]).join(', ') : 'Aucun prérequis'}`];
};
// every text of the list of courses, for the French dictionary (fr-common.js)
export const CARD_PAIRS = [...CARDS.flatMap((c) => [c.t, c.d, metaLine(c)]), ...LEVELS.map((l) => l[0])];
const card = (c, current) => `<a class="course${c.page === current ? ' current' : ''}" href="${c.page}" data-prefix="${c.prefix}" data-total="${c.total}"${c.start ? ` data-start="${c.start}"` : ''} data-key="${c.key}"><b>${tx(...c.t)}</b><span>${tx(...c.d)}</span><small class="cmeta">${tx(...metaLine(c))}</small><em class="cnt"></em></a>`;
export const courseCards = (current) =>
  `<nav class="courses" aria-label="Courses">${LEVELS.map(([name, keys]) => `<h3 class="courses-lv">${tx(...name)}</h3>${keys.map((k) => card(byKey(k), current)).join('')}`).join('')}</nav>`;

export const COURSES = [];
for (const [file, page, key, prefix, total] of [['python', 'learn-python.html', 'py', 'py-', 8], ['electronics', 'learn-electronics.html', 'el', 'el-', 8], ['mathkit', 'learn-mathkit.html', 'mk', 'mk-', 11], ['sing', 'learn-singularities.html', 'sing', 'sing-', 8], ['control', 'learn-control.html', 'ctrl', 'ctrl-', 12], ['intelligence', 'learn-intelligence.html', 'ai', 'ai-', 9], ['world', 'learn-world.html', 'world', 'world-', 9], ['ros', 'learn-ros.html', 'ros', 'ros-', 9], ['labs', 'learn-armlab.html', 'armlab', 'lab-', 6], ['adv', 'learn-advanced.html', 'adv', 'adv-', 8], ['mobile', 'learn-mobile.html', 'wmr', 'wmr-', 10], ['mobile-pro', 'learn-mobile-pro.html', 'wmrpro', 'wmr-', 10], ['teleop', 'learn-teleop.html', 'tel', 'tel-', 12], ['kalman', 'learn-kalman.html', 'kf', 'kf-', 8], ['transmission', 'learn-transmission.html', 'tr', 'tr-', 8], ['parallel', 'learn-parallel.html', 'par', 'par-', 6], ['medical', 'learn-medical.html', 'med', 'med-', 8]]) {
  let mod; try { mod = await import(`./content/${file}.mjs`); } catch (e) { if (e.code === 'ERR_MODULE_NOT_FOUND') continue; throw e; }
  COURSES.push({ page, key, prefix, total, ...mod.meta, build: mod.build });
}
