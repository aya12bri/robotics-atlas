// courses.mjs — the list of courses (cards shown at the top of every course page) and the new course builders.
import { tx } from './lib.mjs';

export const CARDS = [
  { page: 'learn.html', key: 'learn', prefix: 'lesson-', total: 12, t: ['Foundations', 'Les fondations'], d: ['12 short lessons: the ideas behind every robot', '12 leçons courtes : les idées derrière tous les robots'] },
  { page: 'learn-maths.html', key: 'maths', prefix: 'maths-', total: 8, t: ['Maths and motion, step by step', 'Maths et mouvement, pas à pas'], d: ['From zero: angles, a 2-axis arm, frames, DH and motion laws', 'De zéro : angles, bras à 2 axes, repères, DH et lois de mouvement'] },
  { page: 'learn-model.html', key: 'model', prefix: 'model-', total: 11, t: ['Robot modelling, full course', "Modélisation d'un robot, cours complet"], d: ['Master level: rotations, DHm, MGD, MGI, Jacobian, dynamics', 'Niveau Master : rotations, DHm, MGD, MGI, jacobienne, dynamique'] },
  { page: 'learn-singularities.html', key: 'sing', prefix: 'sing-', total: 8, t: ['Singularities and the Jacobian', 'Singularités et jacobienne'], d: ['Speeds, forces, lost directions, gimbal lock, redundancy', 'Vitesses, forces, directions perdues, blocage de cardan, redondance'] },
  { page: 'learn-control.html', key: 'ctrl', prefix: 'ctrl-', total: 9, t: ['Dynamics, actuators and control', 'Dynamique, actionneurs et commande'], d: ['Motors, sensors, PID, computed torque, force control, trajectories', 'Moteurs, capteurs, PID, couple calculé, commande en effort, trajectoires'] },
  { page: 'learn-intelligence.html', key: 'ai', prefix: 'ai-', total: 9, t: ['Perception, planning and AI', 'Perception, planification et IA'], d: ['Vision, Kalman, SLAM, A*, RRT, learning, multi-robot', 'Vision, Kalman, SLAM, A*, RRT, apprentissage, multi-robots'] },
  { page: 'learn-world.html', key: 'world', prefix: 'world-', total: 9, t: ['Robots in the real world', 'Les robots dans le monde réel'], d: ['Every robot family, grippers, electronics, ROS, safety, careers', 'Toutes les familles de robots, pinces, électronique, ROS, sécurité, métiers'] }
];

export const courseCards = (current) =>
  `<nav class="courses" aria-label="Courses">${CARDS.map((c) => `<a class="course${c.page === current ? ' current' : ''}" href="${c.page}" data-prefix="${c.prefix}" data-total="${c.total}" data-key="${c.key}"><b>${tx(...c.t)}</b><span>${tx(...c.d)}</span><em class="cnt"></em></a>`).join('')}</nav>`;

export const COURSES = [];
for (const [file, page, key, prefix, total] of [['sing', 'learn-singularities.html', 'sing', 'sing-', 8], ['control', 'learn-control.html', 'ctrl', 'ctrl-', 9], ['intelligence', 'learn-intelligence.html', 'ai', 'ai-', 9], ['world', 'learn-world.html', 'world', 'world-', 9]]) {
  let mod; try { mod = await import(`./content/${file}.mjs`); } catch (e) { if (e.code === 'ERR_MODULE_NOT_FOUND') continue; throw e; }
  COURSES.push({ page, key, prefix, total, ...mod.meta, build: mod.build });
}
