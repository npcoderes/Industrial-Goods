import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { FaShieldAlt, FaExchangeAlt, FaHeadset, FaTruck } from 'react-icons/fa';
import { loadRazorpay } from '../util/razorpay';
import toast from 'react-hot-toast';
import { MdLocationOn, MdClose, MdShoppingCart, MdHome, MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, RadioGroup, FormControlLabel, Radio, TextField, Typography, Paper, Box } from '@mui/material';
const BASE_URL = process.env.REACT_APP_BASE_URL;


const ProductDetails = () => {
  const { ProductID } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('existing');
  const [newAddress, setNewAddress] = useState('');

  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hover, setHover] = useState(null);
  const validLocations = ["gujarat"]; // Add more cities as needed
  const isDeliveryAllowed = (Address) => {
    let address = Address.toLowerCase();
    return validLocations.some(state => address.includes(state));

  }

  // Add new state variables
  const [addressDetails, setAddressDetails] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Add validation function
  const isValidAddress = () => {
    return addressDetails.street &&
      addressDetails.city &&
      addressDetails.state &&
      addressDetails.pincode.match(/^\d{6}$/);
  };
  // Add this after other state declarations
  const [states] = useState([
    
    'Gujarat', 

  ]);

  const [cities, setCities] = useState([]);

  // Add this function after state declarations
  const getCitiesForState = (selectedState) => {
    // This is a simplified example. In practice, you'd want to fetch this from an API
    const cityMap = {
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
      // Add more states and cities as needed
    };
    return cityMap[selectedState] || [];
  };

  // Add this effect after other useEffects
  useEffect(() => {
    if (addressDetails.state) {
      setCities(getCitiesForState(addressDetails.state));
      setAddressDetails(prev => ({ ...prev, city: '' })); // Reset city when state changes
    }
  }, [addressDetails.state]);





  const handleSubmitReview = async () => {
    if (!token) {
      toast.error('Please login to submit a review');
      return;
    }
    const tid = toast.loading('Submitting review...');
    try {
      const response = await axios.post(`${BASE_URL}/review/add`, {
        ProductID: product.ProductID,
        Rating: userRating,
        ReviewText: reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.dismiss(tid);
      toast.success('Review submitted successfully');
      setReviews([...reviews, response.data.reviews]);
      setShowReviewModal(false);
      setUserRating(0);
      setReviewText('');
    } catch (error) {
      toast.dismiss(tid);
      toast.error(error?.response?.data?.message || 'Failed to submit review');
      console.error('Error submitting review:', error);
    }
  };

  // Add this useEffect after other useEffects
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/review/${product.ProductID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReviews(response.data.reviews);
        console.log(response.data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [product]);

  // Add this component inside ProductDetails component
  const StarRating = ({ rating, onRatingChange, onHover, onLeave }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <FaStar
              key={index}
              className="cursor-pointer"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              size={24}
              onClick={() => onRatingChange(ratingValue)}
              onMouseEnter={() => onHover(ratingValue)}
              onMouseLeave={() => onLeave()}
            />
          );
        })}
      </div>
    );
  };



  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/getProductById/${ProductID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProduct(response.data.product);
      console.log(response.data.product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details. Please try again later.');
    }
  };
  const handlePayment = async () => {
    try {
      if (!token) {
        toast.error('Please login to continue');
        return;
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
      console.log(addressDetails)

      const deliveryAddress = selectedAddress === 'existing' ? user.Address : addressDetails;
      // Prepare products data

      // if (!isDeliveryAllowed(deliveryAddress)) {
      //   toast.error('Delivery not available in your location');
      //   return;
      // }

      const products = [{
        ProductID: product.ProductID,
        quantity: 1,
      }];

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
              deliveryAddress
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

  useEffect(() => {
    fetchProductDetails();
  }, [ProductID]);

  if (error) {
    return <div className="text-center text-red-500 text-xl font-semibold">{error}</div>;
  }

  if (!product) {
    return <div className="text-center text-lg font-medium text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li><Link to="/products" className="text-blue-600 hover:text-blue-800">Products</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-600">{product.Name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="relative group">
                <img
                  src={product.Image}
                  alt={product.Name}
                  className="w-full h-[500px] object-cover rounded-xl"
                />

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.Name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl">
                  <span className="text-3xl font-bold">₹{product.Price}</span>
                </div>
                <div className={`px-4 py-2 rounded-lg ${product.Stock > 10 ? 'bg-green-100 text-green-800' :
                  product.Stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {product.Stock > 10 ? 'In Stock' :
                    product.Stock > 0 ? `Only ${product.Stock} left` :
                      'Out of Stock'}
                </div>
              </div>
              <p className='text-gray-400 py-3 '>Delivery able in 3-5 business days</p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.Description}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => dispatch(addToCart(product))}
                  disabled={product.Stock === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button className="px-8 py-4 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors duration-300"
                  onClick={handlePayment}>
                  Buy Now
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.Features.split('\n').map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaShieldAlt className="text-3xl text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-800">30 Day Guarantee</h3>
            <p className="text-sm text-gray-600 text-center">Money back guarantee</p>
          </div>

          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaExchangeAlt className="text-3xl text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-800">Easy Returns</h3>
            <p className="text-sm text-gray-600 text-center">15 days return policy</p>
          </div>

          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaHeadset className="text-3xl text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-800">24/7 Support</h3>
            <p className="text-sm text-gray-600 text-center">Contact our support team</p>
          </div>

          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FaTruck className="text-3xl text-orange-500 mb-2" />
            <h3 className="font-semibold text-gray-800">Fast Delivery</h3>
            <p className="text-sm text-gray-600 text-center">Quick & secure shipping</p>
          </div>
        </div>
      </div>
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

        {/* // Update Dialog Content section */}
        <DialogContent sx={{ mt: 3 }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
            >
              {/* Existing address Paper component */}
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

              {/* New address Paper component */}
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
                  <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={addressDetails.street}
                      onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                      placeholder="House/Flat No., Building, Street"
                      required
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <FormControl fullWidth required>
                        <InputLabel id="state-select-label">State</InputLabel>
                        <Select
                          labelId="state-select-label"
                          id="state-select"
                          value={addressDetails.state}
                          label="State"
                          onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                        >
                          {states.map((state) => (
                            <MenuItem key={state} value={state}>
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth required disabled={!addressDetails.state}>
                        <InputLabel id="city-select-label">City</InputLabel>
                        <Select
                          labelId="city-select-label"
                          id="city-select"
                          value={addressDetails.city}
                          label="City"
                          onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                        >
                          {cities.map((city) => (
                            <MenuItem key={city} value={city}>
                              {city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField
                        label="Pincode"
                        value={addressDetails.pincode}
                        onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                        error={addressDetails.pincode && !/^\d{6}$/.test(addressDetails.pincode)}
                        helperText={addressDetails.pincode && !/^\d{6}$/.test(addressDetails.pincode) ? "Enter valid 6-digit pincode" : ""}
                        required
                      />
                      <TextField
                        label="Landmark (Optional)"
                        value={addressDetails.landmark}
                        onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                      />
                    </Box>
                  </Box>
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
            disabled={selectedAddress === 'new' && !isValidAddress()}
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

      <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Write a Review
          </button>
        </div>

        <div className="space-y-6">
          {reviews.length > 0 ? (reviews.map((review) => (
            <div key={review.ReviewID} className="border-b pb-6">
              <div className="flex items-center gap-4 mb-2">
                <StarRating rating={review.Rating} />
                <span className="text-gray-600">{review?.Customer?.Name}</span>
                <span className="text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.ReviewText}</p>
            </div>
          ))) : (<p className="text-gray-600">No reviews yet</p>)}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-700">Rate this product</p>
              <StarRating
                rating={userRating}
                onRatingChange={setUserRating}
                onHover={setHover}
                onLeave={() => setHover(null)}
              />
            </div>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Write your review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewModal(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={!userRating || !reviewText.trim()}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>


    </div>

  );
};

export default ProductDetails;
