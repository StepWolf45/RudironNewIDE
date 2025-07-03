# MenuBar

## Назначение
MenuBar предоставляет панель меню для управления файлами и подключениями в приложении. Интегрируется с Electron API для работы с файловой системой и поддерживает различные типы меню (Файл, Подключение). Обрабатывает создание, открытие, сохранение файлов и управление серийными портами. Обеспечивает единообразный интерфейс для всех операций с файлами и подключениями.

## Основные переменные состояния

| Переменная      | Тип      | Описание                                                        |
|-----------------|----------|-----------------------------------------------------------------|
| serialPorts     | array    | Массив доступных серийных портов                               |

## Контексты (useContext)
- `FileContext` — для управления файлами и workspace'ами

## Хуки
- `useState` — для управления списком серийных портов
- `useRef` — для ссылки на скрытый input файла
- `useEffect` — для инициализации и обновления списка серийных портов:
    ```javascript
    useEffect(() => {
      if (flag === "3") {
        fetchDevices();
      }
    }, [flag]);
    ```

    - Срабатывает при изменении флага типа меню
    - Автоматически загружает список портов для меню подключения
    - Вызывает fetchDevices только для меню подключения (flag="3")
- `useContext` — для доступа к FileContext


## Props

| Prop            | Тип      | Описание                                                        |
|-----------------|----------|-----------------------------------------------------------------|
| title           | string   | Заголовок меню (например, "Файл", "Подключение")              |
| flag            | string   | Флаг для определения типа меню ("1" - файл, "3" - подключение) |

## Используемые компоненты
- `Dropdown` из Ant Design — выпадающее меню
- `Button` из Ant Design — кнопка меню
- `Space` из Ant Design — контейнер для элементов
- `Checkbox` из Ant Design — чекбоксы для портов

## Структура компонента
```jsx
<div>
  <Space>
    <Dropdown menu={{ items, onClick: handleMenuClick }}>
      <Button icon={iconbutton}>{title}</Button>
    </Dropdown>
  </Space>
  <input 
    type="file" 
    ref={fileInputRef} 
    style={{ display: 'none' }} 
    accept=".json"
    onChange={handleFileSelect}
  />
</div>
```

## Типы меню

### Файловое меню 
```javascript
const MenuItem1 = [
  { key: 'new', label: 'Новый файл', icon: <PlusOutlined /> },
  { key: 'open', label: 'Открыть файл', icon: <FolderOpenOutlined /> },
  { key: 'save', label: 'Сохранить', icon: <SaveOutlined /> },
  { key: 'saveAs', label: 'Сохранить Как', icon: <SaveOutlined /> }
];
```

### Меню подключения
```javascript
const connectionMenu = [
  {
    key: '1',
    label: 'Порт',
    icon: <UsbOutlined />,
    children: serialPorts.length > 0 
      ? serialPorts.map(port => ({
          key: port.path,
          label: (
            <Checkbox 
              checked={port.isConnected}
              onChange={(e) => handlePortToggle(port.path, e.checked)}
            >
              {port.path} - {port.manufacturer || 'Unknown'}
            </Checkbox>
          )
        }))
      : [{ key: 'no-devices', label: 'Нет подключенных плат', disabled: true }]
  },
  {
    key: '2',
    label: 'Обновить',
    icon: <ReloadOutlined />
  }
];
```

## Методы управления

| Метод            | Аргументы         | Возвращаемое значение | Описание                                                        |
|------------------|-------------------|----------------------|-----------------------------------------------------------------|
| handleMenuClick  | e (event)         | void                 | Обрабатывает клики по пунктам меню                             |
| handleSave       | -                 | void                 | Сохраняет текущий файл                                          |
| handleSaveAs     | -                 | void                 | Сохраняет файл как новый                                        |
| handleFileSelect | event             | void                 | Обрабатывает выбор файла через input                           |
| fetchDevices     | -                 | Promise void         | Получает список серийных портов                                |
| handlePortToggle | path, isConnected | void                 | Обрабатывает подключение/отключение порта                      |

## Обработчики событий

### handleMenuClick
```javascript
const handleMenuClick = (e) => {
  switch (e.key) {
    case 'new':
      window.electronAPI?.send('new-file');
      break;
    case 'open':
      fileInputRef.current?.click();
      break;
    case 'save':
      handleSave();
      break;
    case 'saveAs':
      handleSaveAs();
      break;
    case '2': // Обновить порты
      fetchDevices();
      break;
  }
};
```
- Обрабатывает все клики по пунктам меню
- Вызывает соответствующие функции в зависимости от выбранного пункта
- Интегрируется с Electron API для файловых операций

### handleFileSelect
```javascript
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);
        window.electronAPI?.send('file-opened', file.path, content);
      } catch (error) {
        console.error('Ошибка чтения файла:', error);
      }
    };
    reader.readAsText(file);
  }
  event.target.value = ''; // Очищаем input
};
```
- Обрабатывает выбор файла через скрытый input
- Валидирует тип файла (.json)
- Читает содержимое файла и отправляет в Electron
- Очищает input после использования

## Интеграция с Electron

### События отправляемые в Electron:
- `new-file` — создание нового файла
- `save-file` — сохранение файла
- `save-file-as` — сохранение файла как
- `file-opened` — файл открыт
- `connectSerialDevice` — подключение к серийному порту

### События получаемые от Electron:
- `getSerialDevices` — получение списка портов
