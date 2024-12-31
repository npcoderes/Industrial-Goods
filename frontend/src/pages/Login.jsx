import React from 'react';
import login from '../assets/login.jpg';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { setUserData,setToken,setRole } from '../slices/authSlice';
import { Link } from 'react-router-dom';
const Login = () => {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    try {
      // this is backend api for login 
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      // console.log(result);
// we store result of use after login in local storage and in redux 
      if (result.success) {
        dispatch(setUserData(result.user));
        dispatch(setToken(result.token));
        dispatch(setRole(result.role));
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', JSON.stringify(result.token));
        localStorage.setItem('role', JSON.stringify(result.role));

        toast.success('Login successful!');
        // window.location.replace('/')
        navigate('/')
        // Dispatch login action or handle successful login
      } else {
        console.log(result);
        toast.error(result.error || 'Login failed!');
      }
    } catch (err) {
      console.log(err);
      toast.error('An error occurred. Please try again.');
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-3.5rem)] place-items-center  sm:flex-row max-w-[1200px] w-11/12 mx-auto">
      <div className=" lg:block lg:w-1/2">
        <img
          src={login} // Replace with your desired image URL
          alt="Industrial Goods"
          className="object-cover w-full h-full rounded-l-lg"
        />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg lg:w-1/2">
        <h1 className="text-3xl font-bold text-center text-gray-700">Welcome to Industrial Goods</h1>
        <p className="text-center text-gray-500">Please log in to continue</p>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-600" htmlFor="email">Email</label>
            <input
              type="email"
              id="Email"
              required
              className="block w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="you@example.com"
              {...register('Email')}
            />
          </div>
          <div className='relative'>
            <label className="block text-sm font-medium text-gray-600" htmlFor="password">Password</label>
            <input
             type={showPassword ? 'text' : 'password'}
              id="Password"
              required
              className="block w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="********"
              {...register('Password')}
            />
            <div
              className="absolute inset-y-0 right-0 top-6 flex items-center px-2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {/* forgot password */}
          <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</Link>


          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-[#422faf] rounded-md hover:bg-[#422faf]/60 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;