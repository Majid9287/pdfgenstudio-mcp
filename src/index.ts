#!/usr/bin/env node
/**
 * PDF Gen Studio MCP Server
 * 
 * A Model Context Protocol server for generating PDFs and images
 * from templates, JSON, HTML, or URLs using the PDF Gen Studio API.
 */

import { FastMCP } from 'fastmcp';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import { parseArgs, getConfig } from './config.js';

// Parse command line arguments
const args = parseArgs();
const config = getConfig();

// Create the MCP server
const server = new FastMCP({
  name: 'pdfgenstudio',
  version: '1.0.0',
  instructions: `PDF Gen Studio MCP Server - Generate PDFs and images from templates, JSON, HTML, or URLs.

Available capabilities:
1. **Template Rendering**: Render saved templates with dynamic data injection
2. **JSON Rendering**: Convert JSON design documents to PDF/images
3. **HTML Rendering**: Convert HTML/CSS content to PDF/images
4. **URL Rendering**: Screenshot any website URL as PDF/images
5. **Template Management**: List and retrieve your saved templates

Authentication:
- Provide your API key via the PDFGENSTUDIO_API_KEY environment variable
- Or pass it directly in tool parameters

Output Formats:
- PDF: Generate PDF documents
- PNG: Generate PNG images
- JPG: Generate JPG images

Response Types:
- base64: Get the output as a base64 encoded string
- binary: Get raw binary data (for file operations)

For more information, visit https://docs.pdfgenstudio.com`,
});

// Register all tools, resources, and prompts
registerTools(server, config);
registerResources(server, config);
registerPrompts(server);

// Handle process signals gracefully
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Handle uncaught errors to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('[pdfgenstudio-mcp] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[pdfgenstudio-mcp] Unhandled rejection:', reason);
});

// Start the server based on transport type
const transportType = args.transport || 'stdio';
const port = args.port || 3100;

if (transportType === 'stdio') {
  server.start({
    transportType: 'stdio',
  });
} else if (transportType === 'http' || transportType === 'httpStream') {
  server.start({
    transportType: 'httpStream',
    httpStream: {
      port,
    },
  });
} else if (transportType === 'sse') {
  server.start({
    transportType: 'httpStream',
    httpStream: {
      port,
    },
  });
}

export { server };
