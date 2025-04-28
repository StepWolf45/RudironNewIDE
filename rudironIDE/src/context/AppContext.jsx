// src/context/AppContext.jsx
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [files, setFiles] = useState([]);
    const [activeFileId, setActiveFileId] = useState(null);
    const [blocklyWorkspaces, setBlocklyWorkspaces] = useState({});
    const [workspaceStates, setWorkspaceStates] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);

    return (
        <AppContext.Provider value={{
            files, setFiles,
            activeFileId, setActiveFileId,
            blocklyWorkspaces, setBlocklyWorkspaces,
            workspaceStates, setWorkspaceStates,
            activeCategory, setActiveCategory
        }}>
            {children}
        </AppContext.Provider>
    );
};