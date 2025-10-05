-- Create enum types
CREATE TYPE public.app_role AS ENUM ('user', 'admin');
CREATE TYPE public.review_type AS ENUM ('placement', 'work_experience');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.round_type AS ENUM ('assessment', 'coding', 'technical_interview', 'hr_interview', 'other');
CREATE TYPE public.pass_status AS ENUM ('passed', 'failed', 'waiting');

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  batch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_type review_type NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  position_applied_for TEXT,
  batch TEXT,
  timeline TEXT,
  ctc_stipend TEXT,
  final_offer_status TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Placement rounds table (flexible structure)
CREATE TABLE public.placement_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  round_type round_type NOT NULL,
  round_order INTEGER NOT NULL,
  round_name TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  topics_covered TEXT,
  sections TEXT,
  pass_status pass_status,
  tips TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work experience details table
CREATE TABLE public.work_experience_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  department TEXT,
  work_life_balance INTEGER CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
  learning_opportunities TEXT,
  culture_rating INTEGER CHECK (culture_rating >= 1 AND culture_rating <= 5),
  growth_prospects TEXT,
  pros TEXT,
  cons TEXT,
  overall_experience TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience_details ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for companies
CREATE POLICY "Companies are viewable by everyone"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own pending reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can update any review"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own pending reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() AND status = 'pending');

-- RLS Policies for placement_rounds
CREATE POLICY "Placement rounds viewable with approved reviews"
  ON public.placement_rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = placement_rounds.review_id
      AND reviews.status = 'approved'
    )
  );

CREATE POLICY "Users can view own review rounds"
  ON public.placement_rounds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = placement_rounds.review_id
      AND reviews.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rounds for own reviews"
  ON public.placement_rounds FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = placement_rounds.review_id
      AND reviews.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rounds for own pending reviews"
  ON public.placement_rounds FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = placement_rounds.review_id
      AND reviews.author_id = auth.uid()
      AND reviews.status = 'pending'
    )
  );

-- RLS Policies for work_experience_details
CREATE POLICY "Work experience viewable with approved reviews"
  ON public.work_experience_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = work_experience_details.review_id
      AND reviews.status = 'approved'
    )
  );

CREATE POLICY "Users can view own work experience"
  ON public.work_experience_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = work_experience_details.review_id
      AND reviews.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can create work experience for own reviews"
  ON public.work_experience_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = work_experience_details.review_id
      AND reviews.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update work experience for own pending reviews"
  ON public.work_experience_details FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = work_experience_details.review_id
      AND reviews.author_id = auth.uid()
      AND reviews.status = 'pending'
    )
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();