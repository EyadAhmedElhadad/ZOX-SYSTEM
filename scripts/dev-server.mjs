import http from 'node:http';
import next from 'next';

const port = Number(process.env.PORT || 4028);
const hostname = process.env.HOSTNAME || '127.0.0.1';
const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

http
  .createServer((req, res) => handle(req, res))
  .listen(port, hostname, () => {
    console.log(`Ready on http://${hostname}:${port}`);
  });
