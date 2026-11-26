// Course — Electronics and Arduino (beginner): from Ohm's law to a first robot that keeps its distance to a wall.
import { tx, P, BOX, TABLE, UL } from '../lib.mjs';
import { loadEx } from './el-ex.mjs';
import { partA } from './el-a.mjs';
import { partB } from './el-b.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  loadEx();
  const head = {
    title: tx('Electronics and Arduino', 'Électronique et Arduino'),
    lead: tx('The electricity every robot runs on, from zero: voltage, current and Ohm\'s law, batteries and regulators, the Arduino board, sensors, PWM and transistors, the DC motor with its H-bridge and encoder, servos and steppers — and, at the end, a first robot that keeps its distance to a wall. Every circuit is drawn, every program is given in full.',
      'L\'électricité dont vit tout robot, depuis zéro : tension, courant et loi d\'Ohm, batteries et régulateurs, la carte Arduino, les capteurs, la PWM et les transistors, le moteur à courant continu avec son pont en H et son codeur, les servos et les pas à pas — et, à la fin, un premier robot qui garde sa distance à un mur. Chaque circuit est dessiné, chaque programme est donné en entier.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('No prerequisite; the Python course helps for the programs. To practise you need an Arduino Uno (or a clone), a breadboard, a few LEDs and resistors, a button, a potentiometer, an HC-SR04, a small DC motor with encoder, a TB6612 or L298N driver, a servo, and a 2S battery with a 5 V buck converter. You can also follow everything on a free online simulator (Wokwi, Tinkercad Circuits) before buying anything.',
        'Aucun prérequis ; le cours Python aide pour les programmes. Pour pratiquer il faut un Arduino Uno (ou un clone), une plaque d\'essai, quelques LED et résistances, un bouton, un potentiomètre, un HC-SR04, un petit moteur CC avec codeur, un pilote TB6612 ou L298N, un servo, et une batterie 2S avec un abaisseur 5 V. Vous pouvez aussi tout suivre sur un simulateur en ligne gratuit (Wokwi, Tinkercad Circuits) avant d\'acheter quoi que ce soit.'),
      UL([
        ['Lessons 1 and 2: electricity and power, the base of everything.', 'Leçons 1 et 2 : l\'électricité et l\'alimentation, la base de tout.'],
        ['Lessons 3 to 7: the Arduino, sensors and every kind of motor.', 'Leçons 3 à 7 : l\'Arduino, les capteurs et toutes les sortes de moteurs.'],
        ['Lesson 8: a complete robot with a closed loop.', 'Leçon 8 : un robot complet avec une boucle fermée.']
      ])),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Voltage (V)', 'Tension (V)'], ['The electrical “pressure” between two points.', 'La « pression » électrique entre deux points.']],
      [['Current (A)', 'Courant (A)'], ['The flow of charges through a wire.', 'Le débit de charges dans un fil.']],
      [['Ohm\'s law', 'Loi d\'Ohm'], ['U = R I.', 'U = R I.']],
      [['Voltage divider', 'Pont diviseur'], ['Two resistors that give a fraction of a voltage: Vout = Vin R2 / (R1 + R2).', 'Deux résistances qui donnent une fraction d\'une tension : Vout = Vin R2 / (R1 + R2).']],
      [['Common ground', 'Masse commune'], ['The 0 V reference shared by every part of the robot.', 'La référence 0 V partagée par toutes les parties du robot.']],
      [['Regulator, buck converter', 'Régulateur, abaisseur'], ['A circuit that makes a fixed lower voltage (5 V) from the battery.', 'Un circuit qui fabrique une tension fixe plus basse (5 V) à partir de la batterie.']],
      [['Pull-up resistor', 'Résistance de tirage'], ['Holds an input at 5 V when nothing pulls it down.', 'Maintient une entrée à 5 V quand rien ne la tire vers le bas.']],
      [['PWM, duty cycle', 'PWM, rapport cyclique'], ['A fast on/off signal; the fraction of time on sets the average voltage.', 'Un signal tout-ou-rien rapide ; la fraction de temps allumée fixe la tension moyenne.']],
      [['MOSFET', 'MOSFET'], ['A transistor used as an electronic switch for a big current.', 'Un transistor utilisé comme interrupteur électronique pour un fort courant.']],
      [['Flyback diode', 'Diode de roue libre'], ['Protects the switch from the voltage spike of a coil.', 'Protège l\'interrupteur du pic de tension d\'une bobine.']],
      [['H-bridge', 'Pont en H'], ['Four switches that set the direction of a DC motor.', 'Quatre interrupteurs qui fixent le sens d\'un moteur CC.']],
      [['Encoder, CPR', 'Codeur, CPR'], ['A sensor that gives ticks as a shaft turns; CPR = ticks per turn.', 'Un capteur qui donne des tops quand un arbre tourne ; CPR = tops par tour.']],
      [['Servo', 'Servo'], ['A motor with its own position loop, told an angle by a 1–2 ms pulse.', 'Un moteur avec sa propre boucle de position, à qui on donne un angle par une impulsion de 1–2 ms.']],
      [['Stepper motor', 'Moteur pas à pas'], ['A motor that turns by exact steps (often 1.8°).', 'Un moteur qui tourne par pas exacts (souvent 1,8°).']],
      [['Saturation, dead band', 'Saturation, zone morte'], ['A limit on the command; a small zone around the target where the command is zero.', 'Une limite sur la commande ; une petite zone autour de la consigne où la commande est nulle.']]
    ]),
    finish: {
      h: tx('Your first robot moves on its own!', 'Votre premier robot bouge tout seul !'),
      p: tx('Next: the control course to turn the P controller into a PID on each wheel, the wheeled mobile robots course for odometry and path following, and ROS 2 from zero to give the robot a bigger brain.', 'Ensuite : le cours de commande pour faire du correcteur P un PID sur chaque roue, le cours sur les robots mobiles à roues pour l\'odométrie et le suivi de chemin, et ROS 2 depuis zéro pour donner au robot un plus grand cerveau.'),
      next: ['index.html#road', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}
