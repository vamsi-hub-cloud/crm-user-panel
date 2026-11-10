# Nexora CRM: Enterprise CRM Platform User Panel

React + TypeScript + Redux Toolkit + Tailwind CSS + Recharts.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Sales Representative (Arjun Rao) | rep@crm.com | Password1 |
| Employee (Vamsi Krishna) | employee@crm.com | Password1 |
| Sales Manager (Vamsi Krishna) | manager@crm.com | Password1 |

Verification code (OTP) for every flow: `123456`.

## Modules

1. **Authentication**: login, OTP verification, forgot password, reset password
2. **Dashboard**: assigned leads, active customers, ongoing deals, pending tasks, performance vs. target
3. **Leads**: search, filter, create, edit, delete, status updates, follow-up scheduling
4. **Pipeline**: Kanban board with drag and drop (and a "Move" button for touch devices)
5. **Customers**: card grid, profile with contact info, interaction history and related deals
6. **Tasks**: priorities, deadlines, status, complete / reopen, filters
7. **Activities**: log calls, meetings, emails, interactions and follow-ups
8. **Reports**: revenue, conversion rate, lead funnel, task statistics
9. **Notifications**: lead assignments, reminders, meetings, mark as read
10. **Profile & settings**: personal info, password change, notification preferences
11. **Calendar**: month view of tasks, follow-ups, calls and meetings, with add-event
12. **Goals**: editable quarterly targets with progress tracking
13. **Team leaderboard** (manager): ranking, revenue by seller, target progress
14. **Help center**: guides, FAQ and support contacts

## Role-based access

Defined in `src/utils/permissions.ts`.

- **Manager**: everything (including Team leaderboard), with data from the whole team
- **Sales Representative**: everything, scoped to own records
- **Employee**: no Pipeline or Reports; scoped to own records

Routes are guarded by `RequirePermission`; the sidebar hides modules the role cannot open.

## Structure

```
src/
  components/ui/       reusable UI (Button, Field, Modal, Badge, States, Toaster...)
  components/layout/   Sidebar, Topbar, AppLayout, route guards
  pages/               one folder or file per module
  store/               Redux Toolkit slices (auth, ui, generic entity slice factory)
  services/api.ts      mock API: swap `request()` for real HTTP calls
  data/mock.ts         seed data
  utils/               formatting, validation, permissions
```

## Connecting a backend

All reads and writes go through `src/store/createEntitySlice.ts` and `src/store/authSlice.ts`. Replace the `request(...)` calls with API calls (axios / fetch); the UI, loading and error states stay unchanged. Demo data is persisted in `localStorage` (keys start with `crm_user_`); clear them to reset.
