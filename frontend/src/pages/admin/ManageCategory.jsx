import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const ManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const { token } = useSelector(state => state.auth)
    const [form, setForm] = useState({
        CategoryName: "",
        Description: "",
        CategoryID: null, // Null when creating a new category
        Active: true,
    });
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const response = await axios.get(BASE_URL + "/admin/getCategories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCategories(response.data.categories);
            console.log(response.data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error.message);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                // Update category
                await axios.put(BASE_URL + "/admin/updateCategory", form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success("Category updated successfully!");
            } else {
                // Create category
                await axios.post(BASE_URL + "/admin/createCategory", form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                toast.success("Category created successfully!");
            }
            setForm({ CategoryName: "", Description: "", CategoryID: null, Active: true });
            setIsEditMode(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Failed to save category. Please try again.",error);
        }
    };

    // Handle edit click
    const handleEdit = (category) => {
        setForm(category);
        setIsEditMode(true);
    };

    // Handle delete click (set inactive)
    const handleToggleActive = async (CategoryID, currentStatus) => {
        try {
            const updatedStatus = !currentStatus; // Toggle the status
    
            await axios.put(
                BASE_URL + "/admin/updateCategory",
                {
                    CategoryID,
                    Active: updatedStatus, // Set the opposite status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            
            toast.success(`Category set to ${updatedStatus ? "active" : "inactive"}!`);
            fetchCategories(); // Refresh the categories
        } catch (error) {
            console.error("Error toggling category status:", error.message);
            toast.error("Failed to update category status. Please try again.");
        }
    };
    

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="container mx-auto p-4 mt-10">
            <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>

            {/* Category Form */}
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">{isEditMode ? "Edit Category" : "Create Category"}</h2>
                <div className="mb-4">
                    <label className="block font-medium">Category Name</label>
                    <input
                        type="text"
                        value={form.CategoryName}
                        onChange={(e) => setForm({ ...form, CategoryName: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-medium">Description</label>
                    <textarea
                        value={form.Description}
                        onChange={(e) => setForm({ ...form, Description: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {isEditMode ? "Update Category" : "Create Category"}
                </button>
            </form>

            {/* Categories List */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">ID</th>
                        <th className="border border-gray-300 p-2">Name</th>
                        <th className="border border-gray-300 p-2">Description</th>
                        <th className="border border-gray-300 p-2">Status</th>
                        <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody className="max-sm:text-xs">
                    {categories.map((category) => (
                        <tr key={category.CategoryID}>
                            <td className="border border-gray-300 p-2">{category.CategoryID}</td>
                            <td className="border border-gray-300 p-2">{category.CategoryName}</td>
                            <td className="border border-gray-300 p-2">{category.Description}</td>
                            <td className="border border-gray-300 p-2">
                                {category.Active ? "Active" : "Inactive"}
                            </td>
                            <td className="border border-gray-300 p-2">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="px-2 py-1 max-sm:p-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggleActive(category.CategoryID, category.Active)}
                                    className="px-2 py-1 max-sm:p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    {category.Active ? " Set Inactive" : " Set Active"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCategory;
