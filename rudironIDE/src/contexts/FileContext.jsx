// src/contexts/FileContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const [files, setFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [blocklyWorkspaces, setBlocklyWorkspaces] = useState({});
    const [workspaceStates, setWorkspaceStates] = useState({});
    const [filePaths, setFilePaths] = useState({}); // Сохраняем пути к файлам в памяти
    const [currentFilePath, setCurrentFilePath] = useState(''); // Сохраняем текущий путь файла


    const handleCreateNewFile = () => {
        const newFile = {
            id: Date.now(),
            name: `new-file-${files.length + 1}.rud`,
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

    const handleOpenFile = (fileContent, fileName, filePath) => {
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

        // Сохраняем путь к файлу в памяти
        setFilePaths(prevPaths => ({
            ...prevPaths,
            [newFile.id]: filePath,
        }));

        // Устанавливаем текущий путь файла
        setCurrentFilePath(filePath || fileName);
    };

    const handleSaveFile = (fileId, workspaceState) => {
        // Update workspace states
        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [fileId]: workspaceState, // Save workspace state to localStorage
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

        // Remove file path from memory
        const { [id]: removedPath, ...remainingPaths } = filePaths;
        setFilePaths(remainingPaths);

        if (id === activeFileId) {
            const closedIndex = files.findIndex((file) => file.id === id);
            const newActiveIndex = Math.max(0, closedIndex - 1);
            const newActiveFileId = updatedFiles[newActiveIndex]?.id || null;
            setActiveFileId(newActiveFileId);
            setCurrentFilePath(filePaths[newActiveFileId] || updatedFiles[newActiveIndex]?.name || '');
        }
    };

    const handleTabChange = (newActiveFileId) => {

        if (newActiveFileId) {
            setActiveFileId(Number(newActiveFileId)); // Update active file ID
            setCurrentFilePath(filePaths[newActiveFileId] || files.find(file => file.id === Number(newActiveFileId))?.name || ''); // Update current file path or name
        }

    };
    const handleWorkspaceCenter = useCallback((fileId) => {
        console.log("Centering workspace for fileId:", fileId);
        const tryToCenter = (attempt = 0) => {
            const workspace = blocklyWorkspaces[fileId];
            if (workspace?.rendered) {
            workspace.scrollCenter();
            } else if (attempt < 3) {
            requestAnimationFrame(() => tryToCenter(attempt + 1));
            }
        };
        tryToCenter();
    }, [blocklyWorkspaces]);

    const handleWorkspaceMount = (fileId, workspace) => {
        setBlocklyWorkspaces(prevWorkspaces => ({
            ...prevWorkspaces,
            [fileId]: workspace,
        }));

    };

    const value = {
        files,
        setFiles,
        activeFileId,
        setActiveFileId,
        blocklyWorkspaces,
        setBlocklyWorkspaces,
        workspaceStates,
        setWorkspaceStates,
        handleCreateNewFile,
        handleOpenFile,
        handleSaveFile,
        handleCloseFile,
        handleTabChange,
        handleWorkspaceMount,
        handleWorkspaceCenter,
        filePaths, 
        currentFilePath, 
        setCurrentFilePath, 
    };

    return (
        <FileContext.Provider value={value}>
            {children}
        </FileContext.Provider>
    );
};