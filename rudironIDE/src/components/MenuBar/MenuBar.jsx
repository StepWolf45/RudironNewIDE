// src/components/MenuBar/MenuBar.jsx
import "./MenuBar.css";
import * as Blockly from 'blockly';
import React, { useContext, useRef, useEffect, useState } from 'react';
import { MenuItem1, stopPropagation } from './itemsMenu.jsx';
import { FileOutlined, AppstoreOutlined, ControlOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Checkbox } from 'antd';
import { FileContext } from '../../contexts/FileContext';


export default function MenuBar({ title, flag }) {
    let items = [];
    let iconbutton;
    const fileInputRef = useRef(null);
    const [serialPorts, setPorts] = useState([]);
    const { handleCreateNewFile, handleOpenFile, activeFileId, blocklyWorkspaces } = useContext(FileContext);

    const handleMenuClick = (e) => {
        if (e.key === 'new') {
            handleCreateNewFile();
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
                const fileName = file.name;
                const filePath = file.path;

                // Сначала создаем новый файл и обновляем activeFileId
                const newFileId = Date.now();
                handleOpenFile(fileContent, fileName, filePath);

                // Затем отправляем событие file-opened с обновленным activeFileId
                if (window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.send('file-opened', { fileId: newFileId, filePath: filePath });
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

    const fetchDevices = async () => {
        try {
            const result = await window.electron.ipcRenderer.getSerialDevices("");
            setPorts(result.map((device, index) => ({
                key: index,
                label: (<span onClick={stopPropagation}><Checkbox onChange={() => { window.electron.ipcRenderer.connectSerialDevice(device.path) }} className="custom-checkbox">{device.path}</Checkbox></span>)
            })));
        } catch (error) {
            console.error('Error during IPC request:', error);
            setPorts([]);
        }
    };

    if (flag === "1") {
        items = MenuItem1;
        iconbutton = <FileOutlined />;
    }
    if (flag === "2") {
        items = MenuItem2;
        iconbutton = <AppstoreOutlined />;
    }
    if (flag == "3") {
        items = [
            {
                key: '1',
                label: 'Порт',
                children: serialPorts.length > 0 
                    ? serialPorts 
                    : [{ key: 'no-devices', label: <span style={{ color: 'white' }}>Нет подключенных плат</span> }]
            },
            {
                key: '2',
                label: ((<span onClick={() => {
                    fetchDevices();

                }}>Обновить</span>) )
            },
        ];
        iconbutton = <ControlOutlined />;
    }

        useEffect(() => {
                fetchDevices();
        }, []);

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