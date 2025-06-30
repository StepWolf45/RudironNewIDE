# Инструкция: Как добавить кастомный блок в программу

## 1. Создание кастомного блока

### 1.1. Откройте файл кастомных блоков
Все кастомные блоки определяются в файле:
```
rudironIDE/src/components/Blocks/CustomBlocks.jsx
```

### 1.2. Определите новый блок
Добавьте определение блока с помощью API Blockly:
```javascript
Blockly.Blocks['my_custom_block'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Мой кастомный блок');
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Описание блока');
    this.setHelpUrl('');
  }
};
```

#### Основные параметры блока:
- **appendDummyInput()** — добавляет простое текстовое поле
- **appendValueInput(name)** — добавляет поле для значения (можно указать тип)
- **appendStatementInput(name)** — добавляет поле для вложенных блоков
- **setOutput(type)** — делает блок возвращающим значение (например, 'Number')
- **setPreviousStatement(type)** — позволяет присоединять блок к предыдущему
- **setNextStatement(type)** — позволяет присоединять блок к следующему
- **setColour(value)** — цвет блока
- **setTooltip(text)** — подсказка при наведении
- **setHelpUrl(url)** — ссылка на справку

### 1.3. (Опционально) Добавьте поля, кнопки, переменные
Можно использовать кастомные поля, например, FieldButton:
```javascript
this.appendDummyInput()
  .appendField(new Blockly.FieldButton('Кнопка', null, {
    onClick: () => alert('Кнопка нажата!')
  }), 'BUTTON');
```

---

## 2. Добавление генератора кода

В этом же файле или в отдельном файле определите генератор кода для блока:
```javascript
Blockly.JavaScript['my_custom_block'] = function(block) {
  // Получение значений из полей, если есть
  // const value = Blockly.JavaScript.valueToCode(block, 'FIELD_NAME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '42'; // Пример: возвращаем число 42
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
```

---

## 3. Добавление блока в toolbox (панель категорий)

### 3.1. Откройте файл категорий:
```
rudironIDE/src/components/BlockPanel/CategoriesToolbox.jsx
```

### 3.2. Найдите нужную категорию или создайте новую

### 3.3. Добавьте XML для блока в toolboxXML:
```xml
<block type="my_custom_block"></block>
```
Пример:
```javascript
{
  id: 'custom',
  name: 'Кастомные',
  image: '/categories/custom-icon.png',
  toolboxXML: `
    <xml style="display: none">
      <category name="Кастомные" colour="#FFAA00">
        <block type="my_custom_block"></block>
      </category>
    </xml>
  `
}
```

---

## 4. Проверка блока в интерфейсе
- Перезапустите приложение (или обновите страницу)
- Откройте нужную категорию в панели блоков
- Найдите и перетащите новый блок на рабочую область

---

## 5. Пример полного цикла

1. **Создайте блок в CustomBlocks.jsx**
2. **Добавьте генератор кода**
3. **Добавьте XML в toolbox категории**
4. **Перезапустите приложение**
5. **Проверьте блок в интерфейсе**

---

## 6. Подробные параметры кастомного блока

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
| setHelpUrl(url)       | Ссылка на справку                                                         |
| appendField(field, name)| Добавляет поле (например, кнопку, текст, переменную)                 |
| setOnChange(handler)  | Устанавливает обработчик изменений                                        |
| setMutator(mutator)   | Добавляет мутатор (для динамических блоков)                              |

---

## 7. Советы
- Используйте уникальные имена для типа блока (`type`)
- Для сложных блоков используйте несколько входов/выходов
- Для динамических блоков используйте мутаторы
- Для интеграции с переменными используйте стандартные поля Blockly
- Для кнопок используйте FieldButton

---

## 8. Пример сложного блока
```jsx
Blockly.Blocks['math_sum'] = {
  init: function() {
    this.appendValueInput('A').setCheck('Number').appendField('A');
    this.appendValueInput('B').setCheck('Number').appendField('B');
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Суммирует два числа');
  }
};

Blockly.JavaScript['math_sum'] = function(block) {
  var a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = `${a} + ${b}`;
  return [code, Blockly.JavaScript.ORDER_ADDITION];
};
``` 