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
