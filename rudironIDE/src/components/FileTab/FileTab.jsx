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
    onCreateNewFile 
}) {
    const [tabTitles, setTabTitles] = useState(
        files.reduce((acc, file) => {
            acc[file.id] = file.name;
            return acc;
        }, {})
    );

    useEffect(() => {
        if (window.electron && window.electron.ipcRenderer) {
            const handleFileSaved = (fileName) => {
                setTabTitles((prevTabTitles) => ({
                    ...prevTabTitles,
                    [activeFileId]: fileName,
                }));
            };

            const unsubscribe = window.electron.ipcRenderer.on('file-saved', handleFileSaved);

            return () => {
                unsubscribe();
            };
        } else {
            console.warn("window.electron or window.electron.ipcRenderer is not defined.");
            return () => {}; 
        }
    }, [activeFileId]);

    const handleClose = (id) => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.send('close-file', id); 
        } else {
            console.warn("window.electron or window.electron.ipcRenderer is not defined.");
        }
        onCloseFile(id);
    };

    const memoizedWorkspaceStates = useMemo(() => workspaceStates, [workspaceStates]);

    return (
        <div className="file-panel">
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
                        onCreateNewFile(); 
                    } else {
                        setActiveFileId(key);
                    }
                }}
                onEdit={(key, action) => {
                    if (action === "add") {
                        onCreateNewFile(); 
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