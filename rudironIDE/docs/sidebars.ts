import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'structure',
    'deploy',
    'add_customblock', 
    'ADD_BLOCK',
    {
      type: 'category',
      label: 'Бэкенд',
      items: [
        'electron/ELECTRON',

      ],
    },
    {
      type: 'category',
      label: 'Контексты',
      items: [
        'contexts/FileContext',
        'contexts/ModalContext',
      ],
    },
    {
      type: 'category',
      label: 'Интерфейс компоненты',
      items: [
        'components/BlocklyWorkspace',
        'components/BlockPanel',
        'components/FileTab',
        'components/CustomBlocks',
        'components/FieldButton',
        'components/VIS',
        'components/MenuBar',
        'components/CategoriesToolbox',
        'components/SplitterWorkspace',
        'components/TitleBar',
        'components/CustomInputDialog',
        'components/App',
      ],
    },

  ],
};
export default sidebars;
