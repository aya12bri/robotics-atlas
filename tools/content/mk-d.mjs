// The maths of robotics, lessons 9 and 10: derivatives and partial derivatives (towards the Jacobian); probability (towards Kalman).
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, lesson } from '../lib.mjs';
import { fdFig, jacFig, fuseFig } from './mk-figs.mjs';
import { plot, COL } from '../practice/fig.mjs';
const PRE = 'mk-';
const I = (s, i) => `<i>${s}</i><sub>${i}</sub>`;
const fig = (p) => FIG(p.vb, p.svg);
const gauss = (m, s) => (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
const n = (s) => [s, s.replace(/(\d)\.(\d)/g, '$1,$2')];

export function partD() {
  return [
// ------------------------------------------------------------------------------------------------ 9
lesson(PRE, 9, {
  title: ['Derivatives and partial derivatives: from positions to speeds', 'Dérivées et dérivées partielles : des positions aux vitesses'],
  time: 15,
  goal: ['what a derivative is, the few rules you need, how a computer estimates it, and how partial derivatives build the Jacobian of a robot.', 'ce qu\'est une dérivée, les quelques règles utiles, comment un ordinateur l\'estime, et comment les dérivées partielles construisent la jacobienne d\'un robot.'],
  body: [
    H4('9.1 A derivative is a rate of change', '9.1 Une dérivée est une vitesse de variation'),
    P('When the position <i>x</i> of something changes with the time <i>t</i>, its <strong>derivative</strong> d<i>x</i>/d<i>t</i> says <strong>how fast</strong> it changes: it is the <strong>speed</strong>. On the graph of <i>x</i>(<i>t</i>), it is the <strong>slope</strong> of the curve at that moment. In robotics we write it with a dot: <i>ẋ</i> = d<i>x</i>/d<i>t</i>, <i>θ̇</i> = d<i>θ</i>/d<i>t</i>.',
      'Quand la position <i>x</i> d\'une chose change avec le temps <i>t</i>, sa <strong>dérivée</strong> d<i>x</i>/d<i>t</i> dit <strong>à quelle vitesse</strong> elle change : c\'est la <strong>vitesse</strong>. Sur la courbe de <i>x</i>(<i>t</i>), c\'est la <strong>pente</strong> de la courbe à cet instant. En robotique on l\'écrit avec un point : <i>ẋ</i> = d<i>x</i>/d<i>t</i>, <i>θ̇</i> = d<i>θ</i>/d<i>t</i>.'),
    fig(plot({ x: [0, 4], y: [0, 34], ticks: [4, 4], curves: [{ f: (t) => 2 * t * t, c: COL.b, label: ['position x = 2t² (m)', 'position x = 2t² (m)'] }, { f: (t) => 18 + 12 * (t - 3), c: COL.o, dash: '6 5', label: ['tangent at t = 3 s: slope 12 m/s', 'tangente en t = 3 s : pente 12 m/s'] }], xl: ['time t (s)', 'temps t (s)'], marks: [[3, 18, 'x = 18 m']] })),
    P('The derivative of the derivative is the <strong>acceleration</strong>: <i>ẍ</i> = d²<i>x</i>/d<i>t</i>². Position → speed → acceleration: each one is the rate of change of the one before.',
      'La dérivée de la dérivée est l\'<strong>accélération</strong> : <i>ẍ</i> = d²<i>x</i>/d<i>t</i>². Position → vitesse → accélération : chacune est la vitesse de variation de la précédente.'),
    H4('9.2 The five rules you need', '9.2 Les cinq règles utiles'),
    TABLE([['Function', 'Fonction'], ['Derivative', 'Dérivée'], ['Example', 'Exemple']], [
      [['a constant <i>c</i>', 'une constante <i>c</i>'], '0', ['a length does not change', 'une longueur ne change pas']],
      ['<i>t</i><sup>n</sup>', '<i>n</i> <i>t</i><sup>n−1</sup>', '(2<i>t</i>²)′ = 4<i>t</i>'],
      ['sin <i>t</i>', 'cos <i>t</i>', ''],
      ['cos <i>t</i>', '−sin <i>t</i>', ['note the minus sign', 'attention au signe moins']],
      [['<strong>chain rule</strong>: <i>f</i>(<i>θ</i>(<i>t</i>))', '<strong>dérivée composée</strong> : <i>f</i>(<i>θ</i>(<i>t</i>))'], '<i>f</i> ′(<i>θ</i>) · <i>θ̇</i>', ['(sin <i>θ</i>)′ = cos <i>θ</i> · <i>θ̇</i>', '(sin <i>θ</i>)′ = cos <i>θ</i> · <i>θ̇</i>']]
    ]),
    P('A sum is derived term by term, and a constant factor stays: (3 <i>t</i>² + 5)′ = 6 <i>t</i>.', 'Une somme se dérive terme à terme, et un facteur constant reste : (3 <i>t</i>² + 5)′ = 6 <i>t</i>.'),
    BOX('example', ['Worked example: the speed of the end of an arm', 'Exemple résolu : la vitesse du bout d\'un bras'],
      P('The end of an arm of length <i>L</i> is at <i>x</i> = <i>L</i> cos <i>θ</i>, <i>y</i> = <i>L</i> sin <i>θ</i> (lesson 1). The motor turns, so <i>θ</i> depends on time. Chain rule:', 'Le bout d\'un bras de longueur <i>L</i> est en <i>x</i> = <i>L</i> cos <i>θ</i>, <i>y</i> = <i>L</i> sin <i>θ</i> (leçon 1). Le moteur tourne, donc <i>θ</i> dépend du temps. Dérivée composée :'),
      EQ('<i>ẋ</i> = −<i>L</i> sin <i>θ</i> · <i>θ̇</i> &emsp;&emsp; <i>ẏ</i> = <i>L</i> cos <i>θ</i> · <i>θ̇</i>'),
      P('With <i>L</i> = 0.5 m, <i>θ</i> = 30° and <i>θ̇</i> = 2 rad/s: <i>ẋ</i> = −0.5 × 0.5 × 2 = <strong>−0.5 m/s</strong>, <i>ẏ</i> = 0.5 × 0.866 × 2 = <strong>0.866 m/s</strong>. The speed is <i>L</i> <i>θ̇</i> = 1 m/s, perpendicular to the arm, as expected for a point that turns.',
        'Avec <i>L</i> = 0,5 m, <i>θ</i> = 30° et <i>θ̇</i> = 2 rad/s : <i>ẋ</i> = −0,5 × 0,5 × 2 = <strong>−0,5 m/s</strong>, <i>ẏ</i> = 0,5 × 0,866 × 2 = <strong>0,866 m/s</strong>. La vitesse vaut <i>L</i> <i>θ̇</i> = 1 m/s, perpendiculaire au bras, comme attendu pour un point qui tourne.')),
    H4('9.3 How a computer derives: the finite difference', '9.3 Comment un ordinateur dérive : la différence finie'),
    P('A robot does not have the formula of its motion: it has <strong>measurements</strong> at regular times. It estimates the derivative with the change divided by the time step:', 'Un robot n\'a pas la formule de son mouvement : il a des <strong>mesures</strong> à intervalles réguliers. Il estime la dérivée avec la variation divisée par le pas de temps :'),
    EQ('<i>θ̇</i> ≈ ( <i>θ</i>(<i>t</i> + Δ<i>t</i>) − <i>θ</i>(<i>t</i>) ) / Δ<i>t</i>'),
    P('Example: the encoder reads 1.00 rad, then 1.02 rad 10 ms later: <i>θ̇</i> ≈ 0.02 / 0.01 = <strong>2 rad/s</strong>.', 'Exemple : le codeur lit 1,00 rad, puis 1,02 rad 10 ms plus tard : <i>θ̇</i> ≈ 0,02 / 0,01 = <strong>2 rad/s</strong>.'),
    fdFig(),
    BOX('warn', ['Deriving amplifies noise', 'Dériver amplifie le bruit'],
      P('If the encoder has a noise of 0.001 rad, dividing by Δ<i>t</i> = 0.001 s gives a speed noise of about 1 rad/s. This is why the D term of a PID is always filtered (control course), and why speeds are often estimated with a filter rather than a raw difference.',
        'Si le codeur a un bruit de 0,001 rad, diviser par Δ<i>t</i> = 0,001 s donne un bruit de vitesse d\'environ 1 rad/s. C\'est pour cela que le terme D d\'un PID est toujours filtré (cours de commande), et que les vitesses sont souvent estimées avec un filtre plutôt qu\'avec une différence brute.')),
    H4('9.4 Partial derivatives: one variable at a time', '9.4 Dérivées partielles : une variable à la fois'),
    P(`The tool of a 2-axis arm depends on <strong>two</strong> angles: <i>x</i> = ${I('L', '1')} cos ${I('θ', '1')} + ${I('L', '2')} cos(${I('θ', '1')} + ${I('θ', '2')}). The <strong>partial derivative</strong> ∂<i>x</i>/∂${I('θ', '1')} is the derivative with respect to ${I('θ', '1')}, <strong>the other angle being frozen</strong>. It answers: “if only motor 1 turns a little, how much does <i>x</i> change?”`,
      `L'outil d'un bras à 2 axes dépend de <strong>deux</strong> angles : <i>x</i> = ${I('L', '1')} cos ${I('θ', '1')} + ${I('L', '2')} cos(${I('θ', '1')} + ${I('θ', '2')}). La <strong>dérivée partielle</strong> ∂<i>x</i>/∂${I('θ', '1')} est la dérivée par rapport à ${I('θ', '1')}, <strong>l'autre angle étant figé</strong>. Elle répond à : « si seul le moteur 1 tourne un peu, de combien <i>x</i> change-t-il ? »`),
    EQ(`∂<i>x</i>/∂${I('θ', '1')} = −${I('L', '1')} sin ${I('θ', '1')} − ${I('L', '2')} sin(${I('θ', '1')} + ${I('θ', '2')}) &emsp;&emsp; ∂<i>x</i>/∂${I('θ', '2')} = −${I('L', '2')} sin(${I('θ', '1')} + ${I('θ', '2')})`),
    EQ(`∂<i>y</i>/∂${I('θ', '1')} = ${I('L', '1')} cos ${I('θ', '1')} + ${I('L', '2')} cos(${I('θ', '1')} + ${I('θ', '2')}) &emsp;&emsp; ∂<i>y</i>/∂${I('θ', '2')} = ${I('L', '2')} cos(${I('θ', '1')} + ${I('θ', '2')})`),
    P(`Look at ∂<i>x</i>/∂${I('θ', '2')}: the first term ${I('L', '1')} cos ${I('θ', '1')} disappeared, because it does not contain ${I('θ', '2')}. Motor 2 only moves the second link.`,
      `Regardez ∂<i>x</i>/∂${I('θ', '2')} : le premier terme ${I('L', '1')} cos ${I('θ', '1')} a disparu, car il ne contient pas ${I('θ', '2')}. Le moteur 2 ne bouge que le second segment.`),
    jacFig(),
    H4('9.5 The Jacobian: the table of all partial derivatives', '9.5 La jacobienne : le tableau de toutes les dérivées partielles'),
    P('Put the four partial derivatives in a matrix: one row per coordinate of the tool, one column per joint. This is the <strong>Jacobian</strong> <i>J</i>. When all the joints move together, the speeds add (chain rule with several variables):',
      'Rangez les quatre dérivées partielles dans une matrice : une ligne par coordonnée de l\'outil, une colonne par liaison. C\'est la <strong>jacobienne</strong> <i>J</i>. Quand toutes les liaisons bougent ensemble, les vitesses s\'additionnent (dérivée composée à plusieurs variables) :'),
    EQ(`${MX(1, ['<i>ẋ</i>', '<i>ẏ</i>'])} = ${MX(2, [`∂<i>x</i>/∂${I('θ', '1')}`, `∂<i>x</i>/∂${I('θ', '2')}`, `∂<i>y</i>/∂${I('θ', '1')}`, `∂<i>y</i>/∂${I('θ', '2')}`])} ${MX(1, [`${I('θ̇', '1')}`, `${I('θ̇', '2')}`])} &emsp;&emsp; <i>Ẋ</i> = <i>J</i> <i>θ̇</i>`),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P(`${I('L', '1')} = 0.5 m, ${I('L', '2')} = 0.4 m, ${I('θ', '1')} = 30°, ${I('θ', '2')} = 45° (the arm of lesson 5). Then <i>J</i> = ${MX(2, ['−0.636', '−0.386', '0.537', '0.104'])}. If ${I('θ̇', '1')} = 0.5 rad/s and ${I('θ̇', '2')} = 1 rad/s: <i>ẋ</i> = −0.636 × 0.5 − 0.386 × 1 = <strong>−0.705 m/s</strong>, <i>ẏ</i> = 0.537 × 0.5 + 0.104 × 1 = <strong>0.372 m/s</strong>.`,
        `${I('L', '1')} = 0,5 m, ${I('L', '2')} = 0,4 m, ${I('θ', '1')} = 30°, ${I('θ', '2')} = 45° (le bras de la leçon 5). Alors <i>J</i> = ${MX(2, ['−0,636', '−0,386', '0,537', '0,104'])}. Si ${I('θ̇', '1')} = 0,5 rad/s et ${I('θ̇', '2')} = 1 rad/s : <i>ẋ</i> = −0,636 × 0,5 − 0,386 × 1 = <strong>−0,705 m/s</strong>, <i>ẏ</i> = 0,537 × 0,5 + 0,104 × 1 = <strong>0,372 m/s</strong>.`)),
    BOX('idea', ['Two uses you will meet again', 'Deux usages que vous retrouverez'],
      UL([
        [`<strong>Small errors</strong>: Δ<i>X</i> ≈ <i>J</i> Δ<i>θ</i>. An error of 0.1° (0.00175 rad) on motor 1 moves the tool by about 0.636 × 0.00175 = 1.1 mm in x and 0.9 mm in y.`, `<strong>Petites erreurs</strong> : Δ<i>X</i> ≈ <i>J</i> Δ<i>θ</i>. Une erreur de 0,1° (0,00175 rad) sur le moteur 1 déplace l'outil d'environ 0,636 × 0,00175 = 1,1 mm en x et 0,9 mm en y.`],
        [`<strong>Singularities</strong>: here det <i>J</i> = ${I('L', '1')} ${I('L', '2')} sin ${I('θ', '2')} = 0.141. It becomes 0 when ${I('θ', '2')} = 0 (arm stretched): the tool can no longer move in some direction. The course “Singularities and the Jacobian” starts exactly here.`, `<strong>Singularités</strong> : ici dét <i>J</i> = ${I('L', '1')} ${I('L', '2')} sin ${I('θ', '2')} = 0,141. Il devient nul quand ${I('θ', '2')} = 0 (bras tendu) : l'outil ne peut plus bouger dans une direction. Le cours « Singularités et jacobienne » commence exactement ici.`]
      ]))
  ],
  terms: [['derivative', 'dérivée'], ['slope', 'pente'], ['chain rule', 'dérivée composée'], ['finite difference', 'différence finie'], ['partial derivative', 'dérivée partielle'], ['Jacobian', 'jacobienne']],
  quiz: [
    ['What is the derivative of the position with respect to time?', 'Quelle est la dérivée de la position par rapport au temps ?', 'The speed. The derivative of the speed is the acceleration.', 'La vitesse. La dérivée de la vitesse est l\'accélération.'],
    ['What does the partial derivative ∂x/∂θ₂ mean for a 2-axis arm?', 'Que veut dire la dérivée partielle ∂x/∂θ₂ pour un bras à 2 axes ?', 'How much x changes when only joint 2 turns a little, joint 1 being frozen.', 'De combien x change quand seule la liaison 2 tourne un peu, la liaison 1 étant figée.'],
    ['How is the Jacobian built?', 'Comment la jacobienne est-elle construite ?', 'It is the table of the partial derivatives of the tool coordinates: one row per coordinate, one column per joint.', 'C\'est le tableau des dérivées partielles des coordonnées de l\'outil : une ligne par coordonnée, une colonne par liaison.']
  ],
  link: ['learn-singularities.html', 'Continue with the Jacobian and singularities →', 'Continuer avec la jacobienne et les singularités →']
}),
// ------------------------------------------------------------------------------------------------ 10
lesson(PRE, 10, {
  title: ['Probability: living with noisy sensors', 'Probabilités : vivre avec des capteurs bruités'],
  time: 14,
  goal: ['the mean, the variance and the standard deviation, the normal law and its 68–95–99.7 rule, and how to combine measurements: the idea behind the Kalman filter.', 'la moyenne, la variance et l\'écart-type, la loi normale et sa règle 68–95–99,7, et comment combiner des mesures : l\'idée derrière le filtre de Kalman.'],
  body: [
    H4('10.1 Every measurement is a little wrong', '10.1 Chaque mesure est un peu fausse'),
    P('Measure the same wall five times with a laser: 2.02 m, 1.98 m, 2.05 m, 1.97 m, 1.98 m. None is “the” distance. A robot must decide with numbers like these. Probability gives the tools to say <strong>what is most likely</strong> and <strong>how sure we are</strong>.',
      'Mesurez cinq fois le même mur avec un laser : 2,02 m, 1,98 m, 2,05 m, 1,97 m, 1,98 m. Aucune n\'est « la » distance. Un robot doit décider avec des nombres comme ceux-là. Les probabilités donnent les outils pour dire <strong>ce qui est le plus probable</strong> et <strong>à quel point on en est sûr</strong>.'),
    H4('10.2 Mean, variance, standard deviation', '10.2 Moyenne, variance, écart-type'),
    TABLE([['Quantity', 'Grandeur'], ['Formula', 'Formule'], ['Meaning', 'Sens'], ['Our 5 measurements', 'Nos 5 mesures']], [
      [['<strong>Mean</strong> <i>μ</i>', '<strong>Moyenne</strong> <i>μ</i>'], '(<i>x</i><sub>1</sub> + … + <i>x</i><sub>N</sub>) / <i>N</i>', ['the best guess', 'la meilleure estimation'], n('10.00 / 5 = <strong>2.00 m</strong>')],
      [['<strong>Variance</strong> <i>σ</i>²', '<strong>Variance</strong> <i>σ</i>²'], ['mean of (<i>x</i> − <i>μ</i>)²', 'moyenne des (<i>x</i> − <i>μ</i>)²'], ['the spread, in m²', 'la dispersion, en m²'], n('(0.0004 + 0.0004 + 0.0025 + 0.0009 + 0.0004) / 5 = 0.00092 m²')],
      [['<strong>Standard deviation</strong> <i>σ</i>', '<strong>Écart-type</strong> <i>σ</i>'], '√(<i>σ</i>²)', ['the spread, in metres: the typical error', 'la dispersion, en mètres : l\'erreur typique'], n('√0.00092 ≈ <strong>0.03 m</strong> (3 cm)')]
    ]),
    P('(Statistics books often divide by <i>N</i> − 1 instead of <i>N</i> for a small sample: here it gives 0.034 m. The idea is the same.)', '(Les livres de statistiques divisent souvent par <i>N</i> − 1 au lieu de <i>N</i> pour un petit échantillon : ici cela donne 0,034 m. L\'idée est la même.)'),
    H4('10.3 The normal law (the bell curve)', '10.3 La loi normale (la courbe en cloche)'),
    P('The noise of most sensors follows the <strong>normal</strong> (Gaussian) law: values near the mean are frequent, far values are rare. It is described by only two numbers, <i>μ</i> and <i>σ</i>. The rule to remember:',
      'Le bruit de la plupart des capteurs suit la loi <strong>normale</strong> (gaussienne) : les valeurs proches de la moyenne sont fréquentes, les valeurs éloignées sont rares. Elle est décrite par seulement deux nombres, <i>μ</i> et <i>σ</i>. La règle à retenir :'),
    fig(plot({ x: [-4, 4], y: [0, 0.45], ticks: [8, 3], curves: [{ f: gauss(0, 1), c: COL.b, label: ['normal law, μ = 0, σ = 1', 'loi normale, μ = 0, σ = 1'] }], segs: [[-3, 0.025, 3, 0.025, COL.o, 6], [-2, 0.075, 2, 0.075, COL.y, 6], [-1, 0.125, 1, 0.125, COL.g, 6]], marks: [[3, 0.025, ['99.7 %', '99,7 %'], COL.o], [2, 0.075, '95 %', COL.y], [1, 0.125, '68 %', COL.g]], xl: ['distance from the mean, in σ', 'écart à la moyenne, en σ'] })),
    TABLE([['Interval', 'Intervalle'], ['Share of the measurements', 'Part des mesures']], [['<i>μ</i> ± <i>σ</i>', '68 %'], ['<i>μ</i> ± 2<i>σ</i>', '95 %'], ['<i>μ</i> ± 3<i>σ</i>', n('99.7 %')]]),
    BOX('example', ['Worked example', 'Exemple résolu'],
      P('A lidar has <i>σ</i> = 2 cm and reads 1.50 m. With 95 % confidence the true distance is in 1.50 ± 0.04 m, between <strong>1.46 m and 1.54 m</strong>. A safety stop that must never miss an obstacle uses ±3<i>σ</i>: 1.44 m.',
        'Un lidar a <i>σ</i> = 2 cm et lit 1,50 m. Avec une confiance de 95 %, la vraie distance est dans 1,50 ± 0,04 m, entre <strong>1,46 m et 1,54 m</strong>. Un arrêt de sécurité qui ne doit jamais rater un obstacle utilise ±3<i>σ</i> : 1,44 m.')),
    H4('10.4 Three rules to handle errors', '10.4 Trois règles pour manier les erreurs'),
    OL([
      ['<strong>Averaging reduces the noise</strong>: the mean of <i>N</i> independent measurements has a standard deviation <i>σ</i> / √<i>N</i>. Four measurements divide the error by 2; one hundred divide it by 10.', '<strong>Moyenner réduit le bruit</strong> : la moyenne de <i>N</i> mesures indépendantes a un écart-type <i>σ</i> / √<i>N</i>. Quatre mesures divisent l\'erreur par 2 ; cent la divisent par 10.'],
      ['<strong>Independent errors add in variance</strong>, not in standard deviation: <i>σ</i><sub>total</sub> = √(<i>σ</i><sub>1</sub>² + <i>σ</i><sub>2</sub>²). A camera error of 3 mm and a robot error of 4 mm give 5 mm, not 7 mm.', '<strong>Des erreurs indépendantes s\'ajoutent en variance</strong>, pas en écart-type : <i>σ</i><sub>total</sub> = √(<i>σ</i><sub>1</sub>² + <i>σ</i><sub>2</sub>²). Une erreur de caméra de 3 mm et une erreur de robot de 4 mm donnent 5 mm, pas 7 mm.'],
      ['<strong>Independent events multiply</strong>: if a grasp succeeds 9 times out of 10, three grasps in a row succeed 0.9 × 0.9 × 0.9 = 73 % of the time.', '<strong>Des événements indépendants se multiplient</strong> : si une prise réussit 9 fois sur 10, trois prises de suite réussissent 0,9 × 0,9 × 0,9 = 73 % du temps.']
    ]),
    H4('10.5 Combining two sensors: Kalman in one line', '10.5 Combiner deux capteurs : Kalman en une ligne'),
    P('Two sensors measure the same position: the GPS says 10 m (<i>σ</i> = 3 m), the wheels say 12 m (<i>σ</i> = 4 m). The best combination gives each one a <strong>weight 1/<i>σ</i>²</strong>: the more precise sensor counts more.',
      'Deux capteurs mesurent la même position : le GPS dit 10 m (<i>σ</i> = 3 m), les roues disent 12 m (<i>σ</i> = 4 m). La meilleure combinaison donne à chacun un <strong>poids 1/<i>σ</i>²</strong> : le capteur le plus précis compte davantage.'),
    EQ('<i>x</i> = (<i>x</i><sub>1</sub>/<i>σ</i><sub>1</sub>² + <i>x</i><sub>2</sub>/<i>σ</i><sub>2</sub>²) / (1/<i>σ</i><sub>1</sub>² + 1/<i>σ</i><sub>2</sub>²) &emsp;&emsp; 1/<i>σ</i>² = 1/<i>σ</i><sub>1</sub>² + 1/<i>σ</i><sub>2</sub>²'),
    P('Here: weights 1/9 = 0.111 and 1/16 = 0.0625, so <i>x</i> = (10 × 0.111 + 12 × 0.0625) / 0.174 = <strong>10.72 m</strong>, and 1/<i>σ</i>² = 0.174, so <i>σ</i> = <strong>2.4 m</strong>: better than each sensor alone. The <strong>Kalman filter</strong> repeats this fusion at every step, between the prediction of the motion and the new measurement.',
      'Ici : poids 1/9 = 0,111 et 1/16 = 0,0625, donc <i>x</i> = (10 × 0,111 + 12 × 0,0625) / 0,174 = <strong>10,72 m</strong>, et 1/<i>σ</i>² = 0,174, donc <i>σ</i> = <strong>2,4 m</strong> : mieux que chaque capteur seul. Le <strong>filtre de Kalman</strong> répète cette fusion à chaque pas, entre la prédiction du mouvement et la nouvelle mesure.'),
    fuseFig(),
    BOX('keep', ['What to remember', 'Ce qu\'il faut retenir'],
      P('A measurement without its <i>σ</i> is half a measurement. Robots carry, with every estimate, its uncertainty: this is what lets them combine sensors, decide when to trust them, and stop safely.',
        'Une mesure sans son <i>σ</i> n\'est qu\'une demi-mesure. Les robots gardent, avec chaque estimation, son incertitude : c\'est ce qui leur permet de combiner des capteurs, de décider quand leur faire confiance, et de s\'arrêter en sécurité.'))
  ],
  terms: [['mean', 'moyenne'], ['variance', 'variance'], ['standard deviation', 'écart-type'], ['normal (Gaussian) law', 'loi normale (gaussienne)'], ['independent', 'indépendant'], ['sensor fusion', 'fusion de capteurs']],
  quiz: [
    ['What share of the measurements falls within μ ± 2σ for a normal law?', 'Quelle part des mesures tombe dans μ ± 2σ pour une loi normale ?', 'About 95 %.', 'Environ 95 %.'],
    ['How does averaging 4 independent measurements change the error?', 'Comment moyenner 4 mesures indépendantes change-t-il l\'erreur ?', 'It divides the standard deviation by √4 = 2.', 'Cela divise l\'écart-type par √4 = 2.'],
    ['Two sensors are combined. Which one gets the larger weight?', 'On combine deux capteurs. Lequel reçoit le plus grand poids ?', 'The more precise one (the smaller σ): the weight is 1/σ².', 'Le plus précis (le plus petit σ) : le poids est 1/σ².']
  ],
  link: ['learn-intelligence.html', 'See the Kalman filter at work in the perception course →', 'Voir le filtre de Kalman à l\'œuvre dans le cours de perception →']
})
  ];
}
