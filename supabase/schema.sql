
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_code TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  lecture_number INTEGER NOT NULL,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subject_id, date, lecture_number)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  image_url TEXT,
  pdf_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

-- If legacy public.notes table exists in your Supabase DB, enable RLS & secure policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
    EXECUTE 'ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;';
  END IF;
END $$;

-- Helper to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles policies
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subjects policies
DROP POLICY IF EXISTS "Authenticated users can read subjects" ON public.subjects;
CREATE POLICY "Authenticated users can read subjects"
  ON public.subjects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert subjects" ON public.subjects;
CREATE POLICY "Authenticated users can insert subjects"
  ON public.subjects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update subjects" ON public.subjects;
CREATE POLICY "Authenticated users can update subjects"
  ON public.subjects FOR UPDATE USING (auth.role() = 'authenticated');

-- Lectures policies
DROP POLICY IF EXISTS "Authenticated users can read lectures" ON public.lectures;
CREATE POLICY "Authenticated users can read lectures"
  ON public.lectures FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert lectures" ON public.lectures;
CREATE POLICY "Authenticated users can insert lectures"
  ON public.lectures FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update lectures" ON public.lectures;
CREATE POLICY "Authenticated users can update lectures"
  ON public.lectures FOR UPDATE USING (auth.role() = 'authenticated');

-- Posts policies
DROP POLICY IF EXISTS "Authenticated users can read posts" ON public.posts;
CREATE POLICY "Authenticated users can read posts"
  ON public.posts FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert own posts" ON public.posts;
CREATE POLICY "Authenticated users can insert own posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Post owner or admin can delete posts" ON public.posts;
CREATE POLICY "Post owner or admin can delete posts"
  ON public.posts FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Upvotes policies
DROP POLICY IF EXISTS "Authenticated users can read upvotes" ON public.upvotes;
CREATE POLICY "Authenticated users can read upvotes"
  ON public.upvotes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own upvotes" ON public.upvotes;
CREATE POLICY "Users can insert own upvotes"
  ON public.upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own upvotes" ON public.upvotes;
CREATE POLICY "Users can delete own upvotes"
  ON public.upvotes FOR DELETE USING (auth.uid() = user_id);

-- Legacy public.notes policies cleanup (fixes Supabase Security Advisor warnings)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete" ON public.notes;';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert" ON public.notes;';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read" ON public.notes;';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update" ON public.notes;';
    
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read notes" ON public.notes;';
    EXECUTE 'CREATE POLICY "Authenticated users can read notes" ON public.notes FOR SELECT USING (auth.role() = ''authenticated'');';
    
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert notes" ON public.notes;';
    EXECUTE 'CREATE POLICY "Authenticated users can insert notes" ON public.notes FOR INSERT WITH CHECK (auth.role() = ''authenticated'');';
  END IF;
END $$;

-- Seed initial subjects for BScIT
INSERT INTO public.subjects (name, color_code) VALUES
  ('Mathematics', '#B85C38'),
  ('Physics', '#4A709C'),
  ('Chemistry', '#3E8E75'),
  ('Data Structures', '#7C3AED'),
  ('DBMS', '#2563EB'),
  ('Operating Systems', '#DC2626'),
  ('Computer Networks', '#059669'),
  ('Software Engineering', '#D97706')
ON CONFLICT (name) DO NOTHING;

-- Storage Bucket Setup for note-images and note-pdfs
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('note-pdfs', 'note-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public access to note images" ON storage.objects;
CREATE POLICY "Public access to note images"
  ON storage.objects FOR SELECT USING (bucket_id = 'note-images');

DROP POLICY IF EXISTS "Authenticated users can upload note images" ON storage.objects;
CREATE POLICY "Authenticated users can upload note images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'note-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete note images" ON storage.objects;
CREATE POLICY "Users can delete note images"
  ON storage.objects FOR DELETE USING (bucket_id = 'note-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public access to note pdfs" ON storage.objects;
CREATE POLICY "Public access to note pdfs"
  ON storage.objects FOR SELECT USING (bucket_id = 'note-pdfs');

DROP POLICY IF EXISTS "Authenticated users can upload note pdfs" ON storage.objects;
CREATE POLICY "Authenticated users can upload note pdfs"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'note-pdfs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete note pdfs" ON storage.objects;
CREATE POLICY "Users can delete note pdfs"
  ON storage.objects FOR DELETE USING (bucket_id = 'note-pdfs' AND auth.role() = 'authenticated');
