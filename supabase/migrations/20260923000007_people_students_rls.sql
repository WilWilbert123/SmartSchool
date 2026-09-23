-- RLS Policies for People, Students, Employees, and Teachers

CREATE POLICY "Authenticated users can select people" ON people FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert people" ON people FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update people" ON people FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete people" ON people FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert students" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update students" ON students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete students" ON students FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert employees" ON employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employees" ON employees FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select teachers" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert teachers" ON teachers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update teachers" ON teachers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete teachers" ON teachers FOR DELETE TO authenticated USING (true);
