# SplitterWorkspace

## Назначение
SplitterWorkspace является контейнером для рабочей области, который обеспечивает адаптивную компоновку и управление размерами различных панелей в приложении. Служит оберткой для FileTab, OutputPanel, BoardVisualization.

## Props
Компонент принимает children как props для отображения дочерних компонентов.

## Используемые компоненты
- `Splitter` и `Splitter.Panel` из библиотеки Ant Design — для создания адаптивной разметки
- `children` — дочерние компоненты (обычно FileTab, монитор порта, визуализация платы)
- CSS классы для стилизации

## Структура компонента
```jsx
<Splitter className="splitter-workspace">
  <Splitter.Panel key="filetab" minSize={200} maxSize={400} collapsible>
    {/* Файловая навигация */} {children}
  </Splitter.Panel>
  <Splitter.Panel key="visualization" minSize={300} collapsible>
    {/* Визуализация платы */}
  </Splitter.Panel>
  <Splitter.Panel key="monitor" minSize={150} collapsible>
    {/* Монитор порта */}
  </Splitter.Panel>
</Splitter>
```

## Стилизация
Компонент использует следующие CSS классы:
- `.splitter-workspace` — основной контейнер рабочей области
- Кастомные стили для темной темы
- Стили для адаптивной компоновки

## Интеграция с системой компоновки
- Работает в связке с BlockPanel
- Поддерживает правильное позиционирование относительно Sider

## Использование Splitter.Panel

SplitterWorkspace использует три панели (`Splitter.Panel`) из библиотеки Ant Design. Каждая панель может иметь следующие свойства:
- `key` — уникальный идентификатор панели
- `minSize` — минимальный размер панели (в пикселях)
- `maxSize` — максимальный размер панели (опционально)
- `collapsible` — возможность сворачивать панель

