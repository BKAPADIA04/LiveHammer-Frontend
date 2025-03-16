import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../css/login.css';
import auctionImage from '../images/otp_back.jpeg';
import auctionImageLeft from '../images/otp_back_left.jpg';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array for OTP boxes
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const host = 'http://localhost:8080';

    const handleGenerateOtp = async () => {
        if (!email) {
            setError('Please enter a valid email');
            return;
        }
        setLoading(true);
        const url1 = `${host}/user/search`;
        const response1 = await fetch(url1, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        const data1 = await response1.json();

        if (data1.success === true && data1.found === false) {
            const url = `${host}/auth/user/requestOTP`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();
            setError('');
            setOtpSent(true);
            setOtp(['', '', '', '', '', '']);
        } else {
            setError('User with given credentials already exists!');
        }
        setLoading(false);
    };

    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join(''); // Combine OTP values into a single string
        if (!otpValue) {
            setError('Please enter the OTP');
            return;
        }
        setLoading(true);
        const url = `${host}/auth/user/verifyOTP`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, otp: otpValue }),
        });

        const data = await response.json();
        setLoading(false);
        if (data.success === true) {
            navigate('/signup/information',{state:{email:email}});
            setEmail('');
            setOtp(['', '', '', '', '', '']);
            setOtpSent(false);
            setError('');
        } else {
            setError(data.error);
        }
    };

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1); // Ensure only one character is entered per box
        setOtp(newOtp);
        // Automatically focus next box
        if (value && index < otp.length - 1) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    return (
        <div className="container-fluid vh-100 bg-light">
            <div className="row h-100 ">
                {/* Left side card */}
                <div className="col-md-6 d-flex justify-content-center align-items-center bg-light" style={{'backgroundImage': `url(${auctionImageLeft})`, 'backgroundSize': 'cover'}}>
                    <div className="card p-4 w-100" style={{ maxWidth: '400px' }}>
                        <h2 className="text-center mb-4">User Signup</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-info"
                                    onClick={handleGenerateOtp}
                                    disabled={otpSent || loading}
                                >
                                    {loading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            &nbsp; Sending...
                                        </span>
                                    ) : otpSent && (
                                        "OTP Sent! Didn't get a code? Click on Generate OTP again"
                                    )}
                                </button>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-success w-100"
                                    onClick={handleGenerateOtp}
                                >
                                    Generate OTP
                                </button>
                            </div>
                        </form>
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    </div>
                </div>

                {/* Right side with image and OTP boxes */}
                <div className="col-md-6 position-relative d-flex justify-content-center align-items-center" style={{'backgroundImage': `url(${auctionImage})`, 'backgroundSize': 'cover'}}>
                    
                    {!otpSent && (
                        <div className="position-absolute text-center text-light" style={{ marginTop: '-10%' }}>
                            <h2>Welcome to the Auction Portal</h2>
                            <p className="mt-2">Please sign up to participate in the latest auctions and explore great deals.</p>
                        </div>
                    )}
                    {otpSent && (
                        <div className="otp-container position-absolute" style={{ marginTop: '-15%' }}>
                            <h4 className="text-center text-light mb-3">Enter OTP</h4>
                            <div className="d-flex justify-content-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-input-${index}`}
                                        type="text"
                                        className="otp-box"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary mt-3"
                                onClick={handleSubmit}
                            >
                                Submit OTP
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
