import "./Button.css";

export default function Button({ children, buttonclick }) {

  return (
    <button className="button" onClick={buttonclick} >
        {children}
    </button>
)
}
