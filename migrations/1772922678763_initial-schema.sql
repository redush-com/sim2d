-- Up Migration

-- Profiles (auto-created on sign-up via trigger)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Saved simulations
CREATE TABLE saved_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sim_type TEXT NOT NULL CHECK (sim_type IN ('builtin', 'custom')),
  builtin_id TEXT,
  params JSONB NOT NULL DEFAULT '{}',
  source_code TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE saved_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own simulations"
  ON saved_simulations FOR SELECT
  USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY "Users can insert own simulations"
  ON saved_simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON saved_simulations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON saved_simulations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_simulations_user ON saved_simulations(user_id);

-- Shared links
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES saved_simulations(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared links"
  ON shared_links FOR SELECT USING (true);

CREATE POLICY "Users can create links for own simulations"
  ON shared_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_simulations
      WHERE id = simulation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shared links"
  ON shared_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM saved_simulations
      WHERE id = simulation_id AND user_id = auth.uid()
    )
  );

CREATE INDEX idx_shared_links_token ON shared_links(share_token);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Down Migration

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP INDEX IF EXISTS idx_shared_links_token;
DROP TABLE IF EXISTS shared_links;
DROP INDEX IF EXISTS idx_saved_simulations_user;
DROP TABLE IF EXISTS saved_simulations;
DROP TABLE IF EXISTS profiles;
