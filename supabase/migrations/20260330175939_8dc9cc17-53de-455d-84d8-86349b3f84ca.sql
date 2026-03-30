
-- Add profile columns for academic info
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_academic_level text,
  ADD COLUMN IF NOT EXISTS target_level_in_france text,
  ADD COLUMN IF NOT EXISTS field_of_study text;

-- Make premium_access_id nullable in generated_letters
ALTER TABLE public.generated_letters
  ALTER COLUMN premium_access_id DROP NOT NULL;
