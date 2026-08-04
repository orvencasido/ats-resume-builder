# Project Status & Supabase Migration Guide

## 📌 Project Overview
**Application**: ATS Resume Builder (`react-example`)  
**Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, `@react-pdf/renderer`, `@supabase/supabase-js`, `@google/genai`

A high-performance ATS (Applicant Tracking System) software engineering resume builder featuring live 1:1 PDF rendering, customizable page margins & typography, ATS bullet optimization, and dual-layer data persistence (LocalStorage + Supabase).

---

## 🟢 Current Status & Recent Improvements

### 1. Streamlined 1:1 Live PDF Preview
- **Clean Embedded Viewer**: Refactored `ResumePreview.tsx` to directly embed the 1:1 `@react-pdf/renderer` document in a full-width, borderless iframe.
- **Removed Header Noise**: Eliminated visual draft toggle bars, redundant toolbar controls, and layout switchers to deliver a clean, paper-accurate PDF preview matching the exact file produced on download.

### 2. Header & Contact Line Formatting
- **Contact Row Alignment**: Fixed layout styling for contact details (`email`, `phone`, `website`/`LinkedIn`). Email, phone, and website links sit centered directly beneath the full name in a single horizontal row separated by crisp dividers (`|`).
- **Typography & Scale**: Tuned exact font scaling ratios for candidate name, section headers, item titles, subtext, and bullet points.

### 3. Margin & Typography Slider Fixes
- **Modal Range Inputs**: Fixed overflow issue in `SectionOrderModal.tsx` for margin (top, bottom, left, right), font size, and line height range sliders with responsive CSS classes (`min-w-0 w-full`).

### 4. Dual Persistence Layer
- **Local Fallback Mode**: Works out of the box without environment variables using `localStorage`.
- **Supabase Cloud Layer**: Integrated client handlers in `resumeService.ts` and `authService.ts` capable of relational sync with real Supabase DB once configured.

---

## 🗄️ Real Supabase Migration Guide

The codebase is pre-configured with `@supabase/supabase-js`. Follow these steps to migrate from LocalStorage fallback to a production Supabase instance.

### Step 1: Set Environment Variables
Add your Supabase project credentials in `.env` or system environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

`src/lib/supabase.ts` automatically detects valid credentials using `isSupabaseConfigured` and seamlessly switches from LocalStorage fallback to cloud database syncing.

### Step 2: Database Schema & RLS Setup
Run the following SQL in the **Supabase SQL Editor** (`https://supabase.com/dashboard/project/_/sql`):

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Resumes Table
create table public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'Untitled Resume',
  full_name text,
  email text,
  phone text,
  website text,
  introduction text,
  page_size text default 'A4',
  page_margins jsonb default '{"top": 36, "bottom": 36, "left": 42, "right": 42}'::jsonb,
  section_order jsonb default '["workExperience", "technicalSkills", "education", "projects", "certifications"]'::jsonb,
  hidden_sections jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resumes enable row level security;
create policy "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on public.resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);

-- 3. Work Experiences Table
create table public.work_experiences (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid references public.resumes on delete cascade not null,
  job_title text,
  company text,
  duration text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.work_experiences enable row level security;
create policy "Users can manage work experiences" on public.work_experiences 
  for all using (exists (select 1 from public.resumes where resumes.id = work_experiences.resume_id and resumes.user_id = auth.uid()));

-- 4. Work Experience Descriptions
create table public.work_experience_descriptions (
  id uuid primary key default uuid_generate_v4(),
  work_experience_id uuid references public.work_experiences on delete cascade not null,
  description text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.work_experience_descriptions enable row level security;
create policy "Users can manage work experience descriptions" on public.work_experience_descriptions 
  for all using (exists (
    select 1 from public.work_experiences 
    join public.resumes on resumes.id = work_experiences.resume_id 
    where work_experiences.id = work_experience_descriptions.work_experience_id and resumes.user_id = auth.uid()
  ));

-- 5. Technical Skill Groups Table
create table public.technical_skill_groups (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid references public.resumes on delete cascade not null,
  title text,
  skills text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.technical_skill_groups enable row level security;
create policy "Users can manage skill groups" on public.technical_skill_groups 
  for all using (exists (select 1 from public.resumes where resumes.id = technical_skill_groups.resume_id and resumes.user_id = auth.uid()));

-- 6. Education Entries Table
create table public.education_entries (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid references public.resumes on delete cascade not null,
  program text,
  school text,
  year text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.education_entries enable row level security;
create policy "Users can manage education entries" on public.education_entries 
  for all using (exists (select 1 from public.resumes where resumes.id = education_entries.resume_id and resumes.user_id = auth.uid()));

-- 7. Projects Table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid references public.resumes on delete cascade not null,
  project_title text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;
create policy "Users can manage projects" on public.projects 
  for all using (exists (select 1 from public.resumes where resumes.id = projects.resume_id and resumes.user_id = auth.uid()));

-- 8. Project Descriptions
create table public.project_descriptions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects on delete cascade not null,
  description text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.project_descriptions enable row level security;
create policy "Users can manage project descriptions" on public.project_descriptions 
  for all using (exists (
    select 1 from public.projects 
    join public.resumes on resumes.id = projects.resume_id 
    where projects.id = project_descriptions.project_id and resumes.user_id = auth.uid()
  ));

-- 9. Certifications Table
create table public.certifications (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid references public.resumes on delete cascade not null,
  giver text,
  title text,
  sort_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.certifications enable row level security;
create policy "Users can manage certifications" on public.certifications 
  for all using (exists (select 1 from public.resumes where resumes.id = certifications.resume_id and resumes.user_id = auth.uid()));
```

---

## 🚀 Roadmap / What to Implement Next

1. **AI Resume Bullet Enhancer (Gemini Integration)**
   - Integrate `@google/genai` SDK on backend API route to offer AI suggestions for bullet points (adding strong action verbs and quantifiable metrics).
2. **Job Description Tailoring & Match Score**
   - Provide a input modal to paste a target job description and get a keyword overlap score and ATS gap report.
3. **Multi-Template Preset Switcher**
   - Add toggle for alternative clean ATS templates (e.g. Modern Minimalist, Two-Column Header, Executive).
4. **Markdown & Plain Text Export**
   - Provide instant copy-to-clipboard for raw text / Markdown format alongside the PDF download.
