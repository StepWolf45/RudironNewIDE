import "./SplitterWorkspace.css";
import BoardVisualization from "../BoardVisualization/BoardVisualization.jsx";
import {Splitter,Layout,Typography  } from 'antd';
import React, { useState } from 'react';
const {Content} = Layout;
const { Text, Paragraph } = Typography; 

export default function  Workspace({children}){

    return (
      <Layout className="Workspace">
            <Splitter>
                <Splitter.Panel defaultSize="80%"  style={{ position: 'relative' }}>
                <Splitter layout="vertical" className="SplitLeft">
                    <Splitter.Panel defaultSize="80%" className="SplitTop" style={{ position: 'relative' }}>
                      {children}

                    </Splitter.Panel>
                    <Splitter.Panel  defaultSize="20%" collapsible min="20%" className="SplitBottom" >
                    <div className="adaptive-text-container">
                      <Paragraph>
                        <Text strong>Serial Port:</Text>
                      </Paragraph>
                      <Paragraph>
                         Это пример текста, использующего компоненты Typography от Ant Design.
                      </Paragraph>
                    </div>
                    </Splitter.Panel>
                </Splitter>
                </Splitter.Panel>
                <Splitter.Panel defaultSize="20%" maxSize={400}  collapsible min="25%" className="SplitRight" >
                  <BoardVisualization />
                </Splitter.Panel>
            </Splitter>
      </Layout>
  );
}
