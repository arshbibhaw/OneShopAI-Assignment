# OneShopAI Design System Specification (`DESIGN.md`)

This document provides a comprehensive, production-grade specification of the design system powering **OneShopAI** (`https://oneshopai.com`), the **OneShopAI Community Platform**, the **Opportunity Hub**, and **CollabSpace**.

The design language balances high-performance utility (Tailwind CSS v4 engine + Radix/CVA architecture) with an Apple-inspired editorial aesthetic: crisp typography (`Plus Jakarta Sans`, `DM Sans`, `Instrument Sans`), luminous brand gradients (`linear-gradient(135deg, #28A0F0, #3C3CF0, #8C28F0)`), micro-spring transitions, and consistent light-themed surfaces.

---

## 1. Color Tokens & Theme Palettes

The OneShopAI ecosystem utilizes an adaptive multi-tier token hierarchy:
1. **Brand & Semantic Palettes** (CSS Custom Properties & Hex)
2. **Opportunity Hub Light Theme Tokens** (Editorial White surfaces, Slate typography, Status badges)
3. **CollabSpace Brand & Social Tokens** (Brand-accurate third-party colors: Email, LinkedIn, X, GitHub)
4. **Community Platform HSL Tokens** (Tailwind v4 theme variables)

### 1.1 Core Brand & Semantic Status Tokens

| Token Name | CSS Variable / Utility | Hex Code | HSL Equivalent | Purpose / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary (Cobalt)** | `--color-primary` / `bg-primary` | `#2878F0` / `#1A5CD4` | `hsl(216 88% 55%)` | Primary brand cobalt blue, main CTAs, active highlights |
| **Brand Blue Hover** | `--color-primary-hover` | `#5A9EF7` | `hsl(214 90% 66%)` | CTA hover state, interactive links |
| **Brand Accent (Violet)** | `--accent` / `bg-accent` | `#7828F0` | `hsl(264 87% 55%)` | Opportunity tags, category chips, gradient transitions |
| **Opportunity Tag BG** | `bg-[#F3E8FF]` | `#F3E8FF` | `hsl(270 100% 95%)` | Soft purple background for scholarship/internship pill tags |
| **Success** | `--success` | `#16CA76` / `#14B86B` | `hsl(152 80% 44%)` | Positive confirmation, accepted status |
| **Warning / Deadline** | `--warning` | `#D97706` / `#F59F0A` | `hsl(38 92% 55%)` | "15 days left", deadline warnings, urgent notices |
| **Error / Destructive** | `--destructive` | `#DC2828` / `#EF4444` | `hsl(0 72% 51%)` | Rejection badge, withdrawal hover, error alerts |
| **Muted Surface** | `bg-slate-50` / `bg-slate-100` | `#F8FAFC` / `#F1F5F9` | `hsl(210 40% 96%)` | Outer page background, input fields, avatar backing |
| **Hairline Border** | `border-slate-200` | `#E2E8F0` | `hsl(214 32% 91%)` | Structural card borders, dividers, subtle separators |

---

### 1.2 Opportunity Hub: Application Status & Lifecycle Colors

Opportunity status indicators are designed for instant visual cognition:

| Application Status | UI Badge Styling | Text Color | Visual Indicator | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Pending** | `bg-blue-100 text-blue-700` | `#1D4ED8` | Dot or text "Pending" | Default state upon applying; awaiting recruiter review |
| **Accepted** | `bg-green-100 text-green-700` | `#15803D` | `<Check size={14} /> Accepted` | Approved application or interview invitation |
| **Rejected** | `bg-red-100 text-red-700` | `#B91C1C` | Text "Rejected" | Application not selected |
| **Withdraw Action** | `text-slate-500 hover:text-red-500` | Transitions to `#EF4444` | Secondary text button | Self-serve application retraction trigger |

---

### 1.3 CollabSpace: Builder Profile & Social Token Matrix

To maintain authentic identity recognition across the **Builder Directory** and **Builder Profile Banner**, social icons are explicitly styled with official brand hex values:

| Network / Action | Icon Color Utility | Hex Code | Visual Styling |
| :--- | :--- | :--- | :--- |
| **Email** | `text-[#EF4444]` | `#EF4444` | Vibrant Red envelope icon |
| **LinkedIn** | `text-[#0A66C2]` | `#0A66C2` | Official LinkedIn Cobalt Blue |
| **X (Twitter)** | `text-[#000000]` | `#000000` | Solid Jet Black logo mark |
| **GitHub** | `text-[#334155]` | `#334155` | Slate Grey open-source mark |
| **Portfolio / Web** | `text-[#7828F0]` | `#7828F0` | OneShopAI Violet accent globe icon |

---

### 1.4 Light Theme Matrix for Opportunity Hub (`JobDetails.tsx`)

The detail view for opportunities features an editorial, high-clarity light theme:

| Element | Background | Border | Text Primary | Text Secondary |
| :--- | :--- | :--- | :--- | :--- |
| **Main Cards (About, Benefits, Requirements)** | `#FFFFFF` (`bg-white`) | `border-slate-200` (`#E2E8F0`) | `#0F172A` (`text-slate-900`) | `#475569` (`text-slate-600`) |
| **Action Sidebar Panel** | `#FFFFFF` (`bg-white`) | `border-slate-200` (`#E2E8F0`) | `#0F172A` (`text-slate-900`) | `#64748B` (`text-slate-500`) |
| **Header Banner Card** | Split Unsplash photo grid (`h-56`) | `border-slate-200` | `#0F172A` (`text-2xl font-extrabold`) | `#7828F0` (`text-[15px] font-semibold`) |
| **Organization Avatar** | `#047857` (`bg-emerald-700`) | `4px border-white` | `#FFFFFF` (`text-3xl font-bold`) | — |
| **Related Opportunity Tiles** | `#FFFFFF` (`bg-white`) | `border-slate-200 hover:border-slate-300` | `#0F172A` (`font-bold text-[15px]`) | `#64748B` (`text-[13px]`) |

---

## 2. Typography

The platform utilizes modern geometric sans-serif typefaces configured for high readability across dense data tables, cards, and editorial headers.

### 2.1 Font Families

```css
:root {
  --font-sans: "Instrument Sans", "Plus Jakarta Sans", "DM Sans", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-body: "DM Sans", "Plus Jakarta Sans", system-ui, sans-serif;
}
```

### 2.2 Typographic Hierarchy Scale

| Hierarchy | Font Size | Line Height | Letter Spacing | Font Weight | Context / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | `28px` / `1.75rem` | `1.20` | `-0.025em` | `700` (`font-bold`) | "Opportunity Hub", "CollabSpace" |
| **H2 (Card Section)** | `19px` / `1.187rem` | `1.30` | `-0.02em` | `700` (`font-bold`) | "About", "Benefits", "Eligibility & requirements" |
| **H3 (Listing Title)** | `17px` / `1.062rem` | `1.35` | `-0.015em` | `700` (`font-bold`) | Job card title, Project title |
| **Body (Regular)** | `15px` / `0.937rem` | `1.60` | `normal` | `400` / `500` | Descriptions, bulleted requirements, bio texts |
| **Metadata / Subtitle** | `13px` – `14px` | `1.40` | `normal` | `500` / `600` | Organization name, deadline tags, usernames |
| **Chip / Tag / Pill** | `11px` – `12px` | `1.20` | `0.02em` | `700` (`font-bold`) | Category badges ("🎓 Scholarship", "Side Project") |

---

## 3. Layout, Spacing, Radii & Grid System

### 3.1 3-Column Responsive Grid Architecture

CollabSpace's **Discover Channels** and **Builder Directory** use a standardized 3-column responsive grid:

```html
<!-- CollabSpace Standard Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Card Items -->
</div>
```

- **Mobile (`< 640px`)**: Single column (`grid-cols-1`) ensuring full-width touch readability.
- **Tablet (`640px – 1023px`)**: 2 columns (`sm:grid-cols-2`).
- **Desktop (`1024px+`)**: Balanced 3 columns (`lg:grid-cols-3`) utilizing screen real estate under the builder profile.

### 3.2 Border Radii Scale

```css
:root {
  --radius-badge: 9999px;   /* Pill tags, category chips, status pills */
  --radius-button: 9999px;  /* Main CTA buttons, View More buttons */
  --radius-input: 12px;     /* Form controls, search inputs, modal textareas */
  --radius-card: 20px;      /* Standard job cards, collab project tiles, profile cards */
  --radius-card-lg: 24px;   /* Modal dialog containers, large sheet headers */
}
```

### 3.3 Elevation & Shadows

```css
:root {
  /* Resting Cards */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  
  /* Hover Elevation (Transforms cards on hover: -translate-y-1) */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  
  /* Modal Overlays & Drawers */
  --shadow-modal: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

---

## 4. Component Inventory & Interactive Specs

### 4.1 Builder Profile Bar (CollabSpace)
- **Position**: Positioned above the primary filter tabs (Discover Channels, Builder Directory, My Collabs) to establish user presence.
- **Surface**: `bg-white border border-slate-200 shadow-sm rounded-[22px] p-6 lg:p-7`.
- **Adaptive Role Pill**:
  - `student`: Displays college/university affiliation.
  - `employee` / `founder`: Displays company or startup affiliation.
- **Social Action Row**: Quick links for Email, LinkedIn, X, and GitHub with dedicated color codes.
- **Edit Trigger**: Secondary outline button opening the role-adaptive profile modal.

### 4.2 Progressive Disclosure: "View More" Component
- **Placement**: Bottom of Discover Channels and Builder Directory grids.
- **Visuals**: Centered rounded-full pill (`rounded-full px-6 py-2.5 font-bold text-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700`).
- **Interaction**:
  - Displays first **6 items** by default.
  - Clicking dynamically toggles to show all items (e.g. 9+ items) and shifts label to "Show Less".

### 4.3 Collaboration Request Card
- **Structure**:
  - Header: Category tag (`bg-purple-100 text-purple-700`) + Project Type tag (`bg-slate-100 text-slate-700`).
  - Title & Duration: Bold headline with duration indicator (`"1-2 weeks"`, `"1 month"`).
  - Required Skills: Flex wrap list of skill chips (`bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 text-xs`).
  - Footer: Creator avatar, name, and "Join Project" CTA button.

### 4.4 Job Opportunity Card
- **Structure**:
  - Top Row: Company logo/initial avatar + Type tag + Bookmark/Save toggle icon.
  - Middle: Job Title + Organization + Location + Compensation/Scholarship.
  - Bottom Action Row: Days left deadline badge (`text-slate-500 font-medium text-[12px]`) + Action Button:
    - If unapplied: Primary button (`bg-[#7828F0] hover:bg-[#6820D4] text-white`).
    - If applied: Status badge (`bg-blue-100 text-blue-700` or `bg-green-100 text-green-700`) with a "Withdraw" action link.