-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn TEXT UNIQUE,
  full_name TEXT NOT NULL,
  parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update class_assignments foreign key
ALTER TABLE public.class_assignments 
  DROP CONSTRAINT IF EXISTS class_assignments_student_id_fkey;

ALTER TABLE public.class_assignments 
  ADD CONSTRAINT class_assignments_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage students" 
  ON public.students FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Parents can view their children" 
  ON public.students FOR SELECT 
  USING (parent_id = auth.uid());

CREATE POLICY "Teachers can view students" 
  ON public.students FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );
