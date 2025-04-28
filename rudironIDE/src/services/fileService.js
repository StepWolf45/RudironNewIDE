// src/services/fileService.js
import { ipcRenderer, dialog } from 'electron';
import fs from 'fs';
import path from 'path';

const fileService = {
    createNewFile: (setFiles, files, setActiveFileId, setBlocklyWorkspaces, setWorkspaceStates) => {
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

        setWorkspaceStates(prevStates => ({
            ...prevStates,
            [newFile.id]: null,
        }));
        ipcRenderer.send('new-file', newFile.id);
    },
    openFile: (setFiles, files, setActiveFileId, setBlocklyWorkspaces, setWorkspaceStates, fileContent, fileName) => {
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
    },
    saveFile: (activeFileId, blocklyWorkspaces) => {
        if (activeFileId && blocklyWorkspaces[activeFileId]) {
            const workspace = blocklyWorkspaces[activeFileId];
            const state = workspace ? Blockly.serialization.workspaces.save(workspace) : null;
            if (state) {
                ipcRenderer.send('save-file', { fileId: activeFileId, fileData: state });
            }
        },
    },
    saveFileAs: (activeFileId, blocklyWorkspaces) => {
        if (activeFileId && blocklyWorkspaces[activeFileId]) {
            const workspace = blocklyWorkspaces[activeFileId];
            const state = workspace ? Blockly.serialization.workspaces.save(workspace) : null;
            if (state) {
                ipcRenderer.send('save-file-as', { fileId: activeFileId, fileData: state });
            }
        },
    },
    handleFileSelect: (event, openFileCallback) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = JSON.parse(e.target.result);
                const fileName = file.path;
                openFileCallback(fileContent, fileName);
            } catch (error) {
                console.error('Error loading file:', error);
                alert('Invalid project file');
            } finally {
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    },
    closeFile: (id) => {
        ipcRenderer.send('close-file', id);
    }
};

export default fileService;