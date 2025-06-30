# FileContext

## Назначение
FileContext предоставляет глобальное состояние для управления файлами, вкладками, рабочими пространствами Blockly и позициями скролла. Является центральным контекстом для всей системы управления файлами в приложении.

## Основные переменные состояния

| Переменная         | Тип     | Описание                                                    |
|--------------------|---------|-------------------------------------------------------------|
| files              | array   | Массив всех открытых файлов                                 |
| activeFileId       | number  | ID активного файла                                          |
| blocklyWorkspaces  | object  | Объект с workspace'ами Blockly для каждого файла           |
| workspaceStates    | object  | Состояния workspace'ов для каждого файла (для localStorage)|
| filePaths          | object  | Пути к файлам в памяти                                      |
| currentFilePath    | string  | Текущий путь активного файла                                |
| activeCategory     | object  | Активная категория блоков                                   |
| scrollPositions    | object  | Позиции скролла для каждого файла                           |

## Контексты (useContext)
Не использует другие контексты, является корневым контекстом.

## Хуки
- `useState` — для управления всеми состояниями файлов и workspace'ов
- `useCallback` — для мемоизации функций обработки файлов
- `useEffect` — не используется в этом контексте
- `useRef` — не используется в этом контексте

## Методы управления файлами

| Метод                    | Аргументы                    | Возвращаемое значение | Описание                                                    |
|--------------------------|------------------------------|----------------------|-------------------------------------------------------------|
| handleCreateNewFile      | -                            | void                 | Создает новый файл с уникальным именем                      |
| handleOpenFile           | fileContent, fileName, filePath | void              | Открывает существующий файл                                 |
| handleSaveFile           | fileId, workspaceState       | void                 | Сохраняет состояние workspace файла                         |
| handleCloseFile          | id                           | void                 | Закрывает файл и переключает на другой                     |
| handleTabChange          | newActiveFileId              | void                 | Переключает активный файл с сохранением скролла             |
| handleWorkspaceMount     | fileId, workspace            | void                 | Регистрирует workspace для файла                           |
| saveCurrentScrollPosition| -                            | void                 | Сохраняет позицию скролла активного файла                   |

## Вспомогательные функции

### saveCurrentScrollPosition()
Сохраняет текущую позицию скролла активного файла в состоянии `scrollPositions`.

**Использование:**
```javascript
saveCurrentScrollPosition();
```

**Вызывается в:**
- `handleCreateNewFile()` - перед созданием нового файла
- `handleOpenFile()` - перед открытием файла
- `handleCloseFile()` - перед закрытием файла
- `handleTabChange()` - перед переключением файла

## Структура данных

### files (array)
```javascript
[
  {
    id: number,        // Уникальный ID файла
    name: string,      // Имя файла
    content: object    // Содержимое файла (может быть null)
  }
]
```

### blocklyWorkspaces (object)
```javascript
{
  [fileId]: Blockly.Workspace  // Workspace для каждого файла
}
```

### workspaceStates (object)
```javascript
{
  [fileId]: object  // Сериализованное состояние workspace
}
```

### scrollPositions (object)
```javascript
{
  [fileId]: {
    x: number,  // Позиция скролла по X
    y: number   // Позиция скролла по Y
  }
}
```

## Пример использования
```javascript
import { FileContext } from '../../contexts/FileContext';

const MyComponent = () => {
  const { 
    files, 
    activeFileId, 
    handleCreateNewFile, 
    handleTabChange 
  } = useContext(FileContext);

  return (
    <div>
      <button onClick={handleCreateNewFile}>Новый файл</button>
      {files.map(file => (
        <div key={file.id} onClick={() => handleTabChange(file.id)}>
          {file.name}
        </div>
      ))}
    </div>
  );
};
```

## Особенности
- Автоматически генерирует уникальные имена для новых файлов
- Сохраняет позиции скролла для каждого файла
- Управляет жизненным циклом workspace'ов Blockly
- Интегрируется с Electron для сохранения файлов
- Поддерживает множественные вкладки файлов
- Автоматически переключает активный файл при закрытии текущего 