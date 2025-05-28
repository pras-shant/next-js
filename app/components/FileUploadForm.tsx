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
      style={{
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="file"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          Upload a .tar file
        </label>
        <input
          type="file"
          id="file"
          accept=".tar"
          onChange={handleFileChange}
          style={{
            display: "block",
            width: "100%",
            padding: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
          }}
        />
        {error && (
          <p style={{ marginTop: "8px", fontSize: "12px", color: "#e53e3e" }}>
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isUploading}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          fontWeight: "600",
          color: "#fff",
          backgroundColor: isUploading ? "#93c5fd" : "#3b82f6",
          border: "none",
          borderRadius: "4px",
          cursor: isUploading ? "not-allowed" : "pointer",
        }}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
  
    </form>
  );
};

export default FileUploadForm;
