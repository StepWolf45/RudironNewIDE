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
    const handleClose = (id) => {
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
                                <span>{file.name}</span>
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
                            key={file.id} // Add a key here
                        />
                    </TabPane>
                ))}
            </Tabs>
        </div>
    );
};