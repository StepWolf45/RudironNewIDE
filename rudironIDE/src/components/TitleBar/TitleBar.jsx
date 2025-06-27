import "./TitleBar.css";

export default function TitleBar({children}) {
  return (
    <div id="titleBarContainer">
          <div id="titleBar" className="draggable">
              <img src="logo.svg" alt="" />
              {children}
          </div>
    </div>

  )
}
