#!/bin/bash

# Neural Core Alpha-7 Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Configuration
APP_NAME="neural-core-alpha-7"
DOCKER_REGISTRY="your-registry.com"
VERSION="1.0.0"
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if required environment files exist
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found"
    fi
    
    # Check if SSL certificates exist
    if [ ! -d "nginx/ssl" ]; then
        warning "SSL certificates directory not found. Creating..."
        mkdir -p nginx/ssl
    fi
    
    success "Prerequisites check completed"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Create nginx directories
    mkdir -p nginx/ssl nginx/www nginx/logs
    
    # Generate self-signed certificates for development (replace with real certificates)
    if [ ! -f "nginx/ssl/neuralcore.pem" ]; then
        warning "Generating self-signed SSL certificate (replace with real certificate in production)"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/neuralcore.key \
            -out nginx/ssl/neuralcore.pem \
            -subj "/C=US/ST=CA/L=San Francisco/O=Neural Core Technologies/CN=neuralcore.ai"
    fi
    
    success "SSL certificates ready"
}

# Create nginx configuration
setup_nginx() {
    log "Setting up Nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream neural_core_web {
        server web:3000;
    }
    
    upstream neural_core_ai {
        server ai-engine:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;" always;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name neuralcore.ai www.neuralcore.ai;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name neuralcore.ai www.neuralcore.ai;

        ssl_certificate /etc/nginx/ssl/neuralcore.pem;
        ssl_certificate_key /etc/nginx/ssl/neuralcore.key;
        
        # Modern SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Enable HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Main application
        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://neural_core_web;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://neural_core_web;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket for AI engine
        location /ws/ {
            proxy_pass http://neural_core_ai;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri @nextjs;
        }

        location @nextjs {
            proxy_pass http://neural_core_web;
        }
    }
}
EOF

    success "Nginx configuration created"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build Next.js application
    log "Building Next.js application..."
    docker build -f Dockerfile.production -t ${APP_NAME}:${VERSION} .
    
    # Tag for registry
    docker tag ${APP_NAME}:${VERSION} ${DOCKER_REGISTRY}/${APP_NAME}:${VERSION}
    docker tag ${APP_NAME}:${VERSION} ${DOCKER_REGISTRY}/${APP_NAME}:latest
    
    success "Docker images built successfully"
}

# Deploy to production
deploy() {
    log "Deploying to production..."
    
    # Pull latest images
    log "Pulling latest base images..."
    docker-compose -f docker-compose.production.yml pull postgres redis qdrant nginx
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f docker-compose.production.yml down --remove-orphans
    
    # Start new deployment
    log "Starting new deployment..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Run health checks
    health_check
    
    success "Deployment completed successfully"
}

# Health check
health_check() {
    log "Running health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check web application
        if curl -f -s http://localhost/health > /dev/null; then
            success "Web application is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Health check failed after $max_attempts attempts"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Check database
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U neural_core_user -d neural_core_production > /dev/null; then
        success "Database is healthy"
    else
        warning "Database health check failed"
    fi
    
    # Check AI engine
    if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
        success "AI engine is healthy"
    else
        warning "AI engine health check failed"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p monitoring/grafana/{dashboards,datasources} monitoring/prometheus
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'neural-core-web'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'

  - job_name: 'neural-core-ai'
    static_configs:
      - targets: ['ai-engine:3001']
    metrics_path: '/metrics'
EOF
    
    success "Monitoring setup completed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    log "Backing up database..."
    docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U neural_core_user neural_core_production > "$backup_dir/database.sql"
    
    # Backup configuration files
    cp -r nginx "$backup_dir/"
    cp .env.production "$backup_dir/"
    cp docker-compose.production.yml "$backup_dir/"
    
    success "Backup created at $backup_dir"
}

# Rollback deployment
rollback() {
    local backup_dir=$1
    if [ -z "$backup_dir" ]; then
        error "Backup directory not specified for rollback"
    fi
    
    warning "Rolling back to previous deployment..."
    
    # Stop current deployment
    docker-compose -f docker-compose.production.yml down
    
    # Restore configuration
    cp -r "$backup_dir/nginx" .
    cp "$backup_dir/.env.production" .
    cp "$backup_dir/docker-compose.production.yml" .
    
    # Restore database
    docker-compose -f docker-compose.production.yml up -d postgres
    sleep 10
    docker-compose -f docker-compose.production.yml exec -T postgres psql -U neural_core_user -d neural_core_production < "$backup_dir/database.sql"
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    success "Rollback completed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old containers
    docker container prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    success "Cleanup completed"
}

# Show usage
usage() {
    echo "Neural Core Alpha-7 Production Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy          Full deployment (default)"
    echo "  build           Build Docker images only"
    echo "  health          Run health checks"
    echo "  backup          Create backup"
    echo "  rollback DIR    Rollback to backup directory"
    echo "  cleanup         Cleanup old images and containers"
    echo "  ssl             Setup SSL certificates"
    echo "  logs            Show application logs"
    echo "  status          Show deployment status"
    echo ""
}

# Show logs
show_logs() {
    docker-compose -f docker-compose.production.yml logs -f --tail=100
}

# Show status
show_status() {
    log "Deployment Status:"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    log "System Resources:"
    docker stats --no-stream
}

# Main execution
main() {
    local command=${1:-deploy}
    
    case $command in
        deploy)
            check_prerequisites
            setup_ssl
            setup_nginx
            setup_monitoring
            backup_current
            build_images
            deploy
            cleanup
            ;;
        build)
            check_prerequisites
            build_images
            ;;
        health)
            health_check
            ;;
        backup)
            backup_current
            ;;
        rollback)
            rollback $2
            ;;
        cleanup)
            cleanup
            ;;
        ssl)
            setup_ssl
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        --help|-h)
            usage
            ;;
        *)
            error "Unknown command: $command"
            usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"