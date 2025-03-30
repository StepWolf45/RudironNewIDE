import { app, BrowserWindow, ipcMain, dialog, IpcMainEvent } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;
const { Tray, Menu } = require('electron');

let tray = null;
let win: BrowserWindow | null;

const store = new Store();

interface FilePaths {
    [key: number]: { path: string | null; isNew: boolean };
}

let currentFilePaths: FilePaths = store.get('currentFilePaths', {}) as FilePaths;

function createWindow() {
    win = new BrowserWindow({
        backgroundColor: '#191919',
        height: 1080,
        width: 1920,
        minHeight: 400,
        minWidth: 650,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#181818',
            symbolColor: '#ffffff',
            height: 51,
        },
        icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.removeMenu();

    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date()).toLocaleString());
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'));
    }

    win.webContents.openDevTools();
}

async function saveFileAs(fileId: number, fileData: any): Promise<boolean> {
    if (!win) {
        console.error('No window object found!');
        return false;
    }

    const result = await dialog.showSaveDialog(win, {
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (result.canceled) {
        console.log('Save As canceled');
        return false;
    }

    const filePath = result.filePath;
    currentFilePaths[fileId] = { path: filePath, isNew: false }; // Mark as not new after saving
    store.set('currentFilePaths', currentFilePaths);

    return saveFile(fileId, fileData, filePath);
}

async function saveFile(fileId: number, fileData: any, filePath?: string): Promise<boolean> {
    if (!win) {
        console.error('No window object found!');
        return false;
    }

    const targetPath = filePath || currentFilePaths[fileId]?.path;

    if (!targetPath) {
        // If filePath is not provided and we don't have a stored path, it's a "Save As" situation
        return saveFileAs(fileId, fileData);
    }

    try {
        fs.writeFileSync(targetPath, JSON.stringify(fileData));
        console.log('File saved successfully!');
        win.webContents.send('file-saved', path.basename(targetPath));
        return true;
    } catch (err) {
        console.error('Error saving file:', err);
        dialog.showErrorBox('Error saving file', (err as Error).message);
        return false;
    }
}

ipcMain.on('save-file', (event, { fileId, fileData }) => {
    saveFile(fileId, fileData);
});

ipcMain.on('save-file-as', (event, { fileId, fileData }) => {
    saveFileAs(fileId, fileData);
});

ipcMain.on('new-file', (event, fileId) => {
    currentFilePaths[fileId] = { path: null, isNew: true }; // Mark as a new file
    store.set('currentFilePaths', currentFilePaths);
});

ipcMain.on('file-opened', (event, { fileId, filePath }) => {
    currentFilePaths[fileId] = { path: filePath, isNew: false }; // Mark as not new when opened
    store.set('currentFilePaths', currentFilePaths);
});

ipcMain.on('close-file', (event, fileId) => {
    delete currentFilePaths[fileId];
    store.set('currentFilePaths', currentFilePaths);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        win = null;
    }
});

app.on('ready', () => {
    try {
        tray = new Tray(path.join(__dirname, '../public/logo.png'));
    } catch (error) {
        console.error('Failed to create tray icon:', error);
    }

    require('electron-react-titlebar/main').initialize();

    ipcMain.handle('show-input-dialog', async (event, options) => {
        if (!win) return undefined;
        
        await win.webContents.executeJavaScript(`
            new Promise(resolve => {
                if (document.readyState === 'complete') resolve();
                else window.addEventListener('load', resolve);
            })
        `);
    
        return await win.webContents.executeJavaScript(`
            new Promise(resolve => {
                window.showInputDialogReact({
                    ...${JSON.stringify(options)},
                    onOk: (value) => resolve(value),
                    onCancel: () => resolve(undefined)
                });
            })
        `);
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(createWindow);