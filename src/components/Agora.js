import React,{useCallback, useState,useEffect,useRef} from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useNavigate } from "react-router-dom";
import '../css/agora.css';
import { useSocket } from '../context/SocketProviderContext';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPrice,setObjectName,setCurrentBidder } from '../redux/auctionSlice';
// require("dotenv").config();


export default function Agora() {
    const [appID, setAppID] = useState('');
    const [agoraToken, setAgoraToken] = useState('');
    const [appCertificate, setAppCertificate] = useState('');
    const [channel, setChannel] = useState('');
    const [uid, setUid] = useState(0);


    const generateAgoraAPI = async() => {
        const host = 'http://localhost:8080';
        const response = await fetch(`${host}/video/generateToken`);
        const data = await response.json();

        setAppID(data.appID);
        setAgoraToken(data.Token);
        setAppCertificate(data.appCertificate);
        setChannel(data.channel);
        setUid(data.uid);
        console.log(appID,agoraToken,appCertificate,channel,uid);
    }

    useEffect(() => {
        const initializeAgora = async () => {
          try {
            await generateAgoraAPI(); // Fetch Agora details
          } catch (error) {
            console.error('Error generating Agora API details:', error);
          }
        };
      
        initializeAgora();
      }, []);
      

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    const [localTracks, setLocalTracks] = useState([]);
    let remoteUsers = {};


    const socket = useSocket();
    const [msgSenderId,setMsgSenderId] = useState('');
    const [printMsg,setPrintMsg] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const chatEndRef = useRef(null);

    const location = useLocation();
    const {email} = location.state || {};
    socket.emit('agora:join', {
        channel: channel,
        uid:uid,
        email:email
    });

    const [localUser,setLocalUser] = useState({
        email:email,
        socketId:socket.id,
        name:''
    });
    useEffect(() => {
        socket.on('agora:joined', (data) => {
            console.log(data);
        });

        socket.on('agora:messageReceive', (data) => {
            console.log(data);  
            setChatMessages((prev) => {
                const isDuplicate = prev.some(
                    (msg) => msg.from === data.from && msg.message === data.message
                );
                if (isDuplicate) return prev;
    
                return [...prev, data];
            });
        });

        return () => {
            socket.off('agora:joined', (data) => {
                console.log(data);
            });

            socket.off('agora:messageReceive', (data) => {
                console.log(data);
            });
        }
    },[socket]);

    const joinAndDisplayLocalStream = useCallback(async() => {

        client.on('user-published', handleUserJoined);
        // client.on("user-unpublished", handleUserLeft);

        await client.join(appID, channel, agoraToken, uid);

        // const cameras = await AgoraRTC.getCameras();
        // console.log(cameras);
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        await client.publish([audioTrack, videoTrack]);
        setLocalTracks([audioTrack, videoTrack]);
        videoTrack.play(`local-player`);
    },[agoraToken, appID, client]);

    const handleUserLeft = async(user) => {
        const uid = user.uid;
        // console.log("User Left: ", uid);
        // const playerContainer = document.getElementById(`remote-player-${uid}`);
        // if(playerContainer)
        // {
            // playerContainer.remove();
        // }
        // delete remoteUsers[user.uid];
    }

    const navigate = useNavigate();
    const cancelCall = useCallback(async (user) => {
        const playerContainer = document.getElementById(`remote-player-${uid}`);
        if (playerContainer) {
            playerContainer.remove();  // Remove the video box from the UI
        }
        delete remoteUsers[user.uid];
        try {
            // Leave the channel
            await client.leave();
            
            // socket.emit('agora:leave', {
            //     channel: channel,
            //     uid:uid,
            //     email:email
            // });

    
            // Stop and release local tracks
            if (localTracks.length > 0) {
                localTracks.forEach((track) => {
                    track.stop(); // Stop the track
                    track.close(); // Release the track
                });
            }
    
            // Remove all remote user elements from the DOM
            const remotePlayerContainer = document.getElementById('remote-player-container');
            if (remotePlayerContainer) {
                remotePlayerContainer.innerHTML = ''; // Clear all remote user elements
            }
    
            // Reset the local state
            setLocalTracks([]);
            setIsMicOn(true);
            setIsCameraOn(true);
            setIsJoined(false);


    
            console.log('Call canceled and resources cleaned up.');
        } catch (error) {
            console.error('Error leaving the call:', error);
        }
        navigate('/user/payment',{state:{email:email,payment:currentPrice}});
    }, [client, localTracks, navigate]);
    

    const joinStream = async() => {
        await joinAndDisplayLocalStream();
    }

    const handleUserJoined = async(user,mediaType) => {
        const uid = user.uid;
        console.log("User Joined: ", uid);

        let playerContainer = document.getElementById(`remote-player-${uid}`);
        if(!playerContainer)
        {
            playerContainer = document.createElement('div');
            playerContainer.className = 'col-12 col-md-8';
            playerContainer.id = `remote-player-${uid}`;
            playerContainer.style = `
              aspect-ratio: 16/9;
              background-color: #000;
              border-radius: 8px;
              overflow: hidden;
              margin: 10px;
            `;
            document.getElementById('remote-player-container').appendChild(playerContainer);
        }
        remoteUsers[user.uid] = user ;
        await client.subscribe(user, mediaType)
        if(mediaType === 'video')
        {
            const videoTrack = user.videoTrack;
            videoTrack.play(`remote-player-${uid}`);
        }

        if(mediaType === 'audio')
        {
            const audioTrack = user.audioTrack;
            audioTrack.play();
        }
    }


    const [isJoined, setIsJoined] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);


    const handleJoin = () => {
        setIsJoined(true);
      };
    
      const handleLeave = () => {
        setIsJoined(false);
      };
    
      const toggleMic = () => {
        if (localTracks[0]) { // Assuming localTracks[0] is the audio track
            if (isMicOn) {
                localTracks[0].setEnabled(false); // Mute the microphone
            } else {
                localTracks[0].setEnabled(true); // Unmute the microphone
            }
            setIsMicOn(!isMicOn);
        }

      };
    
      const toggleCamera = () => {
        if (localTracks[1]) { // Assuming localTracks[1] is the video track
            if (isCameraOn) {
                localTracks[1].setEnabled(false); // Turn off the camera
            } else {
                localTracks[1].setEnabled(true); // Turn on the camera
            }
            setIsCameraOn(!isCameraOn);
        }
      };
      

    const [message, setMessage] = useState('');

    const handleChat = useCallback(() => {
        if (message) {
            const outgoingMessage = { from: socket.id, message };
            setChatMessages((prevMessages) => [...prevMessages, outgoingMessage]);
            // Emit the message to the server
            socket.emit('agora:message', {channel: channel, from : socket.id, message:message});
            // Clear the chat input
            setMessage('');
        }
    },[message, socket]);


    
    // console.log(currentPrice,objectName);

    // useEffect(() => {
    //     socket.on('auction:priceUpdate', (data) => {
    //         // Update the Redux state with the real-time price and object name
    //         dispatch(setPrice(data.price));
    //         dispatch(setObjectName(data.objectName));
    //     });

    //     return () => {
    //         socket.off('auction:priceUpdate');
    //     };
    // }, [socket, dispatch]);

    // Bidding Code
    const dispatch = useDispatch();
    const currentPrice = useSelector((state) => state.auction.currentPrice);
    const objectName = useSelector((state) => state.auction.objectName);
    const currentBidder = useSelector((state) => state.auction.currentBidder);

    const fixBid_1 = useCallback(async() => {
        const newPrice = currentPrice + 10;
        console.log(newPrice);
        socket.emit('auction:priceUpdate',{from:email,channel:channel,currentPrice:newPrice});
        dispatch(setPrice(newPrice));
        dispatch(setCurrentBidder(email));
        setTimerKey(prevKey => prevKey + 1);
    },[channel, currentPrice, dispatch, email, socket]);

    const fixBid_2 = useCallback(async() => {
        const newPrice = currentPrice + 20;
        console.log(newPrice);
        socket.emit('auction:priceUpdate',{from:email,channel:channel,currentPrice:newPrice});
        dispatch(setPrice(newPrice));
        dispatch(setCurrentBidder(email));
        setTimerKey(prevKey => prevKey + 1);
    },[channel, currentPrice, dispatch, email, socket]);

    const fixBid_3 = useCallback(async() => {
        const newPrice = currentPrice + 30;
        console.log(newPrice);
        socket.emit('auction:priceUpdate',{from:email,channel:channel,currentPrice:newPrice});
        dispatch(setPrice(newPrice));
        dispatch(setCurrentBidder(email));
        setTimerKey(prevKey => prevKey + 1);
    },[channel, currentPrice, dispatch, email, socket]);

    // Automatically scroll to the bottom of the chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        const handleNewPrice = async (data) => {
            const { from,currentPrice } = data;
            console.log('New price received:', currentPrice);
            dispatch(setPrice(currentPrice)); // Update Redux state
            dispatch(setCurrentBidder(from)); // Update Redux state
        };
        socket.on('auction:emittingNewPrice',async (data) => {
            handleNewPrice(data);
        })

        return () => {
            socket.off('auction:emittingNewPrice',(data) => {console.log(data)});
        }
    },[socket]);


    const [showPopup, setShowPopup] = React.useState(false);


    // Bidding Code
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

const [timerKey, setTimerKey] = useState(0);
const CountdownTimer = ({ initialSeconds , key}) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;

    useEffect(() => {
        if (seconds > 0) {
            const timer = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [seconds]);

    const progress = (seconds / initialSeconds) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="position-absolute top-0 start-0 m-3">
            <svg height={radius * 2} width={radius * 2}>
                <circle
                    stroke="#fff"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="green"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="18"
                    fill="orange"
                    fontWeight="bold"
                >
                    {seconds}s
                </text>
            </svg>
        </div>
    );
};


    return (
        <>  
        <div className="video-chat-container">
    {/* Header */}
    <div className="header">
        <h1 className='text-white fw-bold text-center p-2'>📺 LiveHammer 💸 💰 🔨</h1>
    </div>
    <CountdownTimer initialSeconds={30} key={timerKey}/>
    {/* Auctioneer's Stream */}
    <div className='auction-screen-chat'>
        <div className="auctioneer-container m-3">
            <div id="auctioneer-player" className="video-box auctioneer-player border border-dark">
                <span className="stream-label border border-dark">Auctioneer</span>
            </div>
            <div className="chat-container m-2">
                {/* Chat Box */}
                <div id="chat-player" className="video-box-chat border border-secondary shadow-sm rounded bg-light d-flex flex-column"
                style={{
                    background: 'linear-gradient(135deg, #ece9e6, #ffffff)',
                    borderColor: '#d3d3d3',
                }}
                >
                    {/* Chat Header */}
                    <div className="chat-header bg-secondary text-white text-center py-3 rounded-top"
                    style={{
                        background: 'linear-gradient(90deg, #1a2b46, #1e3a5f)', // Darker gradient for header
                        borderBottom: '1px solid #122033',
                    }}
                    >
                        <h5 className="m-0 fw-bold text-white">💬 Live Chat</h5>
                    </div>

                    {/* Chat Messages */}
                    <div 
                        className="chat-messages overflow-auto px-3 py-2 border-top border-bottom flex-grow-1" 
                        style={{ maxHeight: '400px', backgroundColor:  '#866d8f'}}
                    >
                        {chatMessages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`chat-message d-flex mb-3 ${
                                    msg.from === socket.id ? 'justify-content-end' : 'justify-content-start'
                                }`}
                            >
                                <div
                                    className={`message-bubble px-3 py-2 rounded shadow-sm ${
                                        msg.from === socket.id
                                            ? 'bg-dark text-white border'
                                            : 'bg-secondary text-white border'
                                    }`}
                                    style={{
                                        maxWidth: '70%',
                                        background: msg.from === socket.id
                                            ? 'linear-gradient(135deg, #0D47A1, #1976D2)'  // Gradient for sender
                                            : 'linear-gradient(135deg, #004D40, #00695C)', // Gradient for receiver
                                    }}
                                >
                                    <strong className="d-block">
                                        {msg.from === socket.id ? 'You' : msg.from}
                                    </strong>
                                    <span>{msg.message}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    {/* Chat Input */}
                    <div className="chat-input d-flex align-items-center p-2 rounded-bottom"
                    style={{ backgroundColor: '#ccc', borderTop: '1px solid #ddd' }}
                    >
                        <input 
                            type="text" 
                            id="chatInput" 
                            className="form-control me-2 border-secondary shadow-sm" 
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        />
                        <button 
                            className="btn btn-primary px-4 shadow-sm" 
                            id="sendMessageButton" 
                            onClick={handleChat}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
            <CountdownTimer initialSeconds={30} />
        </div>
    </div>


    {/* Local Stream */}
    <div className="local-container border border-dark">
        <div id="local-player" className="video-box-1 local-player">
            <span className="status-indicator"></span>
            <span className="stream-label1 border border-dark">Bhavya Kapadia</span>
        </div>
    </div>

    {/* Remote Users Carousel */}
    <div className="remote-users-container">
      <h4 className="text-black fw-bold text-center mb-3 border-bottom pb-2">Remote Users</h4>
        <div id="remote-player-container" className="remote-users-carousel border border-dark">
            {/* Render Remote User Boxes Dynamically */}
            <span className="stream-label2">User</span>
            <span className="status-indicator"></span>
        </div>
    </div>

    <div className="controls d-flex justify-content-between align-items-center p-3">
    {/* Center Buttons: Share Screen, Chat, Record */}
    <div className="center-buttons d-flex justify-content-center gap-3">
        <button className="btn btn-primary btn-lg" onClick={fixBid_1}>
            <i className="bi bi-display me-2">Bid 10!</i>
        </button>
        <button className="btn btn-secondary btn-lg" onClick={fixBid_2}>
            <i className="bi bi-chat-dots me-2">Bid 20!</i>
        </button>
        <button className="btn btn-warning btn-lg" onClick={fixBid_3}>
            <i className="bi bi-record-circle me-2">Bid 30!</i>
        </button>
        <div class="current-price text-center p-3 bg-dark rounded shadow">
            <h3 class="text-primary fw-bold">Current Price: Rs.<span id="current-price-value">{currentPrice}</span></h3>
        </div>
        <div class="current-price text-center p-3 bg-dark rounded shadow">
            <h3 class="text-primary fw-bold">Current Bid: <span id="current-price-value">{currentBidder}</span></h3>
        </div>
    </div>

    

    {/* Right-side Toggle Button */}
    <div className="right-buttons">
        <button 
            className="btn btn-info" 
            onClick={() => setShowPopup(!showPopup)} // Toggles popup state
        >
            <i className="bi bi-three-dots"></i> Call Options
        </button>

        {/* Popup with Additional Buttons */}
        {showPopup && (
            <div className="popup-menu d-flex flex-column gap-3 p-3">
                <button className="btn btn-primary" onClick={joinStream}>
                    Call
                </button>
                <button 
                    className={`btn ${isMicOn ? 'btn-danger' : 'btn-success'} btn-lg d-flex align-items-center`}
                    onClick={toggleMic}
                >
                    <i className={`bi ${isMicOn ? 'bi-mic-fill' : 'bi-mic-mute-fill'} me-2`}></i>
                    {isMicOn ? 'Mute' : 'Unmute'}
                </button>
                <button 
                    className={`btn ${isCameraOn ? 'btn-danger' : 'btn-success'} btn-lg d-flex align-items-center`}
                    onClick={toggleCamera}
                >
                    <i className={`bi ${isCameraOn ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'} me-2`}></i>
                    {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>
                <button className="btn btn-danger btn-lg" onClick={cancelCall}>
                    Cancel/Payment
                </button>
            </div>
        )}
    </div>
</div>
    </div>
    </>
      );    
}
