
import React, { useState, useEffect, useContext } from 'react';
import { Modal, Input } from 'antd';
import './CustomInputDialog.css';
import { ModalContext } from '../../contexts/ModalContext'; 


const CustomInputDialog = () => {
    const {
        isInputDialogVisible,
        inputDialogOptions,
        handleInputDialogOk,
        handleInputDialogCancel,
    } = useContext(ModalContext);

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setInputValue(inputDialogOptions.defaultValue); // Сбрасываем inputValue при открытии модального окна
    }, [inputDialogOptions.defaultValue]);

    const handleOk = () => {

        handleInputDialogOk(inputValue.trim());
        setInputValue('');
    };

    const handleCancel = () => {
        handleInputDialogCancel();
        setInputValue('');
    };

    return (
        <Modal
            title={inputDialogOptions.title}
            open={isInputDialogVisible}
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