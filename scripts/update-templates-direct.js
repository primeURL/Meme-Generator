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

// Real working meme templates with direct image URLs
const realMemeTemplates = [
  {
    name: 'Drake Pointing',
    image_url: 'https://i.imgflip.com/30b1gx.jpg',
    description: 'Drake disapproving/approving meme template',
    tags: ['reaction', 'choice', 'drake', 'approval']
  },
  {
    name: 'Distracted Boyfriend',
    image_url: 'https://i.imgflip.com/1ur9b0.jpg',
    description: 'Man looking at another woman meme template',
    tags: ['choice', 'temptation', 'relationship', 'decision']
  },
  {
    name: 'This is Fine',
    image_url: 'https://i.imgflip.com/26am.jpg',
    description: 'Dog in burning room meme template',
    tags: ['chaos', 'calm', 'disaster', 'dog']
  },
  {
    name: 'Woman Yelling at Cat',
    image_url: 'https://i.imgflip.com/345v97.jpg',
    description: 'Woman yelling at confused cat meme template',
    tags: ['argument', 'confusion', 'reaction', 'cat']
  },
  {
    name: 'Expanding Brain',
    image_url: 'https://i.imgflip.com/1jhl9a.jpg',
    description: 'Four-panel brain expansion meme template',
    tags: ['intelligence', 'progression', 'comparison', 'brain']
  },
  {
    name: 'Change My Mind',
    image_url: 'https://i.imgflip.com/24y43o.jpg',
    description: 'Steven Crowder at table with sign meme template',
    tags: ['debate', 'opinion', 'controversy', 'steven crowder']
  },
  {
    name: 'Mocking SpongeBob',
    image_url: 'https://i.imgflip.com/1otk96.jpg',
    description: 'SpongeBob with alternating caps meme template',
    tags: ['mocking', 'sarcasm', 'spongebob', 'alternating']
  },
  {
    name: 'Two Buttons',
    image_url: 'https://i.imgflip.com/1g8my4.jpg',
    description: 'Person sweating over two button choices meme template',
    tags: ['decision', 'dilemma', 'choice', 'sweating']
  },
  {
    name: 'Surprised Pikachu',
    image_url: 'https://i.imgflip.com/2kbn1e.jpg',
    description: 'Pikachu with surprised expression meme template',
    tags: ['surprise', 'shock', 'pokemon', 'pikachu']
  },
  {
    name: 'One Does Not Simply',
    image_url: 'https://i.imgflip.com/1bij.jpg',
    description: 'Boromir from Lord of the Rings meme template',
    tags: ['lord of the rings', 'boromir', 'difficulty', 'simply']
  },
  {
    name: 'Hide the Pain Harold',
    image_url: 'https://i.imgflip.com/gk5el.jpg',
    description: 'Harold hiding pain with smile meme template',
    tags: ['harold', 'pain', 'smile', 'hiding']
  },
  {
    name: 'Success Kid',
    image_url: 'https://i.imgflip.com/1bhf.jpg',
    description: 'Kid with successful fist pump meme template',
    tags: ['success', 'kid', 'victory', 'fist pump']
  }
]

async function updateTemplatesWithRealImages() {
  try {
    console.log('🗑️ Clearing existing templates...')
    
    // Delete all existing templates
    const { error: deleteError } = await supabase
      .from('meme_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteError) {
      console.log('⚠️ Delete error (might be RLS):', deleteError.message)
    }
    
    console.log('💾 Inserting real meme templates...')
    
    // Insert templates one by one to handle RLS issues
    let successCount = 0
    
    for (const template of realMemeTemplates) {
      try {
        const { data, error } = await supabase
          .from('meme_templates')
          .insert([template])
          .select()
        
        if (error) {
          console.log(`❌ Failed to insert ${template.name}: ${error.message}`)
        } else {
          console.log(`✅ Inserted: ${template.name}`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ Error inserting ${template.name}: ${err.message}`)
      }
    }
    
    console.log(`\n🎉 Successfully inserted ${successCount}/${realMemeTemplates.length} templates!`)
    
    // Test image URLs
    console.log('\n🧪 Testing image URLs...')
    const testTemplates = realMemeTemplates.slice(0, 3)
    
    for (const template of testTemplates) {
      try {
        const response = await fetch(template.image_url, { method: 'HEAD' })
        const status = response.ok ? '✅' : '❌'
        console.log(`${status} ${template.name}: ${response.status}`)
      } catch (error) {
        console.log(`❌ ${template.name}: Failed to test`)
      }
    }
    
    // Verify database content
    console.log('\n📋 Verifying database content...')
    const { data: allTemplates, error: fetchError } = await supabase
      .from('meme_templates')
      .select('name, image_url, tags')
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      console.error('❌ Error fetching templates:', fetchError.message)
    } else {
      console.log(`✅ Database contains ${allTemplates.length} templates:`)
      allTemplates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name} (${template.tags.join(', ')})`)
      })
    }
    
    console.log('\n🎉 Database updated successfully!')
    console.log('💡 Refresh your application to see the new templates with real images!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

updateTemplatesWithRealImages()