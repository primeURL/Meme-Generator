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

// Real working meme template URLs mapping
const imageUrlUpdates = {
  'Drake Pointing': 'https://i.imgflip.com/30b1gx.jpg',
  'Distracted Boyfriend': 'https://i.imgflip.com/1ur9b0.jpg',
  'This is Fine': 'https://i.imgflip.com/26am.jpg',
  'Woman Yelling at Cat': 'https://i.imgflip.com/345v97.jpg',
  'Expanding Brain': 'https://i.imgflip.com/1jhl9a.jpg',
  'Change My Mind': 'https://i.imgflip.com/24y43o.jpg',
  'Mocking SpongeBob': 'https://i.imgflip.com/1otk96.jpg',
  'Two Buttons': 'https://i.imgflip.com/1g8my4.jpg',
  'Surprised Pikachu': 'https://i.imgflip.com/2kbn1e.jpg',
  'Philosoraptor': 'https://i.imgflip.com/qem4z.jpg'
}

async function updateExistingTemplates() {
  try {
    console.log('🔄 Updating existing templates with real image URLs...')
    
    // First, get all existing templates
    const { data: existingTemplates, error: fetchError } = await supabase
      .from('meme_templates')
      .select('id, name, image_url')
    
    if (fetchError) {
      console.error('❌ Error fetching existing templates:', fetchError.message)
      return
    }
    
    console.log(`📋 Found ${existingTemplates.length} existing templates`)
    
    let updateCount = 0
    
    // Update each template with real image URL
    for (const template of existingTemplates) {
      const newImageUrl = imageUrlUpdates[template.name]
      
      if (newImageUrl && newImageUrl !== template.image_url) {
        try {
          const { error: updateError } = await supabase
            .from('meme_templates')
            .update({ image_url: newImageUrl })
            .eq('id', template.id)
          
          if (updateError) {
            console.log(`❌ Failed to update ${template.name}: ${updateError.message}`)
          } else {
            console.log(`✅ Updated ${template.name} with new image URL`)
            updateCount++
          }
        } catch (err) {
          console.log(`❌ Error updating ${template.name}: ${err.message}`)
        }
      } else {
        console.log(`⏭️  Skipped ${template.name} (no update needed or URL not found)`)
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} templates!`)
    
    // Test image URLs
    console.log('\n🧪 Testing updated image URLs...')
    const testUrls = Object.entries(imageUrlUpdates).slice(0, 5)
    
    for (const [name, url] of testUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        const status = response.ok ? '✅' : '❌'
        console.log(`${status} ${name}: ${response.status}`)
      } catch (error) {
        console.log(`❌ ${name}: Failed to test`)
      }
    }
    
    // Verify final database content
    console.log('\n📋 Final database content:')
    const { data: finalTemplates, error: finalError } = await supabase
      .from('meme_templates')
      .select('name, image_url, tags')
      .order('created_at', { ascending: true })
    
    if (finalError) {
      console.error('❌ Error fetching final templates:', finalError.message)
    } else {
      finalTemplates.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name}`)
        console.log(`   🖼️  ${template.image_url}`)
        console.log(`   🏷️  ${template.tags.join(', ')}`)
        console.log('')
      })
    }
    
    console.log('🎉 Database updated successfully!')
    console.log('💡 Refresh your application to see the templates with real images!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

updateExistingTemplates()