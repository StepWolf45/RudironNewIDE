import * as Blockly from 'blockly';
import { FieldButton } from './FieldButton.js';

Blockly.fieldRegistry.register('field_button', FieldButton);


Blockly.Blocks['start'] = {
  init() {
    this.appendDummyInput()
      .appendField(new FieldButton('Старт', () => {
        // alert('Кнопка в блоке нажата!');
      }), 'BUTTON');
    this.setColour(140);
    this.setTooltip('Запускает выполнение программы');
    this.setNextStatement(true);
    this.hat = 'cap' // Активируем hat

  }
};

// Кастомный блок для digital_pin
Blockly.Blocks['digital_pin'] = {
  init() {
    this.appendDummyInput()
      .appendField('Установить пин')
    this.appendValueInput('TIMES')
      .appendField('в состояние')
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(100);
    this.setTooltip('Цифровой пин');
  },
};