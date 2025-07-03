# Добавление кастомного блока

## 1. Создание кастомного блока

### 1.1. Откройте файл кастомных блоков
Все кастомные блоки определяются в файле:
```
rudironIDE/src/components/Blocks/CustomBlocks.jsx
```

### 1.2. Определите новый блок
Сначала необходимо добавить кастомный Blockly блок в файл `./components/Blocks/CustomBlocks.jsx`. Рассмотрим на примере `delay` (пример простого блока, который выполняется в один этап без обработки ответа платы):

```js
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
```

В поле `type` пишется название блока, которое будет использоваться для описания логики работы блока.

#### Основные параметры блока:

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

### 1.3. (Опционально) Добавьте кастомные поля, кнопки, переменные
Можно использовать кастомное поле FieldButton из папки Blocks:
```javascript
this.appendDummyInput()
  .appendField(new Blockly.FieldButton('Кнопка', null, {
    onClick: () => alert('Кнопка нажата!')
  }), 'BUTTON');
```

## 2. Добавление блока в toolbox (панель категорий)

### 2.1. Откройте файл категорий:
```
rudironIDE/src/components/BlockPanel/CategoriesToolbox.jsx
```

### 2.2. Найдите нужную категорию или создайте новую

### 2.3. Добавьте XML для блока в toolboxXML:
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
    <xml>
      <category name="Кастомные" colour="#FFAA00">
        <block type="my_custom_block"></block>
      </category>
    </xml>
  `
}
```
### 2.4. Проверка блока в интерфейсе
- Перезапустите приложение
- Откройте нужную категорию в панели блоков
- Найдите и перетащите новый блок на рабочую область
- Проверьте механики блока (соединение, вложенность, дублирование и т.д.)

## 3. Описание логики выполнения блока

Описание логики производится в `./components/BlockExecutor/BlockExecutor.jsx`, в функции `executeBlock(block)`.

Необходимо добавить проверку по значению `block.type`:

```js
else if (block.type == "delay") {
    let time = block.getInputTargetBlock("VALUE").getFieldValue("NUM");
    return api.writeSerialAndWait(generators.delay(time)).then(data => {
        console.log(data);
    });
}
```

Через стандартный API Blockly можно получить значения аргументов, указанных в полях `args` в описании блока.

## 4. Создание генератора буфера

`generators.delay(time)` генерирует буффер для команды `delay` (`generators.delay` описывается в `./electron/preload.ts`):

```js
delay: (time) => {
    let bufferRes = Buffer.concat([
        Buffer.from([0xFE, 0xDE, 0x11, 0x00, 0x90, 0x01, 0x01]),
        genNumberArgument(time)
    ])

    return bufferRes;

},
```

Данный генератор пишется в первую очередь, а затем используется в `BlockExecutor`.

## 5. Сложные блоки-конструкции

Блок `delay` это пример простого блока, без сложной логики работы. Рассмотрим добавление блока-конструкции на примере `if`. Принцип выполнения следующий:

* Генерируется условие для проверки и отправляется на плату
* Ожидается результат проверки от платы
* В зависимости от результата выполняются или не выполняются блоки внутри if'а

Аналогичным образом работают `while` и `for`.

Рассмотрим генератор буфера условия для блока `if` (`./electron/preload.ts`):

```js
single_if: (cond) => {
    let bufferRes = Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x2F, 0x01, 0x01]);
    bufferRes = generateExpressionBuffer(bufferRes, cond);
    let size = bufferSize2(bufferRes, 4)
    bufferRes[2] = size[1];
    bufferRes[3] = size[0];
    return bufferRes;
},
```

И использование генератора в `BlockExecutor`:

```js
else if (block.type == "controls_ifelse") {
    const condBlock = block.getInputTargetBlock('IF0');
    let condition = window.Blockly.JavaScript.blockToCode(condBlock)[0];
    return api.writeSerialAndWait(generators.single_if(transformLogicalExpression(condition))).then(async data => {
        if (data.data[0][3]) { // True
            const ifTrueBodyBlock = block.getInputTargetBlock('DO0');
            let current = ifTrueBodyBlock;
            while (current) {
                await executeBlock(current);
                current = current.getNextBlock();
            }
        } else {
            const ifFalseBodyBlock = block.getInputTargetBlock('ELSE');
            let current = ifFalseBodyBlock;
            while (current) {
                await executeBlock(current);
                current = current.getNextBlock();
            }
        }
    });
}
```

Функция `transformLogicalExpression` преобразует логическое выражение в префиксный вид:

```code
Из: is_logged && (start_catch == (first_index + 1032.55))
В: && is_logged == start_catch + first_index 1032.55
```

Через `generators.single_if` генерируется буфер для проверки условия. В зависимости от его результата выполняются соответствующие блоки.

## 6. Настройка количества ожидаемых пакетов

`api.writeSerialAndWait` принимает 2 аргумента: буфер и количество пакетов, которые ожидаются в качестве ответа на выполнение блока от платы. Дефолтное количество пакетов (`wait_packets_cnt`) равно 1, но например для блоков, работающих с serial портом необходимо получать 2 ответа от платы. Для этого необходимо менять значение аргумента `wait_packets_cnt`:

```
return api.writeSerialAndWait(final_packet, 2).then(data => {
    console.log("RESP to print:", data.data[1]);
    console.info(asciiToString(data.data[1].slice(2, -1)));
});
```

## 7. Заключение

На этом описание создания кастомного блока с точки зрения программы закончено. Дальнейшая обработка производится на плате через прошивку из другого репозитория.
