export function matchPath(pattern, path) {
  if (pattern === "*") return true;
  if (pattern === path) return true;
  // Basic glob: * matches anything
  const regexString =
    "^" +
    pattern
      .replace(/[.+?^${}()|[\\]/g, "\\$&") // escape regex characters
      .replace(/\*/g, ".*") +
    "$"; // convert * to .*
  const regex = new RegExp(regexString);
  return regex.test(path);
}
