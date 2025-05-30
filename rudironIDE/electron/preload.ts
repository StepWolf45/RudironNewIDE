import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { genNumberArgument, printBuffer } from './protocol';

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        on(channel: string, func: (...args: any[]) => void) {
            const subscription = (event: IpcRendererEvent, ...args: any[]) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        },
        once(channel: string, func: (...args: any[]) => void) {
            ipcRenderer.once(channel, (...args) => func(...args));
        },
        removeListener(channel: string, listener: (...args: any[]) => void) {
            ipcRenderer.removeListener(channel, listener);
        },
        removeAllListeners(channel: string) {
            ipcRenderer.removeAllListeners(channel);
        },
        send(channel: string, ...args: any[]) {
            ipcRenderer.send(channel, ...args);
        },
        invoke(channel: string, ...args: any[]) {
            return ipcRenderer.invoke(channel, ...args);
        },
        showInputDialog: (options: { title: string; defaultValue: string }) =>
            ipcRenderer.invoke('show-input-dialog', options),
        getSerialDevices: async (message) => {
            return await ipcRenderer.invoke("request-serial-devices", message);
        },
        connectSerialDevice: async (message) => {
            return await ipcRenderer.invoke("connect-serial-device", message);
        },
        writeSerial: (data) => ipcRenderer.invoke('send-serial', data),


        // genPinMode: (pin, mode) => {
        //     let bufferRes = Buffer.concat([
        //         Buffer.from([0xFE, 0xDE, 0x1F, 0x00, 0xF4, 0x01, 0x02]),
        //         genNumberArgument(pin),
        //         genNumberArgument(mode)
        //     ])
        //     printBuffer(bufferRes);

        //     return bufferRes;

        // },

        // genAnalogWrite: (pin, value) => {
        //     let bufferRes = Buffer.concat([
        //         Buffer.from([0xFE, 0xDE, 0x1F, 0x00, 0xF6, 0x01, 0x02]),
        //         genNumberArgument(pin),
        //         genNumberArgument(value)
        //     ])

        //     return bufferRes;
        // }
    },
});

contextBridge.exposeInMainWorld('api', {
    generators: {
        pinMode: (pin, mode) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x1F, 0x00, 0xF4, 0x01, 0x02]),
                genNumberArgument(pin),
                genNumberArgument(mode)
            ])

            printBuffer(bufferRes);

            return bufferRes;

        },

        analogWrite: (pin, value) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x1F, 0x00, 0xF6, 0x01, 0x02]),
                genNumberArgument(pin),
                genNumberArgument(value)
            ])

            return bufferRes;
        },

        ditialWrite: (pin, value) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x1F, 0x00, 0xF5, 0x01, 0x02]),
                genNumberArgument(pin),
                genNumberArgument(value)
            ])

            return bufferRes;
        },

        delay: (time) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x11, 0x00, 0x90, 0x01, 0x01]),
                genNumberArgument(time)
            ])

            return bufferRes;

        }

    }
})

contextBridge.exposeInMainWorld('visualization_api', {
    setDigitalPin: (callback) => ipcRenderer.on('board_visualization_digital', callback),
    setAnalogPin: (callback) => ipcRenderer.on('board_visualization_analog', callback)
})



declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                on(channel: string, func: (...args: any[]) => void): () => void;
                once(channel: string, func: (...args: any[]) => void): void;
                removeListener(channel: string, listener: (...args: any[]) => void): void;
                removeAllListeners(channel: string): void;
                send(channel: string, ...args: any[]): void;
                invoke(channel: string, ...args: any[]): Promise<any>;
                showInputDialog: (options: { title: string; defaultValue: string }) => Promise<string | undefined>;
                getSerialDevices(message: string): void;
            };
        };
    }
}