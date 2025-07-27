import React from 'react';

const asciiToString = arr => arr.reduce((str, code) => str + String.fromCharCode(code), '');

export function tokenize(expression) {
    const regex = /([=!><]=|&&|\|\||[()!><=+*/-])|([a-zA-Z_][\w]*)|([0-9]+(?:\.[0-9]+)?)|\s+/g;
    return [...expression.matchAll(regex)]
        .map(match => match[0])
        .filter(token => !/^\s+$/.test(token));
}

function parseLogicalExpression(tokens) {
    let pos = 0;

    function peek() {
        return tokens[pos];
    }

    function consume() {
        return tokens[pos++];
    }

    function parsePrimary() {
        if (peek() === '(') {
            consume(); // (
            const expr = parseExpression();
            if (peek() !== ')') throw new Error("Expected ')'");
            consume(); // )
            return expr;
        }
        return consume();
    }

    function parseUnary() {
        if (peek() === '!') {
            return ['!', parseUnary()];
        }
        return parsePrimary();
    }

    function parseBinary(parseNext, ops) {
        let left = parseNext();
        while (ops.includes(peek())) {
            const op = consume();
            const right = parseNext();
            left = [op, left, right];
        }
        return left;
    }

    function parseAddSub() {
        return parseBinary(parseUnary, ['+', '-', '/', '*']);
    }

    function parseComparison() {
        return parseBinary(parseAddSub, ['==', '>', '<', '>=', '<=']);
    }

    function parseLogical() {
        return parseBinary(parseComparison, ['&&', '||']);
    }

    function parseExpression() {
        return parseLogical();
    }

    return parseExpression();
}

function flatten(ast) {
    if (typeof ast === 'string') return ast;
    if (ast.length === 2) return `${ast[0]} ${flatten(ast[1])}`;
    return `${ast[0]} ${flatten(ast[1])} ${flatten(ast[2])}`;
}

function transformLogicalExpression(expression) {
    const tokens = tokenize(expression);
    const ast = parseLogicalExpression(tokens);
    return flatten(ast);
}



export async function executeBlock(block) {
    let generators = window.api.generators;
    let api = window.electron.ipcRenderer;
    console.log(block);

    // api.writeSerialAndWait(generators.analogWrite(5, 200));


    // Construct blocks
    if (block.type == "controls_whileUntil") { // while loop
        const isUntil = block.getFieldValue('MODE') === 'UNTIL';
        // console.log("UNTIL:", isUntil);
        const conditionBlock = block.getInputTargetBlock('BOOL');
        let condition = window.Blockly.JavaScript.blockToCode(conditionBlock)[0];

        let result = await api.writeSerialAndWait(
            generators.while(transformLogicalExpression(condition))
        );

        while (result.data[0][3] && !window.stop_flag){
            const loopBodyBlock = block.getInputTargetBlock('DO');
            let current = loopBodyBlock;
            while (current) {
                await executeBlock(current);
                current = current.getNextBlock();
            }
            result = await api.writeSerialAndWait(
                generators.while(transformLogicalExpression(condition))
            );
        }

    } else if (block.type == "controls_repeat_ext") { // repeat n times
        const countBlock = block.getInputTargetBlock('TIMES');
        let countBlockExp = window.Blockly.JavaScript.blockToCode(countBlock)[0];
        let result = await api.writeSerialAndWait(
            generators.for_times(transformLogicalExpression(countBlockExp))
        );

        while (result.data[0][3] && !window.stop_flag){
            const loopBodyBlock = block.getInputTargetBlock('DO');
            let current = loopBodyBlock;
            while (current) {
                await executeBlock(current);
                current = current.getNextBlock();
            }
            result = await api.writeSerialAndWait(
                generators.for_times(transformLogicalExpression(countBlockExp))
            );
        }


        // const timesBlock = block.getInputTargetBlock('TIMES');
        // let repeatCount = 0;
        // if (timesBlock) {
        //     if (timesBlock.type === 'math_number') {
        //         repeatCount = timesBlock.getFieldValue('NUM');
        //         console.log('Repeat count (number):', repeatCount);
        //     }
        // }

        // for (let i = 0; i < repeatCount; i++) {
        //     let loopBodyBlock = block.getInputTargetBlock('DO');
        //     let current = loopBodyBlock;
        //     while (current) {
        //         await executeBlock(current);
        //         current = current.getNextBlock();
        //     }

        // }

        // Generic blocks

    } else if (block.type == "controls_if") {
        const condBlock = block.getInputTargetBlock('IF0');
        let condition = window.Blockly.JavaScript.blockToCode(condBlock)[0];
        return api.writeSerialAndWait(generators.single_if(transformLogicalExpression(condition))).then(async data => {
            if (data.data[0][3]) { // True
                const ifTrueBodyBlock = block.getInputTargetBlock('DO0');
                let current = ifTrueBodyBlock;
                while (current) {
                    await executeBlock(current);
                    current = current.getNextBlock();
                }
            }
        });

    } else if (block.type == "controls_ifelse") {
        const condBlock = block.getInputTargetBlock('IF0');
        let condition = window.Blockly.JavaScript.blockToCode(condBlock)[0];
        return api.writeSerialAndWait(generators.single_if(transformLogicalExpression(condition))).then(async data => {
            if (data.data[0][3]) { // True
                const ifTrueBodyBlock = block.getInputTargetBlock('DO0');
                let current = ifTrueBodyBlock;
                while (current) {
                    await executeBlock(current);
                    current = current.getNextBlock();
                }
            } else {
                const ifFalseBodyBlock = block.getInputTargetBlock('ELSE');
                let current = ifFalseBodyBlock;
                while (current) {
                    await executeBlock(current);
                    current = current.getNextBlock();
                }
            }
        });
    } else if (block.type == "pinmode") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        let mode = block.getFieldValue("MODE");

        return api.writeSerialAndWait(generators.pinMode(pin, mode)).then(data => {
            console.log(data);
        });

    } else if (block.type == "analog_write") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        let value = block.getInputTargetBlock("VALUE").getFieldValue("NUM");
        // api.writeSerial(generators.analogWrite(pin, value));
        return api.writeSerialAndWait(generators.analogWrite(pin, value)).then(data => {
            console.log(data);
        });

    } else if (block.type == "digital_write") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        let value = parseInt(block.getFieldValue("MODE"));
        return api.writeSerialAndWait(generators.ditialWrite(pin, value)).then(data => {
            console.log(data);
        });

    } else if (block.type == "delay") {
        let time = block.getInputTargetBlock("VALUE").getFieldValue("NUM");
        return api.writeSerialAndWait(generators.delay(time)).then(data => {
            console.log(data);
        });
    } else if (block.type == "variables_set") {
        let name = block.getField('VAR').getVariable().name;
        let value = block.getInputTargetBlock('VALUE');
        
        console.log("VAL:", value.type);
        // console.log(transformLogicalExpression(rValue));
        // console.log(generators.set_var(name, transformLogicalExpression(rValue)));
        
        let resBuff;
        if (value.type == "text") {
            resBuff = generators.set_var(name, value.getFieldValue('TEXT'), 0)
        } else if (value.type == "digital_read"){
            let val = value.getInputTargetBlock('NUM');
            let pinNum = window.Blockly.JavaScript.blockToCode(val)[0];
            resBuff = generators.set_var_as_pin(name, pinNum);
        } else if (value.type == "analog_read"){
            let val = value.getInputTargetBlock('NUM');
            let pinNum = window.Blockly.JavaScript.blockToCode(val)[0];
            resBuff = generators.set_var_as_pin(name, pinNum, 1);
        }else if (value.type == "get_distance") {
            let echo = value.getInputTargetBlock('ECHO');
            let trig = value.getInputTargetBlock('TRIG');
            let reader = window.Blockly.JavaScript.blockToCode(val)[0];
            resBuff = generators.get_distance(reader, name, echo, trig);
        } else if (value.type == "servo_read"){
            let val = value.getInputTargetBlock('NUM');
            let pinNum = window.Blockly.JavaScript.blockToCode(val)[0];
            resBuff = generators.set_var_as_pin(name, pinNum);
        } else { // expression
            let rValue = window.Blockly.JavaScript.blockToCode(value)[0];
            resBuff = generators.set_var(name, transformLogicalExpression(rValue));
        } 
        return api.writeSerialAndWait(resBuff).then(data => {
            console.log(data);
        });

        // generators.set_var()
    } else if (block.type == "write_text") {
        let arg = block.getInputTargetBlock('TEXT');
        console.log(arg.type);
        let final_packet;
        if (arg.type == "variables_get") { // print variable
            let var_name = arg.getField('VAR').getVariable().name;
            final_packet = generators.print_var(var_name);
        } else if (arg.type == "text") {
            let text = arg.getFieldValue('TEXT');
            final_packet = generators.print_text(text);
        } else if (arg.type == "math_number") {
            let val = arg.getFieldValue('NUM');
            final_packet = generators.print_number(val);
        } else if (arg.type == "digital_read") {
            let val = arg.getInputTargetBlock('NUM');
            let rValue = window.Blockly.JavaScript.blockToCode(val)[0];
            console.log("PIN NUM:", rValue);
            final_packet = generators.print_pin_read(rValue);
        }
        console.log(final_packet);

        return api.writeSerialAndWait(final_packet, 2).then(data => {
            console.log("RESP to print:", data.data[1]);
            console.info(asciiToString(data.data[1].slice(2, -1)));
        });
    } else if (block.type == "servo_write") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        let value = parseInt(block.getFieldValue("VALUE"));
        return api.writeSerialAndWait(generators.servoWrite(pin, value)).then(data => {
            console.log(data);
        });
    } else if (block.type == "delay") {
        let pin = block.getInputTargetBlock("VALUE").getFieldValue("NUM");
        return api.writeSerialAndWait(generators.servo_stop(pin)).then(data => {
            console.log(data);
        });
    }



}

export async function executeSequence(blocks, button) {
    console.log(`[Обработчик] Код получен`);




    for (const block of blocks) {
        console.log("STOP FLAG:", window.stop_flag);
        if (!window.stop_flag) {
            await executeBlock(block);
        }
    }

    console.log(`[Обработчик] Код выполнен`);
    // button.textElement_.textContent = 'СТАРТ';
    button.toggle();

}


export async function resetBlock() {
    window.electron.ipcRenderer.writeSerialAndWait(window.api.generators.reset_block());
}