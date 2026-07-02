-- ==========================================
-- CULINARY VITALITY — SUPABASE SCHEMA (v2 cu Auth)
-- Ruleaza in: Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/gbeewcuyzneyliuhyzts/sql
-- ==========================================

-- 1. EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. PROFILES (legat de auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  avatar_initials TEXT DEFAULT 'U',
  avatar_color    TEXT DEFAULT '#10b981',
  avatar_url      TEXT,
  bio             TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Oricine poate vedea profilurile
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);

-- Utilizatorul poate insera propriul profil
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Utilizatorul poate actualiza propriul profil
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 3. FRIEND_REQUESTS
-- ==========================================
CREATE TABLE IF NOT EXISTS friend_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fr_select" ON friend_requests FOR SELECT USING (
  auth.uid() = to_user_id OR auth.uid() = from_user_id
);
CREATE POLICY "fr_insert" ON friend_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "fr_update" ON friend_requests FOR UPDATE USING (auth.uid() = to_user_id);

-- ==========================================
-- 4. NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type              TEXT DEFAULT 'friend_request' CHECK (type IN ('friend_request', 'system')),
  read              BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  friend_request_id UUID REFERENCES friend_requests(id) ON DELETE CASCADE,
  message           TEXT
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 5. TRIGGER: notificare automata la cerere noua
-- ==========================================
CREATE OR REPLACE FUNCTION notify_on_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, friend_request_id)
  VALUES (NEW.to_user_id, 'friend_request', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_friend_request_created ON friend_requests;
CREATE TRIGGER on_friend_request_created
  AFTER INSERT ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_friend_request();

-- ==========================================
-- 6. ALTERATIONS FOR EXISTING TABLES (UPDATE SCHEMA)
-- ==========================================
-- Ruleaza aceste comenzi in Supabase Dashboard -> SQL Editor pentru a asigura suportul complet pentru imagini, bio si statistici!
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cooked_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ingredients_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- ==========================================
-- 7. STORAGE BUCKET CONFIGURATION FOR AVATARS
-- ==========================================
-- Pentru a asigura functionarea incarcarii pozelor de profil:
-- 1. Mergi in Supabase Dashboard -> Storage.
-- 2. Creeaza un nou bucket public numit "avatars".
-- 3. Asigura-te ca bucket-ul este setat ca public si ca are urmatoarele politici active:
--    - SELECT: Permite vizualizarea imaginilor pentru toti utilizatorii (public).
--    - INSERT/UPDATE: Permite incarcarea/modificarea pozei proprii pentru utilizatorii autentificati.
--      (Politica de tip CHECK: auth.uid()::text = (storage.foldername(name))[1])
