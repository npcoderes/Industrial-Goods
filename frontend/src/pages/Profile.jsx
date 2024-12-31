import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setUserData } from '../slices/authSlice';

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Name: user?.Name || '',
    Email: user?.Email || '',
    Address: user?.Address || '',
    Phone: user?.Phone || '',
    Image: null,
  });
  const [imagePreview, setImagePreview] = useState(user?.Image);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, Image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tid = toast.loading('Updating profile...');
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/auth/update-profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.dismiss(tid);
        dispatch(setUserData(response.data.user));
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.dismiss(tid);
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg transition-transform transform hover:scale-[1.01]">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{isEditing ? 'Edit Profile' : 'My Profile'}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            {isEditing ? <FaTimes size={20} /> : <FaEdit size={20} />}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          <div className="relative flex flex-col items-center">
            <div className="relative group">
              <img
                src={imagePreview || user.Image}
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-gray-300 object-cover shadow-md transition-transform duration-300 hover:scale-110"
              />
              {isEditing && (
                <label
                  htmlFor="profile-image"
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <FaCamera className="text-white text-3xl" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Name', 'Email', 'Address', 'Phone'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-600">{field}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100 shadow-sm"
                  />
                ) : (
                  <p className="px-4 py-2 mt-1 border rounded-md bg-gray-50 shadow-sm">
                    {user[field]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div>
            {isEditing ? (
              <button
                type="submit"
                className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg hover:from-purple-600 hover:to-blue-500 transition"
              >
                <FaSave className="inline mr-2" />
                Save Changes
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
