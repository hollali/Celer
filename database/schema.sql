-- Celer Database Schema
-- Run this in your Neon SQL editor (https://console.neon.tech)

-- Users table (synced from Clerk on sign-up)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  clerk_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Drivers table (seeded with data)
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_image_url TEXT,
  car_image_url TEXT,
  car_seats INTEGER NOT NULL,
  rating REAL NOT NULL DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  ride_id SERIAL PRIMARY KEY,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  origin_latitude REAL NOT NULL,
  origin_longitude REAL NOT NULL,
  destination_latitude REAL NOT NULL,
  destination_longitude REAL NOT NULL,
  ride_time TEXT NOT NULL,
  fare_price REAL NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  driver_id INTEGER NOT NULL REFERENCES drivers(id),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed drivers (matching the fallback data in the app)
INSERT INTO drivers (first_name, last_name, profile_image_url, car_image_url, car_seats, rating) VALUES
  ('Kwame', 'Asante', 'https://randomuser.me/api/portraits/men/1.jpg', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 4, 4.8),
  ('Ama', 'Boateng', 'https://randomuser.me/api/portraits/women/2.jpg', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', 4, 4.7),
  ('Kofi', 'Mensah', 'https://randomuser.me/api/portraits/men/3.jpg', 'https://images.unsplash.com/photo-1542362567-b07e83758753?w=800', 4, 4.6),
  ('Esi', 'Owusu', 'https://randomuser.me/api/portraits/women/4.jpg', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800', 4, 4.5)
ON CONFLICT DO NOTHING;

-- Conversations between users and drivers/support
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  driver_id INTEGER REFERENCES drivers(id),
  is_support BOOLEAN DEFAULT FALSE,
  is_safety BOOLEAN DEFAULT FALSE,
  is_promo BOOLEAN DEFAULT FALSE,
  last_message TEXT,
  last_message_at TIMESTAMP DEFAULT NOW(),
  user_unread INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'driver', 'support', 'safety', 'promo')),
  sender_name TEXT NOT NULL DEFAULT 'Unknown',
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed conversations (requires a user to exist first — inserted after user sign-up via the API)
-- These get created dynamically. For demo, we insert sample data after a user exists.
INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo, last_message, last_message_at, user_unread)
SELECT
  u.id, d.id, FALSE, FALSE, FALSE,
  'I''m 2 minutes away, pulling up now 🚗',
  NOW(),
  2
FROM users u, drivers d
WHERE d.first_name = 'Kwame' AND d.last_name = 'Asante'
  AND NOT EXISTS (SELECT 1 FROM conversations c WHERE c.user_id = u.id AND c.driver_id = d.id);

INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo, last_message, last_message_at, user_unread)
SELECT
  u.id, NULL, TRUE, FALSE, FALSE,
  'Your refund has been processed. Allow 3–5 business days.',
  NOW() - INTERVAL '10 minutes',
  1
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM conversations c WHERE c.user_id = u.id AND c.is_support = TRUE);

INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo, last_message, last_message_at, user_unread)
SELECT
  u.id, NULL, FALSE, TRUE, FALSE,
  'Your last trip report has been reviewed and closed.',
  NOW() - INTERVAL '1 hour',
  0
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM conversations c WHERE c.user_id = u.id AND c.is_safety = TRUE);

INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo, last_message, last_message_at, user_unread)
SELECT
  u.id, d.id, FALSE, FALSE, FALSE,
  'Thanks for the 5-star rating! 🙏',
  NOW() - INTERVAL '1 day',
  0
FROM users u, drivers d
WHERE d.first_name = 'Kofi' AND d.last_name = 'Mensah'
  AND NOT EXISTS (SELECT 1 FROM conversations c WHERE c.user_id = u.id AND c.driver_id = d.id);

INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo, last_message, last_message_at, user_unread)
SELECT
  u.id, NULL, FALSE, FALSE, TRUE,
  'You''ve unlocked a new Gold tier reward 🥇',
  NOW() - INTERVAL '2 days',
  0
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM conversations c WHERE c.user_id = u.id AND c.is_promo = TRUE);

INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo, last_message, last_message_at, user_unread)
SELECT
  u.id, d.id, FALSE, FALSE, FALSE,
  'Have a great day! Come ride with me again soon.',
  NOW() - INTERVAL '3 days',
  0
FROM users u, drivers d
WHERE d.first_name = 'Ama' AND d.last_name = 'Boateng'
  AND NOT EXISTS (SELECT 1 FROM conversations c WHERE c.user_id = u.id AND c.driver_id = d.id);

-- Seed messages for the active conversation
INSERT INTO messages (conversation_id, sender_type, sender_name, text, created_at)
SELECT c.id, 'driver', 'Kwame', 'Good morning! I''m on my way to pick you up.', NOW() - INTERVAL '15 minutes'
FROM conversations c WHERE c.driver_id IS NOT NULL AND c.is_support = FALSE
  AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id);

INSERT INTO messages (conversation_id, sender_type, sender_name, text, created_at)
SELECT c.id, 'user', 'You', 'Great, I''m ready at the pickup spot.', NOW() - INTERVAL '10 minutes'
FROM conversations c WHERE c.driver_id IS NOT NULL AND c.is_support = FALSE
  AND (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) = 1;

INSERT INTO messages (conversation_id, sender_type, sender_name, text, created_at)
SELECT c.id, 'driver', 'Kwame', 'I''m 2 minutes away, pulling up now 🚗', NOW() - INTERVAL '2 minutes'
FROM conversations c WHERE c.driver_id IS NOT NULL AND c.is_support = FALSE
  AND (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) = 2;
