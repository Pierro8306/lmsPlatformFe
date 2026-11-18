'use client';

import * as React from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: Accept;
  maxSize?: number; // bytes (default 10MB)
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  isLoading?: boolean;
  progress?: number;
  error?: string | null;
  helperText?: string;
  className?: string;
}

export function FileUpload({
  accept = { 'application/pdf': ['.pdf'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  onFileRemove,
  selectedFile,
  isLoading = false,
  progress = 0,
  error,
  helperText = 'PDF files up to 10MB supported',
  className,
}: FileUploadProps) {
  const [internalFile, setInternalFile] = React.useState<File | null>(null);
  const [dragError, setDragError] = React.useState<string | null>(null);

  const currentFile = selectedFile !== undefined ? selectedFile : internalFile;

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setDragError(null);
      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0];
        if (firstError.code === 'file-too-large') {
          setDragError(`File is too large. Max size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`);
        } else if (firstError.code === 'file-invalid-type') {
          setDragError('Invalid file type.');
        } else {
          setDragError(firstError.message || 'Error uploading file.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setInternalFile(file);
        onFileSelect?.(file);
      }
    },
    [maxSize, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isLoading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalFile(null);
    setDragError(null);
    onFileRemove?.();
  };

  const displayError = error || dragError;

  return (
    <div className={cn('space-y-3', className)}>
      {!currentFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center group',
            isDragActive
              ? 'border-accent-indigo bg-accent-indigo/10 scale-[1.01]'
              : 'border-border-DEFAULT hover:border-accent-indigo/60 hover:bg-background-elevated/40 bg-background-card/40',
            isLoading && 'opacity-60 cursor-not-allowed pointer-events-none'
          )}
        >
          <input {...getInputProps()} />
          <div className="p-3.5 rounded-2xl bg-background-elevated border border-border-DEFAULT text-text-secondary group-hover:text-accent-indigo group-hover:border-accent-indigo/40 group-hover:scale-105 transition-all mb-3 shadow-md">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">
            {isDragActive ? 'Drop your file here' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-text-muted">{helperText}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border-DEFAULT bg-background-card/80 p-4 space-y-3 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 rounded-xl bg-accent-indigo/10 border border-accent-indigo/30 text-accent-indigo shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {currentFile.name}
                </p>
                <p className="text-xs text-text-muted">
                  {(currentFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {!isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 w-8 p-0 text-text-muted hover:text-status-danger"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-background-elevated" />
            </div>
          )}

          {!isLoading && !displayError && (
            <div className="flex items-center gap-1.5 text-xs text-status-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for processing</span>
            </div>
          )}
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-status-danger">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
