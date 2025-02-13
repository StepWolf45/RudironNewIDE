import "./TitleBar.css";

export default function TitleBar({children}) {

  return (
    <div className="titleBar">
        <img src="public/vite.svg" alt="" />
        <div className="title">
            RudironIDE
        </div>
        {children}
    </div>
  )
}
