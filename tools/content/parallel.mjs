// Course — Workspaces, motion modes and parallel robots (from "Robot modeling" UE33c and "Parallel robotics", MARS master).
import { tx, P, BOX, TABLE } from '../lib.mjs';
import { partA } from './par-a.mjs';
import { partB } from './par-b.mjs';

export const meta = { script: 'learn-par-widgets.js' };
export function build() {
  const head = {
    title: tx('Workspaces, motion modes and parallel robots', 'Espaces de travail, modes de déplacement et robots parallèles'),
    lead: tx('Where a robot can go and how it gets there: joint and operational spaces, joint limits and workspace, linear and joint motions, aspects and redundancy, then parallel robots — Delta, five-bar, hexapods — their mobility, models and singularities. With 3D labs you can turn and drive.',
      'Où un robot peut aller et comment il y va : espaces articulaire et opérationnel, limites articulaires et espace de travail, déplacements linéaires et articulaires, aspects et redondance, puis les robots parallèles — Delta, cinq barres, hexapodes — leur mobilité, leurs modèles et leurs singularités. Avec des labos 3D à faire tourner et à piloter.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('Every lesson starts with one sentence that gives the idea, then explains it with a drawing, a worked example with numbers and a lab. The only maths you need is the trigonometry of a triangle (cosine, sine, law of cosines); the boxes “Links with the other courses” at the end of each lesson tell you where to revise and where to go next.',
        'Chaque leçon commence par une phrase qui donne l\'idée, puis l\'explique avec un dessin, un exemple corrigé avec des nombres et un labo. Les seules maths nécessaires sont la trigonométrie du triangle (cosinus, sinus, loi des cosinus) ; les encadrés « Liens avec les autres cours » à la fin de chaque leçon disent où réviser et où aller ensuite.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Joint space', 'Espace articulaire'], ['The space of the joint values q = (q₁ … qₙ): one point per posture.', 'L\'espace des valeurs articulaires q = (q₁ … qₙ) : un point par posture.']],
      [['Operational space', 'Espace opérationnel'], ['The space of the position and orientation X of the tool.', 'L\'espace de la position et de l\'orientation X de l\'outil.']],
      [['Workspace', 'Espace de travail'], ['All the positions the tool can reach, given the joint limits.', 'Toutes les positions que l\'outil peut atteindre, compte tenu des limites articulaires.']],
      [['Aspect', 'Aspect'], ['A family of postures separated from the others by singularities (elbow up / down…).', 'Une famille de postures séparée des autres par des singularités (coude haut / bas…).']],
      [['Redundancy', 'Redondance'], ['More joints than task coordinates: r = n − m free parameters.', 'Plus d\'articulations que de coordonnées de tâche : r = n − m paramètres libres.']],
      [['Linear / joint motion', 'Déplacement linéaire / articulaire'], ['The tool follows a straight line / the joints move together from point to point.', 'L\'outil suit une droite / les articulations bougent ensemble de point à point.']],
      [['Parallel robot', 'Robot parallèle'], ['An effector held by several chains from the base, one actuator per degree of freedom.', 'Un effecteur tenu par plusieurs chaînes partant de la base, un actionneur par degré de liberté.']],
      [['Mobility (Grübler)', 'Mobilité (Grübler)'], ['m = 3(l − n − 1) + Σdᵢ in the plane, 6(…) in space.', 'm = 3(l − n − 1) + Σdᵢ dans le plan, 6(…) dans l\'espace.']],
      [['Kinematic model', 'Modèle cinématique'], ['A θ̇ + B Ẋ = 0, Ẋ = −B⁻¹A θ̇.', 'A θ̇ + B Ẋ = 0, Ẋ = −B⁻¹A θ̇.']],
      [['Parallel singularity', 'Singularité parallèle'], ['det B = 0: the effector moves with the motors locked.', 'det B = 0 : l\'effecteur bouge moteurs bloqués.']]
    ]),
    finish: {
      h: tx('You can now read any robot architecture, serial or parallel!', 'Vous savez maintenant lire n\'importe quelle architecture de robot, série ou parallèle !'),
      p: tx('Next: the singularities course goes deeper into the Jacobian, and the advanced course into the Delta and the Stewart platform.', 'Ensuite : le cours sur les singularités approfondit la jacobienne, et le cours avancé le Delta et la plateforme de Stewart.'),
      next: ['learn-singularities.html', tx('Singularities and the Jacobian →', 'Singularités et jacobienne →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}
