import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow text-center" style={{ width: '400px' }}>
        <h3 className="text-success">Payment Successful !</h3>
        <p>Thank you for your payment! Your transaction was successful.</p>
        <button className="btn btn-primary w-100 mt-3" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    </div>
  );
}
