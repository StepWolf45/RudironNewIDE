import React, { useState } from "react";
import { Tabs } from "antd"; // Используем Ant Design для вкладок
import "./FileManager.css"; // Подключим стили

const { TabPane } = Tabs;

export default function FileManager() {
  // Состояние для хранения списка открытых файлов
  const [files, setFiles] = useState([
    { id: 1, name: "index.js", content: "console.log('Hello, world!');" },
    { id: 2, name: "App.js", content: "import React from 'react';" },
    { id: 3, name: "styles.css", content: "body { margin: 0; }" },
  ]);

  // Состояние для активной вкладки
  const [activeFileId, setActiveFileId] = useState(files[0]?.id || null);

  // Закрытие вкладки
  const handleClose = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);

    // Если закрыли активную вкладку, переключаемся на первую
    if (id === activeFileId) {
      if (updatedFiles.length > 0) {
        setActiveFileId(updatedFiles[0].id); // Переключаемся на первый файл
      } else {
        setActiveFileId(null); // Если файлов нет, активной вкладки нет
      }
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
    <div className="file-panel">
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
        {/* Вкладки для файлов */}
        {files.map((file) => (
          <TabPane
            tab={
              <div className="tab-label">
                <span>{file.name}</span>

              </div>
            }
            key={file.id}
            closable={files.length > 0} // Закрываемые вкладки, только если есть файлы
          >
            {/* Содержимое файла */}
            <textarea
              className="file-content"
              value={file.content}
              onChange={(e) => {
                const updatedFiles = files.map((f) =>
                  f.id === file.id ? { ...f, content: e.target.value } : f
                );
                setFiles(updatedFiles);
              }}
            />
          </TabPane>
        ))}


      </Tabs>
    </div>
  );
};

