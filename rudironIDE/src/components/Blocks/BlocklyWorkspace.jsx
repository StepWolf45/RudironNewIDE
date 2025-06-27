// src/components/Blocks/BlocklyWorkspace.jsx
import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import * as Blockly from 'blockly';
import * as Ru from 'blockly/msg/ru';
import 'blockly/core';
import 'blockly/blocks';
import './BlocklyWorkspace.css';
import './CustomBlocks.jsx';
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
    componentStyles: { 
      workspaceBackgroundColour: '#1F1F1F'

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
                {spacing: 30,
                length: 5,
                colour: '#ccc',
                snap: true},
            toolbox: activeCategory?.toolboxXML || '',
            media: 'blockly/'
        });
        
        const minimap = new Minimap(workspace);
        minimap.enableFocusRegion();
        minimap.init();

        if (initialXml) {
            Blockly.serialization.workspaces.load(initialXml, workspace);
            workspace.scrollCenter()
        }

        workspaceRef.current = workspace;

        onWorkspaceMount(workspace);
        if (Blockly.ContextMenuRegistry.registry.getItem('blockHelp')) {
            Blockly.ContextMenuRegistry.registry.unregister('blockHelp');
        }

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
                            

                            if (defaultValue && defaultValue !== newName) {
                                
                                const existingVar = workspace.getVariableByName(defaultValue);
                                if (existingVar) {
                                   
                                    workspace.renameVariable(existingVar.getId(), newName);
                                    callback(newName);
                                } else {
                                   
                                    const newVar = workspace.createVariable(newName);
                                    callback(newName);
                                }
                            } else {
                                
                                const newVar = workspace.createVariable(newName);
                                callback(newName);
                            }
                            
                            workspace.refreshToolboxSelection();
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

        return () => {
            Blockly.dialog.setPrompt(null);
        };
    }, [showInputDialogReact]);

    return (
        <div id="blocklyContainer">
            <div ref={blocklyDiv} id="blocklyDiv" style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default BlocklyWorkspace;