import cat1 from '../../../public/RoundCube-Blue-Glossy.svg';
import cat2 from '../../../public/Cube-Yellow-Glossy.svg';
import cat3 from '../../../public/RoundCube-Blue-Glossy_2.svg';
import cat4 from '../../../public/RoundCube-Orange-Glossy.svg';

const images = {
  cat1,
  cat2,
  cat3,
  cat4,
};

export const categories = [
  { 
    id: '1', 
    name: 'Конструкции',
    image: cat4,
    toolboxXML: `
      <xml>
        <block type="start"></block>
        <block type="controls_whileUntil"></block>
        <block type="controls_repeat_ext"></block>
      </xml>
    `
  },
  { 
    id: '2', 
    name: 'Операторы',
    image: cat1,
    toolboxXML: `
      <xml>
        <block type="controls_if"></block>
        <block type="controls_ifelse" colour="#FFA500"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
        <block type="math_arithmetic"></block>
      </xml>
    `
  },
  { 
    id: '3', 
    name: 'Переменные',
    image: cat2,
    toolboxXML: `
      <xml>

        <block type="variables_set" ></block>
        <block type="variables_get"></block>
        <block type="math_number"></block>
        <block type="text"></block>
      </xml>
    `
  },
  {
  id: '4', 
  name: 'Электроника',
  image: cat3,
  toolboxXML: `
    <xml>
        <block type="write_text"></block>
        <block type="delay"></block>
        <block type="pinmode"></block>
        <block type="digital_write"></block>
        <block type="analog_write"></block>
        
    </xml>
  `
},
  
];

