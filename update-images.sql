-- Update meme templates with real working image URLs from Imgflip
-- Run this in your Supabase SQL Editor

UPDATE meme_templates SET image_url = 'https://i.imgflip.com/30b1gx.jpg' WHERE name = 'Drake Pointing';
UPDATE meme_templates SET image_url = 'https://i.imgflip.com/1ur9b0.jpg' WHERE name = 'Distracted Boyfriend';
UPDATE meme_templates SET image_url = 'https://i.imgflip.com/26am.jpg' WHERE name = 'This is Fine';
UPDATE meme_templates SET image_url = 'https://i.imgflip.com/345v97.jpg' WHERE name = 'Woman Yelling at Cat';
UPDATE meme_templates SET image_url = 'https://i.imgflip.com/1jhl9a.jpg' WHERE name = 'Expanding Brain';

-- Add more popular meme templates with real images
INSERT INTO meme_templates (name, image_url, description, tags) VALUES
('Change My Mind', 'https://i.imgflip.com/24y43o.jpg', 'Steven Crowder at table with sign', ARRAY['debate', 'opinion', 'controversy']),
('Mocking SpongeBob', 'https://i.imgflip.com/1otk96.jpg', 'SpongeBob with alternating caps', ARRAY['mocking', 'sarcasm', 'spongebob']),
('Two Buttons', 'https://i.imgflip.com/1g8my4.jpg', 'Person sweating over two choices', ARRAY['decision', 'dilemma', 'choice']),
('Surprised Pikachu', 'https://i.imgflip.com/2kbn1e.jpg', 'Pikachu with surprised expression', ARRAY['surprise', 'shock', 'pokemon']),
('One Does Not Simply', 'https://i.imgflip.com/1bij.jpg', 'Boromir from Lord of the Rings', ARRAY['lotr', 'boromir', 'difficulty']),
('Hide the Pain Harold', 'https://i.imgflip.com/gk5el.jpg', 'Harold hiding pain with smile', ARRAY['harold', 'pain', 'smile']),
('Success Kid', 'https://i.imgflip.com/1bhf.jpg', 'Kid with successful fist pump', ARRAY['success', 'kid', 'victory']),
('Batman Slapping Robin', 'https://i.imgflip.com/9ehk.jpg', 'Batman slapping Robin', ARRAY['batman', 'robin', 'slap']),
('Disaster Girl', 'https://i.imgflip.com/1pz9a4.jpg', 'Girl smiling in front of fire', ARRAY['disaster', 'girl', 'fire']),
('Bad Luck Brian', 'https://i.imgflip.com/1bip.jpg', 'Brian with bad luck expression', ARRAY['bad luck', 'brian', 'unfortunate'])

ON CONFLICT (name) DO UPDATE SET 
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    updated_at = NOW();

-- Verify the updates
SELECT name, image_url, array_to_string(tags, ', ') as tags_str FROM meme_templates ORDER BY created_at;