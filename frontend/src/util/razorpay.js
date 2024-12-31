// src/utils/razorpay.js
export const loadRazorpay = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject('Failed to load Razorpay SDK');
      document.body.appendChild(script);
    });
  };
  