/**
 * Template management tools
 */

import type { FastMCP } from 'fastmcp';
import { z } from 'zod';
import type { Config } from '../config.js';
import { apiRequest } from '../api-client.js';

interface Template {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  json?: Record<string, unknown>;
}

/**
 * Register template management tools
 */
export function registerManagementTools(server: FastMCP, config: Config): void {
  // List all templates
  server.addTool({
    name: 'list_templates',
    description: `List all saved templates in your PDF Gen Studio account.

Use this tool to:
- Get a list of all available templates
- Find template IDs for rendering
- Browse your template library

Returns template metadata including ID, name, description, and timestamps.`,
    parameters: z.object({
      limit: z.number().optional().describe('Maximum number of templates to return (default: all)'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
    }),
    annotations: {
      title: 'List Templates',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { limit, apiKey } = args;

      const response = await apiRequest<Template[]>(
        config,
        '/api/v1/templates',
        { apiKey }
      );

      if (!response.success || !Array.isArray(response.data)) {
        return JSON.stringify({
          success: false,
          templates: [],
          message: 'Failed to retrieve templates',
        }, null, 2);
      }

      let templates = response.data;
      if (limit && templates.length > limit) {
        templates = templates.slice(0, limit);
      }

      // Format template list for better readability
      const formattedTemplates = templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || 'No description',
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      return JSON.stringify({
        success: true,
        count: formattedTemplates.length,
        templates: formattedTemplates,
      }, null, 2);
    },
  });

  // Get single template details
  server.addTool({
    name: 'get_template',
    description: `Get detailed information about a specific template.

Use this tool to:
- View template details before rendering
- Get the template's JSON schema/structure
- Understand what data can be injected

Returns full template metadata and optionally the JSON structure.`,
    parameters: z.object({
      templateId: z.string().describe('The ID of the template to retrieve'),
      includeJson: z.boolean().default(true).describe('Include the full JSON structure in response'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
    }),
    annotations: {
      title: 'Get Template Details',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { templateId, includeJson, apiKey } = args;

      const response = await apiRequest<Template>(
        config,
        `/api/v1/templates/${templateId}`,
        { apiKey }
      );

      if (!response.success || !response.data) {
        return JSON.stringify({
          success: false,
          message: `Failed to retrieve template: ${templateId}`,
        }, null, 2);
      }

      const template = response.data;
      const result: Record<string, unknown> = {
        success: true,
        id: template.id,
        name: template.name,
        description: template.description,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };

      if (includeJson && template.json) {
        result.json = template.json;
      }

      return JSON.stringify(result, null, 2);
    },
  });

  // Get template schema (elements that can be modified)
  server.addTool({
    name: 'get_template_schema',
    description: `Get the modifiable elements/schema of a template.

Use this tool to understand what data fields can be customized when rendering a template.
This is helpful for building dynamic data injection.`,
    parameters: z.object({
      templateId: z.string().describe('The ID of the template'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
    }),
    annotations: {
      title: 'Get Template Schema',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { templateId, apiKey } = args;

      const response = await apiRequest<Template>(
        config,
        `/api/v1/templates/${templateId}`,
        { apiKey }
      );

      if (!response.success || !response.data?.json) {
        return JSON.stringify({
          success: false,
          message: `Failed to retrieve template schema: ${templateId}`,
        }, null, 2);
      }

      const json = response.data.json;
      
      // Extract elements that can be modified
      interface Element {
        id?: string;
        type?: string;
        text?: string;
        src?: string;
        name?: string;
      }
      
      const elements = (json.elements as Element[] || []).map((el: Element) => ({
        id: el.id,
        type: el.type,
        // Include key modifiable properties based on type
        ...(el.text !== undefined && { currentText: el.text }),
        ...(el.src !== undefined && { currentSrc: el.src }),
        ...(el.name && { name: el.name }),
      }));

      return JSON.stringify({
        success: true,
        templateId,
        templateName: response.data.name,
        elementCount: elements.length,
        elements,
        hint: 'Modify element properties (text, src, etc.) in the data parameter when rendering',
      }, null, 2);
    },
  });
}
