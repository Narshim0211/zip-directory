import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const NewsDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/news/${id}`);
        setItem(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return null;
  if (!item) return <div style={{ padding: 24 }}>Not found</div>;

  return (
    <article style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>{item.title}</h1>
      <p style={{ color: '#5b6470' }}>{new Date(item.createdAt).toLocaleString()} · {item.category}</p>
      {item.imageUrl && (
        <div style={{ height: 320, borderRadius: 12, background: `url(${item.imageUrl}) center/cover`, margin: '12px 0' }} />
      )}
      <p style={{ fontSize: 18 }}>{item.summary}</p>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{item.body}</div>
    </article>
  );
};

export default NewsDetail;