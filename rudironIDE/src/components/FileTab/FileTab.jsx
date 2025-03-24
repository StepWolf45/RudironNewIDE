import React, { useState } from "react";
import { Tabs } from "antd";
import "./FileTab.css";
import BlocklyEditor from "../Blocks/BlocklyWorkspace.jsx";
import { Children } from "react";
// import BlocklyWorkspace from '../Blocks/BlocklyWorkspace.jsx';


const { TabPane } = Tabs;

export default function FileTab({children}) {

  const [files, setFiles] = useState([
    { id: 1, name: "index.rud", content: "console.log('Hello, world!');" },
  ]);


  const [activeFileId, setActiveFileId] = useState(files[0]?.id || null);

  // Закрытие вкладки
  const handleClose = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);

    // Если закрыли активную вкладку, переключаемся на вкладку слева
    if (id === activeFileId) {
      const closedIndex = files.findIndex((file) => file.id === id);
      const newActiveIndex = Math.max(0, closedIndex - 1); // Индекс вкладки слева
      const newActiveFileId = updatedFiles[newActiveIndex]?.id || null;
      setActiveFileId(newActiveFileId);
    }
  };

  // Добавление нового файла
  const handleAddFile = () => {
    const newFile = {
      id: Date.now(),
      name: `new-file-${files.length + 1}.rud`,
      content: "// New file content",
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id); // Переключаемся на новый файл
  };

  return (
    <div className="file-panel" 
        id="BlocklyArea" 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
    }}>
      {/* Панель вкладок */}
      <Tabs
        style={{ 
                width: '100%', 
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
        }}
        type="editable-card"
        activeKey={activeFileId ? activeFileId.toString() : "add"} // Если файлов нет, активной будет вкладка "+"
        onChange={(key) => {
          if (key === "add") {
            handleAddFile(); // Переход на вкладку "+" добавляет новый файл
          } else {
            setActiveFileId(Number(key)); // Переключение между файлами
          }
        }}
        onEdit={(key, action) => {
          if (action === "add") {
            handleAddFile(); // Добавление нового файла
          } else {
            handleClose(Number(key)); // Закрытие вкладки
          }
        }}
      >
        {files.map((file) => (
          <TabPane
            tab={
              <div className="tab-label">
                <span>{file.name}</span>

              </div>
            }
            key={file.id}
            closable={files.length > 0}
            style={{
              width: '100%',
              height: '100%', // Учитываем высоту панели вкладок
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >

            {children}
          </TabPane>
        ))}


      </Tabs>
    </div>
  );
};


