import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import * as Ru from 'blockly/msg/ru';
import 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
import './BlocklyWorkspace.css';
import './CustomBlocks.jsx';

const customTheme = Blockly.Theme.defineTheme('myTheme', {
  'base': Blockly.Themes.Classic,
  'blockStyles': {
    'logic_blocks': {
      'colourPrimary': '#5AC2A0',
      'colourTertiary': '#35AF87',
    },
    'loop_blocks': {
      'colourPrimary': '#EE7475',
      'colourTertiary': '#FFA8A8',
    }
  },
});

Blockly.setLocale(Ru);

const BlocklyWorkspace = ({ initialXml, onWorkspaceMount, activeCategory, onSave, key }) => { // Receive the key
    const blocklyDiv = useRef(null);
    const workspaceRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const resizeObserverRef = useRef(null);
    const [autoSave, setAutoSave] = useState(true);

    useEffect(() => {
      const workspace = Blockly.inject(blocklyDiv.current, {
        theme: customTheme,
        renderer: 'zelos',
        scrollbars: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.9,
          maxScale: 1.3,
          minScale: 0.5,
          scaleSpeed: 1.2,
          pinch: true
        },
        toolbox: activeCategory?.toolboxXML || ''
      });

        if (initialXml) {
          Blockly.serialization.workspaces.load(initialXml, workspace);
        }

        workspaceRef.current = workspace;
        onWorkspaceMount(workspace);

        workspace.addChangeListener((event) => {
            if (autoSave && !event.isUiEvent) {
              saveToStorage();
            }
          });

        return () => {
            workspace.dispose();
        };
    }, []);

    useEffect(() => {
      if (blocklyDiv.current) {
        resizeObserverRef.current = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          setContainerSize({ width, height });
          if (workspaceRef.current) {
            Blockly.svgResize(workspaceRef.current);
          }
        });
        resizeObserverRef.current.observe(blocklyDiv.current);
      }

      return () => {
        if (resizeObserverRef.current && blocklyDiv.current) {
          resizeObserverRef.current.unobserve(blocklyDiv.current);
        }
      };
    }, []);

    useEffect(() => {
        if (workspaceRef.current && activeCategory) {
            const newToolbox = Blockly.utils.xml.textToDom(activeCategory.toolboxXML);
            workspaceRef.current.updateToolbox(newToolbox);
        }
    }, [activeCategory]);

    const saveToStorage = useCallback(() => {
      if (workspaceRef.current) {
        const state = Blockly.serialization.workspaces.save(workspaceRef.current);
        onSave(workspaceRef.current);
      }
    }, [onSave]);

    return (
        <div id="blocklyContainer">
            <div ref={blocklyDiv} id="blocklyDiv" style={{ width: '100%', height: '100%' }} />
            {/* <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 999,
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
      }}>
            <label style={{ ...buttonStyle, background: autoSave ? '#4CAF50' : '#f44336' }}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Автосохранение
          </label>
        </div> */}
        </div>
    );
};
// const buttonStyle = {
//   padding: '10px 15px',
//   background: '#4CAF50',
//   color: 'white',
//   border: 'none',
//   borderRadius: '4px',
//   cursor: 'pointer',
//   fontSize: '14px',
//   fontWeight: '500',
//   display: 'flex',
//   alignItems: 'center',
//   boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
// };

export default BlocklyWorkspace;