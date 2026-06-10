import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import * as fs from 'fs';
import * as path from 'path';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

const DB_PATH = path.resolve(process.cwd(), 'data', 'cim.db');

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function ensureDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('数据库不存在，正在初始化...');
    const { seed } = await import('./db/seed');
    await seed();
    console.log('数据库初始化完成');
  } else {
    console.log('数据库已存在，跳过初始化');
  }
}

app.prepare().then(async () => {
  await ensureDatabase();

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', err => {
    console.error(err);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});
