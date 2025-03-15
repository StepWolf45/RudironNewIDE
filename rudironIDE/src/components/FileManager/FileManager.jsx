import React, { useState } from "react";
import { Tabs } from "antd";
import "./FileManager.css";
import BlocklyEditor from "../Blocks/BlocklyWorkspace.jsx";
// import BlocklyWorkspace from '../Blocks/BlocklyWorkspace.jsx';


const { TabPane } = Tabs;

export default function FileManager() {

  const [files, setFiles] = useState([
    { id: 1, name: "index.js", content: "console.log('Hello, world!');" },
    { id: 2, name: "App.js", content: "import React from 'react';" },
    { id: 3, name: "styles.css", content: "body { margin: 0; }" },
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
      name: `new-file-${files.length + 1}.js`,
      content: "// New file content",
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id); // Переключаемся на новый файл
  };

  return (
    <div className="file-panel" id ="BlocklyArea">
      {/* Панель вкладок */}
      <Tabs
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
          >

            <BlocklyEditor/>
          </TabPane>
        ))}


      </Tabs>
    </div>
  );
};


