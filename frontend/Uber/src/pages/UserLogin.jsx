import React, { useContext, useState,useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext, useUserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {user, setUser} = useUserContext();

  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState('');
useEffect(() => {
  console.log("Updated user context value:", user);
  console.log(generalError);
}, [user]);
  const SubmitHandler = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    const data = {
      email,
      password,
    };
console.log(data);

    try {
    const response = await axiosInstance.post(
      '/api/v1/user/login',
      data,
      {
        withCredentials: true,
       
      }
    );
setUser(response.data);
      console.log(" login resposne from the backend to the frontend",response);
    

      setEmail('');
      setPassword('');
      navigate('/home');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && Array.isArray(data.errors)) {
          const newFieldErrors = {};
          data.errors.forEach((err) => {
            if (err.path && err.msg) {
              newFieldErrors[err.path] = err.msg;
            }
          });
          setFieldErrors(newFieldErrors);
        } else if ([420, 421, 422].includes(status)) {
          setGeneralError(data.message || 'Something went Wrong');
    
        } else {
          setGeneralError('An unexpected error occurred');
        }
      } else {
        setGeneralError('Server error');
       
      }
    }
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-bottom"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1554672408-730436b60dde?w=1400&auto=format&fit=crop&q=60')",
        backgroundPositionY: '40%',
      }}
    >
      <div className="absolute top-[30%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-sm px-4 sm:px-0">
        <div className="bg-transparent bg-opacity-90 rounded-lg shadow-xl p-2 sm:p-8">
          <form className="flex flex-col gap-5" onSubmit={SubmitHandler}>
            <img
              className="w-20"
              src="https://download.logo.wine/logo/Uber/Uber-Logo.wine.png"
              alt="Uber Logo"
            />

            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`px-4 py-3 border rounded text-lg focus:outline-none ${
                fieldErrors.email
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-black focus:ring-black'
              }`}
            />
            {fieldErrors.email && (
              <span className="text-red-600 text-sm">{fieldErrors.email}</span>
            )}

            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`px-4 py-3 border rounded text-lg focus:outline-none ${
                fieldErrors.password
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-black focus:ring-black'
              }`}
            />
            {fieldErrors.password && (
              <span className="text-red-600 text-sm">{fieldErrors.password}</span>
            )}

            {generalError && (
              <div className="text-center text-red-600 text-sm">{generalError}</div>
            )}

            <button className="bg-black text-white py-3 rounded font-semibold text-lg hover:bg-gray-800 transition">
              Login
            </button>

            <div className="flex justify-center text-xs text-black">
              <span>New here?&nbsp;</span>
              <Link to="/Signup" className="text-blue-800 underline">
                Create Account
              </Link>
            </div>

            <Link to="/Driver-login">
              <button
                type="button"
                className="bg-transparent inline-block text-white py-3 w-full rounded font-semibold text-lg hover:bg-gray-800 transition"
              >
                Sign in as Driver
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;