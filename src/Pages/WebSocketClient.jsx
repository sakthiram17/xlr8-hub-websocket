import React, { useEffect, useState } from 'react';
import { useDataContext } from '../dataContext.jsx';
import { useControlContext,ControlProvider } from '../Pages/controlContext.jsx';

const WebSocketClient = (props) => {

    const { dispatch } = useDataContext();
    const {controlParameters,controlUpdates} = useControlContext();
    let socket;

    useEffect(() => {
        const setUpConnection = () => {
            socket = new WebSocket('ws://localhost:8080/');

            socket.addEventListener('open', (event) => {
                // Handle open event
            });

            socket.addEventListener('message', (event) => {
              const temp = JSON.parse(event.data);
         
              if(controlParameters.autofresh)
              {    
                dispatch({ type: 'APPEND', data:temp, duration: controlParameters.duration });
              }
            
    
            });

            // WebSocket event listener for when the connection is closed
            socket.addEventListener('close', (event) => {
                // Reconnect after a delay
                setTimeout(() => {
                    setUpConnection();
                }, 300);
            });
            return () => {
                // Close the WebSocket connection
                socket.close();
            };
        };
    


        // Initial connection attempt
        setUpConnection();
    }, [controlParameters.autofresh,controlParameters.duration]); // The empty dependency array ensures that this effect runs once after the initial render

  
    return (
        <div>
            {/* Your component JSX here */}
        </div>
    );
};

export default WebSocketClient;
