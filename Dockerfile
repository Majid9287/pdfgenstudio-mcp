# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Labels for Docker Desktop MCP Toolkit catalog
LABEL org.opencontainers.image.title="PDF Gen Studio MCP"
LABEL org.opencontainers.image.description="📄 Official PDF Gen Studio MCP Server - Generate PDFs and images from templates, JSON, HTML, or URLs for Cursor, Claude and any LLM clients"
LABEL org.opencontainers.image.vendor="pdfgenstudio"
LABEL org.opencontainers.image.version="1.0.3"
LABEL org.opencontainers.image.source="https://github.com/Majid9287/pdfgenstudio-mcp"
LABEL org.opencontainers.image.documentation="https://docs.pdfgenstudio.com"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.url="https://pdfgenstudio.com"

# MCP-specific labels for Docker Desktop MCP Toolkit
LABEL ai.docker.mcp.name="pdfgenstudio"
LABEL ai.docker.mcp.icon="https://pdfgenstudio.com/logo/mcp-icon.png"
LABEL ai.docker.mcp.categories="productivity,documents,pdf"
LABEL ai.docker.mcp.env.PDFGENSTUDIO_API_KEY.description="Your PDF Gen Studio API key"
LABEL ai.docker.mcp.env.PDFGENSTUDIO_API_KEY.required="true"
LABEL ai.docker.mcp.env.PDFGENSTUDIO_BASE_URL.description="API base URL (optional)"
LABEL ai.docker.mcp.env.PDFGENSTUDIO_BASE_URL.required="false"
LABEL ai.docker.mcp.env.PDFGENSTUDIO_BASE_URL.default="https://api.pdfgenstudio.com"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose HTTP port (optional, for HTTP transport mode)
EXPOSE 3100

# Default command - run in stdio mode for MCP compatibility
# Use CMD instead of ENTRYPOINT to allow easy override
CMD ["node", "dist/index.js", "--transport", "stdio"]
