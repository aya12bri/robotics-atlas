// Course — Code a robot arm in Python: forward and inverse kinematics, Jacobian, trajectories, a real servo arm, exam and labs
import { tx, P, BOX, TABLE, OL } from '../lib.mjs';
import { partA } from './labs-a.mjs';
import { partB } from './labs-b.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  const head = {
    title: tx('Code a robot arm in Python', 'Coder un bras robot en Python'),
    lead: tx('The hands-on course for robot arms: write the forward kinematics, a DH engine for any robot, the exact and the numerical inverse kinematics, smooth trajectories, then drive a real 3-servo arm with an Arduino. Every program is given in full and was run to produce the outputs shown. It ends with a written exam and five labs.',
      'Le cours pratique des bras robots : écrire le modèle direct, un moteur DH pour n\'importe quel robot, le modèle inverse exact puis numérique, des trajectoires douces, puis piloter un vrai bras à 3 servos avec un Arduino. Chaque programme est donné en entier et a été exécuté pour produire les sorties affichées. Le cours se termine par un examen écrit et cinq TP.'),
    intro: BOX('idea', ['Before you start', 'Avant de commencer'],
      P('You need basic Python (variables, functions, loops) and the ideas of the maths course: trigonometry, matrices, frames, DH. Each lesson gives a complete file: type it (do not only copy it), run it, compare with the output shown, then change something and predict the result before running again.',
        'Il vous faut des bases de Python (variables, fonctions, boucles) et les idées du cours de maths : trigonométrie, matrices, repères, DH. Chaque leçon donne un fichier complet : tapez-le (ne vous contentez pas de le copier), lancez-le, comparez avec la sortie affichée, puis changez quelque chose et prédisez le résultat avant de relancer.'),
      OL([
        ['Lessons 1 to 4: software only, on any computer.', 'Leçons 1 à 4 : logiciel seulement, sur n\'importe quel ordinateur.'],
        ['Lesson 5: a real arm, about 40 € of parts (3 servos, an Arduino, a power supply).', 'Leçon 5 : un vrai bras, environ 40 € de pièces (3 servos, un Arduino, une alimentation).'],
        ['Lesson 6: the exam and the labs that prove you can do it.', 'Leçon 6 : l\'examen et les TP qui prouvent que vous savez le faire.']
      ])),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Forward kinematics (FK, MGD)', 'Modèle direct (MGD)'], ['From the joint angles to the pose of the tool.', 'Des angles des liaisons à la pose de l\'outil.']],
      [['Inverse kinematics (IK, MGI)', 'Modèle inverse (MGI)'], ['From the wanted pose of the tool to the joint angles.', 'De la pose voulue de l\'outil aux angles des liaisons.']],
      [['Round trip test', 'Test de l\'aller-retour'], ['Checking an inverse model by applying the forward model to its answer.', 'Vérifier un modèle inverse en appliquant le modèle direct à sa réponse.']],
      [['Finite difference', 'Différence finie'], ['A derivative estimated as (change of output) / (small change of input).', 'Une dérivée estimée par (variation de la sortie) / (petite variation de l\'entrée).']],
      [['Damped least squares', 'Moindres carrés amortis'], ['A numerical IK step that stays small near singularities.', 'Un pas de modèle inverse numérique qui reste petit près des singularités.']],
      [['Quintic trajectory', 'Trajectoire quintique'], ['A degree-5 polynomial motion with zero speed and acceleration at both ends.', 'Un mouvement polynomial de degré 5 avec vitesse et accélération nulles aux deux bouts.']],
      [['Servo offset', 'Décalage d\'un servo'], ['The angle error of a mounted servo, measured once and corrected in software.', 'L\'erreur d\'angle d\'un servo monté, mesurée une fois et corrigée par logiciel.']]
    ]),
    finish: {
      h: tx('You can now code and drive a robot arm!', 'Vous savez maintenant coder et piloter un bras robot !'),
      p: tx('Next: add a camera to find objects (perception course), or move to ROS 2 and MoveIt 2 to control a full-size arm.', 'Ensuite : ajoutez une caméra pour trouver des objets (cours de perception), ou passez à ROS 2 et MoveIt 2 pour piloter un bras de taille réelle.'),
      next: ['learn-ros.html', tx('Go to the ROS 2 course →', 'Aller au cours ROS 2 →')],
      back: tx('Back to the roadmap', 'Retour au parcours')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}
