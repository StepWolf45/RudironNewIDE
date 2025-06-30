// src/contexts/FileContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { categories } from '../components/BlockPanel/CategoriesToolbox.jsx';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
    // Список всех открытых файлов
    const [files, setFiles] = useState([]);
    // ID активного (текущего) файла
    const [activeFileId, setActiveFileId] = useState(null);
    // Словарь: fileId -> экземпляр Blockly.Workspace для каждого файла
    const [blocklyWorkspaces, setBlocklyWorkspaces] = useState({});
    // Состояния Blockly.Workspace для каждого файла (например, XML)
    const [workspaceStates, setWorkspaceStates] = useState({});
    // Словарь: fileId -> путь к файлу на диске
    const [filePaths, setFilePaths] = useState({}); 
    // Путь к текущему открытому файлу (или его имя)
    const [currentFilePath, setCurrentFilePath] = useState(''); 
    // Активная категория в панели блоков
    const [activeCategory, setActiveCategory] = useState(categories[0]); 
    // Словарь: fileId -> позиция скролла {x, y} для каждого файла
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

    // Создание нового файла
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

        // Создаём новое состояние workspace для нового файла
        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [newFile.id]: null,
        }));
    };

    // Открытие существующего файла
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
        // Создаём новое состояние workspace для открытого файла
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

    // Сохранение состояния workspace для файла
    const handleSaveFile = (fileId, workspaceState) => {
        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [fileId]: workspaceState, // Сохраняем состояние workspace
        }));
    };

    // Закрытие файла
    const handleCloseFile = (id) => {
        // Сохраняем позицию скролла текущего активного файла перед закрытием
        saveCurrentScrollPosition();

        const updatedFiles = files.filter((file) => file.id !== id);
        setFiles(updatedFiles);

        // Удаляем workspace закрытого файла
        const { [id]: removedWorkspace, ...remainingWorkspaces } = blocklyWorkspaces;
        setBlocklyWorkspaces(remainingWorkspaces);

        // Удаляем состояние workspace закрытого файла
        const { [id]: removedState, ...remainingStates } = workspaceStates;
        setWorkspaceStates(remainingStates);

        // Удаляем путь к файлу из памяти
        const { [id]: removedPath, ...remainingPaths } = filePaths;
        setFilePaths(remainingPaths);

        // Удаляем позицию скролла для закрытого файла
        const { [id]: removedScroll, ...remainingScrolls } = scrollPositions;
        setScrollPositions(remainingScrolls);

        // Если закрывается активный файл — выбираем новый активный
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

    // Переключение вкладки (файла)
    const handleTabChange = (newActiveFileId) => {
        // Сохраняем текущую позицию скролла перед переключением
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
        files, // Список файлов
        setFiles, // Функция для обновления списка файлов
        activeFileId, // ID активного файла
        setActiveFileId, // Функция для установки активного файла
        blocklyWorkspaces, // Словарь workspace'ов
        setBlocklyWorkspaces, // Функция для обновления workspace'ов
        workspaceStates, // Состояния workspace'ов
        setWorkspaceStates, // Функция для обновления состояний
        handleCreateNewFile, // Создать новый файл
        handleOpenFile, // Открыть файл
        handleSaveFile, // Сохранить файл
        handleCloseFile, // Закрыть файл
        handleTabChange, // Переключить вкладку
        handleWorkspaceMount, // Сохранить workspace
        filePaths, // Пути к файлам
        currentFilePath, // Текущий путь
        setCurrentFilePath, // Установить путь
        activeCategory, // Активная категория блоков
        setActiveCategory, // Установить категорию
        scrollPositions, // Позиции скролла
        setScrollPositions, // Установить позиции скролла
    };

    return (
        <FileContext.Provider value={value}>
            {children}
        </FileContext.Provider>
    );
};