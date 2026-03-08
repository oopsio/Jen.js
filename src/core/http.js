export function parseCookies(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return {};
  const out = {};
  for (const part of cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    out[k] = decodeURIComponent(rest.join("=") || "");
  }
  return out;
}
export function headersToObject(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    if (Array.isArray(v)) out[k] = v.join(", ");
    else if (typeof v === "string") out[k] = v;
  }
  return out;
}
