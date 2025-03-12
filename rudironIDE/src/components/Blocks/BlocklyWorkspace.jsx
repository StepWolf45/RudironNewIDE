import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly'; // Импортируем Blockly как объект
import 'blockly/blocks';
import 'blockly/javascript';

const BlocklyEditor = () => {
  const blocklyDiv = useRef(null);

  useEffect(() => {
    // Инициализация Blockly
    if (blocklyDiv.current) {
      Blockly.inject(blocklyDiv.current, {
        renderer: 'zelos', 
        toolbox: `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="math_number"></block>
            <block type="text"></block>
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

// import { useEffect, useRef } from 'react';
// import * as Blockly from 'blockly';

// export default function WorkspacePanel({ toolboxId }) {
//   const workspaceRef = useRef(null);

//   useEffect(() => {
//     if (!workspaceRef.current) return;

//     const workspace = Blockly.inject(workspaceRef.current, {
//       toolbox: document.getElementById(toolboxId), // Связь через ID
//       scrollbars: true,
//       trashcan: true
//     });

//     return () => workspace.dispose();
//   }, [toolboxId]);

//   return <div ref={workspaceRef} style={{ height: '100vh', width: '100vw' }}/>;
// }