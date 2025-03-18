import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

export default function Payment() {
  const location = useLocation();
  const { email, payment } = location.state || {};

  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const host = 'https://live-hammer-backend.vercel.app';

  useEffect(() => {
    const getStripeCredentials = async () => {
      const url = `${host}/payment/sendStripeCredentials`;
      // const url = 'http://localhost:8080/payment/sendStripeCredentials';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      setStripePublishableKey(data.stripePublishableKey);
    };

    getStripeCredentials();
  }, []);

  const makePayment = async (e) => {
    e.preventDefault();
    const stripe = await loadStripe(stripePublishableKey);

    const response = await fetch(`${host}/payment/checkoutSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: payment }),
    });

    // const response = await fetch('http://localhost:8080/payment/checkoutSession', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ payment, email }),
    // });

    const session = await response.json();
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    if (result.error) {
      console.log(result.error.message);
    }
    console.log(result);
    return result;
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow text-center" style={{ width: '400px' }}>
        <h3>Payment Summary</h3>
        <p><strong>Email:</strong> {email || 'N/A'}</p>
        <p><strong>Amount:</strong> ${payment || 0}</p>
        <button className="btn btn-primary w-100 mt-3" onClick={makePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
}
