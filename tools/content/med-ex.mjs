// Medical robotics — the exercises of each lesson, with detailed solutions (rule used, where it is, steps, answer).
import { EXREG, SX } from '../lib.mjs';
const W = (n, en, fr) => [`lesson ${n} — ${en}`, `leçon ${n} — ${fr}`];

// built when the course is built (after the dictionary is reset), so that every text of the solutions is translated
export function loadEx() {
EXREG['med-1'] = [
  { lv: 1, q: ['Put in order: medical imaging, robotics, modern surgery, minimally invasive surgery. Which comes third?', 'Mettez dans l\'ordre : imagerie médicale, robotique, chirurgie moderne, chirurgie mini-invasive. Laquelle vient en troisième ?'],
    mcq: [['medical imaging', 'imagerie médicale'], ['robotics', 'robotique'], ['modern surgery', 'chirurgie moderne'], ['minimally invasive surgery', 'chirurgie mini-invasive', 1]],
    sol: ['minimally invasive surgery', 'la chirurgie mini-invasive'],
    sx: SX({ rule: ['each step needs the previous ones: robots came on top of minimally invasive surgery, which needed imaging and modern surgery', 'chaque étape a besoin des précédentes : les robots sont venus par-dessus la chirurgie mini-invasive, qui avait besoin de l\'imagerie et de la chirurgie moderne'], where: W(1, '1.1 Four steps to the robot (table)', '1.1 Quatre étapes jusqu\'au robot (tableau)'),
      table: { head: [['Order', 'Ordre'], ['Step', 'Étape'], ['Landmark', 'Repère']], rows: [['1', ['modern surgery', 'chirurgie moderne'], ['19th–20th c.', 'XIXe–XXe s.']], ['2', ['medical imaging', 'imagerie médicale'], '1895–1977'], ['3', ['<b>minimally invasive surgery</b>', '<b>chirurgie mini-invasive</b>'], '1987'], ['4', ['robotics', 'robotique'], ['from 1985, common after 2000', 'dès 1985, courante après 2000']]] },
      ans: ['<b>D</b>: minimally invasive surgery', '<b>D</b> : la chirurgie mini-invasive'] }) },
  { lv: 1, q: ['How many years separate the first robot-assisted neurosurgery (1985) and Operation Lindbergh (2001)?', 'Combien d\'années séparent la première neurochirurgie assistée par robot (1985) et l\'opération Lindbergh (2001) ?'],
    num: { ans: 16, tol: 0, unit: '' }, sol: ['16 years', '16 ans'],
    sx: SX({ rule: ['read the two dates on the timeline', 'lire les deux dates sur la frise'], where: W(1, '1.2 The milestones (figure)', '1.2 Les grandes étapes (figure)'),
      steps: [['2001 − 1985 = 16.', '2001 − 1985 = 16.'], ['In 16 years robots went from holding a needle to operating across the Atlantic.', 'En 16 ans les robots sont passés de tenir une aiguille à opérer à travers l\'Atlantique.']],
      ans: ['<b>16 years</b>', '<b>16 ans</b>'] }) }
];

EXREG['med-2'] = [
  { lv: 1, q: ['The master arm has a scaling factor k = 3. The surgeon\'s hand moves 15 mm. How far does the instrument move (in mm)?', 'Le bras maître a un facteur de démultiplication k = 3. La main du chirurgien bouge de 15 mm. De combien bouge l\'instrument (en mm) ?'],
    num: { ans: 5, tol: 0.01, unit: 'mm' }, sol: ['5 mm', '5 mm'],
    sx: SX({ rule: ['x tool = x hand / k', 'x outil = x main / k'], where: W(2, '2.1 Teleoperation (formula)', '2.1 La téléopération (formule)'),
      steps: [['15 / 3 = 5 mm.', '15 / 3 = 5 mm.'], ['A hand error of 3 mm also becomes 1 mm: scaling improves precision.', 'Une erreur de 3 mm de la main devient aussi 1 mm : la démultiplication améliore la précision.']],
      ans: ['<b>5 mm</b>', '<b>5 mm</b>'] }) },
  { lv: 2, q: ['Which cut-off frequency keeps the gestures and removes the tremor?', 'Quelle fréquence de coupure garde les gestes et enlève le tremblement ?'],
    mcq: [['0.1 Hz', '0,1 Hz'], ['5 Hz', '5 Hz', 1], ['20 Hz', '20 Hz'], ['100 Hz', '100 Hz']],
    sol: ['5 Hz', '5 Hz'],
    sx: SX({ rule: ['a low-pass filter keeps what is slower than its cut-off and removes what is faster', 'un filtre passe-bas garde ce qui est plus lent que sa coupure et enlève ce qui est plus rapide'], where: W(2, '2.1, paragraph on tremor', '2.1, paragraphe sur le tremblement'),
      table: { head: [['Cut-off', 'Coupure'], ['Gestures (a few Hz)', 'Gestes (quelques Hz)'], ['Tremor (8–12 Hz)', 'Tremblement (8–12 Hz)']], rows: [['0.1 Hz', ['removed: too slow', 'enlevés : trop lent'], ['removed', 'enlevé']], ['<b>5 Hz</b>', ['<b>kept</b>', '<b>gardés</b>'], ['<b>removed</b>', '<b>enlevé</b>']], ['20 Hz', ['kept', 'gardés'], ['still there: too fast', 'toujours là : trop rapide']], ['100 Hz', ['kept', 'gardés'], ['still there', 'toujours là']]] },
      ans: ['<b>5 Hz</b> (B): between the gestures and the tremor', '<b>5 Hz</b> (B) : entre les gestes et le tremblement'] }) }
];

EXREG['med-3'] = [
  { lv: 1, q: ['An instrument goes through a trocar: 30 cm outside, 10 cm inside. The hand moves 3 cm to the left. How far does the tip move (in cm), and which way?', 'Un instrument passe par un trocart : 30 cm à l\'extérieur, 10 cm à l\'intérieur. La main bouge de 3 cm vers la gauche. De combien bouge la pointe (en cm), et dans quel sens ?'],
    num: { ans: 1, tol: 0.01, unit: 'cm' }, sol: ['1 cm to the right', '1 cm vers la droite'],
    sx: SX({ rule: ['fulcrum effect: d tip = − d hand × L in / L out', 'effet levier : d pointe = − d main × L int / L ext'], where: W(3, '3.3 The fulcrum effect', '3.3 L\'effet levier'),
      table: { head: [['Quantity', 'Grandeur'], ['Value', 'Valeur']], rows: [[['L in / L out', 'L int / L ext'], '10 / 30 = 1/3'], [['3 cm × 1/3', '3 cm × 1/3'], '1 cm'], [['sign −', 'signe −'], ['opposite way: to the right', 'sens opposé : vers la droite']]] },
      ans: ['<b>1 cm to the right</b>', '<b>1 cm vers la droite</b>'] }) },
  { lv: 2, q: ['How many DOF does an instrument keep through a trocar?', 'Combien de DDL garde un instrument passé par un trocart ?'],
    num: { ans: 4, tol: 0, unit: '' }, sol: ['4', '4'],
    sx: SX({ rule: ['a rigid body has 6 DOF; the trocar forbids the 2 sideways translations at the wall', 'un solide a 6 DDL ; le trocart interdit les 2 translations latérales au niveau de la paroi'], where: W(3, '3.2 The trocar removes 2 DOF', '3.2 Le trocart enlève 2 DDL'),
      table: { head: [['DOF', 'DDL'], ['Free?', 'Libre ?']], rows: [[['2 tilts around the trocar', '2 inclinaisons autour du trocart'], ['yes (2)', 'oui (2)']], [['insertion', 'insertion'], ['yes (1)', 'oui (1)']], [['rotation about the instrument', 'rotation autour de l\'instrument'], ['yes (1)', 'oui (1)']], [['2 sideways translations', '2 translations latérales'], ['no', 'non']]] },
      ans: ['<b>4 DOF</b> (6 − 2)', '<b>4 DDL</b> (6 − 2)'] }) }
];

EXREG['med-4'] = [
  { lv: 1, q: ['A hand-held instrument whose motorised tip moves to cancel the tremor: which kind of co-manipulation?', 'Un instrument tenu en main dont la pointe motorisée bouge pour annuler le tremblement : quel type de comanipulation ?'],
    mcq: [['parallel', 'parallèle'], ['serial', 'série', 1], ['orthotic', 'orthétique'], ['teleoperation', 'téléopération']],
    sol: ['serial', 'série'],
    sx: SX({ rule: ['serial co-manipulation: the robot is between the hand and the tool, the velocities add up', 'comanipulation série : le robot est entre la main et l\'outil, les vitesses s\'additionnent'], where: W(4, 'table of the three kinds', 'tableau des trois types'),
      steps: [['The hand holds the instrument, the motor moves the tip relative to the hand.', 'La main tient l\'instrument, le moteur bouge la pointe par rapport à la main.'], ['v tip = v hand + v motor: velocities add up → serial.', 'v pointe = v main + v moteur : les vitesses s\'additionnent → série.']],
      ans: ['<b>B</b>: serial', '<b>B</b> : série'] }) },
  { lv: 2, q: ['In parallel co-manipulation the radiologist pushes the needle with 4 N and the robot adds 6 N in the same direction. What force acts on the needle (in N)?', 'En comanipulation parallèle le radiologue pousse l\'aiguille avec 4 N et le robot ajoute 6 N dans le même sens. Quel effort s\'exerce sur l\'aiguille (en N) ?'],
    num: { ans: 10, tol: 0, unit: 'N' }, sol: ['10 N', '10 N'],
    sx: SX({ rule: ['parallel co-manipulation: F = F human + F robot', 'comanipulation parallèle : F = F humain + F robot'], where: W(4, 'table of the three kinds', 'tableau des trois types'),
      steps: [['4 + 6 = 10 N.', '4 + 6 = 10 N.'], ['The doctor only feels 4 N: the robot gives “increased effort”.', 'Le médecin ne sent que 4 N : le robot apporte un « effort augmenté ».']],
      ans: ['<b>10 N</b>', '<b>10 N</b>'] }) }
];

EXREG['med-5'] = [
  { lv: 1, q: ['At what temperature does an autoclave sterilise (in °C)?', 'À quelle température stérilise un autoclave (en °C) ?'],
    num: { ans: 134, tol: 0, unit: '°C' }, sol: ['134 °C', '134 °C'],
    sx: SX({ rule: ['autoclave: steam at 134 °C for 18 minutes', 'autoclave : vapeur à 134 °C pendant 18 minutes'], where: W(5, '5.2 Sterility (table)', '5.2 Stérilité (tableau)'),
      steps: [['Electronics and motors do not survive this: the robot itself is covered by a sterile single-use drape, only the instruments go into the autoclave.', 'L\'électronique et les moteurs n\'y résistent pas : le robot lui-même est couvert par une housse stérile à usage unique, seuls les instruments vont à l\'autoclave.']],
      ans: ['<b>134 °C</b> (18 min)', '<b>134 °C</b> (18 min)'] }) },
  { lv: 2, q: ['Which of these is NOT a safety measure listed for medical robots?', 'Laquelle de ces mesures N\'EST PAS une mesure de sécurité citée pour les robots médicaux ?'],
    mcq: [['redundant sensors', 'des capteurs redondants'], ['a procedure to disengage and finish by hand', 'une procédure pour débrayer et finir à la main'], ['the highest possible speed to shorten the operation', 'la vitesse la plus grande possible pour raccourcir l\'opération', 1], ['mechanical fuses', 'des fusibles mécaniques']],
    sol: ['the highest possible speed', 'la vitesse la plus grande possible'],
    sx: SX({ rule: ['speed, force and workspace must be limited', 'la vitesse, l\'effort et l\'espace de travail doivent être limités'], where: W(5, '5.1 Safety: zero accidents', '5.1 Sécurité : zéro accident'),
      ans: ['<b>C</b>: speed is limited, not maximised', '<b>C</b> : la vitesse est limitée, pas maximisée'] }) }
];

EXREG['med-6'] = [
  { lv: 1, q: ['Which robot holds the endoscope and is driven by the surgeon\'s voice?', 'Quel robot tient l\'endoscope et est commandé par la voix du chirurgien ?'],
    mcq: [['Robodoc', 'Robodoc'], ['AESOP', 'AESOP', 1], ['CyberKnife', 'CyberKnife'], ['ReWalk', 'ReWalk']],
    sol: ['AESOP', 'AESOP'],
    sx: SX({ rule: ['AESOP (1994) is the voice-driven endoscope holder, “the third hand”', 'AESOP (1994) est le porte-endoscope commandé à la voix, « la troisième main »'], where: W(6, 'table of the families', 'tableau des familles'),
      ans: ['<b>B</b>: AESOP', '<b>B</b> : AESOP'] }) },
  { lv: 2, q: ['A da Vinci costs 2 M€, paid over 10 years, plus 200 k€ of maintenance per year. The hospital does 300 robotic operations per year. What is the robot cost per operation (in €)?', 'Un da Vinci coûte 2 M€, payés sur 10 ans, plus 200 k€ de maintenance par an. L\'hôpital fait 300 opérations robotisées par an. Quel est le coût du robot par opération (en €) ?'],
    num: { ans: 1333, tol: 2, unit: '€' }, sol: ['≈ 1333 €', '≈ 1333 €'],
    sx: SX({ rule: ['cost per operation = (yearly share of the price + yearly maintenance) / operations per year', 'coût par opération = (part annuelle du prix + maintenance annuelle) / opérations par an'], where: W(6, 'box “The cost”', 'encadré « Le coût »'),
      table: { head: [['Item', 'Poste'], ['Per year', 'Par an']], rows: [[['price: 2 M€ / 10', 'prix : 2 M€ / 10'], '200 000 €'], [['maintenance', 'maintenance'], '200 000 €'], [['<b>total</b>', '<b>total</b>'], '<b>400 000 €</b>'], [['÷ 300 operations', '÷ 300 opérations'], '<b>≈ 1333 €</b>']] },
      ans: ['<b>≈ 1333 € per operation</b>, without the single-use instruments', '<b>≈ 1333 € par opération</b>, sans les instruments à usage unique'] }) }
];

EXREG['med-7'] = [
  { lv: 1, q: ['How many DOF does the robot need to orient the probe and press it on the skin?', 'De combien de DDL le robot a-t-il besoin pour orienter la sonde et l\'appuyer sur la peau ?'],
    num: { ans: 4, tol: 0, unit: '' }, sol: ['4', '4'],
    sx: SX({ rule: ['3 rotations about the contact point + 1 translation along the probe', '3 rotations autour du point de contact + 1 translation le long de la sonde'], where: W(7, '7.1 The degrees of freedom of the probe', '7.1 Les degrés de liberté de la sonde'),
      ans: ['<b>4 DOF</b>; the large moves over the body are done by the assistant', '<b>4 DDL</b> ; les grands déplacements sur le corps sont faits par l\'assistant'] }) },
  { lv: 2, q: ['A signal goes up to a geostationary satellite (36 000 km) and down again. Light travels at 300 000 km/s. How long does it take (in s)?', 'Un signal monte vers un satellite géostationnaire (36 000 km) et redescend. La lumière va à 300 000 km/s. Combien de temps cela prend-il (en s) ?'],
    num: { ans: 0.24, tol: 0.005, unit: 's' }, sol: ['0.24 s', '0,24 s'],
    sx: SX({ rule: ['time = distance / speed', 'temps = distance / vitesse'], where: W(7, '7.2 The delay of the link', '7.2 Le retard de la liaison'),
      table: { head: [['Step', 'Étape'], ['Value', 'Valeur']], rows: [[['distance: up + down', 'distance : montée + descente'], '72 000 km'], [['72 000 / 300 000', '72 000 / 300 000'], '<b>0.24 s</b>'], [['command + image back', 'commande + image en retour'], ['≈ 0.5 s', '≈ 0,5 s']]] },
      ans: ['<b>0.24 s</b> one way: too slow for a remote force loop, so the force is controlled locally', '<b>0,24 s</b> dans un sens : trop lent pour une boucle d\'effort distante, l\'effort est donc commandé localement'] }) }
];

EXREG['med-8'] = [
  { lv: 2, q: ['You study a needle-insertion robot. In the six-step method, which step comes right after counting the DOF?', 'Vous étudiez un robot d\'insertion d\'aiguille. Dans la méthode en six étapes, quelle étape vient juste après le comptage des DDL ?'],
    mcq: [['the safety and the regulation', 'la sécurité et la réglementation'], ['the mode: teleoperation, co-manipulation or automatic', 'le mode : téléopération, comanipulation ou automatique', 1], ['the architecture', 'l\'architecture'], ['the gesture', 'le geste']],
    sol: ['the mode', 'le mode'],
    sx: SX({ rule: ['gesture → DOF → mode → architecture → sensing and control → safety and regulation', 'geste → DDL → mode → architecture → perception et commande → sécurité et réglementation'], where: W(8, '8.2 A method in six steps', '8.2 Une méthode en six étapes'),
      ans: ['<b>B</b>: decide who moves the needle (the doctor, the robot, or both) before choosing the mechanism', '<b>B</b> : décider qui bouge l\'aiguille (le médecin, le robot, ou les deux) avant de choisir le mécanisme'] }) },
  { lv: 2, q: ['For a needle that must enter the skin at a fixed point and then advance, how many DOF are needed around and along the entry point?', 'Pour une aiguille qui doit entrer dans la peau en un point fixe puis avancer, combien de DDL faut-il autour et le long du point d\'entrée ?'],
    num: { ans: 3, tol: 0, unit: '' }, hint: ['Orient the needle about the entry point, then push it. The rotation about the needle\'s own axis does not matter for a round needle.', 'Orientez l\'aiguille autour du point d\'entrée, puis poussez-la. La rotation autour de son propre axe ne compte pas pour une aiguille ronde.'], sol: ['3', '3'],
    sx: SX({ rule: ['count only the motions the gesture needs; a fixed entry point is a remote centre of motion', 'ne comptez que les mouvements dont le geste a besoin ; un point d\'entrée fixe est un centre de rotation déporté'], where: W(3, '3.2 and the box on the RCM, and lesson 8, step 2', '3.2 et l\'encadré sur le RCM, et leçon 8, étape 2'),
      table: { head: [['Motion', 'Mouvement'], ['Needed?', 'Nécessaire ?']], rows: [[['2 tilts about the entry point', '2 inclinaisons autour du point d\'entrée'], ['yes (2)', 'oui (2)']], [['insertion', 'insertion'], ['yes (1)', 'oui (1)']], [['rotation about the needle', 'rotation autour de l\'aiguille'], ['no (round needle)', 'non (aiguille ronde)']]] },
      ans: ['<b>3 DOF</b> (plus the positioning of the entry point, done once before)', '<b>3 DDL</b> (plus le positionnement du point d\'entrée, fait une fois avant)'] }) }
];
}
