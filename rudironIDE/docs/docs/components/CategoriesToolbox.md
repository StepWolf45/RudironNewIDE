# CategoriesToolbox

## Назначение
CategoriesToolbox предоставляет конфигурацию категорий блоков для Blockly workspace. Содержит массив категорий с их настройками, включая XML для toolbox, изображения и метаданные. Используется в BlockPanel для создания меню категорий.

## Основные переменные состояния
Не является компонентом, а экспортирует константы и функции.

## Контексты (useContext)
Не использует контексты.

## Хуки
Не использует хуки.

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

## Структура XML для toolbox
Каждая категория содержит XML строку, которая определяет:
- Название категории
- Цвет категории
- Список доступных блоков
- Группировку блоков

## Особенности
- Централизованное управление категориями блоков
- Поддержка кастомных изображений для каждой категории
- Интеграция с Blockly toolbox системой
- Легкое добавление новых категорий
- Поддержка русской локализации

## Расширение
Для добавления новой категории:
1. Добавить объект в массив `categories`
2. Создать соответствующее изображение
3. Определить XML для toolbox
4. Обновить типы блоков при необходимости

## Интеграция с Blockly
- Используется для создания toolbox в workspace
- Поддерживает все стандартные типы блоков Blockly
- Совместим с кастомными блоками
- Интегрируется с системой тем Blockly 

## Структура компонента
```jsx
<div className="categories-toolbox">
  {categories.map((category) => (
    <div key={category.name} className="category">
      <div className="category-header">
        <span>{category.name}</span>
      </div>
      <div className="category-blocks">
        {category.blocks.map((block) => (
          <div key={block.type} className="block-item">
            {block.xml}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

## Пример использования
```jsx
<CategoriesToolbox />
``` 