# 🥗 Culinary Vitality

**Culinary Vitality** is a cross-platform smart-kitchen app built with **Tauri 2**, **React 19** and **TypeScript**. Tell it what's in your fridge and it suggests recipes, plans your week, builds your shopping list and lets you cook step by step, with friends, achievements and rewards on top.

It runs as a native desktop app (Windows / macOS / Linux) and on mobile (Android / iOS), with **Supabase** handling authentication, profiles and social features.

---

## ✨ Features

- **📚 Recipe Dashboard**: Browse a built-in recipe library with search plus diet and difficulty filters. Each recipe shows prep time, calories and macros (protein, carbs, fat).
- **🧊 Fridge Scanner**: Add the ingredients you have and get a generated recipe or the best matching ones, with full steps and nutrition info.
- **👨‍🍳 Cooking Mode**: Step-by-step guided cooking with a built-in countdown timer.
- **📅 Weekly Meal Planner**: Schedule breakfast, lunch and dinner for each day of the week.
- **🛒 Smart Shopping List**: Built automatically from your meal plan, listing only the ingredients your fridge is missing. Items you check off can go straight into your fridge.
- **⭐ Favorites**: Save the recipes you love.
- **👤 Profiles**: Display name, bio, avatar upload (Supabase Storage) and cooking statistics.
- **🏆 Achievements & Shop**: Earn coins by cooking, unlock achievements, and spend coins on profile badges and avatar borders.
- **🤝 Friends & Notifications**: Search for users, send and accept friend requests, and get notified in real time.
- **🌍 Multilingual**: English, Romanian, Russian, German and Spanish, including ingredient name translations.
- **🌗 Light / Dark Theme**: Plus a responsive layout with a sidebar on desktop and a bottom navigation bar on mobile.

---

## 🛠️ Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 7, lucide-react   |
| Native app | Tauri 2 (Rust), desktop + Android / iOS      |
| Backend    | Supabase (Auth, Postgres with RLS, Storage)  |
| CI/CD      | GitHub Actions (Android APK and iOS project) |

---

## 📁 Project Structure

```
culinary-vitality/
├── public/food/           # Recipe images
├── src/
│   ├── App.tsx            # Main application (views, state, logic)
│   ├── App.css            # Styles (themes, responsive layout)
│   ├── AuthPage.tsx       # Sign-in / sign-up screen
│   ├── recipesData.ts     # Recipe database and ingredient translations
│   ├── translations.ts    # UI strings for all supported languages
│   └── supabaseClient.ts  # Supabase client and DB types
├── src-tauri/             # Tauri (Rust) app, config, icons, Android project
├── supabase_schema.sql    # Database schema, RLS policies and triggers
└── .github/workflows/     # Mobile build pipeline
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- The [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS
- *(Mobile only)* Android Studio + NDK, or Xcode for iOS

### Installation

```bash
git clone https://github.com/WhiteDragonul/culinary-vitality.git
cd culinary-vitality
npm install
```

### Run

```bash
# Web version in the browser (http://localhost:1420)
npm run dev

# Native desktop app
npm run tauri dev

# Android (device or emulator)
npm run tauri android dev
```

### Build

```bash
# Desktop installers
npm run tauri build

# Android APK
npm run tauri android build
```

---

## 🗄️ Supabase Setup

To use your own Supabase project:

1. Create a project on [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase_schema.sql`](supabase_schema.sql). It creates the `profiles`, `friend_requests` and `notifications` tables, Row Level Security policies, and a trigger that sends a notification for each new friend request.
3. In **Storage**, create a **public** bucket named `avatars` for profile pictures.
4. Put your project URL and publishable (anon) key in [`src/supabaseClient.ts`](src/supabaseClient.ts).

---

## 📱 Mobile Builds (CI)

The [`Build Mobile App`](.github/workflows/build-mobile.yml) workflow runs on every push to `main` / `master`, and you can also start it manually. It produces:

- **Android**: a debug APK (`CulinaryVitality-Android-APK` artifact)
- **iOS**: a generated Xcode project archive (`CulinaryVitality-iOS-XcodeProject` artifact) for signing and building on a Mac

Download them from the **Actions** tab of the repository.

---

## 📄 License

This project currently has no license. All rights are reserved by the author.
