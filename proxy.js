/**
 * Cloudflare Worker (or similar edge function) proxy for OpenRouter.
 *
 * Usage: deploy and set environment variable OPENROUTER_API_KEY.
 * Route path: /proxy -> this worker.
 * Frontend: enable "Use Proxy" to POST to /proxy.
 */

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '*';
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = env?.OPENROUTER_API_KEY;
    if (!apiKey) {
      return json({ error: 'Missing OPENROUTER_API_KEY on proxy.' }, 500, origin);
    }

    const incomingHeaders = new Headers(request.headers);
    // Prepare outbound headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': incomingHeaders.get('HTTP-Referer') || '',
      'X-Title': incomingHeaders.get('X-Title') || 'Prompt Enhancer (Proxy)'
    });

    const init = {
      method: 'POST',
      headers,
      body: await request.text(), // pass-through
      redirect: 'follow'
    };

    const upstream = await fetch(url, init);

    // Stream or JSON passthrough
    const respHeaders = new Headers(upstream.headers);
    // Ensure CORS
    const ch = corsHeaders(origin);
    ch.set('Content-Type', respHeaders.get('Content-Type') || 'application/json');
    ch.set('Cache-Control', 'no-store');

    if (!upstream.body) {
      const txt = await upstream.text().catch(() => '');
      return new Response(txt, { status: upstream.status, headers: ch });
    }

    return new Response(upstream.body, { status: upstream.status, headers: ch });
  }
}

function corsHeaders(origin) {
  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title',
    'Access-Control-Max-Age': '600'
  });
}

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: new Headers({ 'Content-Type': 'application/json', ...Object.fromEntries(corsHeaders(origin)) })
  });
}
