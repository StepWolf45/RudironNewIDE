# BlocklyWorkspace

## Назначение
BlocklyWorkspace является основным компонентом для работы с визуальным программированием. Создает и управляет рабочей областью Blockly, загружает блоки, обрабатывает события и интегрируется с системой управления файлами. Поддерживает сохранение и восстановление позиций скролла для каждого файла.

## Основные переменные состояния

| Переменная      | Тип      | Описание                                                        |
|-----------------|----------|-----------------------------------------------------------------|
| containerSize   | object   | Размеры контейнера `{width, height}`                            |
| autoSave        | boolean  | Флаг автоматического сохранения (всегда true)                  |

## Контексты (useContext)
- `FileContext` — для управления файлами, категориями и позициями скролла
- `ModalContext` — для интеграции с кастомными диалогами

## Хуки
- `useState` — для управления размерами контейнера и автосохранением
- `useRef` — для ссылок на DOM элементы и workspace
- `useCallback` — для мемоизации функции сохранения
- `useEffect` — для инициализации, адаптивности и обработки событий
- `useContext` — для доступа к контекстам

## Props

| Prop            | Тип      | Описание                                                        |
|-----------------|----------|-----------------------------------------------------------------|
| initialXml      | object   | Начальное состояние workspace (может быть null)                |
| onWorkspaceMount| function | Колбэк при создании workspace (workspace) => void              |

## Используемые библиотеки
- `Blockly` — основная библиотека визуального программирования
- `@blockly/workspace-minimap` — мини-карта для workspace
- `blockly/msg/ru` — русская локализация

## Структура компонента
```jsx
<div id="blocklyContainer">
  <div ref={blocklyDiv} id="blocklyDiv" />
</div>
```

## Основные функции

### Инициализация workspace
```javascript
const workspace = Blockly.inject(blocklyDiv.current, {
  theme: customTheme,
  renderer: 'zelos',
  scrollbars: true,
  maxBlocks: 800,
  zoom: { /* настройки зума */ },
  grid: { /* настройки сетки */ },
  toolbox: activeCategory?.toolboxXML || '',
  media: 'blockly/'
});
```

### Восстановление позиции скролла
```javascript
useEffect(() => {
  if (workspaceRef.current && activeFileId && scrollPositions[activeFileId]) {
    const savedPosition = scrollPositions[activeFileId];
    const blocks = workspaceRef.current.getAllBlocks(false);
    
    if (blocks.length > 0) {
      // Блоки загружены - восстанавливаем сразу
      workspaceRef.current.scrollX = savedPosition.x;
      workspaceRef.current.scrollY = savedPosition.y;
    } else {
      // Блоки не загружены - ждем через слушатель
      const restoreScroll = () => { /* восстановление */ };
      workspaceRef.current.addChangeListener(restoreScroll);
    }
  }
}, [activeFileId, scrollPositions]);
```

## События и обработчики

### События workspace
- `Blockly.Events.VAR` — события переменных
- `Blockly.Events.FINISHED_LOADING` — завершение загрузки блоков
- Общие события изменений для автосохранения

### Обработчики
- `saveToStorage()` — сохранение состояния workspace
- `resizeObserver` — адаптивность при изменении размеров
- `changeListener` — обработка изменений для автосохранения

## Интеграция с Blockly

### Кастомная тема
```javascript
const customTheme = Blockly.Theme.defineTheme('myTheme', {
  'base': Blockly.Themes.Classic,
  'blockStyles': {
    'logic_blocks': { 'colourPrimary': '#5AC2A0' },
    'loop_blocks': { 'colourPrimary': '#EE7475' }
  },
  componentStyles: { 
    workspaceBackgroundColour: '#1F1F1F'
  }
});
```

### Замена стандартных диалогов
```javascript
Blockly.dialog.setPrompt((msg, defaultValue, callback) => {
  showInputDialogReact({
    title: msg,
    defaultValue: defaultValue,
    onOk: (newValue) => { /* обработка OK */ },
    onCancel: () => { /* обработка Cancel */ }
  });
});
```

## Пример использования
```jsx
<BlocklyWorkspace
  initialXml={workspaceXml}
  onWorkspaceMount={(workspace) => {
    console.log('Workspace mounted:', workspace);
  }}
/>
```

## Особенности
- Поддерживает русскую локализацию
- Автоматически сохраняет состояние при изменениях
- Восстанавливает позицию скролла для каждого файла
- Адаптивный дизайн с ResizeObserver
- Интегрируется с кастомными диалогами
- Поддерживает мини-карту workspace
- Использует кастомную темную тему
- Ограничивает количество блоков (800)
- Поддерживает зум и сетку

## Стилизация
- Темная тема с кастомными цветами
- Адаптивные размеры контейнера
- Кастомные стили для блоков
- Интеграция с общим дизайном приложения

## Производительность
- Мемоизация функции сохранения
- Оптимизированная обработка событий
- Автоматическая очистка слушателей
- Эффективное управление жизненным циклом workspace

## Обработка ошибок
- Проверка существования workspace перед операциями
- Graceful fallback при ошибках загрузки
- Безопасное удаление слушателей событий
- Обработка ошибок при работе с переменными 