import * as Blockly from 'blockly';
import { FieldButton } from './FieldButton.js';

// Регистрация кастомного поля
Blockly.fieldRegistry.register('field_button', FieldButton);

Blockly.Blocks['start'] = {
  init() {
    this.appendDummyInput()
      .appendField(new FieldButton('Старт', () => {
        // alert('Кнопка в блоке нажата!');
      }), 'BUTTON');
    this.setColour(90);
    this.setTooltip('Запускает выполнение программы');
    this.setNextStatement(true);
  }
};
// Кастомный блок для digitalWrite
Blockly.Blocks['digital_pin'] = {
  init() {
    this.appendDummyInput()
      .appendField('Установить пин')
      .appendField(new Blockly.FieldDropdown([
        ['2', '2'], ['3', '3'], ['13', '13']
      ]), 'PIN')
      .appendField('в состояние')
      .appendField(new Blockly.FieldDropdown([
        ['HIGH', 'HIGH'], ['LOW', 'LOW']
      ]), 'STATE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Цифровой пин');
  },
};