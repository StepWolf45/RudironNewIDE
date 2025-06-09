import cat1 from '/RoundCube-Blue-Glossy.png';
import cat2 from '/Cube-Yellow-Glossy.svg';
import cat3 from '/RoundCube-Blue-Glossy_2.svg';
import cat4 from '/RoundCube-Orange-Glossy.svg';



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
        <block type="digital_write"></block>
        <block type="analog_write"></block>
        <block type="pinmode"></block>
        <block type="write_text"></block>
        <block type="delay"></block>
        <block type="analog_read"></block>
        <block type="digital_read"></block>
     </xml>
  `
},
  
];

