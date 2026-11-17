// Course — Advanced robotics (Master level): parallel robots, LQR, MPC, legged robots, aerial robots, vision in practice, reinforcement learning and grasping in practice (choosing and sizing a gripper or vacuum cups)
import { tx, P, BOX, TABLE, UL } from '../lib.mjs';
import { partA } from './adv-a.mjs';
import { partB } from './adv-b.mjs';
import { partC } from './adv-c.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  const head = {
    title: tx('Advanced robotics (Master level)', 'Robotique avancée (niveau Master)'),
    lead: tx('Eight topics that turn a good robotics student into a specialist: parallel robots (Delta, Stewart), optimal control (LQR), model predictive control (MPC), legged robots and balance, aerial robots, vision in practice (calibration, markers, hand-eye, point clouds) and reinforcement learning. Each lesson gives the method, worked numbers and, where useful, a program that was run.',
      'Huit sujets qui transforment un bon étudiant en robotique en spécialiste : robots parallèles (Delta, Stewart), commande optimale (LQR), commande prédictive (MPC), robots à pattes et équilibre, robots aériens, vision en pratique (étalonnage, marqueurs, main-œil, nuages de points) apprentissage par renforcement et préhension en pratique (choisir et dimensionner une pince ou des ventouses). Chaque leçon donne la méthode, des exemples chiffrés et, quand c\'est utile, un programme qui a été exécuté.'),
    intro: BOX('idea', ['Prerequisites', 'Prérequis'],
      P('This course assumes the maths course (matrices, frames, derivatives, probability, quaternions), the modelling course (DH, MGD, MGI, Jacobian) and the control course (dynamics, transfer functions, state space, PID). Each lesson says which earlier lesson to review. The lessons are independent: take them in any order.',
        'Ce cours suppose le cours de maths (matrices, repères, dérivées, probabilités, quaternions), le cours de modélisation (DH, MGD, MGI, jacobienne) et le cours de commande (dynamique, fonctions de transfert, représentation d\'état, PID). Chaque leçon dit quelle leçon antérieure revoir. Les leçons sont indépendantes : suivez-les dans l\'ordre que vous voulez.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Parallel robot', 'Robot parallèle'], ['A platform held by several chains, each with its motor near the base.', 'Une plateforme tenue par plusieurs chaînes, chacune avec son moteur près de la base.']],
      [['LQR', 'LQR'], ['The state feedback u = −K x that minimises a cost on errors (Q) and commands (R).', 'Le retour d\'état u = −K x qui minimise un coût sur les erreurs (Q) et les commandes (R).']],
      [['MPC', 'MPC'], ['A controller that optimises a sequence of commands over a horizon, with constraints, and applies the first one.', 'Une commande qui optimise une suite de commandes sur un horizon, avec contraintes, et applique la première.']],
      [['ZMP', 'ZMP'], ['The point of the ground where gravity and inertia have no tipping moment; it must stay in the support polygon.', 'Le point du sol où gravité et inertie n\'ont pas de moment de basculement ; il doit rester dans le polygone de sustentation.']],
      [['Capture point', 'Point de capture'], ['ξ = x + ẋ/ω: where to put the foot to come to a stop.', 'ξ = x + ẋ/ω : où poser le pied pour s\'arrêter.']],
      [['Underactuated', 'Sous-actionné'], ['Fewer inputs than degrees of freedom (a quadrotor: 4 for 6).', 'Moins d\'entrées que de degrés de liberté (un quadrirotor : 4 pour 6).']],
      [['Hand-eye calibration', 'Étalonnage main-œil'], ['Finding the transform between a camera and the robot by solving A X = X B.', 'Trouver la transformation entre une caméra et le robot en résolvant A X = X B.']],
      [['Point cloud', 'Nuage de points'], ['The 3D points obtained from a depth image.', 'Les points 3D obtenus à partir d\'une image de profondeur.']],
      [['Policy', 'Politique'], ['In reinforcement learning, the rule that chooses the action from the state.', 'En apprentissage par renforcement, la règle qui choisit l\'action à partir de l\'état.']],
      [['Antipodal grasp', 'Prise antipodale'], ['Two contacts facing each other; it holds if the line between them lies inside both friction cones.', 'Deux contacts face à face ; elle tient si la droite qui les relie est dans les deux cônes de frottement.']],
      [['Gripping safety factor', 'Coefficient de sécurité de préhension'], ['The margin S in n μ N ≥ S m (g + a): about 2 for friction grips and top suction, 4 or more for a cup loaded across.', 'La marge S dans n μ N ≥ S m (g + a) : environ 2 pour les prises par frottement et l\'aspiration par le dessus, 4 ou plus pour une ventouse chargée en travers.']],
      [['Venturi ejector', 'Éjecteur venturi'], ['A vacuum generator driven by compressed air: small and fast, but it uses air all the time.', 'Un générateur de vide alimenté par l\'air comprimé : petit et rapide, mais il consomme de l\'air en permanence.']],
      [['Sim-to-real', 'Simulation vers réalité'], ['Moving a policy learned in simulation to the real robot.', 'Faire passer une politique apprise en simulation sur le vrai robot.']]
    ]),
    finish: {
      h: tx('You have reached the frontier of robotics!', 'Vous êtes arrivé à la frontière de la robotique !'),
      p: tx('From here, read research papers and the documentation of the tools (Pinocchio, OSQP, Isaac Lab, OpenCV), and build: a balancing robot, a small Delta, a vision-guided pick and place.', 'À partir d\'ici, lisez des articles de recherche et la documentation des outils (Pinocchio, OSQP, Isaac Lab, OpenCV), et construisez : un robot en équilibre, un petit Delta, une prise-dépose guidée par la vision.'),
      next: ['index.html#road', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}
