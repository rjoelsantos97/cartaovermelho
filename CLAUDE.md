# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Cartão Vermelho News** - a Portuguese sports news webapp that transforms serious sports news into sensationalized dramatic content using AI. The project scrapes sports news from abola.pt and uses LLM processing to create dramatic, TV-style content.

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase Local
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Scraping**: Cheerio + Puppeteer
- **LLM**: OpenRouter API
- **Deployment**: Docker Compose

## Current Project Status

**Active Development Phase** - Currently implementing Phase 1 as outlined in `plano_fase_1.md`. Check that file for current progress and task status.

## Important Files to Track

- **plano_fase_1.md**: Current implementation plan with task checklist and progress notes
- **sports_news_prd.md**: Original product requirements document
- **.env.local**: Environment variables (create from .env.example)

## Key Architecture Components

### Core Systems
1. **Scraping System**: Automated scraping from abola.pt with configurable intervals
2. **LLM Processing**: Transform articles using OpenRouter API with custom "Cartão Vermelho" prompts
3. **Admin Dashboard**: Full control panel for managing content and jobs
4. **Public Interface**: Dramatic sports news feed with categories and search

### Database Structure
- `original_articles`: Scraped content storage
- `processed_articles`: LLM-transformed content
- `scraping_config`: Scraping settings and intervals
- `async_jobs`: Queue system for processing

### Application Structure (Planned)
```
src/
├── app/                     # App Router do Next.js 14+
│   ├── (public)/           # Rotas públicas
│   │   ├── page.tsx        # Homepage
│   │   └── article/[id]/   # Página de artigo
│   └── admin/              # Rotas protegidas
│       ├── layout.tsx      # Layout com auth
│       └── dashboard/      # Dashboard admin
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── common/             # Header, Footer, Loading
│   ├── articles/           # ArticleCard, ArticleList
│   └── admin/              # Dashboard components
├── lib/
│   ├── supabase/          # Cliente e tipos
│   ├── scraping/          # Lógica de scraping
│   └── llm/               # Integração OpenRouter
└── styles/
    └── globals.css        # Estilos globais com paleta
```

## Development Setup (When Implementing)

### Local Development
```bash
# Supabase Local
npx supabase start

# Install dependencies
npm install

# Development server
npm run dev
```

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Docker Deployment
```bash
# Full deployment
docker-compose up -d

# Check services
docker-compose ps
```

## Design System

### Color Palette
- **Oxford Blue**: #0a1128 (primary dark)
- **Penn Blue**: #001f54 (secondary dark)
- **Indigo Dye**: #034078 (accent)
- **Cerulean**: #1282a2 (highlights)
- **Off-white**: #fefcfb (background)

### Typography
- **Headlines**: Oswald (dramatic titles)
- **Body**: Inter (content)

### Key UI Components
- DramaticCard: Article cards with urgency levels
- BreakingNewsBanner: Scrolling news ticker
- Admin Dashboard: Control panel with real-time updates

## Core Features

### Content Processing
- **Scraping**: Automated extraction from abola.pt
- **LLM Transform**: Convert serious news to dramatic content
- **Categorization**: Football, Other Sports, International
- **Urgency Levels**: Low, Medium, High, Breaking

### Admin Features
- Real-time job monitoring
- Scraping configuration
- Content moderation
- Performance analytics

## Security Considerations

- Supabase Auth for admin access
- Rate limiting for scraping
- Input validation and sanitization
- Secure API key management

## Development Notes

- Project emphasizes dramatic, TV-style presentation
- Content should maintain Portuguese sports focus
- All scraping respects robots.txt and rate limits
- LLM processing includes fallback and retry logic
- Mobile-first responsive design approach
- **ALWAYS UPDATE plano_fase_1.md when completing tasks**
- Admin dashboard uses total article counts from database (not limited queries)
- Homepage displays all published articles across multiple sections

## Implementation Phases

1. **Phase 1**: Basic scraping, LLM integration, simple interface
2. **Phase 2**: Admin dashboard, async job system, UI improvements
3. **Phase 3**: Optimization, testing, deployment

## Common Tasks (When Implemented)

Since this is a planning phase, standard development commands would be:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Code linting
- `npm test` - Run tests
- `docker-compose up` - Start full stack

## Content Guidelines

- Maintain dramatic, sensationalized tone
- Focus on Portuguese sports (primarily football)
- Ensure content remains appropriate despite dramatic style
- Respect original source attribution

## Claude Assistant Guidance

- Use sempre mcp context7 para documentação para te manteres atualizado
- usa sempre MCP context7 para documentaçao de librarias