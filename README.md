<div align="center">

# ⚡ Celer

### Fast. Safe. Ghanaian.

A modern ride-hailing mobile app built for Ghana

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Neon](https://img.shields.io/badge/Neon_DB-00E599?style=for-the-badge&logo=postgresql&logoColor=black)

> 🚧 **This project is actively under development.** Features and the tech stack may evolve as the project grows.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication (Clerk)](#authentication-clerk)
- [Database (Neon DB)](#database-neon-db)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Celer** is a ride-hailing mobile application designed specifically for the Ghanaian market. Built with React Native and Expo, Celer connects riders and drivers across Ghana with a seamless, fast, and reliable booking experience.

The app prioritizes a smooth onboarding flow, secure social authentication, and a real-time experience tailored to local needs — including support for mobile money payments (coming soon) and Ghana-specific location services.

| | |
|---|---|
| **Platform** | iOS & Android (React Native + Expo) |
| **Market** | Ghana 🇬🇭 |
| **Status** | 🚧 Active Development |
| **Auth** | Clerk (Google, Facebook, Apple OAuth) |
| **Database** | Neon DB (Serverless PostgreSQL) |
| **Language** | TypeScript |

---

## Features

### ✅ Current Features

- Social authentication via Google, Facebook, and Apple (Clerk)
- Secure user session management and token handling
- Rider and driver account creation with profile setup
- Serverless PostgreSQL database via Neon DB
- Expo Router-based navigation with protected routes
- Clean, modern onboarding, sign-in, and sign-up screens
- **Dark mode** — Light, Dark, and System appearance modes with persistent theme switching
- **Accessibility** — WCAG-compliant labels, hints, roles, and states on all interactive elements
- **Payment options** — Paystack online payments and in-person cash payment selection
- **In-app chat** — Conversation list with search, filtering, pinned messages, and unread badges
- **Ride history** — Past rides with status filtering and spend tracking
- **Profile & settings** — Avatar-based profile with stats, edit profile, safety settings, legal & privacy controls

### 📋 Upcoming Features

- Real-time ride booking and driver matching
- Live GPS tracking for active rides
- Mobile Money integration (MTN MoMo, Vodafone Cash, AirtelTigo)
- Driver earnings dashboard
- Rating and review system
- Push notifications for ride status updates
- Admin dashboard for fleet and user management

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | React Native | Cross-platform mobile app development |
| Framework | Expo (SDK 52+) | Developer tooling, build system & OTA updates |
| Language | TypeScript | Type-safe JavaScript throughout the codebase |
| Navigation | Expo Router | File-system based routing for React Native |
| Authentication | Clerk | Social OAuth, session management, user accounts |
| Database | Neon DB | Serverless PostgreSQL — scalable & cost-efficient |
| DB Client | @neondatabase/serverless | HTTP-based Postgres driver compatible with React Native |
| Styling | NativeWind v4 | Tailwind-style utilities with `dark:` variant theming |
| State | React Context + Hooks | Local and global state management |
| Payments | Paystack | Online payment processing via Paystack API |
| More to come | TBD | Tech stack will expand as features are added |

---

## Project Structure

```
celer/
├── app/                        # Expo Router screens & layouts
│   ├── (api)/                  # API route handlers
│   │   ├── ride+api.ts
│   │   ├── user+api.ts
│   │   ├── driver+api.ts
│   │   └── paystack+api.ts
│   ├── (auth)/                 # Auth group (sign-in, sign-up, OAuth)
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── welcome.tsx
│   ├── (root)/                 # Protected app screens
│   │   ├── (tabs)/             # Bottom tab screens
│   │   │   ├── home.tsx
│   │   │   ├── rides.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── profile.tsx
│   │   │   └── _layout.tsx
│   │   ├── appearance.tsx      # Theme settings (Light/Dark/System)
│   │   ├── edit-profile.tsx
│   │   ├── help.tsx
│   │   ├── legal.tsx
│   │   ├── payment.tsx
│   │   ├── promotions.tsx
│   │   ├── ride-history.tsx
│   │   ├── safety.tsx
│   │   └── _layout.tsx
│   ├── _layout.tsx             # Root layout with Clerk + Theme providers
│   ├── global.css              # Tailwind / NativeWind global styles
│   └── +not-found.tsx
├── components/                 # Reusable UI components
│   ├── customButton.tsx
│   ├── DriverCard.tsx
│   ├── GoogleInput.tsx
│   ├── inputField.tsx
│   ├── Map.tsx
│   └── oAuth.tsx
├── lib/                        # Utilities, hooks, helpers
│   ├── accessibility.ts        # WCAG a11y factory helpers
│   ├── ThemeContext.tsx         # Light/Dark/System theme provider
│   ├── fetch.ts                # Fetch API wrapper & useFetch hook
│   └── db.ts                   # Neon DB client (deprecated — use API routes)
├── constants/                  # App-wide constants & theme
│   ├── index.ts
│   ├── colors.ts               # Color tokens for imperative use
│   ├── icons.ts
│   └── images.ts
├── assets/                     # Images, fonts, icons
├── .env                        # Environment variables (not committed)
├── tailwind.config.js          # NativeWind config with custom dark tokens
├── app.config.js               # Expo config
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI — `npm install -g expo-cli`
- A [Clerk](https://clerk.com) account
- A [Neon DB](https://neon.tech) account
- [Expo Go](https://expo.dev/go) on your phone — or an iOS/Android simulator

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/celer.git
   cd celer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Clerk and Neon DB keys (see [Environment Variables](#environment-variables) below).

4. **Start the development server**

   ```bash
   npx expo start
   ```

   Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android.

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file to version control.**

```env
# ── Clerk Authentication ─────────────────────────────────────
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
# Match this with your Clerk Email verification setting: email_code or email_link
EXPO_PUBLIC_CLERK_EMAIL_VERIFICATION_STRATEGY=email_code

# ── Neon Database ────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
```

Expose them in `app.config.js`:

```js
export default {
  expo: {
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      databaseUrl: process.env.DATABASE_URL,
    },
  },
};
```

---

## Authentication (Clerk)

Celer uses [Clerk](https://clerk.com) for authentication, supporting Google, Facebook, and Apple OAuth flows. Clerk handles session tokens, user management, and secure credential storage out of the box.

### Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Enable **Google**, **Facebook**, and **Apple** as social providers in the Clerk dashboard
3. Copy your Publishable Key into `.env`
4. Set your OAuth redirect URL:
   - Development: `exp://your-ip:8081`
   - Production: your custom URI scheme
5. Ensure your local `EXPO_PUBLIC_CLERK_EMAIL_VERIFICATION_STRATEGY` matches the verification strategy configured in your Clerk dashboard, or sign-up will fail with `strategy_for_user_invalid`.

### Username Handling

Clerk may require a `username` field depending on your dashboard configuration. If username collection is enabled but not shown on the sign-up screen, auto-generate it in code and call `attemptMissingRequirements()` to complete sign-up. This is already handled in the current codebase.

---

## Database (Neon DB)

Celer uses [Neon DB](https://neon.tech) — a serverless PostgreSQL service — for its backend data layer. The `@neondatabase/serverless` package connects over HTTP, making it fully compatible with React Native without requiring any native modules.

### Database Client

```ts
// lib/db.ts
import { neon } from "@neondatabase/serverless";
import Constants from "expo-constants";

const sql = neon(Constants.expoConfig?.extra?.databaseUrl!);

export default sql;
```

### Usage

```ts
import sql from "@/lib/db";

// Parameterized query (safe from SQL injection)
const user = await sql`SELECT * FROM users WHERE id = ${userId}`;

// Insert
await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
```

### Metro Bundler Fix

If Metro throws errors about missing Node modules, add this to `metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

### ⚠️ Security Note

Direct database queries from the client are fine for development and prototyping. For production, route all database access through a secure backend API (e.g. Express, Hono, or serverless functions) that validates the Clerk session token before executing queries.

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ Done | Social OAuth (Google, Facebook, Apple) via Clerk |
| ✅ Done | Neon DB integration & API route handlers |
| ✅ Done | Expo Router navigation with protected routes |
| ✅ Done | Dark mode (Light / Dark / System) with persistent theme |
| ✅ Done | WCAG accessibility labels, hints, roles, and states |
| ✅ Done | Payment page with Paystack and Cash options |
| ✅ Done | In-app chat with search, filtering, pinned messages |
| ✅ Done | Ride history with status filtering and spend tracking |
| ✅ Done | Profile, edit profile, safety, legal & privacy screens |
| ✅ Done | Appearance settings page (Light / Dark / System) |
| 🔄 In Progress | Ride booking UI and core booking flow |
| 📋 Planned | Real-time ride tracking with maps |
| 📋 Planned | Mobile Money payments (MTN MoMo, Vodafone, AirtelTigo) |
| 📋 Planned | Push notifications (Expo Notifications) |
| 📋 Planned | Admin dashboard |

---

## Contributing

Contributions are welcome! Here's how to get involved:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature-name`
3. Commit your changes with a clear message
4. Open a pull request against the `main` branch

Please make sure your code follows the existing TypeScript conventions and that the Expo build runs cleanly before submitting a PR.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ for Ghana &nbsp;•&nbsp; ⚡ Celer — Move Fast.

</div>
