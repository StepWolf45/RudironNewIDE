// src/contexts/FileContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { categories } from '../components/BlockPanel/CategoriesToolbox.jsx';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
    
    const [files, setFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [blocklyWorkspaces, setBlocklyWorkspaces] = useState({});
    const [workspaceStates, setWorkspaceStates] = useState({});
    const [filePaths, setFilePaths] = useState({}); 
    const [currentFilePath, setCurrentFilePath] = useState(''); 
    const [activeCategory, setActiveCategory] = useState(categories[0]); 
    const [scrollPositions, setScrollPositions] = useState({}); 

    // Вспомогательная функция для сохранения позиции скролла текущего активного файла
    const saveCurrentScrollPosition = () => {
        if (activeFileId && blocklyWorkspaces[activeFileId]) {
            const workspace = blocklyWorkspaces[activeFileId];
            const scrollX = workspace.scrollX;
            const scrollY = workspace.scrollY;
            
            setScrollPositions(prevPositions => ({
                ...prevPositions,
                [activeFileId]: { x: scrollX, y: scrollY }
            }));
        }
    };

    const handleCreateNewFile = () => {
        // Сохраняем позицию скролла текущего активного файла перед созданием нового
        saveCurrentScrollPosition();

        // Генерируем уникальное имя файла
        const generateUniqueFileName = () => {
            let counter = 1;
            let fileName = `new-file-${counter}.rud`;
            
            // Проверяем, существует ли файл с таким именем
            while (files.some(file => file.name === fileName)) {
                counter++;
                fileName = `new-file-${counter}.rud`;
            }
            
            return fileName;
        };

        const newFile = {
            id: Date.now(),
            name: generateUniqueFileName(),
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
        // Сохраняем позицию скролла текущего активного файла перед открытием нового
        saveCurrentScrollPosition();

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
        // Сохраняем позицию скролла текущего активного файла перед закрытием
        saveCurrentScrollPosition();

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

        // Remove scroll position from memory
        const { [id]: removedScroll, ...remainingScrolls } = scrollPositions;
        setScrollPositions(remainingScrolls);

        if (String(id) === String(activeFileId)) {
            const closedIndex = files.findIndex((file) => file.id === id);
            
            let newActiveIndex;
            
            // Определяем новый активный индекс
            if (closedIndex === 0) {
                // Если удаляем первый файл, выбираем новый первый (бывший второй)
                newActiveIndex = 0;
            } else if (closedIndex === files.length - 1) {
                // Если удаляем последний файл, выбираем предыдущий
                newActiveIndex = closedIndex - 1;
            } else {
                // Если удаляем файл из середины, выбираем предыдущий (слева)
                newActiveIndex = closedIndex - 1;
            }
            
            const newActiveFileId = updatedFiles[newActiveIndex]?.id || null;
            setActiveFileId(newActiveFileId);
            setCurrentFilePath(filePaths[newActiveFileId] || updatedFiles[newActiveIndex]?.name || '');
        }
    };

    const handleTabChange = (newActiveFileId) => {
        // Сохраняем текущую позицию скролла перед переключением
        saveCurrentScrollPosition();

        if (newActiveFileId) {
            setActiveFileId(Number(newActiveFileId)); // Update active file ID
            setCurrentFilePath(filePaths[newActiveFileId] || files.find(file => file.id === Number(newActiveFileId))?.name || ''); // Update current file path or name
        }
    };

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
        filePaths, 
        currentFilePath, 
        setCurrentFilePath,
        activeCategory,
        setActiveCategory,
        scrollPositions,
        setScrollPositions,
    };

    return (
        <FileContext.Provider value={value}>
            {children}
        </FileContext.Provider>
    );
};