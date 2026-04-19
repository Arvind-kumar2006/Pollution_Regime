/**
 * Vercel serverless proxy — forwards ALL HTTP methods to EC2.
 * Uses Node.js built-in `http` module (no fetch dependency).
 */
import http from 'http';

const BACKEND_HOST = '3.93.196.160';
const BACKEND_PORT = 8000;

export default function handler(req, res) {
  return new Promise((resolve) => {
    // Build backend path from catch-all segments
    const pathParts = Array.isArray(req.query.path)
      ? req.query.path
      : req.query.path
      ? [req.query.path]
      : [];
    const backendPath = pathParts.join('/');

    // Rebuild query string — exclude the internal 'path' Vercel param
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === 'path') continue;
      const vals = Array.isArray(value) ? value : [value];
      vals.forEach((v) => params.append(key, v));
    }
    const qs = params.toString();
    const targetPath = `/${backendPath}${qs ? '?' + qs : ''}`;

    // Forward headers — drop host & connection (must not be forwarded)
    const headers = { ...req.headers };
    delete headers['host'];
    delete headers['connection'];

    const options = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: targetPath,
      method: req.method,
      headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.statusCode = proxyRes.statusCode;

      // Forward response headers
      for (const [key, val] of Object.entries(proxyRes.headers)) {
        const lower = key.toLowerCase();
        if (lower !== 'content-encoding' && lower !== 'transfer-encoding' && lower !== 'connection') {
          res.setHeader(key, val);
        }
      }

      // Stream the response body back to the browser
      proxyRes.pipe(res, { end: true });
      proxyRes.on('end', resolve);
    });

    proxyReq.on('error', (err) => {
      console.error('[PROXY ERROR]', err.message);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Bad Gateway', detail: err.message }));
      resolve();
    });

    // Stream the request body (needed for POST/PUT/multipart uploads)
    req.pipe(proxyReq, { end: true });
  });
}
