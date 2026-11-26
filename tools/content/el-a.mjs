// Electronics and Arduino — lessons 1 to 4: Ohm and power, batteries and regulators, the Arduino and blink, sensors.
import { P, H4, UL, OL, EQ, BOX, TABLE, CODE, lesson } from '../lib.mjs';
import { ledLoop, divider, powerTree, blinkWiring, pullup } from './el-figs.mjs';
const PRE = 'el-';
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));
const FIGO = (o) => `<figure class="figure"><svg viewBox="${o.vb}" class="fig" role="img" aria-hidden="true">${o.svg}</svg></figure>`;

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Voltage, current, resistance and power', 'Tension, courant, résistance et puissance'],
  time: 25,
  goal: ['what a voltage, a current and a resistance are, Ohm\'s law U = R I, the power P = U I, how to choose the resistor of an LED, and the voltage divider used to measure a battery.', 'ce que sont une tension, un courant et une résistance, la loi d\'Ohm U = R I, la puissance P = U I, comment choisir la résistance d\'une LED, et le pont diviseur qui sert à mesurer une batterie.'],
  body: [
    ONE('The voltage pushes, the resistance brakes, and the current is what flows: U = R × I.', 'La tension pousse, la résistance freine, et le courant est ce qui circule : U = R × I.'),
    H4('1.1 Three quantities', '1.1 Trois grandeurs'),
    TABLE([['Quantity', 'Grandeur'], ['Symbol, unit', 'Symbole, unité'], ['Picture with water', 'Image avec de l\'eau'], ['In a robot', 'Dans un robot']], [
      [['voltage', 'tension'], ['U, volt (V)', 'U, volt (V)'], ['the pressure', 'la pression'], ['battery 7.4 V, logic 5 V or 3.3 V', 'batterie 7,4 V, logique 5 V ou 3,3 V']],
      [['current', 'courant'], ['I, ampere (A)', 'I, ampère (A)'], ['the flow', 'le débit'], ['an LED 15 mA, a motor 1 A, a servo blocked 2 A', 'une LED 15 mA, un moteur 1 A, un servo bloqué 2 A']],
      [['resistance', 'résistance'], ['R, ohm (Ω)', 'R, ohm (Ω)'], ['a narrow pipe', 'un tuyau étroit'], ['220 Ω for an LED, 10 kΩ for a button', '220 Ω pour une LED, 10 kΩ pour un bouton']],
      [['power', 'puissance'], ['P, watt (W)', 'P, watt (W)'], ['the work done per second', 'le travail fait par seconde'], ['what heats a resistor, what a motor gives', 'ce qui chauffe une résistance, ce que donne un moteur']]
    ]),
    EQ('<i>U</i> = <i>R</i> <i>I</i> &emsp; <i>P</i> = <i>U</i> <i>I</i> = <i>R</i> <i>I</i>²'),
    H4('1.2 The resistor of an LED', '1.2 La résistance d\'une LED'),
    FIGO(ledLoop()),
    P('An LED always takes about the same voltage (≈ 2 V for red, ≈ 3 V for blue or white) whatever the current, so it cannot limit its own current: without a resistor it burns. The resistor takes the rest of the voltage, and Ohm\'s law gives its value:', 'Une LED prend toujours à peu près la même tension (≈ 2 V pour une rouge, ≈ 3 V pour une bleue ou blanche) quel que soit le courant, elle ne peut donc pas limiter son propre courant : sans résistance elle grille. La résistance prend le reste de la tension, et la loi d\'Ohm donne sa valeur :'),
    EQ('<i>R</i> = (<i>U</i><sub>supply</sub> − <i>U</i><sub>LED</sub>) / <i>I</i> = (5 − 2) / 0.015 = 200 Ω → 220 Ω (the next standard value)', '<i>R</i> = (<i>U</i><sub>alim</sub> − <i>U</i><sub>LED</sub>) / <i>I</i> = (5 − 2) / 0,015 = 200 Ω → 220 Ω (la valeur normalisée suivante)'),
    H4('1.3 The voltage divider', '1.3 Le pont diviseur'),
    FIGO(divider()),
    P('Two resistors in series share the voltage in proportion to their values. With R1 = R2 = 10 kΩ, a 2S battery full at 8.4 V gives 4.2 V: below the 5 V that an Arduino input accepts, so the robot can watch its battery on A0.', 'Deux résistances en série se partagent la tension en proportion de leurs valeurs. Avec R1 = R2 = 10 kΩ, une batterie 2S pleine à 8,4 V donne 4,2 V : en dessous des 5 V qu\'accepte une entrée Arduino, le robot peut donc surveiller sa batterie sur A0.'),
    BOX('warn', ['Safety first', 'La sécurité d\'abord'], UL([
      ['Never connect + to − directly (a short circuit): a LiPo can then give 50 A and catch fire.', 'Ne reliez jamais le + au − directement (un court-circuit) : une LiPo peut alors donner 50 A et prendre feu.'],
      ['Wire with the power off; check the polarity twice before switching on.', 'Câblez hors tension ; vérifiez deux fois la polarité avant d\'allumer.'],
      ['A resistor has a maximum power (often 0.25 W): check P = R I².', 'Une résistance a une puissance maximale (souvent 0,25 W) : vérifiez P = R I².']
    ]))
  ],
  terms: [['voltage (V)', 'tension (V)'], ['current (A)', 'courant (A)'], ['resistance (Ω)', 'résistance (Ω)'], ['Ohm\'s law, U = R I', 'loi d\'Ohm, U = R I'], ['power (W)', 'puissance (W)'], ['voltage divider', 'pont diviseur']],
  quiz: [
    ['What current flows through 1 kΩ under 5 V?', 'Quel courant traverse 1 kΩ sous 5 V ?', 'I = U / R = 5 / 1000 = 5 mA.', 'I = U / R = 5 / 1000 = 5 mA.'],
    ['Why does an LED need a resistor?', 'Pourquoi une LED a-t-elle besoin d\'une résistance ?', 'Its voltage hardly changes with the current, so nothing would limit the current: the resistor does it.', 'Sa tension change à peine avec le courant, donc rien ne limiterait le courant : la résistance s\'en charge.'],
    ['With R1 = R2, what fraction of the input voltage do you get at the middle?', 'Avec R1 = R2, quelle fraction de la tension d\'entrée obtient-on au milieu ?', 'Half: Vout = Vin × R2 / (R1 + R2) = Vin / 2.', 'La moitié : Vout = Vin × R2 / (R1 + R2) = Vin / 2.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Batteries and regulators: powering a robot', 'Batteries et régulateurs : alimenter un robot'],
  time: 25,
  goal: ['the batteries of small robots (LiPo, Li-ion, NiMH), their voltage and capacity, how long a robot runs, why the logic and the motors are powered separately, and the difference between a linear regulator and a buck converter.', 'les batteries des petits robots (LiPo, Li-ion, NiMH), leur tension et leur capacité, combien de temps un robot tourne, pourquoi on alimente séparément la logique et les moteurs, et la différence entre un régulateur linéaire et un convertisseur abaisseur.'],
  body: [
    ONE('The battery gives the energy, the regulator makes a clean 5 V for the brain, and the motors take their power directly — with one common ground.', 'La batterie donne l\'énergie, le régulateur fabrique un 5 V propre pour le cerveau, et les moteurs prennent leur puissance directement — avec une masse commune.'),
    H4('2.1 Batteries', '2.1 Les batteries'),
    TABLE([['Type', 'Type'], ['Voltage of one cell', 'Tension d\'un élément'], ['Strong points', 'Points forts'], ['Care', 'Précautions']], [
      ['LiPo', ['3.7 V (4.2 full, 3.3 empty)', '3,7 V (4,2 pleine, 3,3 vide)'], ['light, very high current', 'légère, très fort courant'], ['special charger, never below 3.0 V, fire risk if punctured', 'chargeur spécial, jamais sous 3,0 V, risque de feu si percée']],
      ['Li-ion 18650', ['3.6 V', '3,6 V'], ['high capacity, robust case', 'grande capacité, boîtier robuste'], ['protection board (BMS)', 'carte de protection (BMS)']],
      ['NiMH', ['1.2 V', '1,2 V'], ['safe, cheap', 'sûre, bon marché'], ['heavy, lower current', 'lourde, courant plus faible']]
    ]),
    P('Cells are put in series to add their voltages: a <strong>2S</strong> LiPo = 2 cells = 7.4 V. The <strong>capacity</strong> in mAh says how long it lasts:', 'On met les éléments en série pour additionner leurs tensions : une LiPo <strong>2S</strong> = 2 éléments = 7,4 V. La <strong>capacité</strong> en mAh dit combien de temps elle dure :'),
    EQ('autonomy (h) ≈ capacity (Ah) / average current (A) &emsp; 2.2 Ah / 1.1 A = 2 h', 'autonomie (h) ≈ capacité (Ah) / courant moyen (A) &emsp; 2,2 Ah / 1,1 A = 2 h'),
    H4('2.2 One battery, two circuits', '2.2 Une batterie, deux circuits'),
    FIGO(powerTree()),
    UL([
      ['Motors make big current peaks and electrical noise; if they share the 5 V of the Arduino, it resets when they start.', 'Les moteurs font de gros pics de courant et du bruit électrique ; s\'ils partagent le 5 V de l\'Arduino, celui-ci redémarre quand ils démarrent.'],
      ['So the logic gets its own regulated 5 V, and the motors are powered by the driver straight from the battery.', 'La logique a donc son propre 5 V régulé, et les moteurs sont alimentés par le pilote directement depuis la batterie.'],
      ['All the grounds (GND) are connected: a voltage is always measured against a reference, and a signal without a common ground means nothing.', 'Toutes les masses (GND) sont reliées : une tension se mesure toujours par rapport à une référence, et un signal sans masse commune ne veut rien dire.']
    ]),
    H4('2.3 Linear regulator or buck converter?', '2.3 Régulateur linéaire ou abaisseur ?'),
    TABLE([['', ''], ['Linear (7805, AMS1117)', 'Linéaire (7805, AMS1117)'], ['Buck (switching)', 'Abaisseur (à découpage)']], [
      [['how', 'principe'], ['burns the extra voltage as heat', 'brûle la tension en trop en chaleur'], ['switches fast and stores energy in a coil', 'commute vite et stocke l\'énergie dans une bobine']],
      [['lost power', 'puissance perdue'], ['(Vin − Vout) × I: (7.4 − 5) × 0.5 = 1.2 W', '(Vin − Vout) × I : (7,4 − 5) × 0,5 = 1,2 W'], ['≈ 10 % (efficiency ≈ 90 %)', '≈ 10 % (rendement ≈ 90 %)']],
      [['when', 'quand'], ['small currents, very clean voltage', 'petits courants, tension très propre'], ['batteries, currents above 0.3 A', 'batteries, courants au-delà de 0,3 A']]
    ])
  ],
  terms: [['LiPo, cell, 2S', 'LiPo, élément, 2S'], ['capacity (mAh)', 'capacité (mAh)'], ['autonomy', 'autonomie'], ['regulator', 'régulateur'], ['buck converter', 'convertisseur abaisseur'], ['common ground', 'masse commune']],
  quiz: [
    ['What is the voltage of a 3S LiPo?', 'Quelle est la tension d\'une LiPo 3S ?', '3 × 3.7 = 11.1 V (12.6 V when full).', '3 × 3,7 = 11,1 V (12,6 V pleine).'],
    ['Why must the grounds be connected?', 'Pourquoi faut-il relier les masses ?', 'Because a voltage is measured against a reference: without a common ground the Arduino\'s HIGH means nothing to the driver.', 'Parce qu\'une tension se mesure par rapport à une référence : sans masse commune le HIGH de l\'Arduino ne veut rien dire pour le pilote.'],
    ['Why does an Arduino reset when the motors start, if they share its 5 V?', 'Pourquoi un Arduino redémarre-t-il quand les moteurs démarrent, s\'ils partagent son 5 V ?', 'The starting current of the motors makes the 5 V drop for a moment, below what the microcontroller needs.', 'Le courant de démarrage des moteurs fait chuter le 5 V un instant, en dessous de ce dont le microcontrôleur a besoin.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['The Arduino: pins, setup, loop and a blinking LED', 'L\'Arduino : broches, setup, loop et une LED qui clignote'],
  time: 25,
  goal: ['what is on an Arduino Uno board, the kinds of pins, the structure of a program (setup and loop), how to light an LED, and how to print messages to the computer.', 'ce qu\'il y a sur une carte Arduino Uno, les types de broches, la structure d\'un programme (setup et loop), comment allumer une LED, et comment afficher des messages sur l\'ordinateur.'],
  body: [
    ONE('setup() runs once, loop() runs forever: every robot program is built on this pair.', 'setup() s\'exécute une fois, loop() s\'exécute pour toujours : tout programme de robot est construit sur ce couple.'),
    H4('3.1 The board', '3.1 La carte'),
    TABLE([['Pins', 'Broches'], ['What they do', 'Ce qu\'elles font'], ['Limits', 'Limites']], [
      [['digital 0–13', 'numériques 0–13'], ['input or output, HIGH (5 V) or LOW (0 V)', 'entrée ou sortie, HIGH (5 V) ou LOW (0 V)'], ['20 mA per pin (40 mA absolute maximum); 0 and 1 are used by the USB link', '20 mA par broche (40 mA maximum absolu) ; 0 et 1 servent au lien USB']],
      [['PWM ~ (3, 5, 6, 9, 10, 11)', 'PWM ~ (3, 5, 6, 9, 10, 11)'], ['a fast on/off signal: analogWrite (lesson 5)', 'un signal tout-ou-rien rapide : analogWrite (leçon 5)'], ['≈ 490 Hz (980 Hz on 5 and 6)', '≈ 490 Hz (980 Hz sur 5 et 6)']],
      [['analog A0–A5', 'analogiques A0–A5'], ['measure a voltage from 0 to 5 V: analogRead', 'mesurent une tension de 0 à 5 V : analogRead'], ['10 bits: 0 … 1023', '10 bits : 0 … 1023']],
      [['interrupts 2, 3', 'interruptions 2, 3'], ['call a function at once on an edge (encoders)', 'appellent une fonction tout de suite sur un front (codeurs)'], ['keep the function very short', 'gardez la fonction très courte']],
      [['5 V, 3.3 V, GND, Vin', '5 V, 3,3 V, GND, Vin'], ['power for small sensors; Vin takes 7–12 V', 'alimentation des petits capteurs ; Vin accepte 7–12 V'], ['never power a motor from the 5 V pin', 'n\'alimentez jamais un moteur par la broche 5 V']]
    ]),
    H4('3.2 The first program', '3.2 Le premier programme'),
    FIGO(blinkWiring()),
    CODE('el-blink.ino'),
    OL([
      ['Install the Arduino IDE (arduino.cc), plug the board with a USB cable.', 'Installez l\'IDE Arduino (arduino.cc), branchez la carte avec un câble USB.'],
      ['Choose the board (Arduino Uno) and the port in the Tools menu.', 'Choisissez la carte (Arduino Uno) et le port dans le menu Outils.'],
      ['Click Upload (→); the LED blinks once per second.', 'Cliquez sur Téléverser (→) ; la LED clignote une fois par seconde.'],
      ['Open the Serial Monitor at 9600 baud: it prints on, off, on, off…', 'Ouvrez le Moniteur série à 9600 bauds : il affiche on, off, on, off…']
    ]),
    BOX('note', ['Same ideas as Python, different words', 'Les mêmes idées qu\'en Python, d\'autres mots'], P('The Arduino language is C++: each instruction ends with <code>;</code>, blocks are between <code>{ }</code> instead of indentation, and each variable has a declared type (<code>int</code>, <code>float</code>, <code>bool</code>). <code>loop()</code> is the <code>while True:</code> of the Python course, lesson 3.', 'Le langage Arduino est du C++ : chaque instruction finit par <code>;</code>, les blocs sont entre <code>{ }</code> au lieu de l\'indentation, et chaque variable a un type déclaré (<code>int</code>, <code>float</code>, <code>bool</code>). <code>loop()</code> est le <code>while True:</code> du cours Python, leçon 3.'))
  ],
  terms: [['microcontroller', 'microcontrôleur'], ['digital pin, analog pin', 'broche numérique, broche analogique'], ['setup(), loop()', 'setup(), loop()'], ['pinMode, digitalWrite', 'pinMode, digitalWrite'], ['Serial Monitor', 'Moniteur série']],
  quiz: [
    ['Which function runs only once?', 'Quelle fonction ne s\'exécute qu\'une fois ?', 'setup(), at power-on or after a reset.', 'setup(), à la mise sous tension ou après un reset.'],
    ['Can a pin power a small motor directly?', 'Une broche peut-elle alimenter directement un petit moteur ?', 'No: a pin gives 20 mA at most, a small motor takes hundreds of mA. A transistor or a driver is needed (lessons 5 and 6).', 'Non : une broche donne 20 mA au plus, un petit moteur prend des centaines de mA. Il faut un transistor ou un pilote (leçons 5 et 6).'],
    ['What does delay(500) do?', 'Que fait delay(500) ?', 'It stops the program for 500 ms; nothing else runs meanwhile.', 'Il arrête le programme pendant 500 ms ; rien d\'autre ne s\'exécute pendant ce temps.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Reading sensors: buttons, analog voltages, ultrasound', 'Lire des capteurs : boutons, tensions analogiques, ultrasons'],
  time: 30,
  goal: ['how to read a button with a pull-up resistor, how to read a voltage with analogRead and turn it into volts, and how an ultrasonic sensor measures a distance from an echo time.', 'comment lire un bouton avec une résistance de tirage, comment lire une tension avec analogRead et la convertir en volts, et comment un capteur à ultrasons mesure une distance à partir d\'un temps d\'écho.'],
  body: [
    ONE('Every sensor finally gives a voltage or a time; the program turns it into a physical quantity with a simple formula.', 'Tout capteur donne finalement une tension ou un temps ; le programme le transforme en grandeur physique avec une formule simple.'),
    H4('4.1 A button and its pull-up resistor', '4.1 Un bouton et sa résistance de tirage'),
    FIGO(pullup()),
    P('An input that is connected to nothing “floats” and reads random values. The pull-up resistor holds it at 5 V; the button, when pressed, connects it to GND. So the logic is <strong>inverted</strong>: pressed = LOW. <code>INPUT_PULLUP</code> uses the resistor already inside the chip: no extra part.', 'Une entrée reliée à rien « flotte » et lit des valeurs au hasard. La résistance de tirage la maintient à 5 V ; le bouton, quand on appuie, la relie à GND. La logique est donc <strong>inversée</strong> : appuyé = LOW. <code>INPUT_PULLUP</code> utilise la résistance déjà présente dans la puce : aucune pièce en plus.'),
    H4('4.2 An analog voltage', '4.2 Une tension analogique'),
    EQ('<i>V</i> = <i>n</i> × 5 / 1023 &emsp; <i>n</i> = analogRead(A0) ∈ [0, 1023]'),
    P('A potentiometer (a resistor with a slider) between 5 V and GND is a voltage divider you turn by hand: its middle pin gives 0 to 5 V. Light, temperature and battery sensors work the same way.', 'Un potentiomètre (une résistance avec un curseur) entre 5 V et GND est un pont diviseur qu\'on tourne à la main : sa broche du milieu donne de 0 à 5 V. Les capteurs de lumière, de température et de batterie fonctionnent de la même façon.'),
    H4('4.3 Measuring a distance with sound', '4.3 Mesurer une distance avec le son'),
    P('The HC-SR04 sends a burst of ultrasound when TRIG gets a 10 µs pulse; ECHO then stays HIGH for the time the sound takes to go to the obstacle and come back. Sound travels at 343 m/s = 0.0343 cm/µs:', 'Le HC-SR04 envoie une salve d\'ultrasons quand TRIG reçoit une impulsion de 10 µs ; ECHO reste ensuite à HIGH pendant le temps que met le son pour aller jusqu\'à l\'obstacle et revenir. Le son va à 343 m/s = 0,0343 cm/µs :'),
    EQ('<i>d</i> = <i>t</i> × 0.0343 / 2 &emsp; (the 2: there and back)', '<i>d</i> = <i>t</i> × 0,0343 / 2 &emsp; (le 2 : aller et retour)'),
    CODE('el-sensors.ino'),
    TABLE([['Measured', 'Mesuré'], ['Converted', 'Converti'], ['Meaning', 'Sens']], [
      ['digitalRead(2) = LOW', ['pressed', 'appuyé'], ['the button connects the pin to GND', 'le bouton relie la broche à GND']],
      ['analogRead(A0) = 512', ['2.50 V', '2,50 V'], ['the potentiometer is in the middle', 'le potentiomètre est au milieu']],
      ['pulseIn = 1166 µs', ['20.0 cm', '20,0 cm'], ['an obstacle at 20 cm', 'un obstacle à 20 cm']]
    ]),
    BOX('warn', ['Limits of the ultrasonic sensor', 'Limites du capteur à ultrasons'], P('Range about 2 cm to 4 m; a soft or slanted surface may send no echo (pulseIn then returns 0 after its timeout); two sensors firing together disturb each other. Lesson 8 shows how the robot handles a missing echo.', 'Portée d\'environ 2 cm à 4 m ; une surface molle ou inclinée peut ne renvoyer aucun écho (pulseIn renvoie alors 0 après son délai) ; deux capteurs qui tirent ensemble se perturbent. La leçon 8 montre comment le robot gère un écho manquant.'))
  ],
  terms: [['pull-up resistor', 'résistance de tirage'], ['floating input', 'entrée flottante'], ['analogRead, 10 bits', 'analogRead, 10 bits'], ['potentiometer', 'potentiomètre'], ['ultrasonic sensor, echo', 'capteur à ultrasons, écho']],
  quiz: [
    ['With INPUT_PULLUP, what does a pressed button read?', 'Avec INPUT_PULLUP, que lit un bouton appuyé ?', 'LOW: the button connects the pin to GND.', 'LOW : le bouton relie la broche à GND.'],
    ['What voltage does analogRead = 1023 mean?', 'Quelle tension veut dire analogRead = 1023 ?', '5 V, the maximum.', '5 V, le maximum.'],
    ['Why divide by 2 in the distance formula?', 'Pourquoi diviser par 2 dans la formule de la distance ?', 'Because the echo time is the time to go to the obstacle and come back.', 'Parce que le temps d\'écho est le temps pour aller jusqu\'à l\'obstacle et revenir.']
  ]
})
  ];
}
