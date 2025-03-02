import "./MenuBar.css";
import React from 'react';

import {MenuItem1,MenuItem2,MenuItem3} from './itemsMenu.jsx';

import { FileOutlined ,AppstoreOutlined, ControlOutlined} from '@ant-design/icons';
import {Button, Dropdown, Space} from 'antd';   



export default function MenuBar({title, flag}) {
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
                    
                <Button className="DropDownButton" type="default" icon={iconbutton}>{title}</Button>
                </Dropdown>
                
            </Space>
        </Space>
    </div>
  )
}

