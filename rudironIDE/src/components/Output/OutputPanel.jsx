import React, { useState, useEffect, useRef, useContext } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { List, AutoSizer } from 'react-virtualized';
import './OutputPanel.css';

const OutputPanel = () => {
    const [logs, setLogs] = useState([]);
    const logContainerRef = useRef(null);

    useEffect(() => {
        const originalConsoleLog = console.log;
        const originalConsoleInfo = console.info;

        console.info = (...args) => {
            setLogs(prevLogs => [...prevLogs, { type: 'log', message: args.join(' ') }]);
            originalConsoleLog(...args);
        };


        return () => {
            console.info = originalConsoleInfo;
        };
    }, []);

    const clearLogs = () => {
        setLogs([]);
    };

    const rowRenderer = ({ index, key, style }) => {
        const log = logs[index];
        return (
            <div key={key} style={style} className={`console-log ${log.type}`}>
                <SyntaxHighlighter language="javascript" style={docco}>
                    {log.message}
                </SyntaxHighlighter>
            </div>
        );
    };

    return (
        <div className="console-output" ref={logContainerRef}>
            <div className="console-info">
                <strong>Монитор порта</strong>
                <button 
                    onClick={clearLogs} 
                    className="clear-button"
                >
                    <img 
                        src="мусорка.png" 
                        className="clear-icon"
                    />
                </button>
            </div>
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        width={width}
                        height={height-30} 
                        rowCount={logs.length}
                        rowHeight={30}
                        rowRenderer={rowRenderer}
                        className="custom-list"
                        style={{ overflowX: 'hidden', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                    />
                )}
            </AutoSizer>
        </div>
    );
};

export default OutputPanel;