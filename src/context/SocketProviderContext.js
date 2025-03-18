import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => 
        io("https://live-hammer-backend.vercel.app", {
            transports: ["polling"],  // ✅ Force WebSocket (No polling)
            withCredentials: true,      // ✅ Allow cross-origin cookies if needed
            reconnection: true,         // ✅ Enable auto-reconnect
            reconnectionAttempts: 5,    // ✅ Try reconnecting 5 times
            timeout: 10000              // ✅ 10-second connection timeout
        }), []
    );

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
