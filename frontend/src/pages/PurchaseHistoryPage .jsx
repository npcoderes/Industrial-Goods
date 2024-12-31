import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaShoppingBag, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';



const BASE_URL = process.env.REACT_APP_BASE_URL;
const PurchaseHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState({ historyId: null, type: '' });
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestClick = (historyId, requestType) => {
    setSelectedRequest({ historyId, type: requestType });
    setIsModalOpen(true);
    setReason('');
  };

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(BASE_URL + '/customer/purchase-history',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        console.log(data.history);
        setHistory(data.history);
      } else {
        setError(data.message || 'Failed to fetch purchase history.');
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHistory();
  }, []);
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await axios.post(BASE_URL + '/customer/request-return-or-replace', {
        historyId: selectedRequest.historyId,
        requestType: selectedRequest.type,
        reason,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      fetchHistory();
      setIsModalOpen(false);
    } catch (error) {

      toast.error(error.response?.data?.message || 'Error creating request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (historyId) => {
    try {
      const { data } = await axios.post(BASE_URL + '/customer/cancel-order', { historyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(data.message);
      fetchHistory();
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };


  const isWithinReturnWindow = (purchaseDate) => {
    const returnWindow = 15; // 15 days return window
    const purchaseDateTime = new Date(purchaseDate).getTime();
    const currentDateTime = new Date().getTime();
    const diffDays = Math.ceil((currentDateTime - purchaseDateTime) / (1000 * 60 * 60 * 24));
    return diffDays <= returnWindow;
  };


  if (loading) {
    return <div className="text-center mt-8">Loading purchase history...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <>
      <div className='bg-[#0B101B] p-4  mb-4 flex items-center justify-center'>
        <h1 className="text-3xl font-bold text-center p-4 text-white">Purchase History</h1>

      </div>

      <div className="container mx-auto p-4 min-h-screen bg-gray-50">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mt-8 p-4 bg-red-100 rounded-lg">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FaShoppingBag className="text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No purchase history found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {history.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={purchase.Product.Image}
                    alt={purchase.Product.Name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 right-0 m-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${purchase.Status === 'completed' ? 'bg-green-100 text-green-800' :
                      purchase.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {purchase.Status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{purchase.Product.Name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Order ID: #{purchase.HistoryID}</p>
                    <p>Quantity: {purchase.Quantity}</p>
                    <p>Total: ₹{purchase.TotalPrice}</p>
                    <p>Date: {format(new Date(purchase.createdAt), 'PPP')}</p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    {purchase.Status === 'Order Placed' && (
                      <button
                        onClick={() => handleCancel(purchase.HistoryID)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                      >
                        Cancel Order
                      </button>
                    )}
                    {purchase.Status === 'Delivered' && (
                      <div className="space-y-2">
                        <div className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-2" />
                          Delivered
                        </div>

                        {isWithinReturnWindow(purchase.createdAt) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRequestClick(purchase.HistoryID, 'Return')}
                              className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                            >
                              Return
                            </button>
                            <button
                              onClick={() => handleRequestClick(purchase.HistoryID, 'Replace')}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Replace
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Return window expired (15 days)
                          </span>
                        )}
                      </div>
                    )}
                    {purchase.Status === 'cancelled' && (
                      <div className="flex items-center text-red-600">
                        <FaTimesCircle className="mr-2" />
                        Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                {selectedRequest.type} Request
              </h3>
              <form onSubmit={handleRequest}>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Please provide a reason for your ${selectedRequest.type.toLowerCase()} request`}
                  className="w-full p-3 border rounded-lg mb-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>

  );
};

export default PurchaseHistoryPage;


