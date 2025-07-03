# Описание файлов в директории electron

## queue.ts

Реализация очереди на TS. Методы:

```ts
enqueue(item) // добавить элемент
dequeue() // выбрать элемент
front() // получить крайний элемент очереди без его удаления
isEmpty() // проверка наличия элемента в очереди
size() // получить размер очереди
print() // вывести всю очередь
```

## protocol.ts

Набор готовых функций для работы с буферами протокола связи с платой. Функции:

### genNumberArgument

```ts
genNumberArgument(value) // принимает числовой аргумент
```

Генерирует буфер числового аргумента (с учётом двух байтов хэдера аргумента). Учитывет знак, буфер генерируется в представлении Little Endian. Полученный буфер можно сразу добавлять в пакет команды.


### genVarNameArgument

```ts
genVarNameArgument(value) // принимает строковой аргумент
```

Генерирует буфер аргумента с именем переменной. Используется, например в функции печати в сериал порт значения переменной. Результирующий буфер можно сразу добавлять в пакет команды.

### genStringArgument

```ts
genStringArgument(value) // генериурет аргумент из строки
```

Генерирует буфер строкового аргумента. Используется, например в функции печати заданного текста в сериал порт. Результирующий буфер можно сразу добавлять в пакет команды.

### bufferSize2

```ts
bufferSize2(buffer, subs) // buffer - буфер, subs - сколько вычесть из размера буфера (для игнорирования хэдер части)
```

Генерирует двух-байтовый буфер, являющийся числом, содержащим размер буфера (без учёт хэдера, размер которого задаётся аргументом subs)


### parsePinsByType

```ts
parsePinsByType(buffer, type) // type - тип пина
```

Из буфера main response, полученный от платы Рудирон после выполнения блока возвращает массив значений всех цифровых пинов (если аргумент type==0) или массив значений всех аналоговых пинов (если аргумент type==1). Эта функция применяется для визуализации состояния платы.

### printBuffer

```ts
printBuffer(buffer) // buffer - буффр
```

Utility функция, позволяющая печатать буфер в виде строки шестнадцатеричных чисел. Взависимости от места вызова печатает строку в терминал программы (electron процесс, т.е. nodejs) или Dev Tools внутри программы (внутри Electron кода или renderer'а).

## preload.ts

`logicalSyms` - трёхбайтовые структуры для всех операторов (логические и математические)

### generateExpressionBuffer

```ts
generateExpressionBuffer(bufferRes, value) // bufferRes - итоговый буфер, в который будут добавлены элементы, value - строка с логическим/математическим выражением (выражением из операторов и операндов)
```

Через объект `ipcRenderer` пробрасывается асинхронная функция отправки буфера с командой на плату и ожиданием пока, пакет будет доставлен, а так же прочитан полный ответ платы.

Функция: `ipcRenderer->writeSerialAndWait`.

Так же в React прорбрасывается объект `api.generators` через ipc, который позволяет генерировать итоговые команды для выполнения на плате (совсем финальные буферы, которые потом уже никак не изменяются).

Пример для генератора блока `if`:

```ts
while: (cond) => {
        let bufferRes = Buffer.from([0xFE, 0xDE, 0xFF, 0xFF, 0x2E, 0x01, 0x01]);
        bufferRes = generateExpressionBuffer(bufferRes, cond);
        printBuffer(bufferRes);
        let size = bufferSize2(bufferRes, 4)
        bufferRes[2] = size[1];
        bufferRes[3] = size[0];
        return bufferRes;
    },
```

Сначала указывается хэдер (без указания размера буфера - он добавится в конце). Далее генерируется буфер логического выражения из аргумента `cond`. И в конце в пакет вписывается размер буфера. Блоки while, if и другие конструкции имеют более сложный процесс исполнения, в отличии от, например IO блоков. Блоки-конструкции внутри себя содержат другие блоки, которые в зависимости от различных условий нужно последовательно выполнить (и даже несколько раз, если это for/while). Логика обработки таких блоков описыватеся в `BlockExecutor` (далее в документации [BLOCK_EXEC](BLOCK_EXEC.md)).

Ещё в React пробрасываются функции `setDigitalPin`, `setAnalogPin`, `board_connection`. Первыве две нужны для визуализации пинов на плате (соответственно обновляют отображение цифровых пинов и аналоговых). А последняя позволяет проверить соединение с платой.

## main.ts

### Конфигурационные переменные
```ts
const RUDIRON_VID = "1a86" // VID платы
const RUDIRON_PID = "55d4" // PID платы
const RUDIRON_BAUD = 115200 // Скорость связи (должна совпадать со скоростью на самой плате)

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']; // URL dev-сервера (vite)
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron'); // Путь к сборке Electron
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist'); // Путь к сборке renderer
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST; // Путь к публичным ресурсам
const store = new Store(); // electron-store для хранения путей файлов и настроек
let tray = null; // Иконка в трее
let win: BrowserWindow | null; // Главное окно приложения
let currentFilePaths: FilePaths = {}; // Словарь: fileId -> { path, isNew }
```

### IPC-хэндлеры

#### request-serial-devices
Ищет все Рудирон платы, подключенные к компьютеру. Проверка идёт по VID/PID. Возвращаются все tty (в случае с Linux) или COM (в случае с Windows) порты.

#### connect-serial-device
Осуществляется подключение к плате по указанному последовательному порту. Создаётся объект Serial, с корректной скоростью, порт переводится в Flow режим.

#### send-and-wait
Отправляет команду на плату (к каждому пакету добавляет TX сигнатуру, состояющую из 4-х байт: `0x72, 0x75, 0x06, 0x64`). После отправки ожидает `wait_packets_cnt` количество пакетов. 

В случае простых блоков (например IO) плата отвечает только main response (этот ответ есть всегда) - ответ со статусом выполнения блока и состоянием всех пинов.

Но например для блоков вывода данных в серийный порт требуется второй ответ, содержащий, например, текст для вывода в порт. Для таких блоков wait_packets_cnt необходимо выставлять равным 2.

#### save-file
Используется функция ***saveFile(fileId, fileData, filePath?)***. Сохраняет файл по указанному пути или по пути из currentFilePaths. Если путь не задан — вызывает saveFileAs.
```ts
ipcMain.on('save-file', (event, { fileId, fileData }) => {
    saveFile(fileId, fileData);
});
```

#### save-file-as
Используется функция ***saveFileAs(fileId, fileData)***.
Открывает диалоговое окно, сохраняет файл по выбранному пути, обновляет currentFilePaths и store.
```ts
ipcMain.on('save-file-as', (event, { fileId, fileData }) => {
    saveFileAs(fileId, fileData);
});
```

#### new-file
Регистрирует новый файл (без пути) в памяти приложения.
```ts
ipcMain.on('new-file', (event, fileId) => {
    currentFilePaths[fileId] = { path: null, isNew: true };
    store.set('currentFilePaths', currentFilePaths);
});
```

#### file-opened
Регистрирует открытие файла, сохраняет путь.
```ts
ipcMain.on('file-opened', (event, { fileId, filePath }) => {
    currentFilePaths[fileId] = { path: filePath, isNew: false };
    store.set('currentFilePaths', currentFilePaths);
});
```

#### close-file
Удаляет файл из памяти приложения (закрытие вкладки).
```ts
ipcMain.on('close-file', (event, fileId) => {
    delete currentFilePaths[fileId];
    store.set('currentFilePaths', currentFilePaths);
});
```

#### check_connected
Проверяет, подключена ли плата (возвращает состояние board_connected).
```ts
ipcMain.handle('check_connected', () => {
    return board_connected;
});
```

#### show-input-dialog
Показывает модальное окно для ввода значения (используется для пользовательских диалогов в интерфейсе).
```ts
ipcMain.handle('show-input-dialog', async (event, options) => {
    // ...
});
```

### Окно приложения и трэй
- Используется функция ***createWindow***. Создает главное окно приложения Electron с нужными параметрами, настраивает поведение окна, загружает страницу (dev-сервер или index.html), отправляет сообщения в renderer.
- Параметры окна:
  - backgroundColor, размеры, titleBarStyle для навигационных кнопок OC, иконка, preload-скрипты
- После загрузки отправляет сообщение в renderer: `win?.webContents.send('main-process-message', ...)`.
- При закрытии всех окон приложение завершает работу (кроме macOS)
- При активации (macOS) создаёт новое окно, если все закрыты
- Трэй создаётся при запуске приложения, использует иконку из public/logo.png

### Доп. используемые функции

#### sendCommand(command, wait_packets_cnt = 1)
Отправляет буфер по сериал порту и обрабатывает ответы платы. `Main response` парсится для визуализации состояния пинов, если `wait_packets_cnt > 1` функция продолжает ждать и набирать заданное количество ответных пакетов. Функция работает асинхронно, возвращая `Promise` с ответами платы.

---