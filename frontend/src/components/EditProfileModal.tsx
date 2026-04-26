import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon, Save } from 'lucide-react';
import { updateProfile, uploadProfileImage, uploadBannerImage, BASE_URL } from '../utils/api';
import ImageCropper from './ImageCropper';
import './EditProfileModal.css';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || ''
  });
  const [loading, setLoading] = useState(false);
  
  // Cropper state
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'profile' | 'banner' | null>(null);
  const [aspect, setAspect] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImage(reader.result as string);
        setCropType(type);
        setAspect(type === 'profile' ? 1 : 3); // 1:1 for profile, 3:1 for banner
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setLoading(true);
    setCropImage(null);
    try {
      // Convert Blob to File
      const file = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      if (cropType === 'profile') {
        await uploadProfileImage(file);
      } else if (cropType === 'banner') {
        await uploadBannerImage(file);
      }
      onUpdate();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-profile-modal animate-slide-up">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        <div className="modal-body">
          <div className="image-edit-section">
            <div className="banner-edit" onClick={() => document.getElementById('banner-upload')?.click()}>
              {profile.bannerUrl ? (
                <img src={`http://192.168.0.4:8080${profile.bannerUrl}`} alt="Banner" />
              ) : (
                <div className="placeholder" />
              )}
              <div className="edit-overlay"><ImageIcon size={24} /></div>
              <input 
                id="banner-upload" 
                type="file" 
                accept="image/*" 
                hidden 
                onChange={(e) => handleFileSelect(e, 'banner')}
              />
            </div>

            <div className="profile-pic-edit" onClick={() => document.getElementById('profile-upload')?.click()}>
              {profile.profilePictureUrl ? (
                <img src={`${BASE_URL}${profile.profilePictureUrl}`} alt="Profile" />
              ) : (
                <div className="placeholder">{profile.username[0].toUpperCase()}</div>
              )}
              <div className="edit-overlay"><Camera size={20} /></div>
              <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                hidden 
                onChange={(e) => handleFileSelect(e, 'profile')}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            <div className="input-field">
              <label>Display Name</label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                placeholder="Enter display name"
              />
            </div>

            <div className="input-field">
              <label>Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Write something about yourself..."
                rows={4}
              />
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'} <Save size={18} />
            </button>
          </form>
        </div>
      </div>

      {cropImage && (
        <ImageCropper 
          image={cropImage} 
          aspect={aspect} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropImage(null)} 
        />
      )}
    </div>
  );
};


export default EditProfileModal;
