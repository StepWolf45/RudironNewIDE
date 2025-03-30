import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs } from "antd";
import "./FileTab.css";
import BlocklyWorkspace from "../Blocks/BlocklyWorkspace.jsx";
const { TabPane } = Tabs;

export default function FileTab({
    files,
    activeFileId,
    blocklyWorkspaces,
    onSaveFile,
    onWorkspaceMount,
    onCloseFile,
    activeCategory,
    workspaceStates,
    setActiveFileId,
    onCreateNewFile // Add onCreateNewFile prop
}) {
    const [tabTitles, setTabTitles] = useState(
        files.reduce((acc, file) => {
            acc[file.id] = file.name;
            return acc;
        }, {})
    );

    useEffect(() => {
        // Check if window.electron and window.electron.ipcRenderer are defined
        if (window.electron && window.electron.ipcRenderer) {
            const handleFileSaved = (fileName) => {
                setTabTitles((prevTabTitles) => ({
                    ...prevTabTitles,
                    [activeFileId]: fileName,
                }));
            };

            // Listen for the 'file-saved' event from the main process
            const unsubscribe = window.electron.ipcRenderer.on('file-saved', handleFileSaved);

            return () => {
                // Clean up the listener when the component unmounts
                unsubscribe();
            };
        } else {
            console.warn("window.electron or window.electron.ipcRenderer is not defined.");
            return () => {}; // Return an empty cleanup function
        }
    }, [activeFileId]);

    const handleClose = (id) => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.send('close-file', id); // Send the file ID to the main process
        } else {
            console.warn("window.electron or window.electron.ipcRenderer is not defined.");
        }
        onCloseFile(id);
    };

    // Memoize workspaceStates to prevent unnecessary re-renders
    const memoizedWorkspaceStates = useMemo(() => workspaceStates, [workspaceStates]);

    return (
        <div className="file-panel"
            id="BlocklyArea"
            style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}>
            <Tabs
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
                type="editable-card"
                activeKey={activeFileId ? activeFileId.toString() : "add"} // If no files, activeKey is "add"
                onChange={(key) => {
                    if (key === "add") {
                        onCreateNewFile(); // Call onCreateNewFile
                    } else {
                        setActiveFileId(key);
                    }
                }}
                onEdit={(key, action) => {
                    if (action === "add") {
                        onCreateNewFile(); // Call onCreateNewFile
                    } else {
                        handleClose(Number(key));
                    }
                }}
                addIcon={null}
            >
                {files.map((file) => (
                    <TabPane
                        tab={
                            <div className="tab-label">
                                <span>{tabTitles[file.id] || file.name}</span>
                            </div>
                        }
                        key={file.id}
                        closable={files.length > 0}
                        className="tab-content"
                    >
                        <BlocklyWorkspace
                            initialXml={memoizedWorkspaceStates[file.id]}
                            onWorkspaceMount={(workspace) => onWorkspaceMount(file.id, workspace)}
                            activeCategory={activeCategory}
                            onSave={onSaveFile}
                        />
                    </TabPane>
                ))}
            </Tabs>
        </div>
    );
};