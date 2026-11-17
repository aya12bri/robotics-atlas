// "Who makes the robots?": the main manufacturers, added to "Robots in the real world", lesson 1 (tools/add-practice.mjs).
import { P, H4, UL, TABLE } from '../lib.mjs';

export function makersBlock() {
  return [
    H4('Who makes the robots? KUKA, ABB, FANUC and the others', 'Qui fabrique les robots ? KUKA, ABB, FANUC et les autres'),
    P('KUKA, ABB or FANUC are <strong>manufacturers</strong> (brands), not kinds of robots, like Renault or Toyota for cars. Each of them sells mostly <strong>6-axis arms</strong>, and often SCARA, Delta robots and cobots too. Everything you learn on this site (DH, MGD, MGI, Jacobian) applies to all of them: only the shape, the dimensions and the programming language change.',
      'KUKA, ABB ou FANUC sont des <strong>fabricants</strong> (des marques), pas des types de robots, comme Renault ou Toyota pour les voitures. Chacun vend surtout des <strong>bras 6 axes</strong>, et souvent aussi des SCARA, des robots Delta et des cobots. Tout ce que vous apprenez sur ce site (DH, MGD, MGI, jacobienne) s\'applique à tous : seuls la forme, les dimensions et le langage de programmation changent.'),
    TABLE([['Manufacturer', 'Fabricant'], ['Country', 'Pays'], ['Known for', 'Connu pour'], ['Language', 'Langage']], [
      ['<strong>FANUC</strong>', ['Japan', 'Japon'], ['the largest number of robots installed in the world; yellow robots', 'le plus grand nombre de robots installés dans le monde ; robots jaunes'], 'TP, KAREL'],
      ['<strong>ABB</strong>', ['Switzerland / Sweden', 'Suisse / Suède'], ['arms and painting robots, the FlexPicker Delta, the YuMi cobot', 'bras et robots de peinture, le Delta FlexPicker, le cobot YuMi'], 'RAPID'],
      ['<strong>KUKA</strong>', ['Germany (Midea group)', 'Allemagne (groupe Midea)'], ['orange robots, very present in the car industry', 'robots orange, très présents dans l\'automobile'], 'KRL'],
      ['<strong>Yaskawa (Motoman)</strong>', ['Japan', 'Japon'], ['arc welding robots', 'robots de soudage à l\'arc'], 'INFORM'],
      ['<strong>Kawasaki, Nachi, Denso, Mitsubishi</strong>', ['Japan', 'Japon'], ['arms and SCARA', 'bras et SCARA'], ['their own', 'le leur']],
      ['<strong>Epson</strong>', ['Japan', 'Japon'], ['a world leader of SCARA robots', 'un leader mondial des robots SCARA'], 'SPEL+'],
      ['<strong>Stäubli</strong>', ['France / Switzerland', 'France / Suisse'], ['precise and fast arms (pharmacy, electronics, clean rooms)', 'bras précis et rapides (pharmacie, électronique, salles blanches)'], 'VAL3'],
      ['<strong>Comau</strong>', ['Italy', 'Italie'], ['car industry', 'automobile'], 'PDL2'],
      ['<strong>Universal Robots</strong>', ['Denmark', 'Danemark'], ['the first widely sold cobots (the UR5 of this site)', 'les premiers cobots largement vendus (le UR5 de ce site)'], 'URScript'],
      ['<strong>Doosan, Techman, Franka</strong>', ['Korea, Taiwan, Germany', 'Corée, Taïwan, Allemagne'], ['cobots', 'cobots'], ['their own', 'le leur']]
    ]),
    UL([
      ['The 6-axis robot of this site looks like a KUKA, an ABB or a FANUC arm; the cobot is a Universal Robots UR5; the Delta looks like the ABB FlexPicker.', 'Le robot 6 axes du site ressemble à un bras KUKA, ABB ou FANUC ; le cobot est un Universal Robots UR5 ; le Delta ressemble à l\'ABB FlexPicker.'],
      ['Each brand has <strong>its own controller and language</strong>: a KUKA program does not run on an ABB. Offline programming software, or ROS 2 in research, helps to work with several brands.', 'Chaque marque a <strong>son propre contrôleur et son langage</strong> : un programme KUKA ne tourne pas sur un ABB. Les logiciels de programmation hors ligne, ou ROS 2 en recherche, aident à travailler avec plusieurs marques.'],
      ['Their <strong>data sheets</strong> always give the payload, the reach, the repeatability and a drawing of the workspace: compare robots with them.', 'Leurs <strong>fiches techniques</strong> donnent toujours la charge utile, la portée, la répétabilité et le dessin de l\'espace de travail : comparez les robots avec elles.']
    ])
  ].join('\n          ');
}
