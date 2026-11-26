const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const pkg = require('../package.json');
const APP_NAME = 'BarakahBepaar';
const APP_VERSION = pkg.version || '1.0.0';
const BRIDGE_PORT_START = 38900;
const BRIDGE_PORT_END = 38910;
const MAX_LOG_BYTES = 500 * 1024;
const MAX_SNAPSHOTS = 30;

if (process.platform === 'win32') {
  app.setAppUserModelId('com.barakahbepar.retail');
}

let mainWindow = null;
let bridgeServer = null;
let activeBridgePort = null;
let dataDir = null;

// Single instance lock so double-clicking doesn't open duplicate POS instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ============================================================================
// 1. CRASH-PROOF DATA DIRECTORY & ROTATING LOGS
// ============================================================================
function resolveDataDir() {
  if (dataDir) return dataDir;
  const primary = process.platform === 'win32'
    ? path.join('C:\\', `${APP_NAME}_Data`)
    : path.join(app.getPath('home'), `${APP_NAME}_Data`);
  const fallback = path.join(app.getPath('userData'), `${APP_NAME}_Data`);

  for (const candidate of [primary, fallback]) {
    try {
      fs.mkdirSync(candidate, { recursive: true });
      const probe = path.join(candidate, '.write_test');
      fs.writeFileSync(probe, 'ok');
      fs.unlinkSync(probe);
      fs.mkdirSync(path.join(candidate, 'logs'), { recursive: true });
      fs.mkdirSync(path.join(candidate, 'transactions'), { recursive: true });
      fs.mkdirSync(path.join(candidate, 'snapshots'), { recursive: true });

      // Ensure local DB config stays pinned to 127.0.0.1 for safety
      const dbCfgPath = path.join(candidate, 'db_config.json');
      if (!fs.existsSync(dbCfgPath)) {
        fs.writeFileSync(dbCfgPath, JSON.stringify({
          host: '127.0.0.1',
          engine: 'sqlite-outbox',
          version: APP_VERSION
        }, null, 2));
      }

      dataDir = candidate;
      return dataDir;
    } catch {
      // Try fallback
    }
  }
  dataDir = fallback;
  return dataDir;
}

function writeLog(level, message) {
  try {
    const dir = resolveDataDir();
    const logPath = path.join(dir, 'logs', 'barakah.log');
    if (fs.existsSync(logPath) && fs.statSync(logPath).size > MAX_LOG_BYTES) {
      const prev = logPath + '.prev';
      try { if (fs.existsSync(prev)) fs.unlinkSync(prev); } catch {}
      fs.renameSync(logPath, prev);
    }
    const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    fs.appendFileSync(logPath, line, 'utf8');
  } catch {
    // Non-fatal logging failure
  }
}

function appendTransactionRecord(record) {
  const dir = resolveDataDir();
  const txFile = path.join(dir, 'transactions', 'invoices.jsonl');
  const entry = {
    ...(typeof record === 'object' && record !== null ? record : { value: record }),
    appVersion: APP_VERSION,
    recordedAt: new Date().toISOString()
  };
  fs.appendFileSync(txFile, JSON.stringify(entry) + '\n', 'utf8');
  return { ok: true, file: txFile };
}

function saveSnapshotFile(name, payload) {
  const dir = resolveDataDir();
  const snapDir = path.join(dir, 'snapshots');
  const safeName = (name || `snapshot-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_') + '.json';
  const target = path.join(snapDir, safeName);
  const envelope = {
    version: APP_VERSION,
    savedAt: new Date().toISOString(),
    payload
  };
  fs.writeFileSync(target, JSON.stringify(envelope, null, 2), 'utf8');

  // Trim old snapshots beyond MAX_SNAPSHOTS
  const files = fs.readdirSync(snapDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(snapDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const extra of files.slice(MAX_SNAPSHOTS)) {
    try { fs.unlinkSync(path.join(snapDir, extra.name)); } catch {}
  }
  return { ok: true, file: target };
}

function listSnapshotFiles() {
  const dir = resolveDataDir();
  const snapDir = path.join(dir, 'snapshots');
  return fs.readdirSync(snapDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(snapDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .map(x => x.name);
}

function getDiagnosticInfo() {
  const dir = resolveDataDir();
  let writable = false;
  try {
    const p = path.join(dir, '.diag');
    fs.writeFileSync(p, '1');
    fs.unlinkSync(p);
    writable = true;
  } catch {}
  return {
    app: APP_NAME,
    version: APP_VERSION,
    platform: process.platform,
    electronVersion: process.versions.electron || 'unknown',
    nodeVersion: process.versions.node || 'unknown',
    bridgePort: activeBridgePort,
    dataDir: dir,
    dataDirWritable: writable,
    snapshotCount: listSnapshotFiles().length,
    uptimeSeconds: Math.round(process.uptime())
  };
}

// ============================================================================
// 2. DUAL-CHANNEL LOCAL HTTP BRIDGE (127.0.0.1, PORTS 38900-38910)
// ============================================================================
function startLocalBridge(port = BRIDGE_PORT_START) {
  if (port > BRIDGE_PORT_END) {
    writeLog('WARN', 'All bridge ports 38900-38910 occupied.');
    return;
  }

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = (req.url || '').split('?')[0];

    if (req.method === 'GET' && url === '/api/status') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        app: APP_NAME,
        version: APP_VERSION,
        bridgePort: activeBridgePort,
        dataDir: resolveDataDir()
      }));
      return;
    }

    if (req.method === 'GET' && url === '/api/diagnostic') {
      res.writeHead(200);
      res.end(JSON.stringify(getDiagnosticInfo()));
      return;
    }

    if (req.method === 'GET' && url === '/api/snapshots') {
      res.writeHead(200);
      res.end(JSON.stringify({ snapshots: listSnapshotFiles() }));
      return;
    }

    if (req.method === 'POST' && (url === '/api/transactions' || url === '/api/snapshots')) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const result = url === '/api/transactions'
            ? appendTransactionRecord(parsed)
            : saveSnapshotFile(parsed.name, parsed.payload);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      startLocalBridge(port + 1);
    } else {
      writeLog('ERROR', `Bridge server error: ${err.message}`);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    bridgeServer = server;
    activeBridgePort = port;
    writeLog('INFO', `Local bridge listening on http://127.0.0.1:${port}`);
  });
}

// ============================================================================
// 3. WINDOW CREATION, HARDWARE AUTO-PERMISSIONS & OFFLINE RECOVERY
// ============================================================================
function renderOfflineRecoveryHtml(failedUrl, errorDesc) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${APP_NAME} - Offline Recovery</title>
      <style>
        body { font-family: Tahoma, sans-serif; background: #3A6EA5; margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .win { background: #ECE9D8; border: 2px outset #FFF; width: 460px; box-shadow: 3px 3px 8px rgba(0,0,0,0.45); }
        .bar { background: linear-gradient(90deg, #0A246A, #A6CAF0); color: #FFF; padding: 4px 8px; font-weight: bold; font-size: 12px; }
        .body { padding: 16px; font-size: 12px; color: #000; }
        .btn { background: #ECE9D8; border: 2px outset #FFF; padding: 5px 14px; font-family: Tahoma, sans-serif; font-size: 11px; font-weight: bold; cursor: pointer; margin-right: 6px; }
      </style>
    </head>
    <body>
      <div class="win">
        <div class="bar">${APP_NAME} v${APP_VERSION} - Connection Recovery</div>
        <div class="body">
          <p><b>Unable to reach server:</b> ${failedUrl || 'Local Dev Server'}</p>
          <p style="color:#800000;">Reason: ${errorDesc || 'Offline / Server Unavailable'}</p>
          <p>You can retry connecting or launch the built-in local offline billing bundle.</p>
          <div style="margin-top: 14px;">
            <button class="btn" onclick="location.reload()">Retry Connection</button>
            <button class="btn" onclick="window.electronApp && window.electronApp.send('load-local-dist')">Load Offline Local Mode</button>
          </div>
        </div>
      </div>
    </body>
    </html>
  `)}`;
}

function loadPrimaryTarget(win) {
  const isDev = process.env.ELECTRON_DEV === '1' || process.argv.includes('--dev');
  const cloudUrl = process.env.BARAKAH_CLOUD_URL;

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else if (cloudUrl) {
    win.loadURL(cloudUrl);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function createWindow() {
  const icoPath = path.join(__dirname, '..', 'build', 'icon.ico');
  const pngPath = path.join(__dirname, '..', 'build', 'icon.png');
  const winIcon = process.platform === 'win32' && fs.existsSync(icoPath) ? icoPath : pngPath;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    icon: winIcon,
    title: `Barakah Bepaar - Retail Management Software [GST Version] v${APP_VERSION}`,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    backgroundColor: '#557E9E',
    show: false
  });

  Menu.setApplicationMenu(null);

  // Auto-grant hardware permissions (Serial weighing scale, USB ESC/POS, Media)
  const ses = mainWindow.webContents.session;
  ses.setPermissionCheckHandler((_wc, permission) => {
    return ['serial', 'usb', 'media', 'hid'].includes(permission);
  });
  ses.setDevicePermissionHandler((details) => {
    return ['serial', 'usb', 'hid'].includes(details.deviceType);
  });
  ses.on('select-serial-port', (event, portList, _wc, callback) => {
    event.preventDefault();
    if (portList && portList.length > 0) {
      callback(portList[0].portId);
    } else {
      callback('');
    }
  });

  loadPrimaryTarget(mainWindow);

  const isDev = process.env.ELECTRON_DEV === '1' || process.argv.includes('--dev');
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.focus();
    writeLog('INFO', `Main window ready (v${APP_VERSION}, dev=${isDev})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    // Ignore aborted navigations (-3)
    if (errorCode === -3) return;
    writeLog('ERROR', `did-fail-load (${errorCode}): ${errorDescription} on ${validatedURL}`);
    const localDist = path.join(__dirname, '..', 'dist', 'index.html');
    if (validatedURL && validatedURL.startsWith('http') && fs.existsSync(localDist)) {
      mainWindow.loadURL(renderOfflineRecoveryHtml(validatedURL, errorDescription));
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================================================
// 4. IPC HANDLERS
// ============================================================================
ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
});

ipcMain.on('window-toggle-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
});

ipcMain.on('load-local-dist', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

ipcMain.handle('barakah:get-bridge-port', () => activeBridgePort);
ipcMain.handle('barakah:get-data-dir', () => resolveDataDir());
ipcMain.handle('barakah:open-data-folder', async () => {
  const dir = resolveDataDir();
  await shell.openPath(dir);
  return { ok: true, path: dir };
});
ipcMain.handle('barakah:append-transaction', (_evt, record) => appendTransactionRecord(record));
ipcMain.handle('barakah:save-snapshot', (_evt, name, payload) => saveSnapshotFile(name, payload));
ipcMain.handle('barakah:list-snapshots', () => listSnapshotFiles());
ipcMain.handle('barakah:read-snapshot', (_evt, name) => {
  const dir = resolveDataDir();
  const safeName = path.basename(name);
  const full = path.join(dir, 'snapshots', safeName);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
});
ipcMain.handle('barakah:get-diagnostic', () => getDiagnosticInfo());

// ============================================================================
// 5. LIFECYCLE
// ============================================================================
app.whenReady().then(() => {
  resolveDataDir();
  startLocalBridge(BRIDGE_PORT_START);
  createWindow();
});

app.on('window-all-closed', () => {
  if (bridgeServer) {
    try { bridgeServer.close(); } catch {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
