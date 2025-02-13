import "./TitleBarBtns.css";

export default function TitleBarBtns() {

  return (
    <div className="titleBarBtns">
        <button id="minimazeBtn" className="TopBtn minimazeBtn"></button>
        <button id="maxResBtn" className="TopBtn maximazeBtn"></button>
        <button id="closeBtn" className="TopBtn closeBtn"></button>
    </div>
  )
}
