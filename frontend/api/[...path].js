/**
 * Vercel serverless catch-all proxy.
 * Routes /api/* → http://EC2:8000/*  for ALL HTTP methods.
 *
 * Vercel rewrites only support GET/HEAD for external http:// destinations.
 * This function handles PUT, POST, DELETE etc. that rewrites cannot.
 */

const BACKEND_ORIGIN = "http://3.93.196.160:8000";

export const config = {
  api: {
    // Disable body parsing so we can forward raw body (needed for file uploads)
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const pathParts = req.query.path || [];
  const backendPath = Array.isArray(pathParts) ? pathParts.join("/") : pathParts;

  // Rebuild query string (exclude the internal 'path' param added by Next/Vercel)
  const url = new URL(`${BACKEND_ORIGIN}/${backendPath}`);
  const incomingUrl = new URL(req.url, "http://placeholder");
  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== "path") url.searchParams.append(key, value);
  });

  // Forward safe headers — drop host & connection which must not be forwarded
  const forwardHeaders = {};
  const skipHeaders = new Set(["host", "connection", "transfer-encoding"]);
  for (const [key, value] of Object.entries(req.headers)) {
    if (!skipHeaders.has(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  }

  // Collect raw body
  const rawBody = await new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : null));
  });

  try {
    const backendRes = await fetch(url.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: rawBody || undefined,
    });

    // Forward response headers
    backendRes.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding", "connection"].includes(key)) {
        res.setHeader(key, value);
      }
    });

    res.status(backendRes.status);

    const contentType = backendRes.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await backendRes.json();
      res.json(data);
    } else {
      const buffer = await backendRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error("[PROXY ERROR]", err);
    res.status(502).json({ error: "Bad Gateway", detail: err.message });
  }
}
