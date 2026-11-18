// Practice blocks for learn-kalman.html ("Data fusion and the Kalman filter").
export const PRACTICE = {
  1: { sum: [['Fusion = several imperfect sensors + a model of motion → one estimate and its uncertainty.', 'Fusion = plusieurs capteurs imparfaits + un modèle du mouvement → une estimation et son incertitude.'],
      ['IMU (fast, drifts), GNSS (absolute, outdoors), encoders (slip), lidar/UWB (distances), cameras (rich, slow).', 'Centrale (rapide, dérive), GNSS (absolu, extérieur), codeurs (glissement), lidar/UWB (distances), caméras (riches, lentes).'],
      ['Methods: filtering (KF, EKF, UKF, particles), optimisation (MAP, factor graphs), learning.', 'Méthodes : filtrage (KF, EKF, UKF, particules), optimisation (MAP, graphes de facteurs), apprentissage.']],
    ex: [
      { lv: 1, q: ['An IMU runs at 400 Hz, a GNSS at 5 Hz. How many IMU samples between two GNSS fixes?', 'Une centrale tourne à 400 Hz, un GNSS à 5 Hz. Combien d\'échantillons de la centrale entre deux positions GNSS ?'], num: { ans: 80, tol: 0.1, unit: '' }, sol: ['400 / 5 = <b>80</b>: the filter predicts 80 times between two corrections.', '400 / 5 = <b>80</b> : le filtre prédit 80 fois entre deux corrections.'] },
      { lv: 1, q: ['Which sensor measures gravity plus the own acceleration?', 'Quel capteur mesure la gravité plus l\'accélération propre ?'], mcq: [['The accelerometer', 'L\'accéléromètre', true], ['The gyroscope', 'Le gyroscope'], ['The magnetometer', 'Le magnétomètre']], sol: ['The <b>accelerometer</b>: that is why it gives the tilt when the robot is still.', 'L\'<b>accéléromètre</b> : c\'est pourquoi il donne l\'inclinaison quand le robot est immobile.'] },
      { lv: 2, q: ['A gyro bias of 0.1 °/s is integrated for 10 minutes. Heading error (°)?', 'Un biais de gyro de 0,1 °/s est intégré pendant 10 minutes. Erreur de cap (°) ?'], num: { ans: 60, tol: 0.5, unit: '°' }, sol: ['0.1 × 600 = <b>60°</b>: why a gyro must be fused with an absolute heading.', '0,1 × 600 = <b>60°</b> : c\'est pourquoi un gyro doit être fusionné avec un cap absolu.'] }
    ] },
  2: { sum: [['Γx = E((x − x̄)(x − x̄)ᵀ): symmetric, positive; Γ = R D Rᵀ (eigenvectors, eigenvalues).', 'Γx = E((x − x̄)(x − x̄)ᵀ) : symétrique, positive ; Γ = R D Rᵀ (vecteurs propres, valeurs propres).'],
      ['Confidence ellipse: half-axes a√λᵢ along the eigenvectors, a = √(−2 ln(1 − η)) in 2D.', 'Ellipse de confiance : demi-axes a√λᵢ le long des vecteurs propres, a = √(−2 ln(1 − η)) en 2D.'],
      ['y = A x + α + b ⇒ ȳ = A x̄ + b, Γy = A Γx Aᵀ + Γα.', 'y = A x + α + b ⇒ ȳ = A x̄ + b, Γy = A Γx Aᵀ + Γα.']],
    ex: [
      { lv: 1, q: ['Value of a for a 95 % ellipse in 2D?', 'Valeur de a pour une ellipse à 95 % en 2D ?'], num: { ans: 2.448, tol: 0.01, unit: '' }, sol: ['a = √(−2 ln 0.05) ≈ <b>2.45</b>.', 'a = √(−2 ln 0,05) ≈ <b>2,45</b>.'] },
      { lv: 2, q: ['Γ = [4 0 ; 0 1], η = 90 % (a = 2.15). Length of the long half-axis?', 'Γ = [4 0 ; 0 1], η = 90 % (a = 2,15). Longueur du grand demi-axe ?'], num: { ans: 4.3, tol: 0.03, unit: '' }, sol: ['a √λ₁ = 2.15 × √4 = <b>4.3</b>.', 'a √λ₁ = 2,15 × √4 = <b>4,3</b>.'] },
      { lv: 3, q: ['y = A x + α with A = [1 1 ; 0 1], Γx = I, Γα = 0.5 I. First diagonal term of Γy?', 'y = A x + α avec A = [1 1 ; 0 1], Γx = I, Γα = 0,5 I. Premier terme diagonal de Γy ?'], num: { ans: 2.5, tol: 0.01, unit: '' }, hint: ['A Aᵀ = [2 1 ; 1 1].', 'A Aᵀ = [2 1 ; 1 1].'], sol: ['A I Aᵀ = [2 1 ; 1 1], plus 0.5 I: <b>2.5</b>.', 'A I Aᵀ = [2 1 ; 1 1], plus 0,5 I : <b>2,5</b>.'] }
    ] },
  3: { sum: [['x̂ = x̄ + K (y − ȳ), K = Γxy Γy⁻¹, Γε = Γx − K Γyx: unique, unbiased, orthogonal, the best linear estimator.', 'x̂ = x̄ + K (y − ȳ), K = Γxy Γy⁻¹, Γε = Γx − K Γyx : unique, sans biais, orthogonal, le meilleur estimateur linéaire.'],
      ['For y = C x + β: ỹ = y − C x̄, Γy = C Γx Cᵀ + Γβ, K = Γx Cᵀ Γy⁻¹, Γε = Γx − K C Γx.', 'Pour y = C x + β : ỹ = y − C x̄, Γy = C Γx Cᵀ + Γβ, K = Γx Cᵀ Γy⁻¹, Γε = Γx − K C Γx.'],
      ['DC motor: x̂ = (1.21, −0.58). Over-determined system: x̂ = (1.311, 1.755).', 'Moteur CC : x̂ = (1,21 ; −0,58). Système surdéterminé : x̂ = (1,311 ; 1,755).']],
    ex: [
      { lv: 1, q: ['Scalar: prior x̄ = 10, Γx = 9, measurement y = 16 of x with Γβ = 9 (C = 1). Estimate x̂?', 'Scalaire : a priori x̄ = 10, Γx = 9, mesure y = 16 de x avec Γβ = 9 (C = 1). Estimation x̂ ?'], num: { ans: 13, tol: 0.01, unit: '' }, sol: ['K = 9 / 18 = 0.5, x̂ = 10 + 0.5 × 6 = <b>13</b>.', 'K = 9 / 18 = 0,5, x̂ = 10 + 0,5 × 6 = <b>13</b>.'] },
      { lv: 2, q: ['Same, with Γβ = 1 (a precise sensor). Estimate x̂?', 'Même chose, avec Γβ = 1 (un capteur précis). Estimation x̂ ?'], num: { ans: 15.4, tol: 0.01, unit: '' }, sol: ['K = 9 / 10 = 0.9, x̂ = 10 + 0.9 × 6 = <b>15.4</b>: closer to the precise measurement.', 'K = 9 / 10 = 0,9, x̂ = 10 + 0,9 × 6 = <b>15,4</b> : plus près de la mesure précise.'] },
      { lv: 3, q: ['In the DC motor example, why is x₂ less precise than x₁?', 'Dans l\'exemple du moteur, pourquoi x₂ est-il moins précis que x₁ ?'], mcq: [['The load torque varies little in the tests, so the data say little about x₂', 'Le couple résistant varie peu dans les essais, les données disent donc peu de chose sur x₂', true], ['x₂ is negative', 'x₂ est négatif'], ['The prior on x₂ is better', 'L\'a priori sur x₂ est meilleur']], sol: ['T<sub>r</sub> ∈ [0, 5] while U ∈ [4, 15]: the columns of C weigh x₁ much more.', 'T<sub>r</sub> ∈ [0, 5] alors que U ∈ [4, 15] : les colonnes de C pèsent bien plus sur x₁.'] }
    ] },
  4: { sum: [['Model: x<sub>k+1</sub> = A x<sub>k</sub> + u + α, y = C x + β, noises white, Gaussian, independent.', 'Modèle : x<sub>k+1</sub> = A x<sub>k</sub> + u + α, y = C x + β, bruits blancs, gaussiens, indépendants.'],
      ['Correction: ỹ, S, K, x̂ ← x̂ + K ỹ, Γ ← (I − K C) Γ. Prediction: x̂ ← A x̂ + u, Γ ← A Γ Aᵀ + Γα.', 'Correction : ỹ, S, K, x̂ ← x̂ + K ỹ, Γ ← (I − K C) Γ. Prédiction : x̂ ← A x̂ + u, Γ ← A Γ Aᵀ + Γα.'],
      ['With A = I, Γα = 0 the filter is the recursive form of the batch estimator.', 'Avec A = I, Γα = 0 le filtre est la forme récursive de l\'estimateur en bloc.']],
    ex: [
      { lv: 1, q: ['Scalar: Γ<sub>k|k</sub> = 1, A = 1, Γα = 0.5. Predicted variance?', 'Scalaire : Γ<sub>k|k</sub> = 1, A = 1, Γα = 0,5. Variance prédite ?'], num: { ans: 1.5, tol: 0.01, unit: '' }, sol: ['1 × 1 × 1 + 0.5 = <b>1.5</b>.', '1 × 1 × 1 + 0,5 = <b>1,5</b>.'] },
      { lv: 2, q: ['Then a measurement with Γβ = 1.5 (C = 1). Gain K?', 'Puis une mesure avec Γβ = 1,5 (C = 1). Gain K ?'], num: { ans: 0.5, tol: 0.01, unit: '' }, sol: ['K = 1.5 / (1.5 + 1.5) = <b>0.5</b>.', 'K = 1,5 / (1,5 + 1,5) = <b>0,5</b>.'] },
      { lv: 2, q: ['A position-speed state x = (p, v), step Δt = 0.1 s. Matrix A?', 'Un état position-vitesse x = (p, v), pas Δt = 0,1 s. Matrice A ?'], mcq: [['[1 0.1 ; 0 1]', '[1 0,1 ; 0 1]', true], ['[1 0 ; 0.1 1]', '[1 0 ; 0,1 1]'], ['[0.1 1 ; 0 1]', '[0,1 1 ; 0 1]']], sol: ['p⁺ = p + Δt v, v⁺ = v: <b>A = [1 Δt ; 0 1]</b>.', 'p⁺ = p + Δt v, v⁺ = v : <b>A = [1 Δt ; 0 1]</b>.'] }
    ] },
  5: { sum: [['Room temperature: Γ∞ = (Γα + √(Γα² + 4ΓαΓβ)) / 2, K∞ = Γ∞ / (Γ∞ + Γβ).', 'Température d\'une pièce : Γ∞ = (Γα + √(Γα² + 4ΓαΓβ)) / 2, K∞ = Γ∞ / (Γ∞ + Γβ).'],
      ['Γα → 0: K → 0 (average); Γβ → 0: K → 1 (copy); Γα = Γβ: K = 0.618.', 'Γα → 0 : K → 0 (moyenne) ; Γβ → 0 : K → 1 (copie) ; Γα = Γβ : K = 0,618.'],
      ['Tune Γβ from the sensor, Γα as the price of the model; check that the innovation is white.', 'Régler Γβ d\'après le capteur, Γα comme prix du modèle ; vérifier que l\'innovation est blanche.']],
    ex: [
      { lv: 2, q: ['Γα = 2, Γβ = 4. Γ∞?', 'Γα = 2, Γβ = 4. Γ∞ ?'], num: { ans: 4, tol: 0.01, unit: '' }, sol: ['(2 + √(4 + 32)) / 2 = (2 + 6) / 2 = <b>4</b>.', '(2 + √(4 + 32)) / 2 = (2 + 6) / 2 = <b>4</b>.'] },
      { lv: 2, q: ['Same case: K∞?', 'Même cas : K∞ ?'], num: { ans: 0.5, tol: 0.005, unit: '' }, sol: ['4 / (4 + 4) = <b>0.5</b>.', '4 / (4 + 4) = <b>0,5</b>.'] },
      { lv: 3, q: ['Γα = Γβ = 1. Precision of the corrected estimate Γ∞Γβ / (Γ∞ + Γβ)?', 'Γα = Γβ = 1. Précision de l\'estimation corrigée Γ∞Γβ / (Γ∞ + Γβ) ?'], num: { ans: 0.618, tol: 0.005, unit: '' }, sol: ['Γ∞ = 1.618: 1.618 / 2.618 = <b>0.618</b> (the golden ratio again).', 'Γ∞ = 1,618 : 1,618 / 2,618 = <b>0,618</b> (encore le nombre d\'or).'] }
    ] },
  6: { sum: [['EKF: predict with f, correct with g; covariances with the Jacobians A = ∂f/∂x, C = ∂g/∂x at the estimate.', 'EKF : prédire avec f, corriger avec g ; covariances avec les jacobiennes A = ∂f/∂x, C = ∂g/∂x à l\'estimation.'],
      ['Pendulum: A = [1 δ ; −δ cos x̂₁ 1], C = [0 1]: the angle is found from the gyro through the dynamics.', 'Pendule : A = [1 δ ; −δ cos x̂₁ 1], C = [0 1] : l\'angle est trouvé grâce au gyro à travers la dynamique.'],
      ['Not optimal any more: bias, optimistic covariance, divergence if the initial error is large.', 'Plus optimal : biais, covariance optimiste, divergence si l\'erreur initiale est grande.']],
    ex: [
      { lv: 2, q: ['Pendulum, δ = 0.01, x̂₁ = 0. Lower-left term of A?', 'Pendule, δ = 0,01, x̂₁ = 0. Terme en bas à gauche de A ?'], num: { ans: -0.01, tol: 0.0005, unit: '' }, sol: ['−δ cos 0 = <b>−0.01</b>.', '−δ cos 0 = <b>−0,01</b>.'] },
      { lv: 2, q: ['g(x) = x² measured near x̂ = 3. Jacobian C?', 'g(x) = x² mesurée près de x̂ = 3. Jacobienne C ?'], num: { ans: 6, tol: 0.01, unit: '' }, sol: ['dg/dx = 2x = <b>6</b>.', 'dg/dx = 2x = <b>6</b>.'] },
      { lv: 3, q: ['What does the EKF use to compute the predicted estimate?', 'Qu\'utilise l\'EKF pour calculer l\'estimation prédite ?'], mcq: [['The true nonlinear f(x̂, u)', 'La vraie fonction non linéaire f(x̂, u)', true], ['A x̂ only', 'A x̂ seulement'], ['The measurement', 'La mesure']], sol: ['x̂ₖ₊₁|ₖ = <b>f(x̂ₖ|ₖ, uₖ)</b>; A is only used for the covariance.', 'x̂ₖ₊₁|ₖ = <b>f(x̂ₖ|ₖ, uₖ)</b> ; A ne sert qu\'à la covariance.'] }
    ] },
  7: { sum: [['Unicycle: x⁺ = x + Δt u cos θ, y⁺ = y + Δt u sin θ, θ⁺ = θ + Δt ω.', 'Unicycle : x⁺ = x + Δt u cos θ, y⁺ = y + Δt u sin θ, θ⁺ = θ + Δt ω.'],
      ['Distance to beacon i: C = ((x̂ − xᵢ)/d̂, (ŷ − yᵢ)/d̂, 0): corrects along the line beacon → robot.', 'Distance à la balise i : C = ((x̂ − xᵢ)/d̂, (ŷ − yᵢ)/d̂, 0) : corrige le long de la droite balise → robot.'],
      ['θ is observable through the motion; 3 non-aligned beacons fix the position.', 'θ est observable à travers le mouvement ; 3 balises non alignées fixent la position.']],
    ex: [
      { lv: 1, q: ['UWB at 20 ms. Measurements per second per beacon?', 'UWB à 20 ms. Mesures par seconde et par balise ?'], num: { ans: 50, tol: 0.1, unit: '' }, sol: ['1 / 0.02 = <b>50</b>.', '1 / 0,02 = <b>50</b>.'] },
      { lv: 2, q: ['Variance 25·10⁻⁴ m². Standard deviation in cm?', 'Variance 25·10⁻⁴ m². Écart-type en cm ?'], num: { ans: 5, tol: 0.05, unit: 'cm' }, sol: ['√(25·10⁻⁴) = 0.05 m = <b>5 cm</b>.', '√(25·10⁻⁴) = 0,05 m = <b>5 cm</b>.'] },
      { lv: 2, q: ['Robot estimated at (6, 8), beacon at (0, 0). First term of the row C?', 'Robot estimé en (6, 8), balise en (0, 0). Premier terme de la ligne C ?'], num: { ans: 0.6, tol: 0.005, unit: '' }, sol: ['d̂ = 10, (6 − 0) / 10 = <b>0.6</b>.', 'd̂ = 10, (6 − 0) / 10 = <b>0,6</b>.'] }
    ] },
  8: { sum: [['Compass sees θ; angulation sees x, y, θ; TDOA sees x, y; odometry predicts.', 'La boussole voit θ ; l\'angulation voit x, y, θ ; la TDOA voit x, y ; l\'odométrie prédit.'],
      ['Different rates: predict at the base rate, correct with each measurement when it arrives.', 'Cadences différentes : prédire à la cadence de base, corriger avec chaque mesure à son arrivée.'],
      ['Distributed fusion: Γ = (Γ₁⁻¹ + Γ₂⁻¹)⁻¹ if independent; otherwise remove the common part or use covariance intersection.', 'Fusion distribuée : Γ = (Γ₁⁻¹ + Γ₂⁻¹)⁻¹ si indépendantes ; sinon retirer la partie commune ou utiliser l\'intersection de covariance.']],
    ex: [
      { lv: 1, q: ['Base step 200 ms, angulation every 600 ms. One angulation every how many steps?', 'Pas de base 200 ms, angulation toutes les 600 ms. Une angulation tous les combien de pas ?'], num: { ans: 3, tol: 0.01, unit: '' }, sol: ['600 / 200 = <b>3</b>.', '600 / 200 = <b>3</b>.'] },
      { lv: 2, q: ['Fuse two independent estimates: x₁ = 10 (variance 1) and x₂ = 13 (variance 2). Fused x̂?', 'Fusionner deux estimations indépendantes : x₁ = 10 (variance 1) et x₂ = 13 (variance 2). x̂ fusionné ?'], num: { ans: 11, tol: 0.01, unit: '' }, hint: ['Weights 1/Γ: 1 and 0.5.', 'Poids 1/Γ : 1 et 0,5.'], sol: ['Γ = (1 + 0.5)⁻¹ = 2/3; x̂ = 2/3 × (10 + 13/2) = <b>11</b>.', 'Γ = (1 + 0,5)⁻¹ = 2/3 ; x̂ = 2/3 × (10 + 13/2) = <b>11</b>.'] },
      { lv: 2, q: ['Only the compass is on. What happens to the position uncertainty?', 'Seule la boussole est allumée. Que devient l\'incertitude de position ?'], mcq: [['It grows without limit: the position is not observed', 'Elle grandit sans limite : la position n\'est pas observée', true], ['It stays constant', 'Elle reste constante'], ['It goes to zero', 'Elle tend vers zéro']], sol: ['The compass corrects θ only; the position integrates the odometry errors.', 'La boussole ne corrige que θ ; la position intègre les erreurs d\'odométrie.'] }
    ] }
};
