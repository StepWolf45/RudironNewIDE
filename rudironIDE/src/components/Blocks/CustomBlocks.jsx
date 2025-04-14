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
        "colour": 210,
    });
  }
};
// Blockly.Blocks['pinmode'] = {
//   init: function() {
//     this.jsonInit({
//         "type": "pinmode",
//         "message0": "пин %0 на %1", // Added %1 to correspond to args1
//         "args0": [
//             {
//               "type": "input_value",
//               "name": "VALUE",
//               "check": "Number"
//             },
//         ],
//         "args1": [
//           {
//             "type": "field_dropdown",
//             "name": "OPERATOR",
//             "options": [
//               ["+", "ADD"],
//               ["-", "SUBTRACT"],
//             ]
//           },
//         ],
//         "inputsInline": true,
//         "colour": 210,
//     });
//   }
// };