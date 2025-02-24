import "./MenuBar.css";
import React from 'react';

import { useState } from 'react';
import { FileOutlined ,AppstoreOutlined, ControlOutlined} from '@ant-design/icons';
import {ConfigProvider, Button, Menu, Dropdown, Space} from 'antd';   
import { Checkbox } from 'antd';
import {MenuItem1,MenuItem2,MenuItem3} from './itemsMenu.jsx'


export default function MenuBar({title, children, flag}) {

    let items = []
    let iconbutton
    if (flag=="1"){
      items = MenuItem1
      iconbutton =<FileOutlined/>
    }
    if (flag=="2"){
      items = MenuItem2
      iconbutton = <AppstoreOutlined/>
    }
    if (flag=="3"){
      items = MenuItem3
      iconbutton = <ControlOutlined />

    }
  return (
    <div>
        <ConfigProvider
                theme={{
                    components: {
                        Button: {
                          defaultBg: '#181818',
                          defaultHoverBg:'#3D3D3D',
                          defaultHoverColor:'#ffffff',
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
                        
                    <Button className="DropDownButton"type="default" icon={iconbutton}>{title}</Button>
                    </Dropdown>
                    
                </Space>
            </Space>
        </ConfigProvider>
    </div>
  )
}

