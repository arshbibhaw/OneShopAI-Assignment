# OneShopAI Platform: Community & Opportunity Ecosystem

A full-stack collaborative platform built to connect talent with opportunities and foster community-driven projects. OneShopAI features a decoupled client-server architecture, modern light-themed user interfaces, role-adaptive builder profiles, and complete end-to-end lifecycles for job applications and team collaborations.

---

## The User Journey & Landing Experience

### 1. The Entry Point
When a user arrives at the platform, the primary goal is clarity. The landing experience is crafted as a structured, document-style layout that explains the platform's core value proposition immediately. Instead of overwhelming the visitor with heavy animations, the interface focuses on clean information hierarchy, signaling professionalism and respecting the user's time.

### 2. Authentication
To participate in the ecosystem, users proceed through a unified authentication gateway. The auth flow is minimalist, supporting both login and registration. Upon registration, a base profile is automatically generated, and the user receives a secure JWT token that manages their session across the entire platform.

### 3. The Portal: Choosing a Path
Once authenticated, the user reaches the main portal, which bifurcates the platform into two distinct hubs based on their current intent:
- **Opportunity Hub:** For candidates actively seeking internships, full-time roles, scholarships, or hackathons.
- **Collab Space:** For builders, founders, and students looking to network, launch side projects, or join open-source initiatives.

---

## Core Modules

### Part 1: Opportunity Hub

The Opportunity Hub is designed for fast, high-intent opportunity discovery and application management.

- **Quick Apply & Categorization:** Opportunities are categorized clearly (e.g., Quick Apply, Internships, Full-Time). "Quick Apply" targets high-intent users looking for immediate action.
- **Progressive Disclosure:** To prevent decision paralysis, the feed initially presents a curated set of top listings. Users can expand the list via a smooth "View More" interaction, preserving performance and attention.
- **Decoupled View & Apply:** Viewing an opportunity and applying are distinct steps. The detail page offers an editorial-style summary of the role, requirements, and compensation. The application workflow is intentional, reducing accidental submissions.
- **Application Lifecycle:** Users can track their applications (Pending, Accepted, Rejected) in real-time and have the autonomy to withdraw an application with a single click.

### Part 2: Collab Space

Collab Space is architected to seamlessly move users from discovery to active collaboration.

- **Discover Channels:** A marketplace for community projects, startup MVPs, and hackathons. Users can browse active initiatives and request to join them.
- **Builder Directory:** A searchable grid of community peers. Users can view verified profiles, skills, and affiliations to find the right co-founders or team members.
- **Role-Adaptive Profiles:** Builders can customize their profiles based on their current role (Student, Employee, or Founder). The interface dynamically adjusts required fields (e.g., University vs. Company) to capture relevant context.
- **My Collabs Dashboard:** A personalized workspace where users can track projects they have created and projects they have joined. Project owners can manage incoming requests, accepting or rejecting applicants with real-time UI updates.

---

## Technical Decisions

1. **Decoupled Architecture:** Separating the React frontend from the Express backend allows for independent scaling, deployment, and distinct technology choices (e.g., Vercel for static edge delivery and Render for Node.js API hosting).
2. **Stateless Authentication (JWT):** By using JSON Web Tokens instead of server-side sessions, the API remains stateless. This removes the need for database lookups on every request, significantly improving API latency and scalability.
3. **Database Portability:** Prisma ORM was selected because it allows seamless switching between a local SQLite database (for fast, zero-config development) and a production PostgreSQL database (Supabase) without changing a single line of business logic.
4. **Zod Validation & TypeScript:** Strict end-to-end type safety is maintained by using TypeScript interfaces on the frontend and Zod validation schemas on the backend. This prevents malformed data from reaching the database.
5. **UI/UX Simplicity:** Custom Tailwind CSS configuration was favored over heavy component libraries to maintain a lightweight bundle size and exact control over the platform's minimalist, light-themed aesthetic.

---

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Icons & UI Primitives:** Lucide React, Radix UI
- **Routing & State:** React Router DOM v7, React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js with TypeScript
- **Database & ORM:** Prisma ORM with PostgreSQL (Supabase) / SQLite (Local)
- **Validation:** Zod schemas for strict request validation
- **Security:** JSON Web Tokens (JWT) for stateless authentication, bcrypt for secure password hashing

---

## Repository Structure

```text
OneShopAI_Assignment/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema definitions
│   ├── src/
│   │   ├── routes/            # API Route handlers (auth, jobs, collab)
│   │   ├── index.ts           # Express application bootstrap
│   │   └── seed.ts            # Database seeding utility
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── config/            # Environment configurations (api.ts)
│   │   ├── context/           # AuthContext for global state
│   │   ├── pages/             # Route components (Auth, Jobs, CollabSpace)
│   │   ├── App.tsx            # Application router
│   │   └── index.css          # Tailwind and global styles
│   ├── vercel.json            # Vercel deployment configuration
│   └── package.json
├── ARCHITECTURE.md            # System architecture and deployment guide
└── README.md                  # Project documentation
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
# Push schema to local SQLite for development
npx prisma db push
# Seed the database with sample data
npx tsx src/seed.ts
# Start the backend server (runs on http://localhost:4000)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser to explore the platform.

---

## Core API Reference

| Endpoint | Method | Description | Protected |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user | No |
| `/api/auth/login` | `POST` | Authenticate user and receive JWT | No |
| `/api/auth/me` | `GET` | Fetch authenticated user data | Yes |
| `/api/collab/profile` | `PUT` | Update user profile and skills | Yes |
| `/api/collab/profiles` | `GET` | Retrieve the builder directory | No |
| `/api/collab/requests` | `GET` | List all collaboration projects | No |
| `/api/collab/requests` | `POST` | Create a new project | Yes |
| `/api/collab/requests/:id/join` | `POST` | Request to join a project | Yes |
| `/api/jobs` | `GET` | Retrieve opportunities | No |
| `/api/jobs` | `POST` | Create a new opportunity | Yes |
| `/api/jobs/:id/apply` | `POST` | Apply for an opportunity | Yes |
| `/api/jobs/applications/user/:id`| `GET` | Get user's applications | Yes |

For architectural details and deployment strategies, refer to [ARCHITECTURE.md](./ARCHITECTURE.md).
