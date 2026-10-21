// Course 6 — Perception, planning and AI
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
import { partA } from './ai-a.mjs';
import { partB } from './ai-b.mjs';
import { partC } from './ai-c.mjs';

export const meta = {};
export function build() {
  const head = {
    title: tx('Perception, planning and AI', 'Perception, planification et IA'),
    lead: tx('How a robot understands the world and decides what to do: sensors and vision, filtering noisy measurements, mapping and localisation, finding a path, planning the motion of an arm among obstacles, organising behaviours, and learning from data. Many robots from the previous courses become “autonomous” thanks to the ideas of this course.',
      'Comment un robot comprend le monde et décide quoi faire : capteurs et vision, filtrage de mesures bruitées, cartographie et localisation, recherche de chemin, planification du mouvement d\'un bras parmi des obstacles, organisation des comportements, et apprentissage à partir de données. Beaucoup de robots des cours précédents deviennent « autonomes » grâce aux idées de ce cours.'),
    intro: BOX('idea', ['The autonomy loop: sense, think, act', 'La boucle d\'autonomie : percevoir, penser, agir'],
      P('Autonomy is a loop with four questions. The lessons of this course follow them:', 'L\'autonomie est une boucle à quatre questions. Les leçons de ce cours les suivent :'),
      TABLE([['Question', 'Question'], ['Where do you find the answer?', 'Où trouver la réponse ?'], ['Lessons', 'Leçons']], [
        [['What do I see?', 'Que vois-je ?'], ['Sensors, vision, point clouds', 'Capteurs, vision, nuages de points'], '1, 2'],
        [['Where am I, and what is around me?', 'Où suis-je, et qu\'y a-t-il autour de moi ?'], ['Filters, localisation, mapping (SLAM)', 'Filtres, localisation, cartographie (SLAM)'], '3, 4'],
        [['How do I get there?', 'Comment y aller ?'], ['Path planning, motion planning', 'Planification de chemin, planification de mouvement'], '5, 6'],
        [['What should I do?', 'Que dois-je faire ?'], ['Behaviours, task planning, learning, teams', 'Comportements, planification de tâches, apprentissage, équipes'], '7, 8, 9']
      ]),
      P('The result then goes to the control layer of the previous course.', 'Le résultat va ensuite à la couche de commande du cours précédent.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: glossary(),
    finish: {
      h: tx('You can now give a robot eyes and a brain!', 'Vous savez maintenant donner des yeux et un cerveau à un robot !'),
      p: tx('Last course: the real world, with every robot family, grippers, electronics, software, safety, standards and careers.', 'Dernier cours : le monde réel, avec toutes les familles de robots, les pinces, l\'électronique, le logiciel, la sécurité, les normes et les métiers.'),
      next: ['learn-world.html', tx('Go to robots in the real world →', 'Aller aux robots dans le monde réel →')],
      back: tx('Back to the roadmap', 'Retour au parcours')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}

function glossary() {
  return TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
    [['Lidar', 'Lidar'], ['A sensor that measures distances with laser pulses and returns a set of 3D points.', 'Un capteur qui mesure des distances avec des impulsions laser et renvoie un ensemble de points 3D.']],
    [['Point cloud', 'Nuage de points'], ['A set of 3D points measured by a lidar or a depth camera.', 'Un ensemble de points 3D mesurés par un lidar ou une caméra de profondeur.']],
    [['Intrinsic / extrinsic calibration', 'Étalonnage intrinsèque / extrinsèque'], ['The internal parameters of a camera / its pose with respect to the robot.', 'Les paramètres internes d\'une caméra / sa pose par rapport au robot.']],
    [['Hand-eye calibration', 'Étalonnage œil-main'], ['Finding the fixed transform between a camera and the robot flange or base.', 'Trouver la transformation fixe entre une caméra et la bride ou la base du robot.']],
    [['Visual servoing', 'Asservissement visuel'], ['Controlling the motion directly from image measurements.', 'Commander le mouvement directement à partir de mesures dans l\'image.']],
    [['Kalman filter', 'Filtre de Kalman'], ['An optimal way to combine a prediction and a noisy measurement.', 'Une façon optimale de combiner une prédiction et une mesure bruitée.']],
    [['Particle filter', 'Filtre à particules'], ['Represents a belief by many weighted samples; handles non-linear and multi-modal cases.', 'Représente une croyance par de nombreux échantillons pondérés ; gère les cas non linéaires et multimodaux.']],
    [['Odometry', 'Odométrie'], ['Estimating the motion from wheel (or visual) increments; it drifts.', 'Estimer le mouvement à partir des incréments des roues (ou visuels) ; elle dérive.']],
    [['SLAM', 'SLAM'], ['Simultaneous localisation and mapping.', 'Localisation et cartographie simultanées.']],
    [['Loop closure', 'Fermeture de boucle'], ['Recognising a place already visited, which corrects the drift of the map.', 'Reconnaître un lieu déjà visité, ce qui corrige la dérive de la carte.']],
    [['Occupancy grid', 'Grille d\'occupation'], ['A map made of cells that are free, occupied or unknown.', 'Une carte faite de cellules libres, occupées ou inconnues.']],
    [['A*', 'A*'], ['A graph search that uses a heuristic to find the shortest path faster than Dijkstra.', 'Une recherche dans un graphe qui utilise une heuristique pour trouver le plus court chemin plus vite que Dijkstra.']],
    [['Configuration space', 'Espace des configurations'], ['The space of all joint values; an obstacle becomes a forbidden region in it.', 'L\'espace de toutes les valeurs articulaires ; un obstacle y devient une région interdite.']],
    [['RRT / PRM', 'RRT / PRM'], ['Sampling-based planners that build a tree / a roadmap of random free configurations.', 'Planificateurs par échantillonnage qui construisent un arbre / une feuille de route de configurations libres aléatoires.']],
    [['Behaviour tree', 'Arbre de comportement'], ['A tree of sequences, fallbacks and conditions that organises what a robot does.', 'Un arbre de séquences, de solutions de repli et de conditions qui organise ce que fait un robot.']],
    [['Reinforcement learning', 'Apprentissage par renforcement'], ['Learning a policy by trial and error to maximise a reward.', 'Apprendre une politique par essais et erreurs pour maximiser une récompense.']],
    [['Imitation learning', 'Apprentissage par imitation'], ['Learning a policy from demonstrations by a human.', 'Apprendre une politique à partir de démonstrations d\'un humain.']],
    [['Sim-to-real', 'Simulation vers réel'], ['Transferring what was learned in simulation to the real robot.', 'Transférer ce qui a été appris en simulation vers le vrai robot.']],
    [['Swarm', 'Essaim'], ['Many simple robots whose group behaviour comes from local rules.', 'De nombreux robots simples dont le comportement de groupe vient de règles locales.']]
  ]);
}
