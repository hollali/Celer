-- Celer Database Schema
-- Run this in your Neon SQL editor (https://console.neon.tech)

-- Users table (synced from Clerk on sign-up)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  clerk_id TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  preferred_vehicle TEXT DEFAULT 'Economy',
  avatar_url TEXT DEFAULT '',
  marketing_opt_in BOOLEAN DEFAULT FALSE,
  ride_updates BOOLEAN DEFAULT TRUE,
  total_trips INTEGER DEFAULT 0,
  rating REAL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  loyalty_tier TEXT DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Drivers table (seeded with data)
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_image_url TEXT,
  car_image_url TEXT,
  car_seats INTEGER NOT NULL CHECK (car_seats > 0),
  rating REAL NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  is_available BOOLEAN DEFAULT TRUE,
  current_latitude REAL,
  current_longitude REAL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  vehicle_type TEXT DEFAULT 'Economy',
  license_number TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  ride_id SERIAL PRIMARY KEY,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  origin_latitude REAL NOT NULL CHECK (origin_latitude >= -90 AND origin_latitude <= 90),
  origin_longitude REAL NOT NULL CHECK (origin_longitude >= -180 AND origin_longitude <= 180),
  destination_latitude REAL NOT NULL CHECK (destination_latitude >= -90 AND destination_latitude <= 90),
  destination_longitude REAL NOT NULL CHECK (destination_longitude >= -180 AND destination_longitude <= 180),
  ride_time INTEGER NOT NULL CHECK (ride_time > 0),
  fare_price REAL NOT NULL CHECK (fare_price >= 0),
  ride_status TEXT NOT NULL DEFAULT 'requested' CHECK (ride_status IN ('requested', 'accepted', 'in_progress', 'completed', 'canceled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(ride_status);

-- Conversations between users and drivers/support
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  is_support BOOLEAN DEFAULT FALSE,
  is_safety BOOLEAN DEFAULT FALSE,
  is_promo BOOLEAN DEFAULT FALSE,
  last_message TEXT,
  last_message_at TIMESTAMP DEFAULT NOW(),
  user_unread INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_driver_id ON conversations(driver_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC NULLS LAST);

-- Messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'driver', 'support', 'safety', 'promo')),
  sender_name TEXT NOT NULL DEFAULT 'Unknown',
  text TEXT NOT NULL CHECK (char_length(text) > 0 AND char_length(text) <= 2000),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Ratings for completed rides
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  ride_id INTEGER NOT NULL REFERENCES rides(ride_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ride_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_driver_id ON ratings(driver_id);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value REAL NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER DEFAULT -1,
  current_uses INTEGER DEFAULT 0,
  min_fare REAL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, expires_at);

-- Saved places
CREATE TABLE IF NOT EXISTS saved_places (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  icon TEXT DEFAULT 'location',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);

-- User payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('card', 'momo', 'cash')),
  provider TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Safety settings per user
CREATE TABLE IF NOT EXISTS safety_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  share_trip BOOLEAN DEFAULT TRUE,
  emergency_alerts BOOLEAN DEFAULT TRUE,
  audio_recording BOOLEAN DEFAULT FALSE,
  check_in_interval INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trusted safety contacts
CREATE TABLE IF NOT EXISTS safety_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_contacts_user_id ON safety_contacts(user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'ride', 'promo', 'safety', 'support')),
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Legal consent records
CREATE TABLE IF NOT EXISTS legal_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analytics_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  terms_version TEXT DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_consents_user_id ON legal_consents(user_id);

-- Rate limiting (DB-backed instead of in-memory)
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMP DEFAULT NOW(),
  request_count INTEGER DEFAULT 1,
  UNIQUE(user_id, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(user_id, endpoint, window_start);

-- Paystack transaction records (for idempotency)
CREATE TABLE IF NOT EXISTS paystack_transactions (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  ride_id INTEGER REFERENCES rides(ride_id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paystack_reference ON paystack_transactions(reference);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated') THEN
    CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_drivers_updated') THEN
    CREATE TRIGGER trg_drivers_updated BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rides_updated') THEN
    CREATE TRIGGER trg_rides_updated BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_conversations_updated') THEN
    CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_support_tickets_updated') THEN
    CREATE TRIGGER trg_support_tickets_updated BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_safety_settings_updated') THEN
    CREATE TRIGGER trg_safety_settings_updated BEFORE UPDATE ON safety_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_legal_consents_updated') THEN
    CREATE TRIGGER trg_legal_consents_updated BEFORE UPDATE ON legal_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
