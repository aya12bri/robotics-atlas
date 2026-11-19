// Course 8 — Wheeled mobile robots: locomotion, kinematics and motion control
// Sources: four lecture sets (mobile-robot locomotion and kinematics, wheel constraints and maneuverability,
// omnidirectional robots, and a bicycle / car exercise), rewritten and explained for this site.
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
import './m-ex1.mjs';
import './m-ex2.mjs';
import './m-ex3.mjs';
import './m-ex4.mjs';
import { ESS } from './m-ess.mjs';
import { MFIG } from '../practice/figx.mjs';
import { partZero } from './m-0.mjs';
import { partA } from './m-a.mjs';
import { partDrives } from './m-8.mjs';
import { partB } from './m-b.mjs';
import { partC } from './m-c.mjs';
import { partD } from './m-d.mjs';
import { partE } from './m-e.mjs';
import { partF } from './m-f.mjs';
import { partG } from './m-g.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
// only the parts a page needs are built, so each page's French dictionary holds only its own texts
const num = (h) => +/data-id="wmr-(\d+)"/.exec(h)[1];
const sorted = (list) => list.sort((x, y) => num(x) - num(y));
// "The essentials" box of each lesson, just before its key terms (as in the other courses)
const withEss = (h) => { const e = ESS[num(h)]; if (!e) return h; const mf = MFIG[num(h)] && MFIG[num(h)](), box = '          ' + BOX('key', ['The essentials', 'L\'essentiel'], UL(e)) + '\n' + (mf ? `          <figure class="figure pfig"><svg viewBox="${mf.fig.vb}" class="fig" role="img" aria-hidden="true">${mf.fig.svg}</svg><figcaption>${tx(...mf.cap)}</figcaption></figure>\n` : '');
  const i = h.indexOf('<h3>Key terms</h3>'); return i < 0 ? h : h.slice(0, h.lastIndexOf('\n', i) + 1) + box + h.slice(h.lastIndexOf('\n', i) + 1); };
export const lessonsPart1 = () => sorted([...partZero(), ...partA(), ...partB(), ...partDrives(), ...partC()]).filter((h) => num(h) <= 10).map(withEss);
export const lessonsPart2 = () => sorted([...partC(), ...partD(), ...partE(), ...partF(), ...partG()]).filter((h) => num(h) > 10).map(withEss);

const exercisesHow = () => P(`<strong>How the exercises work.</strong> Each lesson ends with exercises of three levels (beginner, intermediate, professional). For most of them you type a number and the page checks it (with a small tolerance); the others are multiple choice. The hint and the solution are hidden until you open them: always try first. Your progress is saved in this browser. <strong>Be honest with yourself:</strong> reading is not enough, you become a professional by solving, building and measuring, so do the labs of lesson 20.`,
  `<strong>Comment marchent les exercices.</strong> Chaque leçon se termine par des exercices de trois niveaux (débutant, intermédiaire, professionnel). Pour la plupart, vous tapez un nombre et la page le vérifie (avec une petite tolérance) ; les autres sont des QCM. L'indice et la solution sont cachés tant que vous ne les ouvrez pas : essayez toujours d'abord. Votre progression est enregistrée dans ce navigateur. <strong>Soyez honnête avec vous-même :</strong> lire ne suffit pas, on devient professionnel en résolvant, en construisant et en mesurant, donc faites les TP de la leçon 20.`);

// the two parts of the course, as shown in the intro table of both pages
export const partsTable = () => TABLE([[`Part`, `Partie`], [`Lessons`, `Leçons`], [`You will be able to…`, `Vous saurez…`]], [
  [[`<strong>Part 1 · A. Foundations</strong> (beginner)`, `<strong>Partie 1 · A. Fondations</strong> (débutant)`], `1 – 4`, [`do the maths of the course, describe the pose of a robot, and write the constraints of any wheel`, `faire les maths du cours, décrire la pose d'un robot, et écrire les contraintes de n'importe quelle roue`]],
  [[`<strong>Part 1 · B. Kinematics of every drive</strong> (intermediate)`, `<strong>Partie 1 · B. Cinématique de chaque motorisation</strong> (intermédiaire)`], `5 – 10`, [`compute the wheel speeds and the motion of differential, car, omni, Mecanum and swerve robots, and count their degrees of freedom`, `calculer les vitesses de roues et le mouvement des robots différentiels, voiture, omni, Mecanum et swerve, et compter leurs degrés de liberté`]],
  [[`<strong>Part 2 · C. Control and planning</strong> (advanced)`, `<strong>Partie 2 · C. Commande et planification</strong> (avancé)`], `11 – 13`, [`drive a robot to a pose, make it follow a path, and plan feasible paths and speed profiles`, `conduire un robot vers une pose, lui faire suivre un chemin, et planifier des chemins réalisables et des profils de vitesse`]],
  [[`<strong>Part 2 · D. Professional engineering</strong>`, `<strong>Partie 2 · D. Ingénierie professionnelle</strong>`], `14 – 20`, [`calibrate, filter, size, program, secure and test a real robot, design one from a specification, and pass the final certification`, `étalonner, filtrer, dimensionner, programmer, sécuriser et tester un vrai robot, en concevoir un à partir d'un cahier des charges, et réussir la certification finale`]]
]);

export function build() {
  const head = {
    title: tx(`Wheeled mobile robots, part 1: how a robot rolls`, `Robots mobiles à roues, partie 1 : comment un robot roule`),
    lead: tx(`Part 1 of the course, in 10 lessons, from zero: the maths you need (from scratch), how every wheel and drive works (differential, tricycle, car, omni, Mecanum, swerve, tracked), the constraints, the ICR, mobility and maneuverability, and holonomy. Every lesson has worked examples and graded exercises with hints and solutions, many checked automatically. Part 2 then takes you to the professional level: control, planning, calibration, Kalman filter, sizing, ROS 2, safety, exam and labs.`,
      `Partie 1 du cours, en 10 leçons, depuis zéro : les maths nécessaires (depuis le début), le fonctionnement de chaque roue et motorisation (différentiel, tricycle, voiture, omni, Mecanum, swerve, chenilles), les contraintes, le CIR, la mobilité et la manœuvrabilité, et l'holonomie. Chaque leçon a des exemples résolus et des exercices gradués avec indices et solutions, beaucoup corrigés automatiquement. La partie 2 vous amène ensuite au niveau professionnel : commande, planification, étalonnage, filtre de Kalman, dimensionnement, ROS 2, sécurité, examen et TP.`),
    intro: BOX(`idea`, [`How to follow this course`, `Comment suivre ce cours`],
      P(`The course has two parts (two pages) and four blocks. This page is part 1. You can skip a block if you already know it, but take the exercises of the lesson first: if you solve them, move on.`,
        `Le cours a deux parties (deux pages) et quatre blocs. Cette page est la partie 1. Vous pouvez sauter un bloc si vous le connaissez déjà, mais faites d'abord les exercices de la leçon : si vous les résolvez, passez à la suite.`),
      partsTable(),
      P(`<a href="learn-mobile-pro.html">Go straight to part 2 (lessons 11 to 20) →</a>`, `<a href="learn-mobile-pro.html">Aller directement à la partie 2 (leçons 11 à 20) →</a>`),
      exercisesHow()),
    glossTitle: tx(`Glossary`, `Glossaire`),
    glossIntro: tx(`All the words of the course in one place.`, `Tous les mots du cours au même endroit.`),
    gloss: glossary(),
    finish: {
      h: tx(`Part 1 done: you know how every wheeled robot moves!`, `Partie 1 terminée : vous savez comment bouge chaque robot à roues !`),
      p: tx(`You can model any drive, compute its wheel speeds and count its degrees of freedom. Part 2 teaches you to control it, plan its paths, calibrate, filter, size, program, secure and test it, up to the final exam and the labs.`, `Vous savez modéliser n'importe quelle motorisation, calculer ses vitesses de roues et compter ses degrés de liberté. La partie 2 vous apprend à la commander, planifier ses chemins, étalonner, filtrer, dimensionner, programmer, sécuriser et tester, jusqu'à l'examen final et aux TP.`),
      next: [`learn-mobile-pro.html`, tx(`Go to part 2: professional level →`, `Aller à la partie 2 : niveau professionnel →`)],
      back: tx(`Back to the roadmap`, `Retour au parcours`)
    }
  };
  return { head, lessons: lessonsPart1() };
}

export function glossary() {
  return TABLE([[`Term`, `Terme`], [`Meaning`, `Sens`]], [
    [[`Pose / posture`, `Pose / posture`], [`The position and orientation of the robot: (x, y, θ).`, `La position et l'orientation du robot : (x, y, θ).`]],
    [[`Rotation matrix R(θ)`, `Matrice de rotation R(θ)`], [`Converts a vector from the global frame to the robot frame.`, `Convertit un vecteur du repère global au repère robot.`]],
    [[`Rolling constraint`, `Contrainte de roulement`], [`The wheel contact moves along its plane at r·φ̇ (pure rolling).`, `Le contact de la roue avance dans son plan à r·φ̇ (roulement pur).`]],
    [[`Sliding constraint`, `Contrainte de glissement`], [`The wheel contact has no speed across its plane (no lateral slip).`, `Le contact de la roue n'a aucune vitesse en travers de son plan (pas de glissement latéral).`]],
    [[`Standard wheel (fixed / steered)`, `Roue standard (fixe / orientable)`], [`A wheel that rolls and does not slide; it constrains the robot.`, `Une roue qui roule et ne glisse pas ; elle contraint le robot.`]],
    [[`Castor wheel`, `Roue folle`], [`A wheel whose steering axis is offset from the contact point; it does not constrain the robot.`, `Une roue dont l'axe de direction est décalé du point de contact ; elle ne contraint pas le robot.`]],
    [[`Swedish / Mecanum wheel`, `Roue suédoise / Mecanum`], [`A wheel with free rollers on its rim: it also moves along the rollers.`, `Une roue avec des rouleaux libres sur sa jante : elle peut aussi se déplacer le long des rouleaux.`]],
    [[`Differential drive`, `Entraînement différentiel`], [`Two driven wheels on one axle; v = (V_R + V_L) / 2, ω = (V_R − V_L) / L.`, `Deux roues motrices sur un même axe ; v = (V_R + V_L) / 2, ω = (V_R − V_L) / L.`]],
    [[`ICC / ICR`, `CIC / CIR`], [`Instantaneous centre of curvature / rotation: the point around which the robot turns at one instant.`, `Centre instantané de courbure / rotation : le point autour duquel le robot tourne à un instant donné.`]],
    [[`Ackermann steering`, `Direction d'Ackermann`], [`The inside front wheel turns more than the outside one, so all four wheel axes meet at the ICR.`, `La roue avant intérieure braque plus que l'extérieure, de sorte que les quatre axes de roues se coupent au CIR.`]],
    [[`Synchro drive`, `Entraînement synchrone`], [`Three wheels driven and steered together by belts; the ICC is at infinity.`, `Trois roues entraînées et orientées ensemble par des courroies ; le CIR est à l'infini.`]],
    [[`Degree of mobility δm`, `Degré de mobilité δm`], [`3 − rank of the sliding constraints: velocities available immediately.`, `3 − rang des contraintes de glissement : vitesses disponibles immédiatement.`]],
    [[`Degree of steerability δs`, `Degré d'orientabilité δs`], [`Number of independent steering motions that change the constraints over time.`, `Nombre de mouvements d'orientation indépendants qui changent les contraintes au cours du temps.`]],
    [[`Degree of maneuverability δM`, `Degré de manœuvrabilité δM`], [`δm + δs: total degrees of freedom the robot can control.`, `δm + δs : degrés de liberté totaux que le robot peut commander.`]],
    [[`DOF / DDOF`, `DDL / DDDL`], [`Poses the robot can reach / velocities it can produce independently at one instant.`, `Poses que le robot peut atteindre / vitesses qu'il peut produire indépendamment à un instant.`]],
    [[`Holonomic / nonholonomic`, `Holonome / non holonome`], [`A holonomic robot has DDOF = DOF; a nonholonomic one has velocity constraints that cannot be integrated.`, `Un robot holonome a DDDL = DDL ; un robot non holonome a des contraintes de vitesse non intégrables.`]],
    [[`Path / trajectory`, `Chemin / trajectoire`], [`A curve in (x, y, θ) / the same curve with time.`, `Une courbe dans (x, y, θ) / la même courbe avec le temps.`]],
    [[`Odometry`, `Odométrie`], [`Computing the pose by integrating the wheel motions; it drifts.`, `Calculer la pose en intégrant les mouvements des roues ; elle dérive.`]],
    [[`Mecanum drive`, `Motorisation Mecanum`], [`Four Mecanum wheels in an X layout: holonomic; the wheel speeds satisfy FL + FR = RL + RR.`, `Quatre roues Mecanum en X : holonome ; les vitesses des roues vérifient AVG + AVD = ARG + ARD.`]],
    [[`Swerve drive`, `Swerve`], [`Independently steered and driven modules; each module speed and angle come from u = (v_x − ω y, v_y + ω x).`, `Modules orientés et entraînés indépendamment ; vitesse et angle de chaque module viennent de u = (v_x − ω y, v_y + ω x).`]],
    [[`Pure pursuit`, `Poursuite pure`], [`Path following by steering along the circle to a look-ahead point: κ = 2 y_g / L_d².`, `Suivi de chemin en braquant selon le cercle vers un point d'anticipation : κ = 2 y_g / L_d².`]],
    [[`Dubins / Reeds–Shepp path`, `Chemin de Dubins / Reeds–Shepp`], [`Shortest path with a minimum turning radius, forward only / with reversing.`, `Plus court chemin avec un rayon de virage minimal, en avant seulement / avec marche arrière.`]],
    [[`Calibration`, `Étalonnage`], [`Measuring and correcting the systematic parameters (wheel radii, track) of the odometry.`, `Mesurer et corriger les paramètres systématiques (rayons de roues, voie) de l'odométrie.`]],
    [[`Kalman filter / EKF`, `Filtre de Kalman / EKF`], [`Combines a prediction and a measurement according to their uncertainties; the EKF linearises a nonlinear motion model.`, `Combine une prédiction et une mesure selon leurs incertitudes ; l'EKF linéarise un modèle de mouvement non linéaire.`]],
    [[`Rolling resistance c_rr`, `Résistance au roulement c_rr`], [`Ratio of the rolling force to the weight.`, `Rapport de la force de roulement au poids.`]],
    [[`RMS torque`, `Couple RMS`], [`Root-mean-square torque over the work cycle: it must stay below the continuous torque of the motor.`, `Couple efficace sur le cycle de travail : il doit rester sous le couple continu du moteur.`]],
    [[`Stopping distance`, `Distance d'arrêt`], [`v·t_r + v² / (2a): reaction travel plus braking.`, `v·t_r + v² / (2a) : course de réaction plus freinage.`]],
    [[`STO (Safe Torque Off)`, `STO (suppression sûre du couple)`], [`A certified function of the motor drive that removes the torque safely.`, `Une fonction certifiée du variateur qui supprime le couple de façon sûre.`]],
    [[`cmd_vel / Twist`, `cmd_vel / Twist`], [`The ROS velocity command: linear.x = v (m/s), angular.z = ω (rad/s).`, `La commande de vitesse ROS : linear.x = v (m/s), angular.z = ω (rad/s).`]],
    [[`Polar control law`, `Loi de commande polaire`], [`v = kρ·ρ, ω = kα·α + kβ·β, stable if kρ > 0, kβ < 0, kα − kρ > 0.`, `v = kρ·ρ, ω = kα·α + kβ·β, stable si kρ > 0, kβ < 0, kα − kρ > 0.`]]
  ]);
}
