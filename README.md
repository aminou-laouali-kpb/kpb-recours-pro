# KPB Recours

Application de **KPB Education** qui génère des lettres de recours gracieux personnalisées pour les étudiants dont la candidature a été refusée sur la plateforme Études en France.

## Fonctionnalités

- **Inscription et connexion** des étudiants, avec profil (WhatsApp, pays, nationalité).
- **Nouveau recours** : l'étudiant décrit sa candidature refusée et obtient une lettre rédigée par IA (`generate-letter`).
- **Historique** des recours et des lettres générées.
- **Espace admin** : leads, statistiques et suivi des recours.
- **E-mails** transactionnels avec file d'attente, journal d'envoi et gestion des désinscriptions.
- Webhook vers **n8n** pour les automatisations.

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Supabase : PostgreSQL avec RLS, Auth, Edge Functions
- TanStack Query, React Hook Form, Zod, Recharts

## Structure

```
src/pages/            Index, Inscription, Connexion, NouveauRecours, Recours,
                      Historique, Dashboard, Leads, Analytics, MonProfil
supabase/migrations/  schéma (profils, lettres générées, e-mails, événements…)
supabase/functions/   generate-letter, auth-email-hook, process-email-queue, n8n-webhook
```

## Démarrer en local

```bash
npm install
npm run dev
```

Variables d'environnement (fichier `.env`) :

| Variable | Rôle |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | clé publique (anon) Supabase |

Les fonctions Supabase utilisent en plus `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY` et `LOVABLE_SEND_URL`, à définir dans les secrets Supabase.

## Origine

Projet créé avec [Lovable](https://lovable.dev) et maintenu par KPB Education.
