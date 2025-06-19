// src/components/Blocks/BlocklyWorkspace.jsx
import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import * as Blockly from 'blockly';
import * as Ru from 'blockly/msg/ru';
import 'blockly/core';
import 'blockly/blocks';
import * as JavaScript from 'blockly/javascript';
import './BlocklyWorkspace.css';
import './CustomBlocks.jsx';
import { FileContext } from '../../contexts/FileContext';
import { ModalContext } from '../../contexts/ModalContext';
import {Minimap} from '@blockly/workspace-minimap';

const customTheme = Blockly.Theme.defineTheme('myTheme', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
        'logic_blocks': {
            'colourPrimary': '#5AC2A0',
            'colourTertiary': '#35AF87',
        },
        'loop_blocks': {
            'colourPrimary': '#EE7475',
            'colourTertiary': '#e94e4f',
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
    const { showInputDialogReact } = useContext(ModalContext);

    useEffect(() => {
        const workspace = Blockly.inject(blocklyDiv.current, {
            theme: customTheme,
            renderer: 'zelos',
            scrollbars: true,
            maxBlocks:800,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 0.8,
                maxScale: 1,
                minScale: 0.5,
                scaleSpeed: 1.1,
                pinch: true
            },
            grid:
                {spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true},
            toolbox: activeCategory?.toolboxXML || '',
            media: 'blockly/'
        });
        
        const minimap = new Minimap(workspace);
        minimap.init();
        minimap.enableFocusRegion;
        if (initialXml) {
            Blockly.serialization.workspaces.load(initialXml, workspace);
            workspace.scrollCenter()
        }

        workspaceRef.current = workspace;

        onWorkspaceMount(workspace);

        // if (Blockly.ContextMenuRegistry.registry.getItem('custom_menu_item')) {
        //     Blockly.ContextMenuRegistry.registry.unregister('custom_menu_item');
        // }
        // if (Blockly.ContextMenuRegistry.registry.getItem('custom_if_menu_item')) {
        //     Blockly.ContextMenuRegistry.registry.unregister('custom_if_menu_item');
        // }
        if (Blockly.ContextMenuRegistry.registry.getItem('blockHelp')) {
            Blockly.ContextMenuRegistry.registry.unregister('blockHelp');
        }

        // registerCustomContextMenu();
        // registerCustomContextMenuForIfBlock();

        //Сохранение в localStorage
        workspace.addChangeListener((event) => {
            if (event.type === Blockly.Events.VAR && event.name === 'rename') {
                event.preventDefault();
            }

            if (autoSave && !event.isUiEvent) {
                saveToStorage();
            }
        });

        return () => {
            workspace.dispose();
        };
    }, []);

    //Адаптивный blockly workspace
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

    //Смена категорий
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

    //Смена стандартного Alert на кастомный Modal для блоков переменная
    useEffect(() => {
        Blockly.dialog.setPrompt((msg, defaultValue, callback) => {
          Blockly.Events.setGroup(true);

          showInputDialogReact({
            title: msg,
            defaultValue: defaultValue,
            onOk: (newValue) => {
              console.log("Received value from dialog:", newValue);

              if (newValue !== undefined) {
                const newName = newValue.trim();

                if (newName) {
                  const workspace = workspaceRef.current;

                  let uniqueId;
                  if (Blockly.utils.idGenerator && typeof Blockly.utils.idGenerator.genUid === 'function') {
                    uniqueId = Blockly.utils.idGenerator.genUid();
                  } else {
                    uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    console.warn("Falling back to Math.random() for ID generation.  Consider updating Blockly.");
                  }

                  console.log("Creating variable with ID:", uniqueId, "and name:", newName);

                  workspace.createVariable(newName, undefined, uniqueId);
                  workspace.refreshToolboxSelection();

                  callback(newName);
                } else {
                  Modal.error({ content: 'Название переменной не может быть пустым!' });
                  callback(defaultValue);
                }
              } else {
                callback(defaultValue);
              }
              Blockly.Events.setGroup(false);
            },
            onCancel: () => {
              callback(defaultValue);
              Blockly.Events.setGroup(false);
            }
          });
        });

        const workspace = workspaceRef.current;
        

        const renameListener = (event) => {
          if (event.type === Blockly.Events.VAR_RENAME) {
            const varId = event.varId;
            const newName = event.newName;

            console.log("VAR_RENAME event - ID:", varId, "New name:", newName);

            workspace.renameVariableById(varId, newName);
            console.log("Variable renamed successfully.");
            workspace.refreshToolboxSelection();
            console.log("Toolbox refreshed.");
          }
        };
        workspace.addChangeListener(renameListener);
        return () => workspace.removeChangeListener(renameListener);
      }, [showInputDialogReact]);
      
    //   function registerCustomContextMenu() {
    //     const customMenuItem = {
    //         displayText: 'Новый пункт',
    //         preconditionFn: function(scope) {
    //             return 'enabled';
    //         },
    //         callback: function(scope) {
    //             alert('Новый пункт выбран!');
    //         },
    //         scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    //         id: 'custom_menu_item',
    //         weight: 100
    //     };

    //     Blockly.ContextMenuRegistry.registry.register(customMenuItem);
    // }

    // Функция для регистрации нового контекстного меню для блока if
    // function registerCustomContextMenuForIfBlock() {
    //     const customIfMenuItem = {
    //         displayText: 'Специальный пункт для блока if',
    //         preconditionFn: function(scope) {
    //             return scope.block.type === 'controls_if' ? 'enabled' : 'hidden';
    //         },
    //         callback: function(scope) {
    //             alert('Специальный пункт для блока if выбран!');
    //         },
    //         scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    //         id: 'custom_if_menu_item',
    //         weight: 100
    //     };

    //     Blockly.ContextMenuRegistry.registry.register(customIfMenuItem);
    // }

    return (
        <div id="blocklyContainer">
            <div ref={blocklyDiv} id="blocklyDiv" style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default BlocklyWorkspace;