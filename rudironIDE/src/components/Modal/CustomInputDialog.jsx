import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import './CustomInputDialog.css';

const CustomInputDialog = ({ visible, title, defaultValue, onOk, onCancel }) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    useEffect(() => {
        setInputValue(defaultValue);
    }, [defaultValue]);

    const handleOk = () => {
      if (!inputValue.trim()) {
          Modal.error({ content: 'Название не может быть пустым!' });
          return;
      }
      onOk(inputValue.trim());
  };

    const handleCancel = () => {
      onCancel();
      setInputValue(defaultValue); // Сброс значения при отмене
  };

    return (
        <Modal
            title={title}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Применить"
            cancelText="Отменить"
            className="custom-input-modal" 
        >
          <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus 
              onPressEnter={handleOk} 
              className="custom-input" 
          />
        </Modal>
    );
};

export default CustomInputDialog;