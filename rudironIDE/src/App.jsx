import React from 'react'
import './components/SplitterWorkspace/SplitterWorkspace.css'
import MenuBar from './components/MenuBar/MenuBar';
import BlockPanel from './components/BlockPanel/BlockPanel';
import TitleBar from './components/TitleBar/TitleBar';

import { useState, useRef, useEffect } from 'react';
import { Layout } from 'antd';


export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [blocklyWorkspaces, setBlocklyWorkspaces] = useState({});
  const [workspaceStates, setWorkspaceStates] = useState({}); // Store workspace states in localStorage

  useEffect(() => {
    // Load workspace states from localStorage on component mount
    try {
      const savedStates = localStorage.getItem('workspaceStates');
      if (savedStates) {
        setWorkspaceStates(JSON.parse(savedStates));
      }
    } catch (error) {
      console.error("Error loading workspace states from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    // Save workspace states to localStorage whenever they change
    try {
      localStorage.setItem('workspaceStates', JSON.stringify(workspaceStates));
    } catch (error) {
      console.error("Error saving workspace states to localStorage:", error);
    }
  }, [workspaceStates]);

  const handleCreateNewFile = () => {
    const newFile = {
      id: Date.now(),
      name: `new-file-${files.length + 1}.json`,
      content: null,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setBlocklyWorkspaces(prevWorkspaces => ({
      ...prevWorkspaces,
      [newFile.id]: null,
    }));

    // Ensure a new workspace state is created
    setWorkspaceStates(prevStates => ({
      ...prevStates,
      [newFile.id]: null,
    }));
  };

  const handleOpenFile = (fileContent, fileName) => {
    const newFile = {
      id: Date.now(),
      name: fileName,
      content: fileContent,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);

    setBlocklyWorkspaces(prevWorkspaces => ({
      ...prevWorkspaces,
      [newFile.id]: fileContent,
    }));
    // Ensure a new workspace state is created
    setWorkspaceStates(prevStates => ({
      ...prevStates,
      [newFile.id]: fileContent,
    }));
  };

  const handleSaveFile = (fileId, workspaceState) => {
    // Update workspace states
    setWorkspaceStates(prevStates => ({
      ...prevStates,
      [fileId]: workspaceState, // Save workspace state to localStorage
    }));
  };

  const handleWorkspaceMount = (fileId, workspace) => {
    setBlocklyWorkspaces(prevWorkspaces => ({
      ...prevWorkspaces,
      [fileId]: workspace,
    }));
  };

  const handleCloseFile = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);

    const { [id]: removedWorkspace, ...remainingWorkspaces } = blocklyWorkspaces;
    setBlocklyWorkspaces(remainingWorkspaces);

    // Remove workspace state from localStorage
    const { [id]: removedState, ...remainingStates } = workspaceStates;
    setWorkspaceStates(remainingStates);

    if (id === activeFileId) {
      const closedIndex = files.findIndex((file) => file.id === id);
      const newActiveIndex = Math.max(0, closedIndex - 1);
      const newActiveFileId = updatedFiles[newActiveIndex]?.id || null;
      setActiveFileId(newActiveFileId);
    }
  };
    const handleTabChange = (newActiveFileId) => {
        if (newActiveFileId) {
            setActiveFileId(Number(newActiveFileId)); // Update active file ID

        }
    };

  return (
    <div>
      <Layout style={{ minHeight: '100vh' ,maxHeight:'100vh'}}>
        <TitleBar>
          <MenuBar title="Файл" flag = "1" onCreateNewFile={handleCreateNewFile} onOpenFile={handleOpenFile} files={files} activeFileId={activeFileId} blocklyWorkspaces={blocklyWorkspaces}/>
          <MenuBar title="Вид" flag = "2"/>
          <MenuBar title="Подключение" flag = "3"/>
        </TitleBar>
        <BlockPanel
            files={files}
            activeFileId={activeFileId}
            blocklyWorkspaces={blocklyWorkspaces}
            onSaveFile={handleSaveFile}
            onWorkspaceMount={handleWorkspaceMount}
            onCloseFile={handleCloseFile}
            workspaceStates={workspaceStates}
            setActiveFileId={handleTabChange}
            onCreateNewFile={handleCreateNewFile}  // Pass onCreateNewFile
        />
      </Layout>
    </div>
  );
}