// Data fusion and the Kalman filter — lessons 1 to 4: why fuse, random vectors, the best linear estimator, the Kalman filter.
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, lesson } from '../lib.mjs';
import { covFig } from './more-figs.mjs';
import * as F from './kf-fig.mjs';
const PRE = 'kf-';
const fig = (o) => FIG(o.vb, o.svg);
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Why fuse data? Sensors for autonomous navigation', 'Pourquoi fusionner des données ? Les capteurs de la navigation autonome'],
  time: 15,
  goal: ['what data fusion is for, the sensors of drones, mobile robots and cars, why no sensor is enough alone, the families of estimation methods, and the practical problems (calibration, biases, rates, faults).', 'à quoi sert la fusion de données, les capteurs des drones, robots mobiles et voitures, pourquoi aucun capteur ne suffit seul, les familles de méthodes d\'estimation, et les problèmes pratiques (étalonnage, biais, cadences, pannes).'],
  body: [
    ONE('Data fusion combines several imperfect sensors and a model of motion to get one estimate of the state of a robot that is better than any sensor alone — and it also says how sure it is.', 'La fusion de données combine plusieurs capteurs imparfaits et un modèle du mouvement pour obtenir une estimation de l\'état d\'un robot meilleure que celle de chaque capteur seul — et elle dit aussi à quel point elle en est sûre.'),
    H4('1.1 The problem: autonomous navigation', '1.1 Le problème : la navigation autonome'),
    P('A drone (UAV), an autonomous mobile robot (AMR) or a self-driving car must know at every instant its <strong>state</strong>: position, speed, orientation (up to 6D). Safety requires <strong>redundancy</strong>: several sensors measure the same thing in different ways, so that one failure does not blind the robot.',
      'Un drone (UAV), un robot mobile autonome (AMR) ou une voiture autonome doit connaître à chaque instant son <strong>état</strong> : position, vitesse, orientation (jusqu\'à 6D). La sécurité exige de la <strong>redondance</strong> : plusieurs capteurs mesurent la même chose de façons différentes, pour qu\'une panne n\'aveugle pas le robot.'),
    fig(F.sensors()),
    TABLE([['Sensor', 'Capteur'], ['What it measures', 'Ce qu\'il mesure'], ['Weak point', 'Point faible']], [
      [['IMU: accelerometers, gyroscopes, magnetometers', 'Centrale inertielle : accéléromètres, gyroscopes, magnétomètres'], ['acceleration (gravity + own acceleration), rotation speed, Earth magnetic field, in the body frame', 'accélération (gravité + accélération propre), vitesse de rotation, champ magnétique terrestre, dans le repère du corps'], ['integration drifts; magnetic disturbances', 'l\'intégration dérive ; perturbations magnétiques']],
      [['GNSS (GPS, Galileo, GLONASS, BeiDou)', 'GNSS (GPS, Galileo, GLONASS, BeiDou)'], ['position from pseudo-ranges (multilateration)', 'position à partir de pseudo-distances (multilatération)'], ['outdoors only, multipath, a few metres without corrections', 'extérieur seulement, multitrajets, quelques mètres sans correction']],
      [['Barometer, Pitot tube', 'Baromètre, tube de Pitot'], ['altitude, air speed', 'altitude, vitesse air'], ['weather, wind', 'météo, vent']],
      [['Lidar (time of flight)', 'Lidar (temps de vol)'], ['distances to landmarks and obstacles', 'distances aux amers et aux obstacles'], ['glass, rain, cost', 'verre, pluie, coût']],
      [['UWB radio (ultra wide band)', 'Radio UWB (ultra large bande)'], ['distance by time of flight (TOF), angle of arrival (AOA), differences of time or phase (TDOA, PDOA)', 'distance par temps de vol (TOF), angle d\'arrivée (AOA), différences de temps ou de phase (TDOA, PDOA)'], ['needs installed anchors, multipath', 'il faut installer des ancres, multitrajets']],
      [['Wheel encoders', 'Codeurs des roues'], ['wheel rotation → odometry', 'rotation des roues → odométrie'], ['slip, drift', 'glissement, dérive']],
      [['Cameras (RGB, depth, event)', 'Caméras (couleur, profondeur, événementielle)'], ['images, depth by IR, time of flight or stereo, visual SLAM', 'images, profondeur par IR, temps de vol ou stéréo, SLAM visuel'], ['light, texture, heavy computing', 'lumière, texture, calcul lourd']]
    ]),
    H4('1.2 Three families of methods', '1.2 Trois familles de méthodes'),
    UL([['<strong>Filtering</strong>: Kalman filter (linear), extended Kalman filter (EKF), complementary filter, unscented Kalman filter (UKF), invariant Kalman filter, particle filter. Recursive and fast: the subject of this course.', '<strong>Filtrage</strong> : filtre de Kalman (linéaire), filtre de Kalman étendu (EKF), filtre complémentaire, filtre de Kalman sans parfum (UKF), filtre de Kalman invariant, filtre particulaire. Récursif et rapide : le sujet de ce cours.'],
      ['<strong>Nonlinear optimisation</strong>: maximum a posteriori over a window of past states (Bayesian networks, factor graphs, iSAM with incremental updates): the standard of visual-inertial and GNSS-inertial-vision fusion.', '<strong>Optimisation non linéaire</strong> : maximum a posteriori sur une fenêtre d\'états passés (réseaux bayésiens, graphes de facteurs, iSAM avec mises à jour incrémentales) : le standard de la fusion vision-inertielle et GNSS-inertielle-vision.'],
      ['<strong>Learning</strong>: model-free, data-driven (deep networks, LSTM), for example to estimate depth or to correct the drift of an IMU.', '<strong>Apprentissage</strong> : sans modèle, piloté par les données (réseaux profonds, LSTM), par exemple pour estimer la profondeur ou corriger la dérive d\'une centrale inertielle.']]),
    H4('1.3 What makes it hard in practice', '1.3 Ce qui rend la chose difficile en pratique'),
    UL([['<strong>Calibration</strong>: biases that change with time and temperature, misalignment between IMU and camera.', '<strong>Étalonnage</strong> : des biais qui changent avec le temps et la température, un désalignement entre centrale et caméra.'],
      ['<strong>Observability</strong>: can the sensors really tell us every component of the state? (a compass alone never gives the position).', '<strong>Observabilité</strong> : les capteurs peuvent-ils vraiment nous donner chaque composante de l\'état ? (une boussole seule ne donne jamais la position).'],
      ['<strong>Asynchronous sampling</strong>: an IMU at 400 Hz, a GNSS at 5 Hz, a camera at 30 Hz with a delay.', '<strong>Échantillonnage asynchrone</strong> : une centrale à 400 Hz, un GNSS à 5 Hz, une caméra à 30 Hz avec un retard.'],
      ['<strong>Resilience</strong>: detect a faulty sensor, switch, keep running (fault tolerance).', '<strong>Résilience</strong> : détecter un capteur défaillant, basculer, continuer à fonctionner (tolérance aux pannes).']]),
    BOX('example', ['Try the sensors first', 'Essayez d\'abord les capteurs'], P('The <a href="sensors.html#imu">sensor test bench</a> shows the drift of a gyro, the noise of an accelerometer and the errors of a GNSS receiver live: the same imperfections this course will fuse away.', 'Le <a href="sensors.html#imu">banc d\'essai des capteurs</a> montre en direct la dérive d\'un gyro, le bruit d\'un accéléromètre et les erreurs d\'un récepteur GNSS : les mêmes défauts que ce cours va effacer par la fusion.'))
  ],
  terms: [['data fusion', 'fusion de données'], ['state estimation', 'estimation d\'état'], ['redundancy', 'redondance'], ['IMU', 'centrale inertielle'], ['UWB: TOF, AOA, TDOA', 'UWB : TOF, AOA, TDOA'], ['observability', 'observabilité'], ['asynchronous sampling', 'échantillonnage asynchrone']],
  quiz: [['Why does a robot need several sensors for the same quantity?', 'Pourquoi un robot a-t-il besoin de plusieurs capteurs pour la même grandeur ?', 'Each one has weak points (drift, noise, blind spots); combined they are better and one failure does not blind the robot (redundancy).', 'Chacun a des points faibles (dérive, bruit, angles morts) ; combinés ils sont meilleurs et une panne n\'aveugle pas le robot (redondance).'],
    ['Name the three families of estimation methods.', 'Citez les trois familles de méthodes d\'estimation.', 'Filtering (Kalman, EKF, UKF, particles…), nonlinear optimisation (MAP, factor graphs), learning.', 'Le filtrage (Kalman, EKF, UKF, particules…), l\'optimisation non linéaire (MAP, graphes de facteurs), l\'apprentissage.'],
    ['What does an accelerometer measure exactly?', 'Que mesure exactement un accéléromètre ?', 'The projection of gravity plus the own acceleration on its axes, in the body frame.', 'La projection de la gravité plus l\'accélération propre sur ses axes, dans le repère du corps.']]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Random vectors, covariance and confidence ellipses', 'Vecteurs aléatoires, covariance et ellipses de confiance'],
  time: 25,
  goal: ['mean and covariance of random vectors, whiteness, the properties of covariance matrices, the confidence ellipse and the χ² law, and how a linear map transforms a covariance: Γy = A Γx Aᵀ + Γα.', 'moyenne et covariance de vecteurs aléatoires, la blancheur, les propriétés des matrices de covariance, l\'ellipse de confiance et la loi du χ², et comment une application linéaire transforme une covariance : Γy = A Γx Aᵀ + Γα.'],
  body: [
    ONE('A covariance matrix says how much each component of an uncertain vector varies, and how the components vary together; it draws an ellipse of uncertainty.', 'Une matrice de covariance dit de combien varie chaque composante d\'un vecteur incertain, et comment les composantes varient ensemble ; elle dessine une ellipse d\'incertitude.'),
    H4('2.1 Mean, variations, covariance', '2.1 Moyenne, variations, covariance'),
    P('For random vectors <b>x</b> ∈ ℝⁿ and <b>y</b> ∈ ℝᵐ, the means are x̄ = E(x), ȳ = E(y) and the variations x̃ = x − x̄, ỹ = y − ȳ. The <strong>covariance matrix</strong> is the mean of the products of the variations:',
      'Pour des vecteurs aléatoires <b>x</b> ∈ ℝⁿ et <b>y</b> ∈ ℝᵐ, les moyennes sont x̄ = E(x), ȳ = E(y) et les variations x̃ = x − x̄, ỹ = y − ȳ. La <strong>matrice de covariance</strong> est la moyenne des produits des variations :'),
    EQ('Γ<sub>xy</sub> = E(x̃ ỹᵀ) = E((x − x̄)(y − ȳ)ᵀ) &emsp;&emsp; Γ<sub>x</sub> = Γ<sub>xx</sub> = E(x̃ x̃ᵀ)'),
    P('On the diagonal of Γ<sub>x</sub>: the variances σᵢ² of each component. Off the diagonal: the covariances, which say if two components tend to move together. A vector is <strong>white</strong> if its components are independent: Γ<sub>x</sub> is then diagonal. In Matlab or Python: subtract the mean of the samples, then average the products (<code>G_xy = mean(xtilde .* ytilde)</code>).',
      'Sur la diagonale de Γ<sub>x</sub> : les variances σᵢ² de chaque composante. Hors diagonale : les covariances, qui disent si deux composantes ont tendance à bouger ensemble. Un vecteur est <strong>blanc</strong> si ses composantes sont indépendantes : Γ<sub>x</sub> est alors diagonale. En Matlab ou Python : retrancher la moyenne des échantillons, puis moyenner les produits (<code>G_xy = mean(xtilde .* ytilde)</code>).'),
    BOX('warn', ['Uncorrelated is not independent', 'Non corrélé n\'est pas indépendant'], P('Points on a ring (x = ρ sin θ, y = ρ cos θ) have a zero covariance, yet x and y are strongly linked: knowing x gives two possible y. The covariance only sees <em>linear</em> links.', 'Des points sur un anneau (x = ρ sin θ, y = ρ cos θ) ont une covariance nulle, et pourtant x et y sont fortement liés : connaître x donne deux y possibles. La covariance ne voit que les liens <em>linéaires</em>.')),
    H4('2.2 Properties of a covariance matrix', '2.2 Propriétés d\'une matrice de covariance'),
    UL([['It is <strong>symmetric and positive</strong>: its eigenvalues are real and ≥ 0.', 'Elle est <strong>symétrique et positive</strong> : ses valeurs propres sont réelles et ≥ 0.'],
      ['<strong>Decomposition</strong>: Γ = R D Rᵀ, R a rotation (the eigenvectors), D diagonal (the eigenvalues).', '<strong>Décomposition</strong> : Γ = R D Rᵀ, R une rotation (les vecteurs propres), D diagonale (les valeurs propres).'],
      ['<strong>Square root</strong>: Γ<sup>½</sup> = R D<sup>½</sup> Rᵀ, itself a covariance matrix.', '<strong>Racine carrée</strong> : Γ<sup>½</sup> = R D<sup>½</sup> Rᵀ, elle-même une matrice de covariance.'],
      ['<strong>Order</strong>: Γ₁ ≤ Γ₂ means Γ₂ − Γ₁ is positive: Γ₁ is “more precise” in every direction.', '<strong>Ordre</strong> : Γ₁ ≤ Γ₂ veut dire que Γ₂ − Γ₁ est positive : Γ₁ est « plus précise » dans toutes les directions.']]),
    H4('2.3 The confidence ellipse', '2.3 L\'ellipse de confiance'),
    fig(F.ell()),
    P('For a Gaussian vector w of mean w̄ and covariance Γ<sub>w</sub>, the set (w − w̄)ᵀ Γ<sub>w</sub>⁻¹ (w − w̄) ≤ a² is an ellipse: the image of the unit disk by w = w̄ + a Γ<sub>w</sub><sup>½</sup> s. The quantity sᵀs follows a <strong>χ² law with 2 degrees of freedom</strong>, so the probability to be inside is η = 1 − e<sup>−a²/2</sup>, hence:',
      'Pour un vecteur gaussien w de moyenne w̄ et de covariance Γ<sub>w</sub>, l\'ensemble (w − w̄)ᵀ Γ<sub>w</sub>⁻¹ (w − w̄) ≤ a² est une ellipse : l\'image du disque unité par w = w̄ + a Γ<sub>w</sub><sup>½</sup> s. La quantité sᵀs suit une <strong>loi du χ² à 2 degrés de liberté</strong>, donc la probabilité d\'être dedans vaut η = 1 − e<sup>−a²/2</sup>, d\'où :'),
    EQ('<i>a</i> = √(−2 ln(1 − η)) &emsp;&emsp; η = 90 % → a = 2.15 &emsp; η = 95 % → a = 2.45 &emsp; η = 99 % → a = 3.03'),
    WIDGET('kf-gauss3d'),
    H4('2.4 How a linear map moves the uncertainty', '2.4 Comment une application linéaire déplace l\'incertitude'),
    P('If y = A x + α + b, with A and b known, x and α independent and α centred, then:', 'Si y = A x + α + b, avec A et b connus, x et α indépendants et α centré, alors :'),
    EQ('ȳ = A x̄ + b &emsp;&emsp; Γ<sub>y</sub> = A Γ<sub>x</sub> Aᵀ + Γ<sub>α</sub>'),
    P('This single line is the heart of the prediction step of the Kalman filter. It also tells how to <strong>generate</strong> any Gaussian vector: take a white unit vector s (x̄ = 0, Γ = I), then y = Γ<sub>y</sub><sup>½</sup> s + ȳ has the mean ȳ and the covariance Γ<sub>y</sub>.',
      'Cette seule ligne est le cœur de l\'étape de prédiction du filtre de Kalman. Elle dit aussi comment <strong>générer</strong> n\'importe quel vecteur gaussien : prendre un vecteur blanc unitaire s (x̄ = 0, Γ = I), alors y = Γ<sub>y</sub><sup>½</sup> s + ȳ a la moyenne ȳ et la covariance Γ<sub>y</sub>.'),
    BOX('example', ['Worked example', 'Exemple corrigé'], P('x has Γ<sub>x</sub> = I (σ = 1 on each axis) and y = A x with A = [2 0 ; 0 1]. Then Γ<sub>y</sub> = A I Aᵀ = [4 0 ; 0 1]: the standard deviation of y₁ is 2. With A a rotation of 45°, Γ<sub>y</sub> = I: a circle stays a circle when it turns.', 'x a Γ<sub>x</sub> = I (σ = 1 sur chaque axe) et y = A x avec A = [2 0 ; 0 1]. Alors Γ<sub>y</sub> = A I Aᵀ = [4 0 ; 0 1] : l\'écart-type de y₁ vaut 2. Avec A une rotation de 45°, Γ<sub>y</sub> = I : un cercle reste un cercle quand il tourne.')),
    covFig(),
  ],
  terms: [['random vector', 'vecteur aléatoire'], ['covariance matrix', 'matrice de covariance'], ['white vector', 'vecteur blanc'], ['eigenvalues, eigenvectors', 'valeurs propres, vecteurs propres'], ['confidence ellipse', 'ellipse de confiance'], ['χ² law', 'loi du χ²'], ['Γy = A Γx Aᵀ + Γα', 'Γy = A Γx Aᵀ + Γα']],
  quiz: [['What does a zero covariance between two components mean, and what does it not mean?', 'Que veut dire une covariance nulle entre deux composantes, et que ne veut-elle pas dire ?', 'No linear link; it does not mean independence (the ring example).', 'Aucun lien linéaire ; cela ne veut pas dire l\'indépendance (l\'exemple de l\'anneau).'],
    ['Which a gives a 99 % ellipse in 2D?', 'Quel a donne une ellipse à 99 % en 2D ?', 'a = √(−2 ln 0.01) ≈ 3.03.', 'a = √(−2 ln 0,01) ≈ 3,03.'],
    ['y = 3x + α with Γx = 2 and Γα = 1. Γy?', 'y = 3x + α avec Γx = 2 et Γα = 1. Γy ?', '3 × 2 × 3 + 1 = 19.', '3 × 2 × 3 + 1 = 19.']]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['The best linear estimator: unbiased and orthogonal', 'Le meilleur estimateur linéaire : sans biais et orthogonal'],
  time: 25,
  goal: ['what an unbiased orthogonal estimator is, why it is unique and the best of all linear estimators, the five formulas for y = C x + β, and two worked examples: a DC motor and an over-determined linear system.', 'ce qu\'est un estimateur sans biais orthogonal, pourquoi il est unique et le meilleur de tous les estimateurs linéaires, les cinq formules pour y = C x + β, et deux exemples corrigés : un moteur à courant continu et un système linéaire surdéterminé.'],
  body: [
    ONE('Knowing y, the best linear guess of x moves the prior guess x̄ in the direction of the surprise y − ȳ, with a gain K = Γxy Γy⁻¹ that weighs how much y really tells about x.', 'Connaissant y, la meilleure estimation linéaire de x déplace l\'estimation a priori x̄ dans le sens de la surprise y − ȳ, avec un gain K = Γxy Γy⁻¹ qui pèse ce que y dit vraiment de x.'),
    H4('3.1 Unbiased and orthogonal', '3.1 Sans biais et orthogonal'),
    P('A <strong>linear estimator</strong> of x from y is x̂ = K y + b. Its error is ε = x̂ − x. It is <strong>unbiased</strong> if E(ε) = 0 (no systematic error), <strong>orthogonal</strong> if E(ε ỹᵀ) = 0 (the error has nothing left in common with the measurement: everything y could tell has been used).',
      'Un <strong>estimateur linéaire</strong> de x à partir de y est x̂ = K y + b. Son erreur est ε = x̂ − x. Il est <strong>sans biais</strong> si E(ε) = 0 (pas d\'erreur systématique), <strong>orthogonal</strong> si E(ε ỹᵀ) = 0 (l\'erreur n\'a plus rien en commun avec la mesure : tout ce que y pouvait dire a été utilisé).'),
    EQ('x̂ = x̄ + K (y − ȳ) &emsp;&emsp; K = Γ<sub>xy</sub> Γ<sub>y</sub>⁻¹ &emsp;&emsp; Γ<sub>ε</sub> = Γ<sub>x</sub> − K Γ<sub>yx</sub>'),
    P('Proof in three lines: unbiased ⇒ b = x̄ − K ȳ, so ε = K ỹ − x̃; orthogonal ⇒ E((K ỹ − x̃) ỹᵀ) = K Γ<sub>y</sub> − Γ<sub>xy</sub> = 0 ⇒ K = Γ<sub>xy</sub> Γ<sub>y</sub>⁻¹. And it is the <strong>best</strong>: any other gain K₀ + Δ adds the positive term Δ Γ<sub>y</sub> Δᵀ to the error covariance.',
      'Démonstration en trois lignes : sans biais ⇒ b = x̄ − K ȳ, donc ε = K ỹ − x̃ ; orthogonal ⇒ E((K ỹ − x̃) ỹᵀ) = K Γ<sub>y</sub> − Γ<sub>xy</sub> = 0 ⇒ K = Γ<sub>xy</sub> Γ<sub>y</sub>⁻¹. Et c\'est le <strong>meilleur</strong> : tout autre gain K₀ + Δ ajoute le terme positif Δ Γ<sub>y</sub> Δᵀ à la covariance de l\'erreur.'),
    H4('3.2 The case y = C x + β', '3.2 Le cas y = C x + β'),
    P('When the measurement is a linear function of x plus a centred noise β uncorrelated with x, Γ<sub>xy</sub> = Γ<sub>x</sub> Cᵀ and Γ<sub>y</sub> = C Γ<sub>x</sub> Cᵀ + Γ<sub>β</sub>. The five formulas to remember:', 'Quand la mesure est une fonction linéaire de x plus un bruit centré β non corrélé à x, Γ<sub>xy</sub> = Γ<sub>x</sub> Cᵀ et Γ<sub>y</sub> = C Γ<sub>x</sub> Cᵀ + Γ<sub>β</sub>. Les cinq formules à retenir :'),
    TABLE([['', ''], ['Formula', 'Formule'], ['Name', 'Nom']], [
      ['(i)', 'x̂ = x̄ + K ỹ', ['estimate', 'estimation']], ['(ii)', 'Γε = Γx − K C Γx', ['error covariance', 'covariance de l\'erreur']], ['(iii)', 'ỹ = y − C x̄', ['innovation', 'innovation']], ['(iv)', 'Γy = C Γx Cᵀ + Γβ', ['innovation covariance', 'covariance de l\'innovation']], ['(v)', 'K = Γx Cᵀ Γy⁻¹', ['Kalman gain', 'gain de Kalman']]
    ]),
    BOX('example', ['Worked example: the DC motor', 'Exemple corrigé : le moteur à courant continu'],
      P('The speed obeys Ω = x₁ U + x₂ T<sub>r</sub> (U voltage, T<sub>r</sub> load torque). Five tests give (U, T<sub>r</sub>, Ω) = (4, 0, 5), (10, 1, 10), (10, 5, 8), (13, 5, 14), (15, 3, 17); measurement variance 9; a priori x ≈ (1, −1) with variance 4. Each row of C is (U, T<sub>r</sub>). The formulas give <strong>x̂ = (1.21, −0.58)</strong> and Γε = [0.061 −0.166 ; −0.166 0.598]: x₁ is known within ±0.25, x₂ only within ±0.77 (the tests vary T<sub>r</sub> little).',
        'La vitesse suit Ω = x₁ U + x₂ T<sub>r</sub> (U tension, T<sub>r</sub> couple résistant). Cinq essais donnent (U, T<sub>r</sub>, Ω) = (4, 0, 5), (10, 1, 10), (10, 5, 8), (13, 5, 14), (15, 3, 17) ; variance de mesure 9 ; a priori x ≈ (1, −1) avec une variance de 4. Chaque ligne de C vaut (U, T<sub>r</sub>). Les formules donnent <strong>x̂ = (1,21 ; −0,58)</strong> et Γε = [0,061 −0,166 ; −0,166 0,598] : x₁ est connu à ±0,25, x₂ seulement à ±0,77 (les essais font peu varier T<sub>r</sub>).')),
    WIDGET('kf-est'),
    BOX('example', ['Worked example: three equations, two unknowns', 'Exemple corrigé : trois équations, deux inconnues'],
      P('2x₁ + 3x₂ = 8, 3x₁ + 2x₂ = 7, x₁ − x₂ = 0, the first one twice as accurate (Γβ = diag(1, 4, 4)), and a vague prior x̄ = 0, Γx = 1000 I. The estimator makes a weighted compromise: <strong>x̂ = (1.311, 1.755)</strong>, Γε = [0.728 −0.515 ; −0.515 0.462]. It is weighted least squares, with an uncertainty.',
        '2x₁ + 3x₂ = 8, 3x₁ + 2x₂ = 7, x₁ − x₂ = 0, la première deux fois plus précise (Γβ = diag(1, 4, 4)), et un a priori vague x̄ = 0, Γx = 1000 I. L\'estimateur fait un compromis pondéré : <strong>x̂ = (1,311 ; 1,755)</strong>, Γε = [0,728 −0,515 ; −0,515 0,462]. Ce sont des moindres carrés pondérés, avec une incertitude.'))
  ],
  terms: [['linear estimator', 'estimateur linéaire'], ['unbiased', 'sans biais'], ['orthogonal', 'orthogonal'], ['innovation', 'innovation'], ['Kalman gain', 'gain de Kalman'], ['error covariance', 'covariance de l\'erreur'], ['weighted least squares', 'moindres carrés pondérés']],
  quiz: [['What does “orthogonal” mean for an estimator?', 'Que veut dire « orthogonal » pour un estimateur ?', 'The error is uncorrelated with the measurement: E(ε ỹᵀ) = 0, all the information of y has been used.', 'L\'erreur est non corrélée à la mesure : E(ε ỹᵀ) = 0, toute l\'information de y a été utilisée.'],
    ['Write the Kalman gain for y = C x + β.', 'Écrivez le gain de Kalman pour y = C x + β.', 'K = Γx Cᵀ (C Γx Cᵀ + Γβ)⁻¹.', 'K = Γx Cᵀ (C Γx Cᵀ + Γβ)⁻¹.'],
    ['Scalar case: Γx = 4, C = 1, Γβ = 4. K and Γε?', 'Cas scalaire : Γx = 4, C = 1, Γβ = 4. K et Γε ?', 'K = 4 / 8 = 0.5, Γε = 4 − 0.5 × 4 = 2: halfway between prior and measurement, half the variance.', 'K = 4 / 8 = 0,5, Γε = 4 − 0,5 × 4 = 2 : à mi-chemin entre a priori et mesure, variance divisée par deux.']]
}),
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['The Kalman filter: predict, then correct', 'Le filtre de Kalman : prédire, puis corriger'],
  time: 25,
  goal: ['the state model, the two steps of the filter and their seven equations, what the filter stores, its code in a few lines, and why it gives the same result as the batch estimator on the DC motor.', 'le modèle d\'état, les deux étapes du filtre et leurs sept équations, ce que le filtre garde en mémoire, son code en quelques lignes, et pourquoi il donne le même résultat que l\'estimateur en bloc sur le moteur à courant continu.'],
  body: [
    ONE('The Kalman filter applies the best linear estimator again and again: the model predicts where the state goes (and the uncertainty grows), then each measurement corrects it (and the uncertainty shrinks).', 'Le filtre de Kalman applique encore et encore le meilleur estimateur linéaire : le modèle prédit où va l\'état (et l\'incertitude grandit), puis chaque mesure le corrige (et l\'incertitude diminue).'),
    H4('4.1 The model', '4.1 Le modèle'),
    EQ('x<sub>k+1</sub> = A<sub>k</sub> x<sub>k</sub> + u<sub>k</sub> + α<sub>k</sub> &emsp;&emsp; y<sub>k</sub> = C<sub>k</sub> x<sub>k</sub> + β<sub>k</sub>'),
    P('α<sub>k</sub> (process noise, covariance Γα: what the model ignores) and β<sub>k</sub> (measurement noise, Γβ) are Gaussian, independent of each other and <strong>white in time</strong> (independent from one instant to the next). x̂<sub>k|k−1</sub> reads “the estimate of x at time k knowing the measurements up to k − 1”.',
      'α<sub>k</sub> (bruit d\'état, covariance Γα : ce que le modèle ignore) et β<sub>k</sub> (bruit de mesure, Γβ) sont gaussiens, indépendants l\'un de l\'autre et <strong>blancs dans le temps</strong> (indépendants d\'un instant à l\'autre). x̂<sub>k|k−1</sub> se lit « l\'estimation de x à l\'instant k connaissant les mesures jusqu\'à k − 1 ».'),
    fig(F.loop()),
    TABLE([['Step', 'Étape'], ['Equation', 'Équation'], ['Name', 'Nom']], [
      [['Correction', 'Correction'], 'ỹₖ = yₖ − Cₖ x̂ₖ|ₖ₋₁', ['innovation', 'innovation']], ['', 'Sₖ = Cₖ Γₖ|ₖ₋₁ Cₖᵀ + Γβ', ['innovation covariance', 'covariance de l\'innovation']], ['', 'Kₖ = Γₖ|ₖ₋₁ Cₖᵀ Sₖ⁻¹', ['Kalman gain', 'gain de Kalman']],
      ['', 'x̂ₖ|ₖ = x̂ₖ|ₖ₋₁ + Kₖ ỹₖ', ['corrected estimate', 'estimation corrigée']], ['', 'Γₖ|ₖ = (I − Kₖ Cₖ) Γₖ|ₖ₋₁', ['corrected covariance', 'covariance corrigée']],
      [['Prediction', 'Prédiction'], 'x̂ₖ₊₁|ₖ = Aₖ x̂ₖ|ₖ + uₖ', ['predicted estimate', 'estimation prédite']], ['', 'Γₖ₊₁|ₖ = Aₖ Γₖ|ₖ Aₖᵀ + Γα', ['predicted covariance', 'covariance prédite']]
    ]),
    WIDGET('kf-bells'),
    H4('4.2 The code', '4.2 Le code'),
    P('The filter only stores x̂<sub>k+1|k</sub> and Γ<sub>k+1|k</sub>; everything else is computed on the fly. The same function in Matlab (as in the course) and in Python:', 'Le filtre ne garde en mémoire que x̂<sub>k+1|k</sub> et Γ<sub>k+1|k</sub> ; tout le reste est calculé au passage. La même fonction en Matlab (comme dans le cours) et en Python :'),
    `<pre class="code"><code>function [x1,G1]=kalman(x0,G0,u,y,G_alpha,G_beta,A,C)
  S=C*G0*C'+G_beta;  K=G0*C'*inv(S);  y_tilde=y-C*x0;
  xup=x0+K*y_tilde;  Gup=G0-K*C*G0;          % correction
  x1=A*xup+u;        G1=A*Gup*A'+G_alpha;    % prediction
end</code></pre>`,
    `<pre class="code"><code>import numpy as np
def kalman(x0, G0, u, y, Ga, Gb, A, C):
    S = C @ G0 @ C.T + Gb
    K = G0 @ C.T @ np.linalg.inv(S)
    xup = x0 + K @ (y - C @ x0)
    Gup = (np.eye(len(x0)) - K @ C) @ G0
    return A @ xup + u, A @ Gup @ A.T + Ga</code></pre>`,
    BOX('example', ['The DC motor, one measurement at a time', 'Le moteur, une mesure à la fois'],
      P('Take A = I, u = 0, Γα = 0 (the parameters do not change) and C<sub>k</sub> = (U(k), T<sub>r</sub>(k)): feeding the five tests one by one gives exactly the result of the batch estimator of lesson 3. With Γα = 0 and A = I, the Kalman filter <strong>is</strong> the recursive form of the linear estimator. Use the lab of lesson 3, button “Add the next measurement”, to see it.',
        'Prenez A = I, u = 0, Γα = 0 (les paramètres ne changent pas) et C<sub>k</sub> = (U(k), T<sub>r</sub>(k)) : donner les cinq essais un à un donne exactement le résultat de l\'estimateur en bloc de la leçon 3. Avec Γα = 0 et A = I, le filtre de Kalman <strong>est</strong> la forme récursive de l\'estimateur linéaire. Utilisez le labo de la leçon 3, bouton « Ajouter la mesure suivante », pour le voir.')),
    BOX('warn', ['A numerical safeguard', 'Une précaution numérique'], P('With rounding errors Γ<sub>k|k</sub> can lose its positivity. A more robust form (Joseph form) is Γ<sub>k|k</sub> = (I − K C) Γ (I − K C)ᵀ + K Γβ Kᵀ, always symmetric positive.', 'Avec les erreurs d\'arrondi, Γ<sub>k|k</sub> peut perdre sa positivité. Une forme plus robuste (forme de Joseph) est Γ<sub>k|k</sub> = (I − K C) Γ (I − K C)ᵀ + K Γβ Kᵀ, toujours symétrique positive.'))
  ],
  terms: [['state model', 'modèle d\'état'], ['process noise Γα', 'bruit d\'état Γα'], ['measurement noise Γβ', 'bruit de mesure Γβ'], ['prediction, correction', 'prédiction, correction'], ['innovation covariance', 'covariance de l\'innovation'], ['white in time', 'blanc dans le temps'], ['Joseph form', 'forme de Joseph']],
  quiz: [['What happens to the uncertainty in the prediction step, and why?', 'Que devient l\'incertitude à l\'étape de prédiction, et pourquoi ?', 'It grows: Γ = A Γ Aᵀ + Γα adds what the model ignores.', 'Elle grandit : Γ = A Γ Aᵀ + Γα ajoute ce que le modèle ignore.'],
    ['What does the filter keep from one step to the next?', 'Que garde le filtre d\'une étape à l\'autre ?', 'Only the predicted estimate x̂ₖ₊₁|ₖ and its covariance Γₖ₊₁|ₖ.', 'Seulement l\'estimation prédite x̂ₖ₊₁|ₖ et sa covariance Γₖ₊₁|ₖ.'],
    ['Scalar filter: predicted variance 3, measurement variance 1. Gain and corrected variance?', 'Filtre scalaire : variance prédite 3, variance de mesure 1. Gain et variance corrigée ?', 'K = 3 / 4 = 0.75; Γ = (1 − 0.75) × 3 = 0.75.', 'K = 3 / 4 = 0,75 ; Γ = (1 − 0,75) × 3 = 0,75.']]
})
  ];
}
