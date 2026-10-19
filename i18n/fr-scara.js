// Français — page scara. Clé = empreinte du texte anglais, valeur = traduction.
RA.add({
"15ys122aczx": "Robot SCARA (R-R-P-R)",
"vce8u2idhb": "Axes : <span class=\"legend-x\">x rouge</span>, <span class=\"legend-y\">y vert</span>, <span class=\"legend-z\">z bleu</span>. Un cercle avec un point ⊙ est un axe qui pointe <em>vers vous</em>, un cercle avec une croix ⊗ est un axe qui pointe <em>à l'opposé</em>. Le carré est la liaison glissière q3, vue de dessus.",
"322fo0smtq": "Le repère i est attaché à l'axe de la liaison i+1. Chaque ligne est une transformation : <code>A<sub>i</sub> = Rz(θ) · Tz(d) · Tx(a) · Rx(α)</code>. Les nombres orange sont les valeurs actuelles.",
"1ud7a7i9qf0": "La dernière colonne est la position de l'outil dans le repère de base {0}. Le bloc 3×3 est son orientation. Les deux tableaux, multipliés ligne par ligne, donnent exactement cette même matrice.",
"29i3sfc3ocs": "Cinématique directe d'un SCARA",
"1rtrlv90dci": "x = L1·cos(q1) + L2·cos(q1+q2)\ny = L1·sin(q1) + L2·sin(q1+q2)\nz = 0.60 + 0.10 − (q3 + 0.30) − 0.06\nangle de l'outil = q1 + q2 − q4      (z pointe vers le BAS, donc q4 tourne dans l'autre sens)",
"2d8mmun6m9w": "La cinématique directe va des angles des liaisons à la position de l'outil. La démo a besoin de l'inverse : <strong>« aller au point (x, y) », donc quels q1 et q2 ?</strong> Pour un bras à deux segments, il existe une réponse en formule fermée :",
"bmnyyzvhlr": "c2 = (x² + y² − L1² − L2²) / (2·L1·L2)\nq2 = ± arccos(c2)                         (± = coude à gauche ou coude à droite)\nq1 = atan2(y, x) − atan2(L2·sin q2, L1 + L2·cos q2)\nq4 = q1 + q2                              (garde le cube orienté dans la même direction)",
"25o3lfc21rz": "Si |c2| est supérieur à 1, le point est hors d'atteinte : il n'y a pas de solution. La démo utilise la solution « coude à gauche » (q2 positif) :",
"1cdwo2xstqz": "Où utilise-t-on un SCARA ?",
"155lg5zbygr": "Usines d'électronique (pose et insertion de composants sur des cartes), vissage et assemblage de petites pièces, emballage, prise et dépose d'objets légers, et dépose de colle ou de mastic. Il est rapide (une prise et dépose en moins d'une seconde) et très rigide à la verticale, mais souple latéralement, ce qui aide à insérer une broche dans un trou.",
"eqtl9nut9b": "<strong>Oui, une pince fonctionne</strong> : une pince parallèle à deux doigts, comme celle dessinée dans le modèle 3D. Autres outils :",
"28o8h0ccw2c": "<strong>Ventouse</strong>, le choix le plus courant pour les pièces plates et légères.",
"k7zb3wcd0b": "<strong>Visseuse électrique</strong>, pour visser.",
"2622wg09fp8": "<strong>Buse de dépose</strong>, pour de la colle ou de la pâte.",
"11d30v7i7a0": "L'outil pointe toujours droit vers le bas et ne peut tourner qu'autour de l'axe vertical (q4). L'objet doit donc être saisi par le dessus.",
"49x86x56lg": "Socle",
"1o9t74cmput": "q3 (glissière)",
"1tn9udilzfi": "Robot SCARA"
});
