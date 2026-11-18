// Course — Mechanical transmissions and grippers (from the course "Mechanical transmission and transformation", MARS master, Orléans).
import { tx, P, BOX, TABLE } from '../lib.mjs';
import { partA } from './tr-a.mjs';
import { partB } from './tr-b.mjs';

export const meta = { script: 'learn-tr-widgets.js' };
export function build() {
  const head = {
    title: tx('Mechanical transmissions and grippers', 'Transmissions mécaniques et préhenseurs'),
    lead: tx('What sits between the motor and the work of a robot: belts, gears, screws, planetary gears and harmonic drives, how to size a joint, and the grippers that hold the parts. With 3D labs where real gears mesh.',
      'Ce qui se trouve entre le moteur et le travail d\'un robot : courroies, engrenages, vis, trains planétaires et harmonic drives, comment dimensionner une articulation, et les préhenseurs qui tiennent les pièces. Avec des labos 3D où de vrais engrenages engrènent.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('Each lesson starts with one sentence that gives the idea, then the vocabulary, the formulas and a worked example with numbers, then a lab: turn the 3D scenes with the mouse. No prerequisite beyond ω = 2π n / 60 and P = T ω; the dynamics course goes further on motors and control.',
        'Chaque leçon commence par une phrase qui donne l\'idée, puis le vocabulaire, les formules et un exemple corrigé avec des nombres, puis un labo : tournez les scènes 3D à la souris. Aucun prérequis au-delà de ω = 2π n / 60 et P = T ω ; le cours de dynamique va plus loin sur les moteurs et la commande.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Mechanical transmission', 'Transmission mécanique'], ['Carrying mechanical power from a motor to a receiver while adapting speed and torque.', 'Transporter la puissance mécanique d\'un moteur vers un récepteur en adaptant vitesse et couple.']],
      [['Motion transformation', 'Transformation de mouvement'], ['Changing the type, direction or amplitude of a motion (rotation → translation…).', 'Changer le type, la direction ou l\'amplitude d\'un mouvement (rotation → translation…).']],
      [['Gear ratio', 'Rapport de réduction'], ['GR = N_driven / N_driving = ω_in / ω_out.', 'GR = N_menée / N_menante = ω_entrée / ω_sortie.']],
      [['Module', 'Module'], ['m = circular pitch / π; pitch diameter d = m Z; same m for two meshing gears.', 'm = pas circulaire / π ; diamètre primitif d = m Z ; même m pour deux roues qui engrènent.']],
      [['Pressure angle', 'Angle de pression'], ['The angle of the contact force on the tooth (often 20°).', 'L\'angle de l\'effort de contact sur la dent (souvent 20°).']],
      [['Backlash', 'Jeu'], ['The clearance between mating teeth: lost motion at each reversal.', 'L\'espace entre dents en prise : mouvement perdu à chaque inversion.']],
      [['Self-locking', 'Irréversible'], ['A drive that the load cannot turn back (one-start worm, small-lead screw).', 'Une transmission que la charge ne peut pas faire tourner en retour (vis sans fin à un filet, vis à petit pas).']],
      [['Planetary gear', 'Train planétaire'], ['Sun, planets on a carrier, internal ring; ratio 1 + N_r / N_s with a fixed ring.', 'Soleil, satellites sur un porte-satellites, couronne intérieure ; rapport 1 + N_r / N_s couronne fixe.']],
      [['Harmonic drive', 'Harmonic drive'], ['Wave generator, flexspline, circular spline; GR = N_e / (N_c − N_e), almost no backlash.', 'Générateur d\'onde, roue flexible, couronne rigide ; GR = N_e / (N_c − N_e), presque sans jeu.']],
      [['Reflected inertia', 'Inertie ramenée'], ['The load inertia seen by the motor: J_L / N².', 'L\'inertie de la charge vue par le moteur : J_L / N².']],
      [['End effector', 'Effecteur'], ['The tool at the end of the arm: gripper, suction cup, torch, hand.', 'L\'outil au bout du bras : pince, ventouse, torche, main.']],
      [['Form-fit, force-fit', 'Prise par obstacle, par adhérence'], ['Holding by the shape of the jaws, or by friction.', 'Tenir par la forme des mors, ou par le frottement.']]
    ]),
    finish: {
      h: tx('You can now choose and size the mechanics of a robot!', 'Vous savez maintenant choisir et dimensionner la mécanique d\'un robot !'),
      p: tx('Next: open the 3D anatomy of the robots to see their reducers in place, and the lesson on actuators of the dynamics course.', 'Ensuite : ouvrez l\'anatomie 3D des robots pour voir leurs réducteurs en place, et la leçon sur les actionneurs du cours de dynamique.'),
      next: ['anatomy.html', tx('See the inside of a robot in 3D →', 'Voir l\'intérieur d\'un robot en 3D →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}
