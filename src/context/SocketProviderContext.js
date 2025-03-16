import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(); // To create and share a single instance of a Socket.IO client (socket) with all components in the React application without passing it through props

export const useSocket = () => {    
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io("http://localhost:8080"), []);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
