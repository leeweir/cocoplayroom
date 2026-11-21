import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
// 默认预览源码；`node scripts/serve.mjs dist` 预览构建结果。HOST=0.0.0.0 时同一局域网的手机、平板也能打开。
const root = resolve(fileURLToPath(new URL('../', import.meta.url)), process.argv[2] ?? '.');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4177);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2', '.txt':'text/plain; charset=utf-8' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const content = await readFile(path);
    response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}).listen(port, host, () => console.log(`Game entrance (${root}): http://${host}:${port}`));
