import "./TitleBar/TitleBar.css";
import { FileOutlined } from '@ant-design/icons';
import {ConfigProvider, Button, Dropdown, Space} from 'antd';     

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
                        Dropdown:{
                                itemHoverColor:'#181818',

                            }


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
                    >
                        
                    <Button  type="default" icon={<FileOutlined />}>{title}</Button>
                    </Dropdown>
                    
                </Space>
            </Space>
        </ConfigProvider>
    </div>
    

  )
}

