# App

## Назначение
App является корневым компонентом приложения, который инициализирует все необходимые контексты и создает основную структуру интерфейса. Объединяет все основные компоненты в единое приложение.

## Контексты 
- `FileProvider` — провайдер контекста файлов
- `ModalProvider` — провайдер контекста модальных окон

## Используемые компоненты
- `Layout` из Ant Design — основной контейнер приложения
- `TitleBar` — заголовок приложения с меню
- `MenuBar` — панель меню (Файл, Подключение)
- `BlockPanel` — панель с категориями и рабочей областью
- `CustomInputDialog` — кастомный диалог ввода


## Структура компонента
```jsx
<FileProvider>
  <Layout>
    <TitleBar>
      <MenuBar title="Файл" flag="1" />
      <MenuBar title="Подключение" flag="3" />
    </TitleBar>
    <ModalProvider>
      <BlockPanel />
      <CustomInputDialog />
    </ModalProvider>
  </Layout>
</FileProvider>
```
