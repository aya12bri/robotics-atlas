// Medical robotics — the 8 lessons (from the Master M2 course of P. Vieyres, Laboratoire PRISME, Université d'Orléans).
import { P, H4, UL, OL, EQ, BOX, TABLE, lesson } from '../lib.mjs';
import { chain, COL as C } from '../practice/fig.mjs';
import { timeline, trocar, comanip, teleEcho } from './med-figs.mjs';
const PRE = 'med-';
const ONE = (en, fr) => BOX('idea', ['In one sentence', 'En une phrase'], P(en, fr));
const FIGO = (o) => `<figure class="figure"><svg viewBox="${o.vb}" class="fig" role="img" aria-hidden="true">${o.svg}</svg></figure>`;

export function lessons() {
  return [
// ------------------------------------------------------------------------------------------------ 1
lesson(PRE, 1, {
  title: ['From the surgeon\'s hand to the robot: a short history', 'De la main du chirurgien au robot : une courte histoire'],
  time: 25,
  goal: ['how surgery became modern (anaesthesia, antisepsis, antibiotics), how imaging and minimally invasive surgery changed it, and the main milestones of medical robots since 1985.', 'comment la chirurgie est devenue moderne (anesthésie, antisepsie, antibiotiques), comment l\'imagerie et la chirurgie mini-invasive l\'ont changée, et les grandes étapes des robots médicaux depuis 1985.'],
  body: [
    ONE('Medical robots came last, on top of anaesthesia, imaging and minimally invasive surgery: they extend the hands and the eyes of the doctor, they do not replace them.', 'Les robots médicaux sont arrivés en dernier, par-dessus l\'anesthésie, l\'imagerie et la chirurgie mini-invasive : ils prolongent les mains et les yeux du médecin, ils ne les remplacent pas.'),
    H4('1.1 Four steps to the robot', '1.1 Quatre étapes jusqu\'au robot'),
    TABLE([['Step', 'Étape'], ['What changed', 'Ce qui a changé'], ['Landmarks', 'Repères']], [
      [['modern surgery', 'chirurgie moderne'], ['operating without pain, without infection', 'opérer sans douleur, sans infection'], ['anaesthetics, antiseptics, anticoagulants, antibiotics, analgesics (19th–20th c.)', 'anesthésiques, antiseptiques, anticoagulants, antibiotiques, antalgiques (XIXe–XXe s.)']],
      [['medical imaging', 'imagerie médicale'], ['seeing inside the body', 'voir à l\'intérieur du corps'], ['X-rays 1895, ultrasound 1947–49, CT scanner 1975, first MRI image of a human 1977', 'rayons X 1895, ultrasons 1947–49, scanner 1975, première image IRM humaine 1977']],
      [['minimally invasive surgery', 'chirurgie mini-invasive'], ['operating through small holes with a camera', 'opérer par de petits trous avec une caméra'], ['1987: first video laparoscopic gallbladder removal (Mouret, Lyon)', '1987 : première ablation de la vésicule biliaire sous cœlioscopie vidéo (Mouret, Lyon)']],
      [['robotics', 'robotique'], ['computer-assisted gestures, at a distance', 'gestes assistés par ordinateur, à distance'], ['computer-assisted surgery, teleoperation, co-manipulation', 'chirurgie assistée par ordinateur, téléopération, comanipulation']]
    ]),
    H4('1.2 The milestones of medical robots', '1.2 Les grandes étapes des robots médicaux'),
    FIGO(timeline()),
    P('In 1930 the president of the Royal College of Surgeons of England said that surgery had “almost reached its limits”. Minimally invasive surgery and robots proved him wrong — but, as the course insists, with <strong>very few commercial successes</strong> for many prototypes: a medical robot must prove a real benefit for the patient, at an acceptable cost.', 'En 1930 le président du Royal College of Surgeons of England affirmait que la chirurgie avait « presque atteint ses limites ». La chirurgie mini-invasive et les robots lui ont donné tort — mais, comme le cours y insiste, avec <strong>très peu de réussites commerciales</strong> pour beaucoup de prototypes : un robot médical doit prouver un vrai bénéfice pour le patient, à un coût acceptable.'),
    BOX('note', ['What this course is about', 'De quoi parle ce cours'], P('Robots for interventional procedures and minimally invasive surgery: mostly <strong>manipulators</strong> (arms), with teleoperation, co-manipulation and imaging. Mobile robots in hospitals (logistics, disinfection) are only mentioned.', 'Les robots pour les gestes interventionnels et la chirurgie mini-invasive : surtout des <strong>manipulateurs</strong> (bras), avec la téléopération, la comanipulation et l\'imagerie. Les robots mobiles à l\'hôpital (logistique, désinfection) sont seulement cités.'))
  ],
  terms: [['minimally invasive surgery (MIS)', 'chirurgie mini-invasive'], ['laparoscopy', 'cœlioscopie (laparoscopie)'], ['computer-assisted surgery', 'chirurgie assistée par ordinateur'], ['teleoperation', 'téléopération'], ['co-manipulation', 'comanipulation']],
  quiz: [
    ['What made minimally invasive surgery possible?', 'Qu\'est-ce qui a rendu possible la chirurgie mini-invasive ?', 'Endoscopic instruments and a video camera: the surgeon operates through small holes while watching a screen.', 'Les instruments endoscopiques et une caméra vidéo : le chirurgien opère par de petits trous en regardant un écran.'],
    ['Which robot made robotic minimally invasive surgery common?', 'Quel robot a rendu courante la chirurgie mini-invasive robotisée ?', 'The da Vinci robot (Intuitive Surgical), cleared in 2000.', 'Le robot da Vinci (Intuitive Surgical), autorisé en 2000.'],
    ['What was Operation Lindbergh (2001)?', 'Qu\'était l\'opération Lindbergh (2001) ?', 'A gallbladder removal on a patient in Strasbourg by a surgeon in New York, through a teleoperated robot (Zeus).', 'Une ablation de la vésicule biliaire sur une patiente à Strasbourg par un chirurgien à New York, via un robot téléopéré (Zeus).']
  ]
}),
// ------------------------------------------------------------------------------------------------ 2
lesson(PRE, 2, {
  title: ['Why a robot? Keeping the doctor in the loop', 'Pourquoi un robot ? Garder le médecin dans la boucle'],
  time: 25,
  goal: ['what a robot does better than a hand, what a human does better than a robot, and why medical robots are almost always assistants: teleoperated or co-manipulated, never fully autonomous.', 'ce qu\'un robot fait mieux qu\'une main, ce qu\'un humain fait mieux qu\'un robot, et pourquoi les robots médicaux sont presque toujours des assistants : téléopérés ou comanipulés, jamais complètement autonomes.'],
  body: [
    ONE('The robot brings precision and steadiness, the doctor brings judgement: medical robotics is robotic assistance, with the practitioner in the loop.', 'Le robot apporte la précision et la stabilité, le médecin apporte le jugement : la robotique médicale est une assistance robotique, avec le praticien dans la boucle.'),
    TABLE([['The robot', 'Le robot'], ['The human expert', 'L\'expert humain']], [
      [['speed, precision, repeatability', 'vitesse, précision, répétabilité'], ['analyses a situation and decides', 'analyse une situation et décide']],
      [['follows a trajectory automatically', 'suit une trajectoire automatiquement'], ['adapts, even improvises', 's\'adapte, voire improvise']],
      [['respects limits of position, speed and force', 'respecte des limites de position, de vitesse et d\'effort'], ['teaches and trains others', 'enseigne et forme les autres']],
      [['fuses several images and sensors in real time', 'fusionne plusieurs images et capteurs en temps réel'], ['combines complex information from many sources', 'combine des informations complexes de nombreuses sources']],
      [['records every movement', 'enregistre chaque mouvement'], ['takes the responsibility', 'prend la responsabilité']]
    ]),
    H4('2.1 Teleoperation: the doctor at a distance', '2.1 La téléopération : le médecin à distance'),
    FIGO(chain([[['Doctor', 'Médecin'], C.b], [['Master arm', 'Bras maître'], C.p], [['Network', 'Réseau'], C.axis], [['Slave robot', 'Robot esclave'], C.o], [['Patient', 'Patient'], C.g]], { w: 720, fb: [0, ['images (ultrasound, endoscope) and force feedback', 'images (échographie, endoscope) et retour d\'effort']] })),
    UL([
      ['<strong>Scaling</strong> of movements and forces: 3 cm of the hand can become 1 cm at the tool.', '<strong>Démultiplication</strong> des mouvements et des efforts : 3 cm de la main peuvent devenir 1 cm à l\'outil.'],
      ['<strong>Richer feedback</strong>: magnified 3D image, force feedback (haptics).', '<strong>Retour sensoriel enrichi</strong> : image 3D agrandie, retour d\'effort (haptique).'],
      ['<strong>Action at a distance</strong> or in a hostile place (radiation).', '<strong>Action à distance</strong> ou dans un lieu hostile (rayonnements).'],
      ['<strong>More degrees of freedom</strong> and dexterity: a wrist at the tip of the instrument, inside the body.', '<strong>Plus de degrés de liberté</strong> et de dextérité : un poignet au bout de l\'instrument, dans le corps.'],
      ['<strong>Filtering</strong> of tremor and compensation of physiological motion (breathing, heartbeat).', '<strong>Filtrage</strong> du tremblement et compensation des mouvements physiologiques (respiration, battements du cœur).']
    ]),
    EQ('<i>x</i><sub>tool</sub> = <i>x</i><sub>hand</sub> / <i>k</i> &emsp; (scaling factor <i>k</i>, e.g. 3)', '<i>x</i><sub>outil</sub> = <i>x</i><sub>main</sub> / <i>k</i> &emsp; (facteur de démultiplication <i>k</i>, ex. 3)'),
    P('The physiological tremor of the hand is a small oscillation of about 8 to 12 Hz, while voluntary surgical gestures are much slower (a few hertz at most). A low-pass filter on the master signal removes the tremor and keeps the gesture.', 'Le tremblement physiologique de la main est une petite oscillation d\'environ 8 à 12 Hz, alors que les gestes chirurgicaux volontaires sont bien plus lents (quelques hertz au plus). Un filtre passe-bas sur le signal du maître enlève le tremblement et garde le geste.')
  ],
  terms: [['robotic assistance', 'assistance robotique'], ['master / slave', 'maître / esclave'], ['motion scaling', 'démultiplication des mouvements'], ['haptic feedback', 'retour haptique'], ['tremor filtering', 'filtrage du tremblement']],
  quiz: [
    ['Give two things a human does better than a robot in the operating room.', 'Citez deux choses qu\'un humain fait mieux qu\'un robot au bloc opératoire.', 'Analysing a situation and deciding; adapting or improvising (also: teaching, combining complex information).', 'Analyser une situation et décider ; s\'adapter ou improviser (aussi : enseigner, combiner des informations complexes).'],
    ['With a scaling factor of 5, how far does the tool move when the hand moves 10 mm?', 'Avec une démultiplication de 5, de combien bouge l\'outil quand la main bouge de 10 mm ?', '2 mm.', '2 mm.'],
    ['Why can a low-pass filter remove the tremor without removing the gesture?', 'Pourquoi un filtre passe-bas peut-il enlever le tremblement sans enlever le geste ?', 'Because the tremor (8–12 Hz) is much faster than voluntary gestures (a few hertz).', 'Parce que le tremblement (8–12 Hz) est bien plus rapide que les gestes volontaires (quelques hertz).']
  ]
}),
// ------------------------------------------------------------------------------------------------ 3
lesson(PRE, 3, {
  title: ['Degrees of freedom and the fixed point of the trocar', 'Degrés de liberté et point fixe du trocart'],
  time: 30,
  goal: ['what degrees of freedom and the configuration space mean for a medical robot, why an instrument through a trocar keeps only 4 of them, the fulcrum effect, and the remote centre of motion (RCM) that surgical robots are built around.', 'ce que veulent dire degrés de liberté et espace des configurations pour un robot médical, pourquoi un instrument passé par un trocart n\'en garde que 4, l\'effet levier, et le centre de rotation déporté (RCM) autour duquel sont construits les robots chirurgicaux.'],
  body: [
    ONE('In minimally invasive surgery the instrument must pivot about the hole in the skin: the robot is built so that this point never moves.', 'En chirurgie mini-invasive l\'instrument doit pivoter autour du trou dans la peau : le robot est construit pour que ce point ne bouge jamais.'),
    H4('3.1 Degrees of freedom', '3.1 Degrés de liberté'),
    P('In anatomy, each possible movement at a joint is a degree of freedom (DOF); a robot is the same. A 2-DOF arm (2 joints, 2 links) has a 2-dimensional <strong>configuration space</strong> (θ₁, θ₂): every point of it is one posture, and an obstacle in the room becomes a forbidden region of this space (see the singularities and the intelligence courses).', 'En anatomie, chaque mouvement possible d\'une articulation est un degré de liberté (DDL) ; pour un robot c\'est pareil. Un bras à 2 DDL (2 articulations, 2 segments) a un <strong>espace des configurations</strong> à 2 dimensions (θ₁, θ₂) : chacun de ses points est une posture, et un obstacle dans la salle devient une zone interdite de cet espace (voir les cours sur les singularités et sur l\'intelligence).'),
    H4('3.2 The trocar removes 2 DOF', '3.2 Le trocart enlève 2 DDL'),
    FIGO(trocar()),
    P('A rigid body has 6 DOF. Through the trocar the instrument cannot move sideways at the wall: the 2 sideways translations are lost. 4 DOF remain: 2 tilts around the trocar, the insertion along the instrument, and the rotation about its own axis. To get the 6 DOF back <em>inside</em> the body, robots add a small wrist at the tip of the instrument (the EndoWrist of the da Vinci).', 'Un solide a 6 DDL. À travers le trocart l\'instrument ne peut pas se déplacer latéralement au niveau de la paroi : les 2 translations latérales sont perdues. Il reste 4 DDL : 2 inclinaisons autour du trocart, l\'insertion le long de l\'instrument, et la rotation autour de son propre axe. Pour retrouver 6 DDL <em>dans</em> le corps, les robots ajoutent un petit poignet au bout de l\'instrument (l\'EndoWrist du da Vinci).'),
    H4('3.3 The fulcrum effect', '3.3 L\'effet levier'),
    EQ('<i>d</i><sub>tip</sub> = − <i>d</i><sub>hand</sub> × <i>L</i><sub>in</sub> / <i>L</i><sub>out</sub>', '<i>d</i><sub>pointe</sub> = − <i>d</i><sub>main</sub> × <i>L</i><sub>int</sub> / <i>L</i><sub>ext</sub>'),
    P('The trocar is a pivot: when the hand goes left the tip goes right (the minus sign), and the movement is multiplied by the ratio of the lengths inside and outside. This inversion is hard to learn; a robot computes it and gives back intuitive gestures.', 'Le trocart est un pivot : quand la main va à gauche la pointe va à droite (le signe moins), et le mouvement est multiplié par le rapport des longueurs à l\'intérieur et à l\'extérieur. Cette inversion est difficile à apprendre ; un robot la calcule et rend les gestes intuitifs.'),
    BOX('key', ['The remote centre of motion (RCM)', 'Le centre de rotation déporté (RCM)'], P('Surgical robots keep the instrument pivoting about the trocar either <strong>mechanically</strong> (a parallelogram whose fixed point is away from the robot, as on the da Vinci arms, or a spherical mechanism) or <strong>by software</strong> (a standard arm whose controller enforces the constraint). The mechanical solution is intrinsically safe: even a bug cannot tear the abdominal wall.', 'Les robots chirurgicaux font pivoter l\'instrument autour du trocart soit <strong>mécaniquement</strong> (un parallélogramme dont le point fixe est loin du robot, comme sur les bras du da Vinci, ou un mécanisme sphérique), soit <strong>par logiciel</strong> (un bras standard dont la commande impose la contrainte). La solution mécanique est intrinsèquement sûre : même un bug ne peut pas déchirer la paroi abdominale.'))
  ],
  terms: [['degree of freedom (DOF)', 'degré de liberté (DDL)'], ['configuration space', 'espace des configurations'], ['trocar', 'trocart'], ['fulcrum effect', 'effet levier'], ['remote centre of motion (RCM)', 'centre de rotation déporté (RCM)']],
  quiz: [
    ['How many DOF does an instrument keep through a trocar?', 'Combien de DDL garde un instrument passé par un trocart ?', '4: two tilts, insertion, rotation about its axis.', '4 : deux inclinaisons, l\'insertion, la rotation autour de son axe.'],
    ['Why does the tip move the opposite way to the hand?', 'Pourquoi la pointe bouge-t-elle dans le sens opposé à la main ?', 'Because the instrument pivots about the trocar, like a lever about its fulcrum.', 'Parce que l\'instrument pivote autour du trocart, comme un levier autour de son point d\'appui.'],
    ['Why is a mechanical RCM safer than a software one?', 'Pourquoi un RCM mécanique est-il plus sûr qu\'un RCM logiciel ?', 'Because the geometry itself keeps the fixed point: no software error can move it.', 'Parce que la géométrie elle-même garde le point fixe : aucune erreur logicielle ne peut le déplacer.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 4
lesson(PRE, 4, {
  title: ['Co-manipulation: the robot and the doctor hold the tool together', 'La comanipulation : le robot et le médecin tiennent l\'outil ensemble'],
  time: 25,
  goal: ['the three kinds of co-manipulation (parallel, serial, orthotic), what each one adds up, and what they bring: more force, more dexterity, more accuracy, guidance.', 'les trois types de comanipulation (parallèle, série, orthétique), ce que chacun additionne, et ce qu\'ils apportent : plus d\'effort, plus de dextérité, plus de précision, du guidage.'],
  body: [
    ONE('In co-manipulation the doctor keeps the tool in hand and the robot shares the gesture: it can steady it, guide it or forbid a zone.', 'En comanipulation le médecin garde l\'outil en main et le robot partage le geste : il peut le stabiliser, le guider ou interdire une zone.'),
    FIGO(comanip()),
    TABLE([['Kind', 'Type'], ['What adds up', 'Ce qui s\'additionne'], ['Example', 'Exemple']], [
      [['parallel', 'parallèle'], ['the forces on the tool: F = F<sub>human</sub> + F<sub>robot</sub>', 'les efforts sur l\'outil : F = F<sub>humain</sub> + F<sub>robot</sub>'], ['a cobot arm holding a needle with the radiologist; a patient positioning table guided by hand', 'un bras cobot qui tient une aiguille avec le radiologue ; une table de positionnement du patient guidée à la main']],
      [['serial', 'série'], ['the velocities: v<sub>tool</sub> = v<sub>hand</sub> + v<sub>robot</sub>', 'les vitesses : v<sub>outil</sub> = v<sub>main</sub> + v<sub>robot</sub>'], ['a hand-held instrument with an active tip that cancels tremor', 'un instrument tenu en main avec une pointe active qui annule le tremblement']],
      [['orthotic', 'orthétique'], ['the joint torques of the arm', 'les couples articulaires du bras'], ['an exoskeleton (rehabilitation, ReWalk)', 'un exosquelette (rééducation, ReWalk)']]
    ]),
    H4('4.1 Virtual guides', '4.1 Les guides virtuels'),
    P('A co-manipulated robot can create <strong>virtual fixtures</strong>: a forbidden region (a nerve, an artery) that the tool cannot enter, or a guide (a line, a cone) that pulls the tool towards the planned path. The doctor still moves the tool; the robot only resists or helps — exactly the force control of the control course (impedance), with the patient\'s anatomy as the reference.', 'Un robot comanipulé peut créer des <strong>guides virtuels</strong> : une zone interdite (un nerf, une artère) où l\'outil ne peut pas entrer, ou un guide (une ligne, un cône) qui attire l\'outil vers le chemin prévu. Le médecin bouge toujours l\'outil ; le robot ne fait que résister ou aider — exactement la commande en effort du cours de commande (impédance), avec l\'anatomie du patient comme référence.'),
    BOX('note', ['Link with the teleoperation course', 'Lien avec le cours de téléopération'], P('Co-manipulation is the medical side of cobotics (teleoperation, cobotics, architectures and safety course, lessons 7 and 8): same intrinsic safety, same force sensors, same human–robot sharing.', 'La comanipulation est le versant médical de la cobotique (cours téléopération, cobotique, architectures et sécurité, leçons 7 et 8) : même sécurité intrinsèque, mêmes capteurs d\'effort, même partage humain–robot.'))
  ],
  terms: [['parallel co-manipulation', 'comanipulation parallèle'], ['serial co-manipulation', 'comanipulation série'], ['orthotic co-manipulation (exoskeleton)', 'comanipulation orthétique (exosquelette)'], ['virtual fixture', 'guide virtuel'], ['impedance control', 'commande en impédance']],
  quiz: [
    ['In parallel co-manipulation, what adds up?', 'En comanipulation parallèle, qu\'est-ce qui s\'additionne ?', 'The forces applied on the tool by the human and by the robot.', 'Les efforts appliqués sur l\'outil par l\'humain et par le robot.'],
    ['Which kind is an exoskeleton?', 'De quel type est un exosquelette ?', 'Orthotic: the robot adds torques to the joints of the human arm or leg.', 'Orthétique : le robot ajoute des couples aux articulations du bras ou de la jambe.'],
    ['What is a virtual fixture?', 'Qu\'est-ce qu\'un guide virtuel ?', 'A constraint created by the robot\'s control: a zone the tool cannot enter, or a path it is pulled towards.', 'Une contrainte créée par la commande du robot : une zone où l\'outil ne peut pas entrer, ou un chemin vers lequel il est attiré.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 5
lesson(PRE, 5, {
  title: ['Constraints: safety, sterility, the operating room, regulation', 'Contraintes : sécurité, stérilité, bloc opératoire, réglementation'],
  time: 30,
  goal: ['what makes medical robotics harder than industrial robotics: zero accidents tolerated, sterility, the operating room, the long validation and the CE marking or FDA clearance.', 'ce qui rend la robotique médicale plus difficile que la robotique industrielle : zéro accident toléré, la stérilité, le bloc opératoire, la longue validation et le marquage CE ou l\'autorisation FDA.'],
  body: [
    ONE('A medical robot works next to a patient who cannot move away: safety comes first, then sterility, then the room, then the law.', 'Un robot médical travaille à côté d\'un patient qui ne peut pas s\'écarter : la sécurité d\'abord, puis la stérilité, puis la salle, puis la loi.'),
    H4('5.1 Safety: zero accidents', '5.1 Sécurité : zéro accident'),
    UL([
      ['a doctor in the loop, precise protocols, trained staff;', 'un médecin dans la boucle, des protocoles précis, un personnel formé ;'],
      ['clear, ergonomic interfaces; automatic initialisation; a procedure to disengage the robot and finish by hand;', 'des interfaces claires et ergonomiques ; une initialisation automatique ; une procédure pour débrayer le robot et finir à la main ;'],
      ['intrinsically safe architectures, mechanical and electrical fuses, redundant sensors;', 'des architectures intrinsèquement sûres, des fusibles mécaniques et électriques, des capteurs redondants ;'],
      ['limited workspace, speed and force; software tests and step-by-step validation of the medical procedure.', 'un espace de travail, une vitesse et un effort limités ; des tests logiciels et une validation pas à pas de la procédure médicale.']
    ]),
    H4('5.2 Sterility', '5.2 Stérilité'),
    TABLE([['Method', 'Méthode'], ['How', 'Comment'], ['For', 'Pour']], [
      [['autoclave', 'autoclave'], ['steam at 134 °C for 18 min', 'vapeur à 134 °C pendant 18 min'], ['metal instruments that resist heat', 'instruments métalliques qui résistent à la chaleur']],
      [['hydrogen peroxide plasma (Sterrad®)', 'plasma de peroxyde d\'hydrogène (Sterrad®)'], ['low temperature, about 50 °C', 'basse température, environ 50 °C'], ['some heat-sensitive devices', 'certains dispositifs sensibles à la chaleur']],
      [['single use, sterile packaging', 'usage unique, emballage stérile'], ['thrown away after one patient', 'jeté après un patient'], ['drapes covering the robot, some instruments', 'housses qui couvrent le robot, certains instruments']]
    ]),
    H4('5.3 The operating room', '5.3 Le bloc opératoire'),
    P('Small footprint; a workspace that the staff can see and understand (a SCARA-like structure is easier to read than a 6-axis arm); a system one person can move and install; easy entry and exit; maintenance and breakdown plans; electromagnetic compatibility with the other equipment.', 'Un faible encombrement ; un espace de travail que l\'équipe voit et comprend (une structure de type SCARA est plus lisible qu\'un bras 6 axes) ; un système qu\'une seule personne peut déplacer et installer ; une entrée et une sortie faciles ; des plans de maintenance et de panne ; la compatibilité électromagnétique avec les autres équipements.'),
    H4('5.4 Validation and regulation', '5.4 Validation et réglementation'),
    P('A medical robot is a <strong>medical device</strong>: it needs the CE marking in Europe (Medical Device Regulation 2017/745) or FDA clearance in the United States, after proving the medical benefit, the technical and economic feasibility, and the human factors. The course\'s honest warning: very few prototypes become products.', 'Un robot médical est un <strong>dispositif médical</strong> : il lui faut le marquage CE en Europe (règlement relatif aux dispositifs médicaux 2017/745) ou l\'autorisation de la FDA aux États-Unis, après avoir prouvé le bénéfice médical, la faisabilité technique et économique, et les facteurs humains. L\'avertissement honnête du cours : très peu de prototypes deviennent des produits.'),
    BOX('method', ['Four questions before starting a project', 'Quatre questions avant de commencer un projet'], OL([
      ['Does it rely on real, high-quality medical expertise?', 'S\'appuie-t-il sur une vraie expertise médicale de qualité ?'],
      ['Can the prototype become a certifiable system?', 'Le prototype peut-il devenir un système certifiable ?'],
      ['Will the robot objectively improve the doctor\'s gesture?', 'Le robot améliorera-t-il objectivement le geste du médecin ?'],
      ['Is that improvement significant for the patient or the staff?', 'Cette amélioration est-elle importante pour le patient ou le personnel ?']
    ]))
  ],
  terms: [['intrinsic safety', 'sécurité intrinsèque'], ['sterilisation, autoclave', 'stérilisation, autoclave'], ['medical device', 'dispositif médical'], ['CE marking, FDA', 'marquage CE, FDA'], ['human factors', 'facteurs humains']],
  quiz: [
    ['How is a metal instrument sterilised in an autoclave?', 'Comment stérilise-t-on un instrument métallique à l\'autoclave ?', 'With steam at 134 °C for 18 minutes.', 'À la vapeur, à 134 °C pendant 18 minutes.'],
    ['Why must a medical robot have a disengage procedure?', 'Pourquoi un robot médical doit-il avoir une procédure de débrayage ?', 'So that the team can remove it and finish the operation by hand if anything goes wrong.', 'Pour que l\'équipe puisse l\'enlever et finir l\'opération à la main si quelque chose se passe mal.'],
    ['Which European text governs medical robots?', 'Quel texte européen encadre les robots médicaux ?', 'The Medical Device Regulation (EU) 2017/745 (CE marking).', 'Le règlement (UE) 2017/745 relatif aux dispositifs médicaux (marquage CE).']
  ]
}),
// ------------------------------------------------------------------------------------------------ 6
lesson(PRE, 6, {
  title: ['Robots in the hospital today', 'Les robots à l\'hôpital aujourd\'hui'],
  time: 25,
  goal: ['the main families of medical robots: robotic minimally invasive surgery (da Vinci), orthopaedics, endoscope and light holders, radiosurgery and proton therapy, the hybrid operating room and exoskeletons.', 'les grandes familles de robots médicaux : chirurgie mini-invasive robotisée (da Vinci), orthopédie, porte-endoscopes et porte-éclairages, radiochirurgie et protonthérapie, salle hybride et exosquelettes.'],
  body: [
    ONE('Each family of medical robots answers one limit of the human hand: three hands needed, a bone to cut exactly, a beam to aim at a moving tumour.', 'Chaque famille de robots médicaux répond à une limite de la main humaine : trois mains nécessaires, un os à couper exactement, un faisceau à viser sur une tumeur qui bouge.'),
    H4('6.1 Why minimally invasive surgery needs help', '6.1 Pourquoi la chirurgie mini-invasive a besoin d\'aide'),
    P('Through small holes the surgeon needs three hands (two instruments and the camera), works in a restricted space with no touch feedback, loses mobility because of the trocars (lesson 3), sees with one eye on a flat screen, and must coordinate hand and eye in a reversed way. The da Vinci answers each point: a stable camera arm, 3D vision, wrists at the tip, scaling and tremor filtering.', 'Par de petits trous le chirurgien a besoin de trois mains (deux instruments et la caméra), travaille dans un espace restreint sans sensation de toucher, perd de la mobilité à cause des trocarts (leçon 3), voit d\'un seul œil sur un écran plat, et doit coordonner main et œil de façon inversée. Le da Vinci répond à chaque point : un bras de caméra stable, la vision 3D, des poignets au bout des instruments, la démultiplication et le filtrage du tremblement.'),
    TABLE([['Family', 'Famille'], ['Examples', 'Exemples'], ['What the robot does', 'Ce que fait le robot']], [
      [['robotic MIS', 'chirurgie mini-invasive robotisée'], ['da Vinci (3 then 4 arms, 2 consoles, Xi with 3D camera)', 'da Vinci (3 puis 4 bras, 2 consoles, Xi avec caméra 3D)'], ['teleoperated instruments with wrists, no force needed from the surgeon', 'instruments téléopérés avec poignets, aucun effort demandé au chirurgien']],
      [['holders: “the third hand”', 'porte-outils : « la troisième main »'], ['AESOP (voice-driven endoscope, 1994), ViKY, Surgiscope (microscope on a Delta robot), SMILE (lighting arm)', 'AESOP (endoscope commandé à la voix, 1994), ViKY, Surgiscope (microscope sur un robot Delta), SMILE (bras d\'éclairage)'], ['holds the camera, the microscope or the light steady', 'tient la caméra, le microscope ou la lumière immobile']],
      [['orthopaedics', 'orthopédie'], ['Robodoc, Caspar, Mazor', 'Robodoc, Caspar, Mazor'], ['cuts or drills bone exactly where the plan says, like a machine tool', 'coupe ou perce l\'os exactement où le plan l\'indique, comme une machine-outil']],
      [['radiosurgery, proton therapy', 'radiochirurgie, protonthérapie'], ['CyberKnife (1994), RoboCouch, Leoni Orion', 'CyberKnife (1994), RoboCouch, Leoni Orion'], ['aims an X-ray beam at the tumour; positions the patient precisely in front of the beam', 'vise la tumeur avec un faisceau de rayons X ; positionne le patient précisément face au faisceau']],
      [['hybrid operating room', 'salle hybride'], ['Siemens Zeego arm, IHU Strasbourg', 'bras Zeego de Siemens, IHU de Strasbourg'], ['moves the imaging device around the patient during surgery', 'déplace l\'appareil d\'imagerie autour du patient pendant l\'opération']],
      [['exoskeletons', 'exosquelettes'], ['ReWalk', 'ReWalk'], ['helps a paralysed person to stand and walk', 'aide une personne paralysée à se lever et à marcher']]
    ]),
    BOX('note', ['The cost', 'Le coût'], P('A da Vinci costs about 2 M€, plus about 200 k€ of maintenance per year (figures of the course). Its benefit must therefore be measured per operation, not per robot (exercise 2).', 'Un da Vinci coûte environ 2 M€, plus environ 200 k€ de maintenance par an (chiffres du cours). Son intérêt doit donc se mesurer par opération, pas par robot (exercice 2).'))
  ],
  terms: [['da Vinci, EndoWrist', 'da Vinci, EndoWrist'], ['endoscope holder', 'porte-endoscope'], ['radiosurgery', 'radiochirurgie'], ['proton therapy', 'protonthérapie'], ['hybrid operating room', 'salle hybride']],
  quiz: [
    ['Why is a surgeon said to need “three hands” in laparoscopy?', 'Pourquoi dit-on qu\'un chirurgien a besoin de « trois mains » en cœlioscopie ?', 'Two for the instruments and one for the camera: an assistant or a robot (AESOP) holds the camera.', 'Deux pour les instruments et une pour la caméra : un aide ou un robot (AESOP) tient la caméra.'],
    ['What does the CyberKnife robot move?', 'Que déplace le robot du CyberKnife ?', 'A small linear accelerator that aims an X-ray beam at the tumour.', 'Un petit accélérateur linéaire qui vise la tumeur avec un faisceau de rayons X.'],
    ['Why is an orthopaedic robot compared to a machine tool?', 'Pourquoi compare-t-on un robot d\'orthopédie à une machine-outil ?', 'Because it cuts or drills the bone along a planned geometry, with the precision of machining.', 'Parce qu\'il coupe ou perce l\'os selon une géométrie planifiée, avec la précision d\'un usinage.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 7
lesson(PRE, 7, {
  title: ['Tele-ultrasound: an expert examines a distant patient', 'La télé-échographie : un expert examine un patient éloigné'],
  time: 30,
  goal: ['how a robotic tele-ultrasound system works, the degrees of freedom the probe needs, why its mechanism is spherical, how the delay of the link is handled, and the PRISME prototypes from 1998 to the Melody robot.', 'comment fonctionne un système de télé-échographie robotisée, les degrés de liberté dont la sonde a besoin, pourquoi son mécanisme est sphérique, comment on gère le retard de la liaison, et les prototypes du PRISME de 1998 au robot Melody.'],
  body: [
    ONE('The expert moves a dummy probe in a hospital; on the other side of the world a light robot reproduces the gesture on the patient, and the images come back.', 'L\'expert bouge une sonde factice dans un hôpital ; à l\'autre bout du monde un robot léger reproduit le geste sur le patient, et les images reviennent.'),
    FIGO(teleEcho()),
    H4('7.1 The degrees of freedom of the probe', '7.1 Les degrés de liberté de la sonde'),
    P('A sonographer keeps the probe in contact with the skin and mostly <strong>orients</strong> it: 3 rotations about the contact point, plus a translation along the probe to press more or less. The large movements over the body are done by the assistant who places the robot. That is why the PRISME robots use a <strong>spherical (parallel) mechanism</strong> whose rotations all pass through the contact point — a remote centre of motion, as in lesson 3.', 'Un échographiste garde la sonde au contact de la peau et surtout l\'<strong>oriente</strong> : 3 rotations autour du point de contact, plus une translation le long de la sonde pour appuyer plus ou moins. Les grands déplacements sur le corps sont faits par l\'assistant qui pose le robot. C\'est pourquoi les robots du PRISME utilisent un <strong>mécanisme sphérique (parallèle)</strong> dont toutes les rotations passent par le point de contact — un centre de rotation déporté, comme en leçon 3.'),
    EQ('DOF of the probe = 3 rotations about the contact point + 1 translation (pressure) = 4', 'DDL de la sonde = 3 rotations autour du point de contact + 1 translation (appui) = 4'),
    H4('7.2 The delay of the link', '7.2 Le retard de la liaison'),
    P('A geostationary satellite is about 36 000 km high: a signal goes up and down in about 0.24 s, and a command followed by its image takes about twice that, around half a second with the processing. With such delays a direct force loop would become unstable (the teleoperation course explains why and how wave variables fix it). Tele-ultrasound robots therefore send the <strong>gestures</strong>, control the contact force <strong>locally</strong> with the force sensor of the patient station, and send back images and a measured force.', 'Un satellite géostationnaire est à environ 36 000 km d\'altitude : un signal monte et redescend en environ 0,24 s, et une commande suivie de son image prend à peu près le double, autour d\'une demi-seconde avec les traitements. Avec de tels retards une boucle d\'effort directe deviendrait instable (le cours de téléopération explique pourquoi et comment les variables d\'onde y remédient). Les robots de télé-échographie envoient donc les <strong>gestes</strong>, commandent l\'effort de contact <strong>localement</strong> avec le capteur d\'effort de la station patient, et renvoient les images et un effort mesuré.'),
    H4('7.3 Twenty years of prototypes at PRISME', '7.3 Vingt ans de prototypes au PRISME'),
    TABLE([['Years', 'Années'], ['Robots', 'Robots'], ['Step', 'Étape']], [
      ['1998–2001', 'SYRTECH, TERESA', ['first robotic tele-ultrasound, satellite links', 'première télé-échographie robotisée, liaisons satellite']],
      ['2003–2006', 'OTELO 1, OTELO 2, ESTELE', ['European projects, pilot phase with hospitals', 'projets européens, phase pilote avec les hôpitaux']],
      ['2008–', 'PROSIT 1, PROSIT 2', ['spherical parallel architecture', 'architecture parallèle sphérique']],
      ['2015', 'Melody (AdEchoTech)', ['a tele-ultrasound robot on the market', 'un robot de télé-échographie commercialisé']]
    ]),
    BOX('note', ['An old dream', 'Un vieux rêve'], P('In 1925 the magazine <i>Science and Invention</i> (Hugo Gernsback) already imagined a doctor examining a patient at a distance through a machine. Ninety years later, Melody does it in hospitals.', 'En 1925 le magazine <i>Science and Invention</i> (Hugo Gernsback) imaginait déjà un médecin examinant un patient à distance par une machine. Quatre-vingt-dix ans plus tard, Melody le fait dans les hôpitaux.'))
  ],
  terms: [['tele-ultrasound (tele-echography)', 'télé-échographie'], ['expert station / patient station', 'station expert / station patient'], ['spherical mechanism', 'mécanisme sphérique'], ['round-trip delay', 'retard aller-retour'], ['local force control', 'commande d\'effort locale']],
  quiz: [
    ['Which movements does the robot leave to the assistant next to the patient?', 'Quels mouvements le robot laisse-t-il à l\'assistant à côté du patient ?', 'The large movements over the body: placing the robot on the right zone. The robot does the fine orientation and the pressure.', 'Les grands déplacements sur le corps : poser le robot sur la bonne zone. Le robot fait l\'orientation fine et l\'appui.'],
    ['Why is the contact force controlled at the patient station?', 'Pourquoi l\'effort de contact est-il commandé à la station patient ?', 'Because the delay of the link would make a remote force loop unstable; locally the loop is fast and safe.', 'Parce que le retard de la liaison rendrait instable une boucle d\'effort distante ; localement la boucle est rapide et sûre.'],
    ['Why a spherical mechanism?', 'Pourquoi un mécanisme sphérique ?', 'So that all rotations pass through the contact point of the probe: it can turn without sliding on the skin.', 'Pour que toutes les rotations passent par le point de contact de la sonde : elle peut tourner sans glisser sur la peau.']
  ]
}),
// ------------------------------------------------------------------------------------------------ 8
lesson(PRE, 8, {
  title: ['Your project: an article review and a mini-project', 'Votre projet : une analyse d\'article et un mini-projet'],
  time: 30,
  goal: ['how the course is assessed (an article review and a mini-project in pairs), the list of topics, and a method to study a medical robot from the need to the safety case.', 'comment le cours est évalué (une analyse d\'article et un mini-projet en binôme), la liste des sujets, et une méthode pour étudier un robot médical, du besoin au dossier de sécurité.'],
  body: [
    ONE('Study a medical robot like an engineer: start from the medical gesture, count the degrees of freedom it needs, then choose the architecture, the control and the safety.', 'Étudiez un robot médical comme un ingénieur : partez du geste médical, comptez les degrés de liberté dont il a besoin, puis choisissez l\'architecture, la commande et la sécurité.'),
    H4('8.1 The mini-project topics', '8.1 Les sujets de mini-projet'),
    TABLE([['', ''], ['Topic', 'Sujet']], [
      ['P1–P3', ['teleoperation; cobotics; haptic systems and force feedback', 'téléopération ; cobotique ; systèmes haptiques et retour d\'effort']],
      ['P4–P6', ['virtual guides for MIS; micro-nano surgery; interventional radiology (proton therapy robot)', 'guides virtuels pour la chirurgie mini-invasive ; micro-nano chirurgie ; radiologie interventionnelle (robot de protonthérapie)']],
      ['P7–P10', ['robotic needle insertion; robotic ultrasound; endoscopy and the da Vinci; mobile wheeled robots', 'insertion d\'aiguille robotisée ; échographie robotisée ; endoscopie et da Vinci ; robots mobiles à roues']],
      ['P11–P13', ['free topics: robotics and MIS; artificial intelligence in medicine; soft robotics', 'sujets libres : robotique et chirurgie mini-invasive ; intelligence artificielle en médecine ; robotique souple']]
    ]),
    P('Organisation of the course: pairs choose three topics in order of preference, the teacher arbitrates, and the report is handed in on the university platform (CELENE).', 'Organisation du cours : les binômes choisissent trois sujets par ordre de préférence, l\'enseignant arbitre, et le rapport est déposé sur la plateforme de l\'université (CELENE).'),
    H4('8.2 A method in six steps', '8.2 Une méthode en six étapes'),
    OL([
      ['<strong>The gesture</strong>: what does the doctor do, with which tool, where, how precisely, how fast, with which force?', '<strong>Le geste</strong> : que fait le médecin, avec quel outil, où, avec quelle précision, à quelle vitesse, avec quel effort ?'],
      ['<strong>The DOF</strong>: how many are needed (lessons 3 and 7)? Is there a fixed point (trocar, skin contact)?', '<strong>Les DDL</strong> : combien en faut-il (leçons 3 et 7) ? Y a-t-il un point fixe (trocart, contact sur la peau) ?'],
      ['<strong>The mode</strong>: teleoperation, co-manipulation or automatic sub-tasks (lessons 2 and 4)?', '<strong>Le mode</strong> : téléopération, comanipulation ou sous-tâches automatiques (leçons 2 et 4) ?'],
      ['<strong>The architecture</strong>: serial, parallel, spherical, RCM by mechanism or by software (modelling and parallel robots courses)?', '<strong>L\'architecture</strong> : série, parallèle, sphérique, RCM par mécanisme ou par logiciel (cours de modélisation et de robots parallèles) ?'],
      ['<strong>The sensing and control</strong>: imaging, force sensor, delays (teleoperation and control courses).', '<strong>La perception et la commande</strong> : imagerie, capteur d\'effort, retards (cours de téléopération et de commande).'],
      ['<strong>The safety and the regulation</strong>: risks, limits, sterility, CE marking (lesson 5).', '<strong>La sécurité et la réglementation</strong> : risques, limites, stérilité, marquage CE (leçon 5).']
    ]),
    BOX('method', ['Reading a scientific article', 'Lire un article scientifique'], UL([
      ['What medical problem? What was done before?', 'Quel problème médical ? Que faisait-on avant ?'],
      ['What robot (DOF, architecture, sensors, control)?', 'Quel robot (DDL, architecture, capteurs, commande) ?'],
      ['How was it validated: bench, phantom, animal, patients — how many?', 'Comment a-t-il été validé : banc, fantôme, animal, patients — combien ?'],
      ['What are the limits the authors admit, and the ones they do not?', 'Quelles limites les auteurs reconnaissent-ils, et lesquelles ne disent-ils pas ?']
    ]))
  ],
  terms: [['article review', 'analyse d\'article'], ['mini-project', 'mini-projet'], ['phantom', 'fantôme'], ['clinical validation', 'validation clinique'], ['safety case', 'dossier de sécurité']],
  quiz: [
    ['What is the first step to study a medical robot?', 'Quelle est la première étape pour étudier un robot médical ?', 'Describe the medical gesture: tool, place, precision, speed, force.', 'Décrire le geste médical : outil, lieu, précision, vitesse, effort.'],
    ['What is a phantom in medical robotics?', 'Qu\'est-ce qu\'un fantôme en robotique médicale ?', 'An artificial model of a part of the body used to test a robot before animals or patients.', 'Un modèle artificiel d\'une partie du corps utilisé pour tester un robot avant l\'animal ou le patient.'],
    ['Which lesson tells you the DOF of an ultrasound probe?', 'Quelle leçon vous donne les DDL d\'une sonde d\'échographie ?', 'Lesson 7: 3 rotations about the contact point and 1 translation.', 'La leçon 7 : 3 rotations autour du point de contact et 1 translation.']
  ]
})
  ];
}
