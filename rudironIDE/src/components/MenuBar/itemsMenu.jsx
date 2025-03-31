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
        key: 'new',
        label: 'Новый файл',
    },
    {
        key: 'open',
        label: 'Открыть файл',
    },
    {
        key: 'save',
        label: 'Сохранить',
    },
    {
        key: 'saveAs',
        label: 'Сохранить Как',
    },
];
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