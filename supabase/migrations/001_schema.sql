-- Onchain Fans — Supabase Schema
-- x402-native OnlyFans on Arc blockchain

-- Profiles table (extends Supabase auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  arc_wallet_address TEXT DEFAULT '', -- fan's Arc wallet (passkey or EOA)
  is_creator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Creator profiles (extended info for creators)
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  arc_payment_address TEXT NOT NULL, -- where USDC gets sent
  subscription_price_usdc BIGINT DEFAULT 0, -- monthly sub in base units (6 decimals)
  is_verified BOOLEAN DEFAULT FALSE,
  total_earnings_usdc BIGINT DEFAULT 0,
  total_fans INTEGER DEFAULT 0,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content items (photos, videos, posts)
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'audio', 'text')),
  mime_type TEXT DEFAULT '',
  
  -- Content storage
  file_url TEXT DEFAULT '',       -- full-res (locked behind x402)
  preview_url TEXT DEFAULT '',    -- blurred/low-res preview
  thumbnail_url TEXT DEFAULT '',
  
  -- Monetization
  price_usdc BIGINT NOT NULL DEFAULT 0, -- 0 = free preview only (still x402 gated)
  is_subscriber_only BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchases (x402 payment records)
CREATE TABLE content_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  buyer_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_usdc BIGINT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE, -- Arc blockchain tx hash
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, buyer_profile_id)
);

-- Subscriptions (recurring)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  amount_usdc BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subscriber_id, creator_profile_id)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- Creator profiles: viewable by everyone
CREATE POLICY "Creator profiles are viewable by everyone"
  ON creator_profiles FOR SELECT USING (TRUE);

CREATE POLICY "Creators can update own profile"
  ON creator_profiles FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Creators can insert own profile"
  ON creator_profiles FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

-- Content: published items viewable by everyone
CREATE POLICY "Published content is viewable by everyone"
  ON content_items FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Creators can manage own content"
  ON content_items FOR ALL USING (
    creator_profile_id IN (
      SELECT cp.id FROM creator_profiles cp
      JOIN profiles p ON p.id = cp.profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Purchases: buyer sees own
CREATE POLICY "Users see own purchases"
  ON content_purchases FOR SELECT USING (
    buyer_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Creators see purchases of own content"
  ON content_purchases FOR SELECT USING (
    content_id IN (
      SELECT ci.id FROM content_items ci
      JOIN creator_profiles cp ON cp.id = ci.creator_profile_id
      JOIN profiles p ON p.id = cp.profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Insert purchases"
  ON content_purchases FOR INSERT WITH CHECK (TRUE);

-- Subscriptions
CREATE POLICY "Users see own subscriptions"
  ON subscriptions FOR SELECT USING (
    subscriber_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Creators see subscribers"
  ON subscriptions FOR SELECT USING (
    creator_profile_id IN (
      SELECT cp.id FROM creator_profiles cp
      JOIN profiles p ON p.id = cp.profile_id
      WHERE p.auth_user_id = auth.uid()
    )
  );
