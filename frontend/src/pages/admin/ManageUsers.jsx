import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
    FaSearch, FaUserEdit, FaTrashAlt, FaUserPlus,
    FaUsers, FaUserCheck, FaUserSlash
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
    Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, TextField,
    IconButton, InputAdornment, Avatar,
    CircularProgress, Grid, Box, Card, CardContent,
    Typography, Chip,
    Stack
} from '@mui/material';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const { token } = useSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userStats, setUserStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });
    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        const filtered = users.filter((user) =>
            user.Name.toLowerCase().includes(value.toLowerCase()) ||
            user.Email.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/manageuser/getCustomers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.customers);

            setFilteredUsers(response.data.customers);
            setUserStats({
                total: response.data.customers.length,
                active: response.data.customers.filter((user) => user.Status === 'Active').length,
                inactive: response.data.customers.filter((user) => user.Status === 'Inactive').length
            })
        } catch (error) {
            toast.error('Failed to fetch users');
        }
    };

    const handleEditUser = (user) => {
        setDialogData(user);
        setEditMode(true);
        setDialogOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`${BASE_URL}/manageuser/deleteCustomer/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleSaveUser = async () => {
        try {
            if (editMode) {
                await axios.put(`${BASE_URL}/manageuser/updateCustomer/${dialogData.CustomerID}`, dialogData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('User updated successfully');
            } else {
                
                await axios.post(`${BASE_URL}/manageuser/createCustomer`, dialogData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('User created successfully');
            }
            fetchUsers();
            setDialogOpen(false);
            setDialogData({});
        } catch (error) {
            toast.error('Failed to save user');
        }
    };

    const openDialog = () => {
        setDialogData({});
        setEditMode(false);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setDialogData({});
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Stats Cards */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    mb: 8
                }}
            >
                <Box className="w-96 max-md:w-64" >
                    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="flex items-center">
                            <FaUsers className="text-4xl text-blue-500 mr-4" />
                            <div>
                                <Typography color="textSecondary">Total Users</Typography>
                                <Typography variant="h4">{userStats.total}</Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Box>

             </Box>

            {/* Header and Search */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={4}
                sx={{ mb: 4 }}
            >
                <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
                <div className="flex gap-4">
                    <TextField
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        variant="outlined"
                        size="small"
                        className="min-w-[300px]"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openDialog}
                        startIcon={<FaUserPlus />}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add User
                    </Button>
                </div>
            </Stack>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        <CircularProgress size={24} />
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.CustomerID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Avatar className="mr-4">{user.Name[0]}</Avatar>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.Name}</div>
                                                    <div className="text-sm text-gray-500">{user.Role || 'Customer'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.Email}</div>
                                            <div className="text-sm text-gray-500">{user.Phone}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <IconButton
                                                onClick={() => handleEditUser(user)}
                                                color="primary"
                                                size="small"
                                                className="mr-2"
                                            >
                                                <FaUserEdit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => confirmDelete(user)}
                                                color="error"
                                                size="small"
                                            >
                                                <FaTrashAlt />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit User Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle className="bg-gray-50 border-b">
                    {editMode ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent className="mt-4">
                    <Stack spacing={3}>
                        <Box>
                            <TextField
                                label="Full Name"
                                fullWidth
                                value={dialogData.Name || ''}
                                 
                                onChange={(e) => setDialogData({ ...dialogData, Name: e.target.value })}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: { xs: 'column', md: 'row' }
                        }}>
                            <TextField
                                label="Email"
                                fullWidth
                                value={dialogData.Email || ''}
                                onChange={(e) => setDialogData({ ...dialogData, Email: e.target.value })}
                            />
                            <TextField
                                label="Phone"
                                fullWidth
                                value={dialogData.Phone || ''}
                                onChange={(e) => setDialogData({ ...dialogData, Phone: e.target.value })}
                            />
                        </Box>

                        <Box>
                            <TextField
                                label="Address"
                                fullWidth
                                multiline
                                rows={2}
                               
                                value={dialogData.Address || ''}
                                onChange={(e) => setDialogData({ ...dialogData, Address: e.target.value })}
                            />
                        </Box>

                    </Stack>
                </DialogContent>
                <DialogActions className="bg-gray-50 border-t p-4">
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button
                        onClick={handleSaveUser}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete user "{userToDelete?.Name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            handleDeleteUser(userToDelete.CustomerID);
                            setDeleteDialogOpen(false);
                        }}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManageUsers;