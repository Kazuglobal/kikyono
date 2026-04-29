import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const ngBin = resolve(root, 'node_modules/@angular/cli/bin/ng.js');

const env = { ...process.env };

if (process.platform === 'win32') {
  env.SystemRoot ||= 'C:\\Windows';
  env.windir ||= env.SystemRoot;
}

const child = spawn(process.execPath, [ngBin, ...process.argv.slice(2)], {
  cwd: root,
  env,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
