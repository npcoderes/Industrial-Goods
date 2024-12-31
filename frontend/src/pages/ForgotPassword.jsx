import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TextField, Button, Paper, Typography, Container } from '@mui/material';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/forgot-password`, { Email: email });
            toast.success(response.data.message);
            navigate('/verify-otp', { 
                state: { 
                  email: email,
                  isSignup: false 
                }
              });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" className="mt-20">
            <Paper elevation={3} className="p-8">
                <Typography variant="h4" className="text-center pb-6">
                    Forgot Password
                </Typography>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ForgotPassword;