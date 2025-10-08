#!/bin/bash
# AdTopia MCP Agentic Stack Deployment Script
# Deploy your AI automation empire in 30 minutes

set -e

echo "🚀 AdTopia MCP Agentic Stack Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_info "Creating AdTopia MCP Stack directory..."
mkdir -p adtopia-mcp-stack
cd adtopia-mcp-stack

print_info "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp ../env.mcp-stack .env
    print_warning "Please update .env file with your actual API keys before proceeding."
    print_warning "Required keys: SUPABASE_*, OPENAI_API_KEY, GAMMA_API_KEY, STRIPE_SECRET_KEY"
    read -p "Press Enter after updating .env file..."
fi

print_info "Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
# AdTopia MCP Agentic Stack - Deploy your AI automation empire
version: '3.8'

services:
  activepieces:
    image: activepieces/activepieces:latest
    ports:
      - "3000:3000"
    environment:
      - AP_ENVIRONMENT=production
      - AP_FRONTEND_URL=http://localhost:3000
      - AP_WEBHOOK_TIMEOUT_SECONDS=30
      - AP_EXECUTION_MODE=UNSANDBOXED
      - AP_DATABASE_URL=postgresql://postgres:password@postgres:5432/activepieces
      - AP_REDIS_URL=redis://redis:6379
      - AP_ENCRYPTION_KEY=${AP_ENCRYPTION_KEY}
    volumes:
      - activepieces_data:/opt/activepieces/dist/packages/backend/dist
    depends_on:
      - postgres
      - redis
    networks:
      - adtopia-network
    restart: unless-stopped

  mcp-server:
    build:
      context: ..
      dockerfile: docker/mcp-server.dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GAMMA_API_KEY=${GAMMA_API_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - MCP_SERVER_PORT=8080
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres
    networks:
      - adtopia-network
    restart: unless-stopped

  windmill:
    image: windmill/windmill:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://windmill:password@windmill-db:5432/windmill
      - RUST_LOG=info
      - WM_SECRET_KEY=${WM_SECRET_KEY}
      - WM_ENCRYPTION_KEY=${WM_ENCRYPTION_KEY}
    depends_on:
      - windmill-db
    networks:
      - adtopia-network
    restart: unless-stopped

  windmill-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=windmill
      - POSTGRES_USER=windmill
      - POSTGRES_PASSWORD=password
    volumes:
      - windmill_db:/var/lib/postgresql/data
    networks:
      - adtopia-network
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=activepieces
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - adtopia-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - adtopia-network
    restart: unless-stopped

volumes:
  activepieces_data:
  windmill_db:
  postgres_data:
  redis_data:

networks:
  adtopia-network:
    driver: bridge
EOF

print_info "Creating MCP Server Dockerfile..."
mkdir -p docker
cat > docker/mcp-server.dockerfile << 'EOF'
# AdTopia MCP Server Dockerfile
# Containerized deployment for AI agentic intelligence

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    curl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Install Python dependencies for automation scripts
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp -u 1001

# Set permissions
RUN chown -R mcp:nodejs /app
USER mcp

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start MCP server
CMD ["npm", "start"]
EOF

print_info "Creating requirements.txt for Python dependencies..."
cat > requirements.txt << 'EOF'
openai>=1.0.0
supabase>=2.0.0
httpx>=0.25.0
asyncio
python-dotenv>=1.0.0
pydantic>=2.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
EOF

print_info "Creating package.json for Node.js dependencies..."
cat > package.json << 'EOF'
{
  "name": "adtopia-mcp-server",
  "version": "1.0.0",
  "description": "AdTopia MCP Agentic Intelligence Server",
  "main": "dist/agents/mcp-server.js",
  "scripts": {
    "start": "node dist/agents/mcp-server.js",
    "build": "tsc",
    "dev": "ts-node src/agents/mcp-server.ts",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic/mcp-server": "^0.1.0",
    "@supabase/supabase-js": "^2.38.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "redis": "^4.6.10",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.15",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0"
  }
}
EOF

print_info "Creating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

print_info "Building and starting the MCP Agentic Stack..."
docker-compose build

print_info "Starting all services..."
docker-compose up -d

print_info "Waiting for services to be ready..."
sleep 30

print_info "Checking service health..."
# Check Activepieces
if curl -f http://localhost:3000/health &> /dev/null; then
    print_status "Activepieces is running on http://localhost:3000"
else
    print_warning "Activepieces may still be starting up"
fi

# Check Windmill
if curl -f http://localhost:8000/health &> /dev/null; then
    print_status "Windmill is running on http://localhost:8000"
else
    print_warning "Windmill may still be starting up"
fi

# Check MCP Server
if curl -f http://localhost:8080/health &> /dev/null; then
    print_status "MCP Server is running on http://localhost:8080"
else
    print_warning "MCP Server may still be starting up"
fi

print_status "MCP Agentic Stack deployment complete!"
echo ""
echo "🎯 Your AI automation empire is now live:"
echo "   Activepieces: http://localhost:3000"
echo "   Windmill: http://localhost:8000"
echo "   MCP Server: http://localhost:8080"
echo ""
echo "📊 Next steps:"
echo "   1. Configure Activepieces workflows for lead processing"
echo "   2. Set up Windmill scripts for automation"
echo "   3. Test MCP server endpoints"
echo "   4. Deploy your first agentic sequence"
echo ""
echo "🚀 Ready for systematic $600K ARR domination!"

# Update TODO
print_info "Updating deployment status..."
