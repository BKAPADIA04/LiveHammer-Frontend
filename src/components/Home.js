import React from 'react'
import Navbar from './Navbar'
import '../css/home.css';
import {Link} from 'react-router-dom';

export default function Front() {
  return (
    <div>
      <Navbar/>
      <div className="home-section">
        <div className="hero d-flex justify-content-center align-items-center">
          <header className="text-center p-5 rounded shadow-lg bg-overlay">
            <h1 className="display-3 fw-bold text-gradient">LiveHammer</h1>
            <p className="lead mt-3">Your Premier Auction Platform</p>
            <Link to="/login" className="btn btn-primary btn-lg me-3 shadow">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-lg me-3 shadow">Sign Up</Link>   
          </header>
        </div>
      </div>
    </div>
  )
}
