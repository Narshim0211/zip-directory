import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import '../styles/fileUpload.css';

export default function FileUpload({ 
  onUploadSuccess, 
  onUploadError,
  accept = "image/*,video/*",
  multiple = false,
  maxFiles = 10,
  label = "Upload File",
  preview = true,
  currentUrl = null
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (!multiple && files.length > 1) {
      onUploadError?.({ message: 'Please select only one file' });
      return;
    }

    if (multiple && files.length > maxFiles) {
      onUploadError?.({ message: `Maximum ${maxFiles} files allowed` });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      if (multiple) {
        // Multiple file upload
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const { data } = await axios.post('/owner/media/upload-multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        });

        onUploadSuccess?.(data.data);
      } else {
        // Single file upload
        const formData = new FormData();
        formData.append('file', files[0]);

        // Show preview immediately for images
        if (files[0].type.startsWith('image/') && preview) {
          const reader = new FileReader();
          reader.onloadend = () => setPreviewUrl(reader.result);
          reader.readAsDataURL(files[0]);
        }

        const { data } = await axios.post('/owner/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        });

        setPreviewUrl(data.data.url);
        onUploadSuccess?.(data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl(currentUrl);
      onUploadError?.(error.response?.data?.error || { message: 'Upload failed' });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {preview && previewUrl && !uploading && (
        <div className="file-upload__preview">
          <img src={previewUrl} alt="Preview" />
          <button
            type="button"
            className="file-upload__remove"
            onClick={handleRemove}
          >
            ✕
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleFileSelect}
        disabled={uploading}
        className="file-upload__button"
      >
        {uploading ? (
          <div className="file-upload__progress">
            <div className="file-upload__spinner"></div>
            <span>{progress}%</span>
          </div>
        ) : (
          <>
            <span className="file-upload__icon">📤</span>
            <span>{label}</span>
          </>
        )}
      </button>
      
      {uploading && (
        <div className="file-upload__progress-bar">
          <div 
            className="file-upload__progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
