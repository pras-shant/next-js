'use client'
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
const FileUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile && selectedFile.name.endsWith(".tar.xz")) {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError("Please upload a valid .tar.xz file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("No file selected.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token is missing. Please log in again.");
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      const data = await response.json();
      setSuccessMessage(
        `File uploaded successfully! File name: ${data.fileName} && File url: ${data.s3Url}`
      );
      router.push(`/?fileUrl=${encodeURIComponent(data.s3Url)}`);

    } catch (err: any) {
      setError(err.message || "An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
  <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-300 rounded-lg shadow max-w-md mx-auto"
    >
      <div className="mb-4">
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Upload a .tar file
        </label>
        <input
          type="file"
          id="file"
          accept=".tar.xz"
          onChange={handleFileChange}
          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isUploading}
        className={`w-full px-4 py-2 text-white font-semibold rounded-md ${
          isUploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {successMessage && (
        <p className="mt-4 text-green-600 text-sm">{successMessage}</p>
      )}
    </form>
  );
};

export default FileUploadForm;
