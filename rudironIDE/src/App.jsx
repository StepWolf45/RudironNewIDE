import React from 'react'
import Header from "./components/Header";
import WayToTeach from "./components/WayToTeach";
import { data } from "./data";
import MenuBar from './components/MenuBar/MenuBar';
import Panels from './components/Panels/Panels';
import TitleBar from './components/TitleBar/TitleBar';
import TitleBarBtns from './components/TitleBarBtns/TitleBarBtns';


export default function App() {
  function handleClick(type){
    console.log(type)
  }
  return (
    <div>
      <TitleBar>
        <MenuBar title="Файл" flag = "1"/>
        <MenuBar title="Вид" flag = "2"/>
        <MenuBar title="Подключение" flag = "3"/>
      </TitleBar>
      <main>
      <Panels/>
      </main>


    </div>
  );
}
