import React, { useState } from 'react';
import { ChevronLeft, Upload, Tag, FileText } from 'lucide-react';
import api from '../utils/api';
import ImageCropper from './ImageCropper';
import './UploadPage.css';

interface UploadPageProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Cropper state
  const [cropImage, setCropImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCropImage(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For videos, skip cropping
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setCropImage(null);
    const croppedFile = new File([croppedImageBlob], 'post-image.jpg', { type: 'image/jpeg' });
    setFile(croppedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('tags', formData.tags);

    try {
      await api.post('/posts/upload', data);
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page-container animate-fade-in">
      <div className="upload-page-header">
        <button className="back-btn" onClick={onClose}><ChevronLeft size={28} /></button>
        <h2>New Upload</h2>
        <button 
          form="upload-form" 
          type="submit" 
          className="share-btn" 
          disabled={loading || !file}
        >
          {loading ? '...' : 'Share'}
        </button>
      </div>

      <div className="upload-page-content">
        {error && <div className="error-message">{error}</div>}

        <form id="upload-form" onSubmit={handleUpload} className="upload-form-full">
          <div className="file-section" onClick={() => document.getElementById('file-input-page')?.click()}>
            {preview ? (
              <div className="preview-full">
                {file?.type.startsWith('video') ? (
                  <video src={preview} controls />
                ) : (
                  <img src={preview} alt="Preview" />
                )}
                <div className="change-hint">Tap to change</div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <Upload size={48} color="#09E85E" />
                <p>Select Photo or Video</p>
              </div>
            )}
            <input 
              id="file-input-page"
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange} 
              hidden 
            />
          </div>

          <div className="details-section">
            <div className="input-row">
              <FileText size={20} color="#09E85E" />
              <input 
                type="text" 
                placeholder="Title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="input-row">
              <Tag size={20} color="#09E85E" />
              <input 
                type="text" 
                placeholder="Tags" 
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <textarea 
              placeholder="Write a description..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={5}
            />
          </div>
        </form>
      </div>

      {cropImage && (
        <ImageCropper 
          image={cropImage} 
          aspect={1} // 1:1 square for posts
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropImage(null)} 
        />
      )}
    </div>
  );
};

export default UploadPage;
