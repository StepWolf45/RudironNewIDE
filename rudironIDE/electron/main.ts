import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import Queue from './queue';
import { getPinValue, printBuffer, parsePinsByType } from './protocol';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;
const { Tray, Menu } = require('electron');
const { SerialPort } = require('serialport');

let tray = null;
let win: BrowserWindow | null;

let port: SerialPort | null = null;

const store = new Store();

interface FilePaths {
    [key: number]: { path: string | null; isNew: boolean };
}

let currentFilePaths: FilePaths = {};

function createWindow() {
    win = new BrowserWindow({
        backgroundColor: '#191919',
        height: 1080,
        width: 1920,
        minHeight: 400,
        minWidth: 650,
        titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? {
            titleBarOverlay: {
                color: '#181818',
                symbolColor: '#ffffff',
                height: 36,
            },
        } : {}),
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

// Serial part
const RUDIRON_VID = "1A86"//""
const RUDIRON_PID = "55D4"//"55d4"
const RUDIRON_BAUD = 115200
let COMMANDS_QUEUE = new Queue();
let WAIT_FOR_RESP = false;
let WAIT_FOR_RESP_ID = 0;

ipcMain.handle('request-serial-devices', async (event, data) => {
    try {
        const ports = await SerialPort.list();  // With trash
        const filteredPorts = ports.filter(port => {
            return port.vendorId === RUDIRON_VID && port.productId === RUDIRON_PID;
        });

        return filteredPorts;

    } catch (err) {
        console.error("[FATAL] Error listing ports:", err);
        return [];
    }
});

ipcMain.handle('connect-serial-device', async (event, data) => {
    console.log(`[INFO] Connecting to: ${data}`)
    port = new SerialPort({
        path: data,
        baudRate: RUDIRON_BAUD, // const
    });

    console.log(`[INFO] Maybe connected to: ${data}`)

    // Serial Handlers
    port.on('open', () => {
        console.log("[INFO] Port opened callback");
    });

    console.log("[INFO] Flow mode active; Waiting for RX");
    port.on('data', (data) => {
        const reversed = Buffer.from([data[0], data[1]]);
        printBuffer(data);
        let resp_id = reversed.readUInt16BE();
        console.log('[INFO] RESP ID:', resp_id);
        if (resp_id == WAIT_FOR_RESP_ID){
            WAIT_FOR_RESP = 0;
            WAIT_FOR_RESP_ID = 0;
        }

        // console.log("AAA:", getPinValue(data, 15));
        win.webContents.send('board_visualization_digital', { map: parsePinsByType(data, 0)});
        win.webContents.send('board_visualization_analog', { map: parsePinsByType(data, 1)});
        // window.board_vis_analog_pin("_5", getPinValue(data, 5));
        // console.log("PIN VAL:", );
    });

    setInterval(() => {
        if (!COMMANDS_QUEUE.isEmpty() && !WAIT_FOR_RESP){
            console.log('[DBG] New block exec');
            let front = COMMANDS_QUEUE.dequeue();
            const reversed = Buffer.from([front[0], front[1]]);
            let exec_id = reversed.readUInt16BE();
            port.write(front);
            WAIT_FOR_RESP = 1;
            WAIT_FOR_RESP_ID = exec_id;
        }
        
    }, 10); // 10ms interval polling queue
});


ipcMain.handle('send-serial', async (event, data) => {

    let id_buffer = Buffer.alloc(2);
    id_buffer.writeUInt16BE(0);
    

    if (!COMMANDS_QUEUE.isEmpty()) {
        const last = COMMANDS_QUEUE.items[COMMANDS_QUEUE.items.length - 1];
        const reversed = Buffer.from([last[0], last[1]]);
        let front_id = reversed.readUInt16BE();
        console.log("Front id:", front_id);
        if (front_id > 1000) front_id = 0; // TODO

        id_buffer = Buffer.alloc(2);
        id_buffer.writeUInt16BE(front_id + 1);
    }

    data[0] = id_buffer[0];
    data[1] = id_buffer[1];

    let res = data.toString('hex').match(/.{1,2}/g).map(byte => byte.padStart(2, '0')).join(' ');
    console.log(res);
    
    COMMANDS_QUEUE.enqueue(data);
    console.log(COMMANDS_QUEUE.size());


    // port.write(Buffer.from(data), (err) => { });

})

