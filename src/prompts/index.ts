/**
 * Prompts for PDF Gen Studio MCP Server
 */

import type { FastMCP } from 'fastmcp';

/**
 * Register prompts with the MCP server
 */
export function registerPrompts(server: FastMCP): void {
  // Invoice generation prompt
  server.addPrompt({
    name: 'generate-invoice',
    description: 'Generate an invoice PDF from provided data',
    arguments: [
      {
        name: 'invoiceNumber',
        description: 'Invoice number',
        required: true,
      },
      {
        name: 'customerName',
        description: 'Customer name',
        required: true,
      },
      {
        name: 'items',
        description: 'Invoice items (JSON array with description, quantity, price)',
        required: true,
      },
    ],
    load: async ({ invoiceNumber, customerName, items }) => {
      return `Generate an invoice PDF with the following details:

Invoice Number: ${invoiceNumber}
Customer: ${customerName}
Items: ${items}

Please:
1. First check if there's an invoice template available using list_templates
2. If found, use render_template with the appropriate data
3. If not, use render_html to create a professional invoice

Format the invoice professionally with:
- Company header
- Invoice details
- Item table with totals
- Payment terms`;
    },
  });

  // Report generation prompt
  server.addPrompt({
    name: 'generate-report',
    description: 'Generate a report document from data',
    arguments: [
      {
        name: 'title',
        description: 'Report title',
        required: true,
      },
      {
        name: 'content',
        description: 'Report content or data',
        required: true,
      },
      {
        name: 'format',
        description: 'Output format (pdf, png, jpg)',
        required: false,
      },
    ],
    load: async ({ title, content, format }) => {
      return `Generate a ${format || 'PDF'} report with the following:

Title: ${title}
Content: ${content}

Create a professional report document using render_html with:
- Professional header with title
- Well-formatted content sections
- Page numbers and date
- Clean, readable typography`;
    },
  });

  // Screenshot prompt
  server.addPrompt({
    name: 'capture-webpage',
    description: 'Capture a webpage as PDF or image',
    arguments: [
      {
        name: 'url',
        description: 'URL to capture',
        required: true,
      },
      {
        name: 'format',
        description: 'Output format (pdf, png, jpg)',
        required: false,
      },
      {
        name: 'fullPage',
        description: 'Capture full page (true/false)',
        required: false,
      },
    ],
    load: async ({ url, format, fullPage }) => {
      return `Capture the webpage at ${url} as a ${format || 'PDF'}.

${fullPage === 'true' ? 'Capture the full page content.' : 'Capture only the visible viewport.'}

Use the render_url tool with appropriate options.`;
    },
  });

  // Template usage prompt
  server.addPrompt({
    name: 'use-template',
    description: 'Render a template with custom data',
    arguments: [
      {
        name: 'templateName',
        description: 'Name or description of the template to use',
        required: true,
      },
      {
        name: 'data',
        description: 'Data to inject into the template (JSON)',
        required: false,
      },
    ],
    load: async ({ templateName, data }) => {
      return `Find and render a template matching "${templateName}".

Steps:
1. Use list_templates to find templates
2. Identify the best matching template by name
3. Use get_template_schema to understand what data can be modified
4. Render the template using render_template${data ? ` with this data: ${data}` : ''}

Return the rendered document.`;
    },
  });

  // HTML to PDF prompt
  server.addPrompt({
    name: 'html-to-pdf',
    description: 'Convert HTML content to PDF',
    arguments: [
      {
        name: 'html',
        description: 'HTML content to convert',
        required: true,
      },
      {
        name: 'options',
        description: 'PDF options (page size, margins, etc.)',
        required: false,
      },
    ],
    load: async ({ html, options }) => {
      return `Convert the following HTML to PDF:

\`\`\`html
${html}
\`\`\`

${options ? `Options: ${options}` : 'Use default PDF settings (A4, portrait).'}

Use the render_html tool to generate the PDF.`;
    },
  });
}
