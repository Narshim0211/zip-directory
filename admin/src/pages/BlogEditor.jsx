import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Layout from '../components/layout/Layout';

export default function BlogEditor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    coverImage: '',
    content: '',
    excerpt: '',
    category: 'hair'
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Quill editor modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
    setError(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      setUploadingImage(true);
      setError(null);

      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await axios.post('/api/upload/blog-image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          coverImage: response.data.url
        }));
        setCoverImageFile(file);
      } else {
        setError('Failed to upload image');
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.coverImage.trim()) {
      setError('Please upload a cover image');
      return;
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      setError('Please add some content');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post('/api/admin/blog', formData);

      if (response.data.success) {
        setSuccess(true);

        // Reset form
        setFormData({
          title: '',
          coverImage: '',
          content: '',
          excerpt: '',
          category: 'hair'
        });

        // Show success message and redirect
        setTimeout(() => {
          navigate('/blogs');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create blog');
      }
    } catch (err) {
      console.error('Error creating blog:', err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('You do not have permission to create blogs. Admin access required.');
      } else {
        setError(err.response?.data?.message || 'Failed to create blog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Blog</h1>

        {success && (
          <div className="p-4 mb-6 bg-green-50 text-green-800 rounded-lg font-semibold">
            ✅ Blog created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-800 rounded-lg font-semibold">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="How to Grow Your Salon Business"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Image *
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setCoverImageFile(null);
                      setFormData(prev => ({ ...prev, coverImage: '' }));
                    }}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="coverImage"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadingImage ? (
                    <>
                      <div className="text-4xl mb-3">⏳</div>
                      <div className="text-gray-600 font-medium">Uploading image...</div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl mb-3">📸</div>
                      <div className="text-gray-700 font-semibold mb-1">
                        Click to upload cover image
                      </div>
                      <div className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </div>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="hair">Hair</option>
              <option value="nails">Nails</option>
              <option value="skin">Skin</option>
              <option value="makeup">Makeup</option>
              <option value="business">Business</option>
              <option value="trends">Trends</option>
            </select>
          </div>

          {/* Excerpt (Optional) */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
              Excerpt (Optional - will auto-generate if empty)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="A brief summary of your article (max 200 characters)"
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.excerpt.length}/200 characters
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content *
            </label>
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="Write your article content here..."
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
