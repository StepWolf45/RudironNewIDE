# TitleBar

## Назначение
TitleBar является заголовочной панелью приложения, которая содержит меню и обеспечивает drag-функциональность для перемещения окна в Electron. Служит контейнером для MenuBar компонентов и предоставляет пользовательский интерфейс для управления приложением.

## Используемые компоненты
- `children` — дочерние компоненты (обычно MenuBar)
- CSS классы для стилизации

## Структура компонента
```javascript
<div className="title-bar">
  <div className="title-bar-content">
    {children}
  </div>
</div>
```

## Стилизация
Компонент использует следующие CSS классы:
- `.title-bar` — основной контейнер заголовка
- `.title-bar-content` — содержимое заголовка
- Кастомные стили для темной темы
- Стили для drag-функциональности

## Пример использования
```javascript
import TitleBar from './components/TitleBar/TitleBar';
import MenuBar from './components/MenuBar/MenuBar';

<TitleBar>
  <MenuBar title="Файл" flag="1" />
  <MenuBar title="Подключение" flag="3" />
</TitleBar>
```

