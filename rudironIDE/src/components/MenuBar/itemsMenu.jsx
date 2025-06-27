import "./MenuBar.css";
  
export const stopPropagation = (e) => {
  e.stopPropagation(); 
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
// export let MenuItem2= [
//       {
//         key: '1',
//         label: ((<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> Монитор портов</Checkbox></span>) )
//       },
//       {
//         key: '2',
//         label: ((<span onClick={stopPropagation}><Checkbox onChange={onChange} className="custom-checkbox"> Монитор пинов</Checkbox></span>)),
//       },
//     ]
