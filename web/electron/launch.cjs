/**
 * Cross-platform Electron launcher wrapper.
 * Ensures ELECTRON_RUN_AS_NODE is stripped so Electron never drops into Node-only CLI mode
 * when launched from IDE terminals (VS Code, Antigravity, Cursor, etc.).
 */
const { spawn } = require('child_process');
const path = require('path');

const electronBinary = require('electron');
const appRoot = path.join(__dirname, '..');
const extraArgs = process.argv.slice(2);

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

if (extraArgs.includes('--dev')) {
  env.ELECTRON_DEV = '1';
}

const child = spawn(electronBinary, [appRoot, ...extraArgs], {
  stdio: 'inherit',
  env,
  windowsHide: false
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
