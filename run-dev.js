const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '==============================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Room-Sync Fullstack Dev Servers...');
console.log('\x1b[36m%s\x1b[0m', '   Backend:  http://localhost:5000');
console.log('\x1b[36m%s\x1b[0m', '   Frontend: http://localhost:5143');
console.log('\x1b[36m%s\x1b[0m', '==============================================\n');

function runService(name, cwd, colorPrefix) {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npm.cmd run dev' : 'npm run dev';

  const child = spawn(cmd, {
    cwd: path.resolve(__dirname, cwd),
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  const prefix = `${colorPrefix}[${name}]\x1b[0m `;

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${prefix}${line}`);
      }
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.error(`${prefix}${line}`);
      }
    }
  });

  child.on('close', (code) => {
    console.log(`${prefix}process stopped (exit code ${code})`);
  });

  return child;
}

const backend = runService('Backend', 'backend', '\x1b[32m');
const frontend = runService('Frontend', 'frontend', '\x1b[34m');

function cleanup() {
  console.log('\nShutting down dev servers...');
  if (process.platform === 'win32') {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
  } else {
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
