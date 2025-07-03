# CustomInputDialog

## Назначение
CustomInputDialog предоставляет кастомный диалог ввода для замены стандартных диалогов Blockly. Используется для ввода имен переменных и других значений в блоки. Интегрируется с ModalContext для управления состоянием и колбэками. Обеспечивает единообразный пользовательский интерфейс для всех диалогов ввода в приложении.

## Контексты (useContext)
- `ModalContext` — для управления состоянием диалога и колбэками
### Получаемые данные:
- `isInputDialogVisible` — видимость диалога
- `inputDialogOptions` — опции диалога (заголовок, значение по умолчанию)
- `handleInputDialogOk` — обработчик подтверждения
- `handleInputDialogCancel` — обработчик отмены

### Структура inputDialogOptions:
```javascript
{
  title: string,        // Заголовок диалога
  defaultValue: string, // Значение по умолчанию
  onOk: function,       // Колбэк при подтверждении
  onCancel: function    // Колбэк при отмене
}
```

## Хуки
- `useContext` — для доступа к ModalContext
- `useRef` — для ссылки на поле ввода (inputRef)
- `useEffect` — для управления фокусом

  ```javascript
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [visible]);
  ```

  - Срабатывает при изменении видимости диалога
  - Автоматически устанавливает фокус на поле ввода
  - Выделяет текст в поле для удобства редактирования


## Используемые компоненты
- `Modal` из Ant Design — основной диалог
- `Input` из Ant Design — поле ввода
- `Button` из Ant Design — кнопки OK/Cancel

## Структура компонента
```jsx
<Modal
  title={title}
  open={visible}
  onOk={handleOk}
  onCancel={handleCancel}
  okText="OK"
  cancelText="Отмена"
  destroyOnClose
>
  <Input
    ref={inputRef}
    defaultValue={defaultValue}
    onPressEnter={handleOk}
    autoFocus
    placeholder="Введите значение"
  />
</Modal>
```

## Обработчики событий

### handleOk
```javascript
const handleOk = () => {
  const value = inputRef.current?.input?.value || defaultValue;
  handleInputDialogOk(value);
};
```
- Получает текущее значение из поля ввода
- Вызывает колбэк подтверждения с передачей значения
- Использует значение по умолчанию при пустом поле

### handleCancel
```javascript
const handleCancel = () => {
  handleInputDialogCancel(defaultValue);
};
```
- Вызывает колбэк отмены с передачей значения по умолчанию
- Закрывает диалог без сохранения изменений

## Пример использования
```jsx
// В родительском компоненте
<CustomInputDialog />

// Через ModalContext
showInputDialog({
  title: "Введите имя переменной",
  defaultValue: "myVariable",
  onOk: (value) => console.log("Подтверждено:", value),
  onCancel: (value) => console.log("Отменено:", value)
});
```

## Безопасность
- Валидация введенных значений
- Безопасная обработка пустых значений
- Защита от XSS через Ant Design компоненты
- Санитизация введенных данных

