import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
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
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const basePort = parseInt(process.env.PORT, 10) || 3001;
  const port = await findFreePort(basePort);

  const portFile = path.resolve(__dirname, '..', '.port');
  fs.writeFileSync(portFile, String(port));

  await app.listen(port);
  console.log(`Backend NestJS rodando na porta ${port}`);
}
bootstrap();
