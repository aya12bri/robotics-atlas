// The maths of robotics, lesson 11: describing an orientation in 3D — Euler angles, axis-angle, quaternions.
import { tx, svgtx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, MX, lesson } from '../lib.mjs';
import { AXM } from './mk-b.mjs';
const PRE = 'mk-';

export function partE() {
  return [
// ------------------------------------------------------------------------------------------------ 11
lesson(PRE, 11, {
  title: ['Orientations in 3D: Euler angles, axis-angle and quaternions', 'Les orientations en 3D : angles d\'Euler, axe-angle et quaternions'],
  time: 16,
  goal: ['the four ways to describe how an object is turned in space, why robots and ROS 2 use quaternions, and how to read and write one.', 'les quatre façons de décrire comment un objet est tourné dans l\'espace, pourquoi les robots et ROS 2 utilisent les quaternions, et comment en lire et en écrire un.'],
  body: [
    H4('11.1 Four ways to say “how it is turned”', '11.1 Quatre façons de dire « comment c\'est tourné »'),
    P('A position needs 3 numbers. An orientation in space also has <strong>3 degrees of freedom</strong>, but there are several ways to write it, each with its strengths:',
      'Une position demande 3 nombres. Une orientation dans l\'espace a aussi <strong>3 degrés de liberté</strong>, mais il y a plusieurs façons de l\'écrire, chacune avec ses atouts :'),
    TABLE([['Representation', 'Représentation'], ['Numbers', 'Nombres'], ['Strength', 'Atout'], ['Weakness', 'Faiblesse']], [
      [['<strong>Rotation matrix</strong> (lesson 4)', '<strong>Matrice de rotation</strong> (leçon 4)'], '9', ['direct to compute with: chain by multiplying', 'directe pour calculer : on enchaîne en multipliant'], ['9 numbers for 3 degrees of freedom; small errors make it slowly stop being a rotation', '9 nombres pour 3 degrés de liberté ; les petites erreurs font qu\'elle cesse peu à peu d\'être une rotation']],
      [['<strong>Euler / roll-pitch-yaw angles</strong>', '<strong>Angles d\'Euler / roulis-tangage-lacet</strong>'], '3', ['easy for a human to read', 'faciles à lire pour un humain'], ['gimbal lock; 12 different conventions; bad for interpolation', 'blocage de cardan ; 12 conventions différentes ; mauvais pour interpoler']],
      [['<strong>Axis-angle</strong>', '<strong>Axe-angle</strong>'], ['3 (or 4)', '3 (ou 4)'], ['easy to picture: one axis, one angle', 'facile à imaginer : un axe, un angle'], ['composing two rotations is not simple', 'composer deux rotations n\'est pas simple']],
      [['<strong>Quaternion</strong>', '<strong>Quaternion</strong>'], '4', ['no gimbal lock, compact, smooth interpolation, cheap to fix', 'pas de blocage de cardan, compact, interpolation douce, facile à corriger'], ['not intuitive: you read it through formulas', 'pas intuitif : on le lit au travers de formules']]
    ]),
    H4('11.2 Roll, pitch, yaw — and their trap', '11.2 Roulis, tangage, lacet — et leur piège'),
    P('For a drone, a car or a gripper we often say: <strong>yaw</strong> <i>ψ</i> (turn around the vertical z), <strong>pitch</strong> <i>θ</i> (nose up or down, around y), <strong>roll</strong> <i>φ</i> (tilt the wings, around x). In the usual convention:',
      'Pour un drone, une voiture ou une pince, on dit souvent : <strong>lacet</strong> <i>ψ</i> (tourner autour de la verticale z), <strong>tangage</strong> <i>θ</i> (nez vers le haut ou le bas, autour de y), <strong>roulis</strong> <i>φ</i> (pencher les ailes, autour de x). Dans la convention usuelle :'),
    EQ('<i>R</i> = <i>R</i><sub>z</sub>(<i>ψ</i>) <i>R</i><sub>y</sub>(<i>θ</i>) <i>R</i><sub>x</sub>(<i>φ</i>)'),
    BOX('warn', ['Gimbal lock', 'Le blocage de cardan'],
      P('When the pitch reaches ±90° (nose straight up), the yaw axis and the roll axis line up: two of the three angles do the same thing, and one degree of freedom is lost <em>in the description</em> (not in the object). Near this pose, a small motion of the object can make the angles jump. The course “Singularities and the Jacobian” (lesson 6) shows it in 3D.',
        'Quand le tangage atteint ±90° (nez droit vers le haut), l\'axe de lacet et l\'axe de roulis s\'alignent : deux des trois angles font la même chose, et un degré de liberté est perdu <em>dans la description</em> (pas dans l\'objet). Près de cette pose, un petit mouvement de l\'objet peut faire sauter les angles. Le cours « Singularités et jacobienne » (leçon 6) le montre en 3D.')),
    H4('11.3 Axis-angle: one axis, one angle', '11.3 Axe-angle : un axe, un angle'),
    P('A theorem of Euler says: <strong>any orientation can be reached by one single rotation</strong>, by an angle <i>θ</i>, around one well-chosen axis <strong>u</strong> (a unit vector). Hold a book, turn it any way you like: there is always one axis that would have done it in one move.',
      'Un théorème d\'Euler dit : <strong>toute orientation peut être atteinte par une seule rotation</strong>, d\'un angle <i>θ</i>, autour d\'un axe <strong>u</strong> bien choisi (un vecteur unitaire). Prenez un livre, tournez-le comme vous voulez : il existe toujours un axe qui l\'aurait fait d\'un seul geste.'),
    FIG('0 0 340 200', `${AXM}
      <line x1="120" y1="185" x2="230" y2="25" stroke="#5aa9ff" stroke-width="3" marker-end="url(#mkax)"/><text x="238" y="24" fill="#5aa9ff">${svgtx('axis u', 'axe u')}</text>
      <ellipse cx="170" cy="112" rx="62" ry="22" transform="rotate(-55 170 112)" fill="none" stroke="#ff9f43" stroke-width="2.5" stroke-dasharray="190 400"/>
      <line x1="153" y1="137" x2="146" y2="149" stroke="#ff9f43" stroke-width="2.5" marker-end="url(#mkax)"/><text x="105" y="140" class="c-x">θ</text>
      <circle class="jt" cx="170" cy="112" r="4"/>
      <text x="250" y="150" text-anchor="middle">${svgtx('rotation vector', 'vecteur rotation')}</text><text x="250" y="168" text-anchor="middle" class="c-l">θ u</text>`),
    P('Packed as one vector <i>θ</i> <strong>u</strong> it is called the <strong>rotation vector</strong>: its direction is the axis, its length the angle. The angle can be read directly on a rotation matrix:',
      'Rangé en un seul vecteur <i>θ</i> <strong>u</strong>, on l\'appelle le <strong>vecteur rotation</strong> : sa direction est l\'axe, sa longueur l\'angle. L\'angle se lit directement sur une matrice de rotation :'),
    EQ('cos <i>θ</i> = ( trace <i>R</i> − 1 ) / 2 &emsp;&emsp; (trace = <i>R</i><sub>11</sub> + <i>R</i><sub>22</sub> + <i>R</i><sub>33</sub>)'),
    P(`Check: <i>R</i><sub>z</sub>(90°) = ${MX(3, ['0', '−1', '0', '1', '0', '0', '0', '0', '1'])} has a trace of 0 + 0 + 1 = 1, so cos <i>θ</i> = 0 and <i>θ</i> = 90°.`,
      `Vérification : <i>R</i><sub>z</sub>(90°) = ${MX(3, ['0', '−1', '0', '1', '0', '0', '0', '0', '1'])} a une trace de 0 + 0 + 1 = 1, donc cos <i>θ</i> = 0 et <i>θ</i> = 90°.`),
    H4('11.4 The quaternion: axis-angle in a smart form', '11.4 Le quaternion : l\'axe-angle sous une forme astucieuse'),
    P('A unit quaternion is four numbers built from the axis and the angle, <strong>using half the angle</strong>:', 'Un quaternion unitaire est fait de quatre nombres construits à partir de l\'axe et de l\'angle, <strong>avec la moitié de l\'angle</strong> :'),
    BOX('keep', ['The quaternion of a rotation by θ around u', 'Le quaternion d\'une rotation de θ autour de u'],
      EQ('<i>q</i> = ( <i>w</i>, <i>x</i>, <i>y</i>, <i>z</i> ) = ( cos <i>θ</i>/2,  <i>u</i><sub>x</sub> sin <i>θ</i>/2,  <i>u</i><sub>y</sub> sin <i>θ</i>/2,  <i>u</i><sub>z</sub> sin <i>θ</i>/2 )'),
      P('Its length is always 1: <i>w</i>² + <i>x</i>² + <i>y</i>² + <i>z</i>² = 1.', 'Sa longueur vaut toujours 1 : <i>w</i>² + <i>x</i>² + <i>y</i>² + <i>z</i>² = 1.')),
    TABLE([['Rotation', 'Rotation'], ['Quaternion (w, x, y, z)', 'Quaternion (w, x, y, z)']], [
      [['none', 'aucune'], '(1, 0, 0, 0)'],
      [['90° around z', '90° autour de z'], ['(0.707, 0, 0, 0.707)', '(0,707 ; 0 ; 0 ; 0,707)']],
      [['120° around x', '120° autour de x'], ['(0.5, 0.866, 0, 0)', '(0,5 ; 0,866 ; 0 ; 0)']],
      [['180° around y', '180° autour de y'], '(0, 0, 1, 0)']
    ]),
    P('Three rules are enough to use them:', 'Trois règles suffisent pour s\'en servir :'),
    UL([
      ['<strong>Chain two rotations</strong>: multiply the quaternions, <i>q</i> = <i>q</i><sub>1</sub> <i>q</i><sub>2</sub> (as for matrices, the order matters). The product of (<i>w</i><sub>1</sub>, <strong>v</strong><sub>1</sub>) and (<i>w</i><sub>2</sub>, <strong>v</strong><sub>2</sub>) is (<i>w</i><sub>1</sub><i>w</i><sub>2</sub> − <strong>v</strong><sub>1</sub>·<strong>v</strong><sub>2</sub>,  <i>w</i><sub>1</sub><strong>v</strong><sub>2</sub> + <i>w</i><sub>2</sub><strong>v</strong><sub>1</sub> + <strong>v</strong><sub>1</sub> × <strong>v</strong><sub>2</sub>), with the dot and cross products of lesson 2.', '<strong>Enchaîner deux rotations</strong> : on multiplie les quaternions, <i>q</i> = <i>q</i><sub>1</sub> <i>q</i><sub>2</sub> (comme pour les matrices, l\'ordre compte). Le produit de (<i>w</i><sub>1</sub>, <strong>v</strong><sub>1</sub>) et (<i>w</i><sub>2</sub>, <strong>v</strong><sub>2</sub>) vaut (<i>w</i><sub>1</sub><i>w</i><sub>2</sub> − <strong>v</strong><sub>1</sub>·<strong>v</strong><sub>2</sub>,  <i>w</i><sub>1</sub><strong>v</strong><sub>2</sub> + <i>w</i><sub>2</sub><strong>v</strong><sub>1</sub> + <strong>v</strong><sub>1</sub> × <strong>v</strong><sub>2</sub>), avec les produits scalaire et vectoriel de la leçon 2.'],
      ['<strong>Undo a rotation</strong>: change the sign of <i>x</i>, <i>y</i>, <i>z</i> (the <strong>conjugate</strong> <i>q</i>* = (<i>w</i>, −<i>x</i>, −<i>y</i>, −<i>z</i>)).', '<strong>Défaire une rotation</strong> : on change le signe de <i>x</i>, <i>y</i>, <i>z</i> (le <strong>conjugué</strong> <i>q</i>* = (<i>w</i>, −<i>x</i>, −<i>y</i>, −<i>z</i>)).'],
      ['<strong>Turn a vector</strong> <strong>v</strong>: write it as (0, <strong>v</strong>) and compute <i>q</i> (0, <strong>v</strong>) <i>q</i>*. In practice a library does it, or converts <i>q</i> to a rotation matrix.', '<strong>Tourner un vecteur</strong> <strong>v</strong> : on l\'écrit (0, <strong>v</strong>) et on calcule <i>q</i> (0, <strong>v</strong>) <i>q</i>*. En pratique, une bibliothèque le fait, ou convertit <i>q</i> en matrice de rotation.']
    ]),
    BOX('example', ['Worked example: 45° then 45° around z', 'Exemple résolu : 45° puis 45° autour de z'],
      P('<i>q</i><sub>45</sub> = (cos 22.5°, 0, 0, sin 22.5°) = (0.924, 0, 0, 0.383). Product with itself: <i>w</i> = 0.924² − 0.383² = <strong>0.707</strong>, <i>z</i> = 2 × 0.924 × 0.383 = <strong>0.707</strong>. We get (0.707, 0, 0, 0.707): the quaternion of 90° around z, as expected.',
        '<i>q</i><sub>45</sub> = (cos 22,5° ; 0 ; 0 ; sin 22,5°) = (0,924 ; 0 ; 0 ; 0,383). Produit avec lui-même : <i>w</i> = 0,924² − 0,383² = <strong>0,707</strong>, <i>z</i> = 2 × 0,924 × 0,383 = <strong>0,707</strong>. On obtient (0,707 ; 0 ; 0 ; 0,707) : le quaternion de 90° autour de z, comme attendu.')),
    BOX('idea', ['q and −q are the same orientation', 'q et −q sont la même orientation'],
      P('Turning by <i>θ</i> around <strong>u</strong> or by 360° − <i>θ</i> around −<strong>u</strong> ends in the same place, and the formula gives <i>q</i> and −<i>q</i>. Do not be surprised if a program prints (−0.707, 0, 0, −0.707) for 90° around z.',
        'Tourner de <i>θ</i> autour de <strong>u</strong> ou de 360° − <i>θ</i> autour de −<strong>u</strong> mène au même endroit, et la formule donne <i>q</i> et −<i>q</i>. Ne soyez pas surpris si un programme affiche (−0,707 ; 0 ; 0 ; −0,707) pour 90° autour de z.')),
    H4('11.5 Quaternions in a robot program', '11.5 Les quaternions dans un programme de robot'),
    P('A mobile robot on a flat floor only turns around z by its heading <i>ψ</i> (yaw). Then the quaternion is simple, and the heading comes back with atan2:', 'Un robot mobile sur un sol plat ne tourne qu\'autour de z, de son cap <i>ψ</i> (lacet). Le quaternion est alors simple, et le cap se retrouve avec atan2 :'),
    EQ('<i>q</i> = ( cos <i>ψ</i>/2, 0, 0, sin <i>ψ</i>/2 ) &emsp;&emsp; <i>ψ</i> = 2 atan2(<i>z</i>, <i>w</i>)'),
    P('For a general orientation: <i>ψ</i> = atan2( 2(<i>w</i><i>z</i> + <i>x</i><i>y</i>), 1 − 2(<i>y</i>² + <i>z</i>²) ).', 'Pour une orientation quelconque : <i>ψ</i> = atan2( 2(<i>w</i><i>z</i> + <i>x</i><i>y</i>), 1 − 2(<i>y</i>² + <i>z</i>²) ).'),
    BOX('warn', ['The order of the four numbers differs between libraries', 'L\'ordre des quatre nombres diffère selon les bibliothèques'],
      UL([
        ['ROS 2 messages (<code>geometry_msgs/Quaternion</code>), tf2 and SciPy write <strong>(x, y, z, w)</strong>: <i>w</i> last.', 'Les messages ROS 2 (<code>geometry_msgs/Quaternion</code>), tf2 et SciPy écrivent <strong>(x, y, z, w)</strong> : <i>w</i> en dernier.'],
        ['Eigen (C++), many books and this lesson write <strong>(w, x, y, z)</strong>: <i>w</i> first.', 'Eigen (C++), beaucoup de livres et cette leçon écrivent <strong>(w, x, y, z)</strong> : <i>w</i> en premier.'],
        ['A heading of 90° is (0, 0, 0.707, 0.707) in a ROS message. Mixing the two orders gives a robot that faces the wrong way, with no error message.', 'Un cap de 90° s\'écrit (0 ; 0 ; 0,707 ; 0,707) dans un message ROS. Mélanger les deux ordres donne un robot tourné dans le mauvais sens, sans message d\'erreur.']
      ])),
    H4('11.6 Why robots prefer quaternions', '11.6 Pourquoi les robots préfèrent les quaternions'),
    OL([
      ['<strong>No gimbal lock</strong>: every orientation has a smooth description.', '<strong>Pas de blocage de cardan</strong> : chaque orientation a une description régulière.'],
      ['<strong>Compact and cheap</strong>: 4 numbers instead of 9; after many products, dividing by the length is enough to correct the rounding errors.', '<strong>Compact et peu coûteux</strong> : 4 nombres au lieu de 9 ; après beaucoup de produits, diviser par la longueur suffit à corriger les erreurs d\'arrondi.'],
      ['<strong>Smooth interpolation</strong>: the <strong>slerp</strong> goes from one orientation to another at constant speed, along the shortest path. Halfway between 0° and 90° around z it gives exactly 45°. This is how a robot tool turns smoothly during a linear move, and how an IMU filter tracks the attitude of a drone.', '<strong>Interpolation douce</strong> : le <strong>slerp</strong> va d\'une orientation à une autre à vitesse constante, par le plus court chemin. À mi-chemin entre 0° et 90° autour de z, il donne exactement 45°. C\'est ainsi qu\'un outil de robot tourne en douceur pendant un mouvement linéaire, et qu\'un filtre de centrale inertielle suit l\'attitude d\'un drone.']
    ]),
    BOX('keep', ['In practice', 'En pratique'],
      P('Store and compute orientations as <strong>quaternions</strong>, show them to humans as <strong>roll, pitch, yaw</strong>, and convert to a <strong>rotation matrix</strong> when you need to turn many points. Let a library do the conversions, and check its order (w first or last).',
        'Stockez et calculez les orientations en <strong>quaternions</strong>, montrez-les aux humains en <strong>roulis, tangage, lacet</strong>, et convertissez en <strong>matrice de rotation</strong> quand vous devez tourner beaucoup de points. Laissez une bibliothèque faire les conversions, et vérifiez son ordre (w en premier ou en dernier).'))
  ],
  terms: [['roll / pitch / yaw', 'roulis / tangage / lacet'], ['gimbal lock', 'blocage de cardan'], ['axis-angle', 'axe-angle'], ['rotation vector', 'vecteur rotation'], ['quaternion', 'quaternion'], ['conjugate', 'conjugué'], ['slerp', 'slerp']],
  quiz: [
    ['How many numbers does a quaternion have, and how many degrees of freedom does an orientation have?', 'Combien de nombres a un quaternion, et combien de degrés de liberté a une orientation ?', '4 numbers for 3 degrees of freedom: the length of the quaternion is fixed to 1.', '4 nombres pour 3 degrés de liberté : la longueur du quaternion est fixée à 1.'],
    ['Why is the angle divided by 2 in a quaternion?', 'Pourquoi l\'angle est-il divisé par 2 dans un quaternion ?', 'Because a vector is turned by q v q*: q appears twice, so each one carries half of the rotation.', 'Parce qu\'un vecteur est tourné par q v q* : q apparaît deux fois, chacun porte donc la moitié de la rotation.'],
    ['A ROS message gives the orientation (0, 0, 0.707, 0.707). Which number is w?', 'Un message ROS donne l\'orientation (0, 0, 0,707, 0,707). Quel nombre est w ?', 'The last one: ROS writes (x, y, z, w). This is a rotation of 90° around z.', 'Le dernier : ROS écrit (x, y, z, w). C\'est une rotation de 90° autour de z.']
  ],
  link: ['learn-ros.html', 'Use quaternions with tf2 in the ROS 2 course →', 'Utiliser les quaternions avec tf2 dans le cours ROS 2 →']
})
  ];
}
