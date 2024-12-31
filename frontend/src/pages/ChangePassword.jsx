import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TextField, Button, Paper, Typography, Container, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FaCheck, FaTimes, FaLock } from 'react-icons/fa';
import { IconButton, InputAdornment } from '@mui/material';
// use react icons 
import { FaEye,FaEyeSlash } from 'react-icons/fa';



const ChangePassword = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    
    const handleToggleVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const passwordRequirements = [
        { text: 'At least 8 characters long', test: (pwd) => pwd.length >= 8 },
        { text: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
        { text: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
        { text: 'Contains number', test: (pwd) => /\d/.test(pwd) },
        { text: 'Contains special character', test: (pwd) => /[!@#$%^&*]/.test(pwd) }
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!passwords.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        if (!passwords.newPassword) {
            newErrors.newPassword = 'New password is required';
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/auth/change-password`,
                {
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Password changed successfully');
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" className="mt-20">
            <Paper elevation={3} className="p-8">
                <Typography variant="h4" className="text-center pb-6">
                    Change Password
                </Typography>
                <form onSubmit={handleSubmit} className="space-y-6">
                <TextField
                fullWidth
                type={showPasswords.current ? "text" : "password"}
                label="Current Password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => handleToggleVisibility('current')}>
                                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <TextField
                fullWidth
                type={showPasswords.new ? "text" : "password"}
                label="New Password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => handleToggleVisibility('new')}>
                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <TextField
                fullWidth
                type={showPasswords.confirm ? "text" : "password"}
                label="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => handleToggleVisibility('confirm')}>
                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <Typography variant="subtitle1" className="mb-2">
                            Password Requirements:
                        </Typography>
                        <List dense>
                            {passwordRequirements.map((req, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        {req.test(passwords.newPassword) ? (
                                            <FaCheck className="text-green-500" />
                                        ) : (
                                            <FaTimes className="text-red-500" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText primary={req.text} />
                                </ListItem>
                            ))}
                        </List>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={<FaLock />}
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ChangePassword;