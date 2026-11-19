# Statistiques, avis des leçons et tuteur IA — guide d'installation

Le site envoie deux sortes d'informations, toutes **anonymes** (pas de cookie, pas d'adresse IP enregistrée) :

1. **Les statistiques de visite** (pages vues, pays, appareils) avec **Cloudflare Web Analytics**.
2. **Les avis « Cette leçon était-elle claire ? 👍 👎 »** à la fin de chaque leçon, avec un commentaire facultatif.

Tant que rien n'est installé, le site marche normalement : le bloc d'avis remercie le visiteur et l'envoi échoue sans bruit.

## 1. Statistiques (5 minutes)

**Méthode la plus simple (sans code)** : dans le tableau de bord Cloudflare, ouvrez *Analytics & Logs → Web Analytics*,
ajoutez le site `roboticsatlas.ayabriksine.com` et choisissez l'**installation automatique** (le domaine passe déjà par Cloudflare).

**Méthode avec jeton** (si l'installation automatique n'est pas proposée) : copiez le jeton (token) affiché par Cloudflare,
puis collez-le dans `nav.js`, dans la constante `CF_ANALYTICS_TOKEN` (en haut du fichier), et republiez le site.

## 2. Avis des leçons (15 minutes)

Il faut un petit *Worker* Cloudflare séparé, qui reçoit les votes sur l'adresse `/api/feedback` et les range dans un stockage *KV*.
Le site lui-même n'est pas modifié.

```bash
cd tools/feedback-worker
npm install                                         # une seule fois : installe le SDK d'Anthropic et wrangler
npx wrangler login                                  # une seule fois
npx wrangler kv namespace create FEEDBACK           # affiche un "id" : copiez-le dans wrangler.jsonc
npx wrangler secret put SUMMARY_TOKEN               # choisissez un mot de passe long : il protège la lecture des avis
npx wrangler deploy
```

Vérifiez dans `wrangler.jsonc` que la route correspond à votre domaine (`roboticsatlas.ayabriksine.com/api/*`).

**Lire les avis** (les leçons les moins claires d'abord, puis les commentaires) :

```bash
curl -H "Authorization: Bearer VOTRE_MOT_DE_PASSE" https://roboticsatlas.ayabriksine.com/api/feedback/summary
```

## Ce qui est envoyé

```json
{ "page": "learn-control", "lesson": "l4", "vote": -1, "lang": "fr", "comment": "La partie sur le terme D n'est pas claire" }
```

Le Worker refuse tout autre format. Chaque vote est gardé un an, et un compteur par leçon garde le total.
Le stockage KV gratuit de Cloudflare suffit largement (100 000 lectures et 1 000 écritures par jour).

## 3. Tuteur IA (20 minutes)

À la fin de chaque leçon, un bloc « Une question sur cette leçon ? » ouvre une petite discussion avec un tuteur IA (Claude).
Le même Worker reçoit les questions sur `/api/tutor`. Il lit lui-même la leçon sur le site (un visiteur ne peut donc pas lui
envoyer un autre texte), demande à Claude d'expliquer comme un professeur, et renvoie la réponse mot par mot.
Tant que la clé n'est pas installée, le bloc affiche « Le tuteur n'est pas disponible pour le moment » et rien ne casse.

**Étape 1 : la clé d'API** (sur la plateforme d'API d'Anthropic, `platform.claude.com`)

1. Créez un compte, puis achetez des crédits (par exemple 5 ou 10 $). **Laissez la recharge automatique désactivée** :
   vous ne pourrez jamais dépenser plus que ce que vous avez mis.
2. Dans *Limits*, fixez une limite de dépense mensuelle (par exemple 10 $).
3. Dans *API Keys*, créez une clé (elle commence par `sk-ant-`). Ne la mettez **jamais** dans le code ni sur GitHub.

**Étape 2 : donner la clé au Worker et déployer**

```bash
cd tools/feedback-worker
npx wrangler secret put ANTHROPIC_API_KEY           # collez la clé quand elle est demandée (elle reste secrète chez Cloudflare)
npx wrangler deploy
```

Ouvrez ensuite une leçon, cliquez sur « Demander au tuteur » et posez une question : la réponse doit s'écrire en quelques secondes.

**Les réglages**

| Réglage | Où | Valeur actuelle |
|---|---|---|
| Modèle | `MODEL` en haut de `tutor.js` | `claude-haiku-5-5` (le moins cher, environ 0,001 $ par question) |
| Questions par visiteur et par jour | `TUTOR_PER_DAY` dans `wrangler.jsonc` | 30 |
| Questions par jour pour tout le site | `TUTOR_DAILY_CAP` dans `wrangler.jsonc` | 1 500 (au plus environ 1,5 $ par jour avec Haiku) |

Si les explications ne sont pas assez bonnes, remplacez le modèle par `claude-sonnet-5-5` (environ 20 fois plus cher)
ou `claude-opus-5-5` (environ 40 fois plus cher), puis redéployez avec `npx wrangler deploy`.

**Ce qui est envoyé et gardé**

- Le navigateur envoie : la page, la leçon, la langue, la question et les 6 derniers messages de la conversation.
- Le Worker envoie à Anthropic : les consignes du tuteur, le texte de la leçon et la conversation. **Aucune** adresse IP.
- Le Worker garde seulement deux compteurs par jour : un par visiteur (une empreinte de son adresse IP mélangée à la date,
  jamais l'adresse elle-même, effacée après 2 jours) et un pour tout le site.
- La conversation reste dans l'onglet du visiteur (elle disparaît quand il le ferme).

**Suivre la consommation** : la console de la plateforme d'API montre les dépenses jour par jour (*Usage* et *Cost*).
Les erreurs du tuteur apparaissent dans les journaux du Worker : `npx wrangler tail`.
