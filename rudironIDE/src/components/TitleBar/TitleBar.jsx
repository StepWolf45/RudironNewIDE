import "./TitleBar.css";
import { SearchOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space} from 'antd';

export default function TitleBar({children}) {
  return (
    <div id="titleBarContainer">
          <div id="titleBar" className="draggable">
              <img src="public/logo.svg" alt="" />
              {children}
          </div>

          
    </div>

  )
}
