/**
 * HTTP client for PDF Gen Studio API
 */

import type { Config } from './config.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  apiKey?: string;
}

/**
 * Make an API request to PDF Gen Studio
 */
export async function apiRequest<T = unknown>(
  config: Config,
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, query, apiKey } = options;
  
  const key = apiKey || config.apiKey;
  if (!key) {
    throw new Error('API key is required. Set PDFGENSTUDIO_API_KEY environment variable or pass apiKey parameter.');
  }

  // Build URL with query parameters
  const url = new URL(endpoint, config.baseUrl);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Key': key,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

/**
 * Make an API request and return binary data as base64
 */
export async function apiRequestBinary(
  config: Config,
  endpoint: string,
  options: RequestOptions = {}
): Promise<string> {
  const { method = 'GET', body, query, apiKey } = options;
  
  const key = apiKey || config.apiKey;
  if (!key) {
    throw new Error('API key is required. Set PDFGENSTUDIO_API_KEY environment variable or pass apiKey parameter.');
  }

  // Build URL with query parameters
  const url = new URL(endpoint, config.baseUrl);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': key,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${errorText || response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}
