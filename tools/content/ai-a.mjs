import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'ai-';

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Sensing the world: the sensors of a robot', 'Percevoir le monde : les capteurs d\'un robot'],
  time: 12,
  goal: ['the main exteroceptive sensors, what each one is good at, and how to choose.', 'les principaux capteurs extéroceptifs, ce que chacun fait de mieux, et comment choisir.'],
  body: [
    TABLE([['Sensor', 'Capteur'], ['What it gives', 'Ce qu\'il donne'], ['Strengths', 'Atouts'], ['Weaknesses', 'Faiblesses']], [
      [['Colour camera', 'Caméra couleur'], ['A 2D image: colour, texture, text, shapes.', 'Une image 2D : couleur, texture, texte, formes.'], ['Rich, cheap, works with deep learning.', 'Riche, bon marché, compatible avec l\'apprentissage profond.'], ['No direct distance; light-dependent; motion blur.', 'Pas de distance directe ; dépend de la lumière ; flou de bougé.']],
      [['Stereo camera', 'Caméra stéréo'], ['Two images give depth by triangulation.', 'Deux images donnent la profondeur par triangulation.'], ['Passive, outdoors, long range.', 'Passive, en extérieur, longue portée.'], ['Needs texture; error grows fast with distance.', 'Demande de la texture ; l\'erreur croît vite avec la distance.']],
      [['RGB-D / time-of-flight camera', 'Caméra RVB-D / temps de vol'], ['An image plus a distance for each pixel.', 'Une image plus une distance pour chaque pixel.'], ['Dense depth, indoors, short range: bin picking.', 'Profondeur dense, en intérieur, courte portée : prise en vrac.'], ['Sunlight, shiny or black surfaces.', 'Lumière du soleil, surfaces brillantes ou noires.']],
      [['2D lidar', 'Lidar 2D'], ['A slice of distances all around (for example 270°, 10-40 Hz).', 'Une tranche de distances tout autour (par exemple 270°, 10-40 Hz).'], ['Accurate, reliable: the standard of indoor mobile robots.', 'Précis, fiable : le standard des robots mobiles d\'intérieur.'], ['Sees only one plane: misses a table edge.', 'Ne voit qu\'un plan : rate un bord de table.']],
      [['3D lidar', 'Lidar 3D'], ['A cloud of 3D points, 360°.', 'Un nuage de points 3D, à 360°.'], ['Long range, day and night: autonomous cars, outdoor robots.', 'Longue portée, jour et nuit : voitures autonomes, robots d\'extérieur.'], ['Cost, rain and fog, glass.', 'Coût, pluie et brouillard, verre.']],
      [['Radar', 'Radar'], ['Distance and speed with radio waves.', 'Distance et vitesse par ondes radio.'], ['Works in fog, rain, dust; measures speed directly.', 'Fonctionne dans le brouillard, la pluie, la poussière ; mesure la vitesse directement.'], ['Coarse resolution.', 'Résolution grossière.']],
      [['Ultrasonic sensor', 'Capteur à ultrasons'], ['A single distance (cone).', 'Une seule distance (cône).'], ['Very cheap; sees glass.', 'Très bon marché ; voit le verre.'], ['Wide beam, slow, soft materials absorb.', 'Faisceau large, lent, les matériaux mous absorbent.']],
      [['Tactile / force sensing skin', 'Peau tactile / capteurs d\'effort'], ['Contact position, pressure, slip.', 'Position de contact, pression, glissement.'], ['The only way to feel a grasp.', 'Le seul moyen de sentir une prise.'], ['Fragile, fewer products, complex wiring.', 'Fragile, peu de produits, câblage complexe.']],
      [['GNSS (GPS) + IMU', 'GNSS (GPS) + centrale inertielle'], ['Global position and attitude outdoors.', 'Position et attitude globales en extérieur.'], ['Absolute reference; RTK gives centimetres.', 'Référence absolue ; le RTK donne le centimètre.'], ['No signal indoors or between tall buildings.', 'Pas de signal en intérieur ou entre de grands immeubles.']],
      [['Event camera, microphone, gas sensor…', 'Caméra événementielle, microphone, capteur de gaz…'], ['Very fast changes; sound; smells.', 'Changements très rapides ; son ; odeurs.'], ['Specialised tasks.', 'Tâches spécialisées.'], ['Need special algorithms.', 'Demandent des algorithmes spéciaux.']]
    ]),
    H4('1.1 Depth from two cameras', '1.1 La profondeur avec deux caméras'),
    P('Two cameras separated by a <strong>baseline</strong> <i>B</i> see the same point with a horizontal shift, the <strong>disparity</strong> <i>d</i> (in pixels). With the focal length <i>f</i> in pixels, the depth is <i>Z</i> = <i>f</i> <i>B</i> / <i>d</i>. The error in depth for a disparity error Δ<i>d</i> is:',
      'Deux caméras séparées par une <strong>base</strong> <i>B</i> voient le même point avec un décalage horizontal, la <strong>disparité</strong> <i>d</i> (en pixels). Avec la focale <i>f</i> en pixels, la profondeur est <i>Z</i> = <i>f</i> <i>B</i> / <i>d</i>. L\'erreur de profondeur pour une erreur de disparité Δ<i>d</i> est :'),
    EQ('Δ<i>Z</i> ≈ <i>Z</i>² Δ<i>d</i> / (<i>f</i> <i>B</i>)'),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('<i>f</i> = 700 px, <i>B</i> = 0.1 m, Δ<i>d</i> = 0.5 px. At <i>Z</i> = 2 m: Δ<i>Z</i> = 4 × 0.5 / (700 × 0.1) ≈ 0.029 m = <strong>3 cm</strong>. At <i>Z</i> = 5 m: 25 × 0.5 / 70 ≈ 0.18 m = <strong>18 cm</strong>. The error grows with the <em>square</em> of the distance: a wider baseline helps, and stereo is for near and medium range.',
        '<i>f</i> = 700 px, <i>B</i> = 0,1 m, Δ<i>d</i> = 0,5 px. À <i>Z</i> = 2 m : Δ<i>Z</i> = 4 × 0,5 / (700 × 0,1) ≈ 0,029 m = <strong>3 cm</strong>. À <i>Z</i> = 5 m : 25 × 0,5 / 70 ≈ 0,18 m = <strong>18 cm</strong>. L\'erreur croît avec le <em>carré</em> de la distance : une base plus large aide, et la stéréo est pour la courte et moyenne portée.')),
    H4('1.2 Choosing sensors', '1.2 Choisir les capteurs'),
    TABLE([['Robot', 'Robot'], ['Typical sensors', 'Capteurs typiques']], [
      [['Robot vacuum', 'Robot aspirateur'], ['Bumper, cliff sensors, 2D lidar or a camera, wheel odometry, IMU.', 'Pare-chocs, capteurs de vide, lidar 2D ou caméra, odométrie des roues, centrale inertielle.']],
      [['Warehouse AMR', 'AMR d\'entrepôt'], ['2D safety lidar, 3D camera, wheel encoders, IMU, QR floor markers.', 'Lidar de sécurité 2D, caméra 3D, codeurs de roues, centrale inertielle, repères QR au sol.']],
      [['Picking arm', 'Bras de prélèvement'], ['RGB-D camera above the bin, force-torque sensor, suction vacuum sensor.', 'Caméra RVB-D au-dessus du bac, capteur d\'effort-couple, capteur de vide de la ventouse.']],
      [['Autonomous car', 'Voiture autonome'], ['Cameras, 3D lidar, radars, ultrasonic, GNSS+IMU, wheel speed.', 'Caméras, lidar 3D, radars, ultrasons, GNSS+centrale inertielle, vitesse des roues.']],
      [['Drone', 'Drone'], ['IMU, barometer, GNSS, downward optical flow, camera, sometimes lidar.', 'Centrale inertielle, baromètre, GNSS, flux optique vers le bas, caméra, parfois lidar.']]
    ]),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['No sensor is perfect: <strong>combine</strong> sensors with different weaknesses (sensor fusion, lesson 3).', 'Aucun capteur n\'est parfait : <strong>combinez</strong> des capteurs avec des faiblesses différentes (fusion de capteurs, leçon 3).'],
        ['Always know the <strong>rate</strong> (Hz), the <strong>latency</strong>, the <strong>range</strong>, the <strong>field of view</strong> and the <strong>noise</strong>.', 'Connaissez toujours la <strong>cadence</strong> (Hz), la <strong>latence</strong>, la <strong>portée</strong>, le <strong>champ de vision</strong> et le <strong>bruit</strong>.'],
        ['Sensors must be <strong>calibrated</strong> (lesson 2) and <strong>time-synchronised</strong>.', 'Les capteurs doivent être <strong>étalonnés</strong> (leçon 2) et <strong>synchronisés dans le temps</strong>.']
      ]))
  ],
  terms: [['lidar', 'lidar'], ['stereo', 'stéréo'], ['RGB-D', 'RVB-D'], ['baseline', 'base'], ['disparity', 'disparité'], ['field of view', 'champ de vision'], ['sensor fusion', 'fusion de capteurs'], ['GNSS', 'GNSS']],
  quiz: [
    ['A stereo pair has f = 800 px, B = 0.12 m. A point has a disparity of 16 px. What is its depth?', 'Une paire stéréo a f = 800 px, B = 0,12 m. Un point a une disparité de 16 px. Quelle est sa profondeur ?', 'Z = f B / d = 800 × 0.12 / 16 = 6 m.', 'Z = f B / d = 800 × 0,12 / 16 = 6 m.'],
    ['Which sensor would you choose for a robot working outdoors in fog?', 'Quel capteur choisiriez-vous pour un robot qui travaille en extérieur dans le brouillard ?', 'Radar: radio waves go through fog, unlike light-based sensors.', 'Le radar : les ondes radio traversent le brouillard, contrairement aux capteurs à lumière.'],
    ['Why use two different kinds of sensors on a car?', 'Pourquoi utiliser deux types différents de capteurs sur une voiture ?', 'Their weaknesses are different (camera in the dark, lidar in rain): fusion keeps working when one fails.', 'Leurs faiblesses sont différentes (caméra dans le noir, lidar sous la pluie) : la fusion continue de fonctionner quand l\'un échoue.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Vision for robots: cameras, calibration, detection, visual servoing', 'La vision pour les robots : caméras, étalonnage, détection, asservissement visuel'],
  time: 14,
  goal: ['how a camera becomes a measuring instrument, how to link it to the robot, and how to detect and grasp objects.', 'comment une caméra devient un instrument de mesure, comment la lier au robot, et comment détecter et saisir des objets.'],
  body: [
    H4('2.1 The pinhole camera', '2.1 La caméra sténopé'),
    P('A point of the world (<i>X</i>, <i>Y</i>, <i>Z</i>) in the camera frame (<i>Z</i> along the viewing direction) lands on the pixel:',
      'Un point du monde (<i>X</i>, <i>Y</i>, <i>Z</i>) dans le repère de la caméra (<i>Z</i> selon la direction de vue) tombe sur le pixel :'),
    EQ('<i>u</i> = <i>f</i><sub>x</sub> <i>X</i> / <i>Z</i> + <i>c</i><sub>x</sub>,        <i>v</i> = <i>f</i><sub>y</sub> <i>Y</i> / <i>Z</i> + <i>c</i><sub>y</sub>'),
    P('<i>f</i><sub>x</sub>, <i>f</i><sub>y</sub> (focal lengths in pixels) and (<i>c</i><sub>x</sub>, <i>c</i><sub>y</sub>) (optical centre) are the <strong>intrinsic parameters</strong>, with the lens distortion. One pixel at distance <i>Z</i> covers <i>Z</i>/<i>f</i> metres. For <i>f</i> = 800 px and <i>Z</i> = 1 m, a point 0.1 m to the right of the axis lands 80 px from the centre, and one pixel is 1.25 mm.',
      '<i>f</i><sub>x</sub>, <i>f</i><sub>y</sub> (focales en pixels) et (<i>c</i><sub>x</sub>, <i>c</i><sub>y</sub>) (centre optique) sont les <strong>paramètres intrinsèques</strong>, avec la distorsion de l\'objectif. Un pixel à la distance <i>Z</i> couvre <i>Z</i>/<i>f</i> mètres. Pour <i>f</i> = 800 px et <i>Z</i> = 1 m, un point à 0,1 m à droite de l\'axe tombe à 80 px du centre, et un pixel vaut 1,25 mm.'),
    H4('2.2 Calibration', '2.2 Étalonnage'),
    UL([
      ['<strong>Intrinsic calibration</strong>: film a checkerboard in many poses; the software finds <i>f</i>, <i>c</i> and the distortion.', '<strong>Étalonnage intrinsèque</strong> : filmer un damier dans de nombreuses poses ; le logiciel trouve <i>f</i>, <i>c</i> et la distorsion.'],
      ['<strong>Hand-eye calibration</strong>: where is the camera with respect to the robot? <em>Eye-in-hand</em> (camera on the flange): find the fixed transform flange → camera. <em>Eye-to-hand</em> (camera fixed in the cell): find base → camera. The robot sees a marker from several poses and the equation <i>A</i> <i>X</i> = <i>X</i> <i>B</i> is solved for the unknown transform <i>X</i>. Without it, a perfect detection gives a missed grasp.', '<strong>Étalonnage œil-main</strong> : où est la caméra par rapport au robot ? <em>Œil dans la main</em> (caméra sur la bride) : trouver la transformation fixe bride → caméra. <em>Œil déporté</em> (caméra fixe dans la cellule) : trouver base → caméra. Le robot voit un repère depuis plusieurs poses et l\'équation <i>A</i> <i>X</i> = <i>X</i> <i>B</i> est résolue pour la transformation inconnue <i>X</i>. Sans cela, une détection parfaite donne une prise ratée.']
    ]),
    P('Both use the homogeneous matrices of the modelling course: the object pose in the base frame = <sup>base</sup><i>T</i><sub>flange</sub> · <sup>flange</sup><i>T</i><sub>camera</sub> · <sup>camera</sup><i>T</i><sub>object</sub>.',
      'Les deux utilisent les matrices homogènes du cours de modélisation : pose de l\'objet dans le repère de base = <sup>base</sup><i>T</i><sub>bride</sub> · <sup>bride</sup><i>T</i><sub>caméra</sub> · <sup>caméra</sup><i>T</i><sub>objet</sub>.'),
    H4('2.3 From pixels to objects', '2.3 Des pixels aux objets'),
    TABLE([['Level', 'Niveau'], ['Technique', 'Technique'], ['Use', 'Usage']], [
      [['Classic 2D', '2D classique'], ['Thresholding, edges, blobs, template matching, markers (QR, ArUco, AprilTag).', 'Seuillage, contours, blobs, correspondance de gabarit, repères (QR, ArUco, AprilTag).'], ['Controlled lighting, known parts, markers for calibration and localisation.', 'Éclairage maîtrisé, pièces connues, repères pour l\'étalonnage et la localisation.']],
      [['Deep learning 2D', 'Apprentissage profond 2D'], ['Detection (YOLO, DETR), segmentation (Mask R-CNN, SAM), classification.', 'Détection (YOLO, DETR), segmentation (Mask R-CNN, SAM), classification.'], ['Varied objects, clutter, people, defects.', 'Objets variés, désordre, personnes, défauts.']],
      [['3D', '3D'], ['Point clouds, plane fitting, clustering, <strong>ICP</strong> (align a model to the data), 6D pose estimation.', 'Nuages de points, ajustement de plans, regroupement, <strong>ICP</strong> (aligner un modèle sur les données), estimation de pose 6D.'], ['Bin picking, depalletising, measuring.', 'Prise en vrac, dépalettisation, mesure.']]
    ]),
    H4('2.4 Visual servoing', '2.4 Asservissement visuel'),
    P('Instead of “see, compute the pose, move blindly”, <strong>visual servoing</strong> moves the robot while looking, so the error of calibration does not matter. The error <i>e</i> is computed in the image and driven to zero with the camera velocity <i>v</i><sub>c</sub>:',
      'Au lieu de « voir, calculer la pose, bouger à l\'aveugle », l\'<strong>asservissement visuel</strong> déplace le robot en regardant, si bien que l\'erreur d\'étalonnage n\'a plus d\'importance. L\'erreur <i>e</i> est calculée dans l\'image et amenée à zéro avec la vitesse de la caméra <i>v</i><sub>c</sub> :'),
    EQ('<i>v</i><sub>c</sub> = −<i>λ</i> <i>L</i><sup>+</sup> <i>e</i>'),
    P('where <i>L</i> is the “interaction matrix” linking the image features to the camera velocity (it is also a Jacobian, and its pseudo-inverse is the same tool as in the course on singularities). Two families: <strong>IBVS</strong> (error measured in the image, robust to calibration, but the camera path can be odd) and <strong>PBVS</strong> (error in the 3D pose, straight camera path, but sensitive to calibration).',
      'où <i>L</i> est la « matrice d\'interaction » qui relie les caractéristiques de l\'image à la vitesse de la caméra (c\'est aussi une jacobienne, et sa pseudo-inverse est le même outil que dans le cours sur les singularités). Deux familles : <strong>IBVS</strong> (erreur mesurée dans l\'image, robuste à l\'étalonnage, mais le chemin de la caméra peut être étrange) et <strong>PBVS</strong> (erreur sur la pose 3D, chemin droit de la caméra, mais sensible à l\'étalonnage).'),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['A camera measures <em>directions</em> well; depth needs a second view or a depth sensor.', 'Une caméra mesure bien les <em>directions</em> ; la profondeur demande une deuxième vue ou un capteur de profondeur.'],
        ['Calibrate (intrinsics + hand-eye) before blaming the algorithm.', 'Étalonnez (intrinsèques + œil-main) avant d\'accuser l\'algorithme.'],
        ['Deep learning finds <em>what</em> and <em>where roughly</em>; geometry (ICP, PnP) gives the precise pose; servoing closes the last centimetres.', 'L\'apprentissage profond trouve <em>quoi</em> et <em>où approximativement</em> ; la géométrie (ICP, PnP) donne la pose précise ; l\'asservissement termine les derniers centimètres.']
      ]))
  ],
  terms: [['pinhole model', 'modèle sténopé'], ['intrinsic parameters', 'paramètres intrinsèques'], ['hand-eye calibration', 'étalonnage œil-main'], ['ArUco / AprilTag', 'ArUco / AprilTag'], ['ICP', 'ICP'], ['object detection', 'détection d\'objets'], ['visual servoing', 'asservissement visuel']],
  quiz: [
    ['f = 600 px. A point at Z = 1.5 m and X = 0.3 m. Where is it in the image relative to the centre?', 'f = 600 px. Un point à Z = 1,5 m et X = 0,3 m. Où est-il dans l\'image par rapport au centre ?', 'u − cx = 600 × 0.3 / 1.5 = 120 px to the right.', 'u − cx = 600 × 0,3 / 1,5 = 120 px à droite.'],
    ['Why does a perfect detection still produce a missed grasp if the hand-eye calibration is wrong?', 'Pourquoi une détection parfaite donne-t-elle quand même une prise ratée si l\'étalonnage œil-main est faux ?', 'The object pose is expressed in the wrong frame: the transform camera → robot is off, so the target is shifted.', 'La pose de l\'objet est exprimée dans le mauvais repère : la transformation caméra → robot est fausse, donc la cible est décalée.'],
    ['What is the advantage of visual servoing over “look then move”?', 'Quel est l\'avantage de l\'asservissement visuel sur « regarder puis bouger » ?', 'It corrects the motion while looking, so errors of calibration and of the robot model are compensated.', 'Il corrige le mouvement en regardant, donc les erreurs d\'étalonnage et du modèle du robot sont compensées.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Estimation: filtering noise with Kalman and friends', 'Estimation : filtrer le bruit avec Kalman et les autres'],
  time: 13,
  goal: ['how to combine a model and noisy sensors to get a better estimate than either of them.', 'comment combiner un modèle et des capteurs bruités pour obtenir une meilleure estimation que chacun.'],
  body: [
    H4('3.1 The idea', '3.1 L\'idée'),
    P('A robot never knows its state exactly. It has a <strong>prediction</strong> (from the model and the commands: “I drove 1 m forward”) which drifts, and a <strong>measurement</strong> (from a sensor: “the lidar says I am at 0.9 m”) which is noisy. A filter combines them, trusting each according to its uncertainty (its <strong>variance</strong>).',
      'Un robot ne connaît jamais exactement son état. Il a une <strong>prédiction</strong> (du modèle et des commandes : « j\'ai avancé de 1 m ») qui dérive, et une <strong>mesure</strong> (d\'un capteur : « le lidar dit que je suis à 0,9 m ») qui est bruitée. Un filtre les combine, en faisant confiance à chacune selon son incertitude (sa <strong>variance</strong>).'),
    H4('3.2 The one-dimensional Kalman filter', '3.2 Le filtre de Kalman à une dimension'),
    OL([
      ['<strong>Predict</strong>: <i>x</i> ← <i>x</i> + <i>u</i> (the motion), and the uncertainty grows: <i>P</i> ← <i>P</i> + <i>Q</i> (process noise <i>Q</i>).', '<strong>Prédire</strong> : <i>x</i> ← <i>x</i> + <i>u</i> (le mouvement), et l\'incertitude croît : <i>P</i> ← <i>P</i> + <i>Q</i> (bruit de processus <i>Q</i>).'],
      ['<strong>Gain</strong>: <i>K</i> = <i>P</i> / (<i>P</i> + <i>R</i>) (measurement noise <i>R</i>).', '<strong>Gain</strong> : <i>K</i> = <i>P</i> / (<i>P</i> + <i>R</i>) (bruit de mesure <i>R</i>).'],
      ['<strong>Update</strong>: <i>x</i> ← <i>x</i> + <i>K</i> (<i>z</i> − <i>x</i>), <i>P</i> ← (1 − <i>K</i>) <i>P</i>.', '<strong>Corriger</strong> : <i>x</i> ← <i>x</i> + <i>K</i> (<i>z</i> − <i>x</i>), <i>P</i> ← (1 − <i>K</i>) <i>P</i>.']
    ]),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('The robot thinks it is at <i>x</i> = 0 with variance <i>P</i> = 1 m². A sensor says <i>z</i> = 1 m with <i>R</i> = 1 m². Then <i>K</i> = 1/(1+1) = 0.5: <i>x</i> = 0 + 0.5 × (1 − 0) = 0.5 m and <i>P</i> = 0.5 m²: the new estimate is the average and is more certain than either. If the sensor were much better (<i>R</i> = 0.1): <i>K</i> = 1/1.1 ≈ 0.91, <i>x</i> ≈ 0.91 m: we trust the sensor. If it were poor (<i>R</i> = 10): <i>K</i> ≈ 0.09, <i>x</i> ≈ 0.09 m: we trust the prediction.',
        'Le robot pense être en <i>x</i> = 0 avec une variance <i>P</i> = 1 m². Un capteur dit <i>z</i> = 1 m avec <i>R</i> = 1 m². Alors <i>K</i> = 1/(1+1) = 0,5 : <i>x</i> = 0 + 0,5 × (1 − 0) = 0,5 m et <i>P</i> = 0,5 m² : la nouvelle estimation est la moyenne et elle est plus certaine que chacune. Si le capteur était bien meilleur (<i>R</i> = 0,1) : <i>K</i> = 1/1,1 ≈ 0,91, <i>x</i> ≈ 0,91 m : on fait confiance au capteur. S\'il était mauvais (<i>R</i> = 10) : <i>K</i> ≈ 0,09, <i>x</i> ≈ 0,09 m : on fait confiance à la prédiction.')),
    WIDGET('kalman'),
    H4('3.3 The family', '3.3 La famille'),
    TABLE([['Filter', 'Filtre'], ['When', 'Quand'], ['Idea', 'Idée']], [
      [['Kalman (KF)', 'Kalman (KF)'], ['Linear model, Gaussian noise.', 'Modèle linéaire, bruit gaussien.'], ['Optimal, very cheap. Mean and covariance.', 'Optimal, très peu coûteux. Moyenne et covariance.']],
      [['Extended / Unscented Kalman (EKF, UKF)', 'Kalman étendu / sans parfum (EKF, UKF)'], ['Mildly non-linear (robot position, attitude).', 'Légèrement non linéaire (position du robot, attitude).'], ['Linearise around the estimate (EKF) or propagate sample points (UKF).', 'Linéariser autour de l\'estimation (EKF) ou propager des points échantillons (UKF).']],
      [['Particle filter', 'Filtre à particules'], ['Strongly non-linear or several hypotheses (“I am in one of two corridors”).', 'Très non linéaire ou plusieurs hypothèses (« je suis dans l\'un de deux couloirs »).'], ['Thousands of weighted guesses; resample the good ones. Basis of Monte-Carlo localisation (AMCL).', 'Des milliers d\'hypothèses pondérées ; rééchantillonner les bonnes. Base de la localisation de Monte-Carlo (AMCL).']],
      [['Complementary filter', 'Filtre complémentaire'], ['Attitude from a gyroscope and an accelerometer.', 'Attitude à partir d\'un gyroscope et d\'un accéléromètre.'], ['θ ← 0.98 (θ + ω Δt) + 0.02 θ<sub>accel</sub>: gyro for the short term, accelerometer to cancel the drift.', 'θ ← 0,98 (θ + ω Δt) + 0,02 θ<sub>accel</sub> : le gyroscope à court terme, l\'accéléromètre pour annuler la dérive.']]
    ]),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['Dead reckoning (odometry, gyro integration) <strong>always drifts</strong>; only an external measurement bounds the error.', 'L\'estime (odométrie, intégration du gyroscope) <strong>dérive toujours</strong> ; seule une mesure externe borne l\'erreur.'],
        ['The variances <i>Q</i> and <i>R</i> are the tuning knobs: they say how much to trust the model or the sensor.', 'Les variances <i>Q</i> et <i>R</i> sont les boutons de réglage : elles disent combien faire confiance au modèle ou au capteur.'],
        ['Sensor fusion = a filter fed by several sensors, for example wheel odometry + IMU + GNSS.', 'Fusion de capteurs = un filtre alimenté par plusieurs capteurs, par exemple odométrie des roues + centrale inertielle + GNSS.']
      ]))
  ],
  terms: [['prediction / update', 'prédiction / correction'], ['variance', 'variance'], ['Kalman gain', 'gain de Kalman'], ['EKF', 'EKF'], ['particle filter', 'filtre à particules'], ['complementary filter', 'filtre complémentaire'], ['dead reckoning', 'estime']],
  quiz: [
    ['x = 2 m with P = 4, measurement z = 3 m with R = 4. What are the new x and P?', 'x = 2 m avec P = 4, mesure z = 3 m avec R = 4. Quels sont les nouveaux x et P ?', 'K = 4/8 = 0.5; x = 2 + 0.5 × 1 = 2.5 m; P = 0.5 × 4 = 2.', 'K = 4/8 = 0,5 ; x = 2 + 0,5 × 1 = 2,5 m ; P = 0,5 × 4 = 2.'],
    ['What happens to the Kalman gain if the sensor is very noisy (R large)?', 'Que devient le gain de Kalman si le capteur est très bruité (R grand) ?', 'K tends to 0: the filter almost ignores the measurement and trusts its prediction.', 'K tend vers 0 : le filtre ignore presque la mesure et fait confiance à sa prédiction.'],
    ['When would you use a particle filter instead of a Kalman filter?', 'Quand utiliseriez-vous un filtre à particules plutôt qu\'un filtre de Kalman ?', 'When the problem is strongly non-linear or has several possible answers, for example global localisation in a symmetric building.', 'Quand le problème est très non linéaire ou a plusieurs réponses possibles, par exemple la localisation globale dans un bâtiment symétrique.']
  ]
})
  ];
}
