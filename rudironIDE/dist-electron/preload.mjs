"use strict";
const electron = require("electron");
let genNumberArgument = (value) => {
  const arg_type = Buffer.from([0, 0]);
  const buffer = Buffer.alloc(12);
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const base = Math.trunc(absValue);
  let fractional = absValue - base;
  if (isNegative) {
    fractional = -fractional;
  }
  buffer.writeBigInt64LE(BigInt(isNegative ? -base : base), 0);
  buffer.writeFloatLE(fractional, 8);
  let bufferRes = Buffer.concat([arg_type, buffer]);
  return bufferRes;
};
let printBuffer = (bufferRes) => {
  let res = bufferRes.toString("hex").match(/.{1,2}/g).map((byte) => byte.padStart(2, "0")).join(" ");
  console.log(res);
};
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
    showInputDialog: (options) => electron.ipcRenderer.invoke("show-input-dialog", options),
    getSerialDevices: async (message) => {
      return await electron.ipcRenderer.invoke("request-serial-devices", message);
    },
    connectSerialDevice: async (message) => {
      return await electron.ipcRenderer.invoke("connect-serial-device", message);
    },
    writeSerial: (data) => electron.ipcRenderer.invoke("send-serial", data)
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
  }
});
electron.contextBridge.exposeInMainWorld("api", {
  generators: {
    pinMode: (pin, mode) => {
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 31, 0, 244, 1, 2]),
        genNumberArgument(pin),
        genNumberArgument(mode)
      ]);
      printBuffer(bufferRes);
      return bufferRes;
    },
    analogWrite: (pin, value) => {
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 31, 0, 246, 1, 2]),
        genNumberArgument(pin),
        genNumberArgument(value)
      ]);
      return bufferRes;
    },
    ditialWrite: (pin, value) => {
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 31, 0, 245, 1, 2]),
        genNumberArgument(pin),
        genNumberArgument(value)
      ]);
      return bufferRes;
    },
    delay: (time) => {
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 17, 0, 144, 1, 1]),
        genNumberArgument(time)
      ]);
      return bufferRes;
    }
  }
});
electron.contextBridge.exposeInMainWorld("visualization_api", {
  setDigitalPin: (callback) => electron.ipcRenderer.on("board_visualization_digital", callback),
  setAnalogPin: (callback) => electron.ipcRenderer.on("board_visualization_analog", callback)
});
