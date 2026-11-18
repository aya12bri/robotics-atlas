// Mechanical transmissions and grippers — lessons 1 to 4: transmission and transformation, belts and other drives, gears, backlash.
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, lesson } from '../lib.mjs';
import * as F from './tr-fig.mjs';
const PRE = 'tr-';
const fig = (o) => FIG(o.vb, o.svg);
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));

export function partA() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['Transmission and transformation: why robots need them', 'Transmission et transformation : pourquoi les robots en ont besoin'],
  time: 15,
  goal: ['the difference between transmitting and transforming a motion, the eight reasons for them in a robot, the parts of an actuation chain, the kinds of actuators, and the difference between an actuator and an end effector.', 'la différence entre transmettre et transformer un mouvement, les huit raisons de le faire dans un robot, les éléments d\'une chaîne d\'actionnement, les sortes d\'actionneurs, et la différence entre un actionneur et un effecteur.'],
  body: [
    ONE('Motors spin fast with little torque; joints need to turn slowly with a lot of torque, sometimes in a straight line or around another axis: transmissions adapt the motion, transformations change its nature.', 'Les moteurs tournent vite avec peu de couple ; les articulations doivent tourner lentement avec beaucoup de couple, parfois en ligne droite ou autour d\'un autre axe : les transmissions adaptent le mouvement, les transformations changent sa nature.'),
    H4('1.1 Two words', '1.1 Deux mots'),
    TABLE([['', ''], ['Transmission', 'Transmission'], ['Transformation', 'Transformation']], [
      [['What it does', 'Ce qu\'elle fait'], ['carries the mechanical power from the motor to the joint, <strong>adapting</strong> speed and torque', 'transporte la puissance mécanique du moteur à l\'articulation, en <strong>adaptant</strong> vitesse et couple'], ['<strong>changes the nature</strong> of the motion: type, direction, amplitude', '<strong>change la nature</strong> du mouvement : type, direction, amplitude']],
      [['Examples', 'Exemples'], ['gear reducers, harmonic drives, belts, chains', 'réducteurs à engrenages, harmonic drives, courroies, chaînes'], ['screw-nut and rack-pinion (rotation → translation), cam (rotation → translation), bevel and worm gears (another axis), levers (amplitude)', 'vis-écrou et pignon-crémaillère (rotation → translation), came (rotation → translation), engrenages coniques et roue et vis sans fin (autre axe), leviers (amplitude)']]
    ]),
    H4('1.2 Eight reasons', '1.2 Huit raisons'),
    OL([['<strong>Adapt power</strong>: the motor turns fast with little torque; the joint needs the opposite.', '<strong>Adapter la puissance</strong> : le moteur tourne vite avec peu de couple ; l\'articulation demande l\'inverse.'],
      ['<strong>Compactness</strong>: a small, light motor still produces enough torque.', '<strong>Compacité</strong> : un moteur petit et léger produit quand même assez de couple.'],
      ['<strong>Precision</strong>: dividing the speed divides the position error of the motor by the same ratio.', '<strong>Précision</strong> : diviser la vitesse divise l\'erreur de position du moteur par le même rapport.'],
      ['<strong>Carry energy</strong> to joints far from the motor (belts, cables in light arms).', '<strong>Transporter l\'énergie</strong> vers des articulations loin du moteur (courroies, câbles dans les bras légers).'],
      ['<strong>Convert the type of motion</strong>: rotary motor, linear joint.', '<strong>Convertir le type de mouvement</strong> : moteur rotatif, articulation linéaire.'],
      ['<strong>Change the direction or the axis</strong> (bevel, worm gears).', '<strong>Changer la direction ou l\'axe</strong> (engrenages coniques, roue et vis sans fin).'],
      ['<strong>Adapt the amplitude</strong> (levers, linkages: a small rotation opens a gripper wide).', '<strong>Adapter l\'amplitude</strong> (leviers, liaisons : une petite rotation ouvre largement une pince).'],
      ['<strong>In end effectors</strong>: share one motor between several fingers (tendons, gears).', '<strong>Dans les effecteurs</strong> : partager un moteur entre plusieurs doigts (tendons, engrenages).']]),
    H4('1.3 The actuation chain', '1.3 La chaîne d\'actionnement'),
    fig(F.chain()),
    TABLE([['Actuator', 'Actionneur'], ['Strengths', 'Points forts'], ['Weaknesses', 'Points faibles']], [
      [['Electric (servo, stepper)', 'Électrique (servo, pas-à-pas)'], ['precise, clean, easy to control', 'précis, propre, facile à commander'], ['limited torque for heavy tasks → reducer', 'couple limité pour les tâches lourdes → réducteur']],
      [['Hydraulic (cylinders, motors)', 'Hydraulique (vérins, moteurs)'], ['very high force and torque', 'force et couple très élevés'], ['bulky, leaks, maintenance of the fluid', 'encombrant, fuites, entretien du fluide']],
      [['Pneumatic (air cylinders)', 'Pneumatique (vérins à air)'], ['simple, fast, cheap', 'simple, rapide, bon marché'], ['air is compressible: hard to stop in the middle', 'l\'air est compressible : difficile de s\'arrêter au milieu']]
    ]),
    P('The <strong>actuator</strong> is the muscle: it turns energy into motion at a joint. The <strong>end effector</strong> (gripper, suction cup, welding torch, screwdriver, hand) is the tool at the end of the arm that does the work on the object. Actuators give motion and force; the end effector applies them to the task.',
      'L\'<strong>actionneur</strong> est le muscle : il transforme de l\'énergie en mouvement à une articulation. L\'<strong>effecteur</strong> (pince, ventouse, torche de soudage, visseuse, main) est l\'outil au bout du bras qui fait le travail sur l\'objet. Les actionneurs donnent le mouvement et l\'effort ; l\'effecteur les applique à la tâche.'),
    BOX('example', ['Worked example', 'Exemple corrigé'], P('A motor gives 0.5 N·m at 3000 rpm. A reducer of ratio 100 with an efficiency of 85 %: output speed 3000 / 100 = <strong>30 rpm</strong>, output torque 0.5 × 100 × 0.85 = <strong>42.5 N·m</strong>. The power is (almost) the same: 157 W in, 133 W out.', 'Un moteur donne 0,5 N·m à 3000 tr/min. Un réducteur de rapport 100 de rendement 85 % : vitesse de sortie 3000 / 100 = <strong>30 tr/min</strong>, couple de sortie 0,5 × 100 × 0,85 = <strong>42,5 N·m</strong>. La puissance est (presque) la même : 157 W en entrée, 133 W en sortie.'))
  ],
  terms: [['mechanical transmission', 'transmission mécanique'], ['motion transformation', 'transformation de mouvement'], ['reducer, gear ratio', 'réducteur, rapport de réduction'], ['actuation chain', 'chaîne d\'actionnement'], ['actuator', 'actionneur'], ['end effector', 'effecteur'], ['efficiency η', 'rendement η']],
  quiz: [['A rack and pinion: transmission or transformation?', 'Un pignon-crémaillère : transmission ou transformation ?', 'Transformation: a rotation becomes a translation.', 'Transformation : une rotation devient une translation.'],
    ['Why does a reducer improve precision?', 'Pourquoi un réducteur améliore-t-il la précision ?', 'An error of the motor angle is divided by the ratio at the joint.', 'Une erreur sur l\'angle du moteur est divisée par le rapport à l\'articulation.'],
    ['Why is a pneumatic cylinder hard to stop in the middle of its stroke?', 'Pourquoi un vérin pneumatique est-il difficile à arrêter au milieu de sa course ?', 'Air is compressible: the position is not stiff.', 'L\'air est compressible : la position n\'est pas raide.']]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Belts, chains, friction wheels, shafts and cams', 'Courroies, chaînes, roues de friction, arbres et cames'],
  time: 20,
  goal: ['how each common drive transmits motion, the rule of the speed ratio, which ones reverse the direction, and their strengths, weaknesses and uses in robots.', 'comment chaque transmission courante transmet le mouvement, la règle du rapport de vitesse, lesquelles inversent le sens, et leurs forces, faiblesses et usages dans les robots.'],
  body: [
    ONE('When nothing slips, the speed at the rim is the same on both wheels: v = ω₁ r₁ = ω₂ r₂, so a small wheel driving a big one slows down and gains torque.', 'Quand rien ne glisse, la vitesse au bord est la même sur les deux roues : v = ω₁ r₁ = ω₂ r₂, donc une petite roue qui entraîne une grande ralentit et gagne du couple.'),
    EQ('i = n₁ / n₂ = d₂ / d₁ &emsp;&emsp; T₂ = T₁ × i × η'),
    fig(F.drives()),
    TABLE([['Drive', 'Transmission'], ['How', 'Comment'], ['+', '+'], ['−', '−'], ['Uses', 'Usages']], [
      [['Belt and pulley', 'Courroie et poulies'], ['a flexible belt between pulleys; flat, V or <strong>toothed (timing)</strong> belt', 'une courroie souple entre des poulies ; plate, trapézoïdale ou <strong>crantée (synchrone)</strong>'], ['reversible, quiet, fast, no lubrication; timing belt: no slip', 'réversible, silencieuse, rapide, sans lubrification ; crantée : sans glissement'], ['flat belts slip; sensitive to heat, wear, dirt; needs tensioning', 'les plates glissent ; sensible à la chaleur, l\'usure, la saleté ; à retendre'], ['robots (timing belts on wrist axes), conveyors, 3D printers', 'robots (courroies crantées des axes du poignet), convoyeurs, imprimantes 3D']],
      [['Chain and sprocket', 'Chaîne et pignons'], ['a chain on toothed sprockets', 'une chaîne sur des pignons dentés'], ['no slip, strong, length adjustable', 'sans glissement, solide, longueur réglable'], ['needs oil and alignment, noisy, vibrations', 'demande huile et alignement, bruyante, vibrations'], ['bicycles, heavy machines, conveyors', 'vélos, machines lourdes, convoyeurs']],
      [['Friction wheels', 'Roues de friction'], ['wheels pressed together; each contact reverses the direction', 'des roues pressées l\'une contre l\'autre ; chaque contact inverse le sens'], ['quiet, cheap, slips instead of breaking (overload protection)', 'silencieuses, bon marché, glissent au lieu de casser (protection contre la surcharge)'], ['loses efficiency by slipping, sensitive to wear and dirt', 'perd du rendement en glissant, sensible à l\'usure et à la saleté'], ['printing presses, sheet feeders, light conveyors', 'presses d\'imprimerie, alimentation de feuilles, convoyeurs légers']],
      [['Shaft and coupling', 'Arbre et accouplement'], ['a shaft carries the rotation; rigid, flexible or friction couplings', 'un arbre transporte la rotation ; accouplements rigides, flexibles ou à friction'], ['long distances, flexible couplings absorb misalignment and shocks, easy to take apart', 'grandes distances, les accouplements flexibles absorbent désalignements et chocs, faciles à démonter'], ['rigid ones need precise alignment', 'les rigides demandent un alignement précis'], ['motor to gearbox in every robot axis', 'moteur vers réducteur dans chaque axe de robot']],
      [['Cam and follower', 'Came et suiveur'], ['a profiled cam pushes a follower', 'une came profilée pousse un suiveur'], ['any motion law, very repeatable', 'n\'importe quelle loi de mouvement, très répétable'], ['fixed profile, wear, noise at high speed', 'profil figé, usure, bruit à grande vitesse'], ['engines, sewing machines, some grippers', 'moteurs thermiques, machines à coudre, certaines pinces']]
    ]),
    WIDGET('tr-belt'),
    BOX('example', ['Worked example', 'Exemple corrigé'], P('A wrist axis: motor pulley 20 teeth, joint pulley 60 teeth, motor at 1500 rpm with 0.3 N·m, efficiency 95 %. Ratio 3: the joint turns at <strong>500 rpm</strong> with 0.3 × 3 × 0.95 = <strong>0.86 N·m</strong>, in the same direction (open belt), followed in robots by a reducer of ratio 50 to 100.', 'Un axe de poignet : poulie moteur 20 dents, poulie d\'articulation 60 dents, moteur à 1500 tr/min avec 0,3 N·m, rendement 95 %. Rapport 3 : l\'articulation tourne à <strong>500 tr/min</strong> avec 0,3 × 3 × 0,95 = <strong>0,86 N·m</strong>, dans le même sens (courroie ouverte), suivie dans les robots d\'un réducteur de rapport 50 à 100.'))
  ],
  terms: [['timing belt', 'courroie crantée'], ['speed ratio', 'rapport de vitesse'], ['open, crossed belt', 'courroie ouverte, croisée'], ['chain drive', 'transmission par chaîne'], ['friction drive', 'transmission par friction'], ['flexible coupling', 'accouplement flexible'], ['cam and follower', 'came et suiveur']],
  quiz: [['Pulleys of 30 mm and 90 mm. Output speed if the motor turns at 1200 rpm?', 'Poulies de 30 mm et 90 mm. Vitesse de sortie si le moteur tourne à 1200 tr/min ?', '1200 × 30 / 90 = 400 rpm.', '1200 × 30 / 90 = 400 tr/min.'],
    ['Three friction wheels in a row: same direction or opposite?', 'Trois roues de friction en ligne : même sens ou sens opposé ?', 'Same direction: two contacts, two reversals (odd number of wheels → same direction as the driver).', 'Même sens : deux contacts, deux inversions (nombre impair de roues → même sens que la menante).'],
    ['Why is a toothed belt used in robots rather than a flat belt?', 'Pourquoi utilise-t-on une courroie crantée dans les robots plutôt qu\'une courroie plate ?', 'It cannot slip: the joint stays synchronised with the motor encoder.', 'Elle ne peut pas glisser : l\'articulation reste synchronisée avec le codeur du moteur.']]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Gears: types, vocabulary and ratios', 'Les engrenages : types, vocabulaire et rapports'],
  time: 25,
  goal: ['the main types of gears, the words of gears (pitch circle, module, pressure angle…), the formulas of speed, torque, power and efficiency, the direction of rotation, idler gears and compound trains.', 'les principaux types d\'engrenages, les mots des engrenages (cercle primitif, module, angle de pression…), les formules de vitesse, couple, puissance et rendement, le sens de rotation, les roues intermédiaires et les trains composés.'],
  body: [
    ONE('Two gears are two wheels whose teeth cannot slip: their pitch circles roll on each other, so the speed ratio is the ratio of their numbers of teeth.', 'Deux engrenages sont deux roues dont les dents ne peuvent pas glisser : leurs cercles primitifs roulent l\'un sur l\'autre, donc le rapport de vitesse est le rapport de leurs nombres de dents.'),
    TABLE([['Type', 'Type'], ['Shafts', 'Arbres'], ['Feature', 'Particularité']], [
      [['Spur', 'Droit'], ['parallel', 'parallèles'], ['straight teeth, simple, the most common', 'dents droites, simple, le plus courant']],
      [['Helical', 'Hélicoïdal'], ['parallel', 'parallèles'], ['angled teeth: smoother and quieter, higher loads, but axial forces', 'dents inclinées : plus doux et silencieux, charges plus fortes, mais efforts axiaux']],
      [['Bevel', 'Conique'], ['intersecting (often 90°)', 'concourants (souvent 90°)'], ['changes the axis', 'change l\'axe']],
      [['Worm and wheel', 'Roue et vis sans fin'], ['crossed at 90°', 'croisés à 90°'], ['very high reduction, often self-locking', 'très forte réduction, souvent irréversible']],
      [['Planetary', 'Planétaire'], ['coaxial', 'coaxiaux'], ['sun, planets, ring: compact, high torque density', 'soleil, satellites, couronne : compact, forte densité de couple']],
      [['Cycloidal, harmonic, magnetic', 'Cycloïdal, harmonic, magnétique'], ['coaxial', 'coaxiaux'], ['special types for precision robots', 'types spéciaux pour les robots de précision']]
    ]),
    H4('3.1 The vocabulary', '3.1 Le vocabulaire'),
    fig(F.gearterm()),
    UL([['<strong>Pitch circle</strong>: the circle that defines the “size” of the gear; the pitch circles of two gears are tangent. Its diameter is the <strong>pitch diameter</strong> d.', '<strong>Cercle primitif</strong> : le cercle qui définit la « taille » de la roue ; les cercles primitifs de deux roues sont tangents. Son diamètre est le <strong>diamètre primitif</strong> d.'],
      ['<strong>Circular pitch</strong> p: the arc between two teeth on the pitch circle. <strong>Module</strong> m = p / π (in mm): a round number, the same for two gears that mesh. Then d = m Z (Z teeth).', '<strong>Pas circulaire</strong> p : l\'arc entre deux dents sur le cercle primitif. <strong>Module</strong> m = p / π (en mm) : un nombre rond, le même pour deux roues qui engrènent. Alors d = m Z (Z dents).'],
      ['<strong>Diametral pitch</strong> (inch system): teeth per inch of diameter, the inverse of the module. <strong>Pressure angle</strong>: the angle of the force on the tooth (14.5°, 20° or 25°); it must be the same on both gears.', '<strong>Pas diamétral</strong> (système en pouces) : dents par pouce de diamètre, l\'inverse du module. <strong>Angle de pression</strong> : l\'angle de l\'effort sur la dent (14,5°, 20° ou 25°) ; il doit être le même sur les deux roues.'],
      ['<strong>Driving gear</strong> (gets the motor power), <strong>driven gear</strong>, <strong>idler gear</strong> (between them, keeps the direction), <strong>gear train</strong>, <strong>gearbox</strong> (closed gear train).', '<strong>Roue menante</strong> (reçoit la puissance du moteur), <strong>roue menée</strong>, <strong>roue intermédiaire</strong> (entre les deux, garde le sens), <strong>train d\'engrenages</strong>, <strong>boîte de vitesses / réducteur</strong> (train fermé).']]),
    H4('3.2 Speed, torque, power, efficiency', '3.2 Vitesse, couple, puissance, rendement'),
    EQ('GR = N<sub>B</sub> / N<sub>A</sub> = ω<sub>A</sub> / ω<sub>B</sub> = R<sub>B</sub> / R<sub>A</sub> &emsp;&emsp; η = P<sub>B</sub> / P<sub>A</sub> = T<sub>B</sub> ω<sub>B</sub> / (T<sub>A</sub> ω<sub>A</sub>) &emsp;&emsp; T<sub>B</sub> = η GR T<sub>A</sub>'),
    P('Where does the torque formula come from? At the contact, the tooth of A pushes the tooth of B with a tangential force F<sub>t</sub> = T<sub>A</sub> / R<sub>A</sub>; this same force acts on B at the radius R<sub>B</sub>: T<sub>B</sub> = F<sub>t</sub> R<sub>B</sub> = T<sub>A</sub> R<sub>B</sub> / R<sub>A</sub> (losses aside). In a spur gear the real force is inclined by the pressure angle φ: F = F<sub>t</sub> / cos φ, with a radial part F<sub>t</sub> tan φ that pushes the shafts apart. A helical gear adds an axial part F<sub>t</sub> tan ψ (ψ the helix angle).',
      'D\'où vient la formule du couple ? Au contact, la dent de A pousse la dent de B avec une force tangentielle F<sub>t</sub> = T<sub>A</sub> / R<sub>A</sub> ; cette même force agit sur B au rayon R<sub>B</sub> : T<sub>B</sub> = F<sub>t</sub> R<sub>B</sub> = T<sub>A</sub> R<sub>B</sub> / R<sub>A</sub> (pertes mises à part). Dans un engrenage droit la vraie force est inclinée de l\'angle de pression φ : F = F<sub>t</sub> / cos φ, avec une partie radiale F<sub>t</sub> tan φ qui écarte les arbres. Un engrenage hélicoïdal ajoute une partie axiale F<sub>t</sub> tan ψ (ψ l\'angle d\'hélice).'),
    WIDGET('tr-gears3d'),
    H4('3.3 Direction and gear trains', '3.3 Sens et trains d\'engrenages'),
    P('Each external mesh <strong>reverses</strong> the direction: with an odd number of gears in a row the output turns like the input, with an even number it turns the other way. An idler gear changes the direction but not the ratio. In a <strong>compound</strong> train, two gears share a shaft and the ratios multiply:', 'Chaque engrènement extérieur <strong>inverse</strong> le sens : avec un nombre impair de roues en ligne la sortie tourne comme l\'entrée, avec un nombre pair dans l\'autre sens. Une roue intermédiaire change le sens mais pas le rapport. Dans un train <strong>composé</strong>, deux roues partagent un arbre et les rapports se multiplient :'),
    fig(F.train()),
    BOX('example', ['Worked example: a simple gear train', 'Exemple corrigé : un train simple'], P('Input A 12 teeth at 1800 rpm. B 36 and C 15 on the same shaft, C drives D 45. Ratio (36/12)(45/15) = <strong>9</strong>; output speed 1800 / 9 = <strong>200 rpm</strong>; two external meshes → the output turns in the <strong>same direction</strong> as the input. With 98 % per mesh, torque × 9 × 0.98² = × 8.6.', 'Entrée A 12 dents à 1800 tr/min. B 36 et C 15 sur le même arbre, C entraîne D 45. Rapport (36/12)(45/15) = <strong>9</strong> ; vitesse de sortie 1800 / 9 = <strong>200 tr/min</strong> ; deux engrènements extérieurs → la sortie tourne dans le <strong>même sens</strong> que l\'entrée. Avec 98 % par engrènement, couple × 9 × 0,98² = × 8,6.'))
  ],
  terms: [['spur, helical, bevel gear', 'engrenage droit, hélicoïdal, conique'], ['pitch circle, pitch diameter', 'cercle primitif, diamètre primitif'], ['module m', 'module m'], ['pressure angle', 'angle de pression'], ['gear ratio GR', 'rapport de réduction GR'], ['idler gear', 'roue intermédiaire'], ['compound gear train', 'train d\'engrenages composé']],
  quiz: [['Module 2 mm, 25 teeth. Pitch diameter?', 'Module 2 mm, 25 dents. Diamètre primitif ?', 'd = m Z = 50 mm.', 'd = m Z = 50 mm.'],
    ['A 20 teeth drives B 50 teeth. Centre distance with m = 1.5 mm?', 'A 20 dents entraîne B 50 dents. Entraxe avec m = 1,5 mm ?', 'a = m (20 + 50) / 2 = 52.5 mm.', 'a = m (20 + 50) / 2 = 52,5 mm.'],
    ['What does an idler gear change?', 'Que change une roue intermédiaire ?', 'Only the direction of the output, not the ratio.', 'Seulement le sens de la sortie, pas le rapport.']]
}),
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Backlash, choice and maintenance of gears', 'Jeu, choix et entretien des engrenages'],
  time: 15,
  goal: ['what backlash is, where it comes from, why it hurts robots and how to avoid it; how to choose a gearbox, and how to maintain it.', 'ce qu\'est le jeu, d\'où il vient, pourquoi il gêne les robots et comment l\'éviter ; comment choisir un réducteur, et comment l\'entretenir.'],
  body: [
    ONE('Backlash is the small gap between teeth: when the motor reverses, it turns a little before the output moves, and this lost motion becomes a position error at the end of the arm.', 'Le jeu est le petit espace entre les dents : quand le moteur change de sens, il tourne un peu avant que la sortie bouge, et ce mouvement perdu devient une erreur de position au bout du bras.'),
    H4('4.1 Backlash and lost motion', '4.1 Jeu et mouvement perdu'),
    P('<strong>Backlash</strong> is the clearance between mating teeth, measured as the angle the input can turn before the other flank of the tooth is touched. It comes from manufacturing tolerances, thermal expansion and wear, the room needed for the lubricant, and the profile of the teeth. <strong>Lost motion</strong> is wider: backlash + elastic deformation + hysteresis.', 'Le <strong>jeu</strong> est l\'espace entre les dents en prise, mesuré comme l\'angle que peut tourner l\'entrée avant de toucher l\'autre flanc de la dent. Il vient des tolérances de fabrication, de la dilatation thermique et de l\'usure, de la place nécessaire au lubrifiant, et du profil des dents. Le <strong>mouvement perdu</strong> est plus large : jeu + déformation élastique + hystérésis.'),
    WIDGET('tr-backlash'),
    UL([['Effects: lower positioning accuracy, noise, vibrations, shocks at each reversal; critical in robots, CNC and motion control.', 'Effets : précision de positionnement moindre, bruit, vibrations, chocs à chaque inversion ; critique en robotique, en commande numérique et en contrôle de mouvement.'],
      ['Remedies: preloaded or anti-backlash gears (two half-gears pushed apart by springs), high-precision manufacturing, and low-backlash reducers: planetary (a few arcminutes), cycloidal, harmonic drives (almost zero).', 'Remèdes : engrenages précontraints ou anti-jeu (deux demi-roues écartées par des ressorts), fabrication de haute précision, et réducteurs à faible jeu : planétaires (quelques minutes d\'arc), cycloïdaux, harmonic drives (presque nul).']]),
    BOX('example', ['Worked example', 'Exemple corrigé'], P('A backlash of 10 arcmin at the joint (1/6 of a degree) and an arm of 1 m: at the end of the arm the error is 1000 × (1/6) × π / 180 ≈ <strong>2.9 mm</strong> at each reversal. A good industrial robot repeats to 0.02–0.05 mm: its reducers must have well under 1 arcmin.', 'Un jeu de 10 minutes d\'arc à l\'articulation (1/6 de degré) et un bras de 1 m : au bout du bras l\'erreur vaut 1000 × (1/6) × π / 180 ≈ <strong>2,9 mm</strong> à chaque inversion. Un bon robot industriel répète à 0,02–0,05 mm : ses réducteurs doivent avoir bien moins de 1 minute d\'arc.')),
    H4('4.2 Choosing a gearbox', '4.2 Choisir un réducteur'),
    TABLE([['Criterion', 'Critère'], ['Question to ask', 'Question à se poser']], [
      [['Ratio', 'Rapport'], ['how many input turns per output turn? (choose motor and gearbox together)', 'combien de tours d\'entrée par tour de sortie ? (choisir moteur et réducteur ensemble)']],
      [['Mounting', 'Montage'], ['base, shaft, coaxial or at 90°?', 'sur embase, sur arbre, coaxial ou à 90° ?']],
      [['Environment', 'Environnement'], ['noise, space, dust, water, food contact, temperature', 'bruit, place, poussière, eau, contact alimentaire, température']],
      [['Efficiency and backlash', 'Rendement et jeu'], ['power application or precision? low backlash costs more', 'application de puissance ou de précision ? un faible jeu coûte plus cher']],
      [['Maintenance', 'Entretien'], ['type of lubricant, inspection, replacement', 'type de lubrifiant, inspection, remplacement']]
    ]),
    H4('4.3 Maintenance', '4.3 Entretien'),
    UL([['Lubricate as specified (oil or grease) and replace worn parts.', 'Lubrifier comme prévu (huile ou graisse) et remplacer les pièces usées.'], ['Keep dust and water out; store dry and clean when unused.', 'Tenir à l\'écart la poussière et l\'eau ; stocker au sec et propre quand inutilisé.'],
      ['Monitor noise, vibration and temperature: their rise announces a failure (predictive maintenance).', 'Surveiller le bruit, les vibrations et la température : leur hausse annonce une panne (maintenance prédictive).'], ['Avoid misalignment when reassembling.', 'Éviter le désalignement au remontage.']])
  ],
  terms: [['backlash', 'jeu (entre-dents)'], ['lost motion', 'mouvement perdu'], ['arcminute', 'minute d\'arc'], ['anti-backlash gear', 'engrenage anti-jeu'], ['preload', 'précontrainte'], ['predictive maintenance', 'maintenance prédictive']],
  quiz: [['Backlash or lost motion: which one includes the elastic deformation?', 'Jeu ou mouvement perdu : lequel inclut la déformation élastique ?', 'Lost motion (backlash + deformation + hysteresis).', 'Le mouvement perdu (jeu + déformation + hystérésis).'],
    ['Backlash of 6 arcmin, arm of 500 mm. Error at the tip?', 'Jeu de 6 minutes d\'arc, bras de 500 mm. Erreur au bout ?', '500 × 0.1° × π/180 ≈ 0.87 mm.', '500 × 0,1° × π/180 ≈ 0,87 mm.'],
    ['Name two low-backlash reducers used in robots.', 'Citez deux réducteurs à faible jeu utilisés dans les robots.', 'Harmonic drives, cycloidal reducers (and precision planetary gearboxes).', 'Les harmonic drives, les réducteurs cycloïdaux (et les réducteurs planétaires de précision).']]
})
  ];
}
