import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import Queue from './queue';
import { printBuffer, parsePinsByType } from './protocol';



const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;
const { Tray } = require('electron');
const { SerialPort } = require('serialport');
const noble = require('@abandonware/noble');
let board_connected = false;

let tray = null;
let win: BrowserWindow | null;
let connection_type = "Serial"; // default

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
                height: 42,
            },
        } : {}),
        icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
            experimentalFeatures: true,
            enableBlinkFeatures: 'WebBluetooth'

        },
    });

    win.maximize()
    win.removeMenu();
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date()).toLocaleString());
    });
    win.webContents.openDevTools();

    win.once('ready-to-show', () => {
        win.show();
        win.focus();
    });



    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'));
    }

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

ipcMain.handle('check_connected', () => {
    return board_connected;
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
    if (process.platform === 'linux') {
        app.commandLine.appendSwitch('enable-experimental-web-platform-features', true);
    } else {
        app.commandLine.appendSwitch('enable-web-bluetooth', true);
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
const RUDIRON_VID = "1a86"
const RUDIRON_PID = "55d4"

const RUDIRON_BAUD = 115200
let COMMANDS_QUEUE = new Queue();
let WAIT_FOR_RESP = false;
let WAIT_FOR_RESP_ID = 0;

ipcMain.handle('request-serial-devices', async (event, data) => {
    try {
        const ports = await SerialPort.list();  // With trash
        const filteredPorts = ports.filter(port => {
            if (port.vendorId && port.productId) {
                return port.vendorId.toLowerCase() === RUDIRON_VID && port.productId.toLowerCase() === RUDIRON_PID;
            }
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

    console.log("[INFO] Flow mode active; Wailting for RX");
    console.info(`[IDE] Подкючено к плате Рудирон на порту: ${data}`)
    board_connected = true;

    // test_34
    // port.write(Buffer.from([0xFE, 0xDE, 0x23, 0x00, 0x58, 0x02, 0x01, 0x02, 0xCC, 0x00, 0x02, 0x00, 0x00, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
    // port.on('data', (data) => {
    //     const reversed = Buffer.from([data[0], data[1]]);
    //     console.log("RX:", data);
    //     // let resp_id = reversed.readUInt16BE();
    //     // console.log('[INFO] RESP ID:', resp_id);
    //     // if (resp_id == WAIT_FOR_RESP_ID) {
    //     //     WAIT_FOR_RESP = 0;
    //     //     WAIT_FOR_RESP_ID = 0;
    //     // }

    //     // // console.log("AAA:", getPinValue(data, 15));
    //     // win.webContents.send('board_visualization_digital', { map: parsePinsByType(data, 0) });
    //     // win.webContents.send('board_visualization_analog', { map: parsePinsByType(data, 1) });
    //     // // window.board_vis_analog_pin("_5", getPinValue(data, 5));
    //     // // console.log("PIN VAL:", );
    // });

    // setInterval(() => {
    //     if (!COMMANDS_QUEUE.isEmpty() && !WAIT_FOR_RESP) {
    //         console.log('[DBG] New block exec');
    //         let front = COMMANDS_QUEUE.dequeue();
    //         const reversed = Buffer.from([front[0], front[1]]);
    //         let exec_id = reversed.readUInt16BE();
    //         port.write(front);
    //         WAIT_FOR_RESP = 1;
    //         WAIT_FOR_RESP_ID = exec_id;
    //     }

    // }, 10); // 10ms interval polling queue
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


function sendCommand(command, wait_packets_cnt = 1) {
    return new Promise((resolve, reject) => {
        let timeout;
        let received = 0;

        // Define the data handler
        let received_packets = [];
        const onData = (data) => {
            received += 1;
            received_packets.push(data.slice(4));
            if (received == 1) {
                win.webContents.send('board_visualization_digital', { map: parsePinsByType(data.slice(4), 0) });
                win.webContents.send('board_visualization_analog', { map: parsePinsByType(data.slice(4), 1) });

            }
            if (received == wait_packets_cnt) {
                clearTimeout(timeout);
                port.off('data', onData);
                // console.log("RX:", data);
                printBuffer(data);
                resolve(received_packets);
            }
        };

        // Add listener
        port.on('data', onData);

        // Write the command
        port.write(command, (err) => {
            if (err) {
                port.off('data', onData);
                return reject(err.message);
            }

            // Timeout protection
            timeout = setTimeout(() => {
                port.off('data', onData);
                reject('Timeout waiting for response');
            }, 10000);
        });
    });


}
ipcMain.handle('send-and-wait', async (event, command, wait_packets_cnt) => {
    try {
        // Start signature
        let header = Buffer.from([0x72, 0x75, 0x06, 0x64]);
        const response = await sendCommand(Buffer.concat([header, command]), wait_packets_cnt);

        // wait before new send
        setTimeout(() => {}, 250);
        return { success: true, data: response };
    } catch (error) {
        return { success: false, error };
    }
});


ipcMain.on('scan-bluetooth', (event) => {
    device.listPairedDevices(devices => {
        event.sender.send('bluetooth-devices', devices);
    });
});


function startScan(callback) {
    noble.on('stateChange', async (state) => {
        if (state === 'poweredOn') {
            await noble.startScanningAsync([], false);
        } else {
            await noble.stopScanningAsync();
        }
    });

    noble.on('discover', (peripheral) => {
        const device = {
            id: peripheral.id,
            name: peripheral.advertisement.localName || 'Unknown',
            rssi: peripheral.rssi
        };
        callback(device);
    });
}

ipcMain.on('start-bluetooth-scan', (event) => {
    startScan((device) => {
        console.log(device);
    });
});