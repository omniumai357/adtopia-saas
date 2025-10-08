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
