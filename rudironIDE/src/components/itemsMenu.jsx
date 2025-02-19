const items = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
          Сохранить файл
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
          Загрузить файл
        </a>
        
      ),
    },
    {
      key: '3',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
          Новый файл
        </a>
      ),
      children: [
        { key: '3', label: 'Option 3' },
        { key: '4', label: 'Option 4' },
        {
          key: 'sub1-2',
          label: 'Submenu',
          children: [
            { key: '5', label: 'Option 5' },
            { key: '6', label: 'Option 6' },
          ],
        },
      ],
    },
  ];