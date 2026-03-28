

# Plan d'amélioration — 3 axes

## 1. Email de connexion (magic link) en français

Actuellement, il n'y a pas de domaine email configuré. Les emails de magic link sont envoyés par le système par défaut (en anglais).

**Solution** : Configurer un domaine email via le dialogue de setup, puis créer des templates d'emails d'authentification personnalisés en français avec les instructions claires pour l'étudiant.

**Étapes** :
- Ouvrir le dialogue de configuration du domaine email (tu devras fournir un domaine, ex: `kpb-recours.com`)
- Scaffolder les templates d'emails d'auth en français (magic link, confirmation, etc.)
- Personnaliser le contenu : objet en français, instructions étape par étape ("Clique sur le bouton ci-dessous pour te connecter à ton espace KPB Recours Premium")
- Appliquer le branding du projet (couleurs orange/warm, police Plus Jakarta Sans)
- Déployer la fonction backend

**Prérequis** : Tu dois avoir un nom de domaine. As-tu un domaine (ex: kpb-recours.com) ?

---

## 2. Exemples de réponses sous chaque champ du formulaire

Ajouter un texte d'aide en gris sous chaque champ de saisie dans `NouvelleLettre.tsx` pour guider les étudiants.

**Fichier** : `src/pages/premium/NouvelleLettre.tsx`

**Exemples prévus** :

| Champ | Exemple d'aide |
|-------|---------------|
| Université / école | _Ex : « Université Paris-Saclay », « INSA Lyon »_ |
| Programme / formation | _Ex : « Master 1 Informatique », « Licence 3 Économie-Gestion »_ |
| Motif de refus | _Ex : « Capacité d'accueil atteinte », « Dossier jugé insuffisant », « Pièces manquantes »_ |
| Contexte candidature | _Ex : « Je suis actuellement en L2 Économie au Maroc et j'ai postulé via Études en France pour une L3... »_ |
| Projet académique | _Ex : « Je souhaite me spécialiser en finance d'entreprise et obtenir un Master en France pour travailler dans le conseil... »_ |
| Pourquoi réexamen | _Ex : « Mon dossier ne reflétait pas mes dernières notes du semestre, qui montrent une nette progression... »_ |
| Nouveaux éléments | _Ex : « J'ai obtenu une certification B2 en français depuis ma candidature », « Mon relevé de notes du S2 n'était pas inclus »_ |
| Notes supplémentaires | _Ex : « J'ai une lettre de recommandation de mon professeur principal »_ |

Implémentation : ajouter un `<p className="text-xs text-muted-foreground">` sous chaque `Input` / `Textarea`.

---

## 3. Intégration Money Fusion pour le paiement

D'après l'image partagée, Money Fusion propose une API de paiement avec : type d'application, nom, description, logo, URL du site, URL de redirection après paiement, et adresses IP autorisées.

**Plan d'intégration** :

1. **Créer une Edge Function `initiate-payment`** qui :
   - Reçoit l'email de l'étudiant et le montant
   - Crée une commande dans la table `orders` (status: pending)
   - Appelle l'API Money Fusion pour initier le paiement
   - Retourne l'URL de paiement Money Fusion vers laquelle rediriger l'étudiant

2. **Créer une Edge Function `moneyfusion-webhook`** qui :
   - Reçoit le callback de Money Fusion après paiement réussi
   - Met à jour la commande (status: paid)
   - Crée ou trouve le compte utilisateur
   - Génère un code d'activation et l'active automatiquement (premium_access)
   - Envoie un magic link à l'email de l'étudiant

3. **Mettre à jour `PaymentReturn.tsx`** pour :
   - Vérifier le statut du paiement via la référence
   - Si payé : afficher un message de succès + "Vérifie ta boîte mail pour ton lien de connexion"
   - Si en attente : polling ou message d'attente

4. **Ajouter un bouton/page de paiement** sur la landing page ou une page dédiée `/payer`

**Prérequis** : Tu devras configurer tes clés API Money Fusion. As-tu déjà créé ton application sur le dashboard Money Fusion et obtenu tes clés API (clé publique + clé secrète) ?

---

## Résumé des fichiers impactés

- `src/pages/premium/NouvelleLettre.tsx` — exemples sous chaque champ
- `supabase/functions/initiate-payment/index.ts` — nouvelle fonction
- `supabase/functions/moneyfusion-webhook/index.ts` — nouvelle fonction
- `src/pages/PaymentReturn.tsx` — amélioration du flux post-paiement
- Templates email d'auth (si domaine configuré)

## Questions à clarifier avant de commencer

Avant d'implémenter, j'ai besoin de savoir :
1. **As-tu un nom de domaine** pour les emails personnalisés ? (sinon on peut commencer par les points 2 et 3)
2. **As-tu tes clés API Money Fusion** (ou tu es encore en train de configurer l'application sur leur dashboard) ?
3. **Quel est le prix du service premium** à facturer ?

