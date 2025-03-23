import React from 'react'
import './components/SplitterWorkspace/SplitterWorkspace.css'
import MenuBar from './components/MenuBar/MenuBar';
import BlockPanel from './components/BlockPanel/BlockPanel';
import SplitterWorkspace from './components/SplitterWorkspace/SplitterWorkspace.jsx';
import TitleBar from './components/TitleBar/TitleBar';

import { useState } from 'react';
import { Layout } from 'antd';


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
        <BlockPanel>
          {/* <Workspace>
            <FileManager/>
          </Workspace> */}
        </BlockPanel>
      </Layout>
    </div>
  );
}
