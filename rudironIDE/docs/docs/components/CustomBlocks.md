# CustomBlocks

## Назначение
CustomBlocks содержит определения, которые расширяют стандартную библиотеку блоков Blockly, специфичными для данного приложения. Определяет внешний вид, поведение и функциональность кастомных блоков.

## Определения кастомных блоков
Каждый кастомный блок определяется с помощью Blockly.Blocks API:

```javascript
Blockly.Blocks['custom_block_name'] = {
  init: function() {
    this.appendValueInput("INPUT")
        .setCheck("Number")
        .appendField("Кастомный блок");
    this.setOutput(true, "Number");
    this.setColour(230);
    this.setTooltip("Описание блока");
    this.setHelpUrl("");
  }
};
```
## Основные параметры блока:

| Метод/свойство         | Описание                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| appendDummyInput()    | Добавляет простое текстовое поле                                          |
| appendValueInput(name)| Добавляет поле для значения (можно указать тип через setCheck)            |
| appendStatementInput(name)| Добавляет поле для вложенных блоков                                 |
| setOutput(type)       | Делает блок возвращающим значение (например, 'Number')                    |
| setPreviousStatement(type)| Позволяет присоединять блок к предыдущему                         |
| setNextStatement(type)| Позволяет присоединять блок к следующему                                 |
| setColour(value)      | Цвет блока (число или строка)                                             |
| setTooltip(text)      | Подсказка при наведении                                                   |
| appendField(field, name)| Добавляет поле (например, кнопку, текст, переменную)                 |
| setOnChange(handler)  | Устанавливает обработчик изменений                                        |
| setMutator(mutator)   | Добавляет мутатор (для динамических блоков)                              |

## Примеры кастомных блоков

### Простой блок
```jsx
Blockly.Blocks['simple_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Простой блок");
    this.setOutput(true, null);
    this.setColour(160);
  }
};
```

### Блок с параметрами
```jsx
Blockly.Blocks['parameter_block'] = {
  init: function() {
    this.appendValueInput("PARAM")
        .setCheck("Number")
        .appendField("Блок с параметром");
    this.setOutput(true, "Number");
    this.setColour(200);
  }
};
```

## Интеграция с Blockly

### Регистрация блоков
Блоки автоматически регистрируются при импорте файла:

```javascript
// В BlocklyWorkspace.jsx
import './CustomBlocks.jsx';
```

### Использование в toolbox
Кастомные блоки могут быть добавлены в toolbox XML:

```xml
<xml style="display: none">
  <category name="Кастомные блоки" colour="%{BKY_CUSTOM_HUE}">
    <block type="custom_block_name"></block>
  </category>
</xml>
```
