import React from 'react';
import { Layout } from 'antd';
import TitleBar from './components/TitleBar/TitleBar';
import MenuBar from './components/MenuBar/MenuBar';
import BlockPanel from './components/BlockPanel/BlockPanel';
import { FileProvider } from './contexts/FileContext';
import { ModalProvider } from './contexts/ModalContext'; 
import CustomInputDialog from './components/Modal/CustomInputDialog.jsx';

export default function App() {
    return (
            <FileProvider>
                <Layout style={{ minHeight: '100vh', maxHeight: '100vh' }}>
                    <TitleBar>
                        <MenuBar title="Файл" flag="1" />
                        {/* <MenuBar title="Вид" flag="2" /> */}
                        <MenuBar title="Подключение" flag="3" />
                    </TitleBar>
                        <ModalProvider>
                            <BlockPanel />
                            <CustomInputDialog />
                        </ModalProvider>
                </Layout>
            </FileProvider>
    );
}