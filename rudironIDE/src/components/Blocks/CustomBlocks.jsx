import * as Blockly from 'blockly';
import 'blockly/javascript';
import { FieldButton } from './FieldButton.js';
import { executeSequence, resetBlock } from '../BlockExecutor/BlockExecutor.jsx';

Blockly.fieldRegistry.register('field_button', FieldButton);

Blockly.Blocks['start'] = {
  init() {
    window.stop_flag = false;
    const fieldBtn = new FieldButton('СТАРТ', () => {
      window.board_connection.checkConnected().then((data) => {
        if (data) {
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
        } else {
          alert("Подключите плату");
          fieldBtn.toggle();
        }
      })


    })
    this.appendDummyInput().appendField(fieldBtn, 'BUTTON');
    this.setColour("#ffd967");
    this.setTooltip('Запускает выполнение программы');
    this.setNextStatement(true);
    this.hat = 'cap';
  }
};

Blockly.Blocks['text'] = {
  init: function () {
    this.jsonInit({
      "type": "text",
      "message0": "❞%1❞",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": ""
        }
      ],
      "output": "String",
      "colour": "#f08e32",
      "tooltip": "Текстовая строка",
      "helpUrl": ""
    });
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
      changeEvent.type === Blockly.Events.BLOCK_CHANGE) { 

      const pinInput = this.getInput('VALUE');
      const pinValue = this.getFieldValue('VALUE') || 0; 
      const pinBlock = pinInput.connection.targetBlock();

      if (pinBlock && pinBlock.type === 'math_number') {
        const numberFieldValue = pinBlock.getFieldValue('NUM') || 0; 
        const numValue = Number(numberFieldValue);

        if (isNaN(numValue) || numValue < 0 || numValue > 255) {
          this.setWarningText("Значение пина должно быть числом от 0 до 255.");
        } else {
          this.setWarningText(null); 
        }
      } else if (pinBlock) {
        this.setWarningText("К пину можно подключить только числовое значение.");
      } else {
        this.setWarningText(null);
      }
    }
  }
};


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
      "colour": "#224be0",
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
      "colour": "#224be0",
      "tooltip": "Чтение аналог. пина"
    });
  }
};


Blockly.Blocks['servo_write'] = {
  init: function () {
    this.jsonInit({
      "type": "servo_write",
      "message0": "Установить угол сервы %1 на %2 °",
      "args0": [
        {
          "type": "input_value",
          "name": "PIN",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "ANGLE",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#90a955",
      "tooltip": "Повернуть серву на заданный угол"
    });
  }
};


Blockly.Blocks['servo_stop'] = {
  init: function () {
    this.jsonInit({
      "type": "servo_stop",
      "message0": "Остановть серву %1",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#90a955",
      "tooltip": "Остановить серву"
    });
  }
};

Blockly.Blocks['servo_read'] = {
  init: function () {
    this.jsonInit({
      "type": "servo_read",
      "message0": "Угол сервы %1",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#90a955",
      "tooltip": "Записать текущий угол сервы в переменную"
    });
  }
};




Blockly.Blocks['get_distance'] = {
  init: function () {
    this.jsonInit({
      "type": "get_distance",
      "message0": "Расстояние с дальномера\n t = %1 e = %2",
      "args0": [
        {
          "type": "input_value",
          "name": "TRIG",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "ECHO",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": "#f28c57",
      "tooltip": "Записать расстояние с дальномера в переменную"
    });
  }
};
