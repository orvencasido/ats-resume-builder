# ATS Resume Builder ERD

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : owns
  AUTH_USERS ||--o{ RESUMES : owns

  AUTH_USERS {
    uuid id PK
    text email
  }

  PROFILES {
    uuid id PK, FK
    text email
    text full_name
    timestamptz created_at
    timestamptz updated_at
  }

  RESUMES {
    uuid id PK
    uuid user_id FK
    text title
    jsonb personal_info
    text introduction
    jsonb work_experiences
    jsonb technical_skills
    jsonb education
    jsonb projects
    jsonb certifications
    text layout
    jsonb profile_image
    text page_size
    jsonb page_margins
    numeric font_size
    numeric line_height
    jsonb section_order
    jsonb hidden_sections
    timestamptz created_at
    timestamptz updated_at
  }
```

## Notes

- `auth.users` is managed by Supabase Auth.
- `profiles.id` is a 1:1 extension of `auth.users.id`.
- `resumes.user_id` scopes every resume to exactly one account.
- Row Level Security ensures users can only read/write/delete their own profile and resumes.
- Resume sections are stored as JSONB arrays because the app edits the whole resume as one document and autosaves frequently.
- Guest users do not write to Supabase and do not use localStorage; their resumes live only in browser memory for the current page session.
