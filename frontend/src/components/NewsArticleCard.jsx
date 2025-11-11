import React from 'react';
import '../styles/newsArticleCard.css';

const NewsArticleCard = ({ article }) => {
  return (
    <a className="news-article-card" href={article.url} target="_blank" rel="noreferrer">
      {article.image && <div className="news-article-card__media" style={{ backgroundImage: `url(${article.image})` }} />}
      <div className="news-article-card__body">
        <div className="news-article-card__meta">
          <span>{article.source}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
      </div>
    </a>
  );
};

export default NewsArticleCard;
