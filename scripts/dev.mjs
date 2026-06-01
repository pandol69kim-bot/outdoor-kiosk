import { spawn } from 'node:child_process';
import process from 'node:process';

if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env.local');
}

const port = process.env.PORT || '3000';

const nextProcess = spawn(
  process.execPath,
  ['./node_modules/next/dist/bin/next', 'dev', '-p', port],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

nextProcess.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
