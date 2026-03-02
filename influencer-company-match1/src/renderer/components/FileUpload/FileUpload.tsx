import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiCloudUpload, HiX, HiPhotograph } from 'react-icons/hi';
import { mediaService, MediaFile, UploadProgress } from '../../services/media.service';
import './FileUpload.css';

export interface FileUploadProps {
  fileType: MediaFile['fileType'];
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

interface FileWithProgress {
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: MediaFile;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  fileType,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024,
  acceptedTypes = [
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
  ],
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    
    return null;
  };

  const uploadFile = async (index: number, fileWithProgress: FileWithProgress) => {
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' } : f
    ));

    try {
      const result = await mediaService.uploadFile(
        fileWithProgress.file,
        fileType,
        undefined,
        (progress) => {
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ));
        }
      );

      setFiles(prev => {
        const updated = prev.map((f, i) => 
          i === index ? { ...f, status: 'completed' as const, result } : f
        );
        
        const completedFiles = updated
          .filter(f => f.status === 'completed' && f.result)
          .map(f => f.result!);
        
        if (completedFiles.length === updated.length) {
          onUploadComplete?.(completedFiles);
        }
        
        return updated;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: errorMessage } : f
      ));
      onUploadError?.(errorMessage);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      onUploadError?.(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    const validFiles: FileWithProgress[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          progress: { loaded: 0, total: file.size, percentage: 0 },
          status: 'pending',
        });
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        validFiles.forEach((fileWithProgress, index) => {
          uploadFile(prev.length + index, fileWithProgress);
        });
        return newFiles;
      });
    }
  }, [files, maxFiles, fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    disabled,
    multiple: maxFiles > 1,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`file-upload ${className}`}>
      <div
        {...getRootProps()}
        className={`file-upload-zone ${isDragActive ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        <HiCloudUpload className="upload-icon" />
        <p className="upload-text">
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="upload-hint">
          Images up to {Math.round(maxFileSize / (1024 * 1024))}MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((fileWithProgress, index) => (
            <div key={index} className={`file-item ${fileWithProgress.status}`}>
              <div className="file-info">
                <HiPhotograph className="file-icon" />
                <div className="file-details">
                  <span className="file-name">{fileWithProgress.file.name}</span>
                  <span className="file-size">
                    {(fileWithProgress.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="file-status">
                {fileWithProgress.status === 'uploading' && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${fileWithProgress.progress.percentage}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {fileWithProgress.progress.percentage}%
                    </span>
                  </div>
                )}

                {fileWithProgress.status === 'completed' && (
                  <span className="status-text success">✓ Uploaded</span>
                )}

                {fileWithProgress.status === 'error' && (
                  <span className="status-text error">
                    ✗ {fileWithProgress.error}
                  </span>
                )}

                {fileWithProgress.status === 'pending' && (
                  <span className="status-text pending">⏳ Pending</span>
                )}
              </div>

              <button
                className="remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                disabled={fileWithProgress.status === 'uploading'}
              >
                <HiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
