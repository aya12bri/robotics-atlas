# Statistiques, avis des leçons et tuteur IA — guide d'installation

Ce dossier contient le petit service (*Worker*) du site, qui répond aux adresses `/api/...`. **Il est publié automatiquement avec le site** :
`wrangler.jsonc` à la racine du dépôt l'indique à Cloudflare, et chaque fusion sur GitHub le met à jour. Aucun terminal n'est nécessaire.

Le site envoie deux sortes d'informations, toutes **anonymes** (pas de cookie, pas d'adresse IP enregistrée) :

1. **Les statistiques de visite** (pages vues, pays, appareils) avec **Cloudflare Web Analytics**.
2. **Les avis « Cette leçon était-elle claire ? 👍 👎 »** à la fin de chaque leçon, avec un commentaire facultatif.

Tant que rien n'est installé, le site marche normalement : le bloc d'avis remercie le visiteur et l'envoi échoue sans bruit.

## 1. Statistiques (5 minutes)

**Méthode la plus simple (sans code)** : dans le tableau de bord Cloudflare, ouvrez *Analytics & Logs → Web Analytics*,
ajoutez le site `roboticsatlas.ayabriksine.com` et choisissez l'**installation automatique** (le domaine passe déjà par Cloudflare).

**Méthode avec jeton** (si l'installation automatique n'est pas proposée) : copiez le jeton (token) affiché par Cloudflare,
puis collez-le dans `nav.js`, dans la constante `CF_ANALYTICS_TOKEN` (en haut du fichier), et republiez le site.

## 2. Tuteur IA (10 minutes, dans le navigateur)

À la fin de chaque leçon, un bloc « Une question sur cette leçon ? » ouvre une discussion avec un tuteur IA (Claude).
Le Worker reçoit les questions sur `/api/tutor`, lit lui-même la leçon sur le site (un visiteur ne peut donc pas lui envoyer
un autre texte), demande à Claude d'expliquer comme un professeur et renvoie la réponse mot par mot.
Tant que la clé n'est pas installée, le bloc affiche « Le tuteur n'est pas disponible pour le moment » et rien ne casse.

**Étape 1 : la clé d'API** (sur `platform.claude.com`, avec le compte de votre choix)

1. *Settings → Billing* : achetez des crédits (par exemple 5 ou 10 $) et **laissez la recharge automatique désactivée** :
   vous ne pourrez jamais dépenser plus que ce que vous avez mis.
2. *Settings → Limits* : fixez une limite de dépense mensuelle (par exemple 10 $).
3. *Settings → API Keys* : créez une clé (elle commence par `sk-ant-`) et copiez-la. Ne la mettez **jamais** dans le code ni sur GitHub.

**Étape 2 : coller la clé dans Cloudflare**

1. Ouvrez `dash.cloudflare.com` et connectez-vous.
2. Menu de gauche : *Workers & Pages* (ou *Compute*), puis cliquez sur le projet **robotics-atlas**.
3. Onglet *Settings*, rubrique *Variables and Secrets*, bouton *Add*.
4. *Type* : **Secret** · *Variable name* : `ANTHROPIC_API_KEY` · *Value* : collez la clé.
5. Cliquez sur *Deploy* (ou *Save and deploy*).

La clé reste secrète chez Cloudflare et n'est pas effacée par les publications suivantes.
Ouvrez ensuite une leçon, cliquez sur « Demander au tuteur » et posez une question.

**Les réglages**

| Réglage | Où | Valeur actuelle |
|---|---|---|
| Modèle | `MODEL` en haut de `tutor.js` | `claude-haiku-5-5` (le moins cher, environ 0,001 $ par question) |
| Questions par visiteur | `ratelimits` dans `wrangler.jsonc` (racine) | 5 par minute |
| Dépense totale | les crédits prépayés de la plateforme d'API | ce que vous avez acheté, sans recharge automatique |

Si les explications ne sont pas assez bonnes, remplacez le modèle par `claude-sonnet-5-5` (environ 20 fois plus cher)
ou `claude-opus-5-5` (environ 40 fois plus cher) : la fusion suivante sur GitHub le publie.

**Ce qui est envoyé et gardé**

- Le navigateur envoie : la page, la leçon, la langue, la question et les 6 derniers messages de la conversation.
- Le Worker envoie à Anthropic : les consignes du tuteur, le texte de la leçon et la conversation. **Aucune** adresse IP.
- Rien n'est enregistré sur le serveur. La conversation reste dans l'onglet du visiteur (elle disparaît quand il le ferme).

**Suivre la consommation** : la console de la plateforme d'API montre les dépenses jour par jour (*Usage* et *Cost*).
Les erreurs du tuteur apparaissent dans Cloudflare : projet **robotics-atlas** → *Observability* (ou *Logs*).

## 3. Avis des leçons (facultatif)

Sans stockage, les votes « Cette leçon était-elle claire ? » sont acceptés puis oubliés. Pour les garder :

1. Cloudflare : *Storage & Databases → KV* → *Create* ; nommez-le `robotics-atlas-feedback`.
2. Projet **robotics-atlas** → *Settings → Bindings* → *Add* → *KV namespace* : nom de la variable `FEEDBACK`, choisissez le stockage créé.
3. Dans *Variables and Secrets*, ajoutez un secret `SUMMARY_TOKEN` (un long mot de passe de votre choix).

Pour que ce réglage ne soit pas effacé par la publication suivante, donnez-moi l'« ID » du stockage KV
(ce n'est pas un secret) : je l'ajoute à `wrangler.jsonc`.

**Lire les avis** (les leçons les moins claires d'abord, puis les commentaires) : ouvrez
`https://roboticsatlas.ayabriksine.com/api/feedback/summary` avec l'en-tête `Authorization: Bearer VOTRE_MOT_DE_PASSE`
(ou demandez-moi de le faire).

Avec le stockage KV, le tuteur limite aussi les questions à 30 par visiteur et 1 500 par jour pour tout le site
(`TUTOR_PER_DAY` et `TUTOR_DAILY_CAP`, facultatifs).
