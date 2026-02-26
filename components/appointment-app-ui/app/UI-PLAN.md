# UI Plan: Appointment Booking App for Barbers, Nail Salons & Hair Stylists

## Overview

Build a clean, mobile-friendly appointment management UI using **React + Vite + Tailwind CSS v4 + shadcn (JSX, new-york style)**. The app targets service providers (barbers, nail techs, stylists) who need to view, create, edit, and cancel appointments. The API base URL is configurable (currently `http://localhost:3007` via SAM local).

---

## Tech Stack (already in place)

| Layer         | Tool                                     |
|---------------|------------------------------------------|
| Framework     | React 19 (JSX, no TypeScript)            |
| Bundler       | Vite 7                                   |
| CSS           | Tailwind CSS v4 + tw-animate-css         |
| Components    | shadcn (new-york, JSX mode, `@/` alias)  |
| Icons         | lucide-react                             |
| Primitives    | radix-ui                                 |
| API           | AWS SAM Lambda (REST, JSON)              |

---

## Existing API Endpoints

| Method | Path                       | Status       | Notes                                                  |
|--------|----------------------------|--------------|--------------------------------------------------------|
| POST   | `/appointments`            | Implemented  | Body: `{ customerEmail, customerName, phone, startTime, endTime, status, notes, location }` |
| GET    | `/appointments/{date}`     | Implemented  | Returns all appointments for a given date (YYYY-MM-DD) |
| PUT    | `/appointments`            | Stub (empty) | Needs implementation on API side                       |
| DELETE | `/appointments`            | Stub (empty) | Needs implementation on API side                       |

### Data Model (DynamoDB)

```
PK:              CUSTOMER#{customerEmail}
SK:              APPOINTMENT#{startTime}
customerEmail    string
customerName     string
phone            string
startTime        ISO 8601 datetime
endTime          ISO 8601 datetime
appointmentDate  YYYY-MM-DD (derived from startTime)
status           PENDING | CONFIRMED | CANCELLED
notes            string
location         string
```

---

## Pages & Routes

Install `react-router-dom` for client-side routing.

| Route                | Page Component       | Description                                   |
|----------------------|----------------------|-----------------------------------------------|
| `/`                  | `HomePage`           | Dashboard / today's overview                  |
| `/appointments`      | `AppointmentsPage`   | Browse appointments by date                   |
| `/appointments/new`  | `NewAppointmentPage` | Create a new appointment                      |
| `/customers`         | `CustomersPage`      | List of unique customers (derived from data)  |
| `/settings`          | `SettingsPage`       | App preferences (location, working hours)     |

---

## Folder Structure (target)

```
src/
├── main.jsx                          # Entry point, renders <App />
├── App.jsx                           # Router + Layout shell
├── App.css                           # (clean out Vite defaults)
├── index.css                         # Tailwind + shadcn theme (already set up)
├── api/
│   └── appointments.js               # All fetch calls to the API
├── components/
│   ├── layout/
│   │   ├── root-layout.jsx           # Shared shell: navbar + <Outlet />
│   │   └── page-header.jsx           # Reusable page title + breadcrumb
│   ├── appointments/
│   │   ├── appointment-card.jsx      # Single appointment display card
│   │   ├── appointment-list.jsx      # Renders a list of appointment-cards
│   │   ├── appointment-form.jsx      # Create / edit form (shared)
│   │   ├── date-picker-bar.jsx       # Date navigation strip
│   │   └── status-badge.jsx          # Colored badge for PENDING/CONFIRMED/CANCELLED
│   ├── customers/
│   │   ├── customer-card.jsx         # Customer summary card
│   │   └── customer-list.jsx         # Renders list of customer-cards
│   └── ui/                           # shadcn primitives (already started)
│       ├── button/
│       │   └── button.jsx
│       ├── navbar/
│       │   └── navigation-menu.jsx
│       ├── card.jsx                  # npx shadcn@latest add card --jsx
│       ├── input.jsx                 # npx shadcn@latest add input --jsx
│       ├── label.jsx                 # npx shadcn@latest add label --jsx
│       ├── select.jsx                # npx shadcn@latest add select --jsx
│       ├── textarea.jsx              # npx shadcn@latest add textarea --jsx
│       ├── dialog.jsx                # npx shadcn@latest add dialog --jsx
│       ├── badge.jsx                 # npx shadcn@latest add badge --jsx
│       ├── calendar.jsx              # npx shadcn@latest add calendar --jsx
│       ├── popover.jsx               # npx shadcn@latest add popover --jsx
│       ├── separator.jsx             # npx shadcn@latest add separator --jsx
│       ├── skeleton.jsx              # npx shadcn@latest add skeleton --jsx
│       ├── toast.jsx                 # npx shadcn@latest add toast (sonner) --jsx
│       └── alert-dialog.jsx          # npx shadcn@latest add alert-dialog --jsx
├── hooks/
│   └── use-appointments.js           # Custom hook: fetch, create, edit, delete
├── lib/
│   └── utils.js                      # cn() helper (already exists)
└── pages/
    ├── home-page.jsx
    ├── appointments-page.jsx
    ├── new-appointment-page.jsx
    └── customers-page.jsx
```

---

## Step-by-Step Implementation Plan

### Step 1 — Scaffolding & Dependencies

1. Install `react-router-dom`:
   ```bash
   npm i react-router-dom
   ```
2. Add required shadcn components (run each from the `app/` directory):
   ```bash
   npx shadcn@latest add card input label select textarea dialog badge calendar popover separator skeleton sonner alert-dialog --jsx
   ```
3. Clean out the default Vite CSS from `App.css` (remove `.logo`, `.card`, `.read-the-docs`, etc.).

### Step 2 — API Layer (`src/api/appointments.js`)

Create a single module that exports functions matching every API call. This keeps fetch logic out of components and makes it easy to swap the base URL later.

```js
const API_BASE = "http://localhost:3007";   // move to .env later

export async function getAppointmentsByDate(date) { … }
export async function createAppointment(data) { … }
export async function editAppointment(data) { … }     // when API is ready
export async function deleteAppointment(data) { … }   // when API is ready
```

- All functions return parsed JSON.
- All functions throw on non-2xx responses with the server error message.
- `date` is always `YYYY-MM-DD`.

### Step 3 — Layout Shell (`src/components/layout/root-layout.jsx`)

- Render the `NavigationMenu` (already built) at the top.
- Update navbar links to use `react-router-dom` `<Link>` instead of plain `<a>` tags.
- Render `<Outlet />` below the navbar for page content.
- Add a consistent `max-w-5xl mx-auto px-4 py-6` wrapper around `<Outlet />`.

### Step 4 — Router Setup (`src/App.jsx`)

Replace the current `App.jsx` with a `BrowserRouter` setup:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "./components/layout/root-layout"
import HomePage from "./pages/home-page"
import AppointmentsPage from "./pages/appointments-page"
import NewAppointmentPage from "./pages/new-appointment-page"
import CustomersPage from "./pages/customers-page"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/appointments/new" element={<NewAppointmentPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### Step 5 — Home Page (`src/pages/home-page.jsx`)

**Purpose**: Quick daily overview for the service provider.

**Sections**:
1. **Greeting header** — "Good morning, here's your day" (time-aware).
2. **Today's stats row** (3 small cards):
   - Total appointments today
   - Confirmed count
   - Pending count
3. **Upcoming appointments** — A compact list of the next 3–5 appointments using `<AppointmentCard />` (shows customer name, time, status badge, service notes).
4. **Quick actions** — "New Appointment" button linking to `/appointments/new`.

**Data**: Fetch today's appointments via `getAppointmentsByDate(todayDate)`.

### Step 6 — Appointments Page (`src/pages/appointments-page.jsx`)

**Purpose**: Browse and manage appointments for any date.

**Sections**:
1. **Date picker bar** — A horizontal date navigation strip at the top:
   - Shows the currently selected date.
   - Left/right arrows to go to previous/next day.
   - A calendar popover (shadcn `Calendar` + `Popover`) to jump to any date.
2. **Appointment list** — Renders `<AppointmentList />` for the selected date.
   - Each `<AppointmentCard />` shows:
     - Customer name & phone
     - Time range (`startTime` – `endTime`)
     - `<StatusBadge />` (PENDING = yellow, CONFIRMED = green, CANCELLED = red)
     - Notes preview
     - Action buttons: Edit (opens dialog), Cancel (opens alert-dialog for confirmation)
   - If no appointments, show an empty-state message with a "Book one now" link.
3. **Floating "+" button** or top-bar "New Appointment" button → navigates to `/appointments/new`.

**Data**: Fetch via `getAppointmentsByDate(selectedDate)`. Re-fetch when the date changes.

### Step 7 — New Appointment Page (`src/pages/new-appointment-page.jsx`)

**Purpose**: Create a new appointment.

**Form fields** (use shadcn `Input`, `Label`, `Select`, `Textarea`):

| Field           | Type              | Required | Notes                                    |
|-----------------|-------------------|----------|------------------------------------------|
| Customer Name   | text input        | Yes      |                                          |
| Customer Email  | email input       | Yes      |                                          |
| Phone           | tel input         | Yes      |                                          |
| Date            | date picker       | Yes      | Calendar popover, only future dates      |
| Start Time      | time select       | Yes      | Dropdown in 15-min increments            |
| End Time        | time select       | Yes      | Must be after start time                 |
| Service / Notes | textarea          | Yes      | e.g. "Haircut + Beard trim"              |
| Location        | text input        | No       | Pre-fill with default from settings      |
| Status          | select            | Yes      | Default: PENDING                         |

**Behaviour**:
- On submit, call `createAppointment(data)`.
- Show a loading spinner on the submit button while the request is in flight.
- On success, show a toast ("Appointment created!") and navigate to `/appointments` for that date.
- On error, show a toast with the server error message.
- Basic client-side validation before submitting (required fields, email format, end > start).

### Step 8 — Appointment Edit (Dialog)

**Purpose**: Edit an existing appointment without leaving the appointments page.

- Triggered by an "Edit" button on `<AppointmentCard />`.
- Opens a shadcn `<Dialog>` pre-filled with the appointment's current data.
- Same form fields as the create form.
- On save, call `editAppointment(data)` (once the API PUT is implemented).
- On success, close the dialog, refetch the list, show a toast.

> **Note**: The PUT endpoint on the API side is still a stub. Build the UI now and wire it up once the API is ready. In the meantime, you can disable the save button or show "Coming soon".

### Step 9 — Appointment Cancel (Alert Dialog)

- Triggered by a "Cancel" button on `<AppointmentCard />`.
- Opens a shadcn `<AlertDialog>` asking "Are you sure you want to cancel this appointment?"
- On confirm, call `deleteAppointment(data)` (once the API DELETE is implemented).
- On success, refetch, show a toast.

> **Note**: Same caveat as edit — the DELETE endpoint is a stub.

### Step 10 — Status Badge Component (`src/components/appointments/status-badge.jsx`)

A small component that maps status to a colored shadcn `<Badge>`:

| Status    | Variant       | Color                 |
|-----------|---------------|-----------------------|
| PENDING   | `outline`     | Yellow / amber text   |
| CONFIRMED | `default`     | Green background      |
| CANCELLED | `destructive` | Red background        |

### Step 11 — Customers Page (`src/pages/customers-page.jsx`)

**Purpose**: A read-only directory of customers derived from appointment data.

**How it works**:
- There is no separate "customers" API endpoint, so this page will derive customer data from appointments.
- Fetch appointments for a broad date range (or maintain a local list as appointments are created).
- De-duplicate by `customerEmail` and display:
  - Customer name
  - Email
  - Phone
  - Number of appointments
  - Last appointment date

> **Future enhancement**: Add a dedicated GET `/customers` endpoint on the API side and replace the client-side derivation.

### Step 12 — Custom Hook (`src/hooks/use-appointments.js`)

Encapsulate data-fetching and state:

```js
export function useAppointments(date) {
  // Returns: { appointments, isLoading, error, refetch }
  // Calls getAppointmentsByDate(date) on mount and when date changes
}
```

Use this hook in both `HomePage` and `AppointmentsPage` to keep things DRY.

### Step 13 — Polish & Cleanup

1. **Loading states** — Use shadcn `<Skeleton />` cards while data loads.
2. **Error states** — Show a friendly error message with a "Retry" button.
3. **Empty states** — Friendly illustration or message when there are no appointments.
4. **Toast notifications** — Use shadcn `sonner` for create/edit/delete feedback.
5. **Responsive design** — Ensure the layout works well on mobile (single column) and desktop (wider cards).
6. **Clean `App.css`** — Remove all leftover Vite boilerplate styles.
7. **Environment variable** — Move API base URL to a `.env` file (`VITE_API_BASE_URL`).

---

## shadcn Components to Install

Run all at once from `components/appointment-app-ui/app/`:

```bash
npx shadcn@latest add card input label select textarea dialog badge calendar popover separator skeleton sonner alert-dialog --jsx
```

---

## Dependency Summary

| Package            | Purpose                  | Install Command          |
|--------------------|--------------------------|--------------------------|
| react-router-dom   | Client-side routing      | `npm i react-router-dom` |

All other dependencies (radix-ui, lucide-react, class-variance-authority, tailwind-merge, clsx) are already installed.

---

## Implementation Order (recommended)

| Order | Task                              | Depends On       |
|-------|-----------------------------------|------------------|
| 1     | Install deps & shadcn components  | —                |
| 2     | Clean `App.css`                   | —                |
| 3     | API layer (`api/appointments.js`) | —                |
| 4     | `useAppointments` hook            | API layer        |
| 5     | `StatusBadge` component           | Badge installed  |
| 6     | `AppointmentCard` component       | Card, StatusBadge|
| 7     | `AppointmentList` component       | AppointmentCard  |
| 8     | `RootLayout` + router in `App.jsx`| react-router-dom |
| 9     | `HomePage`                        | Layout, hook     |
| 10    | `AppointmentsPage` + date picker  | Layout, hook     |
| 11    | `NewAppointmentPage`              | API layer, form  |
| 12    | Edit dialog on AppointmentCard    | Dialog, form     |
| 13    | Cancel alert on AppointmentCard   | AlertDialog      |
| 14    | `CustomersPage`                   | Layout           |
| 15    | Polish (skeletons, toasts, empty) | All pages        |

---

## Notes for the Implementing Agent

- **Always use `--jsx` flag** when running `npx shadcn@latest add …` since this is a JavaScript (not TypeScript) project.
- The `@/` import alias is configured in both `vite.config.js` and `jsconfig.json` and maps to `src/`.
- shadcn components live under `src/components/ui/`. Custom app components go in `src/components/{feature}/`.
- Pages go in `src/pages/`.
- The API currently runs on `http://localhost:3007` via `sam local start-api --port 3007`.
- The GET endpoint returns `{ message, data }` where `data` contains a DynamoDB `Items` array.
- The POST endpoint expects a flat JSON body and returns `{ message, data }`.
- Use CORS-friendly fetch (the SAM local API may need `--cors-allow-origin "*"` flag).
