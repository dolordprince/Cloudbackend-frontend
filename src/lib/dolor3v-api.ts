/**
 * DOLOR3V Microcloud API Client
 *
 * Centralized client for communication with DOLOR3V Cloudbackend:
 * https://cloudbackend.personaldolor.workers.dev
 *
 * Architecture:
 * USER -> DOLOR3V MOBILE STUDIO -> CLOUDBACKEND -> POLLINATIONS AI -> RESPONSE -> MOBILE UI
 * Zero mock responses. Zero simulation. No provider secrets in client code.
 */

export const DOLOR3V_BASE_URL = 'https://cloudbackend.personaldolor.workers.dev';

export interface HealthResponse {
  ok: boolean;
  service?: string;
  version?: string;
  runtime?: string;
  agents?: boolean;
  durableObjects?: boolean;
  sqlite?: boolean;
  websocket?: boolean;
  ahp?: string;
  browserRun?: boolean;
  pollinations?: boolean;
  timestamp?: string;
  error?: string;
}

export interface ModelItem {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelItem[];
}

export interface ChatMessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiRequest {
  prompt?: string;
  messages?: ChatMessagePayload[];
  model?: string;
  system?: string;
}

export interface AiResponse {
  ok: boolean;
  provider: string;
  result: string;
  error?: string;
}

export interface ImageRequest {
  prompt: string;
}

export interface ImageResponse {
  ok: boolean;
  provider: string;
  result: string;
  error?: string;
}

export interface BrowserRequest {
  url: string;
}

export interface BrowserResponse {
  ok: boolean;
  provider: string;
  result: {
    ok: boolean;
    url: string;
    title?: string;
    [key: string]: unknown;
  };
  error?: string;
}

export class Dolor3vApiError extends Error {
  status?: number;
  statusText?: string;
  details?: unknown;

  constructor(message: string, status?: number, statusText?: string, details?: unknown) {
    super(message);
    this.name = 'Dolor3vApiError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

/**
 * Check backend health status
 * GET /api/health
 */
export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const url = `${DOLOR3V_BASE_URL}/api/health`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!res.ok) {
      throw new Dolor3vApiError(
        `Health check failed with status ${res.status}: ${res.statusText}`,
        res.status,
        res.statusText
      );
    }

    const data: HealthResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Dolor3vApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to reach DOLOR3V Microcloud';
    throw new Dolor3vApiError(msg);
  }
}

/**
 * Retrieve available models
 * GET /v1/models
 */
export async function getModels(signal?: AbortSignal): Promise<ModelsResponse> {
  const url = `${DOLOR3V_BASE_URL}/v1/models`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!res.ok) {
      throw new Dolor3vApiError(
        `Models fetch failed with status ${res.status}: ${res.statusText}`,
        res.status,
        res.statusText
      );
    }

    const data: ModelsResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Dolor3vApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to load models list';
    throw new Dolor3vApiError(msg);
  }
}

/**
 * Send AI Prompt or Conversation to DOLOR3V Cloudbackend
 * POST /api/ai
 */
export async function postAi(params: AiRequest, signal?: AbortSignal): Promise<AiResponse> {
  const url = `${DOLOR3V_BASE_URL}/api/ai`;
  try {
    const payload: Record<string, unknown> = {};

    if (params.prompt) {
      payload.prompt = params.prompt;
    }
    if (params.messages && params.messages.length > 0) {
      payload.messages = params.messages;
    }
    if (params.model) {
      payload.model = params.model;
    }
    if (params.system) {
      payload.system = params.system;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }
      throw new Dolor3vApiError(
        errDetail || `AI request failed with status ${res.status}: ${res.statusText}`,
        res.status,
        res.statusText
      );
    }

    const data: AiResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Dolor3vApiError) throw err;
    const msg = err instanceof Error ? err.message : 'DOLOR3V could not complete that request.';
    throw new Dolor3vApiError(msg);
  }
}

/**
 * Generate Visual Asset with DOLOR3V Cloudbackend
 * POST /api/image
 */
export async function postImage(params: ImageRequest, signal?: AbortSignal): Promise<ImageResponse> {
  const url = `${DOLOR3V_BASE_URL}/api/image`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ prompt: params.prompt }),
      signal,
    });

    if (!res.ok) {
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }
      throw new Dolor3vApiError(
        errDetail || `Image generation failed with status ${res.status}`,
        res.status,
        res.statusText
      );
    }

    const data: ImageResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Dolor3vApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to generate visual asset';
    throw new Dolor3vApiError(msg);
  }
}

/**
 * Run Browser / Inspect URL with Cloudflare Browser-Run
 * POST /api/browser
 */
export async function postBrowser(params: BrowserRequest, signal?: AbortSignal): Promise<BrowserResponse> {
  const url = `${DOLOR3V_BASE_URL}/api/browser`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ url: params.url }),
      signal,
    });

    if (!res.ok) {
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }
      throw new Dolor3vApiError(
        errDetail || `Browser inspection failed with status ${res.status}`,
        res.status,
        res.statusText
      );
    }

    const data: BrowserResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Dolor3vApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Browser inspection failed';
    throw new Dolor3vApiError(msg);
  }
}
