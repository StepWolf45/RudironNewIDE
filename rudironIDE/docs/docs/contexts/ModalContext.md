# ModalContext

## Назначение
ModalContext предоставляет глобальное состояние для управления модальными окнами и диалогами в приложении. Основная функция - управление кастомным диалогом ввода для блоков переменных в Blockly.

## Основные переменные состояния

| Переменная         | Тип     | Описание                                                    |
|--------------------|---------|-------------------------------------------------------------|
| isInputDialogVisible | boolean | Видимость диалога ввода                                     |
| inputDialogOptions | object  | Опции диалога ввода (заголовок, значение по умолчанию)     |
| inputDialogCallbacks | useRef  | Колбэки для обработки OK/Cancel действий                    |

## Хуки
- `useState` — для управления состоянием диалога
- `useCallback` — для мемоизации функций показа диалога
- `useEffect` — для регистрации глобальной функции в window
- `useRef` — для хранения колбэков диалога

## Методы управления диалогами

| Метод                    | Аргументы                    | Возвращаемое значение | Описание                                                    |
|--------------------------|------------------------------|----------------------|-------------------------------------------------------------|
| showInputDialogReact     | options (object)             | void                 | Показывает диалог ввода с заданными опциями                 |
| handleInputDialogOk      | value (string)               | void                 | Обрабатывает подтверждение диалога                          |
| handleInputDialogCancel  | -                            | void                 | Обрабатывает отмену диалога                                 |

## Структура данных

### inputDialogOptions (object)
```javascript
{
  title: string,        // Заголовок диалога
  defaultValue: string  // Значение по умолчанию
}
```

### inputDialogCallbacks (useRef)
```javascript
{
  onOk: function,       // Колбэк для подтверждения
  onCancel: function    // Колбэк для отмены
}
```


## Интеграция с Blockly

Контекст интегрируется с Blockly через глобальную функцию `window.showInputDialogReact`, которая заменяет стандартный `Blockly.dialog.setPrompt()`.

**Регистрация в useEffect:**
```javascript
useEffect(() => {
  window.showInputDialogReact = showInputDialogReact;
  return () => {
    delete window.showInputDialogReact;
  };
}, [showInputDialogReact]);
```

## Пример использования
```javascript
import { ModalContext } from '../../contexts/ModalContext';

const MyComponent = () => {
  const { 
    isInputDialogVisible, 
    inputDialogOptions, 
    handleInputDialogOk, 
    handleInputDialogCancel 
  } = useContext(ModalContext);

  const showDialog = () => {
    showInputDialogReact({
      title: 'Введите значение',
      defaultValue: '',
      onOk: (value) => console.log('Введено:', value),
      onCancel: () => console.log('Отменено')
    });
  };

  return (
    <div>
      <button onClick={showDialog}>Показать диалог</button>
      {isInputDialogVisible && (
        <div>
          <h3>{inputDialogOptions.title}</h3>
          <input defaultValue={inputDialogOptions.defaultValue} />
          <button onClick={() => handleInputDialogOk('value')}>OK</button>
          <button onClick={handleInputDialogCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
};
```