// The maths of robotics, lessons 6 to 8: standard DH alone, modified DH (DHM) alone, then the two side by side.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, TRY, lesson } from '../lib.mjs';
import { AXM, frame } from './mk-b.mjs';
import { paramFig, armFrames, dhSteps } from './mk-dh3d.mjs';
const PRE = 'mk-';
const sub = (s, i) => `${s}<tspan dy="4" font-size="9">${i}</tspan><tspan dy="-4"> </tspan>`;
const I = (s, i) => `<i>${s}</i><sub>${i}</sub>`;

// two joint axes and the four parameters. std = true: standard DH (d and theta on the left axis); false: modified DH (d and theta on the right axis)
function dhFig(std) {
  const zl = std ? sub('z', 'i−1') : sub('z', 'j−1'), zr = std ? sub('z', 'i') : sub('z', 'j'), a = std ? sub('a', 'i') : sub('a', 'j−1'), al = std ? sub('α', 'i') : sub('α', 'j−1'), d = std ? sub('d', 'i') : sub('d', 'j'), th = std ? sub('θ', 'i') : sub('θ', 'j'), x = std ? sub('x', 'i') : sub('x', 'j−1');
  const jl = std ? svgtx('axis of joint i', 'axe de la liaison i') : svgtx('axis of joint j−1', 'axe de la liaison j−1'), jr = std ? svgtx('axis of joint i+1', 'axe de la liaison i+1') : svgtx('axis of joint j', 'axe de la liaison j');
  const X = std ? 110 : 287.5, Xt = std ? 110 : 299.5;         // the axis that carries d and theta: its origin (y = 180) and the foot of the common perpendicular (y = 125)
  return FIG('0 0 440 220', `${AXM}
    <line x1="110" y1="205" x2="110" y2="22" stroke="#5aa9ff" stroke-width="2.5" marker-end="url(#mkax)"/><text x="104" y="18" text-anchor="end" fill="#5aa9ff">${zl}</text><text x="110" y="218" text-anchor="middle" class="sm">${jl}</text>
    <line x1="282" y1="205" x2="322" y2="22" stroke="#5aa9ff" stroke-width="2.5" marker-end="url(#mkax)"/><text x="332" y="20" fill="#5aa9ff">${zr}</text><text x="300" y="218" text-anchor="middle" class="sm">${jr}</text>
    <line x1="110" y1="125" x2="${std ? 352 : 299.5}" y2="125" stroke="#ff6b6b" stroke-width="2.5" marker-end="url(#mkax)"/><text x="${std ? 360 : 205}" y="${std ? 129 : 142}" fill="#ff6b6b" text-anchor="${std ? 'start' : 'middle'}">${x}</text>
    <text x="205" y="117" text-anchor="middle" class="c-x">${a}</text>
    <line class="dash" x1="299.5" y1="125" x2="299.5" y2="50"/><path class="arc" d="M299.5,75 A50,50 0 0 1 310.3,76.2"/><text x="296" y="64" text-anchor="end" class="c-x">${al}</text>
    <circle class="jt" cx="${X}" cy="180" r="4"/><line class="dim" x1="${X - 14}" y1="180" x2="${Xt - 14}" y2="125"/><text x="${X - 20}" y="157" text-anchor="end" class="c-y">${d}</text>
    <path class="arc" d="M${X + 26},186 A26,9 0 0 1 ${X - 26},186" style="stroke:#4ed17f"/><text x="${X + 32}" y="198" class="c-y">${th}</text>`);
}
// the planar 2-axis arm with its frames. frames = [[x, y, angle, name of x axis], ...]
function armFig(frames) {
  return FIG('0 -40 340 240', `${AXM}
    <line class="dash" x1="20" y1="172" x2="320" y2="172"/>
    <line class="link1" x1="60" y1="172" x2="172.6" y2="107"/><line class="link2" x1="172.6" y1="107" x2="206.8" y2="13"/>
    ${frames.map(([x, y, a, n]) => frame(x, y, a, 44, n, '')).join('')}
    <circle class="jt" cx="60" cy="172" r="5"/><circle class="jt" cx="172.6" cy="107" r="5"/><circle class="pt" cx="206.8" cy="13" r="5"/>
    <text x="105" y="128" text-anchor="end" class="c-l">L₁</text><text x="178" y="62" text-anchor="end" class="c-l2">L₂</text>`);
}
const n = (s) => [s, s.replace(/(\d)\.(\d)/g, '$1,$2')];

export function partC() {
  return [
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['The Denavit–Hartenberg method (standard DH)', 'La méthode de Denavit–Hartenberg (DH standard)'],
  time: 25,
  goal: ['to draw the axes z and x of every frame step by step, to know exactly between which two axes each parameter is measured, and to fill the DH table of any robot alone.', 'à dessiner pas à pas les axes z et x de chaque repère, à savoir exactement entre quels deux axes se mesure chaque paramètre, et à remplir seul le tableau DH de n\'importe quel robot.'],
  body: [
    H4('6.1 The problem: too much freedom', '6.1 Le problème : trop de liberté'),
    P('Lesson 5 showed that a robot is a chain of frames, one per link, and that we multiply their matrices. If everybody places the frames freely, each frame needs <strong>6 numbers</strong> and nobody gets the same equations. Denavit and Hartenberg (1955) gave <strong>rules to place the frames</strong>; with them, going from one frame to the next needs only <strong>4 numbers</strong>, and a whole robot becomes a small table: one row per joint.',
      'La leçon 5 a montré qu\'un robot est une chaîne de repères, un par segment, et que l\'on multiplie leurs matrices. Si chacun place les repères librement, chaque repère demande <strong>6 nombres</strong> et personne n\'obtient les mêmes équations. Denavit et Hartenberg (1955) ont donné des <strong>règles pour placer les repères</strong> ; avec elles, passer d\'un repère au suivant ne demande que <strong>4 nombres</strong>, et tout un robot devient un petit tableau : une ligne par liaison.'),
    H4('6.2 Numbering: links, joints, frames', '6.2 La numérotation : segments, liaisons, repères'),
    UL([
      ['<strong>Links</strong> (the rigid parts): 0 = the fixed base, 1, 2, … <i>n</i> = the last link, which carries the tool.', '<strong>Segments</strong> (les pièces rigides) : 0 = la base fixe, 1, 2, … <i>n</i> = le dernier segment, qui porte l\'outil.'],
      ['<strong>Joints</strong>: joint <i>i</i> connects link <i>i</i>−1 to link <i>i</i>. Its <strong>axis</strong> is the axis of rotation (revolute joint, R) or the direction of sliding (prismatic joint, P).', '<strong>Liaisons</strong> : la liaison <i>i</i> relie le segment <i>i</i>−1 au segment <i>i</i>. Son <strong>axe</strong> est l\'axe de rotation (liaison rotoïde, R) ou la direction de glissement (liaison prismatique, P).'],
      [`<strong>Frames</strong>: frame <i>i</i> (origin ${I('O', 'i')}, axes ${I('x', 'i')}, ${I('y', 'i')}, ${I('z', 'i')}) is fixed to link <i>i</i>. Frame 0 is fixed to the base and never moves.`, `<strong>Repères</strong> : le repère <i>i</i> (origine ${I('O', 'i')}, axes ${I('x', 'i')}, ${I('y', 'i')}, ${I('z', 'i')}) est fixé au segment <i>i</i>. Le repère 0 est fixé à la base et ne bouge jamais.`]
    ]),
    H4('6.3 The method: how to draw the axes', '6.3 La méthode : comment dessiner les axes'),
    P('Draw the robot in a simple pose (often its zero pose), then place the axes <strong>in this order: all the z first, then all the x, then the origins</strong>. The y axes are never drawn.',
      'Dessinez le robot dans une pose simple (souvent sa pose zéro), puis placez les axes <strong>dans cet ordre : d\'abord tous les z, puis tous les x, puis les origines</strong>. On ne dessine jamais les axes y.'),
    BOX('method', ['Standard DH: drawing the frames, step by step', 'DH standard : dessiner les repères, pas à pas'],
      OL([
        [`<strong>Step 1, the z axes.</strong> Put ${I('z', 'i−1')} <strong>on the axis of joint <i>i</i></strong>: ${I('z', '0')} on joint 1, ${I('z', '1')} on joint 2, …, ${I('z', 'n−1')} on joint <i>n</i>. Choose its direction (either way is correct): the positive rotation of the joint is then given by the right-hand rule around it.`,
         `<strong>Étape 1, les axes z.</strong> Placez ${I('z', 'i−1')} <strong>sur l'axe de la liaison <i>i</i></strong> : ${I('z', '0')} sur la liaison 1, ${I('z', '1')} sur la liaison 2, …, ${I('z', 'n−1')} sur la liaison <i>n</i>. Choisissez son sens (les deux sont justes) : le sens positif de rotation de la liaison est alors donné par la règle de la main droite autour de lui.`],
        [`<strong>Step 2, the x axes.</strong> For <i>i</i> = 1 to <i>n</i>, look at the two axes ${I('z', 'i−1')} and ${I('z', 'i')}, and put ${I('x', 'i')} on their <strong>common perpendicular</strong> (the shortest segment that joins them, perpendicular to both), <strong>pointing from ${I('z', 'i−1')} towards ${I('z', 'i')}</strong>.`,
         `<strong>Étape 2, les axes x.</strong> Pour <i>i</i> = 1 à <i>n</i>, regardez les deux axes ${I('z', 'i−1')} et ${I('z', 'i')}, et placez ${I('x', 'i')} sur leur <strong>perpendiculaire commune</strong> (le plus court segment qui les relie, perpendiculaire aux deux), <strong>orienté de ${I('z', 'i−1')} vers ${I('z', 'i')}</strong>.`],
        [`<strong>Step 3, the origins.</strong> ${I('O', 'i')} is the point where ${I('x', 'i')} meets ${I('z', 'i')}.`, `<strong>Étape 3, les origines.</strong> ${I('O', 'i')} est le point où ${I('x', 'i')} rencontre ${I('z', 'i')}.`],
        [`<strong>Step 4, frame 0 (base).</strong> ${I('O', '0')} anywhere on ${I('z', '0')} (often on the floor), ${I('x', '0')} perpendicular to ${I('z', '0')}, in a direction you choose — usually the direction of ${I('x', '1')} in the drawn pose, so that ${I('θ', '1')} = 0 there.`,
         `<strong>Étape 4, le repère 0 (base).</strong> ${I('O', '0')} n'importe où sur ${I('z', '0')} (souvent au sol), ${I('x', '0')} perpendiculaire à ${I('z', '0')}, dans un sens que vous choisissez — en général le sens de ${I('x', '1')} dans la pose dessinée, pour que ${I('θ', '1')} = 0 dans cette pose.`],
        [`<strong>Step 5, frame <i>n</i> (tool).</strong> There is no joint <i>n</i>+1: put ${I('O', 'n')} on the tool point, ${I('z', 'n')} parallel to ${I('z', 'n−1')} (or along the direction in which the tool points), and ${I('x', 'n')} from ${I('z', 'n−1')} towards the tool.`,
         `<strong>Étape 5, le repère <i>n</i> (outil).</strong> Il n'y a pas de liaison <i>n</i>+1 : placez ${I('O', 'n')} sur le point outil, ${I('z', 'n')} parallèle à ${I('z', 'n−1')} (ou dans la direction où pointe l'outil), et ${I('x', 'n')} de ${I('z', 'n−1')} vers l'outil.`]
      ])),
    BOX('warn', ['The common perpendicular: four cases', 'La perpendiculaire commune : quatre cas'],
      UL([
        [`<strong>Skew axes</strong> (not parallel, not crossing): there is one common perpendicular. ${I('x', 'i')} is on it.`, `<strong>Axes quelconques</strong> (ni parallèles, ni sécants) : il y a une seule perpendiculaire commune. ${I('x', 'i')} est dessus.`],
        [`<strong>Axes that cross</strong> (very common: a vertical axis and a horizontal one): the distance is 0, so ${I('a', 'i')} = 0. ${I('x', 'i')} goes through the crossing point, perpendicular to <em>both</em> axes (two possible directions: choose one; it sets the sign of ${I('α', 'i')}).`, `<strong>Axes sécants</strong> (très fréquent : un axe vertical et un axe horizontal) : la distance est 0, donc ${I('a', 'i')} = 0. ${I('x', 'i')} passe par le point de croisement, perpendiculaire aux <em>deux</em> axes (deux sens possibles : choisissez-en un ; il fixe le signe de ${I('α', 'i')}).`],
        [`<strong>Parallel axes</strong> (shoulder and elbow): there are infinitely many common perpendiculars. Choose the one that goes through ${I('O', 'i−1')}, so that ${I('d', 'i')} = 0.`, `<strong>Axes parallèles</strong> (épaule et coude) : il y a une infinité de perpendiculaires communes. Choisissez celle qui passe par ${I('O', 'i−1')}, pour que ${I('d', 'i')} = 0.`],
        [`<strong>Same axis</strong> (two joints on one line): ${I('x', 'i')} is any line perpendicular to it; choose the simplest one.`, `<strong>Axes confondus</strong> (deux liaisons sur une même droite) : ${I('x', 'i')} est n'importe quelle droite perpendiculaire ; choisissez la plus simple.`],
        ['<strong>Prismatic joint</strong>: only the direction of its axis is fixed; you can move the line parallel to itself to a convenient place (usually through the origin before or after).', '<strong>Liaison prismatique</strong> : seule la direction de son axe est imposée ; on peut déplacer la droite parallèlement à elle-même à un endroit pratique (en général par l\'origine d\'avant ou d\'après).']
      ])),
    H4('Demonstration: the 3-axis arm, step by step', 'Démonstration : le bras à 3 axes, pas à pas'),
    P('Here is the method applied to a real arm. Use the buttons to go from one step to the next: at each step the new axes appear with a yellow halo.', 'Voici la méthode appliquée à un vrai bras. Utilisez les boutons pour passer d\'une étape à la suivante : à chaque étape, les nouveaux axes apparaissent avec un halo jaune.'),
    dhSteps(true),
    H4('6.4 The four parameters: between which two axes', '6.4 Les quatre paramètres : entre quels deux axes'),
    P(`Once the axes are drawn, each row <i>i</i> of the table is read on <strong>two axes only</strong>: on the old axis ${I('z', 'i−1')} you measure between two x (that gives θ and d), and on the new axis ${I('x', 'i')} you measure between two z (that gives a and α).`,
      `Une fois les axes dessinés, chaque ligne <i>i</i> du tableau se lit sur <strong>deux axes seulement</strong> : sur l'ancien axe ${I('z', 'i−1')}, on mesure entre deux x (cela donne θ et d), et sur le nouvel axe ${I('x', 'i')}, on mesure entre deux z (cela donne a et α).`),
    TABLE([['Parameter', 'Paramètre'], ['From…', 'De…'], ['…to', '…à'], ['Measured', 'Mesuré'], ['Name', 'Nom']], [
      [`<strong>${I('θ', 'i')}</strong>`, I('x', 'i−1'), I('x', 'i'), [`<strong>around</strong> ${I('z', 'i−1')}`, `<strong>autour de</strong> ${I('z', 'i−1')}`], ['joint angle (the variable of an R joint)', 'angle de la liaison (la variable d\'une liaison R)']],
      [`<strong>${I('d', 'i')}</strong>`, I('x', 'i−1'), I('x', 'i'), [`<strong>along</strong> ${I('z', 'i−1')}`, `<strong>le long de</strong> ${I('z', 'i−1')}`], ['offset (the variable of a P joint)', 'décalage (la variable d\'une liaison P)']],
      [`<strong>${I('a', 'i')}</strong>`, I('z', 'i−1'), I('z', 'i'), [`<strong>along</strong> ${I('x', 'i')}`, `<strong>le long de</strong> ${I('x', 'i')}`], ['link length (always fixed)', 'longueur du segment (toujours fixe)']],
      [`<strong>${I('α', 'i')}</strong>`, I('z', 'i−1'), I('z', 'i'), [`<strong>around</strong> ${I('x', 'i')}`, `<strong>autour de</strong> ${I('x', 'i')}`], ['twist (always fixed)', 'torsion (toujours fixe)']]
    ]),
    paramFig(true),
    BOX('keep', ['Signs: the right-hand rule', 'Les signes : la règle de la main droite'],
      UL([
        ['<strong>An angle</strong> “from A to B around C”: put the thumb of the right hand along C; if the fingers turn from A towards B, the angle is positive, otherwise negative.', '<strong>Un angle</strong> « de A à B autour de C » : mettez le pouce de la main droite selon C ; si les doigts tournent de A vers B, l\'angle est positif, sinon négatif.'],
        [`<strong>A distance</strong> “from A to B along C”: positive if you go from A to B in the direction of C. ${I('a', 'i')} is always ≥ 0, because ${I('x', 'i')} points from ${I('z', 'i−1')} to ${I('z', 'i')}.`, `<strong>Une distance</strong> « de A à B le long de C » : positive si l'on va de A vers B dans le sens de C. ${I('a', 'i')} est toujours ≥ 0, puisque ${I('x', 'i')} va de ${I('z', 'i−1')} vers ${I('z', 'i')}.`],
        [`<strong>The variable</strong>: for a revolute joint ${I('θ', 'i')} = ${I('q', 'i')} + a fixed offset (the angle you read in the drawn pose); for a prismatic joint ${I('d', 'i')} = ${I('q', 'i')} + a fixed offset.`, `<strong>La variable</strong> : pour une liaison rotoïde, ${I('θ', 'i')} = ${I('q', 'i')} + un décalage fixe (l'angle que vous lisez dans la pose dessinée) ; pour une liaison prismatique, ${I('d', 'i')} = ${I('q', 'i')} + un décalage fixe.`]
      ])),
    H4('6.5 Filling the table, row by row', '6.5 Remplir le tableau, ligne par ligne'),
    OL([
      [`Write one row per joint, <i>i</i> = 1 to <i>n</i>, with the columns ${I('θ', 'i')}, ${I('d', 'i')}, ${I('a', 'i')}, ${I('α', 'i')}.`, `Écrivez une ligne par liaison, <i>i</i> = 1 à <i>n</i>, avec les colonnes ${I('θ', 'i')}, ${I('d', 'i')}, ${I('a', 'i')}, ${I('α', 'i')}.`],
      [`For row <i>i</i>, <strong>look at ${I('z', 'i−1')}</strong>: the angle from ${I('x', 'i−1')} to ${I('x', 'i')} around it is ${I('θ', 'i')}; the distance from ${I('x', 'i−1')} to ${I('x', 'i')} along it is ${I('d', 'i')}.`, `Pour la ligne <i>i</i>, <strong>regardez ${I('z', 'i−1')}</strong> : l'angle de ${I('x', 'i−1')} à ${I('x', 'i')} autour de lui est ${I('θ', 'i')} ; la distance de ${I('x', 'i−1')} à ${I('x', 'i')} le long de lui est ${I('d', 'i')}.`],
      [`Then <strong>look at ${I('x', 'i')}</strong>: the distance from ${I('z', 'i−1')} to ${I('z', 'i')} along it is ${I('a', 'i')}; the angle from ${I('z', 'i−1')} to ${I('z', 'i')} around it is ${I('α', 'i')}.`, `Puis <strong>regardez ${I('x', 'i')}</strong> : la distance de ${I('z', 'i−1')} à ${I('z', 'i')} le long de lui est ${I('a', 'i')} ; l'angle de ${I('z', 'i−1')} à ${I('z', 'i')} autour de lui est ${I('α', 'i')}.`],
      ['Replace the angle or distance that changes when the joint moves by its variable <i>q</i> (+ offset). Everything else is a number you can measure on the robot.', 'Remplacez l\'angle ou la distance qui change quand la liaison bouge par sa variable <i>q</i> (+ décalage). Tout le reste est un nombre que l\'on peut mesurer sur le robot.']
    ]),
    H4('6.6 Worked example: the 3-axis arm, cell by cell', '6.6 Exemple corrigé : le bras à 3 axes, case par case'),
    P('The arm of the “Build your first robot” workshop: joint 1 turns around the vertical; joints 2 (shoulder) and 3 (elbow) turn around a horizontal axis. Shoulder height 0.40 m, upper arm 0.45 m, forearm 0.38 m. It is drawn at its zero pose: both links horizontal.',
      'Le bras de l\'atelier « Construisez votre premier robot » : la liaison 1 tourne autour de la verticale ; les liaisons 2 (épaule) et 3 (coude) tournent autour d\'un axe horizontal. Hauteur de l\'épaule 0,40 m, bras 0,45 m, avant-bras 0,38 m. Il est dessiné dans sa pose zéro : les deux segments horizontaux.'),
    armFrames(true),
    P(`<strong>The axes.</strong> ${I('z', '0')} on joint 1: vertical, upwards. ${I('z', '1')} on joint 2 and ${I('z', '2')} on joint 3: horizontal, towards you. ${I('x', '1')}: ${I('z', '0')} and ${I('z', '1')} cross at the shoulder, so ${I('x', '1')} goes through the shoulder, perpendicular to both — horizontal, to the right. ${I('x', '2')}: ${I('z', '1')} and ${I('z', '2')} are parallel, so take the perpendicular through ${I('O', '1')}: along the upper arm, to the elbow. ${I('x', '3')}: along the forearm, to the tool. ${I('x', '0')}: to the right, like ${I('x', '1')}.`,
      `<strong>Les axes.</strong> ${I('z', '0')} sur la liaison 1 : vertical, vers le haut. ${I('z', '1')} sur la liaison 2 et ${I('z', '2')} sur la liaison 3 : horizontaux, vers vous. ${I('x', '1')} : ${I('z', '0')} et ${I('z', '1')} se coupent à l'épaule, donc ${I('x', '1')} passe par l'épaule, perpendiculaire aux deux — horizontal, vers la droite. ${I('x', '2')} : ${I('z', '1')} et ${I('z', '2')} sont parallèles, on prend la perpendiculaire qui passe par ${I('O', '1')} : le long du bras, jusqu'au coude. ${I('x', '3')} : le long de l'avant-bras, jusqu'à l'outil. ${I('x', '0')} : vers la droite, comme ${I('x', '1')}.`),
    TABLE([['Cell', 'Case'], ['Value', 'Valeur'], ['Why (between which axes)', 'Pourquoi (entre quels axes)']], [
      [I('θ', '1'), I('q', '1'), [`from ${I('x', '0')} to ${I('x', '1')} around ${I('z', '0')}: 0 in the drawing, so only the joint variable`, `de ${I('x', '0')} à ${I('x', '1')} autour de ${I('z', '0')} : 0 sur le dessin, donc seulement la variable de la liaison`]],
      [I('d', '1'), n('0.40'), [`from ${I('x', '0')} (floor) to ${I('x', '1')} (shoulder) along ${I('z', '0')}`, `de ${I('x', '0')} (sol) à ${I('x', '1')} (épaule) le long de ${I('z', '0')}`]],
      [I('a', '1'), '0', [`from ${I('z', '0')} to ${I('z', '1')} along ${I('x', '1')}: the two axes cross`, `de ${I('z', '0')} à ${I('z', '1')} le long de ${I('x', '1')} : les deux axes se coupent`]],
      [I('α', '1'), '90°', [`from ${I('z', '0')} (up) to ${I('z', '1')} (towards you) around ${I('x', '1')} (right): right thumb to the right, the fingers turn from up to towards you → +90°`, `de ${I('z', '0')} (haut) à ${I('z', '1')} (vers vous) autour de ${I('x', '1')} (droite) : pouce droit vers la droite, les doigts tournent du haut vers vous → +90°`]],
      [I('θ', '2'), I('q', '2'), [`from ${I('x', '1')} to ${I('x', '2')} around ${I('z', '1')}: both to the right in the drawing → 0 + variable`, `de ${I('x', '1')} à ${I('x', '2')} autour de ${I('z', '1')} : tous deux vers la droite sur le dessin → 0 + variable`]],
      [I('d', '2'), '0', [`from ${I('x', '1')} to ${I('x', '2')} along ${I('z', '1')}: both go through the shoulder`, `de ${I('x', '1')} à ${I('x', '2')} le long de ${I('z', '1')} : tous deux passent par l'épaule`]],
      [I('a', '2'), n('0.45'), [`from ${I('z', '1')} (shoulder) to ${I('z', '2')} (elbow) along ${I('x', '2')}`, `de ${I('z', '1')} (épaule) à ${I('z', '2')} (coude) le long de ${I('x', '2')}`]],
      [I('α', '2'), '0', [`from ${I('z', '1')} to ${I('z', '2')} around ${I('x', '2')}: parallel, same direction`, `de ${I('z', '1')} à ${I('z', '2')} autour de ${I('x', '2')} : parallèles, même sens`]],
      [I('θ', '3'), I('q', '3'), [`from ${I('x', '2')} to ${I('x', '3')} around ${I('z', '2')}: 0 in the drawing + variable`, `de ${I('x', '2')} à ${I('x', '3')} autour de ${I('z', '2')} : 0 sur le dessin + variable`]],
      [I('d', '3'), '0', [`from ${I('x', '2')} to ${I('x', '3')} along ${I('z', '2')}: both go through the elbow`, `de ${I('x', '2')} à ${I('x', '3')} le long de ${I('z', '2')} : tous deux passent par le coude`]],
      [I('a', '3'), n('0.38'), [`from ${I('z', '2')} (elbow) to ${I('z', '3')} (tool) along ${I('x', '3')}`, `de ${I('z', '2')} (coude) à ${I('z', '3')} (outil) le long de ${I('x', '3')}`]],
      [I('α', '3'), '0', [`from ${I('z', '2')} to ${I('z', '3')} around ${I('x', '3')}: parallel`, `de ${I('z', '2')} à ${I('z', '3')} autour de ${I('x', '3')} : parallèles`]]
    ]),
    P('The finished table:', 'Le tableau terminé :'),
    TABLE(['<i>i</i>', I('θ', 'i'), I('d', 'i'), I('a', 'i'), I('α', 'i')], [['1', I('q', '1'), n('0.40'), '0', '90°'], ['2', I('q', '2'), '0', n('0.45'), '0'], ['3', I('q', '3'), '0', n('0.38'), '0']]),
    H4('6.7 The matrix of one row', '6.7 La matrice d\'une ligne'),
    P('The four parameters are four simple moves, applied in the order of the columns: turn by θ around z, slide by d along z, slide by a along x, turn by α around x.', 'Les quatre paramètres sont quatre mouvements simples, appliqués dans l\'ordre des colonnes : tourner de θ autour de z, glisser de d le long de z, glisser de a le long de x, tourner de α autour de x.'),
    EQ(`<sup>i−1</sup><i>T</i><sub>i</sub> = Rot(<i>z</i>, ${I('θ', 'i')}) · Trans(<i>z</i>, ${I('d', 'i')}) · Trans(<i>x</i>, ${I('a', 'i')}) · Rot(<i>x</i>, ${I('α', 'i')}) = ${MX(4, ['cθ', '−sθ cα', 'sθ sα', '<i>a</i> cθ', 'sθ', 'cθ cα', '−cθ sα', '<i>a</i> sθ', '0', 'sα', 'cα', '<i>d</i>', '0', '0', '0', '1'])}`),
    BOX('example', ['Check with numbers', 'Vérification avec des nombres'],
      P(`${I('q', '1')} = 25°, ${I('q', '2')} = 70°, ${I('q', '3')} = −80°. Multiplying the three matrices gives the tool at <strong>(0.479, 0.223, 0.757) m</strong>. By hand: <i>r</i> = 0.45 cos 70° + 0.38 cos(−10°) = 0.528; <i>x</i> = <i>r</i> cos 25° = 0.479; <i>y</i> = <i>r</i> sin 25° = 0.223; <i>z</i> = 0.40 + 0.45 sin 70° + 0.38 sin(−10°) = 0.757. The table and the drawing agree.`,
        `${I('q', '1')} = 25°, ${I('q', '2')} = 70°, ${I('q', '3')} = −80°. Le produit des trois matrices donne l'outil en <strong>(0,479 ; 0,223 ; 0,757) m</strong>. À la main : <i>r</i> = 0,45 cos 70° + 0,38 cos(−10°) = 0,528 ; <i>x</i> = <i>r</i> cos 25° = 0,479 ; <i>y</i> = <i>r</i> sin 25° = 0,223 ; <i>z</i> = 0,40 + 0,45 sin 70° + 0,38 sin(−10°) = 0,757. Le tableau et le dessin sont d'accord.`)),
    BOX('idea', ['To remember', 'À retenir'],
      P(`<strong>θ and d live on ${I('z', 'i−1')}</strong> (between ${I('x', 'i−1')} and ${I('x', 'i')}); <strong>a and α live on ${I('x', 'i')}</strong> (between ${I('z', 'i−1')} and ${I('z', 'i')}). Write these two sentences next to your drawing, and every cell of the table becomes a measurement.`,
        `<strong>θ et d vivent sur ${I('z', 'i−1')}</strong> (entre ${I('x', 'i−1')} et ${I('x', 'i')}) ; <strong>a et α vivent sur ${I('x', 'i')}</strong> (entre ${I('z', 'i−1')} et ${I('z', 'i')}). Écrivez ces deux phrases à côté de votre dessin, et chaque case du tableau devient une mesure.`))
  ],
  terms: [['DH convention', 'convention DH'], ['common perpendicular', 'perpendiculaire commune'], ['joint angle θ', 'angle de liaison θ'], ['offset d', 'décalage d'], ['link length a', 'longueur de segment a'], ['twist α', 'torsion α'], ['right-hand rule', 'règle de la main droite'], ['DH table', 'tableau DH']],
  quiz: [
    ['In standard DH, on which axis is z of frame i−1?', 'En DH standard, sur quel axe est le z du repère i−1 ?', 'On the axis of joint i.', 'Sur l\'axe de la liaison i.'],
    ['Between which two axes is θᵢ measured, and around which axis?', 'Entre quels deux axes se mesure θᵢ, et autour de quel axe ?', 'From xᵢ₋₁ to xᵢ, around zᵢ₋₁.', 'De xᵢ₋₁ à xᵢ, autour de zᵢ₋₁.'],
    ['Between which two axes is aᵢ measured, and along which axis?', 'Entre quels deux axes se mesure aᵢ, et le long de quel axe ?', 'From zᵢ₋₁ to zᵢ, along xᵢ.', 'De zᵢ₋₁ à zᵢ, le long de xᵢ.'],
    ['Two consecutive joint axes cross. What are aᵢ and the direction of xᵢ?', 'Deux axes de liaisons consécutifs se coupent. Que valent aᵢ et la direction de xᵢ ?', 'aᵢ = 0, and xᵢ is perpendicular to both axes, through the crossing point.', 'aᵢ = 0, et xᵢ est perpendiculaire aux deux axes, par le point de croisement.']
  ],
  link: ['arm.html', 'See a DH table on a live 3D arm →', 'Voir un tableau DH sur un bras 3D en direct →']
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['The modified DH method (DHM)', 'La méthode DH modifiée (DHM)'],
  time: 22,
  goal: ['the same method for the modified convention: where each axis goes, between which two axes each parameter is measured, and the DHM table of the same arm cell by cell.', 'la même méthode pour la convention modifiée : où va chaque axe, entre quels deux axes se mesure chaque paramètre, et le tableau DHM du même bras case par case.'],
  body: [
    H4('7.1 One idea changes: the frame sits on its own joint', '7.1 Une seule idée change : le repère est sur sa propre liaison'),
    P('In standard DH, frame <i>i</i>−1 is on joint <i>i</i>: the numbers are shifted. The <strong>modified</strong> convention (Khalil and Kleinfinger, 1986; also J. Craig) puts <strong>frame <i>j</i> on joint <i>j</i></strong>, the joint that moves link <i>j</i>: the same number everywhere. It is the convention of most French courses.',
      'En DH standard, le repère <i>i</i>−1 est sur la liaison <i>i</i> : les numéros sont décalés. La convention <strong>modifiée</strong> (Khalil et Kleinfinger, 1986 ; aussi J. Craig) place <strong>le repère <i>j</i> sur la liaison <i>j</i></strong>, la liaison qui fait bouger le segment <i>j</i> : le même numéro partout. C\'est la convention de la plupart des cours français.'),
    H4('7.2 The method: how to draw the axes', '7.2 La méthode : comment dessiner les axes'),
    BOX('method', ['Modified DH: drawing the frames, step by step', 'DH modifié : dessiner les repères, pas à pas'],
      OL([
        [`<strong>Step 1, the z axes.</strong> Put ${I('z', 'j')} <strong>on the axis of joint <i>j</i></strong>: ${I('z', '1')} on joint 1, ${I('z', '2')} on joint 2, …, ${I('z', 'n')} on joint <i>n</i>. Choose its direction.`, `<strong>Étape 1, les axes z.</strong> Placez ${I('z', 'j')} <strong>sur l'axe de la liaison <i>j</i></strong> : ${I('z', '1')} sur la liaison 1, ${I('z', '2')} sur la liaison 2, …, ${I('z', 'n')} sur la liaison <i>n</i>. Choisissez son sens.`],
        [`<strong>Step 2, the x axes.</strong> For <i>j</i> = 1 to <i>n</i>−1, put ${I('x', 'j')} on the <strong>common perpendicular to ${I('z', 'j')} and ${I('z', 'j+1')}</strong>, <strong>pointing from ${I('z', 'j')} towards ${I('z', 'j+1')}</strong>. The four cases of lesson 6 (skew, crossing, parallel, same axis) apply the same way.`, `<strong>Étape 2, les axes x.</strong> Pour <i>j</i> = 1 à <i>n</i>−1, placez ${I('x', 'j')} sur la <strong>perpendiculaire commune à ${I('z', 'j')} et ${I('z', 'j+1')}</strong>, <strong>orienté de ${I('z', 'j')} vers ${I('z', 'j+1')}</strong>. Les quatre cas de la leçon 6 (quelconques, sécants, parallèles, confondus) s'appliquent de la même façon.`],
        [`<strong>Step 3, the origins.</strong> ${I('O', 'j')} is the point where ${I('x', 'j')} meets ${I('z', 'j')} — so the origin of frame <i>j</i> is <strong>on its own joint</strong>.`, `<strong>Étape 3, les origines.</strong> ${I('O', 'j')} est le point où ${I('x', 'j')} rencontre ${I('z', 'j')} — l'origine du repère <i>j</i> est donc <strong>sur sa propre liaison</strong>.`],
        [`<strong>Step 4, frame 0 (base).</strong> Usually ${I('z', '0')} on the same line as ${I('z', '1')}, and ${I('x', '0')} in the direction of ${I('x', '1')} when ${I('q', '1')} = 0: row 1 is then as simple as possible.`, `<strong>Étape 4, le repère 0 (base).</strong> En général ${I('z', '0')} sur la même droite que ${I('z', '1')}, et ${I('x', '0')} dans le sens de ${I('x', '1')} quand ${I('q', '1')} = 0 : la ligne 1 est alors la plus simple possible.`],
        [`<strong>Step 5, the last joint and the tool.</strong> There is no ${I('z', 'n+1')}: choose ${I('x', 'n')} (usually towards the tool). The tool gets its own frame E, linked to frame <i>n</i> by one more <strong>fixed row</strong> (no variable).`, `<strong>Étape 5, la dernière liaison et l'outil.</strong> Il n'y a pas de ${I('z', 'n+1')} : choisissez ${I('x', 'n')} (en général vers l'outil). L'outil reçoit son propre repère E, relié au repère <i>n</i> par une <strong>ligne fixe</strong> de plus (sans variable).`]
      ])),
    H4('Demonstration: the 3-axis arm, step by step', 'Démonstration : le bras à 3 axes, pas à pas'),
    P('The same arm with the modified method. Compare with lesson 6: the z axes are numbered differently, and a frame E is added on the tool.', 'Le même bras avec la méthode modifiée. Comparez avec la leçon 6 : les axes z sont numérotés autrement, et un repère E est ajouté sur l\'outil.'),
    dhSteps(false),
    H4('7.3 The four parameters: between which two axes', '7.3 Les quatre paramètres : entre quels deux axes'),
    P(`Row <i>j</i> goes from frame <i>j</i>−1 to frame <i>j</i>. It is read on two axes only: on the old axis ${I('x', 'j−1')} you measure between two z (α and a), then on the new axis ${I('z', 'j')} you measure between two x (θ and d). The letters below are those of the robot pages of this site (J. Craig); the column “Khalil” gives the letters of the French courses.`,
      `La ligne <i>j</i> va du repère <i>j</i>−1 au repère <i>j</i>. Elle se lit sur deux axes seulement : sur l'ancien axe ${I('x', 'j−1')}, on mesure entre deux z (α et a), puis sur le nouvel axe ${I('z', 'j')}, on mesure entre deux x (θ et d). Les lettres ci-dessous sont celles des pages des robots de ce site (J. Craig) ; la colonne « Khalil » donne les lettres des cours français.`),
    TABLE([['Parameter', 'Paramètre'], 'Khalil', ['From…', 'De…'], ['…to', '…à'], ['Measured', 'Mesuré'], ['Name', 'Nom']], [
      [`<strong>${I('α', 'j−1')}</strong>`, I('α', 'j'), I('z', 'j−1'), I('z', 'j'), [`<strong>around</strong> ${I('x', 'j−1')}`, `<strong>autour de</strong> ${I('x', 'j−1')}`], ['twist (fixed)', 'torsion (fixe)']],
      [`<strong>${I('a', 'j−1')}</strong>`, I('d', 'j'), I('z', 'j−1'), I('z', 'j'), [`<strong>along</strong> ${I('x', 'j−1')}`, `<strong>le long de</strong> ${I('x', 'j−1')}`], ['distance between the two joint axes (fixed)', 'distance entre les deux axes de liaison (fixe)']],
      [`<strong>${I('θ', 'j')}</strong>`, I('θ', 'j'), I('x', 'j−1'), I('x', 'j'), [`<strong>around</strong> ${I('z', 'j')}`, `<strong>autour de</strong> ${I('z', 'j')}`], ['joint angle (variable of an R joint)', 'angle de la liaison (variable d\'une liaison R)']],
      [`<strong>${I('d', 'j')}</strong>`, I('r', 'j'), I('x', 'j−1'), I('x', 'j'), [`<strong>along</strong> ${I('z', 'j')}`, `<strong>le long de</strong> ${I('z', 'j')}`], ['offset (variable of a P joint)', 'décalage (variable d\'une liaison P)']]
    ]),
    paramFig(false),
    P('The signs follow the same right-hand rule as in lesson 6. The variable of joint <i>j</i> is θ<sub>j</sub> (R) or d<sub>j</sub> (P), always in row <i>j</i>: the row of joint <i>j</i> contains its own variable.',
      'Les signes suivent la même règle de la main droite qu\'à la leçon 6. La variable de la liaison <i>j</i> est θ<sub>j</sub> (R) ou d<sub>j</sub> (P), toujours à la ligne <i>j</i> : la ligne de la liaison <i>j</i> contient sa propre variable.'),
    H4('7.4 Filling the table, row by row', '7.4 Remplir le tableau, ligne par ligne'),
    OL([
      [`One row per joint, <i>j</i> = 1 to <i>n</i>, plus one fixed row for the tool. Columns: ${I('α', 'j−1')}, ${I('a', 'j−1')}, ${I('θ', 'j')}, ${I('d', 'j')}.`, `Une ligne par liaison, <i>j</i> = 1 à <i>n</i>, plus une ligne fixe pour l'outil. Colonnes : ${I('α', 'j−1')}, ${I('a', 'j−1')}, ${I('θ', 'j')}, ${I('d', 'j')}.`],
      [`For row <i>j</i>, <strong>look at ${I('x', 'j−1')}</strong>: the angle from ${I('z', 'j−1')} to ${I('z', 'j')} around it is ${I('α', 'j−1')}; the distance from ${I('z', 'j−1')} to ${I('z', 'j')} along it is ${I('a', 'j−1')}.`, `Pour la ligne <i>j</i>, <strong>regardez ${I('x', 'j−1')}</strong> : l'angle de ${I('z', 'j−1')} à ${I('z', 'j')} autour de lui est ${I('α', 'j−1')} ; la distance de ${I('z', 'j−1')} à ${I('z', 'j')} le long de lui est ${I('a', 'j−1')}.`],
      [`Then <strong>look at ${I('z', 'j')}</strong>: the angle from ${I('x', 'j−1')} to ${I('x', 'j')} around it is ${I('θ', 'j')}; the distance from ${I('x', 'j−1')} to ${I('x', 'j')} along it is ${I('d', 'j')}.`, `Puis <strong>regardez ${I('z', 'j')}</strong> : l'angle de ${I('x', 'j−1')} à ${I('x', 'j')} autour de lui est ${I('θ', 'j')} ; la distance de ${I('x', 'j−1')} à ${I('x', 'j')} le long de lui est ${I('d', 'j')}.`],
      ['Put the variable <i>q</i> (+ offset) in the cell that changes when joint <i>j</i> moves.', 'Mettez la variable <i>q</i> (+ décalage) dans la case qui change quand la liaison <i>j</i> bouge.']
    ]),
    H4('7.5 Worked example: the same 3-axis arm, cell by cell', '7.5 Exemple corrigé : le même bras à 3 axes, case par case'),
    armFrames(false),
    P(`<strong>The axes.</strong> ${I('z', '1')} on joint 1: vertical. ${I('z', '2')} on joint 2 and ${I('z', '3')} on joint 3: horizontal, towards you. ${I('x', '1')}: ${I('z', '1')} and ${I('z', '2')} cross at the shoulder → through the shoulder, perpendicular to both, to the right; so ${I('O', '1')} is at the shoulder (on ${I('z', '1')}, 0.40 m up). ${I('x', '2')}: ${I('z', '2')} and ${I('z', '3')} are parallel → along the upper arm, from the shoulder to the elbow; ${I('O', '2')} is also at the shoulder. ${I('x', '3')}: towards the tool (no ${I('z', '4')}). Frame 0: on the floor, ${I('z', '0')} on the line of ${I('z', '1')}, ${I('x', '0')} to the right.`,
      `<strong>Les axes.</strong> ${I('z', '1')} sur la liaison 1 : vertical. ${I('z', '2')} sur la liaison 2 et ${I('z', '3')} sur la liaison 3 : horizontaux, vers vous. ${I('x', '1')} : ${I('z', '1')} et ${I('z', '2')} se coupent à l'épaule → par l'épaule, perpendiculaire aux deux, vers la droite ; donc ${I('O', '1')} est à l'épaule (sur ${I('z', '1')}, à 0,40 m de haut). ${I('x', '2')} : ${I('z', '2')} et ${I('z', '3')} sont parallèles → le long du bras, de l'épaule au coude ; ${I('O', '2')} est aussi à l'épaule. ${I('x', '3')} : vers l'outil (pas de ${I('z', '4')}). Repère 0 : au sol, ${I('z', '0')} sur la droite de ${I('z', '1')}, ${I('x', '0')} vers la droite.`),
    TABLE([['Cell', 'Case'], ['Value', 'Valeur'], ['Why (between which axes)', 'Pourquoi (entre quels axes)']], [
      [I('α', '0'), '0', [`from ${I('z', '0')} to ${I('z', '1')} around ${I('x', '0')}: same line, same direction`, `de ${I('z', '0')} à ${I('z', '1')} autour de ${I('x', '0')} : même droite, même sens`]],
      [I('a', '0'), '0', [`from ${I('z', '0')} to ${I('z', '1')} along ${I('x', '0')}: same line`, `de ${I('z', '0')} à ${I('z', '1')} le long de ${I('x', '0')} : même droite`]],
      [I('θ', '1'), I('q', '1'), [`from ${I('x', '0')} to ${I('x', '1')} around ${I('z', '1')}: 0 in the drawing + variable`, `de ${I('x', '0')} à ${I('x', '1')} autour de ${I('z', '1')} : 0 sur le dessin + variable`]],
      [I('d', '1'), n('0.40'), [`from ${I('x', '0')} (floor) to ${I('x', '1')} (shoulder) along ${I('z', '1')}`, `de ${I('x', '0')} (sol) à ${I('x', '1')} (épaule) le long de ${I('z', '1')}`]],
      [I('α', '1'), '90°', [`from ${I('z', '1')} (up) to ${I('z', '2')} (towards you) around ${I('x', '1')} (right) → +90°`, `de ${I('z', '1')} (haut) à ${I('z', '2')} (vers vous) autour de ${I('x', '1')} (droite) → +90°`]],
      [I('a', '1'), '0', [`from ${I('z', '1')} to ${I('z', '2')} along ${I('x', '1')}: they cross`, `de ${I('z', '1')} à ${I('z', '2')} le long de ${I('x', '1')} : ils se coupent`]],
      [I('θ', '2'), I('q', '2'), [`from ${I('x', '1')} to ${I('x', '2')} around ${I('z', '2')}: both to the right in the drawing → 0 + variable`, `de ${I('x', '1')} à ${I('x', '2')} autour de ${I('z', '2')} : tous deux vers la droite sur le dessin → 0 + variable`]],
      [I('d', '2'), '0', [`from ${I('x', '1')} to ${I('x', '2')} along ${I('z', '2')}: both at the shoulder`, `de ${I('x', '1')} à ${I('x', '2')} le long de ${I('z', '2')} : tous deux à l'épaule`]],
      [I('α', '2'), '0', [`from ${I('z', '2')} to ${I('z', '3')} around ${I('x', '2')}: parallel`, `de ${I('z', '2')} à ${I('z', '3')} autour de ${I('x', '2')} : parallèles`]],
      [I('a', '2'), n('0.45'), [`from ${I('z', '2')} (shoulder) to ${I('z', '3')} (elbow) along ${I('x', '2')}`, `de ${I('z', '2')} (épaule) à ${I('z', '3')} (coude) le long de ${I('x', '2')}`]],
      [I('θ', '3'), I('q', '3'), [`from ${I('x', '2')} to ${I('x', '3')} around ${I('z', '3')}: 0 in the drawing + variable`, `de ${I('x', '2')} à ${I('x', '3')} autour de ${I('z', '3')} : 0 sur le dessin + variable`]],
      [I('d', '3'), '0', [`from ${I('x', '2')} to ${I('x', '3')} along ${I('z', '3')}: both at the elbow`, `de ${I('x', '2')} à ${I('x', '3')} le long de ${I('z', '3')} : tous deux au coude`]],
      [['tool: a₃', 'outil : a₃'], n('0.38'), [`from ${I('z', '3')} (elbow) to ${I('z', 'E')} (tool) along ${I('x', '3')}; the other three cells of the tool row are 0`, `de ${I('z', '3')} (coude) à ${I('z', 'E')} (outil) le long de ${I('x', '3')} ; les trois autres cases de la ligne outil valent 0`]]
    ]),
    P('The finished table:', 'Le tableau terminé :'),
    TABLE(['<i>j</i>', I('α', 'j−1'), I('a', 'j−1'), I('θ', 'j'), I('d', 'j')], [
      ['1', '0', '0', I('q', '1'), n('0.40')], ['2', '90°', '0', I('q', '2'), '0'], ['3', '0', n('0.45'), I('q', '3'), '0'], [['E (tool)', 'E (outil)'], '0', n('0.38'), '0', '0']
    ]),
    H4('7.6 The matrix of one row', '7.6 La matrice d\'une ligne'),
    EQ(`<sup>j−1</sup><i>T</i><sub>j</sub> = Rot(<i>x</i>, ${I('α', 'j−1')}) · Trans(<i>x</i>, ${I('a', 'j−1')}) · Rot(<i>z</i>, ${I('θ', 'j')}) · Trans(<i>z</i>, ${I('d', 'j')}) = ${MX(4, ['cθ', '−sθ', '0', '<i>a</i>', 'sθ cα', 'cθ cα', '−sα', '−<i>d</i> sα', 'sθ sα', 'cθ sα', 'cα', '<i>d</i> cα', '0', '0', '0', '1'])}`),
    P('With 25°, 70° and −80° the product of the four matrices gives <strong>(0.479, 0.223, 0.757) m</strong>: the same tool position as with the standard table of lesson 6. Compare the two tables: the numbers 0.40, 90°, 0.45, 0.38 are all there, but 90° and the lengths have moved <strong>one row down</strong>.',
      'Avec 25°, 70° et −80°, le produit des quatre matrices donne <strong>(0,479 ; 0,223 ; 0,757) m</strong> : la même position d\'outil qu\'avec le tableau standard de la leçon 6. Comparez les deux tableaux : les nombres 0,40, 90°, 0,45, 0,38 sont tous là, mais le 90° et les longueurs sont descendus <strong>d\'une ligne</strong>.'),
    BOX('idea', ['To remember', 'À retenir'],
      P(`<strong>α and a live on ${I('x', 'j−1')}</strong> (between ${I('z', 'j−1')} and ${I('z', 'j')}); <strong>θ and d live on ${I('z', 'j')}</strong> (between ${I('x', 'j−1')} and ${I('x', 'j')}). In Khalil's letters: α<sub>j</sub>, d<sub>j</sub> on x<sub>j−1</sub>; θ<sub>j</sub>, r<sub>j</sub> on z<sub>j</sub>.`,
        `<strong>α et a vivent sur ${I('x', 'j−1')}</strong> (entre ${I('z', 'j−1')} et ${I('z', 'j')}) ; <strong>θ et d vivent sur ${I('z', 'j')}</strong> (entre ${I('x', 'j−1')} et ${I('x', 'j')}). Avec les lettres de Khalil : α<sub>j</sub>, d<sub>j</sub> sur x<sub>j−1</sub> ; θ<sub>j</sub>, r<sub>j</sub> sur z<sub>j</sub>.`))
  ],
  terms: [['modified DH (DHM)', 'DH modifié (DHM)'], ['Khalil–Kleinfinger', 'Khalil–Kleinfinger'], ['common perpendicular', 'perpendiculaire commune'], ['fixed row', 'ligne fixe'], ['twist α', 'torsion α'], ['offset d (Khalil: r)', 'décalage d (Khalil : r)']],
  quiz: [
    ['In modified DH, on which axis is z of frame j?', 'En DH modifié, sur quel axe est le z du repère j ?', 'On the axis of joint j itself.', 'Sur l\'axe de la liaison j elle-même.'],
    ['Between which two axes is αⱼ₋₁ measured, and around which axis?', 'Entre quels deux axes se mesure αⱼ₋₁, et autour de quel axe ?', 'From zⱼ₋₁ to zⱼ, around xⱼ₋₁.', 'De zⱼ₋₁ à zⱼ, autour de xⱼ₋₁.'],
    ['Between which two axes is dⱼ (Khalil: rⱼ) measured, and along which axis?', 'Entre quels deux axes se mesure dⱼ (Khalil : rⱼ), et le long de quel axe ?', 'From xⱼ₋₁ to xⱼ, along zⱼ.', 'De xⱼ₋₁ à xⱼ, le long de zⱼ.'],
    ['Why does a DHM table often have one more row than the number of joints?', 'Pourquoi un tableau DHM a-t-il souvent une ligne de plus que le nombre de liaisons ?', 'The last frame sits on the last joint, not on the tool: a fixed row brings it to the tool.', 'Le dernier repère est sur la dernière liaison, pas sur l\'outil : une ligne fixe l\'amène jusqu\'à l\'outil.']
  ],
  link: ['learn-model.html#l4', 'The full DHM lesson, with a SCARA and 6-axis robots →', 'La leçon DHM complète, avec un SCARA et des robots 6 axes →']
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['DH and DHM side by side', 'DH et DHM côte à côte'],
  time: 10,
  goal: ['to tell the two conventions apart at a glance, to avoid mixing them, and to check any table.', 'à distinguer les deux conventions d\'un coup d\'œil, à éviter de les mélanger, et à vérifier n\'importe quel tableau.'],
  body: [
    H4('8.1 The differences in one table', '8.1 Les différences en un tableau'),
    TABLE(['', ['Standard DH', 'DH standard'], ['Modified DH (DHM)', 'DH modifié (DHM)']], [
      [['<strong>Where is frame <i>i</i>?</strong>', '<strong>Où est le repère <i>i</i> ?</strong>'], ['at the <strong>far end</strong> of link <i>i</i>', 'à l\'<strong>extrémité</strong> du segment <i>i</i>'], ['at the <strong>start</strong> of link <i>i</i>', 'au <strong>début</strong> du segment <i>i</i>']],
      [[`<strong>${I('z', 'i')} is the axis of…</strong>`, `<strong>${I('z', 'i')} est l'axe de…</strong>`], ['joint <i>i</i>+1', 'la liaison <i>i</i>+1'], ['joint <i>i</i>', 'la liaison <i>i</i>']],
      [['<strong>Order of the moves</strong>', '<strong>Ordre des mouvements</strong>'], ['θ, <i>d</i> (along z), then <i>a</i>, α (along x)', 'θ, <i>d</i> (selon z), puis <i>a</i>, α (selon x)'], ['α, <i>a</i> (along x), then θ, <i>d</i> (along z)', 'α, <i>a</i> (selon x), puis θ, <i>d</i> (selon z)']],
      [['<strong>Indices in row <i>i</i></strong>', '<strong>Indices de la ligne <i>i</i></strong>'], [`${I('θ', 'i')}, ${I('d', 'i')}, ${I('a', 'i')}, ${I('α', 'i')}`, `${I('θ', 'i')}, ${I('d', 'i')}, ${I('a', 'i')}, ${I('α', 'i')}`], [`${I('α', 'i−1')}, ${I('a', 'i−1')}, ${I('θ', 'i')}, ${I('d', 'i')}`, `${I('α', 'i−1')}, ${I('a', 'i−1')}, ${I('θ', 'i')}, ${I('d', 'i')}`]],
      [['<strong>Rows for <i>n</i> joints</strong>', '<strong>Lignes pour <i>n</i> liaisons</strong>'], ['<i>n</i>: the last frame is on the tool', '<i>n</i> : le dernier repère est sur l\'outil'], ['<i>n</i>, plus often one fixed row for the tool', '<i>n</i>, plus souvent une ligne fixe pour l\'outil']],
      [['<strong>Found in</strong>', '<strong>On le trouve dans</strong>'], ['Spong; Siciliano; many manufacturer data sheets', 'Spong ; Siciliano ; beaucoup de fiches constructeurs'], ['Craig; Khalil and Dombre; dynamics and robots with branches', 'Craig ; Khalil et Dombre ; la dynamique et les robots à branches']]
    ]),
    BOX('keep', ['Same robot, same result', 'Même robot, même résultat'],
      P('The two conventions describe <strong>the same robot</strong>. The frames in the middle of the chain are placed differently, so the intermediate matrices differ, but the final matrix from the base to the tool is the same. Lessons 6 and 7 showed it twice: (0.537, 0.636) and (0.479, 0.223, 0.757).',
        'Les deux conventions décrivent <strong>le même robot</strong>. Les repères du milieu de la chaîne sont placés différemment, donc les matrices intermédiaires diffèrent, mais la matrice finale de la base à l\'outil est la même. Les leçons 6 et 7 l\'ont montré deux fois : (0,537 ; 0,636) et (0,479 ; 0,223 ; 0,757).')),
    H4('8.2 The same arm, both tables', '8.2 Le même bras, les deux tableaux'),
    P('The 3-axis arm of lessons 6 and 7:', 'Le bras à 3 axes des leçons 6 et 7 :'),
    TABLE([['Standard', 'Standard'], 'θ', '<i>d</i>', '<i>a</i>', 'α', '', ['Modified', 'Modifié'], 'α', '<i>a</i>', 'θ', '<i>d</i>'], [
      ['1', I('θ', '1'), n('0.40'), '0', '<strong>90°</strong>', '', '1', '0', '0', I('θ', '1'), n('0.40')],
      ['2', I('θ', '2'), '0', n('0.45'), '0', '', '2', '<strong>90°</strong>', '0', I('θ', '2'), '0'],
      ['3', I('θ', '3'), '0', n('0.38'), '0', '', '3', '0', n('0.45'), I('θ', '3'), '0'],
      ['', '', '', '', '', '', ['tool', 'outil'], '0', n('0.38'), '0', '0']
    ]),
    P('Read it like this: in the standard table the 90° is in <strong>row 1</strong> (the twist of link 1); in the modified table it is in <strong>row 2</strong> (the twist <em>before</em> joint 2). The lengths 0.45 and 0.38 also move one row down.',
      'Lisez-le ainsi : dans le tableau standard, le 90° est à la <strong>ligne 1</strong> (la torsion du segment 1) ; dans le tableau modifié, il est à la <strong>ligne 2</strong> (la torsion <em>avant</em> la liaison 2). Les longueurs 0,45 et 0,38 descendent aussi d\'une ligne.'),
    H4('8.3 The mistake that costs hours: mixing them', '8.3 L\'erreur qui coûte des heures : les mélanger'),
    BOX('warn', ['A standard table in a modified matrix gives another robot', 'Un tableau standard dans une matrice modifiée donne un autre robot'],
      P(`Take the standard table of the 2-axis arm (<i>a</i> = 0.5 and 0.4, 30° and 45°) and feed it to the <em>modified</em> matrix by mistake. Each row now means “move forward, <em>then</em> turn” instead of “turn, then move forward”. The tool lands at (0.5 + 0.4 cos 30°, 0.4 sin 30°) = <strong>(0.846, 0.200)</strong> instead of (0.537, 0.636). No error message: just a robot that goes to the wrong place.`,
        `Prenez le tableau standard du bras à 2 axes (<i>a</i> = 0,5 et 0,4, 30° et 45°) et donnez-le par erreur à la matrice <em>modifiée</em>. Chaque ligne veut maintenant dire « avancer, <em>puis</em> tourner » au lieu de « tourner, puis avancer ». L'outil arrive en (0,5 + 0,4 cos 30° ; 0,4 sin 30°) = <strong>(0,846 ; 0,200)</strong> au lieu de (0,537 ; 0,636). Aucun message d'erreur : juste un robot qui va au mauvais endroit.`)),
    H4('8.4 How to recognise the convention of a table', '8.4 Comment reconnaître la convention d\'un tableau'),
    UL([
      [`The columns start with <strong>θ, <i>d</i></strong> and end with <strong><i>a</i>, α</strong> → standard. They start with <strong>α, <i>a</i></strong> → modified.`, `Les colonnes commencent par <strong>θ, <i>d</i></strong> et finissent par <strong><i>a</i>, α</strong> → standard. Elles commencent par <strong>α, <i>a</i></strong> → modifié.`],
      [`The indices ${I('a', 'i−1')}, ${I('α', 'i−1')} appear → modified.`, `Les indices ${I('a', 'i−1')}, ${I('α', 'i−1')} apparaissent → modifié.`],
      ['The letters are α, <i>d</i>, θ, <i>r</i> → modified, in the Khalil–Kleinfinger notation.', 'Les lettres sont α, <i>d</i>, θ, <i>r</i> → modifié, en notation Khalil–Kleinfinger.'],
      ['In a software library, look for an option such as “standard” / “modified” (often written <code>mdh</code>).', 'Dans une bibliothèque logicielle, cherchez une option « standard » / « modified » (souvent écrite <code>mdh</code>).']
    ]),
    H4('8.5 Checklist: is my table right?', '8.5 Liste de contrôle : mon tableau est-il juste ?'),
    OL([
      ['<strong>Zero pose</strong>: set every variable to 0, compute the tool position, and compare with the drawing of the robot in that pose.', '<strong>Pose zéro</strong> : mettez toutes les variables à 0, calculez la position de l\'outil, et comparez avec le dessin du robot dans cette pose.'],
      ['<strong>One joint at a time</strong>: turn joint 1 by 90° only. Does the tool go where you expect? Then joint 2, and so on.', '<strong>Une liaison à la fois</strong> : tournez seulement la liaison 1 de 90°. L\'outil va-t-il où vous l\'attendez ? Puis la liaison 2, et ainsi de suite.'],
      ['<strong>Parallel axes have α = 0</strong>; perpendicular axes have α = ±90°. Count them on the robot.', '<strong>Des axes parallèles ont α = 0</strong> ; des axes perpendiculaires ont α = ±90°. Comptez-les sur le robot.'],
      ['<strong>Lengths</strong>: every non-zero <i>a</i> or <i>d</i> must be a real distance you can measure on the robot.', '<strong>Longueurs</strong> : chaque <i>a</i> ou <i>d</i> non nul doit être une vraie distance mesurable sur le robot.']
    ]),
    BOX('idea', ['Which one should you use?', 'Laquelle utiliser ?'],
      P('The one of your course, your book or your software, and <strong>only that one</strong> inside a project. Two people can also write two different correct tables in the <em>same</em> convention (the direction of an axis is a free choice): what counts is that the final matrix is right. On the robot pages of this site you can switch between the DH and DHM tables of the same robot and watch the frames move.',
        'Celle de votre cours, de votre livre ou de votre logiciel, et <strong>seulement celle-là</strong> dans un projet. Deux personnes peuvent aussi écrire deux tableaux corrects différents dans la <em>même</em> convention (le sens d\'un axe est un choix libre) : ce qui compte, c\'est que la matrice finale soit juste. Sur les pages des robots de ce site, vous pouvez basculer entre les tableaux DH et DHM du même robot et voir les repères se déplacer.'))
  ],
  terms: [['standard DH', 'DH standard'], ['modified DH', 'DH modifié'], ['zero pose', 'pose zéro'], ['convention', 'convention']],
  quiz: [
    ['The columns of a table are α, a, θ, d. Which convention?', 'Les colonnes d\'un tableau sont α, a, θ, d. Quelle convention ?', 'Modified DH: the moves along x (α, a) come first.', 'DH modifié : les mouvements selon x (α, a) viennent en premier.'],
    ['Do the two conventions give the same position of the tool?', 'Les deux conventions donnent-elles la même position de l\'outil ?', 'Yes, if each table is used with its own matrix. Only the intermediate frames differ.', 'Oui, si chaque tableau est utilisé avec sa propre matrice. Seuls les repères intermédiaires diffèrent.'],
    ['What is the first check of a new DH table?', 'Quelle est la première vérification d\'un nouveau tableau DH ?', 'The zero pose: set all the variables to 0 and compare the computed tool position with the robot.', 'La pose zéro : mettre toutes les variables à 0 et comparer la position d\'outil calculée avec le robot.']
  ],
  link: ['arm.html', 'Switch between DH and DHM on the 3D arm →', 'Basculer entre DH et DHM sur le bras 3D →']
})
  ];
}
