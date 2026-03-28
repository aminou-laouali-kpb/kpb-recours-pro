

# KPB Recours Premium — Plan d'implémentation

## ⚠️ Note importante sur la base de données
Vous avez choisi Lovable Cloud, qui crée sa propre instance Supabase. Pour partager la même base de données que l'app gratuite, il faudra soit connecter ce projet à votre Supabase existant, soit synchroniser les données. Nous commencerons avec Lovable Cloud et ajusterons si nécessaire.

## Phase 1 — Fondations
- Activer Lovable Cloud et configurer le thème premium (couleurs chaudes, typographie lisible, mobile-first)
- Créer les tables nécessaires : `users`, `free_assessments`, `orders`, `premium_access`, `activation_codes`, `generated_letters`, `events` avec RLS
- Configurer l'authentification email/magic-link
- Créer une table `admin_emails` pour identifier les administrateurs
- Mettre en place les routes et la navigation

## Phase 2 — Accès & Activation
- **Page d'accueil** (`/`) : présentation premium avec CTA vers connexion/activation
- **Connexion** (`/connexion`) : email + magic link
- **Activation** (`/activation`) : saisie email + code d'activation, validation backend
- **Pages paiement** (`/payments/moneyfusion/return`, `/success`, `/cancel`) : gestion des retours de paiement avec vérification de commande et redirection
- **Vérification d'accès** (`/access-check`) : statut de l'accès premium
- Protection des routes premium (accès actif + quota non épuisé)

## Phase 3 — Espace Premium
- **Dashboard** (`/premium/dashboard`) : statut accès, lettres restantes (X/3), résumé dossier, bouton "Créer une nouvelle lettre", historique, bloc upsell école privée
- **Nouvelle lettre** (`/premium/nouvelle-lettre`) : formulaire multi-étapes (université, programme, motif refus, contexte, projet académique, arguments, ton souhaité) avec pré-remplissage depuis `free_assessments`
- **Génération IA** via edge function utilisant Lovable AI Gateway — lettres en français, ton académique et respectueux, structure formelle complète
- **Historique** (`/premium/historique`) : liste des lettres avec copie, téléchargement .txt, date, université
- **Mon accès** (`/premium/mon-acces`) : détails premium, quota, statut

## Phase 4 — Admin
- Zone admin protégée par emails spécifiques
- **Accès premium** (`/admin/premium-access`) : liste filtrable, statut, lettres utilisées
- **Commandes** (`/admin/orders`) : liste avec filtres email/pays/statut
- **Lettres générées** (`/admin/generated-letters`) : consultation et filtres
- Cartes métriques : accès actifs, paiements en attente, total lettres, moyenne lettres/utilisateur
- Export CSV

## Phase 5 — Finitions
- Disclaimers juridiques dans l'UI (pas d'avis juridique, pas de garantie)
- Tracking d'événements (vues, activation, génération, quota atteint, clic upsell)
- États vides/erreur/succès en français (quota épuisé, paiement en attente, code invalide…)
- Bloc upsell "Sécuriser un plan B" sur le dashboard et après chaque lettre générée
- Placeholders et TODO pour intégration Money Fusion / Maketu

