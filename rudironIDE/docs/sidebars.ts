
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'structure',
    'deploy',
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
        'components/BlockPanel',
        'components/BlocklyWorkspace',
        'components/CategoriesToolbox',
        'components/VIS',
      ],
    },
    {
      type: 'category',
      label: 'Electron Backend',
      items: [
        'electron/ELECTRON',

      ],
    },
    'add_customblock', 
  ],
};
export default sidebars;
