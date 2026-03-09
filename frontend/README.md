# TaskNest •

> **Plan work. Track progress. Deliver projects.**  
> A modern, full-stack project management workspace built for teams who want clarity without complexity.

---

## Overview

TaskNest is a full-featured project management platform that brings together task management, Kanban boards, sprint planning, team collaboration, and productivity analytics into one structured workspace. No noise, no bloat — just a clean, fast workspace built around the way modern teams actually work.

---

## Features

### Workspaces
- Create multiple workspaces — one per team, client, or product
- Invite members and assign roles: **Owner**, **Admin**, **Member**
- Transfer ownership and manage workspace settings
- Custom accent colours per workspace

### Projects & Tasks
- Organise work into projects inside each workspace
- Create tasks with title, description, priority (High / Medium / Low), due dates, and assignees
- Kanban board view — drag tasks across **To Do → In Progress → Done**
- Archive tasks to keep boards clean without losing history

### Dashboard & Analytics
- Workspace-level stats: total tasks, completed, in-progress, overdue
- Task trend charts (velocity over time)
- Project status breakdown (pie/donut charts)
- Priority distribution and workspace productivity views
- Recent projects and upcoming tasks at a glance

### My Tasks
- Unified view of all tasks assigned to the logged-in user across workspaces
- Filter by status, priority, or archived state
- Sort by due date (newest / oldest)
- Switch between **List view** and **Kanban board view**

### Members
- Browse all workspace members in list or grid view
- Role badges (Owner 👑 / Admin 🛡 / Member)
- Search members by name, email or role

### Notifications
- Smart notification bell in the header — powered by live task data
- Surfaces overdue tasks (🔴), tasks due within 3 days (🟡), and recently updated tasks (🔵)
- Scrollable notification panel with priority badges and relative timestamps

### Auth & Security
- Email/password authentication with JWT sessions
- Email verification on sign-up
- Forgot password / reset password flow
- Change password from the profile page

### Profile
- Update display name
- Upload and change profile picture (stored as base64 in DB)
- Password management with confirmation

### UX & Design
- Dark mode / light mode toggle with system persistence
- Fully responsive — mobile, tablet, desktop
- Brand design system: **Syne** (headings) + **DM Sans** (body), lime accent `#e8ff47`
- Consistent component library built on shadcn/ui + Tailwind CSS

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + React Router v7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State / Data | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Fonts | Syne 700/800, DM Sans 400/500/600 |
| Icons | Lucide React |
| Notifications | Sonner |
| Date utils | date-fns |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) |
| Validation | Zod + zod-express-middleware |
| Email | Nodemailer |
| Security | Arcjet (rate limiting / bot protection) |
| Password hashing | bcrypt |

---

## Project Structure

```
tasknest/
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/        # StatsCard, StatisticsCharts, RecentProjects
│   │   │   ├── layout/           # Header, Sidebar, SidebarNav
│   │   │   ├── ui/               # shadcn/ui primitives
│   │   │   └── workspace/        # WorkspaceAvatar, CreateWorkspace
│   │   ├── hooks/                # useAuth, useTasks, useWorkspace, useUser
│   │   ├── provider/             # AuthContext, ThemeProvider, ReactQueryProvider
│   │   ├── routes/
│   │   │   ├── auth/             # sign-in, sign-up, forgot/reset password, verify-email
│   │   │   ├── dashboard/        # dashboard, my-tasks, members, achieved, settings
│   │   │   ├── user/             # profile
│   │   │   └── home.tsx          # Landing page
│   │   └── app.css               # Global design tokens + component styles
│   └── public/
│
└── backend/
    ├── controllers/              # auth, task, project, workspace, user
    ├── middleware/               # auth-middleware
    ├── models/                   # User, Workspace, Project, Task, Comment, Activity
    ├── routes/                   # auth, task, project, workspace, user
    └── libs/                     # db, send-email, validate-schema, arcjet
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- A Gmail account (or SMTP provider) for email sending

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tasknest.git
cd tasknest
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tasknest
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Arcjet (optional — remove if not using)
ARCJET_KEY=your_arcjet_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL (for CORS + email links) |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP password / app password |
| `ARCJET_KEY` | Arcjet API key (rate limiting — optional) |

---

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Send reset link |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Get logged-in user profile |
| PUT | `/api/users/profile` | Update name / profile picture |
| PUT | `/api/users/change-password` | Change password |

### Workspaces
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/:id` | Get workspace details |
| PUT | `/api/workspaces/:id` | Update workspace |
| DELETE | `/api/workspaces/:id` | Delete workspace |
| GET | `/api/workspaces/:id/stats` | Dashboard statistics |

### Projects & Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/projects` | List / create projects |
| GET/PUT/DELETE | `/api/projects/:id` | Project operations |
| GET/POST | `/api/tasks` | List / create tasks |
| GET/PUT/DELETE | `/api/tasks/:id` | Task operations |
| GET | `/api/tasks/my-tasks` | Tasks assigned to me |

---

## Scripts

### Backend
```bash
npm run dev      # Start with nodemon (development)
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## License

MIT — free to use, modify and distribute.

---

## Author

Built with ☕ and `#e8ff47` by the TaskNest team.  
Questions or feedback? **tasknest.notify@gmail.com**