export function getFrameworkData() {
  const el = document.getElementById("__FRAMEWORK_DATA__");
  if (!el) return null;
  try {
    return JSON.parse(el.textContent || "null");
  } catch {
    return null;
  }
}
