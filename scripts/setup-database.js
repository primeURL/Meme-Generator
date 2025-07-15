const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log('📍 URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('\n🗄️  Setting up database...')
    
    // First, let's test the connection
    console.log('\n1️⃣  Testing connection...')
    const { data, error } = await supabase.from('meme_templates').select('count').limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('⚠️  Tables don\'t exist yet. You need to run the SQL script manually.')
      console.log('📝 Please follow these steps:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the contents of supabase-setup.sql')
      console.log('   4. Run the script')
      console.log('   5. Then run this setup script again')
      return
    }
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Check if we already have sample data
    console.log('\n2️⃣  Checking existing data...')
    const { data: existingTemplates, error: checkError } = await supabase
      .from('meme_templates')
      .select('id, name')
      .limit(5)
    
    if (checkError) {
      console.error('❌ Error checking existing data:', checkError.message)
      return
    }
    
    if (existingTemplates && existingTemplates.length > 0) {
      console.log(`✅ Found ${existingTemplates.length} existing templates:`)
      existingTemplates.forEach(template => {
        console.log(`   - ${template.name}`)
      })
      console.log('\n✅ Database setup is complete!')
      return
    }
    
    // Insert sample data
    console.log('\n3️⃣  Inserting sample meme templates...')
    const sampleTemplates = [
      {
        name: 'Drake Pointing',
        image_url: 'https://i.imgflip.com/30b1gx.jpg',
        description: 'Drake disapproving/approving meme',
        tags: ['reaction', 'choice', 'drake']
      },
      {
        name: 'Distracted Boyfriend',
        image_url: 'https://i.imgflip.com/1ur9b0.jpg',
        description: 'Man looking at another woman',
        tags: ['choice', 'temptation', 'relationship']
      },
      {
        name: 'This is Fine',
        image_url: 'https://i.imgflip.com/26am.jpg',
        description: 'Dog in burning room',
        tags: ['chaos', 'calm', 'disaster']
      },
      {
        name: 'Woman Yelling at Cat',
        image_url: 'https://i.imgflip.com/345v97.jpg',
        description: 'Woman yelling at confused cat',
        tags: ['argument', 'confusion', 'reaction']
      },
      {
        name: 'Expanding Brain',
        image_url: 'https://i.imgflip.com/1jhl9a.jpg',
        description: 'Four-panel brain expansion meme',
        tags: ['intelligence', 'progression', 'comparison']
      }
    ]
    
    const { data: insertedTemplates, error: insertError } = await supabase
      .from('meme_templates')
      .insert(sampleTemplates)
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError.message)
      return
    }
    
    console.log(`✅ Successfully inserted ${insertedTemplates.length} sample templates!`)
    
    // Verify the setup
    console.log('\n4️⃣  Verifying setup...')
    const { data: allTemplates, error: verifyError } = await supabase
      .from('meme_templates')
      .select('name, tags')
      .order('created_at', { ascending: true })
    
    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError.message)
      return
    }
    
    console.log('✅ Database verification complete!')
    console.log(`📊 Total templates: ${allTemplates.length}`)
    console.log('📝 Templates:')
    allTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.tags.join(', ')})`)
    })
    
    console.log('\n🎉 Database setup complete! You can now run your application.')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()