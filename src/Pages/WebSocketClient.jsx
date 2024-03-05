import React, { useEffect, useState, useRef } from 'react';
import { useDataContext } from '../dataContext.jsx';
import { useControlContext, ControlProvider } from '../Pages/controlContext.jsx';

const WebSocketClient = (props) => {
    const { dispatch } = useDataContext();
    const { controlParameters, controlUpdates } = useControlContext();
    let socket;
    const [socketOpen, setSocketOpen] = useState(false);

    const autorefreshRef = useRef(controlParameters.autofresh);
    const durationRef = useRef(controlParameters.duration);

    useEffect(() => {
        autorefreshRef.current = controlParameters.autofresh;
        durationRef.current = controlParameters.duration;
    }, [controlParameters.autofresh, controlParameters.duration]);

    useEffect(() => {
        const setUpConnection = () => {
            socket = new WebSocket('ws://localhost:8080/');

            socket.addEventListener('open', (event) => {
                // Handle open event
                setSocketOpen(true);
            });

            socket.addEventListener('message', (event) => {
                const temp = JSON.parse(event.data);
                console.log(autorefreshRef.current)
                if (autorefreshRef.current) {
                    dispatch({ type: 'APPEND', data: temp, duration: durationRef.current });
                }
            });

            socket.addEventListener('close', (event) => {
                // Reconnect after a delay
                setTimeout(() => {
                    setUpConnection();
                }, 300);
                setSocketOpen(false);
            });

            return () => {
                // Close the WebSocket connection
                socket.close();
                setSocketOpen(false);
            };
        };

        // Initial connection attempt
        setUpConnection();
    }, []); // The empty dependency array ensures that this effect runs once after the initial render

    return <div>{/* Your component JSX here */}</div>;
};

export default WebSocketClient;