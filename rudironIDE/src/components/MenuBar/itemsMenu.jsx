
    export let MenuItems1 = [
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
      ];
   export let MenuItems2= [
          {
            key: '1',
            label: ((<Checkbox onChange={onChange}> Монитор портов</Checkbox>) )
          },
          {
            key: '2',
            label: ((<Checkbox onChange={onChange}> Монитор пинов</Checkbox>) ),
          },
        ];
   export let MenuItems3 = [
          {
            key: '1',
            label:' Порт',
            children: [
              { key: '3', label: (<Checkbox onChange={onChange}>COM 4</Checkbox>)},
              { key: '4', label: (<Checkbox onChange={onChange}>COM 5</Checkbox>)},
            ],
          },
          {
            key: '2',
            label: 'Bluetooth',
            children: [
              { key: '3', label: (<Checkbox onChange={onChange}>rudi 1</Checkbox>)},
              { key: '4', label: (<Checkbox onChange={onChange}>rudi 2</Checkbox>) },
            ],
          },
        ];
