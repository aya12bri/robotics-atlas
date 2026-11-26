// Course — Python for robotics (beginner): from a first program to NumPy, plots, classes and a first controller.
import { tx, P, BOX, TABLE, UL } from '../lib.mjs';
import { loadEx } from './py-ex.mjs';
import { partA } from './py-a.mjs';
import { partB } from './py-b.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  loadEx();
  const head = {
    title: tx('Python for robotics', 'Python pour la robotique'),
    lead: tx('The programming every other course needs, from zero: variables, angles and the math module, loops, functions, lists, NumPy, plots and data files, classes — and, at the end, the loop of a first controller. Every example is about a robot and every program was run: what you see under it is its real output.',
      'La programmation dont tous les autres cours ont besoin, depuis zéro : variables, angles et module math, boucles, fonctions, listes, NumPy, graphiques et fichiers de données, classes — et, à la fin, la boucle d\'un premier correcteur. Chaque exemple parle d\'un robot et chaque programme a été exécuté : ce que vous voyez dessous est sa vraie sortie.'),
    intro: BOX('idea', ['How to use this course', 'Comment suivre ce cours'],
      P('No prerequisite: you only need a computer. Type each program yourself rather than copying it, run it, check that you get the same output, then change one value and predict the new result before running it again. Each lesson ends with exercises whose solutions give the rule used and where it is in the lesson.',
        'Aucun prérequis : il suffit d\'un ordinateur. Tapez chaque programme vous-même plutôt que de le copier, lancez-le, vérifiez que vous obtenez la même sortie, puis changez une valeur et prévoyez le nouveau résultat avant de le relancer. Chaque leçon se termine par des exercices dont les solutions donnent la règle utilisée et son emplacement dans la leçon.'),
      UL([
        ['Lessons 1 to 4: the language (types, maths, loops, functions).', 'Leçons 1 à 4 : le langage (types, maths, boucles, fonctions).'],
        ['Lessons 5 to 8: the tools of robotics (lists, NumPy, plots, classes and a controller).', 'Leçons 5 à 8 : les outils de la robotique (listes, NumPy, graphiques, classes et un correcteur).'],
        ['Next: the course “Code a robot arm in Python” and ROS 2 from zero.', 'Ensuite : le cours « Coder un bras robot en Python » et ROS 2 depuis zéro.']
      ])),
    glossTitle: tx('Glossary', 'Glossaire'),
    glossIntro: tx('All the words of the course in one place.', 'Tous les mots du cours au même endroit.'),
    gloss: TABLE([['Term', 'Terme'], ['Meaning', 'Sens']], [
      [['Variable', 'Variable'], ['A name that holds a value: L1 = 0.5.', 'Un nom qui contient une valeur : L1 = 0.5.']],
      [['Type', 'Type'], ['The kind of a value: int, float, str, bool, list, dict…', 'La nature d\'une valeur : int, float, str, bool, list, dict…']],
      [['Module, import', 'Module, import'], ['A file of ready-made functions loaded with import (math, numpy).', 'Un fichier de fonctions toutes prêtes chargé avec import (math, numpy).']],
      [['Radian', 'Radian'], ['The unit of angles used by math.cos and np.cos: 180° = π rad.', 'L\'unité d\'angle utilisée par math.cos et np.cos : 180° = π rad.']],
      [['Indentation', 'Indentation'], ['The spaces at the start of a line that say which block it belongs to.', 'Les espaces en début de ligne qui disent à quel bloc elle appartient.']],
      [['Loop (for, while)', 'Boucle (for, while)'], ['Lines repeated for each element, or as long as a condition is true.', 'Des lignes répétées pour chaque élément, ou tant qu\'une condition est vraie.']],
      [['Function, return', 'Fonction, return'], ['A named calculation: def fk(…): … return x, y.', 'Un calcul nommé : def fk(…): … return x, y.']],
      [['List, index', 'Liste, indice'], ['An ordered sequence numbered from 0; [-1] is the last element.', 'Une suite ordonnée numérotée à partir de 0 ; [-1] est le dernier élément.']],
      [['Dictionary', 'Dictionnaire'], ['Values found by a name (a key): robot["L1"].', 'Des valeurs retrouvées par un nom (une clé) : robot["L1"].']],
      [['NumPy array', 'Tableau NumPy'], ['A vector or matrix; operations apply to every element at once.', 'Un vecteur ou une matrice ; les opérations s\'appliquent à tous les éléments d\'un coup.']],
      [['Matrix product @', 'Produit matriciel @'], ['The product of the maths course (R @ a); * is element by element.', 'Le produit du cours de maths (R @ a) ; * est élément par élément.']],
      [['Class, object, method', 'Classe, objet, méthode'], ['A mould (class) that makes objects holding their data and their functions (methods).', 'Un moule (classe) qui fabrique des objets portant leurs données et leurs fonctions (méthodes).']],
      [['Proportional controller', 'Correcteur proportionnel'], ['A command proportional to the error: ω = Kp (target − q).', 'Une commande proportionnelle à l\'erreur : ω = Kp (consigne − q).']]
    ]),
    finish: {
      h: tx('You can now program a robot in Python!', 'Vous savez maintenant programmer un robot en Python !'),
      p: tx('Next: the electronics and Arduino course to make a real motor turn, “Code a robot arm in Python” for a full DH engine and inverse kinematics, and ROS 2 from zero to run your code on a real robot.', 'Ensuite : le cours d\'électronique et Arduino pour faire tourner un vrai moteur, « Coder un bras robot en Python » pour un moteur DH complet et le modèle inverse, et ROS 2 depuis zéro pour faire tourner votre code sur un vrai robot.'),
      next: ['index.html#road', tx('Back to the roadmap →', 'Retour au parcours →')],
      back: tx('Home page', 'Page d\'accueil')
    }
  };
  return { head, lessons: [...partA(), ...partB()] };
}
