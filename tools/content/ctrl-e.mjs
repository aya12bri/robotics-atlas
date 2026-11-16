// Dynamics, actuators and control — lessons 11 and 12: the basics of control theory.
//   11: systems, transfer functions, poles and stability, the closed loop, state space
//   12: frequency response, margins, delay, sampling and the digital PID
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, CODE, OUT, lesson } from '../lib.mjs';
import { plot, chain, COL } from '../practice/fig.mjs';
const PRE = 'ctrl-';
const SP = ' &emsp;&emsp; ';
const fig = (p) => FIG(p.vb, p.svg);

export function partE() {
  return [
// ------------------------------------------------------------------------------------------------ 11
lesson(PRE, 11, {
  title: ['Control theory 1: transfer functions, poles and stability', 'Automatique 1 : fonctions de transfert, pôles et stabilité'],
  time: 20,
  goal: ['to describe a system by its response, its transfer function and its poles, to know when it is stable, and to predict what a feedback loop does before trying it.', 'à décrire un système par sa réponse, sa fonction de transfert et ses pôles, à savoir quand il est stable, et à prévoir ce que fait une boucle de rétroaction avant de l\'essayer.'],
  body: [
    P('Lesson 4 tuned a PID by trying. Control theory gives the tools to <strong>predict</strong>: how fast the robot will reach its target, whether it will overshoot, whether it will oscillate or go unstable. You need the derivatives of the maths course and a little algebra.',
      'La leçon 4 réglait un PID en essayant. L\'automatique donne les outils pour <strong>prévoir</strong> : à quelle vitesse le robot atteindra sa consigne, s\'il dépassera, s\'il oscillera ou deviendra instable. Il faut les dérivées du cours de maths et un peu d\'algèbre.'),
    H4('11.1 A system: an input, an output, an equation', '11.1 Un système : une entrée, une sortie, une équation'),
    P('A <strong>system</strong> turns an input <i>u</i>(<i>t</i>) into an output <i>y</i>(<i>t</i>). Example: a DC motor, input = voltage, output = speed. Its physics gives a <strong>differential equation</strong> (an equation with derivatives). For the motor, with a gain <i>K</i> and a time constant <i>τ</i>:',
      'Un <strong>système</strong> transforme une entrée <i>u</i>(<i>t</i>) en une sortie <i>y</i>(<i>t</i>). Exemple : un moteur à courant continu, entrée = tension, sortie = vitesse. Sa physique donne une <strong>équation différentielle</strong> (une équation avec des dérivées). Pour le moteur, avec un gain <i>K</i> et une constante de temps <i>τ</i> :'),
    EQ('<i>τ</i> <i>ẏ</i> + <i>y</i> = <i>K</i> <i>u</i>'),
    P('This is a <strong>first-order system</strong>. Apply a step (switch the voltage from 0 to <i>U</i>): the speed rises as <i>y</i>(<i>t</i>) = <i>K</i> <i>U</i> (1 − e<sup>−<i>t</i>/<i>τ</i></sup>). Two numbers describe everything:',
      'C\'est un <strong>système du premier ordre</strong>. Appliquez un échelon (passer la tension de 0 à <i>U</i>) : la vitesse monte selon <i>y</i>(<i>t</i>) = <i>K</i> <i>U</i> (1 − e<sup>−<i>t</i>/<i>τ</i></sup>). Deux nombres décrivent tout :'),
    UL([
      ['<strong>The static gain <i>K</i></strong>: the final value is <i>K</i> <i>U</i>.', '<strong>Le gain statique <i>K</i></strong> : la valeur finale vaut <i>K</i> <i>U</i>.'],
      ['<strong>The time constant <i>τ</i></strong>: after <i>τ</i> the output has done <strong>63 %</strong> of its way, after 3<i>τ</i> <strong>95 %</strong>.', '<strong>La constante de temps <i>τ</i></strong> : après <i>τ</i>, la sortie a fait <strong>63 %</strong> du chemin, après 3<i>τ</i> <strong>95 %</strong>.']
    ]),
    fig(plot({ x: [0, 0.5], y: [0, 11], ticks: [5, 4], curves: [{ f: (t) => 10 * (1 - Math.exp(-t / 0.1)), c: COL.b, label: ['motor speed, K = 2 rad/s/V, τ = 0.1 s, U = 5 V', 'vitesse du moteur, K = 2 rad/s/V, τ = 0,1 s, U = 5 V'] }], xl: ['time (s)', 'temps (s)'], yl: 'rad/s', marks: [[0.1, 6.32, ['63 % at t = τ', '63 % à t = τ']], [0.3, 9.5, ['95 % at 3τ', '95 % à 3τ']]] })),
    H4('11.2 The transfer function: the equation as a fraction', '11.2 La fonction de transfert : l\'équation sous forme de fraction'),
    P('Engineers replace “derive in time” by a letter, <strong><i>s</i></strong> (the Laplace variable). Then <i>τ</i> <i>ẏ</i> + <i>y</i> = <i>K</i> <i>u</i> becomes (<i>τ</i> <i>s</i> + 1) <i>Y</i> = <i>K</i> <i>U</i>, and the system is the fraction:',
      'Les ingénieurs remplacent « dériver dans le temps » par une lettre, <strong><i>s</i></strong> (la variable de Laplace). Alors <i>τ</i> <i>ẏ</i> + <i>y</i> = <i>K</i> <i>u</i> devient (<i>τ</i> <i>s</i> + 1) <i>Y</i> = <i>K</i> <i>U</i>, et le système est la fraction :'),
    EQ(`<i>G</i>(<i>s</i>) = <i>Y</i> / <i>U</i> = <i>K</i> / (<i>τ</i> <i>s</i> + 1)${SP}(first order)`, `<i>G</i>(<i>s</i>) = <i>Y</i> / <i>U</i> = <i>K</i> / (<i>τ</i> <i>s</i> + 1)${SP}(premier ordre)`),
    EQ(`<i>G</i>(<i>s</i>) = <i>ω</i><sub>n</sub>² / (<i>s</i>² + 2<i>ζ</i><i>ω</i><sub>n</sub> <i>s</i> + <i>ω</i><sub>n</sub>²)${SP}(second order)`, `<i>G</i>(<i>s</i>) = <i>ω</i><sub>n</sub>² / (<i>s</i>² + 2<i>ζ</i><i>ω</i><sub>n</sub> <i>s</i> + <i>ω</i><sub>n</sub>²)${SP}(second ordre)`),
    P('Why it helps: blocks in a row <strong>multiply</strong>, and the derivatives disappear. You build the whole loop with fractions instead of solving differential equations. The second order (a joint with its inertia and its controller, a spring and a mass) has a natural frequency <i>ω</i><sub>n</sub> and a damping <i>ζ</i>, the two numbers of the PID figure of lesson 4.',
      'Pourquoi c\'est utile : des blocs à la suite se <strong>multiplient</strong>, et les dérivées disparaissent. On construit toute la boucle avec des fractions au lieu de résoudre des équations différentielles. Le second ordre (une liaison avec son inertie et sa commande, un ressort et une masse) a une pulsation propre <i>ω</i><sub>n</sub> et un amortissement <i>ζ</i>, les deux nombres de la figure du PID de la leçon 4.'),
    TABLE([['Damping ζ', 'Amortissement ζ'], ['Step response', 'Réponse à un échelon'], ['Overshoot', 'Dépassement']], [
      ['0', ['oscillates forever', 'oscille sans fin'], '100 %'],
      [['0.5', '0,5'], ['fast, overshoots, a few waves', 'rapide, dépasse, quelques vagues'], '16 %'],
      [['0.7', '0,7'], ['the usual compromise', 'le compromis habituel'], '5 %'],
      ['≥ 1', ['no overshoot, slower', 'sans dépassement, plus lent'], '0 %']
    ]),
    P('Overshoot: <i>D</i> = e<sup>−π<i>ζ</i>/√(1−<i>ζ</i>²)</sup>. Time to settle within 2 %: about 4 / (<i>ζ</i> <i>ω</i><sub>n</sub>).', 'Dépassement : <i>D</i> = e<sup>−π<i>ζ</i>/√(1−<i>ζ</i>²)</sup>. Temps pour rester à 2 % près : environ 4 / (<i>ζ</i> <i>ω</i><sub>n</sub>).'),
    H4('11.3 Poles: the key to stability', '11.3 Les pôles : la clé de la stabilité'),
    P('The <strong>poles</strong> are the values of <i>s</i> that make the denominator zero. Each pole gives one “mode” of the response, e<sup><i>p</i> <i>t</i></sup>. So their position says everything:',
      'Les <strong>pôles</strong> sont les valeurs de <i>s</i> qui annulent le dénominateur. Chaque pôle donne un « mode » de la réponse, e<sup><i>p</i> <i>t</i></sup>. Leur position dit donc tout :'),
    TABLE([['Pole <i>p</i>', 'Pôle <i>p</i>'], ['Mode e<sup><i>p t</i></sup>', 'Mode e<sup><i>p t</i></sup>'], ['Example', 'Exemple'], ['Verdict', 'Verdict']], [
      [['real, negative', 'réel, négatif'], ['dies out', 's\'éteint'], ['1 / (<i>s</i> + 2): <i>p</i> = −2', '1 / (<i>s</i> + 2) : <i>p</i> = −2'], ['<strong>stable</strong>', '<strong>stable</strong>']],
      [['complex, negative real part', 'complexe, partie réelle négative'], ['oscillation that dies out', 'oscillation qui s\'éteint'], ['ζ = 0.5, ωn = 10: <i>p</i> = −5 ± 8.66 j', 'ζ = 0,5, ωn = 10 : <i>p</i> = −5 ± 8,66 j'], ['<strong>stable</strong>', '<strong>stable</strong>']],
      [['on the imaginary axis', 'sur l\'axe imaginaire'], ['oscillation that never stops', 'oscillation qui ne s\'arrête jamais'], ['1 / (<i>s</i>² + 4): <i>p</i> = ± 2 j', '1 / (<i>s</i>² + 4) : <i>p</i> = ± 2 j'], ['limit of stability', 'limite de stabilité']],
      [['positive real part', 'partie réelle positive'], ['grows without end', 'grandit sans fin'], ['1 / (<i>s</i> − 1): <i>p</i> = +1', '1 / (<i>s</i> − 1) : <i>p</i> = +1'], ['<strong>unstable</strong>', '<strong>instable</strong>']]
    ]),
    BOX('keep', ['The rule', 'La règle'],
      P('A system is <strong>stable</strong> if and only if <strong>all its poles have a negative real part</strong> (they are in the left half of the complex plane). The further left, the faster the response; the further from the real axis, the more it oscillates.',
        'Un système est <strong>stable</strong> si et seulement si <strong>tous ses pôles ont une partie réelle négative</strong> (ils sont dans la moitié gauche du plan complexe). Plus ils sont à gauche, plus la réponse est rapide ; plus ils sont loin de l\'axe réel, plus elle oscille.')),
    H4('11.4 Closing the loop: what feedback really does', '11.4 Fermer la boucle : ce que fait vraiment la rétroaction'),
    fig(chain([[['target', 'consigne'], COL.p], [['controller C(s)', 'correcteur C(s)'], COL.b], [['motor G(s)', 'moteur G(s)'], COL.o], [['speed', 'vitesse'], COL.g]], { fb: [1, ['measured speed', 'vitesse mesurée']] })),
    P('With a controller <i>C</i> and a system <i>G</i> in a loop, the output follows the target through the closed-loop transfer function:', 'Avec un correcteur <i>C</i> et un système <i>G</i> en boucle, la sortie suit la consigne au travers de la fonction de transfert en boucle fermée :'),
    EQ('<i>F</i>(<i>s</i>) = <i>C</i> <i>G</i> / (1 + <i>C</i> <i>G</i>)'),
    BOX('example', ['Worked example: a P controller on the motor', 'Exemple résolu : un correcteur P sur le moteur'],
      P('Motor <i>K</i> / (<i>τ</i> <i>s</i> + 1), controller <i>C</i> = <i>K</i><sub>p</sub>. Then <i>F</i> = <i>K K</i><sub>p</sub> / (<i>τ</i> <i>s</i> + 1 + <i>K K</i><sub>p</sub>). Divide by 1 + <i>K K</i><sub>p</sub>: it is again a first order, with', 'Moteur <i>K</i> / (<i>τ</i> <i>s</i> + 1), correcteur <i>C</i> = <i>K</i><sub>p</sub>. Alors <i>F</i> = <i>K K</i><sub>p</sub> / (<i>τ</i> <i>s</i> + 1 + <i>K K</i><sub>p</sub>). En divisant par 1 + <i>K K</i><sub>p</sub>, c\'est encore un premier ordre, avec'),
      UL([
        ['a <strong>time constant divided</strong> by 1 + <i>K K</i><sub>p</sub>: feedback makes the motor faster;', 'une <strong>constante de temps divisée</strong> par 1 + <i>K K</i><sub>p</sub> : la rétroaction rend le moteur plus rapide ;'],
        ['a <strong>final error</strong> of 1 / (1 + <i>K K</i><sub>p</sub>) of the target: a P controller alone never quite arrives.', 'une <strong>erreur finale</strong> de 1 / (1 + <i>K K</i><sub>p</sub>) de la consigne : un correcteur P seul n\'arrive jamais tout à fait.']
      ]),
      P('With <i>K</i> = 2, <i>τ</i> = 0.1 s, <i>K</i><sub>p</sub> = 0.5: <i>K K</i><sub>p</sub> = 1, the time constant becomes 0.05 s, and for a target of 20 rad/s the motor stops at <strong>10 rad/s</strong> (50 % error). Adding an <strong>integral</strong> term puts a pole at <i>s</i> = 0 in the controller and cancels the final error: lesson 12 shows it running.',
        'Avec <i>K</i> = 2, <i>τ</i> = 0,1 s, <i>K</i><sub>p</sub> = 0,5 : <i>K K</i><sub>p</sub> = 1, la constante de temps devient 0,05 s, et pour une consigne de 20 rad/s le moteur s\'arrête à <strong>10 rad/s</strong> (50 % d\'erreur). Ajouter un terme <strong>intégral</strong> met un pôle en <i>s</i> = 0 dans le correcteur et annule l\'erreur finale : la leçon 12 le montre en marche.')),
    BOX('warn', ['Feedback can also destabilise', 'La rétroaction peut aussi déstabiliser'],
      P('On a first-order system a P controller is always stable. But a real joint has more poles (the inertia, the current loop, the filter, the delay of the computer). Then a gain that is too high moves two closed-loop poles towards the right half-plane: the joint oscillates, then goes unstable. This is the sound of a badly tuned robot.',
        'Sur un système du premier ordre, un correcteur P est toujours stable. Mais une vraie liaison a plus de pôles (l\'inertie, la boucle de courant, le filtre, le retard du calculateur). Alors un gain trop grand pousse deux pôles de la boucle fermée vers le demi-plan droit : la liaison oscille, puis devient instable. C\'est le bruit d\'un robot mal réglé.')),
    H4('11.5 The same thing with matrices: the state-space form', '11.5 La même chose avec des matrices : la représentation d\'état'),
    P('With many inputs and outputs (a whole robot), fractions become clumsy. We write instead the <strong>state</strong> <i>x</i> (the numbers that describe the system now: positions and speeds) and one matrix equation:',
      'Avec beaucoup d\'entrées et de sorties (tout un robot), les fractions deviennent lourdes. On écrit plutôt l\'<strong>état</strong> <i>x</i> (les nombres qui décrivent le système maintenant : positions et vitesses) et une seule équation matricielle :'),
    EQ(`<i>ẋ</i> = <i>A</i> <i>x</i> + <i>B</i> <i>u</i>${SP}<i>y</i> = <i>C</i> <i>x</i>`),
    P(`For the motor with state <i>x</i> = (angle <i>θ</i>, speed <i>ω</i>): ${MX(1, ['<i>θ̇</i>', '<i>ω̇</i>'])} = ${MX(2, ['0', '1', '0', '−1/<i>τ</i>'])} ${MX(1, ['<i>θ</i>', '<i>ω</i>'])} + ${MX(1, ['0', '<i>K</i>/<i>τ</i>'])} <i>u</i>. The <strong>eigenvalues of <i>A</i></strong> are exactly the poles: here 0 (the angle integrates the speed) and −1/<i>τ</i> = −10. The stability rule is the same. The Kalman filter, LQR optimal control and model predictive control are all written in this form.`,
      `Pour le moteur avec l'état <i>x</i> = (angle <i>θ</i>, vitesse <i>ω</i>) : ${MX(1, ['<i>θ̇</i>', '<i>ω̇</i>'])} = ${MX(2, ['0', '1', '0', '−1/<i>τ</i>'])} ${MX(1, ['<i>θ</i>', '<i>ω</i>'])} + ${MX(1, ['0', '<i>K</i>/<i>τ</i>'])} <i>u</i>. Les <strong>valeurs propres de <i>A</i></strong> sont exactement les pôles : ici 0 (l'angle intègre la vitesse) et −1/<i>τ</i> = −10. La règle de stabilité est la même. Le filtre de Kalman, la commande optimale LQR et la commande prédictive s'écrivent tous sous cette forme.`)
  ],
  terms: [['first-order system', 'système du premier ordre'], ['time constant', 'constante de temps'], ['transfer function', 'fonction de transfert'], ['pole', 'pôle'], ['stability', 'stabilité'], ['closed loop', 'boucle fermée'], ['state space', 'représentation d\'état']],
  quiz: [
    ['A first-order system has τ = 0.2 s. After how long has it done 95 % of a step?', 'Un système du premier ordre a τ = 0,2 s. Au bout de combien de temps a-t-il fait 95 % d\'un échelon ?', '3τ = 0.6 s.', '3τ = 0,6 s.'],
    ['When is a system stable?', 'Quand un système est-il stable ?', 'When all its poles have a negative real part.', 'Quand tous ses pôles ont une partie réelle négative.'],
    ['Why does a P controller alone leave an error on a first-order motor?', 'Pourquoi un correcteur P seul laisse-t-il une erreur sur un moteur du premier ordre ?', 'It needs an error to produce a voltage: the final error is 1/(1 + K Kp) of the target. An integral term removes it.', 'Il a besoin d\'une erreur pour produire une tension : l\'erreur finale vaut 1/(1 + K Kp) de la consigne. Un terme intégral l\'annule.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 12
lesson(PRE, 12, {
  title: ['Control theory 2: frequency response, margins and digital control', 'Automatique 2 : réponse en fréquence, marges et commande numérique'],
  time: 20,
  goal: ['to read a Bode diagram, to understand the bandwidth and the stability margins, why delays are dangerous, how fast to sample, and how a PID is really coded in a drive.', 'à lire un diagramme de Bode, à comprendre la bande passante et les marges de stabilité, pourquoi les retards sont dangereux, à quelle vitesse échantillonner, et comment un PID est vraiment codé dans un variateur.'],
  body: [
    H4('12.1 Shake it: the frequency response', '12.1 Le secouer : la réponse en fréquence'),
    P('Instead of a step, send a <strong>sine wave</strong> of pulsation <i>ω</i> to the system. The output is a sine of the same pulsation, but <strong>smaller or bigger</strong> (the gain) and <strong>late</strong> (the phase). Slow sines pass; fast ones are filtered out. The <strong>Bode diagram</strong> draws the gain and the phase for every <i>ω</i>, with logarithmic scales.',
      'Au lieu d\'un échelon, envoyez au système une <strong>sinusoïde</strong> de pulsation <i>ω</i>. La sortie est une sinusoïde de même pulsation, mais <strong>plus petite ou plus grande</strong> (le gain) et <strong>en retard</strong> (la phase). Les sinusoïdes lentes passent ; les rapides sont filtrées. Le <strong>diagramme de Bode</strong> trace le gain et la phase pour chaque <i>ω</i>, avec des échelles logarithmiques.'),
    EQ('gain in dB = 20 log<sub>10</sub>( |<i>G</i>(j<i>ω</i>)| )', 'gain en dB = 20 log<sub>10</sub>( |<i>G</i>(j<i>ω</i>)| )'),
    fig(plot({ x: [-1, 3], y: [-45, 5], ticks: [4, 5], curves: [{ f: (lw) => -10 * Math.log10(1 + Math.pow(10, 2 * lw) * 0.01), c: COL.b, label: ['first order, τ = 0.1 s (cut-off 10 rad/s)', 'premier ordre, τ = 0,1 s (coupure 10 rad/s)'] }], xl: ['log₁₀ ω  (ω = 0.1 … 1000 rad/s)', 'log₁₀ ω  (ω = 0,1 … 1000 rad/s)'], yl: ['gain (dB)', 'gain (dB)'], marks: [[1, -3, ['−3 dB at ω = 1/τ', '−3 dB en ω = 1/τ']], [2, -20, ['−20 dB: ÷10', '−20 dB : ÷10']]] })),
    TABLE([['Reading', 'Lecture'], ['First order K/(τs + 1), τ = 0.1 s', 'Premier ordre K/(τs + 1), τ = 0,1 s']], [
      [['slow (ω ≪ 1/τ)', 'lent (ω ≪ 1/τ)'], ['gain = <i>K</i>, no delay: the output follows', 'gain = <i>K</i>, pas de retard : la sortie suit']],
      [['cut-off (ω = 1/τ = 10 rad/s)', 'coupure (ω = 1/τ = 10 rad/s)'], ['gain × 0.707 (−3 dB), late by 45°', 'gain × 0,707 (−3 dB), en retard de 45°']],
      [['fast (ω ≫ 1/τ)', 'rapide (ω ≫ 1/τ)'], ['gain ÷ 10 per decade (−20 dB/decade), late by almost 90°', 'gain ÷ 10 par décade (−20 dB/décade), en retard de presque 90°']]
    ]),
    P('The <strong>bandwidth</strong> of a closed loop is the pulsation up to which it follows the target. It is the most useful single number: a joint loop with a bandwidth of 30 rad/s (about 5 Hz) cannot follow a motion that vibrates faster than that.',
      'La <strong>bande passante</strong> d\'une boucle fermée est la pulsation jusqu\'à laquelle elle suit la consigne. C\'est le nombre le plus utile : une boucle de liaison avec une bande passante de 30 rad/s (environ 5 Hz) ne peut pas suivre un mouvement qui vibre plus vite que cela.'),
    H4('12.2 Margins: how far from instability?', '12.2 Les marges : à quelle distance de l\'instabilité ?'),
    P('A loop becomes unstable when, at some frequency, the signal that goes around the loop comes back <strong>with a gain of 1 and late by 180°</strong>: it then adds to itself at every turn, like the howl of a microphone near its loudspeaker. The <strong>margins</strong> say how far we are from this point, on the open loop <i>C</i> <i>G</i>:',
      'Une boucle devient instable quand, à une certaine fréquence, le signal qui fait le tour de la boucle revient <strong>avec un gain de 1 et un retard de 180°</strong> : il s\'ajoute alors à lui-même à chaque tour, comme le larsen d\'un micro près de son haut-parleur. Les <strong>marges</strong> disent à quelle distance on est de ce point, sur la boucle ouverte <i>C</i> <i>G</i> :'),
    TABLE([['Margin', 'Marge'], ['Definition', 'Définition'], ['Good value', 'Bonne valeur']], [
      [['<strong>Phase margin</strong>', '<strong>Marge de phase</strong>'], ['how many degrees are left before 180° of lag, at the frequency where the gain is 1', 'combien de degrés restent avant 180° de retard, à la fréquence où le gain vaut 1'], ['45° to 60° (it also sets the overshoot)', '45° à 60° (elle fixe aussi le dépassement)']],
      [['<strong>Gain margin</strong>', '<strong>Marge de gain</strong>'], ['by how much the gain could be multiplied before reaching 1, at the frequency where the lag is 180°', 'de combien on pourrait multiplier le gain avant d\'atteindre 1, à la fréquence où le retard vaut 180°'], ['at least × 2 (6 dB)', 'au moins × 2 (6 dB)']]
    ]),
    H4('12.3 Delays: the hidden enemy', '12.3 Les retards : l\'ennemi caché'),
    P('A delay <i>T</i> (computation, communication on the bus, filtering) does not change the gain but adds a lag of <strong><i>ω</i> <i>T</i> radians</strong>, which grows with the frequency. A delay of 10 ms at 10 rad/s costs 0.1 rad = 6° of phase margin; at 100 rad/s it costs 57°. This is why fast loops (current, speed) run inside the drive, close to the motor, and why a robot controlled over Wi-Fi must be slow.',
      'Un retard <i>T</i> (calcul, communication sur le bus, filtrage) ne change pas le gain mais ajoute un retard de phase de <strong><i>ω</i> <i>T</i> radians</strong>, qui grandit avec la fréquence. Un retard de 10 ms à 10 rad/s coûte 0,1 rad = 6° de marge de phase ; à 100 rad/s il en coûte 57°. C\'est pourquoi les boucles rapides (courant, vitesse) tournent dans le variateur, près du moteur, et pourquoi un robot commandé par Wi-Fi doit être lent.'),
    H4('12.4 Digital control: sampling', '12.4 La commande numérique : l\'échantillonnage'),
    P('A computer does not see the signal all the time: it <strong>samples</strong> it every <i>T</i><sub>s</sub> seconds, computes, and holds its command until the next sample. Three rules:', 'Un calculateur ne voit pas le signal en continu : il l\'<strong>échantillonne</strong> toutes les <i>T</i><sub>s</sub> secondes, calcule, et maintient sa commande jusqu\'à l\'échantillon suivant. Trois règles :'),
    OL([
      ['<strong>Shannon</strong>: to see a signal of frequency <i>f</i>, sample faster than 2<i>f</i>. Below that, a fast vibration appears as a slow false one (aliasing): filter the signal before sampling.', '<strong>Shannon</strong> : pour voir un signal de fréquence <i>f</i>, échantillonnez plus vite que 2<i>f</i>. En dessous, une vibration rapide apparaît comme une fausse vibration lente (repliement) : filtrez le signal avant de l\'échantillonner.'],
      ['<strong>For control</strong>, sample <strong>10 to 30 times</strong> faster than the bandwidth of the loop. Sampling and holding behave like a delay of about <i>T</i><sub>s</sub>/2, which eats the phase margin.', '<strong>Pour la commande</strong>, échantillonnez <strong>10 à 30 fois</strong> plus vite que la bande passante de la boucle. Échantillonner et maintenir agit comme un retard d\'environ <i>T</i><sub>s</sub>/2, qui mange la marge de phase.'],
      ['<strong>Typical rates</strong> in a robot: current loop 10 to 20 kHz, speed loop 2 to 8 kHz, position loop 1 to 4 kHz, trajectory 100 Hz to 1 kHz, perception 10 to 60 Hz.', '<strong>Fréquences typiques</strong> dans un robot : boucle de courant 10 à 20 kHz, boucle de vitesse 2 à 8 kHz, boucle de position 1 à 4 kHz, trajectoire 100 Hz à 1 kHz, perception 10 à 60 Hz.']
    ]),
    H4('12.5 A digital PID, as it is coded in a drive', '12.5 Un PID numérique, tel qu\'il est codé dans un variateur'),
    P('The integral becomes a sum (add <i>K</i><sub>i</sub> <i>e</i> <i>T</i><sub>s</sub> at each sample); the derivative becomes a difference divided by <i>T</i><sub>s</sub> (maths course, lesson 9). Three details make the difference between a textbook PID and one that works on a robot:',
      'L\'intégrale devient une somme (ajouter <i>K</i><sub>i</sub> <i>e</i> <i>T</i><sub>s</sub> à chaque échantillon) ; la dérivée devient une différence divisée par <i>T</i><sub>s</sub> (cours de maths, leçon 9). Trois détails font la différence entre un PID de manuel et un PID qui marche sur un robot :'),
    UL([
      ['<strong>Derive the measurement, not the error</strong>: when the target jumps, the error jumps too, and its derivative would give a huge kick to the motor.', '<strong>Dériver la mesure, pas l\'erreur</strong> : quand la consigne saute, l\'erreur saute aussi, et sa dérivée donnerait un énorme coup au moteur.'],
      ['<strong>Filter the derivative</strong>: a difference of noisy measurements is very noisy.', '<strong>Filtrer la dérivée</strong> : une différence de mesures bruitées est très bruitée.'],
      ['<strong>Anti-windup</strong>: when the output is saturated (24 V reached), stop integrating, otherwise the integral grows for nothing and the joint overshoots a lot when it finally arrives.', '<strong>Anti-emballement</strong> (anti-windup) : quand la sortie est saturée (24 V atteints), on arrête d\'intégrer, sinon l\'intégrale grandit pour rien et la liaison dépasse beaucoup quand elle arrive enfin.']
    ]),
    CODE('pid_discrete.py'),
    P('Its output, for a target of 20 rad/s on the motor of lesson 11 (sampled at 1 kHz):', 'Sa sortie, pour une consigne de 20 rad/s sur le moteur de la leçon 11 (échantillonné à 1 kHz) :'),
    OUT('pid_discrete.out.txt'),
    P('The P controller stops at 10 rad/s, exactly the 50 % error predicted in lesson 11. The PI reaches the target. Its gains were chosen so that <i>K</i><sub>i</sub> / <i>K</i><sub>p</sub> = 10 = 1/<i>τ</i>: the zero of the controller cancels the pole of the motor, the open loop becomes <i>C G</i> = 10 / <i>s</i>, and the closed loop is a clean first order 10 / (<i>s</i> + 10) with a time constant of 0.1 s. Check in the output: 63 % of 20 rad/s (12.6) at <i>t</i> = 0.1 s, 95 % at 0.3 s, no overshoot, and a constant voltage of 10 V. The theory predicted what the code does.',
      'Le correcteur P s\'arrête à 10 rad/s, exactement les 50 % d\'erreur prévus à la leçon 11. Le PI atteint la consigne. Ses gains ont été choisis pour que <i>K</i><sub>i</sub> / <i>K</i><sub>p</sub> = 10 = 1/<i>τ</i> : le zéro du correcteur compense le pôle du moteur, la boucle ouverte devient <i>C G</i> = 10 / <i>s</i>, et la boucle fermée est un premier ordre propre 10 / (<i>s</i> + 10) de constante de temps 0,1 s. Vérifiez dans la sortie : 63 % de 20 rad/s (12,6) à <i>t</i> = 0,1 s, 95 % à 0,3 s, aucun dépassement, et une tension constante de 10 V. La théorie a prévu ce que fait le code.'),
    BOX('keep', ['The method of a control engineer', 'La méthode d\'un automaticien'],
      OL([
        ['Model the system (step test, or the dynamic model of lesson 10).', 'Modéliser le système (essai indiciel, ou le modèle dynamique de la leçon 10).'],
        ['Choose the wanted behaviour: bandwidth, damping, final error.', 'Choisir le comportement voulu : bande passante, amortissement, erreur finale.'],
        ['Compute the gains (poles placement, or margins on the Bode diagram).', 'Calculer les gains (placement des pôles, ou marges sur le diagramme de Bode).'],
        ['Simulate with the delay and the saturation, then try on the real system with low gains first.', 'Simuler avec le retard et la saturation, puis essayer sur le vrai système avec des gains faibles d\'abord.']
      ]))
  ],
  terms: [['frequency response', 'réponse en fréquence'], ['Bode diagram', 'diagramme de Bode'], ['bandwidth', 'bande passante'], ['phase margin', 'marge de phase'], ['gain margin', 'marge de gain'], ['delay', 'retard'], ['sampling', 'échantillonnage'], ['aliasing', 'repliement'], ['anti-windup', 'anti-emballement (anti-windup)']],
  quiz: [
    ['What does −3 dB mean on a Bode diagram?', 'Que veut dire −3 dB sur un diagramme de Bode ?', 'The gain is multiplied by 0.707: the cut-off of a first-order system (ω = 1/τ).', 'Le gain est multiplié par 0,707 : la coupure d\'un système du premier ordre (ω = 1/τ).'],
    ['Why is a delay dangerous in a control loop?', 'Pourquoi un retard est-il dangereux dans une boucle de commande ?', 'It adds a phase lag ω T that grows with the frequency and eats the phase margin, until the loop oscillates.', 'Il ajoute un retard de phase ω T qui grandit avec la fréquence et mange la marge de phase, jusqu\'à ce que la boucle oscille.'],
    ['What does anti-windup do?', 'Que fait l\'anti-emballement (anti-windup) ?', 'It stops the integral from growing while the output is saturated, to avoid a large overshoot afterwards.', 'Il empêche l\'intégrale de grandir pendant que la sortie est saturée, pour éviter un grand dépassement ensuite.']
  ]
})
  ];
}
