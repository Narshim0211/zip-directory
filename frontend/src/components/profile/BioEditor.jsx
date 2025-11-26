import React, { useEffect, useRef } from 'react';

/**
 * BioEditor Component
 * Bio editor with character counter and auto-resize
 *
 * @param {Object} props
 * @param {Object} props.profile - User profile data
 * @param {boolean} props.isOwner - Whether user is an owner
 * @param {Function} props.onChange - Change handler
 */
export default function BioEditor({ profile, isOwner, onChange }) {
  const textareaRef = useRef(null);
  const maxLength = isOwner ? 400 : 280;
  const bio = profile?.bio || '';
  const charCount = bio.length;
  const isWarning = charCount > maxLength * 0.9;
  const isError = charCount > maxLength;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [bio]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      onChange('bio', value);
    }
  };

  return (
    <div className="bio-editor-container">
      <span className="card-label">
        {isOwner ? '📝 Professional Summary' : '💬 Your Bio'}
      </span>

      <textarea
        ref={textareaRef}
        className="bio-textarea"
        value={bio}
        onChange={handleChange}
        placeholder={
          isOwner
            ? 'Premium salon · Deposits required · Chat enabled\nSpecialized in braids, color, and curly hair...'
            : 'Turning heads one braid at a time ✨\nBraid lover · Dallas · Book with me!'
        }
        rows={4}
      />

      <div className={`bio-char-counter ${isWarning ? 'warning' : ''} ${isError ? 'error' : ''}`}>
        {charCount} / {maxLength} characters
      </div>

      {isError && (
        <p style={{ color: 'rgba(255,100,100,0.9)', fontSize: '12px', marginTop: '8px' }}>
          Bio exceeds maximum length. Please shorten it.
        </p>
      )}
    </div>
  );
}
