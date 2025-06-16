import React, { useRef, useEffect, useState } from 'react';
import BoardSVG from './BoardSVG';
import './BoardVisualization.css';

const BoardVisualization = props => {
    const boardRef = useRef(null);
    const [transform, setTransform] = useState({
        scale: 1,
        x: 0,
        y: 0
    });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Обработчики для масштабирования
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1; // Уменьшение или увеличение масштаба
        const newScale = Math.min(Math.max(transform.scale * delta, 0.5), 3); // Ограничиваем масштаб

        // Масштабируем относительно позиции курсора
        const rect = boardRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const x = offsetX - (offsetX - transform.x) * (newScale / transform.scale);
        const y = offsetY - (offsetY - transform.y) * (newScale / transform.scale);

        setTransform({
            scale: newScale,
            x,
            y
        });
    };

    // Обработчики для перемещения
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Только левая кнопка мыши
        setIsDragging(true);
        setStartPos({
            x: e.clientX - transform.x,
            y: e.clientY - transform.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const rect = boardRef.current.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;

        // Ограничиваем перемещение, чтобы видимая часть не составляла менее 10%
        const minVisibleWidth = containerWidth * 0.1;
        const minVisibleHeight = containerHeight * 0.1;

        const maxX = minVisibleWidth - containerWidth;
        const maxY = minVisibleHeight - containerHeight;

        const clampedX = Math.max(Math.min(newX, maxX), -maxX);
        const clampedY = Math.max(Math.min(newY, maxY), -maxY);

        setTransform({
            ...transform,
            x: clampedX,
            y: clampedY
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    let color = "red";
    let color2 = "red";

    const handleColorChange = (key, value) => {
        setPins((prevColors) => ({ ...prevColors, [key]: value }));
    };
    const handlePwm = (key, value) => {
        setPwm((prevColors) => ({ ...prevColors, [key]: value }));
    };

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

    const [pins, setPins] = useState({
        // Top left pins bank
        _11: "#E5C065",
        _13: "#E5C065",
        _15: "#E5C065",
        _17: "#E5C065",
        _8: "#E5C065",
        _12: "#E5C065",
        _14: "#E5C065",
        _16: "#E5C065",

        // Bottom left pins bank
        _1: "#E5C065",
        _3: "#E5C065",
        _5: "#E5C065",
        _7: "#E5C065",
        _0: "#E5C065",
        _2: "#E5C065",
        _4: "#E5C065",
        _6: "#E5C065",

        // Right topp bank
        _NWP: "#E5C065",
        _29: "#E5C065",
        _27: "#E5C065",
        _a4: "#E5C065",
        _a2: "#E5C065",
        _a0: "#E5C065",
        _19: "#E5C065",
        _30: "#E5C065",
        _28: "#E5C065",
        _a5: "#E5C065",
        _a3: "#E5C065",
        _a1: "#E5C065",
        _20: "#E5C065",
        _18: "#E5C065",

        // Right bottom bank
        _37: "#E5C065",
        _35: "#E5C065",
        _34: "#E5C065",
        _32: "#E5C065",
        _36: "#E5C065",
        _SDB: "#E5C065",
        _33: "#E5C065",
        _31: "#E5C065"
    });

    const [pwmPins, setPwm] = useState({
        _12: 0,
        _8:  0,
        _7:  0,
        _5:  0,
        _33: 0,
        _28: 0,
        _20: 0,
        _29: 0,
        _23: 0
    });

    return (
        <div
            ref={boardRef}
            className="board-container"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
        >
            <div
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                }}
            >
                <BoardSVG pins={pins} pwm={pwmPins} />
            </div>
        </div>
    );
}

export default BoardVisualization;