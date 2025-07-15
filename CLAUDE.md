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

**PROJETO CONCLUÍDO E OPERACIONAL** - Fase 1 completamente implementada com sistema automático funcionando. Ver `plano_fase_1.md` para detalhes completos do progresso.

## Important Files to Track

- **plano_fase_1.md**: Current implementation plan with task checklist and progress notes
- **sports_news_prd.md**: Original product requirements document
- **.env.local**: Environment variables (create from .env.example)

## Key Architecture Components

### Core Systems
1. **Scraping System**: Automated scraping from abola.pt with schedulers (every hour) ✅
2. **LLM Processing**: Transform articles using OpenRouter API with custom "Cartão Vermelho" prompts ✅
3. **Admin Dashboard**: Full control panel for managing content and jobs with real-time monitoring ✅
4. **Public Interface**: Dramatic sports news feed with categories and search ✅

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
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For automatic scheduler
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
- Real-time job monitoring with scheduler controls ✅
- Scraping configuration and manual triggers ✅
- Content moderation and publishing controls ✅
- Performance analytics with accurate counters ✅
- Automatic scheduler management (start/stop/status) ✅

## Security Considerations

- **Supabase Auth for admin access** ✅ **IMPLEMENTADO**
- **Middleware authentication** ✅ **IMPLEMENTADO**
- **Protected admin routes** ✅ **IMPLEMENTADO**
- **API endpoint protection** ✅ **IMPLEMENTADO**
- **Session management** ✅ **IMPLEMENTADO**
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
- **Automatic schedulers**: Scraping (1h) + Full pipeline (2h) run automatically on app start
- **Scheduler controls**: Full start/stop/status management via admin dashboard
- **Security structure**: Login page unprotected, dashboard protected by AuthGuard
- **No pre-filled credentials**: Login fields empty for security best practices

## Implementation Phases

1. **Phase 1**: Basic scraping, LLM integration, simple interface ✅ **CONCLUÍDO**
2. **Phase 2**: Admin dashboard, async job system, UI improvements ✅ **CONCLUÍDO**
3. **Phase 3**: Optimization, testing, deployment ⏳ **Opcional**

## Common Tasks (Sistema Implementado)

Comandos de desenvolvimento disponíveis:
- `npm run dev` - Start development server (schedulers auto-start)
- `npm run build` - Build for production
- `npm run lint` - Code linting
- `npm test` - Run tests
- `docker-compose up` - Start full stack

### URLs Importantes
- **Homepage**: `http://localhost:3000` - Interface pública
- **Admin Login**: `http://localhost:3000/admin/login` - Login de administrador
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard` - Controlo do sistema (protegido)
- **Supabase Studio**: `http://127.0.0.1:54323` - Gestão da BD

### Criação de Utilizador Admin
Para criar o utilizador admin inicial:
```bash
node scripts/diagnose-auth.js
```
**Credenciais padrão:**
- Email: `admin@cartaovermelho.pt`
- Password: `admin123`

**Nota:** Campos de login não vêm pré-preenchidos por razões de segurança.

### Segurança Implementada
- **Middleware de autenticação** protege todas as rotas `/admin/*` e APIs críticas
- **Login obrigatório** para aceder ao dashboard admin
- **Validação de tokens** em todos os endpoints API protegidos
- **Logout funcional** com limpeza de sessão
- **Redirecionamento automático** para login quando não autenticado
- **Estrutura de layouts segura** - Login sem AuthGuard, Dashboard com AuthGuard
- **Campos de login vazios** - Sem credenciais pré-preenchidas por segurança

## Content Guidelines

- Maintain dramatic, sensationalized tone
- Focus on Portuguese sports (primarily football)
- Ensure content remains appropriate despite dramatic style
- Respect original source attribution

## Claude Assistant Guidance

- Use sempre mcp context7 para documentação para te manteres atualizado
- usa sempre MCP context7 para documentaçao de librarias