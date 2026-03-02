import React, { useState, useRef } from 'react';
import { HiCamera, HiX } from 'react-icons/hi';
import { mediaService, MediaFile } from '../../services/media.service';
import './AvatarUpload.css';

export interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadComplete?: (mediaFile: MediaFile) => void;
  onUploadError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUploadComplete,
  onUploadError,
  size = 'lg',
  disabled = false,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'avatar-upload-sm',
    md: 'avatar-upload-md', 
    lg: 'avatar-upload-lg',
    xl: 'avatar-upload-xl',
  };

  const validateFile = (file: File): string | null => {
    // Accept all common image formats
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/svg+xml',
      'image/tiff',
      'image/x-icon',
      'image/heic',
      'image/heif'
    ];
    const maxSize = 10 * 1024 * 1024; // Increased to 10MB to match backend

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, WEBP, GIF, BMP, SVG, TIFF, ICO, HEIC, HEIF)';
    }

    if (file.size > maxSize) {
      return 'Image must be smaller than 10MB';
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[AvatarUpload] No file selected');
      return;
    }

    console.log('[AvatarUpload] File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const error = validateFile(file);
    if (error) {
      console.error('[AvatarUpload] Validation error:', error);
      onUploadError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('[AvatarUpload] Preview created');
      setPreviewUrl(result);
    };
    reader.onerror = (e) => {
      console.error('[AvatarUpload] FileReader error:', e);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('[AvatarUpload] Starting upload...');
      const result = await mediaService.uploadFile(
        file,
        'avatar',
        'Profile picture',
        (progress) => {
          console.log('[AvatarUpload] Progress:', progress.percentage + '%');
          setUploadProgress(progress.percentage);
        }
      );

      console.log('[AvatarUpload] Upload successful:', result);
      onUploadComplete?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('[AvatarUpload] Upload error:', errorMessage, error);
      onUploadError?.(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Clear input to allow re-uploading the same file
    e.target.value = '';
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (currentAvatar) {
      return currentAvatar.startsWith('http') 
        ? currentAvatar 
        : mediaService.getMediaUrl(currentAvatar);
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className={`avatar-upload ${sizeClasses[size]} ${className}`}>
      <div 
        className={`avatar-container ${disabled ? 'disabled' : ''} ${isUploading ? 'uploading' : ''}`}
        onClick={openFileDialog}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            <HiCamera className="camera-icon" />
            <span className="placeholder-text">Add Photo</span>
          </div>
        )}

        <div className="upload-overlay">
          <HiCamera className="overlay-icon" />
          <span className="overlay-text">
            {avatarUrl ? 'Change' : 'Upload'}
          </span>
        </div>

        {isUploading && (
          <div className="progress-overlay">
            <div className="progress-circle">
              <svg className="progress-svg" viewBox="0 0 36 36">
                <path
                  className="progress-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="progress-bar"
                  strokeDasharray={`${uploadProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="progress-text">{uploadProgress}%</div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
          disabled={disabled || isUploading}
        />
      </div>

      {previewUrl && !isUploading && (
        <button
          className="clear-button"
          onClick={clearPreview}
          title="Remove preview"
        >
          <HiX />
        </button>
      )}

      <div className="upload-instructions">
        <p className="instruction-text">
          Click to upload a new profile picture
        </p>
        <p className="instruction-hint">
          All common image formats • Max 10MB
        </p>
      </div>
    </div>
  );
};
