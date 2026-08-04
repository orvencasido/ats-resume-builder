# Current Status

## Application

ATS Resume Builder is a React, TypeScript, Vite, Tailwind CSS, Supabase, and `@react-pdf/renderer` app.

## Persistence

- Real accounts authenticate with Supabase Auth.
- Real account resumes are saved in `public.resumes`.
- Row Level Security scopes every resume to the logged-in user.
- Guest mode is session-only and does not use Supabase or localStorage.
- Refreshing the browser clears guest progress.

## Database

Run the SQL in:

```text
supabase/schema.sql
```

ERD:

```text
supabase/ERD.md
```

## Resume Storage

The app stores each resume as one document row with JSONB fields for editable sections:

- personal info
- work experience
- technical skills
- education
- projects
- certifications
- layout and PDF settings

This keeps autosave simple and avoids multi-table rewrites on every edit.
