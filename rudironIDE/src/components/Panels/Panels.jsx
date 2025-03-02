import "./Panels.css";
import {Splitter,Layout,Tabs} from 'antd';

const {Content} = Layout;


export default function Panels({children}){

    return (
      <Layout>
            <Splitter>
                <Splitter.Panel>
                <Splitter layout="vertical">
                    <Splitter.Panel collapsible min="20%" className="SplitTop">
                      {children}

                    </Splitter.Panel>
                    <Splitter.Panel  collapsible min="20%" className="SplitBottom" >
                    </Splitter.Panel>
                </Splitter>
                </Splitter.Panel>
                <Splitter.Panel collapsible min="20%"className="SplitRight" >
                </Splitter.Panel>
            </Splitter>
        </Layout>
  );
}
