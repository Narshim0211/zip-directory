import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import DOMPurify from 'dompurify';
import BlogCard from './BlogCard';
import '../../styles/blog.css';

const BlogReader = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchBlog();
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch blog by slug
      const response = await api.get(`/blog/${slug}`);

      if (response.data.success && response.data.blog) {
        setBlog(response.data.blog);

        // Fetch related blogs
        fetchRelatedBlogs(slug);
      } else {
        setError('Blog not found');
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      if (err.response?.status === 404) {
        setError('Blog not found');
      } else {
        setError('Failed to load blog. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (currentSlug) => {
    try {
      const response = await api.get(`/blog/${currentSlug}/related?limit=3`);

      if (response.data.success) {
        setRelatedBlogs(response.data.blogs || []);
      }
    } catch (err) {
      console.error('Error fetching related blogs:', err);
      // Non-critical, don't show error to user
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Sanitize HTML content
  const createSanitizedHTML = (htmlContent) => {
    return {
      __html: DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style']
      })
    };
  };

  if (loading) {
    return (
      <div className="blog-reader">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '24px', color: '#8b5cf6' }}>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-reader">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '16px' }}>
            {error || 'Blog not found'}
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="blog-reader">
      {/* Cover Image */}
      <img
        src={blog.coverImage}
        alt={blog.title}
        className="blog-reader__cover"
      />

      {/* Header */}
      <header className="blog-reader__header">
        <h1 className="blog-reader__title">{blog.title}</h1>

        <div className="blog-reader__meta">
          <span className="blog-reader__author">SalonHub Team</span>
          <span>•</span>
          <span className="blog-reader__date">
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          <span className="blog-reader__category">{blog.category}</span>
        </div>
      </header>

      {/* Excerpt */}
      {blog.excerpt && (
        <div className="blog-reader__excerpt">
          {blog.excerpt}
        </div>
      )}

      {/* Content */}
      <div
        className="blog-reader__content"
        dangerouslySetInnerHTML={createSanitizedHTML(blog.content)}
      />

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <>
          <hr className="blog-reader__divider" />
          <section className="blog-reader__related">
            <h2 className="blog-reader__related-title">More Articles</h2>
            <div className="blog-list__grid">
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard key={relatedBlog._id} blog={relatedBlog} />
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
};

export default BlogReader;
