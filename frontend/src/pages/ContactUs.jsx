import React, { useState } from 'react';
import { useEffect } from 'react';

import { motion } from 'framer-motion';
import { Box, Container, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import { MdLocationOn, MdPhone, MdEmail, MdPerson } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdMessage, MdSend } from 'react-icons/md';
import { CircularProgress } from '@mui/material';
import contactus from '../assets/contactus.svg'

// Add map configuration

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const validateForm = (data) => {
    const newErrors = {};

    // Name validation
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (/\d/.test(data.name)) {
      newErrors.name = 'Name cannot contain numbers';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!phoneRegex.test(data.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    // Message validation
    if (!data.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (data.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    setLoading(true);
    let tid = toast.loading('Submitting query...');
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/contact/submit-query`,
        formData
      );
      toast.dismiss(tid);
      toast.success('Query submitted successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.dismiss(tid);
      toast.error('Failed to submit query');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      pt: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{
            textAlign: 'center',
            mb: 8,
            p: 6,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
          }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                mb: 2
              }}
            >
              D.S. ENTERPRISE
            </Typography>
            <Typography variant="h5" sx={{ color: '#546e7a' }}>
              ONE STEP SOLUTION
            </Typography>
          </Box>
        </motion.div>

        {/* Contact Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4,
          mb: 8
        }}>
          {[
            {
              icon: <MdLocationOn size={40} />,
              title: 'Address',
              content: '23 Anandkun App, Opp Kothari Tower, Ramnagar Sabarmati Ahmedabad - 380005'
            },
            {
              icon: <MdPhone size={40} />,
              title: 'Contact',
              content: '+91 84011 24253\ndsent121191@gmail.com'
            },
            {
              icon: <MdPerson size={40} />,
              title: 'Owners',
              content: 'MR. DHARAV SHAH\nMR. VAIBHAV SHAH'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{
                  textAlign: 'center',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box sx={{
                    color: 'primary.main',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    opacity: 0.8
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-line' }}>
                    {item.content}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>


        {/* Query Form - existing code with enhanced styling... */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 1200,
          mx: 'auto',
          p: 4
        }}>
          {/* Left Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flex: 1 }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 6,
                borderRadius: 4,
                bgcolor: 'white',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
              }}
            >
              {/* ...existing form content... */}
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  mb: 4,
                  background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent'
                }}
              >
                Send us a Message
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    validateForm({ ...formData, name: e.target.value });
                  }}
                  required
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: <MdPerson className="text-gray-400 mr-2" size={20} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    validateForm({ ...formData, email: e.target.value });
                  }}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: <MdEmail className="text-gray-400 mr-2" size={20} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                    validateForm({ ...formData, phone: value });
                  }}
                  required
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: <MdPhone className="text-gray-400 mr-2" size={20} />
                  }}
                />

                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    validateForm({ ...formData, message: e.target.value });
                  }}
                  required
                  error={!!errors.message}
                  helperText={errors.message}
                  InputProps={{
                    startAdornment: <MdMessage className="text-gray-400 mr-2 mt-2" size={20} />
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || loading}
                // ...existing button props...
                >
                  {loading ? <CircularProgress size={24} /> : 'Send Message'}
                </Button>
              </Box>
            </Box>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <img
              src={contactus}
              alt="Contact Us"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
              }}
            />
          </motion.div>
        </Box>


      </Container>
    </Box>
  );
};

export default ContactUs;