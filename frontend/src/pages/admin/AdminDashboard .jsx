import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { FaFileDownload, FaSpinner } from 'react-icons/fa';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
    const { token } = useSelector(state => state.auth);
    const [stats, setStats] = useState({
        orders: [],
        returns: [],
        revenue: [],
        products: []
    });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date()
    });
    const [filterType, setFilterType] = useState('all');
    
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
  

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            }
        },
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return label === 'Revenue' ? `₹${value}` : value;
                    }
                }
            }
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [orders, returns, revenue, products] = await Promise.all([
                axios.get(`${process.env.REACT_APP_BASE_URL}/admin/generateReport`, {
                    params: {
                        reportType: 'orders',
                        startDate: dateRange.start.toISOString(),
                        endDate: dateRange.end.toISOString(),
                        filterType
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_BASE_URL}/admin/generateReport`, {
                    params: {
                        reportType: 'returns',
                        startDate: dateRange.start.toISOString(),
                        endDate: dateRange.end.toISOString()
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_BASE_URL}/admin/generateReport`, {
                    params: {
                        reportType: 'revenue',
                        startDate: dateRange.start.toISOString(),
                        endDate: dateRange.end.toISOString()
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_BASE_URL}/admin/generateReport`, {
                    params: {
                        reportType: 'products',
                        startDate: dateRange.start.toISOString(),
                        endDate: dateRange.end.toISOString()
                    },
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats({
                orders: orders.data.data || [],
                returns: returns.data.data || [],
                revenue: revenue.data.data || [],
                products: products.data.data || []
            });
            setProducts(products.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!products.length) return;
    
        switch (filterType) {
          case 'bestsellers':
            setFilteredProducts(
              products.sort((a, b) => b.totalSold - a.totalSold).slice(0, 10)
            );
            break;
          case 'mostReturned':
            setFilteredProducts(
              products.sort((a, b) => 
                (b.returns?.length || 0) - (a.returns?.length || 0)
              ).slice(0, 10)
            );
            break;
          case 'mostReplaced':
            setFilteredProducts(
              products.sort((a, b) => 
                (b.replaces?.length || 0) - (a.replaces?.length || 0)
              ).slice(0, 10)
            );
            break;
          default:
            setFilteredProducts(products);
        }
      }, [filterType, products]);

    const exportToExcel = () => {
        if (!stats.orders.length) {
            toast.error('No data to export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Format data for export
            const orderData = stats.orders.map(order => ({
                'Date': new Date(order.date).toLocaleDateString(),
                'Orders': order.totalOrders,
                'Revenue': `₹${order.totalRevenue}`
            }));

            const returnData = stats.returns.map(ret => ({
                'Product': ret.Product?.Name,
                'Reason': ret.Reason,
                'Count': ret.count
            }));

            const revenueData = stats.revenue.map(rev => ({
                'Date': new Date(rev.date).toLocaleDateString(),
                'Revenue': `₹${rev.revenue}`
            }));

            // Add sheets
            const sheets = {
                'Orders': orderData,
                'Returns': returnData,
                'Revenue': revenueData
            };

            Object.entries(sheets).forEach(([name, data]) => {
                const ws = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, name);
            });

            XLSX.writeFile(wb, `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    const exportToPDF = () => {
        if (!stats.orders.length) {
            toast.error('No data to export');
            return;
        }
    
        try {
            // Create new PDF with A3 size in landscape
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3'
            });
            
            // Header with adjusted positions for A3
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 0, 420, 50, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(32);
            doc.text("Sales Report", 30, 30);
            doc.setFontSize(16);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 30, 45);
    
            // Reset text color
            doc.setTextColor(0, 0, 0);
    
            // Period Info with adjusted position
            doc.setFontSize(18);
            doc.text(`Report Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`, 30, 70);
    
            // Summary Section
            doc.setFontSize(24);
            doc.setTextColor(41, 128, 185);
            doc.text("Summary", 30, 90);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
    
            const totalRevenue = stats.revenue.reduce((acc, curr) => acc + Number(curr.revenue), 0);
            const avgOrderValue = totalRevenue / stats.orders.length;
    
            const summaryData = [
                [`Total Orders: ${stats.orders.length}`, `Daily Average: ${(stats.orders.length / 30).toFixed(1)}`],
                [`Total Returns: ${stats.returns.length}`, `Return Rate: ${((stats.returns.length / stats.orders.length) * 100).toFixed(1)}%`],
                [`Total Revenue: ₹${totalRevenue.toFixed(2)}`, `Avg Order Value: ₹${avgOrderValue.toFixed(2)}`]
            ];
    
            let yPos = 105;
            summaryData.forEach(row => {
                doc.text(row[0], 30, yPos);
                doc.text(row[1], 200, yPos);
                yPos += 15;
            });
    
            // Top Products Section with more spacing
            doc.setFontSize(24);
            doc.setTextColor(41, 128, 185);
            doc.text("Top Products", 30, yPos + 30);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
    
            // Table headers
            yPos += 50;
            doc.setFillColor(240, 240, 240);
            doc.rect(30, yPos - 10, 360, 12, 'F');
            doc.text("Product Name", 35, yPos);
            doc.text("Sales", 180, yPos);
            doc.text("Returns", 250, yPos);
            doc.text("Replaces", 320, yPos);
    
            // Table content
            stats.products.forEach((product, index) => {
                yPos += 15;
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(30, yPos - 10, 360, 12, 'F');
                }
                doc.text(`${index + 1}. ${product.Product.Name}`, 35, yPos);
                doc.text(`${product.totalSold}`, 180, yPos);
                doc.text(`${product.returns.length || 0}`, 250, yPos);
                doc.text(`${product.replaces.length || 0}`, 320, yPos);
            });
    
            // Footer with adjusted position
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(12);
            doc.setTextColor(128, 128, 128);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.width - 40,
                    doc.internal.pageSize.height - 20
                );
            }
    
            doc.save(`detailed_report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    useEffect(() => {
        fetchStats();
    }, [dateRange, filterType]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <div className="flex gap-4">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <div className="flex gap-4">
                                <DatePicker
                                    label="Start Date"
                                    value={dateRange.start}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={dateRange.end}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </div>
                        </LocalizationProvider>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Filter Type</InputLabel>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                label="Filter Type"
                            >
                                <MenuItem value="all">All Products</MenuItem>
                                <MenuItem value="bestsellers">Best Sellers</MenuItem>
                                <MenuItem value="mostReturned">Most Returned</MenuItem>
                                <MenuItem value="mostReplaced">Most Replaced</MenuItem>
                            </Select>
                        </FormControl>
                        <button 
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                        >
                            <FaFileDownload /> Export Report
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                        >
                            <FaFileDownload /> Export PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-blue-500">
                            {stats.orders.reduce((acc, curr) => acc + curr.totalOrders, 0)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Total Returns</h3>
                        <p className="text-3xl font-bold text-red-500">
                            {stats.returns.reduce((acc, curr) => acc + curr.count, 0)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-500">
                            ₹{stats.revenue.reduce((acc, curr) => acc + Number(curr.revenue), 0).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Order Trends</h3>
                        <div className="h-80">
                            <Line
                                options={chartOptions}
                                data={{
                                    labels: stats.orders.map(order => new Date(order.date).toLocaleDateString()),
                                    datasets: [{
                                        label: 'Orders',
                                        data: stats.orders.map(order => order.totalOrders),
                                        borderColor: 'rgb(59, 130, 246)',
                                        tension: 0.1
                                    }]
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                        <div className="h-80">
                            <Bar
                                options={chartOptions}
                                data={{
                                    labels: stats.revenue.map(rev => new Date(rev.date).toLocaleDateString()),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: stats.revenue.map(rev => rev.revenue),
                                        backgroundColor: 'rgb(34, 197, 94)'
                                    }]
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-left">Total Sales</th>
                                    <th className="px-4 py-2 text-left">Returns</th>
                                    <th className="px-4 py-2 text-left">Replacements</th>
                                    <th className="px-4 py-2 text-left">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 cursor-pointer">
                                        <td className="px-4 py-2">{product.Product.Name}</td>
                                        <td className="px-4 py-2">{product.totalSold}</td>
                                        <td className="px-4 py-2">
                                            {product.returns.length || 0}
                                            {product.returns.map((ret, idx) => (
                                                <div key={idx} className="text-sm text-gray-600">
                                                    {ret.reason}: {ret.count}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-4 py-2">
                                            {product.replaces.length || 0}
                                            {product.replaces.map((rep, idx) => (
                                                <div key={idx} className="text-sm text-gray-600">
                                                    {rep.reason}: {rep.count}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-4 py-2">₹{product.totalRevenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default AdminDashboard;