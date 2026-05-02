# UniConnect

> **Connect, Learn & Grow with fellow students on campus.**

UniConnect is a university-specific peer networking platform where students share skills, get quick help, find study partners, and build their campus network.

![UniConnect Dashboard](https://via.placeholder.com/800x450/0a1830/00ccc4?text=UniConnect+Dashboard)

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Email/password & Google OAuth sign-in |
| **Student Profiles** | Skills, bio, availability, photo upload |
| **Discover** | Browse & filter students by major, year, skills |
| **Help Board** | Q&A with upvotes, replies, tags & resolution |
| **Events** | Create/RSVP study groups, workshops, hackathons |
| **Mentorship** | Seniors offer slots; students book them |
| **Messaging** | Real-time 1:1 chat via Firestore listeners |
| **Notifications** | Bell icon for connections, replies, bookings |
| **Leaderboard** | Top helpers ranked by upvotes + badges |
| **Success Stories** | Community wins wall with likes |
| **Dark / Light mode** | Persisted in localStorage |

---

## Tech Stack

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-10-ffca28?logo=firebase&logoColor=black&style=flat-square)
![React Router](https://img.shields.io/badge/React_Router-6-ca4245?logo=reactrouter&logoColor=white&style=flat-square)

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS v3 (custom deep navy + electric teal palette)
- **Fonts**: DM Sans (display) + Inter (body) via Google Fonts
- **Auth**: Firebase Authentication (Email + Google OAuth)
- **Database**: Cloud Firestore (real-time listeners)
- **Storage**: Firebase Storage (profile photos)
- **State**: React Context API (Auth + Theme)
- **Notifications**: react-hot-toast
- **Icons**: lucide-react

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/uniconnect.git
cd uniconnect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your Firebase project values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Firebase Setup Guide

### Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `uniconnect`)
3. Enable Google Analytics (optional)

### Step 2 — Enable Authentication

1. Go to **Authentication → Get started**
2. Enable **Email/Password** provider
3. Enable **Google** provider (add your support email)

### Step 3 — Create Firestore Database

1. Go to **Firestore Database → Create database**
2. Choose **Start in production mode** (rules are in `firestore.rules`)
3. Select your nearest region
4. Deploy rules: `firebase deploy --only firestore:rules`

### Step 4 — Enable Storage

1. Go to **Storage → Get started**
2. Accept the default rules (you'll update them)

### Step 5 — Register your web app

1. Go to **Project Settings → Add app → Web**
2. Register the app and copy the config values to your `.env`

### Step 6 — Deploy Firestore indexes

```bash
firebase deploy --only firestore:indexes
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain (project.firebaseapp.com) |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID |

> **Never commit your `.env` file** — it's in `.gitignore` already.

---

## Populate Demo Data

After signing in, click **"Seed Database"** on the Home dashboard to load sample students, posts, events, and stories. Or run the `seedDatabase()` function from `src/utils/seedData.js`.

---

## Build & Deploy

```bash
# Production build
npm run build

# Preview the build locally
npm run preview

# Deploy to Firebase Hosting
firebase deploy
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/         Navbar, Footer
│   ├── ui/             Button, Card, Badge, Modal, Input, Avatar, SkeletonLoader
│   ├── profile/        ProfileCard, EditProfileForm, SkillTag
│   ├── helpboard/      HelpPost, ReplyForm, UpvoteButton
│   ├── events/         EventCard, CreateEventForm
│   ├── mentorship/     MentorCard, SlotForm
│   ├── messages/       ConversationList, ChatWindow, MessageBubble
│   └── notifications/  NotificationBell, NotificationItem
├── pages/              All 12 page components
├── context/            AuthContext, ThemeContext
├── hooks/              useAuth, useFirestore, useRealtime
├── firebase/           config, auth, firestore, storage
└── utils/              helpers, constants, seedData
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow conventional commits and keep PRs focused.

---

## License

[MIT](LICENSE) © 2025 UniConnect
