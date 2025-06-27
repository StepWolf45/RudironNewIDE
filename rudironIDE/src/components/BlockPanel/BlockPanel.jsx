import React, { useState, useContext } from 'react';
import { Layout, Menu } from 'antd';
import "./BlockPanel.css";
import Workspace from '../SplitterWorkspace/SplitterWorkspace.jsx';
import FileTab from '../FileTab/FileTab.jsx';
import { categories } from './CategoriesToolbox.jsx';
import { FileContext } from '../../contexts/FileContext';

const { Sider } = Layout;

const BlockPanel = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { activeCategory, setActiveCategory } = useContext(FileContext);

    //Массив для создания меню
    const menuItems = categories.map((category) => ({
        key: category.id,
        label: category.name,
        icon: <img src={category.image} className='img_categ' />,
        onClick: () => setActiveCategory(category),
    }));

    return (
        <Layout>
            <Sider width={158} collapsedWidth={60} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='categories'>
                <Menu theme="dark" defaultSelectedKeys={[activeCategory.id]} mode="inline" items={menuItems} className='categ' />
            </Sider>
            <Workspace>
                <FileTab/>
            </Workspace>
        </Layout>
    );
};

export default BlockPanel;