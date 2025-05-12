// src/contexts/FileContext.jsx
import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isInputDialogVisible, setIsInputDialogVisible] = useState(false);
    const [inputDialogOptions, setInputDialogOptions] = useState({ title: '', defaultValue: '' });
    const inputDialogCallbacks = useRef({ onOk: () => {}, onCancel: () => {} });

    
    const showInputDialogReact = useCallback((options) => {
        setInputDialogOptions({
            title: options.title,
            defaultValue: options.defaultValue
        });

        // Сохраняем колбэки в ref
        inputDialogCallbacks.current = {
            onOk: options.onOk || (() => {}),
            onCancel: options.onCancel || (() => {})
        };

        setIsInputDialogVisible(true);
    }, []);

    useEffect(() => {
        window.showInputDialogReact = showInputDialogReact;
        return () => {
            delete window.showInputDialogReact;
        };
    }, [showInputDialogReact]);

    const handleInputDialogOk = (value) => {
        setIsInputDialogVisible(false);
        inputDialogCallbacks.current.onOk(value || inputDialogOptions.defaultValue); // Используйте значение по умолчанию, если пусто
    };

    const handleInputDialogCancel = () => {
        setIsInputDialogVisible(false);
        inputDialogCallbacks.current.onCancel(inputDialogOptions.defaultValue); // Передайте defaultValue
    };

    const value = {
        showInputDialogReact,
        isInputDialogVisible,
        inputDialogOptions,
        handleInputDialogOk,
        handleInputDialogCancel,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};