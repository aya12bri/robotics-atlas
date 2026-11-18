// Practice blocks for learn-parallel.html ("Workspaces, motion modes and parallel robots").
export const PRACTICE = {
  1: { sum: [['A posture has two pictures: Q in the joint space (q₁ … qₙ) and E in the operational space (position + orientation).', 'Une posture a deux images : Q dans l\'espace articulaire (q₁ … qₙ) et E dans l\'espace opérationnel (position + orientation).'],
      ['DGM: E = f(Q); IGM: Q = g(E). 2-link arm: x = L₁ cos θ₁ + L₂ cos(θ₁ + θ₂), y = L₁ sin θ₁ + L₂ sin(θ₁ + θ₂).', 'MGD : E = f(Q) ; MGI : Q = g(E). Bras à deux segments : x = L₁ cos θ₁ + L₂ cos(θ₁ + θ₂), y = L₁ sin θ₁ + L₂ sin(θ₁ + θ₂).'],
      ['A straight line in one space is in general a curve in the other.', 'Une droite dans un espace est en général une courbe dans l\'autre.']],
    ex: [
      { lv: 1, q: ['L₁ = L₂ = 1 m, θ₁ = 30°, θ₂ = 60°. x (m)?', 'L₁ = L₂ = 1 m, θ₁ = 30°, θ₂ = 60°. x (m) ?'], num: { ans: 0.866, tol: 0.005, unit: 'm' }, sol: ['x = cos 30° + cos 90° = <b>0.866 m</b> (and y = 0.5 + 1 = 1.5 m).', 'x = cos 30° + cos 90° = <b>0,866 m</b> (et y = 0,5 + 1 = 1,5 m).'] },
      { lv: 2, q: ['Same arm, target (1.2, 0.9). cos θ₂?', 'Même bras, cible (1,2 ; 0,9). cos θ₂ ?'], num: { ans: 0.125, tol: 0.005, unit: '' }, sol: ['(1.44 + 0.81 − 2) / 2 = <b>0.125</b>, θ₂ = ±82.8°: two aspects.', '(1,44 + 0,81 − 2) / 2 = <b>0,125</b>, θ₂ = ±82,8° : deux aspects.'] },
      { lv: 1, q: ['How many angles describe the orientation of a solid?', 'Combien d\'angles décrivent l\'orientation d\'un solide ?'], mcq: [['3', '3', true], ['2', '2'], ['6', '6']], sol: ['Three (Euler ZXZ or roll-pitch-yaw); with the 3 coordinates of a point, 6 numbers.', 'Trois (Euler ZXZ ou roulis-tangage-lacet) ; avec les 3 coordonnées d\'un point, 6 nombres.'] }
    ] },
  2: { sum: [['Joint limits make a box in the joint space; its image by the DGM is the workspace.', 'Les limites articulaires forment une boîte dans l\'espace articulaire ; son image par le MGD est l\'espace de travail.'],
      ['Method: transform the borders of the box and the line θ₂ = 0, then take the envelope.', 'Méthode : transformer les bords de la boîte et la ligne θ₂ = 0, puis prendre l\'enveloppe.'],
      ['r_max = L₁ + L₂; r_min = √(L₁² + L₂² + 2 L₁ L₂ cos θ₂,max).', 'r_max = L₁ + L₂ ; r_min = √(L₁² + L₂² + 2 L₁ L₂ cos θ₂,max).']],
    ex: [
      { lv: 1, q: ['SCARA arms 0.4 m and 0.3 m. Largest reach (m)?', 'SCARA bras 0,4 m et 0,3 m. Portée maximale (m) ?'], num: { ans: 0.7, tol: 0.005, unit: 'm' }, sol: ['0.4 + 0.3 = <b>0.7 m</b>.', '0,4 + 0,3 = <b>0,7 m</b>.'] },
      { lv: 2, q: ['Same arms, θ₂ limited to ±150°. Smallest reach r_min (m)?', 'Mêmes bras, θ₂ limité à ±150°. Portée minimale r_min (m) ?'], num: { ans: 0.2053, tol: 0.003, unit: 'm' }, sol: ['√(0.16 + 0.09 + 0.24 cos 150°) = √(0.25 − 0.2078) ≈ <b>0.205 m</b>.', '√(0,16 + 0,09 + 0,24 cos 150°) = √(0,25 − 0,2078) ≈ <b>0,205 m</b>.'] },
      { lv: 1, q: ['The workspace of a gantry with 3 sliders is…', 'L\'espace de travail d\'un portique à 3 glissières est…'], mcq: [['a rectangular box', 'un parallélépipède rectangle', true], ['a crescent', 'un croissant'], ['a thick sphere', 'une sphère épaisse']], sol: ['Each slider moves one coordinate: the joint box is the workspace.', 'Chaque glissière déplace une coordonnée : la boîte articulaire est l\'espace de travail.'] }
    ] },
  3: { sum: [['Linear (MoveL, LIN): straight sides, stop at each corner.', 'Linéaire (MoveL, LIN) : côtés droits, arrêt à chaque sommet.'],
      ['Joint (MoveJ, PTP): the joints move together, the path is curved, fastest for the motors.', 'Articulaire (MoveJ, PTP) : les articulations bougent ensemble, le chemin est courbe, le plus rapide pour les moteurs.'],
      ['Linear at constant speed (zone z10, C_DIS): straight sides, rounded corners, no stop: gluing.', 'Linéaire à vitesse constante (zone z10, C_DIS) : côtés droits, coins arrondis, pas d\'arrêt : encollage.']],
    ex: [
      { lv: 2, q: ['Side 0.5 m, v = 0.25 m/s, a = 0.5 m/s², stop at both ends. Time for the side (s)?', 'Côté 0,5 m, v = 0,25 m/s, a = 0,5 m/s², arrêt aux deux bouts. Temps pour le côté (s) ?'], num: { ans: 2.5, tol: 0.02, unit: 's' }, sol: ['d/v + v/a = 2 + 0.5 = <b>2.5 s</b>.', 'd/v + v/a = 2 + 0,5 = <b>2,5 s</b>.'] },
      { lv: 1, q: ['Arc welding along a straight seam: which mode?', 'Soudage à l\'arc le long d\'un joint droit : quel mode ?'], mcq: [['Linear', 'Linéaire', true], ['Joint', 'Articulaire']], sol: ['The torch must follow the seam exactly: <b>linear</b>.', 'La torche doit suivre le joint exactement : <b>linéaire</b>.'] },
      { lv: 2, q: ['Perimeter 1.2 m drawn at 0.3 m/s without stopping. Approximate time (s)?', 'Périmètre 1,2 m parcouru à 0,3 m/s sans arrêt. Temps approximatif (s) ?'], num: { ans: 4, tol: 0.05, unit: 's' }, sol: ['1.2 / 0.3 = <b>4 s</b>.', '1,2 / 0,3 = <b>4 s</b>.'] }
    ] },
  4: { sum: [['IGM answers: 0 (outside), 1 (border), a finite number (aspects), infinitely many (redundancy).', 'Réponses du MGI : 0 (dehors), 1 (bord), un nombre fini (aspects), une infinité (redondance).'],
      ['6R arm: up to 8 aspects = shoulder × elbow × wrist; the controller stores the configuration (confdata, S/T).', 'Bras 6R : jusqu\'à 8 aspects = épaule × coude × poignet ; la baie mémorise la configuration (confdata, S/T).'],
      ['Degree of redundancy r = n − m; self-motion moves the arm, not the tool.', 'Degré de redondance r = n − m ; le mouvement propre bouge le bras, pas l\'outil.']],
    ex: [
      { lv: 1, q: ['A 7-axis arm used to place a point (x, y, z) only. Degree of redundancy?', 'Un bras 7 axes utilisé seulement pour placer un point (x, y, z). Degré de redondance ?'], num: { ans: 4, tol: 0.01, unit: '' }, sol: ['7 − 3 = <b>4</b>.', '7 − 3 = <b>4</b>.'] },
      { lv: 2, q: ['A 6R arm whose wrist cannot flip (one wrist choice). Maximum number of aspects?', 'Un bras 6R dont le poignet ne peut pas se retourner (un seul choix de poignet). Nombre maximal d\'aspects ?'], num: { ans: 4, tol: 0.01, unit: '' }, sol: ['2 (shoulder) × 2 (elbow) × 1 = <b>4</b>.', '2 (épaule) × 2 (coude) × 1 = <b>4</b>.'] },
      { lv: 1, q: ['Target 2.5 m away, arm of total length 2 m. Number of IGM solutions?', 'Cible à 2,5 m, bras de longueur totale 2 m. Nombre de solutions du MGI ?'], num: { ans: 0, tol: 0.01, unit: '' }, sol: ['Outside the workspace: <b>0</b>.', 'Hors de l\'espace de travail : <b>0</b>.'] }
    ] },
  5: { sum: [['Parallel robot: several chains from the base hold the effector; as many actuators as dof; motors on the base.', 'Robot parallèle : plusieurs chaînes partant de la base tiennent l\'effecteur ; autant d\'actionneurs que de ddl ; moteurs sur la base.'],
      ['Light, stiff, fast and accurate, but small workspace, hard DGM and singularities inside the workspace.', 'Léger, rigide, rapide et précis, mais petit espace de travail, MGD difficile et singularités dans l\'espace de travail.'],
      ['Grübler: m = 3(l − n − 1) + Σdᵢ (plane), 6(l − n − 1) + Σdᵢ (space); wrong with redundant constraints or internal motions.', 'Grübler : m = 3(l − n − 1) + Σdᵢ (plan), 6(l − n − 1) + Σdᵢ (espace) ; fausse avec des contraintes redondantes ou des mouvements internes.']],
    ex: [
      { lv: 1, q: ['Plane, l = 5, n = 5 pivots. Mobility?', 'Plan, l = 5, n = 5 pivots. Mobilité ?'], num: { ans: 2, tol: 0.01, unit: '' }, sol: ['3(5 − 5 − 1) + 5 = <b>2</b>.', '3(5 − 5 − 1) + 5 = <b>2</b>.'] },
      { lv: 2, q: ['3-RPR: l = 8, n = 9 joints of 1 dof. Mobility?', '3-RPR : l = 8, n = 9 liaisons à 1 ddl. Mobilité ?'], num: { ans: 3, tol: 0.01, unit: '' }, sol: ['3(8 − 9 − 1) + 9 = <b>3</b>: x, y and the rotation of the platform.', '3(8 − 9 − 1) + 9 = <b>3</b> : x, y et la rotation de la plateforme.'] },
      { lv: 3, q: ['6-UPS: l = 14, n = 18, Σdᵢ = 6 × (2 + 1 + 3). Mobility?', '6-UPS : l = 14, n = 18, Σdᵢ = 6 × (2 + 1 + 3). Mobilité ?'], num: { ans: 6, tol: 0.01, unit: '' }, sol: ['6(14 − 18 − 1) + 36 = <b>6</b>.', '6(14 − 18 − 1) + 36 = <b>6</b>.'] }
    ] },
  6: { sum: [['IGM θₐ = G(X): each chain alone. DGM X = H(θₐ): Newton X ← X + J(θₐ − G(X)).', 'MGI θₐ = G(X) : chaque chaîne seule. MGD X = H(θₐ) : Newton X ← X + J(θₐ − G(X)).'],
      ['Kinematics: A θ̇ + B Ẋ = 0, J = −B⁻¹A; project each chain to eliminate its passive joints.', 'Cinématique : A θ̇ + B Ẋ = 0, J = −B⁻¹A ; projeter chaque chaîne pour éliminer ses liaisons passives.'],
      ['det A = 0: serial singularity, a direction lost. det B = 0: parallel singularity, uncontrolled motion — avoid!', 'det A = 0 : singularité série, une direction perdue. det B = 0 : singularité parallèle, mouvement incontrôlé — à éviter !']],
    ex: [
      { lv: 2, q: ['Five-bar, motor at (−0.15, 0), arms 0.3 and 0.4 m, target (0, 0.4). Distance motor–target (m)?', 'Cinq barres, moteur en (−0,15 ; 0), bras 0,3 et 0,4 m, cible (0 ; 0,4). Distance moteur–cible (m) ?'], num: { ans: 0.4272, tol: 0.003, unit: 'm' }, sol: ['√(0.15² + 0.4²) ≈ <b>0.427 m</b>.', '√(0,15² + 0,4²) ≈ <b>0,427 m</b>.'] },
      { lv: 3, q: ['Same: the motor angle with the elbow outwards (°)?', 'Même chose : l\'angle moteur coude vers l\'extérieur (°) ?'], num: { ans: 133.4, tol: 0.5, unit: '°' }, sol: ['69.4° + acos(0.439) = 69.4° + 64.0° = <b>133.4°</b>.', '69,4° + acos(0,439) = 69,4° + 64,0° = <b>133,4°</b>.'] },
      { lv: 1, q: ['The two distal arms of a five-bar are aligned. Which singularity?', 'Les deux bras distaux d\'un cinq barres sont alignés. Quelle singularité ?'], mcq: [['Parallel (det B = 0)', 'Parallèle (det B = 0)', true], ['Serial (det A = 0)', 'Série (det A = 0)']], sol: ['B is made of the distal arm directions: aligned arms make it singular.', 'B est faite des directions des bras distaux : alignés, ils la rendent singulière.'] }
    ] }
};
