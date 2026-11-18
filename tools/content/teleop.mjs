// Course — Teleoperation, cobotics, control architectures and safety (Master level, from the courses of the MARS master, Orléans / INSA CVL).
// Lessons in tel-a.mjs (teleoperation, TD1, TD2), tel-b.mjs (cobotics, architectures, PAT), tel-c.mjs (safety). Labs in learn-teleop-widgets.js.
import { tx, P, BOX, TABLE, UL } from '../lib.mjs';
import { partA } from './tel-a.mjs';
import { partB } from './tel-b.mjs';
import { partC } from './tel-c.mjs';

export const meta = { script: 'learn-teleop-widgets.js' };
export function build() {
  const head = {
    title: tx('Teleoperation, cobotics, architectures and safety', 'Téléopération, cobotique, architectures et sécurité'),
    lead: tx('How a human acts through a robot at a distance, works hand in hand with a cobot, how the software of a robot is organised from reflexes to missions, and what the law asks before a robot cell may run. Twelve lessons with labs: a master-slave simulator in 3D (the TD1 and TD2), a co-manipulation lab, a robot organised in two ways, the PAT architecture and the risk graph.',
      'Comment un humain agit à distance à travers un robot, travaille main dans la main avec un cobot, comment le logiciel d\'un robot s\'organise des réflexes aux missions, et ce que la loi demande avant qu\'une cellule robotisée puisse tourner. Douze leçons avec des labos : un simulateur maître-esclave en 3D (les TD1 et TD2), un labo de comanipulation, un robot organisé de deux façons, l\'architecture PAT et le graphe de risque.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('Lessons 1 to 6 are the teleoperation course and its two practical works (TD1: position-position; TD2: contact with a wall and comparison of the architectures): the labs reproduce the Simulink models in the browser, with the same parameters. Lessons 7 and 8 are cobotics, 9 and 10 the control architectures, 11 and 12 safety. Prerequisites: the dynamics and control course (mass-spring-damper, Laplace, PID).',
        'Les leçons 1 à 6 sont le cours de téléopération et ses deux TD (TD1 : position-position ; TD2 : contact avec un mur et comparaison des architectures) : les labos reproduisent les modèles Simulink dans le navigateur, avec les mêmes paramètres. Les leçons 7 et 8 sont la cobotique, 9 et 10 les architectures de contrôle, 11 et 12 la sécurité. Prérequis : le cours de dynamique et commande (masse-ressort-amortisseur, Laplace, PID).')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Teleoperation', 'Téléopération'], ['Extending the senses and movements of a human to a remote environment through a robot.', 'Prolonger les sens et les mouvements d\'un humain vers un environnement distant à travers un robot.']],
      [['Master, slave', 'Maître, esclave'], ['The device held by the operator, and the remote robot that reproduces its motion.', 'L\'appareil tenu par l\'opérateur, et le robot distant qui reproduit son mouvement.']],
      [['Haptic interface', 'Interface haptique'], ['A master that can apply forces to the hand of the operator.', 'Un maître capable d\'appliquer des efforts sur la main de l\'opérateur.']],
      [['Bilateral teleoperation', 'Téléopération bilatérale'], ['Teleoperation in which forces also come back to the operator.', 'Téléopération dans laquelle les efforts reviennent aussi vers l\'opérateur.']],
      [['Transparency', 'Transparence'], ['How faithfully force, speed and position are transmitted between the remote environment and the operator.', 'La fidélité de la transmission de force, vitesse et position entre l\'environnement distant et l\'opérateur.']],
      [['Impedance', 'Impédance'], ['The link between the force applied to a system and its motion: Z_d(s) = m s² + b s + k.', 'Le lien entre la force appliquée à un système et son mouvement : Z_d(s) = m s² + b s + k.']],
      [['Force feedback gain', 'Gain de retour d\'effort'], ['The factor α applied to the measured force before it is rendered to the operator.', 'Le facteur α appliqué à la force mesurée avant de la rendre à l\'opérateur.']],
      [['Four-channel architecture', 'Architecture 4 canaux'], ['Teleoperation that sends motion and force in both directions (Lawrence).', 'Téléopération qui envoie mouvement et force dans les deux sens (Lawrence).']],
      [['Passivity', 'Passivité'], ['The property of a system that can never give out more energy than it received.', 'Propriété d\'un système qui ne peut jamais rendre plus d\'énergie qu\'il n\'en a reçu.']],
      [['Wave variables', 'Variables d\'onde'], ['A coding of speed and force, u and v, that keeps a delayed channel passive.', 'Un codage de la vitesse et de la force, u et v, qui garde passif un canal avec retard.']],
      [['Cobotics', 'Cobotique'], ['Direct and safe interaction between a human and a robot.', 'Interaction directe et sûre entre l\'humain et le robot.']],
      [['Co-manipulation', 'Comanipulation'], ['A human and a robot acting on the same object at the same time.', 'Un humain et un robot qui agissent sur le même objet en même temps.']],
      [['Admittance control', 'Commande en admittance'], ['The robot moves like a virtual mass-damper pushed by the measured force of the hand.', 'Le robot bouge comme une masse-amortisseur virtuelle poussée par la force mesurée de la main.']],
      [['Subsumption', 'Subsomption'], ['A reactive architecture of parallel behaviour layers, where a higher layer can override a lower one (Brooks, 1986).', 'Une architecture réactive de couches de comportements parallèles, où une couche supérieure peut prendre le pas sur une inférieure (Brooks, 1986).']],
      [['PAT architecture', 'Architecture PAT'], ['Perception – Action – Teleoperation: levels 0 to 5, from servoings to missions, with teleoperation possible at each level.', 'Perception – Action – Téléopération : niveaux 0 à 5, des asservissements aux missions, avec une téléopération possible à chaque niveau.']],
      [['Harmonised standard', 'Norme harmonisée'], ['A standard whose application gives a presumption of conformity with a European directive.', 'Une norme dont l\'application donne une présomption de conformité à une directive européenne.']],
      [['Partly completed machinery', 'Quasi-machine'], ['An assembly that cannot perform a specific application on its own, made to be built into a machine.', 'Un ensemble qui ne peut pas assurer seul une application définie, fait pour être incorporé dans une machine.']],
      [['Required performance level', 'Niveau de performance requis'], ['PL_r, from a to e: how reliable a safety function must be (ISO 13849-1).', 'PL_r, de a à e : la fiabilité que doit avoir une fonction de sécurité (ISO 13849-1).']],
      [['CE marking', 'Marquage CE'], ['The mark by which the manufacturer shows that the machine meets all the applicable European directives.', 'La marque par laquelle le fabricant montre que la machine respecte toutes les directives européennes applicables.']]
    ]),
    finish: {
      h: tx('You can now drive a robot at a distance, share a task with a cobot, organise its software and make it legal!', 'Vous savez maintenant piloter un robot à distance, partager une tâche avec un cobot, organiser son logiciel et le rendre conforme !'),
      p: tx('Next: build the TD models in Simulink and compare them with the labs, read the INRS guides on collaborative robots, and try the force control lessons of the dynamics course.', 'Ensuite : construisez les modèles des TD dans Simulink et comparez-les aux labos, lisez les guides de l\'INRS sur les robots collaboratifs, et essayez les leçons de commande en effort du cours de dynamique.'),
      next: ['index.html#road', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}
