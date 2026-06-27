// FileUpload Component
import React, { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';

export const FileUpload = ({
  onUpload,
  accept = '*/*',
  maxSizeMB = 5,
  label = 'Upload file'
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    setUploading(true);
    setTimeout(() => {
      setFile(selectedFile);
      setUploading(false);
      if (onUpload) {
        onUpload(selectedFile);
      }
    }, 600);
  };

  const handleSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    if (onUpload) onUpload(null);
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current.click()}
        className="flex items-center justify-between p-3 border border-neutral-200 hover:border-primary rounded bg-white cursor-pointer group transition-colors"
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleSelect}
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-neutral-500 group-hover:text-primary transition-colors" />
          {file ? (
            <span className="text-sm font-medium text-neutral-800 truncate max-w-[200px]">
              {file.name}
            </span>
          ) : (
            <span className="text-sm text-neutral-500">{label}</span>
          )}
        </div>
        
        {file ? (
          <button 
            type="button"
            onClick={handleRemove}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
          >
            <X size={14} />
          </button>
        ) : uploading ? (
          <span className="text-xs text-neutral-400">Uploading...</span>
        ) : (
          <span className="text-xs text-neutral-400">Max {maxSizeMB}MB</span>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
