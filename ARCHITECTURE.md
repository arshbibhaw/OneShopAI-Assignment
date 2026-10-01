# System Architecture & Technical Specifications

This document details the high-level architecture, database entity relationships, operational data flows, and module design for the **OneShopAI Opportunity Hub** and **CollabSpace**.

---

## 1. High-Level System Architecture

OneShopAI follows a decoupled client-server architecture with a clean separation of concerns across presentation, business logic, persistence, and external services.

```mermaid
graph TD
    subgraph Client [Client Presentation Layer]
        ReactApp[React 19 + Vite SPA]
        Router[React Router DOM]
        AuthCtx[Auth Context Provider]
        UIComp[Tailwind CSS v4 + Radix UI]
        ReactApp --> Router
        ReactApp --> AuthCtx
        ReactApp --> UIComp
    end

    subgraph Gateway [Network & API Boundary]
        REST[Express REST API - Port 4000]
        CORS[CORS & Body Parser Middleware]
        AuthGuard[JWT Auth & Validation Middleware]
        REST --> CORS
        REST --> AuthGuard
    end

    subgraph Services [Application Business Logic]
        AuthService[Auth & Profile Controller]
        JobService[Jobs & Applications Controller]
        CollabService[Collab & Builder Directory Controller]
        AuthGuard --> AuthService
        REST --> JobService
        REST --> CollabService
    end

    subgraph DataLayer [Data Persistence & ORM]
        Prisma[Prisma ORM Client]
        SQLite[(Local SQLite - dev.db)]
        Postgres[(Production PostgreSQL - Supabase/Render)]
        
        AuthService --> Prisma
        JobService --> Prisma
        CollabService --> Prisma
        
        Prisma -. Development .-> SQLite
        Prisma -. Production .-> Postgres
    end

    Client -- HTTP / JSON Requests --> REST
```

---

## 2. Database Entity-Relationship (ER) Diagram

The system's data model captures builders, their career profiles, job listings, application status lifecycles, and collaborative open-source projects.

```mermaid
erDiagram
    USER ||--o| PROFILE : "owns (1:1)"
    USER ||--o{ APPLICATION : "submits (1:N)"
    USER ||--o{ COLLAB_REQUEST : "creates (1:N)"
    USER ||--o{ COLLAB_MEMBER : "participates in (1:N)"
    
    JOB ||--o{ APPLICATION : "receives (1:N)"
    COLLAB_REQUEST ||--o{ COLLAB_MEMBER : "enlists (1:N)"

    USER {
        String id PK "UUID"
        String email UK "Unique email address"
        String username UK "Unique alphanumeric handle"
        String password "Hashed credential"
        String name "Full display name"
        String avatar "Image URL"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    PROFILE {
        String id PK "UUID"
        String userId FK "1:1 reference to User"
        String bio "Short professional biography"
        String skills "Comma-separated skill tags"
        String portfolio "Personal portfolio URL"
        String linkedinUrl "LinkedIn profile URL"
        String githubUrl "GitHub handle/URL"
        String location "Geographical base"
        String currentRole "student | employee | founder"
        String organization "College name or Company/Org"
    }

    JOB {
        String id PK "UUID"
        String title "Opportunity headline"
        String organization "Sponsor or hiring company"
        String description "Detailed overview"
        String requirements "Comma-separated requirements"
        String location "Work location or Remote"
        String compensation "Stipend, salary, or scholarship value"
        String type "Full-Time | Internship | Scholarship | Hackathon"
        String status "open | closed"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    APPLICATION {
        String id PK "UUID"
        String jobId FK "Target Job reference"
        String userId FK "Applicant User reference"
        String status "pending | accepted | rejected"
        String resumeLink "Uploaded resume URL"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    COLLAB_REQUEST {
        String id PK "UUID"
        String creatorId FK "Reference to owner User"
        String title "Project title"
        String description "Project scope and mission"
        String requiredSkills "Comma-separated needed skills"
        String category "Domain tag (AI, Web3, FinTech, etc.)"
        String coverImage "Banner image URL"
        String projectType "Side Project | Startup MVP | Hackathon | Open Source | Research"
        String duration "1-2 weeks | 1 month | 3+ months | Unspecified"
        String status "open | in-progress | completed"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    COLLAB_MEMBER {
        String id PK "UUID"
        String collabRequestId FK "Target CollabRequest"
        String userId FK "Member User reference"
        String status "pending | accepted | rejected"
        DateTime joinedAt "Timestamp"
    }
```

---

## 3. Operational Data Flows

### 3.1 Opportunity Application & Withdrawal Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Applicant
    participant UI as Opportunity Hub (Jobs.tsx)
    participant API as Express API (/api/jobs)
    participant DB as Database (Prisma)

    Note over User, UI: Applying to an Opportunity
    User->>UI: Clicks "Apply" on Job Card
    UI->>API: POST /api/jobs/:id/apply { userId, resumeLink }
    API->>DB: Check existing application for (jobId, userId)
    alt Already Applied
        API-->>UI: 400 Bad Request ("Already applied")
    else Fresh Application
        API->>DB: prisma.application.create({ status: 'pending' })
        API-->>UI: 201 Created { id, status: 'pending' }
        UI->>UI: Updates local applications state (Status badge: Pending)
    end

    Note over User, UI: Withdrawing an Application
    User->>UI: Clicks "Withdraw" under Applied badge
    UI->>UI: Confirms via dialog
    UI->>API: DELETE /api/jobs/:id/apply { userId }
    API->>DB: prisma.application.delete({ where: { id } })
    API-->>UI: 200 OK { success: true }
    UI->>UI: Clears status from state (Reverts card to "Apply" state)
```

### 3.2 Role-Adaptive Profile Customization Flow

```mermaid
sequenceDiagram
    autonumber
    actor Builder as User / Builder
    participant Modal as Edit Profile Modal
    participant Ctx as AuthContext
    participant API as Express API (/api/auth)
    participant DB as Database (Prisma)

    Builder->>Modal: Selects Role (e.g., 'Student' or 'Employee')
    alt Role is 'Student'
        Modal->>Modal: Renders "College / University" field
    else Role is 'Employee' or 'Founder'
        Modal->>Modal: Renders "Company / Organization" field
    end
    Builder->>Modal: Enters username, bio, skills, socials and clicks "Save"
    Modal->>API: PUT /api/auth/profile { username, currentRole, organization, ... }
    API->>DB: Validate username uniqueness
    API->>DB: prisma.user.update & prisma.profile.upsert
    API-->>Modal: 200 OK { updated user & profile }
    Modal->>Ctx: setUser(updatedUser)
    Ctx->>Ctx: Syncs to localStorage & updates Builder Profile Banner
```

---

## 4. Frontend Component & Layout Architecture

### 4.1 Responsive 3-Column Grid System (CollabSpace)
Both **Discover Channels** and the **Builder Directory** utilize an adaptive CSS grid layout:
- **Mobile (`< sm`)**: 1 column (`grid-cols-1`)
- **Tablet (`sm - lg`)**: 2 columns (`sm:grid-cols-2`)
- **Desktop (`lg+`)**: 3 columns (`lg:grid-cols-3`)

### 4.2 Progressive Disclosure ("View More") Pattern
To prevent visual clutter on initial page load:
1. Lists initialize with a visual limit of **6 cards**.
2. A **View More / View Less** controller dynamically expands the dataset (e.g. rendering 9+ total seeded cards).
3. Smooth transition state avoids layout thrashing.

### 4.3 Opportunity Hub Light Theme Hierarchy
The `JobDetails.tsx` view implements a dedicated light theme system:
- **Surface Elevation**: White cards (`bg-white`) bordered with slate hairline accents (`border-slate-200`) and soft shadows (`shadow-sm`).
- **Contrast Typography**: Deep slate headers (`text-slate-900`) and readable neutral body copy (`text-slate-600`).
- **Sidebar Grid**: 2-column asymmetric desktop layout (`flex-1` main content, `w-[320px]` sticky aside action panel).

---

## 5. Deployment Topology

| Layer | Recommended Hosting | Description |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) / [Netlify](https://www.netlify.com/) | Static Vite build deployed to global CDN edge with HTTP/2 and asset compression. |
| **Backend API** | [Render](https://render.com/) / [Railway](https://railway.app/) | Node.js Express service running behind a reverse proxy with TLS termination. |
| **Database** | [Supabase](https://supabase.com/) / [Neon](https://neon.tech/) | Managed PostgreSQL instance with automated backups and connection pooling. |
| **Media Assets** | [Cloudinary](https://cloudinary.com/) / [AWS S3](https://aws.amazon.com/s3/) | Scaled storage for builder avatars and project cover images. |
