import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import sign from '../assets/signup.jpg';
const validationSchema = yup.object().shape({
  Name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters'),

  Email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),

  Password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character'),

  Phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),

  Address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters'),

  Image: yup
    .mixed()
    .required('Profile image is required')
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value[0]) return true;
      return value[0].size <= 5000000;
    })
    .test('fileType', 'Unsupported file format', (value) => {
      if (!value[0]) return true;
      return ['image/jpeg', 'image/png', 'image/jpg'].includes(value[0].type);
    })
});

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {

    let tid = toast.loading('Creating Account...');
    console.log(data);
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const formData = new FormData();
      formData.append('Name', data.Name);
      formData.append('Email', data.Email);
      formData.append('Password', data.Password);
      formData.append('Address', data.Address);
      formData.append('Phone', data.Phone);
      formData.append('Image', data.Image[0]);

      
      const Email = data.Email;

      // First API call to initiate signup and send OTP

      const response = await axios.post(`${BASE_URL}/auth/initiate-signup`, formData);


      // console.log(response);
      if (response.data.success) {


        // Navigate to OTP verification
        toast.dismiss(tid);
        toast.success('OTP sent to your email');
        navigate('/verify-otp', {
          state: {
            email: data.Email,
            isSignup: true
          }
        });
      }
      else {
        toast.dismiss(tid);
        console.log(response);
        toast.error(response.data.message || 'Something went wrong');
      }

    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.message || 'Something went wrong');
      console.log(err);
    }

  };

  const handleImageChange = (e) => {
    console.log("hello")
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[!@#$%^&*]/)) strength += 25;
    if (password.length >= 8) strength += 25;
    return strength;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="flex flex-col items-center justify-between w-full max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8 sm:flex-row">
        <div className="hidden w-1/2 lg:block">
          <img src={sign} alt="Signup" className="object-cover w-full h-full rounded-2xl shadow-2xl" />
        </div>

        <div className="w-full max-w-xl p-8 space-y-6 bg-white rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-center text-gray-800">Create Account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                {...register('Name')}
                className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${errors.Name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                placeholder="John Doe"
              />
              {errors.Name && (
                <p className="text-sm text-red-500">{errors.Name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register('Email')}
                className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${errors.Email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                placeholder="john@example.com"
              />
              {errors.Email && (
                <p className="text-sm text-red-500">{errors.Email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('Password')}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${errors.Password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {watch('Password') && (
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(watch('Password')) <= 25
                        ? 'bg-red-500'
                        : getPasswordStrength(watch('Password')) <= 50
                          ? 'bg-yellow-500'
                          : getPasswordStrength(watch('Password')) <= 75
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                        }`}
                      style={{ width: `${getPasswordStrength(watch('Password'))}%` }}
                    />
                  </div>
                </div>
              )}
              {errors.Password && (
                <p className="text-sm text-red-500">{errors.Password.message}</p>
              )}
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                {...register('Phone')}
                className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${errors.Phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                placeholder="1234567890"
              />
              {errors.Phone && (
                <p className="text-sm text-red-500">{errors.Phone.message}</p>
              )}
            </div>

            {/* Address Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <textarea
                {...register('Address')}
                className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all ${
                  errors.Address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                }`}
                rows="3"
                placeholder="Your complete address include street, city, state and pincode"
              />
              {errors.Address && (
                <p className="text-sm text-red-500">{errors.Address.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                {...register('Image')}
                onChange={handleImageChange}
                required
                className="block w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              {errors.Image && (
                <p className="text-sm text-red-500">{errors.Image.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;