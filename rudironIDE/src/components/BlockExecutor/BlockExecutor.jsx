import React from 'react';

export function executeBlock(block) {
    let generators = window.api.generators;
    let api = window.electron.ipcRenderer;
    console.log(block.type);


    // Construct blocks
    if (block.type == "controls_whileUntil") { // while loop
        const isUntil = block.getFieldValue('MODE') === 'UNTIL';
        // console.log("UNTIL:", isUntil);
        const conditionBlock = block.getInputTargetBlock('BOOL');
        const conditionValue = conditionBlock.getFieldValue("BOOL") === "TRUE";
        // console.log('Condition val:', conditionValue);
        while (conditionValue) {
            const loopBodyBlock = block.getInputTargetBlock('DO');

            let current = loopBodyBlock;
            while (current) {
                executeBlock(current);
                current = current.getNextBlock();
            }
        }

    } else if (block.type == "controls_repeat_ext") { // repeat n times
        const timesBlock = block.getInputTargetBlock('TIMES');
        let repeatCount = 0;
        if (timesBlock) {
            if (timesBlock.type === 'math_number') {
                repeatCount = timesBlock.getFieldValue('NUM');
                console.log('Repeat count (number):', repeatCount);
            }
        }

        for (let i = 0; i < repeatCount; i++){
            let loopBodyBlock = block.getInputTargetBlock('DO');
            let current = loopBodyBlock;
            while (current) {
                executeBlock(current);
                current = current.getNextBlock();
            }

        }

        // Generic blocks
    } else if (block.type == "pinmode") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        api.writeSerial(generators.pinMode(pin,
            block.getFieldValue("MODE")));
    } else if (block.type == "analog_write") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        let value = block.getInputTargetBlock("VALUE").getFieldValue("NUM");
        api.writeSerial(generators.analogWrite(pin, value));
        
    } else if (block.type == "digital_write") {
        let pin = block.getInputTargetBlock("PIN").getFieldValue("NUM");
        let value = parseInt(block.getFieldValue("MODE"));
        api.writeSerial(generators.ditialWrite(pin, value));

    } else if (block.type == "delay") {
        let time = block.getInputTargetBlock("VALUE").getFieldValue("NUM");
        api.writeSerial(generators.delay(time));
    }
    

    
}

export function executeSequence(blocks) {
    console.log(`[Обработчик] Код получен`);

    blocks.forEach(block => {
        executeBlock(block);
    });

    console.log(`[Обработчик] Код выполнен`);

}