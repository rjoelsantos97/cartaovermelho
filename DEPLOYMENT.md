# Deployment Guide - Cartão Vermelho

## Docker Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- OpenRouter API key

### Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.production .env.local
   # Edit .env.local and add your OPENROUTER_API_KEY
   ```

2. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Main app: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin/dashboard
   - Supabase Studio: http://localhost:54323

### Default Admin Credentials
- **Email:** admin@cartaovermelho.pt
- **Password:** admin123

> **Security Note:** Change these credentials immediately after first login.

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| app | 3000 | Next.js Application |
| db | 54322 | PostgreSQL Database |
| auth | 9999 | Supabase Auth |
| rest | 54321 | Supabase REST API |
| realtime | 4000 | Supabase Realtime |
| studio | 54323 | Supabase Studio |
| kong | 8000 | API Gateway |
| meta | 8080 | Database Metadata |

### Production Deployment

1. **Configure environment variables:**
   ```bash
   export OPENROUTER_API_KEY=your_actual_api_key_here
   ```

2. **Build and deploy:**
   ```bash
   docker-compose up -d --build
   ```

3. **Monitor logs:**
   ```bash
   docker-compose logs -f app
   ```

### Useful Commands

- **Stop all services:**
  ```bash
  docker-compose down
  ```

- **Rebuild application:**
  ```bash
  docker-compose build app
  docker-compose up -d app
  ```

- **View logs:**
  ```bash
  docker-compose logs -f [service_name]
  ```

- **Access database:**
  ```bash
  docker-compose exec db psql -U postgres -d postgres
  ```

### Troubleshooting

1. **Application won't start:**
   - Check that all ports are available
   - Verify Docker has enough memory allocated
   - Check logs: `docker-compose logs app`

2. **Database connection issues:**
   - Ensure database is healthy: `docker-compose ps`
   - Check database logs: `docker-compose logs db`

3. **OpenRouter API issues:**
   - Verify API key is set correctly
   - Check API quota and limits

4. **Permissions issues:**
   - Ensure Docker has proper permissions
   - Check file ownership: `ls -la`

### Scaling

To scale the application:
```bash
docker-compose up -d --scale app=3
```

### Backup & Recovery

1. **Database backup:**
   ```bash
   docker-compose exec db pg_dump -U postgres postgres > backup.sql
   ```

2. **Database restore:**
   ```bash
   docker-compose exec -T db psql -U postgres postgres < backup.sql
   ```

### Health Checks

Monitor service health:
```bash
docker-compose ps
curl -f http://localhost:3000/api/health || echo "App is down"
```

## Cloud Deployment

For cloud deployment, modify the `docker-compose.yml`:

1. Update URLs to use your domain
2. Configure SSL/TLS certificates
3. Set up proper secrets management
4. Configure load balancing if needed

### Environment Variables for Cloud

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-domain.com
# Update other URLs accordingly
```

## Monitoring

Consider adding monitoring tools:
- Prometheus for metrics
- Grafana for dashboards
- AlertManager for notifications

## Security

- Change default passwords
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Regular security updates