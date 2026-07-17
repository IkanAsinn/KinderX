-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent');

-- Users table extending auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Periods
CREATE TABLE public.study_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "2026/2027"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Assignments (Junction for Student, Class, Teacher, Study Period)
CREATE TABLE public.class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  study_period_id UUID REFERENCES public.study_periods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curricula
CREATE TABLE public.curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  study_period_id UUID REFERENCES public.study_periods(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_assignment_id UUID REFERENCES public.class_assignments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_assignment_id UUID REFERENCES public.class_assignments(id) ON DELETE CASCADE,
  curriculum_id UUID REFERENCES public.curricula(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  behavioral_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Basic admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users RLS
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (id = auth.uid());

-- Study Periods RLS
CREATE POLICY "Admins can manage study periods" ON public.study_periods FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view study periods" ON public.study_periods FOR SELECT USING (true);

-- Classes RLS
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT USING (true);

-- Class Assignments RLS
CREATE POLICY "Admins can manage assignments" ON public.class_assignments FOR ALL USING (public.is_admin());
CREATE POLICY "Teachers can view their class assignments" ON public.class_assignments FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Parents can view their child's assignments" ON public.class_assignments FOR SELECT USING (student_id = auth.uid());
