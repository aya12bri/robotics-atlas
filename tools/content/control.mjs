// Course 5 — Dynamics, actuators and control
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
import { partA } from './ctrl-a.mjs';
import { partB } from './ctrl-b.mjs';
import { partC } from './ctrl-c.mjs';

export const meta = {};
export function build() {
  const head = {
    title: tx('Dynamics, actuators and control', 'Dynamique, actionneurs et commande'),
    lead: tx('Kinematics says where the robot should go. This course explains what it takes to really get there: the forces and torques (dynamics), the motors and gearboxes that produce them, the sensors that measure the result, and the control laws that close the loop, from a simple PID to force control and trajectory generation. It also covers the imperfections of real robots: friction, backlash, vibration.',
      'La cinématique dit où le robot doit aller. Ce cours explique ce qu\'il faut pour y arriver vraiment : les forces et les couples (dynamique), les moteurs et réducteurs qui les produisent, les capteurs qui mesurent le résultat, et les lois de commande qui ferment la boucle, du simple PID à la commande en effort et à la génération de trajectoires. Il couvre aussi les imperfections des vrais robots : frottement, jeu, vibrations.'),
    intro: BOX('idea', ['The big picture', 'Vue d\'ensemble'],
      P('A robot is a feedback machine. Every millisecond the same cycle runs:', 'Un robot est une machine à rétroaction. Chaque milliseconde le même cycle tourne :'),
      OL([
        ['<strong>Plan</strong>: the trajectory generator says where each joint should be now (lesson 7).', '<strong>Planifier</strong> : le générateur de trajectoire dit où chaque articulation doit être maintenant (leçon 7).'],
        ['<strong>Sense</strong>: encoders, current and force sensors measure what happened (lesson 3).', '<strong>Mesurer</strong> : codeurs, capteurs de courant et d\'effort mesurent ce qui s\'est passé (leçon 3).'],
        ['<strong>Compute</strong>: the control law turns the error into a torque request (lessons 4, 5, 6) using the dynamic model (lesson 1).', '<strong>Calculer</strong> : la loi de commande transforme l\'erreur en demande de couple (leçons 4, 5, 6) à l\'aide du modèle dynamique (leçon 1).'],
        ['<strong>Act</strong>: the drive sends current to the motor, the gearbox multiplies the torque (lesson 2).', '<strong>Agir</strong> : le variateur envoie du courant au moteur, le réducteur multiplie le couple (leçon 2).']
      ]),
      P('Lessons 8 and 9 show how all this is organised in a real controller and what the real world adds.', 'Les leçons 8 et 9 montrent comment tout cela est organisé dans un vrai contrôleur et ce que le monde réel ajoute.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: glossary(),
    finish: {
      h: tx('You can now make a robot move for real!', 'Vous savez maintenant faire bouger un robot pour de vrai !'),
      p: tx('Next step: perception, planning and AI, how the robot senses the world, finds a path and learns.', 'Étape suivante : perception, planification et IA, comment le robot perçoit le monde, trouve un chemin et apprend.'),
      next: ['learn-intelligence.html', tx('Go to perception, planning and AI →', 'Aller à la perception, la planification et l\'IA →')],
      back: tx('Back to the roadmap', 'Retour au parcours')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}

function glossary() {
  return TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
    [['Dynamics', 'Dynamique'], ['The relation between joint torques and joint accelerations: M(q) q̈ + C(q, q̇) q̇ + g(q) = τ.', 'La relation entre couples et accélérations articulaires : M(q) q̈ + C(q, q̇) q̇ + g(q) = τ.']],
    [['Inertia matrix M(q)', 'Matrice d\'inertie M(q)'], ['How hard it is to accelerate each joint; it changes with the pose.', 'La difficulté à accélérer chaque articulation ; elle change avec la pose.']],
    [['Coriolis and centrifugal', 'Coriolis et centrifuge'], ['Torques that appear because other joints are moving (velocity products).', 'Couples qui apparaissent parce que d\'autres articulations bougent (produits de vitesses).']],
    [['Gear ratio N', 'Rapport de réduction N'], ['The motor turns N times faster than the joint and has N times less torque.', 'Le moteur tourne N fois plus vite que l\'articulation et a N fois moins de couple.']],
    [['Reflected inertia', 'Inertie réfléchie'], ['The motor inertia seen from the joint: N² · Jm.', 'L\'inertie du moteur vue depuis l\'articulation : N² · Jm.']],
    [['BLDC / PMSM', 'BLDC / PMSM'], ['Brushless motor, the standard of modern robot joints.', 'Moteur sans balais, le standard des articulations de robots modernes.']],
    [['Harmonic drive', 'Réducteur harmonique'], ['A strain-wave gearbox with no backlash and a high ratio, very common in robots.', 'Un réducteur à onde de déformation sans jeu et à fort rapport, très courant en robotique.']],
    [['Encoder', 'Codeur'], ['A sensor that measures an angle: incremental (counts) or absolute (gives the angle at power on).', 'Un capteur qui mesure un angle : incrémental (compte) ou absolu (donne l\'angle à la mise sous tension).']],
    [['PID', 'PID'], ['Proportional-Integral-Derivative controller.', 'Régulateur Proportionnel-Intégral-Dérivé.']],
    [['Windup', 'Emballement de l\'intégrale'], ['The integral term grows without limit while the actuator is saturated.', 'Le terme intégral grandit sans limite pendant que l\'actionneur est saturé.']],
    [['Feedforward', 'Anticipation'], ['A command computed from the model, before any error appears.', 'Une commande calculée à partir du modèle, avant que l\'erreur n\'apparaisse.']],
    [['Computed torque', 'Couple calculé'], ['Control law that cancels the dynamics with the model, leaving a linear error equation.', 'Loi de commande qui annule la dynamique grâce au modèle, laissant une équation d\'erreur linéaire.']],
    [['Impedance control', 'Commande en impédance'], ['The robot behaves like a virtual mass-spring-damper when it touches something.', 'Le robot se comporte comme un masse-ressort-amortisseur virtuel quand il touche quelque chose.']],
    [['Hybrid position / force control', 'Commande hybride position / effort'], ['Position control in some directions, force control in the others.', 'Commande en position dans certaines directions, en effort dans les autres.']],
    [['PTP / LIN / CIRC', 'PTP / LIN / CIRC'], ['Point-to-point (joint), linear and circular motions of a robot program.', 'Mouvements point à point (articulaire), linéaire et circulaire d\'un programme robot.']],
    [['Jerk', 'À-coup (jerk)'], ['The derivative of the acceleration; limiting it gives smooth S-curve profiles.', 'La dérivée de l\'accélération ; la limiter donne des profils en S doux.']],
    [['Backlash', 'Jeu'], ['The free play between the teeth of a gearbox.', 'Le jeu libre entre les dents d\'un réducteur.']],
    [['Input shaping', 'Filtrage d\'entrée'], ['Pre-filtering the command so that it does not excite a vibration mode.', 'Pré-filtrage de la commande pour qu\'elle n\'excite pas un mode de vibration.']]
  ]);
}
