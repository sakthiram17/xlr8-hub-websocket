import React, { createContext, useReducer, useContext } from 'react';

const actionHandler = (state,action)=>{
    let temp;  
    console.log(action)
    switch(action.type)
    {
        case 'FETCH' : temp = [];
                     temp = temp.concat(action.data)
                     temp.sort((a,b)=>{
                      return new Date(a.current_time).getTime()- new Date(b.current_time).getTime()
                     })
                     
              
                     return temp;
        case 'FILTER' : temp = [...state];
                        temp = temp.filter((ele)=>{
                          return new Date(ele.current_time).getTime() >= action.startDate.getTime() && (
                            new Date(ele.current_time).getTime() <= action.endDate.getTime()
                          );
                        })
                        temp.sort((a,b)=>{
                          return new Date(a.current_time).getTime()- new Date(b.current_time).getTime()
                         })
                        return temp;
        
                     default:
                            temp = [...state];
          case 'APPEND':
           
          if(state)
            temp = [...state, action.data];
          else{
            temp = []
          }
            if(temp.length>=2000)
          {
            temp = temp.slice(temp.length-2000,temp.length)
          }
          temp.sort((a,b)=>{
            return new Date(a.current_time).getTime()- new Date(b.current_time).getTime()
           })
           return temp;
           break;
          case 'ZERO-FILTER': temp = [...state];
          temp;
            let startIndex = 0;
            let endIndex = temp.length - 1;
          
          while (startIndex <= endIndex && temp[startIndex].voltage <= 2) {
              startIndex++;
          }
          
          while (endIndex >= startIndex && temp[endIndex].voltage <= 2) {
              endIndex--;
          }
          startIndex = Math.max(0,startIndex-10)
          endIndex = Math.min(temp.length,endIndex+10)
          
         
          temp= temp.slice(startIndex, endIndex + 1);      
          return temp;
          

        
    }

}

const DataContext = createContext();
const CounterProvider= ({ children }) => {
    const [dataPoints, dispatch] = useReducer(actionHandler, []);
  
    return (
      <DataContext.Provider value={{ dataPoints, dispatch }}>
        {children}
      </DataContext.Provider>
    );
  };
  
  const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error('useCounter must be used within a CounterProvider');
    }
    return context;
  };
  
  export {CounterProvider,useDataContext}