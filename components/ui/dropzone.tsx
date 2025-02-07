// Taken from https://github.com/shadcn-ui/ui/issues/163 user: arafays
import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Define the props expected by the Dropzone component
interface DropzoneProps {
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  fileExtensions?: string[];
}

// Create the Dropzone component receiving props
export function Dropzone({
  onChange,
  className,
  fileExtensions,
  ...props
}: DropzoneProps) {
  // Initialize state variables using the useState hook
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to file input element
  const [fileInfo, setFileInfo] = useState<string | null>(null); // Information about the uploaded file
  const [error, setError] = useState<string | null>(null); // Error message state

  // Function to handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Function to handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  // Function to handle file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      handleFiles(files);
    }
  };

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    const uploadedFile = files[0];

    // Check if at least one allowed extension is present in the filename
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

    const fileSizeInKB = Math.round(uploadedFile.size / 1024); // Convert to KB

    const fileList = Array.from(files).map((file) => URL.createObjectURL(file));
    onChange((prevFiles) => [...prevFiles, ...fileList]);

    // Display file information
    setFileInfo(`Uploaded file: ${uploadedFile.name} (${fileSizeInKB} KB)`);
    setError(null); // Reset error state
  };

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
            } // Set accepted file type
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
