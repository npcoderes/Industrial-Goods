import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TextField, Button, Paper, Typography, Container } from '@mui/material';


const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(350); //  350 seconds = 5.8 minutes
    const location = useLocation();
    const navigate = useNavigate();
    const { email, isSignup } = location.state || {};

    useEffect(() => {


        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isSignup ? '/auth/verify-signup-otp' : '/auth/verify-otp';
            const payload = isSignup ? {
               Email: email,
                otp
            } : {
                Email: email,
                otp
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}${endpoint}`,
                payload
            );

            toast.success(response.data.message);
            sessionStorage.removeItem('signupData');
            navigate('/login');
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            const endpoint = isSignup ? '/auth/resend-signup-otp' : '/auth/forgot-password';
            const payload = isSignup ? {

                ...JSON.parse(sessionStorage.getItem('signupData'))
            } : {
                Email: email
            };
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}${endpoint}`, payload);

            toast.success('New OTP sent successfully');
            setTimer(600);
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <Container maxWidth="sm" className="mt-20">
            <Paper elevation={3} className="p-8">
                <Typography variant="h4" className="text-center mb-6">
                    Verify OTP
                </Typography>
                <Typography className="text-center mb-4 text-gray-600">
                    OTP has been sent to {email}
                </Typography>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <TextField
                        fullWidth
                        label="Enter OTP"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <div className="text-center text-gray-600">
                        Time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </div>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading || timer === 0}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    {timer === 0 && (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleResendOTP}
                        >
                            Resend OTP
                        </Button>
                    )}
                </form>
            </Paper>
        </Container>
    );
};

export default VerifyOTP;