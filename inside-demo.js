// inside-demo.js — "Inside the robot" on the robot pages: the camera dives from the whole robot into one joint,
// the cover comes off, the parts fly apart (each one clickable, with its real name and role), then the joint is put
// back together and runs, so you can see how it works. Same idea as a board explorer that dives from the board to
// the chip: one step at a time, with a caption for each step.
//
// Usage:  <div class="insdemo" data-robot="articulated"></div>  +  <script type="module" src="inside-demo.js"></script>
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { articulated, arm3, scara, gantry, delta, makeAMR, M, box, cyl, V, ease } from './ops-demo.js';

const FR = (window.RA && RA.lang) === 'fr';
const L = (en, fr) => (FR ? fr : en);

// ---------------------------------------------------------------- materials for the parts
const P = {
  steel: M('#b8c2cc', { roughness: 0.25, metalness: 0.85 }), dark: M('#3a424c', { roughness: 0.45, metalness: 0.6 }), black: M('#1a1d22', { roughness: 0.6 }),
  copper: M('#c8742e', { roughness: 0.35, metalness: 0.8 }), lam: M('#6f7883', { roughness: 0.4, metalness: 0.7 }), magN: M('#d6453d', { roughness: 0.4 }), magS: M('#3d6fd6', { roughness: 0.4 }),
  orange: M('#ff9f43', { roughness: 0.4 }), brass: M('#c9a227', { roughness: 0.3, metalness: 0.8 }), pcb: M('#1f6f43', { roughness: 0.55 }), gold: M('#e2b33c', { roughness: 0.3, metalness: 0.9 }),
  white: M('#eef1f4', { roughness: 0.5 }), friction: M('#7a4a2a', { roughness: 0.9 }), glass: new THREE.MeshStandardMaterial({ color: '#9fd3ff', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55 }),
  rubber: M('#202326', { roughness: 0.9 }), alu: M('#d5dbe1', { roughness: 0.35, metalness: 0.6 }), red: M('#e5484d', { emissive: '#600', emissiveIntensity: 0.6 })
};
const cylA = (r, h, mat, seg = 40, open = false) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg, 1, open).rotateX(Math.PI / 2), mat); m.castShadow = m.receiveShadow = true; return m; };   // axis along z, centred
const boxC = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = m.receiveShadow = true; return m; };
function gear(r, teeth, depth, mat, internal = false) {      // a spur gear (or an internal ring gear) in the xy plane, axis z
  const g = new THREE.Group(), tw = (2 * Math.PI * r) / teeth * 0.5, th = r * 0.16;
  if (internal) { const ring = cylA(r + th * 2.2, depth, mat, 64, true); ring.material = mat.clone(); ring.material.side = THREE.DoubleSide; g.add(ring); }
  else g.add(cylA(r - th * 0.4, depth, mat, 48));
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2, t = boxC(th * 1.6, tw, depth, mat);
    const rr = internal ? r + th * 0.6 : r + th * 0.2; t.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0); t.rotation.z = a; g.add(t);
  }
  return g;
}
function stripes(n = 24, a = '#9aa4ae', b = '#5f6873', vertical = false) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; if (vertical) g.fillRect(i * 8, 0, 8, 64); else g.fillRect(0, i * 8, 64, 8); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, n / 8); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function discTexture() {                                    // encoder disc: fine radial tracks
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = 'rgba(160,210,255,0.35)'; g.fillRect(0, 0, 256, 256); g.translate(128, 128);
  for (const [r0, r1, n] of [[70, 88, 64], [92, 108, 128], [112, 124, 256]]) for (let i = 0; i < n; i++) { if (i % 2) continue; const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2; g.beginPath(); g.arc(0, 0, r1, a0, a1); g.arc(0, 0, r0, a1, a0, true); g.fillStyle = '#1b2430'; g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- the part list (names and roles)
const PART = {
  drv: [L('Servo drive board', 'Carte variateur'), L('The electronics inside the joint. A microcontroller runs the current loop about 20 000 times a second and six power transistors (MOSFETs) switch the three motor phases; the capacitors smooth the supply.', 'L\'électronique dans l\'articulation. Un microcontrôleur calcule la boucle de courant environ 20 000 fois par seconde et six transistors de puissance (MOSFET) commutent les trois phases du moteur ; les condensateurs lissent l\'alimentation.')],
  enc: [L('Absolute encoder', 'Codeur absolu'), L('A disc with fine tracks read by an optical head: it gives the motor angle to 1/131 072 of a turn (17 bits) and still knows it after a power cut.', 'Un disque à pistes fines lu par une tête optique : il donne l\'angle du moteur au 1/131 072 de tour (17 bits) et le connaît encore après une coupure de courant.')],
  brk: [L('Holding brake', 'Frein de maintien'), L('Springs press the friction disc when the power is off, so the arm cannot fall. Current in the coil pulls the plate back: the brake is released while the robot moves.', 'Des ressorts serrent le disque de friction quand le courant est coupé : le bras ne peut pas tomber. Le courant dans la bobine tire la plaque : le frein est relâché pendant que le robot bouge.')],
  sta: [L('Motor stator (windings)', 'Stator du moteur (bobinages)'), L('Copper coils wound on stacked steel sheets. The drive feeds them in turn, which makes a magnetic field that turns around the axis.', 'Des bobines de cuivre enroulées sur des tôles d\'acier empilées. Le variateur les alimente tour à tour, ce qui crée un champ magnétique qui tourne autour de l\'axe.')],
  rot: [L('Motor rotor (magnets)', 'Rotor du moteur (aimants)'), L('Permanent magnets (red N, blue S) on the shaft follow the turning field. Brushless: nothing rubs, so it lasts for years. Fast (about 3 000 rpm) but weak.', 'Des aimants permanents (rouge N, bleu S) sur l\'arbre suivent le champ tournant. Sans balais : rien ne frotte, il dure des années. Rapide (environ 3 000 tr/min) mais peu puissant.')],
  wg: [L('Wave generator', 'Générateur d\'onde'), L('An elliptical cam with a thin ball bearing, turned by the motor shaft. It bends the flexspline into an ellipse.', 'Une came elliptique avec un roulement à billes fin, entraînée par l\'arbre moteur. Elle déforme la flexspline en ellipse.')],
  fs: [L('Flexspline', 'Flexspline (cloche flexible)'), L('A thin steel cup with 200 outer teeth. Bent by the ellipse, it meshes with the ring at two places only, and these places travel round with the cam.', 'Une cloche en acier mince avec 200 dents extérieures. Déformée par l\'ellipse, elle n\'engrène avec la couronne qu\'en deux endroits, qui tournent avec la came.')],
  cs: [L('Circular spline', 'Couronne rigide'), L('A rigid ring with 202 inner teeth, fixed to the housing. Two teeth more than the flexspline: each motor turn moves the flexspline back by 2 teeth, so the ratio is 200 / 2 = 100 : 1.', 'Une couronne rigide à 202 dents intérieures, fixée au carter. Deux dents de plus que la flexspline : chaque tour moteur la décale de 2 dents, d\'où le rapport 200 / 2 = 100 : 1.')],
  brg: [L('Cross-roller bearing', 'Roulement à rouleaux croisés'), L('Rollers set crosswise carry the weight and the bending of the next link while the joint turns smoothly, without play.', 'Des rouleaux croisés portent le poids et la flexion du segment suivant tout en laissant l\'articulation tourner en douceur, sans jeu.')],
  out: [L('Output flange', 'Bride de sortie'), L('Bolted to the next link. It turns 100 times slower than the motor and about 100 times stronger.', 'Vissée sur le segment suivant. Elle tourne 100 fois moins vite que le moteur et environ 100 fois plus fort.')],
  trq: [L('Joint torque sensor', 'Capteur de couple'), L('Spokes with strain gauges measure the torque in the joint. If it suddenly differs from what the model expects, the cobot has touched something and stops: this is why it needs no cage.', 'Des rayons équipés de jauges de contrainte mesurent le couple dans l\'articulation. S\'il s\'écarte soudain de ce que prévoit le modèle, le cobot a touché quelque chose et s\'arrête : c\'est pour cela qu\'il n\'a pas besoin de cage.')],
  cov: [L('Housing (cover)', 'Carter (capot)'), L('Cast aluminium shell: it holds the parts in line, keeps dust and oil out and carries the cables.', 'Coque en aluminium moulé : elle aligne les pièces, protège de la poussière et de l\'huile et guide les câbles.')],
  // linear axis
  lmot: [L('Servo motor with encoder', 'Servomoteur avec codeur'), L('A brushless motor with its encoder at the back: it turns the screw and tells the controller exactly how far it has turned.', 'Un moteur sans balais avec son codeur à l\'arrière : il fait tourner la vis et dit au contrôleur exactement de combien il a tourné.')],
  cpl: [L('Flexible coupling', 'Accouplement flexible'), L('Joins the motor shaft to the screw and absorbs a tiny misalignment, without any play.', 'Relie l\'arbre moteur à la vis et absorbe un petit désalignement, sans jeu.')],
  scr: [L('Ball screw', 'Vis à billes'), L('A ground steel screw. With a 20 mm lead, one turn moves the nut by 20 mm: precise to a few hundredths of a millimetre.', 'Une vis en acier rectifiée. Avec un pas de 20 mm, un tour déplace l\'écrou de 20 mm : précis à quelques centièmes de millimètre.')],
  nut: [L('Ball nut', 'Écrou à billes'), L('Steel balls roll between the screw and the nut and come back through a return tube: almost no friction and no play.', 'Des billes d\'acier roulent entre la vis et l\'écrou et reviennent par un tube de retour : presque pas de frottement et pas de jeu.')],
  rail: [L('Linear guide rails', 'Rails de guidage linéaire'), L('Hardened steel rails: they carry the load and keep the carriage perfectly straight.', 'Des rails en acier trempé : ils portent la charge et gardent le chariot parfaitement droit.')],
  blk: [L('Guide blocks', 'Patins de guidage'), L('Each block runs on the rail on rows of recirculating balls, like a tiny ball nut.', 'Chaque patin roule sur le rail grâce à des rangées de billes qui recirculent, comme un petit écrou à billes.')],
  car: [L('Carriage', 'Chariot'), L('The plate that carries the next axis (or the tool). Bolted to the nut and the blocks.', 'La plaque qui porte l\'axe suivant (ou l\'outil). Vissée sur l\'écrou et les patins.')],
  sup: [L('Support bearings', 'Paliers de vis'), L('Angular-contact bearings hold the screw at both ends: it can turn but not move along its axis.', 'Des roulements à contact oblique tiennent la vis aux deux bouts : elle peut tourner mais pas glisser le long de son axe.')],
  lim: [L('Limit switches', 'Fins de course'), L('Sensors at both ends: one gives the home position at start-up, both stop the axis before it hits the end.', 'Des capteurs aux deux bouts : l\'un donne la position d\'origine au démarrage, les deux arrêtent l\'axe avant la butée.')],
  // planetary
  pmot: [L('Servo motor', 'Servomoteur'), L('A brushless motor: copper windings in the stator, magnets on the rotor. Fast but weak on its own.', 'Un moteur sans balais : bobinages de cuivre dans le stator, aimants sur le rotor. Rapide mais peu puissant seul.')],
  sun: [L('Sun gear', 'Pignon solaire'), L('The small gear on the motor shaft (12 teeth). It drives the three planets.', 'Le petit pignon sur l\'arbre moteur (12 dents). Il entraîne les trois satellites.')],
  pla: [L('Planet gears', 'Satellites'), L('Three gears (18 teeth) that roll between the sun and the ring. Sharing the load between three gears makes the gearbox small and strong.', 'Trois pignons (18 dents) qui roulent entre le soleil et la couronne. Partager l\'effort entre trois pignons rend le réducteur petit et robuste.')],
  ring: [L('Ring gear', 'Couronne'), L('Inner teeth (48), fixed to the housing. The planets roll inside it, which makes the carrier turn: ratio 1 + 48/12 = 5 : 1.', 'Des dents intérieures (48), fixées au carter. Les satellites roulent dedans, ce qui fait tourner le porte-satellites : rapport 1 + 48/12 = 5 : 1.')],
  carr: [L('Planet carrier (output)', 'Porte-satellites (sortie)'), L('Holds the three planet axles. It is the output: 5 times slower and 5 times stronger than the motor.', 'Tient les axes des trois satellites. C\'est la sortie : 5 fois plus lente et 5 fois plus forte que le moteur.')],
  uarm: [L('Upper arm', 'Bras supérieur'), L('A light carbon-fibre arm bolted to the gearbox output. With the two others, it moves the platform through the parallel rods.', 'Un bras léger en fibre de carbone vissé sur la sortie du réducteur. Avec les deux autres, il déplace la plateforme par les bielles parallèles.')],
  balls: [L('Ball joints', 'Rotules'), L('Small ball joints at the ends of the rods let them swing in every direction, so the platform always stays flat.', 'De petites rotules aux bouts des bielles les laissent pivoter dans tous les sens : la plateforme reste toujours horizontale.')],
  // electric gripper
  gfl: [L('Tool flange (ISO 9409)', 'Bride d\'outil (ISO 9409)'), L('The standard bolt pattern that fixes the gripper on the robot wrist, with a dowel pin so it always goes back in the same place.', 'Le perçage standard qui fixe la pince sur le poignet du robot, avec un pion de centrage pour qu\'elle revienne toujours au même endroit.')],
  gmot: [L('Gripper motor + encoder', 'Moteur de la pince + codeur'), L('A small brushless motor: the drive limits its current, which sets the gripping force.', 'Un petit moteur sans balais : le variateur limite son courant, ce qui règle la force de serrage.')],
  gred: [L('Gearbox', 'Réducteur'), L('Slows the motor down so the fingers close slowly but firmly.', 'Ralentit le moteur pour que les doigts se ferment lentement mais fermement.')],
  gscr: [L('Left/right lead screw', 'Vis à double pas (gauche / droite)'), L('Half of the screw has a right-hand thread, half a left-hand thread: when it turns, the two jaws move towards each other (or apart) symmetrically.', 'La moitié de la vis a un pas à droite, l\'autre un pas à gauche : quand elle tourne, les deux mors se rapprochent (ou s\'écartent) symétriquement.')],
  gjaw: [L('Jaws on a linear guide', 'Mors sur guidage linéaire'), L('Two carriages that slide on a small rail and carry the fingers.', 'Deux chariots qui glissent sur un petit rail et portent les doigts.')],
  gfin: [L('Fingers', 'Doigts'), L('Machined to the shape of the part; they are easy to change for a new product.', 'Usinés à la forme de la pièce ; on les change facilement pour un nouveau produit.')],
  gpad: [L('Grip pads', 'Patins de préhension'), L('Soft rubber pads: more friction, no scratches on the part.', 'Patins en caoutchouc souple : plus d\'adhérence, pas de rayure sur la pièce.')],
  gsen: [L('Grip sensor', 'Capteur de prise'), L('Measures the finger position and the force: the robot knows if the part is there, and if it slipped.', 'Mesure la position des doigts et la force : le robot sait si la pièce est là, et si elle a glissé.')],
  gcov: [L('Gripper body', 'Corps de la pince'), L('Aluminium housing: it holds the guide, the screw and the motor, and seals them from dust.', 'Boîtier en aluminium : il tient le guidage, la vis et le moteur, et les protège de la poussière.')],
  // controller cabinet
  cmain: [L('Main switch', 'Interrupteur-sectionneur'), L('The red and yellow handle that cuts all the power to the cabinet; it can be locked for maintenance.', 'La poignée rouge et jaune qui coupe toute l\'alimentation de l\'armoire ; on peut la cadenasser pour la maintenance.')],
  cpsu: [L('24 V power supply', 'Alimentation 24 V'), L('Turns 230/400 V AC into 24 V DC for the electronics, the sensors and the brakes.', 'Transforme le 230/400 V alternatif en 24 V continu pour l\'électronique, les capteurs et les freins.')],
  ccpu: [L('Robot controller (CPU)', 'Contrôleur robot (CPU)'), L('An industrial computer: it runs the program, computes the trajectories and the inverse kinematics every millisecond.', 'Un ordinateur industriel : il exécute le programme, calcule les trajectoires et la cinématique inverse chaque milliseconde.')],
  cdrv: [L('Servo drives (one per axis)', 'Variateurs (un par axe)'), L('Six drives side by side: each one feeds one motor with exactly the right three-phase current.', 'Six variateurs côte à côte : chacun alimente un moteur avec exactement le bon courant triphasé.')],
  csaf: [L('Safety relay / safety PLC', 'Relais de sécurité / automate de sécurité'), L('Watches the emergency stops, the door and the light curtains on two channels; if one opens, it cuts the motor power.', 'Surveille les arrêts d\'urgence, la porte et les barrières sur deux voies ; si l\'une s\'ouvre, il coupe la puissance des moteurs.')],
  cio: [L('I/O modules', 'Modules d\'entrées / sorties'), L('Connect the sensors, valves and lamps of the cell to the controller.', 'Relient les capteurs, distributeurs et voyants de la cellule au contrôleur.')],
  cterm: [L('Terminal blocks', 'Borniers'), L('Every wire coming in or out is screwed on a numbered terminal: easy to test and to repair.', 'Chaque fil qui entre ou sort est vissé sur une borne numérotée : facile à tester et à dépanner.')],
  cduct: [L('Cable ducts', 'Goulottes'), L('Slotted channels that guide the wires tidily between the devices.', 'Des goulottes à fentes qui guident proprement les fils entre les appareils.')],
  cfan: [L('Fans and filters', 'Ventilateurs et filtres'), L('Blow fresh, filtered air through the cabinet: drives give off heat.', 'Soufflent de l\'air frais filtré dans l\'armoire : les variateurs chauffent.')],
  cdoor: [L('Cabinet door', 'Porte de l\'armoire'), L('Steel door with a seal (IP54) and a key; the main switch handle goes through it.', 'Porte en acier avec joint (IP54) et clé ; la poignée du sectionneur la traverse.')],
  // mobile robot electronics
  mbat: [L('Battery pack (LiFePO4)', 'Batterie (LiFePO4)'), L('Lithium cells in series and parallel: 48 V, about 8 hours of work, recharged at the charging station.', 'Des cellules lithium en série et en parallèle : 48 V, environ 8 heures de travail, rechargées à la borne.')],
  mbms: [L('BMS (battery management)', 'BMS (gestion de batterie)'), L('Watches the voltage and temperature of every cell, balances them and cuts the current if something is wrong.', 'Surveille la tension et la température de chaque cellule, les équilibre et coupe le courant en cas de problème.')],
  mpc: [L('Main computer', 'Ordinateur principal'), L('Runs ROS 2: the map, the localisation, the path planning and the link with the fleet manager.', 'Fait tourner ROS 2 : la carte, la localisation, la planification de trajet et le lien avec le gestionnaire de flotte.')],
  mdrv: [L('Motor drivers', 'Drivers moteurs'), L('One per drive wheel: they turn the speed orders into motor currents and read the encoders.', 'Un par roue motrice : ils transforment les consignes de vitesse en courant moteur et lisent les codeurs.')],
  mlid: [L('Safety LiDAR', 'LiDAR de sécurité'), L('Scans 270° around the robot: it maps the room and slows or stops the robot when someone is too close.', 'Balaye 270° autour du robot : il cartographie la pièce et ralentit ou arrête le robot quand quelqu\'un est trop près.')],
  mimu: [L('IMU', 'Centrale inertielle (IMU)'), L('Measures turns and accelerations; mixed with the wheel encoders it gives a precise odometry.', 'Mesure rotations et accélérations ; mélangée aux codeurs des roues, elle donne une odométrie précise.')],
  mestop: [L('Emergency stop', 'Arrêt d\'urgence'), L('A red button on each side: pressed, it cuts the motor power at once.', 'Un bouton rouge de chaque côté : appuyé, il coupe tout de suite la puissance des moteurs.')],
  mfuse: [L('Fuses and contactor', 'Fusibles et contacteur'), L('Protect the cables from short circuits and switch the motor power on and off.', 'Protègent les câbles des courts-circuits et mettent la puissance des moteurs sous et hors tension.')],
  mcov: [L('Body cover', 'Capot'), L('The top cover; it carries the load and keeps water and dust out.', 'Le capot supérieur ; il porte la charge et protège de l\'eau et de la poussière.')],
  whl: [L('Wheel and tyre', 'Roue et bandage'), L('A polyurethane tyre on an aluminium hub, bolted to the gearbox output. The encoder counts its turns: that is the odometry.', 'Un bandage en polyuréthane sur un moyeu en aluminium, vissé sur la sortie du réducteur. Le codeur compte ses tours : c\'est l\'odométrie.')]
};

// ---------------------------------------------------------------- mechanisms, built along +z (unit radius about 1)
// each part: { id, obj, z (resting offset along the axis), ex (exploded offset vector) }
function rotaryJoint(o) {
  const g = new THREE.Group(), parts = [], add = (id, obj, ex) => { g.add(obj); obj.traverse((m) => { if (m.isMesh) m.userData.part = id; }); parts.push({ id, obj, home: obj.position.clone(), ex }); return obj; };
  const turning = {};
  if (o.drv) {                                               // servo drive board (round PCB with real components)
    const b = new THREE.Group(); b.position.z = -2.55;
    b.add(cylA(0.95, 0.07, P.pcb, 48));
    const mcu = boxC(0.42, 0.42, 0.07, P.black); mcu.position.set(0, 0.05, -0.07); b.add(mcu);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, q = boxC(0.17, 0.22, 0.06, P.black); q.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, -0.065); q.rotation.z = a; b.add(q); const tab = boxC(0.17, 0.06, 0.02, P.steel); tab.position.set(Math.cos(a) * 0.73, Math.sin(a) * 0.73, -0.05); tab.rotation.z = a + Math.PI / 2; b.add(tab); }
    for (const [x, y] of [[-0.36, -0.42], [0.36, -0.42], [0, -0.55]]) { const cp = cylA(0.09, 0.32, P.alu, 20); cp.position.set(x, y, -0.2); b.add(cp); }
    const con = boxC(0.38, 0.14, 0.12, P.white); con.position.set(0, 0.62, -0.09); b.add(con);
    for (let i = 0; i < 8; i++) { const tr = boxC(0.02, 0.38, 0.005, P.gold); tr.position.set(-0.14 + i * 0.04, 0.32, -0.04); b.add(tr); }
    add('drv', b, V(0, 0, -2.4));
  }
  { const e = new THREE.Group(); e.position.z = -2.05;            // encoder: disc + read head
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.72, 64), new THREE.MeshStandardMaterial({ map: discTexture(), transparent: true, side: THREE.DoubleSide, roughness: 0.2 })); e.add(disc); turning.disc = disc;
    const head = boxC(0.32, 0.22, 0.24, P.black); head.position.set(0, 0.68, 0); e.add(head); const led = boxC(0.06, 0.06, 0.02, P.red); led.position.set(0, 0.6, 0.13); e.add(led);
    add('enc', e, V(0, 0, -1.9)); }
  { const b = new THREE.Group(); b.position.z = -1.5;             // brake: coil housing, armature, friction disc
    b.add(cylA(0.95, 0.32, P.dark, 48)); const coil = cylA(0.7, 0.2, P.copper, 40); coil.position.z = -0.02; b.add(coil); turning.coil = coil;
    const arm = cylA(0.9, 0.06, P.steel, 48); arm.position.z = 0.22; b.add(arm); turning.armature = arm;
    const fd = cylA(0.82, 0.06, P.friction, 48); fd.position.z = 0.32; b.add(fd); turning.fdisc = fd;
    add('brk', b, V(0, 0, -1.25)); }
  { const s = new THREE.Group(); s.position.z = -0.55;            // stator: laminated shell + copper windings
    const lamM = P.lam.clone(); lamM.map = stripes(30, '#8e98a3', '#5a636d'); lamM.side = THREE.DoubleSide;
    s.add(cylA(1.0, 1.25, lamM, 48, true));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, w = boxC(0.2, 0.26, 1.3, P.copper); w.position.set(Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0); w.rotation.z = a; s.add(w); }
    add('sta', s, V(0, 1.9, -0.5)); }
  { const r = new THREE.Group(); r.position.z = -0.55;            // rotor: shaft + magnets
    const shaft = cylA(0.13, 3.6, P.steel, 20); shaft.position.z = -0.2; r.add(shaft);
    r.add(cylA(0.45, 1.1, P.dark, 32));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, mg = boxC(0.16, 0.3, 1.1, i % 2 ? P.magS : P.magN); mg.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0); mg.rotation.z = a; r.add(mg); }
    add('rot', r, V(0, 0, -0.35)); turning.rotor = r; }
  { const w = new THREE.Group(); w.position.z = 0.35;             // wave generator: elliptical cam
    const cam = cylA(0.6, 0.24, P.steel, 48); cam.scale.set(1.13, 0.87, 1); w.add(cam);
    const brg = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 48), P.dark); brg.scale.set(1.13, 0.87, 1); w.add(brg);
    add('wg', w, V(0, 0, 0.55)); turning.wg = w; }
  { const f = new THREE.Group(); f.position.z = 0.55;             // flexspline: thin cup with outer teeth; parent = ellipse that turns with the cam
    const ell = new THREE.Group(); f.add(ell); const cup = new THREE.Group(); ell.add(cup);
    const shell = cylA(0.7, 0.62, P.steel.clone(), 48, true); shell.material.side = THREE.DoubleSide; shell.position.z = 0.15; cup.add(shell);
    const bottom = cylA(0.7, 0.04, P.steel, 48); bottom.position.z = 0.46; cup.add(bottom);
    const tg = gear(0.7, 60, 0.18, P.steel); tg.position.z = -0.05; cup.add(tg);
    const mark = boxC(0.08, 0.08, 0.2, P.orange); mark.position.set(0, 0.8, -0.05); cup.add(mark);
    add('fs', f, V(0, 0, 1.6)); turning.fsEll = ell; turning.fsCup = cup; }
  { const c = gear(0.86, 62, 0.22, P.dark, true); c.position.z = 0.5; add('cs', c, V(0, -1.8, 1.0)); }
  { const b = new THREE.Group(); b.position.z = 1.05; b.add(new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.1, 12, 56), P.steel));
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rl = cylA(0.04, 0.12, P.dark, 8); rl.position.set(Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0); rl.rotation.x = i % 2 ? 0.8 : -0.8; b.add(rl); }
    add('brg', b, V(0, 0, 2.5)); }
  { const fl = new THREE.Group(); fl.position.z = 1.3; fl.add(cylA(0.86, 0.14, P.alu, 48));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, h = cylA(0.06, 0.16, P.black, 12); h.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0); fl.add(h); }
    const mk = boxC(0.12, 0.3, 0.16, P.orange); mk.position.set(0, 0.62, 0.05); fl.add(mk);
    add('out', fl, V(0, 0, 3.3)); turning.out = fl; }
  if (o.trq) {
    const t = new THREE.Group(); t.position.z = 1.55;
    t.add(new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.07, 10, 48), P.alu)); t.add(cylA(0.25, 0.12, P.alu, 24));
    const gauges = [];
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4, sp = boxC(0.55, 0.12, 0.1, P.alu); sp.position.set(Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0); sp.rotation.z = a; t.add(sp);
      const gg = boxC(0.16, 0.1, 0.02, P.gold.clone()); gg.position.set(Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.06); gg.rotation.z = a; t.add(gg); gauges.push(gg); }
    add('trq', t, V(0, 0, 4.2)); turning.gauges = gauges;
  }
  // the cover (housing)
  const covM = P.orange.clone(); covM.transparent = true; covM.side = THREE.DoubleSide;
  const cover = cylA(1.14, o.drv ? 4.3 : 3.7, covM, 56, true); cover.position.z = o.drv ? -0.55 : -0.3; g.add(cover); cover.userData.part = 'cov';
  const lids = [-1, 1].map((s) => { const l = new THREE.Mesh(new THREE.RingGeometry(0.2, 1.14, 56), covM); l.position.z = cover.position.z + s * (o.drv ? 2.15 : 1.85); l.userData.part = 'cov'; g.add(l); return l; });
  const ids = parts.map((p) => p.id); ids.push('cov');
  // runs the joint: motor angle th (rad)
  const run = (th, t, on) => {
    turning.rotor.rotation.z = th; turning.disc.rotation.z = th; turning.wg.rotation.z = th; turning.fdisc.rotation.z = th;
    turning.fsEll.rotation.z = th; turning.fsCup.rotation.z = -th - th / 100; turning.out.rotation.z = -th / 100;
    turning.coil.material.emissive = new THREE.Color(on ? '#ff7a1a' : '#000'); turning.coil.material.emissiveIntensity = on ? 0.5 : 0;
    turning.armature.position.z = on ? 0.16 : 0.22;
    if (turning.gauges) turning.gauges.forEach((gg) => { gg.material.emissive = new THREE.Color('#ffd23a'); gg.material.emissiveIntensity = 0.3 + 0.3 * Math.sin(t * 3); });
  };
  const read = (th, t) => { const turns = th / (2 * Math.PI), counts = Math.floor(((turns % 1) + 1) % 1 * 131072);
    return [[L('Motor', 'Moteur'), '3 000 ' + L('rpm', 'tr/min')], [L('Gear ratio', 'Rapport'), '100 : 1'], [L('Output', 'Sortie'), '30 ' + L('rpm', 'tr/min') + ' · ' + ((-turns / 100 * 360) % 360).toFixed(1) + '°'],
      [L('Encoder', 'Codeur'), counts.toLocaleString() + ' / 131 072'], [L('Brake', 'Frein'), L('released', 'relâché')]].concat(o.trq ? [[L('Torque', 'Couple'), (12 + 3 * Math.sin(t * 3)).toFixed(1) + ' N·m']] : []); };
  return { g, parts, cover, lids, ids, run, read, len: o.drv ? 4.6 : 4.0, kind: 'rot' };
}

function linearAxis() {
  const g = new THREE.Group(), parts = [], add = (id, obj, ex) => { g.add(obj); obj.traverse((m) => { if (m.isMesh) m.userData.part = id; }); parts.push({ id, obj, home: obj.position.clone(), ex }); return obj; };
  const along = (r, h, mat, seg = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg).rotateZ(Math.PI / 2), mat); m.castShadow = m.receiveShadow = true; return m; };   // along x
  { const m = new THREE.Group(); m.position.x = -9.6; m.add(along(1.0, 2.4, P.black)); const cap = along(0.9, 0.5, P.dark); cap.position.x = -1.45; m.add(cap); const fl = boxC(0.25, 2.1, 2.1, P.alu); fl.position.x = 1.25; m.add(fl); add('lmot', m, V(-3, 0, 0)); }
  { const c = new THREE.Group(); c.position.x = -7.95; const cc = along(0.55, 0.9, P.alu); c.add(cc); for (let i = 0; i < 3; i++) { const sl = along(0.57, 0.05, P.dark); sl.position.x = -0.3 + i * 0.3; c.add(sl); } add('cpl', c, V(-1.6, 0, 0)); }
  const scrM = P.steel.clone(); scrM.map = stripes(120, '#c9d2db', '#6b7682'); const screw = along(0.38, 15, scrM, 24); screw.position.x = 0.05;
  { const sg = new THREE.Group(); sg.add(screw); add('scr', sg, V(0, 2.6, 0)); }
  for (const x of [-7.3, 7.5]) { const s = boxC(0.7, 1.6, 1.4, P.dark); s.position.set(x, -0.35, 0); add('sup', s, V(x < 0 ? -0.8 : 0.8, -1.2, 0)); }
  const carGroup = new THREE.Group(); g.add(carGroup);
  const nut = new THREE.Group(); nut.add(along(0.75, 1.3, P.brass)); const flange = along(1.05, 0.22, P.brass); flange.position.x = 0.55; nut.add(flange); const ret = boxC(1.1, 0.25, 0.25, P.steel); ret.position.set(0, 0.8, 0); nut.add(ret);
  add('nut', nut, V(0, 4.6, 0));
  const rails = new THREE.Group(); for (const z of [-1.9, 1.9]) { const r = boxC(16, 0.45, 0.55, P.steel); r.position.set(0, -1.05, z); rails.add(r); } add('rail', rails, V(0, -2.4, 0));
  const blocks = new THREE.Group(); for (const x of [-1.1, 1.1]) for (const z of [-1.9, 1.9]) { const b = boxC(1.2, 0.55, 0.95, P.dark); b.position.set(x, -0.55, z); blocks.add(b); } add('blk', blocks, V(0, 1.4, 0));
  const car = boxC(3.6, 0.3, 4.8, P.orange); car.position.set(0, 0.0 + 0.95, 0); add('car', car, V(0, 6.6, 0));
  const lims = new THREE.Group(); for (const x of [-6.6, 6.8]) { const s = boxC(0.4, 0.5, 0.35, P.black); s.position.set(x, -0.55, 2.55); lims.add(s); const led = boxC(0.12, 0.12, 0.05, P.red); led.position.set(x, -0.4, 2.75); lims.add(led); } add('lim', lims, V(0, 0, 2.2));
  const moving = ['nut', 'blk', 'car'].map((id) => parts.find((p) => p.id === id));
  const ids = parts.map((p) => p.id);
  const run = (th) => { screw.rotation.x = th; const x = 5.2 * Math.sin(th / 9); moving.forEach((p) => { p.obj.userData.dx = x; }); g.userData.x = x; };
  const read = (th) => { const x = 5.2 * Math.sin(th / 9); return [[L('Screw lead', 'Pas de la vis'), '20 mm / ' + L('turn', 'tour')], [L('Motor', 'Moteur'), '1 500 ' + L('rpm', 'tr/min')], [L('Carriage speed', 'Vitesse du chariot'), '0.5 m/s'], [L('Position', 'Position'), (x * 40).toFixed(0) + ' mm']]; };
  return { g, parts, cover: null, lids: [], ids, run, read, moving, len: 20, linear: true, kind: 'lin' };
}

function planetary(o) {
  const g = new THREE.Group(), parts = [], add = (id, obj, ex) => { g.add(obj); obj.traverse((m) => { if (m.isMesh) m.userData.part = id; }); parts.push({ id, obj, home: obj.position.clone(), ex }); return obj; };
  const T = {};
  { const e = new THREE.Group(); e.position.z = -2.4; const disc = new THREE.Mesh(new THREE.CircleGeometry(0.62, 64), new THREE.MeshStandardMaterial({ map: discTexture(), transparent: true, side: THREE.DoubleSide })); e.add(disc); T.disc = disc;
    const head = boxC(0.3, 0.2, 0.22, P.black); head.position.set(0, 0.6, 0); e.add(head); add('enc', e, V(0, 0, -1.8)); }
  { const m = new THREE.Group(); m.position.z = -1.1; const can = cylA(1.0, 1.9, P.black.clone(), 48, true); can.material.side = THREE.DoubleSide; m.add(can);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, w = boxC(0.2, 0.24, 1.6, P.copper); w.position.set(Math.cos(a) * 0.75, Math.sin(a) * 0.75, 0); w.rotation.z = a; m.add(w); }
    const rot = new THREE.Group(); rot.add(cylA(0.42, 1.5, P.dark, 28)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, mg = boxC(0.15, 0.28, 1.5, i % 2 ? P.magS : P.magN); mg.position.set(Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0); mg.rotation.z = a; rot.add(mg); }
    const sh = cylA(0.1, 3.4, P.steel, 16); sh.position.z = 0.5; rot.add(sh); m.add(rot); T.rot = rot;
    add('pmot', m, V(0, 0, -0.6)); }
  const sun = gear(0.32, 12, 0.4, P.steel); sun.position.z = 0.4; add('sun', sun, V(0, 0, 1.2)); T.sun = sun;
  const carrierG = new THREE.Group(); carrierG.position.z = 0.4; g.add(carrierG);
  const planetsG = new THREE.Group(); const planets = [];
  for (let i = 0; i < 3; i++) { const p = gear(0.45, 18, 0.4, P.alu); planetsG.add(p); planets.push(p); }
  planetsG.position.z = 0.4; add('pla', planetsG, V(0, 0, 2.3));
  const ring = gear(1.22, 48, 0.42, P.dark, true); ring.position.z = 0.4; add('ring', ring, V(0, 0, 3.4));
  const carr = new THREE.Group(); carr.position.z = 0.85; carr.add(cylA(1.0, 0.16, P.alu, 48)); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2, pin = cylA(0.09, 0.5, P.steel, 12); pin.position.set(Math.cos(a) * 0.77, Math.sin(a) * 0.77, -0.28); carr.add(pin); }
  const mk = boxC(0.14, 0.3, 0.2, P.orange); mk.position.set(0, 0.7, 0.12); carr.add(mk);
  add('carr', carr, V(0, 0, 4.5)); T.carr = carr;
  if (o.arm) {                                               // Delta: carbon upper arm + ball joints on the carrier
    const a0 = o.armAngle || 0;                                 // the real arm leaves the motor at this angle (0 = straight down)
    const a = new THREE.Group(); a.position.z = 1.25; a.rotation.z = a0; const beam = boxC(0.5, 6.0, 0.45, P.black); beam.position.y = -3.0; a.add(beam); a.add(cylA(0.5, 0.5, P.orange, 32));
    add('uarm', a, V(0, 0, 5.6)); T.arm = a;
    const b = new THREE.Group(); b.position.set(Math.sin(a0) * 6.0, -Math.cos(a0) * 6.0, 1.25); for (const s of [-1, 1]) { const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), P.steel); ball.position.z = s * 0.7; b.add(ball); const rod = cylA(0.09, 1.2, P.alu, 10); rod.position.z = s * 0.7; rod.rotation.x = 0; b.add(rod); }
    add('balls', b, V(0, -1.4, 6.4)); T.balls = b;
  }
  if (o.wheel) {                                             // mobile: wheel bolted on the carrier
    const w = new THREE.Group(); w.position.z = 1.5; const tyre = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.42, 16, 64), P.rubber); w.add(tyre); w.add(cylA(1.45, 0.7, P.alu, 48));
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2, b = cylA(0.1, 0.75, P.dark, 10); b.position.set(Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0); w.add(b); }
    add('whl', w, V(0, 0, 5.4)); T.wheel = w;
  }
  const covM = P.orange.clone(); covM.transparent = true; covM.side = THREE.DoubleSide;
  const cover = cylA(1.42, 3.9, covM, 56, true); cover.position.z = -0.75; g.add(cover); cover.userData.part = 'cov';
  const lids = [-1, 1].map((s) => { const l = new THREE.Mesh(new THREE.RingGeometry(0.2, 1.42, 56), covM); l.position.z = -0.75 + s * 1.95; l.userData.part = 'cov'; g.add(l); return l; });
  const ids = parts.map((p) => p.id); ids.push('cov');
  const run = (th) => {
    const c = th / 5; T.rot.rotation.z = th; T.disc.rotation.z = th; T.sun.rotation.z = th; T.carr.rotation.z = c;
    planets.forEach((p, i) => { const a = c + (i / 3) * Math.PI * 2; p.position.set(Math.cos(a) * 0.77, Math.sin(a) * 0.77, 0); p.rotation.z = c - (12 / 18) * (th - c); });
    if (T.arm) { const sw = (o.armAngle || 0) + 0.35 * Math.sin(c * 0.5); T.arm.rotation.z = sw; T.balls.position.set(Math.sin(sw) * 6.0, -Math.cos(sw) * 6.0, T.balls.position.z); }
    if (T.wheel) T.wheel.rotation.z = c;
  };
  const read = (th) => [[L('Motor', 'Moteur'), (o.wheel ? '3 000 ' : '3 000 ') + L('rpm', 'tr/min')], [L('Gear ratio', 'Rapport'), '1 + 48/12 = 5 : 1'], [L('Output', 'Sortie'), '600 ' + L('rpm', 'tr/min')],
    o.wheel ? [L('Wheel speed', 'Vitesse de la roue'), '600 tr/min × π × 0.15 m ≈ 4.7 m/s max'] : [L('Arm angle', 'Angle du bras'), ((0.35 * Math.sin(th / 10) - 0.076) * 57.3).toFixed(1) + '°']];
  return { g, parts, cover, lids, ids, run, read, len: o.arm ? 8 : 6, kind: 'pla' };
}

function gripperMech() {                                     // electric parallel gripper, approach axis +z (fingers point +z)
  const g = new THREE.Group(), parts = [], add = (id, obj, ex) => { g.add(obj); obj.traverse((m) => { if (m.isMesh) m.userData.part = id; }); parts.push({ id, obj, home: obj.position.clone(), ex }); return obj; };
  const T = {};
  { const f = new THREE.Group(); f.position.z = -2.6; f.add(cylA(1.1, 0.25, P.alu, 40)); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, h = cylA(0.09, 0.27, P.black, 10); h.position.set(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0); f.add(h); } add('gfl', f, V(0, 0, -2.4)); }
  { const s = new THREE.Group(); s.position.set(0, 0, -3.1); s.add(cylA(0.45, 0.3, P.pcb, 24)); const c = boxC(0.3, 0.3, 0.12, P.black); c.position.z = -0.18; s.add(c); add('gsen', s, V(0, 0, -3.6)); }
  { const m = new THREE.Group(); m.position.z = -1.6; m.add(cylA(0.6, 1.5, P.black, 32)); const sh = cylA(0.08, 0.6, P.steel, 12); sh.position.z = 0.95; m.add(sh); T.mot = sh; add('gmot', m, V(0, 0, -1.5)); }
  { const r = new THREE.Group(); r.position.z = -0.5; r.add(cylA(0.62, 0.6, P.alu, 32)); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2, gg = gear(0.18, 10, 0.3, P.steel); gg.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.35); r.add(gg); } add('gred', r, V(0, 0, -0.6)); }
  const scrM = P.steel.clone(); scrM.map = stripes(40, '#c9d2db', '#6b7682'); const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.4, 20).rotateZ(Math.PI / 2), scrM);
  { const sc = new THREE.Group(); sc.position.z = 0.35; sc.add(screw); add('gscr', sc, V(0, -1.6, 0.4)); T.screw = screw; }
  const jaws = [], fingers = [], pads = [];
  const jg = new THREE.Group(); jg.position.z = 0.35; const rail = boxC(3.6, 0.18, 0.5, P.dark); rail.position.y = -0.45; jg.add(rail);
  for (const sx of [-1, 1]) { const j = boxC(0.8, 0.7, 0.9, P.orange); j.position.set(sx * 0.9, 0, 0); jg.add(j); jaws.push(j); }
  add('gjaw', jg, V(0, 1.2, 0.9));
  const fg = new THREE.Group(); fg.position.z = 0.35; for (const sx of [-1, 1]) { const f = boxC(0.35, 0.6, 2.4, P.alu); f.position.set(sx * 0.9, 0, 1.55); fg.add(f); fingers.push(f); } add('gfin', fg, V(0, 0, 2.2));
  const pg = new THREE.Group(); pg.position.z = 0.35; for (const sx of [-1, 1]) { const p2 = boxC(0.1, 0.55, 0.8, P.rubber); p2.position.set(sx * 0.68, 0, 2.3); pg.add(p2); pads.push(p2); } add('gpad', pg, V(0, 0, 3.6));
  const covM = P.dark.clone(); covM.transparent = true; covM.side = THREE.DoubleSide;
  const cover = boxC(2.4, 1.6, 3.2, covM); cover.position.z = -0.9; cover.material.opacity = 0.9; g.add(cover); cover.userData.part = 'gcov';
  const ids = parts.map((p) => p.id); ids.push('gcov');
  const open = (o) => { jaws.forEach((j, i) => { j.position.x = (i ? 1 : -1) * (0.45 + 0.7 * o); }); fingers.forEach((f, i) => { f.position.x = (i ? 1 : -1) * (0.45 + 0.7 * o); }); pads.forEach((p2, i) => { p2.position.x = (i ? 1 : -1) * (0.23 + 0.7 * o); }); };
  open(0.6);
  const run = (th) => { const o = 0.5 + 0.5 * Math.sin(th / 6); T.screw.rotation.x = th; T.mot.rotation.z = th * 3; open(o); g.userData.o = o; };
  const read = (th) => { const o = 0.5 + 0.5 * Math.sin(th / 6); return [[L('Opening', 'Ouverture'), (20 + 60 * o).toFixed(0) + ' mm'], [L('Grip force', 'Force de serrage'), o < 0.08 ? '140 N' : '0 N'], [L('Part', 'Pièce'), o < 0.08 ? L('held', 'tenue') : L('free', 'libre')]]; };
  return { g, parts, cover, lids: [], ids, run, read, len: 6.5, kind: 'grip' };
}

function cabinetMech() {                                     // the robot controller cabinet, standing on the floor (y up), the door on +z
  const g = new THREE.Group(), parts = [], add = (id, obj, ex) => { g.add(obj); obj.traverse((m) => { if (m.isMesh) m.userData.part = id; }); parts.push({ id, obj, home: obj.position.clone(), ex }); return obj; };
  const W = 4, H = 6.4, D = 2.2, T = { fans: [], leds: [] };
  const shell = new THREE.Group(); const sm = M('#e6e1d6', { roughness: 0.6 }); for (const [w, h, d, x, y, z] of [[W, H, 0.08, 0, H / 2, -D / 2], [0.08, H, D, -W / 2, H / 2, 0], [0.08, H, D, W / 2, H / 2, 0], [W, 0.08, D, 0, H, 0], [W, 0.08, D, 0, 0.04, 0]]) { const b = boxC(w, h, d, sm); b.position.set(x, y, z); shell.add(b); } g.add(shell);
  const plate = boxC(W - 0.3, H - 0.4, 0.05, P.alu); plate.position.set(0, H / 2, -D / 2 + 0.1); g.add(plate);
  const z0 = -D / 2 + 0.2, row = (y) => y;
  { const d = new THREE.Group(); for (const y of [1.6, 3.3, 4.9]) { const du = boxC(W - 0.5, 0.35, 0.4, P.white); du.position.set(0, y, z0 + 0.15); d.add(du); } const dv = boxC(0.35, H - 1, 0.4, P.white); dv.position.set(-W / 2 + 0.35, H / 2, z0 + 0.15); d.add(dv); add('cduct', d, V(0, 0, 0.6)); }
  { const m = new THREE.Group(); m.position.set(-1.1, 5.6, z0 + 0.3); m.add(boxC(0.6, 0.8, 0.5, P.dark)); const h = cylA(0.22, 0.2, P.red, 20); h.position.z = 0.35; m.add(h); const y2 = boxC(0.7, 0.7, 0.05, M('#f5c518')); y2.position.z = 0.26; m.add(y2); add('cmain', m, V(-0.4, 0.4, 2.6)); }
  { const p2 = new THREE.Group(); p2.position.set(0.2, 5.6, z0 + 0.3); p2.add(boxC(1.2, 0.7, 0.55, P.alu)); for (let i = 0; i < 6; i++) { const t = boxC(0.1, 0.12, 0.05, P.dark); t.position.set(-0.45 + i * 0.18, -0.25, 0.3); p2.add(t); } const led = boxC(0.06, 0.06, 0.03, P.red.clone()); led.position.set(0.5, 0.2, 0.29); led.material.color.set('#30ff8a'); led.material.emissive.set('#30ff8a'); p2.add(led); add('cpsu', p2, V(0, 0.4, 3.4)); }
  { const c = new THREE.Group(); c.position.set(1.4, 5.5, z0 + 0.35); c.add(boxC(0.9, 1.1, 0.7, P.black)); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.35), new THREE.MeshBasicMaterial({ color: '#1d3b5c' })); sc.position.set(0, 0.2, 0.36); c.add(sc); for (let i = 0; i < 3; i++) { const l = boxC(0.06, 0.06, 0.03, M('#30ff8a', { emissive: '#30ff8a', emissiveIntensity: 1 })); l.position.set(-0.25 + i * 0.12, -0.3, 0.36); c.add(l); T.leds.push(l); } add('ccpu', c, V(0.6, 0.4, 2.6)); }
  { const dr = new THREE.Group(); dr.position.set(0, 2.45, z0 + 0.4); for (let i = 0; i < 6; i++) { const b = boxC(0.45, 1.3, 0.8, P.dark); b.position.x = -1.35 + i * 0.54; dr.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.16), new THREE.MeshBasicMaterial({ color: '#2b6cb0' })); sc.position.set(-1.35 + i * 0.54, 0.4, 0.41); dr.add(sc); const l = boxC(0.05, 0.05, 0.03, M('#30ff8a', { emissive: '#30ff8a', emissiveIntensity: 1 })); l.position.set(-1.35 + i * 0.54, 0.15, 0.41); dr.add(l); T.leds.push(l); } add('cdrv', dr, V(0, 0, 3.2)); }
  { const sf = new THREE.Group(); sf.position.set(-1.3, 4.15, z0 + 0.3); for (let i = 0; i < 2; i++) { const b = boxC(0.3, 0.7, 0.5, M('#f5c518')); b.position.x = i * 0.35; sf.add(b); } add('csaf', sf, V(-0.6, 0, 2.4)); }
  { const io = new THREE.Group(); io.position.set(0.5, 4.15, z0 + 0.3); for (let i = 0; i < 6; i++) { const b = boxC(0.2, 0.7, 0.5, i % 2 ? P.white : M('#9aa5b1')); b.position.x = -0.6 + i * 0.22; io.add(b); } add('cio', io, V(0.4, 0, 2.6)); }
  { const tb = new THREE.Group(); tb.position.set(0.2, 0.85, z0 + 0.25); const rail = boxC(W - 0.8, 0.08, 0.1, P.steel); tb.add(rail); const cols = ['#9aa5b1', '#2f6bff', '#e5484d', '#9aa5b1', '#f5c518', '#30a46c']; for (let i = 0; i < 22; i++) { const b = boxC(0.1, 0.45, 0.4, M(cols[i % cols.length])); b.position.set(-1.5 + i * 0.14, 0.1, 0.1); tb.add(b); } add('cterm', tb, V(0, -0.4, 2.4)); }
  { const fs = new THREE.Group(); for (const y of [1.2, 5.0]) { const f = new THREE.Group(); f.position.set(W / 2 + 0.05, y, 0); f.add(boxC(0.1, 0.9, 0.9, P.black)); const bl = new THREE.Group(); bl.position.x = 0.07; for (let k = 0; k < 4; k++) { const b2 = boxC(0.02, 0.35, 0.12, P.dark); b2.rotation.x = (k / 4) * Math.PI; bl.add(b2); } f.add(bl); T.fans.push(bl); fs.add(f); } add('cfan', fs, V(1.4, 0, 0)); }
  const doorM = M('#e6e1d6', { roughness: 0.6 }); doorM.transparent = true;
  const door = boxC(W, H, 0.08, doorM); door.position.set(0, H / 2, D / 2); g.add(door); door.userData.part = 'cdoor';
  const ids = parts.map((p) => p.id); ids.push('cdoor');
  const run = (th, t) => { T.fans.forEach((f) => { f.rotation.x = th * 4; }); T.leds.forEach((l, i) => { l.material.emissiveIntensity = 0.4 + 0.6 * ((Math.sin(t * 6 + i) + 1) / 2); }); };
  const read = (th, t) => [[L('Supply', 'Alimentation'), '400 V AC → 24 V DC'], [L('Drives', 'Variateurs'), '6 × ' + L('ready', 'prêts')], [L('Cycle', 'Cycle'), '1 ms'], [L('Safety', 'Sécurité'), L('OK (2 channels)', 'OK (2 voies)')], [L('Inside temperature', 'Température intérieure'), (34 + Math.sin(t / 3)).toFixed(1) + ' °C']];
  return { g, parts, cover: door, lids: [], ids, run, read, len: 7, kind: 'cab' };
}

function mobileBox() {                                       // the body of a mobile robot, cover off: battery, BMS, computer, drivers, LiDAR, IMU (x forward, y up)
  const g = new THREE.Group(), parts = [], add = (id, obj, ex) => { g.add(obj); obj.traverse((m) => { if (m.isMesh) m.userData.part = id; }); parts.push({ id, obj, home: obj.position.clone(), ex }); return obj; };
  const T = {};
  const base = boxC(8.4, 0.2, 5.6, P.dark); base.position.y = 0.1; g.add(base);
  { const b = new THREE.Group(); b.position.set(-1.6, 0.25, 0); b.add(boxC(3.6, 1.5, 3.2, M('#2f6bff', { roughness: 0.5 }))); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const c = cylA(0.22, 0.12, P.steel, 16); c.rotation.x = Math.PI / 2; c.position.set(-1.4 + i * 0.56, 1.53, -1.2 + j * 0.8); b.add(c); } b.children[0].position.y = 0.75; add('mbat', b, V(-1.2, 0, 0)); }
  { const bm = new THREE.Group(); bm.position.set(-1.6, 2.05, 0); bm.add(boxC(2.2, 0.08, 1.4, P.pcb)); for (let i = 0; i < 5; i++) { const c = boxC(0.25, 0.08, 0.25, P.black); c.position.set(-0.8 + i * 0.4, 0.08, 0); bm.add(c); } add('mbms', bm, V(-0.6, 1.6, 0)); }
  { const pc = new THREE.Group(); pc.position.set(1.4, 0.25, -1.2); pc.add(boxC(1.8, 0.7, 1.4, P.alu)); for (let i = 0; i < 8; i++) { const f = boxC(0.06, 0.25, 1.4, P.alu); f.position.set(-0.8 + i * 0.22, 0.7, 0); pc.add(f); } add('mpc', pc, V(0.6, 1.4, -0.8)); }
  { const dr = new THREE.Group(); dr.position.set(1.4, 0.25, 1.2); for (const x of [-0.5, 0.5]) { const b = boxC(0.8, 0.6, 1.1, P.pcbRed); b.position.x = x; dr.add(b); for (let k = 0; k < 4; k++) { const f = boxC(0.05, 0.25, 1.0, P.alu); f.position.set(x - 0.3 + k * 0.2, 0.6, 0); dr.add(f); } } add('mdrv', dr, V(0.6, 1.2, 0.9)); }
  { const ld = new THREE.Group(); ld.position.set(3.6, 0.25, 0); ld.add(cy0(0.55, 0.6, P.black)); const top = cy0(0.48, 0.45, P.dark); top.position.y = 0.6; ld.add(top); T.lid = top; const win = boxC(0.05, 0.3, 0.6, P.red); win.position.set(0.5, 0.45, 0); ld.add(win); add('mlid', ld, V(1.6, 0.8, 0)); }
  { const im = new THREE.Group(); im.position.set(0.2, 0.25, 0); im.add(boxC(0.6, 0.06, 0.5, P.pcbBlue)); const ch = boxC(0.2, 0.06, 0.2, P.black); ch.position.y = 0.06; im.add(ch); add('mimu', im, V(0, 1.0, 0)); }
  { const es = new THREE.Group(); es.position.set(-3.6, 0.25, 2.2); es.add(boxC(0.6, 0.5, 0.6, M('#f5c518'))); const bt = cy0(0.24, 0.2, P.red); bt.position.y = 0.5; es.add(bt); add('mestop', es, V(-1.2, 0.6, 1.2)); }
  { const fu = new THREE.Group(); fu.position.set(-3.6, 0.25, -1.6); for (let i = 0; i < 4; i++) { const f = boxC(0.25, 0.6, 0.5, P.white); f.position.x = i * 0.3 - 0.45; fu.add(f); } add('mfuse', fu, V(-1.2, 0.6, -1.0)); }
  const covM = M('#eef1f4', { roughness: 0.5 }); covM.transparent = true; const cover = boxC(8.6, 2.6, 5.8, covM); cover.position.y = 1.3; g.add(cover); cover.userData.part = 'mcov';
  const ids = parts.map((p) => p.id); ids.push('mcov');
  const run = (th) => { T.lid.rotation.y = th * 2; };
  const read = (th, t) => [[L('Battery', 'Batterie'), '48 V · ' + (86 - (t / 20) % 5).toFixed(0) + ' %'], [L('Current', 'Courant'), (12 + 4 * Math.sin(t)).toFixed(1) + ' A'], ['LiDAR', '15 ' + L('turns/s', 'tours/s')], [L('Position', 'Position'), 'x 12.40 m · y 3.85 m']];
  return { g, parts, cover, lids: [], ids, run, read, len: 9, kind: 'bat' };
}
function cy0(r, h, mat) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28).translate(0, h / 2, 0), mat); m.castShadow = m.receiveShadow = true; return m; }

// ---------------------------------------------------------------- callouts: each name sits in a row above or below the picture, with a leader line to its part
export function callouts(box, items, w, h) {
  // Lay the names out so that no two leader lines cross:
  //  - parts spread out up and down  -> names in a left and a right column, in the same top-to-bottom order as the parts
  //  - parts spread out left to right -> names in a top and a bottom row, in the same left-to-right order as the parts
  const svg = box.querySelector('svg'); svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
  if (!items.length) { svg.innerHTML = ''; return; }
  const xs = items.map((i) => i.x), ys = items.map((i) => i.y), pad = 8, gap = 6, size = (it) => [it.el.offsetWidth || 110, it.el.offsetHeight || 26];
  const rowsFit = items.reduce((a, it) => a + size(it)[0] + gap, 0) / 2 < w * 0.9 && Math.max(...xs) - Math.min(...xs) > w * 0.45;   // names fit in two rows and the parts really spread left to right
  const vertical = !rowsFit, tall = Math.max(...ys) - Math.min(...ys) > Math.max(...xs) - Math.min(...xs);
  const place = (list, along, lo, hi) => {                    // spread labels along one line without overlap, keeping their order
    let prev = -Infinity;
    for (const it of list) { const half = (along === 'x' ? size(it)[0] : size(it)[1]) / 2; it.p = Math.max(lo + half, it[along], prev + gap + half); prev = it.p + half; }
    let next = Infinity;
    for (const it of list.slice().reverse()) { const half = (along === 'x' ? size(it)[0] : size(it)[1]) / 2; it.p = Math.min(it.p, hi - half, next - gap - half); next = it.p - half; }
  };
  let d = '';
  if (vertical) {
    const sorted = items.slice().sort((a, b) => a.y - b.y), cols = [[], []];
    if (tall) sorted.forEach((it, i) => cols[i % 2].push(it));           // a vertical stack: alternate sides
    else { const mid = (Math.min(...xs) + Math.max(...xs)) / 2; sorted.forEach((it) => cols[it.x < mid ? 0 : 1].push(it)); }   // parts spread around: each name on its own side
    cols.forEach((col, k) => { place(col, 'y', 54, h - 10); for (const it of col) { const [bw] = size(it), x = k ? w - pad - bw / 2 : pad + bw / 2; it.el.style.left = x + 'px'; it.el.style.top = it.p + 'px';
      d += `<line x1="${it.x.toFixed(1)}" y1="${it.y.toFixed(1)}" x2="${(k ? x - bw / 2 : x + bw / 2).toFixed(1)}" y2="${it.p.toFixed(1)}" class="${it.el.classList.contains('on') ? 'on' : ''}"/><circle cx="${it.x.toFixed(1)}" cy="${it.y.toFixed(1)}" r="3.5"/>`; } });
  } else {
    const sorted = items.slice().sort((a, b) => a.x - b.x), rows = [[], []];
    sorted.forEach((it, i) => rows[i % 2].push(it));
    const Y = [24, h - 30];
    rows.forEach((row, k) => { place(row, 'x', pad, w - pad); for (const it of row) { const [, bh] = size(it); it.el.style.left = it.p + 'px'; it.el.style.top = Y[k] + 'px';
      d += `<line x1="${it.x.toFixed(1)}" y1="${it.y.toFixed(1)}" x2="${it.p.toFixed(1)}" y2="${(k ? Y[k] - bh / 2 : Y[k] + bh / 2).toFixed(1)}" class="${it.el.classList.contains('on') ? 'on' : ''}"/><circle cx="${it.x.toFixed(1)}" cy="${it.y.toFixed(1)}" r="3.5"/>`; } });
  }
  svg.innerHTML = d;
}

// ---------------------------------------------------------------- per robot: every part you can open (where it is, its axis, its size)
// axis: 'z' / 'x' / 'y' = the axis of the joint; 'down' = a tool pointing down; 'up' = a box standing on the floor
function armJ(h1, L2, L3, L4, f) {                           // elbow and wrist positions of the arm models for a flange point f (z = 0)
  const wy = f.y + L4, zz = wy - h1, D = (f.x * f.x + zz * zz - L2 * L2 - L3 * L3) / (2 * L2 * L3), a3 = -Math.acos(D), a2 = Math.atan2(zz, f.x) + Math.atan2(L3 * Math.sin(-a3), L2 + L3 * D);
  return { el: V(L2 * Math.cos(a2), h1 + L2 * Math.sin(a2), 0), wr: V(f.x, wy, 0) };
}
const NOTE_IND = L('On an industrial robot the drive electronics sit in the controller cabinet; a thick cable brings the motor power and the encoder signals.', 'Sur un robot industriel, l\'électronique de commande est dans l\'armoire ; un gros câble apporte la puissance du moteur et les signaux du codeur.');
const NOTE_COB = L('In a cobot each joint is a complete module: its own drive board and a torque sensor, so it feels contact.', 'Dans un cobot, chaque articulation est un module complet : sa propre carte variateur et un capteur de couple, pour sentir les contacts.');
const tg = (name, at, axis, k, mech, note, link) => ({ name, at, axis, k, mech, note: note || '', link });
const GRIP = (at, k) => tg([L('the gripper', 'la pince'), L('Gripper', 'Pince')], at.clone().add(V(0, 2.75 * k, 0)), 'down', k, () => gripperMech(), L('An electric gripper is a small robot of its own: motor, gearbox, screw, guide and sensor.', 'Une pince électrique est un petit robot à elle seule : moteur, réducteur, vis, guidage et capteur.'));
const CAB = (at, k) => tg([L('the controller cabinet', 'l\'armoire de commande'), L('Cabinet', 'Armoire')], at, 'up', k, () => cabinetMech(), L('It stands next to the robot and is linked to it by one thick cable: the brain and the power of the robot are here.', 'Elle est posée à côté du robot et reliée à lui par un gros câble : le cerveau et la puissance du robot sont ici.'));
const ROB = (() => {
  const six = armJ(0.45, 0.5, 0.5, 0.14, V(0.62, 0.62, 0)), cob = armJ(0.3, 0.42, 0.38, 0.11, V(0.5, 0.42, 0)), a3 = armJ(0.42, 0.45, 0.45, 0.036, V(0.55, 0.55, 0));
  const J = (n, en, fr) => [L(`${en}`, `${fr}`), n];
  return {
    articulated: { build: () => articulated({ h1: 0.45, L2: 0.5, L3: 0.5, L4: 0.14, r: 0.075 }), pose: V(0.62, 0.62, 0), targets: [
      tg(J('J1', 'axis 1, the base', 'l\'axe 1, la base'), V(0, 0.25, 0), 'y', 0.08, () => rotaryJoint({}), NOTE_IND),
      tg(J('J2', 'the shoulder (axis 2)', 'l\'épaule (axe 2)'), V(0, 0.45, 0), 'z', 0.082, () => rotaryJoint({}), NOTE_IND),
      tg(J('J3', 'the elbow (axis 3)', 'le coude (axe 3)'), six.el, 'z', 0.066, () => rotaryJoint({}), NOTE_IND),
      tg(J('J5', 'the wrist (axes 4-5-6)', 'le poignet (axes 4-5-6)'), six.wr, 'z', 0.048, () => rotaryJoint({}), L('The wrist has three small joints close together, so the tool can take any orientation.', 'Le poignet a trois petites articulations rapprochées, pour que l\'outil prenne n\'importe quelle orientation.')),
      GRIP(V(0.62, 0.62, 0), 0.028), CAB(V(-0.8, 0, 0.45), 0.1)] },
    cobot: { build: () => articulated({ h1: 0.3, L2: 0.42, L3: 0.38, L4: 0.11, r: 0.055, style: 'cobot' }), pose: V(0.5, 0.42, 0), targets: [
      tg(J('J1', 'axis 1, the base', 'l\'axe 1, la base'), V(0, 0.17, 0), 'y', 0.056, () => rotaryJoint({ drv: true, trq: true }), NOTE_COB),
      tg(J('J2', 'the shoulder (axis 2)', 'l\'épaule (axe 2)'), V(0, 0.3, 0), 'z', 0.052, () => rotaryJoint({ drv: true, trq: true }), NOTE_COB),
      tg(J('J3', 'the elbow (axis 3)', 'le coude (axe 3)'), cob.el, 'z', 0.045, () => rotaryJoint({ drv: true, trq: true }), NOTE_COB),
      tg(J('J5', 'the wrist (axes 4-5-6)', 'le poignet (axes 4-5-6)'), cob.wr, 'z', 0.036, () => rotaryJoint({ drv: true, trq: true }), NOTE_COB),
      GRIP(V(0.5, 0.42, 0), 0.022), CAB(V(-0.6, 0, 0.35), 0.06)] },
    arm: { build: () => arm3({ h1: 0.42, L2: 0.45, L3: 0.45, r: 0.06 }), pose: V(0.55, 0.55, 0), targets: [
      tg(J('J1', 'axis 1, the base', 'l\'axe 1, la base'), V(0, 0.22, 0), 'y', 0.065, () => rotaryJoint({}), NOTE_IND),
      tg(J('J2', 'the shoulder (axis 2)', 'l\'épaule (axe 2)'), V(0, 0.42, 0), 'z', 0.064, () => rotaryJoint({}), NOTE_IND),
      tg(J('J3', 'the elbow (axis 3)', 'le coude (axe 3)'), a3.el, 'z', 0.055, () => rotaryJoint({}), NOTE_IND),
      CAB(V(-0.75, 0, 0.4), 0.09)] },
    scara: { build: () => scara({ H: 0.42, L1: 0.34, L2: 0.3, r: 0.045, lo: 0.04, hi: 0.4 }), pose: V(0.45, 0.2, -0.25), targets: [
      tg(J('J1', 'joint 1 (the base)', 'l\'articulation 1 (la base)'), V(0, 0.45, 0), 'y', 0.05, () => rotaryJoint({}), L('A SCARA joint turns about a vertical axis: the arm stays rigid up and down, which makes it fast and precise for assembly.', 'Une articulation de SCARA tourne autour d\'un axe vertical : le bras reste rigide en hauteur, d\'où sa vitesse et sa précision en assemblage.')),
      tg(J('J2', 'joint 2 (the elbow)', 'l\'articulation 2 (le coude)'), V(0.339, 0.47, 0.029), 'y', 0.04, () => rotaryJoint({}), ''),
      tg(J('Z', 'the Z axis (the quill)', 'l\'axe Z (la colonne)'), V(0.45, 0.32, -0.25), 'y', 0.017, () => linearAxis(), L('The quill moves up and down with a ball screw, and a ball spline lets it turn for axis 4.', 'La colonne monte et descend avec une vis à billes, et une cannelure à billes la laisse tourner pour l\'axe 4.'), V(0, 1, 0)),
      GRIP(V(0.45, 0.2, -0.25), 0.02), CAB(V(-0.55, 0, 0.35), 0.075)] },
    delta: { build: () => delta({ Ht: 0.8, Rb: 0.13, rf: 0.25, re: 0.66, Re: 0.045, r: 0.03 }), pose: V(0, 0.25, 0), targets: [
      tg([L('one of the three motors', 'l\'un des trois moteurs'), L('Motor 1', 'Moteur 1')], V(0, 0.8, -0.13), 'x', 0.04, () => planetary({ arm: true, armAngle: Math.PI / 2 + 0.076 }), L('The three motors stay fixed on the frame: only light arms and rods move, which is why a Delta is so fast.', 'Les trois moteurs restent fixes sur le bâti : seuls des bras et des bielles légers bougent, d\'où la rapidité d\'un Delta.')),
      GRIP(V(0, 0.25, 0), 0.02), CAB(V(-0.7, 0, 0.4), 0.085)] },
    gantry: { build: () => gantry({ W: 1.7, D: 1.3, Hg: 1.05, r: 0.05 }), pose: V(0, 0.3, 0), targets: [
      tg([L('the X axis', 'l\'axe X'), 'X'], V(0, 1.08, 0.65), 'x', 0.085, () => linearAxis(), L('Each axis of a gantry is a straight line: the same set of parts, only the length changes.', 'Chaque axe d\'un portique est une ligne droite : les mêmes pièces, seule la longueur change.'), V(1, 0, 0)),
      tg([L('the Y axis', 'l\'axe Y'), 'Y'], V(0, 1.14, 0), 'z', 0.065, () => linearAxis(), L('The Y axis runs along the bridge and carries the vertical Z axis.', 'L\'axe Y court le long du pont et porte l\'axe vertical Z.'), V(0, 0, 1)),
      tg([L('the Z axis', 'l\'axe Z'), 'Z'], V(0, 0.75, 0), 'y', 0.042, () => linearAxis(), L('The Z axis moves the tool up and down; its motor has a brake so the load cannot fall.', 'L\'axe Z monte et descend l\'outil ; son moteur a un frein pour que la charge ne tombe pas.'), V(0, 1, 0)),
      GRIP(V(0, 0.3, 0), 0.03), CAB(V(-1.15, 0, 0.5), 0.1)] },
    mobile: { amr: true, targets: [
      tg([L('a drive wheel', 'une roue motrice'), L('Drive wheel', 'Roue motrice')], V(0, 0.9 * 0.075, 0.9 * 0.35 - 0.02), 'z', 0.026, () => planetary({ wheel: true }), L('Each drive wheel is a motor, a gearbox and an encoder in one block; two of them, driven at different speeds, steer the robot.', 'Chaque roue motrice réunit moteur, réducteur et codeur en un bloc ; deux roues entraînées à des vitesses différentes font tourner le robot.')),
      tg([L('the body: battery and electronics', 'le châssis : batterie et électronique'), L('Battery and electronics', 'Batterie et électronique')], V(0, 0.055, 0), 'up', 0.1, () => mobileBox(), L('Under the cover: the energy, the brain and the safety of the robot.', 'Sous le capot : l\'énergie, le cerveau et la sécurité du robot.'))] }
  };
})();

// ---------------------------------------------------------------- the widget
function mount(host) {
  const R = ROB[host.dataset.robot]; if (!R) return;
  let T = R.targets[0];
  const LAYERS = [
    [L('The whole robot', 'Le robot entier'), ''],
    [L('The part', 'La partie'), L('It has three jobs: move the next part with force and precision, hold it still when stopped, and always know where it is. The orange housing hides a stack of parts lined up on one axis.', 'Elle a trois missions : déplacer la pièce suivante avec force et précision, la tenir immobile à l\'arrêt, et toujours savoir où elle est. Le carter orange cache un empilement de pièces alignées sur un axe.')],
    [L('The cover comes off', 'Le capot s\'ouvre'), L('Without the housing you see the real parts in place. Click any part to read its name and role.', 'Sans le carter, on voit les vraies pièces en place. Cliquez sur une pièce pour lire son nom et son rôle.')],
    [L('Exploded view: every part', 'Vue éclatée : toutes les pièces'), L('The parts move apart along the axis, in the order they are assembled. Click a label or a part.', 'Les pièces s\'écartent le long de l\'axe, dans l\'ordre du montage. Cliquez sur une étiquette ou une pièce.')],
    [L('How it works', 'Comment ça marche'), '']
  ];
  const HOW = {
    rot: L('The motor turns fast but with little force. The wave generator bends the flexspline, which has 2 teeth fewer than the rigid ring: each motor turn shifts it back by 2 teeth, so the output turns 100 times slower and about 100 times stronger (watch the two orange marks). The encoder counts 131 072 steps per motor turn, and the brake coil stays powered so the brake is released.', 'Le moteur tourne vite mais avec peu de force. Le générateur d\'onde déforme la flexspline, qui a 2 dents de moins que la couronne : chaque tour moteur la décale de 2 dents, donc la sortie tourne 100 fois moins vite et environ 100 fois plus fort (regardez les deux repères orange). Le codeur compte 131 072 pas par tour moteur, et la bobine du frein reste alimentée pour le relâcher.'),
    lin: L('The motor turns the ball screw; the balls rolling in the nut turn this rotation into a straight motion: one turn = 20 mm. The carriage glides on the two rails, and the limit switches mark both ends.', 'Le moteur fait tourner la vis à billes ; les billes qui roulent dans l\'écrou transforment cette rotation en mouvement droit : un tour = 20 mm. Le chariot glisse sur les deux rails, et les fins de course marquent les deux bouts.'),
    grip: L('The motor turns the lead screw through the gearbox; its two opposite threads bring the jaws together. When the pads touch the part, the current rises: the drive stops at the chosen force and the sensor says "part held".', 'Le moteur fait tourner la vis à travers le réducteur ; ses deux pas opposés rapprochent les mors. Quand les patins touchent la pièce, le courant monte : le variateur s\'arrête à la force choisie et le capteur dit « pièce tenue ».'),
    cab: L('The mains comes in through the main switch, the 24 V supply feeds the electronics, the controller computes the motion every millisecond and sends it to the six drives, which feed the motors. The safety relay can cut the motor power at any moment, and the fans keep it all cool.', 'Le secteur entre par le sectionneur, l\'alimentation 24 V alimente l\'électronique, le contrôleur calcule le mouvement chaque milliseconde et l\'envoie aux six variateurs, qui alimentent les moteurs. Le relais de sécurité peut couper la puissance des moteurs à tout moment, et les ventilateurs refroidissent le tout.'),
    bat: L('The battery and its BMS give the energy; the computer builds the map and plans the path; the drivers turn the speed orders into motor currents; the LiDAR spins to see all around and stops the robot if someone is too close.', 'La batterie et son BMS fournissent l\'énergie ; l\'ordinateur construit la carte et planifie le trajet ; les drivers transforment les consignes de vitesse en courant moteur ; le LiDAR tourne pour voir tout autour et arrête le robot si quelqu\'un est trop près.'),
    pla: L('The motor turns the small sun gear; the three planets roll inside the fixed ring and carry the planet carrier round: it turns 5 times slower and 5 times stronger. The encoder at the back counts the motor turns.', 'Le moteur fait tourner le petit pignon solaire ; les trois satellites roulent dans la couronne fixe et entraînent le porte-satellites : il tourne 5 fois moins vite et 5 fois plus fort. Le codeur à l\'arrière compte les tours du moteur.')
  };
  host.innerHTML = `<div class="insd-targets" role="group" aria-label="${L('Part to open', 'Partie à ouvrir')}">${R.targets.map((t2, i) => `<button type="button" data-t="${i}">${t2.name[1]}</button>`).join('')}</div><div class="insd-stage"><div class="insd-tags"></div><div class="insd-read" hidden></div><div class="insd-pop" hidden><button type="button" class="insd-x" aria-label="${L('Close', 'Fermer')}">×</button><span></span><b></b><p></p></div><p class="insd-hint">${L('Drag to turn · scroll to zoom', 'Glisser pour tourner · molette pour zoomer')}</p></div>
    <nav class="insd-step" aria-label="${L('Steps', 'Étapes')}"><button type="button" class="insd-prev" aria-label="${L('Previous step', 'Étape précédente')}">‹</button><ol class="insd-dots">${LAYERS.map((l, i) => `<li><button type="button" aria-label="${i + 1}. ${l[0]}"></button></li>`).join('')}</ol><button type="button" class="insd-next" aria-label="${L('Next step', 'Étape suivante')}">›</button></nav>
    <div class="insd-card"><span class="insd-n"></span><h3></h3><p></p></div>
    <div class="insd-parts"></div><div class="insd-detail" hidden></div>`;
  const stage = host.querySelector('.insd-stage'), tagsEl = host.querySelector('.insd-tags'), readEl = host.querySelector('.insd-read');
  const pop = host.querySelector('.insd-pop'); pop.querySelector('.insd-x').addEventListener('click', () => { if (sel) pick(sel); });
  const card = host.querySelector('.insd-card'), partsEl = host.querySelector('.insd-parts'), detail = host.querySelector('.insd-detail');

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.005, 40);
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  const orbit = new OrbitControls(camera, renderer.domElement); orbit.enableDamping = true; orbit.enablePan = false;
  scene.add(new THREE.HemisphereLight('#ffffff', '#555a60', 1.15));
  const sun = new THREE.DirectionalLight('#ffffff', 2.0); sun.position.set(2, 4, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.1, far: 12 }); scene.add(sun);
  const fill = new THREE.DirectionalLight('#cfe0ff', 0.7); fill.position.set(-3, 1.5, -2); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), M('#7d8691', { roughness: 1 })); floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(2.6, 13, '#c3cad3', '#a3acb7'); grid.position.y = 0.001; scene.add(grid);
  const isLight = () => (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'light';
  const paint = () => { const Lt = isLight(); scene.background = new THREE.Color(Lt ? '#d9dde3' : '#262626'); floor.material.color.set(Lt ? '#7d8691' : '#2b2e33'); grid.material.opacity = Lt ? 1 : 0.35; grid.material.transparent = true; host.classList.toggle('light', Lt); };
  paint(); new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // robot (own materials so they can fade without touching the other demos)
  let robot;
  if (R.amr) { robot = { root: makeAMR(0.9) }; } else { robot = R.build(); robot.reach(R.pose); }
  scene.add(robot.root);
  const robotMats = [];
  robot.root.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; robotMats.push(m.material); m.castShadow = m.receiveShadow = true; } });
  const setRobotFade = (o) => robotMats.forEach((m) => { m.opacity = o; m.depthWrite = o > 0.9; });

  // the mechanism of the chosen part, placed where it sits in the robot
  const box3 = new THREE.Box3().setFromObject(robot.root), rc = box3.getCenter(V(0, 0, 0)), rs = box3.getSize(V(0, 0, 0)).length();
  let mech, holder, axisW, S, SHOTS = [];
  function placeTarget() {
    if (holder) { scene.remove(holder); }
    mech = T.mech(); holder = new THREE.Group(); holder.add(mech.g); holder.position.copy(T.at); holder.scale.setScalar(T.k);
    const ax = T.axis;
    if (mech.linear) { if (ax === 'z') holder.rotation.y = -Math.PI / 2; else if (ax === 'y') holder.rotation.z = Math.PI / 2; }
    else if (ax === 'y') holder.rotation.x = -Math.PI / 2; else if (ax === 'x') holder.rotation.y = Math.PI / 2; else if (ax === 'down') holder.rotation.x = Math.PI / 2;
    scene.add(holder);
    mech.g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    axisW = ax === 'y' || ax === 'down' ? V(0, 1, 0) : ax === 'x' ? V(1, 0, 0) : ax === 'up' ? V(0, 0, 1) : V(0, 0, 1);
    const box = ax === 'up';                                        // a cabinet or the body of a mobile robot: looked at from the front
    const side = box ? V(0.55, 0.55, 1) : axisW.y > 0.5 ? V(1, 0.35, 0.75) : axisW.x > 0.5 ? V(0.45, 0.5, 1) : V(1, 0.45, 0.42); side.normalize(); S = T.k * mech.len;
    const mid = box ? T.at.clone().add(V(0, mech.kind === 'cab' ? 3.2 * T.k : 1.2 * T.k, 0)) : T.at;
    SHOTS = [
      { at: rc, d: rs * 1.75, dir: V(1, 0.6, 1.1).normalize() },
      { at: mid, d: S * 2.4, dir: side },
      { at: mid.clone().add(V(0, S * 0.15, 0)), d: S * 2.5, dir: side },
      box ? { at: mid, d: S * 3.0, dir: V(0.25, 0.45, 1).normalize() }
        : { at: mech.linear ? mid : mid.clone().addScaledVector(axisW, S * (axisW.y > 0.5 ? (ax === 'down' ? -0.3 : 0.3) : 0.12)), d: S * (mech.linear ? 2.6 : axisW.y > 0.5 ? 4.0 : 3.0), dir: mech.linear ? (ax === 'y' ? V(1, 0.2, 0.5) : ax === 'z' ? V(1, 0.7, 0.25) : V(0.2, 0.75, 1)).normalize() : (axisW.y > 0.5 ? V(1, 0.15, 0.2) : axisW.x > 0.5 ? V(0.15, 0.35, 1) : V(1, 0.35, 0.15)).normalize() },
      { at: mid, d: S * 2.2, dir: V(side.x, side.y + 0.15, side.z).normalize() }
    ];
    partsEl.innerHTML = mech.ids.map((id, i) => `<button type="button" data-p="${id}"><b>${i + 1}</b>${PART[id][0]}</button>`).join('');
    tagsEl.innerHTML = '<svg class="insd-lines"></svg>' + mech.parts.map((p, i) => `<button type="button" data-p="${p.id}"><b>${i + 1}</b>${PART[p.id][0]}</button>`).join('');
    sel = null; pop.hidden = true; detail.hidden = true; th = 0; t = 0;
    if (robot.reach) robot.reach(R.pose);
    mech.run(0, 0, false);
    LAYERS[0][1] = L(`We are going inside ${T.name[0]}. Choose another part above, or use the arrows to dive in, one step at a time.`, `Nous allons entrer dans ${T.name[0]}. Choisissez une autre partie au-dessus, ou utilisez les flèches pour plonger, une étape à la fois.`);
    host.querySelectorAll('.insd-targets button').forEach((b2) => b2.setAttribute('aria-pressed', String(R.targets[+b2.dataset.t] === T)));
  }

  let layer = 0, sel = null, th = 0, t = 0;
  let camFrom = null, camK = 1;
  function shotCam(i) { const s = SHOTS[i], narrow = Math.max(1, (i === 3 ? 1.5 : 1.15) / camera.aspect); return { p: s.at.clone().addScaledVector(s.dir, s.d * narrow), t: s.at.clone() }; }   // narrow screens: step back
  function go(i) {
    layer = Math.max(0, Math.min(LAYERS.length - 1, i));
    camFrom = { p: camera.position.clone(), t: orbit.target.clone() }; camK = 0;
    host.querySelectorAll('.insd-dots button').forEach((b, k) => { if (k === layer) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    host.querySelector('.insd-prev').disabled = layer === 0; host.querySelector('.insd-next').disabled = layer === LAYERS.length - 1;
    card.querySelector('.insd-n').textContent = `${layer + 1} / ${LAYERS.length}`;
    card.querySelector('h3').textContent = LAYERS[layer][0];
    card.querySelector('p').textContent = layer === 4 ? HOW[mech.kind] : layer === 1 && T.note ? LAYERS[1][1] + ' ' + T.note : LAYERS[layer][1];
    readEl.hidden = layer !== 4; partsEl.hidden = layer < 2;
  }
  // part chips + detail
  const pick = (id) => {
    sel = sel === id ? null : id;
    partsEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === sel)));
    tagsEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.p === sel));
    mech.g.traverse((m) => { if (m.isMesh && m.userData.part && m.material.emissive) { if (!m.userData.baseMat) m.userData.baseMat = m.material; m.material = m.userData.part === sel ? hl(m.userData.baseMat) : m.userData.baseMat; } });
    detail.hidden = !sel; if (sel) detail.innerHTML = `<b>${PART[sel][0]}</b><p>${PART[sel][1]}</p>`;
    pop.hidden = !sel; if (sel) { pop.querySelector('span').textContent = (mech.ids.indexOf(sel) + 1) + ''; pop.querySelector('b').textContent = PART[sel][0]; pop.querySelector('p').textContent = PART[sel][1]; }
  };
  const hlCache = new Map(); const hl = (m) => { if (!hlCache.has(m)) { const c = m.clone(); c.emissive = new THREE.Color('#6d5dfc'); c.emissiveIntensity = 0.55; hlCache.set(m, c); } return hlCache.get(m); };
  partsEl.addEventListener('click', (e) => { const b = e.target.closest('button[data-p]'); if (b) pick(b.dataset.p); });
  tagsEl.addEventListener('click', (e) => { const b = e.target.closest('button[data-p]'); if (b) pick(b.dataset.p); });
  // click on a part in 3D
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || layer < 2) return;
    const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); const hit = ray.intersectObject(mech.g, true).find((h) => h.object.visible && h.object.userData.part && h.object.userData.part !== 'cov'); if (hit) pick(hit.object.userData.part);
  });
  host.querySelector('.insd-prev').addEventListener('click', () => go(layer - 1));
  host.querySelector('.insd-next').addEventListener('click', () => go(layer + 1));
  host.querySelectorAll('.insd-dots button').forEach((b, k) => b.addEventListener('click', () => go(k)));

  // ------------------------------------------------ per-frame: ease the scene towards the current layer
  const st = { fade: 1, cover: 1, lift: 0, explode: 0, mech: 0 };
  const goal = () => ({ fade: layer === 0 ? 1 : layer === 3 ? 0.05 : 0.12, cover: layer <= 1 ? 1 : 0, lift: layer === 2 ? 1 : layer > 2 ? 1.6 : 0, explode: layer === 3 ? 1 : 0, mech: layer === 0 ? 0 : 1 });
  const tmp = V(0, 0, 0), proj = V(0, 0, 0);
  function frame(dt) {
    const gl = goal(), k = Math.min(1, dt * 3.2);
    for (const key in st) st[key] += (gl[key] - st[key]) * k;
    setRobotFade(st.fade);
    holder.visible = st.mech > 0.02;
    if (mech.cover) {                                           // the housing: closed at step 2, lifts off and fades at step 3
      if (mech.cover.userData.y0 === undefined) mech.cover.userData.y0 = mech.cover.position.y;
      const up = st.lift * 2.6, op = 0.88 * (1 - Math.min(1, st.lift / 1.2));
      mech.cover.material.opacity = op; mech.cover.visible = op > 0.02 && layer > 0; mech.lids.forEach((l) => { l.visible = mech.cover.visible; l.position.y = up; });
      mech.cover.position.y = mech.cover.userData.y0 + (mech.kind === 'cab' ? 0 : up); if (mech.kind === 'cab') mech.cover.position.z = 1.1 + st.lift * 2.5; }
    for (const p of mech.parts) { p.obj.position.copy(p.home).addScaledVector(p.ex, st.explode); if (p.obj.userData.dx !== undefined) p.obj.position.x += p.obj.userData.dx * (1 - st.explode); }
    if (layer === 4 && st.explode < 0.05) { th += dt * (mech.linear ? 7 : 2 * Math.PI * 1.6); t += dt; mech.run(th, t, true); if (mech.linear && T.link && robot.reach) robot.reach(R.pose.clone().addScaledVector(T.link, (mech.g.userData.x || 0) * T.k)); /* the robot moves with the carriage */ readEl.innerHTML = mech.read(th, t).map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join(''); }
    // labels in the exploded view
    tagsEl.hidden = !(layer === 3 && st.explode > 0.8);
    if (!tagsEl.hidden) { const r = stage.getBoundingClientRect();
      callouts(tagsEl, [...tagsEl.querySelectorAll('button')].map((b) => { const p = mech.parts.find((q) => q.id === b.dataset.p); new THREE.Box3().setFromObject(p.obj).getCenter(tmp); proj.copy(tmp).project(camera); return { el: b, x: (proj.x + 1) / 2 * r.width, y: (1 - proj.y) / 2 * r.height }; }), r.width, r.height); }
    // camera
    if (camK < 1 && camFrom) { camK = Math.min(1, camK + dt / 1.3); const e = ease(camK), s = shotCam(layer); camera.position.copy(camFrom.p.clone().lerp(s.p, e)); orbit.target.copy(camFrom.t.clone().lerp(s.t, e)); }
  }
  function resize() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = camera.aspect < 0.9 ? 52 : 35; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(stage); resize();
  let visible = true, last = performance.now();
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(stage);
  host.querySelectorAll('.insd-targets button').forEach((b2) => b2.addEventListener('click', () => { T = R.targets[+b2.dataset.t]; placeTarget(); go(layer === 0 ? 1 : Math.min(layer, 2)); }));
  placeTarget();
  const s0 = shotCam(0); camera.position.copy(s0.p); orbit.target.copy(s0.t);
  go(0);
  renderer.setAnimationLoop((now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!visible) return; frame(dt); orbit.update(); renderer.render(scene, camera); });
  host.__target = (i) => { T = R.targets[i]; placeTarget(); };
  host.__go = (i) => { go(i); camK = 1; const s = shotCam(i); camera.position.copy(s.p); orbit.target.copy(s.t); for (let n = 0; n < 90; n++) frame(1 / 30); };
}
document.querySelectorAll('.insdemo').forEach(mount);
