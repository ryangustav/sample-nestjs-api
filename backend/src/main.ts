import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '..', '.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as net from 'net';
import * as fs from 'fs';
import { AppModule } from './app.module';

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port);
  });
}

async function findFreePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortFree(port))) {
    console.log(`Porta ${port} em uso, tentando ${port + 1}...`);
    port++;
  }
  return port;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const frontendPath = path.resolve(__dirname, '..', '..', 'frontend', 'build');
  if (fs.existsSync(frontendPath)) {
    app.useStaticAssets(frontendPath);
    app.setBaseViewsDir(frontendPath);

    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('*', (req, res, next) => {
      if (req.url.startsWith('/api/')) return next();
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  const basePort = parseInt(process.env.PORT, 10) || 3001;
  const port = await findFreePort(basePort);

  const portFile = path.resolve(__dirname, '..', '.port');
  fs.writeFileSync(portFile, String(port));

  await app.listen(port);
  console.log(`Backend rodando na porta ${port}`);
  if (fs.existsSync(frontendPath)) {
    console.log(`Frontend servido em http://localhost:${port}`);
  }
}
bootstrap();
