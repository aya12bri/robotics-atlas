// Course: Code a robot arm in Python — lessons 4 to 6 (numerical IK, trajectories and a real arm, final exam).
import { tx, P, H4, UL, OL, BOX, TABLE, CODE, OUT, EXS, LABCHK, lesson } from '../lib.mjs';
const PRE = 'lab-';

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['The Jacobian and numerical inverse kinematics', 'La jacobienne et le modèle inverse numérique'],
  time: 18,
  goal: ['to compute the Jacobian of any arm with finite differences, and to solve the inverse kinematics of any arm step by step, safely near singularities.', 'à calculer la jacobienne de n\'importe quel bras par différences finies, et à résoudre pas à pas le modèle inverse de n\'importe quel bras, en sécurité près des singularités.'],
  body: [
    P('A closed-form inverse model exists only for simple robots. For any other one, the computer <strong>searches</strong>: from a guess, it moves the joints a little in the direction that brings the tool closer, again and again. It is exactly what the “Build your first robot” workshop does when you press “Send the tool to the ball”.',
      'Un modèle inverse en formule fermée n\'existe que pour des robots simples. Pour tous les autres, l\'ordinateur <strong>cherche</strong> : à partir d\'une estimation, il bouge un peu les liaisons dans la direction qui rapproche l\'outil, encore et encore. C\'est exactement ce que fait l\'atelier « Construisez votre premier robot » quand vous appuyez sur « Envoyer l\'outil sur la balle ».'),
    H4('4.1 The Jacobian by finite differences', '4.1 La jacobienne par différences finies'),
    P('Column <i>i</i> of the Jacobian is “how the tool moves when joint <i>i</i> turns a little” (maths course, lesson 9). No need to derive anything: turn joint <i>i</i> by a tiny <i>h</i>, measure how much the tool moved, divide by <i>h</i>. It works for any robot that has a forward model.',
      'La colonne <i>i</i> de la jacobienne est « comment l\'outil bouge quand la liaison <i>i</i> tourne un peu » (cours de maths, leçon 9). Pas besoin de dériver : tournez la liaison <i>i</i> d\'un tout petit <i>h</i>, mesurez de combien l\'outil a bougé, divisez par <i>h</i>. Cela marche pour tout robot qui a un modèle direct.'),
    H4('4.2 The search: damped least squares', '4.2 La recherche : les moindres carrés amortis'),
    P('At each step: error <i>e</i> = target − position; correction Δ<i>q</i> = <i>J</i><sup>T</sup> (<i>J J</i><sup>T</sup> + <i>λ</i>² <i>I</i>)<sup>−1</sup> <i>e</i>; new <i>q</i> = <i>q</i> + Δ<i>q</i>, kept inside the joint limits. The small <i>λ</i> (the damping) keeps the step small near a singularity, where <i>J J</i><sup>T</sup> can no longer be inverted (singularities course, lesson 8).',
      'À chaque pas : erreur <i>e</i> = cible − position ; correction Δ<i>q</i> = <i>J</i><sup>T</sup> (<i>J J</i><sup>T</sup> + <i>λ</i>² <i>I</i>)<sup>−1</sup> <i>e</i> ; nouveau <i>q</i> = <i>q</i> + Δ<i>q</i>, gardé dans les butées. Le petit <i>λ</i> (l\'amortissement) garde le pas petit près d\'une singularité, là où <i>J J</i><sup>T</sup> ne peut plus être inversée (cours sur les singularités, leçon 8).'),
    CODE('arm_numik.py'),
    OUT('arm_numik.out.txt'),
    H4('4.3 What the output teaches', '4.3 Ce que la sortie apprend'),
    UL([
      ['For the target of lesson 2 the search finds (25°, 70°, −80°) in <strong>4 iterations</strong>, with an error of 0.003 mm: the angles that created this point.', 'Pour la cible de la leçon 2, la recherche trouve (25° ; 70° ; −80°) en <strong>4 itérations</strong>, avec une erreur de 0,003 mm : les angles qui avaient créé ce point.'],
      ['From one fixed start it reaches only <strong>12 targets out of 20</strong>: a local search can get stuck against a joint limit, or go towards the other elbow and stop.', 'Depuis un seul départ fixe, elle n\'atteint que <strong>12 cibles sur 20</strong> : une recherche locale peut rester bloquée contre une butée, ou partir vers l\'autre coude et s\'arrêter.'],
      ['With up to 6 starts it reaches <strong>20 out of 20</strong>. Real solvers do the same: they restart from other guesses, and start from the current pose of the robot, which is usually close to the answer.', 'Avec jusqu\'à 6 départs, elle atteint <strong>20 sur 20</strong>. Les vrais solveurs font pareil : ils redémarrent d\'autres estimations, et partent de la pose actuelle du robot, souvent proche de la réponse.']
    ]),
    BOX('keep', ['Always check the result', 'Vérifiez toujours le résultat'],
      P('A numerical solver can return angles that do not reach the target. Never send its answer to the motors without checking the error with the forward model, as the code does with <code>np.linalg.norm(position(q_sol) - p)</code>.',
        'Un solveur numérique peut renvoyer des angles qui n\'atteignent pas la cible. N\'envoyez jamais sa réponse aux moteurs sans vérifier l\'erreur avec le modèle direct, comme le fait le code avec <code>np.linalg.norm(position(q_sol) - p)</code>.'))
  ],
  terms: [['Jacobian', 'jacobienne'], ['finite difference', 'différence finie'], ['damped least squares', 'moindres carrés amortis'], ['local minimum', 'minimum local'], ['restart', 'redémarrage']],
  quiz: [
    ['How is column i of the Jacobian computed numerically?', 'Comment calcule-t-on numériquement la colonne i de la jacobienne ?', 'Turn joint i by a tiny h, measure how the tool moves, divide by h.', 'Tourner la liaison i d\'un tout petit h, mesurer comment l\'outil bouge, diviser par h.'],
    ['What is the damping λ for?', 'À quoi sert l\'amortissement λ ?', 'To keep the steps small and finite near a singularity, where J Jᵀ cannot be inverted.', 'À garder des pas petits et finis près d\'une singularité, là où J Jᵀ ne peut pas être inversée.'],
    ['The solver reaches only 12 targets out of 20 from one start. What do you do?', 'Le solveur n\'atteint que 12 cibles sur 20 depuis un seul départ. Que faites-vous ?', 'Restart from other guesses (and from the current pose), and keep the solution whose error is below the tolerance.', 'Redémarrer depuis d\'autres estimations (et depuis la pose actuelle), et garder la solution dont l\'erreur est sous la tolérance.']
  ],
  link: ['build.html', 'Watch numerical IK in the “Build your first robot” workshop →', 'Voir le modèle inverse numérique dans l\'atelier « Construisez votre premier robot » →']
}),
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['From the code to a real arm: trajectories and servos', 'Du code à un vrai bras : trajectoires et servomoteurs'],
  time: 22,
  goal: ['to generate a smooth motion, to turn angles into servo pulses, and to build and drive a small 3-servo arm with an Arduino.', 'à générer un mouvement doux, à transformer des angles en impulsions de servomoteur, et à construire et piloter un petit bras à 3 servos avec un Arduino.'],
  body: [
    H4('5.1 A smooth motion: the degree-5 polynomial', '5.1 Un mouvement doux : le polynôme de degré 5'),
    P('Jumping from one angle to another shakes the arm. The <strong>quintic</strong> law (modelling course, lesson 9) goes from <i>q</i><sub>0</sub> to <i>q</i><sub>1</sub> in a time <i>T</i> with zero speed and zero acceleration at both ends. Its peak speed, at mid-time, is 1.875 times the average speed: use it to check that the servos are fast enough.',
      'Sauter d\'un angle à un autre secoue le bras. La loi <strong>quintique</strong> (cours de modélisation, leçon 9) va de <i>q</i><sub>0</sub> à <i>q</i><sub>1</sub> en un temps <i>T</i> avec une vitesse et une accélération nulles aux deux bouts. Sa vitesse de pointe, à mi-temps, vaut 1,875 fois la vitesse moyenne : servez-vous-en pour vérifier que les servos sont assez rapides.'),
    CODE('arm_traj.py'),
    OUT('arm_traj.out.txt'),
    H4('5.2 Servos: angle → pulse', '5.2 Les servos : angle → impulsion'),
    UL([
      ['A hobby servo receives a pulse every 20 ms; its <strong>width</strong> sets the angle: typically 500 µs → 0°, 1500 µs → 90°, 2500 µs → 180° (check the data sheet: many use 1000 to 2000 µs).', 'Un servo de modélisme reçoit une impulsion toutes les 20 ms ; sa <strong>largeur</strong> fixe l\'angle : typiquement 500 µs → 0°, 1500 µs → 90°, 2500 µs → 180° (vérifiez la fiche : beaucoup utilisent 1000 à 2000 µs).'],
      ['The servo contains its own motor, gearbox, potentiometer and P controller: you only send the target angle.', 'Le servo contient son propre moteur, réducteur, potentiomètre et correcteur P : vous n\'envoyez que l\'angle de consigne.'],
      ['Each servo is mounted a little off: measure its <strong>offset</strong> once (send 90°, measure the real angle) and add it in software.', 'Chaque servo est monté un peu de travers : mesurez son <strong>décalage</strong> une fois (envoyez 90°, mesurez l\'angle réel) et ajoutez-le dans le logiciel.'],
      ['Joint angle and servo angle differ: usually servo = 90° + <i>θ</i> (or 90° − <i>θ</i> if it is mounted the other way). Write this mapping in one function, and test it joint by joint.', 'Angle de liaison et angle du servo diffèrent : en général servo = 90° + <i>θ</i> (ou 90° − <i>θ</i> s\'il est monté dans l\'autre sens). Écrivez cette correspondance dans une seule fonction, et testez-la liaison par liaison.']
    ]),
    H4('5.3 Build the arm', '5.3 Construire le bras'),
    TABLE([['Part', 'Pièce'], ['Example', 'Exemple'], ['Note', 'Remarque']], [
      [['3 servos', '3 servos'], ['MG996R (metal gears) for the base and the shoulder; SG90 for a very small arm', 'MG996R (engrenages métal) pour la base et l\'épaule ; SG90 pour un très petit bras'], ['the shoulder carries the most torque (control course, lesson 1)', 'l\'épaule porte le plus de couple (cours de commande, leçon 1)']],
      [['Microcontroller', 'Microcontrôleur'], ['Arduino Uno or Nano', 'Arduino Uno ou Nano'], ['or a PCA9685 board to drive up to 16 servos', 'ou une carte PCA9685 pour piloter jusqu\'à 16 servos']],
      [['Power supply', 'Alimentation'], ['5 to 6 V, at least 3 A', '5 à 6 V, au moins 3 A'], ['<strong>never</strong> power the servos from the 5 V pin of the Arduino; connect the grounds together', '<strong>jamais</strong> alimenter les servos par la broche 5 V de l\'Arduino ; reliez les masses entre elles']],
      [['Links', 'Segments'], ['3D-printed, laser-cut, or thick cardboard and servo horns', 'imprimés en 3D, découpés au laser, ou carton épais et palonniers'], ['measure <i>L</i><sub>1</sub>, <i>L</i><sub>2</sub> between the servo axes and put them in the code', 'mesurez <i>L</i><sub>1</sub>, <i>L</i><sub>2</sub> entre les axes des servos et mettez-les dans le code']],
      [['Tool', 'Outil'], ['a pen holder', 'un porte-stylo'], ['drawing makes the errors visible', 'dessiner rend les erreurs visibles']]
    ]),
    H4('5.4 The code on both sides', '5.4 Le code des deux côtés'),
    P('The Arduino only receives three angles per line and moves the servos. All the maths (trajectory, inverse kinematics, offsets) stays in Python on the computer, where it is easy to debug.', 'L\'Arduino ne fait que recevoir trois angles par ligne et bouger les servos. Toutes les maths (trajectoire, modèle inverse, décalages) restent en Python sur l\'ordinateur, là où c\'est facile à déboguer.'),
    CODE('arm_servo.ino'),
    CODE('arm_send.py'),
    BOX('warn', ['Before powering the arm', 'Avant d\'alimenter le bras'],
      UL([
        ['These two programs were written for this course but could not be tested on hardware here. Read the error messages, and test step by step: one servo, then the three, then a slow trajectory.', 'Ces deux programmes ont été écrits pour ce cours mais n\'ont pas pu être testés sur du matériel ici. Lisez les messages d\'erreur, et testez pas à pas : un servo, puis les trois, puis une trajectoire lente.'],
        ['Servos jump to their position at power-up: keep your fingers away and start with the arm in its middle pose.', 'Les servos sautent à leur position à la mise sous tension : gardez vos doigts à l\'écart et démarrez avec le bras en pose médiane.'],
        ['Keep a hand on the power switch: it is your emergency stop.', 'Gardez une main sur l\'interrupteur d\'alimentation : c\'est votre arrêt d\'urgence.']
      ])),
    BOX('lab', ['Draw a square', 'Dessiner un carré'],
      OL([
        ['Choose 4 corners of a 6 cm square in front of the robot, on the paper.', 'Choisissez 4 coins d\'un carré de 6 cm devant le robot, sur la feuille.'],
        ['Cut each side into 20 points; compute the inverse kinematics of each point (lesson 3 or 4).', 'Découpez chaque côté en 20 points ; calculez le modèle inverse de chaque point (leçon 3 ou 4).'],
        ['Send the angles at a steady rhythm. Measure the drawn square: the error shows your offsets and link lengths. Correct them and draw again.', 'Envoyez les angles à un rythme régulier. Mesurez le carré dessiné : l\'erreur révèle vos décalages et longueurs de segments. Corrigez-les et redessinez.']
      ]))
  ],
  terms: [['quintic trajectory', 'trajectoire quintique'], ['servo', 'servomoteur'], ['pulse width', 'largeur d\'impulsion'], ['offset calibration', 'étalonnage du décalage'], ['serial link', 'liaison série']],
  quiz: [
    ['Why is a servo arm moved along a quintic trajectory instead of jumping to the target?', 'Pourquoi fait-on suivre une trajectoire quintique à un bras à servos au lieu de sauter à la cible ?', 'It starts and stops with zero speed and acceleration: no shock, no shaking.', 'Il démarre et s\'arrête avec une vitesse et une accélération nulles : pas de choc, pas de secousse.'],
    ['Why must the servos have their own power supply?', 'Pourquoi les servos doivent-ils avoir leur propre alimentation ?', 'They draw peaks of several amperes; the Arduino 5 V pin cannot give them and the board would reset or break.', 'Ils tirent des pointes de plusieurs ampères ; la broche 5 V de l\'Arduino ne peut pas les fournir et la carte redémarrerait ou casserait.'],
    ['Why keep the maths in Python and not in the Arduino?', 'Pourquoi garder les maths en Python et pas dans l\'Arduino ?', 'It is easier to write, test and debug on the computer; the Arduino only needs to move the servos.', 'C\'est plus facile à écrire, tester et déboguer sur l\'ordinateur ; l\'Arduino n\'a qu\'à bouger les servos.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['Final exam and labs: prove it', 'Examen final et TP : prouvez-le'],
  time: 60,
  goal: ['to check that you can compute, code and build: a written exam and five labs.', 'à vérifier que vous savez calculer, coder et construire : un examen écrit et cinq TP.'],
  body: [
    P('The course is complete when you pass the written exam (70 % or more) and do at least 4 of the 5 labs. Your progress is kept in this browser.', 'Le cours est terminé quand vous réussissez l\'examen écrit (70 % ou plus) et faites au moins 4 des 5 TP. Votre progression est gardée dans ce navigateur.'),
    `<div id="examSum" data-pass="70" data-chals="" data-labs="arm1,arm2,arm3,arm4,arm5" data-labmin="4" data-win-en="Course complete: you can model, code and drive a robot arm, from its DH table to a real servo arm." data-win-fr="Cours terminé : vous savez modéliser, coder et piloter un bras robot, de son tableau DH à un vrai bras à servos."></div>`,
    EXS(PRE, 6, exam(), { exam: true, title: ['Written exam', 'Examen écrit'], note: ['Each question is checked once: your first answer counts. The solution appears below it to learn from your mistakes.', 'Chaque question est vérifiée une seule fois : votre première réponse compte. La solution apparaît en dessous pour apprendre de vos erreurs.'] }),
    H4('The five labs', 'Les cinq TP'),
    BOX('lab', ['Lab 1 — Forward kinematics', 'TP 1 — Modèle direct'], P('Run <code>arm_fk2.py</code> and reproduce its output. Change <i>L</i><sub>2</sub> to 0.3 m and predict, then check, the new reach at (0°, 0°). <strong>Pass</strong>: your prediction matches the program.', 'Lancez <code>arm_fk2.py</code> et reproduisez sa sortie. Changez <i>L</i><sub>2</sub> en 0,3 m et prédisez, puis vérifiez, la nouvelle portée en (0° ; 0°). <strong>Réussi</strong> : votre prédiction correspond au programme.'), LABCHK('arm1')),
    BOX('lab', ['Lab 2 — A DH table of your own', 'TP 2 — Un tableau DH à vous'], P('Write the standard and the modified DH tables of the SCARA of the workshop (two horizontal links of 0.42 m and 0.32 m, a vertical slider). Put them in <code>arm_dh.py</code>. <strong>Pass</strong>: both tables give the same tool pose for 3 different poses.', 'Écrivez les tableaux DH standard et modifié du SCARA de l\'atelier (deux segments horizontaux de 0,42 m et 0,32 m, une glissière verticale). Mettez-les dans <code>arm_dh.py</code>. <strong>Réussi</strong> : les deux tableaux donnent la même pose d\'outil pour 3 poses différentes.'), LABCHK('arm2')),
    BOX('lab', ['Lab 3 — The round trip', 'TP 3 — L\'aller-retour'], P('Draw 100 random points in a square of 2 m around the base. For each, compute <code>ik</code> then <code>fk</code>. <strong>Pass</strong>: every reachable point comes back within 10⁻⁹ m, and you can explain how many were refused and why.', 'Tirez 100 points au hasard dans un carré de 2 m autour de la base. Pour chacun, calculez <code>ik</code> puis <code>fk</code>. <strong>Réussi</strong> : chaque point accessible revient à moins de 10⁻⁹ m, et vous savez expliquer combien ont été refusés et pourquoi.'), LABCHK('arm3')),
    BOX('lab', ['Lab 4 — Numerical IK', 'TP 4 — Modèle inverse numérique'], P('Reproduce the 20 / 20 of lesson 4, then remove the damping (λ = 0) and try targets close to the stretched arm. <strong>Pass</strong>: you can show and explain what goes wrong without damping.', 'Reproduisez le 20 / 20 de la leçon 4, puis retirez l\'amortissement (λ = 0) et essayez des cibles proches du bras tendu. <strong>Réussi</strong> : vous savez montrer et expliquer ce qui se passe mal sans amortissement.'), LABCHK('arm4')),
    BOX('lab', ['Lab 5 — The real arm', 'TP 5 — Le vrai bras'], P('Build the 3-servo arm of lesson 5, calibrate the offsets, and draw a 6 cm square. <strong>Pass</strong>: every side is 6 cm ± 5 mm.', 'Construisez le bras à 3 servos de la leçon 5, étalonnez les décalages, et dessinez un carré de 6 cm. <strong>Réussi</strong> : chaque côté mesure 6 cm ± 5 mm.'), LABCHK('arm5'))
  ],
  terms: [['exam', 'examen'], ['lab', 'TP'], ['pass criterion', 'critère de réussite']],
  quiz: [['What do you need to complete the course?', 'Que faut-il pour terminer le cours ?', 'At least 70 % at the written exam and at least 4 of the 5 labs.', 'Au moins 70 % à l\'examen écrit et au moins 4 des 5 TP.']]
})
  ];
}

function exam() {
  const D = Math.PI / 180;
  return [
    { lv: 1, exam: true, q: ['2-axis arm, L1 = 0.5 m, L2 = 0.4 m, θ = (90°, 0°). y of the tool (m)?', 'Bras à 2 axes, L1 = 0,5 m, L2 = 0,4 m, θ = (90° ; 0°). y de l\'outil (m) ?'], num: { ans: 0.9, tol: 0.005, unit: 'm' }, sol: ['Both links point up: y = 0.5 + 0.4 = <b>0.9 m</b>.', 'Les deux segments pointent vers le haut : y = 0,5 + 0,4 = <b>0,9 m</b>.'] },
    { lv: 1, exam: true, q: ['Same arm, θ = (0°, 90°). y of the tool (m)?', 'Même bras, θ = (0° ; 90°). y de l\'outil (m) ?'], num: { ans: 0.4, tol: 0.005, unit: 'm' }, sol: ['Link 1 along x, link 2 up: tool at (0.5, <b>0.4</b>).', 'Segment 1 selon x, segment 2 vers le haut : outil en (0,5 ; <b>0,4</b>).'] },
    { lv: 1, exam: true, q: ['How many inverse kinematics solutions does the 2-axis arm have for a point strictly inside its workspace?', 'Combien de solutions du modèle inverse le bras à 2 axes a-t-il pour un point strictement à l\'intérieur de son espace de travail ?'], num: { ans: 2, tol: 0.01, unit: '' }, sol: ['<b>2</b>: elbow up and elbow down (one only on the boundary, when the arm is stretched or folded).', '<b>2</b> : coude en haut et coude en bas (une seule sur la frontière, bras tendu ou replié).'] },
    { lv: 1, exam: true, q: ['A table has the columns α, a, θ, d. Which convention?', 'Un tableau a les colonnes α, a, θ, d. Quelle convention ?'], mcq: [['Modified DH (DHM)', 'DH modifié (DHM)', true], ['Standard DH', 'DH standard']], sol: ['The moves along x come first: <b>modified DH</b>.', 'Les mouvements selon x viennent en premier : <b>DH modifié</b>.'] },
    { lv: 1, exam: true, q: ['The 3-axis arm of the course (d1 = 0.40, a2 = 0.45, a3 = 0.38), all angles at 0. x of the tool (m)?', 'Le bras à 3 axes du cours (d1 = 0,40, a2 = 0,45, a3 = 0,38), tous les angles à 0. x de l\'outil (m) ?'], num: { ans: 0.83, tol: 0.005, unit: 'm' }, sol: ['Stretched along x: 0.45 + 0.38 = <b>0.83 m</b> (at the height 0.40 m).', 'Tendu selon x : 0,45 + 0,38 = <b>0,83 m</b> (à la hauteur 0,40 m).'] },
    { lv: 2, exam: true, q: ['2-axis arm (0.5 m, 0.4 m), target (0.6, 0.2). |θ2| in degrees?', 'Bras à 2 axes (0,5 m ; 0,4 m), cible (0,6 ; 0,2). |θ2| en degrés ?'], num: { ans: Math.acos(-0.025) / D, tol: 0.1, unit: '°' }, hint: ['cos θ2 = (x² + y² − L1² − L2²) / (2 L1 L2).', 'cos θ2 = (x² + y² − L1² − L2²) / (2 L1 L2).'], sol: ['cos θ2 = (0.36 + 0.04 − 0.25 − 0.16) / 0.4 = −0.025, so |θ2| = <b>91.43°</b> (the output of lesson 3).', 'cos θ2 = (0,36 + 0,04 − 0,25 − 0,16) / 0,4 = −0,025, donc |θ2| = <b>91,43°</b> (la sortie de la leçon 3).'] },
    { lv: 2, exam: true, q: ['Is the point (0.7, 0.6) reachable by the 2-axis arm (0.5 m, 0.4 m)?', 'Le point (0,7 ; 0,6) est-il accessible au bras à 2 axes (0,5 m ; 0,4 m) ?'], mcq: [['No: it is 0.92 m away, the reach is 0.9 m', 'Non : il est à 0,92 m, la portée est de 0,9 m', true], ['Yes, with the elbow up', 'Oui, coude en haut'], ['Yes, with the elbow down', 'Oui, coude en bas']], sol: ['√(0.49 + 0.36) = 0.922 m > 0.9 m: <b>out of reach</b>; cos θ2 would be greater than 1.', '√(0,49 + 0,36) = 0,922 m > 0,9 m : <b>hors d\'atteinte</b> ; cos θ2 serait plus grand que 1.'] },
    { lv: 2, exam: true, q: ['det J of the 2-axis arm is L1 L2 sin θ2. Value at θ2 = 30° (m²)?', 'Le dét J du bras à 2 axes vaut L1 L2 sin θ2. Valeur en θ2 = 30° (m²) ?'], num: { ans: 0.1, tol: 0.002, unit: 'm²' }, sol: ['0.5 × 0.4 × 0.5 = <b>0.1 m²</b>. It is 0 at θ2 = 0: the stretched arm is singular.', '0,5 × 0,4 × 0,5 = <b>0,1 m²</b>. Il vaut 0 en θ2 = 0 : le bras tendu est singulier.'] },
    { lv: 2, exam: true, q: ['Turning joint 2 by 0.001 rad moves the tool by 0.25 mm. Value of this entry of the Jacobian (m/rad)?', 'Tourner la liaison 2 de 0,001 rad déplace l\'outil de 0,25 mm. Valeur de cette case de la jacobienne (m/rad) ?'], num: { ans: 0.25, tol: 0.003, unit: 'm/rad' }, sol: ['0.00025 m / 0.001 rad = <b>0.25 m/rad</b>: the finite difference of lesson 4.', '0,00025 m / 0,001 rad = <b>0,25 m/rad</b> : la différence finie de la leçon 4.'] },
    { lv: 2, exam: true, q: ['Why add a damping λ in the numerical inverse kinematics?', 'Pourquoi ajouter un amortissement λ dans le modèle inverse numérique ?'], mcq: [['To avoid huge steps near a singularity', 'Pour éviter des pas énormes près d\'une singularité', true], ['To go faster far from singularities', 'Pour aller plus vite loin des singularités'], ['To respect the joint limits', 'Pour respecter les butées']], sol: ['Near a singularity J Jᵀ is almost not invertible: without λ the correction explodes. The limits are handled by the clipping.', 'Près d\'une singularité, J Jᵀ n\'est presque plus inversible : sans λ, la correction explose. Les butées sont gérées par l\'écrêtage.'] },
    { lv: 3, exam: true, q: ['A quintic motion of 60° in 2 s. Peak speed (°/s)?', 'Un mouvement quintique de 60° en 2 s. Vitesse de pointe (°/s) ?'], num: { ans: 56.25, tol: 0.3, unit: '°/s' }, sol: ['Average 30 °/s × 1.875 = <b>56.25 °/s</b>, reached at mid-time.', 'Moyenne 30 °/s × 1,875 = <b>56,25 °/s</b>, atteinte à mi-temps.'] },
    { lv: 3, exam: true, q: ['A servo maps 0–180° to 500–2500 µs. Pulse for 45° (µs)?', 'Un servo fait correspondre 0–180° à 500–2500 µs. Impulsion pour 45° (µs) ?'], num: { ans: 1000, tol: 1, unit: 'µs' }, sol: ['500 + 2000 × 45 / 180 = 500 + 500 = <b>1000 µs</b>.', '500 + 2000 × 45 / 180 = 500 + 500 = <b>1000 µs</b>.'] }
  ];
}
