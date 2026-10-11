CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  account_type text NOT NULL DEFAULT 'mentee' CHECK (account_type IN ('mentee','mentor')),
  college text,
  major text,
  languages text[] NOT NULL DEFAULT '{}',
  backgrounds text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  bio text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or mentor profiles" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR account_type = 'mentor');
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL,
  mentor_id uuid,
  mentor_key text NOT NULL,
  mentor_name text NOT NULL,
  message text,
  match_score int,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentee_id, mentor_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties read" ON public.connections FOR SELECT TO authenticated
  USING (mentee_id = auth.uid() OR mentor_id = auth.uid());
CREATE POLICY "mentee creates" ON public.connections FOR INSERT TO authenticated WITH CHECK (mentee_id = auth.uid());
CREATE POLICY "mentor updates" ON public.connections FOR UPDATE TO authenticated
  USING (mentor_id = auth.uid()) WITH CHECK (mentor_id = auth.uid());
CREATE POLICY "mentee deletes" ON public.connections FOR DELETE TO authenticated USING (mentee_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, account_type, college, major)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'mentor' THEN 'mentor' ELSE 'mentee' END,
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'major'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();