import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface AudioUploaderProps {
  onUploadComplete: (blob: Blob) => void;
}

export default function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Check if file is an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Convert file to blob
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: file.type });
      
      onUploadComplete(blob);
      setIsLoading(false);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Please try again with a different file",
        variant: "destructive"
      });
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />
      <button 
        onClick={handleUploadClick}
        disabled={isLoading}
        type="button"
        className="flex items-center px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 disabled:opacity-50 font-medium transition-colors"
      >
        <span className="material-icons text-sm mr-2">upload_file</span>
        {isLoading ? "Uploading..." : "Upload Audio"}
      </button>
    </>
  );
}
