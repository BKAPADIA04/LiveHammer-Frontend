import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import auctionImageLeft from '../images/otp_back_left.jpg';
import { useLocation } from 'react-router-dom';
// import '../css/custom.css';

export default function SignupInfo() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        totalPurseRemaining: '',
        wishlist: '',
        address: {
            city: '',
            state: '',
            pincode: '',
        },
    });
    const [error, setError] = useState('');

    const location = useLocation();
    const {email} = location.state || {};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['city', 'state', 'pincode'].includes(name)) {
            setFormData((prevState) => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [name]: value,
                },
            }));
        } else {
            setFormData((prevState) => ({ ...prevState, [name]: value }));
        }
    };
    
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.totalPurseRemaining || !formData.address.city || !formData.address.state || !formData.address.pincode) {
            setError('Please fill in all required fields.');
            return;
        }

        console.log('Form Data Submitted: ', formData);

        const host = 'http://localhost:8080';
        const url = `${host}/user/signup`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log(data);
        if (data.success === true) {
            navigate('/agora',{state:{email:email}});
            setFormData({
                name: '',
                email: '',
                phone: '',
                totalPurseRemaining: '',
                wishlist: '',
                address: {
                    city: '',
                    state: '',
                    pincode: '',
                },
            });
            setError('');
        } else {
            setError(data.error);
            return;
        }
    };

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center" >
            <div className="card shadow-lg p-4 custom-card w-100" style={{ maxWidth: '600px' }}>
                <h2 className="text-center mb-4">User Information</h2>
                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-control"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {/* Email and Phone (Side by Side) */}
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="phone" className="form-label">Phone</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                className="form-control"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    {/* Total Purse Remaining and Wishlist (Side by Side) */}
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="totalPurseRemaining" className="form-label">Total Purse Remaining in Rs.</label>
                            <input
                                type="number"
                                id="totalPurseRemaining"
                                name="totalPurseRemaining"
                                className="form-control"
                                placeholder="Enter total purse amount"
                                value={formData.totalPurseRemaining}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="wishlist" className="form-label">Wishlist</label>
                            <input
                                type="text"
                                id="wishlist"
                                name="wishlist"
                                className="form-control"
                                placeholder="Enter your wishlist"
                                value={formData.wishlist}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    {/* Address Fields */}
                    <h5 className="mt-4 text-light">Address</h5>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="city" className="form-label">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                className="form-control"
                                placeholder="Enter your city"
                                value={formData.address.city}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="state" className="form-label">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                className="form-control"
                                placeholder="Enter your state"
                                value={formData.address.state}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="pincode" className="form-label">Pincode</label>
                        <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            className="form-control"
                            placeholder="Enter your pincode"
                            value={formData.address.pincode}
                            onChange={handleInputChange}
                        />
                    </div>
                    {/* Submit Button */}
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
        </div>
    );
}
