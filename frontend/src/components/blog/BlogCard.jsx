import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/blog.css';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  if (!blog) return null;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get category class for color coding
  const getCategoryClass = (category) => {
    return `blog-card__category blog-card__category--${category}`;
  };

  // Handle card click
  const handleClick = () => {
    navigate(`/blog/${blog.slug}`);
  };

  return (
    <article className="blog-card" onClick={handleClick}>
      <div className="blog-card__image-wrapper">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="blog-card__image"
          loading="lazy"
        />
        <span className={getCategoryClass(blog.category)}>
          {blog.category}
        </span>
      </div>

      <div className="blog-card__content">
        <h3 className="blog-card__title">{blog.title}</h3>

        {blog.excerpt && (
          <p className="blog-card__excerpt">{blog.excerpt}</p>
        )}

        <div className="blog-card__footer">
          <div className="blog-card__meta">
            <span className="blog-card__author">SalonHub Team</span>
            <span>•</span>
            <span className="blog-card__date">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
          <span className="blog-card__read-more">
            Read more →
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
