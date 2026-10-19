// Français — page articulated. Clé = empreinte du texte anglais, valeur = traduction.
RA.add({
"1zo4hr49s57": "Robot articulé 6 axes (R-R-R-R-R-R)",
"29jrq4a31my": "Déplacez un curseur, ou cliquez dans une case numérique et tapez une valeur au clavier. Avec q = 0 pour toutes les liaisons, le bras pointe droit vers le haut.",
"219lhhneytx": "Le repère i est attaché à l'axe de la liaison i+1. Chaque ligne est : <code>A<sub>i</sub> = Rz(θ) · Tz(d) · Tx(a) · Rx(α)</code>. Les nombres orange sont les valeurs actuelles. Le « + 90 » des lignes 2 et 3 est un décalage qui met le bras droit vers le haut quand q = 0.",
"1iv17ag8l97": "La dernière colonne est la position du point central de l'outil (TCP, entre le bout des doigts) dans le repère de base {0}. Le bloc 3×3 dit où pointe l'outil : sa troisième colonne est la direction de z<sub>6</sub>, la direction dans laquelle la pince pointe. Les deux tableaux donnent exactement cette même matrice.",
"5cvnl9zr5k": "Le poignet sphérique",
"h72xjxoayd": "Regardez le tableau : les lignes 4, 5 et 6 ont a = 0. Donc les axes des liaisons 4, 5 et 6 <strong>se croisent en un seul point</strong> : le centre du poignet. Les liaisons 1, 2 et 3 placent ce point (la position), et les liaisons 4, 5 et 6 font tourner l'outil autour de lui (l'orientation). C'est pourquoi presque tous les robots industriels ont cette forme.",
"e53mxkliws": "À essayer : une singularité",
"1eo80zj4pnr": "Mettez <strong>q5 = 0</strong>. Maintenant les axes des liaisons 4 et 6 sont sur la même droite (choisissez <em>Afficher : repère {4} seul</em> et comparez z<sub>3</sub> et z<sub>5</sub>). Bougez q4, puis bougez q6 : l'outil tourne dans le même sens. Le robot a perdu un degré de liberté. C'est une <em>singularité de poignet</em>, que les programmeurs de robots évitent.",
"iuphb6u0lb": "La démo dit « mets l'outil à ce point, pointé vers le bas » et la page trouve les 6 angles des liaisons. Pour 6 liaisons, il n'y a pas de formule simple à écrire, donc elle utilise une <strong>méthode numérique</strong> :",
"1u4l2rufoo4": "L'outil doit pointer droit vers le bas, les doigts le long de x. Voici les angles trouvés :",
"2cjp6dkvhnj": "Où utilise-t-on un robot articulé 6 axes ?",
"zfct7jnmb7": "<strong>Usines automobiles</strong> (soudage par points, soudage à l'arc, peinture, étanchéité), <strong>chargement de machines</strong> (charger et décharger des machines CNC), <strong>palettisation</strong>, <strong>assemblage</strong>, <strong>manutention</strong>, fonderies et forge, et laboratoires. Les charges vont de quelques kg à plus de 1000 kg, avec une répétabilité de 0,02 à 0,1 mm. Constructeurs connus : FANUC, KUKA, ABB, Yaskawa, Stäubli.",
"29v788t0zos": "<strong>Oui, une pince fonctionne</strong>, comme celle à deux doigts du modèle 3D. Grâce aux 6 axes, il peut saisir un objet dans <em>n'importe quelle</em> direction, pas seulement par le dessus. Autres outils :",
"1p505q5dogp": "<strong>Ventouse</strong>, pour des boîtes, des plaques et des tôles de carrosserie.",
"x6hjm11lv8": "<strong>Torche de soudage ou pince à souder par points</strong>, pour souder.",
"w3ogdgwlpp": "<strong>Pistolet de peinture</strong> ou buse d'étanchéité.",
"g0g1bhnxfx": "<strong>Visseuse</strong>, <strong>broche d'ébavurage</strong> ou outil de polissage.",
"24valoqpyta": "<strong>Caméra</strong>, pour l'inspection, et un <strong>changeur d'outil</strong> pour changer d'outil au cours de la journée.",
"fykiiuk9yw": "Robot articulé 6 axes"
});
