import cat1 from '/categories/RoundCube-Blue-Glossy.png';
import cat2 from '/categories/Cube-Yellow-Glossy.png';
import cat3 from '/categories/RoundCube-Blue-Glossy_2.svg';
import cat4 from '/categories/RoundCube-Orange-Glossy.svg';
import cat5 from '/categories/Cube-Orange (1).png';



export const categories = [
  { 
    id: '1', 
    name: 'Управление',
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
        <block type="logic_negate"></block>
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
        <block type="logic_boolean"></block>
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
  {
    id: '5', 
    name: 'Датчики',
    image: cat5,
    toolboxXML: `
      <xml>
          <block type="servo_write"></block>
          <block type="servo_stop"></block>
          <block type="servo_read"></block>
          <block type="get_distance"></block>
       </xml>
    `
  },
  
];

