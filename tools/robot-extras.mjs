// robot-extras.mjs — the "Kinematics" and "Applications" parts of the robots that have only an anatomy page
// (humanoid, quadruped, drone, underwater robot, tracked robot), in English and French. Used by tools/build-anatomy.mjs:
// each function is called while the page is built, so that every text goes through tx() into the French dictionary.
import { tx, P, EQ, UL, TABLE, FIG } from './lib.mjs';

const H2 = (cls, en, fr) => `<h2 class="${cls}">${tx(en, fr)}</h2>`;
const H3 = (en, fr) => `<h3>${tx(en, fr)}</h3>`;
const appsTable = (rows) => TABLE([['Where', 'Où'], ['What it does there', 'Ce qu\'il y fait'], ['Examples', 'Exemples']], rows);

// a two-link leg: hip, knee, ankle, with the angles (figure used by the humanoid and the quadruped)
const LEG = (kneeBack) => FIG('0 0 360 260', `
  <line x1="40" y1="236" x2="320" y2="236" stroke="#8a99ae" stroke-width="2"/>
  <circle cx="150" cy="40" r="9" fill="#2f6bff"/><line x1="150" y1="40" x2="${kneeBack ? 110 : 195}" y2="138" stroke="#ff9f43" stroke-width="10" stroke-linecap="round"/>
  <circle cx="${kneeBack ? 110 : 195}" cy="138" r="8" fill="#2f6bff"/><line x1="${kneeBack ? 110 : 195}" y1="138" x2="160" y2="228" stroke="#ff9f43" stroke-width="8" stroke-linecap="round"/>
  <circle cx="160" cy="228" r="7" fill="#1d2633"/>
  <line x1="150" y1="40" x2="160" y2="228" stroke="#8a99ae" stroke-width="1.5" stroke-dasharray="5 5"/>
  <text x="104" y="34" fill="#2f6bff" font-size="14">${tx('hip', 'hanche')}</text><text x="${kneeBack ? 58 : 206}" y="142" fill="#2f6bff" font-size="14">${tx('knee', 'genou')}</text><text x="172" y="232" fill="#1d2633" font-size="14">${tx('foot', 'pied')}</text>
  <text x="${kneeBack ? 116 : 180}" y="92" fill="#ff9f43" font-size="15">L1</text><text x="${kneeBack ? 120 : 186}" y="190" fill="#ff9f43" font-size="15">L2</text><text x="166" y="140" fill="#8a99ae" font-size="15">d</text>`);

const EX = {
  humanoid: {
    kin: () => [
      H2('part-kin', 'Kinematics: two legs, a moving centre of mass', 'Cinématique : deux jambes, un centre de masse qui bouge'),
      P('A humanoid is a tree of chains: from the pelvis, two legs, a torso, two arms and a head, with 20 to 50 joints. When it walks, each leg is a serial arm whose base (the hip) moves and whose tool (the foot) must land at an exact place. The hard part is not the motion of the joints but the balance: the robot has to keep its weight above the feet.', 'Un humanoïde est un arbre de chaînes : depuis le bassin, deux jambes, un buste, deux bras et une tête, avec 20 à 50 articulations. Quand il marche, chaque jambe est un bras série dont la base (la hanche) bouge et dont l\'outil (le pied) doit se poser à un endroit précis. Le plus difficile n\'est pas le mouvement des articulations mais l\'équilibre : le robot doit garder son poids au-dessus des pieds.'),
      H3('The leg as a two-link arm', 'La jambe comme un bras à deux segments'),
      LEG(false),
      P('In the plane of the leg, the hip and the knee place the ankle like the shoulder and the elbow of a two-link arm. The distance d from the hip to the ankle fixes the knee angle; the direction of the ankle gives the hip angle.', 'Dans le plan de la jambe, la hanche et le genou placent la cheville comme l\'épaule et le coude d\'un bras à deux segments. La distance d entre la hanche et la cheville fixe l\'angle du genou ; la direction de la cheville donne l\'angle de la hanche.'),
      EQ('Knee: cos(π − θ_knee) = (L1² + L2² − d²) / (2 L1 L2) &emsp; Hip: θ_hip = atan2(x, −y) + atan2(L2 sin θ_knee, L1 + L2 cos θ_knee)', 'Genou : cos(π − θ_genou) = (L1² + L2² − d²) / (2 L1 L2) &emsp; Hanche : θ_hanche = atan2(x, −y) + atan2(L2 sin θ_genou, L1 + L2 cos θ_genou)'),
      H3('Balance: the centre of mass and the support polygon', 'Équilibre : le centre de masse et le polygone de sustentation'),
      P('Standing still, the robot does not fall as long as the vertical through its centre of mass stays inside the support polygon, the area under and between the feet in contact with the floor. Walking fast, it is a controlled fall: the controller keeps the zero-moment point (ZMP), where the ground reaction acts, inside the foot on the ground.', 'À l\'arrêt, le robot ne tombe pas tant que la verticale de son centre de masse reste dans le polygone de sustentation, la surface sous et entre les pieds en contact avec le sol. En marchant vite, c\'est une chute contrôlée : le contrôleur garde le point de moment nul (ZMP), où agit la réaction du sol, à l\'intérieur du pied posé.'),
      EQ('Centre of mass: x_G = Σ mᵢ xᵢ / Σ mᵢ &emsp; Linear inverted pendulum: ẍ_G = (g / h) (x_G − x_ZMP)', 'Centre de masse : x_G = Σ mᵢ xᵢ / Σ mᵢ &emsp; Pendule inversé linéaire : ẍ_G = (g / h) (x_G − x_ZMP)'),
      TABLE([['Phase of the step', 'Phase du pas'], ['Feet on the ground', 'Pieds au sol'], ['What the controller does', 'Ce que fait le contrôleur']], [
        [['Double support', 'Double appui'], '2', ['moves the weight from one foot to the other', 'transfère le poids d\'un pied sur l\'autre']],
        [['Single support', 'Simple appui'], '1', ['keeps the ZMP in the standing foot and swings the other leg', 'garde le ZMP dans le pied d\'appui et balance l\'autre jambe']],
        [['Landing', 'Pose du pied'], '1 → 2', ['absorbs the impact with the knee and the ankle', 'amortit l\'impact avec le genou et la cheville']]])
    ],
    apps: () => [
      H2('part-apps', 'Where are humanoids used?', 'Où utilise-t-on les humanoïdes ?'),
      P('Humanoids are made to work in places built for people, with the same stairs, doors, tools and shelves. Most are still being tested, but the first ones now work in factories and warehouses.', 'Les humanoïdes sont faits pour travailler dans des lieux construits pour les humains, avec les mêmes escaliers, portes, outils et étagères. La plupart sont encore en essai, mais les premiers travaillent maintenant en usine et en entrepôt.'),
      appsTable([
        [['Car factories', 'Usines automobiles'], ['carry parts, feed the assembly line', 'porter des pièces, alimenter la chaîne de montage'], 'Figure 02, Apptronik Apollo'],
        [['Warehouses', 'Entrepôts'], ['move totes from shelves to conveyors', 'déplacer des bacs des étagères aux convoyeurs'], 'Agility Digit'],
        [['Research', 'Recherche'], ['study walking, balance and manipulation', 'étudier la marche, l\'équilibre et la manipulation'], 'Boston Dynamics Atlas, Unitree H1'],
        [['Disaster areas', 'Zones sinistrées'], ['open valves, climb ladders, drive a vehicle', 'ouvrir des vannes, monter à l\'échelle, conduire un véhicule'], ['DARPA Robotics Challenge', 'DARPA Robotics Challenge']],
        [['Homes and care (future)', 'Maison et aide (avenir)'], ['help people at home, in hospitals', 'aider les personnes à domicile, à l\'hôpital'], 'Tesla Optimus, 1X NEO']]),
      UL([['<strong>Strengths</strong>: goes everywhere a person goes, uses the same tools; two arms for real work.', '<strong>Points forts</strong> : va partout où va une personne, utilise les mêmes outils ; deux bras pour un vrai travail.'],
        ['<strong>Weaknesses</strong>: complex and expensive, short battery life (1 to 2 h), balance always to control; a wheeled robot is simpler where the floor is flat.', '<strong>Points faibles</strong> : complexe et cher, autonomie courte (1 à 2 h), équilibre toujours à contrôler ; un robot à roues est plus simple là où le sol est plat.']])
    ]
  },
  quadruped: {
    kin: () => [
      H2('part-kin', 'Kinematics: four legs of three joints', 'Cinématique : quatre pattes de trois articulations'),
      P('Each leg is a small serial arm with 3 joints: abduction (the leg opens sideways), hip and knee. With the 6 degrees of freedom of the body, the robot has 18 coordinates to control, and 12 motors to do it. The feet on the ground close the loop: like a parallel robot, the body can move in all 6 directions while the feet stay still.', 'Chaque patte est un petit bras série à 3 articulations : abduction (la patte s\'écarte sur le côté), hanche et genou. Avec les 6 degrés de liberté du corps, le robot a 18 coordonnées à commander, et 12 moteurs pour le faire. Les pieds au sol ferment la boucle : comme un robot parallèle, le corps peut bouger dans les 6 directions pendant que les pieds restent immobiles.'),
      LEG(true),
      H3('Inverse kinematics of one leg', 'Cinématique inverse d\'une patte'),
      P('First the abduction turns the plane of the leg so that it contains the foot; then, in that plane, hip and knee work like a two-link arm. On most quadrupeds the knee points backwards, so the second solution of the elbow is used.', 'D\'abord l\'abduction tourne le plan de la patte pour qu\'il contienne le pied ; ensuite, dans ce plan, hanche et genou fonctionnent comme un bras à deux segments. Sur la plupart des quadrupèdes le genou pointe vers l\'arrière : on prend donc la deuxième solution du coude.'),
      EQ('Abduction: γ = atan2(z, −y) &emsp; Distance in the plane: d = √(x² + y² + z²) &emsp; Knee: cos(π − θ_k) = (L1² + L2² − d²) / (2 L1 L2)', 'Abduction : γ = atan2(z, −y) &emsp; Distance dans le plan : d = √(x² + y² + z²) &emsp; Genou : cos(π − θ_g) = (L1² + L2² − d²) / (2 L1 L2)'),
      H3('Gaits', 'Les allures'),
      P('A gait says which legs move together. The duty factor is the part of the cycle each foot spends on the ground: above 0.5 at least two feet always touch the ground.', 'Une allure dit quelles pattes bougent ensemble. Le facteur de service est la part du cycle que chaque pied passe au sol : au-dessus de 0,5, au moins deux pieds touchent toujours le sol.'),
      TABLE([['Gait', 'Allure'], ['Legs together', 'Pattes ensemble'], ['Duty factor', 'Facteur de service'], ['Use', 'Usage']], [
        [['Walk', 'Pas'], ['one at a time', 'une par une'], '0.75', ['slow, always 3 feet down: stable on rough ground', 'lent, toujours 3 pieds au sol : stable en terrain difficile']],
        [['Trot', 'Trot'], ['diagonal pairs', 'paires en diagonale'], '0.5', ['the usual gait of robot dogs (this page)', 'l\'allure habituelle des robots chiens (cette page)']],
        [['Pace', 'Amble'], ['same-side pairs', 'paires du même côté'], '0.5', ['rare on robots: the body rolls', 'rare sur les robots : le corps roule']],
        [['Gallop / bound', 'Galop / bond'], ['front pair, then rear pair', 'paire avant, puis paire arrière'], ['< 0.5', '< 0,5'], ['fast, with flight phases', 'rapide, avec des phases de vol']]])
    ],
    apps: () => [
      H2('part-apps', 'Where are quadrupeds used?', 'Où utilise-t-on les quadrupèdes ?'),
      P('Robot dogs carry sensors where wheels cannot go: stairs, gravel, mud, cables on the floor. They are mostly used for inspection, often driven from far away or following a recorded route on their own.', 'Les robots chiens portent des capteurs là où les roues ne passent pas : escaliers, gravier, boue, câbles au sol. Ils servent surtout à l\'inspection, souvent pilotés de loin ou en suivant seuls un trajet enregistré.'),
      appsTable([
        [['Industrial plants', 'Sites industriels'], ['read gauges, measure heat and gas leaks, listen to machines', 'lire des manomètres, mesurer la chaleur et les fuites de gaz, écouter les machines'], 'Boston Dynamics Spot, ANYbotics ANYmal'],
        [['Construction sites', 'Chantiers'], ['scan the building every day and compare it with the plans', 'scanner le bâtiment chaque jour et le comparer aux plans'], 'Spot + 3D scanner'],
        [['Mines and tunnels', 'Mines et tunnels'], ['map dark and dangerous places', 'cartographier des lieux sombres et dangereux'], 'ANYmal X (ATEX)'],
        [['Rescue and security', 'Secours et sécurité'], ['go first into collapsed or dangerous buildings', 'entrer en premier dans des bâtiments effondrés ou dangereux'], ['police and fire brigades', 'police et pompiers']],
        [['Research and teaching', 'Recherche et enseignement'], ['learn legged locomotion, reinforcement learning', 'apprendre la locomotion à pattes, l\'apprentissage par renforcement'], 'Unitree Go2, MIT Mini Cheetah']]),
      UL([['<strong>Strengths</strong>: stable on 4 legs, climbs stairs and steps, carries 10 to 15 kg of sensors.', '<strong>Points forts</strong> : stable sur 4 pattes, monte escaliers et marches, porte 10 à 15 kg de capteurs.'],
        ['<strong>Weaknesses</strong>: about 90 minutes of battery, slower and more fragile than a robot on wheels or tracks on flat ground.', '<strong>Points faibles</strong> : environ 90 minutes de batterie, plus lent et plus fragile qu\'un robot à roues ou à chenilles sur sol plat.']])
    ]
  },
  quadrotor: {
    kin: () => [
      H2('part-kin', 'Kinematics and dynamics: 6 directions, 4 motors', 'Cinématique et dynamique : 6 directions, 4 moteurs'),
      P('A drone moves in 6 directions (3 positions, 3 angles) but has only 4 motors: it is underactuated. It cannot push sideways directly: to go forward it first tilts, so that part of the thrust points forward. That is why its position and its attitude are controlled in two nested loops.', 'Un drone se déplace dans 6 directions (3 positions, 3 angles) mais n\'a que 4 moteurs : il est sous-actionné. Il ne peut pas pousser directement sur le côté : pour avancer, il s\'incline d\'abord, pour qu\'une partie de la poussée pointe vers l\'avant. C\'est pourquoi sa position et son attitude sont commandées par deux boucles imbriquées.'),
      FIG('0 0 360 200', `
        <line x1="60" y1="100" x2="300" y2="100" stroke="#1d2633" stroke-width="6" stroke-linecap="round"/><rect x="160" y="88" width="40" height="24" rx="6" fill="#2f6bff"/>
        <ellipse cx="60" cy="90" rx="34" ry="6" fill="#8a99ae" opacity="0.6"/><ellipse cx="300" cy="90" rx="34" ry="6" fill="#8a99ae" opacity="0.6"/>
        <line x1="60" y1="84" x2="60" y2="30" stroke="#ff9f43" stroke-width="3"/><polygon points="60,22 54,34 66,34" fill="#ff9f43"/><text x="70" y="40" fill="#ff9f43" font-size="15">T1</text>
        <line x1="300" y1="84" x2="300" y2="30" stroke="#ff9f43" stroke-width="3"/><polygon points="300,22 294,34 306,34" fill="#ff9f43"/><text x="310" y="40" fill="#ff9f43" font-size="15">T3</text>
        <line x1="180" y1="112" x2="180" y2="180" stroke="#e5484d" stroke-width="3"/><polygon points="180,188 174,176 186,176" fill="#e5484d"/><text x="190" y="176" fill="#e5484d" font-size="15">m g</text>`),
      EQ('Thrust of a propeller: T = k ω² &emsp; Hover: T₁ + T₂ + T₃ + T₄ = m g', 'Poussée d\'une hélice : T = k ω² &emsp; Vol stationnaire : T₁ + T₂ + T₃ + T₄ = m g'),
      EQ('Roll torque: τ_x = ℓ (T₄ − T₂) &emsp; Pitch: τ_y = ℓ (T₁ − T₃) &emsp; Yaw: τ_z = c (T₁ − T₂ + T₃ − T₄)', 'Couple de roulis : τ_x = ℓ (T₄ − T₂) &emsp; Tangage : τ_y = ℓ (T₁ − T₃) &emsp; Lacet : τ_z = c (T₁ − T₂ + T₃ − T₄)'),
      P('The mixer turns the 4 commands of the pilot or the autopilot (total thrust, roll, pitch, yaw) into the 4 motor speeds. Two propellers turn clockwise and two counter-clockwise, so their reaction torques cancel; making them unequal turns the drone on itself.', 'Le mélangeur transforme les 4 commandes du pilote ou de l\'autopilote (poussée totale, roulis, tangage, lacet) en 4 vitesses de moteurs. Deux hélices tournent dans le sens horaire et deux dans l\'autre sens, pour que leurs couples de réaction s\'annulent ; les rendre inégales fait tourner le drone sur lui-même.'),
      TABLE([['Loop', 'Boucle'], ['Measures', 'Mesure'], ['Commands', 'Commande'], ['Rate', 'Fréquence']], [
        [['Attitude (inner)', 'Attitude (intérieure)'], ['angles from the IMU', 'angles par la centrale inertielle'], ['torques → motors', 'couples → moteurs'], '500 Hz – 8 kHz'],
        [['Position (outer)', 'Position (extérieure)'], ['GNSS, camera, barometer', 'GNSS, caméra, baromètre'], ['tilt angles to reach', 'angles d\'inclinaison à atteindre'], '10 – 50 Hz']])
    ],
    apps: () => [
      H2('part-apps', 'Where are drones used?', 'Où utilise-t-on les drones ?'),
      P('A drone carries a camera or a sensor high up, quickly and cheaply. Most professional drones fly a mission planned in advance, with a pilot who watches and can take over.', 'Un drone porte une caméra ou un capteur en hauteur, vite et pour pas cher. La plupart des drones professionnels volent une mission préparée à l\'avance, avec un pilote qui surveille et peut reprendre la main.'),
      appsTable([
        [['Inspection', 'Inspection'], ['bridges, power lines, wind turbines, roofs', 'ponts, lignes électriques, éoliennes, toitures'], 'DJI Matrice, Skydio X10'],
        [['Mapping and surveying', 'Cartographie et topographie'], ['3D models of land and buildings (photogrammetry, lidar)', 'modèles 3D de terrains et de bâtiments (photogrammétrie, lidar)'], ['RTK drones', 'drones RTK']],
        [['Agriculture', 'Agriculture'], ['watch the crops, spray exactly where needed', 'surveiller les cultures, pulvériser juste où il faut'], 'DJI Agras'],
        [['Delivery', 'Livraison'], ['medicines, blood, small parcels', 'médicaments, sang, petits colis'], 'Zipline, Wing'],
        [['Rescue and film', 'Secours et cinéma'], ['search for people with a thermal camera, film from the sky', 'chercher des personnes avec une caméra thermique, filmer du ciel'], ['fire brigades, film crews', 'pompiers, équipes de tournage']]]),
      UL([['<strong>Strengths</strong>: fast, sees from above, hovers in place, cheap to buy and to fly.', '<strong>Points forts</strong> : rapide, voit d\'en haut, fait du sur-place, peu cher à l\'achat et à l\'usage.'],
        ['<strong>Weaknesses</strong>: 20 to 40 minutes of flight, sensitive to wind and rain, strict flight rules.', '<strong>Points faibles</strong> : 20 à 40 minutes de vol, sensible au vent et à la pluie, règles de vol strictes.']])
    ]
  },
  auv: {
    kin: () => [
      H2('part-kin', 'Kinematics: steering in water', 'Cinématique : se diriger dans l\'eau'),
      P('An underwater vehicle moves in 6 directions: surge (forward), sway (sideways), heave (up and down), roll, pitch and yaw. A torpedo-shaped AUV is like a plane: one propeller pushes it forward, and its fins turn the water flow into forces. It can only steer while it moves, and it cannot go sideways on its own.', 'Un véhicule sous-marin se déplace dans 6 directions : cavalement (avant), embardée (côté), pilonnement (haut et bas), roulis, tangage et lacet. Un AUV en forme de torpille est comme un avion : une hélice le pousse vers l\'avant, et ses gouvernes transforment l\'écoulement de l\'eau en forces. Il ne peut se diriger qu\'en avançant, et il ne peut pas aller de côté tout seul.'),
      EQ('ẋ = u cos ψ cos θ &emsp; ẏ = u sin ψ cos θ &emsp; ż = −u sin θ &emsp; (u: speed, ψ: heading, θ: pitch, z: up)', 'ẋ = u cos ψ cos θ &emsp; ẏ = u sin ψ cos θ &emsp; ż = −u sin θ &emsp; (u : vitesse, ψ : cap, θ : assiette, z : vers le haut)'),
      EQ('Turn rate ≈ (u / L) · K_δ · δ_rudder &emsp; Force of a fin: F = ½ ρ S C_L u² (it grows with the square of the speed)', 'Vitesse de virage ≈ (u / L) · K_δ · δ_direction &emsp; Force d\'une gouverne : F = ½ ρ S C_L u² (elle croît avec le carré de la vitesse)'),
      H3('Buoyancy and depth', 'Flottabilité et profondeur'),
      P('An AUV is made a little lighter than water (slightly positive buoyancy): if the power fails, it floats back to the surface. To stay deep it uses its elevators while it moves; some gliders change their volume instead.', 'Un AUV est rendu un peu plus léger que l\'eau (flottabilité légèrement positive) : si l\'énergie manque, il remonte en surface. Pour rester en profondeur, il utilise ses gouvernes de profondeur en avançant ; certains planeurs changent plutôt de volume.'),
      EQ('Archimedes: B = ρ g V &emsp; Pressure: p = p₀ + ρ g h ≈ 1 bar more every 10 m', 'Archimède : B = ρ g V &emsp; Pression : p = p₀ + ρ g h ≈ 1 bar de plus tous les 10 m'),
      TABLE([['Vehicle', 'Véhicule'], ['How it moves', 'Comment il se déplace'], ['Control', 'Commande']], [
        ['AUV', ['propeller and fins, like a plane', 'hélice et gouvernes, comme un avion'], ['alone, mission planned in advance', 'seul, mission préparée à l\'avance']],
        ['ROV', ['many thrusters: moves in every direction, hovers', 'plusieurs propulseurs : se déplace dans tous les sens, fait du sur-place'], ['by a pilot, through a cable', 'par un pilote, à travers un câble']],
        [['Glider', 'Planeur'], ['changes its volume to sink and rise, wings make it glide', 'change de volume pour descendre et monter, ses ailes le font planer'], ['alone, for weeks', 'seul, pendant des semaines']]])
    ],
    apps: () => [
      H2('part-apps', 'Where are underwater robots used?', 'Où utilise-t-on les robots sous-marins ?'),
      P('The sea is dark, deep and without GPS: robots go where divers cannot, for hours or weeks.', 'La mer est sombre, profonde et sans GPS : les robots vont là où les plongeurs ne peuvent pas aller, pendant des heures ou des semaines.'),
      appsTable([
        [['Mapping the sea floor', 'Cartographie des fonds'], ['sonar maps for ports, cables and wind farms', 'cartes sonar pour les ports, les câbles et les parcs éoliens'], 'Kongsberg HUGIN, REMUS'],
        [['Pipelines and cables', 'Pipelines et câbles'], ['follow them and look for damage', 'les suivre et chercher des dommages'], ['oil and energy industry', 'industrie pétrolière et énergie']],
        [['Science', 'Science'], ['measure temperature, salt, currents; study animals', 'mesurer température, sel, courants ; étudier les animaux'], ['Argo floats, Slocum gliders', 'flotteurs Argo, planeurs Slocum']],
        [['Search', 'Recherche'], ['find wrecks and lost planes', 'retrouver des épaves et des avions disparus'], ['the search for MH370', 'la recherche du vol MH370']],
        [['Defence and safety', 'Défense et sécurité'], ['detect mines, guard ports', 'détecter les mines, surveiller les ports'], ['navies', 'marines']]]),
      UL([['<strong>Strengths</strong>: works deep and for long, without a ship or a pilot, maps large areas.', '<strong>Points forts</strong> : travaille en profondeur et longtemps, sans bateau ni pilote, cartographie de grandes zones.'],
        ['<strong>Weaknesses</strong>: no GPS or radio under water, so it navigates by dead reckoning; hard to communicate with (sound only, very slow).', '<strong>Points faibles</strong> : ni GPS ni radio sous l\'eau, il navigue donc à l\'estime ; difficile de communiquer avec lui (seulement par le son, très lent).']])
    ]
  },
  tracked: {
    kin: () => [
      H2('part-kin', 'Kinematics: skid steering', 'Cinématique : direction par glissement'),
      P('A tracked robot is driven like a differential-drive robot: one motor per side, and it turns by running one side faster than the other. But a track touches the ground along its whole length, so to turn it has to slide sideways. The robot turns less than the formula of two wheels predicts, and the real turn depends on the ground.', 'Un robot à chenilles se pilote comme un robot à entraînement différentiel : un moteur par côté, et il tourne en faisant aller un côté plus vite que l\'autre. Mais une chenille touche le sol sur toute sa longueur : pour tourner, elle doit glisser de côté. Le robot tourne moins que ne le prévoit la formule des deux roues, et le virage réel dépend du sol.'),
      FIG('0 0 360 220', `
        <rect x="70" y="40" width="44" height="140" rx="20" fill="#1d2633"/><rect x="246" y="40" width="44" height="140" rx="20" fill="#1d2633"/><rect x="114" y="60" width="132" height="100" rx="10" fill="#ff9f43"/>
        <line x1="92" y1="150" x2="92" y2="80" stroke="#2f6bff" stroke-width="4"/><polygon points="92,70 85,84 99,84" fill="#2f6bff"/><text x="40" y="112" fill="#2f6bff" font-size="15">v_L</text>
        <line x1="268" y1="160" x2="268" y2="54" stroke="#2f6bff" stroke-width="4"/><polygon points="268,44 261,58 275,58" fill="#2f6bff"/><text x="296" y="112" fill="#2f6bff" font-size="15">v_R</text>
        <line x1="92" y1="196" x2="268" y2="196" stroke="#8a99ae" stroke-width="1.5"/><text x="172" y="214" fill="#8a99ae" font-size="14">B</text>`),
      EQ('v = (v_R + v_L) / 2 &emsp; ω = (v_R − v_L) / B_eff &emsp; with B_eff = χ · B, χ ≈ 1.2 to 2 (it depends on the ground)', 'v = (v_R + v_L) / 2 &emsp; ω = (v_R − v_L) / B_eff &emsp; avec B_eff = χ · B, χ ≈ 1,2 à 2 (cela dépend du sol)'),
      P('B_eff, the effective track width, is found by experiment: drive the robot in circles and measure. On concrete χ is small; on grass or sand it is larger. The page model uses χ = 1.25.', 'B_eff, la voie effective, se trouve par l\'expérience : faites tourner le robot en rond et mesurez. Sur du béton, χ est petit ; sur l\'herbe ou le sable, il est plus grand. Le modèle de cette page utilise χ = 1,25.'),
      TABLE([['Track speeds', 'Vitesses des chenilles'], ['Motion', 'Mouvement'], ['Turning radius', 'Rayon de virage']], [
        ['v_L = v_R', ['straight line', 'ligne droite'], '∞'],
        ['v_L ≠ v_R', ['turn, with slip', 'virage, avec glissement'], 'R = B_eff (v_R + v_L) / (2 (v_R − v_L))'],
        ['v_L = −v_R', ['turns on the spot', 'tourne sur place'], '0']]),
      P('Because the tracks slip, the odometry of a tracked robot drifts much more than with wheels: it is fused with an IMU, a lidar or visual odometry.', 'Comme les chenilles glissent, l\'odométrie d\'un robot à chenilles dérive bien plus qu\'avec des roues : on la fusionne avec une centrale inertielle, un lidar ou une odométrie visuelle.')
    ],
    apps: () => [
      H2('part-apps', 'Where are tracked robots used?', 'Où utilise-t-on les robots à chenilles ?'),
      P('Tracks spread the weight and grip rough ground: tracked robots go where wheels would sink or slip, often sent in place of a person.', 'Les chenilles répartissent le poids et accrochent les sols difficiles : les robots à chenilles vont là où des roues s\'enfonceraient ou patineraient, souvent envoyés à la place d\'une personne.'),
      appsTable([
        [['Bomb disposal', 'Déminage'], ['approach a suspect package, open it, neutralise it', 'approcher un colis suspect, l\'ouvrir, le neutraliser'], 'Teledyne FLIR PackBot, Nexter Nerva'],
        [['Rescue', 'Secours'], ['enter collapsed buildings, look for people', 'entrer dans des bâtiments effondrés, chercher des personnes'], ['rescue teams', 'équipes de secours']],
        [['Nuclear and dangerous sites', 'Sites nucléaires et dangereux'], ['measure radiation, carry tools', 'mesurer les radiations, porter des outils'], ['Fukushima robots', 'robots de Fukushima']],
        [['Agriculture', 'Agriculture'], ['weed and work in fields without packing the soil', 'désherber et travailler dans les champs sans tasser le sol'], 'Naïo Orio, AgXeed'],
        [['Construction and pipes', 'Chantiers et canalisations'], ['inspect pipes, tunnels and building sites', 'inspecter canalisations, tunnels et chantiers'], ['pipe inspection crawlers', 'robots d\'inspection de canalisations']]]),
      UL([['<strong>Strengths</strong>: crosses mud, sand, stairs and rubble, very stable, can carry an arm and heavy loads.', '<strong>Points forts</strong> : passe la boue, le sable, les escaliers et les gravats, très stable, peut porter un bras et de lourdes charges.'],
        ['<strong>Weaknesses</strong>: slow, uses more energy to turn, wears the tracks and the floors, odometry not precise.', '<strong>Points faibles</strong> : lent, consomme plus d\'énergie pour tourner, use les chenilles et les sols, odométrie peu précise.']])
    ]
  }
};
export const EXTRA = EX;
