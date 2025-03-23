import React, { Children, useState } from 'react';
import { Layout, Menu ,Row,Col } from 'antd';
import "./BlockPanel.css";
import Workspace from '../SplitterWorkspace/SplitterWorkspace.jsx';
import BlocklyWorkspace from '../Blocks/BlocklyWorkspace.jsx';
import FileTab from '../FileTab/FileTab.jsx';
import { categories } from './CategoriesToolbox.jsx';
const { Sider } = Layout;


const BlockPanel = ({children}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const menuItems = categories.map((category) => ({
    key: category.id,
    label: category.name,
    icon:<img src={category.image} className='img_categ'/>,
    onClick: () => setActiveCategory(category),
  }));
  return (
    <Layout>
      <Sider width={158} collapsedWidth={60} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='categories'>
        <Menu theme="dark" defaultSelectedKes={[activeCategory.id]} mode="inline" items={menuItems} className='categ'/>
      </Sider>
      <Workspace>
          <FileTab>
             <BlocklyWorkspace activeCategory={activeCategory}/>
          </FileTab> 
      </Workspace>

    </Layout>
  );
};

export default BlockPanel;

