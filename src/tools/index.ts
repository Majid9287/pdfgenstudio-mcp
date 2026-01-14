/**
 * Tools registration for PDF Gen Studio MCP Server
 */

import type { FastMCP } from 'fastmcp';
import type { Config } from '../config.js';
import { registerTemplateTools } from './template.js';
import { registerJsonTools } from './json.js';
import { registerHtmlTools } from './html.js';
import { registerUrlTools } from './url.js';
import { registerManagementTools } from './management.js';

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: FastMCP, config: Config): void {
  registerTemplateTools(server, config);
  registerJsonTools(server, config);
  registerHtmlTools(server, config);
  registerUrlTools(server, config);
  registerManagementTools(server, config);
}
