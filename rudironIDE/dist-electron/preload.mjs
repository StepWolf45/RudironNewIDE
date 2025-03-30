"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on(channel, func) {
      const subscription = (event, ...args) => func(...args);
      electron.ipcRenderer.on(channel, subscription);
      return () => {
        electron.ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel, func) {
      electron.ipcRenderer.once(channel, (...args) => func(...args));
    },
    removeListener(channel, listener) {
      electron.ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel) {
      electron.ipcRenderer.removeAllListeners(channel);
    },
    send(channel, ...args) {
      electron.ipcRenderer.send(channel, ...args);
    },
    invoke(channel, ...args) {
      return electron.ipcRenderer.invoke(channel, ...args);
    },
    showInputDialog: (options) => electron.ipcRenderer.invoke("show-input-dialog", options)
  }
});
