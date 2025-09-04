# Movie Search Bot

A Telegram bot for searching and downloading movies with intelligent caching using Drizzle ORM.

## Features

- 🎬 **Movie Search**: Search movies using inline mode
- 📊 **Smart Caching**: Caches movies and search results in SQLite database
- ⚙️ **Configurable Presentation**: Choose between quality-first or all-files view
- 🔗 **Direct Downloads**: Direct integration with download bot
- 💾 **Drizzle ORM**: Type-safe database operations with excellent TypeScript support

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your BOT_TOKEN to .env
   ```

3. **Initialize database**:
   ```bash
   pnpm run db:generate
   pnpm run db:push
   ```

4. **Run the bot**:
   ```bash
   # Development
   pnpm dev
   
   # Production
   pnpm build
   pnpm start
   ```

## Database Schema

### UserSettings
- `userId`: User's Telegram ID
- `presentationMode`: User's preferred view mode ('quality_first' | 'all_files')

### Movie
- `tmdbId`: TMDB movie ID
- `title`, `year`, `poster`: Basic movie info
- `type`: Movie type (movie/series)
- `imdbId`, `imdbVotes`: IMDb data
- `inviteLink`, `plot`: Additional info
- `externalId`: Original API ID

### MovieDetails
- `movieId`: Reference to Movie
- `details`: JSON string of detailed movie data (download links, qualities)

## Usage

1. **Search**: Type `@your_bot_name movie_title` in any chat
2. **Get Details**: Click "📋 Get Details" on any result
3. **Settings**: Use `/settings` to change presentation mode
4. **Download**: Click any file button to download directly

## Commands

- `/start` - Welcome message and help
- `/settings` - Change presentation mode
- `/help` - Show help information

## Database Commands

- `pnpm run db:generate` - Generate Drizzle migrations
- `pnpm run db:push` - Push schema to database
- `pnpm run db:studio` - Open Drizzle Studio (database GUI) 