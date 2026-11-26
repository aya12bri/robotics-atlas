// Electronics and Arduino — lessons 5 to 8: PWM and transistors, DC motor + H-bridge + encoder, servos and steppers, a first robot.
import { P, H4, UL, OL, EQ, BOX, TABLE, CODE, lesson } from '../lib.mjs';
import { chain, plot, COL as C } from '../practice/fig.mjs';
import { waves, mosfet, hbridge } from './el-figs.mjs';
const PRE = 'el-';
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));
const FIGO = (o) => `<figure class="figure"><svg viewBox="${o.vb}" class="fig" role="img" aria-hidden="true">${o.svg}</svg></figure>`;
const per = (w, n = 3, T = 2) => Array.from({ length: n }, (_, k) => [k * T, k * T + w]);

export function partB() {
  return [
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['PWM and transistors: controlling power', 'PWM et transistors : commander la puissance'],
  time: 30,
  goal: ['how PWM makes an “average” voltage with a signal that is only on or off, what analogWrite does, why a motor needs a transistor (a MOSFET) and a flyback diode, and how to wire them.', 'comment la PWM fabrique une tension « moyenne » avec un signal qui n\'est que tout ou rien, ce que fait analogWrite, pourquoi un moteur a besoin d\'un transistor (un MOSFET) et d\'une diode de roue libre, et comment les câbler.'],
  body: [
    ONE('PWM switches the full voltage on and off very fast; the motor only feels the average, set by the fraction of time it is on.', 'La PWM allume et éteint la pleine tension très vite ; le moteur ne sent que la moyenne, fixée par la fraction du temps où elle est allumée.'),
    H4('5.1 The duty cycle', '5.1 Le rapport cyclique'),
    FIGO(waves([{ label: '25 %', hi: per(0.5), avg: 0.25, note: 'analogWrite 64' }, { label: '50 %', hi: per(1), avg: 0.5, note: 'analogWrite 128' }, { label: '75 %', hi: per(1.5), avg: 0.75, note: 'analogWrite 191' }], { tmax: 6, L: 160, axis: { ticks: [0, 2, 4, 6], label: ['time (ms), ≈ 490 Hz', 'temps (ms), ≈ 490 Hz'] } })),
    EQ('duty = value / 255 &emsp; <i>U</i><sub>average</sub> = duty × <i>U</i><sub>supply</sub>', 'rapport = valeur / 255 &emsp; <i>U</i><sub>moyenne</sub> = rapport × <i>U</i><sub>alim</sub>'),
    P('The dashed yellow line is the average. The same PWM dims an LED, sets the speed of a motor or the heat of a resistor. It is efficient: the switch is either fully on (no voltage across it) or fully off (no current), so it hardly heats.', 'La ligne jaune pointillée est la moyenne. La même PWM fait varier une LED, la vitesse d\'un moteur ou la chaleur d\'une résistance. Elle est efficace : l\'interrupteur est soit complètement fermé (pas de tension à ses bornes), soit complètement ouvert (pas de courant), il chauffe donc très peu.'),
    H4('5.2 A transistor as a switch', '5.2 Un transistor comme interrupteur'),
    FIGO(mosfet()),
    UL([
      ['The pin only drives the <strong>gate</strong> of the MOSFET (almost no current); the motor current flows from the motor supply through the MOSFET to GND.', 'La broche ne commande que la <strong>grille</strong> du MOSFET (presque aucun courant) ; le courant du moteur circule de l\'alimentation moteur à GND à travers le MOSFET.'],
      ['Choose a <strong>logic-level</strong> MOSFET: fully on with 5 V (or 3.3 V) on the gate.', 'Choisissez un MOSFET <strong>niveau logique</strong> : complètement fermé avec 5 V (ou 3,3 V) sur la grille.'],
      ['A motor is a coil: when it is switched off, it creates a high voltage spike. The <strong>flyback diode</strong>, across the motor, lets that current go round and protects the MOSFET.', 'Un moteur est une bobine : quand on le coupe, il crée un pic de haute tension. La <strong>diode de roue libre</strong>, en parallèle sur le moteur, laisse ce courant tourner en rond et protège le MOSFET.']
    ]),
    CODE('el-pwm.ino'),
    BOX('note', ['One direction only', 'Un seul sens'], P('This circuit can only set the speed. To also choose the direction, four switches are needed: the H-bridge of the next lesson.', 'Ce circuit ne peut régler que la vitesse. Pour choisir aussi le sens, il faut quatre interrupteurs : le pont en H de la leçon suivante.'))
  ],
  terms: [['PWM', 'PWM (MLI)'], ['duty cycle', 'rapport cyclique'], ['analogWrite', 'analogWrite'], ['MOSFET, gate', 'MOSFET, grille'], ['flyback diode', 'diode de roue libre']],
  quiz: [
    ['What duty cycle does analogWrite(255) give?', 'Quel rapport cyclique donne analogWrite(255) ?', '100 %: the pin is always HIGH.', '100 % : la broche est toujours à HIGH.'],
    ['Why does the switch of a PWM hardly heat?', 'Pourquoi l\'interrupteur d\'une PWM chauffe-t-il très peu ?', 'Because it is either fully on (almost no voltage across it) or off (no current): P = U I stays small.', 'Parce qu\'il est soit fermé (presque aucune tension à ses bornes), soit ouvert (aucun courant) : P = U I reste petit.'],
    ['What is the flyback diode for?', 'À quoi sert la diode de roue libre ?', 'To give a path to the current of the motor coil when the MOSFET opens, so that the voltage spike does not destroy it.', 'À donner un chemin au courant de la bobine du moteur quand le MOSFET s\'ouvre, pour que le pic de tension ne le détruise pas.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['The DC motor: H-bridge and encoder', 'Le moteur à courant continu : pont en H et codeur'],
  time: 30,
  goal: ['how an H-bridge chooses the direction of a DC motor, how to drive it with a driver board, how an encoder counts the turns and gives the direction, and how to compute the speed of a wheel.', 'comment un pont en H choisit le sens d\'un moteur à courant continu, comment le commander avec une carte pilote, comment un codeur compte les tours et donne le sens, et comment calculer la vitesse d\'une roue.'],
  body: [
    ONE('The H-bridge reverses the current to reverse the motor; the encoder counts ticks so that the robot knows how far and how fast its wheels turned.', 'Le pont en H inverse le courant pour inverser le moteur ; le codeur compte des tops pour que le robot sache de combien et à quelle vitesse ses roues ont tourné.'),
    H4('6.1 The H-bridge', '6.1 Le pont en H'),
    FIGO(hbridge(1)),
    FIGO(hbridge(-1)),
    TABLE([['IN1', 'IN1'], ['IN2', 'IN2'], ['PWM', 'PWM'], ['Motor', 'Moteur']], [
      ['HIGH', 'LOW', '0 … 255', ['forward, speed set by PWM', 'avant, vitesse réglée par la PWM']],
      ['LOW', 'HIGH', '0 … 255', ['backward', 'arrière']],
      ['LOW', 'LOW', '—', ['free wheel (coasts)', 'roue libre']],
      ['HIGH', 'HIGH', '—', ['brake (motor short-circuited)', 'frein (moteur court-circuité)']]
    ]),
    P('Never close S1 and S2 (or S3 and S4) together: that is a short circuit of the battery. Driver boards (TB6612FNG, L298N, DRV8833) contain the four switches and the protections; you only give IN1, IN2 and PWM. The L298N, older, loses about 2 V; the TB6612 almost nothing.', 'Ne fermez jamais S1 et S2 (ou S3 et S4) ensemble : c\'est un court-circuit de la batterie. Les cartes pilotes (TB6612FNG, L298N, DRV8833) contiennent les quatre interrupteurs et les protections ; vous ne donnez que IN1, IN2 et la PWM. Le L298N, plus ancien, perd environ 2 V ; le TB6612 presque rien.'),
    H4('6.2 The encoder', '6.2 Le codeur'),
    FIGO(waves([{ label: 'A', hi: per(1), col: C.o }, { label: 'B', hi: per(1).map(([a, b]) => [a + 0.5, b + 0.5]), col: C.b }], { tmax: 6, L: 80, axis: { ticks: [0, 1, 2, 3, 4, 5, 6], label: ['ticks', 'tops'] } })),
    P('Two signals A and B, shifted by a quarter period (in quadrature). On each rising edge of A, look at B: LOW → one way, HIGH → the other way. An interrupt on A counts the ticks even while loop() is busy.', 'Deux signaux A et B, décalés d\'un quart de période (en quadrature). À chaque front montant de A, regardez B : LOW → un sens, HIGH → l\'autre sens. Une interruption sur A compte les tops même quand loop() est occupée.'),
    EQ('speed (turns/s) = Δticks / (CPR × Δt) &emsp; <i>v</i> = turns/s × π <i>D</i>', 'vitesse (tours/s) = Δtops / (CPR × Δt) &emsp; <i>v</i> = tours/s × π <i>D</i>'),
    CODE('el-motor.ino'),
    BOX('method', ['CPR: count it, do not guess it', 'CPR : comptez-le, ne le devinez pas'], P('CPR is the number of ticks per turn of the <em>wheel</em> = ticks of the encoder per motor turn × gear ratio (× 2 or 4 if both edges are counted). Turn the wheel exactly 10 times by hand and read the count: you get CPR to 0.1 %.', 'CPR est le nombre de tops par tour de <em>roue</em> = tops du codeur par tour de moteur × rapport du réducteur (× 2 ou 4 si on compte les deux fronts). Tournez la roue exactement 10 fois à la main et lisez le compte : vous obtenez CPR à 0,1 % près.'))
  ],
  terms: [['H-bridge, IN1 / IN2', 'pont en H, IN1 / IN2'], ['driver board', 'carte pilote'], ['brake, free wheel', 'frein, roue libre'], ['quadrature encoder', 'codeur en quadrature'], ['interrupt', 'interruption'], ['CPR (counts per revolution)', 'CPR (tops par tour)']],
  quiz: [
    ['Which switches make the motor turn backward?', 'Quels interrupteurs font tourner le moteur en arrière ?', 'S3 and S2: the current crosses the motor from right to left.', 'S3 et S2 : le courant traverse le moteur de droite à gauche.'],
    ['Why use an interrupt for the encoder?', 'Pourquoi utiliser une interruption pour le codeur ?', 'Ticks come fast and at any time; an interrupt counts each one at once, even during a delay or a print.', 'Les tops arrivent vite et à tout moment ; une interruption compte chacun tout de suite, même pendant un delay ou un affichage.'],
    ['How does the encoder give the direction?', 'Comment le codeur donne-t-il le sens ?', 'With the second signal B, shifted by a quarter period: its level at each rising edge of A says which way the shaft turns.', 'Avec le second signal B, décalé d\'un quart de période : son niveau à chaque front montant de A dit dans quel sens tourne l\'arbre.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Servos and stepper motors', 'Servomoteurs et moteurs pas à pas'],
  time: 25,
  goal: ['how a hobby servo is told an angle with the width of a pulse, how a stepper motor turns by exact steps, microstepping, and how to choose between a DC motor, a servo and a stepper.', 'comment on donne un angle à un servo de modélisme avec la largeur d\'une impulsion, comment un moteur pas à pas tourne par pas exacts, le micro-pas, et comment choisir entre moteur CC, servo et pas à pas.'],
  body: [
    ONE('A servo goes to an angle and holds it by itself; a stepper turns by exact steps without any sensor.', 'Un servo va à un angle et le tient tout seul ; un pas à pas tourne par pas exacts sans aucun capteur.'),
    H4('7.1 The servo', '7.1 Le servo'),
    FIGO(waves([{ label: '0°', hi: [[0, 1], [20, 21]], col: C.b, note: '1 ms' }, { label: '90°', hi: [[0, 1.5], [20, 21.5]], col: C.g, note: ['1.5 ms', '1,5 ms'] }, { label: '180°', hi: [[0, 2], [20, 22]], col: C.o, note: '2 ms' }], { tmax: 24, L: 110, axis: { ticks: [0, 5, 10, 15, 20], label: ['time (ms): one pulse every 20 ms', 'temps (ms) : une impulsion toutes les 20 ms'] } })),
    P('Inside a servo there is a DC motor, a gearbox, a potentiometer that measures the output angle, and a small board that does the control: it compares the angle asked by the pulse with the measured one and drives the motor until they match — the closed loop of lesson 8, already built in.', 'Dans un servo il y a un moteur CC, un réducteur, un potentiomètre qui mesure l\'angle de sortie, et une petite carte qui fait l\'asservissement : elle compare l\'angle demandé par l\'impulsion à l\'angle mesuré et pilote le moteur jusqu\'à ce qu\'ils soient égaux — la boucle fermée de la leçon 8, déjà intégrée.'),
    EQ('pulse (ms) = 1 + angle / 180 &emsp; (1 ms → 0°, 2 ms → 180°; many servos use 0.5–2.5 ms)', 'impulsion (ms) = 1 + angle / 180 &emsp; (1 ms → 0°, 2 ms → 180° ; beaucoup de servos utilisent 0,5–2,5 ms)'),
    H4('7.2 The stepper motor', '7.2 Le moteur pas à pas'),
    P('A stepper has several coils that the driver switches in turn: each pulse on STEP moves the shaft by one step, usually 1.8° (200 steps per turn). With <strong>microstepping</strong> (1/16 on an A4988) the driver doses the currents to make 3200 smaller steps per turn: smoother and quieter. It needs no encoder as long as it does not <strong>skip steps</strong> (too much load or too fast).', 'Un pas à pas a plusieurs bobines que le pilote alimente à tour de rôle : chaque impulsion sur STEP fait avancer l\'arbre d\'un pas, souvent 1,8° (200 pas par tour). Avec le <strong>micro-pas</strong> (1/16 sur un A4988) le pilote dose les courants pour faire 3200 pas plus petits par tour : plus doux et plus silencieux. Il n\'a besoin d\'aucun codeur tant qu\'il ne <strong>perd pas de pas</strong> (trop de charge ou trop vite).'),
    CODE('el-servo.ino'),
    TABLE([['', ''], ['DC motor + encoder', 'Moteur CC + codeur'], ['Servo', 'Servo'], ['Stepper', 'Pas à pas']], [
      [['best for', 'idéal pour'], ['wheels, fast continuous turning', 'roues, rotation continue rapide'], ['a joint of a small arm, a steering', 'une articulation de petit bras, une direction'], ['3D printers, axes of a gantry, slow precise moves', 'imprimantes 3D, axes de portique, mouvements lents et précis']],
      [['position', 'position'], ['by the encoder and your control loop', 'par le codeur et votre boucle'], ['built-in, about 1°', 'intégrée, environ 1°'], ['counted steps, open loop', 'pas comptés, en boucle ouverte']],
      [['weak point', 'point faible'], ['needs a controller', 'demande un asservissement'], ['limited range (often 180°), small torque', 'course limitée (souvent 180°), petit couple'], ['skips steps if overloaded, draws current even at rest', 'perd des pas si surchargé, consomme même à l\'arrêt']]
    ]),
    BOX('warn', ['Power the servos separately', 'Alimentez les servos à part'], P('A servo that is blocked can take 1 to 2 A. Several servos on the 5 V pin of the Arduino make it reset: give them their own 5–6 V supply, with the ground common to the Arduino.', 'Un servo bloqué peut prendre 1 à 2 A. Plusieurs servos sur la broche 5 V de l\'Arduino le font redémarrer : donnez-leur leur propre alimentation 5–6 V, avec la masse commune à l\'Arduino.'))
  ],
  terms: [['servo, pulse width', 'servo, largeur d\'impulsion'], ['stepper motor, step angle', 'moteur pas à pas, angle de pas'], ['microstepping', 'micro-pas'], ['skipped steps', 'pas perdus'], ['STEP / DIR driver', 'pilote STEP / DIR']],
  quiz: [
    ['Which pulse width puts a servo in the middle?', 'Quelle largeur d\'impulsion met un servo au milieu ?', '1.5 ms (90°).', '1,5 ms (90°).'],
    ['How many full steps make one turn of a 1.8° stepper?', 'Combien de pas entiers font un tour d\'un pas à pas de 1,8° ?', '360 / 1.8 = 200.', '360 / 1,8 = 200.'],
    ['Which motor for the wheels of a mobile robot that must know its distance?', 'Quel moteur pour les roues d\'un robot mobile qui doit connaître sa distance ?', 'A DC motor with a gearbox and an encoder.', 'Un moteur CC avec réducteur et codeur.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['A first robot: sense, decide, act', 'Un premier robot : percevoir, décider, agir'],
  time: 35,
  goal: ['how to put everything together in a small two-wheeled robot that keeps a distance to a wall: the wiring, a loop with a fixed period, a proportional controller with saturation and a dead band, and how to test it safely.', 'comment tout assembler dans un petit robot à deux roues qui garde une distance à un mur : le câblage, une boucle à période fixe, un correcteur proportionnel avec saturation et zone morte, et comment le tester en sécurité.'],
  body: [
    ONE('Read the distance, compute the error, command the wheels, twenty times per second: that is a robot.', 'Lire la distance, calculer l\'erreur, commander les roues, vingt fois par seconde : c\'est un robot.'),
    H4('8.1 The loop', '8.1 La boucle'),
    FIGO(chain([[['Sonar', 'Sonar'], C.y], [['Arduino: P', 'Arduino : P'], C.b], [['H-bridge', 'Pont en H'], C.p], [['Motors', 'Moteurs'], C.g], [['Robot moves', 'Le robot bouge'], C.o]], { fb: [0, ['new distance, 50 ms later', 'nouvelle distance, 50 ms plus tard']] })),
    TABLE([['Part', 'Pièce'], ['Pins', 'Broches'], ['Lesson', 'Leçon']], [
      [['HC-SR04', 'HC-SR04'], 'TRIG 9, ECHO 10', '4'],
      [['TB6612 driver, left wheel', 'pilote TB6612, roue gauche'], 'PWMA 5, AIN1 7, AIN2 8', '6'],
      [['TB6612 driver, right wheel', 'pilote TB6612, roue droite'], 'PWMB 6, BIN1 11, BIN2 12', '6'],
      [['2S battery → buck 5 V → Arduino; battery → VM of the driver', 'batterie 2S → abaisseur 5 V → Arduino ; batterie → VM du pilote'], ['all GND together', 'toutes les GND ensemble'], '2']
    ]),
    H4('8.2 The proportional controller', '8.2 Le correcteur proportionnel'),
    EQ('<i>e</i> = <i>d</i> − 20 cm &emsp; <i>u</i> = <i>K</i><sub>p</sub> <i>e</i>, limited to ±200 &emsp; <i>u</i> = 0 if |<i>e</i>| &lt; 1 cm', '<i>e</i> = <i>d</i> − 20 cm &emsp; <i>u</i> = <i>K</i><sub>p</sub> <i>e</i>, limité à ±200 &emsp; <i>u</i> = 0 si |<i>e</i>| &lt; 1 cm'),
    FIGO(plot({ x: [0, 40], y: [-250, 250], ticks: [8, 4], curves: [{ f: (d) => Math.abs(d - 20) < 1 ? 0 : Math.max(-200, Math.min(200, 12 * (d - 20))), label: ['command u (PWM) for Kp = 12', 'commande u (PWM) pour Kp = 12'] }], xl: ['distance d (cm)', 'distance d (cm)'], marks: [[20, 0, ['target 20 cm', 'consigne 20 cm'], C.g], [30, 120, ['d = 30 → u = 120', 'd = 30 → u = 120']]] })),
    UL([
      ['Too far (e &gt; 0): the robot goes forward; too close (e &lt; 0): it goes back; the bigger the error, the faster.', 'Trop loin (e &gt; 0) : le robot avance ; trop près (e &lt; 0) : il recule ; plus l\'erreur est grande, plus il va vite.'],
      ['The <strong>saturation</strong> at ±200 keeps the speed reasonable and the PWM inside 0…255.', 'La <strong>saturation</strong> à ±200 garde une vitesse raisonnable et la PWM dans 0…255.'],
      ['The <strong>dead band</strong> of ±1 cm stops the robot from buzzing back and forth around the target because of sensor noise.', 'La <strong>zone morte</strong> de ±1 cm évite que le robot vibre d\'avant en arrière autour de la consigne à cause du bruit du capteur.'],
      ['<code>millis()</code> gives a fixed period of 50 ms without <code>delay()</code>, so the loop could do other things in between.', '<code>millis()</code> donne une période fixe de 50 ms sans <code>delay()</code>, la boucle pourrait donc faire autre chose entre-temps.']
    ]),
    CODE('el-robot.ino'),
    BOX('method', ['Test it step by step', 'Testez pas à pas'], OL([
      ['Wheels in the air: print d and u, move your hand in front of the sensor, check the signs.', 'Roues en l\'air : affichez d et u, bougez la main devant le capteur, vérifiez les signes.'],
      ['One wheel at a time: u = 100 must turn it forward; if not, swap AIN1 and AIN2 in the code (or the motor wires).', 'Une roue à la fois : u = 100 doit la faire tourner en avant ; sinon, inversez AIN1 et AIN2 dans le code (ou les fils du moteur).'],
      ['On the floor with a small Kp (4), then increase it until the robot oscillates, and take half of that value.', 'Au sol avec un petit Kp (4), puis augmentez-le jusqu\'à ce que le robot oscille, et prenez la moitié de cette valeur.'],
      ['Keep a hand near the switch: a sign error makes the robot run into the wall.', 'Gardez une main près de l\'interrupteur : une erreur de signe envoie le robot dans le mur.']
    ])),
    BOX('note', ['Where to go next', 'Pour aller plus loin'], P('Add the encoders of lesson 6 and a PI loop on each wheel speed (control course), a line sensor or a second sonar to follow a wall, then move the “brain” to a Raspberry Pi with ROS 2 while the Arduino keeps the fast motor loops.', 'Ajoutez les codeurs de la leçon 6 et une boucle PI sur la vitesse de chaque roue (cours de commande), un capteur de ligne ou un second sonar pour suivre un mur, puis déplacez le « cerveau » sur un Raspberry Pi avec ROS 2 pendant que l\'Arduino garde les boucles rapides des moteurs.'))
  ],
  terms: [['closed loop', 'boucle fermée'], ['error, target', 'erreur, consigne'], ['saturation', 'saturation'], ['dead band', 'zone morte'], ['fixed period, millis()', 'période fixe, millis()']],
  quiz: [
    ['What does the robot do at d = 15 cm?', 'Que fait le robot à d = 15 cm ?', 'e = −5, u = 12 × (−5) = −60: it backs up slowly.', 'e = −5, u = 12 × (−5) = −60 : il recule lentement.'],
    ['Why a dead band?', 'Pourquoi une zone morte ?', 'So that the noise of the sensor (±0.5 cm) does not make the wheels go back and forth around the target.', 'Pour que le bruit du capteur (±0,5 cm) ne fasse pas aller les roues d\'avant en arrière autour de la consigne.'],
    ['What does the code do when no echo comes back?', 'Que fait le code quand aucun écho ne revient ?', 'distance_cm() returns 400 cm (far away): the robot goes forward at the limited speed of 200 instead of reading 0 and backing up.', 'distance_cm() renvoie 400 cm (loin) : le robot avance à la vitesse limitée de 200 au lieu de lire 0 et de reculer.']
  ]
})
  ];
}
