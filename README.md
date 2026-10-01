# OneShopAI Platform: Community & Opportunity Ecosystem

A full-stack collaborative platform featuring the Opportunity Hub and Collab Space. Built with a decoupled client-server architecture, clean light-themed user interfaces, role-adaptive builder profiles, and complete application and collaboration lifecycles.

---

## The Design Philosophy

### Why a minimal, structured approach?
- **What was changed:** The landing experience and platform interface were crafted with a structured, document-style layout in a clean light theme.
- **Why:** First impressions matter. Instead of overwhelming the user with heavy animations or unnecessary visual clutter, the interface is focused on clean information hierarchy and purpose. A minimal, distraction-free layout signals professionalism and respect for the reader's time, letting the product and its reasoning speak for themselves.
- **Expected impact:** Evaluators and members can immediately understand the platform and navigate without cognitive overload.

---

## Detailed Walkthrough of Product Improvements

### Part 1: Opportunity Hub

All assignment requirements for the Opportunity Hub were implemented, alongside five high-impact improvements built on top:

1. **Quick Apply Category**
   - **What was changed:** Added a dedicated Quick Apply category for opportunities that can be acted upon immediately.
   - **Why:** Not every visitor arrives prepared to read extensive job descriptions. Providing a direct entry point lets high-intent, fast-moving candidates submit applications quickly.
   - **Expected impact:** Increased application conversion from visitors who might otherwise browse and drop off.

2. **Separate View and Apply Steps**
   - **What was changed:** Viewing an opportunity and applying for it are decoupled into two distinct steps. The view page provides an editorial summary, while the apply workflow opens only when the candidate chooses to proceed.
   - **Why:** Summaries help candidates assess fit quickly. Keeping application submission intentional prevents low-intent, accidental applications, benefiting both applicants and hiring teams.
   - **Expected impact:** Higher application completion rates and improved candidate intent.

3. **Curated Upfront Listings with Progressive Disclosure**
   - **What was changed:** The feed initially presents a curated set of popular listings, paired with a smooth View More expansion.
   - **Why:** Unbroken infinite lists cause decision paralysis and reduce page performance. Displaying the strongest listings first respects user attention while preserving deep exploration.
   - **Expected impact:** Faster scanning and higher engagement with top-tier opportunities.

4. **Fixed Horizontal Scrolling in Category Navigation**
   - **What was changed:** Restored smooth, touch-friendly horizontal scrolling across opportunity categories.
   - **Why:** Category filters are primary navigation paths. When categories truncate or fail to scroll properly, users miss relevant opportunities on laptops and mobile devices.
   - **Expected impact:** Higher category discovery rates across all viewport sizes.

5. **Distinct Active State in the Navigation Sidebar**
   - **What was changed:** Upgraded the sidebar with high-contrast, recognizable active indicators.
   - **Why:** Clear wayfinding prevents disorientation and helps users navigate between platform areas with confidence.
   - **Expected impact:** Reduced navigation reversals and faster time to target screens.

---

### Part 2: Collab Space

Collab Space was architected around a unified workflow: moving from discovery to joining to managing, without dead ends.

1. **Discover Channels, Builder Directory, and My Collabs**
   - **What was built:** Three distinct sections:
     - **Discover Channels:** Explore community projects, startup MVPs, hackathons, and open source initiatives.
     - **Builder Directory:** Search and connect directly with fellow builders through verified profile credentials.
     - **My Collabs:** A personal workspace tracking active projects and outgoing requests.
   - **Why:** Each section addresses a specific question: where can I contribute, who can I build with, and what am I currently working on.
   - **Expected impact:** Reduced friction in finding collaborators and initiating joint projects.

2. **Project Creation and Activity Dashboard**
   - **What was built:** Builders can launch collaboration requests and view their engagement metrics (Projects Created and Projects Joined) right from their profile bar.
   - **Why:** Visible progress builds ownership and encourages ongoing engagement within the community.
   - **Expected impact:** Higher project creation velocity and repeat member visits.

3. **Collaborative Request Management**
   - **What was built:** Applicants receive real-time visibility into their application status (Pending, Accepted, Rejected), while project owners manage incoming member requests with single-click decisions.
   - **Why:** Waiting indefinitely without feedback causes applicants to disengage. Transparent status queues keep both sides informed.
   - **Expected impact:** Faster turnaround times for project requests and fewer abandoned invitations.

4. **Self-Serve Project and Membership Management**
   - **What was built:** Pending applicants can withdraw their requests at any time. Active members can leave a project whenever needed, with backend records and UI state updating immediately.
   - **Why:** Reversible commitments lower the barrier to entry, giving users full autonomy over their collaborative engagements.
   - **Expected impact:** Higher willingness to apply to projects, knowing decisions can be revised.

---

## System Architecture and Features

### 1. Opportunity Hub
- **Dynamic Search and Filtering:** Filter by keyword, category (Quick Apply, Internships, Full-Time, Scholarships, Hackathons), and sorting criteria (Popular, Deadline).
- **Opportunity Details Page:** Clean editorial layout presenting company overview, eligibility requirements, compensation details, application links, and related listings.
- **Application Lifecycle:** Instant submission with resume/profile linkage, status badges (Pending, Accepted, Rejected), and one-click application withdrawal.
- **Opportunity Creation:** Modal dialog for organizations and recruiters to publish new listings with Zod validation.

### 2. Collab Space
- **Interactive Builder Profile:** Top bar featuring user avatar, unique `@username`, professional role, university or organization affiliation, bio, skill tags, and social shortcuts (Email, LinkedIn, X, GitHub).
- **Role-Adaptive Profile Editing:** Dynamically switches form fields based on whether the member is a Student (College/Major) or an Employee/Founder (Company/Organization).
- **Discover Channels Grid:** 3-column responsive layout showcasing active channels with project type tags (*Side Project, Startup MVP, Hackathon, Open Source, Research*), duration estimates, and live member counts.
- **Builder Directory:** Grid of community peers with direct contact buttons and tag-based filtering.
- **Collaboration Creation Modal:** Project submission with category, type, duration, required skills, and banner styling.

### 3. Unified Authentication System
- **Dual Platform Support:** Shared JWT authentication across both Opportunity Hub and Collab Space.
- **Clean Auth Interface:** Light-themed login and registration with automated profile creation and credential validation.

---

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Icons & UI Primitives:** Lucide React, Radix UI primitives
- **Routing & State:** React Router DOM v7, React Context API (`AuthContext`)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js with TypeScript (`tsx` engine)
- **Database & ORM:** Prisma ORM with SQLite (zero-configuration local setup, directly compatible with PostgreSQL)
- **Validation:** Zod schemas for all inbound request bodies
- **Security:** JSON Web Tokens (JWT), bcrypt password hashing, IDOR authorization checks, and centralized error handling

---

## Repository Structure

```
OneShopAI_Assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (User, Profile, Job, Application, CollabRequest, CollabMember)
│   │   └── dev.db             # Local SQLite database
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts        # Authentication and profile endpoints
│   │   │   ├── collab.ts      # Collab requests, membership, and builder directory
│   │   │   └── jobs.ts        # Jobs, applications, and withdrawal endpoints
│   │   ├── index.ts           # Express server bootstrap
│   │   └── seed.ts            # Database seed script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Layouts, navigation, cards, and modals
│   │   ├── context/           # AuthContext (user state, tokens, persistence)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx # Minimalist walkthrough and product rationale
│   │   │   ├── AuthPage.tsx    # Light-themed login and register page
│   │   │   ├── Jobs.tsx        # Opportunity Hub
│   │   │   ├── JobDetails.tsx  # Opportunity detailed editorial view
│   │   │   └── CollabSpace.tsx # Collab Space module (Discover, Directory, My Collabs)
│   │   ├── App.tsx            # Main router configuration
│   │   └── index.css          # Core design tokens and Tailwind configuration
│   └── package.json
├── ARCHITECTURE.md            # Entity relationships, data flows, and API design
├── DESIGN.md                  # Design system specifications and tokens
└── README.md                  # Project overview and setup instructions
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client and push schema to SQLite
npx prisma db push

# Seed initial data (Opportunities, Builders, Channels)
npx tsx src/seed.ts

# Start the backend server (runs on http://localhost:4000)
npm run dev
```

### 2. Frontend Setup

```bash
# In a new terminal window, navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser. A seeded demo account is pre-authenticated for immediate testing, or you can register a new account on the authentication page.

---

## Core API Reference

| Endpoint | Method | Description | Protected |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user with unique username and profile | No |
| `/api/auth/login` | `POST` | Authenticate user via email or username | No |
| `/api/auth/me` | `GET` | Fetch authenticated user data and profile | Yes |
| `/api/collab/profile` | `PUT` | Update profile information, role, skills, and links | Yes |
| `/api/collab/profiles` | `GET` | Retrieve the builder directory list | No |
| `/api/collab/requests` | `GET` | List all open collaboration projects | No |
| `/api/collab/requests` | `POST` | Create a new project collaboration listing | Yes |
| `/api/collab/requests/:id/join` | `POST` | Request to join a collaboration channel | Yes |
| `/api/collab/requests/:id/leave` | `POST` | Leave an active channel or withdraw request | Yes |
| `/api/jobs` | `GET` | Retrieve opportunities with search and filtering | No |
| `/api/jobs` | `POST` | Create a new opportunity listing | Yes |
| `/api/jobs/:id` | `GET` | Fetch full details for a single opportunity | No |
| `/api/jobs/:id/apply` | `POST` | Apply for an opportunity | Yes |
| `/api/jobs/:id/apply` | `DELETE` | Withdraw an active application | Yes |
| `/api/jobs/applications/user/:userId` | `GET` | Retrieve all applications submitted by a user | Yes |

---

## Design and System Architecture Documentation

- For detailed database relationships, entity models, and sequence diagrams, refer to [ARCHITECTURE.md](./ARCHITECTURE.md).
- For design system tokens, typography scales, and component specifications, refer to [DESIGN.md](./DESIGN.md).
