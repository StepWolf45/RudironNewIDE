import React, { useState, useEffect, useRef, useContext } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { List, AutoSizer } from 'react-virtualized';
import './OutputPanel.css';
import { FileContext } from '../../contexts/FileContext';

const OutputPanel = () => {
    const [logs, setLogs] = useState([]);
    const logContainerRef = useRef(null);
    const { currentFilePath } = useContext(FileContext);

    useEffect(() => {
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        console.log = (...args) => {
            setLogs(prevLogs => [...prevLogs, { type: 'log', message: args.join(' ') }]);
            originalConsoleLog(...args);
        };

        console.error = (...args) => {
            setLogs(prevLogs => [...prevLogs, { type: 'error', message: args.join(' ') }]);
            originalConsoleError(...args);
        };

        console.warn = (...args) => {
            setLogs(prevLogs => [...prevLogs, { type: 'warn', message: args.join(' ') }]);
            originalConsoleWarn(...args);
        };

        return () => {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
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
                <strong>Консоль вывода</strong>
                <button 
                    onClick={clearLogs} 
                    className="clear-button"
                >
                    <img 
                        src="/../../../public/мусорка.png" 
                        className="clear-icon"
                    />
                </button>
            </div>
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        width={width}
                        height={height-30} // Учитываем высоту строки с путем файла
                        rowCount={logs.length}
                        rowHeight={30} // Уменьшенный интервал между строками
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