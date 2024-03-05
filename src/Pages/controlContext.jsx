
import React, { createContext, useReducer, useContext } from 'react';
const actionHandler = (state, action) => {
  if (action.type === 'update') {
    return { ...state, ...action.data };
  } else {
    return { ...state };
  }
};

const ControlContext = createContext();

const ControlProvider = React.memo(({ children }) => {
  const [controlParameters, controlUpdates] = useReducer(actionHandler, {
    autofresh: false,
    sampleSize: 200,
    duration: 500,
  });

  return (
    <ControlContext.Provider value={{ controlParameters, controlUpdates }}>
      {children}
    </ControlContext.Provider>
  );
});
  
  const useControlContext = () => {
    const context = useContext(ControlContext);
    if (!context) {
      throw new Error('useCounter must be used within a CounterProvider');
    }
    return context;
  };
  
  export {ControlProvider,useControlContext}