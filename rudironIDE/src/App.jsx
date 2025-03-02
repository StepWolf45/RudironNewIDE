import React from 'react'

import './components/Panels/Panels.css'
import MenuBar from './components/MenuBar/MenuBar';
import Panels from './components/Panels/Panels';
import TitleBar from './components/TitleBar/TitleBar';
import TitleBarBtns from './components/TitleBarBtns/TitleBarBtns';

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
        
  
          <Layout>
                <Splitter className='Panels'>
                    <Splitter.Panel>
                    <Splitter layout="vertical" className='Ret'>
                        <Splitter.Panel collapsible min="20%" className="SplitTop">
                          <Content style={{ margin: '16px' }}>
                            <Tabs defaultActiveKey="1">
                              <Tabs.TabPane tab="index.html" key="1">
                                <div style={{ padding: '16px', background: '#f0f0f0' }}>
                                  <pre>{`<!DOCTYPE html>
                                      <html>
                                      <head>
                                        <title>Hello, World!</title>
                                      </head>
                                      <body>
                                        <h1>Hello, World!</h1>
                                      </body>
                                      </html>`}
                                  </pre>
                                </div>
                              </Tabs.TabPane>
                              <Tabs.TabPane tab="style.css" key="2">
                                <div style={{ padding: '16px', background: '#f0f0f0' }}>
                                  <pre>{`body {
                                    font-family: Arial, sans-serif;
                                    background-color: #fff;
                                      }`}
                                  </pre>
                                </div>
                              </Tabs.TabPane>
                            </Tabs>
                          </Content>
                        </Splitter.Panel>
                        <Splitter.Panel  collapsible min="20%" className="SplitBottom" >
                        </Splitter.Panel>
                    </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel collapsible min="20%"className="SplitRight" >
                    </Splitter.Panel>
                </Splitter>
            </Layout>
        </Layout>
      </Layout>
    </div>
  );
}
