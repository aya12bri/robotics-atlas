// about.js — the "About" page: what the site is, how it is made, sources, privacy, how to report an error.
(function () {
  function start() {
    var RA = window.RA || {}, FR = RA.lang === 'fr';
    var L = function (en, fr) { return FR ? fr : en; };
    var C = window.RA_COURSES || [], main = document.getElementById('about');
    var lessons = C.reduce(function (a, c) { return a + c.total; }, 0);
    var li = function (a) { return '<li>' + a + '</li>'; };
    var social = (window.RA_SOCIAL || []).map(function (s) { return '<a class="btn sm ghost" href="' + s[1] + '" target="_blank" rel="noopener">' + s[0] + '</a>'; }).join(' ');
    document.title = L('About Robotics Atlas', 'À propos de Robotics Atlas');
    main.innerHTML = '<h1>' + L('About Robotics Atlas', 'À propos de Robotics Atlas') + '</h1>' +
      '<p class="lead">' + L('A free site to learn robotics, from your first robot to Master level, in English and in French.', 'Un site gratuit pour apprendre la robotique, de votre premier robot jusqu\'au niveau Master, en français et en anglais.') + '</p>' +
      '<div class="about-grid">' +
      '<section><h2>' + L('What you find here', 'Ce que vous trouvez ici') + '</h2><ul>' +
        li(L(C.length + ' courses, ' + lessons + ' lessons, each with worked examples, graded exercises and an end-of-lesson quiz', C.length + ' cours, ' + lessons + ' leçons, chacune avec des exemples résolus, des exercices gradués et un quiz de fin de leçon')) +
        li(L('Robots in 3D that you move with sliders, with their kinematic diagram and DH tables', 'Des robots en 3D que vous bougez avec des curseurs, avec leur schéma cinématique et leurs tableaux DH')) +
        li(L('Final exams, certificates, revision sheets and spaced-repetition reviews', 'Des examens finaux, des certificats, des fiches de révision et des révisions espacées')) +
        li(L('A programming sandbox, a sensor test bench and guided hardware projects', 'Un bac à sable de programmation, un banc d\'essai des capteurs et des projets matériels guidés')) + '</ul></section>' +
      '<section><h2>' + L('How the content is made', 'Comment le contenu est fait') + '</h2><ul>' +
        li(L('The courses are written from university lecture notes and the reference books of the field (listed in <a href="learn-world.html#l9">Robots in the real world, lesson 9</a>), explained again step by step.', 'Les cours sont écrits à partir de notes de cours universitaires et des livres de référence du domaine (listés dans <a href="learn-world.html#l9">Le monde réel, leçon 9</a>), réexpliqués pas à pas.')) +
        li(L('The numbers of the worked examples are recomputed, and the Python programs of the courses are run and their output is shown as it was printed.', 'Les nombres des exemples résolus sont recalculés, et les programmes Python des cours sont exécutés et leur sortie est montrée telle qu\'elle a été affichée.')) +
        li(L('The site is built with the help of an AI assistant, and checked page by page; mistakes can remain: tell us when you find one.', 'Le site est construit avec l\'aide d\'un assistant IA, et vérifié page par page ; des erreurs peuvent rester : dites-le-nous quand vous en trouvez une.')) + '</ul></section>' +
      '<section><h2>' + L('Report an error or suggest an idea', 'Signaler une erreur ou proposer une idée') + '</h2><ul>' +
        li(L('At the end of every lesson, answer "Was this lesson clear?": a "Not really" opens a box where you can say what is wrong. It is anonymous.', 'À la fin de chaque leçon, répondez à « Cette leçon était-elle claire ? » : un « Pas vraiment » ouvre une case où vous pouvez dire ce qui ne va pas. C\'est anonyme.')) +
        li(L('Or write to the author on LinkedIn. Give the page, the lesson and what you expected.', 'Ou écrivez à l\'auteure sur LinkedIn. Indiquez la page, la leçon et ce que vous attendiez.')) + '</ul><p>' + social + '</p></section>' +
      '<section><h2>' + L('Privacy', 'Vie privée') + '</h2><ul>' +
        li(L('No account, no cookie for tracking, no advertising.', 'Pas de compte, pas de cookie de suivi, pas de publicité.')) +
        li(L('Your progress, quiz answers, exam scores and name for the certificates stay in your browser. You can <a href="index.html#rmBackup">save them to a file</a> and delete them at any time (Reset on the roadmap).', 'Votre progression, vos réponses aux quiz, vos notes d\'examen et votre nom pour les certificats restent dans votre navigateur. Vous pouvez <a href="index.html#rmBackup">les sauvegarder dans un fichier</a> et les effacer à tout moment (Réinitialiser sur le parcours).')) +
        li(L('Visit statistics, if enabled, are anonymous and without cookies (Cloudflare Web Analytics). Lesson feedback sends only the page, the lesson, the vote, the language and your comment.', 'Les statistiques de visite, si elles sont activées, sont anonymes et sans cookies (Cloudflare Web Analytics). L\'avis sur une leçon n\'envoie que la page, la leçon, le vote, la langue et votre commentaire.')) + '</ul></section>' +
      '<section><h2>' + L('Credits', 'Crédits') + '</h2><ul>' +
        li(L('Designed and built by <a href="https://ayabriksine.com" target="_blank" rel="noopener">Aya Briksine</a>.', 'Conçu et réalisé par <a href="https://ayabriksine.com" target="_blank" rel="noopener">Aya Briksine</a>.')) +
        li(L('3D with <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>; fonts Archivo and IBM Plex; hosted on Cloudflare.', '3D avec <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> ; polices Archivo et IBM Plex ; hébergé sur Cloudflare.')) + '</ul></section>' +
      '</div>';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
