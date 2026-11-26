const { contextBridge, ipcRenderer } = require('electron');
const pkg = require('../package.json');

const ALLOWED_SEND_CHANNELS = [
  'window-minimize',
  'window-toggle-maximize',
  'window-close',
  'load-local-dist'
];

contextBridge.exposeInMainWorld('isElectron', true);

contextBridge.exposeInMainWorld('electronApp', {
  platform: process.platform,
  version: pkg.version || '1.0.0',
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, callback) => {
    const listener = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  }
});

// Keep window.electronAPI compatibility for window controls
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.send('window-toggle-maximize'),
  closeWindow: () => ipcRenderer.send('window-close')
});

// Commercial Thin-Shell Bridge API (WEIGHSoft pattern)
contextBridge.exposeInMainWorld('barakahFs', {
  getBridgePort: () => ipcRenderer.invoke('barakah:get-bridge-port'),
  getDataDir: () => ipcRenderer.invoke('barakah:get-data-dir'),
  openDataFolder: () => ipcRenderer.invoke('barakah:open-data-folder'),
  appendTransaction: (record) => ipcRenderer.invoke('barakah:append-transaction', record),
  saveSnapshot: (name, payload) => ipcRenderer.invoke('barakah:save-snapshot', name, payload),
  listSnapshots: () => ipcRenderer.invoke('barakah:list-snapshots'),
  readSnapshot: (name) => ipcRenderer.invoke('barakah:read-snapshot', name),
  getDiagnostic: () => ipcRenderer.invoke('barakah:get-diagnostic')
});
