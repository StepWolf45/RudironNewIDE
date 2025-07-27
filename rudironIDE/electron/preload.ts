import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { bufferSize2, genNumberArgument, genVarNameArgument, genStringArgument, printBuffer } from './protocol';


let logicalSyms = {
    "==": Buffer.from([0x02, 0x64, 0x00]),
    ">": Buffer.from([0x02, 0x65, 0x00]),
    "<": Buffer.from([0x02, 0x66, 0x00]),
    ">=": Buffer.from([0x02, 0x67, 0x00]),
    "<=": Buffer.from([0x02, 0x68, 0x00]),
    "&&": Buffer.from([0x02, 0x69, 0x00]),
    "||": Buffer.from([0x02, 0x6A, 0x00]),
    "!a": Buffer.from([0x02, 0x6B, 0x00]),
    "+": Buffer.from([0x02, 0xC9, 0x00]),
    "-": Buffer.from([0x02, 0xCA, 0x00]),
    "*": Buffer.from([0x02, 0xCB, 0x00]),
    "/": Buffer.from([0x02, 0xCC, 0x00]),
};

function generateExpressionBuffer(bufferRes, value) {
    for (const operand of value.split(" ")) {
        if (Object.keys(logicalSyms).includes(operand)) {
            bufferRes = Buffer.concat([bufferRes, logicalSyms[operand], Buffer.from([0x02])]);
        } else if (!isNaN(operand) && !isNaN(parseFloat(operand))) {
            bufferRes = Buffer.concat([bufferRes, genNumberArgument(parseFloat(operand))]);
        } else { // variable
            bufferRes = Buffer.concat([bufferRes, genVarNameArgument(operand)]);
        }
    }
    return bufferRes;
}

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
        writeSerialAndWait: (data, wait_packets_cnt = 1) => ipcRenderer.invoke("send-and-wait", data, wait_packets_cnt)


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
        servoWrite: (pin, value) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x1F, 0x00, 0xF7, 0x01, 0x04]),
                genNumberArgument(pin),
                genNumberArgument(value)
            ])

            return bufferRes;
        },

        servoRead: (pin, value) => {
            return Buffer.concat([
                Buffer.from([0x02, 0xFB, 0x01, 0x01]), // digitalRead
                genNumberArgument(pin)
            ])
        },

        delay: (time) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x11, 0x00, 0x90, 0x01, 0x01]),
                genNumberArgument(time)
            ])

            return bufferRes;

        },
        servo_stop: () => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0x11, 0x00, 0x90, 0x01, 0x01]),
            ])

            return bufferRes;

        },
        digital_read: (pin) => {
            return Buffer.concat([
                Buffer.from([0x02, 0xF7, 0x01, 0x01]), // digitalRead
                genNumberArgument(pin)
            ])
        },
        print_pin_read: (pin) => {
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x58, 0x02, 0x01]),
                Buffer.from([0x02, 0xF7, 0x01, 0x01]), // digitalRead,
                genNumberArgument(pin)
            ]);
            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            return bufferRes;
        },
        set_var: (name, value, expression = 1) => {
            let name_buffer = genVarNameArgument(name);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x91, 0x01, 0x02]),
                name_buffer
            ]);

            if (expression) {
                bufferRes = generateExpressionBuffer(bufferRes, value)
            } else {
                let value_buffer = Buffer.concat([Buffer.from([0x0]), genVarNameArgument(value)]);
                bufferRes = Buffer.concat([
                    bufferRes,
                    value_buffer
                ]);
            }

            // let name_buffer = genVarNameArgument(name);
            // let value_buffer;
            // if (Number.isFinite(value)) {
            //     value_buffer = genNumberArgument(value);
            // }else {
            //     
            // }

            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            printBuffer(bufferRes);
            return bufferRes;
        },

        set_var_as_pin: (name, pin, mode = 0) => {
            let name_buffer = genVarNameArgument(name);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x91, 0x01, 0x02]),
                name_buffer
            ]);
            let val_buf;
            if (!mode) { // digital
                val_buf = Buffer.concat([Buffer.from([0x02, 0xF7, 0x01, 0x01]), genNumberArgument(pin)]);
            } else {
                val_buf = Buffer.concat([Buffer.from([0x02, 0xF8, 0x01, 0x01]), genNumberArgument(pin)]);
            } // analog



            bufferRes = Buffer.concat([
                bufferRes,
                val_buf
            ]);

            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            printBuffer(bufferRes);
            return bufferRes;

        },

        get_distance: (reader, name, echo, trig) => {
            let name_buffer = genVarNameArgument(name);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x91, 0x01, 0x02]),
                name_buffer
            ]);
            let val_buf;
            val_buf = Buffer.concat([Buffer.from([0x02, 0xF8, 0x01, 0x01]), genNumberArgument(echo), genNumberArgument(trig)]);



            bufferRes = Buffer.concat([
                bufferRes,
                val_buf
            ]);

            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            printBuffer(bufferRes);
            return bufferRes;

        },

        set_var_as_servo: (name, pin) => {
            let name_buffer = genVarNameArgument(name);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x91, 0x01, 0x02]),
                name_buffer
            ]);
            let val_buf;
            val_buf = Buffer.concat([Buffer.from([0x02, 0xFB, 0x01, 0x01]), genNumberArgument(pin)]);



            bufferRes = Buffer.concat([
                bufferRes,
                val_buf
            ]);

            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            printBuffer(bufferRes);
            return bufferRes;

        },

        print_var: (name) => {
            let name_buffer = genVarNameArgument(name);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x58, 0x02, 0x01]),
                name_buffer
            ]);
            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            return bufferRes;
        },

        print_text: (text) => {
            let text_buffer = genStringArgument(text);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x58, 0x02, 0x01]),
                text_buffer
            ]);
            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            return bufferRes;
        },
        print_number: (text) => {
            let num_buffer = genNumberArgument(text);
            let bufferRes = Buffer.concat([
                Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x58, 0x02, 0x01]),
                num_buffer
            ]);
            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            return bufferRes;
        },
        single_if: (cond) => {
            let bufferRes = Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x2F, 0x01, 0x01]);
            bufferRes = generateExpressionBuffer(bufferRes, cond);
            printBuffer(bufferRes);
            // let bufferRes = Buffer.concat([
            //     genVarNameArgument(tokens[0]),
            //     genNumberArgument(parseInt(tokens[2], 10))
            // ]);
            // // printBuffer(genVarNameArgument(tokens[0]));
            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            // printBuffer(bufferRes);
            return bufferRes;
        },
        while: (cond) => {
            let bufferRes = Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x2E, 0x01, 0x01]);
            bufferRes = generateExpressionBuffer(bufferRes, cond);
            printBuffer(bufferRes);
            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            return bufferRes;
        },
        for_times: (exp) => {
            let bufferRes = Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x2D, 0x01, 0x04, 0x01, 0x69, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x66, 0x00, 0x02, 0x01, 0x69, 0x00]);
            bufferRes = generateExpressionBuffer(bufferRes, exp);
            bufferRes = Buffer.concat([bufferRes, Buffer.from([0x02, 0xC9, 0x00, 0x02, 0x01, 0x69, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])]);

            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            printBuffer(bufferRes);

            return bufferRes;
        },
        reset_block: () => {
            let bufferRes = Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x00, 0x01]);

            let size = bufferSize2(bufferRes, 4)
            bufferRes[2] = size[1];
            bufferRes[3] = size[0];
            printBuffer(bufferRes);

            return bufferRes;
        }


    }
})

contextBridge.exposeInMainWorld('visualization_api', {
    setDigitalPin: (callback) => ipcRenderer.on('board_visualization_digital', callback),
    setAnalogPin: (callback) => ipcRenderer.on('board_visualization_analog', callback)
})

contextBridge.exposeInMainWorld('board_connection', {
    checkConnected: () => ipcRenderer.invoke('check_connected')
});


declare global {
    interface Window {
        Blockly: any;
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