// add-meta.mjs — adds the search and share tags (description, canonical, Open Graph, Twitter card, favicon) to every page,
// and writes sitemap.xml and robots.txt. Idempotent: run it after the build scripts (they rewrite the pages).
//   node tools/add-meta.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://roboticsatlas.ayabriksine.com', NAME = 'Robotics Atlas', IMG = SITE + '/og-image.jpg';
const DESC = {
  'learn.html': 'Twelve short robotics lessons: joints, frames, DH tables, kinematics, control and AI, each with a question and live 3D examples.',
  'learn-maths.html': 'A 2-axis arm from zero: angles, the DH table and the laws of motion, step by step with interactive examples.',
  'learn-model.html': 'The full course on robot modelling: frames, DH and DHM parameters, forward and inverse kinematics, with a live 3D arm.',
  'learn-singularities.html': 'Singularities and the Jacobian explained with a live robot: why some poses lose motion and how robots avoid them.',
  'learn-control.html': 'Dynamics, actuators and control of robot arms: torque, motors, PID loops and trajectories, with interactive examples.',
  'learn-intelligence.html': 'How robots perceive, plan and decide: sensors, vision, path planning and AI, explained step by step.',
  'learn-world.html': 'Robots in the real world: where industrial, collaborative, mobile and humanoid robots are used, and how to choose one.',
  'learn-mobile.html': 'Wheeled mobile robots, part 1: the maths from zero, every wheel and drive (differential, car, omni, Mecanum, swerve), constraints, ICR, maneuverability and holonomy.',
  'learn-mobile-pro.html': 'Wheeled mobile robots, part 2: motion control, path following, planning, odometry calibration, Kalman filter, motor sizing, ROS 2, safety, exam and labs.',
  'learn-mathkit.html': 'The maths of robotics, one tool per lesson: trigonometry, vectors, matrices, rotations, homogeneous transformations, standard DH and modified DH (DHM), derivatives, probability and quaternions, with worked examples, exercises and quizzes.',
  'learn-armlab.html': 'Code a robot arm in Python: forward kinematics, a DH engine, exact and numerical inverse kinematics, trajectories, a real 3-servo arm with an Arduino, an exam and five labs.',
  'learn-advanced.html': 'Advanced robotics at Master level: parallel robots (Delta, Stewart), LQR, model predictive control, legged robots and the ZMP, quadrotors, vision in practice and reinforcement learning.',
  'learn-kalman.html': 'Data fusion and the Kalman filter: sensors of autonomous navigation, covariance and confidence ellipses, the best linear estimator, the Kalman filter and the EKF in 3D labs, UWB beacons and multi-sensor fusion.',
  'learn-transmission.html': 'Mechanical transmissions and grippers: belts, gears, backlash, racks, screws and worms, planetary gears and harmonic drives meshing in 3D, sizing a robot joint, and grippers with their gripping force.',
  'learn-parallel.html': 'Workspaces, motion modes and parallel robots: joint and operational spaces, from joint limits to the workspace, linear and joint motions, aspects and redundancy, Grübler mobility, five-bar and 3-RPR models and singularities in 3D labs.',
  'cylindrical.html': 'Interactive 3D cylindrical robot (R-P-P): a column that turns, a carriage that goes up, an arm that slides; DH and DHM tables, direct and inverse models, hollow-cylinder workspace.',
  'spherical.html': 'Interactive 3D spherical (polar) robot (R-R-P), the structure of the Unimate: DH and DHM tables, spherical coordinates, direct and inverse models, workspace.',
  'redundant.html': 'Interactive 3D 7-axis redundant robot (KUKA LBR iiwa): DH and DHM tables, elbow angle and self-motion, the tool stays still while the arm moves.',
  'hexapod.html': 'Interactive hexapod (Gough-Stewart platform, 6-UPS): six legs, inverse model, Newton direct model, Jacobian and parallel singularities, uses.',
  'learn-teleop.html': 'Teleoperation, cobotics, control architectures and safety (Master level): master-slave labs in 3D (position-position, force-position, four channels, wave variables), co-manipulation, the PAT architecture, risk assessment and CE marking.',
  'learn-ros.html': 'ROS 2 from zero: nodes, topics, your first Python nodes, services, actions, launch files, tf2, URDF, simulation, Nav2, MoveIt 2 and a first complete project.',
  'certificate.html': 'Your Robotics Atlas certificates: finish a course and get a certificate with your name, to print or save as PDF. Save or restore your progress.',
  'offline.html': 'You are offline. The pages of Robotics Atlas you already opened, or downloaded, can still be read here.',
  'glossary.html': 'The robotics glossary: every word of every course in one place, with its meaning in English and French and the lesson that explains it.',
  'revision.html': 'Printable revision sheets of every robotics course: the essentials of each lesson, the main formulas and the key terms, to print or save as PDF.',
  'sensors.html': 'A live sensor test bench: encoder, IMU (gyroscope drift, accelerometer noise, complementary filter), 2D lidar, camera distortion and stereo depth, ultrasonic range finder and GNSS (multipath, SBAS, RTK, fusion), with challenges and a guide to choose a sensor.',
  'exam.html': 'The final exams of the robotics courses: 12 corrected questions per course, with explanations; pass them to get the certificates.',
  'sandbox.html': 'A programming sandbox: program a 3D SCARA or 6-axis robot (linear and joint moves, gripper, loops), complete three missions and export the program in an ABB RAPID or KUKA KRL style.',
  'projects.html': 'Three guided robotics projects: a 2-axis servo arm on Arduino, a PID line follower and a ROS 2 mobile robot with a lidar, with parts, prices, wiring, code and tests.',
  'about.html': 'About Robotics Atlas: what the site offers, how the courses are made, sources, privacy, and how to report an error.',
  'review.html': 'Spaced-repetition reviews of robotics: the questions come back after 1, 3, 7, 16 and 35 days until you know them.',
  'build.html': 'A hands-on 3D workshop: choose a robot, discover its parts, assemble it, understand its joints and degrees of freedom, move it and see how its motion is computed.',
  'arm.html': 'Interactive 3D model of a 3-DOF robot arm: move each joint, see the kinematic diagram, the DH table and the Jacobian.',
  'gantry.html': 'Interactive 3D Cartesian gantry robot with three sliding axes: kinematics, workspace and pick and place.',
  'scara.html': 'Interactive 3D SCARA robot: closed-form inverse kinematics, DH table and a pick-and-place demo.',
  'articulated.html': 'Interactive 3D model of a 6-axis industrial robot with a spherical wrist: DH tables, inverse kinematics and pick and place.',
  'cobot.html': 'Interactive 3D model of a UR5-style collaborative robot: real parameters, offset wrist, force limiting and pick and place.',
  'delta.html': 'Interactive 3D Delta (parallel) robot: three arms and parallelograms, inverse kinematics and a fast pick-and-place demo.',
  'mobile.html': 'Interactive 3D differential-drive mobile robot: wheel speeds, turning circle, odometry and programs you can run.',
  'wheels.html': 'Mobile robot wheels and drives: fixed, castor, omni, Mecanum and ball wheels, drive layouts, sensors and a simulator.',
  'practice.html': 'Practise robotics: build a robot in 3D, program it, test sensors, drive mobile robots, code an arm in Python and follow real projects.',
  'anatomy.html': 'Anatomy in 3D: look inside every robot, its joints with an X-ray mode, the motors, gearboxes and every component of the cell.',
  'anatomy-scara.html': '3D anatomy of a SCARA robot: its joints, motors, gearboxes and controller, with an X-ray mode.',
  'anatomy-cobot.html': '3D anatomy of a collaborative robot: joints, motors, brakes, sensors and controller, with an X-ray mode.',
  'anatomy-delta.html': '3D anatomy of a Delta robot: motors, arms, parallelograms and the platform, with an X-ray mode.',
  'anatomy-gantry.html': '3D anatomy of a Cartesian gantry: rails, belts, motors and the end effector, with an X-ray mode.',
  'anatomy-mobile.html': '3D anatomy of a differential-drive mobile robot: wheels, motors, battery, sensors and controller, with an X-ray mode.',
  'anatomy-wheels.html': '3D anatomy of seven wheel types: fixed, castor, steered, omni, Mecanum, ball and track, with an X-ray mode.',
  'anatomy-drives.html': '3D anatomy of eight drive layouts for mobile robots: differential, Ackermann, omni, Mecanum and more.',
  'anatomy-stewart.html': '3D anatomy of a Stewart platform: six legs, actuators and joints, with an X-ray mode.',
  'anatomy-quadrotor.html': '3D anatomy of a quadrotor drone that really flies: motors, ESC, flight controller, battery and sensors, with an X-ray mode.',
  'anatomy-tracked.html': '3D anatomy of a tracked robot that really drives: tracks, sprockets, road wheels, motors, sensors and skid steering, with an X-ray mode.',
  'anatomy-quadruped.html': '3D anatomy of a quadruped robot that really trots: 12 joints, legs, cameras, battery and computer, with an X-ray mode.',
  'anatomy-auv.html': '3D anatomy of an autonomous underwater robot (AUV): propeller, fins, pressure hull, sonars and navigation without GPS, with an X-ray mode.',
  'anatomy-humanoid.html': '3D anatomy of a humanoid robot that really walks: gait, leg kinematics, balance, actuators and battery, with an X-ray mode.'
};
const DESC_FR = {
  'index.html': 'Un atlas illustré des types de robots : tâches, schémas cinématiques, tables DH et modèles 3D interactifs, avec des cours gratuits en français.',
  'learn.html': 'Douze leçons courtes de robotique : liaisons, repères, tables DH, cinématique, commande et IA, chacune avec une question et des exemples 3D en direct.',
  'learn-maths.html': 'Un bras à 2 axes à partir de zéro : les angles, la table DH et les lois du mouvement, pas à pas avec des exemples interactifs.',
  'learn-model.html': 'Le cours complet de modélisation des robots : repères, paramètres DH et DHM, modèles géométriques direct et inverse, avec un bras 3D en direct.',
  'learn-singularities.html': 'Les singularités et la jacobienne expliquées avec un robot en direct : pourquoi certaines poses perdent des mouvements et comment les robots les évitent.',
  'learn-control.html': 'Dynamique, actionneurs et commande des bras robotiques : couples, moteurs, boucles PID et trajectoires, avec des exemples interactifs.',
  'learn-intelligence.html': 'Comment les robots perçoivent, planifient et décident : capteurs, vision, planification de trajectoire et IA, expliqués pas à pas.',
  'learn-world.html': 'Les robots dans le monde réel : où sont utilisés les robots industriels, collaboratifs, mobiles et humanoïdes, les grands fabricants, et comment en choisir un.',
  'learn-mobile.html': 'Robots mobiles à roues, partie 1 : les maths à partir de zéro, toutes les roues et motorisations (différentielle, voiture, omni, Mecanum, swerve), contraintes, CIR, manœuvrabilité et holonomie.',
  'learn-mobile-pro.html': 'Robots mobiles à roues, partie 2 : commande du mouvement, suivi de trajectoire, planification, étalonnage de l\'odométrie, filtre de Kalman, dimensionnement des moteurs, ROS 2, sécurité, examen et TP.',
  'learn-mathkit.html': 'Les maths de la robotique, un outil par leçon : trigonométrie, vecteurs, matrices, rotations, transformations homogènes, DH standard et modifié (DHM), dérivées, probabilités et quaternions, avec exercices corrigés.',
  'learn-armlab.html': 'Coder un bras robotique en Python : modèle direct, moteur DH, modèle inverse exact et numérique, trajectoires, un vrai bras à 3 servos avec un Arduino, un examen et cinq TP.',
  'learn-advanced.html': 'Robotique avancée niveau Master : robots parallèles (Delta, Stewart), LQR, commande prédictive, robots à pattes et ZMP, quadrirotors, vision en pratique et apprentissage par renforcement.',
  'learn-kalman.html': 'Fusion de données et filtre de Kalman : capteurs de la navigation autonome, covariance et ellipses de confiance, meilleur estimateur linéaire, filtre de Kalman et EKF en labos 3D, balises UWB et fusion multicapteur.',
  'learn-transmission.html': 'Transmissions mécaniques et préhenseurs : courroies, engrenages, jeu, crémaillères, vis et vis sans fin, trains planétaires et harmonic drives qui engrènent en 3D, dimensionnement d\'une articulation et préhenseurs avec leur force de serrage.',
  'learn-parallel.html': 'Espaces de travail, modes de déplacement et robots parallèles : espaces articulaire et opérationnel, des limites articulaires à l\'espace de travail, déplacements linéaires et articulaires, aspects et redondance, mobilité de Grübler, modèles et singularités du cinq barres et du 3-RPR en labos 3D.',
  'cylindrical.html': 'Robot cylindrique (R-P-P) en 3D interactif : une colonne qui tourne, un chariot qui monte, un bras qui coulisse ; tableaux DH et DHM, modèles direct et inverse, espace de travail en cylindre creux.',
  'spherical.html': 'Robot sphérique (polaire) R-R-P en 3D interactif, la structure de l\'Unimate : tableaux DH et DHM, coordonnées sphériques, modèles direct et inverse, espace de travail.',
  'redundant.html': 'Robot redondant 7 axes (KUKA LBR iiwa) en 3D interactif : tableaux DH et DHM, angle de coude et mouvement propre, l\'outil reste immobile pendant que le bras bouge.',
  'hexapod.html': 'Hexapode (plateforme de Gough-Stewart, 6-UPS) interactif : six jambes, modèle inverse, modèle direct par Newton, jacobienne et singularités parallèles, applications.',
  'learn-teleop.html': 'Téléopération, cobotique, architectures de contrôle et sécurité (niveau Master) : labos maître-esclave en 3D (position-position, force-position, quatre canaux, variables d\'onde), comanipulation, architecture PAT, analyse des risques et marquage CE.',
  'learn-ros.html': 'ROS 2 à partir de zéro : nœuds, topics, vos premiers nœuds Python, services, actions, fichiers launch, tf2, URDF, simulation, Nav2, MoveIt 2 et un premier projet complet.',
  'certificate.html': 'Vos certificats Robotics Atlas : terminez un cours et obtenez un certificat à votre nom, à imprimer ou à enregistrer en PDF. Sauvegardez ou restaurez votre progression.',
  'glossary.html': 'Le glossaire de la robotique : tous les mots de tous les cours au même endroit, avec leur sens en français et en anglais et la leçon qui les explique.',
  'revision.html': 'Fiches de révision imprimables de tous les cours de robotique : l\'essentiel de chaque leçon, les formules principales et les termes clés, à imprimer ou en PDF.',
  'sensors.html': 'Un banc d\'essai des capteurs en direct : codeur, IMU (dérive du gyroscope, bruit de l\'accéléromètre, filtre complémentaire), lidar 2D, distorsion de caméra et stéréo, télémètre à ultrasons, GNSS (multitrajets, SBAS, RTK, fusion), avec des défis et un guide pour choisir un capteur.',
  'exam.html': 'Les examens finaux des cours de robotique : 12 questions corrigées par cours, avec explications, et un examen blanc chronométré ; réussissez-les pour obtenir les certificats.',
  'sandbox.html': 'Un bac à sable de programmation : programmez un robot SCARA ou 6 axes en 3D (mouvements linéaires et articulaires, pince, boucles), réussissez trois missions et exportez le programme dans le style RAPID d\'ABB ou KRL de KUKA.',
  'projects.html': 'Trois projets de robotique guidés : un bras à 2 servos sur Arduino, un suiveur de ligne PID et un robot mobile ROS 2 avec lidar, avec pièces, prix, câblage, code et tests.',
  'about.html': 'À propos de Robotics Atlas : ce que propose le site, comment les cours sont faits, les sources, la confidentialité et comment signaler une erreur.',
  'review.html': 'Révisions espacées de robotique : les questions reviennent après 1, 3, 7, 16 et 35 jours jusqu\'à ce que vous les sachiez.',
  'build.html': 'Un atelier 3D pratique : choisissez un robot, découvrez ses pièces, assemblez-le, comprenez ses liaisons et ses degrés de liberté, faites-le bouger et voyez comment son mouvement est calculé.',
  'arm.html': 'Modèle 3D interactif d\'un bras robotique à 3 axes : bougez chaque articulation, voyez le schéma cinématique, la table DH et la jacobienne.',
  'gantry.html': 'Robot cartésien (portique) 3D interactif à trois axes linéaires : cinématique, espace de travail et prise-dépose.',
  'scara.html': 'Robot SCARA 3D interactif : modèle inverse analytique, table DH et démonstration de prise-dépose.',
  'articulated.html': 'Modèle 3D interactif d\'un robot industriel 6 axes à poignet sphérique : tables DH, modèle inverse et prise-dépose.',
  'cobot.html': 'Modèle 3D interactif d\'un robot collaboratif de type UR5 : paramètres réels, poignet déporté, limitation d\'effort et prise-dépose.',
  'delta.html': 'Robot Delta (parallèle) 3D interactif : trois bras et parallélogrammes, modèle inverse et démonstration de prise-dépose rapide.',
  'mobile.html': 'Robot mobile à entraînement différentiel en 3D interactif : vitesses des roues, rayon de virage, odométrie et programmes à exécuter.',
  'wheels.html': 'Les roues et motorisations des robots mobiles : roues fixes, folles, omni, Mecanum et sphériques, configurations, capteurs et un simulateur.',
  'practice.html': 'Pratiquer la robotique : construire un robot en 3D, le programmer, tester des capteurs, conduire des robots mobiles, coder un bras en Python et suivre de vrais projets.',
  'anatomy.html': 'Anatomie 3D : regardez à l\'intérieur de chaque robot, ses articulations en mode rayons X, les moteurs, réducteurs et tous les composants de la cellule.',
  'anatomy-scara.html': 'Anatomie 3D d\'un robot SCARA : ses articulations, moteurs, réducteurs et sa commande, avec un mode rayons X.',
  'anatomy-cobot.html': 'Anatomie 3D d\'un robot collaboratif : articulations, moteurs, freins, capteurs et commande, avec un mode rayons X.',
  'anatomy-delta.html': 'Anatomie 3D d\'un robot Delta : moteurs, bras, parallélogrammes et plateforme, avec un mode rayons X.',
  'anatomy-gantry.html': 'Anatomie 3D d\'un portique cartésien : rails, courroies, moteurs et effecteur, avec un mode rayons X.',
  'anatomy-mobile.html': 'Anatomie 3D d\'un robot mobile à entraînement différentiel : roues, moteurs, batterie, capteurs et commande, avec un mode rayons X.',
  'anatomy-wheels.html': 'Anatomie 3D de sept types de roues : fixe, folle, orientable, omni, Mecanum, sphérique et chenille, avec un mode rayons X.',
  'anatomy-drives.html': 'Anatomie 3D de huit configurations de robots mobiles : différentielle, Ackermann, omni, Mecanum et d\'autres.',
  'anatomy-stewart.html': 'Anatomie 3D d\'une plateforme de Stewart : six jambes, actionneurs et liaisons, avec un mode rayons X.',
  'anatomy-quadrotor.html': 'Anatomie 3D d\'un drone quadrirotor qui vole vraiment : moteurs, ESC, contrôleur de vol, batterie et capteurs, avec un mode rayons X.',
  'anatomy-tracked.html': 'Anatomie 3D d\'un robot à chenilles qui roule vraiment : chenilles, barbotins, galets, moteurs, capteurs et direction par glissement, avec un mode rayons X.',
  'anatomy-quadruped.html': 'Anatomie 3D d\'un robot quadrupède qui trotte vraiment : 12 articulations, pattes, caméras, batterie et ordinateur, avec un mode rayons X.',
  'anatomy-auv.html': 'Anatomie 3D d\'un robot sous-marin autonome (AUV) : hélice, gouvernes, coque étanche, sonars et navigation sans GPS, avec un mode rayons X.',
  'anatomy-humanoid.html': 'Anatomie 3D d\'un robot humanoïde qui marche vraiment : marche, cinématique des jambes, équilibre, actionneurs et batterie, avec un mode rayons X.'
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// every page has a French twin made by build-fr.mjs (learn.html -> learn-fr.html), except the 404 and offline pages
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html') && f !== '404.html' && !fs.readFileSync(path.join(root, f), 'utf8').includes('http-equiv="refresh"')).sort();   // not the old addresses that lead to another page
const url = (f) => (f === 'index.html' ? SITE + '/' : SITE + '/' + f.replace(/\.html$/, ''));
const isFr = (f) => /-fr\.html$/.test(f), enOf = (f) => f.replace(/-fr\.html$/, '.html'), frOf = (f) => f.replace(/\.html$/, '-fr.html');
const twin = (f) => (isFr(f) || pages.includes(frOf(f)));
for (const f of pages) {
  const file = path.join(root, f); let h = fs.readFileSync(file, 'utf8'), fr = isFr(f);
  h = h.replace(/ *<!-- seo -->[\s\S]*?<!-- \/seo -->\n/, '');
  h = h.replace(/<html\b([^>]*)>/, (all, a) => `<html lang="${fr ? 'fr' : 'en'}"${a.replace(/\slang="[^"]*"/, '')}>`);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1]; if (!title) { console.log('no title:', f); continue; }
  const own = h.match(/<meta name="description" content="([^"]*)"/);
  const desc = fr ? DESC_FR[enOf(f)] : own ? own[1] : DESC[f]; if (!desc) { console.log('no description:', f); continue; }
  if (fr && own) h = h.replace(own[0], `<meta name="description" content="${esc(desc)}"`);
  const alt = twin(f) ? [`<link rel="alternate" hreflang="en" href="${url(enOf(f))}" />`, `<link rel="alternate" hreflang="fr" href="${url(fr ? f : frOf(f))}" />`, `<link rel="alternate" hreflang="x-default" href="${url(enOf(f))}" />`] : [];
  const tags = [
    own ? null : `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${url(f)}" />`, ...alt, `<meta property="og:locale" content="${fr ? 'fr_FR' : 'en_US'}" />`,
    /rel="icon"/.test(h) ? null : '<link rel="icon" type="image/svg+xml" href="/logo.svg" />',
    `<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`, `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url(f)}" />`, `<meta property="og:image" content="${IMG}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    // offline mode: the site can be installed as an app (manifest, service worker in nav.js)
    '<link rel="manifest" href="/manifest.webmanifest" />', '<meta name="theme-color" content="#2f6bff" />', '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />'
  ].filter(Boolean);
  h = h.replace(/(<title>[^<]*<\/title>\n)/, `$1    <!-- seo -->\n${tags.map((t) => '    ' + t + '\n').join('')}    <!-- /seo -->\n`);
  fs.writeFileSync(file, h);
}
const urls = pages.filter((f) => f !== 'offline.html').map((f) => `  <url><loc>${url(f)}</loc>` +
  (twin(f) ? `<xhtml:link rel="alternate" hreflang="en" href="${url(enOf(f))}"/><xhtml:link rel="alternate" hreflang="fr" href="${url(isFr(f) ? f : frOf(f))}"/>` : '') + '</url>').join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('pages', pages.length);
