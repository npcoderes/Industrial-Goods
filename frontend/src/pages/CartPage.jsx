import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, decrementQuantity, addToCart, clearCart } from '../slices/cartSlice';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { loadRazorpay } from '../util/razorpay';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { MdLocationOn, MdClose, MdShoppingCart, MdHome, MdAdd } from 'react-icons/md';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, RadioGroup, FormControlLabel, Radio, TextField, Typography, Paper, Box } from '@mui/material';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const CartPage = () => {
  const { items, totalQuantity, totalPrice } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('existing');
  const [newAddress, setNewAddress] = useState('');
  const handlePayment = async () => {
    try {
      if(!token) {
        toast.error('Please login to proceed with payment')
        return
      }
      // First show address selection
      setShowAddressModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };
  const handleCheckout = async () => {
    try {
      if (!token) {
        toast.error('Please login to checkout');
        return;
      }
      const deliveryAddress = selectedAddress === 'existing' ? user.Address : newAddress;

      // Prepare products data
      const products = items.map((item) => ({
        ProductID: item.ProductID,
        quantity: item.quantity,
      }));

      // Call backend API to capture payment
      const { data } = await axios.post(BASE_URL + '/customer/capture', { products },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        const { orderId, amount, currency } = data;

        // Load Razorpay SDK and open payment gateway
        const razorpay = await loadRazorpay();
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY, // Your Razorpay API key
          amount,
          currency,
          name: 'Industrial Goods',
          description: 'Order Payment',
          order_id: orderId,
          handler: async (response) => {
            // On payment success, verify payment
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              products,
              deliveryAddress,
            };

            const verifyResponse = await axios.post(BASE_URL + '/customer/verify', paymentData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Your order has been placed.');
              dispatch(clearCart());
              navigate('/PurchaseHistory');
            } else {
              toast.error('Payment verification failed!');
            }
          },
          prefill: {
            name: user.Name,
            email: user.Email,
            contact: user?.Phone,
          },
          theme: {
            color: '#61dafb',
          },
        };

        const paymentObject = new razorpay(options);
        paymentObject.open();


      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Something went wrong during checkout!');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center text-lg text-gray-500">Your cart is empty.</div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-white border rounded-lg shadow-lg p-4 hover:shadow-xl"
              >
                {/* Product Image */}
                <img
                  src={item.Image}
                  alt={item.Name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />

                {/* Product Details */}
                <h2 className="text-lg font-bold mb-2">{item.Name}</h2>
                <p className="text-sm text-gray-500 mb-2">{item.Description.slice(0, 100)}...</p>
                <p className="font-bold text-blue-600 mb-4">₹{item.Price}</p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => dispatch(decrementQuantity(item))}
                    >
                      <FaMinus />
                    </button>
                    <span className="font-bold text-lg">{item.quantity}</span>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => dispatch(addToCart(item))}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <button
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                    onClick={() => dispatch(removeFromCart(item))}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
            <p className="text-lg mb-2">Total Items: {totalQuantity}</p>
            <p className="text-lg font-bold mb-4">Total Price: ₹{totalPrice}</p>
            <button
              className="btn w-full btn-primary"
              onClick={handlePayment}
            >
              Checkout
            </button>
            <button
              className="btn w-full btn-error mt-4"
              onClick={() => dispatch(clearCart())}
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
      {/* Address Selection Modal */}
      <Dialog
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
            backgroundColor: '#f8f9fa'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '2px solid #e9ecef',
          pb: 2
        }}>
          <MdLocationOn size={24} color="#1976d2" />
          <Typography variant="h6">Select Delivery Address</Typography>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
            >
              <Paper
                elevation={selectedAddress === 'existing' ? 3 : 0}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: selectedAddress === 'existing' ? '#1976d2' : '#dee2e6',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdHome size={20} color="#1976d2" />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          Default Address
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user?.Address}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </Paper>

              <Paper
                elevation={selectedAddress === 'new' ? 3 : 0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: selectedAddress === 'new' ? '#1976d2' : '#dee2e6',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdAdd size={20} color="#1976d2" />
                      <Typography variant="subtitle1" fontWeight="600">
                        Add New Address
                      </Typography>
                    </Box>
                  }
                />

                {selectedAddress === 'new' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="New Delivery Address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    sx={{
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                )}
              </Paper>
            </RadioGroup>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{
          borderTop: '2px solid #e9ecef',
          pt: 2,
          gap: 1
        }}>
          <Button
            onClick={() => setShowAddressModal(false)}
            variant="outlined"
            startIcon={<MdClose size={20} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            variant="contained"
            disabled={selectedAddress === 'new' && !newAddress.trim()}
            startIcon={<MdShoppingCart size={20} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CartPage;
