import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const fileInput = useRef(null);
  const [previewImage, setPreviewImage] = useState(null); // State for image preview
  const [form, setForm] = useState({
    ProductID: null, // Null when adding a product
    Name: '',
    Description: '',
    Features: '',
    Price: '',
    Stock: '',
    CategoryID: '',
    Image: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/getProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.products);
      console.log(response.data.products);
    } catch (error) {
      toast.error('Error fetching products!');
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/getCategories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Error fetching categories!');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    let toastId=toast.loading('Saving product...');
    try {
      const formData = new FormData();
      formData.append('ProductID', form.ProductID || ''); // Append ProductID (if editing)
      formData.append('Name', form.Name);
      formData.append('Description', form.Description);
      formData.append('Features', form.Features);
      formData.append('Price', form.Price);
      formData.append('Stock', form.Stock);
      formData.append('CategoryID', form.CategoryID);
      if (form.Image) {
        formData.append('Image', form.Image); // Append the image file
      }

      if (isEditMode) {
        await axios.put(`${BASE_URL}/admin/updateProduct`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Explicitly set multipart
          },
        });
        toast.dismiss(toastId);

        toast.success('Product updated successfully!');

      } else {
        await axios.post(`${BASE_URL}/admin/createProduct`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Explicitly set multipart
          },
        });
        toast.dismiss(toastId);
        toast.success('Product added successfully!');
      }

      setForm({
        ProductID: null,
        Name: '',
        Description: '',
        Price: '',
        Stock: '',
        CategoryID: '',
        Features: '',
        Image: null,

      });
      setIsEditMode(false);
      setPreviewImage(null); // Reset image preview
      fileInput.current.value = ''; // Clear file input
      fetchProducts();
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Error saving product:', error);
      toast.error('Error saving product!');
    }

  };


  // Handle edit
  const handleEdit = (product) => {
    setForm(product);
    setPreviewImage(product.Image); // Set the preview image if editing
    setIsEditMode(true);
  };

  // Handle delete
  const handleDelete = async (ProductID) => {
    try {
      await axios.delete(`${BASE_URL}/admin/deleteProduct/${ProductID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product!');
    }
  };
    // Handle file input change and generate preview
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setForm({ ...form, Image: file });
        setPreviewImage(URL.createObjectURL(file)); // Generate preview URL
      }
    };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-4 mt-5">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">{isEditMode ? 'Edit Product' : 'Add Product'}</h2>
        <input
          type="text"
          placeholder="Product Name"
          value={form.Name}
          onChange={(e) => setForm({ ...form, Name: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={form.Description}
          onChange={(e) => setForm({ ...form, Description: e.target.value })}
          className="w-full p-2 mb-4 border rounded "
          required
          rows={5}


        ></textarea>
        <textarea
          placeholder="Features"
          value={form.Features}
          onChange={(e) => setForm({ ...form, Features: e.target.value })}
          className="w-full p-2 mb-4 border rounded "
          required
          rows={5}

        ></textarea>
        <input
          type="number"
          placeholder="Price"
          value={form.Price}
          onChange={(e) => setForm({ ...form, Price: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.Stock}
          onChange={(e) => setForm({ ...form, Stock: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <select
          value={form.CategoryID}
          onChange={(e) => setForm({ ...form, CategoryID: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            category.Active &&
            <option key={category.CategoryID} value={category.CategoryID}>
              {category.CategoryName}
            </option>
          ))}
        </select>
          <input
          type="file"
          name="Image"
          ref={fileInput} // Attach ref to the file input
          onChange={handleFileChange} // Update file change handler
          className="w-full p-2 mb-4 border rounded"
          
        />
        {previewImage && (
          <div className="mb-4">
            <img
              src={previewImage}
              alt="Preview"
              className="w-24 h-24 object-cover rounded shadow"
            />
          </div>
        )}

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {isEditMode ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {/* Products Table */}
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.ProductID}>
              <td className="p-2 border">{product.Name}</td>
              <td className="p-2 border">{product.Category?.CategoryName || 'N/A'}</td>
              <td className="p-2 border">{product.Price}</td>
              <td className="p-2 border">{product.Stock}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.ProductID)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProduct;
