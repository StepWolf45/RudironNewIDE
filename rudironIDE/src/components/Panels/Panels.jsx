import { BorderBottomOutlined , MenuUnfoldOutlined,PlusSquareFilled} from "@ant-design/icons";
import "./Panels.css";

import { Flex, Splitter,Menu, Typography,Layout,Button } from 'antd';
import React, { useState } from 'react';
const { Sider } = Layout;

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
    const [collapsed, setCollapsed] = useState(false);
    return (
      <Layout>
        <Sider className="sider1"trigger={null} width={90} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          className="men"
          theme="dark"
          mode="inline"
          items={[
            {
              key: '1',
              icon:<PlusSquareFilled />,
            },
            {
              key: '2',
              icon:<PlusSquareFilled />,
            },
            {
              key: '3',
              icon:<PlusSquareFilled />,
              label: 'nav 3',
            },
          ]}
        />

        </Sider>
        <Sider width={300} className="sider2">
        </Sider>
        <Splitter
            className='Panels'
        >
            <Splitter.Panel>
            <Splitter layout="vertical">
                <Splitter.Panel collapsible min="20%" className="SplitTop">
                <Desc text="Top" />
                </Splitter.Panel>
                <Splitter.Panel  collapsible min="20%" className="SplitBottom" >
                <Desc text="Bottom" />
                </Splitter.Panel>
            </Splitter>
            </Splitter.Panel>
            <Splitter.Panel collapsible min="20%"className="SplitRight" >
            <Desc text="Right" />
            </Splitter.Panel>
        </Splitter>
        </Layout>
  );
}
