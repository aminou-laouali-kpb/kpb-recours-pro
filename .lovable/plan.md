

# Plan : Transformation en "KPB Recours Gratuit"

Transformer l'app premium payante en un outil gratuit de génération de recours gracieux, optimisé pour la capture de leads et la conversion vers les écoles privées.

---

## Vue d'ensemble

```text
AVANT (premium payant)          APRÈS (gratuit + lead gen)
─────────────────────           ──────────────────────────
/ (landing premium)       →     / (landing gratuit, forte CTA)
/connexion                →     /connexion (magic link, simplifié)
/activation               →     SUPPRIMÉ (redirect → /)
/payer                    →     SUPPRIMÉ (redirect → /)
/access-check             →     SUPPRIMÉ (redirect → /dashboard)
/payments/*               →     SUPPRIMÉ (redirect → /)
/premium/dashboard        →     /dashboard
/premium/nouvelle-lettre  →     /recours/nouveau
/premium/historique       →     /recours/historique
/premium/mon-acces        →     /mon-profil (édition profil)
/admin/premium-access     →     /admin/leads
/admin/orders             →     /admin/recours
/admin/generated-letters  →     /admin/analytics
```

---

## 1. Base de données

**Migration SQL** — adapter les tables existantes sans casser la compatibilité :

- Ajouter colonnes au profil : `current_academic_level`, `target_level_in_france`, `field_of_study` (si pas déjà dans `profiles`)
- Rendre `premium_access_id` nullable dans `generated_letters` (les recours gratuits n'ont plus d'accès premium)
- Garder toutes les tables existantes intactes pour la rétrocompatibilité
- Ajouter une politique RLS INSERT sur `generated_letters` pour les utilisateurs authentifiés sans vérification premium
- Pas de nouvelle table nécessaire — réutiliser `profiles`, `generated_letters`, `events`

---

## 2. Edge Function `generate-letter` (refactoring)

Supprimer toute la logique premium/quota :
- Supprimer la vérification `premium_access_id`, `premium_access`, et le décompte `used_letters`
- Authentifier l'utilisateur normalement via JWT
- Valider les inputs, générer la lettre via Lovable AI (garder Gemini 2.5 Flash)
- Sauvegarder dans `generated_letters` avec `premium_access_id = NULL`
- **Ajouter l'appel webhook n8n** après génération réussie : POST vers `N8N_WEBHOOK_URL` (secret Supabase) avec toutes les données lead + lettre
- Tracker l'événement `recours_generated`

---

## 3. Nouvelle Edge Function `n8n-webhook`

Fonction utilitaire appelée côté serveur pour poster les données lead vers n8n :
- Événements : `signup_completed`, `profile_completed`, `recours_generated`, `whatsapp_clicked`
- Payload : user_id, full_name, email, whatsapp_number, country, nationality, academic info, university, program, lettre générée, event_type, created_at
- Secret configurable : `N8N_WEBHOOK_URL`
- Fail silently (log error mais ne bloque pas le flux utilisateur)

---

## 4. Frontend — Fichiers à créer/refactorer

### Pages à créer :
- **`src/pages/Index.tsx`** — Landing page gratuite. Headline : "Refus université Campus France ? Rédige gratuitement ton recours gracieux". Trust blocks, CTA "Commencer gratuitement", WhatsApp CTA
- **`src/pages/Inscription.tsx`** — Formulaire inscription : full_name, email, whatsapp_number, country, nationality. Création compte + profil
- **`src/pages/Dashboard.tsx`** — Dashboard utilisateur : bienvenue, complétion profil, bouton nouveau recours, historique récent, WhatsApp CTA, bloc école privée
- **`src/pages/MonProfil.tsx`** — Édition profil complet (full_name, email, whatsapp, country, nationality, academic_level, target_level, field_of_study)
- **`src/pages/recours/NouveauRecours.tsx`** — Formulaire multi-step (repris de NouvelleLettre mais sans quota/premium). Ajouter champ `refusal_date`
- **`src/pages/recours/Historique.tsx`** — Historique des recours (repris, sans PremiumLayout)
- **`src/pages/admin/Leads.tsx`** — Liste leads (profiles) avec recherche, export CSV
- **`src/pages/admin/Recours.tsx`** — Liste recours générés avec recherche, détail
- **`src/pages/admin/Analytics.tsx`** — Stats basiques : signups, recours, clics WhatsApp

### Pages à supprimer/rediriger :
- `Activation.tsx`, `Payer.tsx`, `AccessCheck.tsx`, `PaymentReturn.tsx`, `PaymentCancel.tsx`, `PaymentSuccess.tsx` → redirect vers `/`

### Composants à refactorer :
- **`PremiumLayout.tsx`** → `AppLayout.tsx` : remplacer "KPB Recours Premium" par "KPB Recours Gratuit"
- **`MobileNav.tsx`** — Nouvelles routes : `/dashboard`, `/recours/nouveau`, `/recours/historique`, `/mon-profil`
- **`PremiumRoute.tsx`** → `AuthRoute.tsx` : juste vérifier l'auth, plus de vérification premium
- **`AdminLayout.tsx`** — Mettre à jour nav : Leads, Recours, Analytics
- **`UpsellBlock.tsx`** — Garder et renforcer : CTA WhatsApp école privée avec le lien fourni
- **`WhatsAppCTA.tsx`** (nouveau) — Composant réutilisable pour le bouton WhatsApp avec le deep link configurable

### Fichiers/hooks à supprimer :
- `usePremiumAccess.ts` — plus nécessaire
- `PremiumRoute.tsx` — remplacé par `AuthRoute.tsx`

---

## 5. Routing (`App.tsx`)

```text
PUBLIC:  /, /connexion, /inscription
AUTH:    /dashboard, /recours/nouveau, /recours/historique, /mon-profil
ADMIN:  /admin/leads, /admin/recours, /admin/analytics
LEGACY: /premium/*, /activation, /payer, /payments/*, /access-check → redirect
```

---

## 6. Connexion (`Connexion.tsx`)

- Supprimer le lien "J'ai un code d'activation"
- Changer le titre : "KPB Recours Gratuit"
- Redirect après magic link → `/dashboard`
- Ajouter lien vers `/inscription`

---

## 7. WhatsApp CTA

Lien configurable via constante :
```
https://wa.me/VOTRE_NUMERO_FRANCE?text=Bonjour%20KPB%20Education...
```

Affiché :
- Après génération de lettre (bloc fort)
- Sur le dashboard
- Dans le composant UpsellBlock renforcé

---

## 8. Résultat après génération

Après chaque lettre :
1. Lettre affichée
2. Boutons : Copier, Télécharger, Enregistrer
3. Disclaimers
4. **Bloc conversion école privée** (headline + texte + bouton WhatsApp vert)
5. Tracking événements : `recours_generated`, `recours_copied`, `recours_downloaded`, `whatsapp_private_school_clicked`

---

## 9. Secret à configurer

- `N8N_WEBHOOK_URL` — URL du webhook n8n (à fournir par l'utilisateur)

---

## Résumé des fichiers impactés

| Action | Fichiers |
|--------|----------|
| Créer | `src/pages/Inscription.tsx`, `src/pages/Dashboard.tsx`, `src/pages/MonProfil.tsx`, `src/pages/recours/NouveauRecours.tsx`, `src/pages/recours/Historique.tsx`, `src/pages/admin/Leads.tsx`, `src/pages/admin/Recours.tsx`, `src/pages/admin/Analytics.tsx`, `src/components/AppLayout.tsx`, `src/components/AuthRoute.tsx`, `src/components/WhatsAppCTA.tsx`, `supabase/functions/n8n-webhook/index.ts` |
| Refactorer | `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/Connexion.tsx`, `src/components/MobileNav.tsx`, `src/components/AdminLayout.tsx`, `src/components/UpsellBlock.tsx`, `supabase/functions/generate-letter/index.ts` |
| Supprimer/Redirect | `src/pages/Activation.tsx`, `src/pages/Payer.tsx`, `src/pages/AccessCheck.tsx`, `src/pages/PaymentReturn.tsx`, `src/pages/PaymentCancel.tsx`, `src/pages/PaymentSuccess.tsx`, `src/hooks/usePremiumAccess.ts`, `src/components/PremiumRoute.tsx`, `src/components/PremiumLayout.tsx` |
| Migration DB | 1 migration (colonnes profil + nullable premium_access_id) |

