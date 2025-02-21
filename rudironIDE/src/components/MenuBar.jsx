import "./MenuBar.css";
import React from 'react';
import ReactDOM from 'react-dom';

import { useState } from 'react';
import { FileOutlined } from '@ant-design/icons';
import {ConfigProvider, Button, Menu, Dropdown, Space} from 'antd';    

export default function MenuBar({title, children}) {
    const items = [
        {
          key: '1',
          label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
              Сохранить файл
            </a>
          ),
        },
        {
          key: '2',
          label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
              Загрузить файл
            </a>
            
          ),
        },
        {
          key: '3',
          label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
              Новый файл
            </a>
          ),
          children: [
            { key: '3', label: 'Option 3' },
            { key: '4', label: 'Option 4' },
            {
              key: 'sub1-2',
              label: 'Submenu',
              children: [
                { key: '5', label: 'Option 5' },
                { key: '6', label: 'Option 6' },
              ],
            },
          ],
        },
      ];
  return (
    <div>
        <ConfigProvider
                theme={{
                    components: {
                        Button: {
                          defaultBg: '#181818',
                          defaultHoverBg:'#3D3D3D',
                          defaultColor: '#ffffff',
                          defaultHoverBorderColor:'#3D3D3D',
                          defaultBorderColor:'#3D3D3D',
                          defaultActiveBg:'#3D3D3D',
                        },
                    },
                }}
        >
            <Space direction="vertical" class="nonDraggable">
                <Space wrap>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items,

                        }}
                        placement="bottomLeft"
                        overlayClassName="custom-dropdown-menu"
                    >
                        
                    <Button  type="default" icon={<FileOutlined />}>{title}</Button>
                    </Dropdown>
                    
                </Space>
            </Space>
        </ConfigProvider>
    </div>
  //   const userMenu = (
  //   <Menu>
  //     <Menu.Item key="1">Item 1</Menu.Item>
  //     <Menu.Item key="2">Item 2</Menu.Item>
  //     <Menu.Item key="3">Item 3</Menu.Item>
  //     <Menu.Divider />
  //     <Menu.Item key="3">Logout</Menu.Item>
  //   </Menu>
  // );
  // return (
  //   <div>
  //     <Dropdown.Button
  //       style={{ float: 'right' }}
  //       overlay={userMenu}
  //       icon={
  //         <UserOutlined
  //           style={{
  //             fontSize: '28px',
  //             backgroundColor: '#f0f0f0',
  //             borderRadius: '50%',
  //           }}
  //         />
  //       }
  //     >Файл</Dropdown.Button>
  //   </div>

  // )
  )
}

