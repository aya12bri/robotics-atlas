// Data fusion and the Kalman filter — lessons 5 to 8: asymptotic filter and tuning, EKF, UWB multilateration, multimodal fusion.
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, lesson } from '../lib.mjs';
import * as F from './kf-fig.mjs';
const PRE = 'kf-';
const fig = (o) => FIG(o.vb, o.svg);
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['The asymptotic filter: tuning Γα and Γβ', 'Le filtre asymptotique : régler Γα et Γβ'],
  time: 20,
  goal: ['the steady state of the Kalman filter on the temperature of a room, the formulas of Γ∞ and K∞, what happens when Γα or Γβ goes to zero, how to tune a filter, the whiteness of the innovation and the 99 % confidence ellipsoid.', 'le régime permanent du filtre de Kalman sur la température d\'une pièce, les formules de Γ∞ et K∞, ce qui se passe quand Γα ou Γβ tend vers zéro, comment régler un filtre, la blancheur de l\'innovation et l\'ellipsoïde de confiance à 99 %.'],
  body: [
    ONE('After a while the gain of a Kalman filter stops changing: it settles on a value that only depends on the ratio between how fast the state moves (Γα) and how noisy the sensor is (Γβ).', 'Au bout d\'un moment, le gain d\'un filtre de Kalman ne change plus : il se pose sur une valeur qui ne dépend que du rapport entre la vitesse à laquelle l\'état bouge (Γα) et le bruit du capteur (Γβ).'),
    H4('5.1 The temperature of a room', '5.1 La température d\'une pièce'),
    EQ('x<sub>k+1</sub> = x<sub>k</sub> + α<sub>k</sub> &emsp;&emsp; y<sub>k</sub> = x<sub>k</sub> + β<sub>k</sub>'),
    P('Here A = C = 1. One step of the filter (correction then prediction) gives the recursion of the predicted variance:', 'Ici A = C = 1. Un pas du filtre (correction puis prédiction) donne la récurrence de la variance prédite :'),
    EQ('x̂<sub>k+1|k</sub> = x̂<sub>k|k−1</sub> + K<sub>k</sub> (y<sub>k</sub> − x̂<sub>k|k−1</sub>) &emsp; K<sub>k</sub> = Γ<sub>k|k−1</sub> / (Γ<sub>k|k−1</sub> + Γβ) &emsp; Γ<sub>k+1|k</sub> = Γ<sub>k|k−1</sub> Γβ / (Γ<sub>k|k−1</sub> + Γβ) + Γα'),
    P('When k is large, Γ<sub>k+1|k</sub> = Γ<sub>k|k−1</sub> = Γ∞. Solving Γ∞ = Γ∞Γβ / (Γ∞ + Γβ) + Γα gives Γ∞² − Γα Γ∞ − Γα Γβ = 0, so:', 'Quand k est grand, Γ<sub>k+1|k</sub> = Γ<sub>k|k−1</sub> = Γ∞. Résoudre Γ∞ = Γ∞Γβ / (Γ∞ + Γβ) + Γα donne Γ∞² − Γα Γ∞ − Γα Γβ = 0, donc :'),
    EQ('Γ∞ = (Γα + √(Γα² + 4 Γα Γβ)) / 2 &emsp;&emsp; K∞ = Γ∞ / (Γ∞ + Γβ) &emsp;&emsp; precision: Γ∞ Γβ / (Γ∞ + Γβ)'),
    TABLE([['Case', 'Cas'], ['Result', 'Résultat'], ['Meaning', 'Sens']], [
      ['Γα → 0', ['Γ∞ → 0, K∞ → 0', 'Γ∞ → 0, K∞ → 0'], ['the temperature does not move: the filter ends up ignoring new measurements and averages all of them', 'la température ne bouge pas : le filtre finit par ignorer les nouvelles mesures et les moyenne toutes']],
      ['Γβ → 0', ['Γ∞ → Γα, K∞ → 1', 'Γ∞ → Γα, K∞ → 1'], ['the thermometer is perfect: the filter copies the measurement', 'le thermomètre est parfait : le filtre recopie la mesure']],
      ['Γα = Γβ', ['Γ∞ = 1.618 Γα, K∞ = 0.618', 'Γ∞ = 1,618 Γα, K∞ = 0,618'], ['a balanced compromise… and the golden ratio!', 'un compromis équilibré… et le nombre d\'or !']]
    ]),
    WIDGET('kf-1d'),
    H4('5.2 Tuning a filter in practice', '5.2 Régler un filtre en pratique'),
    UL([['<strong>Γβ</strong> comes from the datasheet or from a test: leave the sensor still and compute the variance of its readings.', '<strong>Γβ</strong> vient de la fiche technique ou d\'un essai : laisser le capteur immobile et calculer la variance de ses lectures.'],
      ['<strong>Γα</strong> is the honest price of the simplifications of the model; it is the real tuning knob: too small → the filter is slow and can diverge if the model is wrong; too large → it follows the noise.', '<strong>Γα</strong> est le prix honnête des simplifications du modèle ; c\'est le vrai bouton de réglage : trop petit → le filtre est lent et peut diverger si le modèle est faux ; trop grand → il suit le bruit.'],
      ['<strong>Check</strong>: the innovation ỹ<sub>k</sub> of a well-tuned filter is <strong>white</strong> (no correlation in time) with covariance S<sub>k</sub>; the normalised innovation ỹᵀ S⁻¹ ỹ should average the size of y.', '<strong>Vérifier</strong> : l\'innovation ỹ<sub>k</sub> d\'un filtre bien réglé est <strong>blanche</strong> (pas de corrélation dans le temps) de covariance S<sub>k</sub> ; l\'innovation normalisée ỹᵀ S⁻¹ ỹ doit valoir en moyenne la dimension de y.']]),
    BOX('example', ['A 99 % confidence ellipsoid', 'Un ellipsoïde de confiance à 99 %'], P('At time k the state is inside {x : (x − x̂<sub>k|k</sub>)ᵀ Γ<sub>k|k</sub>⁻¹ (x − x̂<sub>k|k</sub>) ≤ a²} with a² the 99 % quantile of the χ² law with n degrees of freedom: 9.21 for n = 2, 11.34 for n = 3. In 2D, a = √(−2 ln 0.01) = 3.03.', 'À l\'instant k l\'état est dans {x : (x − x̂<sub>k|k</sub>)ᵀ Γ<sub>k|k</sub>⁻¹ (x − x̂<sub>k|k</sub>) ≤ a²} avec a² le quantile à 99 % de la loi du χ² à n degrés de liberté : 9,21 pour n = 2, 11,34 pour n = 3. En 2D, a = √(−2 ln 0,01) = 3,03.'))
  ],
  terms: [['asymptotic (steady-state) Kalman filter', 'filtre de Kalman asymptotique (régime permanent)'], ['Riccati equation', 'équation de Riccati'], ['filter tuning', 'réglage du filtre'], ['innovation whiteness', 'blancheur de l\'innovation'], ['confidence ellipsoid', 'ellipsoïde de confiance']],
  quiz: [['Γα = 1, Γβ = 2. Γ∞ and K∞?', 'Γα = 1, Γβ = 2. Γ∞ et K∞ ?', 'Γ∞ = (1 + √(1 + 8)) / 2 = 2, K∞ = 2 / 4 = 0.5.', 'Γ∞ = (1 + √(1 + 8)) / 2 = 2, K∞ = 2 / 4 = 0,5.'],
    ['Your filter follows every jump of a noisy sensor. Which knob, and which way?', 'Votre filtre suit chaque saut d\'un capteur bruité. Quel bouton, et dans quel sens ?', 'Lower Γα (or raise Γβ): the gain drops, the filter trusts the model more.', 'Baisser Γα (ou augmenter Γβ) : le gain baisse, le filtre fait plus confiance au modèle.'],
    ['How can you check that a filter is well tuned?', 'Comment vérifier qu\'un filtre est bien réglé ?', 'Its innovation must be white with the covariance S predicted by the filter.', 'Son innovation doit être blanche avec la covariance S prévue par le filtre.']]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['The extended Kalman filter (EKF)', 'Le filtre de Kalman étendu (EKF)'],
  time: 25,
  goal: ['how to apply Kalman to a nonlinear model by linearising it around the estimate, the equations of the EKF, the example of the simple pendulum seen by a gyrometer, and why the EKF is no longer optimal.', 'comment appliquer Kalman à un modèle non linéaire en le linéarisant autour de l\'estimation, les équations de l\'EKF, l\'exemple du pendule simple vu par un gyromètre, et pourquoi l\'EKF n\'est plus optimal.'],
  body: [
    ONE('Real models are curved; the EKF replaces the curve by its tangent at the current estimate and runs the ordinary Kalman filter on it, step after step.', 'Les vrais modèles sont courbes ; l\'EKF remplace la courbe par sa tangente à l\'estimation actuelle et lui applique le filtre de Kalman ordinaire, pas après pas.'),
    H4('6.1 Linearise around the estimate', '6.1 Linéariser autour de l\'estimation'),
    EQ('x<sub>k+1</sub> = f(x<sub>k</sub>, u<sub>k</sub>) + α<sub>k</sub> &emsp;&emsp; y<sub>k</sub> = g(x<sub>k</sub>) + β<sub>k</sub>'),
    fig(F.lin()),
    P('Near x̂, f(x) ≈ f(x̂) + A (x − x̂) and g(x) ≈ g(x̂) + C (x − x̂), with the <strong>Jacobians</strong> A<sub>k</sub> = ∂f/∂x at (x̂<sub>k|k</sub>, u<sub>k</sub>) and C<sub>k</sub> = ∂g/∂x at x̂<sub>k|k−1</sub>. The linear filter applied to this tangent model simplifies into:', 'Près de x̂, f(x) ≈ f(x̂) + A (x − x̂) et g(x) ≈ g(x̂) + C (x − x̂), avec les <strong>jacobiennes</strong> A<sub>k</sub> = ∂f/∂x en (x̂<sub>k|k</sub>, u<sub>k</sub>) et C<sub>k</sub> = ∂g/∂x en x̂<sub>k|k−1</sub>. Le filtre linéaire appliqué à ce modèle tangent se simplifie en :'),
    TABLE([['', ''], ['EKF', 'EKF']], [
      [['Prediction', 'Prédiction'], 'x̂ₖ₊₁|ₖ = f(x̂ₖ|ₖ, uₖ) ,  Γₖ₊₁|ₖ = Aₖ Γₖ|ₖ Aₖᵀ + Γα'],
      [['Innovation', 'Innovation'], 'z̃ₖ = yₖ − g(x̂ₖ|ₖ₋₁) ,  Sₖ = Cₖ Γₖ|ₖ₋₁ Cₖᵀ + Γβ'],
      [['Correction', 'Correction'], 'Kₖ = Γₖ|ₖ₋₁ Cₖᵀ Sₖ⁻¹ ,  x̂ₖ|ₖ = x̂ₖ|ₖ₋₁ + Kₖ z̃ₖ ,  Γₖ|ₖ = (I − Kₖ Cₖ) Γₖ|ₖ₋₁']
    ]),
    P('Notice: the <em>estimate</em> uses the true nonlinear functions f and g; only the <em>covariances</em> use the Jacobians.', 'À noter : l\'<em>estimation</em> utilise les vraies fonctions non linéaires f et g ; seules les <em>covariances</em> utilisent les jacobiennes.'),
    H4('6.2 Example: the simple pendulum', '6.2 Exemple : le pendule simple'),
    P('In normalised form, x₁ is the angle and x₂ the rotation speed: ẋ₁ = x₂, ẋ₂ = −sin x₁ + u (u known). A gyrometer measures x₂ every 0.01 s with a noise σ = 0.1 rad/s. Euler’s method (δ = 0.01 s) gives the discrete model and its Jacobian:', 'Sous forme normalisée, x₁ est l\'angle et x₂ la vitesse de rotation : ẋ₁ = x₂, ẋ₂ = −sin x₁ + u (u connu). Un gyromètre mesure x₂ toutes les 0,01 s avec un bruit σ = 0,1 rad/s. La méthode d\'Euler (δ = 0,01 s) donne le modèle discret et sa jacobienne :'),
    EQ('x₁⁺ = x₁ + δ x₂ &emsp; x₂⁺ = x₂ + δ(−sin x₁ + u) &emsp;&emsp; A = [1 δ ; −δ cos x̂₁ 1] &emsp; C = [0 1] &emsp; Γβ = 0.01'),
    WIDGET('kf-pend3d'),
    P('The gyrometer never measures the angle, yet the filter finds it: the dynamics link them (the acceleration −sin x₁ depends on the angle). We say the angle is <strong>observable</strong> through the model.', 'Le gyromètre ne mesure jamais l\'angle, et pourtant le filtre le trouve : la dynamique les relie (l\'accélération −sin x₁ dépend de l\'angle). On dit que l\'angle est <strong>observable</strong> à travers le modèle.'),
    BOX('warn', ['Is the EKF still the best unbiased orthogonal estimator?', 'L\'EKF est-il encore le meilleur estimateur sans biais orthogonal ?'], P('No. The linearisation is an approximation: the estimate can be biased, the covariance can be too optimistic, and if the initial error is large (outside the zone where the tangent is a good copy), the filter can diverge. Remedies: a good initialisation, a larger Γα, the unscented filter (UKF) or a particle filter for strong nonlinearities.', 'Non. La linéarisation est une approximation : l\'estimation peut être biaisée, la covariance trop optimiste, et si l\'erreur initiale est grande (hors de la zone où la tangente copie bien), le filtre peut diverger. Remèdes : une bonne initialisation, un Γα plus grand, le filtre sans parfum (UKF) ou un filtre particulaire pour les fortes non-linéarités.'))
  ],
  terms: [['extended Kalman filter (EKF)', 'filtre de Kalman étendu (EKF)'], ['linearisation', 'linéarisation'], ['Jacobian', 'jacobienne'], ['Euler discretisation', 'discrétisation d\'Euler'], ['observable state', 'état observable'], ['divergence', 'divergence'], ['UKF, particle filter', 'UKF, filtre particulaire']],
  quiz: [['In the EKF, where are the Jacobians used, and where the true functions?', 'Dans l\'EKF, où sert la jacobienne, et où servent les vraies fonctions ?', 'True f and g for the estimate and the innovation; Jacobians A and C for the covariances and the gain.', 'Les vraies f et g pour l\'estimation et l\'innovation ; les jacobiennes A et C pour les covariances et le gain.'],
    ['Pendulum: derivative of x₂ + δ(−sin x₁ + u) with respect to x₁?', 'Pendule : dérivée de x₂ + δ(−sin x₁ + u) par rapport à x₁ ?', '−δ cos x₁.', '−δ cos x₁.'],
    ['Why can an EKF diverge?', 'Pourquoi un EKF peut-il diverger ?', 'If the error is too large, the tangent is a bad copy of the model: the gain and covariance are wrong and the error grows.', 'Si l\'erreur est trop grande, la tangente copie mal le modèle : le gain et la covariance sont faux et l\'erreur grandit.']]
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Localising a robot by multilateration (UWB)', 'Localiser un robot par multilatération (UWB)'],
  time: 25,
  goal: ['the kinematic model of a mobile robot in discrete time, the distance measurement to a beacon and its Jacobian, the data needed to run the EKF, and why the heading becomes observable when the robot moves.', 'le modèle cinématique d\'un robot mobile en temps discret, la mesure de distance à une balise et sa jacobienne, les données nécessaires pour faire tourner l\'EKF, et pourquoi le cap devient observable quand le robot bouge.'],
  body: [
    ONE('Beacons at known places measure their distance to the robot; the EKF mixes these distances with the wheel speeds to know the position and the heading at every instant.', 'Des balises à des endroits connus mesurent leur distance au robot ; l\'EKF mélange ces distances avec les vitesses des roues pour connaître la position et le cap à chaque instant.'),
    fig(F.multi()),
    H4('7.1 The model', '7.1 Le modèle'),
    P('The robot (x, y, θ) moves with a known translation speed u and rotation speed ω: ẋ = u cos θ, ẏ = u sin θ, θ̇ = ω. With Euler’s method and the step Δt:', 'Le robot (x, y, θ) se déplace avec une vitesse de translation u et une vitesse de rotation ω connues : ẋ = u cos θ, ẏ = u sin θ, θ̇ = ω. Avec la méthode d\'Euler et le pas Δt :'),
    EQ('x<sub>k+1</sub> = x<sub>k</sub> + Δt u<sub>k</sub> cos θ<sub>k</sub> &emsp; y<sub>k+1</sub> = y<sub>k</sub> + Δt u<sub>k</sub> sin θ<sub>k</sub> &emsp; θ<sub>k+1</sub> = θ<sub>k</sub> + Δt ω<sub>k</sub>'),
    EQ('A<sub>k</sub> = [1 0 −Δt u sin θ̂ ; 0 1 Δt u cos θ̂ ; 0 0 1]'),
    H4('7.2 The measurement', '7.2 La mesure'),
    P('A UWB anchor B<sub>i</sub> = (x<sub>bi</sub>, y<sub>bi</sub>) measures the time of flight, hence the distance, every 20 ms with a variance of 25·10⁻⁴ m² (σ = 5 cm):', 'Une ancre UWB B<sub>i</sub> = (x<sub>bi</sub>, y<sub>bi</sub>) mesure le temps de vol, donc la distance, toutes les 20 ms avec une variance de 25·10⁻⁴ m² (σ = 5 cm) :'),
    EQ('d<sub>i</sub> = √((x − x<sub>bi</sub>)² + (y − y<sub>bi</sub>)²) &emsp;&emsp; C<sub>i</sub> = [ (x̂ − x<sub>bi</sub>)/d̂<sub>i</sub> &nbsp; (ŷ − y<sub>bi</sub>)/d̂<sub>i</sub> &nbsp; 0 ]'),
    P('The row C<sub>i</sub> is the unit vector from the beacon to the robot: a distance only corrects the position <em>along</em> this line. Its last term is 0: a distance says nothing directly about θ. Yet θ is <strong>observable through the motion</strong>: if θ is wrong, the predicted positions drift sideways and the distances correct them, which corrects θ through the correlations of Γ.',
      'La ligne C<sub>i</sub> est le vecteur unitaire de la balise vers le robot : une distance ne corrige la position que <em>le long</em> de cette droite. Son dernier terme vaut 0 : une distance ne dit rien directement sur θ. Pourtant θ est <strong>observable à travers le mouvement</strong> : si θ est faux, les positions prédites dérivent sur le côté et les distances les corrigent, ce qui corrige θ par les corrélations de Γ.'),
    TABLE([['Data needed to run the EKF', 'Données nécessaires pour faire tourner l\'EKF'], ['Here', 'Ici']], [
      [['positions of the beacons', 'positions des balises'], ['measured once, precisely', 'mesurées une fois, précisément']], [['inputs u, ω and their noise', 'entrées u, ω et leur bruit'], ['from the wheel encoders → Γα', 'des codeurs des roues → Γα']],
      [['measurement variance', 'variance de mesure'], ['Γβ = 25·10⁻⁴ m² per distance', 'Γβ = 25·10⁻⁴ m² par distance']], [['step Δt', 'pas Δt'], ['20 ms', '20 ms']], [['initial x̂₀ and Γ₀', 'x̂₀ et Γ₀ initiaux'], ['a rough guess with a large Γ₀', 'une estimation grossière avec un grand Γ₀']]
    ]),
    WIDGET('kf-uwb3d'),
    BOX('idea', ['Process the distances one by one', 'Traiter les distances une par une'], P('When the noises of the beacons are independent, the three distances can be used as three successive scalar corrections: no matrix inversion, and a beacon that drops out is simply skipped. It is how the lab works.', 'Quand les bruits des balises sont indépendants, les trois distances peuvent servir de trois corrections scalaires successives : pas d\'inversion de matrice, et une balise qui ne répond pas est simplement sautée. C\'est ainsi que marche le labo.'))
  ],
  terms: [['multilateration', 'multilatération'], ['time of flight (TOF)', 'temps de vol (TOF)'], ['UWB anchor', 'ancre UWB'], ['unicycle model', 'modèle unicycle'], ['measurement Jacobian', 'jacobienne de mesure'], ['sequential correction', 'correction séquentielle']],
  quiz: [['How many distances do you need to fix a position in the plane, and why?', 'Combien de distances faut-il pour fixer une position dans le plan, et pourquoi ?', 'Three (not aligned): one gives a circle, two give two points, three remove the ambiguity.', 'Trois (non alignées) : une donne un cercle, deux donnent deux points, trois lèvent l\'ambiguïté.'],
    ['Robot at (3, 4), beacon at (0, 0). Row C of this distance?', 'Robot en (3, 4), balise en (0, 0). Ligne C de cette distance ?', 'd = 5, C = (0.6, 0.8, 0).', 'd = 5, C = (0,6 ; 0,8 ; 0).'],
    ['Distances do not contain θ. How does the filter find the heading?', 'Les distances ne contiennent pas θ. Comment le filtre trouve-t-il le cap ?', 'Through the motion: a wrong θ makes the predicted path drift; the distance corrections propagate to θ through the covariance.', 'Par le mouvement : un θ faux fait dériver le trajet prédit ; les corrections de distance se propagent à θ par la covariance.']]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['Multimodal fusion: several sensors, several rates', 'Fusion multimodale : plusieurs capteurs, plusieurs cadences'],
  time: 25,
  goal: ['how to fuse a compass, angulation, TDOA and odometry, the measurement equations and Jacobians of each, which modality sees which part of the state, how to handle sensors that do not work at the same rate, and centralised against distributed fusion.', 'comment fusionner une boussole, l\'angulation, la TDOA et l\'odométrie, les équations de mesure et les jacobiennes de chacune, quelle modalité voit quelle partie de l\'état, comment gérer des capteurs qui ne travaillent pas à la même cadence, et la fusion centralisée face à la fusion distribuée.'],
  body: [
    ONE('Each sensor gives a partial view; the filter predicts at the rate of the fastest source and adds every measurement at the moment it arrives, so that together they see the whole state.', 'Chaque capteur donne une vue partielle ; le filtre prédit à la cadence de la source la plus rapide et ajoute chaque mesure au moment où elle arrive, pour qu\'ensemble ils voient tout l\'état.'),
    H4('8.1 The three modalities', '8.1 Les trois modalités'),
    P('The robot follows x<sub>k+1</sub> = x<sub>k</sub> + u cos θ, y<sub>k+1</sub> = y<sub>k</sub> + u sin θ, θ<sub>k+1</sub> = θ<sub>k</sub> + v (u, v from the odometry every 200 ms, not perfectly known: add a process noise). Four beacons: B₁ (−10, −10), B₂ (10, −10), B₃ (10, 10), B₄ (−10, 10) m.', 'Le robot suit x<sub>k+1</sub> = x<sub>k</sub> + u cos θ, y<sub>k+1</sub> = y<sub>k</sub> + u sin θ, θ<sub>k+1</sub> = θ<sub>k</sub> + v (u, v venant de l\'odométrie toutes les 200 ms, pas parfaitement connus : ajouter un bruit d\'état). Quatre balises : B₁ (−10, −10), B₂ (10, −10), B₃ (10, 10), B₄ (−10, 10) m.'),
    TABLE([['Modality', 'Modalité'], ['Measures', 'Mesure'], ['Every', 'Toutes les'], ['Variance', 'Variance'], ['Row of C', 'Ligne de C'], ['Sees', 'Voit']], [
      [['M · compass (IMU)', 'M · boussole (IMU)'], 'θ', '200 ms', '4·10⁻⁴ rad²', '(0, 0, 1)', ['the heading only', 'le cap seulement']],
      [['B · angulation', 'B · angulation'], ['bearing of beacon l: γ = atan2(y<sub>l</sub> − y, x<sub>l</sub> − x) − θ', 'relèvement de la balise l : γ = atan2(y<sub>l</sub> − y, x<sub>l</sub> − x) − θ'], '600 ms', '3.8·10⁻² rad²', '(Δy/q, −Δx/q, −1)', ['position <b>and</b> heading (≥ 2 beacons)', 'position <b>et</b> cap (≥ 2 balises)']],
      [['T · TDOA', 'T · TDOA'], 'Δd(i, j) = d(M, Bᵢ) − d(M, Bⱼ)', '400 ms', '10⁻² m²', ['difference of the two unit vectors, 0', 'différence des deux vecteurs unitaires, 0'], ['the position only (≥ 3 beacons)', 'la position seulement (≥ 3 balises)']]
    ]),
    P('(Δx, Δy = beacon − robot, q = Δx² + Δy². TDOA needs no clock on the robot: only the difference of the times of arrival counts, which is why it is used with UWB and GNSS.)', '(Δx, Δy = balise − robot, q = Δx² + Δy². La TDOA n\'a pas besoin d\'horloge sur le robot : seule compte la différence des temps d\'arrivée, c\'est pourquoi on l\'utilise en UWB et en GNSS.)'),
    H4('8.2 Different rates: predict at the base rate, correct when it arrives', '8.2 Cadences différentes : prédire à la cadence de base, corriger à l\'arrivée'),
    OL([['Choose a base step (here 200 ms, the rate of the odometry) and predict at every step.', 'Choisir un pas de base (ici 200 ms, la cadence de l\'odométrie) et prédire à chaque pas.'],
      ['At each step, correct with every measurement that arrived during the step (compass every step, TDOA every 2 steps, angulation every 3 steps), one after the other.', 'À chaque pas, corriger avec chaque mesure arrivée pendant le pas (boussole à chaque pas, TDOA tous les 2 pas, angulation tous les 3 pas), l\'une après l\'autre.'],
      ['If a measurement arrives late (a camera with 100 ms of processing), correct the state of the moment it was taken (keep a short history), or at least add its delay to its noise.', 'Si une mesure arrive en retard (une caméra avec 100 ms de traitement), corriger l\'état du moment où elle a été prise (garder un court historique), ou au moins ajouter son retard à son bruit.']]),
    WIDGET('kf-multi'),
    H4('8.3 Centralised or distributed', '8.3 Centralisée ou distribuée'),
    fig(F.archi()),
    P('In a <strong>centralised</strong> filter (the lab), every raw measurement enters one filter: optimal, but everything depends on one computer. In a <strong>distributed</strong> implementation, each modality runs its own local filter; a fusion centre combines the local estimates. For two independent estimates (x₁, Γ₁) and (x₂, Γ₂) of the same state:', 'Dans un filtre <strong>centralisé</strong> (le labo), chaque mesure brute entre dans un seul filtre : optimal, mais tout dépend d\'un seul calculateur. Dans une implémentation <strong>distribuée</strong>, chaque modalité fait tourner son propre filtre local ; un centre de fusion combine les estimations locales. Pour deux estimations indépendantes (x₁, Γ₁) et (x₂, Γ₂) d\'un même état :'),
    EQ('Γ = (Γ₁⁻¹ + Γ₂⁻¹)⁻¹ &emsp;&emsp; x̂ = Γ (Γ₁⁻¹ x₁ + Γ₂⁻¹ x₂)'),
    BOX('warn', ['Beware of the common information', 'Attention à l\'information commune'], P('The local filters share the same odometry, so their errors are <strong>correlated</strong>: the formula above would then be too optimistic. Fusion centres use the information form with the common prediction removed, or the covariance intersection, which stays safe when the correlation is unknown.', 'Les filtres locaux partagent la même odométrie, leurs erreurs sont donc <strong>corrélées</strong> : la formule ci-dessus serait alors trop optimiste. Les centres de fusion utilisent la forme information en retirant la prédiction commune, ou l\'intersection de covariance, qui reste sûre quand la corrélation est inconnue.'))
  ],
  terms: [['multimodal fusion', 'fusion multimodale'], ['angulation (angle of arrival)', 'angulation (angle d\'arrivée)'], ['TDOA', 'TDOA (différence de temps d\'arrivée)'], ['asynchronous measurements', 'mesures asynchrones'], ['centralised, distributed fusion', 'fusion centralisée, distribuée'], ['covariance intersection', 'intersection de covariance']],
  quiz: [['Which modality alone recovers the whole state (x, y, θ)?', 'Quelle modalité seule retrouve tout l\'état (x, y, θ) ?', 'Angulation (bearings relative to the robot, at least 2 beacons); the compass gives θ only, TDOA the position only.', 'L\'angulation (relèvements relatifs au robot, au moins 2 balises) ; la boussole ne donne que θ, la TDOA que la position.'],
    ['Odometry every 200 ms, TDOA every 400 ms: when do you correct with the TDOA?', 'Odométrie toutes les 200 ms, TDOA toutes les 400 ms : quand corrigez-vous avec la TDOA ?', 'Every second prediction step, right after the prediction of that step.', 'Un pas de prédiction sur deux, juste après la prédiction de ce pas.'],
    ['Two independent estimates of the same quantity, variances 4 and 4. Fused variance?', 'Deux estimations indépendantes de la même grandeur, variances 4 et 4. Variance fusionnée ?', '(1/4 + 1/4)⁻¹ = 2.', '(1/4 + 1/4)⁻¹ = 2.']]
})
  ];
}
