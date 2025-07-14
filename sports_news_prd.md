# PRD - Cartão Vermelho News App
## Webapp de Notícias Desportivas Sensacionalistas

### 1. Visão Geral do Produto

**Nome**: Cartão Vermelho News  
**Tipo**: Aplicação Web de Notícias Desportivas  
**Objetivo**: Transformar notícias desportivas sérias em conteúdo sensacionalista e cómico através de IA, mantendo um tom dramático e televisivo.

### 2. Stack Tecnológico

- **Frontend**: React 18+ com TypeScript
- **UI Framework**: Shadcn/ui + Tailwind CSS (moderna, apelativa e altamente customizável)
- **Backend**: Supabase Local
- **Database**: PostgreSQL (através do Supabase)
- **Auth**: Supabase Auth
- **Scraping**: Cheerio + Puppeteer para JavaScript
- **LLM**: OpenRouter API
- **Deployment**: Docker Compose (desenvolvimento e produção)

### 3. Funcionalidades Core

#### 3.1 Sistema de Scraping
- **Fonte**: abola.pt
- **Frequência**: Configurável (30min, 1h, 2h, 4h)
- **Processamento Assíncrono**: Queue system com retry logic
- **Filtros**: Categorias desportivas, palavras-chave, autores
- **Deduplicação**: Evitar notícias repetidas

#### 3.2 Processamento LLM
- **Provider**: OpenRouter
- **Modelo**: Configurável (GPT-4, Claude, etc.)
- **Prompt Engineering**: Template customizável do "Cartão Vermelho"
- **Fallback**: Sistema de retry em caso de falha
- **Rate Limiting**: Respeitando limites da API

#### 3.3 Interface Pública
- **Feed Principal**: Lista de notícias processadas
- **Visualização**: Artigo completo com formatação dramática
- **Categorias**: Futebol, Outros Desportos, Internacional
- **Pesquisa**: Por título, conteúdo, data
- **Partilha**: Links sociais

### 4. Arquitetura de Dados

#### 4.1 Tabelas Principais

```

#### 15.5 CSS Global & Variáveis Custom

```css
/* globals.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {
  /* Paleta principal */
  --oxford-blue: #0a1128;
  --penn-blue: #001f54;
  --indigo-dye: #034078;
  --cerulean: #1282a2;
  --off-white: #fefcfb;
  
  /* Gradientes customizados */
  --gradient-primary: linear-gradient(135deg, var(--oxford-blue), var(--penn-blue), var(--indigo-dye), var(--cerulean));
  --gradient-dramatic: linear-gradient(45deg, var(--indigo-dye), var(--cerulean), var(--off-white));
  --gradient-radial: radial-gradient(circle, var(--oxford-blue), var(--penn-blue), var(--indigo-dye), var(--cerulean));
  
  /* Sombras customizadas */
  --shadow-dramatic: 0 10px 40px -10px rgba(18, 130, 162, 0.3);
  --shadow-intense: 0 20px 60px -10px rgba(3, 64, 120, 0.4);
}

.dark {
  --oxford-blue: #0f1a35;
  --penn-blue: #1a2855;
  --indigo-dye: #1a3d70;
  --cerulean: #2a8aa8;
  --off-white: #f8f6f5;
}

/* Tipografia dramática */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

/* Animações customizadas */
@keyframes breaking-news {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

@keyframes dramatic-entrance {
  0% { 
    opacity: 0; 
    transform: translateY(30px) scale(0.95); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

/* Classes utilitárias customizadas */
.text-dramatic {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-dramatic {
  background: linear-gradient(135deg, var(--off-white) 0%, rgba(18, 130, 162, 0.05) 100%);
  border: 1px solid rgba(18, 130, 162, 0.1);
  box-shadow: var(--shadow-dramatic);
}

.card-dramatic:hover {
  box-shadow: var(--shadow-intense);
  transform: translateY(-2px);
}

/* Efeitos de glow para elementos importantes */
.glow-cerulean {
  box-shadow: 0 0 20px rgba(18, 130, 162, 0.3);
}

.glow-oxford {
  box-shadow: 0 0 20px rgba(10, 17, 40, 0.4);
}

/* Scrollbar customizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--off-white);
}

::-webkit-scrollbar-thumb {
  background: var(--cerulean);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--indigo-dye);
}
```

#### 15.6 Componentes de Admin com a Nova Paleta

```typescript
// components/admin/admin-dashboard.tsx
export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-oxford-blue via-penn-blue to-indigo-dye p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-off-white mb-2">
            PAINEL DE ADMINISTRAÇÃO
          </h1>
          <p className="text-cerulean-200">Controle total do drama desportivo</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-off-white to-cerulean-50 border-cerulean/20 shadow-dramatic">
            <CardHeader className="pb-3">
              <CardTitle className="text-oxford-blue font-headline">Artigos Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cerulean">47</div>
              <p className="text-indigo-dye text-sm">+12% vs ontem</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-off-white to-indigo-dye-50 border-indigo-dye/20 shadow-dramatic">
            <CardHeader className="pb-3">
              <CardTitle className="text-oxford-blue font-headline">Drama Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-dye">9.2/10</div>
              <p className="text-penn-blue text-sm">Nível máximo!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-off-white to-penn-blue-50 border-penn-blue/20 shadow-dramatic">
            <CardHeader className="pb-3">
              <CardTitle className="text-oxford-blue font-headline">Jobs Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-penn-blue">3</div>
              <p className="text-indigo-dye text-sm">Processando...</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-off-white to-oxford-blue-50 border-oxford-blue/20 shadow-intense">
            <CardHeader className="pb-3">
              <CardTitle className="text-oxford-blue font-headline">Visualizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-oxford-blue">15.4K</div>
              <p className="text-penn-blue text-sm">+28% esta semana</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-off-white/95 backdrop-blur border-cerulean/20 shadow-intense">
            <CardHeader>
              <CardTitle className="text-oxford-blue font-headline">Controlo de Scraping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-penn-blue font-medium">Status</span>
                <Badge className="bg-cerulean text-off-white">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-penn-blue font-medium">Próxima execução</span>
                <span className="text-indigo-dye">14:30</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-cerulean to-indigo-dye text-off-white hover:from-indigo-dye hover:to-penn-blue">
                Executar Agora
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-off-white/95 backdrop-blur border-cerulean/20 shadow-intense">
            <CardHeader>
              <CardTitle className="text-oxford-blue font-headline">Últimas Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cerulean-50 rounded-lg">
                  <div className="w-2 h-2 bg-cerulean rounded-full"></div>
                  <span className="text-penn-blue text-sm">Artigo processado: "BENFICA EM PÂNICO!"</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-dye-50 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-dye rounded-full"></div>
                  <span className="text-penn-blue text-sm">Scraping completado: 12 novos artigos</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-penn-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-penn-blue rounded-full"></div>
                  <span className="text-penn-blue text-sm">Job LLM iniciado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}sql
-- Notícias originais
CREATE TABLE original_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP,
  source_url TEXT UNIQUE,
  category TEXT,
  scraped_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Notícias processadas
CREATE TABLE processed_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID REFERENCES original_articles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  llm_model TEXT,
  status TEXT DEFAULT 'published', -- published, draft, archived
  views INTEGER DEFAULT 0
);

-- Configurações de scraping
CREATE TABLE scraping_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT TRUE,
  interval_minutes INTEGER DEFAULT 60,
  max_articles_per_run INTEGER DEFAULT 20,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs assíncronos
CREATE TABLE async_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL, -- 'scrape', 'process_llm'
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  data JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 5. Componentes da Aplicação

#### 5.1 Frontend Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Loading.tsx
│   ├── articles/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleDetail.tsx
│   │   └── ArticleList.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── ScrapingConfig.tsx
│       ├── JobsMonitor.tsx
│       └── ArticleManager.tsx
├── pages/
│   ├── Home.tsx
│   ├── Article.tsx
│   └── Admin.tsx
├── services/
│   ├── supabase.ts
│   ├── scraping.ts
│   └── llm.ts
├── hooks/
│   ├── useArticles.ts
│   ├── useAdmin.ts
│   └── useJobs.ts
└── utils/
    ├── constants.ts
    └── helpers.ts
```

#### 5.2 Painel de Admin

**Funcionalidades**:
- **Dashboard**: Estatísticas gerais, artigos processados, jobs em execução
- **Controlo de Scraping**: Ativar/desativar, configurar intervalos
- **Gestão de Artigos**: Aprovar, editar, arquivar notícias
- **Monitor de Jobs**: Status dos jobs assíncronos, logs de erro
- **Configuração LLM**: Modelo, prompt, parâmetros
- **Estatísticas**: Visualizações, artigos mais populares

### 6. Fluxo de Funcionamento

#### 6.1 Processo de Scraping
1. **Trigger**: Cron job ou manual via admin
2. **Scraping**: Extrair notícias do abola.pt
3. **Validação**: Verificar duplicados, filtrar conteúdo
4. **Armazenamento**: Guardar em `original_articles`
5. **Queue**: Criar job para processamento LLM

#### 6.2 Processamento LLM
1. **Job Processing**: Worker processa queue
2. **LLM Request**: Enviar para OpenRouter com prompt
3. **Post-processing**: Formatar resultado
4. **Armazenamento**: Guardar em `processed_articles`
5. **Notificação**: Atualizar admin dashboard

### 7. Implementação Técnica

#### 7.1 Scraping Service
```typescript
interface ScrapingService {
  scrapeArticles(): Promise<OriginalArticle[]>;
  scheduleJob(config: ScrapingConfig): void;
  processQueue(): Promise<void>;
}
```

#### 7.2 LLM Service
```typescript
interface LLMService {
  processArticle(article: OriginalArticle): Promise<ProcessedArticle>;
  generatePrompt(article: OriginalArticle): string;
  handleRateLimit(): void;
}
```

#### 7.3 Admin Dashboard Features
- **Real-time Updates**: WebSocket para jobs status
- **Bulk Operations**: Processar múltiplos artigos
- **Analytics**: Gráficos de performance
- **Logs**: Sistema de logging detalhado

### 8. Configuração do Ambiente

#### 8.1 Desenvolvimento Local
```bash
# Supabase Local
npx supabase start

# Variáveis de Ambiente
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OPENROUTER_API_KEY=your_openrouter_key
```

#### 8.2 Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend Next.js App
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://supabase-kong:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    depends_on:
      - supabase-db
      - supabase-kong
      - redis
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs

  # Supabase Database
  supabase-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_PORT: 5432
    ports:
      - "5432:5432"
    volumes:
      - supabase-data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d
    networks:
      - app-network

  # Supabase Kong (API Gateway)
  supabase-kong:
    image: kong:2.8-alpine
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl
    ports:
      - "8000:8000"
      - "8443:8443"
    volumes:
      - ./supabase/kong.yml:/var/lib/kong/kong.yml:ro
    depends_on:
      - supabase-db
    networks:
      - app-network

  # Supabase Auth
  supabase-auth:
    image: supabase/gotrue:v2.99.0
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres?search_path=auth
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_URI_ALLOW_LIST: http://localhost:3000
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
    depends_on:
      - supabase-db
    networks:
      - app-network

  # Supabase Realtime
  supabase-realtime:
    image: supabase/realtime:v2.10.1
    environment:
      PORT: 4000
      DB_HOST: supabase-db
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: postgres
      DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
      ENABLE_TAILSCALE: "false"
      FLY_ALLOC_ID: fly123
      FLY_APP_NAME: realtime
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
    depends_on:
      - supabase-db
    networks:
      - app-network

  # Redis para Queue System
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network
    command: redis-server --appendonly yes

  # Worker para Jobs Assíncronos
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres
      - REDIS_URL=redis://redis:6379
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    depends_on:
      - supabase-db
      - redis
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - supabase-kong
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  supabase-data:
  redis-data:
```

#### 8.3 Dockerfiles

**Frontend Dockerfile:**
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

**Worker Dockerfile:**
```dockerfile
# Dockerfile.worker
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY worker/ ./worker/
COPY lib/ ./lib/
USER node
CMD ["node", "worker/index.js"]
```

#### 8.4 Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream supabase {
        server supabase-kong:8000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Supabase API
        location /api/v1/ {
            proxy_pass http://supabase/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support for Realtime
        location /realtime/ {
            proxy_pass http://supabase-realtime:4000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

#### 8.5 Environment Variables

```bash
# .env
POSTGRES_PASSWORD=your_secure_password
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_min_32_chars
SECRET_KEY_BASE=your_secret_key_base_min_64_chars
OPENROUTER_API_KEY=your_openrouter_key

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 8.6 Scripts de Deploy

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Deploying Cartão Vermelho News..."

# Build and start containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
docker-compose exec supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/init.sql

# Check services health
echo "🔍 Checking services..."
docker-compose ps

echo "✅ Deploy completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 Database: localhost:5432"
echo "🔧 API: http://localhost:8000"
```

### 9. Considerações de Segurança

- **Auth**: Proteger painel admin com Supabase Auth
- **Rate Limiting**: Implementar limites para scraping
- **Input Validation**: Sanitizar dados do scraping
- **CORS**: Configurar adequadamente
- **API Keys**: Gestão segura de chaves

### 10. Roadmap de Desenvolvimento

#### Fase 1 (2-3 semanas)
- Setup básico do projeto
- Implementação do scraping
- Integração com LLM
- Interface básica

#### Fase 2 (1-2 semanas)
- Painel de admin
- Sistema de jobs assíncronos
- Melhorias na UI

#### Fase 3 (1 semana)
- Otimizações
- Testes
- Deploy

### 11. Estimativas de Recursos

- **Desenvolvimento**: 4-6 semanas
- **Testes**: 1 semana
- **Deploy**: 3-5 dias

### 12. Métricas de Sucesso

- **Técnicas**: Uptime > 99%, tempo de resposta < 2s
- **Conteúdo**: > 80% dos artigos processados com sucesso
- **Usuário**: Tempo médio na página > 3min

### 13. Limitações e Riscos

- **Dependência Externa**: abola.pt pode bloquear scraping
- **API Limits**: OpenRouter tem limites de rate
- **Conteúdo**: Risco de gerar conteúdo inadequado
- **Legal**: Considerar direitos autorais

### 15. Design System & UI Components

#### 15.1 Shadcn/ui + Tailwind Setup
```bash
# Instalação
npx create-next-app@latest cartao-vermelho --typescript --tailwind --eslint
cd cartao-vermelho
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label textarea badge
npx shadcn-ui@latest add dialog dropdown-menu sheet tabs
npx shadcn-ui@latest add table pagination skeleton toast
```

#### 15.2 Theme Configuration
```typescript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Paleta de cores principal
        'oxford-blue': {
          DEFAULT: '#0a1128',
          50: '#e6e8ed',
          100: '#bdc2cf',
          200: '#949daf',
          300: '#6b788f',
          400: '#42536f',
          500: '#0a1128', // Base
          600: '#080d1f',
          700: '#060a17',
          800: '#04060e',
          900: '#020306',
        },
        'penn-blue': {
          DEFAULT: '#001f54',
          50: '#e6eaf5',
          100: '#bfc7e5',
          200: '#99a4d4',
          300: '#7281c4',
          400: '#4c5eb3',
          500: '#001f54', // Base
          600: '#001844',
          700: '#001234',
          800: '#000c24',
          900: '#000614',
        },
        'indigo-dye': {
          DEFAULT: '#034078',
          50: '#e6f0f8',
          100: '#bfd4ec',
          200: '#99b8e0',
          300: '#729cd4',
          400: '#4c80c8',
          500: '#034078', // Base
          600: '#023660',
          700: '#022d48',
          800: '#012330',
          900: '#011a18',
        },
        'cerulean': {
          DEFAULT: '#1282a2',
          50: '#e8f5f8',
          100: '#c5e4ed',
          200: '#a2d3e2',
          300: '#7fc2d7',
          400: '#5cb1cc',
          500: '#1282a2', // Base
          600: '#0e6b85',
          700: '#0b5568',
          800: '#073e4b',
          900: '#04282e',
        },
        'off-white': {
          DEFAULT: '#fefcfb',
          50: '#fefcfb', // Base
          100: '#fdf9f7',
          200: '#fcf6f3',
          300: '#fbf3ef',
          400: '#faf0eb',
          500: '#f9ede7',
          600: '#d1c7c2',
          700: '#a8a09d',
          800: '#807a78',
          900: '#575453',
        }
      },
      fontFamily: {
        'headline': ['Oswald', 'sans-serif'], // Para títulos dramáticos
        'body': ['Inter', 'sans-serif'], // Para corpo do texto
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0a1128, #001f54, #034078, #1282a2)',
        'gradient-dramatic': 'linear-gradient(45deg, #034078, #1282a2, #fefcfb)',
        'gradient-radial': 'radial-gradient(circle, #0a1128, #001f54, #034078, #1282a2)',
      },
      animation: {
        'breaking-news': 'scroll-left 30s linear infinite',
        'pulse-dramatic': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      boxShadow: {
        'dramatic': '0 10px 40px -10px rgba(18, 130, 162, 0.3)',
        'intense': '0 20px 60px -10px rgba(3, 64, 120, 0.4)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### 15.3 Componentes UI Customizados

**ArticleCard Dramático:**
```typescript
// components/ui/dramatic-card.tsx
interface DramaticCardProps {
  title: string;
  subtitle: string;
  content: string;
  urgency?: 'low' | 'medium' | 'high' | 'breaking';
}

export function DramaticCard({ title, subtitle, content, urgency = 'medium' }: DramaticCardProps) {
  const urgencyStyles = {
    low: 'border-l-4 border-cerulean bg-gradient-to-br from-off-white to-cerulean-50',
    medium: 'border-l-4 border-indigo-dye bg-gradient-to-br from-off-white to-indigo-dye-50 shadow-dramatic',
    high: 'border-l-4 border-penn-blue bg-gradient-to-br from-off-white to-penn-blue-50 shadow-intense',
    breaking: 'border-l-4 border-oxford-blue bg-gradient-dramatic shadow-intense animate-pulse-dramatic'
  };

  return (
    <Card className={`${urgencyStyles[urgency]} hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in-up`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {urgency === 'breaking' && (
            <Badge className="bg-oxford-blue text-off-white animate-pulse">
              🚨 ÚLTIMA HORA
            </Badge>
          )}
          <Badge variant="outline" className="border-cerulean text-cerulean">
            {urgency.toUpperCase()}
          </Badge>
        </div>
        <CardTitle className="font-headline text-2xl leading-tight text-oxford-blue">
          {title}
        </CardTitle>
        <CardDescription className="text-lg font-semibold text-indigo-dye">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-penn-blue/80 line-clamp-3">{content}</p>
      </CardContent>
    </Card>
  );
}
```

**Breaking News Banner:**
```typescript
// components/ui/breaking-banner.tsx
export function BreakingNewsBanner({ news }: { news: string[] }) {
  return (
    <div className="bg-gradient-to-r from-oxford-blue via-penn-blue to-indigo-dye text-off-white py-3 overflow-hidden shadow-lg">
      <div className="flex items-center">
        <div className="bg-cerulean px-6 py-2 font-headline font-bold text-oxford-blue shadow-lg">
          🚨 ÚLTIMAS
        </div>
        <div className="animate-breaking-news whitespace-nowrap">
          {news.map((item, index) => (
            <span key={index} className="mx-8 font-semibold text-off-white">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 15.4 Layout Responsivo Moderno

**Homepage Layout:**
```typescript
// components/layout/homepage-layout.tsx
export function HomepageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white via-cerulean-50 to-indigo-dye-50">
      <BreakingNewsBanner news={["DRAMA TOTAL!", "NÃO VAI ACREDITAR!", "EXCLUSIVO!"]} />
      
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-off-white/90 border-b border-cerulean/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-oxford-blue to-penn-blue rounded-xl flex items-center justify-center shadow-dramatic">
                <span className="text-off-white font-bold text-xl">⚽</span>
              </div>
              <div>
                <h1 className="font-headline text-2xl font-bold bg-gradient-to-r from-oxford-blue to-cerulean bg-clip-text text-transparent">
                  CARTÃO VERMELHO
                </h1>
                <p className="text-xs text-indigo-dye font-medium">O DRAMA NUNCA PARA!</p>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <Button 
                variant="ghost" 
                className="text-penn-blue hover:text-cerulean hover:bg-cerulean/10 font-semibold"
              >
                FUTEBOL
              </Button>
              <Button 
                variant="ghost" 
                className="text-penn-blue hover:text-cerulean hover:bg-cerulean/10 font-semibold"
              >
                OUTROS DESPORTOS
              </Button>
              <Button 
                variant="ghost" 
                className="text-penn-blue hover:text-cerulean hover:bg-cerulean/10 font-semibold"
              >
                INTERNACIONAL
              </Button>
            </div>
            
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="border-cerulean text-cerulean">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gradient-to-b from-off-white to-cerulean-50">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Button variant="ghost" className="justify-start text-oxford-blue hover:bg-cerulean/10">
                    FUTEBOL
                  </Button>
                  <Button variant="ghost" className="justify-start text-oxford-blue hover:bg-cerulean/10">
                    OUTROS DESPORTOS
                  </Button>
                  <Button variant="ghost" className="justify-start text-oxford-blue hover:bg-cerulean/10">
                    INTERNACIONAL
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gradient-to-r from-oxford-blue via-penn-blue to-indigo-dye border-t border-cerulean/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-headline text-lg font-bold text-off-white mb-4">CARTÃO VERMELHO</h3>
              <p className="text-cerulean-200 text-sm">
                A fonte mais dramática de notícias desportivas em Portugal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-off-white mb-4">CATEGORIAS</h4>
              <ul className="space-y-2 text-cerulean-200 text-sm">
                <li>Futebol Nacional</li>
                <li>Liga dos Campeões</li>
                <li>Seleção Nacional</li>
                <li>Outros Desportos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-off-white mb-4">SOBRE</h4>
              <ul className="space-y-2 text-cerulean-200 text-sm">
                <li>Contactos</li>
                <li>Política de Privacidade</li>
                <li>Termos de Uso</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-cerulean-300 text-sm mt-8 pt-8 border-t border-penn-blue/30">
            <p className="font-headline">© 2024 CARTÃO VERMELHO - ONDE O DRAMA ENCONTRA O DESPORTO!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

- **UI**: shadcn/ui como alternativas (Chakra UI, Material-UI também disponíveis)
- **Scraping**: Playwright em vez de Puppeteer
- **LLM**: Ollama local para reduzir custos
- **Queue**: Redis para jobs mais complexos