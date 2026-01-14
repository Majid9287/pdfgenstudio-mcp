/**
 * Configuration management for PDF Gen Studio MCP Server
 */

export interface Config {
  apiKey: string;
  baseUrl: string;
}

export interface ParsedArgs {
  transport?: 'stdio' | 'http' | 'httpStream' | 'sse';
  port?: number;
  apiKey?: string;
}

/**
 * Parse command line arguments
 */
export function parseArgs(): ParsedArgs {
  const args: ParsedArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg === '--transport' || arg === '-t') {
      args.transport = argv[++i] as ParsedArgs['transport'];
    } else if (arg === '--port' || arg === '-p') {
      args.port = parseInt(argv[++i], 10);
    } else if (arg === '--api-key' || arg === '-k') {
      args.apiKey = argv[++i];
    } else if (arg.startsWith('--transport=')) {
      args.transport = arg.split('=')[1] as ParsedArgs['transport'];
    } else if (arg.startsWith('--port=')) {
      args.port = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--api-key=')) {
      args.apiKey = arg.split('=')[1];
    }
  }

  return args;
}

/**
 * Get configuration from environment and CLI args
 */
export function getConfig(): Config {
  const args = parseArgs();
  
  return {
    apiKey: args.apiKey || process.env.PDFGENSTUDIO_API_KEY || '',
    baseUrl: process.env.PDFGENSTUDIO_BASE_URL || 'https://api.pdfgenstudio.com',
  };
}
