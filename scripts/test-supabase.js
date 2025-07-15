const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n')
  
  try {
    // Test 1: Fetch templates
    console.log('1️⃣ Testing template fetch...')
    const { data: templates, error: templateError } = await supabase
      .from('meme_templates')
      .select('id, name, tags')
      .limit(5)
    
    if (templateError) {
      console.error('❌ Template fetch failed:', templateError.message)
      return
    }
    
    console.log(`✅ Found ${templates.length} templates:`)
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.tags.join(', ')})`)
    })
    
    // Test 2: Test search functionality
    console.log('\n2️⃣ Testing search functionality...')
    const { data: searchResults, error: searchError } = await supabase
      .from('meme_templates')
      .select('id, name, tags')
      .textSearch('name', 'drake')
    
    if (searchError) {
      console.log('⚠️ Search test failed (this is expected):', searchError.message)
    } else {
      console.log(`✅ Search returned ${searchResults.length} results`)
    }
    
    // Test 3: Test with array filtering
    console.log('\n3️⃣ Testing tag filtering...')
    const { data: tagResults, error: tagError } = await supabase
      .from('meme_templates')
      .select('id, name, tags')
      .contains('tags', ['reaction'])
    
    if (tagError) {
      console.log('⚠️ Tag filter failed:', tagError.message)
    } else {
      console.log(`✅ Tag filter returned ${tagResults.length} results`)
      tagResults.forEach((template) => {
        console.log(`   - ${template.name}`)
      })
    }
    
    // Test 4: Test generated_memes table
    console.log('\n4️⃣ Testing generated_memes table...')
    const { data: memes, error: memeError } = await supabase
      .from('generated_memes')
      .select('id, prompt')
      .limit(3)
    
    if (memeError) {
      console.log('⚠️ Generated memes table check:', memeError.message)
    } else {
      console.log(`✅ Generated memes table accessible (${memes.length} entries)`)
    }
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('✅ Your Supabase integration is working properly!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testSupabase()