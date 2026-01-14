/**
 * URL/Webpage rendering tools
 */

import type { FastMCP } from 'fastmcp';
import { z } from 'zod';
import type { Config } from '../config.js';
import { apiRequest, apiRequestBinary } from '../api-client.js';

/**
 * Register URL rendering tools
 */
export function registerUrlTools(server: FastMCP, config: Config): void {
  // Render URL to PDF/Image
  server.addTool({
    name: 'render_url',
    description: `Screenshot any website URL and convert to PDF or image.

Use this tool to:
- Capture webpage screenshots as images
- Convert webpages to PDF documents
- Archive web content as documents

Supports full JavaScript rendering and responsive layouts.`,
    parameters: z.object({
      url: z.string().url().describe('The URL of the webpage to capture'),
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
      viewportOptions: z.object({
        width: z.number().optional().describe('Viewport width in pixels'),
        height: z.number().optional().describe('Viewport height in pixels'),
        deviceScaleFactor: z.number().optional().describe('Device scale factor (1-3)'),
        isMobile: z.boolean().optional().describe('Emulate mobile device'),
        hasTouch: z.boolean().optional().describe('Enable touch events'),
      }).optional().describe('Viewport/device emulation options'),
      navigationOptions: z.object({
        waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional().describe('Wait condition'),
        timeout: z.number().optional().describe('Navigation timeout in milliseconds'),
        waitForSelector: z.string().optional().describe('CSS selector to wait for'),
        waitForTimeout: z.number().optional().describe('Additional wait time in milliseconds'),
      }).optional().describe('Navigation and timing options'),
    }),
    annotations: {
      title: 'Render URL to PDF/Image',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { url, format, apiKey, pdfOptions, imageOptions, viewportOptions, navigationOptions } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      // Build combined options
      const allOptions: Record<string, unknown> = {};

      // Add format-specific options
      if (format === 'pdf' && pdfOptions) {
        Object.entries(pdfOptions).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === 'pageFormat') {
              allOptions.format = value;
            } else if (key === 'margin' && typeof value === 'object') {
              Object.entries(value as Record<string, string>).forEach(([side, margin]) => {
                if (margin) {
                  allOptions[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`] = margin;
                }
              });
            } else {
              allOptions[key] = value;
            }
          }
        });
      } else if (imageOptions) {
        Object.entries(imageOptions).forEach(([key, value]) => {
          if (value !== undefined) {
            allOptions[key] = value;
          }
        });
      }

      // Add viewport options
      if (viewportOptions) {
        Object.entries(viewportOptions).forEach(([key, value]) => {
          if (value !== undefined) {
            allOptions[key] = value;
          }
        });
      }

      // Add navigation options
      if (navigationOptions) {
        Object.entries(navigationOptions).forEach(([key, value]) => {
          if (value !== undefined) {
            allOptions[key] = value;
          }
        });
      }

      // Add all options to query
      Object.entries(allOptions).forEach(([key, value]) => {
        if (value !== undefined) {
          query[key] = value as string | number | boolean;
        }
      });

      const result = await apiRequest(
        config,
        '/api/v1/renderer/url',
        {
          method: 'POST',
          body: { url, options: allOptions },
          query,
          apiKey,
        }
      );

      return JSON.stringify({
        success: true,
        format,
        sourceUrl: url,
        message: `URL captured successfully as ${format.toUpperCase()}`,
        data: result.data,
      }, null, 2);
    },
  });

  // Render URL and return image
  server.addTool({
    name: 'render_url_image',
    description: `Screenshot a webpage and return it as viewable image content.

This tool captures a webpage screenshot and returns the actual image data
that can be displayed directly in chat.`,
    parameters: z.object({
      url: z.string().url().describe('The URL of the webpage to capture'),
      format: z.enum(['png', 'jpg']).default('png').describe('Image format: png or jpg'),
      apiKey: z.string().optional().describe('API key (optional if PDFGENSTUDIO_API_KEY env var is set)'),
      fullPage: z.boolean().optional().describe('Capture full page'),
      width: z.number().optional().describe('Viewport width'),
      height: z.number().optional().describe('Viewport height'),
    }),
    annotations: {
      title: 'Screenshot URL as Image',
      readOnlyHint: true,
      openWorldHint: true,
    },
    execute: async (args) => {
      const { url, format, apiKey, fullPage, width, height } = args;

      const query: Record<string, string | number | boolean | undefined> = {
        format,
        response: 'base64',
      };

      if (fullPage !== undefined) query.fullPage = fullPage;
      if (width) query.width = width;
      if (height) query.height = height;

      const base64Data = await apiRequestBinary(
        config,
        '/api/v1/renderer/url',
        {
          method: 'POST',
          body: { url },
          query,
          apiKey,
        }
      );

      return {
        content: [
          {
            type: 'text' as const,
            text: `Screenshot of ${url} captured as ${format.toUpperCase()}`,
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
