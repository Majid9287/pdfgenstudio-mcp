/**
 * Template rendering tools
 */

import type { FastMCP } from 'fastmcp';
import { z } from 'zod';
import type { Config } from '../config.js';
import { apiRequest, apiRequestBinary } from '../api-client.js';

/**
 * Register template rendering tools
 */
export function registerTemplateTools(server: FastMCP, config: Config): void {
  // Render template to PDF/Image
  server.addTool({
    name: 'render_template',
    description: `Render a saved template to PDF or image with optional dynamic data injection.

Use this tool to:
- Generate PDFs from your saved templates
- Create images (PNG/JPG) from templates
- Inject dynamic data into template placeholders

The template ID can be obtained from the list_templates tool.`,
    parameters: z.object({
      templateId: z.string().describe('The ID of the template to render'),
      data: z.record(z.unknown()).optional().describe('JSON data to inject into the template. Leave empty to use template defaults.'),
      format: z.enum(['pdf', 'png', 'jpg']).default('pdf').describe('Output format: pdf, png, or jpg'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
      options: z.object({
        textOverflow: z.enum(['ellipsis', 'clip', 'visible']).optional().describe('How to handle text overflow'),
        tablePagination: z.boolean().optional().describe('Enable table pagination across pages'),
        tableHeaderOnNewPage: z.boolean().optional().describe('Repeat table headers on new pages'),
        pixelRatio: z.number().optional().describe('Pixel ratio for image output (1-3)'),
        quality: z.number().optional().describe('Image quality (0-100)'),
        pageIndex: z.number().optional().describe('Specific page index to render'),
      }).optional().describe('Additional rendering options'),
    }),
    annotations: {
      title: 'Render Template',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { templateId, data, format, apiKey, options } = args;

      // Build query parameters
      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      if (options) {
        if (options.textOverflow) query.textOverflow = options.textOverflow;
        if (options.tablePagination !== undefined) query.tablePagination = options.tablePagination;
        if (options.tableHeaderOnNewPage !== undefined) query.tableHeaderOnNewPage = options.tableHeaderOnNewPage;
        if (options.pixelRatio) query.pixelRatio = options.pixelRatio;
        if (options.quality) query.quality = options.quality;
        if (options.pageIndex !== undefined) query.pageIndex = options.pageIndex;
      }

      // If no data provided, fetch template JSON first
      let templateData = data;
      if (!templateData || Object.keys(templateData).length === 0) {
        const templateResponse = await apiRequest<{ json: Record<string, unknown> }>(
          config,
          `/api/v1/templates/${templateId}`,
          { apiKey }
        );
        if (templateResponse.success && templateResponse.data?.json) {
          templateData = templateResponse.data.json;
        } else {
          templateData = { elements: [] };
        }
      }

      const result = await apiRequest(
        config,
        `/api/v1/renderer/templates/${templateId}`,
        {
          method: 'POST',
          body: { data: templateData },
          query,
          apiKey,
        }
      );

      return JSON.stringify({
        success: true,
        format,
        templateId,
        message: `Template rendered successfully as ${format.toUpperCase()}`,
        data: result.data,
      }, null, 2);
    },
  });

  // Render template and return image content
  server.addTool({
    name: 'render_template_image',
    description: `Render a template to an image and return it as viewable image content.

This tool returns the actual image data that can be displayed directly.
Use this when you want to show the rendered template as an image in the chat.`,
    parameters: z.object({
      templateId: z.string().describe('The ID of the template to render'),
      data: z.record(z.unknown()).optional().describe('JSON data to inject into the template'),
      format: z.enum(['png', 'jpg']).default('png').describe('Image format: png or jpg'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
    }),
    annotations: {
      title: 'Render Template as Image',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { templateId, data, format, apiKey } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      // Fetch template data if not provided
      let templateData = data;
      if (!templateData || Object.keys(templateData).length === 0) {
        const templateResponse = await apiRequest<{ json: Record<string, unknown> }>(
          config,
          `/api/v1/templates/${templateId}`,
          { apiKey }
        );
        if (templateResponse.success && templateResponse.data?.json) {
          templateData = templateResponse.data.json;
        } else {
          templateData = { elements: [] };
        }
      }

      const base64Data = await apiRequestBinary(
        config,
        `/api/v1/renderer/templates/${templateId}`,
        {
          method: 'POST',
          body: { data: templateData },
          query,
          apiKey,
        }
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: `Template ${templateId} rendered as ${format.toUpperCase()}`,
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
