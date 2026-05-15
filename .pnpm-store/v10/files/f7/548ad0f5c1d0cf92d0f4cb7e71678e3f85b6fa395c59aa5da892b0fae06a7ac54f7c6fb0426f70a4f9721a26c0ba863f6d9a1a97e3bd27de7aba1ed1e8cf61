// src/const.ts
var requestSymbol = /* @__PURE__ */ Symbol.for("unRequest");
var env = typeof globalThis.process?.env !== "undefined" ? globalThis.process.env : typeof import.meta?.env !== "undefined" ? import.meta.env : {};

// src/request.ts
var deno = typeof Deno !== "undefined";
var bun = typeof Bun !== "undefined";
function createRequestAdapter(options = {}) {
  const { origin = env.ORIGIN, trustProxy = env.TRUST_PROXY === "1" } = options;
  let { protocol: protocolOverride, host: hostOverride } = origin ? new URL(origin) : {};
  if (protocolOverride) {
    protocolOverride = protocolOverride.slice(0, -1);
  }
  let warned = false;
  return function requestAdapter(req) {
    if (req[requestSymbol]) {
      return req[requestSymbol];
    }
    function parseForwardedHeader(name) {
      return (headers[`x-forwarded-${name}`] || "").split(",", 1)[0].trim();
    }
    let headers = req.headers;
    if (headers[":method"]) {
      headers = Object.fromEntries(Object.entries(headers).filter(([key]) => !key.startsWith(":")));
    }
    const protocol = protocolOverride || trustProxy && parseForwardedHeader("proto") || req.protocol || // biome-ignore lint/suspicious/noExplicitAny: encrypted can exist in some express versions
    req.socket?.encrypted && "https" || "http";
    let host = hostOverride || trustProxy && parseForwardedHeader("host") || headers.host;
    if (!host && !warned) {
      console.warn(
        "Could not automatically determine the origin host, using 'localhost'. Use the 'origin' option or the 'ORIGIN' environment variable to set the origin explicitly."
      );
      warned = true;
      host = "localhost";
    }
    const request = new Request(`${protocol}://${host}${req.originalUrl ?? req.url}`, {
      method: req.method,
      headers,
      body: convertBody(req),
      // @ts-expect-error
      duplex: "half"
    });
    req[requestSymbol] = request;
    return request;
  };
}
function convertBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return;
  }
  if (req.rawBody !== void 0) {
    return req.rawBody;
  }
  if (!bun && !deno) {
    return req;
  }
  return new ReadableStream({
    start(controller) {
      req.on("data", (chunk) => controller.enqueue(chunk));
      req.on("end", () => controller.close());
      req.on("error", (err) => controller.error(err));
    }
  });
}

export {
  requestSymbol,
  env,
  createRequestAdapter
};
