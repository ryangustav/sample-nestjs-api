const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function waitForFile(filePath, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (fs.existsSync(filePath)) {
        return resolve(fs.readFileSync(filePath, 'utf-8').trim());
      }
      if (Date.now() - start > timeout) {
        return reject(new Error('Timeout esperando backend iniciar'));
      }
      setTimeout(check, 500);
    };
    check();
  });
}

function killAll(backend, frontend) {
  if (backend && !backend.killed) backend.kill();
  if (frontend && !frontend.killed) frontend.kill();
}

async function main() {
  const portFile = path.resolve(__dirname, 'backend', '.port');
  if (fs.existsSync(portFile)) fs.unlinkSync(portFile);

  const isWin = process.platform === 'win32';
  const shell = isWin;
  let frontend = null;

  console.log('[BACK] Iniciando backend NestJS (SWC)...');
  const backend = spawn('npm', ['run', 'start'], {
    cwd: path.resolve(__dirname, 'backend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell,
  });

  backend.stdout.on('data', (d) => process.stdout.write(`[BACK] ${d}`));
  backend.stderr.on('data', (d) => process.stderr.write(`[BACK] ${d}`));
  backend.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`[BACK] Backend encerrou com código ${code}`);
      killAll(null, frontend);
      process.exit(code);
    }
  });

  console.log('[BACK] Aguardando backend encontrar porta...');
  let backendPort;
  try {
    backendPort = await waitForFile(portFile);
    console.log(`[BACK] Backend confirmado na porta ${backendPort}`);
  } catch {
    console.error('[BACK] Backend não iniciou a tempo');
    killAll(backend, null);
    process.exit(1);
  }

  const frontendEnv = {
    ...process.env,
    VITE_BACKEND_PORT: String(backendPort),
  };

  console.log('[FRONT] Iniciando frontend Vite...');
  frontend = spawn('npm', ['run', 'start'], {
    cwd: path.resolve(__dirname, 'frontend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: frontendEnv,
    shell,
  });

  frontend.stdout.on('data', (d) => process.stdout.write(`[FRONT] ${d}`));
  frontend.stderr.on('data', (d) => process.stderr.write(`[FRONT] ${d}`));
  frontend.on('exit', (code) => {
    console.log(`[FRONT] Frontend encerrou com código ${code}`);
    killAll(backend, null);
    process.exit(code || 0);
  });

  process.on('SIGINT', () => { killAll(backend, frontend); process.exit(0); });
  process.on('SIGTERM', () => { killAll(backend, frontend); process.exit(0); });
}

main();
