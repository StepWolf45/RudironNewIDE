import * as Blockly from 'blockly';
import { FieldButton } from './FieldButton.js';


Blockly.fieldRegistry.register('field_button', FieldButton);


Blockly.Blocks['start'] = {
  init() {
    this.appendDummyInput()
      .appendField(new FieldButton('Старт', () => {
        // alert('Кнопка в блоке нажата!');
      }), 'BUTTON');
    this.setColour(300);
    this.setTooltip('Запускает выполнение программы');
    this.setNextStatement(true);
    this.hat = 'cap';               
  }
};

Blockly.Blocks['write_text'] = {
  init: function() {
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
      "colour": "#33a6cc", // Новый цвет (оранжевый)
      "tooltip": "Вывести текст",
      "helpUrl": ""
    });
  }
};

Blockly.Blocks['delay'] = {
  init: function() {
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
        "previousStatement":null,
        "nextStatement":null,
        "inputsInline": true,
        "colour": " #5ab0c2",
        "tooltip": "Задержка в миллисекундах"
    });
  }
};
Blockly.Blocks['variables_set'] = {
  init: function() {
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
  init: function() {
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
      "colour": "#c25a7c", 

    });
  }
};



Blockly.Blocks['pinmode'] = {
  init: function() {
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
            ["ВХОД","0"],
            ["ВЫХОД", "1"],
            ["ПОДТЯГИВАНИЕ", "2"]
          ]
        }
      ],
      "previousStatement":true ,
      "nextStatement": true,
      "inputsInline": true,
      "colour":" #5ab0c2",
      "tooltip": "Ставит пин в выбранный режим"
    });
  }
};
Blockly.Blocks['digial_write'] = {
  init: function() {
    this.jsonInit({
      "type": "digial_write",
      "message0": "Цифровая запись %1 пина со значением %2",
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
            ["ВХОД","0"],
            ["ВЫХОД", "1"],
            ["ПОДТЯГИВАНИЕ", "2"]
          ]
        }
      ],
      "previousStatement":true ,
      "nextStatement": true,
      "inputsInline": true,
      "colour":" #5ab0c2",
      "tooltip": "Ставит пин в выбранный режим"
    });
  }
};
