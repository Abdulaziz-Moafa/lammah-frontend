'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button, useToast } from '@/components/ui';
import { mediaApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Upload, X, File, Image, Film, Music, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
  onUploadComplete: (result: { id: string; url: string }) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  return File;
};

export function FileUploader({
  onUploadComplete,
  accept = 'image/*,audio/*,video/*',
  maxSize = 10,
  className,
}: FileUploaderProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    setStatus('idle');
    setProgress(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setProgress(0);

    try {
      const result = await mediaApi.upload(selectedFile, (p) => setProgress(p));
      setStatus('success');
      onUploadComplete({ id: result.id, url: result.url });
      toast.success('File uploaded successfully');
    } catch (error) {
      setStatus('error');
      toast.error('Failed to upload file');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload;

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          )}
        >
          <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-700 font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            Max file size: {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <button
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {status === 'uploading' && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          {status !== 'uploading' && status !== 'success' && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleUpload}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Cancel
              </Button>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4">
              <Button variant="outline" fullWidth onClick={handleClear}>
                Upload Another
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
