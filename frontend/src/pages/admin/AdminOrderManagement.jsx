import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaSearch, FaSort, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const { token } = useSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);

    const handleSearch = (value) => {
        setSearchTerm(value);
        const filtered = orders.filter((order) =>
            order.HistoryID.toString().includes(value) ||
            order.Customer?.Name.toLowerCase().includes(value.toLowerCase()) ||
            order.Product?.Name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOrders(filtered);
    };

    const handleFilterStatus = (status) => {
        setStatusFilter(status);
        const filtered = orders.filter((order) =>
            status ? order.Status === status : true
        );
        setFilteredOrders(filtered);
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(BASE_URL + '/admin/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrders(data.orders);
            console.log(data.orders);   
            setFilteredOrders(data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (historyId, status) => {
        const tid=toast.loading('Updating status...');
        try {
            const { data } = await axios.put(BASE_URL + '/admin/orders/updateOrderStatus', {
                historyId,
                status,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.dismiss(tid);
            toast.success(data.message);
            fetchOrders();
        } catch (error) {
            toast.dismiss(tid);
            toast.error(error.response?.data?.message || 'Error updating status');
            console.error('Error updating status:', error);
        }
    };

    const handleRequestAction = async (historyId, action) => {
        const tid=toast.loading('Processing request...');
        try {
            const { data } = await axios.post(
                `${BASE_URL}/admin/orders/handleReturnOrReplaceRequest`,
                { historyId, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.dismiss(tid);
            toast.success(data.message);
            fetchOrders();

        } catch (error) {
            toast.dismiss(tid);
            toast.error(error.response?.data?.message || 'Error handling request');
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      };

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = (searchTerm || statusFilter ? filteredOrders : orders).slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Order Management</h1>
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
                <select
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => handleFilterStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Pending Approval">Return Or Replace</option>
                </select>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 ">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Price
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Update Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Request
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentOrders.map((order) => (
                            <tr key={order.HistoryID} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">#{order.HistoryID}</td>
                                <td className="px-6 py-4">{order.Customer?.Name || 'Unknown'} </td>
                                <td className="px-6 py-4">{order.Product?.Name || 'Unknown'} <br/>Order At {formatDate(order.createdAt)}</td>
                                <td className="px-6 py-4">{order.Quantity}</td>
                                <td className="px-6 py-4">₹{order.TotalPrice}</td>
                                <td className="px-6 py-4">{order.Status}</td>
                                <td className="px-6 py-4">
                                    {
                                        order.Status === 'Replace Approveed' ? 'Replace Approved' : order.Status === 'Return Approveed' ? 'Return Approved' : (<select
                                            value={order.Status}
                                            onChange={(e) => handleUpdateStatus(order.HistoryID, e.target.value)}
                                            className="px-3 py-1 rounded-full text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {/* <option value></option> */}
                                            <option value="Order Placed">Order Placed</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Canceled">Canceled</option>
                                            <option value="Pending Approval">Return Or Replace</option>
                                        </select>)
                                    }

                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.RequestType ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {order.RequestType || 'None'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {order.RequestType ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                    {order.RequestType} Request
                                                </span>
                                                {order.IsReplacement && (
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                        Replacement Order
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Reason:</span> {order.RequestReason}
                                            </p>
                                            {!order.ProcessedAt && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleRequestAction(order.HistoryID, 'Approve')}
                                                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                    >
                                                        <FaCheck className="inline mr-1" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestAction(order.HistoryID, 'Reject')}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <FaTimes className="inline mr-1" /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : 'None'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-end">
                <nav className="flex space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    {[...Array(Math.ceil((searchTerm || statusFilter ? filteredOrders : orders).length / ordersPerPage)).keys()].map(number => (
                        <button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            className={`px-3 py-1 rounded-lg border ${currentPage === number + 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                        >
                            {number + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil((searchTerm || statusFilter ? filteredOrders : orders).length / ordersPerPage)}
                        className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default AdminOrderManagement;
