import { useState, useRef } from "react";
import { FaUpload, FaLink, FaTimes } from "react-icons/fa";

interface ImageUploadProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  type?: "avatar" | "cover" | "square";
  folder?: "book" | "author" | "publisher" | "avatar" | "series";
  required?: boolean;
  accept?: string;
}

/**
 * ImageUpload Component
 * Supports both file upload and URL input
 * Automatically generates correct /img/{folder}/ paths
 */
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get image dimensions based on type
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

  // Handle file upload from local machine
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewDataUrl = reader.result as string;
      setPreviewUrl(previewDataUrl);
    };
    reader.readAsDataURL(file);

    // Generate clean filename
    const timestamp = Date.now();
    const cleanFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");
    const filename = `${timestamp}-${cleanFilename}`;

    // Generate path for backend to save
    // Backend should save to: public/img/{folder}/{filename}
    // And store in DB as: /src/assets/img/{folder}/{filename}
    // (This way backend knows original source location)
    const dbPath = `/src/assets/img/${folder}/${filename}`;

    // Save to form state
    onChange(dbPath);

    console.log(`📁 File to upload:`, file.name);
    console.log(`💾 DB will store:`, dbPath);
    console.log(`🌐 Frontend will display:`, `/img/${folder}/${filename}`);
    console.log(`⚠️  Backend must save file to: public/img/${folder}/${filename}`);
  };

  // Handle URL input
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      alert("Please enter an image URL");
      return;
    }

    try {
      // Check if it's a full URL (http/https)
      if (urlInput.startsWith("http://") || urlInput.startsWith("https://")) {
        setPreviewUrl(urlInput);
        onChange(urlInput);
        setUrlInput("");
        return;
      }

      // Check if it's already in DB format (/src/assets/img/...)
      if (urlInput.startsWith("/src/assets/img/")) {
        setPreviewUrl(urlInput);
        onChange(urlInput);
        setUrlInput("");
        return;
      }

      // If starts with /img/, convert to DB format /src/assets/img/
      if (urlInput.startsWith("/img/")) {
        const dbPath = "/src/assets" + urlInput;
        setPreviewUrl(dbPath);
        onChange(dbPath);
        setUrlInput("");
        return;
      }

      // If it's just a filename, construct full path
      let cleanPath = urlInput;
      if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
      }
      const dbPath = `/src/assets/img/${folder}${cleanPath}`;
      setPreviewUrl(dbPath);
      onChange(dbPath);
      setUrlInput("");
    } catch (error) {
      alert("Invalid URL format");
    }
  };

  // Clear image
  const handleClear = () => {
    setPreviewUrl("");
    onChange("");
    setUrlInput("");
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            uploadMode === "file"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <FaUpload className="text-sm" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode("url")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            uploadMode === "url"
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
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
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label
            htmlFor={`file-upload-${label}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <FaUpload className="text-3xl text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP up to 5MB
            </span>
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="Enter image URL or path (/img/book/image.jpg)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {/* Preview */}
      {(previewUrl || value) && (
        <div className="relative inline-block">
          <img
            src={previewUrl || value}
            alt="Preview"
            alt="Preview"
            className={`${getImageClasses()} border-2 border-gray-200`}
            onError={(e) => {
              e.currentTarget.src = "/img/avatar/sample-user-avatar.png";
            }}
          />utton
            type="button"
            onClick={handleClear}
            title="Remove image"
            aria-label="Remove image"
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
          >
            <FaTimes className="text-xs" />
          </button>
          <div className="mt-2 text-xs text-gray-600 break-all max-w-xs">
            {previewUrl || value}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {uploadMode === "file"
          ? "Upload from your computer. Backend will save to public/img/ folder."
          : "Enter full URL or path. Backend stores as /src/assets/img/... but files are in public/img/"}
      </p>
    </div>
  );
}
