/**
 * Vercel serverless catch-all proxy.
 * Forwards ALL HTTP methods (GET, POST, PUT, DELETE) to the EC2 backend.
 * Uses the global fetch API (available in Node.js 18+ on Vercel).
 */

const EC2 = 'http://3.93.196.160:8000';

const SKIP_REQ_HEADERS  = new Set(['host', 'connection', 'transfer-encoding']);
const SKIP_RES_HEADERS  = new Set(['content-encoding', 'transfer-encoding', 'connection']);

export default async function handler(req, res) {
  try {
    // Build the backend path from Vercel's catch-all segments
    const segs = [].concat(req.query.path || []);
    const backendPath = segs.join('/');

    // Rebuild query string — drop Vercel's internal 'path' param
    const qp = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k === 'path') continue;
      for (const val of [].concat(v)) qp.append(k, val);
    }
    const qs = qp.toString();
    const url = `${EC2}/${backendPath}${qs ? '?' + qs : ''}`;

    console.log(`[PROXY] ${req.method} ${url}`);

    // Forward request headers (drop hop-by-hop headers)
    const fwdHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (!SKIP_REQ_HEADERS.has(k.toLowerCase())) fwdHeaders[k] = v;
    }

    // Read request body for methods that have one
    let body = undefined;
    if (!['GET', 'HEAD'].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) body = Buffer.concat(chunks);
    }

    // Call EC2 — fetch follows redirects automatically (handles FastAPI slash redirects)
    const upstream = await fetch(url, {
      method:   req.method,
      headers:  fwdHeaders,
      body,
      redirect: 'follow',
    });

    // Forward response status
    res.statusCode = upstream.status;

    // Forward response headers
    upstream.headers.forEach((v, k) => {
      if (!SKIP_RES_HEADERS.has(k.toLowerCase())) res.setHeader(k, v);
    });

    // Forward response body
    const buf = await upstream.arrayBuffer();
    res.end(Buffer.from(buf));

  } catch (err) {
    console.error('[PROXY ERROR]', String(err));
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Proxy error', detail: String(err) }));
  }
}
