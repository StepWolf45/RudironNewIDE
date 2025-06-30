# BoardVisualization

Компонент для визуализации платы. Компонент находится в `./src/components/BoardVisualization`.

Файлы:

```
BoardSVG.jsx - модифицированный SVG файл с платой
BoardVisualization.css - css для визуализации платы
BoardVisualization.jsx - логика компонента
```

## BoardSVG.jsx
Для каждого пина на плате, в поле `fill` (отвечающим за цвет картинки с пином) указывается соответствующий ключ из словаря pins, который описывает состояние пинов. Например:

```svg
<path d="M76.1175 148.754C79.0676 148.754 81.4591 146.363 81.4591 143.415C81.4591 140.466 79.0676 138.075 76.1175 138.075C73.1674 138.075 70.7759 140.466 70.7759 143.415C70.7759 146.363 73.1674 148.754 76.1175 148.754Z" fill={pins._11} />
<path d="M76.1175 146.529C77.8384 146.529 79.2334 145.135 79.2334 143.415C79.2334 141.694 77.8384 140.3 76.1175 140.3C74.3966 140.3 73.0016 141.694 73.0016 143.415C73.0016 145.135 74.3966 146.529 76.1175 146.529Z" fill={pins._11} />
```

Для аналоговых пинов, чья визуализация заключается в отображении цифрового значения (0-255) рядом с пином добавлены текстовые поля, значения для которых берётся из `pwm`:

```svg
<text x="10%" y="26%" font-size="8" fill="white" text-anchor="middle">
    {pwm._12}
</text>
<text x="10%" y="28.9%" font-size="8" fill="white" text-anchor="middle">
    {pwm._8}
</text>

<text x="24%" y="70.3%" font-size="8" fill="white" text-anchor="middle">
    {pwm._7}
</text>
```

## BoardVisualization.jsx

Для обновления визуализации платы необходимо изменять pins и pwm, привязанные как State к CSS компоненту платы. Для изменения состояния пинов вызываются `setDigitalPins` и `setAnalogPin`. Их обработка идёт в useEffect:

```ts
useEffect(() => {
        window.visualization_api.setDigitalPin((event, data) => {
            Object.keys(data.map).forEach(key => {
                handleColorChange(key, data.map[key]);
              });
        });
        window.visualization_api.setAnalogPin((event, data) => {
            setPwm(data.map);
        });
      }, []);
```

Так же для масштабирования картинки платы внутри окна визуализации есть следующие функции:

```ts
centerContent() // центрирование платы в блоке с минимальным масштабом
checkContentVisibility() // проверка, видна ли картинка платы внутри блока с текущим масштабом, сдвигом
```
`updateMinScale` внтури useEffect масштабирует плату так, чтобы при изменении размера контейнера/блока для визуализации плата занимала максимальное место.

Следующие функции обрабатывают взаимодействие мышки с контейнером:

```ts
handleWheel()
handleMouseDown()
handleMouseUp()
handleMouseMove()
```
