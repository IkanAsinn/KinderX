# Product Requirements Document: KinderX

**Product Name:** KinderX
**Platform:** Web Application (Single Page Application - SPA)
**Primary Tech Stack:** Next.js (Frontend framework), Supabase (PostgreSQL Database, Auth, Storage)
**Application Language (UI):** Bahasa Indonesia

## 1. Product Overview

KinderX is a responsive kindergarten management platform designed to streamline administrative operations, facilitate teacher tasks, and provide transparency for parents. The core functionality revolves around managing cyclical academic "Study Periods" (e.g., 2026/2027), processing student enrollments in bulk, and maintaining clear communication and reporting across all stakeholders. The platform will feature a **modern, intuitive, and highly polished user interface**. The entire user interface (UI) and all generated reports will be in Bahasa Indonesia.

## 2. Target Audience & User Roles

The system operates with Role-Based Access Control (RBAC) supporting three primary user types:

* **Admin:** Kindergarten management staff responsible for enrollment, curriculum, staff management, and system-wide announcements.
* **Teacher:** Educators who manage daily classroom activities, grading, and attendance.
* **Parent:** Guardians who need visibility into their child's academic progress, attendance, and school announcements.

---

## 3. Core Features by User Role

### 3.1 Admin Features

Admins have full CRUD (Create, Read, Update, Delete) access to the core entities of the kindergarten.

* **Study Period Management:**
* Create and configure new study periods using the format `YYYY/YYYY` (e.g., "2026/2027", "2027/2028").
* Set active/inactive statuses for current study periods to control where new data is routed.


* **Student Management & Onboarding:**
* Add new students (profile details including date of birth, gender, photo upload, and parent linkage).
* Automatically calculate and display current age based on date of birth.
* Assign students to specific classes within a study period.
* **Bulk Operations:** Import `.xlsx` files to batch-create new students or batch-assign existing students to classes.
* Automated tuition calculation based on class, schedule, or defined parameters.


* **Teacher Management:**
* Onboard new teachers and create their system credentials.
* Assign teachers to specific classes for a given study period.
* Terminate or deactivate teacher accounts.


* **Curriculum Management:**
* Define and maintain the curriculum/syllabus for each class, tied to specific study periods.


* **Announcement System:**
* Create school-wide or targeted announcements.
* **Display Configuration:** Choose how the announcement is delivered (Standard Dashboard Feed vs. Modal Pop-up on login).


* **Bulk PDF Reporting:**
* Dashboard to view all students in a class/period.
* Select multiple students via checkboxes to trigger batch PDF generation of report cards (output in Bahasa Indonesia).



### 3.2 Teacher Features

Teachers have scoped access restricted to their assigned classes and students.

* **Classroom Management:** View assigned classes, curriculum, and student rosters for the active study period.
* **Attendance Tracking:** Log daily attendance for students in their assigned classes.
* **Grading & Assessments:** Input grades, behavioral notes, and assessment scores mapped to the defined curriculum.

### 3.3 Parent Features

Parents have read-only access restricted strictly to their linked children.

* **Student Dashboard:** View their child's profile, assigned class, and teacher information.
* **Academic Progress:** View real-time grades, assessments, and attendance records.
* **Self-Serve Reporting:** Generate and download their child's official PDF report card on demand.
* **Communications:** View Admin announcements (dashboard feed or pop-up, as configured by the Admin).

---

## 4. Technical Requirements

### 4.1 Architecture & Stack

* **Framework:** Next.js configured as a Single Page Application (SPA). Use client-side routing to ensure snappy, app-like navigation without full page reloads.
* **Backend as a Service (BaaS):** Supabase.
* *Database:* PostgreSQL for relational data (Users, Classes, Grades, etc.).
* *Auth:* Supabase Authentication for secure login and role management.
* *Storage:* Supabase Storage for student photos and generated PDF caching.


* **Localization (i18n):** Hardcode the UI in Bahasa Indonesia or implement a localization library (like `next-intl`) setting Bahasa Indonesia as the strict default/only locale.

### 4.2 UI/UX & Modern Styling Requirements

The application must adhere to modern web design standards to ensure high usability and visual appeal:

* **Design Language:** Clean, minimalist aesthetic with ample whitespace. The design should balance a professional administrative look (for Admins) with a friendly, accessible feel (for Parents).
* **Styling Tools:** Utilize **Tailwind CSS** alongside a modern unstyled component library like **shadcn/ui** or **Radix UI** to build accessible, highly customizable components without heavy framework bloat.
* **Interactivity & Micro-interactions:** Implement smooth state transitions, hover effects, and loading states (e.g., skeleton loaders instead of basic spinners) to make the SPA feel fluid and responsive.
* **Typography & Colors:** Use modern sans-serif web fonts (e.g., Inter, Roboto, or Plus Jakarta Sans). Maintain a consistent, semantic color palette (primary branding colors, clear success/error/warning indicators).
* **Responsive Design:** The layout must adapt seamlessly across screen sizes. Mobile-first design principles should be applied heavily for Parent features, while complex Admin features (like bulk reporting dashboards) must be optimized for desktop/tablet viewing.

### 4.3 Key Integrations & Libraries

* **Excel Parsing:** A library like `xlsx` or `SheetJS` to handle the admin's bulk import requirements securely on the client or server side.
* **PDF Generation:** A robust PDF generation library (e.g., `pdfmake`, `jsPDF`, or `@react-pdf/renderer`) capable of handling complex layouts for report cards and bulk processing.

---

## 5. Data Model Considerations (High-Level)

To support the cyclical nature of kindergarten management, the database schema must be highly relational:

* `Users` (Base table with Role enum: Admin, Teacher, Parent. Includes `email` and `photo_url` for administrative visibility).
* `Study_Periods` (ID, Name [e.g., "2026/2027"], Start_Date, End_Date, Is_Active)
* `Classes` (ID, Name, Capacity)
* `Class_Assignments` (Junction table linking Student, Class, Teacher, and Study_Period)
* `Curricula` (Linked to Class and Study_Period)
* `Grades` / `Attendance` (Linked to Student, Class_Assignment, and Date)