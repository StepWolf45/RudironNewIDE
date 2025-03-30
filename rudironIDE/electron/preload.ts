import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
    },
});

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
            };
        };
    }
}