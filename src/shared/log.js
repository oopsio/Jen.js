function ts() {
  return new Date().toISOString();
}
export const log = {
  info(msg) {
    console.log(`[${ts()}] [INFO] ${msg}`);
  },
  warn(msg) {
    console.warn(`[${ts()}] [WARN] ${msg}`);
  },
  error(msg) {
    console.error(`[${ts()}] [ERROR] ${msg}`);
  },
};
