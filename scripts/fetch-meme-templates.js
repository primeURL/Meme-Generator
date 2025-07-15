const { createClient } = require('@supabase/supabase-js')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapping of meme names to tags for better categorization
const memeTagMapping = {
  'Drake Pointing': ['reaction', 'choice', 'drake', 'approval'],
  'Distracted Boyfriend': ['choice', 'temptation', 'relationship', 'decision'],
  'This is Fine': ['chaos', 'calm', 'disaster', 'dog'],
  'Woman Yelling at Cat': ['argument', 'confusion', 'reaction', 'cat'],
  'Expanding Brain': ['intelligence', 'progression', 'comparison', 'brain'],
  'Change My Mind': ['debate', 'opinion', 'controversy', 'steven crowder'],
  'Mocking SpongeBob': ['mocking', 'sarcasm', 'spongebob', 'alternating'],
  'Two Buttons': ['decision', 'dilemma', 'choice', 'sweating'],
  'Surprised Pikachu': ['surprise', 'shock', 'pokemon', 'pikachu'],
  'Philosoraptor': ['philosophy', 'thinking', 'questions', 'dinosaur'],
  'One Does Not Simply': ['lord of the rings', 'boromir', 'difficulty', 'meme'],
  'Batman Slapping Robin': ['batman', 'robin', 'slap', 'correction'],
  'Hide the Pain Harold': ['harold', 'pain', 'smile', 'hiding'],
  'Disaster Girl': ['disaster', 'girl', 'fire', 'evil smile'],
  'Success Kid': ['success', 'kid', 'victory', 'fist pump'],
  'Bad Luck Brian': ['bad luck', 'brian', 'unfortunate', 'glasses'],
  'Overly Attached Girlfriend': ['girlfriend', 'obsessive', 'crazy', 'stare'],
  'Ancient Aliens': ['aliens', 'history channel', 'conspiracy', 'giorgio'],
  'First World Problems': ['problems', 'privileged', 'complaints', 'woman'],
  'Grumpy Cat': ['grumpy', 'cat', 'frown', 'no']
}

async function fetchAndUpdateTemplates() {
  try {
    console.log('🌐 Fetching meme templates from Imgflip API...')
    
    // Fetch from Imgflip API
    const response = await fetch('https://api.imgflip.com/get_memes')
    const data = await response.json()
    
    if (!data.success) {
      console.error('❌ Failed to fetch from Imgflip API')
      return
    }
    
    console.log(`✅ Found ${data.data.memes.length} memes from Imgflip`)
    
    // Clear existing templates
    console.log('🗑️ Clearing existing templates...')
    const { error: deleteError } = await supabase
      .from('meme_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error('❌ Error clearing templates:', deleteError.message)
      return
    }
    
    // Select top 20 most popular templates
    const topMemes = data.data.memes.slice(0, 20)
    
    console.log('📦 Preparing templates for database...')
    const templatesForDB = topMemes.map((meme, index) => ({
      name: meme.name,
      image_url: meme.url,
      description: `${meme.name} meme template - ${meme.width}x${meme.height}`,
      tags: memeTagMapping[meme.name] || ['meme', 'template', 'popular']
    }))
    
    // Insert into database
    console.log('💾 Inserting templates into Supabase...')
    const { data: insertedTemplates, error: insertError } = await supabase
      .from('meme_templates')
      .insert(templatesForDB)
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting templates:', insertError.message)
      return
    }
    
    console.log(`✅ Successfully inserted ${insertedTemplates.length} templates!`)
    
    // Display the templates
    console.log('\n📋 Inserted Templates:')
    insertedTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`)
      console.log(`   🖼️  Image: ${template.image_url}`)
      console.log(`   🏷️  Tags: ${template.tags.join(', ')}`)
      console.log('')
    })
    
    // Test a few image URLs
    console.log('🧪 Testing image URLs...')
    const testUrls = insertedTemplates.slice(0, 3)
    
    for (const template of testUrls) {
      try {
        const imageResponse = await fetch(template.image_url, { method: 'HEAD' })
        const status = imageResponse.ok ? '✅' : '❌'
        console.log(`${status} ${template.name}: ${imageResponse.status}`)
      } catch (error) {
        console.log(`❌ ${template.name}: Failed to test`)
      }
    }
    
    console.log('\n🎉 Database updated successfully!')
    console.log('💡 You can now refresh your application to see the new templates!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fetchAndUpdateTemplates()