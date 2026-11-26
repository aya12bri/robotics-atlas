// Electronics and Arduino — the exercises of each lesson, with detailed solutions (rule used, where it is, steps, answer).
import { EXREG, SX } from '../lib.mjs';
const W = (n, en, fr) => [`lesson ${n} — ${en}`, `leçon ${n} — ${fr}`];

// built when the course is built (after the dictionary is reset), so that every text of the solutions is translated
export function loadEx() {
EXREG['el-1'] = [
  { lv: 1, q: ['A red LED (2 V) must take 15 mA from a 5 V pin. Which resistor (in Ω)?', 'Une LED rouge (2 V) doit prendre 15 mA sur une broche 5 V. Quelle résistance (en Ω) ?'],
    num: { ans: 200, tol: 2, unit: 'Ω' }, sol: ['200 Ω (take 220 Ω)', '200 Ω (prenez 220 Ω)'],
    sx: SX({ rule: ['R = (U supply − U LED) / I', 'R = (U alim − U LED) / I'], where: W(1, '1.2 The resistor of an LED', '1.2 La résistance d\'une LED'),
      steps: [['Voltage left for the resistor: 5 − 2 = 3 V.', 'Tension qui reste pour la résistance : 5 − 2 = 3 V.'], ['Current in amperes: 15 mA = 0.015 A.', 'Courant en ampères : 15 mA = 0,015 A.'], ['R = 3 / 0.015 = 200 Ω. The next standard value is 220 Ω (a little less current: 13.6 mA).', 'R = 3 / 0,015 = 200 Ω. La valeur normalisée suivante est 220 Ω (un peu moins de courant : 13,6 mA).']],
      ans: ['<b>200 Ω</b> → 220 Ω in practice', '<b>200 Ω</b> → 220 Ω en pratique'] }) },
  { lv: 2, q: ['What power (in W) does the 220 Ω resistor burn with 13.6 mA? Is a 0.25 W resistor enough?', 'Quelle puissance (en W) dissipe la résistance de 220 Ω avec 13,6 mA ? Une résistance de 0,25 W suffit-elle ?'],
    num: { ans: 0.041, tol: 0.002, unit: 'W' }, sol: ['0.041 W: yes', '0,041 W : oui'],
    sx: SX({ rule: ['P = R I²', 'P = R I²'], where: W(1, '1.1 Three quantities (the formulas under the table)', '1.1 Trois grandeurs (les formules sous le tableau)'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [['I', '0.0136 A'], ['I²', '0.000185 A²'], ['R I² = 220 × 0.000185', '<b>0.041 W</b>']] },
      ans: ['<b>0.041 W</b>: six times less than 0.25 W, so it is enough', '<b>0,041 W</b> : six fois moins que 0,25 W, elle suffit donc'] }) },
  { lv: 2, q: ['A full 2S battery (8.4 V) goes through a divider R1 = R2 = 10 kΩ to A0. What voltage does A0 get (in V)?', 'Une batterie 2S pleine (8,4 V) passe par un pont R1 = R2 = 10 kΩ vers A0. Quelle tension reçoit A0 (en V) ?'],
    num: { ans: 4.2, tol: 0.02, unit: 'V' }, sol: ['4.2 V', '4,2 V'],
    sx: SX({ rule: ['voltage divider: Vout = Vin × R2 / (R1 + R2)', 'pont diviseur : Vout = Vin × R2 / (R1 + R2)'], where: W(1, '1.3 The voltage divider', '1.3 Le pont diviseur'),
      steps: [['R2 / (R1 + R2) = 10 / 20 = 0.5.', 'R2 / (R1 + R2) = 10 / 20 = 0,5.'], ['Vout = 8.4 × 0.5 = 4.2 V.', 'Vout = 8,4 × 0,5 = 4,2 V.'], ['Check: 4.2 V &lt; 5 V, the input is safe. In the program: Vbattery = 2 × Vmeasured.', 'Vérification : 4,2 V &lt; 5 V, l\'entrée ne risque rien. Dans le programme : Vbatterie = 2 × Vmesurée.']],
      ans: ['<b>4.2 V</b>', '<b>4,2 V</b>'] }) }
];

EXREG['el-2'] = [
  { lv: 1, q: ['A robot takes 1.1 A on average from a 2200 mAh battery. How long does it run (in h)?', 'Un robot prend 1,1 A en moyenne sur une batterie de 2200 mAh. Combien de temps tourne-t-il (en h) ?'],
    num: { ans: 2, tol: 0.02, unit: 'h' }, sol: ['2 h', '2 h'],
    sx: SX({ rule: ['autonomy ≈ capacity / average current, with the capacity in Ah', 'autonomie ≈ capacité / courant moyen, avec la capacité en Ah'], where: W(2, '2.1 Batteries', '2.1 Les batteries'),
      steps: [['2200 mAh = 2.2 Ah.', '2200 mAh = 2,2 Ah.'], ['2.2 / 1.1 = 2 h.', '2,2 / 1,1 = 2 h.'], ['In practice, keep 20 % in the LiPo (never empty it): about 1 h 35.', 'En pratique, gardez 20 % dans la LiPo (ne la videz jamais) : environ 1 h 35.']],
      ans: ['<b>2 h</b> (≈ 1 h 35 usable)', '<b>2 h</b> (≈ 1 h 35 utilisables)'] }) },
  { lv: 2, q: ['A linear regulator makes 5 V from 7.4 V for 0.5 A. How much power does it turn into heat (in W)?', 'Un régulateur linéaire fait 5 V à partir de 7,4 V pour 0,5 A. Quelle puissance transforme-t-il en chaleur (en W) ?'],
    num: { ans: 1.2, tol: 0.02, unit: 'W' }, sol: ['1.2 W', '1,2 W'],
    sx: SX({ rule: ['lost power of a linear regulator = (Vin − Vout) × I', 'puissance perdue d\'un régulateur linéaire = (Vin − Vout) × I'], where: W(2, '2.3 Linear regulator or buck converter? (table)', '2.3 Régulateur linéaire ou abaisseur ? (tableau)'),
      table: { head: [['', ''], ['Value', 'Valeur']], rows: [['Vin − Vout', '2.4 V'], ['× I', '0.5 A'], [['lost power', 'puissance perdue'], '<b>1.2 W</b>'], [['useful power (5 × 0.5)', 'puissance utile (5 × 0,5)'], '2.5 W']] },
      ans: ['<b>1.2 W</b>: one third of the battery power is lost; a buck converter would lose about 0.3 W', '<b>1,2 W</b> : un tiers de la puissance de la batterie est perdu ; un abaisseur perdrait environ 0,3 W'] }) },
  { lv: 1, q: ['What is the voltage of a full 2S LiPo (in V)?', 'Quelle est la tension d\'une LiPo 2S pleine (en V) ?'],
    num: { ans: 8.4, tol: 0.02, unit: 'V' }, sol: ['8.4 V', '8,4 V'],
    sx: SX({ rule: ['cells in series add their voltages; a full LiPo cell = 4.2 V', 'des éléments en série additionnent leurs tensions ; un élément LiPo plein = 4,2 V'], where: W(2, '2.1 Batteries (table)', '2.1 Les batteries (tableau)'),
      steps: [['2S = 2 cells in series.', '2S = 2 éléments en série.'], ['2 × 4.2 = 8.4 V (7.4 V nominal, 6.6 V empty).', '2 × 4,2 = 8,4 V (7,4 V nominal, 6,6 V vide).']],
      ans: ['<b>8.4 V</b>', '<b>8,4 V</b>'] }) }
];

EXREG['el-3'] = [
  { lv: 1, q: ['With the blink program, how many times does the LED turn on in 10 s?', 'Avec le programme blink, combien de fois la LED s\'allume-t-elle en 10 s ?'],
    num: { ans: 10, tol: 0 }, sol: ['10', '10'],
    sx: SX({ rule: ['loop() runs again and again; one turn of loop() = 500 ms on + 500 ms off', 'loop() s\'exécute encore et encore ; un tour de loop() = 500 ms allumée + 500 ms éteinte'], where: W(3, '3.2 The first program', '3.2 Le premier programme'),
      steps: [['One turn of loop() lasts 500 + 500 = 1000 ms = 1 s.', 'Un tour de loop() dure 500 + 500 = 1000 ms = 1 s.'], ['The LED turns on once per turn: 10 s / 1 s = 10 times.', 'La LED s\'allume une fois par tour : 10 s / 1 s = 10 fois.']],
      ans: ['<b>10</b> (1 Hz)', '<b>10</b> (1 Hz)'] }) },
  { lv: 2, q: ['Which pin can give a PWM signal on an Arduino Uno?', 'Quelle broche peut donner un signal PWM sur un Arduino Uno ?'],
    mcq: [['pin 2', 'broche 2'], ['pin 9', 'broche 9', 1], ['pin 13', 'broche 13'], ['A0', 'A0']],
    sol: ['pin 9', 'broche 9'],
    sx: SX({ rule: ['the PWM pins of the Uno are 3, 5, 6, 9, 10, 11 (marked ~)', 'les broches PWM de l\'Uno sont 3, 5, 6, 9, 10, 11 (marquées ~)'], where: W(3, '3.1 The board (table)', '3.1 La carte (tableau)'),
      steps: [['2 is an interrupt pin, 13 a plain digital pin, A0 an analog input.', '2 est une broche d\'interruption, 13 une broche numérique simple, A0 une entrée analogique.'], ['Only 9 is in the list 3, 5, 6, 9, 10, 11.', 'Seule 9 est dans la liste 3, 5, 6, 9, 10, 11.']],
      ans: ['<b>pin 9</b> (B)', '<b>broche 9</b> (B)'] }) }
];

EXREG['el-4'] = [
  { lv: 1, q: ['analogRead(A0) returns 512. What is the voltage on A0 (in V)?', 'analogRead(A0) renvoie 512. Quelle est la tension sur A0 (en V) ?'],
    num: { ans: 2.5, tol: 0.01, unit: 'V' }, sol: ['2.50 V', '2,50 V'],
    sx: SX({ rule: ['V = n × 5 / 1023 (10 bits: 0 … 1023 for 0 … 5 V)', 'V = n × 5 / 1023 (10 bits : 0 … 1023 pour 0 … 5 V)'], where: W(4, '4.2 An analog voltage', '4.2 Une tension analogique'),
      steps: [['512 × 5 = 2560.', '512 × 5 = 2560.'], ['2560 / 1023 = 2.50 V: about half of 5 V.', '2560 / 1023 = 2,50 V : à peu près la moitié de 5 V.']],
      ans: ['<b>2.50 V</b>', '<b>2,50 V</b>'] }) },
  { lv: 2, q: ['The echo of an HC-SR04 lasts 1166 µs. How far is the obstacle (in cm)?', 'L\'écho d\'un HC-SR04 dure 1166 µs. À quelle distance est l\'obstacle (en cm) ?'],
    num: { ans: 20, tol: 0.1, unit: 'cm' }, hint: ['The sound goes there and back.', 'Le son fait l\'aller et le retour.'], sol: ['20.0 cm', '20,0 cm'],
    sx: SX({ rule: ['d = t × 0.0343 / 2 (sound at 0.0343 cm/µs, there and back)', 'd = t × 0,0343 / 2 (son à 0,0343 cm/µs, aller et retour)'], where: W(4, '4.3 Measuring a distance with sound', '4.3 Mesurer une distance avec le son'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [[['distance travelled: 1166 × 0.0343', 'distance parcourue : 1166 × 0,0343'], '40.0 cm'], [['divided by 2', 'divisé par 2'], '<b>20.0 cm</b>']] },
      ans: ['<b>20.0 cm</b>', '<b>20,0 cm</b>'] }) },
  { lv: 1, q: ['A button is wired to pin 2 and GND, with <code>INPUT_PULLUP</code>. What does digitalRead(2) give when you press it?', 'Un bouton est câblé entre la broche 2 et GND, avec <code>INPUT_PULLUP</code>. Que donne digitalRead(2) quand on appuie ?'],
    mcq: [['HIGH', 'HIGH'], ['LOW', 'LOW', 1], ['a random value', 'une valeur au hasard'], ['1023', '1023']],
    sol: ['LOW', 'LOW'],
    sx: SX({ rule: ['with a pull-up the logic is inverted: released = HIGH, pressed = LOW', 'avec un tirage la logique est inversée : relâché = HIGH, appuyé = LOW'], where: W(4, '4.1 A button and its pull-up resistor', '4.1 Un bouton et sa résistance de tirage'),
      steps: [['Released: the resistor holds the pin at 5 V → HIGH.', 'Relâché : la résistance maintient la broche à 5 V → HIGH.'], ['Pressed: the button connects the pin to GND (0 V) → LOW.', 'Appuyé : le bouton relie la broche à GND (0 V) → LOW.']],
      ans: ['<b>LOW</b> (B)', '<b>LOW</b> (B)'] }) }
];

EXREG['el-5'] = [
  { lv: 1, q: ['analogWrite(pin, 64): what is the duty cycle (in %)?', 'analogWrite(broche, 64) : quel est le rapport cyclique (en %) ?'],
    num: { ans: 25.1, tol: 0.3, unit: '%' }, sol: ['25 %', '25 %'],
    sx: SX({ rule: ['duty = value / 255', 'rapport cyclique = valeur / 255'], where: W(5, '5.1 The duty cycle', '5.1 Le rapport cyclique'),
      steps: [['64 / 255 = 0.251.', '64 / 255 = 0,251.'], ['× 100 = 25.1 %: the pin is HIGH a quarter of the time (first line of the figure).', '× 100 = 25,1 % : la broche est à HIGH un quart du temps (première ligne de la figure).']],
      ans: ['<b>≈ 25 %</b>', '<b>≈ 25 %</b>'] }) },
  { lv: 2, q: ['A motor on 7.4 V is driven with analogWrite 128. What average voltage does it see (in V)?', 'Un moteur sous 7,4 V est commandé avec analogWrite 128. Quelle tension moyenne voit-il (en V) ?'],
    num: { ans: 3.71, tol: 0.03, unit: 'V' }, sol: ['3.7 V', '3,7 V'],
    sx: SX({ rule: ['U average = duty × U supply', 'U moyenne = rapport cyclique × U alim'], where: W(5, '5.1 The duty cycle (formula under the figure)', '5.1 Le rapport cyclique (formule sous la figure)'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [[['duty 128 / 255', 'rapport 128 / 255'], '0.502'], [['× 7.4 V', '× 7,4 V'], '<b>3.71 V</b>']] },
      ans: ['<b>≈ 3.7 V</b>: the motor turns at about half speed', '<b>≈ 3,7 V</b> : le moteur tourne à peu près à mi-vitesse'] }) },
  { lv: 2, q: ['Why is a diode placed across a motor driven by a MOSFET?', 'Pourquoi place-t-on une diode en parallèle sur un moteur commandé par un MOSFET ?'],
    mcq: [['To make the motor turn faster', 'Pour faire tourner le moteur plus vite'], ['To protect the MOSFET from the voltage spike of the coil when it switches off', 'Pour protéger le MOSFET du pic de tension de la bobine quand il se coupe', 1], ['To choose the direction of rotation', 'Pour choisir le sens de rotation'], ['To light up when the motor turns', 'Pour s\'allumer quand le moteur tourne']],
    sol: ['To protect the MOSFET', 'Pour protéger le MOSFET'],
    sx: SX({ rule: ['a coil opposes any sudden change of its current; the flyback diode gives that current a path', 'une bobine s\'oppose à tout changement brusque de son courant ; la diode de roue libre donne un chemin à ce courant'], where: W(5, '5.2 A transistor as a switch (third point)', '5.2 Un transistor comme interrupteur (troisième point)'),
      steps: [['When the MOSFET opens, the motor current cannot stop at once.', 'Quand le MOSFET s\'ouvre, le courant du moteur ne peut pas s\'arrêter d\'un coup.'], ['Without a path, the voltage climbs until something breaks: the MOSFET.', 'Sans chemin, la tension monte jusqu\'à ce que quelque chose casse : le MOSFET.'], ['The diode lets the current go round through the motor and die out.', 'La diode laisse le courant tourner dans le moteur et s\'éteindre.']],
      ans: ['<b>B</b>', '<b>B</b>'] }) }
];

EXREG['el-6'] = [
  { lv: 1, q: ['On the H-bridge, S1 and S4 make the motor turn forward. Which switches make it turn backward?', 'Sur le pont en H, S1 et S4 font tourner le moteur en avant. Quels interrupteurs le font tourner en arrière ?'],
    mcq: [['S1 and S2', 'S1 et S2'], ['S3 and S4', 'S3 et S4'], ['S3 and S2', 'S3 et S2', 1], ['S1 and S3', 'S1 et S3']],
    sol: ['S3 and S2', 'S3 et S2'],
    sx: SX({ rule: ['to reverse the motor, reverse the current: close the other diagonal', 'pour inverser le moteur, on inverse le courant : on ferme l\'autre diagonale'], where: W(6, '6.1 The H-bridge (both figures)', '6.1 Le pont en H (les deux figures)'),
      steps: [['S1 and S2 (or S3 and S4) on the same side: a short circuit of the battery — never.', 'S1 et S2 (ou S3 et S4) du même côté : court-circuit de la batterie — jamais.'], ['S1 and S3: both ends of the motor at + 7.4 V, no current.', 'S1 et S3 : les deux bouts du moteur à + 7,4 V, aucun courant.'], ['S3 and S2: the current enters on the right and leaves on the left: backward.', 'S3 et S2 : le courant entre à droite et sort à gauche : arrière.']],
      ans: ['<b>S3 and S2</b> (C)', '<b>S3 et S2</b> (C)'] }) },
  { lv: 2, q: ['An encoder with CPR = 360 counts 90 ticks in 0.1 s. What is the speed of the wheel (in turns per minute)?', 'Un codeur avec CPR = 360 compte 90 tops en 0,1 s. Quelle est la vitesse de la roue (en tours par minute) ?'],
    num: { ans: 150, tol: 1, unit: 'rpm' }, sol: ['150 rpm', '150 tr/min'],
    sx: SX({ rule: ['turns/s = Δticks / (CPR × Δt)', 'tours/s = Δtops / (CPR × Δt)'], where: W(6, '6.2 The encoder (formula)', '6.2 Le codeur (formule)'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [[['turns in 0.1 s: 90 / 360', 'tours en 0,1 s : 90 / 360'], '0.25'], [['turns per second: 0.25 / 0.1', 'tours par seconde : 0,25 / 0,1'], '2.5'], [['turns per minute: 2.5 × 60', 'tours par minute : 2,5 × 60'], '<b>150</b>']] },
      ans: ['<b>150 turns/min</b>', '<b>150 tr/min</b>'] }) },
  { lv: 2, q: ['The same wheel has a diameter of 65 mm. What is the speed of the robot (in m/s)?', 'La même roue a un diamètre de 65 mm. Quelle est la vitesse du robot (en m/s) ?'],
    num: { ans: 0.51, tol: 0.01, unit: 'm/s' }, sol: ['0.51 m/s', '0,51 m/s'],
    sx: SX({ rule: ['v = turns/s × π D (one turn moves the robot by the perimeter of the wheel)', 'v = tours/s × π D (un tour fait avancer le robot du périmètre de la roue)'], where: W(6, '6.2 The encoder (formula)', '6.2 Le codeur (formule)'),
      steps: [['Perimeter: π × 0.065 = 0.204 m.', 'Périmètre : π × 0,065 = 0,204 m.'], ['v = 2.5 × 0.204 = 0.51 m/s.', 'v = 2,5 × 0,204 = 0,51 m/s.']],
      ans: ['<b>0.51 m/s</b>', '<b>0,51 m/s</b>'] }) }
];

EXREG['el-7'] = [
  { lv: 1, q: ['Which pulse width (in ms) puts a 1–2 ms servo at 45°?', 'Quelle largeur d\'impulsion (en ms) met un servo 1–2 ms à 45° ?'],
    num: { ans: 1.25, tol: 0.01, unit: 'ms' }, sol: ['1.25 ms', '1,25 ms'],
    sx: SX({ rule: ['pulse (ms) = 1 + angle / 180', 'impulsion (ms) = 1 + angle / 180'], where: W(7, '7.1 The servo (formula)', '7.1 Le servo (formule)'),
      steps: [['45 / 180 = 0.25.', '45 / 180 = 0,25.'], ['1 + 0.25 = 1.25 ms: between the 1 ms of 0° and the 1.5 ms of 90° in the figure.', '1 + 0,25 = 1,25 ms : entre le 1 ms de 0° et le 1,5 ms de 90° de la figure.']],
      ans: ['<b>1.25 ms</b>', '<b>1,25 ms</b>'] }) },
  { lv: 2, q: ['A 1.8° stepper must turn by 90°. How many full steps?', 'Un pas à pas de 1,8° doit tourner de 90°. Combien de pas entiers ?'],
    num: { ans: 50, tol: 0 }, sol: ['50', '50'],
    sx: SX({ rule: ['number of steps = angle / step angle', 'nombre de pas = angle / angle de pas'], where: W(7, '7.2 The stepper motor', '7.2 Le moteur pas à pas'),
      table: { head: [['Mode', 'Mode'], ['Step angle', 'Angle de pas'], ['Steps for 90°', 'Pas pour 90°'], ['Steps per turn', 'Pas par tour']], rows: [[['full step', 'pas entier'], '1.8°', '<b>50</b>', '200'], [['1/16 microstep', 'micro-pas 1/16'], '0.1125°', '800', '3200']] },
      ans: ['<b>50 steps</b>', '<b>50 pas</b>'] }) }
];

EXREG['el-8'] = [
  { lv: 1, q: ['The robot reads d = 30 cm (target 20 cm, Kp = 12). What command u does it send?', 'Le robot lit d = 30 cm (consigne 20 cm, Kp = 12). Quelle commande u envoie-t-il ?'],
    num: { ans: 120, tol: 0 }, sol: ['120', '120'],
    sx: SX({ rule: ['e = d − target, u = Kp e, limited to ±200', 'e = d − consigne, u = Kp e, limité à ±200'], where: W(8, '8.2 The proportional controller', '8.2 Le correcteur proportionnel'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [['e = 30 − 20', '10 cm'], ['u = 12 × 10', '120'], [['|u| ≤ 200?', '|u| ≤ 200 ?'], ['yes: no saturation', 'oui : pas de saturation']]] },
      ans: ['<b>u = 120</b>: forward at about half speed (120 / 255)', '<b>u = 120</b> : en avant à peu près à mi-vitesse (120 / 255)'] }) },
  { lv: 2, q: ['Same robot, d = 50 cm. What command u does it send?', 'Même robot, d = 50 cm. Quelle commande u envoie-t-il ?'],
    num: { ans: 200, tol: 0 }, hint: ['Do not forget the limit.', 'N\'oubliez pas la limite.'], sol: ['200', '200'],
    sx: SX({ rule: ['saturation: u is limited to ±200 (constrain)', 'saturation : u est limité à ±200 (constrain)'], where: W(8, '8.2 The proportional controller (figure and list)', '8.2 Le correcteur proportionnel (figure et liste)'),
      steps: [['e = 50 − 20 = 30 cm.', 'e = 50 − 20 = 30 cm.'], ['Kp e = 12 × 30 = 360.', 'Kp e = 12 × 30 = 360.'], ['360 &gt; 200, so constrain gives 200: the flat part of the curve.', '360 &gt; 200, donc constrain donne 200 : la partie plate de la courbe.']],
      ans: ['<b>u = 200</b>', '<b>u = 200</b>'] }) },
  { lv: 1, q: ['The loop runs every 50 ms. How many times per second does the robot read its sensor?', 'La boucle tourne toutes les 50 ms. Combien de fois par seconde le robot lit-il son capteur ?'],
    num: { ans: 20, tol: 0, unit: 'Hz' }, sol: ['20', '20'],
    sx: SX({ rule: ['frequency = 1 / period', 'fréquence = 1 / période'], where: W(8, '8.1 The loop', '8.1 La boucle'),
      steps: [['Period = 50 ms = 0.05 s.', 'Période = 50 ms = 0,05 s.'], ['1 / 0.05 = 20 Hz.', '1 / 0,05 = 20 Hz.'], ['Check: the echo can last up to 30 ms (timeout), so 50 ms leaves enough time.', 'Vérification : l\'écho peut durer jusqu\'à 30 ms (délai), 50 ms laisse donc assez de temps.']],
      ans: ['<b>20 times</b> (20 Hz)', '<b>20 fois</b> (20 Hz)'] }) }
];
}
