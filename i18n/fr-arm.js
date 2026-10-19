// Français — page arm. Clé = empreinte du texte anglais, valeur = traduction.
RA.add({
"rgm1e9bol3": "Bras robot 3D (R-R-R)",
"2a3n2v03pg2": "Schéma cinématique, vue de côté",
"1yi59405djl": "Axes : <span class=\"legend-x\">x rouge</span>, <span class=\"legend-y\">y vert</span>, <span class=\"legend-z\">z bleu</span>. ⊙ est un axe qui pointe <em>vers vous</em>, ⊗ est un axe qui pointe <em>à l'opposé</em>. La vue tourne avec q1, donc vous regardez toujours le bras de côté.",
"tkwwjq1lux": "Le repère i est attaché à l'axe de la liaison i+1. Chaque ligne est : <code>A<sub>i</sub> = Rz(θ) · Tz(d) · Tx(a) · Rx(α)</code>. Les nombres orange sont les valeurs actuelles.",
"16xpq3xriww": "Le repère i est attaché à l'axe de la liaison i. Chaque ligne est : <code>A<sub>i</sub> = Rx(α<sub>i−1</sub>) · Tx(a<sub>i−1</sub>) · Rz(θ) · Tz(d)</code>. La dernière ligne est le pas fixe entre le coude et l'outil.",
"6gmmnnmvwz": "La dernière colonne est la position de l'outil dans le repère de base {0}. Les deux tableaux donnent exactement cette même matrice.",
"jhegh0jtar": "Où utilise-t-on ce type de bras ?",
"1wnasy1o75d": "Ces trois liaisons sont la <strong>partie de positionnement</strong> d'un bras industriel plus grand : la base, l'épaule et le coude amènent l'outil à un point de l'espace. Un vrai robot 6 axes ajoute un <em>poignet</em> à trois liaisons pour choisir aussi l'orientation de l'outil. Seul, un bras 3 axes sert à la prise et dépose simples, aux robots pédagogiques, et au positionnement de caméras ou de capteurs.",
"1un20phxagj": "<strong>Oui, on peut y mettre une pince</strong>, mais avec seulement 3 degrés de liberté il choisit <em>où</em> est l'outil, pas <em>comment il est orienté</em>. L'objet doit donc toujours être saisi dans la même direction. Ce qui fonctionne :",
"653o4tnaht": "Une <strong>ventouse</strong> ou une pince pour des objets toujours posés de la même façon.",
"j7jy1qwbqg": "Un <strong>stylo, un marqueur ou un pointeur laser</strong>, pour dessiner et faire des démonstrations.",
"1ycrwwta0z": "Une <strong>caméra</strong>, pour l'inspection.",
"20wgv36gzri": "Pour souder, peindre ou saisir sous n'importe quel angle, il faut les 3 liaisons de poignet supplémentaires.",
"2cqni72fz7s": "q1 (axe vertical)",
"ojmgo6kzq4": "Bras robot 3D"
});
