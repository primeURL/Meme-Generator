import MemeGenerator from '@/components/meme/MemeGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Meme Generator</h1>
          <p className="text-gray-600">Create hilarious memes with AI</p>
        </div>
      </header>
      
      <main className="py-8">
        <MemeGenerator />
      </main>
      
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>Built with Next.js and Supabase</p>
        </div>
      </footer>
    </div>
  )
}
