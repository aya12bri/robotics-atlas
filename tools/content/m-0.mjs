import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
const PRE = 'wmr-';

export function partZero() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: [`The maths toolbox: everything you need, from zero`, `La boîte à outils mathématique : tout ce qu'il faut, depuis zéro`],
  time: 24,
  goal: [`to be comfortable with units, angles, vectors, matrices, speed and position, and the idea of rank. If you are a complete beginner, this is the only lesson you need before the others.`, `être à l'aise avec les unités, les angles, les vecteurs, les matrices, la vitesse et la position, et l'idée de rang. Si vous êtes débutant complet, c'est la seule leçon nécessaire avant les autres.`],
  body: [
    P(`The whole course uses only six small tools. You will meet each one here, with an example and a use in robotics. If you already know them, go straight to the exercises at the end of the lesson: if you solve them, skip to lesson 2.`,
      `Tout le cours n'utilise que six petits outils. Vous les rencontrez ici, chacun avec un exemple et un usage en robotique. Si vous les connaissez déjà, allez directement aux exercices en fin de leçon : si vous les résolvez, passez à la leçon 2.`),
    TABLE([[`Tool`, `Outil`], [`What it is used for in this course`, `À quoi il sert dans ce cours`], [`Where`, `Où`]], [
      [[`1. Units`, `1. Unités`], [`wheel speed in rad/s, robot speed in m/s`, `vitesse de roue en rad/s, vitesse du robot en m/s`], [`all lessons`, `toutes les leçons`]],
      [[`2. Angles and trigonometry`, `2. Angles et trigonométrie`], [`heading, steering, direction of a velocity`, `cap, braquage, direction d'une vitesse`], [`3 – 8`, `3 – 8`]],
      [[`3. Vectors and the dot product`, `3. Vecteurs et produit scalaire`], [`how much of a velocity is along or across a wheel`, `quelle part d'une vitesse est dans le sens ou en travers d'une roue`], [`4, 9`, `4, 9`]],
      [[`4. Matrices`, `4. Matrices`], [`change of frame, wheel equations`, `changement de repère, équations des roues`], [`3 – 9`, `3 – 9`]],
      [[`5. Speed, position and integration`, `5. Vitesse, position et intégration`], [`odometry: position from speeds`, `odométrie : la position à partir des vitesses`], [`5, 14 – 17`, `5, 14 – 17`]],
      [[`6. Equations and rank`, `6. Équations et rang`], [`how many directions a robot can move`, `dans combien de directions un robot peut se déplacer`], [`9, 10`, `9, 10`]]
    ]),
    H4(`1.1 Units`, `1.1 Les unités`),
    P(`A number without a unit means nothing. We always compute in <strong>SI units</strong> and convert at the end:`,
      `Un nombre sans unité ne veut rien dire. On calcule toujours en <strong>unités SI</strong> et on convertit à la fin :`),
    TABLE([[`Quantity`, `Grandeur`], [`SI unit`, `Unité SI`], [`Conversions you will need`, `Conversions utiles`]], [
      [[`length`, `longueur`], `m`, `1 cm = 0.01 m &nbsp; 1 mm = 0.001 m`],
      [[`time`, `temps`], `s`, `1 min = 60 s`],
      [[`angle`, `angle`], `rad`, `π rad = 180° &nbsp; 1 rad = 57.3°`],
      [[`speed`, `vitesse`], `m/s`, `1 km/h = 1/3.6 m/s &nbsp; (36 km/h = 10 m/s)`],
      [[`angular speed`, `vitesse angulaire`], `rad/s`, `<i>ω</i> = 2π <i>n</i> / 60 &nbsp; with <i>n</i> in rpm (revolutions per minute)`],
      [[`force / torque`, `force / couple`], `N / N·m`, `1 kgf = 9.81 N`]
    ]),
    BOX(`example`, [`Worked example`, `Exemple résolu`],
      P(`A motor turns at 150 rpm. In rad/s: <i>ω</i> = 2π × 150 / 60 = <strong>15.71 rad/s</strong>. If it drives a wheel of radius 0.05 m, the robot moves at <i>v</i> = <i>r</i> <i>ω</i> = 0.05 × 15.71 = <strong>0.785 m/s</strong> = 2.83 km/h. The key formula of the whole course is this one: <strong>ground speed = wheel radius × wheel angular speed</strong>.`,
        `Un moteur tourne à 150 tr/min. En rad/s : <i>ω</i> = 2π × 150 / 60 = <strong>15,71 rad/s</strong>. S'il entraîne une roue de rayon 0,05 m, le robot avance à <i>v</i> = <i>r</i> <i>ω</i> = 0,05 × 15,71 = <strong>0,785 m/s</strong> = 2,83 km/h. La formule clé de tout le cours est celle-ci : <strong>vitesse au sol = rayon de la roue × vitesse angulaire de la roue</strong>.`)),
    BOX(`warn`, [`Pitfall: degrees and radians`, `Piège : degrés et radians`],
      P(`Calculators and code use <strong>radians</strong> in <i>sin</i>, <i>cos</i> and angular speeds. If you type 90 into a radian function you get nonsense. Rule: work in radians, and convert to degrees only to read or to display (× 180/π).`,
        `Les calculatrices et le code utilisent des <strong>radians</strong> dans <i>sin</i>, <i>cos</i> et les vitesses angulaires. Si vous tapez 90 dans une fonction en radians, vous obtenez n'importe quoi. Règle : travaillez en radians, et ne convertissez en degrés que pour lire ou afficher (× 180/π).`)),
    H4(`1.2 Angles and trigonometry`, `1.2 Angles et trigonométrie`),
    P(`An angle can be measured in degrees (a full turn is 360°) or in radians (a full turn is 2π ≈ 6.283). The radian is natural because of the arc length: on a circle of radius <i>r</i>, an angle <i>θ</i> (in radians) cuts an arc of length`,
      `Un angle se mesure en degrés (un tour complet = 360°) ou en radians (un tour complet = 2π ≈ 6,283). Le radian est naturel à cause de la longueur d'arc : sur un cercle de rayon <i>r</i>, un angle <i>θ</i> (en radians) découpe un arc de longueur`),
    EQ(`<i>s</i> = <i>r</i> <i>θ</i>`),
    P(`This is exactly what a wheel does: when it turns by <i>Δφ</i> radians, its contact point rolls a distance <i>r</i> <i>Δφ</i> on the floor. Odometry (lesson 14) is built on this single line.`,
      `C'est exactement ce que fait une roue : quand elle tourne de <i>Δφ</i> radians, son point de contact roule sur une distance <i>r</i> <i>Δφ</i> sur le sol. L'odométrie (leçon 14) repose sur cette seule ligne.`),
    FIG(`0 0 440 250`, `
      <circle cx="140" cy="130" r="100" fill="none" stroke="#5b8fd6" stroke-width="2"/>
      <line x1="20" y1="130" x2="270" y2="130" class="ax"/><line x1="140" y1="10" x2="140" y2="250" class="ax"/>
      <line x1="140" y1="130" x2="211" y2="59" stroke="#ff9f43" stroke-width="3"/>
      <circle cx="211" cy="59" r="5" class="pt"/>
      <line x1="211" y1="59" x2="211" y2="130" class="dash"/><line x1="140" y1="59" x2="211" y2="59" class="dash"/>
      <path d="M 180 130 A 40 40 0 0 0 168 102" class="arc"/><text x="186" y="118" fill="#ff9f43">θ</text>
      <text x="226" y="96" fill="#ff6b6b">${svgtx('( cos θ , sin θ )')}</text>
      <text x="211" y="146" text-anchor="middle">cos θ</text><text x="125" y="98" text-anchor="end">sin θ</text>
      <text x="290" y="60">${svgtx('For a point on a circle of radius 1:', 'Pour un point sur un cercle de rayon 1 :')}</text>
      <text x="290" y="82">${svgtx('x = cos θ')}</text><text x="290" y="102">${svgtx('y = sin θ')}</text><text x="290" y="130">${svgtx('tan θ = sin θ / cos θ')}</text>`),
    P(`<strong>Sine and cosine</strong> give the coordinates of a point on the unit circle (radius 1) at the angle <i>θ</i> from the horizontal axis. Remember a few values:`,
      `Le <strong>sinus et le cosinus</strong> donnent les coordonnées d'un point du cercle unité (rayon 1) à l'angle <i>θ</i> depuis l'axe horizontal. Retenez quelques valeurs :`),
    TABLE([[`θ`, `θ`], [`0°`, `0°`], [`30°`, `30°`], [`45°`, `45°`], [`60°`, `60°`], [`90°`, `90°`]], [
      [`cos θ`, `1`, `0.866`, `0.707`, `0.5`, `0`],
      [`sin θ`, `0`, `0.5`, `0.707`, `0.866`, `1`]
    ]),
    P(`The reverse question, “which angle has this <i>x</i> and <i>y</i>?”, is answered by <strong>atan2(<i>y</i>, <i>x</i>)</strong>. Always prefer atan2 to arctan(<i>y</i>/<i>x</i>): it knows the quadrant. Example: the vector (−1, 1) points at atan2(1, −1) = 135°, while arctan(1/−1) = arctan(−1) = −45° would point the wrong way.`,
      `La question inverse, « quel angle a ces <i>x</i> et <i>y</i> ? », a pour réponse <strong>atan2(<i>y</i>, <i>x</i>)</strong>. Préférez toujours atan2 à arctan(<i>y</i>/<i>x</i>) : il connaît le quadrant. Exemple : le vecteur (−1, 1) pointe à atan2(1, −1) = 135°, alors que arctan(1/−1) = arctan(−1) = −45° pointerait du mauvais côté.`),
    H4(`1.3 Vectors and the dot product`, `1.3 Vecteurs et produit scalaire`),
    P(`A <strong>vector</strong> (<i>a</i><sub>x</sub>, <i>a</i><sub>y</sub>) is an arrow in the plane: <i>a</i><sub>x</sub> to the right, <i>a</i><sub>y</sub> upward. Its length is given by Pythagoras, its direction by atan2:`,
      `Un <strong>vecteur</strong> (<i>a</i><sub>x</sub>, <i>a</i><sub>y</sub>) est une flèche dans le plan : <i>a</i><sub>x</sub> vers la droite, <i>a</i><sub>y</sub> vers le haut. Sa longueur vient de Pythagore, sa direction de atan2 :`),
    EQ(`| <i>a</i> | = √( <i>a</i><sub>x</sub>² + <i>a</i><sub>y</sub>² ) &nbsp;&nbsp;&nbsp; direction = atan2( <i>a</i><sub>y</sub> , <i>a</i><sub>x</sub> )`),
    P(`A velocity of 0.3 m/s to the right and 0.4 m/s upward has a speed of √(0.3² + 0.4²) = 0.5 m/s. A <strong>unit vector</strong> pointing at the angle <i>θ</i> is ( cos <i>θ</i> , sin <i>θ</i> ): it is the “heading” of a robot.`,
      `Une vitesse de 0,3 m/s vers la droite et 0,4 m/s vers le haut a une norme de √(0,3² + 0,4²) = 0,5 m/s. Un <strong>vecteur unitaire</strong> dirigé selon l'angle <i>θ</i> est ( cos <i>θ</i> , sin <i>θ</i> ) : c'est le « cap » d'un robot.`),
    P(`The <strong>dot product</strong> of two vectors is a number:`, `Le <strong>produit scalaire</strong> de deux vecteurs est un nombre :`),
    EQ(`<i>a</i> · <i>b</i> = <i>a</i><sub>x</sub> <i>b</i><sub>x</sub> + <i>a</i><sub>y</sub> <i>b</i><sub>y</sub> = | <i>a</i> | | <i>b</i> | cos( angle between them )`, `<i>a</i> · <i>b</i> = <i>a</i><sub>x</sub> <i>b</i><sub>x</sub> + <i>a</i><sub>y</sub> <i>b</i><sub>y</sub> = | <i>a</i> | | <i>b</i> | cos( angle entre eux )`),
    P(`If <i>b</i> is a unit vector, <i>a</i> · <i>b</i> is the <strong>component of <i>a</i> along <i>b</i></strong>: the projection. This is the tool behind every wheel equation: the robot has some velocity, and a wheel only cares about the part of it <em>along</em> its plane (that makes it roll) and the part <em>across</em> its plane (that would make it slide).`,
      `Si <i>b</i> est un vecteur unitaire, <i>a</i> · <i>b</i> est la <strong>composante de <i>a</i> selon <i>b</i></strong> : la projection. C'est l'outil derrière chaque équation de roue : le robot a une certaine vitesse, et une roue ne s'intéresse qu'à la part <em>dans</em> son plan (qui la fait rouler) et la part <em>en travers</em> de son plan (qui la ferait glisser).`),
    BOX(`example`, [`Worked example`, `Exemple résolu`],
      P(`A robot has the velocity (0.6, 0.8) m/s and its wheel points at 30° (unit vector ( 0.866 , 0.5 )). Along the wheel: 0.6 × 0.866 + 0.8 × 0.5 = <strong>0.92 m/s</strong> (the wheel rolls at this speed). Across the wheel: the unit vector across is ( −0.5 , 0.866 ), so 0.6 × (−0.5) + 0.8 × 0.866 = <strong>0.39 m/s</strong>. A real wheel cannot move sideways: this 0.39 m/s would be slipping. Check: 0.92² + 0.39² = 1.0 = 0.6² + 0.8² ✓.`,
        `Un robot a la vitesse (0,6 ; 0,8) m/s et sa roue pointe à 30° (vecteur unitaire ( 0,866 ; 0,5 )). Dans le sens de la roue : 0,6 × 0,866 + 0,8 × 0,5 = <strong>0,92 m/s</strong> (la roue roule à cette vitesse). En travers : le vecteur unitaire transversal est ( −0,5 ; 0,866 ), donc 0,6 × (−0,5) + 0,8 × 0,866 = <strong>0,39 m/s</strong>. Une vraie roue ne peut pas aller de côté : ces 0,39 m/s seraient du glissement. Vérification : 0,92² + 0,39² = 1,0 = 0,6² + 0,8² ✓.`)),
    H4(`1.4 Matrices`, `1.4 Les matrices`),
    P(`A <strong>matrix</strong> is a table of numbers. To multiply a matrix by a vector, take each row, multiply it term by term with the vector, and add:`,
      `Une <strong>matrice</strong> est un tableau de nombres. Pour multiplier une matrice par un vecteur, prenez chaque ligne, multipliez-la terme à terme par le vecteur, et additionnez :`),
    EQ(`${MX(2, ['a', 'b', 'c', 'd'])} ${MX(1, ['x', 'y'])} = ${MX(1, ['a x + b y', 'c x + d y'])}`),
    P(`Example: ( 0 1 ; −1 0 ) times (3, 2) gives ( 0×3 + 1×2 , −1×3 + 0×2 ) = (2, −3). Each row of a matrix is a dot product: a matrix is a stack of “projections”. That is how we will write the wheel equations of many wheels at once.`,
      `Exemple : ( 0 1 ; −1 0 ) fois (3, 2) donne ( 0×3 + 1×2 , −1×3 + 0×2 ) = (2, −3). Chaque ligne d'une matrice est un produit scalaire : une matrice est une pile de « projections ». C'est ainsi que nous écrirons d'un coup les équations de plusieurs roues.`),
    P(`Three facts are enough: the <strong>identity</strong> matrix <i>I</i> (ones on the diagonal) changes nothing; the <strong>inverse</strong> <i>A</i><sup>−1</sup> undoes <i>A</i> (<i>A</i><sup>−1</sup><i>A</i> = <i>I</i>) and exists only if the equations of <i>A</i> are independent; the <strong>transpose</strong> <i>A</i><sup>T</sup> swaps rows and columns. The most important matrix of the course is the <strong>rotation</strong> that turns coordinates by the angle <i>θ</i>:`,
      `Trois faits suffisent : la matrice <strong>identité</strong> <i>I</i> (des 1 sur la diagonale) ne change rien ; l'<strong>inverse</strong> <i>A</i><sup>−1</sup> annule <i>A</i> (<i>A</i><sup>−1</sup><i>A</i> = <i>I</i>) et n'existe que si les équations de <i>A</i> sont indépendantes ; la <strong>transposée</strong> <i>A</i><sup>T</sup> échange lignes et colonnes. La matrice la plus importante du cours est la <strong>rotation</strong> qui tourne les coordonnées de l'angle <i>θ</i> :`),
    EQ(`<i>R</i>(<i>θ</i>) = ${MX(2, ['cos θ', 'sin θ', '− sin θ', 'cos θ'])} &nbsp;&nbsp;&nbsp; <i>R</i>(<i>θ</i>)<sup>−1</sup> = <i>R</i>(<i>θ</i>)<sup>T</sup> = <i>R</i>(−<i>θ</i>)`),
    H4(`1.5 Speed, position and integration`, `1.5 Vitesse, position et intégration`),
    P(`Speed is how fast the position changes: <i>v</i> = d<i>x</i>/d<i>t</i> (the <strong>derivative</strong>). The other way round, position is the sum of all the small displacements: <i>x</i>(<i>t</i>) = ∫ <i>v</i> d<i>t</i> (the <strong>integral</strong>). A robot only knows its wheel speeds, so it must integrate them to know its position. On a computer, we cut time in steps of Δ<i>t</i> and use the <strong>Euler method</strong>:`,
      `La vitesse mesure la rapidité avec laquelle la position change : <i>v</i> = d<i>x</i>/d<i>t</i> (la <strong>dérivée</strong>). Dans l'autre sens, la position est la somme de tous les petits déplacements : <i>x</i>(<i>t</i>) = ∫ <i>v</i> d<i>t</i> (l'<strong>intégrale</strong>). Un robot ne connaît que les vitesses de ses roues, il doit donc les intégrer pour connaître sa position. Sur ordinateur, on découpe le temps en pas Δ<i>t</i> et on utilise la <strong>méthode d'Euler</strong> :`),
    EQ(`<i>x</i><sub>k+1</sub> = <i>x</i><sub>k</sub> + <i>v</i><sub>k</sub> Δ<i>t</i>`),
    BOX(`example`, [`Worked example: how the step size matters`, `Exemple résolu : l'influence du pas`],
      P(`A robot accelerates so that <i>v</i>(<i>t</i>) = <i>t</i> (m/s) during 1 s. The exact distance is the area of the triangle: 0.5 m. With Δ<i>t</i> = 0.1 s, Euler adds <i>v</i><sub>k</sub> Δ<i>t</i> for <i>k</i> = 0…9: 0.1 × (0 + 0.1 + … + 0.9) = 0.1 × 4.5 = <strong>0.45 m</strong>: 10 % too small. With Δ<i>t</i> = 0.01 s the result is 0.495 m. A smaller step gives a better answer, at the price of more computation. A 50 Hz odometry loop (Δ<i>t</i> = 0.02 s) is typical.`,
        `Un robot accélère avec <i>v</i>(<i>t</i>) = <i>t</i> (m/s) pendant 1 s. La distance exacte est l'aire du triangle : 0,5 m. Avec Δ<i>t</i> = 0,1 s, Euler ajoute <i>v</i><sub>k</sub> Δ<i>t</i> pour <i>k</i> = 0…9 : 0,1 × (0 + 0,1 + … + 0,9) = 0,1 × 4,5 = <strong>0,45 m</strong> : 10 % trop petit. Avec Δ<i>t</i> = 0,01 s le résultat est 0,495 m. Un pas plus petit donne une meilleure réponse, au prix de plus de calcul. Une boucle d'odométrie à 50 Hz (Δ<i>t</i> = 0,02 s) est typique.`)),
    H4(`1.6 Equations and rank`, `1.6 Équations et rang`),
    P(`A <strong>linear system</strong> is a set of equations such as 1 <i>x</i> + 2 <i>y</i> + 0 <i>z</i> = 0. In matrix form <i>A</i> <i>x</i> = <i>b</i>. The <strong>rank</strong> of <i>A</i> is the number of <em>independent</em> equations: an equation that is a multiple or a sum of the others adds nothing. With <i>n</i> unknowns and rank <i>k</i>, there remain <strong><i>n</i> − <i>k</i></strong> directions that are free: this is the dimension of the <strong>null space</strong> (the solutions of <i>A</i> <i>x</i> = 0).`,
      `Un <strong>système linéaire</strong> est un ensemble d'équations comme 1 <i>x</i> + 2 <i>y</i> + 0 <i>z</i> = 0. Sous forme matricielle <i>A</i> <i>x</i> = <i>b</i>. Le <strong>rang</strong> de <i>A</i> est le nombre d'équations <em>indépendantes</em> : une équation multiple ou somme des autres n'apporte rien. Avec <i>n</i> inconnues et un rang <i>k</i>, il reste <strong><i>n</i> − <i>k</i></strong> directions libres : c'est la dimension de l'<strong>espace nul</strong> (les solutions de <i>A</i> <i>x</i> = 0).`),
    BOX(`example`, [`Worked example`, `Exemple résolu`],
      P(`Unknowns ( <i>ẋ</i> , <i>ẏ</i> , <i>θ̇</i> ) of a robot. One wheel gives the equation 0 <i>ẋ</i> + 1 <i>ẏ</i> + 0 <i>θ̇</i> = 0 (no sideways slip). Rank 1, so 3 − 1 = 2 free motions (move along <i>x</i> and turn). A second wheel on the same axle gives −1 times the same equation: the rank stays 1. A second wheel elsewhere gives 0 <i>ẋ</i> + 1 <i>ẏ</i> + 0.5 <i>θ̇</i> = 0: now the rank is 2, and only 3 − 2 = 1 motion remains. This is exactly how lesson 9 counts the degrees of mobility.`,
        `Inconnues ( <i>ẋ</i> , <i>ẏ</i> , <i>θ̇</i> ) d'un robot. Une roue donne l'équation 0 <i>ẋ</i> + 1 <i>ẏ</i> + 0 <i>θ̇</i> = 0 (pas de glissement latéral). Rang 1, donc 3 − 1 = 2 mouvements libres (avancer selon <i>x</i> et tourner). Une seconde roue sur le même essieu donne −1 fois la même équation : le rang reste 1. Une seconde roue ailleurs donne 0 <i>ẋ</i> + 1 <i>ẏ</i> + 0,5 <i>θ̇</i> = 0 : le rang est maintenant 2, et il ne reste que 3 − 2 = 1 mouvement. C'est exactement ainsi que la leçon 9 compte les degrés de mobilité.`)),
    P(`To find the rank by hand, do <strong>Gaussian elimination</strong>: subtract multiples of the first row from the others to make zeros under the first number, then continue with the next row; the rank is the number of rows that are not all zeros at the end.`,
      `Pour trouver le rang à la main, faites l'<strong>élimination de Gauss</strong> : soustrayez des multiples de la première ligne aux autres pour faire des zéros sous le premier nombre, puis continuez avec la ligne suivante ; le rang est le nombre de lignes non entièrement nulles à la fin.`)
  ],
  terms: [[`SI units`, `unités SI`], [`radian`, `radian`], [`atan2`, `atan2`], [`unit vector`, `vecteur unitaire`], [`dot product`, `produit scalaire`], [`rotation matrix`, `matrice de rotation`], [`integration (Euler)`, `intégration (Euler)`], [`rank / null space`, `rang / espace nul`]],
  quiz: [
    [`A wheel of radius 0.1 m turns at 10 rad/s. How fast does the robot move?`, `Une roue de rayon 0,1 m tourne à 10 rad/s. À quelle vitesse avance le robot ?`, `v = r ω = 0.1 × 10 = 1 m/s.`, `v = r ω = 0,1 × 10 = 1 m/s.`],
    [`Why use atan2(y, x) and not arctan(y/x)?`, `Pourquoi utiliser atan2(y, x) et non arctan(y/x) ?`, `atan2 knows the signs of x and y, so it gives the right quadrant over the full 360°.`, `atan2 connaît les signes de x et y, donc il donne le bon quadrant sur les 360°.`],
    [`What does the dot product of a velocity with a unit vector give?`, `Que donne le produit scalaire d'une vitesse avec un vecteur unitaire ?`, `The component of the velocity along that unit vector.`, `La composante de la vitesse selon ce vecteur unitaire.`]
  ]
}),
  ];
}
