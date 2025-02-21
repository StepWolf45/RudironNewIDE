import "./TitleBar/TitleBar.css";

import { Flex, Splitter, Typography } from 'antd';


const Desc = (props) => (
    <Flex
      justify="center"
      align="center"
      style={{
        height: '100%',
      }}
    >
      <Typography.Title
        type="secondary"
        level={5}
        style={{
          whiteSpace: 'nowrap',
        }}
      >
        {props.text}
      </Typography.Title>
    </Flex>
  );
export default function Panels(){
    return (
        <Splitter
            className='Panels'
        >
            <Splitter.Panel >
            <Desc text="Left" />
            </Splitter.Panel>
            <Splitter.Panel>
            <Splitter layout="vertical">
                <Splitter.Panel>
                <Desc text="Top" />
                </Splitter.Panel>
                <Splitter.Panel>
                <Desc text="Bottom" />
                </Splitter.Panel>
            </Splitter>
            </Splitter.Panel>
        </Splitter>
  );
}
