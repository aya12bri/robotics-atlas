// Course 8 — Wheeled mobile robots: locomotion, kinematics and motion control
// Sources: four lecture sets (mobile-robot locomotion and kinematics, wheel constraints and maneuverability,
// omnidirectional robots, and a bicycle / car exercise), rewritten and explained for this site.
import { tx, P, H4, UL, OL, EQ, BOX, TABLE, FIG, WIDGET, TRY, MX, lesson } from '../lib.mjs';
import { partA } from './m-a.mjs';
import { partB } from './m-b.mjs';
import { partC } from './m-c.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  const head = {
    title: tx(`Wheeled mobile robots: kinematics and motion control`, `Robots mobiles à roues : cinématique et commande du mouvement`),
    lead: tx(`How a robot on wheels moves, and how to make it move where you want: the pose and the rotation matrix, the constraints of every wheel type, differential drive, tricycle, bicycle and car (Ackermann), omnidirectional and synchro drive, the ICR, mobility, steerability and maneuverability, holonomic and nonholonomic robots, and a controller that drives a robot to a goal pose. Each lesson has worked examples, a check-yourself quiz and (in five of them) a widget to try.`,
      `Comment un robot sur roues se déplace, et comment le faire aller où l'on veut : la pose et la matrice de rotation, les contraintes de chaque type de roue, le robot différentiel, le tricycle, le vélo et la voiture (Ackermann), l'omnidirectionnel et l'entraînement synchrone, le CIR, la mobilité, l'orientabilité et la manœuvrabilité, les robots holonomes et non holonomes, et un contrôleur qui conduit un robot vers une pose but. Chaque leçon a des exemples résolus, un quiz d'auto-évaluation et (dans cinq d'entre elles) un widget à essayer.`),
    intro: BOX(`idea`, [`The logic of the course`, `La logique du cours`],
      P(`Everything in this course comes from <strong>one idea</strong>: a standard wheel rolls forward and refuses to slide sideways. Write that as two equations for each wheel (lesson 3), stack the equations of all the wheels (lesson 7), and you get the answer to every question: <em>how do the wheel speeds make the robot move</em> (lessons 4 to 6), <em>how freely can it move</em> (lessons 7 and 8) and <em>how do I steer it to a goal</em> (lesson 9).`,
        `Tout ce cours vient d'<strong>une seule idée</strong> : une roue standard roule vers l'avant et refuse de glisser de côté. Écrivez cela en deux équations par roue (leçon 3), empilez les équations de toutes les roues (leçon 7), et vous obtenez la réponse à toutes les questions : <em>comment les vitesses des roues font-elles avancer le robot</em> (leçons 4 à 6), <em>quelle est sa liberté de mouvement</em> (leçons 7 et 8) et <em>comment le conduire vers un but</em> (leçon 9).`),
      TABLE([[`Lessons`, `Leçons`], [`Question`, `Question`], [`Robots`, `Robots`]], [
        [`1 – 2`, [`What is a wheeled robot and where is it?`, `Qu'est-ce qu'un robot à roues et où est-il ?`], [`all`, `tous`]],
        [`3`, [`What does one wheel allow?`, `Qu'autorise une roue ?`], [`wheels`, `roues`]],
        [`4 – 6`, [`How do wheel speeds make the robot move?`, `Comment les vitesses des roues font-elles avancer le robot ?`], [`differential, bicycle / car, omni, synchro`, `différentiel, vélo / voiture, omni, synchrone`]],
        [`7 – 8`, [`How freely can it move?`, `Quelle liberté de mouvement a-t-il ?`], [`any layout`, `toute disposition`]],
        [`9`, [`How do I drive it to a goal?`, `Comment le conduire vers un but ?`], [`differential`, `différentiel`]]
      ])),
    glossTitle: tx(`Glossary`, `Glossaire`),
    glossIntro: tx(`All the words of the course in one place.`, `Tous les mots du cours au même endroit.`),
    gloss: glossary(),
    finish: {
      h: tx(`You can now model and drive any wheeled robot!`, `Vous savez maintenant modéliser et conduire n'importe quel robot à roues !`),
      p: tx(`Go and test it: drive the 3D robots, and try the drives in the wheels lab. Then continue with the dynamics and control of the motors that turn those wheels.`, `Allez le tester : pilotez les robots en 3D et essayez les motorisations dans le laboratoire des roues. Puis continuez avec la dynamique et la commande des moteurs qui font tourner ces roues.`),
      next: [`wheels.html`, tx(`Go to the wheels lab →`, `Aller au laboratoire des roues →`)],
      back: tx(`Back to the roadmap`, `Retour au parcours`)
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}

function glossary() {
  return TABLE([[`Term`, `Terme`], [`Meaning`, `Sens`]], [
    [[`Pose / posture`, `Pose / posture`], [`The position and orientation of the robot: (x, y, θ).`, `La position et l'orientation du robot : (x, y, θ).`]],
    [[`Rotation matrix R(θ)`, `Matrice de rotation R(θ)`], [`Converts a vector from the global frame to the robot frame.`, `Convertit un vecteur du repère global au repère robot.`]],
    [[`Rolling constraint`, `Contrainte de roulement`], [`The wheel contact moves along its plane at r·φ̇ (pure rolling).`, `Le contact de la roue avance dans son plan à r·φ̇ (roulement pur).`]],
    [[`Sliding constraint`, `Contrainte de glissement`], [`The wheel contact has no speed across its plane (no lateral slip).`, `Le contact de la roue n'a aucune vitesse en travers de son plan (pas de glissement latéral).`]],
    [[`Standard wheel (fixed / steered)`, `Roue standard (fixe / orientable)`], [`A wheel that rolls and does not slide; it constrains the robot.`, `Une roue qui roule et ne glisse pas ; elle contraint le robot.`]],
    [[`Castor wheel`, `Roue folle`], [`A wheel whose steering axis is offset from the contact point; it does not constrain the robot.`, `Une roue dont l'axe de direction est décalé du point de contact ; elle ne contraint pas le robot.`]],
    [[`Swedish / Mecanum wheel`, `Roue suédoise / Mecanum`], [`A wheel with free rollers on its rim: it also moves along the rollers.`, `Une roue avec des rouleaux libres sur sa jante : elle peut aussi se déplacer le long des rouleaux.`]],
    [[`Differential drive`, `Entraînement différentiel`], [`Two driven wheels on one axle; v = (V_R + V_L) / 2, ω = (V_R − V_L) / L.`, `Deux roues motrices sur un même axe ; v = (V_R + V_L) / 2, ω = (V_R − V_L) / L.`]],
    [[`ICC / ICR`, `CIC / CIR`], [`Instantaneous centre of curvature / rotation: the point around which the robot turns at one instant.`, `Centre instantané de courbure / rotation : le point autour duquel le robot tourne à un instant donné.`]],
    [[`Ackermann steering`, `Direction d'Ackermann`], [`The inside front wheel turns more than the outside one, so all four wheel axes meet at the ICR.`, `La roue avant intérieure braque plus que l'extérieure, de sorte que les quatre axes de roues se coupent au CIR.`]],
    [[`Synchro drive`, `Entraînement synchrone`], [`Three wheels driven and steered together by belts; the ICC is at infinity.`, `Trois roues entraînées et orientées ensemble par des courroies ; le CIR est à l'infini.`]],
    [[`Degree of mobility δm`, `Degré de mobilité δm`], [`3 − rank of the sliding constraints: velocities available immediately.`, `3 − rang des contraintes de glissement : vitesses disponibles immédiatement.`]],
    [[`Degree of steerability δs`, `Degré d'orientabilité δs`], [`Number of independent steering motions that change the constraints over time.`, `Nombre de mouvements d'orientation indépendants qui changent les contraintes au cours du temps.`]],
    [[`Degree of maneuverability δM`, `Degré de manœuvrabilité δM`], [`δm + δs: total degrees of freedom the robot can control.`, `δm + δs : degrés de liberté totaux que le robot peut commander.`]],
    [[`DOF / DDOF`, `DDL / DDDL`], [`Poses the robot can reach / velocities it can produce independently at one instant.`, `Poses que le robot peut atteindre / vitesses qu'il peut produire indépendamment à un instant.`]],
    [[`Holonomic / nonholonomic`, `Holonome / non holonome`], [`A holonomic robot has DDOF = DOF; a nonholonomic one has velocity constraints that cannot be integrated.`, `Un robot holonome a DDDL = DDL ; un robot non holonome a des contraintes de vitesse non intégrables.`]],
    [[`Path / trajectory`, `Chemin / trajectoire`], [`A curve in (x, y, θ) / the same curve with time.`, `Une courbe dans (x, y, θ) / la même courbe avec le temps.`]],
    [[`Odometry`, `Odométrie`], [`Computing the pose by integrating the wheel motions; it drifts.`, `Calculer la pose en intégrant les mouvements des roues ; elle dérive.`]],
    [[`Polar control law`, `Loi de commande polaire`], [`v = kρ·ρ, ω = kα·α + kβ·β, stable if kρ > 0, kβ < 0, kα − kρ > 0.`, `v = kρ·ρ, ω = kα·α + kβ·β, stable si kρ > 0, kβ < 0, kα − kρ > 0.`]]
  ]);
}
