

# Plan : Alléger la base de données et accélérer l'inscription

## Problème

La base contient des tables inutilisées héritées du modèle payant (`orders`, `premium_access`, `activation_codes`, `free_assessments`) qui ajoutent de la complexité. Le trigger `handle_new_user` ne sauvegarde pas le WhatsApp/pays/nationalité fournis à l'inscription. L'app fait aussi des appels `events` non essentiels qui ralentissent l'expérience.

## Changements

### 1. Migration : mettre à jour le trigger + nettoyer les tables inutiles

Une seule migration SQL :

```sql
-- 1. Mettre à jour le trigger pour sauvegarder toutes les données d'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, whatsapp_number, country, nationality)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'nationality', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Supprimer les tables inutilisées
DROP TABLE IF EXISTS public.activation_codes CASCADE;
DROP TABLE IF EXISTS public.premium_access CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.free_assessments CASCADE;
```

Cela garde uniquement : `profiles`, `generated_letters`, `events`, `admin_emails` + les tables email.

### 2. Supprimer les edge functions inutiles

Supprimer les fonctions liées au paiement :
- `activate-code`
- `initiate-payment`
- `moneyfusion-webhook`

### 3. Alléger le frontend — supprimer les tracking events non-bloquants

**`src/hooks/useTrackEvent.ts`** : Rendre l'appel complètement fire-and-forget (ne pas await).

**`src/pages/recours/NouveauRecours.tsx`** : Supprimer le `useEffect` de tracking `recours_started` au montage (inutile, ralentit).

**`src/pages/Dashboard.tsx`** : Supprimer le tracking `dashboard_viewed` au montage.

### 4. Simplifier AuthContext — supprimer l'appel admin pour les users normaux

**`src/contexts/AuthContext.tsx`** : Ne pas appeler `checkAdmin` à chaque changement de session pour les utilisateurs normaux. Utiliser un appel lazy (seulement quand on accède à une route admin).

### 5. Supprimer les routes legacy inutiles

**`src/App.tsx`** : Supprimer les redirections `/premium/*`, `/payer`, `/activation`, `/access-check`, `/payments/*`, `/admin/premium-access`, `/admin/orders`, `/admin/generated-letters`.

### 6. Redéployer les edge functions modifiées

Redéployer `generate-letter` et `n8n-webhook` (inchangés mais avec la DB allégée).

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| Migration SQL | Trigger amélioré + DROP 4 tables |
| `supabase/functions/activate-code/` | Supprimer |
| `supabase/functions/initiate-payment/` | Supprimer |
| `supabase/functions/moneyfusion-webhook/` | Supprimer |
| `src/contexts/AuthContext.tsx` | Lazy admin check |
| `src/hooks/useTrackEvent.ts` | Fire-and-forget |
| `src/pages/Dashboard.tsx` | Supprimer tracking montage |
| `src/pages/recours/NouveauRecours.tsx` | Supprimer tracking montage |
| `src/App.tsx` | Nettoyer routes legacy |

