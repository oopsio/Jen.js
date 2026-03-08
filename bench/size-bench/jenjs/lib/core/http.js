export function parseCookies(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return {};
  const out = {};
  for (const part of cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    const trimmedName = k.trim();
    const trimmedValue = rest.join("=").trim();
    if (trimmedName && trimmedValue) {
      out[trimmedName] = decodeURIComponent(trimmedValue);
    }
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
