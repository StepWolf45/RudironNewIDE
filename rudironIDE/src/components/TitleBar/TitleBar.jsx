import "./TitleBar.css";
import { SearchOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space} from 'antd';

export default function TitleBar({children}) {
  return (
    <div id="titleBarContainer">
          <div id="titleBar" className="draggable">
              <img src="public/Лого.svg" alt="" />
              <span className="nonDraggable">RudironIDE</span>
              {children}
          </div>

          
    </div>

  )
}
