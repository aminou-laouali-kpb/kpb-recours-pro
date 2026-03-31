

# Plan : Améliorations ciblées

## 1. Désactiver la confirmation d'email

Utiliser l'outil `configure_auth` pour activer l'auto-confirm des emails. Les utilisateurs seront connectés immédiatement après inscription sans devoir cliquer sur un lien.

Conséquence sur `Inscription.tsx` : après `signInWithOtp` réussi, rediriger directement vers `/dashboard` au lieu d'afficher "Vérifie ta boîte mail". Idem pour `Connexion.tsx`.

## 2. Message de réassurance sur les champs email/WhatsApp

**Fichiers** : `src/pages/Inscription.tsx`, `src/pages/Connexion.tsx`

Ajouter sous les champs email et WhatsApp un texte d'aide visible :
> « Assure-toi que ton email et ton numéro WhatsApp soient corrects. Tu recevras ta lettre de recours gratuite par ces moyens. »

Stylé en `text-xs text-amber-600` avec une icône info pour attirer l'attention sans être intrusif.

## 3. Configurer les webhooks n8n avec les vraies URLs

**Secret à ajouter** : `N8N_WEBHOOK_URL` avec la valeur `https://n8n.kpbeducation.cloud/webhook/a13f20d3-64d8-4f59-950e-39bee66c3edf`

**Fichier** : `supabase/functions/generate-letter/index.ts`

Modifier la section webhook pour envoyer vers les **deux URLs** (production + test) :
- `https://n8n.kpbeducation.cloud/webhook/a13f20d3-64d8-4f59-950e-39bee66c3edf` (production)
- `https://n8n.kpbeducation.cloud/webhook-test/a13f20d3-64d8-4f59-950e-39bee66c3edf` (test)

Les deux appels seront fire-and-forget pour ne pas bloquer la réponse.

**Fichier** : `supabase/functions/n8n-webhook/index.ts`

Même modification : utiliser les deux URLs.

## 4. Améliorer la page de résultat post-génération

**Fichier** : `src/pages/recours/NouveauRecours.tsx` (step 4)

Restructurer la page résultat avec un copywriting de conversion fort :

1. **Succès émotionnel** — "Ta lettre est prête ! Tu viens de faire un pas courageux."
2. **La lettre** + boutons Copier/Télécharger
3. **Disclaimers** (courts)
4. **Bloc de conversion renforcé** — Refonte complète de l'UpsellBlock avec :
   - Titre accrocheur : "Tu as un plan A. Et si tu préparais aussi un plan B ?"
   - Sous-titre : "Chaque année, des centaines d'étudiants obtiennent leur visa grâce aux écoles privées en France."
   - 3 points de valeur : ✅ Admissions ouvertes jusqu'en juillet · ✅ Accompagnement personnalisé · ✅ Visa étudiant garanti si admis
   - CTA WhatsApp très visible (vert, pleine largeur)

**Fichier** : `src/components/UpsellBlock.tsx`

Refonte complète du composant avec le nouveau copywriting orienté conversion "Plan B école privée".

## 5. Fichiers impactés

| Fichier | Changement |
|---------|-----------|
| `src/pages/Inscription.tsx` | Auto-login après signup, message réassurance email/WhatsApp |
| `src/pages/Connexion.tsx` | Auto-login, message réassurance |
| `src/pages/recours/NouveauRecours.tsx` | Page résultat améliorée, copywriting conversion |
| `src/components/UpsellBlock.tsx` | Refonte copywriting "Plan B" |
| `supabase/functions/generate-letter/index.ts` | Deux URLs webhook n8n |
| `supabase/functions/n8n-webhook/index.ts` | Deux URLs webhook n8n |
| Auth config | Auto-confirm email activé |
| Secret | `N8N_WEBHOOK_URL` configuré |

