# Team Task Manager

- **Backend:** Laravel 12, PHP 8.3, MySQL 8, Sanctum (API token)
- **Frontend:** Vue 3 SPA, TypeScript, Vuetify 3, Pinia, Vue Router, Axios

```
backend/    Laravel API
frontend/   Vue 3 SPA
ANSWERS.md  Written answers
```

## Requirements

- PHP 8.3, Composer
- MySQL 8
- Node.js 20+

## Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

On Windows CMD use `copy .env.example .env` instead of `cp`.

Create a MySQL database and update `DB_*` in `.env`:

```sql
CREATE DATABASE team_task_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
php artisan migrate --seed
php artisan serve
```

The API runs at `http://localhost:8000/api`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:8000`.

Production build: `npm run build` (output in `frontend/dist`).

## Test accounts

All passwords are `password`.

| Email | Role |
|---|---|
| admin@example.com | admin |
| alice@example.com | user |
| bob@example.com | user |

Each account is seeded with 8 tasks.

## API

All endpoints except `POST /api/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Returns `{ token, user }` |
| GET | `/api/me` | Current user |
| POST | `/api/logout` | Revokes current token |
| GET | `/api/users` | List users (admin: all, user: only self) |
| POST | `/api/users` | Create user (admin only) |
| GET | `/api/tasks` | Paginated list. Query: `status`, `assigned_to`, `search`, `page`, `per_page` |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/{id}` | Task detail |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

Status codes: `200`, `201` (created), `204` (deleted / logout), `401` (unauthenticated), `403` (forbidden), `404` (not found), `422` (validation).

## Authorization

Implemented with `TaskPolicy` and checks in the controller / form requests.

- **admin:** full CRUD on all tasks, lists all users and creates users (`UserPolicy`). The SPA has an admin-only `/users` page.
- **user:**
  - `GET /api/tasks` returns only tasks assigned to them.
  - Can view, update and delete only tasks assigned to them (otherwise `403`).
  - Can create tasks only for themselves. `assigned_to` defaults to the current user; any other value returns `422`.
  - `GET /api/users` returns only themselves; `POST /api/users` returns `403`.

## Assumptions

- The schema has no `created_by` column, so "own tasks" means tasks where `assigned_to` is the current user.
- Tasks are **hard deleted**, since the schema has no `deleted_at` column.
- `search` (title, `LIKE`) and `per_page` were added to `GET /api/tasks` to support server-side search and pagination in the SPA.
- `due_date` uses the `Y-m-d` format.
- Laravel 12 is used instead of 11: all Laravel 11.x releases are flagged by Packagist security advisories (Laravel 11 is out of security support), so Composer refuses to install them. The structure and APIs used are the same as Laravel 11.
- User management is limited to listing and creating users, as allowed by the exercise.
- The SPA stores the token in `localStorage` and attaches it with an Axios interceptor. A `401` response clears the token and redirects to `/login`.
