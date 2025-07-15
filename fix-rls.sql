-- Temporarily disable RLS for data insertion
ALTER TABLE meme_templates DISABLE ROW LEVEL SECURITY;

-- OR add a policy for authenticated users to insert
-- CREATE POLICY "Authenticated users can insert templates" ON meme_templates
--     FOR INSERT WITH CHECK (true);

-- Make sure public can read
CREATE POLICY "Public read access for meme_templates" ON meme_templates
    FOR SELECT USING (true);

-- Allow public insert for now (you can restrict this later)
CREATE POLICY "Public insert access for meme_templates" ON meme_templates
    FOR INSERT WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE meme_templates ENABLE ROW LEVEL SECURITY;