# Answers

## 1. Performance of `GET /api/tasks` with 1,000,000+ tasks

- **Pagination:** never return all rows. Use `paginate()`, or `cursorPaginate()` for deep pages, since `OFFSET` gets slow on large offsets. Cap `per_page` (max 100 here).
- **Indexes:** index the filtered and sorted columns. Use composite indexes that match common queries, e.g. `(assigned_to, status, id)` and `(status, id)`.
- **Eager loading:** `with('assignee')` avoids N+1 queries when showing the assignee name.
- **Select only needed columns:** e.g. `select('id', 'title', 'status', 'assigned_to', 'due_date')` and `with('assignee:id,name')`. Skip large `description` text in list views.
- **Search:** `LIKE '%term%'` cannot use a B-tree index. Use a MySQL `FULLTEXT` index, prefix search (`LIKE 'term%'`), or a search engine (Meilisearch / Elasticsearch via Laravel Scout).
- **Avoid expensive counts:** `COUNT(*)` on millions of rows is costly. Use `simplePaginate()` / cursor pagination, or cache the total.
- **Caching:** cache hot queries (e.g. per user + filters) in Redis with short TTL or tag-based invalidation on task changes.
- **Query analysis:** check `EXPLAIN`, enable the slow query log, and use Telescope / Debugbar in development.
- **Infrastructure:** read replicas for read-heavy traffic, OPcache, `php artisan optimize` (config / route / event cache), and Octane if needed.
- **Data lifecycle:** archive or partition old `done` tasks so the hot table stays small.

## 2. Security of the Laravel + SPA setup

- **Authentication:** Sanctum API tokens, stored hashed in the database. Revoke on logout, set token expiration, and rate-limit login (`throttle:5,1`) against brute force.
- **Authorization:** policies (`TaskPolicy`) on every action, plus row-level filtering in queries so users never see other users' tasks. This prevents IDOR.
- **SQL injection:** use Eloquent / Query Builder with parameter binding and no raw string concatenation. Whitelist filter and sort fields.
- **Mass assignment:** use `$fillable` and only pass `$request->validated()` to models. `role` is never accepted from task requests.
- **Validation:** Form Requests validate type, length, enum values and `exists` checks. Non-admin users cannot set `assigned_to` to another user.
- **XSS:** the API returns JSON only. Vue escapes `{{ }}` output by default, and `v-html` is never used with user data. Add a Content-Security-Policy header.
- **Token storage:** `localStorage` is readable by JavaScript, so XSS could leak the token. For higher security, use Sanctum SPA cookie auth (HttpOnly, `SameSite`, CSRF via `/sanctum/csrf-cookie`) when the SPA and API share a domain.
- **CSRF:** not an issue for Bearer-token requests, but required (and handled by Laravel) when using cookie / session auth.
- **HTTPS everywhere:** HSTS, secure cookies, and no tokens in URLs or logs.
- **CORS:** restrict `allowed_origins` in `config/cors.php` to the SPA domain.
- **Error handling:** `APP_DEBUG=false` in production so stack traces are not exposed. Return generic messages (e.g. `Resource not found.`).
- **Secrets and dependencies:** keep `.env` out of Git, rotate `APP_KEY` and DB credentials, and run `composer audit` / `npm audit` in CI.

## 3. Benefits of TypeScript in a Vue 3 SPA

- Catches errors at compile time (wrong prop types, typos, missing fields) instead of at runtime.
- API response types (`Task`, `User`, `Paginated<T>`) are shared across the API client, stores and components. Changing the API shape shows every place that needs updating.
- Better IDE support: autocompletion, go-to-definition and safe refactoring.
- Typed `defineProps` / `defineEmits` make component contracts explicit and checked in templates (via `vue-tsc`).
- Union types such as `TaskStatus = 'todo' | 'in_progress' | 'done'` prevent invalid values.
- Easier onboarding and maintenance in larger teams, since types act as documentation.

## 4. Typed props with `<script setup lang="ts">`

```vue
<script setup lang="ts">
import { computed } from 'vue'

type TaskStatus = 'todo' | 'in_progress' | 'done'

interface Props {
  title: string
  status: TaskStatus
  dueDate?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  dueDate: null,
})

const emit = defineEmits<{
  select: [title: string]
}>()

const color = computed(() => ({ todo: 'grey', in_progress: 'blue', done: 'green' })[props.status])
</script>

<template>
  <v-chip :color="color" @click="emit('select', props.title)">
    {{ props.title }} <span v-if="props.dueDate">({{ props.dueDate }})</span>
  </v-chip>
</template>
```

The real project uses the same pattern in `frontend/src/components/TaskForm.vue` (`defineProps<{ task?: Task | null }>()`).
