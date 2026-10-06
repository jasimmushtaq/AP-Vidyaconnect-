// ============================================================================
// AP VIDYACONNECT — CLOUDINARY CLOUD STORAGE SERVICE
// Comprehensive image and document upload, optimization & transformation engine
// ============================================================================

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  resource_type?: string;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb' | 'pad';
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
  gravity?: 'auto' | 'face' | 'center';
  radius?: 'max' | number;
}

// Default Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'kaushal-disha',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ap_vidyaconnect_preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '689247158933214',
};

/**
 * Uploads an image (File, Blob, or base64 Data URL) directly to Cloudinary.
 * If direct API upload is unreachable or unconfigured, gracefully falls back to local data URL.
 */
export async function uploadToCloudinary(
  fileOrDataUrl: File | Blob | string,
  options?: {
    folder?: string;
    tags?: string[];
    transformations?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  }
): Promise<CloudinaryUploadResult> {
  const folder = options?.folder || 'platform/uploads';
  const resourceType = options?.resourceType || 'image';

  try {
    const formData = new FormData();
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    if (typeof fileOrDataUrl === 'string') {
      formData.append('file', fileOrDataUrl);
    } else {
      formData.append('file', fileOrDataUrl);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return {
        url: data.url,
        secure_url: data.secure_url || data.url,
        public_id: data.public_id,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        resource_type: data.resource_type,
      };
    } else {
      console.warn('Cloudinary upload returned non-200, creating robust local representation');
    }
  } catch (error) {
    console.warn('Cloudinary direct upload network error, falling back gracefully:', error);
  }

  // Graceful fallback for offline / mock testing: Convert File to persistent Data URL / Object URL
  if (typeof fileOrDataUrl === 'string') {
    return {
      url: fileOrDataUrl,
      secure_url: fileOrDataUrl,
      public_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      resource_type: 'image',
    };
  } else {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({
          url: result,
          secure_url: result,
          public_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          bytes: fileOrDataUrl.size,
          resource_type: 'image',
        });
      };
      reader.onerror = () => {
        const fallbackUrl = URL.createObjectURL(fileOrDataUrl);
        resolve({
          url: fallbackUrl,
          secure_url: fallbackUrl,
          public_id: `blob_${Date.now()}`,
          bytes: fileOrDataUrl.size,
          resource_type: 'image',
        });
      };
      reader.readAsDataURL(fileOrDataUrl);
    });
  }
}

/**
 * Builds an auto-optimized Cloudinary delivery URL with dynamic transformations
 */
export function getCloudinaryOptimizedUrl(
  urlOrPublicId: string,
  options?: CloudinaryTransformOptions
): string {
  if (!urlOrPublicId) return '';

  // If already a full Cloudinary URL
  if (urlOrPublicId.includes('res.cloudinary.com')) {
    if (!options) return urlOrPublicId;

    const parts: string[] = [];
    if (options.width) parts.push(`w_${options.width}`);
    if (options.height) parts.push(`h_${options.height}`);
    if (options.crop) parts.push(`c_${options.crop}`);
    if (options.quality) parts.push(`q_${options.quality}`);
    if (options.format) parts.push(`f_${options.format}`);
    if (options.gravity) parts.push(`g_${options.gravity}`);
    if (options.radius) parts.push(`r_${options.radius}`);

    if (parts.length === 0) return urlOrPublicId;

    const transStr = parts.join(',');
    return urlOrPublicId.replace('/upload/', `/upload/${transStr}/`);
  }

  // If it's a public_id
  if (!urlOrPublicId.startsWith('http') && !urlOrPublicId.startsWith('data:') && !urlOrPublicId.startsWith('/')) {
    const parts: string[] = ['f_auto', 'q_auto'];
    if (options?.width) parts.push(`w_${options.width}`);
    if (options?.height) parts.push(`h_${options.height}`);
    if (options?.crop) parts.push(`c_${options.crop}`);

    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${parts.join(',')}/${urlOrPublicId}`;
  }

  return urlOrPublicId;
}
