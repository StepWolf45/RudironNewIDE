# FileTab

## Назначение
FileTab отвечает за отображение и управление вкладками файлов в приложении. Позволяет пользователям переключаться между открытыми файлами, создавать новые файлы и закрывать существующие. Каждая вкладка содержит свой собственный Blockly workspace с независимым состоянием. Обеспечивает seamless переключение между файлами с сохранением позиций скролла и состояний workspace.

## Основные переменные состояния

| Переменная      | Тип      | Описание                                                        |
|-----------------|----------|-----------------------------------------------------------------|
| tabTitles       | object   | Объект с заголовками вкладок `{fileId: title}`                  |

## Контексты (useContext)
- `FileContext` — используется для управления файлами, вкладками и workspace'ами

## Хуки
- `useState` — для управления заголовками вкладок
- `useMemo` — для мемоизации workspaceStates
- `useEffect` —

  **Обработка событий Electron**
   ```javascript
   useEffect(() => {
     if (window.electronAPI) {
       const handleFileSaved = (event, filePath) => {
         // Обновление заголовка вкладки при сохранении
         setTabTitles(prev => ({
           ...prev,
           [activeFileId]: path.basename(filePath, '.json')
         }));
       };

       window.electronAPI.on('file-saved', handleFileSaved);
       return () => window.electronAPI.removeListener('file-saved', handleFileSaved);
     }
   }, [activeFileId]);
   ```
   - Слушает события сохранения файлов от Electron
   - Обновляет заголовки вкладок при сохранении
   - Очищает слушатели при размонтировании

  **Мемоизация workspaceStates**
   ```javascript
   const workspaceStates = useMemo(() => {
     const states = {};
     files.forEach(file => {
       states[file.id] = file.workspaceXml || null;
     });
     return states;
   }, [files]);
   ```
   - Оптимизирует производительность при переключении вкладок
   - Создает объект состояний workspace для каждого файла
   - Пересчитывается только при изменении списка файлов
- `useContext` — для доступа к FileContext

## Методы управления

| Метод        | Аргументы         | Возвращаемое значение | Описание                                                        |
|--------------|-------------------|----------------------|-----------------------------------------------------------------|
| handleClose  | id (number)       | void                 | Закрывает файл через Electron API и FileContext                |

## Используемые компоненты
- `Tabs` из Ant Design — контейнер вкладок
- `TabPane` из Ant Design — отдельная вкладка
- `BlocklyWorkspace` — рабочая область Blockly для каждого файла

## Структура компонента
```jsx
<div className="file-panel">
  <Tabs
    type="editable-card"
    activeKey={activeFileId?.toString()}
    onChange={handleTabChange}
    onEdit={handleTabEdit}
  >
    {files.map((file) => (
      <TabPane
        key={file.id}
        tab={tabTitles[file.id] || `Файл ${file.id}`}
        closable={files.length > 1}
      >
        <div className="tab-content">
          <BlocklyWorkspace
            initialXml={workspaceStates[file.id]}
            onWorkspaceMount={(workspace) => handleWorkspaceMount(file.id, workspace)}
          />
        </div>
      </TabPane>
    ))}
    <TabPane tab="+" key="add" closable={false} />
  </Tabs>
</div>
```

## События Electron
Компонент обрабатывает следующие события Electron:
- `file-saved` — обновляет заголовок вкладки при сохранении файла
- `close-file` — отправляет событие закрытия файла в основной процесс

## Интеграция с FileContext

### Получаемые данные:
- `files` — массив всех открытых файлов
- `activeFileId` — ID активного файла
- `workspaceStates` — состояния workspace'ов
- `handleCreateNewFile` — функция создания нового файла
- `handleCloseFile` — функция закрытия файла
- `handleTabChange` — функция переключения вкладок
- `handleWorkspaceMount` — функция регистрации workspace

### Отправляемые данные:
- `setActiveFileId` — установка активного файла
- `setCurrentFilePath` — обновление текущего пути файла

## Обработчики событий

### handleTabChange
```javascript
const handleTabChange = (activeKey) => {
  if (activeKey === 'add') {
    handleCreateNewFile();
  } else {
    setActiveFileId(parseInt(activeKey));
  }
};
```
- Обрабатывает переключение между вкладками
- Создает новый файл при клике на вкладку "add"
- Устанавливает активный файл при переключении

### handleTabEdit
```javascript
const handleTabEdit = (targetKey, action) => {
  if (action === 'remove') {
    handleClose(parseInt(targetKey));
  }
};
```
- Обрабатывает закрытие вкладок
- Вызывает функцию закрытия файла через FileContext

## Пример использования
```javascript
import FileTab from '../FileTab/FileTab';

// В родительском компоненте
<FileTab />
```

