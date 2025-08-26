# Admin UI + Environment + Sidebar (Consolidated Guide)


## 1) Admin UI (Tailwind + Templates)
- Modern dashboard, lists, forms, and login styled with Tailwind.
- Responsive, clean UX, Font Awesome icons.
- Files of interest:
```
backend/
├─ templates/admin/ (base_site.html, index.html, change_list.html, change_form.html, login.html, ...)
├─ static/admin/css/custom.css
└─ prompts/admin.py, prompts/context_processors.py
```
- Run admin:
```bash
cd backend
python manage.py runserver
# http://localhost:8000/admin/
```
- Create superuser:
```bash
python manage.py createsuperuser
```
- Customize colors (example inside base template):
```js
tailwind.config = { theme: { extend: { colors: { primary: { 500: '#your-color' } } } } }
```

## 2) Admin Features (Overview)
- Header gradient, Inter font, consistent scheme.
- Dashboard stats (Totals, Activity, Popular Categories, Quick Stats).
- Admin models enhanced:
  - Category: image preview, counts, featured/order, color picker
  - Prompt: difficulty/status badges, improved lists, date hierarchy
  - User: full name, verification, SSO info, avatar
  - Tag: simple, color display
- Best practices: use select_related/prefetch_related, cache stats, sanitize HTML with `format_html`, validate inputs, consistent UX.

## 3) Environment (.env)
- Create `.env` from template, then fill real values.
```bash
# example
cp env_template.txt .env
```
- Minimal keys:
```env
SECRET_KEY=your-secret
DEBUG=True
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your@email
EMAIL_HOST_PASSWORD=your-app-pass
DEFAULT_FROM_EMAIL=your@email
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```
- Notes: `.env` is gitignored; for production set env vars on server. Install: `pip install python-dotenv`.

## 4) Sidebar Responsive (Collapse/Expand)
- Behavior
  - Mobile/Tablet: hidden by default, open via hamburger; overlay + ESC support
  - Desktop: visible; footer toggle to collapse/expand; state persisted in localStorage
- Breakpoints (mobile-first): `sm/md/lg/xl/2xl`.
- Pseudo interactions:
```js
function toggleSidebar() {}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleSidebar(); });
function toggleSidebarCollapse() {}
localStorage.setItem('sidebarCollapsed', state);
```
- Tailwind hints (conceptual):
```css
/* Mobile sidebar */
/* .sidebar: fixed, -translate-x-full, transition */
/* Desktop sidebar */
/* .sidebar: lg:static lg:translate-x-0 */
/* Collapsed */
/* .sidebar-collapsed: lg:w-16 */
/* Expanded */
/* .sidebar: lg:w-64 */
```

## 5) Troubleshooting
- Admin CSS not loading: check `STATIC_URL`, run `python manage.py collectstatic`.
- Template not applied: verify `TEMPLATES` dirs and file paths.
- Context processors: ensure registered, restart server.
- Sidebar not showing: check console, CSS load, Tailwind config.

## 6) Quick Start
```bash
cd backend
python manage.py runserver
# open http://localhost:8000/admin/
```

## 7) License
MIT (see repository LICENSE if present).
