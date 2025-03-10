// import { useEffect, useRef } from "react";
// import { inject, Themes } from "blockly";
// import { javascriptGenerator } from "blockly/javascript";

// // Правильные пути для стилей в Blockly v10+
// import "blockly/core.css";
// import "blockly/theme/modern.css"; // Или другая тема

// const BlocklyWorkspace = ({ onCodeGenerated }) => {
//   const blocklyDivRef = useRef(null);
//   const workspaceRef = useRef(null);

//   // Конфигурация панели инструментов
//   const toolbox = {
//     kind: 'categoryToolbox',
//     contents: [
//       {
//         kind: 'category',
//         name: 'Logic',
//         colour: '#5b80a5',
//         contents: [
//           { kind: 'block', type: 'controls_if' },
//           { kind: 'block', type: 'logic_compare' }
//         ]
//       },
//       {
//         kind: 'category',
//         name: 'Math',
//         colour: '#5ba55b',
//         contents: [
//           { kind: 'block', type: 'math_number' },
//           { kind: 'block', type: 'math_arithmetic' }
//         ]
//       }
//     ]
//   };

//   useEffect(() => {
//     if (!blocklyDivRef.current) return;

//     // Инициализация рабочей области
//     workspaceRef.current = inject(blocklyDivRef.current, {
//       toolbox: toolbox,
//       theme: Themes.Modern,
//       grid: {
//         spacing: 20,
//         length: 3,
//         colour: '#ddd',
//         snap: true
//       },
//       move: {
//         scrollbars: true,
//         drag: true,
//         wheel: true
//       },
//       trashcan: true
//     });

//     // Обработчик изменений
//     const changeListener = workspaceRef.current.addChangeListener(() => {
//       const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
//       onCodeGenerated?.(code);
//     });

//     return () => {
//       workspaceRef.current?.removeChangeListener(changeListener);
//       workspaceRef.current?.dispose();
//     };
//   }, []);

//   return (
//     <div
//       ref={blocklyDivRef}
//       style={{
//         height: '80vh',
//         width: '100%',
//         minHeight: '400px',
//         position: 'relative'
//       }}
//     />
//   );
// };

// export default BlocklyWorkspace;