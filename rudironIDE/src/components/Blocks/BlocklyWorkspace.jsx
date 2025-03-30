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

const BlocklyWorkspace = ({ initialXml, onWorkspaceMount, activeCategory, onSave }) => {
    const blocklyDiv = useRef(null);
    const workspaceRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const resizeObserverRef = useRef(null);
    const [autoSave, setAutoSave] = useState(true);

    useEffect(() => {
        // **Override Blockly.prompt using the prototype**
          Blockly.dialog.setPrompt((msg, defaultValue, callback) => {
            Blockly.Events.setGroup(true); // Начать группу событий
            
            window.electron.ipcRenderer.invoke('show-input-dialog', {
                title: msg,
                defaultValue: defaultValue,
            }).then(newValue => {
                callback(newValue !== undefined ? newValue : defaultValue);
                Blockly.Events.setGroup(false); // Завершить группу событий
            });
        });

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

        // Intercept variable renaming (Optional - redundant, but keeping it for safety)
        workspace.addChangeListener((event) => {
            if (event.type === Blockly.Events.VAR && event.name === 'rename') {
                event.preventDefault(); // Prevent the default alert (though it shouldn't be needed anymore)
            }

            if (autoSave && !event.isUiEvent) {
                saveToStorage();
            }
        });

        return () => {
            workspace.dispose();
        };
    }, [activeCategory]);

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

    useEffect(() => {
      Blockly.dialog.setPrompt((msg, defaultValue, callback) => {
          Blockly.Events.setGroup(true);
          
          window.electron.ipcRenderer.invoke('show-input-dialog', {
              title: msg,
              defaultValue: defaultValue,
          }).then(newValue => {
              if (newValue !== undefined) {
                  callback(newValue);
                  // Принудительное обновление переменных
                  const workspace = workspaceRef.current;
                  workspace.getAllVariables().forEach(variable => {
                      workspace.refreshToolboxSelection();
                  });
              } else {
                  callback(defaultValue); // Если отмена, вернуть исходное значение
              }
              Blockly.Events.setGroup(false);
          });
      });
  
      // Добавьте обработчик событий VAR_RENAME
      const workspace = workspaceRef.current;
      const renameListener = (event) => {
          if (event.type === Blockly.Events.VAR_RENAME) {
              workspace.renameVariableById(event.varId, event.newName);
              workspace.refreshToolboxSelection();
          }
      };
      console.log('Renaming variable:', event.newName);
      workspace.addChangeListener(renameListener);
      return () => workspace.removeChangeListener(renameListener);
  }, []);
    return (
        <div id="blocklyContainer">
            <div ref={blocklyDiv} id="blocklyDiv" style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default BlocklyWorkspace;