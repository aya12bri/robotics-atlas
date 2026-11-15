// Course — The maths of robotics, one tool per lesson (trigonometry, vectors, matrices, rotations, transformations, DH, DHM)
import { tx, P, BOX, TABLE } from '../lib.mjs';
import { partA } from './mk-a.mjs';
import { partB } from './mk-b.mjs';
import { partC } from './mk-c.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  const head = {
    title: tx('The maths of robotics, one tool per lesson', 'Les maths de la robotique, un outil par leçon'),
    lead: tx('Every maths tool a robot needs, each in its own short lesson, from zero: angles and trigonometry, vectors, matrices, rotations, frames and transformations, then the Denavit–Hartenberg method explained twice: the standard DH alone, the modified DH (DHM) alone, and the two side by side. Each lesson has worked examples, exercises and a quiz.',
      'Tous les outils de maths dont un robot a besoin, chacun dans sa propre leçon courte, depuis zéro : angles et trigonométrie, vecteurs, matrices, rotations, repères et transformations, puis la méthode de Denavit–Hartenberg expliquée deux fois : le DH standard seul, le DH modifié (DHM) seul, et les deux côte à côte. Chaque leçon a des exemples résolus, des exercices et un quiz.'),
    intro: BOX('idea', ['The path of this course', 'Le chemin de ce cours'],
      P('Each lesson uses the one before. <strong>Trigonometry</strong> finds the end of one arm. <strong>Vectors</strong> add the arms. <strong>Matrices</strong> transform vectors. <strong>Rotation matrices</strong> turn them. <strong>Homogeneous matrices</strong> turn and move at once, and can be chained from the base to the tool. <strong>DH and DHM</strong> are two rules to write this chain as a small table.',
        'Chaque leçon utilise la précédente. La <strong>trigonométrie</strong> trouve le bout d\'un bras. Les <strong>vecteurs</strong> additionnent les bras. Les <strong>matrices</strong> transforment les vecteurs. Les <strong>matrices de rotation</strong> les font tourner. Les <strong>matrices homogènes</strong> tournent et déplacent à la fois, et s\'enchaînent de la base à l\'outil. <strong>DH et DHM</strong> sont deux règles pour écrire cette chaîne sous forme d\'un petit tableau.'),
      P('You only need the four operations and a calculator. If a lesson is already known to you, do its quiz and move on.',
        'Il vous faut seulement les quatre opérations et une calculatrice. Si vous connaissez déjà une leçon, faites son quiz et passez à la suivante.')),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Radian', 'Radian'], ['Unit of angle: a full turn is 2π radians.', 'Unité d\'angle : un tour complet fait 2π radians.']],
      [['atan2(y, x)', 'atan2(y, x)'], ['The angle of the point (x, y), right in all four quadrants.', 'L\'angle du point (x, y), juste dans les quatre quadrants.']],
      [['Vector', 'Vecteur'], ['An arrow: a direction and a length, written as a column of numbers.', 'Une flèche : une direction et une longueur, écrite comme une colonne de nombres.']],
      [['Dot product', 'Produit scalaire'], ['A number that says how much two vectors point the same way; zero if perpendicular.', 'Un nombre qui dit à quel point deux vecteurs vont dans le même sens ; nul s\'ils sont perpendiculaires.']],
      [['Cross product', 'Produit vectoriel'], ['A vector perpendicular to two others (right-hand rule).', 'Un vecteur perpendiculaire à deux autres (règle de la main droite).']],
      [['Matrix', 'Matrice'], ['A table of numbers that transforms a vector.', 'Un tableau de nombres qui transforme un vecteur.']],
      [['Determinant', 'Déterminant'], ['One number of a square matrix; zero means it cannot be inverted.', 'Un nombre d\'une matrice carrée ; nul veut dire qu\'on ne peut pas l\'inverser.']],
      [['Rotation matrix', 'Matrice de rotation'], ['A matrix that turns vectors; its columns are the axes of the turned frame; its inverse is its transpose.', 'Une matrice qui fait tourner les vecteurs ; ses colonnes sont les axes du repère tourné ; son inverse est sa transposée.']],
      [['Frame', 'Repère'], ['An origin and axes from which positions are measured.', 'Une origine et des axes d\'où l\'on mesure les positions.']],
      [['Homogeneous matrix', 'Matrice homogène'], ['A 4×4 matrix that holds a rotation and a translation.', 'Une matrice 4×4 qui contient une rotation et une translation.']],
      [['Common perpendicular', 'Perpendiculaire commune'], ['The shortest segment between two joint axes; it carries the x axis of a DH frame.', 'Le plus court segment entre deux axes de liaisons ; il porte l\'axe x d\'un repère DH.']],
      [['Standard DH', 'DH standard'], ['Frame i at the far end of link i; row: θ, d, a, α.', 'Repère i à l\'extrémité du segment i ; ligne : θ, d, a, α.']],
      [['Modified DH (DHM)', 'DH modifié (DHM)'], ['Frame j on the axis of joint j; row: α, a, θ, d.', 'Repère j sur l\'axe de la liaison j ; ligne : α, a, θ, d.']],
      [['Twist α', 'Torsion α'], ['The angle between two consecutive joint axes.', 'L\'angle entre deux axes de liaisons consécutifs.']]
    ]),
    finish: {
      h: tx('You have the whole toolbox!', 'Vous avez toute la boîte à outils !'),
      p: tx('Now use it: the next course builds a 2-axis arm step by step, with its direct and inverse models and its motion laws.', 'Utilisez-la maintenant : le cours suivant construit un bras à 2 axes pas à pas, avec ses modèles direct et inverse et ses lois de mouvement.'),
      next: ['learn-maths.html', tx('Go to “Maths and motion” →', 'Aller à « Maths et mouvement » →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB(), ...partC()] };
}
