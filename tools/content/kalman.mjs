// Course — Data fusion and the Kalman filter (from the Data fusion course of the MARS master, Orléans, parts A and B and its tutorials).
import { tx, P, BOX, TABLE } from '../lib.mjs';
import { partA } from './kf-a.mjs';
import { partB } from './kf-b.mjs';

export const meta = { script: 'learn-kf-widgets.js' };
export function build() {
  const head = {
    title: tx('Data fusion and the Kalman filter', 'Fusion de données et filtre de Kalman'),
    lead: tx('How a robot combines imperfect sensors and a model of its motion to know where it is, and how sure it is. From covariance and confidence ellipses to the Kalman filter, its extended version (EKF), UWB localisation and multimodal fusion, with labs in 3D.',
      'Comment un robot combine des capteurs imparfaits et un modèle de son mouvement pour savoir où il est, et à quel point il en est sûr. De la covariance et des ellipses de confiance au filtre de Kalman, à sa version étendue (EKF), à la localisation UWB et à la fusion multimodale, avec des labos en 3D.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('Every lesson starts with <strong>one sentence</strong> that says the idea without maths, then explains it step by step, then gives the formulas and a lab. Beginners can read the sentences and play with the labs; Master students will find the proofs and the exercises of the tutorials (DC motor, room temperature, pendulum, multilateration, multimodal fusion). Prerequisites: matrices and a little probability (see the links at the end of each lesson).',
        'Chaque leçon commence par <strong>une phrase</strong> qui dit l\'idée sans maths, puis l\'explique pas à pas, puis donne les formules et un labo. Les débutants peuvent lire les phrases et jouer avec les labos ; les étudiants de Master trouveront les démonstrations et les exercices des TD (moteur à courant continu, température d\'une pièce, pendule, multilatération, fusion multimodale). Prérequis : les matrices et un peu de probabilités (voir les liens à la fin de chaque leçon).')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Data fusion', 'Fusion de données'], ['Combining several sources (sensors, models) into one better estimate.', 'Combiner plusieurs sources (capteurs, modèles) en une seule estimation meilleure.']],
      [['Covariance matrix', 'Matrice de covariance'], ['Γ = E((x − x̄)(x − x̄)ᵀ): the variances on the diagonal, the joint variations off it.', 'Γ = E((x − x̄)(x − x̄)ᵀ) : les variances sur la diagonale, les variations conjointes hors diagonale.']],
      [['Confidence ellipse', 'Ellipse de confiance'], ['The region that contains the state with a given probability; axes = eigenvectors of Γ.', 'La région qui contient l\'état avec une probabilité donnée ; axes = vecteurs propres de Γ.']],
      [['Unbiased orthogonal estimator', 'Estimateur sans biais orthogonal'], ['x̂ = x̄ + Γxy Γy⁻¹ (y − ȳ): the best linear estimator.', 'x̂ = x̄ + Γxy Γy⁻¹ (y − ȳ) : le meilleur estimateur linéaire.']],
      [['Innovation', 'Innovation'], ['The surprise of a measurement: ỹ = y − C x̂.', 'La surprise d\'une mesure : ỹ = y − C x̂.']],
      [['Kalman gain K', 'Gain de Kalman K'], ['K = Γ Cᵀ S⁻¹: how much of the innovation is used to correct the estimate.', 'K = Γ Cᵀ S⁻¹ : la part de l\'innovation utilisée pour corriger l\'estimation.']],
      [['Process noise Γα', 'Bruit d\'état Γα'], ['What the model of motion ignores; the main tuning knob.', 'Ce que le modèle du mouvement ignore ; le principal bouton de réglage.']],
      [['Measurement noise Γβ', 'Bruit de mesure Γβ'], ['The variance of the sensor errors.', 'La variance des erreurs du capteur.']],
      [['Asymptotic Kalman filter', 'Filtre de Kalman asymptotique'], ['The filter once its gain and covariance have stopped changing.', 'Le filtre une fois que son gain et sa covariance ne changent plus.']],
      [['Extended Kalman filter (EKF)', 'Filtre de Kalman étendu (EKF)'], ['The Kalman filter applied to a nonlinear model linearised around the estimate.', 'Le filtre de Kalman appliqué à un modèle non linéaire linéarisé autour de l\'estimation.']],
      [['Observability', 'Observabilité'], ['Whether the measurements, through the model, allow every component of the state to be found.', 'Le fait que les mesures, à travers le modèle, permettent de retrouver chaque composante de l\'état.']],
      [['Multilateration', 'Multilatération'], ['Finding a position from distances to known points.', 'Trouver une position à partir de distances à des points connus.']],
      [['TDOA', 'TDOA'], ['Time difference of arrival: a difference of distances to two beacons.', 'Différence de temps d\'arrivée : une différence de distances à deux balises.']],
      [['Covariance intersection', 'Intersection de covariance'], ['A safe way to fuse two estimates whose correlation is unknown.', 'Une façon sûre de fusionner deux estimations dont la corrélation est inconnue.']]
    ]),
    finish: {
      h: tx('You can now build the estimator of a real robot!', 'Vous savez maintenant construire l\'estimateur d\'un vrai robot !'),
      p: tx('Next: robot_localization in ROS 2 (an EKF and a UKF ready to use), the book Probabilistic Robotics (Thrun, Burgard, Fox), and the SLAM lesson of the perception course.', 'Ensuite : robot_localization dans ROS 2 (un EKF et un UKF prêts à l\'emploi), le livre Probabilistic Robotics (Thrun, Burgard, Fox), et la leçon SLAM du cours de perception.'),
      next: ['index.html#road', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}
