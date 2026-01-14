/**
 * HTML rendering tools
 */

import type { FastMCP } from 'fastmcp';
import { z } from 'zod';
import type { Config } from '../config.js';
import { apiRequest, apiRequestBinary } from '../api-client.js';

/**
 * Register HTML rendering tools
 */
export function registerHtmlTools(server: FastMCP, config: Config): void {
  // Render HTML to PDF/Image
  server.addTool({
    name: 'render_html',
    description: `Convert HTML/CSS content to PDF or image.

Use this tool to:
- Generate PDFs from HTML content
- Create images from HTML/CSS
- Convert web content to downloadable documents

Supports full HTML5, CSS3, and inline styles.`,
    parameters: z.object({
      html: z.string().describe('HTML content to render (can include CSS)'),
      format: z.enum(['pdf', 'png', 'jpg']).default('pdf').describe('Output format: pdf, png, or jpg'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
      pdfOptions: z.object({
        pageFormat: z.enum(['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid']).optional().describe('PDF page format'),
        landscape: z.boolean().optional().describe('Landscape orientation'),
        printBackground: z.boolean().optional().describe('Print background graphics'),
        displayHeaderFooter: z.boolean().optional().describe('Display header and footer'),
        headerTemplate: z.string().optional().describe('HTML template for header'),
        footerTemplate: z.string().optional().describe('HTML template for footer'),
        margin: z.object({
          top: z.string().optional(),
          right: z.string().optional(),
          bottom: z.string().optional(),
          left: z.string().optional(),
        }).optional().describe('Page margins'),
      }).optional().describe('PDF-specific options (only for PDF format)'),
      imageOptions: z.object({
        width: z.number().optional().describe('Viewport width'),
        height: z.number().optional().describe('Viewport height'),
        fullPage: z.boolean().optional().describe('Capture full page'),
        omitBackground: z.boolean().optional().describe('Omit default white background'),
        quality: z.number().optional().describe('Image quality (0-100, JPG only)'),
      }).optional().describe('Image-specific options (only for PNG/JPG format)'),
    }),
    annotations: {
      title: 'Render HTML to PDF/Image',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { html, format, apiKey, pdfOptions, imageOptions } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      // Add format-specific options
      const options = format === 'pdf' ? pdfOptions : imageOptions;
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined && key !== 'margin') {
            if (key === 'pageFormat') {
              query.format = value as string;
            } else {
              query[key] = typeof value === 'object' ? JSON.stringify(value) : value;
            }
          }
        });

        // Handle margin separately
        if (pdfOptions?.margin) {
          Object.entries(pdfOptions.margin).forEach(([side, value]) => {
            if (value) {
              query[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`] = value;
            }
          });
        }
      }

      const result = await apiRequest(
        config,
        '/api/v1/renderer/html',
        {
          method: 'POST',
          body: { html, options },
          query,
          apiKey,
        }
      );

      return JSON.stringify({
        success: true,
        format,
        message: `HTML rendered successfully as ${format.toUpperCase()}`,
        data: result.data,
      }, null, 2);
    },
  });

  // Render HTML and return image
  server.addTool({
    name: 'render_html_image',
    description: `Render HTML content to an image and return it as viewable image content.

This tool returns the actual image data that can be displayed directly in chat.`,
    parameters: z.object({
      html: z.string().describe('HTML content to render'),
      format: z.enum(['png', 'jpg']).default('png').describe('Image format: png or jpg'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
      width: z.number().optional().describe('Viewport width'),
      height: z.number().optional().describe('Viewport height'),
    }),
    annotations: {
      title: 'Render HTML as Image',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { html, format, apiKey, width, height } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      if (width) query.width = width;
      if (height) query.height = height;

      const base64Data = await apiRequestBinary(
        config,
        '/api/v1/renderer/html',
        {
          method: 'POST',
          body: { html },
          query,
          apiKey,
        }
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: `HTML rendered as ${format.toUpperCase()}`,
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
