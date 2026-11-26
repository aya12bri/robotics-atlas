// Course — Medical robotics (Master): from the history of surgery to tele-ultrasound robots
// (from the Master M2 course of P. Vieyres, Laboratoire PRISME, Université d'Orléans).
import { tx, P, BOX, TABLE, UL } from '../lib.mjs';
import { loadEx } from './med-ex.mjs';
import { lessons } from './med-a.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  loadEx();
  const head = {
    title: tx('Medical robotics', 'Robotique médicale'),
    lead: tx('Why and how robots enter the operating room: the history of surgery and imaging, keeping the doctor in the loop, degrees of freedom and the fixed point of the trocar, co-manipulation, safety and sterility, the robots of today\'s hospitals, and robotic tele-ultrasound — with a method for your own project.',
      'Pourquoi et comment les robots entrent au bloc opératoire : l\'histoire de la chirurgie et de l\'imagerie, garder le médecin dans la boucle, les degrés de liberté et le point fixe du trocart, la comanipulation, la sécurité et la stérilité, les robots des hôpitaux d\'aujourd\'hui, et la télé-échographie robotisée — avec une méthode pour votre propre projet.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('Master level. It uses the modelling course (degrees of freedom, kinematics), the parallel robots course (spherical mechanisms) and the teleoperation course (master–slave, delays, cobotics). Each lesson starts with one sentence, then the details, then exercises with detailed solutions.',
        'Niveau Master. Il s\'appuie sur le cours de modélisation (degrés de liberté, cinématique), le cours sur les robots parallèles (mécanismes sphériques) et le cours de téléopération (maître–esclave, retards, cobotique). Chaque leçon commence par une phrase, puis les détails, puis des exercices avec des solutions détaillées.'),
      UL([
        ['Lessons 1 and 2: the history and the role of the robot.', 'Leçons 1 et 2 : l\'histoire et le rôle du robot.'],
        ['Lessons 3 to 5: kinematics, co-manipulation, constraints.', 'Leçons 3 à 5 : cinématique, comanipulation, contraintes.'],
        ['Lessons 6 to 8: the robots in hospitals, tele-ultrasound, your project.', 'Leçons 6 à 8 : les robots à l\'hôpital, la télé-échographie, votre projet.']
      ])),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Minimally invasive surgery (MIS)', 'Chirurgie mini-invasive'], ['Surgery through small holes with long instruments and a camera.', 'Chirurgie par de petits trous avec de longs instruments et une caméra.']],
      [['Trocar', 'Trocart'], ['The tube through the abdominal wall that instruments pass through.', 'Le tube à travers la paroi abdominale par lequel passent les instruments.']],
      [['Remote centre of motion (RCM)', 'Centre de rotation déporté (RCM)'], ['A fixed point, away from the robot, about which the tool pivots.', 'Un point fixe, loin du robot, autour duquel l\'outil pivote.']],
      [['Fulcrum effect', 'Effet levier'], ['Through a trocar the tip moves the opposite way to the hand, scaled by L in / L out.', 'À travers un trocart la pointe bouge à l\'opposé de la main, dans le rapport L int / L ext.']],
      [['Teleoperation', 'Téléopération'], ['The doctor moves a master arm, a slave robot reproduces the gesture.', 'Le médecin bouge un bras maître, un robot esclave reproduit le geste.']],
      [['Co-manipulation', 'Comanipulation'], ['The doctor and the robot hold and move the tool together.', 'Le médecin et le robot tiennent et bougent l\'outil ensemble.']],
      [['Virtual fixture', 'Guide virtuel'], ['A forbidden zone or a guiding path created by the robot\'s control.', 'Une zone interdite ou un chemin de guidage créé par la commande du robot.']],
      [['Motion scaling', 'Démultiplication'], ['The tool moves k times less than the hand.', 'L\'outil bouge k fois moins que la main.']],
      [['Physiological tremor', 'Tremblement physiologique'], ['A small oscillation of the hand, around 8–12 Hz.', 'Une petite oscillation de la main, autour de 8–12 Hz.']],
      [['Medical device, CE marking', 'Dispositif médical, marquage CE'], ['The legal status of a medical robot in Europe (Regulation 2017/745).', 'Le statut légal d\'un robot médical en Europe (règlement 2017/745).']],
      [['Tele-ultrasound', 'Télé-échographie'], ['An ultrasound examination made at a distance through a robot holding the probe.', 'Un examen échographique fait à distance via un robot qui tient la sonde.']],
      [['Phantom', 'Fantôme'], ['An artificial model of the body used to test a robot.', 'Un modèle artificiel du corps utilisé pour tester un robot.']]
    ]),
    finish: {
      h: tx('You can now analyse a medical robot like an engineer!', 'Vous savez maintenant analyser un robot médical comme un ingénieur !'),
      p: tx('Next: the book La robotique médicale (J. Troccaz, ed., Hermès), the teleoperation course for delays and force feedback, and the parallel robots course for spherical mechanisms.', 'Ensuite : le livre La robotique médicale (J. Troccaz, dir., Hermès), le cours de téléopération pour les retards et le retour d\'effort, et le cours sur les robots parallèles pour les mécanismes sphériques.'),
      next: ['index.html#road', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: lessons() };
}
