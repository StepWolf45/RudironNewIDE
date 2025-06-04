import * as Blockly from 'blockly';
import 'blockly/javascript';
import { FieldButton } from './FieldButton.js';
import { executeSequence, resetBlock } from '../BlockExecutor/BlockExecutor.jsx';

Blockly.fieldRegistry.register('field_button', FieldButton);

Blockly.Blocks['start'] = {
  init() {
    window.stop_flag = false;
    const fieldBtn = new FieldButton('Старт', () => {
      console.log("Is running: ", fieldBtn.isRunning);
      
      if (fieldBtn.isRunning) { // Start
        window.stop_flag = false;
        window.Blockly.JavaScript.init(this.workspace);

        const topBlocks = this.workspace.getTopBlocks(true);
        const result = [];

        topBlocks.forEach(topBlock => {
          let block = topBlock;
          while (block) {
            result.push(block);
            block = block.getNextBlock();
          }
        });
        executeSequence(result, fieldBtn);
      } else {
        window.stop_flag = true;
        console.log("STOP");
        resetBlock();
        fieldBtn.toggle();
      }

    })
    this.appendDummyInput().appendField(fieldBtn, 'BUTTON');
    this.setColour("#ffd967");
    this.setTooltip('Запускает выполнение программы');
    this.setNextStatement(true);
    this.hat = 'cap';
  }
};

Blockly.Blocks['write_text'] = {
  init: function () {
    this.jsonInit({
      "message0": "Напечатать %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#33a6cc",
      "tooltip": "Вывести текст",
      "helpUrl": ""
    });
  }
};

Blockly.Blocks['delay'] = {
  init: function () {
    this.jsonInit({
      "type": "delay",
      "message0": "Задержка %1 мс",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number"
        },
      ],
      "previousStatement": null,
      "nextStatement": null,
      "inputsInline": true,
      "colour": "33a6cc",
      "tooltip": "Задержка в миллисекундах"
    });
  }
};
Blockly.Blocks['variables_set'] = {
  init: function () {
    this.jsonInit({
      "message0": "Присвоить %1 = %2",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": "элемент"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "colour": "#c359b2",
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};

Blockly.Blocks['variables_get'] = {
  init: function () {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": "элемент"
        }
      ],
      "output": null,
      "colour": "#c359b2",

    });
  }
};



Blockly.Blocks['pinmode'] = {
  init: function () {
    this.jsonInit({
      "type": "pinmode",
      "message0": "Поставить пин %1 на %2",
      "args0": [
        {
          "type": "input_value",
          "name": "PIN",
          "check": "Number"
        },
        {
          "type": "field_dropdown",
          "name": "MODE",
          "options": [
            ["ВХОД", "0"],
            ["ВЫХОД", "1"],
            ["ПОДТЯГИВАНИЕ", "2"]
          ]
        }
      ],
      "previousStatement": true,
      "nextStatement": true,
      "inputsInline": true,
      "colour": 240,
      "tooltip": "Ставит пин в выбранный режим"
    });
  }
};

Blockly.Blocks['digital_write'] = {
  init: function () {
    this.jsonInit({
      "type": "digital_write",
      "message0": "Цифровая запись пина %1 со значением %2",
      "args0": [
        {
          "type": "input_value",
          "name": "PIN",
          "check": "Number"
        },
        {
          "type": "field_dropdown",
          "name": "MODE",
          "options": [
            ["LOW", "0"],
            ["HIGH", "1"],
          ]
        }
      ],
      "previousStatement": true,
      "nextStatement": true,
      "inputsInline": true,
      "colour": 240,
    });
  },
};

Blockly.Blocks['analog_write'] = {
  init: function () {
    this.jsonInit({
      "type": "analog_write",
      "message0": "Запись аналог. пина %1 со значением %2",
      "args0": [
        {
          "type": "input_value",
          "name": "PIN",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number"
        }
      ],
      "previousStatement": true,
      "nextStatement": true,
      "inputsInline": true,
      "colour": 240,
    });
  },
  onchange: function (changeEvent) {
    if (changeEvent.type === Blockly.Events.BLOCK_MOVE ||
      changeEvent.type === Blockly.Events.BLOCK_CHANGE) { // Check both move and change events

      const pinInput = this.getInput('PIN');
      const pinValue = this.getFieldValue('PIN') || 0; // Get field value as backup
      const pinBlock = pinInput.connection.targetBlock();

      if (pinBlock && pinBlock.type === 'math_number') {
        const numberFieldValue = pinBlock.getFieldValue('NUM') || 0; // Get the value from the number block
        const numValue = Number(numberFieldValue);

        if (isNaN(numValue) || numValue < 0 || numValue > 255) {
          this.setWarningText("Значение пина должно быть числом от 0 до 255.");
        } else {
          this.setWarningText(null); // Clear the warning.
        }
      } else if (pinBlock) {
        this.setWarningText("К пину можно подключить только числовое значение.");
      } else {
        this.setWarningText(null);
      }
    }
  }
};


// Operators

Blockly.Blocks['digital_read'] = {
  init: function () {
    this.jsonInit({
      "type": "digital_read",
      "message0": "Значение цифрового пина %1",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#1E90FF",
      "tooltip": "Чтение цифрового пина"
    });
  }
};

Blockly.Blocks['analog_read'] = {
  init: function () {
    this.jsonInit({
      "type": "analog_read",
      "message0": "Значение аналог. пина %1",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#1E90FF",
      "tooltip": "Чтение аналог. пина"
    });
  }
};
