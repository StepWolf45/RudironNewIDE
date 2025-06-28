import React, { useMemo, useContext, useEffect, useState } from "react";
import { Tabs } from "antd";
import "./FileTab.css";
import BlocklyWorkspace from "../Blocks/BlocklyWorkspace.jsx";
import { FileContext } from '../../contexts/FileContext';

const { TabPane } = Tabs;

export default function FileTab() {
    const { files, activeFileId, workspaceStates, setActiveFileId, handleCreateNewFile, handleCloseFile, filePaths, setCurrentFilePath, handleWorkspaceMount } = useContext(FileContext);
    
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
            if (activeFileId) {
                    setCurrentFilePath(filePaths[activeFileId] || files.find(file => file.id === activeFileId)?.name || '');
            }
            return () => {
                unsubscribe();
            };
        } else {
            console.warn("window.electron or window.electron.ipcRenderer is not defined.");
            return () => {};
        }
    }, [activeFileId, filePaths, files, setCurrentFilePath]);

    const handleClose = (id) => {
        if (window.electron && window.electron.ipcRenderer) {
            window.electron.ipcRenderer.send('close-file', id);
        } else {
            console.warn("window.electron or window.electron.ipcRenderer is not defined.");
        }
        handleCloseFile(id);
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
                        handleCreateNewFile();
                    } else {
                        setActiveFileId(key);

                }}}
                onEdit={(key, action) => {
                    if (action === "add") {
                        handleCreateNewFile();
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
                            onWorkspaceMount={(workspace) => handleWorkspaceMount(file.id, workspace)}
                        />
                    </TabPane>
                ))}
            </Tabs>
        </div>
    );
};