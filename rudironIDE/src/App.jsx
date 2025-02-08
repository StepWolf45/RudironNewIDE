import Header from "./components/Header";
import WayToTeach from "./components/WayToTeach";
import Button from "./components/Button/Button";
import { data } from "./data";


export default function App() {
  return (
    <div>
      <Header />
      <main>
        <section>
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
          <Button>Подход</Button>
          <Button>Транса</Button>
          <Button>РАфт</Button>
        </section>
      </main>
    </div>
  );
}
