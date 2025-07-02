# CategoriesToolbox

## Назначение
CategoriesToolbox предоставляет конфигурацию категорий блоков для Blockly workspace. Содержит массив категорий с их настройками, включая XML для toolbox, изображения и метаданные. Используется в BlockPanel для создания меню категорий.


## Экспортируемые элементы
### categories (array)
Массив объектов категорий блоков с следующей структурой:

```javascript
{
  id: string,           // Уникальный идентификатор категории
  name: string,         // Отображаемое имя категории
  image: string,        // Путь к изображению категории
  toolboxXML: string    // XML строка для Blockly toolbox
}
```

### Пример категории
```javascript
{
  id: 'logic',
  name: 'Логика',
  image: '/categories/logic-icon.png',
  toolboxXML: `
    <xml style="display: none">
      <category name="Логика" colour="%{BKY_LOGIC_HUE}">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
      </category>
    </xml>
  `
}
```

## Использование в компонентах

### В BlockPanel
```javascript
import { categories } from './CategoriesToolbox';

const menuItems = categories.map((category) => ({
  key: category.id,
  label: category.name,
  icon: <img src={category.image} className='img_categ' />,
  onClick: () => setActiveCategory(category),
}));
```

### В BlocklyWorkspace
```javascript
import { categories } from '../BlockPanel/CategoriesToolbox';

// Использование toolboxXML
toolbox: activeCategory?.toolboxXML || ''
```

## Расширение
Для добавления новой категории:
1. Добавить объект в массив `categories`
2. Создать соответствующее изображение
3. Определить XML для toolbox
4. Обновить типы блоков при необходимости

