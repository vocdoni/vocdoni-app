// src/response.ts
import { nodeHeadersToWeb } from "@universal-middleware/core";
async function sendResponse(fetchResponse, nodeResponse) {
  const fetchBody = fetchResponse.body;
  let body = null;
  if (!fetchBody) {
    body = null;
  } else if (typeof fetchBody.pipe === "function") {
    body = fetchBody;
  } else if (typeof fetchBody.pipeTo === "function") {
    const { Readable } = await import("node:stream");
    if (Readable.fromWeb) {
      body = Readable.fromWeb(fetchBody);
    } else {
      const reader = fetchBody.getReader();
      body = new Readable({
        async read() {
          try {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              const canContinue = this.push(value);
              if (!canContinue) {
                reader.releaseLock();
              }
            }
          } catch (e) {
            this.destroy(e);
          }
        },
        destroy(err, callback) {
          reader.cancel().finally(() => callback(err));
        }
      });
    }
  } else if (fetchBody) {
    const { Readable } = await import("node:stream");
    body = Readable.from(fetchBody);
  }
  setResponseHeaders(fetchResponse, nodeResponse);
  if (body) {
    const { pipeline } = await import("node:stream/promises");
    await pipeline(body, nodeResponse).catch(() => {
    });
  } else {
    nodeResponse.setHeader("content-length", "0");
    nodeResponse.end();
  }
}
function getFullUrl(pathnameOrFull, req) {
  try {
    return new URL(pathnameOrFull).href;
  } catch {
    const protocol = req.socket?.encrypted || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const baseUrl = `${protocol}://${host}`;
    return new URL(pathnameOrFull, baseUrl).href;
  }
}
function responseAdapter(nodeResponse, bodyInit) {
  if ([301, 302, 303, 307, 308].includes(nodeResponse.statusCode) && nodeResponse.req) {
    const location = nodeResponse.getHeader("location");
    if (location) {
      const fullUrl = getFullUrl(location, nodeResponse.req);
      return Response.redirect(fullUrl, nodeResponse.statusCode);
    }
  }
  return new Response([204, 304].includes(nodeResponse.statusCode) ? null : bodyInit, {
    status: nodeResponse.statusCode,
    statusText: nodeResponse.statusMessage,
    headers: nodeHeadersToWeb(nodeResponse.getHeaders())
  });
}
function setResponseHeaders(fetchResponse, nodeResponse, mirror = false) {
  nodeResponse.statusCode = fetchResponse.status;
  if (fetchResponse.statusText) {
    nodeResponse.statusMessage = fetchResponse.statusText;
  }
  const nodeResponseHeaders = new Set(Object.keys(nodeResponse.getHeaders()));
  const setCookie = fetchResponse.headers.getSetCookie();
  for (const cookie of setCookie) {
    nodeResponse.appendHeader("set-cookie", cookie);
  }
  fetchResponse.headers.forEach((value, key) => {
    nodeResponseHeaders.delete(key);
    if (key === "set-cookie") return;
    nodeResponse.setHeader(key, value);
  });
  if (mirror) {
    nodeResponseHeaders.forEach((key) => {
      nodeResponse.removeHeader(key);
    });
  }
}

export {
  sendResponse,
  responseAdapter,
  setResponseHeaders
};
