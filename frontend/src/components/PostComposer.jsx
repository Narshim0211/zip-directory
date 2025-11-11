import React, { useState } from 'react';

const PostComposer = ({ onPost }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onPost({
      id: Date.now(),
      author: { name: 'Owner' },
      content: text.trim(),
      media: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
    setText('');
  };

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <div className="post-composer__header">
        <strong>Create a post</strong>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share salon updates..."
        rows={3}
      />
      <button type="submit" className="btn">
        Post
      </button>
    </form>
  );
};

export default PostComposer;
