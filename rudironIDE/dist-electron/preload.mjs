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
let genVarNameArgument = (value) => {
  let str = Buffer.from(value, "ascii");
  return Buffer.concat([
    Buffer.from([1]),
    str,
    Buffer.from([0])
  ]);
};
let genStringArgument = (value) => {
  let str = Buffer.from(value, "ascii");
  return Buffer.concat([
    Buffer.from([0, 1]),
    str,
    Buffer.from([0])
  ]);
};
let bufferSize2 = (buffer, subs) => {
  const bufferLength = buffer.length - subs;
  const sizeBuffer = Buffer.alloc(2);
  sizeBuffer.writeUInt16BE(bufferLength);
  return sizeBuffer;
};
let printBuffer = (bufferRes) => {
  let res = bufferRes.toString("hex").match(/.{1,2}/g).map((byte) => byte.padStart(2, "0")).join(" ");
  console.log(res);
};
let logicalSyms = {
  "==": Buffer.from([2, 100, 0]),
  ">": Buffer.from([2, 101, 0]),
  "<": Buffer.from([2, 102, 0]),
  ">=": Buffer.from([2, 103, 0]),
  "<=": Buffer.from([2, 104, 0]),
  "&&": Buffer.from([2, 105, 0]),
  "||": Buffer.from([2, 106, 0]),
  "!a": Buffer.from([2, 107, 0]),
  "+": Buffer.from([2, 201, 0]),
  "-": Buffer.from([2, 202, 0]),
  "*": Buffer.from([2, 203, 0]),
  "/": Buffer.from([2, 204, 0])
};
function generateExpressionBuffer(bufferRes, value) {
  for (const operand of value.split(" ")) {
    if (Object.keys(logicalSyms).includes(operand)) {
      bufferRes = Buffer.concat([bufferRes, logicalSyms[operand], Buffer.from([2])]);
    } else if (!isNaN(operand) && !isNaN(parseFloat(operand))) {
      bufferRes = Buffer.concat([bufferRes, genNumberArgument(parseFloat(operand))]);
    } else {
      bufferRes = Buffer.concat([bufferRes, genVarNameArgument(operand)]);
    }
  }
  return bufferRes;
}
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
    writeSerial: (data) => electron.ipcRenderer.invoke("send-serial", data),
    writeSerialAndWait: (data, wait_packets_cnt = 1) => electron.ipcRenderer.invoke("send-and-wait", data, wait_packets_cnt)
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
    },
    digital_read: (pin) => {
      return Buffer.concat([
        Buffer.from([2, 247, 1, 1]),
        // digitalRead
        genNumberArgument(pin)
      ]);
    },
    print_pin_read: (pin) => {
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 255, 255, 88, 2, 1]),
        Buffer.from([2, 247, 1, 1]),
        // digitalRead,
        genNumberArgument(pin)
      ]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      return bufferRes;
    },
    set_var: (name, value, expression = 1) => {
      let name_buffer = genVarNameArgument(name);
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 255, 255, 145, 1, 2]),
        name_buffer
      ]);
      if (expression) {
        bufferRes = generateExpressionBuffer(bufferRes, value);
      } else {
        let value_buffer = Buffer.concat([Buffer.from([0]), genVarNameArgument(value)]);
        bufferRes = Buffer.concat([
          bufferRes,
          value_buffer
        ]);
      }
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      printBuffer(bufferRes);
      return bufferRes;
    },
    set_var_as_pin: (name, pin, mode = 0) => {
      let name_buffer = genVarNameArgument(name);
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 255, 255, 145, 1, 2]),
        name_buffer
      ]);
      let val_buf;
      if (!mode) {
        val_buf = Buffer.concat([Buffer.from([2, 247, 1, 1]), genNumberArgument(pin)]);
      } else {
        val_buf = Buffer.concat([Buffer.from([2, 248, 1, 1]), genNumberArgument(pin)]);
      }
      bufferRes = Buffer.concat([
        bufferRes,
        val_buf
      ]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      printBuffer(bufferRes);
      return bufferRes;
    },
    print_var: (name) => {
      let name_buffer = genVarNameArgument(name);
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 255, 255, 88, 2, 1]),
        name_buffer
      ]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      return bufferRes;
    },
    print_text: (text) => {
      let text_buffer = genStringArgument(text);
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 255, 255, 88, 2, 1]),
        text_buffer
      ]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      return bufferRes;
    },
    print_number: (text) => {
      let num_buffer = genNumberArgument(text);
      let bufferRes = Buffer.concat([
        Buffer.from([254, 222, 255, 255, 88, 2, 1]),
        num_buffer
      ]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      return bufferRes;
    },
    single_if: (cond) => {
      let bufferRes = Buffer.from([254, 222, 255, 255, 47, 1, 1]);
      bufferRes = generateExpressionBuffer(bufferRes, cond);
      printBuffer(bufferRes);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      return bufferRes;
    },
    while: (cond) => {
      let bufferRes = Buffer.from([254, 222, 255, 255, 46, 1, 1]);
      bufferRes = generateExpressionBuffer(bufferRes, cond);
      printBuffer(bufferRes);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      return bufferRes;
    },
    for_times: (exp) => {
      let bufferRes = Buffer.from([254, 222, 255, 255, 45, 1, 4, 1, 105, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 102, 0, 2, 1, 105, 0]);
      bufferRes = generateExpressionBuffer(bufferRes, exp);
      bufferRes = Buffer.concat([bufferRes, Buffer.from([2, 201, 0, 2, 1, 105, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      printBuffer(bufferRes);
      return bufferRes;
    },
    reset_block: () => {
      let bufferRes = Buffer.from([254, 222, 255, 255, 0, 1]);
      let size = bufferSize2(bufferRes, 4);
      bufferRes[2] = size[1];
      bufferRes[3] = size[0];
      printBuffer(bufferRes);
      return bufferRes;
    }
  }
});
electron.contextBridge.exposeInMainWorld("visualization_api", {
  setDigitalPin: (callback) => electron.ipcRenderer.on("board_visualization_digital", callback),
  setAnalogPin: (callback) => electron.ipcRenderer.on("board_visualization_analog", callback)
});
electron.contextBridge.exposeInMainWorld("board_connection", {
  checkConnected: () => electron.ipcRenderer.invoke("check_connected")
});
