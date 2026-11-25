// add-sources.mjs — adds a "Sources and references" section at the end of every course page (after its glossary, or after
// its last lesson): the books, papers, standards and documentation the course is based on, each with what it is used for.
// Runs after build.mjs / add-practice.mjs (they rewrite the generated course pages). Its texts go to the page dictionary.
//   node tools/add-sources.mjs
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
function hash(str) { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); }
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// the references (the citation itself is the same in both languages)
const R = {
  craig: 'J. J. Craig, <i>Introduction to Robotics: Mechanics and Control</i>, 4th ed., Pearson, 2017.',
  khalil: 'W. Khalil, E. Dombre, <i>Modeling, Identification and Control of Robots</i>, Hermes Penton Science, 2002 (French edition: <i>Modélisation, identification et commande des robots</i>, Hermès, 1999).',
  kk86: 'W. Khalil, J.-F. Kleinfinger, “A new geometric notation for open and closed-loop robots”, <i>IEEE International Conference on Robotics and Automation</i>, 1986.',
  dh55: 'J. Denavit, R. S. Hartenberg, “A kinematic notation for lower-pair mechanisms based on matrices”, <i>ASME Journal of Applied Mechanics</i>, 22, 1955.',
  sic: 'B. Siciliano, L. Sciavicco, L. Villani, G. Oriolo, <i>Robotics: Modelling, Planning and Control</i>, Springer, 2009.',
  lynch: 'K. M. Lynch, F. C. Park, <i>Modern Robotics: Mechanics, Planning, and Control</i>, Cambridge University Press, 2017 (free at modernrobotics.org).',
  spong: 'M. W. Spong, S. Hutchinson, M. Vidyasagar, <i>Robot Modeling and Control</i>, 2nd ed., Wiley, 2020.',
  corke: 'P. Corke, <i>Robotics, Vision and Control</i>, 3rd ed., Springer, 2023.',
  handbook: 'B. Siciliano, O. Khatib (eds.), <i>Springer Handbook of Robotics</i>, 2nd ed., Springer, 2016.',
  strang: 'G. Strang, <i>Introduction to Linear Algebra</i>, 5th ed., Wellesley-Cambridge Press, 2016.',
  iso8373: 'ISO 8373:2021, <i>Robotics — Vocabulary</i>.',
  iso9283: 'ISO 9283:1998, <i>Manipulating industrial robots — Performance criteria and related test methods</i>.',
  iso10218: 'ISO 10218-1 and ISO 10218-2, <i>Robotics — Safety requirements</i> (industrial robots and robot applications).',
  ts15066: 'ISO/TS 15066:2016, <i>Robots and robotic devices — Collaborative robots</i>.',
  machinery: 'Machinery Directive 2006/42/EC and Machinery Regulation (EU) 2023/1230.',
  yoshikawa: 'T. Yoshikawa, “Manipulability of robotic mechanisms”, <i>The International Journal of Robotics Research</i>, 4(2), 1985.',
  nakamura: 'Y. Nakamura, <i>Advanced Robotics: Redundancy and Optimization</i>, Addison-Wesley, 1991.',
  wampler: 'C. W. Wampler, “Manipulator inverse kinematic solutions based on vector formulations and damped least-squares methods”, <i>IEEE Transactions on Systems, Man, and Cybernetics</i>, 16(1), 1986.',
  merlet: 'J.-P. Merlet, <i>Parallel Robots</i>, 2nd ed., Springer, 2006.',
  gosselin: 'C. Gosselin, J. Angeles, “Singularity analysis of closed-loop kinematic chains”, <i>IEEE Transactions on Robotics and Automation</i>, 6(3), 1990.',
  clavel: 'R. Clavel, <i>Conception d’un robot parallèle rapide à 4 degrés de liberté</i>, PhD thesis, EPFL, 1991 (the Delta robot).',
  astrom: 'K. J. Åström, R. M. Murray, <i>Feedback Systems: An Introduction for Scientists and Engineers</i>, 2nd ed., Princeton University Press, 2021 (free online).',
  pid: 'K. J. Åström, T. Hägglund, <i>PID Controllers: Theory, Design, and Tuning</i>, 2nd ed., ISA, 1995.',
  raibert: 'M. H. Raibert, J. J. Craig, “Hybrid position/force control of manipulators”, <i>ASME Journal of Dynamic Systems, Measurement, and Control</i>, 1981.',
  khatib87: 'O. Khatib, “A unified approach for motion and force control of robot manipulators: the operational space formulation”, <i>IEEE Journal on Robotics and Automation</i>, 3(1), 1987.',
  siegwart: 'R. Siegwart, I. R. Nourbakhsh, D. Scaramuzza, <i>Introduction to Autonomous Mobile Robots</i>, 2nd ed., MIT Press, 2011.',
  campion: 'G. Campion, G. Bastin, B. d’Andréa-Novel, “Structural properties and classification of kinematic and dynamic models of wheeled mobile robots”, <i>IEEE Transactions on Robotics and Automation</i>, 12(1), 1996.',
  coulter: 'R. C. Coulter, <i>Implementation of the Pure Pursuit Path Tracking Algorithm</i>, Carnegie Mellon University, CMU-RI-TR-92-01, 1992.',
  stanley: 'S. Thrun et al., “Stanley: The robot that won the DARPA Grand Challenge”, <i>Journal of Field Robotics</i>, 23(9), 2006.',
  lavalle: 'S. M. LaValle, <i>Planning Algorithms</i>, Cambridge University Press, 2006 (free at lavalle.pl).',
  thrun: 'S. Thrun, W. Burgard, D. Fox, <i>Probabilistic Robotics</i>, MIT Press, 2005.',
  kalman60: 'R. E. Kalman, “A new approach to linear filtering and prediction problems”, <i>Journal of Basic Engineering</i>, 82(1), 1960.',
  jaulin: 'L. Jaulin, <i>Mobile Robotics</i>, 2nd ed., ISTE / Wiley, 2019 (French: <i>La robotique mobile</i>, ISTE, 2015).',
  astar: 'P. E. Hart, N. J. Nilsson, B. Raphael, “A formal basis for the heuristic determination of minimum cost paths”, <i>IEEE Transactions on Systems Science and Cybernetics</i>, 4(2), 1968.',
  rrt: 'S. M. LaValle, J. J. Kuffner, “Randomized kinodynamic planning”, <i>The International Journal of Robotics Research</i>, 20(5), 2001.',
  szeliski: 'R. Szeliski, <i>Computer Vision: Algorithms and Applications</i>, 2nd ed., Springer, 2022 (free at szeliski.org).',
  sutton: 'R. S. Sutton, A. G. Barto, <i>Reinforcement Learning: An Introduction</i>, 2nd ed., MIT Press, 2018 (free online).',
  lqr: 'B. D. O. Anderson, J. B. Moore, <i>Optimal Control: Linear Quadratic Methods</i>, Prentice Hall, 1990.',
  mpc: 'J. B. Rawlings, D. Q. Mayne, M. M. Diehl, <i>Model Predictive Control: Theory, Computation, and Design</i>, 2nd ed., Nob Hill, 2017.',
  kajita: 'S. Kajita, H. Hirukawa, K. Harada, K. Yokoi, <i>Introduction to Humanoid Robotics</i>, Springer, 2014.',
  mahony: 'R. Mahony, V. Kumar, P. Corke, “Multirotor aerial vehicles: modeling, estimation, and control of quadrotor”, <i>IEEE Robotics &amp; Automation Magazine</i>, 19(3), 2012.',
  monkman: 'G. J. Monkman, S. Hesse, R. Steinmann, H. Schunk, <i>Robot Grippers</i>, Wiley-VCH, 2007.',
  shigley: 'R. G. Budynas, J. K. Nisbett, <i>Shigley’s Mechanical Engineering Design</i>, McGraw-Hill (any recent edition).',
  sheridan: 'T. B. Sheridan, <i>Telerobotics, Automation, and Human Supervisory Control</i>, MIT Press, 1992.',
  niemeyer: 'G. Niemeyer, J.-J. E. Slotine, “Stable adaptive teleoperation”, <i>IEEE Journal of Oceanic Engineering</i>, 16(1), 1991 (wave variables).',
  hokayem: 'P. F. Hokayem, M. W. Spong, “Bilateral teleoperation: an historical survey”, <i>Automatica</i>, 42(12), 2006.',
  ros2: 'ROS 2 documentation, docs.ros.org (Jazzy Jalisco); Navigation 2, docs.nav2.org; MoveIt 2, moveit.picknik.ai.',
  macenski: 'S. Macenski, T. Foote, B. Gerkey, C. Lalancette, W. Woodall, “Robot Operating System 2: Design, architecture, and uses in the wild”, <i>Science Robotics</i>, 7(66), 2022.',
  ifr: 'International Federation of Robotics, <i>World Robotics</i> (yearly report), ifr.org.',
  numpy: 'NumPy documentation, numpy.org/doc.'
};
const U = (en, fr) => [en, fr];
// page → [[reference, [what it is used for, EN, FR]], …]
const SOURCES = {
  'learn.html': [['craig', U('joints, degrees of freedom, frames and the DH table', 'liaisons, degrés de liberté, repères et tableau DH')], ['lynch', U('degrees of freedom and configuration space, at a beginner level', 'degrés de liberté et espace des configurations, à un niveau débutant')], ['iso8373', U('the official words of robotics', 'les mots officiels de la robotique')]],
  'learn-mathkit.html': [['strang', U('vectors, matrices, determinants', 'vecteurs, matrices, déterminants')], ['craig', U('rotations, frames, homogeneous matrices, DH (Craig’s modified convention)', 'rotations, repères, matrices homogènes, DH (convention modifiée de Craig)')], ['dh55', U('the original DH convention', 'la convention DH d’origine')], ['kk86', U('the modified convention and Khalil’s letters', 'la convention modifiée et les lettres de Khalil')], ['khalil', U('DHM as taught in French courses', 'le DHM tel qu’il est enseigné dans les cours français')], ['lynch', U('rotations, quaternions, Jacobian', 'rotations, quaternions, jacobienne')], ['thrun', U('probability and sensor fusion', 'probabilités et fusion de capteurs')]],
  'learn-maths.html': [['craig', U('direct and inverse models of the 2-axis arm', 'modèles direct et inverse du bras à 2 axes')], ['spong', U('motion laws and trajectories', 'lois de mouvement et trajectoires')], ['khalil', U('trapezoidal and polynomial motion laws', 'lois trapézoïdales et polynomiales')]],
  'learn-model.html': [['khalil', U('the whole course: DHM, MGD, MGI, Jacobian, motion laws, dynamics', 'tout le cours : DHM, MGD, MGI, jacobienne, lois de mouvement, dynamique')], ['kk86', U('the modified DH notation', 'la notation DH modifiée')], ['craig', U('frames, transforms and Euler angles', 'repères, transformations et angles d’Euler')], ['sic', U('kinematics, Jacobian and trajectories', 'cinématique, jacobienne et trajectoires')], ['spong', U('dynamics (Lagrange)', 'dynamique (Lagrange)')]],
  'learn-singularities.html': [['yoshikawa', U('manipulability and the velocity ellipse', 'manipulabilité et ellipse de vitesse')], ['nakamura', U('redundancy and the null space', 'redondance et noyau')], ['wampler', U('the damped least-squares inverse', 'l’inverse amortie (moindres carrés amortis)')], ['sic', U('kinematic singularities of arms and wrists', 'singularités cinématiques des bras et des poignets')], ['lynch', U('Jacobian and statics τ = Jᵀ F', 'jacobienne et statique τ = Jᵀ F')]],
  'learn-control.html': [['astrom', U('feedback, PID, frequency response, sampling', 'asservissement, PID, réponse fréquentielle, échantillonnage')], ['pid', U('PID tuning and anti-windup', 'réglage du PID et anti-windup')], ['spong', U('robot dynamics and computed torque', 'dynamique des robots et couple calculé')], ['raibert', U('hybrid position/force control', 'commande hybride position/effort')], ['khatib87', U('operational-space control', 'commande dans l’espace opérationnel')], ['iso9283', U('accuracy and repeatability', 'exactitude et répétabilité')]],
  'learn-intelligence.html': [['szeliski', U('cameras, calibration, stereo', 'caméras, étalonnage, stéréo')], ['thrun', U('Kalman filter, localisation and SLAM', 'filtre de Kalman, localisation et SLAM')], ['kalman60', U('the original Kalman filter', 'le filtre de Kalman d’origine')], ['astar', U('the A* algorithm', 'l’algorithme A*')], ['rrt', U('RRT sampling-based planning', 'la planification par échantillonnage RRT')], ['lavalle', U('configuration space and motion planning', 'espace des configurations et planification de mouvement')], ['sutton', U('reinforcement learning', 'apprentissage par renforcement')]],
  'learn-world.html': [['ifr', U('robot families and market figures', 'familles de robots et chiffres du marché')], ['monkman', U('grippers and suction', 'pinces et ventouses')], ['iso10218', U('safety of industrial robot cells', 'sécurité des cellules de robots industriels')], ['ts15066', U('collaborative robots', 'robots collaboratifs')], ['iso9283', U('accuracy, repeatability and calibration', 'exactitude, répétabilité et étalonnage')], ['kajita', U('legged robots and the support polygon', 'robots à pattes et polygone de sustentation')], ['mahony', U('the quadrotor', 'le quadrirotor')]],
  'learn-ros.html': [['ros2', U('every command, node and package of the course', 'toutes les commandes, nœuds et paquets du cours')], ['macenski', U('the design of ROS 2', 'la conception de ROS 2')], ['corke', U('robot programming in practice', 'la programmation des robots en pratique')]],
  'learn-armlab.html': [['craig', U('forward and inverse kinematics, DH', 'modèles direct et inverse, DH')], ['lynch', U('numerical inverse kinematics', 'cinématique inverse numérique')], ['wampler', U('damped least squares', 'moindres carrés amortis')], ['khalil', U('polynomial motion laws', 'lois de mouvement polynomiales')], ['numpy', U('the Python code', 'le code Python')]],
  'learn-advanced.html': [['merlet', U('Delta and Stewart platforms', 'robots Delta et plateformes de Stewart')], ['clavel', U('the Delta robot', 'le robot Delta')], ['lqr', U('LQR', 'LQR')], ['mpc', U('model predictive control', 'commande prédictive (MPC)')], ['kajita', U('legged robots, ZMP', 'robots à pattes, ZMP')], ['mahony', U('aerial robots', 'robots aériens')], ['szeliski', U('vision in practice, point clouds', 'vision en pratique, nuages de points')], ['sutton', U('reinforcement learning', 'apprentissage par renforcement')], ['monkman', U('grasping and vacuum grippers', 'saisie et préhenseurs à vide')]],
  'learn-mobile.html': [['siegwart', U('the whole course: wheels, kinematic constraints, ICR, maneuverability', 'tout le cours : roues, contraintes cinématiques, CIR, manœuvrabilité')], ['campion', U('classification of wheeled robots (degree of mobility and steerability)', 'classification des robots à roues (degré de mobilité et de dirigeabilité)')], ['lynch', U('nonholonomic constraints', 'contraintes non holonomes')]],
  'learn-mobile-pro.html': [['siegwart', U('motion control and odometry', 'commande du mouvement et odométrie')], ['coulter', U('pure pursuit', 'pure pursuit')], ['stanley', U('the Stanley controller', 'le contrôleur de Stanley')], ['lavalle', U('Dubins and Reeds–Shepp paths', 'chemins de Dubins et de Reeds–Shepp')], ['thrun', U('EKF localisation', 'localisation par EKF')], ['ros2', U('ROS 2 and Nav2', 'ROS 2 et Nav2')], ['iso10218', U('safety functions', 'fonctions de sécurité')]],
  'learn-teleop.html': [['sheridan', U('teleoperation and supervisory control', 'téléopération et contrôle de supervision')], ['niemeyer', U('wave variables and passivity', 'variables d’onde et passivité')], ['hokayem', U('bilateral teleoperation', 'téléopération bilatérale')], ['ts15066', U('collaborative robots', 'robots collaboratifs')], ['iso10218', U('safety of robot cells', 'sécurité des cellules robotisées')], ['machinery', U('the directives and the CE marking', 'les directives et le marquage CE')]],
  'learn-kalman.html': [['kalman60', U('the Kalman filter', 'le filtre de Kalman')], ['jaulin', U('the course follows its notations and its labs (covariance, best estimator, EKF)', 'le cours suit ses notations et ses TP (covariance, meilleur estimateur, EKF)')], ['thrun', U('probabilistic estimation and the EKF', 'estimation probabiliste et EKF')]],
  'learn-transmission.html': [['shigley', U('gears, belts, screws and their sizing', 'engrenages, courroies, vis et leur dimensionnement')], ['monkman', U('grippers', 'préhenseurs')], ['handbook', U('actuators and transmissions of robots', 'actionneurs et transmissions des robots')]],
  'learn-parallel.html': [['merlet', U('parallel robots, their models and singularities', 'robots parallèles, leurs modèles et leurs singularités')], ['gosselin', U('the three types of singularities', 'les trois types de singularités')], ['khalil', U('joint and operational spaces, workspace, aspects', 'espaces articulaire et opérationnel, espace de travail, aspects')]]
};
const T = { title: U('Sources and references', 'Sources et références'), lead: U('This course was written from these books, papers, standards and documentation. They are also the best way to go further.', 'Ce cours a été écrit à partir de ces livres, articles, normes et documentations. Ce sont aussi les meilleurs moyens d’aller plus loin.'), used: U('used for:', 'utilisé pour :') };
for (const [page, list] of Object.entries(SOURCES)) {
  const f = root + page; if (!fs.existsSync(f)) { console.log('missing', page); continue; }
  let h = fs.readFileSync(f, 'utf8');
  h = h.replace(/\n? *<!-- BEGIN sources -->[\s\S]*?<!-- END sources -->\n?/g, '\n');
  const block = `        <!-- BEGIN sources -->
        <section class="sources" id="sources">
          <h2>${T.title[0]}</h2>
          <p>${T.lead[0]}</p>
          <ol class="srclist">
${list.map(([k, u]) => `            <li><span class="src">${R[k]}</span> <span class="srcuse"><em>${T.used[0]}</em> <span>${u[0]}</span></span></li>`).join('\n')}
          </ol>
        </section>
        <!-- END sources -->
`;
  // after the glossary of the course if it has one, else after its last lesson
  const g = h.indexOf('<section class="gloss">');
  let at = g >= 0 ? h.indexOf('</section>', g) + '</section>'.length : h.lastIndexOf('</article>') + '</article>'.length;
  if (at < 20) { console.log('no place in', page); continue; }
  h = h.slice(0, at) + '\n' + block + h.slice(at);
  fs.writeFileSync(f, h);
  // French: the headings and the "used for" texts (the citations stay as they are)
  const dictFile = root + 'i18n/fr-' + page.replace('.html', '.js');
  let d = fs.readFileSync(dictFile, 'utf8'); const add = [];
  for (const [en, fr] of [T.title, T.lead, T.used, ...list.map((x) => x[1])]) { const k = hash(norm(en)); if (!d.includes(`"${k}"`) && !add.some((a) => a.startsWith(`"${k}"`))) add.push(`"${k}": ${JSON.stringify(fr)}`); }
  for (const [k] of list) { const k2 = hash(norm(R[k])); if (!d.includes(`"${k2}"`) && !add.some((a) => a.startsWith(`"${k2}"`))) add.push(`"${k2}": ${JSON.stringify(R[k])}`); }
  if (add.length) d = d.replace('RA.add({\n', 'RA.add({\n' + add.join(',\n') + ',\n');
  fs.writeFileSync(dictFile, d);
}
console.log('sources added to', Object.keys(SOURCES).length, 'courses');
