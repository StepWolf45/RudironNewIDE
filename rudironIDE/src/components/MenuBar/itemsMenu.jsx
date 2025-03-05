import { Checkbox } from 'antd';
import "./MenuBar.css";
  
const onChange = (e) => {
  console.log(`checked = ${e.target.checked}`);
  
};
const stopPropagation = (e) => {
  e.stopPropagation(); // Предотвращаем всплытие события
};

export let MenuItem1 = [
    {
      key: '1',
      label: (
        <a >
          Сохранить файл
        </a> 
      ),
    },
    {
      key: '2',
      label: (
        <a >
        Загрузить файл
        </a>
      ),
    },
    {
      key: '3',
      label:(
        <a >
        Новый файл
        </a>
      )
    },
  ]
export let MenuItem2= [
      {
        key: '1',
        label: ((<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> Монитор портов</Checkbox></span>) )
      },
      {
        key: '2',
        label: ((<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> Монитор пинов</Checkbox></span>)),
      },
    ]
export let MenuItem3 = [
      {
        key: '1',
        label:' Порт',
        children: [
          { key: '3', label: (<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> COM 4</Checkbox></span>)},
          { key: '4', label: (<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> COM 5</Checkbox></span>)},
        ],
      },
      {
        key: '2',
        label: 'Bluetooth',
        children: [
          { key: '3', label:  (<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> rudi 1</Checkbox></span>)},
          { key: '4', label:  (<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> rudi 2</Checkbox></span>) },
        ],
      },
    ]