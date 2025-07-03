import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'structure',
    'deploy',
    'add_block',
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
        'components/FileTab',
        'components/MenuBar',
        'components/BlockPanel',
        'components/VIS',
        'components/CustomInputDialog',
        'components/CustomBlocks',
        'components/FieldButton',
        'components/CategoriesToolbox',
        'components/SplitterWorkspace',
        'components/TitleBar',
        'components/App',
      ],
    },

  ],
};
export default sidebars;
