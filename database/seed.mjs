import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=", 2).map((s) => s.trim().replace(/^["']|["']$/g, ""))),
);

const DATABASE_URL = envVars.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Realistic driver data spread around Accra, Ghana
const drivers = [
  {
    first_name: "Kwame",
    last_name: "Asante",
    profile_image_url: "https://randomuser.me/api/portraits/men/1.jpg",
    car_image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    car_seats: 4,
    rating: 4.8,
    vehicle_type: "Economy",
    current_latitude: 5.6037,
    current_longitude: -0.187,
    phone: "+233241234567",
    email: "kwame.asante@email.com",
  },
  {
    first_name: "Ama",
    last_name: "Boateng",
    profile_image_url: "https://randomuser.me/api/portraits/women/2.jpg",
    car_image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
    car_seats: 4,
    rating: 4.7,
    vehicle_type: "Economy",
    current_latitude: 5.61,
    current_longitude: -0.19,
    phone: "+233241234568",
    email: "ama.boateng@email.com",
  },
  {
    first_name: "Kofi",
    last_name: "Mensah",
    profile_image_url: "https://randomuser.me/api/portraits/men/3.jpg",
    car_image_url: "https://images.unsplash.com/photo-1542362567-b07e83758753?w=800",
    car_seats: 4,
    rating: 4.6,
    vehicle_type: "Comfort",
    current_latitude: 5.58,
    current_longitude: -0.18,
    phone: "+233241234569",
    email: "kofi.mensah@email.com",
  },
  {
    first_name: "Esi",
    last_name: "Owusu",
    profile_image_url: "https://randomuser.me/api/portraits/women/4.jpg",
    car_image_url: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800",
    car_seats: 4,
    rating: 4.5,
    vehicle_type: "Economy",
    current_latitude: 5.56,
    current_longitude: -0.2,
    phone: "+233241234570",
    email: "esi.owusu@email.com",
  },
  {
    first_name: "Yaw",
    last_name: "Adomako",
    profile_image_url: "https://randomuser.me/api/portraits/men/5.jpg",
    car_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    car_seats: 4,
    rating: 4.9,
    vehicle_type: "Premium",
    current_latitude: 5.62,
    current_longitude: -0.175,
    phone: "+233241234571",
    email: "yaw.adomako@email.com",
  },
  {
    first_name: "Abena",
    last_name: "Osei",
    profile_image_url: "https://randomuser.me/api/portraits/women/6.jpg",
    car_image_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    car_seats: 6,
    rating: 4.4,
    vehicle_type: "Van",
    current_latitude: 5.595,
    current_longitude: -0.195,
    phone: "+233241234572",
    email: "abena.osei@email.com",
  },
  {
    first_name: "Nana",
    last_name: "Agyeman",
    profile_image_url: "https://randomuser.me/api/portraits/men/7.jpg",
    car_image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0abb?w=800",
    car_seats: 2,
    rating: 4.8,
    vehicle_type: "Economy",
    current_latitude: 5.615,
    current_longitude: -0.17,
    phone: "+233241234573",
    email: "nana.agyeman@email.com",
  },
  {
    first_name: "Akua",
    last_name: "Mensah",
    profile_image_url: "https://randomuser.me/api/portraits/women/8.jpg",
    car_image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    car_seats: 4,
    rating: 4.3,
    vehicle_type: "Comfort",
    current_latitude: 5.57,
    current_longitude: -0.185,
    phone: "+233241234574",
    email: "akua.mensah@email.com",
  },
  {
    first_name: "Kojo",
    last_name: "Frimpong",
    profile_image_url: "https://randomuser.me/api/portraits/men/9.jpg",
    car_image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    car_seats: 4,
    rating: 4.7,
    vehicle_type: "Economy",
    current_latitude: 5.59,
    current_longitude: -0.21,
    phone: "+233241234575",
    email: "kojo.frimpong@email.com",
  },
  {
    first_name: "Adwoa",
    last_name: "Badu",
    profile_image_url: "https://randomuser.me/api/portraits/women/10.jpg",
    car_image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
    car_seats: 4,
    rating: 4.2,
    vehicle_type: "Economy",
    current_latitude: 5.605,
    current_longitude: -0.165,
    phone: "+233241234576",
    email: "adwoa.badu@email.com",
  },
  {
    first_name: "Kwesi",
    last_name: "Appiah",
    profile_image_url: "https://randomuser.me/api/portraits/men/11.jpg",
    car_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    car_seats: 5,
    rating: 4.6,
    vehicle_type: "Premium",
    current_latitude: 5.585,
    current_longitude: -0.195,
    phone: "+233241234577",
    email: "kwesi.appiah@email.com",
  },
  {
    first_name: "Afi",
    last_name: "Dzagah",
    profile_image_url: "https://randomuser.me/api/portraits/women/12.jpg",
    car_image_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    car_seats: 4,
    rating: 4.5,
    vehicle_type: "Comfort",
    current_latitude: 5.61,
    current_longitude: -0.155,
    phone: "+233241234578",
    email: "afi.dzagah@email.com",
  },
  // Kumasi Drivers (for testing in Ashanti Region)
  {
    first_name: "Francis",
    last_name: "Appiah",
    profile_image_url: "https://randomuser.me/api/portraits/men/13.jpg",
    car_image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    car_seats: 4,
    rating: 4.9,
    vehicle_type: "Economy",
    current_latitude: 6.6979,
    current_longitude: -1.6558, // Asuoyeboa
    phone: "+233241234579",
    email: "francis.appiah@email.com",
  },
  {
    first_name: "Gifty",
    last_name: "Boakye",
    profile_image_url: "https://randomuser.me/api/portraits/women/14.jpg",
    car_image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
    car_seats: 4,
    rating: 4.7,
    vehicle_type: "Comfort",
    current_latitude: 6.6885,
    current_longitude: -1.6244, // Central Kumasi
    phone: "+233241234580",
    email: "gifty.boakye@email.com",
  },
  {
    first_name: "Osei",
    last_name: "Tutu",
    profile_image_url: "https://randomuser.me/api/portraits/men/15.jpg",
    car_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    car_seats: 6,
    rating: 4.6,
    vehicle_type: "Premium",
    current_latitude: 6.69,
    current_longitude: -1.63, // Near KNUST
    phone: "+233241234581",
    email: "osei.tutu@email.com",
  },
];

async function seed() {
  console.log("Seeding drivers...\n");

  try {
    // Ensure the table exists with the full schema
    await sql`
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
    `;

    // Add missing columns if table already existed with old schema
    const alterStatements = [
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS current_latitude REAL`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS current_longitude REAL`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email TEXT DEFAULT ''`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS vehicle_type TEXT DEFAULT 'Economy'`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_number TEXT DEFAULT ''`,
      `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,
    ];
    for (const stmt of alterStatements) {
      try {
        await sql.query(stmt);
      } catch (e) {
        // Column may already exist
      }
    }
    console.log("  Table 'drivers' ready.\n");

    await sql`TRUNCATE drivers RESTART IDENTITY CASCADE`;

    for (const d of drivers) {
      await sql`
        INSERT INTO drivers (
          first_name, last_name, profile_image_url, car_image_url,
          car_seats, rating, vehicle_type,
          current_latitude, current_longitude,
          phone, email, is_available
        ) VALUES (
          ${d.first_name}, ${d.last_name}, ${d.profile_image_url}, ${d.car_image_url},
          ${d.car_seats}, ${d.rating}, ${d.vehicle_type},
          ${d.current_latitude}, ${d.current_longitude},
          ${d.phone}, ${d.email}, TRUE
        )
      `;
    }

    const result = await sql`SELECT count(*) FROM drivers`;
    const count = result[0]?.count ?? 0;
    console.log(`  Inserted ${count} drivers.\n`);

    const listing =
      await sql`SELECT id, first_name, last_name, rating, vehicle_type, car_seats, current_latitude, current_longitude FROM drivers ORDER BY id`;
    for (const d of listing) {
      console.log(
        `  ${d.id}. ${d.first_name} ${d.last_name} | ${d.vehicle_type} | ${d.car_seats} seats | rating: ${d.rating} | (${d.current_latitude}, ${d.current_longitude})`,
      );
    }
  } catch (e) {
    console.error("  ERROR:", e.message);
    process.exit(1);
  }

  console.log("\nDone.");
}

seed();
