# Statistiques et avis des leçons — guide d'installation

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
