

# Plan : Raffinement UX, copywriting et conversion

## 1. Landing page — Empathie + conversion

**Fichier** : `src/pages/Index.tsx`

- Ajouter un bloc émotionnel d'empathie avant le hero : "On sait que recevoir un refus est difficile. Tu mérites une deuxième chance."
- Renforcer le subheadline pour être plus direct et rassurant
- Ajouter une section "Comment ça marche" en 3 étapes numérotées (Inscris-toi → Remplis ton dossier → Reçois ta lettre)
- Rendre le WhatsApp CTA plus proéminent dans la section basse (fond vert, texte plus gros)
- Ajouter un compteur social proof type "Des centaines d'étudiants utilisent déjà cet outil"

## 2. WhatsApp CTA — Visibilité maximale

**Fichier** : `src/components/WhatsAppCTA.tsx`

- Ajouter une variante `prominent` avec animation pulse subtile, icône plus grande
- Ajouter un texte secondaire sous le bouton : "Réponse rapide garantie"

**Fichier** : `src/components/UpsellBlock.tsx`

- Rendre le bloc visuellement plus fort : bordure verte, fond plus contrasté
- Ajouter une icône France/drapeau
- Reformuler le copy pour plus d'urgence : "La rentrée de septembre 2026 approche..."

## 3. Dashboard — Clarté et guidance

**Fichier** : `src/pages/Dashboard.tsx`

- Ajouter un message d'encouragement contextuel ("Tu as déjà généré X recours" ou "C'est le moment de commencer")
- Rendre le bouton "Générer un recours" encore plus visible avec un sous-texte "100% gratuit, en 3 minutes"
- Ajouter le WhatsApp CTA directement sur le dashboard (pas seulement dans l'UpsellBlock)
- Ajouter un bloc de réassurance émotionnelle pour les nouveaux utilisateurs : "Un refus ne veut pas dire la fin de ton projet"

## 4. Formulaire NouveauRecours — Exemples et réassurance

**Fichier** : `src/pages/recours/NouveauRecours.tsx`

- Ajouter des exemples concrets sous CHAQUE champ (reprendre les exemples du plan précédent pour les champs qui n'en ont pas encore)
- Ajouter un message de réassurance en haut du formulaire : "Pas de stress, on te guide étape par étape"
- Sur l'étape 3, ajouter un indicateur "Gratuit — aucun paiement requis" pour rassurer
- Sur le résultat (step 4) : renforcer le bloc post-génération avec UpsellBlock plus visible, WhatsApp CTA agrandi, et message émotionnel "Bravo, tu as fait un pas important"

## 5. Copywriting — Nettoyage et ton empathique

Tous fichiers UI :
- Remplacer "dashboard" par "tableau de bord" dans les textes visibles utilisateur (bouton retour, etc.)
- Vérifier qu'aucun mot "premium", "activation", "paiement", "payé" ne reste dans le code frontend
- S'assurer que le mot "gratuit" apparaît naturellement sans être trop répétitif

## 6. Admin — Meilleure visibilité leads

**Fichier** : `src/pages/admin/Leads.tsx`

- Ajouter les colonnes Nationalité, Niveau actuel, Domaine d'études dans le tableau
- Ajouter un badge coloré pour les profils complets vs incomplets
- Ajouter le nombre de recours générés par lead

**Fichier** : `src/pages/admin/Analytics.tsx`

- Ajouter le taux de conversion signup → recours généré
- Ajouter les derniers événements récents en liste

## 7. Mobile — Polish

**Fichiers** : `src/components/AppLayout.tsx`, `src/components/MobileNav.tsx`

- Ajouter `safe-area-inset` padding en haut du header pour les mobiles avec notch
- S'assurer que la nav bottom a assez de padding pour les iPhones avec barre home
- Rendre les tableaux admin scrollables horizontalement sur mobile

## 8. Webhook — Robustesse et TODO

**Fichier** : `supabase/functions/n8n-webhook/index.ts`

- Ajouter des TODO clairs avec format `// TODO(n8n):` pour faciliter la recherche
- Ajouter un retry simple (1 retry) en cas d'échec réseau
- Loguer le payload envoyé (sans données sensibles) pour le debugging

**Fichier** : `supabase/functions/generate-letter/index.ts`

- Ajouter un TODO pour le webhook URL
- S'assurer que l'appel webhook n'est jamais bloquant même en cas de timeout

## Résumé des fichiers impactés

| Fichier | Changement |
|---------|-----------|
| `src/pages/Index.tsx` | Empathie hero, section "comment ça marche", social proof |
| `src/pages/Dashboard.tsx` | Messages contextuels, WhatsApp CTA, réassurance |
| `src/pages/recours/NouveauRecours.tsx` | Exemples complets, réassurance, résultat renforcé |
| `src/components/WhatsAppCTA.tsx` | Variante proéminente, sous-texte |
| `src/components/UpsellBlock.tsx` | Visuel renforcé, urgence |
| `src/components/AppLayout.tsx` | Safe area padding mobile |
| `src/components/MobileNav.tsx` | Safe area bottom |
| `src/pages/admin/Leads.tsx` | Colonnes enrichies, badges |
| `src/pages/admin/Analytics.tsx` | Taux conversion, événements récents |
| `supabase/functions/n8n-webhook/index.ts` | TODO, retry, logging |
| `supabase/functions/generate-letter/index.ts` | TODO webhook |

