import React from 'react'
import Header from "./components/Header";
import WayToTeach from "./components/WayToTeach";

import { data } from "./data";
import { Layout ,Button, Dropdown, Space } from "antd";

import TitleBar from './components/TitleBar/TitleBar';
import TitleBarBtns from './components/TitleBarBtns/TitleBarBtns';


export default function App() {
  function handleClick(type){
    console.log(type)
  }
  return (
    <div>
      <TitleBar/>
      {/* <Header /> */}
      <main>
        {/* <section>
          <h3>Наш подход</h3>
          <ul>
            <WayToTeach {... data[0]}/>
            <WayToTeach
              title={data[1].title}
              description={data[1].description}
            />
            <WayToTeach
              title={data[2].title}
              description={data[2].description}
            />
            <WayToTeach
              title={data[3].title}
              description={data[3].description}
            />
          </ul>
        </section>
        <section>
          <h3>Чем мы отличаемся от других</h3>
          <Button onClick={()=>handleClick("way")}>Подход</Button>
          <Button onClick={()=>handleClick("easy")}>Транса</Button>
          <Button onClick={()=>handleClick("program")}>РАфт</Button>
        </section> */}
      </main>


    </div>
  );
}
