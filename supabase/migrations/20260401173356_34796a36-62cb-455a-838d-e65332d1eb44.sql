-- 1. Update trigger to save all signup data
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

-- 2. Drop FK references first, then unused tables
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_assessment_id_fkey;
ALTER TABLE public.events DROP COLUMN IF EXISTS assessment_id;
ALTER TABLE public.generated_letters DROP CONSTRAINT IF EXISTS generated_letters_premium_access_id_fkey;
ALTER TABLE public.generated_letters DROP COLUMN IF EXISTS premium_access_id;

DROP TABLE IF EXISTS public.activation_codes CASCADE;
DROP TABLE IF EXISTS public.premium_access CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.free_assessments CASCADE;