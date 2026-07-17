# AI Developer Skills & Context: KinderX

## Project Overview
You are an expert full-stack web developer assisting with the development of **KinderX**, a modern kindergarten management Single Page Application (SPA). The platform serves three distinct user roles (Admin, Teacher, Parent) to manage study periods (e.g., 2026/2027), student enrollments, grading, attendance, and bulk reporting.

## Technology Stack
*   **Frontend Framework:** Next.js (App Router, configured as an SPA utilizing client-side routing).
*   **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage).
*   **Styling & UI Components:** 
    *   **Tailwind CSS:** For primary utility-first styling.
    *   **shadcn/ui & Radix UI:** For accessible, customizable, and modern unstyled component primitives.
    *   **Lucide React:** For modern, consistent iconography.
*   **Key Libraries:** 
    *   Excel parsing: `xlsx` or `SheetJS` (for bulk student/class imports).
    *   PDF Generation: `@react-pdf/renderer`, `pdfmake`, or `jsPDF` (for report cards).

## UI/UX & Modern Styling Standards
*   **Design Aesthetic:** Maintain a clean, minimalist design with ample whitespace. The UI should balance a professional administrative look with a friendly, accessible feel for parents.
*   **Typography (Two-Font System):** 
    *   **Plus Jakarta Sans:** Use for headings, app titles, and brand elements (adds a modern, friendly touch).
    *   **Inter:** Use for body text, data tables, and dense UI components (ensures high legibility).
*   **Color Palette ("Playful Professional"):**
    *   *Primary & Accents:* Soft Indigo (`indigo-500` / `#6366F1`) for primary actions/trust. Warm Coral (`#FF7A59`) for secondary actions/playful highlights. Mint Green (`teal-400` / `#2DD4BF`) for decorative elements.
    *   *Backgrounds & Surfaces:* Slate Off-White (`slate-50` / `#F8FAFC`) for app backgrounds, and Pure White (`#FFFFFF`) for cards and modals.
    *   *Text:* Deep Slate (`slate-900` / `#0F172A`) for primary text, and Muted Slate (`slate-500` / `#64748B`) for secondary text/table headers.
    *   *Semantic/Status:* Emerald (`emerald-500`) for Present/Success, Amber (`amber-500`) for Late/Warning, Rose (`rose-500`) for Absent/Error.
*   **Component Styling:** Use generous border radiuses (`rounded-xl` or `rounded-2xl`) on cards and buttons to avoid rigid, corporate aesthetics.
*   **Micro-interactions & States:** Implement smooth state transitions and hover effects. Prefer **skeleton loaders** over basic spinners for data fetching states.
*   **Responsive Design:** Use mobile-first design principles heavily for Parent and Teacher interfaces. Ensure complex Admin interfaces are optimized for desktop/tablet but remain functional on smaller screens.

## Language & Localization Rules
*   **User Interface (UI):** All user-facing text, error messages, placeholders, and tooltips **must** be written strictly in **Bahasa Indonesia**.
*   **Codebase (Variables/Logic):** Write all variables, functions, database tables, and code comments in **English** to maintain standard development practices.
*   **Date & Academic Formats:** Academic years (Study Periods) must follow the `YYYY/YYYY` format (e.g., "2026/2027"). Dates should be formatted according to Indonesian locales (e.g., `DD MMMM YYYY`).

## Architecture & Coding Standards
*   **Client-Side Navigation:** Prioritize Next.js `<Link>` components and `useRouter` to maintain the SPA feel without full page reloads.
*   **Role-Based Access Control (RBAC):** Always implement strict authorization checks. Verify user roles (Admin, Teacher, Parent) via Supabase Auth and Middleware before rendering views or executing server actions.
*   **Row Level Security (RLS):** When writing database queries or suggesting database schemas, ensure Supabase RLS policies enforce that:
    *   Admins have global CRUD access.
    *   Teachers only access data for their assigned classes/students.
    *   Parents only access data linked to their specific children.
*   **Data Fetching:** Utilize Supabase Javascript client securely. Prefer Server Components for initial data loads where SEO/speed benefits exist, but rely on Client Components where heavy SPA interactivity is required.

## Core Domain Logic (KinderX)
When writing logic for specific features, adhere to these domain rules:
*   **Study Periods:** All data (classes, students, curricula) is cyclical and must be explicitly tied to a `study_period_id`. Ensure active/inactive states are checked before writing new data.
*   **Bulk Operations:** When implementing imports, always include data validation steps before inserting records into Supabase to prevent corrupted batch updates.
*   **Report Generation:** PDF templates must map dynamically to the curriculum defined for that specific class and study period. Ensure batch generation operates asynchronously to prevent UI blocking.