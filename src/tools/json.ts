/**
 * JSON rendering tools
 */

import type { FastMCP } from 'fastmcp';
import { z } from 'zod';
import type { Config } from '../config.js';
import { apiRequest, apiRequestBinary } from '../api-client.js';

/**
 * Register JSON rendering tools
 */
export function registerJsonTools(server: FastMCP, config: Config): void {
  // Render JSON document to PDF/Image
  server.addTool({
    name: 'render_json',
    description: `Convert a JSON design document to PDF or image.

Use this tool to:
- Render JSON design documents (following PDF Gen Studio schema)
- Generate PDFs from programmatically created designs
- Create images from JSON definitions

The JSON document should follow the PDF Gen Studio document schema with pages, elements, and styling.`,
    parameters: z.object({
      document: z.record(z.unknown()).describe('JSON design document following PDF Gen Studio schema'),
      format: z.enum(['pdf', 'png', 'jpg']).default('pdf').describe('Output format: pdf, png, or jpg'),
      validateOnly: z.boolean().default(false).describe('Only validate the document without rendering'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
      options: z.object({
        scale: z.number().optional().describe('Scale factor for rendering'),
        quality: z.number().optional().describe('Image quality (0-100)'),
        printBackground: z.boolean().optional().describe('Include background in output'),
        displayHeaderFooter: z.boolean().optional().describe('Display header and footer'),
        headerTemplate: z.string().optional().describe('HTML template for header'),
        footerTemplate: z.string().optional().describe('HTML template for footer'),
        timeout: z.number().optional().describe('Rendering timeout in milliseconds'),
        fullPage: z.boolean().optional().describe('Capture full page'),
        omitBackground: z.boolean().optional().describe('Omit background'),
        raw: z.boolean().optional().describe('Return raw output'),
      }).optional().describe('Additional rendering options'),
    }),
    annotations: {
      title: 'Render JSON Document',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { document, format, validateOnly, apiKey, options } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      if (validateOnly) {
        query.validate = 'true';
      }

      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined) {
            query[key] = value;
          }
        });
      }

      const result = await apiRequest(
        config,
        '/api/v1/renderer/json',
        {
          method: 'POST',
          body: { document, options },
          query,
          apiKey,
        }
      );

      if (validateOnly) {
        return JSON.stringify({
          success: true,
          message: 'Document validation completed',
          validation: result.data,
        }, null, 2);
      }

      return JSON.stringify({
        success: true,
        format,
        message: `JSON document rendered successfully as ${format.toUpperCase()}`,
        data: result.data,
      }, null, 2);
    },
  });

  // Render JSON and return image
  server.addTool({
    name: 'render_json_image',
    description: `Render a JSON document to an image and return it as viewable image content.

This tool returns the actual image data that can be displayed directly.`,
    parameters: z.object({
      document: z.record(z.unknown()).describe('JSON design document following PDF Gen Studio schema'),
      format: z.enum(['png', 'jpg']).default('png').describe('Image format: png or jpg'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
    }),
    annotations: {
      title: 'Render JSON as Image',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { document, format, apiKey } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      const base64Data = await apiRequestBinary(
        config,
        '/api/v1/renderer/json',
        {
          method: 'POST',
          body: { document },
          query,
          apiKey,
        }
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: `JSON document rendered as ${format.toUpperCase()}`,
          },
          {
            type: 'image' as const,
            data: base64Data,
            mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
          },
        ],
      };
    },
  });
}
