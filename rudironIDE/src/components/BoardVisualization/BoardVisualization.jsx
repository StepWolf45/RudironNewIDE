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
    const [minScale, setMinScale] = useState(0.5);
    const [isContentVisible, setIsContentVisible] = useState(true);

    // Функция для центрирования содержимого с минимальным масштабом
    const centerContent = () => {
        if (boardRef.current) {
            const containerWidth = boardRef.current.clientWidth;
            const containerHeight = boardRef.current.clientHeight;
            
            // Получаем размеры содержимого (BoardSVG)
            const content = boardRef.current.querySelector('.board-content');
            if (content) {
                const contentRect = content.getBoundingClientRect();
                const contentWidth = contentRect.width / transform.scale; // Реальная ширина без масштаба
                const contentHeight = contentRect.height / transform.scale; // Реальная высота без масштаба
                
                // Вычисляем позицию для центрирования
                const centerX = (containerWidth - contentWidth * minScale) / 2;
                const centerY = (containerHeight - contentHeight * minScale) / 2;
                
                setTransform({
                    scale: minScale,
                    x: centerX,
                    y: centerY
                });
            } else {
                // Fallback если не удалось получить размеры содержимого
                setTransform({
                    scale: minScale,
                    x: containerWidth / 2,
                    y: containerHeight / 2
                });
            }
        }
    };

    // Функция для проверки видимости содержимого
    const checkContentVisibility = () => {
        if (boardRef.current) {
            const container = boardRef.current;
            const content = container.querySelector('.board-content');
            
            if (content) {
                const containerRect = container.getBoundingClientRect();
                const contentRect = content.getBoundingClientRect();
                
                // Проверяем, видно ли содержимое в контейнере
                const isVisible = !(
                    contentRect.right < containerRect.left ||
                    contentRect.left > containerRect.right ||
                    contentRect.bottom < containerRect.top ||
                    contentRect.top > containerRect.bottom
                );
                
                setIsContentVisible(isVisible);
            }
        }
    };

    // Рассчитываем минимальный масштаб при изменении размеров контейнера
    useEffect(() => {
        const updateMinScale = () => {
            if (boardRef.current) {
                const containerWidth = boardRef.current.clientWidth;
                const containerHeight = boardRef.current.clientHeight;

                // Минимальный масштаб, чтобы плата не была меньше 70% от ширины контейнера
                const newMinScale = 0.7;

                setMinScale(newMinScale);

                if (transform.scale < newMinScale) {
                    setTransform(prev => ({
                        ...prev,
                        scale: newMinScale,
                        x: containerWidth / 2 - (containerWidth / 2 - prev.x) * (newMinScale / prev.scale),
                        y: containerHeight / 2 - (containerHeight / 2 - prev.y) * (newMinScale / prev.scale)
                    }));
                }
            }
        };

        updateMinScale();
        window.addEventListener('resize', updateMinScale);

        return () => {
            window.removeEventListener('resize', updateMinScale);
        };
    }, []);

    // Проверяем видимость содержимого при изменении transform
    useEffect(() => {
        checkContentVisibility();
    }, [transform]);

    const handleWheel = (e) => {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(
            Math.max(transform.scale * delta, minScale), // Минимальный масштаб зависит от контейнера
            3 // Максимальный масштаб
        );
        
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

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setStartPos({
            x: e.clientX - transform.x,
            y: e.clientY - transform.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setTransform({
            ...transform,
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
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
                className="board-content"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                }}
            >
                <BoardSVG pins={pins} pwm={pwmPins} />
            </div>
            
            {/* Кнопка "Вернуть в центр" */}
            {!isContentVisible && (
                <button
                    className="center-button"
                    onClick={centerContent}
                    title="Вернуть плату в центр"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            )}
        </div>
    );
}

export default BoardVisualization;