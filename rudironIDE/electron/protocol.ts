export let genNumberArgument = (value) => {
    const arg_type = Buffer.from([0x0, 0x0]);
    const buffer = Buffer.alloc(12);

    const isNegative = value < 0;
    const absValue = Math.abs(value);

    const base = Math.trunc(absValue);
    let fractional = absValue - base;

    if (isNegative) {
        fractional = -fractional;
    }

    // Base 8 byte LE
    buffer.writeBigInt64LE(BigInt(isNegative ? -base : base), 0);

    // Frac 4 byte LE
    buffer.writeFloatLE(fractional, 8);
    let bufferRes = Buffer.concat([arg_type, buffer])

    return bufferRes;
}

export let genVarNameArgument = (value) => {
    let str = Buffer.from(value, 'ascii');
    return Buffer.concat([
        Buffer.from([0x1]),
        str, 
        Buffer.from([0x0])
    ])
}

export let genStringArgument = (value) => {
    let str = Buffer.from(value, 'ascii');
    return Buffer.concat([
        Buffer.from([0x0, 0x1]),
        str, 
        Buffer.from([0x0])
    ])
}


export let bufferSize2 = (buffer, subs) => {
    const bufferLength = buffer.length - subs;
    const sizeBuffer = Buffer.alloc(2);
    sizeBuffer.writeUInt16BE(bufferLength);
    return sizeBuffer;

}

export function parsePinsByType(buffer, type) {
    const digitalPinsMap = [16, 15, 11, 10, 6, 4, 1, 0, 35, 34, 32, 31, 30, 19, 18, 17];
    const analogPinsMap = [5, 7, 8, 9, 12, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 33];
    let pinValues = {};
    if (!type) { // Digital
        digitalPinsMap.forEach((pinNum, index) => {
            pinValues[`_${pinNum}`] = ["red", "green"][getPinValue(buffer, pinNum)];
        });
    } else { // Analog
        analogPinsMap.forEach((pinNum, index) => {
            pinValues[`_${pinNum}`] = buffer.readUInt8(7 + index);
        });
    }
    return pinValues;
}

export function getPinValue(buffer, pinNumber) {
    const digitalPinsMap = [16, 15, 11, 10, 6, 4, 1, 0, 35, 34, 32, 31, 30, 19, 18, 17];
    const analogPinsMap = [5, 7, 8, 9, 12, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 33];

    if (digitalPinsMap.includes(pinNumber)) {
        const pinIndex = digitalPinsMap.indexOf(pinNumber);
        const byteIndex = 5 + Math.floor(pinIndex / 8);
        const bitOffset = 7 - pinIndex % 8;
        const byte = buffer.readUInt8(byteIndex);
        return (byte >> bitOffset) & 1;
    }


    if (analogPinsMap.includes(pinNumber)) {
        const pinIndex = analogPinsMap.indexOf(pinNumber);
        // 2 - offset of digi pins + 5 bytes header
        return buffer.readUInt8(7 + pinIndex);
    }

    throw new Error(`Invalid pin number: ${pinNumber}`);
}



export let printBuffer = (bufferRes) => {
    let res = bufferRes.toString('hex').match(/.{1,2}/g).map(byte => byte.padStart(2, '0')).join(' ');
    console.log(res);
}