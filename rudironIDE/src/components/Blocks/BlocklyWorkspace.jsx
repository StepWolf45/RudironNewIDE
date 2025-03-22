import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly'; // Импортируем Blockly как объект
import 'blockly/blocks';
import 'blockly/javascript';
import './BlocklyWorkspace.css'
// import 'blockly/msg/ru'; 



const BlocklyEditor = () => {
  const blocklyDiv = useRef(null);

  useEffect(() => {
    // Инициализация Blockly
    // if (Blockly.Msg && Blockly.Msg.ru) {
    //   Blockly.setLocale(Blockly.Msg.ru);
    // } else {
    //   console.error('Локализация не загружена!');
    //   return;
    // }

    if (blocklyDiv.current) {
      Blockly.inject(blocklyDiv.current, {
        renderer: 'zelos', 
        scrollbars: true,
        trashcan: true,
        zoom:
        {controls: true,
         wheel: true,
         startScale: 1.0,
         maxScale: 3,
         minScale: 0.3,
         scaleSpeed: 1.2,
         pinch: true},
        toolbox: `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_boolean"></block>

          </xml>
        `
      });
    }


  }, []);

  return (
    <div
      ref={blocklyDiv}
      style={{ height: '100vh', width: '100vw' }}
    >
    </div>
  );
};

export default BlocklyEditor;

