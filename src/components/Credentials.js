import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useSocket } from '../context/SocketProviderContext';
import { data, useNavigate } from "react-router-dom";

export default function Credentials() {

    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');
    
    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback(
        (e) => {
        e.preventDefault();
        // console.log({
        //     "email" : email,
        //     "room" : room
        // });
        socket.emit("room:join",{
            "email" : email,
            "room" : room
        })
        // setEmail("");
        // setRoom("");
    },
    [email, room, socket]
);
    
    const handleJoinRoom = useCallback((data) => {
        const {email,room} = data;
        console.log(`Server received: ${room}`);
        navigate(`/video/${room}`);
        // navigate(`/video/room`);
    },[navigate]);

    useEffect(() => {
        socket.on('room:join',(data) => {
            handleJoinRoom(data);
        });
        // cleanup
        return () => {
            socket.off('room:join',(data) => {
                handleJoinRoom(data);
            });
        }
    },[socket,handleJoinRoom]);
    
  return (
    <>
    <div className="container mt-5 text-black p-5">
        <div className="row justify-content-center">
            <div className="col-md-6">
                <h1 className="text-center mb-4">Credentials</h1>
                <form onSubmit={handleSubmitForm} className="p-4 border rounded bg-light">
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email ID
                        </label>
                        <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="room" className="form-label">
                            Room Number
                        </label>
                        <input
                        type="text"
                        id="room"
                        className="form-control"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Enter room number"
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                        Join
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    </>
  )
}
