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

    // Функция для сохранения позиции скролла текущего активного файла
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

    // Создание нового файла
    const handleCreateNewFile = () => {
        // Сохраняем позицию скролла текущего активного файла перед созданием нового
        saveCurrentScrollPosition();

        // Генерируем уникальное имя файла
        const generateUniqueFileName = () => {
            let counter = 1;
            let fileName = `new-file-${counter}.rud`;
            
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

        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [newFile.id]: null,
        }));
    };

    // Открытие существующего файла
    const handleOpenFile = (fileContent, fileName, filePath) => {
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
        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [newFile.id]: fileContent,
        }));

        setFilePaths(prevPaths => ({
            ...prevPaths,
            [newFile.id]: filePath,
        }));

        setCurrentFilePath(filePath || fileName);
    };

    // Сохранение состояния workspace для файла
    const handleSaveFile = (fileId, workspaceState) => {
        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [fileId]: workspaceState, // Сохраняем состояние workspace
        }));
    };

    // Закрытие файла
    const handleCloseFile = (id) => {
        saveCurrentScrollPosition();

        const updatedFiles = files.filter((file) => file.id !== id);
        setFiles(updatedFiles);

        const { [id]: removedWorkspace, ...remainingWorkspaces } = blocklyWorkspaces;
        setBlocklyWorkspaces(remainingWorkspaces);

        const { [id]: removedState, ...remainingStates } = workspaceStates;
        setWorkspaceStates(remainingStates);

        const { [id]: removedPath, ...remainingPaths } = filePaths;
        setFilePaths(remainingPaths);

        const { [id]: removedScroll, ...remainingScrolls } = scrollPositions;
        setScrollPositions(remainingScrolls);

        // Если закрывается активный файл — выбираем новый активный
        if (String(id) === String(activeFileId)) {
            const closedIndex = files.findIndex((file) => file.id === id);
            
            let newActiveIndex;
            
            // Определяем новый активный индекс
            if (closedIndex === 0) {
                newActiveIndex = 0;
            } else if (closedIndex === files.length - 1) {
                newActiveIndex = closedIndex - 1;
            } else {
                newActiveIndex = closedIndex - 1;
            }
            
            const newActiveFileId = updatedFiles[newActiveIndex]?.id || null;
            setActiveFileId(newActiveFileId);
            setCurrentFilePath(filePaths[newActiveFileId] || updatedFiles[newActiveIndex]?.name || '');
        }
    };

    // Переключение вкладки (файла)
    const handleTabChange = (newActiveFileId) => {
        saveCurrentScrollPosition();

        if (newActiveFileId) {
            setActiveFileId(Number(newActiveFileId)); // Обновляем ID активного файла
            setCurrentFilePath(filePaths[newActiveFileId] || files.find(file => file.id === Number(newActiveFileId))?.name || ''); // Обновляем путь или имя
        }
    };

    // Сохраняем экземпляр workspace для файла
    const handleWorkspaceMount = (fileId, workspace) => {
        setBlocklyWorkspaces(prevWorkspaces => ({
            ...prevWorkspaces,
            [fileId]: workspace,
        }));
    };

    // Контекст со всеми функциями и состояниями для работы с файлами
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