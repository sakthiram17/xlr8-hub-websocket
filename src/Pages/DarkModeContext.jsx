// DarkModeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for dark mode
const DarkModeContext = createContext();

// Create a custom hook to use the context
export const useDarkMode = () => useContext(DarkModeContext);

// DarkModeProvider component
export const DarkModeProvider = ({ children }) => {
  // State to manage dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle dark mode
  const toggleDarkMode = (darkMode) => {
    setIsDarkMode(darkMode);
  };

  // Set dark mode preference in local storage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedDarkMode === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    // Apply dark mode styles to the body
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};