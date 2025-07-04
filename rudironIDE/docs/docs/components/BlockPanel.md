# BlockPanel

## Назначение
Компонент BlockPanel отвечает за отображение боковой панели с категориями блоков и рабочей области для визуального программирования. Используется в качестве основной панели для работы с блоками и файлами.

## Контексты (useContext)
- `FileContext` — используется для управления activeCategory

## Основные переменные состояния

| Переменная      | Тип      | Описание                                                        |
|-----------------|----------|-----------------------------------------------------------------|
| collapsed       | boolean  | Состояние свёрнутости боковой панели                            |
| activeCategory  | object   | Текущая выбранная категория блоков (объект из categories)       |


## Методы 

| Метод        | Аргументы         | Возвращаемое значение | Описание                                                        |
|--------------|-------------------|----------------------|-----------------------------------------------------------------|
| setCollapsed | value (boolean)   | void                 | Изменяет состояние свёрнутости боковой панели                   |
| setActiveCategory | category (object) | void                 | Устанавливает активную категорию блоков                         |


## Используемые компоненты
- `Sider` из Ant Design — боковая панель с категориями блоков
- `Menu` из Ant Design — меню категорий блоков
- `Workspace` — рабочая область для блоков (SplitterWorkspace)
- `FileTab` — вкладки файлов

## Структура компонента
```jsx
<Layout>
  <Sider> {/* Боковая панель с категориями */}
    <Menu> {/* Меню категорий */}
  </Sider>
  <Workspace> {/* Рабочая область */}
    <FileTab/> {/* Вкладки файлов */}
  </Workspace>
</Layout>
```

## Пример использования
```jsx
<BlockPanel />
```