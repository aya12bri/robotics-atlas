// Course 8, part 2 — Wheeled mobile robots at the professional level (lessons 11 to 20).
// The lessons keep their numbers (11–20) and their progress keys (wmr-11 … wmr-20); see mobile.mjs for part 1.
import { tx, P, BOX } from '../lib.mjs';
import { lessonsPart2, partsTable, glossary } from './mobile.mjs';

export const meta = { script: 'learn-mobile-widgets.js' };
export function build() {
  const head = {
    title: tx(`Wheeled mobile robots, part 2: professional level`, `Robots mobiles à roues, partie 2 : niveau professionnel`),
    lead: tx(`Part 2 of the course, lessons 11 to 20: motion control to a goal pose, path following, planning for nonholonomic robots, then the professional work: odometry and calibration, Kalman filtering, dynamics and motor/battery sizing, software and ROS 2, safety and testing, a capstone project, and a final certification with a written exam, practical challenges and labs.`,
      `Partie 2 du cours, leçons 11 à 20 : la commande vers une pose, le suivi de chemin, la planification pour les robots non holonomes, puis le travail professionnel : odométrie et étalonnage, filtre de Kalman, dynamique et dimensionnement des moteurs et de la batterie, logiciel et ROS 2, sécurité et essais, un projet de synthèse et une certification finale avec un examen écrit, des défis pratiques et des TP.`),
    intro: BOX(`idea`, [`Before you start`, `Avant de commencer`],
      P(`This page is part 2. It uses the kinematics of part 1 everywhere: the pose (x, y, θ), the rolling and sliding constraints, the differential and car models, and the ICR. If these are not clear, do <a href="learn-mobile.html">part 1 (lessons 1 to 10)</a> first, or at least its exercises.`,
        `Cette page est la partie 2. Elle utilise partout la cinématique de la partie 1 : la pose (x, y, θ), les contraintes de roulement et de glissement, les modèles différentiel et voiture, et le CIR. Si ce n'est pas clair, faites d'abord <a href="learn-mobile.html">la partie 1 (leçons 1 à 10)</a>, ou au moins ses exercices.`),
      partsTable()),
    glossTitle: tx(`Glossary`, `Glossaire`),
    glossIntro: tx(`All the words of the course in one place.`, `Tous les mots du cours au même endroit.`),
    gloss: glossary(),
    finish: {
      h: tx(`From zero to professional: you can model, size, control and test a wheeled robot!`, `De zéro au niveau professionnel : vous savez modéliser, dimensionner, commander et tester un robot à roues !`),
      p: tx(`Pass the final exam, the challenges and the labs of lesson 20 to complete the course. Then go further with the dynamics and control of arms, perception and AI, and the real world.`, `Réussissez l'examen final, les défis et les TP de la leçon 20 pour terminer le cours. Puis allez plus loin avec la dynamique et la commande des bras, la perception et l'IA, et le monde réel.`),
      next: [`learn-control.html`, tx(`Go to dynamics and control →`, `Aller à la dynamique et la commande →`)],
      back: tx(`Back to the roadmap`, `Retour au parcours`)
    }
  };
  return { head, lessons: lessonsPart2() };
}
