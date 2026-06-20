import React, { useState, useCallback } from 'react';
  import { Upload, X, Image } from 'lucide-react';
  import {
    validateFile,
    readFileAsBase64,
    compressImage,
    MAX_PHOTOS
  } from '../../utils/photoUpload';
  import './PhotoUpload.css';

  const PhotoUpload = ({ photos = [], onPhotosChange, maxPhotos = MAX_PHOTOS }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const handleDragOver = useCallback((e) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    }, [photos, onPhotosChange]);

    const handleFileSelect = useCallback(async (e) => {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }, [photos, onPhotosChange]);

    const processFiles = async (files) => {
      setUploadError('');

      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setUploadError(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      const newPhotos = [];

      for (const file of filesToProcess) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setUploadError(validation.error);
          continue;
        }

        try {
          const base64 = await readFileAsBase64(file);
          const compressed = await compressImage(base64);

          newPhotos.push({
            url: compressed,
            caption: file.name,
            isLocal: true,
            uploadedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error processing file:', error);
          setUploadError('Failed to process image');
        }
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
      }
    };

    const handleDeletePhoto = (index) => {
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    };

    return (
      <div className="photo-upload-container">
        <div
          className={`photo-upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('photo-input').click()}
        >
          <input
            id="photo-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <Upload size={48} />
          <h3>Drag & drop photos here</h3>
          <p>or click to browse</p>
          <small>Maximum {maxPhotos} photos, up to 5MB each</small>
        </div>

        {uploadError && (
          <div className="upload-error">
            {uploadError}
          </div>
        )}

        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                />
                <div className="photo-overlay">
                  <button
                    className="delete-photo-btn"
                    onClick={() => handleDeletePhoto(index)}
                    title="Delete photo"
                  >
                    <X size={20} />
                  </button>
                </div>
                {photo.caption && (
                  <div className="photo-caption">{photo.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="photo-count">
          {photos.length} / {maxPhotos} photos
        </div>
      </div>
    );
  };

  export default PhotoUpload;
