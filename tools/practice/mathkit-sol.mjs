// mathkit-sol.mjs — detailed solutions of the worked exercises of the maths kit (learn-mathkit.html), in the order of
// tools/practice/mathkit.mjs: for each exercise, the rule used and where it is in the course, the steps, a table when the
// answer is a table, and the answer. SOL[lesson][k] is the solution of exercise k of that lesson.
import { SX } from '../lib.mjs';

const W = (n, en, fr) => [`lesson ${n} — ${en}`, `leçon ${n} — ${fr}`];
const I = (s, i) => `${s}<sub>${i}</sub>`;

export const SOL = {
  1: [
    SX({ rule: ['radians = degrees × π / 180', 'radians = degrés × π / 180'], where: W(1, '1.1 Degrees and radians', '1.1 Degrés et radians'),
      steps: [['Write the rule with 60°: 60 × π / 180.', 'Écrivez la règle avec 60° : 60 × π / 180.'], ['Simplify: 60 / 180 = 1/3, so the angle is π/3.', 'Simplifiez : 60 / 180 = 1/3, donc l\'angle vaut π/3.'], ['Compute: 3.1416 / 3 = 1.047.', 'Calculez : 3,1416 / 3 = 1,047.']],
      ans: ['<b>π/3 ≈ 1.047 rad</b>', '<b>π/3 ≈ 1,047 rad</b>'] }),
    SX({ rule: ['end of an arm of length L at the angle θ: x = L cos θ, y = L sin θ', 'bout d\'un bras de longueur L à l\'angle θ : x = L cos θ, y = L sin θ'], where: W(1, '1.2 Sine and cosine', '1.2 Sinus et cosinus'),
      steps: [['L = 1.2 m and θ = 45°.', 'L = 1,2 m et θ = 45°.'], ['cos 45° = 0.707 (table of 1.2).', 'cos 45° = 0,707 (tableau du 1.2).'], ['x = 1.2 × 0.707 = 0.849 m. (y is the same, because sin 45° = cos 45°.)', 'x = 1,2 × 0,707 = 0,849 m. (y vaut la même chose, car sin 45° = cos 45°.)']],
      ans: ['<b>x ≈ 0.849 m</b>', '<b>x ≈ 0,849 m</b>'] }),
    SX({ rule: ['the angle of a point (x, y) is atan2(y, x), which looks at the signs of x and y', 'l\'angle d\'un point (x, y) est atan2(y, x), qui regarde les signes de x et de y'], where: W(1, '1.3 Two formulas you will meet everywhere', '1.3 Deux formules que vous croiserez partout'),
      steps: [['Place the point: x = −1 (left), y = 1 (up): upper-left quadrant, between 90° and 180°.', 'Placez le point : x = −1 (à gauche), y = 1 (en haut) : quadrant en haut à gauche, entre 90° et 180°.'], ['The point makes 45° with the negative x axis (|y| = |x|).', 'Le point fait 45° avec l\'axe x négatif (|y| = |x|).'], ['So the angle is 180° − 45° = 135°.', 'Donc l\'angle vaut 180° − 45° = 135°.'], ['Trap: arctan(y / x) = arctan(−1) = −45° points the other way: it does not know the signs.', 'Piège : arctan(y / x) = arctan(−1) = −45° pointe dans l\'autre sens : il ne connaît pas les signes.']],
      ans: ['<b>135°</b>', '<b>135°</b>'] })
  ],
  2: [
    SX({ rule: ['length of a vector: √(x² + y²)', 'longueur d\'un vecteur : √(x² + y²)'], where: W(2, '2.3 Length, scaling, unit vector', '2.3 Longueur, mise à l\'échelle, vecteur unitaire'),
      steps: [['Square the components: 3² = 9, 4² = 16.', 'Élevez les composantes au carré : 3² = 9, 4² = 16.'], ['Add them: 9 + 16 = 25.', 'Additionnez : 9 + 16 = 25.'], ['Take the root: √25 = 5.', 'Prenez la racine : √25 = 5.']],
      ans: ['<b>5</b>', '<b>5</b>'] }),
    SX({ rule: ['to chain two moves, add the vectors component by component (the tool = the sum of the arrows of the links)', 'pour enchaîner deux déplacements, on additionne les vecteurs composante par composante (l\'outil = la somme des flèches des segments)'], where: W(2, '2.2 Adding vectors', '2.2 Additionner des vecteurs'),
      table: { head: [['', ''], 'x (m)', 'y (m)'], rows: [[['link 1', 'segment 1'], '0.4', '0.3'], [['link 2', 'segment 2'], '0.1', '0.5'], [['<b>tool = sum</b>', '<b>outil = somme</b>'], '<b>0.5</b>', '<b>0.8</b>']] },
      steps: [['Add the x: 0.4 + 0.1 = 0.5.', 'Additionnez les x : 0,4 + 0,1 = 0,5.'], ['Add the y: 0.3 + 0.5 = 0.8.', 'Additionnez les y : 0,3 + 0,5 = 0,8.']],
      ans: ['<b>y = 0.8 m</b>', '<b>y = 0,8 m</b>'] }),
    SX({ rule: ['the part of a vector v along a unit vector u is the dot product u · v = uₓvₓ + uᵧvᵧ', 'la part d\'un vecteur v selon un vecteur unitaire u est le produit scalaire u · v = uₓvₓ + uᵧvᵧ'], where: W(2, '2.4 The dot product', '2.4 Le produit scalaire'),
      steps: [['Check that u = (0.6, 0.8) is a unit vector: √(0.36 + 0.64) = 1. ✓', 'Vérifiez que u = (0,6 ; 0,8) est unitaire : √(0,36 + 0,64) = 1. ✓'], ['Multiply component by component: 0.3 × 0.6 = 0.18 and 0.4 × 0.8 = 0.32.', 'Multipliez composante par composante : 0,3 × 0,6 = 0,18 et 0,4 × 0,8 = 0,32.'], ['Add: 0.18 + 0.32 = 0.5 m/s.', 'Additionnez : 0,18 + 0,32 = 0,5 m/s.'], ['Check: the full speed is √(0.3² + 0.4²) = 0.5 m/s too: the robot moves exactly forward.', 'Vérification : la vitesse totale vaut aussi √(0,3² + 0,4²) = 0,5 m/s : le robot avance exactement vers l\'avant.']],
      ans: ['<b>0.5 m/s</b>', '<b>0,5 m/s</b>'] })
  ],
  3: [
    SX({ rule: ['matrix × vector: each component = one row of the matrix “times” the column (multiply term by term, then add)', 'matrice × vecteur : chaque composante = une ligne de la matrice « fois » la colonne (multiplier terme à terme, puis additionner)'], where: W(3, '3.1 A table that transforms a vector', '3.1 Un tableau qui transforme un vecteur'),
      steps: [['First row (2, 0) times the column (4, 1): 2 × 4 + 0 × 1 = 8.', 'Première ligne (2, 0) fois la colonne (4, 1) : 2 × 4 + 0 × 1 = 8.'], ['Second row (1, 3): 1 × 4 + 3 × 1 = 7.', 'Deuxième ligne (1, 3) : 1 × 4 + 3 × 1 = 7.'], ['Result: (8, 7).', 'Résultat : (8, 7).']],
      ans: ['<b>8</b>', '<b>8</b>'] }),
    SX({ rule: ['determinant of a 2×2 matrix with rows (a, b) and (c, d): det = ad − bc', 'déterminant d\'une matrice 2×2 de lignes (a, b) et (c, d) : dét = ad − bc'], where: W(3, '3.3 Four words to know', '3.3 Quatre mots à connaître'),
      steps: [['Read a = 3, b = 2, c = 1, d = 4.', 'Lisez a = 3, b = 2, c = 1, d = 4.'], ['ad = 3 × 4 = 12 and bc = 2 × 1 = 2.', 'ad = 3 × 4 = 12 et bc = 2 × 1 = 2.'], ['det = 12 − 2 = 10.', 'dét = 12 − 2 = 10.']],
      ans: ['<b>10</b>', '<b>10</b>'] }),
    SX({ rule: ['a matrix can be inverted only if its determinant is not 0', 'une matrice ne s\'inverse que si son déterminant n\'est pas nul'], where: W(3, '3.3 Four words to know', '3.3 Quatre mots à connaître'),
      steps: [['det = ad − bc = 2 × 2 − 4 × 1 = 4 − 4 = 0.', 'dét = ad − bc = 2 × 2 − 4 × 1 = 4 − 4 = 0.'], ['The columns (2, 1) and (4, 2) point in the same direction (the second is twice the first): the matrix flattens the plane onto a line.', 'Les colonnes (2, 1) et (4, 2) pointent dans la même direction (la deuxième vaut deux fois la première) : la matrice aplatit le plan sur une droite.'], ['A flattened plane cannot be unfolded: no inverse. For a robot Jacobian, this is a singularity.', 'Un plan aplati ne peut pas être déplié : pas d\'inverse. Pour la jacobienne d\'un robot, c\'est une singularité.']],
      ans: ['<b>No: its determinant is 0</b>', '<b>Non : son déterminant est nul</b>'] })
  ],
  4: [
    SX({ rule: ['the columns of R(θ) are where the axes go: (cos θ, sin θ) and (−sin θ, cos θ)', 'les colonnes de R(θ) sont là où vont les axes : (cos θ, sin θ) et (−sin θ, cos θ)'], where: W(4, '4.1 Build it from its columns', '4.1 La construire à partir de ses colonnes'),
      steps: [['(1, 0) is the x axis, so its image is the first column of R(90°).', '(1, 0) est l\'axe x, donc son image est la première colonne de R(90°).'], ['(cos 90°, sin 90°) = (0, 1).', '(cos 90°, sin 90°) = (0, 1).']],
      ans: ['<b>y = 1</b>', '<b>y = 1</b>'] }),
    SX({ rule: ['x′ = cos θ · x − sin θ · y, y′ = sin θ · x + cos θ · y (R(θ) times the vector)', 'x′ = cos θ · x − sin θ · y, y′ = sin θ · x + cos θ · y (R(θ) fois le vecteur)'], where: W(4, '4.1 Build it from its columns', '4.1 La construire à partir de ses colonnes'),
      steps: [['cos 60° = 0.5 and sin 60° = 0.866.', 'cos 60° = 0,5 et sin 60° = 0,866.'], ['x′ = 0.5 × 2 − 0.866 × 0 = 1.', 'x′ = 0,5 × 2 − 0,866 × 0 = 1.'], ['(y′ = 0.866 × 2 + 0.5 × 0 = 1.73; check: √(1² + 1.73²) = 2, the length is kept.)', '(y′ = 0,866 × 2 + 0,5 × 0 = 1,73 ; vérification : √(1² + 1,73²) = 2, la longueur est gardée.)']],
      ans: ['<b>x = 1</b>', '<b>x = 1</b>'] }),
    SX({ rule: ['in the plane, two rotations add: R(a) R(b) = R(a + b)', 'dans le plan, deux rotations s\'ajoutent : R(a) R(b) = R(a + b)'], where: W(4, '4.2 Four properties to remember', '4.2 Quatre propriétés à retenir'),
      steps: [['The tool is turned by joint 1, then by joint 2: R(30°) R(−50°).', 'L\'outil est tourné par la liaison 1, puis par la liaison 2 : R(30°) R(−50°).'], ['Add the angles: 30° + (−50°) = −20°.', 'Additionnez les angles : 30° + (−50°) = −20°.']],
      ans: ['<b>−20°</b>', '<b>−20°</b>'] })
  ],
  5: [
    SX({ rule: ['change of frame: p_A = R p_B + t; with no rotation, R = I', 'changement de repère : p_A = R p_B + t ; sans rotation, R = I'], where: W(5, '5.1 The same point, seen from two frames', '5.1 Le même point, vu depuis deux repères'),
      steps: [['No rotation: R p_B = p_B = (0.5, 0.3).', 'Pas de rotation : R p_B = p_B = (0,5 ; 0,3).'], ['Add t = (2, 1): (0.5 + 2, 0.3 + 1) = (2.5, 1.3).', 'Ajoutez t = (2, 1) : (0,5 + 2 ; 0,3 + 1) = (2,5 ; 1,3).']],
      ans: ['<b>x = 2.5</b>', '<b>x = 2,5</b>'] }),
    SX({ rule: ['change of frame: p_A = R p_B + t (turn first, then add the position of B)', 'changement de repère : p_A = R p_B + t (tourner d\'abord, puis ajouter la position de B)'], where: W(5, '5.1 The same point, seen from two frames', '5.1 Le même point, vu depuis deux repères'),
      steps: [['R(90°) has the columns (0, 1) and (−1, 0).', 'R(90°) a pour colonnes (0, 1) et (−1, 0).'], ['R(90°)(3, 0) = 3 × (0, 1) = (0, 3).', 'R(90°)(3, 0) = 3 × (0, 1) = (0, 3).'], ['Add t = (1, 2): (0 + 1, 3 + 2) = (1, 5).', 'Ajoutez t = (1, 2) : (0 + 1 ; 3 + 2) = (1, 5).']],
      ans: ['<b>y = 5</b>', '<b>y = 5</b>'] }),
    SX({ rule: ['chaining frames: the tool is the sum of the links, each one at the sum of the angles before it (⁰T₂ = ⁰T₁ ¹T₂)', 'enchaîner les repères : l\'outil est la somme des segments, chacun à la somme des angles qui le précèdent (⁰T₂ = ⁰T₁ ¹T₂)'], where: W(5, '5.3 Chaining frames', '5.3 Enchaîner les repères'),
      table: { head: [['link', 'segment'], ['angle', 'angle'], 'x', 'y'], rows: [['1', 'θ₁ = 90°', '1 × cos 90° = 0', '1 × sin 90° = 1'], ['2', 'θ₁ + θ₂ = 0°', '1 × cos 0° = 1', '1 × sin 0° = 0'], [['<b>tool</b>', '<b>outil</b>'], '', '<b>1</b>', '<b>1</b>']] },
      ans: ['<b>x = 1 m</b>', '<b>x = 1 m</b>'] })
  ],
  6: [
    SX({ rule: ['with the DH placement rules, one frame to the next needs only 4 numbers', 'avec les règles de placement DH, passer d\'un repère au suivant ne demande que 4 nombres'], where: W(6, '6.1 The problem: too much freedom', '6.1 Le problème : trop de liberté'),
      steps: [['A free frame needs 6 numbers (3 for the position, 3 for the orientation).', 'Un repère libre demande 6 nombres (3 pour la position, 3 pour l\'orientation).'], ['The rules (z on the joint axis, x on the common perpendicular) remove 2 of them.', 'Les règles (z sur l\'axe de la liaison, x sur la perpendiculaire commune) en suppriment 2.'], ['What is left: θ, d, a, α.', 'Il reste : θ, d, a, α.']],
      ans: ['<b>4</b>', '<b>4</b>'] }),
    SX({ rule: ['for a planar arm, the DH table gives x = a₁ cos θ₁ + a₂ cos(θ₁ + θ₂), y = a₁ sin θ₁ + a₂ sin(θ₁ + θ₂)', 'pour un bras plan, le tableau DH donne x = a₁ cos θ₁ + a₂ cos(θ₁ + θ₂), y = a₁ sin θ₁ + a₂ sin(θ₁ + θ₂)'], where: W(6, '6.7 The matrix of one row', '6.7 La matrice d\'une ligne'),
      table: { head: ['i', 'θᵢ', 'dᵢ', 'aᵢ', 'αᵢ'], rows: [['1', '0°', '0', '0.6', '0'], ['2', '90°', '0', '0.3', '0']] },
      steps: [['Link 1 at 0°: (0.6, 0).', 'Segment 1 à 0° : (0,6 ; 0).'], ['Link 2 at 0° + 90° = 90°: (0.3 cos 90°, 0.3 sin 90°) = (0, 0.3).', 'Segment 2 à 0° + 90° = 90° : (0,3 cos 90° ; 0,3 sin 90°) = (0 ; 0,3).'], ['Tool: (0.6, 0.3).', 'Outil : (0,6 ; 0,3).']],
      ans: ['<b>y = 0.3 m</b>', '<b>y = 0,3 m</b>'] }),
    SX({ rule: ['the 3-axis arm: z = d₁ + a₂ sin θ₂ + a₃ sin(θ₂ + θ₃) (the shoulder height, then each link at its angle)', 'le bras à 3 axes : z = d₁ + a₂ sin θ₂ + a₃ sin(θ₂ + θ₃) (la hauteur de l\'épaule, puis chaque segment à son angle)'], where: W(6, '6.6 Worked example: the 3-axis arm', '6.6 Exemple corrigé : le bras à 3 axes'),
      table: { head: ['i', 'θᵢ', 'dᵢ', 'aᵢ', 'αᵢ'], rows: [['1', '0°', '0.40', '0', '90°'], ['2', '90°', '0', '0.45', '0'], ['3', '−90°', '0', '0.38', '0']] },
      steps: [['Shoulder: d₁ = 0.40 m.', 'Épaule : d₁ = 0,40 m.'], ['Upper arm at θ₂ = 90° (vertical): 0.45 × sin 90° = 0.45.', 'Bras à θ₂ = 90° (vertical) : 0,45 × sin 90° = 0,45.'], ['Forearm at θ₂ + θ₃ = 0° (horizontal): 0.38 × sin 0° = 0.', 'Avant-bras à θ₂ + θ₃ = 0° (horizontal) : 0,38 × sin 0° = 0.'], ['z = 0.40 + 0.45 + 0 = 0.85 m.', 'z = 0,40 + 0,45 + 0 = 0,85 m.']],
      ans: ['<b>z = 0.85 m</b>', '<b>z = 0,85 m</b>'] })
  ],
  7: [
    SX({ rule: ['in DHM, row j holds a<sub>j−1</sub>: the distance from z<sub>j−1</sub> to z<sub>j</sub>, that is the link before joint j', 'en DHM, la ligne j contient a<sub>j−1</sub> : la distance de z<sub>j−1</sub> à z<sub>j</sub>, c\'est-à-dire le segment avant la liaison j'], where: W(7, '7.3 The four parameters', '7.3 Les quatre paramètres'),
      table: { head: ['j', 'α<sub>j−1</sub>', 'a<sub>j−1</sub>', 'θⱼ', 'dⱼ'], rows: [['1', '0', '0', 'θ₁', '0'], ['2', '0', '<b>L₁</b>', 'θ₂', '0'], [['E (tool)', 'E (outil)'], '0', 'L₂', '0', '0']] },
      steps: [['L₁ goes from joint 1 to joint 2: it is a₁.', 'L₁ va de la liaison 1 à la liaison 2 : c\'est a₁.'], ['a₁ is in the row j = 2 (a<sub>j−1</sub> with j − 1 = 1).', 'a₁ est dans la ligne j = 2 (a<sub>j−1</sub> avec j − 1 = 1).']],
      ans: ['<b>row 2</b>', '<b>ligne 2</b>'] }),
    SX({ rule: ['a DHM row moves along x by a first, then turns around z by θ: ʲ⁻¹Tⱼ = Rot(x, α) Trans(x, a) Rot(z, θ) Trans(z, d)', 'une ligne DHM avance de a selon x d\'abord, puis tourne de θ autour de z : ʲ⁻¹Tⱼ = Rot(x, α) Trans(x, a) Rot(z, θ) Trans(z, d)'], where: W(7, '7.6 The matrix of one row', '7.6 La matrice d\'une ligne'),
      steps: [['α = 0: nothing turns around x.', 'α = 0 : rien ne tourne autour de x.'], ['Trans(x, 0.5): the origin goes to (0.5, 0).', 'Trans(x, 0,5) : l\'origine va en (0,5 ; 0).'], ['Rot(z, 90°): only the axes of the new frame turn; the origin stays at (0.5, 0).', 'Rot(z, 90°) : seuls les axes du nouveau repère tournent ; l\'origine reste en (0,5 ; 0).'], ['d = 0: no slide along z.', 'd = 0 : pas de glissement selon z.']],
      ans: ['<b>x = 0.5</b>', '<b>x = 0,5</b>'] }),
    SX({ rule: ['Khalil letters (αⱼ, dⱼ, θⱼ, rⱼ) and Craig letters (α<sub>j−1</sub>, a<sub>j−1</sub>, θⱼ, dⱼ) name the same four numbers', 'les lettres de Khalil (αⱼ, dⱼ, θⱼ, rⱼ) et de Craig (α<sub>j−1</sub>, a<sub>j−1</sub>, θⱼ, dⱼ) nomment les mêmes quatre nombres'], where: W(7, '7.3 The four parameters (column “Khalil”)', '7.3 Les quatre paramètres (colonne « Khalil »)'),
      table: { head: ['Khalil', 'Craig', ['value', 'valeur']], rows: [['αⱼ', 'α<sub>j−1</sub>', '0'], ['dⱼ', '<b>a<sub>j−1</sub></b>', '<b>0.45</b>'], ['θⱼ', 'θⱼ', 'θ'], ['rⱼ', 'dⱼ', '0']] },
      ans: ['<b>a<sub>j−1</sub> = 0.45</b>', '<b>a<sub>j−1</sub> = 0,45</b>'] }),
    SX({ rule: ['DHM method: z on each joint axis, x on the common perpendicular from zⱼ to z<sub>j+1</sub>; parallel axes give α = 0; a prismatic variable goes in the d column', 'méthode DHM : z sur l\'axe de chaque liaison, x sur la perpendiculaire commune de zⱼ à z<sub>j+1</sub> ; des axes parallèles donnent α = 0 ; une variable prismatique va dans la colonne d'], where: W(7, '7.2 The method and 7.4 Filling the table', '7.2 La méthode et 7.4 Remplir le tableau'),
      steps: [['Axes: z₁…z₄ vertical, up (all parallel), so every α is 0.', 'Axes : z₁…z₄ verticaux, vers le haut (tous parallèles), donc tous les α valent 0.'], ['x₁ goes from z₁ to z₂ along link 1; x₂ from z₂ to z₃ along link 2; z₃ and z₄ are the same line, so x₃ and x₄ are chosen in the direction of x₂.', 'x₁ va de z₁ à z₂ le long du segment 1 ; x₂ de z₂ à z₃ le long du segment 2 ; z₃ et z₄ sont la même droite, on choisit donc x₃ et x₄ dans le sens de x₂.'], ['Read each cell between its two axes (table below).', 'Lisez chaque case entre ses deux axes (tableau ci-dessous).'], ['(b) All axes are vertical: seen from above it is a 2-link arm. y = 0.40 sin 30° + 0.30 sin(30° + 60°) = 0.20 + 0.30 = 0.50 m. (q₄ only turns the tool; q₃ and the tool row only change z.)', '(b) Tous les axes sont verticaux : vu de dessus, c\'est un bras à 2 segments. y = 0,40 sin 30° + 0,30 sin(30° + 60°) = 0,20 + 0,30 = 0,50 m. (q₄ ne fait que tourner l\'outil ; q₃ et la ligne outil ne changent que z.)']],
      table: { head: ['j', 'α<sub>j−1</sub>', 'a<sub>j−1</sub>', 'θⱼ', 'dⱼ', ['why', 'pourquoi']], rows: [
        ['1', '0', '0', 'q₁', '0.35', ['d₁: x₀ (floor) → x₁ (shoulder) along z₁', 'd₁ : x₀ (sol) → x₁ (épaule) le long de z₁']],
        ['2', '0', '0.40', 'q₂', '0', ['a₁: z₁ → z₂ along x₁', 'a₁ : z₁ → z₂ le long de x₁']],
        ['3', '0', '0.30', '0', 'q₃', ['a₂: z₂ → z₃ along x₂; the slide moves x₃ along z₃', 'a₂ : z₂ → z₃ le long de x₂ ; la glissière déplace x₃ le long de z₃']],
        ['4', '0', '0', 'q₄', '0', ['z₃ = z₄, so a₃ = 0', 'z₃ = z₄, donc a₃ = 0']],
        [['E (tool)', 'E (outil)'], '0', '0', '0', '−0.10', ['the tip is 0.10 m below, along z₄', 'la pointe est 0,10 m plus bas, le long de z₄']]] },
      ans: ['<b>y = 0.50 m</b>', '<b>y = 0,50 m</b>'] }),
    SX({ rule: ['axes that do not cross: x is their common perpendicular and a is its length; a shift along a joint axis is a d; α by the right-hand rule', 'axes qui ne se coupent pas : x est leur perpendiculaire commune et a sa longueur ; un décalage le long d\'un axe de liaison est un d ; α par la règle de la main droite'], where: W(6, '6.3 The common perpendicular: four cases, and 6.4 Signs', '6.3 La perpendiculaire commune : quatre cas, et 6.4 Les signes'),
      steps: [['z₁ vertical (up); z₂ and z₃ horizontal, towards you.', 'z₁ vertical (vers le haut) ; z₂ et z₃ horizontaux, vers vous.'], ['z₁ and z₂ do not cross: their common perpendicular is horizontal, 0.15 m long, at the shoulder height. It is x₁ (to the right), so O₁ is 0.50 m up on z₁.', 'z₁ et z₂ ne se coupent pas : leur perpendiculaire commune est horizontale, longue de 0,15 m, à la hauteur de l\'épaule. C\'est x₁ (vers la droite), donc O₁ est à 0,50 m de haut sur z₁.'], ['α₁: from z₁ (up) to z₂ (towards you) around x₁ (right). Right thumb to the right, the fingers turn from up towards you: +90°.', 'α₁ : de z₁ (haut) à z₂ (vers vous) autour de x₁ (droite). Pouce droit vers la droite, les doigts tournent du haut vers vous : +90°.'], ['z₂ and z₃ are parallel: x₂ along the upper arm (0.60 m). The elbow is 0.10 m further towards you along z₃: that is d₃ = +0.10 (z₃ points towards you).', 'z₂ et z₃ sont parallèles : x₂ le long du bras (0,60 m). Le coude est 0,10 m plus loin vers vous le long de z₃ : c\'est d₃ = +0,10 (z₃ est dirigé vers vous).'], ['(b) At q = 0 the tool is at (0.15 + 0.60 + 0.50, −0.10, 0.50) = (1.25, −0.10, 0.50). q₁ = 90° turns it around the vertical: x = cos 90° × 1.25 − sin 90° × (−0.10) = 0 + 0.10.', '(b) À q = 0 l\'outil est en (0,15 + 0,60 + 0,50 ; −0,10 ; 0,50) = (1,25 ; −0,10 ; 0,50). q₁ = 90° le tourne autour de la verticale : x = cos 90° × 1,25 − sin 90° × (−0,10) = 0 + 0,10.']],
      table: { head: ['j', 'α<sub>j−1</sub>', 'a<sub>j−1</sub>', 'θⱼ', 'dⱼ', ['why', 'pourquoi']], rows: [
        ['1', '0', '0', 'q₁', '0.50', ['d₁: x₀ (floor) → x₁ (shoulder height) along z₁', 'd₁ : x₀ (sol) → x₁ (hauteur de l\'épaule) le long de z₁']],
        ['2', '90°', '0.15', 'q₂', '0', ['α₁, a₁: z₁ → z₂ around / along x₁', 'α₁, a₁ : z₁ → z₂ autour de / le long de x₁']],
        ['3', '0', '0.60', 'q₃', '0.10', ['a₂: z₂ → z₃ along x₂; d₃: x₂ → x₃ along z₃', 'a₂ : z₂ → z₃ le long de x₂ ; d₃ : x₂ → x₃ le long de z₃']],
        [['E (tool)', 'E (outil)'], '0', '0.50', '0', '0', ['z₃ → tool along x₃', 'z₃ → outil le long de x₃']]] },
      ans: ['<b>x = 0.10 m</b> (forgetting d₃ would give 0)', '<b>x = 0,10 m</b> (oublier d₃ donnerait 0)'] })
  ],
  8: [
    SX({ rule: ['the order of the columns tells the convention: standard DH starts with the moves along z (θ, d), modified DH with the moves along x (α, a)', 'l\'ordre des colonnes dit la convention : le DH standard commence par les mouvements selon z (θ, d), le DH modifié par ceux selon x (α, a)'], where: W(8, '8.4 How to recognise the convention of a table', '8.4 Comment reconnaître la convention d\'un tableau'),
      steps: [['The columns start with θ, d: moves along z first.', 'Les colonnes commencent par θ, d : mouvements selon z d\'abord.']],
      ans: ['<b>Standard DH</b>', '<b>DH standard</b>'] }),
    SX({ rule: ['DHM: one row per joint, plus one fixed row that brings the last frame to the tool', 'DHM : une ligne par liaison, plus une ligne fixe qui amène le dernier repère jusqu\'à l\'outil'], where: W(7, '7.4 Filling the table, row by row', '7.4 Remplir le tableau, ligne par ligne'),
      steps: [['3 joints: 3 rows.', '3 liaisons : 3 lignes.'], ['The last frame is on joint 3, not on the tool: + 1 fixed row (E).', 'Le dernier repère est sur la liaison 3, pas sur l\'outil : + 1 ligne fixe (E).']],
      ans: ['<b>4</b>', '<b>4</b>'] }),
    SX({ rule: ['always check a table at the zero pose: the links are where the drawing puts them', 'vérifiez toujours un tableau à la pose zéro : les segments sont là où le dessin les met'], where: W(8, '8.5 Checklist: is my table right?', '8.5 Liste de contrôle : mon tableau est-il juste ?'),
      steps: [['All θ = 0: the upper arm and the forearm are horizontal, along x.', 'Tous les θ = 0 : le bras et l\'avant-bras sont horizontaux, selon x.'], ['x = a₂ + a₃ = 0.45 + 0.38 = 0.83 m (at the height z = d₁ = 0.40 m).', 'x = a₂ + a₃ = 0,45 + 0,38 = 0,83 m (à la hauteur z = d₁ = 0,40 m).']],
      ans: ['<b>x = 0.83 m</b>', '<b>x = 0,83 m</b>'] })
  ],
  9: [
    SX({ rule: ['derivative of tⁿ: n tⁿ⁻¹ (so the derivative of 3t² is 6t)', 'dérivée de tⁿ : n tⁿ⁻¹ (donc la dérivée de 3t² est 6t)'], where: W(9, '9.2 The five useful rules', '9.2 Les cinq règles utiles'),
      steps: [['ẋ = 3 × 2 t = 6t.', 'ẋ = 3 × 2 t = 6t.'], ['At t = 2 s: 6 × 2 = 12 m/s.', 'À t = 2 s : 6 × 2 = 12 m/s.']],
      ans: ['<b>12 m/s</b>', '<b>12 m/s</b>'] }),
    SX({ rule: ['finite difference: speed ≈ (new value − old value) / Δt', 'différence finie : vitesse ≈ (nouvelle valeur − ancienne valeur) / Δt'], where: W(9, '9.3 The finite difference', '9.3 La différence finie'),
      steps: [['Change: 0.53 − 0.50 = 0.03 rad.', 'Variation : 0,53 − 0,50 = 0,03 rad.'], ['Time step in seconds: 5 ms = 0.005 s.', 'Pas de temps en secondes : 5 ms = 0,005 s.'], ['0.03 / 0.005 = 6 rad/s.', '0,03 / 0,005 = 6 rad/s.']],
      ans: ['<b>6 rad/s</b>', '<b>6 rad/s</b>'] }),
    SX({ rule: ['a partial derivative: derive with respect to one angle, the other one frozen', 'une dérivée partielle : on dérive par rapport à un angle, l\'autre étant figé'], where: W(9, '9.4 Partial derivatives', '9.4 Dérivées partielles'),
      steps: [['θ₁ = 0° and θ₁ + θ₂ = 90°.', 'θ₁ = 0° et θ₁ + θ₂ = 90°.'], ['0.5 × cos 0° = 0.5 × 1 = 0.5.', '0,5 × cos 0° = 0,5 × 1 = 0,5.'], ['0.4 × cos 90° = 0.4 × 0 = 0.', '0,4 × cos 90° = 0,4 × 0 = 0.'], ['Sum: 0.5 m/rad. Meaning: turning joint 1 by 0.01 rad lifts the tool by 0.005 m = 5 mm.', 'Somme : 0,5 m/rad. Sens : tourner la liaison 1 de 0,01 rad soulève l\'outil de 0,005 m = 5 mm.']],
      ans: ['<b>0.5 m/rad</b>', '<b>0,5 m/rad</b>'] })
  ],
  10: [
    SX({ rule: ['mean = sum of the values / number of values', 'moyenne = somme des valeurs / nombre de valeurs'], where: W(10, '10.2 Mean, variance, standard deviation', '10.2 Moyenne, variance, écart-type'),
      steps: [['Sum: 4 + 6 + 5 + 5 = 20.', 'Somme : 4 + 6 + 5 + 5 = 20.'], ['4 values: 20 / 4 = 5.', '4 valeurs : 20 / 4 = 5.']],
      ans: ['<b>5 cm</b>', '<b>5 cm</b>'] }),
    SX({ rule: ['averaging N independent measurements divides σ by √N', 'moyenner N mesures indépendantes divise σ par √N'], where: W(10, '10.4 Three rules to handle errors', '10.4 Trois règles pour manier les erreurs'),
      steps: [['N = 9, so √N = 3.', 'N = 9, donc √N = 3.'], ['6 / 3 = 2 mm.', '6 / 3 = 2 mm.']],
      ans: ['<b>2 mm</b>', '<b>2 mm</b>'] }),
    SX({ rule: ['fusion of two sensors: 1/σ² = 1/σ₁² + 1/σ₂²', 'fusion de deux capteurs : 1/σ² = 1/σ₁² + 1/σ₂²'], where: W(10, '10.5 Combining two sensors', '10.5 Combiner deux capteurs'),
      steps: [['1/σ₁² = 1/2² = 1/4, and the same for sensor 2.', '1/σ₁² = 1/2² = 1/4, et pareil pour le capteur 2.'], ['1/σ² = 1/4 + 1/4 = 1/2, so σ² = 2.', '1/σ² = 1/4 + 1/4 = 1/2, donc σ² = 2.'], ['σ = √2 ≈ 1.41 cm: the same as averaging two measurements (2 / √2).', 'σ = √2 ≈ 1,41 cm : comme la moyenne de deux mesures (2 / √2).']],
      ans: ['<b>σ ≈ 1.41 cm</b>', '<b>σ ≈ 1,41 cm</b>'] })
  ],
  11: [
    SX({ rule: ['quaternion of a rotation of θ around a unit axis u: q = (cos θ/2, u sin θ/2)', 'quaternion d\'une rotation de θ autour d\'un axe unitaire u : q = (cos θ/2, u sin θ/2)'], where: W(11, '11.4 The quaternion', '11.4 Le quaternion'),
      steps: [['Half the angle: 120° / 2 = 60°.', 'La moitié de l\'angle : 120° / 2 = 60°.'], ['w = cos 60° = 0.5 (and x = sin 60° = 0.866, y = z = 0).', 'w = cos 60° = 0,5 (et x = sin 60° = 0,866, y = z = 0).']],
      ans: ['<b>w = 0.5</b>', '<b>w = 0,5</b>'] }),
    SX({ rule: ['in ROS 2 the quaternion is written (x, y, z, w), w last; for a turn around z only, the heading is ψ = 2 atan2(z, w)', 'en ROS 2 le quaternion s\'écrit (x, y, z, w), w en dernier ; pour une rotation autour de z seulement, le cap vaut ψ = 2 atan2(z, w)'], where: W(11, '11.5 Quaternions in a robot program', '11.5 Les quaternions dans un programme de robot'),
      steps: [['x = y = 0: the robot only turns around z.', 'x = y = 0 : le robot ne tourne qu\'autour de z.'], ['atan2(0.383, 0.924) = 22.5°.', 'atan2(0,383 ; 0,924) = 22,5°.'], ['ψ = 2 × 22.5° = 45°.', 'ψ = 2 × 22,5° = 45°.']],
      ans: ['<b>45°</b>', '<b>45°</b>'] }),
    SX({ rule: ['the trace of a rotation matrix is 1 + 2 cos θ, whatever the axis', 'la trace d\'une matrice de rotation vaut 1 + 2 cos θ, quel que soit l\'axe'], where: W(11, '11.3 Axis-angle', '11.3 Axe-angle'),
      steps: [['1 + 2 cos θ = 2, so cos θ = (2 − 1) / 2 = 0.5.', '1 + 2 cos θ = 2, donc cos θ = (2 − 1) / 2 = 0,5.'], ['θ = arccos 0.5 = 60°.', 'θ = arccos 0,5 = 60°.']],
      ans: ['<b>60°</b>', '<b>60°</b>'] })
  ]
};
