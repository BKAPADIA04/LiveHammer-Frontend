import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow text-center" style={{ width: '400px' }}>
        <h3 className="text-danger">Payment Canceled ❌</h3>
        <p>It looks like you canceled the payment. No worries! You can try again.</p>
        <button className="btn btn-primary w-100 mt-3" onClick={() => navigate('/user/payment')}>
          Try Again
        </button>
      </div>
    </div>
  );
}
