import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/layout/Layout';

export default function BlogHub() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/admin/blog');

      if (response.data.success) {
        setBlogs(response.data.blogs || []);
      } else {
        setError('Failed to load blogs');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('You do not have permission to view blogs. Admin access required.');
      } else {
        setError('Failed to load blogs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/blog/${blogId}`);
      // Refresh blogs list
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-indigo-600">Loading blogs...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Hub</h1>
          <button
            onClick={() => navigate('/blogs/create')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            + Create Blog
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-800 rounded-lg font-semibold">
            ❌ {error}
          </div>
        )}

        {/* Blogs Table */}
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-5xl mb-4">📝</div>
            <div className="text-lg text-gray-600 mb-6">
              No blogs yet. Create your first one!
            </div>
            <button
              onClick={() => navigate('/blogs/create')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Blog
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Published</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Views</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 mb-1">{blog.title}</div>
                      <div className="text-sm text-gray-500">/{blog.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {blog.published ? (
                        <span className="text-green-600 font-semibold">✓ Published</span>
                      ) : (
                        <span className="text-gray-400 font-semibold">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {blog.publishedAt ? formatDate(blog.publishedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {blog.views || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => window.open(`${import.meta.env.VITE_MAIN_APP_URL}/blog/${blog.slug}`, '_blank')}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-300 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id, blog.title)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-semibold hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl flex gap-8">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Blogs</div>
            <div className="text-2xl font-bold text-gray-900">{blogs.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Published</div>
            <div className="text-2xl font-bold text-green-600">
              {blogs.filter(b => b.published).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Views</div>
            <div className="text-2xl font-bold text-indigo-600">
              {blogs.reduce((sum, b) => sum + (b.views || 0), 0)}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
