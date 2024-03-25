import React, { useEffect, useState, useRef } from 'react';
import { useDataContext } from '../dataContext.jsx';
import { useControlContext, ControlProvider } from '../Pages/controlContext.jsx';

const WebSocketClient = (props) => {
    const { dispatch } = useDataContext();
    const { controlParameters, controlUpdates } = useControlContext();
    const [socket, setSocket] = useState(null);
    const [socketOpen, setSocketOpen] = useState(false);

    const autorefreshRef = useRef(controlParameters.autofresh);
    const durationRef = useRef(controlParameters.duration);

    useEffect(() => {
        autorefreshRef.current = controlParameters.autofresh;
        durationRef.current = controlParameters.duration;
    }, [controlParameters.autofresh, controlParameters.duration]);

    useEffect(() => {
        const setUpConnection = () => {
            

            const newSocket = new WebSocket('ws://localhost:8080/');
            setSocket(newSocket)
            newSocket.addEventListener('open', (event) => {
                // Handle open event
                setSocketOpen(true);
                setSocket(newSocket); // Store the socket object
            });
                
              
            newSocket.addEventListener('message', (event) => {
                const temp = JSON.parse(event.data);
                console.log(autorefreshRef.current)
                if (autorefreshRef.current) {
                    dispatch({ type: 'APPEND', data: temp, duration: durationRef.current });
                }
            });

            newSocket.addEventListener('close', (event) => {
                // Reconnect after a delay
                setTimeout(() => {
                    setUpConnection();
                }, 300);
                setSocketOpen(false);
            });

            return () => {
                // Close the WebSocket connection
                newSocket.close();
                setSocketOpen(false);
            };
        };

        // Initial connection attempt
        setUpConnection();
    }, [props.Channel]); // The empty dependency array ensures that this effect runs once after the initial render
    useEffect(() => {
        
        if (socketOpen &&socket) {
            const message = { topic: props.Channel };
            socket.send(JSON.stringify(message));
        }
    }, [props.Channel, socketOpen]);
    return <div>{/* Your component JSX here */}</div>;
};

export default WebSocketClient;