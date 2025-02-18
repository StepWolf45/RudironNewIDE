import "./TitleBar.css";

export default function TitleBar({children}) {

  return (
    <nav className="titleBar">
        <img src="public/Лого.svg" alt="" />
        <div className="title">
            RudironIDE
        </div>
        {children}
    </nav>
  )
}
