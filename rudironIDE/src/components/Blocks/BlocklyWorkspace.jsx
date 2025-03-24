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
Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_DO = "вфыв";
const BlocklyWorkspace = ({ activeCategory }) => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const fileInputRef = useRef(null);
  const [autoSave, setAutoSave] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const resizeObserverRef = useRef(null);

  // Инициализация workspace
  useEffect(() => {
    if (blocklyDiv.current && !workspaceRef.current) {
      // Восстановление из localStorage при загрузке
      const savedState = localStorage.getItem('blocklyWorkspace');
      const initialState = savedState ? JSON.parse(savedState) : null;

      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        theme: customTheme,
        renderer: 'zelos',
        scrollbars: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
          pinch: true
        },
        toolbox: activeCategory?.toolboxXML || ''
      });

      // Загрузка сохраненного состояния
      if (initialState) {
        Blockly.serialization.workspaces.load(initialState, workspaceRef.current);
      }

      // Обработчик изменений
      workspaceRef.current.addChangeListener((event) => {
        if (autoSave && !event.isUiEvent) {
          saveToStorage();
        }
      });
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  // Добавлен ResizeObserver
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

  // Сохранение в localStorage
  const saveToStorage = useCallback(() => {
    if (workspaceRef.current) {
      const state = Blockly.serialization.workspaces.save(workspaceRef.current);
      localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
    }
  }, []);

  // Сохранение в файл
  const saveToFile = useCallback(() => {
    if (workspaceRef.current) {
      const state = Blockly.serialization.workspaces.save(workspaceRef.current);
      const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blockly-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  // Загрузка из файла
  const loadFromFile = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result);
        Blockly.serialization.workspaces.load(state, workspaceRef.current);
        localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Некорректный файл проекта');
      }
    };
    reader.readAsText(file);
  }, []);

  // Обновление toolbox
  useEffect(() => {
    if (workspaceRef.current && activeCategory) {
      saveToStorage();
      const newToolbox = Blockly.utils.xml.textToDom(activeCategory.toolboxXML);
      workspaceRef.current.updateToolbox(newToolbox);
    }
  }, [activeCategory, saveToStorage]);

  return (
    <div id="blocklyContainer" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%' 
    }}>
      <div 
        ref={blocklyDiv} 
        id="blocklyDiv" 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 999,
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
      }}>
          <button 
            onClick={saveToFile}
            style={buttonStyle}
            title="Сохранить в файл"
          >
            Сохранить
          </button>
          
          <button 
            onClick={() => fileInputRef.current.click()}
            style={buttonStyle}
            title="Загрузить из файла"
          >
            Загрузить
          </button>

          <label style={{ ...buttonStyle, background: autoSave ? '#4CAF50' : '#f44336' }}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Автосохранение
          </label>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={loadFromFile}
      />
      </div>

  );
};

const buttonStyle = {
  padding: '10px 15px',
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

export default BlocklyWorkspace;