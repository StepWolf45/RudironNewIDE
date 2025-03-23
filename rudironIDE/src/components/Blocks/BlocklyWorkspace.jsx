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
        trashcan: true,
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

  // Сохранение в localStorage
  const saveToStorage = useCallback(() => {
    if (workspaceRef.current) {
      const state = Blockly.serialization.workspaces.save(workspaceRef.current);
      localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
    }
  }, []);

  // const loadFromStorage = () => {
  //   try {
  //     const jsonString = localStorage.getItem('blocklyWorkspace');
  //     return jsonString ? JSON.parse(jsonString) : null;
  //   } catch (error) {
  //     console.error('Ошибка загрузки:', error);
  //     return null;
  //   }
  // };
  
  // const savedState = loadFromStorage();
  // console.log(savedState)

  
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
      saveToStorage(); // Сохраняем перед изменением категории
      const newToolbox = Blockly.utils.xml.textToDom(activeCategory.toolboxXML);
      workspaceRef.current.updateToolbox(newToolbox);
    }
  }, [activeCategory, saveToStorage]);

  return (
    <div>
      <div ref={blocklyDiv} style={{ height: '100vh', width: '100vw' }} />
      
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