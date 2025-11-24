import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import BlogCard from './BlogCard';
import '../../styles/blog.css';

const BlogList = ({
  limit = 6,
  category = 'all',
  title = 'Latest Articles',
  subtitle = ''
}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, category]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (category && category !== 'all') {
        params.append('category', category);
      }

      const response = await api.get(`/blog?${params.toString()}`);

      if (response.data.success) {
        setBlogs(response.data.blogs || []);
      } else {
        setError('Failed to load blogs');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-list">
        <div className="blog-list__loading">
          <div style={{ fontSize: '24px' }}>Loading articles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list">
        <div className="blog-list__empty">
          <div className="blog-list__empty-text">{error}</div>
        </div>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="blog-list">
        {title && (
          <div className="blog-list__header">
            <h2 className="blog-list__title">{title}</h2>
            {subtitle && <p className="blog-list__subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="blog-list__empty">
          <div className="blog-list__empty-icon">📝</div>
          <div className="blog-list__empty-text">
            No articles available yet. Check back soon!
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="blog-list">
      {title && (
        <div className="blog-list__header">
          <h2 className="blog-list__title">{title}</h2>
          {subtitle && <p className="blog-list__subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="blog-list__grid">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default BlogList;
