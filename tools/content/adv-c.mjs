// Advanced robotics (Master level), lesson 8: grasping in practice — choose, size and test a gripper or a vacuum system.
// Follows "Robots in the real world", lesson 3 (the types of end effectors and a first force calculation).
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, lesson } from '../lib.mjs';
import { T, LINE, ARROW, COL } from '../practice/fig.mjs';
const PRE = 'adv-';
const SP = ' &emsp;&emsp; ';

// a two-jaw gripper holding a tapered part: contact normals, friction cones and the line between the contacts
function coneFigure() {
  const W = 660, H = 340, cx = 425, cy = 150;   // 660 wide: shown at up to 640 px (style.css)
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  // the part: a trapezoid, wider at the bottom, sides tilted by 12°
  const tilt = 12 * Math.PI / 180, hh = 95, top = 78, bot = top + 2 * hh * Math.tan(tilt);
  const half = (y) => top + (y - (cy - hh)) / (2 * hh) * (bot - top);
  const xl = cx - half(cy), xr = cx + half(cy);
  s += `<path d="M${cx - top},${cy - hh} L${cx + top},${cy - hh} L${cx + bot},${cy + hh} L${cx - bot},${cy + hh} z" fill="#5aa9ff" fill-opacity="0.10" stroke="${COL.axis}" stroke-width="2"/>`;
  // the jaws, pressing on the middle of each side
  s += `<rect x="${xl - 52}" y="${cy - 30}" width="44" height="60" rx="7" fill="#9fb0c3" fill-opacity="0.25" stroke="${COL.ink}" stroke-width="2"/>`;
  s += `<rect x="${xr + 8}" y="${cy - 30}" width="44" height="60" rx="7" fill="#9fb0c3" fill-opacity="0.25" stroke="${COL.ink}" stroke-width="2"/>`;
  // friction cones (μ = 0.5 → half-angle 26.6°) around the inward normals
  const ha = Math.atan(0.5), len = 125;
  const cone = (x, y, ang) => {
    const p1 = [x + len * Math.cos(ang - ha), y - len * Math.sin(ang - ha)], p2 = [x + len * Math.cos(ang + ha), y - len * Math.sin(ang + ha)];
    return `<path d="M${x},${y} L${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)} z" fill="#5aa9ff" fill-opacity="0.22" stroke="${COL.b}" stroke-width="1.5"/>`;
  };
  s += cone(xl, cy, -tilt) + cone(xr, cy, Math.PI + tilt);
  s += LINE(xl, cy, xr, cy, COL.y, 2.5, '7 6');
  s += ARROW(xl, cy, xl + 80 * Math.cos(tilt), cy + 80 * Math.sin(tilt), COL.o, 3) + ARROW(xr, cy, xr - 80 * Math.cos(tilt), cy + 80 * Math.sin(tilt), COL.o, 3);
  s += T(xl - 30, cy + 50, ['jaw', 'mors'], { a: 'middle', fs: 13 }) + T(xr + 30, cy + 50, ['jaw', 'mors'], { a: 'middle', fs: 13 });
  s += T(cx, cy + hh + 24, ['part with sides tilted by 12°', 'pièce aux flancs inclinés de 12°'], { a: 'middle', fs: 13, c: COL.axis });
  // legend, on the left
  s += LINE(20, 30, 46, 30, COL.y, 2.5, '7 6') + T(54, 34, ['line between the contacts', 'droite entre les contacts'], { fs: 12, c: COL.axis });
  s += `<rect x="20" y="48" width="26" height="12" fill="#5aa9ff" fill-opacity="0.3" stroke="${COL.b}"/>` + T(54, 59, ['friction cones (μ = 0.5: 26.6°)', 'cônes de frottement (μ = 0,5 : 26,6°)'], { fs: 12, c: COL.axis });
  s += ARROW(20, 80, 46, 80, COL.o, 3) + T(54, 84, ['contact normals', 'normales de contact'], { fs: 12, c: COL.axis });
  s += T(20, H - 20, ['12° < 26.6°: the grasp holds', '12° < 26,6° : la prise tient'], { fs: 14, c: COL.g, b: true });
  return FIG(`0 0 ${W} ${H}`, s);
}

export function partC() {
  return [
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['Grasping in practice: choose, size and test a gripper', 'La préhension en pratique : choisir, dimensionner et tester un préhenseur'],
  time: 24,
  goal: ['to choose a gripper from the part and the cycle, to compute the gripping force with the accelerations, to size a pneumatic gripper and a vacuum system, to check the robot payload and wrist moment, to know when a grasp holds (friction cones), and to test it like an engineer.',
    'choisir un préhenseur à partir de la pièce et du cycle, calculer la force de serrage avec les accélérations, dimensionner une pince pneumatique et un système de vide, vérifier la charge du robot et le moment au poignet, savoir quand une prise tient (cônes de frottement), et la tester comme un ingénieur.'],
  body: [
    P('In industry the gripper is often the part of the cell that fails first, and the one that is chosen last. This lesson follows the order an engineer uses: <strong>the part → the type of gripper → the force → the robot → the tests</strong>. It continues lesson 3 of “Robots in the real world”, which presents the families of end effectors.',
      'En industrie, le préhenseur est souvent la partie de la cellule qui tombe en panne en premier, et celle qu\'on choisit en dernier. Cette leçon suit l\'ordre d\'un ingénieur : <strong>la pièce → le type de préhenseur → la force → le robot → les essais</strong>. Elle prolonge la leçon 3 de « Les robots dans le monde réel », qui présente les familles d\'effecteurs.'),
    H4('8.1 Start from the part and the cycle', '8.1 Partir de la pièce et du cycle'),
    P('Before looking at a catalogue, write down the facts. Each line of this list removes some grippers:', 'Avant d\'ouvrir un catalogue, notez les faits. Chaque ligne de cette liste élimine des préhenseurs :'),
    TABLE([['Question', 'Question'], ['Why it matters', 'Pourquoi c\'est important']], [
      [['Mass, size and centre of mass of the part', 'Masse, taille et centre de masse de la pièce'], ['They give the force and the moment on the fingers and on the robot wrist.', 'Elles donnent la force et le moment sur les doigts et sur le poignet du robot.']],
      [['Material and surface (smooth, oily, porous, magnetic)', 'Matière et surface (lisse, grasse, poreuse, magnétique)'], ['They decide between friction, vacuum and magnet, and give μ.', 'Elles décident entre frottement, vide et aimant, et donnent μ.']],
      [['Fragility and allowed marks', 'Fragilité et marques permises'], ['A maximum force, soft pads, or a soft gripper.', 'Une force maximale, des patins souples, ou une pince souple.']],
      [['Where the part comes from (conveyor, tray, bin)', 'D\'où vient la pièce (convoyeur, plateau, bac)'], ['Free space around it: two sides for jaws, one face for a cup; a bin needs vision.', 'L\'espace libre autour : deux côtés pour des mors, une face pour une ventouse ; un bac demande la vision.']],
      [['Variants of parts', 'Variantes de pièces'], ['Long stroke, adaptive fingers, or a tool changer.', 'Grande course, doigts adaptatifs, ou changeur d\'outil.']],
      [['Cycle time and accelerations', 'Temps de cycle et accélérations'], ['They multiply the needed force; they also set the closing time.', 'Elles multiplient la force nécessaire ; elles fixent aussi le temps de fermeture.']],
      [['Environment (food, clean room, heat, dust)', 'Environnement (alimentaire, salle blanche, chaleur, poussière)'], ['Materials (silicone for food), sealing, no compressed air in a clean room.', 'Matériaux (silicone pour l\'alimentaire), étanchéité, pas d\'air comprimé en salle blanche.']]
    ]),
    TABLE([['If the part is…', 'Si la pièce est…'], ['First choice', 'Premier choix']], [
      [['rigid, with two parallel faces', 'rigide, avec deux faces parallèles'], ['parallel two-jaw gripper, fingers shaped to the part', 'pince parallèle à deux mors, doigts à la forme de la pièce']],
      [['flat, smooth, with a free top face (box, sheet, glass)', 'plate, lisse, avec une face du dessus libre (carton, tôle, verre)'], ['vacuum cups', 'ventouses']],
      [['round (shaft, bottle)', 'ronde (arbre, bouteille)'], ['V-shaped jaws or a three-jaw centric gripper', 'mors en V ou pince centrique à trois mors']],
      [['soft, fragile or always different (fruit, bags)', 'souple, fragile ou toujours différente (fruits, sachets)'], ['soft or adaptive gripper, low force', 'pince souple ou adaptative, faible force']],
      [['steel sheet', 'tôle d\'acier'], ['magnetic gripper (or vacuum)', 'pince magnétique (ou vide)']]
    ]),
    H4('8.2 The gripping force, with the accelerations', '8.2 La force de serrage, avec les accélérations'),
    P('With a <strong>friction grip</strong> (force-fit), the jaws hold the part only by friction. With <i>n</i> jaws pressing with a normal force <i>N</i> each, the friction must carry the weight <em>and</em> the inertia of the part during the fastest move, with a safety factor <i>S</i> (2 is usual):',
      'Avec une <strong>prise par frottement</strong> (adhérence), les mors tiennent la pièce seulement par frottement. Avec <i>n</i> mors qui appuient chacun avec une force normale <i>N</i>, le frottement doit porter le poids <em>et</em> l\'inertie de la pièce pendant le mouvement le plus rapide, avec un coefficient de sécurité <i>S</i> (2 en général) :'),
    EQ('<i>n</i> · <i>μ</i> · <i>N</i> ≥ <i>S</i> · <i>m</i> · ( <i>g</i> + <i>a</i> )' + SP + '⇒' + SP + '<i>N</i> ≥ <i>S</i> · <i>m</i> · ( <i>g</i> + <i>a</i> ) / ( <i>n</i> · <i>μ</i> )'),
    P('Here <i>a</i> is the largest acceleration of the robot that pulls the part along the fingers (an up move of the robot, or the braking of a down move). If the part is held in a <strong>V-shaped jaw</strong> of angle <i>α</i>, the wedge multiplies the friction: <i>μ</i><sub>eff</sub> = <i>μ</i> / sin(<i>α</i>/2), that is 1.41 × <i>μ</i> for a 90° V. With a <strong>form-fit</strong> grip (fingers that go under a shoulder or into a groove), the shape carries the load and the force only keeps the part in place.',
      'Ici <i>a</i> est la plus grande accélération du robot qui tire la pièce le long des doigts (une montée du robot, ou le freinage d\'une descente). Si la pièce est tenue dans un <strong>mors en V</strong> d\'angle <i>α</i>, le coin multiplie le frottement : <i>μ</i><sub>eff</sub> = <i>μ</i> / sin(<i>α</i>/2), soit 1,41 × <i>μ</i> pour un V à 90°. Avec une prise par <strong>forme</strong> (doigts qui passent sous un épaulement ou dans une gorge), la forme porte la charge et la force sert seulement à garder la pièce en place.'),
    BOX('example', ['Worked example: a 2 kg steel part', 'Exemple résolu : une pièce d\'acier de 2 kg'],
      P('<i>m</i> = 2 kg, <i>a</i> = 5 m/s², <i>S</i> = 2, two jaws, so <i>S</i> · <i>m</i> · (<i>g</i> + <i>a</i>) = 2 × 2 × 14.81 = 59.2 N to carry by friction.',
        '<i>m</i> = 2 kg, <i>a</i> = 5 m/s², <i>S</i> = 2, deux mors, donc <i>S</i> · <i>m</i> · (<i>g</i> + <i>a</i>) = 2 × 2 × 14,81 = 59,2 N à porter par frottement.'),
      UL([
        ['Steel fingers on steel (<i>μ</i> = 0.15): <i>N</i> = 59.2 / (2 × 0.15) ≈ <strong>197 N</strong> per jaw.', 'Doigts acier sur acier (<i>μ</i> = 0,15) : <i>N</i> = 59,2 / (2 × 0,15) ≈ <strong>197 N</strong> par mors.'],
        ['The same with 90° V-jaws (<i>μ</i><sub>eff</sub> = 0.21): <strong>140 N</strong>.', 'La même chose avec des mors en V à 90° (<i>μ</i><sub>eff</sub> = 0,21) : <strong>140 N</strong>.'],
        ['Rubber pads (<i>μ</i> = 0.8): <strong>37 N</strong>, a gripper five times smaller.', 'Des patins en caoutchouc (<i>μ</i> = 0,8) : <strong>37 N</strong>, une pince cinq fois plus petite.']
      ])),
    H4('8.3 Pneumatic or electric gripper', '8.3 Pince pneumatique ou électrique'),
    P('A <strong>pneumatic</strong> gripper is a piston: its force is the pressure times the piston area, reduced by the efficiency of the mechanism. At 6 bar with a 25 mm piston: <i>A</i> = π × 0.0125² = 4.9·10⁻⁴ m², <i>F</i> = 6·10⁵ × 4.9·10⁻⁴ ≈ 295 N, about 118 N per jaw after a mechanism efficiency of 0.8. Plan the force at the <em>lowest</em> pressure of the factory network (often 5 bar, not 6).',
      'Une pince <strong>pneumatique</strong> est un piston : sa force est la pression fois la surface du piston, réduite par le rendement du mécanisme. À 6 bar avec un piston de 25 mm : <i>A</i> = π × 0,0125² = 4,9·10⁻⁴ m², <i>F</i> = 6·10⁵ × 4,9·10⁻⁴ ≈ 295 N, environ 118 N par mors après un rendement de mécanisme de 0,8. Prévoyez la force à la pression la plus <em>basse</em> du réseau de l\'usine (souvent 5 bar, pas 6).'),
    EQ('<i>F</i><sub>piston</sub> = <i>p</i> · π <i>D</i>² / 4' + SP + '<i>N</i><sub>jaw</sub> ≈ <i>η</i> · <i>F</i><sub>piston</sub> / <i>n</i>', '<i>F</i><sub>piston</sub> = <i>p</i> · π <i>D</i>² / 4' + SP + '<i>N</i><sub>mors</sub> ≈ <i>η</i> · <i>F</i><sub>piston</sub> / <i>n</i>'),
    TABLE([['', ''], ['Pneumatic', 'Pneumatique'], ['Electric', 'Électrique']], [
      [['Force', 'Force'], ['high for its size, fixed by the pressure', 'élevée pour sa taille, fixée par la pression'], ['set by the program, measured', 'réglée par le programme, mesurée']],
      [['Position of the jaws', 'Position des mors'], ['open / closed (two sensors)', 'ouvert / fermé (deux capteurs)'], ['known all the time: it checks the part size', 'connue en permanence : elle vérifie la taille de la pièce']],
      [['Speed', 'Vitesse'], ['very fast (0.05 to 0.2 s)', 'très rapide (0,05 à 0,2 s)'], ['slower (0.2 to 0.5 s)', 'plus lente (0,2 à 0,5 s)']],
      [['Needs', 'Besoins'], ['compressed air, valves, tubes', 'un câble, une alimentation 24 V']],
      [['Best for', 'Idéal pour'], ['simple, fast, robust production', 'cobots, fragile parts, many variants, clean rooms', ]]
    ]),
    H4('8.4 Sizing a vacuum system', '8.4 Dimensionner un système de vide'),
    P('A cup holds with the pressure difference times its area. The safety factor depends on how the load pulls on the cup: <strong>along its axis</strong> (cup on the top face of a box) <i>S</i> = 2 is usual; <strong>across</strong> it (cup on a vertical face), only friction holds and the force is divided by <i>μ</i> (about 0.5), so <i>S</i> = 4 or more.',
      'Une ventouse tient avec la différence de pression fois sa surface. Le coefficient de sécurité dépend de la façon dont la charge tire sur la ventouse : <strong>dans son axe</strong> (ventouse sur la face du dessus d\'un carton) <i>S</i> = 2 est courant ; <strong>en travers</strong> (ventouse sur une face verticale), seul le frottement tient et la force est divisée par <i>μ</i> (environ 0,5), donc <i>S</i> = 4 ou plus.'),
    EQ('<i>F</i><sub>cup</sub> = Δ<i>P</i> · π <i>d</i>² / 4' + SP + 'number of cups ≥ <i>S</i> · <i>m</i> · ( <i>g</i> + <i>a</i> ) / <i>F</i><sub>cup</sub>', '<i>F</i><sub>ventouse</sub> = Δ<i>P</i> · π <i>d</i>² / 4' + SP + 'nombre de ventouses ≥ <i>S</i> · <i>m</i> · ( <i>g</i> + <i>a</i> ) / <i>F</i><sub>ventouse</sub>'),
    BOX('example', ['Worked example: a 6 kg box', 'Exemple résolu : un carton de 6 kg'],
      P('Cups on the top face, <i>a</i> = 5 m/s², <i>S</i> = 2: the cups must give 2 × 6 × 14.81 ≈ 178 N. One 40 mm cup at Δ<i>P</i> = 60 kPa gives 60 000 × π × 0.02² ≈ 75 N, so 178 / 75 = 2.4 → <strong>3 cups</strong>, and 4 in practice to keep the box level and to tolerate one leaking cup. Cardboard is porous: choose the vacuum generator by its <em>flow</em>, and check the real vacuum with the real boxes.',
        'Ventouses sur la face du dessus, <i>a</i> = 5 m/s², <i>S</i> = 2 : les ventouses doivent donner 2 × 6 × 14,81 ≈ 178 N. Une ventouse de 40 mm à Δ<i>P</i> = 60 kPa donne 60 000 × π × 0,02² ≈ 75 N, donc 178 / 75 = 2,4 → <strong>3 ventouses</strong>, et 4 en pratique pour garder le carton à plat et tolérer une ventouse qui fuit. Le carton est poreux : choisissez le générateur de vide sur son <em>débit</em>, et vérifiez le vide réel avec les vrais cartons.')),
    UL([
      ['<strong>Vacuum generator</strong>: a venturi ejector (compressed air, small, fast, but it uses air all the time) or an electric pump (efficient, for big flows or no air).', '<strong>Générateur de vide</strong> : un éjecteur venturi (air comprimé, petit, rapide, mais il consomme de l\'air en permanence) ou une pompe électrique (efficace, pour les gros débits ou sans air).'],
      ['<strong>Cup</strong>: flat for smooth flat parts (precise), bellows for uneven or slightly inclined surfaces; silicone for food and heat, NBR for oily parts.', '<strong>Ventouse</strong> : plate pour les pièces planes et lisses (précise), à soufflet pour les surfaces irrégulières ou un peu inclinées ; silicone pour l\'alimentaire et la chaleur, NBR pour les pièces grasses.'],
      ['<strong>Sensing and release</strong>: a vacuum switch confirms the grasp before the robot moves; a short blow of air releases the part at once.', '<strong>Détection et relâchement</strong> : un vacuostat confirme la prise avant que le robot bouge ; un petit souffle d\'air relâche la pièce tout de suite.']
    ]),
    H4('8.5 Check the robot: payload and wrist moment', '8.5 Vérifier le robot : charge utile et moment au poignet'),
    P('The robot carries the gripper <em>and</em> the part. The payload of the data sheet is a mass at a given distance from the flange: the <strong>load diagram</strong> of the robot gives the allowed mass for each offset of the centre of mass. Compute the total mass and its centre of mass along the tool axis:',
      'Le robot porte le préhenseur <em>et</em> la pièce. La charge utile de la fiche technique est une masse à une distance donnée de la bride : le <strong>diagramme de charge</strong> du robot donne la masse permise pour chaque décalage du centre de masse. Calculez la masse totale et son centre de masse le long de l\'axe de l\'outil :'),
    EQ('<i>m</i><sub>t</sub> = <i>m</i><sub>g</sub> + <i>m</i><sub>p</sub>' + SP + '<i>d</i> = ( <i>m</i><sub>g</sub> <i>d</i><sub>g</sub> + <i>m</i><sub>p</sub> <i>d</i><sub>p</sub> ) / <i>m</i><sub>t</sub>' + SP + '<i>M</i><sub>wrist</sub> = <i>m</i><sub>t</sub> · <i>g</i> · <i>d</i>', '<i>m</i><sub>t</sub> = <i>m</i><sub>p</sub> + <i>m</i><sub>pi</sub>' + SP + '<i>d</i> = ( <i>m</i><sub>p</sub> <i>d</i><sub>p</sub> + <i>m</i><sub>pi</sub> <i>d</i><sub>pi</sub> ) / <i>m</i><sub>t</sub>' + SP + '<i>M</i><sub>poignet</sub> = <i>m</i><sub>t</sub> · <i>g</i> · <i>d</i>'),
    P('Example: a 1.2 kg gripper with its centre of mass at 0.06 m and a 2 kg part at 0.15 m: <i>m</i><sub>t</sub> = 3.2 kg, <i>d</i> = (0.072 + 0.30) / 3.2 ≈ 0.116 m, and the static moment on the wrist is 3.2 × 9.81 × 0.116 ≈ <strong>3.6 N·m</strong>. A 5 kg robot may accept 5 kg at 0.05 m but only about 3 kg at 0.12 m: always read the load diagram, and enter the real tool data in the controller (mass, centre of mass, inertia), otherwise the dynamics and the collision detection are wrong.',
      'Exemple : un préhenseur de 1,2 kg avec son centre de masse à 0,06 m et une pièce de 2 kg à 0,15 m : <i>m</i><sub>t</sub> = 3,2 kg, <i>d</i> = (0,072 + 0,30) / 3,2 ≈ 0,116 m, et le moment statique au poignet vaut 3,2 × 9,81 × 0,116 ≈ <strong>3,6 N·m</strong>. Un robot de 5 kg peut accepter 5 kg à 0,05 m mais seulement environ 3 kg à 0,12 m : lisez toujours le diagramme de charge, et entrez les vraies données de l\'outil dans le contrôleur (masse, centre de masse, inertie), sinon la dynamique et la détection de collision sont fausses.'),
    H4('8.6 When does a grasp hold? Friction cones', '8.6 Quand une prise tient-elle ? Les cônes de frottement'),
    P('At a contact, the force can lean away from the normal by at most the angle arctan <i>μ</i> without slipping: the possible forces form a <strong>friction cone</strong>. For two fingers (an <strong>antipodal grasp</strong>), the part can be squeezed and held in any direction if the line between the two contacts lies inside both cones. In practice: the angle between each contact normal and the line joining the contacts must be smaller than arctan <i>μ</i>.',
      'À un contact, la force peut s\'écarter de la normale d\'au plus l\'angle arctan <i>μ</i> sans glisser : les forces possibles forment un <strong>cône de frottement</strong>. Pour deux doigts (une <strong>prise antipodale</strong>), la pièce peut être serrée et tenue dans toutes les directions si la droite entre les deux contacts est dans les deux cônes. En pratique : l\'angle entre chaque normale de contact et la droite qui relie les contacts doit être plus petit que arctan <i>μ</i>.'),
    coneFigure(),
    P('With <i>μ</i> = 0.5 the cone is 26.6° wide on each side, so a part with sides tilted by 12° is held; with <i>μ</i> = 0.15 (steel on steel, 8.5°) the same part is squeezed out of the fingers like a wet soap. This is why tapered or round parts need shaped fingers. With more fingers, the general tool is the <strong>grasp matrix</strong> <i>G</i>, which maps the contact forces to the wrench on the part: a grasp has <strong>force closure</strong> if, with forces inside the cones, <i>G</i> can produce any wrench.',
      'Avec <i>μ</i> = 0,5 le cône fait 26,6° de chaque côté, donc une pièce aux flancs inclinés de 12° est tenue ; avec <i>μ</i> = 0,15 (acier sur acier, 8,5°) la même pièce est chassée des doigts comme un savon mouillé. C\'est pourquoi les pièces coniques ou rondes demandent des doigts profilés. Avec plus de doigts, l\'outil général est la <strong>matrice de prise</strong> <i>G</i>, qui transforme les forces de contact en torseur sur la pièce : une prise a la <strong>fermeture en force</strong> si, avec des forces dans les cônes, <i>G</i> peut produire n\'importe quel torseur.'),
    H4('8.7 Test the grasp like an engineer', '8.7 Tester la prise comme un ingénieur'),
    OL([
      ['<strong>Check the grasp before moving</strong>: jaw position in the expected window (electric gripper), end-of-stroke sensor, or vacuum switch.', '<strong>Vérifier la prise avant de bouger</strong> : position des mors dans la fenêtre attendue (pince électrique), capteur de fin de course, ou vacuostat.'],
      ['<strong>Shake test</strong>: run the real cycle at 100 % speed and acceleration with the lightest and the heaviest parts, then with oily or dusty parts.', '<strong>Essai de secousse</strong> : faire le vrai cycle à 100 % de vitesse et d\'accélération avec les pièces les plus légères et les plus lourdes, puis avec des pièces grasses ou poussiéreuses.'],
      ['<strong>Loss of energy</strong>: cut the air or the power during a move. A spring, a self-locking gear or a check valve must keep the part.', '<strong>Perte d\'énergie</strong> : couper l\'air ou le courant pendant un mouvement. Un ressort, un engrenage irréversible ou un clapet anti-retour doit garder la pièce.'],
      ['<strong>Endurance</strong>: thousands of cycles; check wear of pads and cups, and the drift of the part position in the fingers.', '<strong>Endurance</strong> : des milliers de cycles ; vérifier l\'usure des patins et des ventouses, et la dérive de la position de la pièce dans les doigts.']
    ]),
    TABLE([['Symptom', 'Symptôme'], ['Usual cause', 'Cause habituelle'], ['Remedy', 'Remède']], [
      [['the part slips down', 'la pièce glisse vers le bas'], ['force too low, μ lower than thought (oil)', 'force trop faible, μ plus bas que prévu (huile)'], ['pads, V-jaws, form-fit, more force', 'patins, mors en V, prise par forme, plus de force']],
      [['the part turns in the fingers', 'la pièce tourne dans les doigts'], ['centre of mass far from the fingers', 'centre de masse loin des doigts'], ['grasp closer to the centre of mass, longer contacts', 'saisir plus près du centre de masse, contacts plus longs']],
      [['vacuum lost during the move', 'vide perdu pendant le mouvement'], ['porous part, worn cup, small flow', 'pièce poreuse, ventouse usée, petit débit'], ['bigger flow, bellows cups, foam seal', 'plus de débit, ventouses à soufflet, joint mousse']],
      [['the part stays stuck on release', 'la pièce reste collée au relâchement'], ['residual vacuum or magnetism, sticky part', 'vide ou magnétisme résiduel, pièce collante'], ['blow-off pulse, ejector pin', 'souffle de relâchement, poussoir']],
      [['grasp fails on some parts only', 'la prise rate sur certaines pièces seulement'], ['position error of the part', 'erreur de position de la pièce'], ['chamfers and self-centring fingers, compliance, vision', 'chanfreins et doigts autocentreurs, souplesse, vision']]
    ]),
    BOX('keep', ['Remember', 'À retenir'],
      UL([
        ['Choose the gripper with the part, at the start of the project, not at the end.', 'Choisissez le préhenseur avec la pièce, au début du projet, pas à la fin.'],
        ['Size with the worst case: lowest μ, lowest pressure, highest acceleration, and a safety factor.', 'Dimensionnez sur le pire cas : μ le plus bas, pression la plus basse, accélération la plus haute, et un coefficient de sécurité.'],
        ['Always prove the grasp with real parts at full speed, and check what happens when the energy is lost.', 'Prouvez toujours la prise avec de vraies pièces à pleine vitesse, et vérifiez ce qui se passe en cas de perte d\'énergie.']
      ]))
  ],
  terms: [['force-fit / form-fit grip', 'prise par frottement / par forme'], ['safety factor S', 'coefficient de sécurité S'], ['V-jaw', 'mors en V'], ['pneumatic / electric gripper', 'pince pneumatique / électrique'], ['vacuum cup, venturi ejector', 'ventouse, éjecteur venturi'], ['load diagram', 'diagramme de charge'], ['friction cone', 'cône de frottement'], ['antipodal grasp', 'prise antipodale'], ['force closure', 'fermeture en force']],
  quiz: [
    ['Why does the gripping force depend on the acceleration of the robot?', 'Pourquoi la force de serrage dépend-elle de l\'accélération du robot ?', 'Because the friction must carry the weight and also the inertia m·a of the part during the fastest moves: N ≥ S m (g + a) / (n μ).', 'Parce que le frottement doit porter le poids et aussi l\'inertie m·a de la pièce pendant les mouvements les plus rapides : N ≥ S m (g + a) / (n μ).'],
    ['Why is a vacuum cup on a vertical face less efficient than on a top face?', 'Pourquoi une ventouse sur une face verticale est-elle moins efficace que sur une face du dessus ?', 'On a vertical face the load is across the cup: only the friction of the cup holds it, so the force is divided by μ (about 0.5) and a larger safety factor is used.', 'Sur une face verticale, la charge est en travers de la ventouse : seul le frottement de la ventouse la tient, donc la force est divisée par μ (environ 0,5) et on prend un coefficient de sécurité plus grand.'],
    ['What must you check on the robot when you choose a gripper?', 'Que faut-il vérifier sur le robot quand on choisit un préhenseur ?', 'The total mass (gripper + part) and its centre of mass against the load diagram, the wrist moment, and enter the tool data in the controller.', 'La masse totale (préhenseur + pièce) et son centre de masse sur le diagramme de charge, le moment au poignet, et entrer les données de l\'outil dans le contrôleur.']
  ],
  link: ['learn-world.html#l3', 'Review the families of end effectors (Robots in the real world, lesson 3) →', 'Revoir les familles d\'effecteurs (Le monde réel, leçon 3) →']
})
  ];
}
