// Practice blocks for learn-transmission.html ("Mechanical transmissions and grippers").
export const PRACTICE = {
  1: { sum: [['Transmission adapts speed and torque; transformation changes the type, direction or amplitude of the motion.', 'La transmission adapte vitesse et couple ; la transformation change le type, la direction ou l\'amplitude du mouvement.'],
      ['Chain: power supply → amplifier → servomotor → transmission → joint. ω ÷ N, T × N × η.', 'Chaîne : alimentation → amplificateur → servomoteur → transmission → articulation. ω ÷ N, T × N × η.'],
      ['Actuators (electric, hydraulic, pneumatic) move; the end effector does the work.', 'Les actionneurs (électriques, hydrauliques, pneumatiques) bougent ; l\'effecteur fait le travail.']],
    ex: [
      { lv: 1, q: ['Motor 3000 rpm, reducer ratio 50. Output speed (rpm)?', 'Moteur 3000 tr/min, réducteur de rapport 50. Vitesse de sortie (tr/min) ?'], num: { ans: 60, tol: 0.1, unit: 'tr/min' }, sol: ['3000 / 50 = <b>60 rpm</b>.', '3000 / 50 = <b>60 tr/min</b>.'] },
      { lv: 2, q: ['Same, motor torque 0.4 N·m, efficiency 0.9. Output torque (N·m)?', 'Même chose, couple moteur 0,4 N·m, rendement 0,9. Couple de sortie (N·m) ?'], num: { ans: 18, tol: 0.05, unit: 'N·m' }, sol: ['0.4 × 50 × 0.9 = <b>18 N·m</b>.', '0,4 × 50 × 0,9 = <b>18 N·m</b>.'] },
      { lv: 1, q: ['A cam pushes a follower in a straight line. Transmission or transformation?', 'Une came pousse un suiveur en ligne droite. Transmission ou transformation ?'], mcq: [['Transformation', 'Transformation', true], ['Transmission', 'Transmission']], sol: ['The rotation becomes a translation: a <b>transformation</b>.', 'La rotation devient une translation : une <b>transformation</b>.'] }
    ] },
  2: { sum: [['No slip ⇒ equal rim speeds: i = n₁ / n₂ = d₂ / d₁, T₂ = T₁ i η.', 'Sans glissement ⇒ vitesses au bord égales : i = n₁ / n₂ = d₂ / d₁, T₂ = T₁ i η.'],
      ['Open belt or chain: same direction; crossed belt: opposite; each friction contact reverses.', 'Courroie ouverte ou chaîne : même sens ; courroie croisée : sens opposé ; chaque contact de friction inverse.'],
      ['Timing belts (no slip) on robot wrists; chains for heavy loads; friction wheels slip under overload.', 'Courroies crantées (sans glissement) aux poignets des robots ; chaînes pour les fortes charges ; les roues de friction glissent en surcharge.']],
    ex: [
      { lv: 1, q: ['Pulleys 25 mm and 75 mm, motor at 1500 rpm. Output speed (rpm)?', 'Poulies 25 mm et 75 mm, moteur à 1500 tr/min. Vitesse de sortie (tr/min) ?'], num: { ans: 500, tol: 0.5, unit: 'tr/min' }, sol: ['1500 × 25 / 75 = <b>500</b>.', '1500 × 25 / 75 = <b>500</b>.'] },
      { lv: 2, q: ['Motor pulley of 40 mm at 1200 rpm. Belt speed (m/s)?', 'Poulie moteur de 40 mm à 1200 tr/min. Vitesse de la courroie (m/s) ?'], num: { ans: 2.513, tol: 0.02, unit: 'm/s' }, sol: ['v = π d n / 60 = π × 0.04 × 20 ≈ <b>2.51 m/s</b>.', 'v = π d n / 60 = π × 0,04 × 20 ≈ <b>2,51 m/s</b>.'] },
      { lv: 1, q: ['Four friction wheels in a row: the last one turns…', 'Quatre roues de friction en ligne : la dernière tourne…'], mcq: [['in the opposite direction to the first', 'dans le sens opposé à la première', true], ['in the same direction', 'dans le même sens']], sol: ['Three contacts, three reversals (even number of wheels → opposite).', 'Trois contacts, trois inversions (nombre pair de roues → opposé).'] }
    ] },
  3: { sum: [['d = m Z, centre distance a = m (Z₁ + Z₂) / 2; same module and pressure angle to mesh.', 'd = m Z, entraxe a = m (Z₁ + Z₂) / 2 ; même module et même angle de pression pour engrener.'],
      ['GR = N_B / N_A = ω_A / ω_B, T_B = η GR T_A; each external mesh reverses the direction.', 'GR = N_B / N_A = ω_A / ω_B, T_B = η GR T_A ; chaque engrènement extérieur inverse le sens.'],
      ['Compound train: the ratios multiply; an idler only changes the direction.', 'Train composé : les rapports se multiplient ; une roue intermédiaire ne change que le sens.']],
    ex: [
      { lv: 1, q: ['A 15 teeth drives B 45 teeth. Ratio?', 'A 15 dents entraîne B 45 dents. Rapport ?'], num: { ans: 3, tol: 0.01, unit: '' }, sol: ['45 / 15 = <b>3</b>.', '45 / 15 = <b>3</b>.'] },
      { lv: 2, q: ['Module 2.5 mm, gears of 18 and 54 teeth. Centre distance (mm)?', 'Module 2,5 mm, roues de 18 et 54 dents. Entraxe (mm) ?'], num: { ans: 90, tol: 0.1, unit: 'mm' }, sol: ['2.5 × (18 + 54) / 2 = <b>90 mm</b>.', '2,5 × (18 + 54) / 2 = <b>90 mm</b>.'] },
      { lv: 3, q: ['Train 10 → 40 then (same shaft) 12 → 36, input 2400 rpm. Output speed (rpm)?', 'Train 10 → 40 puis (même arbre) 12 → 36, entrée 2400 tr/min. Vitesse de sortie (tr/min) ?'], num: { ans: 200, tol: 0.5, unit: 'tr/min' }, sol: ['GR = 4 × 3 = 12: 2400 / 12 = <b>200 rpm</b>, same direction as the input (two meshes).', 'GR = 4 × 3 = 12 : 2400 / 12 = <b>200 tr/min</b>, même sens que l\'entrée (deux engrènements).'] }
    ] },
  4: { sum: [['Backlash = clearance between teeth; lost motion = backlash + deformation + hysteresis.', 'Jeu = espace entre dents ; mouvement perdu = jeu + déformation + hystérésis.'],
      ['Error at the tip = arm length × backlash (rad): 10′ on 1 m ≈ 2.9 mm.', 'Erreur au bout = longueur du bras × jeu (rad) : 10′ sur 1 m ≈ 2,9 mm.'],
      ['Remedies: preloaded gears, precision, planetary, cycloidal, harmonic drives. Choose ratio, mounting, environment, backlash, maintenance.', 'Remèdes : engrenages précontraints, précision, planétaires, cycloïdaux, harmonic drives. Choisir rapport, montage, environnement, jeu, entretien.']],
    ex: [
      { lv: 2, q: ['Backlash 3 arcmin, arm 1.2 m. Error at the tip (mm)?', 'Jeu 3 minutes d\'arc, bras 1,2 m. Erreur au bout (mm) ?'], num: { ans: 1.047, tol: 0.01, unit: 'mm' }, sol: ['1200 × 0.05° × π / 180 ≈ <b>1.05 mm</b>.', '1200 × 0,05° × π / 180 ≈ <b>1,05 mm</b>.'] },
      { lv: 1, q: ['Which reducer has almost zero backlash?', 'Quel réducteur a un jeu presque nul ?'], mcq: [['Harmonic drive', 'Harmonic drive', true], ['Plastic spur gear train', 'Train d\'engrenages droits en plastique'], ['Chain drive', 'Transmission par chaîne']], sol: ['The flexspline is preloaded against the ring: <b>harmonic drive</b>.', 'La roue flexible est précontrainte contre la couronne : <b>harmonic drive</b>.'] },
      { lv: 3, q: ['A joint needs 0.1 mm at the end of a 0.5 m arm. Largest backlash in arcmin?', 'Une articulation demande 0,1 mm au bout d\'un bras de 0,5 m. Plus grand jeu en minutes d\'arc ?'], num: { ans: 0.6875, tol: 0.01, unit: '′' }, sol: ['0.1 / 500 rad = 2·10⁻⁴ rad = 0.0115° ≈ <b>0.69′</b>: only a harmonic or cycloidal reducer.', '0,1 / 500 rad = 2·10⁻⁴ rad = 0,0115° ≈ <b>0,69′</b> : seulement un harmonic ou un cycloïdal.'] }
    ] },
  5: { sum: [['Worm: GR = z₂ / z₁, often self-locking; rack: v = ω m Z / 2; screw: v = n × lead, F = 2π η T / lead.', 'Vis sans fin : GR = z₂ / z₁, souvent irréversible ; crémaillère : v = ω m Z / 2 ; vis : v = n × pas, F = 2π η T / pas.'],
      ['Bevel gears change the axis (often 90°): robot wrists, differentials.', 'Les engrenages coniques changent l\'axe (souvent 90°) : poignets de robots, différentiels.'],
      ['Self-locking: lead angle smaller than the friction angle; a ball screw never is.', 'Irréversible : angle d\'hélice plus petit que l\'angle de frottement ; une vis à billes ne l\'est jamais.']],
    ex: [
      { lv: 1, q: ['Pinion Z = 25, m = 2 mm. Rack travel per turn (mm)?', 'Pignon Z = 25, m = 2 mm. Course de la crémaillère par tour (mm) ?'], num: { ans: 157.08, tol: 0.2, unit: 'mm' }, sol: ['π d = π × 50 ≈ <b>157 mm</b>.', 'π d = π × 50 ≈ <b>157 mm</b>.'] },
      { lv: 2, q: ['Ball screw lead 10 mm, η = 0.9, 0.5 N·m. Force (N)?', 'Vis à billes pas 10 mm, η = 0,9, 0,5 N·m. Force (N) ?'], num: { ans: 282.7, tol: 1, unit: 'N' }, sol: ['2π × 0.9 × 0.5 / 0.01 ≈ <b>283 N</b>.', '2π × 0,9 × 0,5 / 0,01 ≈ <b>283 N</b>.'] },
      { lv: 2, q: ['Worm 1 start, wheel 60 teeth, worm at 1800 rpm. Wheel speed (rpm)?', 'Vis 1 filet, roue 60 dents, vis à 1800 tr/min. Vitesse de la roue (tr/min) ?'], num: { ans: 30, tol: 0.05, unit: 'tr/min' }, sol: ['1800 / 60 = <b>30</b>.', '1800 / 60 = <b>30</b>.'] }
    ] },
  6: { sum: [['Planetary: fixed ring 1 + N_r/N_s; fixed sun 1 + N_s/N_r; fixed carrier −N_r/N_s; N_r = N_s + 2N_p.', 'Planétaire : couronne fixe 1 + N_r/N_s ; soleil fixe 1 + N_s/N_r ; porte-satellites fixe −N_r/N_s ; N_r = N_s + 2N_p.'],
      ['Harmonic drive: GR = N_e / (N_c − N_e), output reversed, almost no backlash.', 'Harmonic drive : GR = N_e / (N_c − N_e), sortie inversée, presque sans jeu.'],
      ['Robots: cycloidal (RV) in the heavy axes, harmonic in wrists and cobots, belts or bevels to bring motors back.', 'Robots : cycloïdal (RV) dans les axes lourds, harmonic dans les poignets et les cobots, courroies ou coniques pour reculer les moteurs.']],
    ex: [
      { lv: 1, q: ['Fixed ring, N_s = 18, N_r = 72. Ratio?', 'Couronne fixe, N_s = 18, N_r = 72. Rapport ?'], num: { ans: 5, tol: 0.01, unit: '' }, sol: ['1 + 72/18 = <b>5</b>.', '1 + 72/18 = <b>5</b>.'] },
      { lv: 2, q: ['N_s = 20 and N_p = 25. Ring teeth N_r?', 'N_s = 20 et N_p = 25. Dents de la couronne N_r ?'], num: { ans: 70, tol: 0.1, unit: '' }, sol: ['20 + 2 × 25 = <b>70</b>.', '20 + 2 × 25 = <b>70</b>.'] },
      { lv: 2, q: ['Harmonic drive N_c = 122, N_e = 120. Ratio?', 'Harmonic drive N_c = 122, N_e = 120. Rapport ?'], num: { ans: 60, tol: 0.1, unit: '' }, sol: ['120 / 2 = <b>60</b>.', '120 / 2 = <b>60</b>.'] }
    ] },
  7: { sum: [['ω_m = N ω_L; T_m = J_m N α + (J_L α + T_load) / (N η); J reflected = J_L / N².', 'ω_m = N ω_L ; T_m = J_m N α + (J_L α + T_charge) / (N η) ; J ramenée = J_L / N².'],
      ['Inertia matching: N* = √(J_L / J_m); accept a load/motor inertia ratio of 5–10.', 'Adaptation d\'inertie : N* = √(J_L / J_m) ; accepter un rapport charge/moteur de 5 à 10.'],
      ['Check: peak torque, RMS torque (heating), max speed, reducer limits, margin 1.5–2.', 'Vérifier : couple crête, couple efficace (échauffement), vitesse maximale, limites du réducteur, marge 1,5–2.']],
    ex: [
      { lv: 1, q: ['Joint at 30 rpm, ratio 80. Motor speed (rpm)?', 'Articulation à 30 tr/min, rapport 80. Vitesse moteur (tr/min) ?'], num: { ans: 2400, tol: 1, unit: 'tr/min' }, sol: ['30 × 80 = <b>2400</b>.', '30 × 80 = <b>2400</b>.'] },
      { lv: 2, q: ['J_L = 0.5 kg·m², N = 50. Reflected inertia (kg·cm²)?', 'J_L = 0,5 kg·m², N = 50. Inertie ramenée (kg·cm²) ?'], num: { ans: 2, tol: 0.01, unit: 'kg·cm²' }, sol: ['0.5 / 2500 = 2·10⁻⁴ kg·m² = <b>2 kg·cm²</b>.', '0,5 / 2500 = 2·10⁻⁴ kg·m² = <b>2 kg·cm²</b>.'] },
      { lv: 3, q: ['Gravity torque 40 N·m at the joint, N = 100, η = 0.8, no acceleration. Motor torque (N·m)?', 'Couple de gravité 40 N·m à l\'articulation, N = 100, η = 0,8, sans accélération. Couple moteur (N·m) ?'], num: { ans: 0.5, tol: 0.005, unit: 'N·m' }, sol: ['40 / (100 × 0.8) = <b>0.5 N·m</b>.', '40 / (100 × 0,8) = <b>0,5 N·m</b>.'] }
    ] },
  8: { sum: [['Families: impactive (fingers), astrictive (vacuum, magnetic, electroadhesion), contigutive (adhesive), soft.', 'Familles : impactive (doigts), astrictive (vide, magnétique, électroadhésion), contigutive (adhésive), souple.'],
      ['Force-fit (friction) or form-fit (shape); external, internal; V-jaws; gripper frame Zₑ = approach.', 'Par adhérence (frottement) ou par obstacle (forme) ; extérieure, intérieure ; mors en V ; repère pince Zₑ = approche.'],
      ['n μ F ≥ S m (g + a); screw F = 2π η T / lead.', 'n μ F ≥ S m (g + a) ; vis F = 2π η T / pas.']],
    ex: [
      { lv: 2, q: ['Part of 1 kg, a = 5 m/s², S = 2, μ = 0.5, two jaws. Minimal jaw force (N)?', 'Pièce de 1 kg, a = 5 m/s², S = 2, μ = 0,5, deux mors. Force minimale de serrage (N) ?'], num: { ans: 29.62, tol: 0.1, unit: 'N' }, sol: ['2 × 1 × 14.81 / (2 × 0.5) ≈ <b>29.6 N</b>.', '2 × 1 × 14,81 / (2 × 0,5) ≈ <b>29,6 N</b>.'] },
      { lv: 1, q: ['Which gripper suits steel sheets?', 'Quel préhenseur convient aux tôles d\'acier ?'], mcq: [['Magnetic (or vacuum)', 'Magnétique (ou à vide)', true], ['Two-finger parallel', 'Parallèle à deux doigts'], ['Adhesive', 'Adhésif']], sol: ['Flat, ferromagnetic: <b>magnetic</b> (or vacuum cups).', 'Plate, ferromagnétique : <b>magnétique</b> (ou ventouses).'] },
      { lv: 2, q: ['Screw lead 2 mm, η = 0.4: motor torque (N·cm) for a jaw force of 25 N?', 'Vis de pas 2 mm, η = 0,4 : couple moteur (N·cm) pour une force de serrage de 25 N ?'], num: { ans: 1.989, tol: 0.02, unit: 'N·cm' }, sol: ['T = F × lead / (2π η) = 25 × 0.002 / (2.513) ≈ 0.0199 N·m = <b>1.99 N·cm</b>.', 'T = F × pas / (2π η) = 25 × 0,002 / 2,513 ≈ 0,0199 N·m = <b>1,99 N·cm</b>.'] }
    ] }
};
