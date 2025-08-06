#!/bin/bash
# ====================================================
# NEURAL CORE ALPHA-7 VPS DEPLOYMENT SCRIPT
# Target: 145.223.79.90:2222
# ====================================================

set -e  # Exit on any error

# Configuration
VPS_HOST="145.223.79.90"
VPS_PORT="2222"
VPS_USER="root"  # Change if using non-root user
APP_DIR="/opt/neural-core-alpha7"
GITHUB_REPO="https://github.com/yourusername/neural-core-alpha7.git"  # UPDATE THIS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if SSH connection works
check_ssh_connection() {
    log "Testing SSH connection to VPS..."
    if ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"; then
        log "✅ SSH connection verified"
    else
        error "❌ Cannot connect to VPS. Please check your SSH access."
    fi
}

# Function to execute commands on VPS
vps_exec() {
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "$1"
}

# Function to copy files to VPS
vps_copy() {
    scp -P $VPS_PORT "$1" $VPS_USER@$VPS_HOST:"$2"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Running pre-deployment checks..."
    
    # Check if required files exist
    if [ ! -f ".env.production.example" ]; then
        warn ".env.production.example not found. Creating template..."
        cat > .env.production.example << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://145.223.79.90
PORT=3000
ALPACA_API_KEY=YOUR_ALPACA_KEY_HERE
ALPACA_SECRET_KEY=YOUR_ALPACA_SECRET_HERE
EOF
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile.production" ]; then
        warn "Dockerfile.production not found. Please create it first."
        return 1
    fi
}

# Install dependencies on VPS
install_vps_dependencies() {
    log "📦 Installing dependencies on VPS..."
    
    vps_exec "
        # Update system
        apt update && apt upgrade -y
        
        # Install required packages
        apt install -y curl wget git nginx ufw
        
        # Install Node.js 18
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt install -y nodejs
        
        # Install Docker
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            rm get-docker.sh
        fi
        
        # Install Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Create application directory
        mkdir -p $APP_DIR
    "
    
    log "✅ Dependencies installed successfully"
}

# Configure firewall
configure_firewall() {
    log "🔥 Configuring firewall..."
    
    vps_exec "
        # Reset UFW
        ufw --force reset
        
        # Set defaults
        ufw default deny incoming
        ufw default allow outgoing
        
        # Allow SSH (current port)
        ufw allow $VPS_PORT/tcp
        
        # Allow HTTP/HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Allow MooMoo OpenD
        ufw allow 11111/tcp
        
        # Enable firewall
        ufw --force enable
    "
    
    log "✅ Firewall configured successfully"
}

# Deploy application
deploy_application() {
    log "🚀 Deploying application to VPS..."
    
    # Clone or update repository on VPS
    vps_exec "
        cd $APP_DIR
        
        if [ -d '.git' ]; then
            log 'Updating existing repository...'
            git fetch origin
            git reset --hard origin/main
        else
            log 'Cloning repository...'
            git clone $GITHUB_REPO .
        fi
        
        # Set permissions
        chown -R www-data:www-data $APP_DIR
        chmod -R 755 $APP_DIR
    "
    
    log "✅ Application deployed successfully"
}

# Generate production environment
generate_production_env() {
    log "⚙️ Generating production environment..."
    
    vps_exec "
        cd $APP_DIR
        
        # Generate secure secrets
        JWT_SECRET=\$(openssl rand -hex 32)
        SESSION_SECRET=\$(openssl rand -hex 32)
        ENCRYPTION_KEY=\$(openssl rand -hex 32)
        
        # Create production environment file
        cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$VPS_HOST
NEXTAUTH_URL=https://$VPS_HOST
PORT=3000

# Trading Configuration
NEXT_PUBLIC_PAPER_TRADING_MODE=true
NEXT_PUBLIC_DEFAULT_PORTFOLIO_VALUE=300.00
NEXT_PUBLIC_MAX_TRADE_SIZE_PERCENT=25

# API Configuration (UPDATE WITH ACTUAL KEYS)
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXX
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# MooMoo Configuration
MOOMOO_HOST=$VPS_HOST
MOOMOO_PORT=11111

# Security
JWT_SECRET=\$JWT_SECRET
SESSION_SECRET=\$SESSION_SECRET
ENCRYPTION_KEY=\$ENCRYPTION_KEY

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://$VPS_HOST/ws

# Monitoring
LOG_LEVEL=info
HEALTH_CHECK_ENABLED=true
EOF
        
        # Secure the environment file
        chmod 600 .env.production
    "
    
    warn "⚠️  IMPORTANT: Update API keys in .env.production on the VPS!"
    log "✅ Production environment generated"
}

# Create Docker configuration
create_docker_config() {
    log "🐳 Creating Docker configuration..."
    
    vps_exec "
        cd $APP_DIR
        
        # Create Docker Compose file
        cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  neural-core-app:
    build:
      context: .
      dockerfile: Dockerfile.production
    container_name: neural-core-alpha7
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - \"3000:3000\"
    volumes:
      - ./logs:/app/logs
    networks:
      - neural-network
    healthcheck:
      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/api/health\"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  nginx:
    image: nginx:alpine
    container_name: neural-nginx
    restart: unless-stopped
    ports:
      - \"80:80\"
      - \"443:443\"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - neural-core-app
    networks:
      - neural-network

networks:
  neural-network:
    driver: bridge
EOF
    "
    
    log "✅ Docker configuration created"
}

# Create Nginx configuration
create_nginx_config() {
    log "🌐 Creating Nginx configuration..."
    
    vps_exec "
        cd $APP_DIR
        
        cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream neural_app {
        server neural-core-app:3000;
    }
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        listen 80;
        server_name $VPS_HOST;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection \"1; mode=block\";
        
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://neural_app;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # WebSocket support
        location /ws {
            proxy_pass http://neural_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \"upgrade\";
            proxy_set_header Host \$host;
        }
        
        # Main application
        location / {
            proxy_pass http://neural_app;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF
    "
    
    log "✅ Nginx configuration created"
}

# Build and start application
build_and_start() {
    log "🏗️ Building and starting application..."
    
    vps_exec "
        cd $APP_DIR
        
        # Build the application
        docker-compose -f docker-compose.production.yml build --no-cache
        
        # Start services
        docker-compose -f docker-compose.production.yml up -d
        
        # Wait for services to start
        sleep 30
        
        # Check status
        docker-compose -f docker-compose.production.yml ps
    "
    
    log "✅ Application built and started"
}

# Verify deployment
verify_deployment() {
    log "🔍 Verifying deployment..."
    
    # Test application health
    if curl -f -s "http://$VPS_HOST/api/health" > /dev/null; then
        log "✅ Health check passed"
    else
        warn "⚠️  Health check failed - application may still be starting"
    fi
    
    # Show final status
    vps_exec "
        cd $APP_DIR
        echo '📊 Container Status:'
        docker-compose -f docker-compose.production.yml ps
        echo ''
        echo '📋 Recent Logs:'
        docker-compose -f docker-compose.production.yml logs --tail 20
    "
}

# Create management scripts
create_management_scripts() {
    log "📝 Creating management scripts..."
    
    vps_exec "
        cd $APP_DIR
        
        # Create start script
        cat > start.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.production.yml up -d
echo 'Neural Core Alpha-7 started successfully'
EOF
        
        # Create stop script
        cat > stop.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.production.yml down
echo 'Neural Core Alpha-7 stopped successfully'
EOF
        
        # Create restart script
        cat > restart.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.production.yml restart
echo 'Neural Core Alpha-7 restarted successfully'
EOF
        
        # Create logs script
        cat > logs.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose.production.yml logs -f
EOF
        
        # Create update script
        cat > update.sh << 'EOF'
#!/bin/bash
echo 'Updating Neural Core Alpha-7...'
git pull origin main
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
echo 'Update completed successfully'
EOF
        
        # Make scripts executable
        chmod +x *.sh
    "
    
    log "✅ Management scripts created"
}

# Main deployment function
main() {
    log "🚀 Starting Neural Core Alpha-7 VPS Deployment"
    log "Target: $VPS_HOST:$VPS_PORT"
    
    # Check prerequisites
    if [ -z "$GITHUB_REPO" ] || [[ "$GITHUB_REPO" == *"yourusername"* ]]; then
        error "Please update GITHUB_REPO variable with your actual repository URL"
    fi
    
    # Run deployment steps
    check_ssh_connection
    pre_deployment_checks
    install_vps_dependencies
    configure_firewall
    deploy_application
    generate_production_env
    create_docker_config
    create_nginx_config
    build_and_start
    create_management_scripts
    verify_deployment
    
    log "🎉 Deployment completed successfully!"
    log ""
    log "📋 Next Steps:"
    log "1. SSH to VPS: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
    log "2. Edit API keys: nano $APP_DIR/.env.production"
    log "3. Restart app: cd $APP_DIR && ./restart.sh"
    log "4. Access application: http://$VPS_HOST"
    log ""
    log "🔧 Management Commands:"
    log "  Start:   cd $APP_DIR && ./start.sh"
    log "  Stop:    cd $APP_DIR && ./stop.sh"
    log "  Restart: cd $APP_DIR && ./restart.sh"
    log "  Logs:    cd $APP_DIR && ./logs.sh"
    log "  Update:  cd $APP_DIR && ./update.sh"
}

# Run deployment
main "$@"