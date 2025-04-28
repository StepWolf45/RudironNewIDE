import React, { Children, useState, useCallback, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import "./BlockPanel.css";
import Workspace from '../SplitterWorkspace/SplitterWorkspace.jsx';
import FileTab from '../FileTab/FileTab.jsx';
import { categories } from './CategoriesToolbox.jsx';

const { Sider } = Layout;

const BlockPanel = ({
    files,
    activeFileId,
    blocklyWorkspaces,
    onSaveFile,
    onWorkspaceMount,
    onCloseFile,
    workspaceStates,
    setActiveFileId,
    onCreateNewFile,
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeCategory, setActiveCategory] = useState(categories[0]);

    const menuItems = categories.map((category) => ({
        key: category.id,
        label: category.name,
        icon: <img src={category.image} className='img_categ' />,
        onClick: () => setActiveCategory(category),
    }));

    const handleSave = useCallback((workspace) => {
        if (activeFileId && workspace) {
            const state = Blockly.serialization.workspaces.save(workspace);
            onSaveFile(activeFileId, state);
        }
    }, [activeFileId, onSaveFile]);

    return (
        <Layout>
            <Sider width={158} collapsedWidth={60} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='categories'>
                <Menu theme="dark" defaultSelectedKeys={[activeCategory.id]} mode="inline" items={menuItems} className='categ' />
            </Sider>
            <Workspace>
                <FileTab
                    files={files}
                    activeFileId={activeFileId}
                    blocklyWorkspaces={blocklyWorkspaces}
                    onSaveFile={handleSave}
                    onWorkspaceMount={onWorkspaceMount}
                    onCloseFile={onCloseFile}
                    activeCategory={activeCategory}
                    workspaceStates={workspaceStates}
                    setActiveFileId={setActiveFileId}
                    onCreateNewFile={onCreateNewFile} // Pass onCreateNewFile
                />
            </Workspace>
        </Layout>
    );
};

export default BlockPanel;