// Photo upload utility functions
  export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  export const MAX_PHOTOS = 10;

  export const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
    }

    return { valid: true };
  };

  export const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  export const compressImage = async (base64String, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64String;
    });
  };

  export const uploadPhoto = async (tradeInId, photoData) => {
    const response = await fetch(`/api/tradein/${tradeInId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: photoData.url,
        caption: photoData.caption || ''
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  };

  export const deletePhoto = async (tradeInId, photoIndex) => {
    const response = await fetch(`/api/tradein/${tradeInId}/photos/${photoIndex}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete photo');
    }

    return response.json();
  };
