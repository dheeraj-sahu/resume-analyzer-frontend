import React, { useState } from "react";

const UploadForm = ({ setParsedData, setAnalyzedCount }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const validTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      setError("No file selected.");
      return;
    }

    if (!validTypes.includes(selectedFile.type)) {
      setFile(null);
      setError("Only PDF or DOCX files are allowed.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File is too large.");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Upload failed. Try again.");
        return;
      }

      if (result.success) {
        setParsedData(result.data);
        setAnalyzedCount((prev) => {
          const next = prev + 1;
          localStorage.setItem("analyzedCount", next);
          return next;
        });
        setError("");
      } else {
        setError("Parsing failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload Resume</h2>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="mb-4"
      />
      <p className="text-sm text-gray-500 mb-4">
        Only PDF and DOCX files are supported. Max size: 2 MB.
      </p>

      {file && <p>Selected file: {file.name}</p>}

      {error && (
        <p className="text-red-600 font-medium mb-2">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>
    </div>
  );
};

export default UploadForm;
