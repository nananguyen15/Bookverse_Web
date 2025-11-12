// Enhanced ImageUpload với Backend Integration
// File này là UPGRADE của ImageUpload.tsx hiện tại
// Copy code này vào ImageUpload.tsx sau khi backend đã ready

import { useState, useRef } from "react";
import { FaUpload, FaLink, FaTimes, FaSpinner } from "react-icons/fa";

interface ImageUploadProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  type?: "avatar" | "cover" | "square";
  folder?: "book" | "author" | "publisher" | "avatar" | "series";
  required?: boolean;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  type = "cover",
  folder = "book",
  required = false,
  accept = "image/*",
}: ImageUploadProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageClasses = () => {
    switch (type) {
      case "avatar":
        return "w-32 h-32 rounded-full object-cover";
      case "square":
        return "w-32 h-32 rounded object-cover";
      case "cover":
      default:
        return "w-48 h-64 rounded object-cover";
    }
  };

  // REAL Backend Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("http://localhost:8080/api/upload/image", {
        method: "POST",
        body: formData,
        // Add auth headers if needed
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const publicUrl = await response.text();
      
      console.log("✅ Upload success:", publicUrl);
      
      // Update form with backend-returned path
      onChange(publicUrl);
      setError(null);

    } catch (err) {
      console.error("❌ Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      
      // Clear preview on error
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setError(null);

    try {
      // Check if it's a full URL (http/https)
      if (urlInput.startsWith("http://") || urlInput.startsWith("https://")) {
        setPreviewUrl(urlInput);
        onChange(urlInput);
        setUrlInput("");
        return;
      }

      // Check if it's already in correct format (/img/...)
      if (urlInput.startsWith("/img/")) {
        setPreviewUrl(urlInput);
        onChange(urlInput);
        setUrlInput("");
        return;
      }

      // If it's a relative path without /img/, add it
      const cleanPath = urlInput.startsWith("/") ? urlInput : `/${urlInput}`;
      const publicPath = `/img${cleanPath}`;
      setPreviewUrl(publicPath);
      onChange(publicPath);
      setUrlInput("");
    } catch (err) {
      setError("Invalid URL format");
    }
  };

  const handleClear = () => {
    setPreviewUrl("");
    onChange("");
    setUrlInput("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setUploadMode("file")}
          disabled={uploading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            uploadMode === "file"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <FaUpload className="text-sm" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode("url")}
          disabled={uploading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            uploadMode === "url"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <FaLink className="text-sm" />
          Enter URL
        </button>
      </div>

      {/* Upload Interface */}
      {uploadMode === "file" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label
            htmlFor={`file-upload-${label}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
              uploading
                ? "border-blue-300 bg-blue-50 cursor-wait"
                : "border-gray-300 cursor-pointer hover:bg-gray-50"
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="text-3xl text-blue-500 mb-2 animate-spin" />
                <span className="text-sm text-blue-600">Uploading...</span>
              </>
            ) : (
              <>
                <FaUpload className="text-3xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
            disabled={uploading}
            placeholder="Enter image URL or path (/img/book/image.jpg)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Preview */}
      {(previewUrl || value) && !error && (
        <div className="relative inline-block">
          <img
            src={previewUrl || value}
            alt="Preview"
            className={`${getImageClasses()} border-2 border-gray-200 ${
              uploading ? "opacity-50" : ""
            }`}
            onError={(e) => {
              e.currentTarget.src = "/img/avatar/sample-user-avatar.png";
            }}
          />
          {!uploading && (
            <button
              type="button"
              onClick={handleClear}
              title="Remove image"
              aria-label="Remove image"
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
          <div className="mt-2 text-xs text-gray-600 break-all max-w-xs">
            {previewUrl || value}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {uploadMode === "file"
          ? "Upload from your computer. File will be saved to server."
          : "Enter a full URL (https://...) or relative path (/img/book/image.jpg)"}
      </p>
    </div>
  );
}
