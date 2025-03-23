import "./SplitterWorkspace.css";
import BoardVisualization from "../BoardVisualization/BoardVisualization.jsx";
import {Splitter,Layout,Tabs} from 'antd';
import React, { useState } from 'react';
const {Content} = Layout;


export default function SplitterWorkspace({children}){

    return (
      <Layout className="Workspace">
            <Splitter>
                <Splitter.Panel defaultSize="80%">
                <Splitter layout="vertical" className="SplitLeft">
                    <Splitter.Panel defaultSize="80%" collapsible min="20%" className="SplitTop">
                      {children}

                    </Splitter.Panel>
                    <Splitter.Panel  defaultSize="20%" collapsible min="10%" className="SplitBottom" >
                    </Splitter.Panel>
                </Splitter>
                </Splitter.Panel>
                <Splitter.Panel defaultSize="20%"  maxSize={400} collapsible min="10%"className="SplitRight" >
                    <BoardVisualization/>
                </Splitter.Panel>
            </Splitter>
      </Layout>
  );
}
