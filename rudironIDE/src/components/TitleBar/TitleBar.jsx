import "./TitleBar.css";
import { Button, Dropdown, Space  } from 'antd';

export default function TitleBar({}) {
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
    },
  ];
  return (
    <div id="titleBarContainer">
          <div id="titleBar" class=" draggable">
              <img src="public/Лого.svg" alt="" />
              <span class="draggable">RudironIDE</span>
              <Space direction="vertical" class="nonDraggable">
                <Space wrap>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items,
                    }}
                    placement="bottomLeft"
                    arrow={{
                      pointAtCenter: true,
                    }}
                    icon
                  >
                    <Button color="black">Файл</Button>
                  </Dropdown>
                  
                </Space>
              </Space>
              {/* <input class="nonDraggable" type="text" placeholder="Search"></input> */}
          </div>
          
    </div>

  )
}
