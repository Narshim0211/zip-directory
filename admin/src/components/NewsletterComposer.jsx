import React, { useState, useEffect } from 'react';
import './NewsletterComposer.css';

const NewsletterComposer = ({
  audience, // 'VISITOR' or 'OWNER'
  audienceLabel, // 'Visitor' or 'Owner'
  audienceDescription,
  initialData = null,
  onSave,
  onSendTest,
  onSchedule,
  onSendNow,
}) => {
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load initial data if editing existing campaign
  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject || '');
      setPreheader(initialData.preheader || '');
      setContent(initialData.contentHtml || '');
    }
  }, [initialData]);

  const handleSaveDraft = async () => {
    if (!subject.trim()) {
      setError('Subject line is required');
      return;
    }
    if (!content.trim()) {
      setError('Email content is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await onSave({
        audience,
        subject: subject.trim(),
        preheader: preheader.trim(),
        contentHtml: content,
        contentText: stripHtml(content),
      });
      setSuccessMessage('Draft saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setError('Please enter a test email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError('');

    try {
      await onSendTest(testEmail);
      setSuccessMessage(`Test email sent to ${testEmail}!`);
      setShowTestModal(false);
      setTestEmail('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error sending test email:', err);
      setError(err.response?.data?.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledAt <= new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    setSending(true);
    setError('');

    try {
      await onSchedule(scheduledAt.toISOString());
      setSuccessMessage('Campaign scheduled successfully!');
      setShowScheduleModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error scheduling campaign:', err);
      setError(err.response?.data?.message || 'Failed to schedule campaign');
    } finally {
      setSending(false);
    }
  };

  const handleSendNow = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Subject and content are required');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this newsletter to all ${audienceLabel} subscribers now? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSending(true);
    setError('');

    try {
      await onSendNow();
      setSuccessMessage('Newsletter is being sent!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error sending newsletter:', err);
      setError(err.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const characterCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="newsletter-composer-container">
      <div className="composer-header">
        <div>
          <h1 className="composer-title">{audienceLabel} Newsletter</h1>
          <p className="composer-subtitle">{audienceDescription}</p>
        </div>
        <div className="composer-actions">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-outline"
            type="button"
          >
            {showPreview ? '✏️ Edit' : '👁️ Preview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="composer-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {successMessage && (
        <div className="composer-success">
          <span>✓ {successMessage}</span>
        </div>
      )}

      <div className="composer-layout">
        {!showPreview ? (
          // Edit Mode
          <div className="composer-editor">
            <div className="form-group">
              <label className="form-label">
                Subject Line <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your November Hair Glow-Up Guide ✨"
                maxLength={200}
              />
              <span className="form-hint">{subject.length}/200 characters</span>
            </div>

            <div className="form-group">
              <label className="form-label">Preheader Text (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Short preview text that appears after subject line"
                maxLength={200}
              />
              <span className="form-hint">
                Appears in inbox preview - {preheader.length}/200 characters
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Content <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Write your ${audienceLabel.toLowerCase()} newsletter content here...\n\nYou can use basic HTML tags:\n<h1>Heading</h1>\n<p>Paragraph</p>\n<strong>Bold</strong>\n<em>Italic</em>\n<a href="...">Link</a>`}
                rows={20}
              />
              <div className="form-hint-row">
                <span>{wordCount} words • {characterCount} characters</span>
                <span>Basic HTML supported</span>
              </div>
            </div>

            <div className="composer-footer">
              <div className="footer-buttons">
                <button
                  onClick={handleSaveDraft}
                  className="btn-secondary"
                  disabled={saving || sending}
                  type="button"
                >
                  {saving ? 'Saving...' : '💾 Save Draft'}
                </button>
                <button
                  onClick={() => setShowTestModal(true)}
                  className="btn-outline"
                  disabled={!subject || !content || saving || sending}
                  type="button"
                >
                  📧 Send Test Email
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="btn-outline"
                  disabled={!subject || !content || saving || sending}
                  type="button"
                >
                  📅 Schedule
                </button>
                <button
                  onClick={handleSendNow}
                  className="btn-primary"
                  disabled={!subject || !content || saving || sending}
                  type="button"
                >
                  {sending ? 'Sending...' : '🚀 Send Now'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="composer-preview">
            <div className="preview-device">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="preview-title">Email Preview</span>
              </div>
              <div className="preview-email">
                <div className="preview-subject">
                  <strong>Subject:</strong> {subject || 'Your Subject Line'}
                </div>
                {preheader && (
                  <div className="preview-preheader">
                    <strong>Preheader:</strong> {preheader}
                  </div>
                )}
                <div className="preview-divider"></div>
                <div
                  className="preview-content"
                  dangerouslySetInnerHTML={{
                    __html: content || '<p>Your content will appear here...</p>',
                  }}
                />
                <div className="preview-footer">
                  <p>You're receiving this because you subscribed to SalonHub newsletters.</p>
                  <a href="#unsubscribe">Unsubscribe</a> • <a href="#preferences">Manage preferences</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Test Email</h3>
              <button onClick={() => setShowTestModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Send a test version of this newsletter to your email to see how it looks.
              </p>
              <input
                type="email"
                className="form-input"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTestModal(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleSendTest} className="btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Newsletter</h3>
              <button onClick={() => setShowScheduleModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Choose when you want this newsletter to be sent.
              </p>
              <div className="schedule-inputs">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowScheduleModal(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleSchedule} className="btn-primary" disabled={sending}>
                {sending ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterComposer;
