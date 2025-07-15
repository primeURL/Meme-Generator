# Meme Generator

A Next.js-based meme generator application similar to SuperMeme.ai that allows users to create memes using AI-powered text-to-meme generation.

## Features

- **Text-to-Meme Generation**: Enter a prompt and generate contextually appropriate memes
- **Template Selection**: Choose from a curated collection of popular meme templates
- **Canvas-based Text Overlay**: Dynamic text positioning and styling
- **Template Search**: Find templates by name or tags
- **Download & Share**: Export generated memes or share them directly

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **TypeScript**: Full type safety
- **Canvas API**: For text overlay and image manipulation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following Supabase tables:

### `meme_templates`
- `id` (uuid, primary key)
- `name` (text)
- `image_url` (text)
- `description` (text, nullable)
- `tags` (text array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `generated_memes`
- `id` (uuid, primary key)
- `prompt` (text)
- `template_id` (uuid, foreign key)
- `image_url` (text)
- `created_at` (timestamp)

## Development Roadmap

### Phase 1: MVP (Current)
- [x] Basic Next.js setup with TypeScript
- [x] Supabase integration
- [x] Basic UI components
- [x] Template selection system
- [x] Canvas-based meme preview
- [ ] Template database setup
- [ ] Basic text-to-meme generation

### Phase 2: AI Integration
- [ ] LLM integration for caption generation
- [ ] Template recommendation system
- [ ] Multiple output variations
- [ ] Advanced text positioning

### Phase 3: Advanced Features
- [ ] Custom template uploads
- [ ] User accounts and history
- [ ] Social media export formats
- [ ] API endpoints
- [ ] Performance optimizations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
