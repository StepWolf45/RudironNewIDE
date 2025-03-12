import React, { Children, useState } from 'react';
import { Layout, Menu ,Row,Col } from 'antd';
import "./BlockPanel.css";
import Workspace from '../Workspace/Workspace.jsx';
import BlocklyEditor from '../Blocks/BlocklyWorkspace.jsx';
import FileManager from '../FileManager/FileManager';

const { Sider } = Layout;

import cat1 from '../../../public/RoundCube-Blue-Glossy.svg';
import cat2 from '../../../public/Cube-Yellow-Glossy.svg';
import cat3 from '../../../public/RoundCube-Blue-Glossy_2.svg';
import cat4 from '../../../public/RoundCube-Orange-Glossy.svg';

const images = {
  cat1,
  cat2,
  cat3,
};

const categories = [
  { id: '1', name: 'Операторы', content: 'Content for Category 1', image: cat1 },
  { id: '2', name: 'Конструкции', content: 'Content for Category 2', image: images.cat2 },
  { id: '3', name: 'Переменные', content: 'Content for Category 3', image: images.cat3 },
];

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
      <Sider width={145} collapsedWidth={51} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='categories'>
        <Menu theme="dark" defaultSelectedKes={[activeCategory.id]} mode="inline" items={menuItems} className='categ'/>
      </Sider>
      <Sider width={250} className='blocks'>

      </Sider>
      <Workspace>
          <FileManager/>
      </Workspace>

    </Layout>
  );
};

export default BlockPanel;

