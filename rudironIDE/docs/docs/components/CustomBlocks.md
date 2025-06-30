# CustomBlocks

## Назначение
CustomBlocks содержит определения кастомных блоков для Blockly workspace. Расширяет стандартную библиотеку блоков Blockly кастомными блоками, специфичными для данного приложения. Определяет внешний вид, поведение и функциональность кастомных блоков.

## Основные переменные состояния
Не является компонентом, а экспортирует определения блоков.

## Контексты (useContext)
Не использует контексты.

## Хуки
Не использует хуки.

## Экспортируемые элементы

### Определения кастомных блоков
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

### Генераторы кода
Для каждого кастомного блока определяется генератор кода:

```javascript
Blockly.JavaScript['custom_block_name'] = function(block) {
  var value_input = Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_ATOMIC);
  var code = 'customFunction(' + value_input + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
```

## Структура блока
Каждый кастомный блок содержит:

### Основные свойства
- `init` — функция инициализации блока
- `colour` — цвет блока
- `tooltip` — подсказка при наведении
- `helpUrl` — ссылка на справку

### Элементы ввода/вывода
- `appendValueInput` — поле для значения
- `appendDummyInput` — текстовое поле
- `appendStatementInput` — поле для вложенных блоков
- `setOutput` — выходное значение

### Стилизация
- `setColour` — установка цвета
- `setStyle` — установка стиля
- `setMutator` — установка мутатора

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

## Особенности
- Расширяет стандартную библиотеку Blockly
- Поддерживает все типы входов и выходов
- Интегрируется с системой генерации кода
- Поддерживает кастомные стили и цвета
- Совместим с системой тем Blockly

## Расширение
Для добавления нового кастомного блока:
1. Определить блок в Blockly.Blocks
2. Создать генератор кода в Blockly.JavaScript
3. Добавить блок в toolbox XML
4. Обновить документацию

## Генерация кода
- Поддерживает различные языки программирования
- Интегрируется с системой типов Blockly
- Поддерживает кастомные функции
- Обеспечивает правильный порядок операций

## Стилизация
- Поддерживает кастомные цвета
- Интегрируется с темой приложения
- Совместим с системой стилей Blockly
- Поддерживает адаптивный дизайн 