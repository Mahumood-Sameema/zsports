// ImageUpload Component
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

export const ImageUpload = ({
  onUpload,
  maxFiles = 5,
  maxSizeMB = 2,
  accept = 'image/*',
  existingImages = [],
}) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      // Validate type
      if (!file.type.startsWith('image/')) {
        alert('File must be an image.');
        return false;
      }
      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File exceeds size limit of ${maxSizeMB}MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const remainingSlots = maxFiles - images.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length < validFiles.length) {
      alert(`Limit is ${maxFiles} images. Some files were skipped.`);
    }

    if (filesToUpload.length === 0) return;

    setUploading(true);
    setProgress(10);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const newUrls = filesToUpload.map(file => URL.createObjectURL(file));
      const updated = [...images, ...newUrls];
      
      setImages(updated);
      setUploading(false);
      setProgress(0);
      onUpload(updated);
    }, 900);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, idx) => idx !== index);
    setImages(updated);
    onUpload(updated);
  };

  const triggerInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      {/* Drag & Drop Area */}
      {images.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer text-center ${
            dragActive 
              ? 'border-primary bg-primary-light/35' 
              : 'border-neutral-200 hover:border-primary hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="p-3 bg-slate-100 rounded-full text-neutral-500 mb-3">
            <Upload size={20} />
          </div>
          <p className="text-sm font-semibold text-neutral-700 mb-0.5">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-neutral-500">
            JPG, PNG, WEBP (Max {maxSizeMB}MB, up to {maxFiles} files)
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Preview Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded border border-neutral-200 overflow-hidden group shadow-sm bg-neutral-50">
              <img src={url} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-neutral-900/60 hover:bg-neutral-900 text-white opacity-90 transition-all shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
