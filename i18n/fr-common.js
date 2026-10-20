// Français — textes communs à plusieurs pages. Clé = empreinte du texte anglais, valeur = traduction.
RA.add({
"azgr0bxc71": "Robot mobile (entraînement différentiel)",
"ytwmfwfskc": "Liaisons",
"1vviivnj4qh": "Vitesse",
"1ph0dc5rw1g": "Charge utile",
"4n157pf63k": "Espace de travail",
"czc8jzrpb7": "3",
"25dyckone7a": "Moyenne",
"om1cpgg7ds": "Élevée",
"1awrvq9cygf": "Très élevée",
"2b7fwy8697v": "<a href=\"index.html\" style=\"color:#ff9f43\">← Liste des robots</a> · <a href=\"learn.html\" style=\"color:#ff9f43\">Apprendre les bases</a>",
"rkwjejzacz": "Déplacez un curseur, ou cliquez dans une case numérique et tapez une valeur au clavier.",
"anvvehnfsl": "Masquer les axes",
"2b9umkqqj4g": "Repères :",
"5ug0poejra": "DH (standard)",
"1gsoedyosn6": "DHM (modifié)",
"g93suqfx5f": "Afficher :",
"2541pvm1bys": "Tableau DH (standard)",
"u000z7v206": "Tableau DHM (DH modifié)",
"1fk3o3821oc": "Résultat : où est l'outil ?",
"ceklih1y4q": "Effecteur (outil)",
"10yebanzr3k": "Schéma cinématique",
"1tsn15i25kj": "Vue :",
"2e81ars32ag": "Vue de face",
"11y0jqt8461": "Vue de dessus",
"1krji59om7o": "Vue de côté",
"1sa61hp8977": "Le repère i est attaché à l'axe de la liaison i. Chaque ligne est : <code>A<sub>i</sub> = Rx(α<sub>i−1</sub>) · Tx(a<sub>i−1</sub>) · Rz(θ) · Tz(d)</code>.",
"w9ikveam28": "Lancer la démo",
"2554s8khkhe": "Réinitialiser",
"v7kjhe8b9q": "Démo de prise et dépose : le robot déplace le cube bleu entre le socle A et le socle B.",
"1jnjznywx1j": "Schéma cinématique, vue de dessus",
"urzytml6vf": "Cinématique inverse : comment la démo trouve les angles des liaisons",
"t0x9e8xcln": "Chaque liaison est dessinée avec son symbole : un <strong>cercle</strong> quand son axe pointe vers vous ou à l'opposé, et une <strong>barre épaisse</strong> le long de son axe sinon. La ligne orange va de la base à l'outil. Axes : <span class=\"legend-x\">x rouge</span>, <span class=\"legend-y\">y vert</span>, <span class=\"legend-z\">z bleu</span>. ⊙ pointe <em>vers vous</em>, ⊗ pointe <em>à l'opposé</em>. Les carrés en pointillés sont les socles A et B, et le carré bleu est le cube.",
"t0layt8j1i": "1. calculer où est l'outil maintenant (cinématique directe)\n2. calculer l'erreur entre la cible et l'outil\n3. utiliser la jacobienne pour trouver les petites variations des liaisons qui réduisent l'erreur\n4. recommencer jusqu'à ce que l'erreur soit inférieure à 0,01 mm",
"1k9urgr2bx8": "Démarrer",
"1p9ntx4omd0": "Roues",
"ufj6fdzdkj": "CIR",
"r9aptl9yhu": "Tous les repères",
"z8k4p747qd": "Afficher les axes",
"16rhj2y44oe": "Mettre la démo en pause",
"9wa9e0lbf3": "Reprendre la démo",
"14bg6ikj3d3": "Démo en pause. Vous pouvez déplacer les curseurs ; appuyez sur Reprendre pour continuer.",
"1wazwmrpsyg": "Pause",
"gpp6lwqvrg": "Reprendre",
"2905gco5k4g": "Cible",
"1oyzao4w0p": "au-dessus du socle A",
"i1vjb7grkz": "sur le socle A",
"yq8ucd14fx": "au-dessus du socle B",
"1ufg63463m": "sur le socle B",
"avr9qwuv1v": "Descendre vers le cube",
"ss5qy41vwq": "Fermer la pince",
"25src6tjvho": "Soulever le cube",
"1vw5c5p4s6x": "Descendre",
"1diwze0re9q": "Ouvrir la pince",
"1p2aq4klj3z": "Remonter",
"s4czs25c62": "Hors d'atteinte : l'avant-bras est trop court ou trop long pour ce point.",
"by0tbu3g28": "vL · vitesse de la roue gauche",
"1cr3gsd4fip": "vR · vitesse de la roue droite",
"36mx0r4wz7": "⚠ mur : le robot s'est arrêté",
"1akwjo28ivk": "grille : 1 carreau = 1 m"
});
(function () {
  var R = RA.rule, T = RA.text;
  var NAMES = { 'base rotation': 'rotation de la base', 'shoulder': 'épaule', 'elbow': 'coude', 'forearm roll': "rotation de l'avant-bras", 'wrist bend': 'flexion du poignet',
    'tool roll': "rotation de l'outil", 'tool rotation': "rotation de l'outil", 'vertical slide': 'translation verticale', 'along the rails': 'le long des rails',
    'across': 'en travers', 'down': 'vers le bas', 'base': 'base', 'wrist 1': 'poignet 1', 'wrist 2': 'poignet 2', 'wrist 3': 'poignet 3' };
  R(/^Frame \{(\d+)\} only$/, function (m) { return 'Repère {' + m[1] + '} seul'; });
  R(/^Demo: (.+)$/, function (m) { return 'Démo : ' + T(m[1]); });
  R(/^Move above pad (\w)$/, function (m) { return 'Aller au-dessus du socle ' + m[1]; });
  R(/^Carry the cube above pad (\w)$/, function (m) { return 'Amener le cube au-dessus du socle ' + m[1]; });
  R(/^q(\d) · (.+) \((R|P)\)$/, function (m) { return 'q' + m[1] + ' · ' + (NAMES[m[2]] || m[2]) + ' (' + m[3] + ')'; });
  R(/^θ(\d) · motor (\d) \(R\)$/, function (m) { return 'θ' + m[1] + ' · moteur ' + m[2] + ' (R)'; });
  R(/^(.+) \(fixed\)$/, function (m) { return m[1] + ' (fixe)'; });
  var READ = [['Tool position in the base frame', "Position de l'outil dans le repère de base"],
    ['Flange (frame {6}) position in the base frame {0}', 'Position de la bride (repère {6}) dans le repère de base {0}'],
    ['Effector centre in the base frame', "Centre de l'effecteur dans le repère de base"],
    ['tool points to', "l'outil pointe vers"], ['(the effector stays parallel to the base)', "(l'effecteur reste parallèle à la base)"]];
  R(/^(Tool position|Flange \(frame|Effector centre) /, function (m) { return READ.reduce(function (s, p) { return s.split(p[0]).join(p[1]); }, m.input); });
  R(/^Out of range: this needs θ = (\(.+\))°, but the motors only go from (-?\d+)° to (\d+)°\.$/, function (m) {
    return 'Hors limites : cela demande θ = ' + m[1] + '°, mais les moteurs vont seulement de ' + m[2] + '° à ' + m[3] + '°.'; });
  R(/^Program ready: press Start\. First step: (.+)$/, function (m) { return 'Programme prêt : appuyez sur Démarrer. Première étape : ' + T(m[1]); });
  R(/^Program: (.+)$/, function (m) { return 'Programme : ' + T(m[1]); });
  R(/^side (\d+) of (\d+): (.+)$/, function (m) { return 'côté ' + m[1] + ' sur ' + m[2] + ' : ' + T(m[3]); });
  R(/^go straight for ([\d.]+) m$/, function (m) { return 'avancer tout droit de ' + m[1].replace('.', ',') + ' m'; });
  R(/^turn on the spot by (\d+)°$/, function (m) { return 'tourner sur place de ' + m[1] + '°'; });
  R(/^turn around \((\d+)°\)$/, function (m) { return 'faire demi-tour (' + m[1] + '°)'; });
  R(/^left circle \(right wheel faster\)$/, function () { return 'cercle vers la gauche (roue droite plus rapide)'; });
  R(/^right circle \(left wheel faster\)$/, function () { return 'cercle vers la droite (roue gauche plus rapide)'; });
  R(/^x = [-\d.]+ m .*(straight line|robot stopped|turn radius = )/, function (m) {
    return m.input.replace('turn radius =', 'rayon de virage =').replace('(straight line)', '(ligne droite)').replace('robot stopped', "robot à l'arrêt"); });
  R(/^steering (-?[\d.]+)°$/, function (m) { return 'braquage ' + m[1] + '°'; });
  R(/^target x .*error .* mm$/, function (m) { return m.input.replace('target', 'cible').replace(' error ', '\nerreur '); });
  R(/^wheel (\d)$/, function (m) { return 'roue ' + m[1]; });
})();
