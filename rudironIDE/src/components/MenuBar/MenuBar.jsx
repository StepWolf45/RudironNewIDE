import "./MenuBar.css";
import React from 'react';
import {MenuItem1, MenuItem2, MenuItem3} from './itemsMenu.jsx';
import { FileOutlined, AppstoreOutlined, ControlOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Menu } from 'antd';
import { useRef } from 'react';

export default function MenuBar({ title, flag, onCreateNewFile, onOpenFile, files, activeFileId, blocklyWorkspaces }) {
    let items = [];
    let iconbutton;
    const fileInputRef = useRef(null);

    const handleMenuClick = (e) => {
        if (e.key === 'new') {
            onCreateNewFile();
            if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.send('new-file', activeFileId);
            } else {
                console.warn("window.electron or window.electron.ipcRenderer is not defined.");
            }
        } else if (e.key === 'open') {
            fileInputRef.current.click();
        } else if (e.key === 'save') {
            handleSave();
        } else if (e.key === 'saveAs') {
            handleSaveAs();
        }
    };

    const handleSave = () => {
        if (activeFileId && blocklyWorkspaces[activeFileId]) {
            const workspace = blocklyWorkspaces[activeFileId];
            const state = workspace ? Blockly.serialization.workspaces.save(workspace) : null;
            if (state) {
                if (window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.send('save-file', { fileId: activeFileId, fileData: state });
                } else {
                    console.warn("window.electron or window.electron.ipcRenderer is not defined.");
                }
            }
        }
    };

    const handleSaveAs = () => {
        if (activeFileId && blocklyWorkspaces[activeFileId]) {
            const workspace = blocklyWorkspaces[activeFileId];
            const state = workspace ? Blockly.serialization.workspaces.save(workspace) : null;
            if (state) {
                if (window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.send('save-file-as', { fileId: activeFileId, fileData: state });
                } else {
                    console.warn("window.electron or window.electron.ipcRenderer is not defined.");
                }
            }
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = JSON.parse(e.target.result);
                const fileName = file.path;
                onOpenFile(fileContent, file.name);

                if (window.electron && window.electron.ipcRenderer && activeFileId) {
                    window.electron.ipcRenderer.send('file-opened', { fileId: activeFileId, filePath: fileName });
                }
            } catch (error) {
                console.error('Error loading file:', error);
                alert('Invalid project file');
            } finally {
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    };

    if (flag === "1") {
        items = [
            {
                key: 'new',
                label: 'Новый файл',
            },
            {
                key: 'open',
                label: 'Загрузить файл',
            },
            {
                key: 'save',
                label: 'Сохранить',
            },
            {
                key: 'saveAs',
                label: 'Сохранить Как',
            },
        ];
        iconbutton = <FileOutlined />;
    }
    if (flag === "2") {
        items = MenuItem2;
        iconbutton = <AppstoreOutlined />;
    }
    if (flag === "3") {
        items = MenuItem3;
        iconbutton = <ControlOutlined />;
    }

    return (
        <div>
            <Space direction="vertical" className="nonDraggable">
                <Space wrap>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items,
                            onClick: handleMenuClick,
                        }}
                        placement="bottomLeft"
                        overlayClassName="custom-dropdown-menu"
                    >
                        <Button className="DropDownButton" type="default" icon={iconbutton}>{title}</Button>
                    </Dropdown>
                </Space>
            </Space>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileSelect}
            />
        </div>
    );
}