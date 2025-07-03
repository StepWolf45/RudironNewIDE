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
  - `blocklyDiv` — ссылка на DOM-элемент, в который инициализируется Blockly (контейнер для визуального редактора).
  - `workspaceRef` — ссылка на текущий экземпляр Blockly.Workspace, чтобы обращаться к нему вне рендера.
  - `resizeObserverRef` — ссылка на экземпляр ResizeObserver для отслеживания изменений размеров контейнера.
- `useCallback` — для мемоизации функции сохранения
- `useEffect` — для инициализации, адаптивности и обработки событий (см. подробности ниже)
- `useContext` — для доступа к контекстам

## Описание useEffect

В компоненте используется несколько useEffect, каждый из которых выполняет отдельную задачу:

1. **Инициализация Blockly и workspace**

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
   - Срабатывает один раз при монтировании компонента.
   - Инициализирует Blockly, применяет тему, настраивает мини-карту, загружает начальное состояние, регистрирует обработчики событий и автосохранение.
   - Очищает workspace при размонтировании.

2. **Адаптивность (ResizeObserver)**
    ```javascript
    useEffect(() => {
        if (blocklyDiv.current) {
            resizeObserverRef.current = new ResizeObserver(entries => {
                const { width, height } = entries[0].contentRect;
                setContainerSize({ width, height });
                if (workspaceRef.current) {
                    Blockly.svgResize(workspaceRef.current); 

                }
            });
            resizeObserverRef.current.observe(blocklyDiv.current);
        }

        return () => {
            if (resizeObserverRef.current && blocklyDiv.current) {
                resizeObserverRef.current.unobserve(blocklyDiv.current);
            }
        };
    }, []);
    ```
   - Следит за изменением размеров контейнера blocklyDiv.
   - При изменении размеров вызывает Blockly.svgResize для корректного отображения.
   - Отключает наблюдатель при размонтировании.

3. **Смена категорий (toolbox)**
    ```javascript
    useEffect(() => {
        if (workspaceRef.current && activeCategory) {
            const newToolbox = Blockly.utils.xml.textToDom(activeCategory.toolboxXML);
            workspaceRef.current.updateToolbox(newToolbox);
        }
    }, [activeCategory]);
    ```
   - Обновляет тулбокс (набор блоков) при смене активной категории.
   - Позволяет динамически менять доступные блоки без перезагрузки workspace.

4. **Восстановление позиции скролла**

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

   - При переключении файлов восстанавливает позицию скролла workspace для каждого файла.
   - Если блоки уже загружены — позиция восстанавливается сразу, иначе — после события загрузки блоков.

5. **Замена стандартного prompt на кастомный диалог**

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
   - Заменяет стандартный prompt Blockly на кастомный React-модал для работы с переменными.
   - Обеспечивает более удобный и локализованный ввод имени переменной.
   - Очищает обработчик при размонтировании.
  




6. **Мемоизация функции сохранения**
   - useCallback используется для оптимизации функции сохранения состояния workspace.

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


## События и обработчики

### События workspace
- `Blockly.Events.VAR` — события переменных
- `Blockly.Events.FINISHED_LOADING` — завершение загрузки блоков
- Общие события изменений для автосохранения

### Обработчики
- `saveToStorage()` — сохранение состояния workspace
- `resizeObserver` — адаптивность при изменении размеров
- `changeListener` — обработка изменений для автосохранения


## Кастомная тема

В стандартной библиотеке есть несколько тем, которые можно использовать для изменения цветовой палитры блоков, однако кастомные блоки в них не включены, слодовательно для них есть CSS модификаторы.
```javascript
const customTheme = Blockly.Theme.defineTheme('myTheme', {
  'base': Blockly.Themes.Classic,
  'blockStyles': {
    'logic_blocks': { 'colourPrimary': '#5AC2A0' },
    'loop_blocks': { 'colourPrimary': '#EE7475' },
  },
  componentStyles: { 
    workspaceBackgroundColour: '#1F1F1F'
  }
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
