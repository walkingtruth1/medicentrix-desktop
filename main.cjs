"use strict";

const { app, BrowserWindow, net, protocol, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// The application loads ONLY the bundled static files. No remote site is loaded.
protocol.registerSchemesAsPrivileged([
  { scheme: 'medicentrix', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

let mainWindow;
const webRoot = path.join(__dirname, '..', 'web');

function registerLocalFiles() {
  protocol.handle('medicentrix', (request) => {
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.hostname !== 'app') {
      return new Response('Not found', { status: 404 });
    }

    let relative;
    try { relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'; }
    catch { return new Response('Bad path', { status: 400 }); }
    const resolved = path.resolve(webRoot, relative);
    const within = path.relative(webRoot, resolved);
    if (!within || within.startsWith('..') || path.isAbsolute(within)) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(resolved).toString());
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 790,
    minWidth: 780,
    minHeight: 600,
    title: 'MediCentrix Desktop',
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false
    }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!targetUrl.startsWith('medicentrix://app/')) event.preventDefault();
  });
  mainWindow.loadURL('medicentrix://app/index.html');
}

app.whenReady().then(() => {
  registerLocalFiles();
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
