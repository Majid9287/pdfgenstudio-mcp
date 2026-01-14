# PDF Gen Studio MCP Server

A Model Context Protocol (MCP) server for PDF Gen Studio - Generate PDFs and images from templates, JSON, HTML, or URLs.

[![npm version](https://badge.fury.io/js/%40pdfgenstudio%2Fmcp-server.svg)](https://www.npmjs.com/package/@pdfgenstudio/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📄 **Template Rendering** - Render saved templates with dynamic data injection
- 🔧 **JSON Rendering** - Convert JSON design documents to PDF/images
- 🌐 **HTML Rendering** - Convert HTML/CSS content to PDF/images
- 📸 **URL Rendering** - Screenshot any website URL as PDF/images
- 📋 **Template Management** - List and retrieve your saved templates

## Installation

### Using npm (Global)

```bash
npm install -g @pdfgenstudio/mcp-server
```

### Using npx (No Install)

```bash
npx @pdfgenstudio/mcp-server
```

### From Source

```bash
git clone https://github.com/pdfgenstudio/pdfgenstudio-mcp.git
cd pdfgenstudio-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

Set your PDF Gen Studio API key:

```bash
export PDFGENSTUDIO_API_KEY="your-api-key-here"
```

Or on Windows (PowerShell):

```powershell
$env:PDFGENSTUDIO_API_KEY = "your-api-key-here"
```

Or on Windows (Command Prompt):

```cmd
set PDFGENSTUDIO_API_KEY=your-api-key-here
```

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PDFGENSTUDIO_API_KEY` | Your PDF Gen Studio API key | Required |
| `PDFGENSTUDIO_BASE_URL` | API base URL | `https://api.pdfgenstudio.com` |

## Usage

### As stdio Server (Default)

```bash
# Using global install
pdfgenstudio-mcp

# Using npx
npx @pdfgenstudio/mcp-server

# With explicit transport
pdfgenstudio-mcp --transport stdio
```

### As HTTP Server

```bash
# Start HTTP server on port 3100
pdfgenstudio-mcp --transport http --port 3100

# Or with custom port
pdfgenstudio-mcp -t http -p 8080
```

### Development & Testing

```bash
# Test with fastmcp CLI
npm run test

# Inspect with MCP Inspector
npm run inspect
```

---

## 🔌 Client Integrations

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Linux:** `~/.config/Claude/claude_desktop_config.json`

#### Using npx (Recommended)

```json
{
  "mcpServers": {
    "pdfgenstudio": {
      "command": "npx",
      "args": ["-y", "@pdfgenstudio/mcp-server"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Using Local Installation

```json
{
  "mcpServers": {
    "pdfgenstudio": {
      "command": "node",
      "args": ["/absolute/path/to/pdfgenstudio-mcp/dist/index.js"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

After editing, restart Claude Desktop completely.

---

### VS Code (GitHub Copilot)

VS Code supports MCP servers through the GitHub Copilot extension.

#### Step 1: Enable MCP in VS Code

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for `github.copilot.chat.experimental.mcp`
3. Enable the setting

#### Step 2: Configure MCP Server

Create or edit `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "pdfgenstudio": {
      "command": "npx",
      "args": ["-y", "@pdfgenstudio/mcp-server"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Or add to your VS Code User Settings (`settings.json`):

```json
{
  "github.copilot.chat.experimental.mcp": true,
  "mcp": {
    "servers": {
      "pdfgenstudio": {
        "command": "npx",
        "args": ["-y", "@pdfgenstudio/mcp-server"],
        "env": {
          "PDFGENSTUDIO_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

#### Using Local Installation in VS Code

```json
{
  "servers": {
    "pdfgenstudio": {
      "command": "node",
      "args": ["C:/path/to/pdfgenstudio-mcp/dist/index.js"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

### Cursor

Cursor has built-in MCP support. Configure it in Cursor settings.

#### Step 1: Open Cursor Settings

1. Open Cursor
2. Go to `Settings` → `Cursor Settings` → `MCP`
3. Or press `Ctrl+Shift+P` / `Cmd+Shift+P` and search "MCP"

#### Step 2: Add MCP Server

Add the following configuration:

```json
{
  "mcpServers": {
    "pdfgenstudio": {
      "command": "npx",
      "args": ["-y", "@pdfgenstudio/mcp-server"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Alternative: Edit Config File Directly

**macOS:** `~/.cursor/mcp.json`

**Windows:** `%USERPROFILE%\.cursor\mcp.json`

**Linux:** `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "pdfgenstudio": {
      "command": "npx",
      "args": ["-y", "@pdfgenstudio/mcp-server"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

### Windsurf (Codeium)

Windsurf supports MCP through its configuration.

#### Configuration File Location

**macOS:** `~/.codeium/windsurf/mcp_config.json`

**Windows:** `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

**Linux:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "pdfgenstudio": {
      "command": "npx",
      "args": ["-y", "@pdfgenstudio/mcp-server"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

### Zed Editor

Zed has native MCP support. Configure in Zed settings.

#### Configuration

Edit `~/.config/zed/settings.json`:

```json
{
  "language_models": {
    "mcp_servers": {
      "pdfgenstudio": {
        "command": "npx",
        "args": ["-y", "@pdfgenstudio/mcp-server"],
        "env": {
          "PDFGENSTUDIO_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

---

### Continue (VS Code/JetBrains Extension)

Continue supports MCP servers for enhanced AI capabilities.

#### Configuration

Edit `~/.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "pdfgenstudio",
      "command": "npx",
      "args": ["-y", "@pdfgenstudio/mcp-server"],
      "env": {
        "PDFGENSTUDIO_API_KEY": "your-api-key-here"
      }
    }
  ]
}
```

---

### HTTP/SSE Mode (For Custom Clients)

For clients that support HTTP-based MCP connections:

#### Start the Server

```bash
# Start HTTP server
npx @pdfgenstudio/mcp-server --transport http --port 3100
```

#### Endpoints

- **HTTP Streaming:** `http://localhost:3100/mcp`
- **SSE:** `http://localhost:3100/sse`
- **Health Check:** `http://localhost:3100/health`

#### Example Client Connection

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3100/mcp")
);

const client = new Client({
  name: "my-client",
  version: "1.0.0",
});

await client.connect(transport);
```

---

### Troubleshooting

#### Common Issues

1. **"API key not configured"**
   - Ensure `PDFGENSTUDIO_API_KEY` is set in the `env` section
   - Check for typos in the environment variable name

2. **"Command not found" (npx)**
   - Make sure Node.js 18+ is installed
   - Try using the full path to npx: `/usr/local/bin/npx`

3. **Server not connecting**
   - Restart your IDE/application after configuration changes
   - Check the logs for error messages
   - Verify the path is correct for local installations

4. **Windows path issues**
   - Use forward slashes `/` or escaped backslashes `\\` in paths
   - Use absolute paths

#### Debug Mode

Run with debug logging:

```bash
DEBUG=* npx @pdfgenstudio/mcp-server
```

#### Verify Installation

```bash
# Test the server directly
npx @pdfgenstudio/mcp-server --help

# Test with MCP Inspector
npx fastmcp inspect /path/to/pdfgenstudio-mcp/src/index.ts
```

## Available Tools

### Template Tools

| Tool | Description |
|------|-------------|
| `render_template` | Render a template to PDF/PNG/JPG with data injection |
| `render_template_image` | Render template and return viewable image |

### JSON Tools

| Tool | Description |
|------|-------------|
| `render_json` | Convert JSON design document to PDF/image |
| `render_json_image` | Render JSON and return viewable image |

### HTML Tools

| Tool | Description |
|------|-------------|
| `render_html` | Convert HTML/CSS to PDF/image |
| `render_html_image` | Render HTML and return viewable image |

### URL Tools

| Tool | Description |
|------|-------------|
| `render_url` | Screenshot webpage as PDF/image |
| `render_url_image` | Screenshot and return viewable image |

### Management Tools

| Tool | Description |
|------|-------------|
| `list_templates` | List all saved templates |
| `get_template` | Get template details |
| `get_template_schema` | Get modifiable template elements |

## Resources

The MCP server provides these resources:

| URI | Description |
|-----|-------------|
| `pdfgenstudio://templates` | List of all templates |
| `pdfgenstudio://templates/{id}` | Specific template details |
| `pdfgenstudio://docs/api` | API documentation |
| `pdfgenstudio://config` | Current configuration status |

## Prompts

Pre-built prompts for common tasks:

| Prompt | Description |
|--------|-------------|
| `generate-invoice` | Generate invoice PDFs |
| `generate-report` | Create report documents |
| `capture-webpage` | Screenshot webpages |
| `use-template` | Render templates with data |
| `html-to-pdf` | Convert HTML to PDF |

## Example Usage

### Render a Template

```
Use the render_template tool to generate a PDF from template ID "abc123" 
with the following data: {"name": "John Doe", "amount": "$500"}
```

### Screenshot a Webpage

```
Capture a full-page screenshot of https://example.com as PNG
```

### Generate HTML Report

```
Convert this HTML to PDF:
<html>
  <body>
    <h1>Monthly Report</h1>
    <p>Content here...</p>
  </body>
</html>
```

## API Reference

For detailed API documentation, visit [docs.pdfgenstudio.com](https://docs.pdfgenstudio.com)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Test with MCP CLI
npm run test

# Inspect with MCP Inspector
npm run inspect
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📚 [Documentation](https://docs.pdfgenstudio.com)
- 💬 [Discord Community](https://discord.gg/pdfgenstudio)
- 🐛 [Issue Tracker](https://github.com/pdfgenstudio/pdfgenstudio-mcp/issues)
- 📧 [Email Support](mailto:support@pdfgenstudio.com)
