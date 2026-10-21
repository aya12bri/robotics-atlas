// Course 4 — Singularities and the Jacobian
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
import { partA } from './sing-a.mjs';
import { partB } from './sing-b.mjs';

export const meta = {};
export function build() {
  const head = {
    title: tx('Singularities and the Jacobian', 'Singularités et jacobienne'),
    lead: tx('The part of robotics that surprises everybody: why a robot arm suddenly loses a direction of movement, why its motors race, why a tool orientation “locks”, and how professionals live with it. We start from joint speeds and finish with redundant and parallel robots. You should have followed the “Maths and motion” course (or know what a 2-axis arm and a matrix are).',
      "La partie de la robotique qui surprend tout le monde : pourquoi un bras robot perd soudain une direction de mouvement, pourquoi ses moteurs s'emballent, pourquoi l'orientation d'un outil « se bloque », et comment les professionnels vivent avec. On part des vitesses articulaires pour finir avec les robots redondants et parallèles. Il faut avoir suivi le cours « Maths et mouvement » (ou savoir ce qu'est un bras à 2 axes et une matrice)."),
    intro: BOX('idea', ['The big question', 'La grande question'],
      P('Stretch your arm completely in front of you and ask a friend to push your hand towards you along the arm. You resist with no effort: the bones carry the load. Now try to move your hand <strong>along</strong> the arm without bending the elbow: impossible. In that pose your arm has <strong>lost a direction</strong>. Robots have exactly the same problem, and it has a name: a <strong>singularity</strong>.',
        "Tendez complètement le bras devant vous et demandez à un ami de pousser votre main vers vous, le long du bras. Vous résistez sans effort : les os portent la charge. Essayez maintenant de déplacer la main <strong>le long</strong> du bras sans plier le coude : impossible. Dans cette pose votre bras a <strong>perdu une direction</strong>. Les robots ont exactement le même problème, et il a un nom : une <strong>singularité</strong>."),
      P('This course answers five questions:', 'Ce cours répond à cinq questions :'),
      UL([
        ['<strong>What is it?</strong> (lessons 1 and 2) A pose where the Jacobian matrix loses rank.', '<strong>Qu\'est-ce que c\'est ?</strong> (leçons 1 et 2) Une pose où la matrice jacobienne perd du rang.'],
        ['<strong>Where are they?</strong> (lesson 3) The three famous ones of a 6-axis robot: elbow, shoulder, wrist.', '<strong>Où sont-elles ?</strong> (leçon 3) Les trois célèbres d\'un robot 6 axes : coude, épaule, poignet.'],
        ['<strong>How close am I?</strong> (lesson 4) Manipulability and condition number.', '<strong>À quel point suis-je proche ?</strong> (leçon 4) Manipulabilité et conditionnement.'],
        ['<strong>Why does it hurt?</strong> (lessons 5 and 6) Exploding speeds, lost forces, gimbal lock.', '<strong>Pourquoi est-ce gênant ?</strong> (leçons 5 et 6) Vitesses qui explosent, efforts perdus, blocage de cardan.'],
        ['<strong>What do I do about it?</strong> (lessons 7 and 8) Redundancy, damped inverse, planning, parallel robots.', '<strong>Que faire ?</strong> (leçons 7 et 8) Redondance, inverse amortie, planification, robots parallèles.']
      ])),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: glossary(),
    finish: {
      h: tx('You can now read a singularity like a pro!', 'Vous savez maintenant lire une singularité comme un pro !'),
      p: tx('Next step: dynamics, motors and control — what happens when the robot must actually follow the speeds you computed.', 'Étape suivante : dynamique, moteurs et commande, c\'est-à-dire ce qui se passe quand le robot doit réellement suivre les vitesses calculées.'),
      next: ['learn-control.html', tx('Go to dynamics and control →', 'Aller à la dynamique et à la commande →')],
      back: tx('Back to the roadmap', 'Retour au parcours')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}

function glossary() {
  return TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
    [['Jacobian', 'Jacobienne'], ['The matrix J(q) that turns joint speeds into tool speeds: ẋ = J q̇.', 'La matrice J(q) qui transforme les vitesses articulaires en vitesses de l\'outil : ẋ = J q̇.']],
    [['Singularity', 'Singularité'], ['A pose where J loses rank: the tool cannot move in at least one direction, whatever the joint speeds.', 'Une pose où J perd du rang : l\'outil ne peut pas bouger dans au moins une direction, quelles que soient les vitesses articulaires.']],
    [['Rank', 'Rang'], ['The number of independent directions that J can produce.', 'Le nombre de directions indépendantes que J peut produire.']],
    [['Boundary singularity', 'Singularité de frontière'], ['A singularity at the edge of the workspace (arm stretched or folded).', 'Une singularité au bord de l\'espace de travail (bras tendu ou replié).']],
    [['Internal singularity', 'Singularité interne'], ['A singularity inside the workspace (shoulder, wrist): the most dangerous, because the robot can reach it while working.', 'Une singularité à l\'intérieur de l\'espace de travail (épaule, poignet) : la plus dangereuse, car le robot peut s\'y retrouver en travaillant.']],
    [['Manipulability', 'Manipulabilité'], ['w = √det(J Jᵀ): a number that is zero at a singularity and large far from it.', 'w = √det(J Jᵀ) : un nombre nul à une singularité et grand loin d\'elle.']],
    [['Singular values', 'Valeurs singulières'], ['The lengths σᵢ of the axes of the manipulability ellipsoid.', 'Les longueurs σᵢ des axes de l\'ellipsoïde de manipulabilité.']],
    [['Condition number', 'Conditionnement'], ['κ = σmax / σmin: 1 is perfect, a huge value means “almost singular”.', 'κ = σmax / σmin : 1 est parfait, une valeur énorme signifie « presque singulier ».']],
    [['Pseudo-inverse', 'Pseudo-inverse'], ['J⁺ = Jᵀ(J Jᵀ)⁻¹: the inverse for a redundant robot, which gives the smallest joint speeds.', 'J⁺ = Jᵀ(J Jᵀ)⁻¹ : l\'inverse pour un robot redondant, qui donne les plus petites vitesses articulaires.']],
    [['Damped least squares', 'Moindres carrés amortis'], ['An inverse with a small penalty λ that keeps joint speeds finite near a singularity.', 'Un inverse avec une petite pénalité λ qui garde des vitesses articulaires finies près d\'une singularité.']],
    [['Null space', 'Espace nul'], ['Joint motions that do not move the tool (J q̇ = 0): the “self-motion” of a redundant robot.', 'Mouvements articulaires qui ne déplacent pas l\'outil (J q̇ = 0) : l\'« auto-mouvement » d\'un robot redondant.']],
    [['Redundant robot', 'Robot redondant'], ['A robot with more joints than the task needs (for example 7 axes for a 6-DOF task).', 'Un robot avec plus d\'articulations que la tâche n\'en demande (par exemple 7 axes pour une tâche à 6 DDL).']],
    [['Gimbal lock', 'Blocage de cardan'], ['Singularity of the Euler / Cardan angles: two rotation axes line up and one degree of freedom disappears.', 'Singularité des angles d\'Euler / Cardan : deux axes de rotation s\'alignent et un degré de liberté disparaît.']],
    [['Quaternion', 'Quaternion'], ['Four numbers that describe an orientation without any singularity.', 'Quatre nombres qui décrivent une orientation sans aucune singularité.']],
    [['Wrist singularity', 'Singularité de poignet'], ['Joint 5 = 0 on a spherical wrist: axes 4 and 6 are aligned.', 'Articulation 5 = 0 sur un poignet sphérique : les axes 4 et 6 sont alignés.']],
    [['Direct / inverse kinematic singularity', 'Singularité cinématique directe / inverse'], ['Parallel robots: the platform moves with locked motors (direct), or the motors cannot move the platform (inverse).', 'Robots parallèles : la plateforme bouge alors que les moteurs sont bloqués (directe), ou les moteurs ne peuvent plus bouger la plateforme (inverse).']]
  ]);
}
