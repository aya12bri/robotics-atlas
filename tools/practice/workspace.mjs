// "Which shape is the workspace?": a block added to the workspace lessons (Foundations 9, Robot modelling 7)
// by tools/add-practice.mjs, before "The essentials". Full version for the modelling course, short one for the basics.
import { tx, P, H4, UL, EQ, TABLE } from '../lib.mjs';
import { T, LINE, COL } from './fig.mjs';

const D = Math.PI / 180;
// four small panels: ring (L1 ≠ L2), full disc (L1 = L2), ring cut by joint limits (sampled), gantry box
function figure() {
  const W = 720, H = 270, R = 72, cy = 128;
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="#1b1f25" rx="10"/>`;
  const fill = '#5aa9ff', stroke = COL.b;
  const base = (cx) => `<circle cx="${cx}" cy="${cy}" r="4" fill="${COL.o}"/>`;
  const label = (cx, en, fr, sub) => T(cx, 236, [en, fr], { a: 'middle', fs: 13, b: true }) + T(cx, 254, sub, { a: 'middle', fs: 11, c: COL.axis });
  // (a) L1 = 0.6, L2 = 0.4 → ring 0.2 … 1
  let cx = 90;
  s += `<path d="M${cx - R},${cy} a${R},${R} 0 1,0 ${2 * R},0 a${R},${R} 0 1,0 ${-2 * R},0 M${cx - 0.2 * R},${cy} a${0.2 * R},${0.2 * R} 0 1,1 ${0.4 * R},0 a${0.2 * R},${0.2 * R} 0 1,1 ${-0.4 * R},0" fill="${fill}" fill-opacity="0.28" fill-rule="evenodd" stroke="${stroke}" stroke-width="1.5"/>` + base(cx);
  s += label(cx, 'Ring', 'Anneau', ['L₁ = 0.6, L₂ = 0.4', 'L₁ = 0,6, L₂ = 0,4']);
  // (b) L1 = L2 = 0.5 → full disc
  cx = 270;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${fill}" fill-opacity="0.28" stroke="${stroke}" stroke-width="1.5"/>` + base(cx);
  s += label(cx, 'Full disc', 'Disque plein', ['L₁ = L₂ = 0.5', 'L₁ = L₂ = 0,5']);
  // (c) L1 = 0.6, L2 = 0.4 with limits θ1 ∈ [−90°, 90°], θ2 ∈ [−120°, 120°]: sampled points
  cx = 450;
  for (let a = -90; a <= 90; a += 3) for (let b = -120; b <= 120; b += 4) {
    const x = 0.6 * Math.cos(a * D) + 0.4 * Math.cos((a + b) * D), y = 0.6 * Math.sin(a * D) + 0.4 * Math.sin((a + b) * D);
    s += `<circle cx="${(cx + x * R).toFixed(1)}" cy="${(cy - y * R).toFixed(1)}" r="1.3" fill="${fill}" fill-opacity="0.75"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${COL.axis}" stroke-width="1" stroke-dasharray="4 4"/>` + base(cx);
  s += label(cx, 'With joint limits', 'Avec des butées', ['θ₁ ±90°, θ₂ ±120°', 'θ₁ ±90°, θ₂ ±120°']);
  // (d) gantry: a box (top view)
  cx = 630;
  s += `<rect x="${cx - 62}" y="${cy - 45}" width="124" height="90" rx="4" fill="${fill}" fill-opacity="0.28" stroke="${stroke}" stroke-width="1.5"/>`;
  s += LINE(cx - 62, cy + 58, cx + 62, cy + 58, COL.axis, 1.5) + T(cx, cy + 74, ['course x', 'course x'], { a: 'middle', fs: 11, c: COL.axis });
  s += label(cx, 'Gantry (P-P-P)', 'Portique (P-P-P)', ['a box', 'une boîte']);
  return `<figure class="figure"><svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-hidden="true">${s}</svg><figcaption>${tx('Top view of four workspaces. The orange dot is the base. The dashed circle shows the ring the same arm would have without joint limits.', 'Vue de dessus de quatre espaces de travail. Le point orange est la base. Le cercle pointillé montre l\'anneau qu\'aurait le même bras sans butées.')}</figcaption></figure>`;
}

const shapes = (short) => TABLE([['Robot', 'Robot'], ['Shape of the workspace', 'Forme de l\'espace de travail']], [
  [['1 revolute joint', '1 liaison rotoïde'], ['a circle (only its edge, not the disc)', 'un cercle (le bord seulement, pas le disque)']],
  [['Planar 2-link arm', 'Bras plan à 2 corps'], ['a ring between |L₁ − L₂| and L₁ + L₂ (a full disc if L₁ = L₂)', 'un anneau entre |L₁ − L₂| et L₁ + L₂ (un disque plein si L₁ = L₂)']],
  [['Gantry (P-P-P)', 'Portique (P-P-P)'], ['a box: each axis has its stroke', 'une boîte : chaque axe a sa course']],
  [['SCARA', 'SCARA'], ['a ring extruded in height (a thick tube), often cut by the joint limits', 'un anneau étiré en hauteur (un tube épais), souvent coupé par les butées']]
].concat(short ? [] : [
  [['6-axis robot', 'Robot 6 axes'], ['an almost spherical volume, with a hole near the base and zones removed by the joint limits', 'un volume presque sphérique, avec un trou près de la base et des zones retirées par les butées']],
  [['Delta robot', 'Robot Delta'], ['a dome or rounded cylinder under the base', 'un dôme ou un cylindre arrondi sous la base']],
  [['Mobile robot', 'Robot mobile'], ['the whole floor in theory; the room and its obstacles in practice', 'tout le sol en théorie ; la pièce et ses obstacles en pratique']]
]));

export function workspaceBlock(short) {
  return [
    H4('Which shape is the workspace?', 'Quelle forme a l\'espace de travail ?'),
    P('There is no single formula, and the workspace is not always a disc: its shape depends on the geometry of the robot (lengths, kinds of joints) and on its joint limits. For the planar 2-link arm, there is a simple relation:',
      'Il n\'y a pas une formule unique, et l\'espace de travail n\'est pas toujours un disque : sa forme dépend de la géométrie du robot (longueurs, types de liaisons) et de ses butées. Pour le bras plan à 2 corps, il existe une relation simple :'),
    EQ('| <i>L</i><sub>1</sub> − <i>L</i><sub>2</sub> | ≤ √( <i>x</i>² + <i>y</i>² ) ≤ <i>L</i><sub>1</sub> + <i>L</i><sub>2</sub>'),
    UL([
      ['Without joint limits it is a <strong>ring</strong> (a disc with a hole in the middle).', 'Sans butées, c\'est un <strong>anneau</strong> (un disque troué au centre).'],
      ['It is a <strong>full disc only if L₁ = L₂</strong>: the inner radius is then 0.', 'Ce n\'est un <strong>disque plein que si L₁ = L₂</strong> : le rayon intérieur vaut alors 0.'],
      ['With joint limits it is only <strong>a part of the ring</strong>, bounded by arcs of circles.', 'Avec des butées, ce n\'est plus qu\'<strong>une partie de l\'anneau</strong>, bordée d\'arcs de cercle.']
    ]),
    figure(),
    shapes(short)
  ].concat(short ? [] : [
    P('<strong>Reachable or dexterous?</strong> The <em>reachable</em> workspace holds the points the tool can touch with at least one orientation; the <em>dexterous</em> workspace holds the points it can reach with <em>every</em> orientation. The dexterous workspace is much smaller (for the planar 2-link arm it is almost empty).',
      '<strong>Atteignable ou dextre ?</strong> L\'espace <em>atteignable</em> contient les points que l\'outil peut toucher dans au moins une orientation ; l\'espace <em>dextre</em> contient les points qu\'il peut atteindre dans <em>toutes</em> les orientations. L\'espace dextre est bien plus petit (pour le bras plan à 2 corps il est presque vide).'),
    P('For a real industrial robot there is no simple formula: the workspace is computed by sweeping the joint angles between their limits (as in the third drawing), and the manufacturer draws it in the data sheet, usually as a side view and a top view with the reach.',
      'Pour un vrai robot industriel, il n\'y a pas de formule simple : on calcule l\'espace de travail en balayant les angles entre leurs butées (comme dans le troisième dessin), et le fabricant le dessine dans sa fiche technique, en général en vue de côté et de dessus avec la portée.')
  ]).join('\n          ');
}
