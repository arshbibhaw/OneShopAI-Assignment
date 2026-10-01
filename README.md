# OneShopAI Platform — Community & Opportunity Ecosystem

A modern, full-stack collaborative platform powering the **OneShopAI Opportunity Hub** and **CollabSpace**. Built with a decoupled client-server architecture, responsive light-themed interfaces, role-adaptive builder profiles, and real-time application lifecycle management.

---

## 🚀 Key Features

### 1. 💼 Opportunity Hub
- **Dynamic Job Feed**: Search, filter by category (Internships, Full-Time, Scholarships, Hackathons), and sort by popularity or deadline.
- **Role-Based "For You" Personalization**: Smart feed tailoring opportunities based on the user's role (e.g., student-tailored internships & scholarships vs. professional full-time roles).
- **Application Status Lifecycle**:
  - Apply with profile & resume linkage.
  - Dynamic status badges: **Pending** (Blue), **Accepted** (Green with checkmark), and **Rejected** (Red).
  - **Application Withdrawal**: Instant self-serve withdrawal option with backend cleanup and optimistic UI updates.
- **Light Theme Opportunity Details View**: Apple-inspired clean editorial listing page featuring company overview, eligibility, compensation/scholarship perks, application requirements, related opportunities, and a sticky action sidebar.
- **Opportunity Posting**: Modal allowing organizations and recruiters to create new opportunities.

### 2. 🤝 CollabSpace
- **Builder Profile Bar**: Prominent top profile card displaying avatar, `@username`, current role, college or company organization, location, bio, skill tags, and brand-accurate social shortcuts.
- **Role-Adaptive Profile Editing**:
  - Unique username assignment with character validation (`[a-z0-9_]`).
  - Dynamic role selection (`student`, `employee`, `founder`) that conditionally toggles context fields (College for students, Company/Organization for employees and founders).
  - Social profiles integration with dedicated branding: Email (Red), LinkedIn (Blue), X (Black), and GitHub.
- **Discover Channels / Active Projects**:
  - 3-column responsive grid showcasing peer projects.
  - Project metadata tags: **Project Type** (*Side Project, Startup MVP, Hackathon, Open Source, Research*) and **Duration** (*1-2 weeks, 1 month, 3+ months, etc.*).
  - Progressive disclosure via dynamic **View More** button (displaying 6 cards initially, expanding to 9+).
- **Builder Directory**:
  - 3-column card grid of community builders.
  - Direct connection links with brand colors.
  - Initial 6-card display with expandable "View More" pagination.
- **Collaboration Posting**: Comprehensive modal to post project requests with categories, durations, types, required skills, and cover image.
- **My Collabs**: Dedicated tab to track joined projects and pending membership requests.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components & Icons**: Radix UI primitives, Lucide React icons
- **State & Routing**: React Context API (`AuthContext`), React Router DOM v7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript (`tsx` watch engine)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) with SQLite for effortless, zero-config local development (seamlessly migratable to PostgreSQL in production)
- **Authentication**: JWT token-based auth with bcrypt password hashing

---

## 📂 Repository Structure

```
OneShopAI_Assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (User, Profile, Job, Application, CollabRequest, CollabMember)
│   │   └── dev.db             # Local SQLite database
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts        # Auth & Profile endpoints
│   │   │   ├── collab.ts      # Collab requests & Builder directory
│   │   │   └── jobs.ts        # Jobs, applications & withdrawal endpoints
│   │   ├── index.ts           # Express server entry point
│   │   └── seed.ts            # Database seeder script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components & layouts (CommunityLayout, Navbar, Cards)
│   │   ├── context/           # AuthContext (user, token, session management)
│   │   ├── pages/
│   │   │   ├── CollabSpace.tsx # CollabSpace module with 3-col grids & Builder Profile
│   │   │   ├── Jobs.tsx       # Opportunity Hub with application statuses & withdrawal
│   │   │   └── JobDetails.tsx # Light-themed detailed listing view
│   │   ├── App.tsx            # Main router
│   │   └── index.css          # Design system CSS tokens & Tailwind v4 theme
│   └── package.json
├── ARCHITECTURE.md            # System architecture, ER diagrams, data flows
├── DESIGN.md                  # Comprehensive Design System specifications
└── README.md                  # Project documentation & run guide
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Push the Prisma schema to generate the local SQLite database
npx prisma db push

# Seed sample data (Opportunities, Builders, Collaboration Projects)
npx tsx src/seed.ts

# Start the development server (runs on http://localhost:4000)
npm run dev
```

### 2. Frontend Setup
```bash
# In a new terminal window, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser. The default demo user is pre-configured and logged in for immediate testing.

---

## 📡 Core API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user with email, password, name, and unique `@username` |
| `/api/auth/login` | `POST` | Authenticate user via email or username |
| `/api/auth/me` | `GET` | Fetch authenticated user data and profile |
| `/api/auth/profile` | `PUT` | Update profile (role, organization, skills, bio, social URLs) |
| `/api/jobs` | `GET` | Retrieve opportunities with search and category filters |
| `/api/jobs/:id` | `GET` | Retrieve full job listing details |
| `/api/jobs/:id/apply` | `POST` | Submit an application for an opportunity |
| `/api/jobs/:id/apply` | `DELETE` | Withdraw an application |
| `/api/jobs/applications/user/:userId` | `GET` | Fetch all applications submitted by a specific user |
| `/api/collab/requests` | `GET` | Fetch all open collaboration project requests |
| `/api/collab/requests` | `POST` | Create a new project collaboration request |
| `/api/collab/requests/:id/join` | `POST` | Submit a request to join a project |
| `/api/collab/builders` | `GET` | List all builder directory profiles |

---

## 📐 Design & System Architecture Documentation
- For detailed database relationships, entity models, and data flows, see [ARCHITECTURE.md](./ARCHITECTURE.md).
- For design tokens, color palettes, responsive scales, and typography specs, see [DESIGN.md](./DESIGN.md).
