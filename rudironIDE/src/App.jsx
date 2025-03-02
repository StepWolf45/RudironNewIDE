import React from 'react'
import 'normalize.css';
import './components/Panels/Panels.css'
import MenuBar from './components/MenuBar/MenuBar';
import Panels from './components/Panels/Panels';
import TitleBar from './components/TitleBar/TitleBar';
import TitleBarBtns from './components/TitleBarBtns/TitleBarBtns';
import FileManager from '/src/components/FileManager/FileManager.jsx';
import { useState } from 'react';
import { Layout,Splitter, Menu, Tabs, Button,Space } from 'antd';
import {
  FileOutlined,
  FolderOutlined,
  SearchOutlined,
  CodeOutlined,
  SettingOutlined,
  PlusSquareFilled,
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  function handleClick(type){
    console.log(type)
  }
  return (
    <div>

      <Layout style={{ minHeight: '100vh' ,maxHeight:'100vh'}}>
        <TitleBar>
          <MenuBar title="Файл" flag = "1"/>
          <MenuBar title="Вид" flag = "2"/>
          <MenuBar title="Подключение" flag = "3"/>
        </TitleBar>
        <Layout>
          <Sider className="sider1"trigger={null} width={90} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" />
          <Menu
            className="men"
            theme="dark"
            mode="inline"
            items={[
              {
                key: '1',
                icon:<PlusSquareFilled />,
              },
              {
                key: '2',
                icon:<PlusSquareFilled />,
              },
              {
                key: '3',
                icon:<PlusSquareFilled />,
                label: 'nav 3',
              },
            ]}
          />

          </Sider>
          <Sider className="sider2">
          </Sider>
        
          <Panels>
            <FileManager/>
          </Panels>
        </Layout>
      </Layout>
    </div>
  );
}
