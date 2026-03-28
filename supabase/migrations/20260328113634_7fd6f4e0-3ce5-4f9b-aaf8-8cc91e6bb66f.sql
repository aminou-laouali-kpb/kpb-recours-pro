
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  whatsapp_number TEXT,
  country TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Free assessments
CREATE TABLE public.free_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_academic_level TEXT,
  target_level_in_france TEXT,
  field_of_study TEXT,
  institutions_applied_to TEXT[],
  program_applied_for TEXT,
  result_category TEXT,
  result_explanation TEXT,
  recommended_next_step TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.free_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assessments" ON public.free_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.free_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.free_assessments(id),
  provider TEXT NOT NULL DEFAULT 'moneyfusion',
  reference TEXT UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_payload JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Premium access
CREATE TABLE public.premium_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  assessment_id UUID REFERENCES public.free_assessments(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
  max_letters INT NOT NULL DEFAULT 3,
  used_letters INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own premium access" ON public.premium_access FOR SELECT USING (auth.uid() = user_id);

-- Activation codes
CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own codes" ON public.activation_codes FOR SELECT USING (auth.uid() = user_id);

-- Generated letters
CREATE TABLE public.generated_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  premium_access_id UUID NOT NULL REFERENCES public.premium_access(id),
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  input_payload JSONB NOT NULL DEFAULT '{}',
  letter_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own letters" ON public.generated_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own letters" ON public.generated_letters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events tracking
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  assessment_id UUID REFERENCES public.free_assessments(id),
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);

-- Admin emails table
CREATE TABLE public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can check admin" ON public.admin_emails FOR SELECT TO authenticated USING (true);

-- Admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_emails WHERE email = check_email);
$$;

-- Admin policies for viewing all data
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can view all premium_access" ON public.premium_access FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can update premium_access" ON public.premium_access FOR UPDATE USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can view all letters" ON public.generated_letters FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can view all events" ON public.events FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can view all codes" ON public.activation_codes FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can update codes" ON public.activation_codes FOR UPDATE USING (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can insert codes" ON public.activation_codes FOR INSERT WITH CHECK (public.is_admin(auth.jwt()->>'email'));
CREATE POLICY "Admins can view all assessments" ON public.free_assessments FOR SELECT USING (public.is_admin(auth.jwt()->>'email'));

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
