import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';

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
            okText="OK"
            cancelText="Cancel"
        >
          <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus // Добавьте это свойство
              onPressEnter={handleOk} // Добавьте обработчик Enter
          />
        </Modal>
    );
};

export default CustomInputDialog;