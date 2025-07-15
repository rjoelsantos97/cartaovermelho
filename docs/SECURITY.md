# Segurança - Cartão Vermelho News

## 🔐 Sistema de Autenticação

### Estrutura de Segurança

O sistema implementa uma arquitetura de segurança robusta com as seguintes camadas:

1. **Middleware de Autenticação** (`src/middleware.ts`)
2. **AuthGuard Components** (`src/components/auth/AuthGuard.tsx`)
3. **API Protection** (`src/lib/auth/api-auth.ts`)
4. **Layout Security** (layouts específicos para login e dashboard)

### Rotas Protegidas

#### Admin Routes
- `/admin/dashboard` - Dashboard principal (protegido)
- `/admin/login` - Página de login (pública)

#### API Endpoints
- `/api/run-pipeline` - Execução do pipeline completo
- `/api/scheduler` - Controlo de schedulers
- `/api/test-scraping` - Testes de scraping
- `/api/test-scraping-only` - Scraping apenas

### Fluxo de Autenticação

1. **Acesso não autenticado** → Redirecionamento para `/admin/login`
2. **Login com credenciais** → Validação via Supabase Auth
3. **Sessão ativa** → Acesso ao dashboard e APIs
4. **Logout** → Limpeza de sessão e redirecionamento

### Boas Práticas Implementadas

#### ✅ Segurança
- **Campos de login vazios** - Sem credenciais pré-preenchidas
- **Validação server-side** - Usando `supabase.auth.getUser()`
- **Session management** - Refresh automático de tokens
- **Middleware protection** - Intercepta requests não autorizados
- **AuthGuard components** - Proteção de componentes React

#### ✅ Estrutura
- **Login layout** - Sem AuthGuard para evitar loops
- **Dashboard layout** - Com AuthGuard para proteção
- **API protection** - Validação em todos os endpoints críticos
- **Error handling** - Tratamento robusto de erros de autenticação

#### ✅ Auditoria
- **Logs de acesso** - Todas as ações admin são logadas
- **Error tracking** - Erros de autenticação são registados
- **User identification** - Ações associadas ao utilizador logado

### Configuração Inicial

#### 1. Iniciar Supabase Local
```bash
npx supabase start
```

#### 2. Criar Utilizador Admin
```bash
node scripts/diagnose-auth.js
```

#### 3. Credenciais Padrão
- **Email**: `admin@cartaovermelho.pt`
- **Password**: `admin123`

### Diagnóstico de Problemas

#### Script de Diagnóstico
```bash
node scripts/diagnose-auth.js
```

Este script:
- Verifica conexão com Supabase
- Lista utilizadores existentes
- Cria utilizador admin se não existir
- Testa serviço de autenticação

#### Logs de Debug
- **Middleware**: Logs de redirecionamento e proteção
- **AuthGuard**: Logs de verificação de sessão
- **API Auth**: Logs de validação de endpoints

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_EMAIL=admin@cartaovermelho.pt
ADMIN_PASSWORD=admin123
```

### Possíveis Problemas

#### `AuthSessionMissingError`
- **Causa**: Supabase não está running ou configurado
- **Solução**: `npx supabase start` + `node scripts/diagnose-auth.js`

#### Loop de Redirecionamento
- **Causa**: AuthGuard em página de login
- **Solução**: Estrutura de layouts corrigida

#### API 401 Unauthorized
- **Causa**: Endpoint sem autenticação
- **Solução**: Middleware protege automaticamente

### Próximos Passos de Segurança

1. **Rate Limiting** - Implementar limites de tentativas de login
2. **Password Policies** - Validação de força de password
3. **2FA** - Autenticação de dois fatores
4. **Role-Based Access** - Diferentes níveis de acesso
5. **Session Timeout** - Timeout automático de sessões inativas

### Contacto

Para questões de segurança ou vulnerabilidades, contactar através do sistema de issues do projeto.