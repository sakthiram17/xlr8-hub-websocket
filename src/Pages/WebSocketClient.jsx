import React, { useEffect, useState } from 'react';
import { useDataContext } from '../dataContext.jsx';

const WebSocketClient = (props) => {
    const [data, setData] = useState(null);
    const { dispatch } = useDataContext();
    let socket;

    useEffect(() => {
        const setUpConnection = () => {
            socket = new WebSocket('ws://localhost:8080/');

            socket.addEventListener('open', (event) => {
                // Handle open event
            });

            socket.addEventListener('message', (event) => {
              const temp = JSON.parse(event.data);
              setData(prev=>{
                if (props.autofresh) {
                  dispatch({ type: 'APPEND', data:temp, duration: props.duration });
              }
              return prev
              });
            
    
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
    }, [props.autofresh, data, props.duration]); // The empty dependency array ensures that this effect runs once after the initial render

  

    console.log(props.resolution);
    return (
        <div>
            {/* Your component JSX here */}
        </div>
    );
};

export default WebSocketClient;
