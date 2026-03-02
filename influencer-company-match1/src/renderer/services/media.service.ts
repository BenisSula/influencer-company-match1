// @ts-ignore - Vite env variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Remove /api suffix to get the server base URL
const API_URL = API_BASE_URL.replace(/\/api$/, '');

export interface MediaFile {
  id: string;
  userId: string;
  fileType: 'avatar' | 'cover' | 'portfolio' | 'post' | 'message';
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class MediaService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async uploadFile(
    file: File,
    fileType: MediaFile['fileType'],
    altText?: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaFile> {
    // Ensure token is set
    if (!this.token) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      this.token = token;
    }

    console.log('[MediaService] Starting upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType,
      apiUrl: `${API_URL}/api/media/upload`,
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (altText) {
      formData.append('altText', altText);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            console.log(`[MediaService] Upload progress: ${percentage}%`);
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percentage,
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        console.log('[MediaService] Upload completed:', {
          status: xhr.status,
          statusText: xhr.statusText,
          response: xhr.responseText,
        });

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('[MediaService] Upload successful:', response);
            resolve(response);
          } catch (error) {
            console.error('[MediaService] Failed to parse response:', error);
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            console.error('[MediaService] Upload failed:', error);
            reject(new Error(error.message || `Upload failed: ${xhr.statusText}`));
          } catch {
            console.error('[MediaService] Upload failed with status:', xhr.status);
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', (e) => {
        console.error('[MediaService] Network error during upload:', e);
        reject(new Error('Network error during upload. Please check your connection.'));
      });

      xhr.addEventListener('abort', () => {
        console.warn('[MediaService] Upload cancelled');
        reject(new Error('Upload cancelled'));
      });

      xhr.addEventListener('timeout', () => {
        console.error('[MediaService] Upload timeout');
        reject(new Error('Upload timeout. Please try again.'));
      });

      xhr.timeout = 60000; // 60 second timeout
      xhr.open('POST', `${API_URL}/api/media/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      
      console.log('[MediaService] Sending upload request...');
      xhr.send(formData);
    });
  }

  async getUserMedia(userId: string, fileType?: MediaFile['fileType']): Promise<MediaFile[]> {
    if (!this.token) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      this.token = token;
    }

    const url = fileType
      ? `${API_URL}/api/media/user/${userId}?fileType=${fileType}`
      : `${API_URL}/api/media/user/${userId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch media');
    }

    return response.json();
  }

  async deleteMedia(id: string): Promise<void> {
    if (!this.token) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      this.token = token;
    }

    const response = await fetch(`${API_URL}/api/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete media');
    }
  }

  getMediaUrl(fileUrl: string | null | undefined): string {
    if (!fileUrl) {
      return '';
    }
    
    // If already an absolute URL, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // If it's a data URL (base64), return as is
    if (fileUrl.startsWith('data:')) {
      return fileUrl;
    }
    
    // Convert relative URL to absolute
    const cleanUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${API_URL}${cleanUrl}`;
  }
}

export const mediaService = new MediaService();
