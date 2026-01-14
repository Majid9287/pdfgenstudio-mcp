/**
 * Resources for PDF Gen Studio MCP Server
 */

import type { FastMCP } from 'fastmcp';
import type { Config } from '../config.js';
import { apiRequest } from '../api-client.js';

interface Template {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  json?: Record<string, unknown>;
}

/**
 * Register resources with the MCP server
 */
export function registerResources(server: FastMCP, config: Config): void {
  // Templates list resource
  server.addResource({
    uri: 'pdfgenstudio://templates',
    name: 'PDF Gen Studio Templates',
    mimeType: 'application/json',
    description: 'List of all templates in your PDF Gen Studio account',
    async load() {
      if (!config.apiKey) {
        return {
          text: JSON.stringify({
            error: 'API key not configured. Set PDFGENSTUDIO_API_KEY environment variable.',
          }),
        };
      }

      try {
        const response = await apiRequest<Template[]>(
          config,
          '/api/v1/templates',
          {}
        );

        if (!response.success || !Array.isArray(response.data)) {
          return {
            text: JSON.stringify({
              success: false,
              templates: [],
            }),
          };
        }

        const templates = response.data.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || 'No description',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }));

        return {
          text: JSON.stringify({
            success: true,
            count: templates.length,
            templates,
          }, null, 2),
        };
      } catch (error) {
        return {
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Failed to fetch templates',
          }),
        };
      }
    },
  });

  // Template details resource template
  server.addResourceTemplate({
    uriTemplate: 'pdfgenstudio://templates/{templateId}',
    name: 'PDF Gen Studio Template',
    mimeType: 'application/json',
    description: 'Detailed information about a specific template',
    arguments: [
      {
        name: 'templateId',
        description: 'The ID of the template',
        required: true,
      },
    ],
    async load({ templateId }) {
      if (!config.apiKey) {
        return {
          text: JSON.stringify({
            error: 'API key not configured. Set PDFGENSTUDIO_API_KEY environment variable.',
          }),
        };
      }

      try {
        const response = await apiRequest<Template>(
          config,
          `/api/v1/templates/${templateId}`,
          {}
        );

        if (!response.success || !response.data) {
          return {
            text: JSON.stringify({
              success: false,
              message: `Template not found: ${templateId}`,
            }),
          };
        }

        return {
          text: JSON.stringify({
            success: true,
            ...response.data,
          }, null, 2),
        };
      } catch (error) {
        return {
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Failed to fetch template',
          }),
        };
      }
    },
  });

  // API documentation resource
  server.addResource({
    uri: 'pdfgenstudio://docs/api',
    name: 'PDF Gen Studio API Documentation',
    mimeType: 'text/markdown',
    description: 'API documentation for PDF Gen Studio',
    async load() {
      return {
        text: `# PDF Gen Studio API Documentation

## Overview
PDF Gen Studio provides a powerful API for generating PDFs and images from various sources.

## Authentication
All API requests require an API key passed in the \`X-API-Key\` header.

## Endpoints

### Templates
- \`GET /api/v1/templates\` - List all templates
- \`GET /api/v1/templates/{id}\` - Get template details
- \`POST /api/v1/renderer/templates/{id}\` - Render a template

### JSON Rendering
- \`POST /api/v1/renderer/json\` - Render JSON document

### HTML Rendering
- \`POST /api/v1/renderer/html\` - Render HTML to PDF/image

### URL Rendering
- \`POST /api/v1/renderer/url\` - Screenshot URL to PDF/image

## Output Formats
- \`pdf\` - PDF document
- \`png\` - PNG image
- \`jpg\` - JPEG image

## Response Types
- \`base64\` - Base64 encoded string
- \`binary\` - Raw binary data

For more information, visit https://docs.pdfgenstudio.com
`,
      };
    },
  });

  // Configuration info resource
  server.addResource({
    uri: 'pdfgenstudio://config',
    name: 'PDF Gen Studio Configuration',
    mimeType: 'application/json',
    description: 'Current MCP server configuration status',
    async load() {
      return {
        text: JSON.stringify({
          configured: !!config.apiKey,
          baseUrl: config.baseUrl,
          apiKeySet: config.apiKey ? 'Yes (hidden)' : 'No - Set PDFGENSTUDIO_API_KEY environment variable',
        }, null, 2),
      };
    },
  });
}
