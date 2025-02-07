import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DropzoneProps {
  onChange: (files: File[]) => void;
  className?: string;
  fileExtensions?: string[];
}

export function Dropzone({
  onChange,
  className,
  fileExtensions,
  ...props
}: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const uploadedFile = files[0];

    if (
      fileExtensions &&
      !fileExtensions.some((ext) =>
        uploadedFile.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`)
      )
    ) {
      setError(
        `Invalid file type. Expected one of: ${fileExtensions.map((ext) => '.' + ext).join(', ')}`
      );
      return;
    }

    const fileSizeInKB = Math.round(uploadedFile.size / 1024);
    const fileArray = Array.from(files);

    onChange(fileArray);

    setFileInfo(`Uploaded file: ${uploadedFile.name} (${fileSizeInKB} KB)`);
    setError(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      className={`border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50 ${className}`}
      {...props}
      onClick={handleButtonClick}
    >
      <CardContent
        className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center text-muted-foreground">
          <span className="font-medium">Drag & Drop or Click to Upload</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={
              fileExtensions
                ? fileExtensions.map((ext) => '.' + ext).join(',')
                : undefined
            }
            onChange={handleFileInputChange}
            className="hidden"
            multiple
          />
        </div>
        {fileInfo && <p className="text-muted-foreground">{fileInfo}</p>}
        {error && <span className="text-red-500">{error}</span>}
      </CardContent>
    </Card>
  );
}
