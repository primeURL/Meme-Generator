-- Create meme_templates table
CREATE TABLE meme_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_memes table
CREATE TABLE generated_memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt TEXT NOT NULL,
    template_id UUID REFERENCES meme_templates(id),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_meme_templates_tags ON meme_templates USING GIN(tags);
CREATE INDEX idx_generated_memes_template_id ON generated_memes(template_id);
CREATE INDEX idx_generated_memes_created_at ON generated_memes(created_at);

-- Insert sample meme templates
INSERT INTO meme_templates (name, image_url, description, tags) VALUES
    ('Drake Pointing', 'https://example.com/drake-pointing.jpg', 'Drake disapproving/approving meme', ARRAY['reaction', 'choice', 'drake']),
    ('Distracted Boyfriend', 'https://example.com/distracted-boyfriend.jpg', 'Man looking at another woman', ARRAY['choice', 'temptation', 'relationship']),
    ('This is Fine', 'https://example.com/this-is-fine.jpg', 'Dog in burning room', ARRAY['chaos', 'calm', 'disaster']),
    ('Woman Yelling at Cat', 'https://example.com/woman-yelling-cat.jpg', 'Woman yelling at confused cat', ARRAY['argument', 'confusion', 'reaction']),
    ('Expanding Brain', 'https://example.com/expanding-brain.jpg', 'Four-panel brain expansion meme', ARRAY['intelligence', 'progression', 'comparison']),
    ('Change My Mind', 'https://example.com/change-my-mind.jpg', 'Steven Crowder at table with sign', ARRAY['debate', 'opinion', 'controversy']),
    ('Mocking SpongeBob', 'https://example.com/mocking-spongebob.jpg', 'SpongeBob with alternating caps', ARRAY['mocking', 'sarcasm', 'spongebob']),
    ('Two Buttons', 'https://example.com/two-buttons.jpg', 'Person sweating over two button choices', ARRAY['decision', 'dilemma', 'choice']),
    ('Surprised Pikachu', 'https://example.com/surprised-pikachu.jpg', 'Pikachu with surprised expression', ARRAY['surprise', 'shock', 'pokemon']),
    ('Philosoraptor', 'https://example.com/philosoraptor.jpg', 'Thoughtful dinosaur', ARRAY['philosophy', 'thinking', 'questions']);

-- Enable Row Level Security (RLS)
ALTER TABLE meme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_memes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for meme_templates" ON meme_templates
    FOR SELECT USING (true);

CREATE POLICY "Public read access for generated_memes" ON generated_memes
    FOR SELECT USING (true);

-- Create policies for authenticated users to insert generated memes
CREATE POLICY "Authenticated users can insert generated_memes" ON generated_memes
    FOR INSERT WITH CHECK (true);