// The maths of robotics, lessons 6 to 8: standard DH alone, modified DH (DHM) alone, then the two side by side.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, TRY, lesson } from '../lib.mjs';
import { AXM, frame } from './mk-b.mjs';
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
  time: 15,
  goal: ['where the standard DH convention puts the frames, its four parameters, its matrix, and how to write the DH table of a robot step by step.', 'où la convention DH standard place les repères, ses quatre paramètres, sa matrice, et comment écrire pas à pas le tableau DH d\'un robot.'],
  body: [
    H4('6.1 The problem: too much freedom', '6.1 Le problème : trop de liberté'),
    P('Lesson 5 showed that a robot is a chain of frames, one per link, and that we multiply their matrices. But <strong>where exactly</strong> do we put each frame on its link? If everybody chooses freely, a frame needs <strong>6 numbers</strong> (3 for the position, 3 for the orientation), and nobody gets the same equations.',
      'La leçon 5 a montré qu\'un robot est une chaîne de repères, un par segment, et que l\'on multiplie leurs matrices. Mais <strong>où exactement</strong> place-t-on chaque repère sur son segment ? Si chacun choisit librement, un repère demande <strong>6 nombres</strong> (3 pour la position, 3 pour l\'orientation), et personne n\'obtient les mêmes équations.'),
    P('In 1955 Jacques Denavit and Richard Hartenberg proposed a <strong>rule to place the frames</strong>. With this rule, going from one frame to the next needs only <strong>4 numbers</strong>. A whole robot becomes a small table: one row per joint, four numbers per row.',
      'En 1955, Jacques Denavit et Richard Hartenberg ont proposé une <strong>règle pour placer les repères</strong>. Avec cette règle, passer d\'un repère au suivant ne demande plus que <strong>4 nombres</strong>. Tout un robot devient un petit tableau : une ligne par liaison, quatre nombres par ligne.'),
    H4('6.2 Where the frames go', '6.2 Où vont les repères'),
    P('Number the links from 0 (the base) to <i>n</i> (the tool), and the joints from 1 to <i>n</i>: joint <i>i</i> connects link <i>i</i>−1 to link <i>i</i>. In <strong>standard DH</strong>, frame <i>i</i> is fixed to link <i>i</i>, <strong>at its far end</strong>, on the axis of the <em>next</em> joint:',
      'Numérotez les segments de 0 (la base) à <i>n</i> (l\'outil), et les liaisons de 1 à <i>n</i> : la liaison <i>i</i> relie le segment <i>i</i>−1 au segment <i>i</i>. En <strong>DH standard</strong>, le repère <i>i</i> est fixé au segment <i>i</i>, <strong>à son extrémité</strong>, sur l\'axe de la liaison <em>suivante</em> :'),
    BOX('method', ['Standard DH: placing frame i', 'DH standard : placer le repère i'],
      OL([
        [`<strong>${I('z', 'i')}</strong> is along the axis of joint <i>i</i>+1 (so ${I('z', '0')} is the axis of joint 1, ${I('z', '1')} the axis of joint 2…).`, `<strong>${I('z', 'i')}</strong> est selon l'axe de la liaison <i>i</i>+1 (donc ${I('z', '0')} est l'axe de la liaison 1, ${I('z', '1')} l'axe de la liaison 2…).`],
        [`<strong>${I('x', 'i')}</strong> is along the <strong>common perpendicular</strong>: the shortest segment from the axis ${I('z', 'i−1')} to the axis ${I('z', 'i')}. It must cross ${I('z', 'i−1')} at a right angle.`, `<strong>${I('x', 'i')}</strong> est selon la <strong>perpendiculaire commune</strong> : le plus court segment de l'axe ${I('z', 'i−1')} à l'axe ${I('z', 'i')}. Il doit couper ${I('z', 'i−1')} à angle droit.`],
        [`The <strong>origin</strong> is where ${I('x', 'i')} meets ${I('z', 'i')}.`, `L'<strong>origine</strong> est là où ${I('x', 'i')} rencontre ${I('z', 'i')}.`],
        [`<strong>${I('y', 'i')}</strong> completes the frame (right-hand rule: <strong>y</strong> = <strong>z</strong> × <strong>x</strong>). You never need to draw it.`, `<strong>${I('y', 'i')}</strong> complète le repère (règle de la main droite : <strong>y</strong> = <strong>z</strong> × <strong>x</strong>). On n'a jamais besoin de le dessiner.`]
      ])),
    dhFig(true),
    H4('6.3 The four parameters', '6.3 Les quatre paramètres'),
    P(`To go from frame <i>i</i>−1 to frame <i>i</i>, do four simple moves <strong>in this order</strong>: two along the old axis ${I('z', 'i−1')}, then two along the new axis ${I('x', 'i')}.`,
      `Pour passer du repère <i>i</i>−1 au repère <i>i</i>, on fait quatre mouvements simples <strong>dans cet ordre</strong> : deux selon l'ancien axe ${I('z', 'i−1')}, puis deux selon le nouvel axe ${I('x', 'i')}.`),
    TABLE([['Order', 'Ordre'], ['Parameter', 'Paramètre'], ['Move', 'Mouvement'], ['In plain words', 'En mots simples']], [
      ['1', `<strong>${I('θ', 'i')}</strong>`, [`turn around ${I('z', 'i−1')}`, `tourner autour de ${I('z', 'i−1')}`], ['the <strong>joint angle</strong>: the variable of a revolute joint', 'l\'<strong>angle de la liaison</strong> : la variable d\'une liaison rotoïde']],
      ['2', `<strong>${I('d', 'i')}</strong>`, [`slide along ${I('z', 'i−1')}`, `glisser le long de ${I('z', 'i−1')}`], ['the <strong>offset</strong> along the joint axis: the variable of a prismatic joint', 'le <strong>décalage</strong> le long de l\'axe de la liaison : la variable d\'une liaison prismatique']],
      ['3', `<strong>${I('a', 'i')}</strong>`, [`slide along ${I('x', 'i')}`, `glisser le long de ${I('x', 'i')}`], ['the <strong>link length</strong>: the distance between the two joint axes', 'la <strong>longueur du segment</strong> : la distance entre les deux axes de liaisons']],
      ['4', `<strong>${I('α', 'i')}</strong>`, [`turn around ${I('x', 'i')}`, `tourner autour de ${I('x', 'i')}`], ['the <strong>twist</strong>: the angle between the two joint axes (0 if parallel, ±90° if perpendicular)', 'la <strong>torsion</strong> : l\'angle entre les deux axes de liaisons (0 s\'ils sont parallèles, ±90° s\'ils sont perpendiculaires)']]
    ]),
    BOX('keep', ['What moves, what is fixed', 'Ce qui bouge, ce qui est fixe'],
      UL([
        [`${I('a', 'i')} and ${I('α', 'i')} never change: they are the <strong>shape of link <i>i</i></strong>.`, `${I('a', 'i')} et ${I('α', 'i')} ne changent jamais : c'est la <strong>forme du segment <i>i</i></strong>.`],
        [`Revolute joint: ${I('θ', 'i')} is the variable, ${I('d', 'i')} is fixed. Prismatic joint: ${I('d', 'i')} is the variable, ${I('θ', 'i')} is fixed.`, `Liaison rotoïde : ${I('θ', 'i')} est la variable, ${I('d', 'i')} est fixe. Liaison prismatique : ${I('d', 'i')} est la variable, ${I('θ', 'i')} est fixe.`]
      ])),
    H4('6.4 The matrix of one row', '6.4 La matrice d\'une ligne'),
    P('Each move is a homogeneous matrix (lesson 5). Multiply the four, in the order of the table:', 'Chaque mouvement est une matrice homogène (leçon 5). On multiplie les quatre, dans l\'ordre du tableau :'),
    EQ(`<sup>i−1</sup><i>T</i><sub>i</sub> = Rot(<i>z</i>, ${I('θ', 'i')}) · Trans(<i>z</i>, ${I('d', 'i')}) · Trans(<i>x</i>, ${I('a', 'i')}) · Rot(<i>x</i>, ${I('α', 'i')})`),
    EQ(`<sup>i−1</sup><i>T</i><sub>i</sub> = ${MX(4, ['cθ', '−sθ cα', 'sθ sα', '<i>a</i> cθ', 'sθ', 'cθ cα', '−cθ sα', '<i>a</i> sθ', '0', 'sα', 'cα', '<i>d</i>', '0', '0', '0', '1'])}`),
    P('with cθ = cos <i>θ</i><sub>i</sub>, sα = sin <i>α</i><sub>i</sub>… You do not need to learn it by heart: know <strong>where it comes from</strong>, and let a program fill it.',
      'avec cθ = cos <i>θ</i><sub>i</sub>, sα = sin <i>α</i><sub>i</sub>… Inutile de l\'apprendre par cœur : sachez <strong>d\'où elle vient</strong>, et laissez un programme la remplir.'),
    H4('6.5 Example 1: the 2-axis arm', '6.5 Exemple 1 : le bras à 2 axes'),
    armFig([[60, 172, 0, sub('x', '0')], [172.6, 107, 30, sub('x', '1')], [206.8, 13, 70, sub('x', '2')]]),
    P(`The two joint axes point out of the page, so they are parallel: every ${I('α', 'i')} = 0 and every ${I('d', 'i')} = 0. Frame 1 is at the end of link 1, frame 2 at the end of link 2 (the tool).`,
      `Les deux axes des liaisons sortent de la page, ils sont donc parallèles : tous les ${I('α', 'i')} = 0 et tous les ${I('d', 'i')} = 0. Le repère 1 est au bout du segment 1, le repère 2 au bout du segment 2 (l'outil).`),
    TABLE(['<i>i</i>', I('θ', 'i'), I('d', 'i'), I('a', 'i'), I('α', 'i')], [['1', I('θ', '1'), '0', I('L', '1'), '0'], ['2', I('θ', '2'), '0', I('L', '2'), '0']]),
    P(`With α = 0 and <i>d</i> = 0 the matrix becomes “turn by <i>θ</i>, then move forward by <i>a</i>”: exactly the matrices of lesson 5. With ${I('L', '1')} = 0.5, ${I('L', '2')} = 0.4, ${I('θ', '1')} = 30°, ${I('θ', '2')} = 45° the product gives the tool at <strong>(0.537, 0.636)</strong>, as before.`,
      `Avec α = 0 et <i>d</i> = 0, la matrice devient « tourner de <i>θ</i>, puis avancer de <i>a</i> » : exactement les matrices de la leçon 5. Avec ${I('L', '1')} = 0,5, ${I('L', '2')} = 0,4, ${I('θ', '1')} = 30°, ${I('θ', '2')} = 45°, le produit donne l'outil en <strong>(0,537 ; 0,636)</strong>, comme avant.`),
    H4('6.6 Example 2: a 3-axis arm in space', '6.6 Exemple 2 : un bras à 3 axes dans l\'espace'),
    P('The arm of the “Build your first robot” workshop: joint 1 turns around the vertical; joints 2 and 3 (shoulder, elbow) turn around a horizontal axis. Shoulder height 0.40 m, links of 0.45 m and 0.38 m.',
      'Le bras de l\'atelier « Construisez votre premier robot » : la liaison 1 tourne autour de la verticale ; les liaisons 2 et 3 (épaule, coude) tournent autour d\'un axe horizontal. Hauteur de l\'épaule 0,40 m, segments de 0,45 m et 0,38 m.'),
    TABLE(['<i>i</i>', I('θ', 'i'), I('d', 'i'), I('a', 'i'), I('α', 'i'), ['Why', 'Pourquoi']], [
      ['1', I('θ', '1'), n('0.40'), '0', '90°', ['axis 1 is vertical, axis 2 horizontal: they cross (<i>a</i> = 0) at a right angle (α = 90°), 0.40 m above the base (<i>d</i>)', 'l\'axe 1 est vertical, l\'axe 2 horizontal : ils se coupent (<i>a</i> = 0) à angle droit (α = 90°), 0,40 m au-dessus de la base (<i>d</i>)']],
      ['2', I('θ', '2'), '0', n('0.45'), '0', ['axes 2 and 3 are parallel, 0.45 m apart', 'les axes 2 et 3 sont parallèles, à 0,45 m l\'un de l\'autre']],
      ['3', I('θ', '3'), '0', n('0.38'), '0', ['from the elbow to the tool: 0.38 m', 'du coude à l\'outil : 0,38 m']]
    ]),
    BOX('example', ['Check with numbers', 'Vérification avec des nombres'],
      P(`${I('θ', '1')} = 25°, ${I('θ', '2')} = 70°, ${I('θ', '3')} = −80°. Multiplying the three matrices gives the tool at <strong>(0.479, 0.223, 0.757) m</strong>. By hand: <i>r</i> = 0.45 cos 70° + 0.38 cos(−10°) = 0.528; <i>x</i> = <i>r</i> cos 25° = 0.479; <i>y</i> = <i>r</i> sin 25° = 0.223; <i>z</i> = 0.40 + 0.45 sin 70° + 0.38 sin(−10°) = 0.757. The table and the drawing agree. Set these angles in the workshop: it shows the same position.`,
        `${I('θ', '1')} = 25°, ${I('θ', '2')} = 70°, ${I('θ', '3')} = −80°. Le produit des trois matrices donne l'outil en <strong>(0,479 ; 0,223 ; 0,757) m</strong>. À la main : <i>r</i> = 0,45 cos 70° + 0,38 cos(−10°) = 0,528 ; <i>x</i> = <i>r</i> cos 25° = 0,479 ; <i>y</i> = <i>r</i> sin 25° = 0,223 ; <i>z</i> = 0,40 + 0,45 sin 70° + 0,38 sin(−10°) = 0,757. Le tableau et le dessin sont d'accord. Réglez ces angles dans l'atelier : il affiche la même position.`)),
    BOX('warn', ['Three special cases', 'Trois cas particuliers'],
      UL([
        ['<strong>Parallel axes</strong>: there are many common perpendiculars. Choose the one that makes <i>d</i> = 0.', '<strong>Axes parallèles</strong> : il y a beaucoup de perpendiculaires communes. Choisissez celle qui donne <i>d</i> = 0.'],
        ['<strong>Axes that cross</strong>: <i>a</i> = 0, and <strong>x</strong> is perpendicular to both axes (two possible directions: choose one, it sets the sign of α).', '<strong>Axes qui se coupent</strong> : <i>a</i> = 0, et <strong>x</strong> est perpendiculaire aux deux axes (deux sens possibles : choisissez-en un, il fixe le signe de α).'],
        ['<strong>Zero position</strong>: the arm drawn with all <i>θ</i> = 0 may not be the “home” pose of the real robot. A fixed offset is then added in the table, written <i>θ</i> + 90° for example.', '<strong>Position zéro</strong> : le bras dessiné avec tous les <i>θ</i> = 0 n\'est pas forcément la pose de repos du vrai robot. On ajoute alors un décalage fixe dans le tableau, écrit par exemple <i>θ</i> + 90°.']
      ]))
  ],
  terms: [['DH convention', 'convention DH'], ['common perpendicular', 'perpendiculaire commune'], ['joint angle θ', 'angle de liaison θ'], ['offset d', 'décalage d'], ['link length a', 'longueur de segment a'], ['twist α', 'torsion α'], ['DH table', 'tableau DH']],
  quiz: [
    ['In standard DH, on which axis is z of frame i?', 'En DH standard, sur quel axe est le z du repère i ?', 'On the axis of joint i+1 (the next joint).', 'Sur l\'axe de la liaison i+1 (la liaison suivante).'],
    ['In which order are the four moves of a standard DH row applied?', 'Dans quel ordre s\'appliquent les quatre mouvements d\'une ligne DH standard ?', 'θ (turn around z), d (slide along z), a (slide along x), α (turn around x).', 'θ (tourner autour de z), d (glisser selon z), a (glisser selon x), α (tourner autour de x).'],
    ['Two consecutive joint axes are parallel. What is α?', 'Deux axes de liaisons consécutifs sont parallèles. Que vaut α ?', '0: there is no twist between them.', '0 : il n\'y a pas de torsion entre eux.']
  ],
  link: ['arm.html', 'See a DH table on a live 3D arm →', 'Voir un tableau DH sur un bras 3D en direct →']
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['The modified DH method (DHM)', 'La méthode DH modifiée (DHM)'],
  time: 14,
  goal: ['what changes in the modified convention, where its frames go, its four parameters, its matrix, and the DHM tables of the same two robots.', 'ce qui change dans la convention modifiée, où vont ses repères, ses quatre paramètres, sa matrice, et les tableaux DHM des deux mêmes robots.'],
  body: [
    H4('7.1 One idea changes: the frame sits on its own joint', '7.1 Une seule idée change : le repère est sur sa propre liaison'),
    P('In standard DH, frame <i>i</i> is at the far end of link <i>i</i>, on the axis of joint <i>i</i>+1. Many people find this confusing: the frame of link 2 is on joint 3. The <strong>modified</strong> convention (Khalil and Kleinfinger, 1986; also used in the book of J. Craig) moves each frame to the <strong>start</strong> of its link:',
      'En DH standard, le repère <i>i</i> est à l\'extrémité du segment <i>i</i>, sur l\'axe de la liaison <i>i</i>+1. Beaucoup trouvent cela déroutant : le repère du segment 2 est sur la liaison 3. La convention <strong>modifiée</strong> (Khalil et Kleinfinger, 1986 ; aussi utilisée dans le livre de J. Craig) déplace chaque repère au <strong>début</strong> de son segment :'),
    BOX('keep', ['The rule of DHM', 'La règle du DHM'],
      P('<strong>Frame <i>j</i> is fixed to link <i>j</i> and sits on the axis of joint <i>j</i></strong>: the joint that moves this link. Joint 1 → frame 1, joint 2 → frame 2. Same number everywhere.',
        '<strong>Le repère <i>j</i> est fixé au segment <i>j</i> et se trouve sur l\'axe de la liaison <i>j</i></strong> : la liaison qui fait bouger ce segment. Liaison 1 → repère 1, liaison 2 → repère 2. Le même numéro partout.')),
    BOX('method', ['Modified DH: placing frame j', 'DH modifié : placer le repère j'],
      OL([
        [`<strong>${I('z', 'j')}</strong> is along the axis of joint <i>j</i>.`, `<strong>${I('z', 'j')}</strong> est selon l'axe de la liaison <i>j</i>.`],
        [`<strong>${I('x', 'j')}</strong> is along the common perpendicular from ${I('z', 'j')} to the next axis ${I('z', 'j+1')}.`, `<strong>${I('x', 'j')}</strong> est selon la perpendiculaire commune de ${I('z', 'j')} vers l'axe suivant ${I('z', 'j+1')}.`],
        [`The <strong>origin</strong> is where ${I('x', 'j')} meets ${I('z', 'j')}.`, `L'<strong>origine</strong> est là où ${I('x', 'j')} rencontre ${I('z', 'j')}.`],
        [`<strong>${I('y', 'j')}</strong> completes the frame.`, `<strong>${I('y', 'j')}</strong> complète le repère.`]
      ])),
    dhFig(false),
    H4('7.2 The four parameters, in a new order', '7.2 Les quatre paramètres, dans un nouvel ordre'),
    P(`To go from frame <i>j</i>−1 to frame <i>j</i>: first the <strong>shape of the previous link</strong> (two moves along ${I('x', 'j−1')}), then the <strong>motion of joint <i>j</i></strong> (two moves along ${I('z', 'j')}).`,
      `Pour passer du repère <i>j</i>−1 au repère <i>j</i> : d'abord la <strong>forme du segment précédent</strong> (deux mouvements selon ${I('x', 'j−1')}), puis le <strong>mouvement de la liaison <i>j</i></strong> (deux mouvements selon ${I('z', 'j')}).`),
    TABLE([['Order', 'Ordre'], ['Parameter', 'Paramètre'], ['Move', 'Mouvement'], ['In plain words', 'En mots simples']], [
      ['1', `<strong>${I('α', 'j−1')}</strong>`, [`turn around ${I('x', 'j−1')}`, `tourner autour de ${I('x', 'j−1')}`], [`the <strong>twist</strong> between the axes ${I('z', 'j−1')} and ${I('z', 'j')}`, `la <strong>torsion</strong> entre les axes ${I('z', 'j−1')} et ${I('z', 'j')}`]],
      ['2', `<strong>${I('a', 'j−1')}</strong>`, [`slide along ${I('x', 'j−1')}`, `glisser le long de ${I('x', 'j−1')}`], ['the <strong>distance</strong> between these two axes', 'la <strong>distance</strong> entre ces deux axes']],
      ['3', `<strong>${I('θ', 'j')}</strong>`, [`turn around ${I('z', 'j')}`, `tourner autour de ${I('z', 'j')}`], ['the <strong>joint angle</strong>: the variable of a revolute joint', 'l\'<strong>angle de la liaison</strong> : la variable d\'une liaison rotoïde']],
      ['4', `<strong>${I('d', 'j')}</strong>`, [`slide along ${I('z', 'j')}`, `glisser le long de ${I('z', 'j')}`], ['the <strong>offset</strong> along the joint axis: the variable of a prismatic joint', 'le <strong>décalage</strong> le long de l\'axe de la liaison : la variable d\'une liaison prismatique']]
    ]),
    P('The meaning of the four numbers is the same as in standard DH: a twist, a distance, a joint angle, an offset. What changes is <strong>the order</strong> and <strong>the indices</strong>: the twist and the distance of row <i>j</i> belong to the link <em>before</em> joint <i>j</i>.',
      'Le sens des quatre nombres est le même qu\'en DH standard : une torsion, une distance, un angle de liaison, un décalage. Ce qui change, c\'est <strong>l\'ordre</strong> et <strong>les indices</strong> : la torsion et la distance de la ligne <i>j</i> appartiennent au segment <em>avant</em> la liaison <i>j</i>.'),
    H4('7.3 The matrix of one row', '7.3 La matrice d\'une ligne'),
    EQ(`<sup>j−1</sup><i>T</i><sub>j</sub> = Rot(<i>x</i>, ${I('α', 'j−1')}) · Trans(<i>x</i>, ${I('a', 'j−1')}) · Rot(<i>z</i>, ${I('θ', 'j')}) · Trans(<i>z</i>, ${I('d', 'j')})`),
    EQ(`<sup>j−1</sup><i>T</i><sub>j</sub> = ${MX(4, ['cθ', '−sθ', '0', '<i>a</i>', 'sθ cα', 'cθ cα', '−sα', '−<i>d</i> sα', 'sθ sα', 'cθ sα', 'cα', '<i>d</i> cα', '0', '0', '0', '1'])}`),
    P(`When the axes are parallel (α = 0) it is very simple: ${MX(4, ['cθ', '−sθ', '0', '<i>a</i>', 'sθ', 'cθ', '0', '0', '0', '0', '1', '<i>d</i>', '0', '0', '0', '1'])}: “move forward by <i>a</i>, then turn by <i>θ</i>”.`,
      `Quand les axes sont parallèles (α = 0), elle est très simple : ${MX(4, ['cθ', '−sθ', '0', '<i>a</i>', 'sθ', 'cθ', '0', '0', '0', '0', '1', '<i>d</i>', '0', '0', '0', '1'])} : « avancer de <i>a</i>, puis tourner de <i>θ</i> ».`),
    H4('7.4 Example 1: the 2-axis arm', '7.4 Exemple 1 : le bras à 2 axes'),
    armFig([[60, 172, 30, sub('x', '1')], [172.6, 107, 70, sub('x', '2')], [206.8, 13, 70, sub('x', 'T')]]),
    P('Frame 1 is now <strong>on joint 1</strong> (at the base, it turns with link 1) and frame 2 <strong>on joint 2</strong>. No frame is on the tool yet: we add one last <strong>fixed row</strong> (no variable) to reach it.',
      'Le repère 1 est maintenant <strong>sur la liaison 1</strong> (à la base, il tourne avec le segment 1) et le repère 2 <strong>sur la liaison 2</strong>. Aucun repère n\'est encore sur l\'outil : on ajoute une dernière <strong>ligne fixe</strong> (sans variable) pour l\'atteindre.'),
    TABLE(['<i>j</i>', I('α', 'j−1'), I('a', 'j−1'), I('θ', 'j'), I('d', 'j'), ['Why', 'Pourquoi']], [
      ['1', '0', '0', I('θ', '1'), '0', ['joint 1 is at the origin', 'la liaison 1 est à l\'origine']],
      ['2', '0', I('L', '1'), I('θ', '2'), '0', ['joint 2 is at the end of link 1', 'la liaison 2 est au bout du segment 1']],
      [['tool', 'outil'], '0', I('L', '2'), '0', '0', ['the tool is at the end of link 2 (fixed)', 'l\'outil est au bout du segment 2 (fixe)']]
    ]),
    P(`With the same numbers (${I('L', '1')} = 0.5, ${I('L', '2')} = 0.4, 30° and 45°) the product of the three matrices gives the tool at <strong>(0.537, 0.636)</strong>: the same point as the standard table.`,
      `Avec les mêmes nombres (${I('L', '1')} = 0,5, ${I('L', '2')} = 0,4, 30° et 45°), le produit des trois matrices donne l'outil en <strong>(0,537 ; 0,636)</strong> : le même point que le tableau standard.`),
    H4('7.5 Example 2: the 3-axis arm', '7.5 Exemple 2 : le bras à 3 axes'),
    TABLE(['<i>j</i>', I('α', 'j−1'), I('a', 'j−1'), I('θ', 'j'), I('d', 'j'), ['Why', 'Pourquoi']], [
      ['1', '0', '0', I('θ', '1'), n('0.40'), ['joint 1 is vertical; frame 1 is placed at the height of the shoulder', 'la liaison 1 est verticale ; le repère 1 est placé à la hauteur de l\'épaule']],
      ['2', '90°', '0', I('θ', '2'), '0', ['axis 2 is perpendicular to axis 1 and crosses it', 'l\'axe 2 est perpendiculaire à l\'axe 1 et le coupe']],
      ['3', '0', n('0.45'), I('θ', '3'), '0', ['axis 3 is parallel to axis 2, 0.45 m further', 'l\'axe 3 est parallèle à l\'axe 2, 0,45 m plus loin']],
      [['tool', 'outil'], '0', n('0.38'), '0', '0', ['the tool, 0.38 m after the elbow (fixed)', 'l\'outil, 0,38 m après le coude (fixe)']]
    ]),
    P('With 25°, 70° and −80° the product gives <strong>(0.479, 0.223, 0.757) m</strong>: again the same tool position as lesson 6. Compare the two tables: the numbers 0.40, 90°, 0.45, 0.38 are all there, but the 90° and the lengths have moved <strong>one row down</strong>.',
      'Avec 25°, 70° et −80°, le produit donne <strong>(0,479 ; 0,223 ; 0,757) m</strong> : de nouveau la même position d\'outil qu\'à la leçon 6. Comparez les deux tableaux : les nombres 0,40, 90°, 0,45, 0,38 sont tous là, mais le 90° et les longueurs sont descendus <strong>d\'une ligne</strong>.'),
    BOX('warn', ['Two notations for the same DHM', 'Deux notations pour le même DHM'],
      P(`Books do not use the same letters. This lesson and the robot pages write the row (${I('α', 'j−1')}, ${I('a', 'j−1')}, ${I('θ', 'j')}, ${I('d', 'j')}), like J. Craig. Khalil and Kleinfinger, and the course “Robot modelling” of this site, write (${I('α', 'j')}, ${I('d', 'j')}, ${I('θ', 'j')}, ${I('r', 'j')}): their <strong>${I('d', 'j')} is our distance ${I('a', 'j−1')}</strong>, and their <strong>${I('r', 'j')} is our offset ${I('d', 'j')}</strong>. The frames and the matrices are identical: only the letters change.`,
        `Les livres n'utilisent pas les mêmes lettres. Cette leçon et les pages des robots écrivent la ligne (${I('α', 'j−1')}, ${I('a', 'j−1')}, ${I('θ', 'j')}, ${I('d', 'j')}), comme J. Craig. Khalil et Kleinfinger, et le cours « Modélisation d'un robot » de ce site, écrivent (${I('α', 'j')}, ${I('d', 'j')}, ${I('θ', 'j')}, ${I('r', 'j')}) : leur <strong>${I('d', 'j')} est notre distance ${I('a', 'j−1')}</strong>, et leur <strong>${I('r', 'j')} est notre décalage ${I('d', 'j')}</strong>. Les repères et les matrices sont identiques : seules les lettres changent.`))
  ],
  terms: [['modified DH (DHM)', 'DH modifié (DHM)'], ['Khalil–Kleinfinger', 'Khalil–Kleinfinger'], ['fixed row', 'ligne fixe'], ['twist α', 'torsion α'], ['offset d', 'décalage d']],
  quiz: [
    ['In modified DH, on which axis is z of frame j?', 'En DH modifié, sur quel axe est le z du repère j ?', 'On the axis of joint j itself.', 'Sur l\'axe de la liaison j elle-même.'],
    ['In which order are the four moves of a DHM row applied?', 'Dans quel ordre s\'appliquent les quatre mouvements d\'une ligne DHM ?', 'α (turn around x), a (slide along x), θ (turn around z), d (slide along z).', 'α (tourner autour de x), a (glisser selon x), θ (tourner autour de z), d (glisser selon z).'],
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
