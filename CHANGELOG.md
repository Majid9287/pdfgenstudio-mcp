# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-01-16

### Added

- Docker support for MCP Toolkit in Docker Desktop
- Dockerfile for containerized deployment
- Docker Compose configuration
- Documentation for Docker Desktop MCP Toolkit integration

## [1.0.0] - 2025-01-14

### Added

- Initial release of PDF Gen Studio MCP Server
- Template rendering with dynamic data injection
- JSON document rendering
- HTML to PDF/image conversion
- URL screenshot capture
- Template management tools (list, get, schema)
- Multiple transport support (stdio, HTTP streaming)
- Resources for templates and documentation
- Pre-built prompts for common tasks
- Full TypeScript support
- Comprehensive documentation

### Tools

- `render_template` - Render saved templates to PDF/PNG/JPG
- `render_template_image` - Render template as viewable image
- `render_json` - Convert JSON documents to PDF/image
- `render_json_image` - Render JSON as viewable image
- `render_html` - Convert HTML/CSS to PDF/image
- `render_html_image` - Render HTML as viewable image
- `render_url` - Screenshot webpages as PDF/image
- `render_url_image` - Screenshot as viewable image
- `list_templates` - List all saved templates
- `get_template` - Get template details
- `get_template_schema` - Get modifiable template elements

### Resources

- `pdfgenstudio://templates` - Template list
- `pdfgenstudio://templates/{id}` - Template details
- `pdfgenstudio://docs/api` - API documentation
- `pdfgenstudio://config` - Configuration status

### Prompts

- `generate-invoice` - Invoice generation workflow
- `generate-report` - Report generation workflow
- `capture-webpage` - Webpage capture workflow
- `use-template` - Template usage workflow
- `html-to-pdf` - HTML conversion workflow
