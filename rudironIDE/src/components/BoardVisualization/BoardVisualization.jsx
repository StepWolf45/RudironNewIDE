import React, { useRef, useEffect, useState } from 'react'
import BoardSVG from './BoardSVG';

const BoardVisualization = props => {
    let color = "red";
    let color2 = "red";

    const handleColorChange = (key, value) => {
        setPins((prevColors) => ({ ...prevColors, [key]: value }));
    };


    // All pins described
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
        _12: 255,
        _8: 255,
        _7: 255,
        _5: 255,
        _33: 255,
        _28: 255,
        _20: 255,
        _29: 255,
        _23: 255


    })

    useEffect(() => {
        // Some demo pin control only front

        const interval = setInterval(() => {
            handleColorChange("_4", color)
            handleColorChange("_6", color)
            handleColorChange("_7", color)
            handleColorChange("_SDB", color)
            handleColorChange("_12", color)
            if (color == "red") color = "green"
            else color = "red"
        }, 500);

        const interval2 = setInterval(() => {
            handleColorChange("_17", color2)

            if (color2 == "red") color2 = "green"
            else color2 = "red"
        }, 100);

        return () => {clearInterval(interval), clearInterval(interval2)};
    }, [])

    return (
        <BoardSVG pins={pins} pwm={pwmPins} />
    );
}

export default BoardVisualization