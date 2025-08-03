# 🚀 Neural Core Alpha-7 Deployment Guide

This guide covers various deployment options for the Neural Core Alpha-7 trading platform, from development to production environments.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Environment Variables**: All required env vars configured
- [ ] **API Keys**: Moomoo API credentials and other service keys
- [ ] **SSL Certificates**: HTTPS setup for production
- [ ] **Database Setup**: Qdrant vector database running
- [ ] **Rust Backend**: AI engine deployed and accessible
- [ ] **Domain Configuration**: DNS pointing to your deployment
- [ ] **Monitoring Setup**: Error tracking and performance monitoring
- [ ] **Backup Strategy**: Data backup and recovery plan

## 🌐 Deployment Options

### 1. 🔷 Vercel (Recommended for Frontend)

Vercel provides the best Next.js deployment experience with automatic optimizations.

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# For production deployment
vercel --prod
```

#### Configuration
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://your-domain.vercel.app",
    "NEXT_PUBLIC_AI_ENGINE_URL": "wss://your-ai-backend.com"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Environment Variables in Vercel
```bash
# Set via Vercel CLI
vercel env add NEXT_PUBLIC_AI_ENGINE_URL production
vercel env add MOOMOO_API_KEY production

# Or via Vercel dashboard
# Go to Project Settings > Environment Variables
```

### 2. 🐳 Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose (Full Stack)
```yaml
version: '3.8'

services:
  # Frontend
  neural-core-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_AI_ENGINE_URL=ws://ai-engine:3001
      - NEXT_PUBLIC_QDRANT_URL=http://qdrant:6333
    depends_on:
      - ai-engine
      - qdrant
    networks:
      - neural-network

  # AI Engine (Rust Backend)
  ai-engine:
    build: 
      context: ./src/core
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - QDRANT_URL=http://qdrant:6333
      - RUST_LOG=info
    depends_on:
      - qdrant
    networks:
      - neural-network

  # Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - neural-network

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - neural-core-frontend
    networks:
      - neural-network

volumes:
  qdrant_data:

networks:
  neural-network:
    driver: bridge
```

#### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale neural-core-frontend=3

# Update deployment
docker-compose pull
docker-compose up -d
```

### 3. ☁️ AWS Deployment

#### Option A: AWS Amplify (Simple)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Option B: ECS with Fargate (Advanced)
```yaml
# ecs-task-definition.json
{
  "family": "neural-core-alpha-7",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "neural-core-frontend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/neural-core:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_AI_ENGINE_URL",
          "value": "wss://your-ai-backend.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/neural-core",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 4. 🌊 DigitalOcean App Platform

#### app.yaml
```yaml
name: neural-core-alpha-7
services:
- name: web
  source_dir: /
  github:
    repo: Asif90988/NEURAL-CORE-ALPHA-7
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NEXT_PUBLIC_AI_ENGINE_URL
    value: wss://your-ai-backend.com
  - key: NODE_ENV
    value: production
```

Deploy:
```bash
# Install doctl
# Configure: doctl auth init

# Create app
doctl apps create --spec app.yaml

# Update app
doctl apps update YOUR_APP_ID --spec app.yaml
```

### 5. 🚀 Railway Deployment

#### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Deploy:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# AI Engine
NEXT_PUBLIC_AI_ENGINE_URL=wss://ai-backend.your-domain.com
NEXT_PUBLIC_QDRANT_URL=https://qdrant.your-domain.com

# Security
NEXTAUTH_SECRET=your-super-secret-jwt-secret
NEXTAUTH_URL=https://your-domain.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Trading
NEXT_PUBLIC_TRADING_MODE=live
MOOMOO_API_KEY=your-production-api-key
MOOMOO_SECRET_KEY=your-production-secret-key
```

### Security Configuration
```env
# Rate Limiting
NEXT_PUBLIC_API_RATE_LIMIT=1000
NEXT_PUBLIC_API_RATE_WINDOW=3600000

# SSL/TLS
FORCE_HTTPS=true
SECURE_COOKIES=true

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for AI engine
    location /ws/ {
        proxy_pass http://ai-engine:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 📊 Monitoring & Analytics

### Error Tracking with Sentry
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring
```typescript
// utils/analytics.ts
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric,
      value: Math.round(value),
    });
  }
};

// Track AI response times
trackPerformance('ai_response_time', responseTime);
```

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check AI engine connection
    const aiHealthy = await checkAIEngine();
    
    // Check database connection
    const dbHealthy = await checkDatabase();
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        ai_engine: aiHealthy ? 'up' : 'down',
        database: dbHealthy ? 'up' : 'down',
      }
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Neural Core Alpha-7

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🗄️ Database Deployment

### Qdrant Vector Database
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    restart: unless-stopped
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
      - ./qdrant-config:/qdrant/config
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  qdrant_data:
    driver: local
```

### Database Backup Strategy
```bash
#!/bin/bash
# backup-qdrant.sh

BACKUP_DIR="/backups/qdrant"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
docker exec qdrant_container tar -czf - /qdrant/storage > $BACKUP_DIR/qdrant_backup_$DATE.tar.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "qdrant_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: qdrant_backup_$DATE.tar.gz"
```

## 🚨 Disaster Recovery

### Backup Strategy
1. **Database Backups**: Daily automated Qdrant backups
2. **Code Repository**: Git ensures code safety
3. **Environment Variables**: Secure backup of all env vars
4. **SSL Certificates**: Backup of certificates and keys

### Recovery Procedures
```bash
# Restore from backup
docker stop qdrant_container
docker run --rm -v qdrant_data:/qdrant/storage -v $BACKUP_DIR:/backup alpine tar -xzf /backup/qdrant_backup_$DATE.tar.gz -C /
docker start qdrant_container
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Nginx or cloud load balancer
- **Multiple Instances**: Scale Next.js instances
- **Database Clustering**: Qdrant cluster setup
- **CDN**: CloudFlare or AWS CloudFront

### Vertical Scaling
- **CPU**: Monitor and upgrade as needed
- **Memory**: Ensure adequate RAM for AI processing
- **Storage**: Plan for growing vector database

### Performance Optimization
```typescript
// Optimize bundle size
const AIMarketVisualization = dynamic(
  () => import('@/components/charts/AIMarketVisualization'),
  { ssr: false }
);

// Optimize images
import Image from 'next/image';

// Use caching
export const revalidate = 60; // Cache for 60 seconds
```

## 🔧 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check TypeScript errors
npm run type-check
```

**WebSocket Connection Issues**
```typescript
// Add connection retry logic
const connectWithRetry = () => {
  const ws = new WebSocket(url);
  
  ws.onclose = () => {
    setTimeout(connectWithRetry, 5000);
  };
};
```

**Performance Issues**
```bash
# Analyze bundle
npm run analyze

# Check memory usage
node --inspect=0.0.0.0:9229 server.js
```

### Debug Mode
```env
# Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=true
NODE_OPTIONS='--inspect=0.0.0.0:9229'
```

## 📞 Support

For deployment issues:
- **Documentation**: Check this guide first
- **GitHub Issues**: Create issue with deployment logs
- **Community**: Discord support channel
- **Email**: deployment-support@neuralcore.ai

---

*"Deploying transparency, one neural connection at a time."* 🚀🧠